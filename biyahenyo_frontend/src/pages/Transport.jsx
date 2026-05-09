import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getJeepneyRoutes, getTricycleRoutes } from "../services/transportService";
import { getTransportGuideKey, TRANSPORT_GUIDE_LOOKUP } from "../data/transportGuides";

export default function TransportPage() {
  const navigate = useNavigate();
  const [jeepneys, setJeepneys] = useState([]);
  const [tricycles, setTricycles] = useState([]);
  const [activeTab, setActiveTab] = useState("JEEPNEY");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedRoute, setExpandedRoute] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const j = await getJeepneyRoutes();
        const t = await getTricycleRoutes();
        setJeepneys(j);
        setTricycles(t);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const baseRoutes = activeTab === "JEEPNEY" ? jeepneys : tricycles;
  const enrichedRoutes = baseRoutes
    .map((route) => {
      const guide = TRANSPORT_GUIDE_LOOKUP[getTransportGuideKey(route.startLocation, route.endLocation)];
      return {
        ...route,
        landmark: guide?.landmark ?? route.landmark,
        routeSteps: guide?.routeSteps ?? route.routeSteps,
        stepByStepGuide: guide?.stepByStepGuide ?? [],
        routeKey: getTransportGuideKey(route.startLocation, route.endLocation),
      };
    })
    .sort((a, b) => a.startLocation.localeCompare(b.startLocation));

  const normalizedSearch = search.trim().toLowerCase();
  const currentRoutes = enrichedRoutes.filter((route) => {
    if (!normalizedSearch) {
      return true;
    }

    const haystack = [
      route.startLocation,
      route.endLocation,
      route.landmark,
      route.routeSteps,
      ...(route.stepByStepGuide || []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  useEffect(() => {
    if (!currentRoutes.length) {
      setExpandedRoute("");
      return;
    }

    if (!expandedRoute || !currentRoutes.some((route) => route.routeKey === expandedRoute)) {
      setExpandedRoute(currentRoutes[0].routeKey);
    }
  }, [currentRoutes, expandedRoute]);

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
          <button type="button" className="circle-action" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Transport Guide</h1>
          <button type="button" className="circle-action" aria-label="More">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </header>

      <main className="scrollable-content">
        <div style={{ padding: "20px" }}>
          <section
            className="premium-card"
            style={{
              margin: "0 0 20px 0",
              padding: "20px",
              background: "linear-gradient(145deg, rgba(255,204,0,0.18) 0%, rgba(255,255,255,0.96) 58%, rgba(255,250,224,0.98) 100%)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "start", marginBottom: "14px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: 700 }}>
                  Transport Directory
                </p>
                <h2 style={{ margin: "6px 0 0", fontSize: "1.25rem", fontWeight: 800 }}>
                  Batangas City Route Guide
                </h2>
              </div>
              <div style={{ padding: "10px 12px", borderRadius: "14px", background: "rgba(255,255,255,0.92)", border: "1px solid var(--border-light)", textAlign: "right", minWidth: "92px" }}>
                <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                  Showing
                </p>
                <strong style={{ fontSize: "1.15rem" }}>{currentRoutes.length}</strong>
              </div>
            </div>
            <p style={{ margin: "0 0 14px", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.5 }}>
              Search by origin, landmark, or corridor and open a route card to present the complete step-by-step travel guide.
            </p>
            <label style={{ display: "block" }}>
              <span style={{ display: "none" }}>Search routes</span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search Lipa, Bauan, Diversion Road, Lumang Palengke..."
                style={{
                  width: "100%",
                  borderRadius: "14px",
                  border: "1px solid var(--border-light)",
                  background: "rgba(255,255,255,0.9)",
                  padding: "14px 16px",
                  fontSize: "0.92rem",
                  outline: "none",
                  color: "var(--text-main)",
                }}
              />
            </label>
          </section>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px", background: "var(--bg-app)", padding: "6px", borderRadius: "16px" }}>
            <button 
              className="tab"
              onClick={() => {
                setActiveTab("JEEPNEY");
                setSearch("");
              }}
              style={{
                padding: "10px",
                borderRadius: "12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                background: activeTab === "JEEPNEY" ? "var(--bg-surface)" : "transparent",
                color: activeTab === "JEEPNEY" ? "var(--text-main)" : "var(--text-muted)",
                boxShadow: activeTab === "JEEPNEY" ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              Jeepney
            </button>
            <button 
              className="tab"
              onClick={() => {
                setActiveTab("TRICYCLE");
                setSearch("");
              }}
              style={{
                padding: "10px",
                borderRadius: "12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                background: activeTab === "TRICYCLE" ? "var(--bg-surface)" : "transparent",
                color: activeTab === "TRICYCLE" ? "var(--text-main)" : "var(--text-muted)",
                boxShadow: activeTab === "TRICYCLE" ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              Tricycle
            </button>
          </div>

          <div style={{ display: "grid", gap: "18px" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>Loading routes...</p>
            ) : currentRoutes.length > 0 ? (
              currentRoutes.map((route) => (
                <article
                  key={route.routeKey}
                  className="premium-card"
                  style={{
                    margin: 0,
                    padding: "0",
                    overflow: "hidden",
                    borderColor: route.routeKey === expandedRoute ? "rgba(230,184,0,0.55)" : "var(--border-light)",
                    boxShadow: route.routeKey === expandedRoute ? "0 20px 40px rgba(230,184,0,0.16)" : "var(--shadow-sm)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedRoute((current) => (current === route.routeKey ? "" : route.routeKey))}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      padding: "20px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", gap: "16px", alignItems: "start" }}>
                      <div style={{ width: 50, height: 50, borderRadius: "16px", background: "var(--primary-light)", display: "grid", placeItems: "center", color: "var(--primary-dark)", flexShrink: 0 }}>
                        {activeTab === "TRICYCLE" ? (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 18h8"/><path d="M10 5h4"/><path d="M9 9h6"/><path d="M5 13h14"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/><path d="M7 18V9l2-4h6l2 4v9"/></svg>
                        ) : (
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L5 19"/><path d="M17 17L19 19"/><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start" }}>
                          <div>
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>
                              {route.startLocation} &rarr; {route.endLocation}
                            </h3>
                            <p style={{ margin: "5px 0 0", fontSize: "0.84rem", color: "var(--primary-dark)", fontWeight: 700 }}>
                              {route.landmark}
                            </p>
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "38px",
                              height: "38px",
                              borderRadius: "12px",
                              background: route.routeKey === expandedRoute ? "var(--primary)" : "var(--bg-app)",
                              color: route.routeKey === expandedRoute ? "var(--text-on-primary)" : "var(--text-muted)",
                              fontSize: "1.1rem",
                              fontWeight: 800,
                              flexShrink: 0,
                            }}
                          >
                            {route.routeKey === expandedRoute ? "−" : "+"}
                          </span>
                        </div>

                        <div style={{ marginTop: "14px", padding: "12px 14px", background: "var(--bg-app)", borderRadius: "12px", border: "1px solid var(--border-light)" }}>
                          <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>
                            Steps
                          </p>
                          <p style={{ margin: "6px 0 0", fontSize: "0.88rem", lineHeight: 1.5, color: "var(--text-main)" }}>
                            {route.routeSteps}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>

                  {route.routeKey === expandedRoute && route.stepByStepGuide?.length > 0 ? (
                    <div style={{ padding: "0 20px 20px" }}>
                      <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "18px" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "var(--text-main)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          STEP-BY-STEP GUIDE
                        </h4>
                        <div style={{ display: "grid", gap: "10px", marginTop: "14px" }}>
                          {route.stepByStepGuide.map((step, index) => (
                            <div
                              key={`${route.routeKey}-step-${index + 1}`}
                              style={{
                                display: "flex",
                                gap: "12px",
                                alignItems: "start",
                                padding: "12px 14px",
                                borderRadius: "14px",
                                background: index === route.stepByStepGuide.length - 1 ? "rgba(255,204,0,0.12)" : "var(--bg-app)",
                                border: "1px solid " + (index === route.stepByStepGuide.length - 1 ? "rgba(230,184,0,0.32)" : "var(--border-light)"),
                              }}
                            >
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
                                  borderRadius: "999px",
                                  background: "var(--bg-surface)",
                                  border: "1px solid var(--border-light)",
                                  display: "grid",
                                  placeItems: "center",
                                  flexShrink: 0,
                                  fontSize: "0.78rem",
                                  fontWeight: 800,
                                  color: "var(--primary-dark)",
                                }}
                              >
                                {index + 1}
                              </div>
                              <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.55, color: "var(--text-main)" }}>{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              ))
            ) : (
              <div className="premium-card" style={{ margin: 0, padding: "28px", textAlign: "center" }}>
                <p style={{ margin: 0, color: "var(--text-main)", fontWeight: 700 }}>No matching routes found.</p>
                <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: "0.86rem" }}>
                  Try another origin, landmark, or highway keyword.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav className="fixed-bottom-nav">
        <button type="button" onClick={() => navigate("/home")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Home</span>
        </button>
        <button type="button" onClick={() => navigate("/routes")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20L3 17V4L9 7L15 4L21 7V20L15 17L9 20Z"/><line x1="9" y1="7" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="17"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Routes</span>
        </button>
        <button type="button" onClick={() => navigate("/transport")} style={{ color: "var(--primary-dark)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L5 19"/><path d="M17 17L19 19"/><rect x="3" y="11" width="18" height="8" rx="2" fill="currentColor"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Guide</span>
        </button>
        <button type="button" onClick={() => navigate("/fare")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Fare</span>
        </button>
        <button type="button" onClick={() => navigate("/reports")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Reports</span>
        </button>
      </nav>
    </div>
  );
}
