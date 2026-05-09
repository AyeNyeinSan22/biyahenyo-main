import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRoutePlan, startTrip } from "../api/transport";
import { getDriverLocation } from "../api/api";
import PassengerMap from "../components/PassengerMap";
import { useAuth } from "../auth/AuthContext";
import { DEMO_MODE, DEMO_PASSENGER_STEPS, DEMO_STAGES } from "../demo/demoData";

const modeLabels = {
  TRICYCLE: "Tricycle",
  JEEPNEY: "Jeepney",
};

export default function RoutePlannerPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverError, setDriverError] = useState("");

  const mode = searchParams.get("mode") || "JEEPNEY";
  const from = searchParams.get("from") || "BSU Alangilan Entrance";
  const to = searchParams.get("to") || "SM City Batangas";
  const driverId = user?.role === "DRIVER" ? user?.email : DEMO_MODE ? "driver@gmail.com" : plan?.driverId ?? null;
  const etaMinutes = driverLocation?.etaMinutes;
  const traffic = driverLocation?.traffic;
  const isDemoSelection = from === "BSU Alangilan Entrance" && to === "SM City Batangas";
  const guideSegments = (DEMO_MODE && isDemoSelection)
    ? DEMO_PASSENGER_STEPS.map((step) => ({
        title: step.title,
        time: `${step.description} • ~${step.estimatedMinutes} min`,
        icon:
          step.type === "walking"
            ? "walk"
            : step.type === "riding"
              ? "ride"
              : step.type === "waiting"
                ? "alert"
                : "arrive",
      }))
    : (plan?.segments ?? []);

  const normalizeDriverLocation = (response) => {
    if (!response) {
      return null;
    }
    const location = response?.currentLocation ?? response;
    const normalized = {
      ...response,
      ...location,
      latitude: location?.latitude ?? response?.latitude,
      longitude: location?.longitude ?? response?.longitude,
      etaMinutes: location?.etaMinutes ?? response?.etaMinutes,
      traffic: location?.traffic ?? response?.traffic,
    };
    console.info("[RoutePlanner] Driver location updated:", {
      driverId,
      etaMinutes: normalized.etaMinutes,
      traffic: normalized.traffic,
      hasLocation: Boolean(normalized.latitude && normalized.longitude),
    });
    return normalized;
  };

  const getDemoDriverLabel = () => {
    if (driverLocation?.label) return driverLocation.label;
    if (!driverLocation || !DEMO_MODE) return "";
    
    const TOLERANCE = 0.001;
    const stage = DEMO_STAGES.find(
      (s) => Math.abs(s.lat - driverLocation.latitude) < TOLERANCE && Math.abs(s.lng - driverLocation.longitude) < TOLERANCE
    );
    if (stage) return stage.label;
    return "En Route";
  };

  const getDynamicTotalMin = () => {
    if (!DEMO_MODE || !driverLocation) return plan?.summary?.duration || "43 mins";
    
    const TOLERANCE = 0.001;
    const stageIndex = DEMO_STAGES.findIndex(
      (s) => Math.abs(s.lat - driverLocation.latitude) < TOLERANCE && Math.abs(s.lng - driverLocation.longitude) < TOLERANCE
    );

    if (stageIndex === -1) return plan?.summary?.duration || "43 mins";
    if (DEMO_STAGES[stageIndex].id === "hilltop_start") return "0 mins";

    const totalTripTime = DEMO_STAGES.reduce((sum, s) => sum + s.etaMinutes, 0);
    let passedMinutes = 0;
    for (let i = 0; i < stageIndex; i++) {
      passedMinutes += DEMO_STAGES[i].etaMinutes;
    }
    
    const remaining = Math.max(0, totalTripTime - passedMinutes);
    return `${remaining} mins`;
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getRoutePlan({ mode, from, to })
      .then((response) => {
        if (active) {
          setPlan(response);
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
  }, [from, mode, to]);

  useEffect(() => {
    console.info("[RoutePlanner] Driver location state changed:", {
      hasLocation: Boolean(driverLocation),
      etaMinutes,
      traffic,
    });
  }, [driverLocation, etaMinutes, traffic]);

  useEffect(() => {
    if (!driverId) {
      setDriverLocation(null);
      setDriverError("Sign in to view live driver updates.");
      return undefined;
    }

    let active = true;

    const fetchDriver = async () => {
      try {
        const response = await getDriverLocation(driverId);
        if (active) {
          setDriverLocation(normalizeDriverLocation(response));
          setDriverError("");
        }
      } catch (fetchError) {
        if (active) {
          setDriverError(fetchError.message);
        }
      }
    };

    console.info("[RoutePlanner] Starting driver polling for:", driverId);
    fetchDriver();
    const timer = window.setInterval(() => {
      fetchDriver().catch((err) => console.warn("[RoutePlanner] Driver fetch error:", err.message));
    }, 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [driverId]);

  const switchMode = (nextMode) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("mode", nextMode);
    setSearchParams(nextParams);
  };

  const handleStartTrip = async () => {
    setStarting(true);

    try {
      const trip = await startTrip({
        mode,
        from,
        to,
      });
      navigate(`/live-map/${trip.tripId}`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return <main className="simple-state">Loading route planner...</main>;
  }

  if (error && !plan) {
    return <main className="simple-state error">{error}</main>;
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
          <button type="button" className="circle-action" onClick={() => navigate(-1)} aria-label="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Route Planner</h1>
          <button type="button" className="circle-action" aria-label="More">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </header>

      <main className="scrollable-content">
        <div style={{ position: "relative", height: "300px" }}>
          <PassengerMap
            center={{ lat: plan.mapCenter.latitude, lng: plan.mapCenter.longitude }}
            routePath={plan.routePath}
            driverPosition={
              driverLocation
                ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
                : null
            }
            etaMinutes={etaMinutes}
            traffic={traffic}
            destinationPosition={{
              lat: plan.destinationCoordinate.latitude,
              lng: plan.destinationCoordinate.longitude,
            }}
            currentPosition={{
              lat: plan.originCoordinate.latitude,
              lng: plan.originCoordinate.longitude,
            }}
            driverLabel="Jeep"
            showDemoRoute={DEMO_MODE}
          />

          <div className="premium-card" style={{ position: "absolute", bottom: "-40px", left: "20px", right: "20px", margin: 0, zIndex: 1000 }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
               <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)" }} />
                  <div style={{ width: 1, flex: 1, borderLeft: "2px dashed var(--border-medium)", height: "20px" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)" }} />
               </div>
               <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>From</p>
                    <strong style={{ fontSize: "0.95rem" }}>{from}</strong>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>To</p>
                    <strong style={{ fontSize: "0.95rem" }}>{to}</strong>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "60px", padding: "20px" }}>
           <div className="premium-card" style={{ margin: "0 0 16px 0", padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
             <div>
               <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Live ETA {driverLocation ? "(Live)" : ""}</p>
               <strong style={{ fontSize: "1.4rem" }}>
                 {driverLocation && etaMinutes != null ? `${etaMinutes} min` : (etaMinutes != null ? `${etaMinutes} min` : plan.summary.duration)}
               </strong>
               {driverLocation && DEMO_MODE && (
                 <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>
                   📍 {getDemoDriverLabel()}
                 </p>
               )}
             </div>
             <div style={{ textAlign: "right" }}>
               <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>Traffic</p>
               <span
                 style={{
                   display: "inline-flex",
                   alignItems: "center",
                   padding: "6px 10px",
                   borderRadius: "999px",
                   background: "rgba(255, 90, 95, 0.1)",
                   color: "var(--accent)",
                   fontWeight: 700,
                   fontSize: "0.75rem",
                 }}
               >
                 {traffic || "MODERATE"}
               </span>
             </div>
           </div>
           <div className="row-between" style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                {plan.availableModes.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => switchMode(item)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      background: plan.selectedMode === item ? "var(--primary)" : "var(--bg-surface)",
                      color: plan.selectedMode === item ? "var(--text-on-primary)" : "var(--text-muted)",
                      border: "1px solid " + (plan.selectedMode === item ? "var(--primary-dark)" : "var(--border-light)"),
                      transition: "all 0.2s ease"
                    }}
                  >
                    {modeLabels[item]}
                  </button>
                ))}
              </div>
           </div>

           <div className="premium-card" style={{ margin: "0 0 24px 0", background: "var(--primary)", color: "var(--text-on-primary)", borderColor: "transparent" }}>
              <div className="row-between">
                <div>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(26,28,30,0.5)" }}>Total Duration</p>
                  <strong style={{ fontSize: "1.6rem" }}>{getDynamicTotalMin()}</strong>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(26,28,30,0.5)" }}>Distance</p>
                  <strong style={{ fontSize: "1.2rem" }}>{plan.summary.distance}</strong>
                </div>
              </div>
           </div>

           <section>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>STEP-BY-STEP GUIDE</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                {guideSegments.map((segment, index) => (
                  <div key={`${segment.title}-${index}`} className="premium-card" style={{ margin: 0, display: "flex", gap: "16px", alignItems: "center" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "12px", background: "var(--primary-light)", display: "grid", placeItems: "center", color: "var(--primary-dark)" }}>
                      {segment.icon === "walk" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 20-5-5-1-1-4-3-3-3L4 10"/><path d="M12 10V6"/><circle cx="12" cy="3" r="1"/></svg>}
                      {segment.icon === "ride" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L5 19"/><path d="M17 17L19 19"/><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>}
                      {segment.icon === "arrive" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>}
                      {segment.icon === "alert" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", fontSize: "1rem" }}>{segment.title}</strong>
                      <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>{segment.time}</p>
                    </div>
                  </div>
                ))}
              </div>
           </section>

           {driverError ? (
             <p style={{ color: "var(--accent)", fontSize: "0.85rem", marginTop: "12px", textAlign: "center" }}>{driverError}</p>
           ) : null}
           {error ? <p style={{ color: "var(--accent)", fontSize: "0.9rem", marginTop: "16px", textAlign: "center" }}>{error}</p> : null}

           <button 
             type="button" 
             className="primary-btn pulse-animation" 
             disabled={starting} 
             onClick={handleStartTrip} 
             style={{ width: "100%", marginTop: "32px", background: "linear-gradient(180deg, #FFCC00 0%, #E6B800 100%)", color: "var(--text-on-primary)", height: "60px", fontSize: "1.1rem" }}
           >
             {starting ? "Starting Trip..." : "Start My Journey"}
           </button>
        </div>
      </main>
    </div>
  );
}
