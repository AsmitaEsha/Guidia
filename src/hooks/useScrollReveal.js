import { useEffect, useRef } from 'react';

// Adds the `lp-reveal` class's `.is-visible` toggle via IntersectionObserver.
// Returns a ref to attach to the element that should animate in on scroll.
// Respects prefers-reduced-motion / Reduced Motion setting through CSS
// alone (see .lp-reveal in index.css) — this hook only ever adds a class,
// never inline motion, so the CSS media query is always the final say.
export default function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ref;
}
