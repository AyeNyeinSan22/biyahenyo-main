import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { estimateFare } from "../services/fareService";

export default function FarePage() {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState("JEEPNEY");
  const [distance, setDistance] = useState(4);
  const [passengerType, setPassengerType] = useState("REGULAR");
  const [fare, setFare] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEstimate = async () => {
    setLoading(true);
    try {
      const result = await estimateFare(vehicleType, distance, passengerType);
      setFare(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Fare Estimator</h1>
          <button type="button" className="circle-action" aria-label="More">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </header>

      <main className="scrollable-content">
        <div style={{ padding: "20px" }}>
          <div className="premium-card" style={{ margin: "0 0 24px 0", padding: "24px" }}>
             <div style={{ display: "grid", gap: "20px" }}>
                <div>
                   <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Vehicle Type</p>
                   <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <button 
                        onClick={() => setVehicleType("JEEPNEY")} 
                        style={{ padding: "12px", borderRadius: "12px", border: "1px solid " + (vehicleType === "JEEPNEY" ? "var(--primary)" : "var(--border-medium)"), background: vehicleType === "JEEPNEY" ? "var(--primary)" : "transparent", color: "var(--text-main)", fontWeight: 700, transition: "all 0.2s ease" }}
                      >
                        Jeepney
                      </button>
                      <button 
                        onClick={() => setVehicleType("TRICYCLE")} 
                        style={{ padding: "12px", borderRadius: "12px", border: "1px solid " + (vehicleType === "TRICYCLE" ? "var(--primary)" : "var(--border-medium)"), background: vehicleType === "TRICYCLE" ? "var(--primary)" : "transparent", color: "var(--text-main)", fontWeight: 700, transition: "all 0.2s ease" }}
                      >
                        Tricycle
                      </button>
                   </div>
                </div>

                <div>
                   <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Distance (km)</p>
                   <div style={{ position: "relative" }}>
                      <input 
                        type="number" 
                        value={distance} 
                        onChange={(e) => setDistance(parseFloat(e.target.value))} 
                        style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontSize: "1rem", fontWeight: 700, outline: "none" }}
                      />
                      <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontWeight: 700, color: "var(--text-muted)" }}>KM</span>
                   </div>
                </div>

                <div>
                   <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "8px", textTransform: "uppercase" }}>Passenger Type</p>
                   <select 
                     value={passengerType} 
                     onChange={(e) => setPassengerType(e.target.value)}
                     style={{ width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontSize: "1rem", fontWeight: 700, outline: "none", appearance: "none" }}
                   >
                     <option value="REGULAR">Regular</option>
                     <option value="STUDENT">Student</option>
                     <option value="SENIOR">Senior / PWD</option>
                   </select>
                </div>

                <button className="primary-btn" onClick={handleEstimate} disabled={loading} style={{ marginTop: "12px" }}>
                  {loading ? "Calculating..." : "Estimate Fare"}
                </button>
             </div>
          </div>

          {fare !== null && (
            <div className="premium-card pulse-animation" style={{ margin: 0, background: "var(--primary)", borderColor: "transparent", textAlign: "center", padding: "32px 20px" }}>
               <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "var(--text-on-primary)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Estimated Fare</p>
               <h2 style={{ fontSize: "3rem", fontWeight: 800, margin: "8px 0", color: "var(--text-on-primary)" }}>₱ {fare.toFixed(2)}</h2>
               <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(21,25,34,0.6)", fontWeight: 600 }}>Final fare may vary based on exact drop-off</p>
            </div>
          )}
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
        <button type="button" onClick={() => navigate("/transport")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L5 19"/><path d="M17 17L19 19"/><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Guide</span>
        </button>
        <button type="button" onClick={() => navigate("/fare")} style={{ color: "var(--primary-dark)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Fare</span>
        </button>
        <button type="button" onClick={() => navigate("/reports")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Reports</span>
        </button>
      </nav>
    </div>
  );
}
