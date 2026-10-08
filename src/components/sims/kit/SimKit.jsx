/* eslint-disable react-refresh/only-export-components -- the kit's hooks and helpers live beside its components on purpose */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Angry, ArrowLeft, BatteryFull, Building2, Cake, Delete, Frown, Gift, Glasses, Heart, HeartHandshake, Hotel, Image as ImageIcon, Info, Laugh, Leaf, Lock, Moon, School, Signal, Smartphone, Sparkles, Store, Sunrise, ThumbsUp, Trees, Users, UtensilsCrossed, Wifi, X, CookingPot, Castle } from 'lucide-react';

// ── The simulator kit ────────────────────────────────────────────────────
// Every practice app is built from these pieces, so they all behave alike:
//   <SimRoot>    — the phone screen; owns the coach and explain layers.
//   <Tap>        — anything tappable. In a guided task, the control for the
//                  current step pulses and shows a coach bubble; doing it
//                  reports the action so the step completes by itself. In
//                  "What's this?" mode, tapping explains instead of acting.
//   useStack()   — screens with a working back button.
//   <StatusBar>, <AppBar>, <Sheet>, <PinPad>, useToast() — shared parts.
// Labels are [en, bn, hi, vi] arrays passed to t().

const SimCtx = createContext(null);
export const useSim = () => useContext(SimCtx);

export const T = (en, bn, hi, vi) => [en, bn, hi, vi];

/**
 * Props: t, language, expect (action the current step wants), coach (its
 * instruction), onAction(action, payload), explainMode, onExplainMode.
 */
export function SimRoot({ children, t, language, expect, coach, onAction, explainMode = false, theme = 'light', className = '' }) {
  const rootRef = useRef(null);
  const [explain, setExplain] = useState(null); // { text, rect }
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((text, ms = 2600) => {
    clearTimeout(toastTimer.current);
    setToast(text);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const emit = useCallback((action, payload) => { if (action) onAction?.(action, payload); }, [onAction]);

  const showExplain = useCallback((text, el) => {
    const root = rootRef.current;
    if (!root || !el) return;
    const r = el.getBoundingClientRect();
    const o = root.getBoundingClientRect();
    setExplain({ text, rect: { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height } });
  }, []);

  const value = useMemo(() => ({ t, language, expect, coach, emit, explainMode, showExplain, showToast, rootRef }), [t, language, expect, coach, emit, explainMode, showExplain, showToast]);

  return (
    <SimCtx.Provider value={value}>
      <div ref={rootRef} className={`sim-root sim-${theme} ${explainMode ? "is-explaining" : ""} ${className}`} data-expect={expect || undefined}>
        {children}
        <CoachLayer />
        {explainMode && explain && (
          <Bubble rect={explain.rect} tone="explain" onClose={() => setExplain(null)}>
            <span className="sim-bubble-kicker"><Info size={14} aria-hidden="true" /> {t("What's this?", 'এটা কী?', 'यह क्या है?', 'Đây là gì?')}</span>
            <span>{explain.text}</span>
          </Bubble>
        )}
        {toast && <div className="sim-toast" role="status">{toast}</div>}
      </div>
    </SimCtx.Provider>
  );
}

// A bubble anchored next to an element (below it, or above when near the bottom).
function Bubble({ rect, children, tone, onClose }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: 12, top: rect.y + rect.h + 12, above: false });
  useLayoutEffect(() => {
    const el = ref.current;
    const root = el?.parentElement;
    if (!el || !root) return;
    const W = root.clientWidth;
    const H = root.clientHeight;
    const bw = el.offsetWidth;
    const bh = el.offsetHeight;
    const cx = rect.x + rect.w / 2;
    const left = Math.max(8, Math.min(W - bw - 8, cx - bw / 2));
    const below = rect.y + rect.h + 12;
    const above = below + bh > H - 8;
    setPos({ left, top: above ? Math.max(8, rect.y - bh - 12) : below, above, arrow: Math.max(14, Math.min(bw - 14, cx - left)) });
  }, [rect.x, rect.y, rect.w, rect.h, children]);
  return (
    <div ref={ref} className={`sim-bubble tone-${tone} ${pos.above ? 'is-above' : ''}`} style={{ left: pos.left, top: pos.top, '--arrow': `${pos.arrow ?? 20}px` }} role={tone === 'coach' ? 'note' : 'tooltip'}>
      <div className="sim-bubble-body">{children}</div>
      {onClose && <button type="button" className="sim-bubble-close" onClick={onClose} aria-label="Close"><X size={14} /></button>}
    </div>
  );
}

