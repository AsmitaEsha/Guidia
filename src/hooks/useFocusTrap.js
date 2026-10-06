import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Open overlays, topmost last: only the top one reacts to Escape/Tab.
const stack = [];

// Keeps keyboard focus inside `ref` while active, closes on Escape and
// returns focus to whatever opened it. Listens on the document, so it keeps
// working even when the focused control inside was removed (e.g. a button
// replaced by a result).
export function useFocusTrap(ref, active, onEscape) {
  const escapeRef = useRef(onEscape);
  useEffect(() => { escapeRef.current = onEscape; }, [onEscape]);

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const node = ref.current;
    const previous = document.activeElement;
    const entry = { node };
    stack.push(entry);
    const items = () => [...node.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);

    // Prefer an explicit [data-autofocus] target, then the first control.
    const first = node.querySelector('[data-autofocus]') || items()[0] || node;
    first.focus({ preventScroll: true });

    const onKey = (e) => {
      if (stack[stack.length - 1] !== entry) return;
      if (e.key === 'Escape') { e.stopPropagation(); escapeRef.current?.(); return; }
      if (e.key !== 'Tab') return;
      const list = items();
      if (list.length === 0) { e.preventDefault(); node.focus(); return; }
      const [head, tail] = [list[0], list[list.length - 1]];
      const inside = node.contains(document.activeElement);
      if (!inside) { e.preventDefault(); (e.shiftKey ? tail : head).focus(); return; }
      if (e.shiftKey && document.activeElement === head) { e.preventDefault(); tail.focus(); }
      else if (!e.shiftKey && document.activeElement === tail) { e.preventDefault(); head.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      if (previous && typeof previous.focus === 'function' && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  }, [active, ref]);
}

// Locks page scroll while any overlay is open (counted, so nested
// overlays don't unlock early).
let locks = 0;
export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    locks += 1;
    const { body } = document;
    if (locks === 1) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (gap > 0) body.style.paddingRight = `${gap}px`;
    }
    return () => {
      locks -= 1;
      if (locks === 0) { body.style.overflow = ''; body.style.paddingRight = ''; }
    };
  }, [active]);
}
