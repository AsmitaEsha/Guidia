// Guidia's real brand mark. `public/logo.png` is the full lockup (icon +
// wordmark + tagline); `public/logo-mark.png` is a tightly-cropped,
// transparent-background version of just the icon (produced once from
// logo.png by locating the icon's actual pixel bounds — not a CSS crop
// guess), used anywhere the mark needs to sit at nav/icon scale.
export default function GuidiaLogo({ variant = 'mark', size = 40, style = {} }) {
  if (variant === 'full') {
    return (
      <img
        src="/logo.png"
        alt="Guidia"
        style={{ width: size, height: 'auto', display: 'block', ...style }}
      />
    );
  }

  // logo-mark.png is 712x512 (~1.39:1) — size by height and let width follow,
  // so the mark is never stretched or awkwardly cropped.
  const height = size;
  const width = Math.round(size * (712 / 512));

  return (
    <img
      src="/logo-mark.png"
      alt="Guidia"
      style={{ width, height, objectFit: 'contain', display: 'block', flexShrink: 0, ...style }}
    />
  );
}
