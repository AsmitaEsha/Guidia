// Button guides from both data sources, merged into one shape for the
// explainer: { name, desc, level, section, replica | icon+color, tip }.
import { BUTTON_GUIDES } from './buttonGuides';
import { UI_GUIDES } from './uiGuides';
import { BUTTON_REPLICAS } from './buttonReplicas';

/** Every app that has a button guide, merged from both data sources. */
export function guideApps() {
  const keys = new Set([...Object.keys(BUTTON_GUIDES), ...UI_GUIDES.map((g) => g.id)]);
  return [...keys].map((key) => {
    const ui = UI_GUIDES.find((g) => g.id === key);
    const simple = BUTTON_GUIDES[key];
    const count = ui ? ui.sections.reduce((n, s) => n + s.buttons.length, 0) : simple?.buttons.length || 0;
    return { key, name: ui?.name || simple?.name || key, count };
  });
}

export function buildButtons(appKey) {
  const ui = UI_GUIDES.find((g) => g.id === appKey);
  if (ui) {
    return ui.sections.flatMap((section) => section.buttons.map((b) => ({
      name: b.name, desc: b.desc, level: b.safety, section: section.title, replica: BUTTON_REPLICAS[b.replicaKey] || null,
    })));
  }
  return (BUTTON_GUIDES[appKey]?.buttons || []).map((b) => ({
    name: b.label, desc: b.desc, level: b.intensity, section: null, icon: b.icon, color: b.color, tip: b.tooltip?.body,
  }));
}