// Finds the control for the current step and pulses it with a coach bubble.
function CoachLayer() {
  const { expect, coach, rootRef, t, explainMode } = useSim();
  const [rect, setRect] = useState(null);
  useEffect(() => {
    if (!expect) return undefined;
    let frame;
    let last = '';
    const measure = () => {
      const root = rootRef.current;
      const el = root?.querySelector(`[data-act~="${CSS.escape(expect)}"]`);
      if (el && el.offsetParent !== null) {
        const r = el.getBoundingClientRect();
        const o = root.getBoundingClientRect();
        const next = { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height };
        const key = `${Math.round(next.x)}|${Math.round(next.y)}|${Math.round(next.w)}|${Math.round(next.h)}`;
        if (key !== last) { last = key; setRect(next); }
      } else if (last !== 'none') {
        last = 'none';
        setRect(null);
      }
      frame = window.setTimeout(measure, 220);
    };
    measure();
    return () => window.clearTimeout(frame);
  }, [expect, rootRef]);
  if (!expect || explainMode) return null;
  if (!rect) {
    return coach ? (
      <div className="sim-coach-float" role="note">
        <span className="sim-bubble-kicker">{t('Next step', 'পরের ধাপ', 'अगला कदम', 'Bước tiếp theo')}</span>
        <span>{coach}</span>
      </div>
    ) : null;
  }
  return (
    <>
      <span className="sim-coach-ring" style={{ left: rect.x - 6, top: rect.y - 6, width: rect.w + 12, height: rect.h + 12 }} aria-hidden="true" />
      {coach && (
        <Bubble rect={rect} tone="coach">
          <span className="sim-bubble-kicker">{t('Tap here', 'এখানে চাপুন', 'यहां टैप करें', 'Chạm vào đây')}</span>
          <span>{coach}</span>
        </Bubble>
      )}
    </>
  );
}

/**
 * Anything tappable in a simulator.
 *   act      — the action this reports (matches a scenario step's expectedAction)
 *   explain  — [en, bn, hi, vi] shown in "What's this?" mode
 *   onHold   — fires on press-and-hold (500 ms) instead of tap
 */
export function Tap({ as: Tag = 'button', act, explain, onClick, onHold, className = '', children, disabled, style, label, ...rest }) {
  const { emit, explainMode, showExplain, showToast, t } = useSim();
  const holdTimer = useRef(null);
  const report = () => { if (act) act.split(' ').forEach((a) => emit(a)); };
  const held = useRef(false);

  const explainNow = (e) => {
    if (!explainMode || !explain) return false;
    e.preventDefault();
    e.stopPropagation();
    showExplain(t(...explain), e.currentTarget);
    return true;
  };
  const handleClick = (e) => {
    if (explainNow(e)) return;
    if (disabled) return;
    if (held.current) { held.current = false; return; }
    if (onHold && !onClick) { showToast(t('Press and hold this one', 'এটা চেপে ধরে রাখুন', 'इसे दबाकर रखें', 'Nút này cần nhấn và giữ')); return; }
    onClick?.(e);
    report();
  };
  const holdProps = onHold ? {
    onPointerDown: () => {
      if (explainMode || disabled) return;
      held.current = false;
      holdTimer.current = setTimeout(() => { held.current = true; onHold(); report(); }, 500);
    },
    onPointerUp: () => clearTimeout(holdTimer.current),
    onPointerLeave: () => clearTimeout(holdTimer.current),
    onContextMenu: (e) => e.preventDefault(),
  } : {};

  const tagProps = Tag === 'button' ? { type: 'button', disabled: disabled && !explainMode } : { role: 'button', tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(e); } } };
  return (
    <Tag
      className={`sim-tap ${className}`}
      data-act={act || undefined}
      data-hold={onHold ? '' : undefined}
      data-explain={explain ? '' : undefined}
      aria-label={label}
      style={style}
      onClick={handleClick}
      {...holdProps}
      {...tagProps}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * [open, setOpen] that also opens by itself when the current guided step
 * expects one of `actions` (e.g. a scam call arriving). Each request opens
 * it once; closing it stays closed.
 */
export function useAutoOpen(actions) {
  const { expect } = useSim();
  const [open, setOpen] = useState(false);
  const [handled, setHandled] = useState(null);
  if (expect && actions.includes(expect) && handled !== expect) {
    setHandled(expect);
    setOpen(true);
  }
  return [open, setOpen];
}

/** Screens with a working back button: { screen, params, push, back, reset, dir }. */
export function useStack(initial, initialParams = {}) {
  const [stack, setStack] = useState([{ name: initial, params: initialParams }]);
  const [dir, setDir] = useState('none');
  const top = stack[stack.length - 1];
  const push = useCallback((name, params = {}) => { setDir('forward'); setStack((s) => [...s, { name, params }]); }, []);
  const back = useCallback(() => { setDir('back'); setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)); }, []);
  const reset = useCallback((name, params = {}) => { setDir('back'); setStack([{ name, params }]); }, []);
  const replace = useCallback((name, params = {}) => { setDir('forward'); setStack((s) => [...s.slice(0, -1), { name, params }]); }, []);
  return { screen: top.name, params: top.params, depth: stack.length, push, back, reset, replace, dir, key: `${stack.length}-${top.name}` };
}

