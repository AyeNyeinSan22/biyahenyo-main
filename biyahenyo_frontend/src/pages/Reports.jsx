import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllReports, addReport } from "../services/reportService";

export default function ReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newReport, setNewReport] = useState({ reportType: "Traffic jam", location: "", description: "" });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await getAllReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addReport(newReport);
      setShowAdd(false);
      setNewReport({ reportType: "Traffic jam", location: "", description: "" });
      fetchReports();
    } catch (err) {
      console.error(err);
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
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Community Reports</h1>
          <button type="button" className="circle-action" onClick={() => setShowAdd(true)} aria-label="Add Report" style={{ background: "var(--primary)", color: "var(--text-on-primary)", border: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main className="scrollable-content">
        <div style={{ padding: "20px" }}>
          {showAdd && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 2000, display: "grid", placeItems: "center", padding: "20px" }}>
              <div className="premium-card" style={{ width: "100%", maxWidth: "400px", margin: 0, padding: "28px" }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "20px" }}>New Incident Report</h2>
                <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Incident Type</p>
                    <select 
                      value={newReport.reportType} 
                      onChange={(e) => setNewReport({ ...newReport, reportType: e.target.value })}
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 600, outline: "none" }}
                    >
                      <option>Traffic jam</option>
                      <option>Road closure</option>
                      <option>Accident</option>
                      <option>Heavy crowd</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Location</p>
                    <input 
                      type="text" 
                      placeholder="e.g. Diversion Road" 
                      value={newReport.location}
                      onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                      required
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 600, outline: "none" }}
                    />
                  </div>
                  <div>
                    <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px", textTransform: "uppercase" }}>Description</p>
                    <textarea 
                      placeholder="What's happening?"
                      value={newReport.description}
                      onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                      style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontSize: "0.95rem", fontWeight: 600, outline: "none", minHeight: "100px", resize: "none" }}
                    />
                  </div>
                  <div className="row-between" style={{ marginTop: "12px", gap: "12px" }}>
                    <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "14px", borderRadius: "14px", fontWeight: 700, color: "var(--text-muted)", background: "var(--bg-app)" }}>Cancel</button>
                    <button type="submit" className="primary-btn" style={{ flex: 1.5, height: "50px" }}>Submit Report</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: "16px" }}>
            {loading ? (
              <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px" }}>Loading community updates...</p>
            ) : reports.map((report) => (
              <div key={report.id} className="premium-card" style={{ margin: 0, padding: "20px" }}>
                <div className="row-between" style={{ marginBottom: "12px" }}>
                  <span className="badge" style={{ 
                    background: report.reportType === "Accident" ? "var(--accent)" : "var(--primary)",
                    color: report.reportType === "Accident" ? "#FFF" : "var(--text-on-primary)"
                  }}>
                    {report.reportType}
                  </span>
                  <small style={{ color: "var(--text-muted)", fontWeight: 600 }}>{new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 4px 0" }}>{report.location}</h3>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.5 }}>{report.description}</p>
                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-light)", display: "flex", gap: "12px" }}>
                   <button style={{ fontSize: "0.8rem", color: "var(--primary-dark)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                     Helpful
                   </button>
                   <button style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                     Comment
                   </button>
                </div>
              </div>
            ))}
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
        <button type="button" onClick={() => navigate("/transport")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L5 19"/><path d="M17 17L19 19"/><rect x="3" y="11" width="18" height="8" rx="2"/><path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Guide</span>
        </button>
        <button type="button" onClick={() => navigate("/fare")} style={{ color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>Fare</span>
        </button>
        <button type="button" onClick={() => navigate("/reports")} style={{ color: "var(--primary-dark)", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Reports</span>
        </button>
      </nav>
    </div>
  );
}
