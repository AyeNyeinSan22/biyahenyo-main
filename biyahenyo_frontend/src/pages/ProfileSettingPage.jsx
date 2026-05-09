import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useAuth } from "../auth/AuthContext";

export default function ProfileSettingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);
  
  const [profileData, setProfileData] = useState({
    avatar: user?.avatar || null,
    name: user?.name || "User Profile",
    email: user?.email || "",
    phone: user?.phone || "+63 (XXX) XXX-XXXX",
    joinDate: user?.joinDate || "Member since Jan 2024",
    rideCount: user?.rideCount || 0,
  });

  const [recentTrips] = useState([
    {
      id: 1,
      from: "BSU Alangilan Entrance",
      to: "SM City Batangas",
      date: "May 8, 2026",
      time: "2:30 PM",
      vehicle: "Jeepney",
      fare: "₱ 15.00",
      duration: "43 mins",
      status: "Completed",
      rating: 5,
    },
    {
      id: 2,
      from: "Batangas City Hall",
      to: "Anilao Port",
      date: "May 6, 2026",
      time: "10:15 AM",
      vehicle: "Tricycle",
      fare: "₱ 8.00",
      duration: "12 mins",
      status: "Completed",
      rating: 4,
    },
    {
      id: 3,
      from: "Lipa City Terminal",
      to: "NASOG",
      date: "May 4, 2026",
      time: "5:45 PM",
      vehicle: "Jeepney",
      fare: "₱ 12.00",
      duration: "35 mins",
      status: "Completed",
      rating: 5,
    },
  ]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          avatar: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getAverageRating = () => {
    if (recentTrips.length === 0) return 0;
    const sum = recentTrips.reduce((acc, trip) => acc + (trip.rating || 0), 0);
    return (sum / recentTrips.length).toFixed(1);
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
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0 }}>Profile</h1>
          <button type="button" className="circle-action" aria-label="More">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
        </div>
      </header>

      <main className="scrollable-content">
        <div style={{ padding: "20px" }}>
          {/* Profile Card */}
          <div className="premium-card" style={{ margin: "0 0 24px 0", padding: "32px 20px", textAlign: "center", background: "linear-gradient(135deg, var(--primary-light) 0%, var(--bg-surface) 100%)" }}>
            {/* Avatar Upload */}
            <div style={{ position: "relative", margin: "0 auto 20px", width: 100, height: 100 }}>
              <div
                onClick={handleAvatarClick}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: profileData.avatar
                    ? `url(${profileData.avatar})`
                    : "var(--primary)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  border: "3px solid var(--primary)",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {!profileData.avatar && (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                )}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "var(--accent)",
                    borderRadius: "50%",
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid white",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
                aria-label="Upload profile picture"
              />
            </div>

            {/* User Info */}
            <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0 0 8px", color: "var(--text-main)" }}>
              {profileData.name}
            </h2>
            <p style={{ margin: "0 0 4px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {profileData.email}
            </p>
            <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
              {profileData.joinDate}
            </p>

            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div className="premium-card" style={{ margin: 0, padding: "12px", background: "rgba(255,255,255,0.5)" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Rides</p>
                <strong style={{ display: "block", fontSize: "1.4rem", margin: "4px 0", color: "var(--primary)" }}>
                  {profileData.rideCount}
                </strong>
              </div>
              <div className="premium-card" style={{ margin: 0, padding: "12px", background: "rgba(255,255,255,0.5)" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Avg Rating</p>
                <strong style={{ display: "block", fontSize: "1.4rem", margin: "4px 0", color: "var(--accent)" }}>
                  {getAverageRating()}⭐
                </strong>
              </div>
            </div>
          </div>

          {/* Recent Trips Section */}
          <section style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Recent Trips
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {recentTrips.map((trip) => (
                <div key={trip.id} className="premium-card" style={{ margin: 0, padding: "16px" }}>
                  <div className="row-between" style={{ marginBottom: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        {trip.date} at {trip.time}
                      </p>
                      <strong style={{ display: "block", fontSize: "0.95rem", marginTop: "4px", color: "var(--text-main)" }}>
                        {trip.from}
                      </strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        → {trip.to}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "80px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: "var(--primary-light)",
                          color: "var(--primary-dark)",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          marginBottom: "8px",
                        }}
                      >
                        {trip.vehicle}
                      </span>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        Rating
                      </p>
                      <strong style={{ display: "block", fontSize: "0.95rem", color: "var(--accent)" }}>
                        {"⭐".repeat(trip.rating)}
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      paddingTop: "12px",
                      borderTop: "1px solid var(--border-light)",
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Duration</p>
                      <strong style={{ fontSize: "0.95rem" }}>{trip.duration}</strong>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>Fare Paid</p>
                      <strong style={{ fontSize: "0.95rem", color: "var(--primary)" }}>{trip.fare}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {recentTrips.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 16px", opacity: 0.5 }}>
                  <path d="M7 17L5 19L7 17ZM17 17L19 19L17 17ZM5 7L7 5L5 7ZM19 7L17 5L19 7Z"/>
                  <rect x="3" y="11" width="18" height="8" rx="2"/>
                  <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
                </svg>
                <p style={{ fontSize: "1rem", margin: "0 0 8px" }}>No trips yet</p>
                <p style={{ fontSize: "0.9rem", margin: "0" }}>Start your first ride to see it here</p>
              </div>
            )}
          </section>

          {/* Account Settings Section */}
          <section style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "16px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Account
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <button
                type="button"
                className="premium-card"
                style={{
                  margin: 0,
                  padding: "16px",
                  border: "none",
                  background: "var(--bg-surface)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--primary-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-surface)";
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <strong>Edit Profile</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>Update your information</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              <button
                type="button"
                className="premium-card"
                style={{
                  margin: 0,
                  padding: "16px",
                  border: "none",
                  background: "var(--bg-surface)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--primary-light)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-surface)";
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <strong>Payment Methods</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>Manage payment options</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid var(--accent)",
                  background: "transparent",
                  color: "var(--accent)",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 90, 95, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Logout
              </button>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