/** Wraps one screen with the slide-in animation for its direction. */
export function Screen({ nav, children, className = '', style }) {
  return <div key={nav.key} className={`sim-screen dir-${nav.dir} ${className}`} style={style}>{children}</div>;
}

export function StatusBar({ dark = false, bg }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30_000); return () => clearInterval(id); }, []);
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return (
    <div className={`sim-status ${dark ? 'is-dark' : ''}`} style={bg ? { background: bg } : undefined} aria-hidden="true">
      <span>{time}</span>
      <span className="sim-status-icons"><Signal size={14} /><Wifi size={14} /><BatteryFull size={16} /></span>
    </div>
  );
}

/** A top app bar with an optional back arrow. */
export function AppBar({ title, subtitle, onBack, bg, fg = '#fff', actions, children, backExplain, leading }) {
  const { t } = useSim();
  return (
    <div className="sim-appbar" style={{ background: bg, color: fg }}>
      {onBack && (
        <Tap className="sim-icon-btn" act="go_back" onClick={onBack} label={t('Back', 'পেছনে', 'पीछे', 'Quay lại')} explain={backExplain || T('Back: returns to the previous screen.', 'পেছনে: আগের স্ক্রিনে ফিরে যায়।', 'पीछे: पिछली स्क्रीन पर लौटता है।', 'Quay lại: trở về màn hình trước.')}>
          <ArrowLeft size={22} />
        </Tap>
      )}
      {leading}
      {children || (
        <div className="sim-appbar-title">
          <span>{title}</span>
          {subtitle && <small>{subtitle}</small>}
        </div>
      )}
      {actions && <div className="sim-appbar-actions">{actions}</div>}
    </div>
  );
}

/** A bottom sheet inside the phone. */
export function Sheet({ open, onClose, title, children }) {
  const { t } = useSim();
  if (!open) return null;
  return (
    <div className="sim-sheet-wrap">
      <Tap as="div" className="sim-sheet-scrim" onClick={onClose} label={t('Close', 'বন্ধ', 'बंद करें', 'Đóng')} />
      <div className="sim-sheet" role="dialog" aria-label={title}>
        <span className="sim-sheet-handle" aria-hidden="true" />
        {title && <p className="sim-sheet-title">{title}</p>}
        {children}
      </div>
    </div>
  );
}

/**
 * Practice PIN pad. Any digits work; a permanent line reminds people this
 * is pretend and never to type a real PIN anywhere but the real app.
 */
export function PinPad({ length = 5, color = '#E2136E', onDone, title, act = 'enter_pin' }) {
  const { t, emit } = useSim();
  const [pin, setPin] = useState('');
  const add = (d) => {
    if (pin.length >= length) return;
    const next = pin + d;
    setPin(next);
    if (next.length === length) setTimeout(() => { emit(act); onDone?.(next); }, 180);
  };
  return (
    <div className="sim-pin" style={{ '--pin': color }}>
      <p className="sim-pin-title"><Lock size={16} aria-hidden="true" /> {title || t('Enter your PIN', 'আপনার পিন দিন', 'अपना पिन डालें', 'Nhập mã PIN')}</p>
      <div className="sim-pin-dots" data-act={act} aria-label={`${pin.length} / ${length}`}>
        {Array.from({ length }, (_, i) => <i key={i} className={i < pin.length ? 'is-on' : ''} />)}
      </div>
      <p className="sim-pin-note">{t('Practice PIN — type any digits. Never type your real PIN anywhere except the real app.', 'অনুশীলনের পিন — যেকোনো সংখ্যা দিন। আসল পিন শুধু আসল অ্যাপেই দেবেন, আর কোথাও নয়।', 'अभ्यास पिन — कोई भी अंक डालें। असली पिन सिर्फ़ असली ऐप में ही डालें, और कहीं नहीं।', 'PIN luyện tập — gõ số bất kỳ. Chỉ nhập PIN thật trong ứng dụng thật, không ở đâu khác.')}</p>
      <div className="sim-pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k) => (k === '' ? <span key="blank" /> : (
          <button key={k} type="button" className="sim-pin-key" onClick={() => (k === 'del' ? setPin((p) => p.slice(0, -1)) : add(k))} aria-label={k === 'del' ? t('Delete', 'মুছুন', 'मिटाएं', 'Xóa') : k}>
            {k === 'del' ? <Delete size={20} /> : k}
          </button>
        )))}
      </div>
    </div>
  );
}

