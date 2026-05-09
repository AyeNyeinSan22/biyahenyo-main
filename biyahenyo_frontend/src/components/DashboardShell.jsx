import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function DashboardShell({ eyebrow, title, metrics, notices }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="app-frame dashboard-scene">
      <section className="phone-shell dashboard-card">
        <div className="dashboard-header">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="dashboard-user">{user?.fullName}</p>
          </div>
          <button type="button" className="secondary-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <p>{metric.label}</p>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <section className="notice-panel">
          <h2>Route Insights</h2>
          {notices.map((notice) => (
            <article key={notice.title} className="notice-item">
              <strong>{notice.title}</strong>
              <p>{notice.body}</p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
