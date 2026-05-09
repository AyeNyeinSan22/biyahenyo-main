import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function SplashPage() {
  const { user, isInitializing } = useAuth();
  const navigate = useNavigate();
  const nextPath = user ? user.redirectPath : "/login";
  const [visible, setVisible] = useState(false);

  const handleContinue = () => {
    if (isInitializing) {
      return;
    }
    navigate(nextPath);
  };

  useEffect(() => {
    const show = window.setTimeout(() => setVisible(true), 100);
    return () => window.clearTimeout(show);
  }, []);

  useEffect(() => {
    if (isInitializing) {
      return undefined;
    }
    const timer = window.setTimeout(() => {
      navigate(nextPath, { replace: true });
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [navigate, nextPath, isInitializing]);

  return (
    <div className="app-container" style={{ background: "linear-gradient(165deg, #1A1C1E 0%, #2D2F33 40%, #1A1C1E 100%)", overflow: "hidden" }}>
      {/* Animated background pattern */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {/* Road lines */}
        <div className="splash-road-lines" style={{
          position: "absolute",
          bottom: "28%",
          left: 0,
          width: "200%",
          height: "3px",
          background: "repeating-linear-gradient(90deg, rgba(255,204,0,0.3) 0px, rgba(255,204,0,0.3) 20px, transparent 20px, transparent 40px)",
        }} />
        <div className="splash-road-lines-2" style={{
          position: "absolute",
          bottom: "26%",
          left: 0,
          width: "200%",
          height: "2px",
          background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 30px, transparent 30px, transparent 60px)",
        }} />
        {/* Glow orbs */}
        <div style={{
          position: "absolute",
          top: "15%",
          right: "-20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,204,0,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute",
          bottom: "10%",
          left: "-15%",
          width: "250px",
          height: "250px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,204,0,0.06) 0%, transparent 70%)",
        }} />
      </div>

      <section
        className="scrollable-content splash-clickable"
        onClick={handleContinue}
        style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "40px 24px", position: "relative", zIndex: 1 }}
      >
        {/* Status bar */}
        <div className="status-bar" style={{ position: "absolute", top: 0, left: 0, width: "100%", padding: "16px 24px" }}>
          <span style={{ color: "rgba(255,255,255,0.5)" }}>03:16</span>
          <div className="status-icons">
            <span style={{ background: "rgba(255,255,255,0.25)" }} />
            <span style={{ background: "rgba(255,255,255,0.25)" }} />
            <span style={{ background: "rgba(255,255,255,0.25)" }} />
          </div>
        </div>

        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {/* Jeepney illustration */}
          <div className="splash-jeepney-bounce" style={{
            marginBottom: "48px",
            position: "relative",
          }}>
            {/* Headlight glow */}
            <div className="splash-glow-pulse" style={{
              position: "absolute",
              top: "30%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,204,0,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }} />

            <svg width="160" height="120" viewBox="0 0 160 120" fill="none">
              {/* Shadow */}
              <ellipse cx="80" cy="112" rx="55" ry="6" fill="rgba(255,204,0,0.1)"/>

              {/* Back bumper extensions */}
              <rect x="18" y="88" width="6" height="14" rx="2" fill="#FFCC00" opacity="0.6"/>
              <rect x="136" y="88" width="6" height="14" rx="2" fill="#FFCC00" opacity="0.6"/>

              {/* Main body */}
              <rect x="24" y="48" width="112" height="52" rx="8" fill="#FFCC00"/>
              <rect x="24" y="48" width="112" height="52" rx="8" stroke="#E6B800" strokeWidth="2"/>

              {/* Roof */}
              <path d="M32 48 L38 28 L122 28 L128 48" fill="#E6B800" stroke="#CC9F00" strokeWidth="1.5"/>
              <rect x="38" y="28" width="84" height="4" rx="2" fill="#CC9F00"/>

              {/* Roof rack bars */}
              <line x1="50" y1="28" x2="50" y2="32" stroke="#B38A00" strokeWidth="2" strokeLinecap="round"/>
              <line x1="65" y1="28" x2="65" y2="32" stroke="#B38A00" strokeWidth="2" strokeLinecap="round"/>
              <line x1="80" y1="28" x2="80" y2="32" stroke="#B38A00" strokeWidth="2" strokeLinecap="round"/>
              <line x1="95" y1="28" x2="95" y2="32" stroke="#B38A00" strokeWidth="2" strokeLinecap="round"/>
              <line x1="110" y1="28" x2="110" y2="32" stroke="#B38A00" strokeWidth="2" strokeLinecap="round"/>

              {/* Windshield */}
              <rect x="32" y="38" width="96" height="16" rx="4" fill="#87CEEB" opacity="0.7"/>
              <rect x="32" y="38" width="96" height="16" rx="4" stroke="#5BA3C9" strokeWidth="1"/>
              {/* Windshield divider */}
              <line x1="80" y1="38" x2="80" y2="54" stroke="#5BA3C9" strokeWidth="1.5"/>

              {/* Side windows */}
              <rect x="30" y="58" width="18" height="16" rx="3" fill="#87CEEB" opacity="0.5"/>
              <rect x="52" y="58" width="18" height="16" rx="3" fill="#87CEEB" opacity="0.5"/>
              <rect x="74" y="58" width="12" height="16" rx="3" fill="#87CEEB" opacity="0.5"/>
              <rect x="90" y="58" width="18" height="16" rx="3" fill="#87CEEB" opacity="0.5"/>
              <rect x="112" y="58" width="18" height="16" rx="3" fill="#87CEEB" opacity="0.5"/>

              {/* Decorative stripe */}
              <rect x="24" y="78" width="112" height="4" rx="1" fill="#E6B800"/>

              {/* Front bumper */}
              <rect x="28" y="96" width="104" height="6" rx="3" fill="#CC9F00"/>

              {/* Headlights */}
              <circle cx="36" cy="90" r="5" fill="#FFF9C4"/>
              <circle cx="36" cy="90" r="3" fill="#FFEB3B" className="splash-headlight"/>
              <circle cx="124" cy="90" r="5" fill="#FFF9C4"/>
              <circle cx="124" cy="90" r="3" fill="#FFEB3B" className="splash-headlight"/>

              {/* Wheels */}
              <circle cx="48" cy="102" r="10" fill="#333" stroke="#555" strokeWidth="2"/>
              <circle cx="48" cy="102" r="4" fill="#777"/>
              <circle cx="112" cy="102" r="10" fill="#333" stroke="#555" strokeWidth="2"/>
              <circle cx="112" cy="102" r="4" fill="#777"/>

              {/* Side text on body */}
              <text x="80" y="93" textAnchor="middle" fill="#8B6914" fontSize="7" fontWeight="800" fontFamily="var(--font-main)">BIYAHENYO</text>

              {/* Route sign on top */}
              <rect x="52" y="20" width="56" height="10" rx="3" fill="#FFF" opacity="0.9"/>
              <text x="80" y="28" textAnchor="middle" fill="#1A1C1E" fontSize="6" fontWeight="700" fontFamily="var(--font-main)">BATANGAS CITY</text>
            </svg>
          </div>

          {/* Brand text */}
          <div style={{
            textAlign: "center",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
          }}>
            <h1 style={{
              color: "#FFCC00",
              fontSize: "2.8rem",
              fontWeight: 900,
              margin: 0,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              Biyahenyo
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              fontSize: "0.7rem",
              fontWeight: 600,
              margin: "12px 0 0 0",
            }}>
              Your Batangas City Transit Buddy
            </p>
          </div>

          {/* Tagline */}
          <div style={{
            marginTop: "40px",
            textAlign: "center",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
          }}>
            <p style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "1.05rem",
              fontWeight: 500,
              lineHeight: 1.5,
              margin: 0,
            }}>
              Ride smarter with<br/>
              <span style={{ color: "#FFCC00", fontWeight: 700 }}>route-aware</span> navigation
            </p>
          </div>
        </div>

        {/* Bottom loader */}
        <div style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease 1s",
        }}>
          <p style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.1em",
            margin: 0,
          }}>
            TAP TO CONTINUE
          </p>
          <div style={{
            width: "48px",
            height: "4px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
            position: "relative",
            overflow: "hidden",
          }}>
            <div className="splash-loader" style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              background: "linear-gradient(90deg, transparent, #FFCC00, transparent)",
              borderRadius: "10px",
            }} />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes splash-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes splash-glow {
          0%, 100% { opacity: 0.15; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.25; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes splash-headlight-blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.4; }
        }
        @keyframes splash-loader-sweep {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes splash-road-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .splash-jeepney-bounce {
          animation: splash-bounce 3s ease-in-out infinite;
        }
        .splash-glow-pulse {
          animation: splash-glow 3s ease-in-out infinite;
        }
        .splash-headlight {
          animation: splash-headlight-blink 4s ease-in-out infinite;
        }
        .splash-loader {
          animation: splash-loader-sweep 2s ease-in-out infinite;
        }
        .splash-road-lines {
          animation: splash-road-scroll 3s linear infinite;
        }
        .splash-road-lines-2 {
          animation: splash-road-scroll 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
