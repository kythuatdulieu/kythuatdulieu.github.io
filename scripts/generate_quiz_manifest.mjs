// Sinh public/quizzes/manifest.json từ src/config/quizzes.js + thư mục thực tế.
// Quiz app (public/quizzes/shared/app.js) fetch file này để dựng dropdown chọn bộ đề.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { quizMeta, quizProviders, quizHidden } from '../src/config/quizzes.js';
import { hasCompleteVietnamese, questionArray } from '../src/config/quiz-utils.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const quizRoot = path.join(root, 'public', 'quizzes');

const ids = fs
  .readdirSync(quizRoot, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'shared' && !quizHidden.includes(d.name))
  .map((d) => d.name);

function loadQuiz(id) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(quizRoot, id, 'questions.json'), 'utf8'));
    const questions = questionArray(data);
    return { count: questions.length, vi: hasCompleteVietnamese(questions) };
  } catch {
    return { count: null, vi: false };
  }
}

const list = ids
  .map((id) => {
    const meta = quizMeta[id] || { name: id, provider: 'Khác' };
    const quiz = loadQuiz(id);
    return { id, name: meta.name, provider: meta.provider, vi: quiz.vi, count: quiz.count };
  })
  .sort((a, b) => {
    const pa = quizProviders.indexOf(a.provider);
    const pb = quizProviders.indexOf(b.provider);
    if (pa !== pb) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    if (a.vi !== b.vi) return a.vi ? -1 : 1; // bộ song ngữ lên đầu nhóm
    return a.name.localeCompare(b.name, 'vi');
  });

fs.writeFileSync(path.join(quizRoot, 'manifest.json'), JSON.stringify(list, null, 1) + '\n');
console.log(`quiz manifest: ${list.length} bộ đề`);
