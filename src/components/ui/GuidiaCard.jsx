// Thin wrapper around the existing .card class, for the same reason as
// GuidiaButton — a proper component for new code rather than raw className.
export default function GuidiaCard({ as: Tag = 'div', interactive, style, className = '', children, ...rest }) {
  const classes = ['card', interactive ? 'card-btn' : '', className].filter(Boolean).join(' ');
  return (
    <Tag className={classes} style={style} {...rest}>
      {children}
    </Tag>
  );
}
