// Guidia's brand mark: the "G" with a graduation cap (blue → teal). One
// optimised image (src/assets/guidia-mark.webp) is used everywhere in the
// app; static copies for favicons, the home-screen icon and the extension
// live in public/ (favicon.png, apple-touch-icon.png, logo-mark.png,
// logo.png) and extension/ (icon*.png). On dark or coloured backgrounds use
// `tile` so the mark sits on a small white rounded square.
import markUrl from '../assets/guidia-mark.webp';

export function GuidiaMark({ size = 40, title = 'Guidia', style = {}, tile = false, className }) {
  const img = (
    <img
      src={markUrl}
      width={size}
      height={size}
      alt={title || ''}
      aria-hidden={title ? undefined : 'true'}
      draggable="false"
      decoding="async"
      className={`guidia-mark ${tile ? '' : className || ''}`}
      style={{ display: 'block', flexShrink: 0, width: size, height: size, objectFit: 'contain', ...(tile ? {} : style) }}
    />
  );
  if (!tile) return img;
  const pad = Math.round(size * 0.18);
  return (
    <span className={`guidia-mark-tile ${className || ''}`} style={{ padding: pad, borderRadius: Math.round(size * 0.32), ...style }}>
      {img}
    </span>
  );
}

export default function GuidiaLogo({ variant = 'mark', size = 40, style = {}, tagline }) {
  if (variant !== 'full') return <GuidiaMark size={size} style={style} />;
  return (
    <span className="guidia-lockup" style={{ display: 'inline-flex', alignItems: 'center', gap: Math.round(size * 0.25), ...style }}>
      <GuidiaMark size={size} title="" />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span className="guidia-wordmark" style={{ fontSize: Math.round(size * 0.62) }}>Guidia</span>
        {tagline && <span className="guidia-tagline" style={{ fontSize: Math.max(11, Math.round(size * 0.24)) }}>{tagline}</span>}
      </span>
    </span>
  );
}
