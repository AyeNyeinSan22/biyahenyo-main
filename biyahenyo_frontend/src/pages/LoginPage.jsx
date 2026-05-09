import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import AuthShell from "../components/AuthShell";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveUser, user, logout } = useAuth();
  const didForceSwitchRef = useRef(false);
  const searchParams = new URLSearchParams(location.search);
  const forceSwitch = searchParams.get("switch") === "1" || searchParams.get("switch") === "true";
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (forceSwitch && !didForceSwitchRef.current) {
      didForceSwitchRef.current = true;
      logout();
      setShowSwitchPrompt(false);
      return;
    }

    setShowSwitchPrompt(Boolean(user) && !forceSwitch);
  }, [forceSwitch, logout, navigate, user]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const authPayload = await login({
        email: form.email,
        password: form.password,
      });

      saveUser(authPayload, form.rememberMe);
      navigate(location.state?.from || authPayload.redirectPath, { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome Back"
      subtitle="Access your transportation info in seconds."
      footerText="Don't have an account?"
      footerLink="/signup"
      footerLinkLabel="Create Account"
    >
      {showSwitchPrompt ? (
        <div className="premium-card" style={{ margin: 0, padding: "16px", display: "grid", gap: "12px" }}>
          <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700 }}>You are already signed in as {user?.email}.</p>
          <div style={{ display: "grid", gap: "10px" }}>
            <button
              type="button"
              className="primary-btn"
              onClick={() => navigate(user?.redirectPath || "/home", { replace: true })}
              style={{ height: "46px" }}
            >
              Continue
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                setShowSwitchPrompt(false);
              }}
              style={{ height: "46px", borderRadius: "14px", border: "1px solid var(--border-medium)", background: "var(--bg-app)", fontWeight: 700 }}
            >
              Switch account
            </button>
          </div>
        </div>
      ) : (
      <form className="auth-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
        <div className="field">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Email</span>
          <div className="premium-card" style={{ margin: 0, padding: "12px", background: "var(--bg-app)" }}>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              placeholder="Enter Email"
              value={form.email}
              onChange={handleChange}
              required
              style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: "1rem", color: "var(--text-main)" }}
            />
          </div>
        </div>

        <div className="field">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px", display: "block" }}>Password</span>
          <div className="premium-card" style={{ margin: 0, padding: "12px", background: "var(--bg-app)", position: "relative" }}>
            <div className="password-field" style={{ display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: "1rem", color: "var(--text-main)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                style={{ color: "var(--primary-dark)", fontWeight: 700, fontSize: "0.8rem" }}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>
        </div>

        <div className="row-between" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="remember-row" style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              style={{ width: "16px", height: "16px", accentColor: "var(--primary-dark)" }}
            />
            <span style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-muted)" }}>Remember Me</span>
          </label>
          <span className="hint-link" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--primary-dark)" }}>Forgot password?</span>
        </div>

        {error ? <p className="form-error" style={{ color: "#FF3B30", fontSize: "0.85rem", margin: 0 }}>{error}</p> : null}

        <button 
          type="submit" 
          className="primary-btn pulse-animation" 
          disabled={isSubmitting}
          style={{ 
            width: "100%", 
            height: "50px", 
            background: "var(--primary)", 
            color: "var(--text-on-primary)", 
            fontSize: "1rem", 
            fontWeight: 700,
            borderRadius: "14px",
            boxShadow: "var(--shadow-md)"
          }}
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
      )}

    </AuthShell>
  );
}
