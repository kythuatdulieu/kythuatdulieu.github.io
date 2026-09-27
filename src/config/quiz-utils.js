export function questionArray(data) {
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.questions) ? data.questions : [];
}

export function hasCompleteVietnamese(questions) {
  return questions.length > 0 && questions.every((question) => {
    if (!question.question_vi?.trim() || !question.explanation_vi?.trim()) return false;
    const options = question.options && typeof question.options === 'object' ? question.options : {};
    const optionsVi = question.options_vi && typeof question.options_vi === 'object' ? question.options_vi : {};
    return Object.keys(options).every((key) => optionsVi[key]?.trim());
  });
}
