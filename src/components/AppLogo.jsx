import { useState } from 'react';
import { APP_LOGOS } from '../config/appLogos';

// App identity tiles. Each app gets a simple, recognisable mark drawn
// inline (brand colour + glyph), so tiles render instantly, offline and at
// any size — no third-party image requests. A remote image (APP_LOGOS) is
// only used for apps without a mark, and a monogram covers anything else.
// Every variant sits in the same fixed-size tile, so nothing shifts.
// Marks are simplified for recognition only; Guidia is not affiliated with
// these apps.

const fill = { width: '100%', height: '100%', display: 'grid', placeItems: 'center' };
const word = (size, scale = 0.3) => ({ fontFamily: 'Outfit, system-ui, sans-serif', fontWeight: 700, fontSize: size * scale, letterSpacing: '-0.03em', lineHeight: 1 });

const INLINE = {
  whatsapp: ({ size }) => (
    <span style={{ ...fill, background: '#25D366' }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 32 32" aria-hidden="true">
        <path fill="#fff" d="M16 3.2C9 3.2 3.3 8.8 3.3 15.7c0 2.4.7 4.7 2 6.7L3.2 28.8l6.6-2.1c1.9 1 4 1.6 6.2 1.6 7 0 12.7-5.6 12.7-12.6S23 3.2 16 3.2zm0 22.9c-2 0-3.9-.6-5.6-1.6l-.4-.2-3.9 1.2 1.3-3.8-.3-.4a10.2 10.2 0 0 1-1.6-5.6C5.5 10 10.2 5.4 16 5.4s10.5 4.6 10.5 10.3S21.8 26.1 16 26.1zm5.8-7.7c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.6 8.6 0 0 1-4.3-3.7c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7c0 1.6 1.2 3.1 1.3 3.3s2.3 3.5 5.5 4.9c2.1.9 2.9 1 3.9.8.6-.1 1.9-.8 2.2-1.5s.3-1.3.2-1.5-.3-.2-.6-.4z" />
      </svg>
    </span>
  ),
  facebook: ({ size }) => (
    <span style={{ ...fill, background: '#1877F2' }}>
      <svg width={size * 0.42} height={size * 0.62} viewBox="0 0 14 24" aria-hidden="true"><path fill="#fff" d="M9.2 24V13.1h3.6l.6-4.3H9.2V6.1c0-1.2.4-2.1 2.1-2.1H13.5V.2C13.1.1 11.8 0 10.3 0 7.1 0 4.9 2 4.9 5.6v3.2H1.3v4.3h3.6V24h4.3z" /></svg>
    </span>
  ),
  messenger: ({ size }) => (
    <span style={{ ...fill, background: 'linear-gradient(45deg,#0099FF,#A033FF)' }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 48 48" fill="white" aria-hidden="true">
        <path d="M24 2C11.85 2 2 11.27 2 22.6c0 6.37 3.17 12.05 8.15 15.81V46l7.38-4.05c1.97.54 4.06.84 6.47.84 12.15 0 22-9.27 22-20.6C46 11.27 36.15 2 24 2zm2.19 27.72l-5.59-5.96-10.92 5.96 12.02-12.76 5.72 5.96 10.78-5.96-12.01 12.76z" />
      </svg>
    </span>
  ),
  gmail: ({ size }) => (
    <span style={{ ...fill, background: '#fff' }}>
      <svg width={size * 0.66} height={size * 0.5} viewBox="0 0 32 24" aria-hidden="true">
        <path fill="#4285F4" d="M2.2 24h5.1V11.6L0 6.2v15.6C0 23 1 24 2.2 24z" />
        <path fill="#34A853" d="M24.7 24h5.1c1.2 0 2.2-1 2.2-2.2V6.2l-7.3 5.4z" />
        <path fill="#FBBC04" d="M24.7 2.2v9.4L32 6.2V3.3c0-2.7-3.1-4.2-5.2-2.6z" />
        <path fill="#EA4335" d="M7.3 11.6V2.2L16 8.7l8.7-6.5v9.4L16 18.1z" />
        <path fill="#C5221F" d="M0 3.3v2.9l7.3 5.4V2.2L5.2.7C3.1-.9 0 .6 0 3.3z" />
      </svg>
    </span>
  ),
  bkash: ({ size }) => (
    <span style={{ ...fill, background: '#E2136E', color: '#fff' }}>
      <span style={word(size, 0.28)}>bKash</span>
    </span>
  ),
  nagad: ({ size }) => (
    <span style={{ ...fill, background: 'linear-gradient(160deg,#F7941D,#EC1C24)', color: '#fff' }}>
      <span style={{ ...word(size, 0.3), fontFamily: "'Noto Sans Bengali', system-ui, sans-serif" }}>নগদ</span>
    </span>
  ),
  momo: ({ size }) => (
    <span style={{ ...fill, gridTemplateColumns: '1fr 1fr', padding: size * 0.14, background: '#A50064', color: '#fff' }}>
      {[0, 1, 2, 3].map((i) => <span key={i} style={{ fontSize: size * 0.2, fontWeight: 900, lineHeight: 1 }}>Mo</span>)}
    </span>
  ),
  googlepay: ({ size }) => (
    <span style={{ ...fill, background: '#fff' }}>
      <span style={{ ...word(size, 0.3), display: 'flex', alignItems: 'baseline', gap: size * 0.03 }}>
        <span style={{ color: '#4285F4' }}>G</span><span style={{ color: '#5f6368' }}>Pay</span>
      </span>
    </span>
  ),
  paypal: ({ size }) => (
    <span style={{ ...fill, background: '#003087', color: '#fff' }}>
      <span style={{ ...word(size, 0.5), fontStyle: 'italic' }}>P<span style={{ color: '#009CDE', marginLeft: -size * 0.12 }}>P</span></span>
    </span>
  ),
  booking: ({ size }) => (
    <span style={{ ...fill, background: '#003580', color: '#fff' }}>
      <span style={word(size, 0.5)}>B<span style={{ color: '#5BBAFF' }}>.</span></span>
    </span>
  ),
  practo: ({ size }) => (
    <span style={{ ...fill, background: '#28328C' }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    </span>
  ),
  amazon: ({ size }) => (
    <span style={{ ...fill, background: '#232F3E', color: '#fff', alignContent: 'center' }}>
      <span style={{ ...word(size, 0.46), display: 'block', textAlign: 'center' }}>a</span>
      <svg width={size * 0.5} height={size * 0.14} viewBox="0 0 30 8" aria-hidden="true" style={{ marginTop: -size * 0.06 }}>
        <path d="M1 1.5c8 5 20 5 27 0" fill="none" stroke="#FF9900" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M24 0.5l4.5 1-1.2 4.2" fill="none" stroke="#FF9900" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ),
  imo: ({ size }) => (
    <span style={{ ...fill, background: 'linear-gradient(160deg,#2e8bff,#0a5bd8)', color: '#fff' }}>
      <span style={word(size, 0.34)}>imo</span>
    </span>
  ),
};

const MONOGRAM_BG = ['#0d625d', '#b5513b', '#8a5a14', '#1d5a8a', '#4a5961'];

export default function AppLogo({ app, name, size = 48, radius, style = {} }) {
  const [failed, setFailed] = useState(false);
  const r = radius ?? Math.round(size * 0.26);
  const Inline = INLINE[app];
  const src = APP_LOGOS[app];
  const label = name || app;

  const tile = {
    width: size, height: size, borderRadius: r, flexShrink: 0, overflow: 'hidden',
    display: 'grid', placeItems: 'center', background: '#fff',
    boxShadow: 'inset 0 0 0 1px rgb(24 37 44 / 0.08)', ...style,
  };

  if (Inline) return <span style={tile} role="img" aria-label={label}><Inline size={size} /></span>;
  if (src && !failed) {
    return (
      <span style={tile}>
        <img src={src} alt={label} width={Math.round(size * 0.72)} height={Math.round(size * 0.72)} loading="lazy" decoding="async" style={{ width: '72%', height: '72%', objectFit: 'contain' }} onError={() => setFailed(true)} />
      </span>
    );
  }
  const letter = (label || '?').trim().charAt(0).toUpperCase();
  const bg = MONOGRAM_BG[(letter.charCodeAt(0) || 0) % MONOGRAM_BG.length];
  return <span style={{ ...tile, background: bg, color: '#fff', fontWeight: 800, fontSize: size * 0.42 }} role="img" aria-label={label}>{letter}</span>;
}
