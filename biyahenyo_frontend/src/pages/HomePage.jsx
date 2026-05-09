import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../auth/AuthContext";
import { getHomeDashboard } from "../api/transport";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getHomeDashboard(user?.email)
      .then((response) => {
        if (active) {
          setDashboard(response);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user?.email]);

  const handlePlanTrip = () => {
    navigate(
      `/route-planner?from=${encodeURIComponent(origin)}&to=${encodeURIComponent(destination)}&mode=JEEPNEY`
    );
  };

  if (loading) {
    return <main className="simple-state">Loading home dashboard...</main>;
  }

  if (error) {
    return (
      <main className="simple-state error">
        <p>{error}</p>
        <button type="button" className="primary-btn" onClick={() => {
          user ? navigate('/login', { replace: true }) : navigate('/login');
          localStorage.removeItem('biyahenyo.auth');
          sessionStorage.removeItem('biyahenyo.auth');
          window.location.reload();
        }} style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1rem' }}>
          Logout & Try Again
        </button>
      </main>
    );
  }

  return (
    <div className="app-container">
      <header className="sticky-header">
        <div className="status-bar" style={{ padding: "0 0 12px 0" }}>
          <span>03:16</span>
          <div className="status-icons">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="row-between">
          <div className="brand-lockup">
            <div className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L5 19L7 17ZM17 17L19 19L17 17ZM5 7L7 5L5 7ZM19 7L17 5L19 7Z"/><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/></svg>
            </div>
            <strong style={{ fontSize: "1.2rem" }}>{dashboard.appName}</strong>
          </div>
          <div className="home-actions">
            <button type="button" className="circle-action" aria-label="Notifications" style={{ width: 40, height: 40 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </button>
            <button
              type="button"
              className="circle-action"
              aria-label="Search routes"
              onClick={() => navigate("/route-planner")}
              style={{ width: 40, height: 40 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="scrollable-content">
        <section className="hero-copy" style={{ marginTop: "24px" }}>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: "2.8rem", fontWeight: 800 }}>
            Plan. Ride.<br/><span>Arrive.</span>
          </h1>
          <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>{dashboard.subheadline}</p>
        </section>

        <section className="premium-card" style={{ marginTop: "32px" }}>
          <div className="trip-line">
            <div style={{ color: "var(--primary-dark)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: 0 }}>{dashboard.fromLabel}</p>
              <input 
                value={origin} 
                onChange={(event) => setOrigin(event.target.value)}
                placeholder="Enter starting point"
                style={{ 
                  width: "100%", 
                  border: "none", 
                  background: "none", 
                  fontSize: "1.1rem", 
                  fontWeight: 700, 
                  padding: "4px 0",
                  outline: "none",
                  color: "var(--text-main)"
                }} 
              />
            </div>
          </div>
          
          <div style={{ height: "24px", borderLeft: "2px dashed var(--border-medium)", margin: "4px 0 4px 9px" }}></div>
          
          <div className="trip-line">
            <div style={{ color: "var(--accent)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4M12 16V9"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", margin: 0 }}>Destination</p>
              <input 
                value={destination} 
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Enter destination"
                style={{ 
                  width: "100%", 
                  border: "none", 
                  background: "none", 
                  fontSize: "1.1rem", 
                  fontWeight: 700, 
                  padding: "4px 0",
                  outline: "none",
                  color: "var(--text-main)"
                }} 
              />
            </div>
          </div>
          
          <button 
            type="button" 
            className="primary-btn pulse-animation" 
            onClick={handlePlanTrip}
            style={{ width: "100%", marginTop: "24px", background: "var(--primary)", color: "var(--text-on-primary)", height: "60px", fontSize: "1.1rem" }}
          >
            Plan My Trip
          </button>
        </section>

        <section style={{ padding: "0 20px" }}>
          <div className="row-between" style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Traffic Report</h2>
            <button onClick={() => navigate("/reports")} style={{ color: "var(--primary-dark)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              View All <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          <div className="premium-card" style={{ margin: 0, padding: "20px" }}>
            <div className="traffic-chart-card" style={{ background: "none", padding: 0 }}>
              <div className="traffic-bars" style={{ gap: "12px" }}>
                {dashboard.trafficBars.map((item) => (
                  <div key={item.label} className="traffic-bar-group">
                    <strong style={{ fontSize: "0.9rem" }}>{item.level}%</strong>
                    <div className="traffic-bar-rail" style={{ background: "var(--border-light)", borderRadius: "10px" }}>
                      <div className="traffic-bar-fill" style={{ height: `${item.level}%`, background: item.color, borderRadius: "10px" }} />
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "24px 20px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "16px" }}>Recent Trip</h2>
          {(() => {
            const savedTrips = JSON.parse(localStorage.getItem("biyahenyo_recent_trips") || "[]");
            const recent = savedTrips[0] || (dashboard?.recentTrip ? {
              route: dashboard.recentTrip.route,
              origin: "Camella",
              destination: "BSU Alangilan",
              fare: dashboard.recentTrip.fare,
              distance: dashboard.recentTrip.distance,
              duration: dashboard.recentTrip.duration,
              mode: "TRICYCLE"
            } : null);

            if (!recent) return <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No recent trips yet.</p>;

            return (
              <button
                type="button"
                className="premium-card"
                style={{ margin: 0, width: "100%", display: "flex", alignItems: "center", gap: "16px", textAlign: "left" }}
                onClick={() =>
                  navigate(
                    `/route-planner?from=${encodeURIComponent(recent.origin)}&to=${encodeURIComponent(recent.destination)}&mode=${recent.mode || "JEEPNEY"}`
                  )
                }
              >
                <div style={{ width: 48, height: 48, borderRadius: "14px", background: "var(--primary-light)", display: "grid", placeItems: "center", color: "var(--primary-dark)" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ display: "block", fontSize: "1.1rem" }}>{recent.route || recent.title}</strong>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {recent.fare} • {recent.distance} • {recent.duration}
                  </p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--border-medium)" }}><path d="m9 18 6-6-6-6"/></svg>
              </button>
            );
          })()}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

