// Reusable empty state — used wherever a list can legitimately be empty
// (no memories yet, no guardians yet, no notifications yet) instead of each
// screen hand-rolling its own centered-card-with-a-message markup.
export default function GuidiaEmptyState({ icon, title, description, action }) {
  return (
    <div className="card text-center" style={{ padding: 40 }}>
      {icon && <div style={{ marginBottom: 12 }}>{icon}</div>}
      {title && <p style={{ fontWeight: 700, fontSize: 17 }}>{title}</p>}
      {description && <p className="t-sub" style={{ marginTop: 6 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}
