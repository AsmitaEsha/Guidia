// Remembers where the user is inside each lesson, in this browser only
// (a convenience — completion itself is saved to the account). Wrapped in
// try/catch because storage can be unavailable (private windows, policies).
const KEY = 'guidia.lessonProgress';

function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; }
}
function writeAll(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
}

export function getLessonStep(slug) {
  return readAll()[slug]?.step ?? 0;
}

export function saveLessonStep(slug, step, total) {
  const all = readAll();
  all[slug] = { step, total, at: Date.now() };
  writeAll(all);
}

export function clearLessonStep(slug) {
  const all = readAll();
  delete all[slug];
  writeAll(all);
}

/** Lessons started but not finished, most recent first. */
export function inProgressLessons() {
  return Object.entries(readAll())
    .filter(([, v]) => v.step > 0 && v.step < (v.total ?? Infinity))
    .sort((a, b) => b[1].at - a[1].at)
    .map(([slug, v]) => ({ slug, ...v }));
}
