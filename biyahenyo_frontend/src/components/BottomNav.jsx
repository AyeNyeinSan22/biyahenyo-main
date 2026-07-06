import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      path: "/home", 
      label: "Home", 
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    { 
      path: "/routes", 
      label: "Routes", 
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
          <line x1="8" y1="2" x2="8" y2="18"/>
          <line x1="16" y1="6" x2="16" y2="22"/>
        </svg>
      )
    },
    { 
      path: "/transport", 
      label: "Guide", 
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17L5 19"/><path d="M17 17L19 19"/>
          <rect x="3" y="11" width="18" height="8" rx="2"/>
          <path d="M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4"/>
          <circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/>
        </svg>
      )
    },
    { 
      path: "/fare", 
      label: "Fare", 
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
          <path d="M7 15h.01M12 15h.01M17 15h.01"/>
        </svg>
      )
    },
    { 
      path: "/profile-setting", 
      label: "Settings", 
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.98 2.98l4.24 4.24M1 12h6m6 0h6m-14.78 7.78l4.24-4.24m2.98-2.98l4.24-4.24"/>
        </svg>
      )
    },
  ];

  return (
    <nav className="fixed-bottom-nav" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={isActive ? "nav-active" : ""}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            style={{
              color: isActive ? "var(--primary-dark)" : "var(--text-muted)",
            }}
          >
            {isActive && (
              <div 
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "28px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "var(--primary-dark)",
                }}
              />
            )}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              transition: "transform 0.2s ease",
              transform: isActive ? "translateY(-1px)" : "none",
            }}>
              {item.icon(isActive)}
            </div>
            <span style={{ 
              fontSize: "0.6rem", 
              fontWeight: isActive ? 700 : 500,
              letterSpacing: "0.03em",
              lineHeight: 1,
              transition: "all 0.2s ease",
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