/** A big "hold to confirm" button, like bKash and Nagad use. */
export function HoldToConfirm({ label, color = '#E2136E', onConfirm, act = 'hold_confirm', explain }) {
  const { t, emit, explainMode, showExplain } = useSim();
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const start = (e) => {
    if (explainMode && explain) { showExplain(t(...explain), e.currentTarget); return; }
    const begun = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - begun) / 1100);
      setProgress(p);
      if (p >= 1) { clearInterval(timer.current); emit(act); onConfirm?.(); }
    }, 30);
  };
  const stop = () => { clearInterval(timer.current); setProgress((p) => (p >= 1 ? p : 0)); };
  useEffect(() => () => clearInterval(timer.current), []);
  return (
    <button type="button" className="sim-hold" style={{ '--c': color, '--p': progress }} data-act={act} data-explain={explain ? '' : undefined}
      onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === 'Enter' && !e.repeat) { emit(act); onConfirm?.(); } }}>
      <span className="sim-hold-fill" aria-hidden="true" />
      <span className="sim-hold-label">{label}</span>
      <small>{progress > 0 && progress < 1 ? t('Keep holding…', 'চেপে ধরে রাখুন…', 'दबाए रखें…', 'Giữ tiếp…') : t('Press and hold', 'চেপে ধরে রাখুন', 'दबाकर रखें', 'Nhấn và giữ')}</small>
    </button>
  );
}

/** Pretend money, formatted for the app's country. */
export function money(amount, currency = 'BDT', language = 'en') {
  const locale = { bn: 'bn-BD', hi: 'hi-IN', vi: 'vi-VN', en: 'en-IN' }[language] || 'en-IN';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: currency === 'VND' ? 0 : 2 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

// Photos inside the practice apps: a soft gradient with a thin line icon,
// the way real apps show a picture while it loads. No emoji or cartoons.
const PHOTO_KINDS = {
  garden: [Trees, 'linear-gradient(160deg,#9cc5a1,#4f7d5c)'],
  sunrise: [Sunrise, 'linear-gradient(160deg,#f3c9a0,#c7795a)'],
  cake: [Cake, 'linear-gradient(160deg,#e9b8b0,#a8645e)'],
  family: [Users, 'linear-gradient(160deg,#b9c4dc,#6a7aa0)'],
  food: [UtensilsCrossed, 'linear-gradient(160deg,#e3c99a,#a47c45)'],
  market: [Store, 'linear-gradient(160deg,#a9cfd6,#4f8792)'],
  school: [School, 'linear-gradient(160deg,#c6c0e0,#7a6fa8)'],
  gift: [Gift, 'linear-gradient(160deg,#ecd27e,#b58a2d)'],
  phone: [Smartphone, 'linear-gradient(160deg,#cfd4da,#7d8792)'],
  night: [Moon, 'linear-gradient(160deg,#7c86a8,#2f3654)'],
  flowers: [Leaf, 'linear-gradient(160deg,#d8b9cc,#9a6a86)'],
  hotel: [Hotel, 'linear-gradient(160deg,#b8c7d9,#5d7493)'],
  building: [Building2, 'linear-gradient(160deg,#c9c3b6,#7f7663)'],
  palace: [Castle, 'linear-gradient(160deg,#d6c9a8,#8f7f55)'],
  glasses: [Glasses, '#f3f3f3'],
  kettle: [CookingPot, '#f3f3f3'],
  device: [Smartphone, '#f3f3f3'],
  photo: [ImageIcon, 'linear-gradient(160deg,#c8ccd2,#868d97)'],
};

export function Photo({ kind = 'photo', className = '', style, size = 34, label }) {
  const [Icon, bg] = PHOTO_KINDS[kind] || PHOTO_KINDS.photo;
  const light = bg.startsWith('#');
  return (
    <span className={`sim-photo ${className}`} style={{ background: bg, color: light ? '#565959' : 'rgb(255 255 255 / 0.85)', ...style }} role="img" aria-label={label || kind}>
      <Icon size={size} strokeWidth={1.4} aria-hidden="true" />
    </span>
  );
}

// Facebook-style reaction badges drawn as round icons.
const REACTION_STYLE = {
  like: [ThumbsUp, '#1877f2'], love: [Heart, '#f33e58'], care: [HeartHandshake, '#f7b125'],
  haha: [Laugh, '#f7b125'], wow: [Sparkles, '#f7b125'], sad: [Frown, '#f7b125'], angry: [Angry, '#e9710f'],
};

export function Reaction({ kind = 'like', size = 18 }) {
  const [Icon, color] = REACTION_STYLE[kind] || REACTION_STYLE.like;
  return (
    <span className="sim-reaction" style={{ width: size, height: size, background: color }} aria-hidden="true">
      <Icon size={Math.round(size * 0.6)} strokeWidth={2.4} fill={kind === 'like' || kind === 'love' ? '#fff' : 'none'} color="#fff" />
    </span>
  );
}
