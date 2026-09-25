import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quizRoot = path.join(root, 'public', 'quizzes');
const manifest = JSON.parse(fs.readFileSync(path.join(quizRoot, 'manifest.json'), 'utf8'));
const errors = [];
const totals = {
	quizzes: manifest.length,
	questions: 0,
	multiAnswer: 0,
	questionsWithVietnamese: 0,
	questionsFullyLocalized: 0,
	questionsWithExplanation: 0,
	questionsWithReferences: 0,
	multiAnswerFlagMismatches: 0,
	imageReferences: 0,
	unlistedDrafts: 0,
};

function parseAnswer(value, options) {
	const raw = String(value || '').trim().toUpperCase();
	if (!raw) return [];
	const parts = raw.includes(',') ? raw.split(',').map((part) => part.trim()).filter(Boolean) : [...raw.replace(/\s+/g, '')];
	const optionKeys = new Set(Object.keys(options || {}));
	if (optionKeys.size && parts.some((part) => !optionKeys.has(part))) return null;
	return [...new Set(parts)].sort();
}

function splitImages(value) {
	return String(value || '').split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function markdownImages(value) {
	return [...String(value || '').matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((match) => match[1].trim());
}

function imageExists(quizDirectory, image) {
	if (/^https?:\/\//i.test(image)) return true;
	const localPath = image.startsWith('/quizzes/')
		? path.join(root, 'public', image.slice(1))
		: image.startsWith('/')
			? path.join(root, 'public', image.slice(1))
			: path.resolve(quizDirectory, image);
	const relative = path.relative(path.join(root, 'public'), localPath);
	if (relative.startsWith('..') || path.isAbsolute(relative)) return false;
	return fs.existsSync(localPath);
}

for (const quiz of manifest) {
	const quizDirectory = path.join(quizRoot, quiz.id);
	const file = path.join(quizDirectory, 'questions.json');
	if (!fs.existsSync(file)) {
		errors.push(`${quiz.id}: questions.json is missing`);
		continue;
	}

	let questions;
	try {
		const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
		questions = Array.isArray(parsed) ? parsed : parsed.questions;
	} catch (error) {
		errors.push(`${quiz.id}: invalid JSON (${error.message})`);
		continue;
	}
	if (!Array.isArray(questions)) {
		errors.push(`${quiz.id}: questions.json must contain an array of questions`);
		continue;
	}
	if (Number(quiz.count) !== questions.length) {
		errors.push(`${quiz.id}: manifest count ${quiz.count} does not match ${questions.length} questions`);
	}

	const ids = new Set();
	let localizedQuestions = 0;
	for (const question of questions) {
		totals.questions += 1;
		if (question.id === undefined || question.id === null || ids.has(String(question.id))) {
			errors.push(`${quiz.id}: missing or duplicate question id ${question.id ?? '(empty)'}`);
		}
		ids.add(String(question.id));
		if (!String(question.question || '').trim()) errors.push(`${quiz.id} #${question.id}: question text is empty`);

		const options = question.options && typeof question.options === 'object' ? question.options : {};
		const optionKeys = Object.keys(options);
		const fullyLocalized = Boolean(question.question_vi) &&
			Boolean(question.explanation_vi) &&
			optionKeys.every((key) => Boolean(question.options_vi?.[key]));
		if (fullyLocalized) {
			localizedQuestions += 1;
			totals.questionsFullyLocalized += 1;
		}
		if (optionKeys.length) {
			const answers = parseAnswer(question.answer, options);
			if (!answers?.length) {
				errors.push(`${quiz.id} #${question.id}: answer is empty or does not match an option`);
			} else {
				const isMulti = answers.length > 1;
				if (isMulti) totals.multiAnswer += 1;
				if (Boolean(question.isMulti) !== isMulti) {
					totals.multiAnswerFlagMismatches += 1;
					errors.push(`${quiz.id} #${question.id}: isMulti must be ${isMulti} for answer ${question.answer}`);
				}
			}
		} else if (!question.explanation_vi && !question.answer_image) {
			errors.push(`${quiz.id} #${question.id}: no options and no answer explanation/image`);
		}
		if (!optionKeys.length && String(question.answer || '').trim() && !question.answer_image) {
			errors.push(`${quiz.id} #${question.id}: answer key has no visible options or answer image`);
		}

		if (String(question.question_vi || '').trim()) totals.questionsWithVietnamese += 1;
		if (String(question.explanation_vi || '').trim()) totals.questionsWithExplanation += 1;
		if (Array.isArray(question.references) && question.references.length) totals.questionsWithReferences += 1;

		const questionImages = splitImages(question.image);
		const answerImages = splitImages(question.answer_image);
		const embeddedImages = [
			question.question,
			question.question_vi,
			question.explanation_vi,
			...Object.values(options),
			...Object.values(question.options_vi || {}),
		].flatMap(markdownImages);
		const requiredImages = (String(question.question || '').match(/\/\/IMG\/\//g) || []).length;
		if (requiredImages > questionImages.length) {
			errors.push(`${quiz.id} #${question.id}: ${requiredImages} //IMG// markers but only ${questionImages.length} question images`);
		}
		for (const image of [...questionImages, ...answerImages, ...embeddedImages]) {
			totals.imageReferences += 1;
			if (!imageExists(quizDirectory, image)) errors.push(`${quiz.id} #${question.id}: missing image ${image}`);
		}

		for (const reference of question.references || []) {
			try {
				const url = new URL(reference.url);
				if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported protocol');
			} catch {
				errors.push(`${quiz.id} #${question.id}: invalid reference URL ${reference.url || '(empty)'}`);
			}
		}
	}
	const expectedCoverage = questions.length ? Math.round((localizedQuestions / questions.length) * 1000) / 10 : 0;
	if (Number(quiz.viCoverage || 0) !== expectedCoverage) {
		errors.push(`${quiz.id}: manifest Vietnamese coverage ${quiz.viCoverage || 0}% does not match ${expectedCoverage}%`);
	}
	if (Boolean(quiz.vi) !== (questions.length > 0 && localizedQuestions === questions.length)) {
		errors.push(`${quiz.id}: manifest bilingual flag does not match question coverage`);
	}
}

const publishedIds = new Set(manifest.map((quiz) => quiz.id));
for (const entry of fs.readdirSync(quizRoot, { withFileTypes: true })) {
	if (!entry.isDirectory() || entry.name === 'shared' || publishedIds.has(entry.name)) continue;
	const draftFile = path.join(quizRoot, entry.name, 'questions.json');
	if (!fs.existsSync(draftFile)) continue;
	totals.unlistedDrafts += 1;
	const draft = JSON.parse(fs.readFileSync(draftFile, 'utf8'));
	const draftQuestions = Array.isArray(draft) ? draft : draft.questions || [];
	const missingVi = draftQuestions.filter((question) => !String(question.question_vi || '').trim()).length;
	const missingExplanation = draftQuestions.filter((question) => !String(question.explanation_vi || '').trim()).length;
	console.warn(`Draft not listed in manifest: ${entry.name} (${draftQuestions.length} questions; ${missingVi} missing Vietnamese; ${missingExplanation} missing explanations)`);
}

if (errors.length) {
	console.error(`Quiz content check failed with ${errors.length} issue(s):`);
	for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
	process.exit(1);
}

const translated = totals.questions ? Math.round((totals.questionsWithVietnamese / totals.questions) * 100) : 0;
const fullyLocalized = totals.questions ? Math.round((totals.questionsFullyLocalized / totals.questions) * 100) : 0;
const explained = totals.questions ? Math.round((totals.questionsWithExplanation / totals.questions) * 100) : 0;
console.log(
	`Quiz content check passed: ${totals.questions} published questions across ${totals.quizzes} sets; ` +
	`${totals.multiAnswer} multi-answer questions (${totals.multiAnswerFlagMismatches} flag mismatches); ` +
	`${translated}% Vietnamese question coverage, ${fullyLocalized}% fully localized; ` +
	`${explained}% explanation coverage; ${totals.imageReferences} image references checked.`
);

// Keep the app's comma and compact-letter formats aligned with this validator.
for (const [input, options, expected] of [
	['C, E', { A: '', C: '', E: '' }, ['C', 'E']],
	['E,C', { C: '', E: '' }, ['C', 'E']],
	['BCF', { B: '', C: '', F: '' }, ['B', 'C', 'F']],
]) {
	const result = parseAnswer(input, options);
	if (JSON.stringify(result) !== JSON.stringify(expected)) {
		console.error(`Answer normalization check failed for ${input}`);
		process.exit(1);
	}
}
