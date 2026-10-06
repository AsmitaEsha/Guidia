// Guidia UI primitives. Every page composes these instead of hand-rolling
// markup, so behaviour (focus, states, accessibility, language) is the
// same everywhere. Styles live in src/styles/components.css.
import { Children, forwardRef, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  AlertCircle, AlertTriangle, ArrowRight, Check, CheckCircle2, Info, Loader2, OctagonAlert,
  RefreshCw, ShieldAlert, ShieldCheck, ShieldQuestion, Sparkles, X,
} from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useFocusTrap, useScrollLock } from '../../hooks/useFocusTrap';
import { announce } from '../../utils/announce';

export const cx = (...parts) => parts.filter(Boolean).join(' ');

// ── Button ────────────────────────────────────────────────────────────────
// variant: primary | secondary | tonal | quiet | ghost | link | help | danger | danger-quiet
// state:   idle | loading | success | error   (from useAsyncAction)
export const Button = forwardRef(function Button({
  variant = 'primary', size, block, icon: Icon, iconRight: IconRight, arrow,
  state = 'idle', loadingLabel, successLabel, children, className, to, href,
  type = 'button', disabled, ...rest
}, ref) {
  const { t } = usePreferences();
  const prev = useRef(state);
  useEffect(() => {
    if (prev.current !== state && state === 'success') announce(successLabel || t('Done', 'হয়ে গেছে', 'हो गया', 'Xong'));
    prev.current = state;
  }, [state, successLabel, t]);

  const cls = cx('btn', `btn-${variant}`, size && `btn-${size}`, block && 'btn-block', className);
  let content;
  if (state === 'loading') {
    content = <span className="btn-status"><Loader2 className="spin" aria-hidden="true" /><span>{loadingLabel || t('Please wait…', 'একটু অপেক্ষা করুন…', 'कृपया रुकें…', 'Vui lòng chờ…')}</span></span>;
  } else if (state === 'success') {
    content = <span className="btn-status pop"><Check aria-hidden="true" /><span>{successLabel || t('Done', 'হয়ে গেছে', 'हो गया', 'Xong')}</span></span>;
  } else {
    content = (
      <>
        {Icon && <Icon aria-hidden="true" />}
        {children}
        {IconRight && <IconRight aria-hidden="true" />}
        {arrow && <ArrowRight className="btn-arrow" aria-hidden="true" />}
      </>
    );
  }
  const common = { className: cls, 'data-state': state !== 'idle' ? state : undefined, 'aria-busy': state === 'loading' || undefined, ...rest };
  if (to) return <Link ref={ref} to={to} {...common}>{content}</Link>;
  if (href) return <a ref={ref} href={href} {...common}>{content}</a>;
  return <button ref={ref} type={type} disabled={disabled || state === 'loading'} {...common}>{content}</button>;
});

export const IconButton = forwardRef(function IconButton({ icon: Icon, label, variant = 'ghost', size, round, className, to, ...rest }, ref) {
  const cls = cx('btn', `btn-${variant}`, 'btn-icon', size && `btn-${size}`, round && 'btn-round', className);
  if (to) return <Link ref={ref} to={to} className={cls} aria-label={label} title={label} {...rest}><Icon aria-hidden="true" /></Link>;
  return <button ref={ref} type="button" className={cls} aria-label={label} title={label} {...rest}><Icon aria-hidden="true" /></button>;
});

// ── Surfaces ──────────────────────────────────────────────────────────────
export function Card({ as: Tag = 'div', tone, raised, flat, pad, className, children, ...rest }) {
  return <Tag className={cx('card', tone && `card-${tone}`, raised && 'card-raised', flat && 'card-flat', pad === 'lg' && 'card-pad-lg', pad === 0 && 'card-pad-0', className)} {...rest}>{children}</Tag>;
}

export function IconChip({ icon: Icon, tone, size }) {
  return <span className={cx('icon-chip', tone && `tone-${tone}`, size && `icon-chip-${size}`)} aria-hidden="true"><Icon /></span>;
}

