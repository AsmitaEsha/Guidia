// Draws an app button the way it really looks — in its own colours and,
// where it helps, inside the bar or screen where people find it (so the
// WhatsApp paperclip appears inside the message box, not floating alone).
//
// spec shapes:
//   { type: 'bar', bg, fg, items: [{ icon, label?, active?, round?, bg?, fg? }], radius? }
//   { type: 'button', bg, fg, icon?, label?, shape: 'round' | 'pill' | 'rect', border?, size? }
//   { type: 'tile', bg, fg, icon, label, canvas? }   — payment-app style tile
//   { type: 'text', fg, label, bg? }                 — a text link or tab
//   { type: 'input', placeholder, icon?, active? }   — a field with a highlighted part
//   { type: 'toggle', on, label }                    — a switch row
// Every replica sits on a light "screen" so nothing is ever drawn
// white-on-white.

function Glyph({ icon: Icon, size = 22, color }) {
  if (!Icon) return null;
  return <Icon size={size} color={color} strokeWidth={2.2} aria-hidden="true" />;
}

function Highlight({ children, on }) {
  return <span className={`rp-target ${on ? 'is-on' : ''}`}>{children}</span>;
}

export default function ButtonReplica({ spec }) {
  if (!spec) return null;
  const canvas = spec.canvas || '#f3f5f7';

  if (spec.type === 'bar') {
    return (
      <div className="rp-screen" style={{ background: canvas }}>
        <div className="rp-bar" style={{ background: spec.bg || '#fff', color: spec.fg || '#3b4a54', borderRadius: spec.radius ?? 28 }}>
          {spec.items.map((it, i) => {
            const inner = it.round ? (
              <span className="rp-round" style={{ background: it.bg || spec.accent || '#25D366', color: it.fg || '#fff' }}><Glyph icon={it.icon} size={20} /></span>
            ) : it.label && !it.icon ? (
              <span className="rp-bar-text" style={{ color: it.fg || 'inherit' }}>{it.label}</span>
            ) : (
              <span className="rp-bar-item" style={{ color: it.fg || 'inherit' }}><Glyph icon={it.icon} size={21} />{it.label && <span>{it.label}</span>}</span>
            );
            return <Highlight key={i} on={it.active}>{inner}</Highlight>;
          })}
        </div>
      </div>
    );
  }

  if (spec.type === 'tile') {
    return (
      <div className="rp-screen" style={{ background: canvas }}>
        <Highlight on>
          <span className="rp-tile" style={{ color: spec.fg || '#333' }}>
            <span className="rp-tile-icon" style={{ background: spec.bg || '#e2136e', color: spec.iconFg || '#fff' }}><Glyph icon={spec.icon} size={24} /></span>
            <span className="rp-tile-label">{spec.label}</span>
          </span>
        </Highlight>
      </div>
    );
  }

  if (spec.type === 'text') {
    return (
      <div className="rp-screen" style={{ background: spec.bg || canvas }}>
        <Highlight on><span className="rp-text" style={{ color: spec.fg || '#1a73e8' }}>{spec.icon && <Glyph icon={spec.icon} size={18} />}{spec.label}</span></Highlight>
      </div>
    );
  }

  if (spec.type === 'input') {
    return (
      <div className="rp-screen" style={{ background: canvas }}>
        <span className="rp-input">
          <span className="rp-input-ph">{spec.placeholder}</span>
          {spec.icon && <Highlight on={spec.active !== false}><span className="rp-bar-item" style={{ color: spec.fg || '#54656f' }}><Glyph icon={spec.icon} size={20} /></span></Highlight>}
        </span>
      </div>
    );
  }

  if (spec.type === 'toggle') {
    return (
      <div className="rp-screen" style={{ background: canvas }}>
        <Highlight on>
          <span className="rp-toggle-row">
            <span>{spec.label}</span>
            <span className={`rp-toggle ${spec.on ? 'is-on' : ''}`} style={{ '--on': spec.bg || '#1877F2' }}><i /></span>
          </span>
        </Highlight>
      </div>
    );
  }

  // type: 'button'
  const shape = spec.shape || 'pill';
  return (
    <div className="rp-screen" style={{ background: canvas }}>
      <Highlight on>
        <span
          className={`rp-btn rp-${shape} ${spec.size === 'lg' ? 'rp-lg' : ''}`}
          style={{ background: spec.bg || '#1a73e8', color: spec.fg || '#fff', border: spec.border ? `1.5px solid ${spec.border}` : undefined }}
        >
          <Glyph icon={spec.icon} size={shape === 'round' ? 24 : 19} />
          {spec.label && <span>{spec.label}</span>}
        </span>
      </Highlight>
    </div>
  );
}
