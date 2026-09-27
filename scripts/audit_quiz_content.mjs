import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { quizHidden } from '../src/config/quizzes.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quizRoot = path.join(root, 'public', 'quizzes');
const directories = fs.readdirSync(quizRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'shared')
  .map((entry) => entry.name)
  .sort();

function asQuestions(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.questions)) return value.questions;
  throw new Error('expected an array of questions');
}

function refsOf(question) {
  if (!question.references) return [];
  return Array.isArray(question.references) ? question.references : [question.references];
}

function imagesOf(value) {
  if (!value) return [];
  return (Array.isArray(value) ? value : String(value).split(/[\n,]/))
    .map((image) => String(image).trim())
    .filter(Boolean);
}

function answerKeysOf(question) {
  if (question.answer === undefined || question.answer === null || question.answer === '') return [];
  const value = String(question.answer).replace(/\s/g, '');
  if (value.includes(',')) return value.split(',').filter(Boolean);
  const optionKeys = question.options && typeof question.options === 'object' ? Object.keys(question.options) : [];
  if (question.isMulti || (value.length > 1 && [...value].every((key) => optionKeys.includes(key)))) return [...value];
  return [value];
}

function expectedAnswerCount(question) {
  const text = String(question.question ?? '');
  const count = '(one|two|three|four|five|six|seven|eight|nine|ten|\\d+)';
  const explicitSelection = text.match(new RegExp(`\\b(?:choose|select)\\s+(?:exactly\\s+)?${count}\\b`, 'i'))
    ?? text.match(new RegExp(`\\(\\s*choose\\s+${count}\\s*\\)`, 'i'));
  const multiAnswerInstructions = /each correct (?:answer|selection)\s+(?:presents?|is worth)|select all that apply/i.test(text);
  const whichCount = multiAnswerInstructions
    ? text.match(new RegExp(`\\bwhich\\s+${count}\\b`, 'i'))
    : null;
  const match = explicitSelection ?? whichCount;
  if (!match) return null;
  const value = String(match[1]).toLowerCase();
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : words[value] ?? null;
}

const reports = [];
const malformedFiles = [];