export function PageHeader({ eyebrow, title, description, actions, id }) {
  return (
    <header className="page-header rise">
      <div className="page-header-text">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="h-page" id={id}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}

export function SectionHeader({ title, description, action, id, as: Tag = 'h2', eyebrow }) {
  return (
    <div className="section-header">
      <div className="section-header-text">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Tag className="h-section" id={id}>{title}</Tag>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Alerts ────────────────────────────────────────────────────────────────
const ALERT_ICON = { info: Info, ok: CheckCircle2, warn: AlertTriangle, risk: ShieldAlert, danger: OctagonAlert, brand: Sparkles };

export function Alert({ tone = 'info', title, children, icon, actions, role, className }) {
  const Icon = icon || ALERT_ICON[tone] || Info;
  return (
    <div className={cx('alert', `alert-${tone}`, className)} role={role || (tone === 'danger' || tone === 'risk' ? 'alert' : undefined)}>
      <Icon aria-hidden="true" />
      <div className="alert-body">
        {title && <p className="alert-title">{title}</p>}
        {children && <div>{children}</div>}
        {actions && <div className="alert-actions">{actions}</div>}
      </div>
    </div>
  );
}

// ── States ────────────────────────────────────────────────────────────────
export function LoadingState({ label, compact }) {
  const { t } = usePreferences();
  return (
    <div className={cx('state', compact && 'state-compact')} role="status" aria-live="polite">
      <Loader2 size={36} className="spin" aria-hidden="true" style={{ color: 'var(--primary)' }} />
      <p>{label || t('Loading…', 'লোড হচ্ছে…', 'लोड हो रहा है…', 'Đang tải…')}</p>
    </div>
  );
}

export function EmptyState({ icon: Icon = Info, title, children, action, tone, compact, card }) {
  return (
    <div className={cx('state', compact && 'state-compact', card && 'state-card')}>
      <span className={cx('state-icon', tone && `tone-${tone}`)} aria-hidden="true"><Icon /></span>
      {title && <p className="state-title">{title}</p>}
      {children && <p>{children}</p>}
      {action && <div className="state-actions">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, message, onRetry, retryLabel, secondary, compact, card }) {
  const { t } = usePreferences();
  return (
    <div className={cx('state', compact && 'state-compact', card && 'state-card')} role="alert">
      <span className="state-icon tone-warn" aria-hidden="true"><AlertTriangle /></span>
      <p className="state-title">{title || t("That didn't work yet", 'এটা এখনো কাজ করেনি', 'यह अभी काम नहीं किया', 'Việc này chưa thành công')}</p>
      {message && <p>{message}</p>}
      <div className="state-actions">
        {onRetry && <Button variant="secondary" icon={RefreshCw} onClick={onRetry}>{retryLabel || t('Try again', 'আবার চেষ্টা করুন', 'फिर कोशिश करें', 'Thử lại')}</Button>}
        {secondary}
      </div>
    </div>
  );
}

export function SuccessState({ title, children, action, icon: Icon }) {
  return (
    <div className="state" role="status">
      <span className="state-icon tone-ok pop" aria-hidden="true">
        {Icon ? <Icon /> : (
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="tick-draw" style={{ '--len': 24 }}>
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
      {title && <p className="state-title">{title}</p>}
      {children && <div>{children}</div>}
      {action && <div className="state-actions">{action}</div>}
    </div>
  );
}

export function Skeleton({ variant = 'line', width, height, count = 1, style }) {
  return Array.from({ length: count }, (_, i) => (
    <span key={i} aria-hidden="true" className={cx('skeleton', `skeleton-${variant}`)} style={{ display: 'block', width, height, ...style }} />
  ));
}

// ── Risk ──────────────────────────────────────────────────────────────────
// Risk is shown with an icon, words and colour together — never colour alone.
const RISK = {
  SAFE: { tone: 'ok', Icon: ShieldCheck, label: ['Looks safe', 'নিরাপদ মনে হচ্ছে', 'सुरक्षित लगता है', 'Có vẻ an toàn'] },
  WARNING: { tone: 'warn', Icon: AlertTriangle, label: ['Be careful', 'সাবধান থাকুন', 'सावधान रहें', 'Hãy cẩn thận'] },
  HIGH_RISK: { tone: 'risk', Icon: ShieldAlert, label: ['High risk', 'উচ্চ ঝুঁকি', 'ज़्यादा खतरा', 'Rủi ro cao'] },
  CRITICAL: { tone: 'danger', Icon: OctagonAlert, label: ['Stop — very risky', 'থামুন — খুব ঝুঁকিপূর্ণ', 'रुकें — बहुत खतरनाक', 'Dừng lại — rất nguy hiểm'] },
  UNKNOWN: { tone: 'unknown', Icon: ShieldQuestion, label: ['Not sure — check carefully', 'নিশ্চিত নয় — ভালো করে যাচাই করুন', 'पक्का नहीं — ध्यान से जांचें', 'Chưa chắc — hãy kiểm tra kỹ'] },
};

export function riskMeta(severity) {
  return RISK[severity] || RISK.UNKNOWN;
}

export function RiskBadge({ severity, t, size }) {
  const { tone, Icon, label } = riskMeta(severity);
  return <span className={cx('badge', `badge-${tone}`, size === 'lg' && 'badge-lg')}><Icon aria-hidden="true" /> {t(...label)}</span>;
}

export function Badge({ tone, icon: Icon, children, size }) {
  return <span className={cx('badge', tone && `badge-${tone}`, size === 'lg' && 'badge-lg')}>{Icon && <Icon aria-hidden="true" />}{children}</span>;
}

export function ModeLabel({ kind = 'practice', children, icon: Icon = ShieldCheck }) {
  return <span className={cx('mode-label', kind === 'demo' && 'is-demo')}><Icon size={16} aria-hidden="true" />{children}</span>;
}

// ── Forms ─────────────────────────────────────────────────────────────────
export function Field({ label, hint, error, success, optional, children, id: idProp, labelHidden }) {
  const auto = useId();
  const id = idProp || `f${auto.replace(/:/g, '')}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined;
  const control = { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined };
  return (
    <div className="field">
      <label htmlFor={id} className={cx('label', labelHidden && 'sr-only')}>
        {label}{optional && <span className="label-optional"> · {optional}</span>}
      </label>
      {hint && <p id={hintId} className="hint">{hint}</p>}
      {typeof children === 'function' ? children(control) : children}
      {error && <p id={errId} className="field-error" role="alert"><AlertCircle aria-hidden="true" />{error}</p>}
      {success && !error && <p className="field-ok"><CheckCircle2 aria-hidden="true" />{success}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, id, labelledBy, disabled }) {
  return (
    <span className="switch">
      <input id={id} type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy} />
      <span className="switch-track" aria-hidden="true"><Check className="switch-on" /></span>
    </span>
  );
}

export function Checkbox({ checked, onChange, children, id, describedBy }) {
  return (
    <label className="check" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-describedby={describedBy} />
      <span className="check-box" aria-hidden="true"><Check strokeWidth={3} /></span>
      <span>{children}</span>
    </label>
  );
}

export function Segmented({ value, onChange, options, label, block, size }) {
  return (
    <div className={cx('segmented', block && 'segmented-block')} role="group" aria-label={label} data-size={size}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} lang={o.lang}>
          {o.icon && <o.icon size={18} aria-hidden="true" />} {o.label}
        </button>
      ))}
    </div>
  );
}

// Choice card with a radio dot (single-select) — language, comfort style,
// help reasons, lesson reflection.
export function ChoiceCard({ selected, onSelect, title, body, icon: Icon, children, lang, size, radio = true, className, role = 'radio' }) {
  return (
    <button type="button" role={role} aria-checked={selected} className={cx('choice', size === 'lg' && 'choice-lg', className)} onClick={onSelect} lang={lang}>
      {radio && <span className="choice-radio" aria-hidden="true" />}
      {Icon && <span className="icon-chip icon-chip-sm" aria-hidden="true"><Icon /></span>}
      <span className="stack" style={{ '--gap': '2px', textAlign: 'left', flex: 1 }}>
        <span className="h-card">{title}</span>
        {body && <span className="text-muted" style={{ fontWeight: 500 }}>{body}</span>}
        {children}
      </span>
      {!radio && <span className="choice-tick" aria-hidden="true"><Check strokeWidth={3} /></span>}
    </button>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  const refs = useRef([]);
  const onKey = (e, i) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (i + dir + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab, i) => (
        <button
          key={tab.id} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" className="tab"
          id={`tab-${tab.id}`} aria-selected={value === tab.id} aria-controls={`panel-${tab.id}`} tabIndex={value === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)} onKeyDown={(e) => onKey(e, i)}
        >
          {tab.icon && <tab.icon size={18} aria-hidden="true" />}{tab.label}
          {tab.count > 0 && <span className="count-badge" style={{ animation: 'none' }}>{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Progress ──────────────────────────────────────────────────────────────
export function ProgressBar({ value, label, tone, size }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div className={cx('meter', tone === 'warm' && 'meter-warm', size === 'sm' && 'meter-sm')} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 76, stroke = 8, label, tone, children }) {
  const v = Math.max(0, Math.min(100, Math.round(value || 0)));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <span className={cx('ring', tone === 'warm' && 'ring-warm')} style={{ width: size, height: size }} role="img" aria-label={label ? `${label}: ${v}%` : `${v}%`}>
      <svg width={size} height={size} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="ring-value" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} />
      </svg>
      <span className="ring-label" aria-hidden="true" style={{ fontSize: size * 0.24 }}>{children ?? `${v}%`}</span>
    </span>
  );
}

export function Stepper({ total, current, labels }) {
  return (
    <div>
      <ol className="stepper" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          return (
            <li key={i} className="stepper-item" data-state={state}>
              <span className="stepper-dot">{state === 'done' ? <Check strokeWidth={3} /> : i + 1}</span>
              {i < total - 1 && <span className="stepper-line" />}
            </li>
          );
        })}
      </ol>
      {labels && <div className="stepper-labels" aria-hidden="true">{labels.map((l) => <span key={l}>{l}</span>)}</div>}
    </div>
  );
}

export function StepDots({ total, current }) {
  return (
    <div className="steps-dots" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => <span key={i} data-done={i < current} data-current={i === current} />)}
    </div>
  );
}

export function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((item) => {
        const Icon = item.icon || Check;
        return (
          <li key={item.key || item.title} className="timeline-item" data-state={item.state}>
            <span className="timeline-dot" aria-hidden="true">{item.state === 'done' ? <Check strokeWidth={3} /> : <Icon />}</span>
            <div className="timeline-body">
              <p className="timeline-title">{item.title}{item.state === 'current' && <span className="sr-only"> (now)</span>}</p>
              {item.meta && <p className="text-subtle">{item.meta}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ── People ────────────────────────────────────────────────────────────────
export function initials(name = '?') {
  return name.replace(/\(.*?\)/g, '').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
}

export function Avatar({ name, size, tone }) {
  return <span className={cx('avatar', size && `avatar-${size}`, tone && `tone-${tone}`)} aria-hidden="true">{initials(name)}</span>;
}

// ── Overlays ──────────────────────────────────────────────────────────────
export function Dialog({ open, onClose, title, description, icon: Icon, iconTone, children, actions, size, closeLabel, dismissible = true }) {
  const ref = useRef(null);
  const titleId = useId();
  const descId = useId();
  const { t } = usePreferences();
  useFocusTrap(ref, open, dismissible ? onClose : undefined);
  useScrollLock(open);
  if (!open) return null;
  return createPortal(
    <div className="dialog-backdrop" onMouseDown={(e) => { if (dismissible && e.target === e.currentTarget) onClose?.(); }}>
      <div className={cx('dialog', size === 'lg' && 'dialog-lg')} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descId : undefined} ref={ref} tabIndex={-1}>
        <div className="dialog-head">
          {Icon && <span className={cx('icon-chip', iconTone && `tone-${iconTone}`)} aria-hidden="true"><Icon /></span>}
          <div className="stack" style={{ '--gap': '6px', flex: 1 }}>
            <h2 className="dialog-title" id={titleId}>{title}</h2>
            {description && <p className="text-muted" id={descId}>{description}</p>}
          </div>
          {dismissible && <IconButton icon={X} label={closeLabel || t('Close', 'বন্ধ করুন', 'बंद करें', 'Đóng')} className="dialog-close" onClick={onClose} />}
        </div>
        {children}
        {actions && <div className="dialog-actions">{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}

// Review → confirm → result, for anything consequential.
export function ConfirmDialog({ open, onClose, onConfirm, title, description, consequences, confirmLabel, cancelLabel, tone = 'danger', state, icon }) {
  const { t } = usePreferences();
  return (
    <Dialog
      open={open} onClose={onClose} title={title} description={description} icon={icon || AlertTriangle} iconTone={tone === 'danger' ? 'danger' : 'warn'}
      actions={(
        <>
          <Button variant="quiet" onClick={onClose} data-autofocus>{cancelLabel || t('Cancel', 'বাতিল', 'रद्द करें', 'Hủy')}</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} state={state}>{confirmLabel}</Button>
        </>
      )}
    >
      {consequences?.length > 0 && (
        <ul className="stack" style={{ '--gap': '8px', paddingLeft: '1.2em' }}>
          {consequences.map((c) => <li key={c}>{c}</li>)}
        </ul>
      )}
    </Dialog>
  );
}

export function Sheet({ open, onClose, title, children, label }) {
  const ref = useRef(null);
  const { t } = usePreferences();
  useFocusTrap(ref, open, onClose);
  useScrollLock(open);
  if (!open) return null;
  return createPortal(
    <>
      <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={label || title} ref={ref} tabIndex={-1}>
        <div className="sheet-handle" aria-hidden="true" />
        {title && (
          <div className="sheet-head">
            <h2 className="h-section">{title}</h2>
            <IconButton icon={X} label={t('Close', 'বন্ধ করুন', 'बंद करें', 'Đóng')} onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </>,
    document.body,
  );
}

// ── Misc ──────────────────────────────────────────────────────────────────
export function KeyValue({ items }) {
  return (
    <dl className="kv">
      {items.filter(Boolean).map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

export function Waveform() {
  return <span className="waveform-live" aria-hidden="true"><span /><span /><span /><span /></span>;
}

// Renders children separated by a middle dot (metadata lines).
export function Meta({ children }) {
  const parts = Children.toArray(children).filter(Boolean);
  return (
    <span className="row text-subtle" style={{ '--gap': '6px' }}>
      {parts.map((p, i) => <span key={i} className="row" style={{ '--gap': '6px' }}>{i > 0 && <span aria-hidden="true">·</span>}{p}</span>)}
    </span>
  );
}
