import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDriverDashboard } from "../api/transport";
import { updateDriverLiveLocation } from "../api/api";
import { useAuth } from "../auth/AuthContext";
import { DEMO_MODE as ENV_DEMO_MODE, DEMO_STAGES } from "../demo/demoData";

export default function DriverDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const driverId = user?.email;
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [trackingError, setTrackingError] = useState("");
  const [etaMinutes, setEtaMinutes] = useState(8);
  const [traffic, setTraffic] = useState("MODERATE");
  const [activeStageId, setActiveStageId] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(ENV_DEMO_MODE);
  const etaMinutesRef = useRef(etaMinutes);
  const trafficRef = useRef(traffic);
  const watchIdRef = useRef(null);
  const pushTimerRef = useRef(null);
  const latestCoordsRef = useRef(null);
  const simulationTimerRef = useRef(null);
  const simulationCoordsRef = useRef(null);

  useEffect(() => {
    etaMinutesRef.current = etaMinutes;
  }, [etaMinutes]);

  useEffect(() => {
    trafficRef.current = traffic;
  }, [traffic]);

  const handleDemoStage = async (stage) => {
    setActiveStageId(stage.id);
    setEtaMinutes(stage.etaMinutes);
    setTraffic(stage.traffic);
    setUpdating(true);
    setTrackingError("");
    try {
      const response = await updateDriverLiveLocation({
        latitude: stage.lat,
        longitude: stage.lng,
        etaMinutes: stage.etaMinutes,
        traffic: stage.traffic,
      });
      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          eta: {
            ...prev.eta,
            duration: `${response.etaMinutes ?? stage.etaMinutes} mins`,
          },
          currentLocation: {
            ...prev.currentLocation,
            label: isDemoMode ? stage.label : (response.label ?? stage.label),
            lastUpdated: response.lastUpdated,
            live: true,
            latitude: response.latitude ?? stage.lat,
            longitude: response.longitude ?? stage.lng,
            etaMinutes: response.etaMinutes ?? stage.etaMinutes,
            traffic: response.traffic ?? stage.traffic,
          },
        };
      });
    } catch (err) {
      setTrackingError(err.message || "Demo stage update failed.");
    } finally {
      setUpdating(false);
    }
  };

  const startSimulation = (message) => {
    if (message) {
      setTrackingError(message);
    }

    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (pushTimerRef.current) {
      window.clearInterval(pushTimerRef.current);
      pushTimerRef.current = null;
    }

    setTracking(true);

    if (!simulationCoordsRef.current) {
      const fallbackLat = latestCoordsRef.current?.latitude ?? dashboard?.currentLocation?.latitude ?? 13.756;
      const fallbackLng = latestCoordsRef.current?.longitude ?? dashboard?.currentLocation?.longitude ?? 121.058;
      simulationCoordsRef.current = { latitude: fallbackLat, longitude: fallbackLng };
    }

    const tickSimulation = () => {
      const current = simulationCoordsRef.current;
      if (!current) {
        return;
      }
      const jitterLat = (Math.random() - 0.5) * 0.0003;
      const jitterLng = (Math.random() - 0.5) * 0.0003;
      simulationCoordsRef.current = {
        latitude: current.latitude + jitterLat,
        longitude: current.longitude + jitterLng,
      };
      latestCoordsRef.current = simulationCoordsRef.current;
      applyLocationUpdate(simulationCoordsRef.current);
    };

    tickSimulation();

    if (!simulationTimerRef.current) {
      simulationTimerRef.current = window.setInterval(tickSimulation, 2000);
    }
  };

  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        if (!driverId) {
          if (active) {
            setError("Please sign in to view your driver dashboard.");
          }
          return;
        }
        if (active) {
          setError("");
        }
        const response = await getDriverDashboard(driverId);
        if (active) setDashboard(response);
      } catch (fetchError) {
        if (active) setError(fetchError.message);
      }
    };
    fetchInitial();

    return () => {
      active = false;
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (pushTimerRef.current) {
        window.clearInterval(pushTimerRef.current);
      }
      if (simulationTimerRef.current) {
        window.clearInterval(simulationTimerRef.current);
      }
    };
  }, [driverId]);

  const applyLocationUpdate = async (coords) => {
    if (!coords) {
      return;
    }

    if (!driverId) {
      setTrackingError("Please sign in to update your driver location.");
      return;
    }

    try {
      const response = await updateDriverLiveLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
        etaMinutes: Number.isFinite(etaMinutesRef.current) ? etaMinutesRef.current : undefined,
        traffic: trafficRef.current,
      });

      setDashboard((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          eta: {
            ...prev.eta,
            duration: response.etaMinutes != null ? `${response.etaMinutes} mins` : prev.eta.duration,
          },
          currentLocation: {
            ...prev.currentLocation,
            label: response.label,
            lastUpdated: response.lastUpdated,
            live: response.live,
            latitude: response.latitude,
            longitude: response.longitude,
            etaMinutes: response.etaMinutes,
            traffic: response.traffic,
          },
        };
      });
    } catch (updateError) {
      setTrackingError(updateError.message || "Unable to update driver location.");
    }
  };

  const startTracking = () => {
    if (!driverId) {
      setTrackingError("Please sign in to start tracking.");
      return;
    }

    if (!navigator.geolocation) {
      startSimulation("Geolocation is not supported in this browser.");
      return;
    }

    setTrackingError("");
    setTracking(true);

    if (simulationTimerRef.current) {
      window.clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        latestCoordsRef.current = position.coords;
      },
      (geoError) => {
        startSimulation(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission denied. Please enable GPS access."
            : "Unable to access GPS. Switching to simulation mode."
        );
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 8000 }
    );

    if (!pushTimerRef.current) {
      pushTimerRef.current = window.setInterval(() => {
        if (latestCoordsRef.current) {
          applyLocationUpdate(latestCoordsRef.current);
        }
      }, 4000);
    }
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (pushTimerRef.current) {
      window.clearInterval(pushTimerRef.current);
      pushTimerRef.current = null;
    }
    if (simulationTimerRef.current) {
      window.clearInterval(simulationTimerRef.current);
      simulationTimerRef.current = null;
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleManualForceUpdate = () => {
    // Allows user to force a manual refresh of the dashboard
    setUpdating(true);
    const coords = latestCoordsRef.current;
    if (coords) {
      applyLocationUpdate(coords)
        .then(() => {
          setError("");
        })
        .finally(() => setUpdating(false));
    } else {
      getDriverDashboard(driverId)
        .then((res) => {
          setDashboard(res);
          setError("");
        })
        .catch((e) => setError(e.message))
        .finally(() => setUpdating(false));
    }
  };

  if (!dashboard && error) {
    return <main className="simple-state error">{error}</main>;
  }

  if (!dashboard) {
    return <main className="simple-state">Loading driver dashboard...</main>;
  }

  const simulationStages = (dashboard?.routeStops ?? []).map((stop, index) => {
    const isFirst = index === 0;
    const isLast = index === (dashboard.routeStops.length - 1);
    
    // Estimate ETA: 5 mins per remaining stop as a placeholder
    const estEta = (dashboard.routeStops.length - 1 - index) * 5;

    return {
      id: `stop-${index}`,
      label: stop.name,
      stageLabel: isFirst ? "📍 Starting Point" : isLast ? "🏁 Destination" : "🚌 Waypoint",
      emoji: isFirst ? "🏬" : isLast ? "🏁" : "📍",
      lat: stop.latitude,
      lng: stop.longitude,
      etaMinutes: estEta,
      traffic: "MODERATE",
    };
  });

  const effectiveStages = (isDemoMode && simulationStages.length > 0) ? simulationStages : DEMO_STAGES;
  const activeStage = effectiveStages.find((s) => s.id === activeStageId);

  const getRemainingTotalMin = (originalEta) => {
    if (!isDemoMode) return originalEta;
    const totalTripTime = effectiveStages.reduce((sum, s) => sum + s.etaMinutes, 0);
    if (!activeStageId) return `${totalTripTime} total min`;
    
    const currentIndex = effectiveStages.findIndex(s => s.id === activeStageId);
    if (currentIndex === effectiveStages.length - 1) return "0 total min";

    let passedMinutes = 0;
    for (let i = 0; i < currentIndex; i++) {
      passedMinutes += effectiveStages[i].etaMinutes;
    }
    
    const remaining = Math.max(0, totalTripTime - passedMinutes);
    return `${remaining} total min`;
  };

  return (
    <div className="app-container">
      <header className="sticky-header">
        <div className="status-bar" style={{ padding: "0 0 12px 0" }}>
          <span>09:41</span>
          <div className="status-icons">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="row-between">
          <button type="button" className="circle-action" aria-label="Open menu" style={{ width: 40, height: 40 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>{dashboard.title}</h1>
            {isDemoMode ? (
              <span onClick={() => setIsDemoMode(false)} style={{ cursor: "pointer", fontSize: "0.7rem", fontWeight: 800, color: "#1A1C1E", background: "var(--primary)", padding: "2px 10px", borderRadius: "8px", letterSpacing: "0.08em", transition: "opacity 0.2s" }} onMouseOver={(e) => e.target.style.opacity = "0.8"} onMouseOut={(e) => e.target.style.opacity = "1"}>DEMO MODE</span>
            ) : (
              <span onClick={() => setIsDemoMode(true)} style={{ cursor: "pointer", fontSize: "0.7rem", fontWeight: 800, color: "#fff", background: "#FF5A5F", padding: "2px 10px", borderRadius: "8px", letterSpacing: "0.08em", transition: "opacity 0.2s" }} onMouseOver={(e) => e.target.style.opacity = "0.8"} onMouseOut={(e) => e.target.style.opacity = "1"}>REAL MODE</span>
            )}
          </div>

          <button type="button" className="circle-action" onClick={handleLogout} aria-label="Logout" style={{ width: 40, height: 40, background: "var(--primary-light)", borderColor: "var(--primary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main className="scrollable-content">
        <div className="driver-content" style={{ padding: "20px" }}>
          <div className="premium-card" style={{ margin: "0 0 20px 0", padding: "16px", background: "var(--bg-surface)", display: "flex", alignItems: "center", gap: "16px", borderLeft: `8px solid ${
            dashboard.routeColor === "Yellow" ? "#FFCC00" :
            dashboard.routeColor === "Blue" ? "#007AFF" :
            dashboard.routeColor === "Green" ? "#34C759" :
            dashboard.routeColor === "Red" ? "#FF3B30" :
            dashboard.routeColor === "Orange" ? "#FF9500" :
            dashboard.routeColor === "White" ? "#E0E0E0" : "#BDBDBD"
          }` }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Assigned Route</p>
              <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>{dashboard.routeLabel}</strong>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                <span style={{ 
                  fontSize: "0.7rem", 
                  fontWeight: 800, 
                  padding: "2px 8px", 
                  borderRadius: "6px", 
                  background: (dashboard.routeColor === "White" || dashboard.routeColor === "Yellow") ? "#1A1C1E" : (
                    dashboard.routeColor === "Blue" ? "#007AFF" :
                    dashboard.routeColor === "Green" ? "#34C759" :
                    dashboard.routeColor === "Red" ? "#FF3B30" :
                    dashboard.routeColor === "Orange" ? "#FF9500" : "#BDBDBD"
                  ),
                  color: "#FFF"
                }}>
                  {dashboard.routeColor.toUpperCase()} LINE
                </span>
              </div>
            </div>
          </div>
          <section className="premium-card" style={{ margin: "0 0 24px 0", padding: "20px" }}>
            <div className="row-between" style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>Current Location</h2>
              <p style={{ 
                margin: 0, 
                display: "flex", 
                alignItems: "center", 
                gap: "6px", 
                fontSize: "0.85rem", 
                fontWeight: 700, 
                color: dashboard.currentLocation.live ? "var(--accent)" : "var(--text-muted)",
                background: dashboard.currentLocation.live ? "rgba(255, 90, 95, 0.1)" : "var(--border-light)",
                padding: "4px 10px",
                borderRadius: "12px"
              }}>
                <span className={dashboard.currentLocation.live ? "pulse-animation" : ""} style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />
                {dashboard.currentLocation.live ? "LIVE" : "OFFLINE"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px", background: "var(--bg-app)", borderRadius: "16px", marginBottom: "16px" }}>
              <div style={{ width: 44, height: 44, borderRadius: "12px", background: "var(--primary-light)", display: "grid", placeItems: "center", color: "var(--primary-dark)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ display: "block", fontSize: "1rem" }}>{dashboard.currentLocation.label}</strong>
                <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>Updated: {dashboard.currentLocation.lastUpdated}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                ETA (minutes)
                <input
                  type="number"
                  min="0"
                  value={etaMinutes}
                  onChange={(event) => setEtaMinutes(Number(event.target.value))}
                  style={{ height: "44px", borderRadius: "12px", border: "1px solid var(--border-light)", padding: "0 12px", fontWeight: 600 }}
                />
              </label>
              <label style={{ display: "grid", gap: "6px", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)" }}>
                Traffic Condition
                <select
                  value={traffic}
                  onChange={(event) => setTraffic(event.target.value)}
                  style={{ height: "44px", borderRadius: "12px", border: "1px solid var(--border-light)", padding: "0 12px", fontWeight: 600 }}
                >
                  <option value="LIGHT">Light</option>
                  <option value="MODERATE">Moderate</option>
                  <option value="HEAVY">Heavy</option>
                </select>
              </label>
            </div>

            {trackingError ? (
              <p style={{ margin: "0 0 12px", color: "var(--accent)", fontWeight: 700 }}>{trackingError}</p>
            ) : null}

            {isDemoMode ? (
              <div style={{ display: "grid", gap: "12px" }}>
                {activeStage && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "12px", background: "var(--primary-light)", border: "1px solid var(--primary)" }}>
                    <span style={{ fontSize: "1.3rem" }}>{activeStage.emoji}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Current Stage</p>
                      <strong style={{ fontSize: "0.95rem", color: "var(--primary-dark)" }}>{activeStage.stageLabel}</strong>
                    </div>
                  </div>
                )}
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Simulation Checkpoints</p>
                <div style={{ display: "grid", gap: "10px" }}>
                  {effectiveStages.map((stage) => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleDemoStage(stage)}
                      disabled={updating}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        border: activeStageId === stage.id ? "2px solid var(--primary-dark)" : "1px solid var(--border-medium)",
                        background: activeStageId === stage.id ? "var(--primary)" : "var(--bg-app)",
                        color: activeStageId === stage.id ? "var(--text-on-primary)" : "var(--text-main)",
                        fontWeight: 700,
                        textAlign: "left",
                        cursor: updating ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <span style={{ fontSize: "1.4rem" }}>{stage.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: "block", fontSize: "0.95rem" }}>{stage.label}</span>
                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{stage.stageLabel} · ETA {stage.etaMinutes} min · {stage.traffic}</span>
                      </div>
                      {activeStageId === stage.id && (
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-on-primary)", display: "inline-block" }} className="pulse-animation" />
                      )}
                    </button>
                  ))}
                </div>
                {updating && (
                  <p style={{ margin: 0, textAlign: "center", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>Pushing update to backend...</p>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "1fr 1fr", marginBottom: "4px" }}>
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={startTracking}
                    disabled={tracking}
                    style={{ height: "48px" }}
                  >
                    {tracking ? "Tracking Live" : "Start Tracking"}
                  </button>
                  <button
                    type="button"
                    onClick={stopTracking}
                    disabled={!tracking}
                    style={{ height: "48px", borderRadius: "14px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontWeight: 700 }}
                  >
                    Stop Tracking
                  </button>
                </div>
                <button type="button" className="primary-btn" onClick={handleManualForceUpdate} disabled={updating} style={{ width: "100%", height: "50px", background: "var(--primary)", color: "var(--text-on-primary)", fontWeight: 700, borderRadius: "14px" }}>
                  {updating ? "Updating GPS..." : "Update My Location"}
                </button>
              </div>
            )}
          </section>

          <section className="premium-card" style={{ margin: "0 0 24px 0", padding: "20px" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
               <div style={{ color: "var(--primary-dark)" }}>
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
               </div>
               <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>ETA (Arrival Time)</h2>
             </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--text-main)" }}>{dashboard.eta.duration}</div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Destination</p>
	                <strong style={{ fontSize: "1.1rem" }}>{dashboard.eta.destination}</strong>
              </div>
            </div>

            <div style={{ position: "relative", height: "8px", background: "var(--border-medium)", borderRadius: "4px" }}>
              <div style={{ 
                position: "absolute", 
                top: 0, 
                left: 0, 
                height: "100%", 
                width: `${dashboard.eta.progressPercent}%`, 
                background: "var(--primary)", 
                borderRadius: "4px" 
              }} />
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "16px" }}>Route Suggestions</h2>
            <div style={{ display: "grid", gap: "16px" }}>
              {dashboard.routeSuggestions.map((route, index) => (
                <div key={`${route.route}-${index}`} className="premium-card" style={{ margin: 0, padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: route.recommended ? "var(--primary)" : "var(--border-light)" }}>
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "10px", background: route.tone === "calm" ? "rgba(0, 177, 106, 0.1)" : "rgba(255, 90, 95, 0.1)", display: "grid", placeItems: "center", color: route.tone === "calm" ? "#00B16A" : "#FF5A5F" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                    <div>
                      <strong style={{ fontSize: "1rem" }}>{route.route}</strong>
                      <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>via {route.via}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <strong style={{ display: "block", fontSize: "1.1rem" }}>{getRemainingTotalMin(route.eta)}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: "0.75rem", fontWeight: 700, color: route.tone === "calm" ? "#00B16A" : "#FF5A5F" }}>{route.traffic}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <nav className="fixed-bottom-nav">
        <button type="button" style={{ color: "var(--primary-dark)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Dashboard</span>
        </button>
        <button type="button" style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Earnings</span>
        </button>
        <button type="button" style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Alerts</span>
        </button>
        <button type="button" style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Settings</span>
        </button>
      </nav>
    </div>
  );
}
