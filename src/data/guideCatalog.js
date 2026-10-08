// Button guides for every practice app, in one shape for the explainer:
// { name, does, desc, level, section, replica } — all labels [en, bn, hi, vi].
import { APP_BUTTON_GUIDES, GUIDE_ORDER } from './appButtonGuides';

/** Every app that has a button guide. */
export function guideApps() {
  return GUIDE_ORDER.map((key) => {
    const g = APP_BUTTON_GUIDES[key];
    return { key, name: g.name, count: g.sections.reduce((n, s) => n + s.buttons.length, 0) };
  });
}

export function buildButtons(appKey) {
  const g = APP_BUTTON_GUIDES[appKey];
  if (!g) return [];
  return g.sections.flatMap((section) => section.buttons.map((b) => ({ ...b, section: section.title })));
}
