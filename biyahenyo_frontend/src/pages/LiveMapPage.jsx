import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { advanceTrip, getTrip } from "../api/transport";
import { getDriverLocation } from "../api/api";
import PassengerMap from "../components/PassengerMap";
import { useAuth } from "../auth/AuthContext";
import { DEMO_MODE, DEMO_STAGES } from "../demo/demoData";

export default function LiveMapPage() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState("");
  const [advancing, setAdvancing] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverError, setDriverError] = useState("");
  const [isAtStop, setIsAtStop] = useState(false);
  const [isAtDestination, setIsAtDestination] = useState(false);
  const [jeepneyArrived, setJeepneyArrived] = useState(false);
  const [boarded, setBoarded] = useState(false);
  const driverId = user?.role === "DRIVER" ? user?.email : DEMO_MODE ? "driver@gmail.com" : trip?.driverId ?? null;
  const etaMinutes = driverLocation?.etaMinutes;
  const traffic = driverLocation?.traffic;

  const normalizeDriverLocation = (response) => {
    if (!response) {
      return null;
    }
    const location = response?.currentLocation ?? response;
    return {
      ...response,
      ...location,
      latitude: location?.latitude ?? response?.latitude,
      longitude: location?.longitude ?? response?.longitude,
      etaMinutes: location?.etaMinutes ?? response?.etaMinutes,
      traffic: location?.traffic ?? response?.traffic,
    };
  };

  useEffect(() => {
    let active = true;

    getTrip(tripId)
      .then((response) => {
        if (active) {
          setTrip(response);
        }
      })
      .catch((fetchError) => {
        if (active) {
          setError(fetchError.message);
        }
      });

    return () => {
      active = false;
    };
  }, [tripId]);

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

    console.info("[LiveMap] Starting driver polling for:", driverId);
    fetchDriver();
    const timer = window.setInterval(fetchDriver, 1500);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [driverId]);

  // Proximity Detection
  useEffect(() => {
    if (!driverLocation || !trip) {
      return;
    }

    const currentStepPos = trip?.steps?.[trip.currentStep]?.currentPosition;
    if (currentStepPos) {
      const distToStep = Math.sqrt(
        Math.pow(driverLocation.latitude - currentStepPos.latitude, 2) +
        Math.pow(driverLocation.longitude - currentStepPos.longitude, 2)
      );
      setIsAtStop(distToStep < 0.0008);

      // Legacy demo arrival logic
      if (trip.currentStep === 1 && distToStep < 0.001 && !jeepneyArrived) {
        setJeepneyArrived(true);
      }
    }

    const destPos = trip.destinationPosition;
    if (destPos) {
      const distToDest = Math.sqrt(
        Math.pow(driverLocation.latitude - destPos.latitude, 2) +
        Math.pow(driverLocation.longitude - destPos.longitude, 2)
      );
      setIsAtDestination(distToDest < 0.0008);
    }
  }, [driverLocation, trip, jeepneyArrived]);

  useEffect(() => {
    if (!trip || trip.completed) {
      return undefined;
    }

    const timer = window.setInterval(async () => {
      try {
        const currentTrip = await getTrip(trip.tripId);
        setTrip(currentTrip);
      } catch (pollError) {
        setError(pollError.message);
      }
    }, 7000);

    return () => window.clearInterval(timer);
  }, [trip]);

  const currentStep = trip?.steps?.[trip.currentStep];
  const routePath = useMemo(() => trip?.routePath ?? [], [trip]);

  const saveRecentTrip = (completedTrip) => {
    try {
      const recentTrips = JSON.parse(localStorage.getItem("biyahenyo_recent_trips") || "[]");
      const newEntry = {
        id: completedTrip.tripId,
        title: completedTrip.title,
        origin: completedTrip.steps[0].bannerTitle,
        destination: completedTrip.steps[completedTrip.steps.length - 1].bannerTitle,
        mode: completedTrip.mode,
        fare: completedTrip.steps.find(s => s.calloutSubtitle?.includes("₱"))?.calloutSubtitle || "₱15.00",
        distance: completedTrip.steps[completedTrip.steps.length - 1].distance,
        duration: completedTrip.steps[completedTrip.steps.length - 1].eta || "Completed",
        timestamp: new Date().getTime(),
      };
      
      const updated = [newEntry, ...recentTrips.filter(t => t.id !== completedTrip.tripId)].slice(0, 5);
      localStorage.setItem("biyahenyo_recent_trips", JSON.stringify(updated));
      console.info("[LiveMap] Saved to recent trips:", newEntry);
    } catch (e) {
      console.error("[LiveMap] Failed to save recent trip:", e);
    }
  };

  const handleAdvance = async () => {
    if (!trip || trip.completed || advancing) {
      return;
    }

    setAdvancing(true);
    try {
      const nextTrip = await advanceTrip(trip.tripId);
      setTrip(nextTrip);
    } catch (advanceError) {
      setError(advanceError.message);
    } finally {
      setAdvancing(false);
    }
  };

  const handleFinish = () => {
    saveRecentTrip(trip);
    navigate("/home");
  };

  if (error && !trip) {
    return <main className="simple-state error">{error}</main>;
  }

  if (!trip || !currentStep || routePath.length === 0) {
    return <main className="simple-state">Loading Batangas City live map...</main>;
  }

  return (
    <div className="app-container">
      <header className="sticky-header" style={{ background: "transparent", borderBottom: "none", position: "absolute", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <div className="status-bar" style={{ padding: "0 0 12px 0", color: "var(--text-main)" }}>
          <span>03:16</span>
          <div className="status-icons">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="row-between">
          <button type="button" className="circle-action" onClick={() => navigate(-1)} aria-label="Back" style={{ background: "rgba(255,255,255,0.9)", border: "none", boxShadow: "var(--shadow-sm)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <div style={{ background: "rgba(255,255,255,0.9)", padding: "8px 16px", borderRadius: "20px", fontWeight: 800, fontSize: "0.9rem", boxShadow: "var(--shadow-sm)", color: "var(--text-main)" }}>
            {trip.title}
          </div>
          <button type="button" className="circle-action" aria-label="More" style={{ background: "rgba(255,255,255,0.9)", border: "none", boxShadow: "var(--shadow-sm)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, position: "relative" }}>
        <PassengerMap
          center={{ lat: trip.mapCenter.latitude, lng: trip.mapCenter.longitude }}
          routePath={routePath}
          driverPosition={
            driverLocation
              ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
              : { lat: trip.vehiclePosition.latitude, lng: trip.vehiclePosition.longitude }
          }
          etaMinutes={etaMinutes}
          traffic={traffic}
          destinationPosition={{
            lat: trip.destinationPosition.latitude,
            lng: trip.destinationPosition.longitude,
          }}
          currentPosition={{
            lat: trip.currentPosition.latitude,
            lng: trip.currentPosition.longitude,
          }}
          driverLabel={trip.mode === "JEEPNEY" ? "Jeep" : "Ride"}
        />

          <div style={{ position: "absolute", top: "100px", left: "20px", right: "20px", zIndex: 1000, display: "grid", gap: "10px" }}>
            <div className="premium-card pulse-animation" style={{ margin: 0, padding: "12px 16px", background: "var(--bg-surface)", color: "var(--text-main)", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)" }} />
              <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{currentStep.bannerTitle}</span>
            </div>
            <div className="premium-card" style={{ margin: 0, padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border-medium)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Live ETA</p>
                <strong style={{ fontSize: "1.1rem" }}>{etaMinutes != null ? `${etaMinutes} min` : currentStep.eta}</strong>
              </div>
              <span style={{ padding: "6px 10px", borderRadius: "999px", background: "rgba(255, 90, 95, 0.1)", color: "var(--accent)", fontWeight: 700, fontSize: "0.75rem" }}>
                {traffic || "MODERATE"}
              </span>
            </div>
            {driverError ? (
             <div className="premium-card" style={{ margin: 0, padding: "10px 14px", background: "rgba(255, 90, 95, 0.08)", color: "var(--accent)", fontWeight: 700 }}>
              {driverError}
             </div>
            ) : null}
          </div>

        <div style={{ position: "absolute", bottom: "30px", left: "20px", right: "20px", zIndex: 1000 }}>
           <div className="premium-card" style={{ 
             margin: 0, 
             padding: "20px", 
             background: "var(--bg-surface)", 
             boxShadow: "var(--shadow-lg)",
             border: (isAtStop || isAtDestination) ? "2px solid var(--primary)" : "1px solid var(--border-medium)",
             transition: "all 0.3s ease",
             position: "relative",
             overflow: "hidden"
           }}>
              {(isAtStop || isAtDestination) && (
                <div style={{ 
                  position: "absolute", 
                  top: 0, 
                  left: 0, 
                  width: "100%", 
                  height: "4px", 
                  background: "var(--primary)",
                  animation: "shimmer 2s infinite"
                }} />
              )}

              <div style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--primary-dark)" }}>
                  {trip.steps[0].bannerTitle}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-main)" }}>
                  {trip.steps[trip.steps.length - 1].bannerTitle}
                </span>
              </div>

              <div className="row-between" style={{ marginBottom: "16px" }}>
                 <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                      {isAtDestination ? "Destination Reached" : isAtStop ? "Arrived at Stop" : (driverLocation?.label ? "Driver Status" : currentStep.routeLabel)}
                    </p>
                    <strong style={{ 
                      fontSize: "1.2rem", 
                      color: isAtDestination || isAtStop ? "var(--primary-dark)" : "var(--text-main)", 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      animation: (isAtStop || isAtDestination) ? "text-pop 1.5s infinite ease-in-out" : "none"
                    }}>
                       {isAtDestination 
                         ? trip.steps[trip.steps.length - 1].bannerTitle 
                         : isAtStop 
                           ? (currentStep.bannerTitle || currentStep.calloutTitle) 
                           : (driverLocation?.label ? `At ${driverLocation.label}` : currentStep.calloutTitle)
                       }
                       {(isAtStop || isAtDestination) && <span className="pulse-animation" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)" }} />}
                    </strong>
                    <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {isAtDestination 
                        ? "You have arrived!" 
                        : isAtStop 
                          ? "Board/Alight now" 
                          : (driverLocation?.label ? `Heading to ${currentStep.bannerTitle || currentStep.calloutTitle}` : currentStep.calloutSubtitle)
                      }
                    </p>
                 </div>
                 <div style={{ textAlign: "right" }}>
                    <strong style={{ fontSize: "1.4rem", color: "var(--primary-dark)", display: "block" }}>
                      {isAtDestination ? "0 min" : (etaMinutes != null ? `${etaMinutes} min` : currentStep.eta)}
                    </strong>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>{currentStep.distance}</span>
                 </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: (currentStep.showTrackButton || isAtDestination) ? "1fr 2fr" : "1fr", gap: "12px" }}>
                 <button type="button" onClick={() => navigate("/home")} style={{ height: "54px", borderRadius: "16px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", color: "var(--text-main)", fontWeight: 700 }}>Exit</button>
                 {(currentStep.showTrackButton || isAtDestination) && (
                    <button 
                      type="button" 
                      className="primary-btn" 
                      onClick={isAtDestination ? handleFinish : handleAdvance} 
                      disabled={advancing} 
                      style={{ height: "54px", background: isAtDestination ? "var(--primary-dark)" : "var(--primary)" }}
                    >
                       {isAtDestination ? "Finish Trip" : advancing ? "Updating..." : "Next Step"}
                    </button>
                 )}
              </div>
           </div>
        </div>

        {error && <p style={{ position: "absolute", bottom: "200px", left: "20px", right: "20px", textAlign: "center", color: "var(--accent)", fontWeight: 700, zIndex: 1000 }}>{error}</p>}

        {/* DEMO_MODE: Arrival Modal */}
        {DEMO_MODE && jeepneyArrived && !boarded && (
          <div style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", background: "rgba(0, 0, 0, 0.6)", zIndex: 2000 }}>
            <div className="premium-card" style={{ margin: "0", maxWidth: "90%", padding: "40px 24px", textAlign: "center", borderRadius: "24px", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🚌</div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 8px", color: "var(--primary-dark)" }}>Jeepney Arrived!</h2>
              <p style={{ fontSize: "1rem", color: "var(--text-muted)", margin: "0 0 24px", fontWeight: 500 }}>
                Your jeepney is now at <strong>{trip.steps[1].bannerTitle}</strong>. Get ready to board!
              </p>
              
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setBoarded(true)}
                  style={{ flex: 1, height: "56px", fontSize: "1.1rem", fontWeight: 700, background: "var(--primary)", color: "var(--text-on-primary)", borderRadius: "16px" }}
                >
                  🚪 Board Jeepney
                </button>
              </div>

              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "16px 0 0", fontWeight: 500 }}>
                Next: {trip.steps[2]?.title || "Ride to destination"}
              </p>
            </div>
          </div>
        )}

        {/* DEMO_MODE: Post-Boarding Confirmation */}
        {DEMO_MODE && jeepneyArrived && boarded && (
          <div style={{ position: "absolute", top: "120px", left: "20px", right: "20px", zIndex: 1500 }}>
            <div className="premium-card pulse-animation" style={{ margin: 0, padding: "16px", background: "var(--primary)", color: "var(--text-on-primary)", border: "2px solid var(--primary-dark)", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.4rem" }}>✅</span>
              <div>
                <strong style={{ display: "block", fontSize: "1rem" }}>You are on board!</strong>
                <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>{trip.title}</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes text-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse-border {
          0% { border-color: var(--primary); box-shadow: 0 0 0 0 rgba(255, 204, 0, 0.4); }
          70% { border-color: var(--primary-dark); box-shadow: 0 0 0 10px rgba(255, 204, 0, 0); }
          100% { border-color: var(--primary); box-shadow: 0 0 0 0 rgba(255, 204, 0, 0); }
        }
      `}</style>
    </div>
  );
}

