// Reusable loading indicator — replaces the ad hoc
// `<div className="flex items-center justify-center" style={{padding:60}}><div className="spinner"/></div>`
// that was previously copy-pasted across GuardianDashboard, MemoryBook, and
// ProgressDashboard.
export default function GuidiaLoadingState({ label, padding = 60 }) {
  return (
    <div className="flex-col items-center justify-center gap-12" style={{ padding, textAlign: 'center' }}>
      <div className="spinner" />
      {label && <p className="t-sub">{label}</p>}
    </div>
  );
}
