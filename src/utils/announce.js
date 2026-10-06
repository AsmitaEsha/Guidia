// One polite live region for the whole app. Components call announce()
// for things a screen-reader user must hear but that don't move focus:
// "Saved", "Guidia answered", "Analysis ready", "3 new notifications".
let node = null;
let timer = null;

function region() {
  if (node && document.body.contains(node)) return node;
  node = document.createElement('div');
  node.setAttribute('role', 'status');
  node.setAttribute('aria-live', 'polite');
  node.setAttribute('aria-atomic', 'true');
  node.className = 'sr-only';
  document.body.appendChild(node);
  return node;
}

export function announce(message) {
  if (typeof document === 'undefined' || !message) return;
  const el = region();
  clearTimeout(timer);
  // Clear first so repeating the same text is announced again.
  el.textContent = '';
  timer = setTimeout(() => { el.textContent = message; }, 60);
}
