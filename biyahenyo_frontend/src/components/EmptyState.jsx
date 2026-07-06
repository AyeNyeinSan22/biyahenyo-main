/**
 * Consistent empty-state display.
 *
 * Props:
 *   icon     — JSX icon element (optional, defaults to a document icon)
 *   title    — short heading
 *   message  — explanation text
 */
export default function EmptyState({ icon, title, message }) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-icon" aria-hidden="true">
        {icon || (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )}
      </div>
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
    </div>
  );
}