for (const quizId of directories) {
  const file = path.join(quizRoot, quizId, 'questions.json');
  if (!fs.existsSync(file)) continue;

  let questions;
  try {
    questions = asQuestions(JSON.parse(fs.readFileSync(file, 'utf8')));
  } catch (error) {
    malformedFiles.push({ quizId, error: error.message });
    continue;
  }

  const issues = {
    missingQuestion: [],
    missingVietnamese: [],
    optionTranslationMismatch: [],
    emptyOptions: [],
    invalidAnswerArea: [],
    missingAnswerForChoices: [],
    invalidAnswerKey: [],
    missingMultiSelectFlag: [],
    answerCountMismatch: [],
    missingExplanation: [],
    explanationWithoutAnswer: [],
    explanationUnder1000: [],
    unexplainedDistractors: [],
    missingReferences: [],
    invalidReference: [],
    missingImages: [],
    imagePlaceholderMismatch: [],
  };
  const seenIds = new Set();
  const explanationLengths = [];

  for (const question of questions) {
    const id = String(question.id ?? '(no id)');
    const add = (kind, detail = '') => issues[kind].push(detail ? `${id}: ${detail}` : id);
    if (seenIds.has(id)) add('missingQuestion', 'duplicate question id');
    seenIds.add(id);

    if (!question.question?.trim() || /^(?:question text missing|todo|tbd)$/i.test(question.question.trim())) {
      add('missingQuestion');
    }
    if (!question.question_vi?.trim()) add('missingVietnamese', 'question_vi');

    const options = question.options && typeof question.options === 'object' ? Object.keys(question.options) : [];
    const answerRows = Array.isArray(question.answer_area?.rows) ? question.answer_area.rows : [];
    if (!options.length && !answerRows.length) add('emptyOptions', 'no English answer choices or interactive answer rows');
    for (const [rowIndex, row] of answerRows.entries()) {
      const choices = row.choices && typeof row.choices === 'object' ? Object.keys(row.choices) : [];
      if (!row.label?.trim() || !choices.length || !row.answer || !choices.includes(row.answer)) {
        add('invalidAnswerArea', `row ${rowIndex + 1} must include a label, choices, and a valid answer key`);
      }
      if (choices.some((key) => !row.choices_vi?.[key]?.trim())) {
        add('invalidAnswerArea', `row ${rowIndex + 1} missing Vietnamese choice translations`);
      }
    }
    const optionTranslations = question.options_vi && typeof question.options_vi === 'object'
      ? Object.keys(question.options_vi)
      : [];
    if (options.length && options.some((key) => !question.options_vi?.[key]?.trim())) {
      add('optionTranslationMismatch', `missing VI option(s): ${options.filter((key) => !question.options_vi?.[key]?.trim()).join(',')}`);
    }
    if (optionTranslations.some((key) => !options.includes(key))) {
      add('optionTranslationMismatch', `unexpected VI option key(s): ${optionTranslations.filter((key) => !options.includes(key)).join(',')}`);
    }

    const answerKeys = answerKeysOf(question);
    if (options.length && !answerKeys.length) add('missingAnswerForChoices');
    if (options.length && answerKeys.length > 1 && !question.isMulti) add('missingMultiSelectFlag');
    const expectedCount = expectedAnswerCount(question);
    if (options.length && expectedCount && answerKeys.length !== expectedCount) {
      add('answerCountMismatch', `expected ${expectedCount}, found ${answerKeys.length} (${String(question.answer ?? '(blank)')})`);
    }
    if (options.length && answerKeys.some((key) => !options.includes(key))) {
      add('invalidAnswerKey', `${answerKeys.filter((key) => !options.includes(key)).join(',')}`);
    }

    const explanation = String(question.explanation_vi ?? '');
    explanationLengths.push(explanation.length);
    if (!explanation.trim()) add('missingExplanation');
    else {
      if (!/(đáp án|answer|lời giải)/i.test(explanation)) add('explanationWithoutAnswer');
      if (explanation.length < 1000) add('explanationUnder1000', `${explanation.length} chars`);

      if (options.length) {
        const correct = new Set(answerKeys);
        const missing = options.filter((key) => {
          if (correct.has(key)) return false;
          const label = new RegExp(`(?:^|\\n)\\s*(?:[-*•]\\s*)?(?:\\*\\*)?${key}(?:\\*\\*)?\\s*(?:[—–:-]|\\.|(?:sai|đúng|là|không))`, 'im');
          return !label.test(explanation);
        });
        if (missing.length) add('unexplainedDistractors', missing.join(','));
      }
    }

    const refs = refsOf(question);
    if (!refs.length) add('missingReferences');
    for (const ref of refs) {
      try {
        const url = new URL(ref.url);
        if (!['http:', 'https:'].includes(url.protocol) || !ref.title?.trim()) {
          add('invalidReference', String(ref.url ?? '(no URL)'));
        }
      } catch {
        add('invalidReference', String(ref.url ?? '(no URL)'));
      }
    }

    const imageRefs = [...imagesOf(question.image), ...imagesOf(question.answer_image)];
    for (const image of imageRefs) {
      const relative = String(image).replace(/\\/g, '/').replace(/^\/+/, '');
      const resolved = path.resolve(quizRoot, quizId, relative);
      const withinQuizDir = resolved.startsWith(`${path.resolve(quizRoot, quizId)}${path.sep}`);
      if (!withinQuizDir || !fs.existsSync(resolved)) add('missingImages', relative);
    }
    const imageMarkers = (String(question.question ?? '').match(/\/\/IMG\/\//g) ?? []).length;
    if (imageMarkers > imageRefs.length) add('imagePlaceholderMismatch', `${imageMarkers} marker(s), ${imageRefs.length} image(s)`);
  }

  const sums = Object.fromEntries(Object.entries(issues).map(([key, values]) => [key, values.length]));
  reports.push({
    quizId,
    hidden: quizHidden.includes(quizId),
    questions: questions.length,
    minExplanationChars: Math.min(...explanationLengths),
    ...sums,
  });

  if (process.argv.includes('--details')) {
    for (const [kind, values] of Object.entries(issues)) {
      if (values.length) console.log(`${quizId}\t${kind}\t${values.join('; ')}`);
    }
  }
}

const totals = reports.reduce((acc, report) => {
  acc.questions += report.questions;
  for (const [key, value] of Object.entries(report)) {
    if (key !== 'quizId' && key !== 'hidden' && key !== 'questions' && key !== 'minExplanationChars') {
      acc[key] = (acc[key] ?? 0) + value;
    }
  }
  return acc;
}, { questions: 0 });

console.table(reports.map((report) => ({
  quizId: report.quizId,
  hidden: report.hidden,
  questions: report.questions,
  minExplanationChars: report.minExplanationChars,
  translationGaps: report.missingVietnamese + report.optionTranslationMismatch,
  answerKeyIssues: report.emptyOptions + report.invalidAnswerArea + report.missingAnswerForChoices + report.invalidAnswerKey + report.missingMultiSelectFlag + report.answerCountMismatch,
  missingExplanation: report.missingExplanation,
  explanationUnder1000: report.explanationUnder1000,
  unexplainedDistractors: report.unexplainedDistractors,
  missingReferences: report.missingReferences,
  missingImages: report.missingImages,
  other: report.missingQuestion + report.explanationWithoutAnswer + report.invalidReference + report.imagePlaceholderMismatch,
})));
console.log(`Scanned ${reports.length} quiz files (${reports.filter((report) => !report.hidden).length} listed, ${reports.filter((report) => report.hidden).length} hidden), ${totals.questions} questions.`);
console.log('Issue totals:', totals);
if (malformedFiles.length) {
  console.error('Malformed quiz files:', malformedFiles);
  process.exitCode = 1;
}
