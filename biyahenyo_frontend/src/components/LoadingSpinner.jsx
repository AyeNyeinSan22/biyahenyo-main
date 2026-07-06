/**
 * Consistent loading indicator used across all pages.
 *
 * Props:
 *   size   — "sm" | "md" | "lg"  (default "md")
 *   label  — accessible text for screen readers
 */
export default function LoadingSpinner({ size = "md", label = "Loading…" }) {
  const cls = size === "sm" ? "spinner spinner--sm" : size === "lg" ? "spinner spinner--lg" : "spinner";

  return (
    <div className="simple-state" role="status" aria-live="polite">
      <div className={cls} />
      <span className="sr-only">{label}</span>
    </div>
  );
}
