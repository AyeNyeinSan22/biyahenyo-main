import { Link } from "react-router-dom";

export default function AuthShell({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkLabel,
}) {
  return (
    <div className="app-container">
      <header className="sticky-header" style={{ background: "transparent", border: "none" }}>
        <div className="status-bar" style={{ padding: "0" }}>
          <span>03:16</span>
          <div className="status-icons">
            <span />
            <span />
            <span />
          </div>
        </div>
      </header>

      <main className="scrollable-content" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
        <div className="auth-copy" style={{ marginTop: "20px", marginBottom: "20px" }}>
          <h1 className="text-gradient" style={{ fontSize: "2.2rem", fontWeight: 800, margin: 0 }}>{title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "8px" }}>{subtitle}</p>
        </div>

        {children}

        <div className="auth-divider" style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
          <span style={{ flex: 1, height: "1px", background: "var(--border-medium)" }} />
          <p style={{ margin: 0, color: "var(--text-muted)", fontWeight: 600, fontSize: "0.9rem" }}>Or continue with</p>
          <span style={{ flex: 1, height: "1px", background: "var(--border-medium)" }} />
        </div>

        <div className="social-row" style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <button type="button" className="premium-card" style={{ margin: 0, padding: "12px 24px", flex: 1, display: "grid", placeItems: "center" }} aria-label="Continue with Google">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.9 3.16-1.94 4.2-1.04 1.04-2.6 2.12-5.9 2.12-5.3 0-9.6-4.3-9.6-9.6s4.3-9.6 9.6-9.6c2.88 0 5.12 1.12 6.8 2.76l2.32-2.32C19.12 1.28 16.12 0 12.48 0 5.58 0 0 5.58 0 12.48s5.58 12.48 12.48 12.48c3.7 0 6.48-1.24 8.68-3.52 2.26-2.26 2.98-5.46 2.98-8.12 0-.68-.06-1.32-.18-1.92h-11.48z"/></svg>
          </button>
          <button type="button" className="premium-card" style={{ margin: 0, padding: "12px 24px", flex: 1, display: "grid", placeItems: "center" }} aria-label="Continue with Apple">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.03 2.02-3.39 2.02-1.31 0-1.74-.81-3.26-.81-1.55 0-2.01.78-3.26.81-1.31.03-2.52-1.23-3.48-2.02C1.72 18.29 0 15.01 0 11.83c0-3.15 2.02-4.81 3.96-4.81 1.01 0 1.95.7 2.58.7.63 0 1.74-.7 2.87-.7 1.17 0 3.03.42 4.19 2.13-2.92 1.59-2.45 5.8 1.08 7.32-1.12 2.75-2.67 3.82-3.63 4.81zM11.91 3.51c0-2.14 1.78-3.51 3.48-3.51.05 2.14-1.84 3.7-3.48 3.51z"/></svg>
          </button>
        </div>

        <p className="auth-footer" style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {footerText} <Link to={footerLink} style={{ color: "var(--primary-dark)", fontWeight: 700, textDecoration: "none" }}>{footerLinkLabel}</Link>
        </p>
      </main>
    </div>
  );
}

