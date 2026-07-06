/**
 * Consistent error display with optional retry.
 *
 * Props:
 *   message  — error description
 *   onRetry  — callback when user clicks "Try Again" (optional)
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <div className="simple-state error" role="alert">
      <div className="error-icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      </div>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
