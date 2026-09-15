import { AlertTriangle } from 'lucide-react';

// Reusable error state — a human-friendly message with an optional retry,
// never a raw exception/stack trace (matches the backend error handler's
// same rule: technical detail stays out of what the user sees).
export default function GuidiaErrorState({ message, onRetry, retryLabel = 'Try again' }) {
  return (
    <div className="error-state">
      <div className="error-icon">
        <AlertTriangle size={36} color="var(--warn)" />
      </div>
      <p style={{ fontWeight: 700, fontSize: 17 }}>{message || "Something didn't work yet. Let's try again."}</p>
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry}>{retryLabel}</button>
      )}
    </div>
  );
}
