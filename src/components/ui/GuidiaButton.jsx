// Thin, typed wrapper around the existing .btn CSS classes — gives new code
// a component to import instead of hand-assembling className strings, while
// keeping the same visual system (no new styles introduced here).
const VARIANT_CLASS = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
  success: 'btn-success',
  warn: 'btn-warn',
  teal: 'btn-teal',
};

export default function GuidiaButton({ variant = 'primary', size, full, icon, children, className = '', ...rest }) {
  const classes = [
    'btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.primary,
    size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '',
    full ? 'btn-full' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...rest}>
      {icon}
      {children}
    </button>
  );
}
