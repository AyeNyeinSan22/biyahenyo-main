import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import AuthShell from "../components/AuthShell";

const roles = [
  { label: "Passenger", value: "USER" },
  { label: "Driver", value: "DRIVER" },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { saveUser, user } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "USER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.redirectPath, { replace: true });
    }
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsSubmitting(false);
      return;
    }

    if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      setError("Password must contain at least one letter and one number.");
      setIsSubmitting(false);
      return;
    }

    try {
      await register(form);
      // Registration successful: Do not auto-login. Redirect them to login page.
      navigate("/login", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create an Account"
      subtitle="Join to plan, track, and ride smarter."
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkLabel="Login"
    >
      <form className="auth-form" onSubmit={handleSubmit} aria-label="Sign up form" style={{ display: "grid", gap: "14px" }}>
        <div className="field">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Full Name</span>
          <div className="premium-card" style={{ margin: 0, padding: "12px", background: "var(--bg-app)" }}>
            <input
              type="text"
              name="fullName"
              id="fullName"
              autoComplete="name"
              placeholder="Enter Full Name"
              value={form.fullName}
              onChange={handleChange}
              required
              style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: "0.95rem", color: "var(--text-main)" }}
            />
          </div>
        </div>

        <div className="field">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Email</span>
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
              style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: "0.95rem", color: "var(--text-main)" }}
            />
          </div>
        </div>

        <div className="field">
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Password</span>
          <div className="premium-card" style={{ margin: 0, padding: "12px", background: "var(--bg-app)", position: "relative" }}>
            <div className="password-field" style={{ display: "flex", alignItems: "center" }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                autoComplete="new-password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                style={{ width: "100%", border: "none", background: "none", outline: "none", fontSize: "0.95rem", color: "var(--text-main)" }}
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

        <div className="role-picker" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {roles.map((role) => (
            <button
              key={role.value}
              type="button"
              className={form.role === role.value ? "role-chip active" : "role-chip"}
              onClick={() => setForm((current) => ({ ...current, role: role.value }))}
              style={{
                height: "44px",
                borderRadius: "12px",
                border: form.role === role.value ? "2px solid var(--primary)" : "1px solid var(--border-medium)",
                background: form.role === role.value ? "var(--primary-light)" : "var(--bg-surface)",
                color: form.role === role.value ? "var(--text-on-primary)" : "var(--text-main)",
                fontWeight: 700,
                fontSize: "0.85rem",
                transition: "all 0.2s ease"
              }}
            >
              {role.label}
            </button>
          ))}
        </div>

        {error ? <p className="form-error" role="alert">{error}</p> : null}

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
          {isSubmitting ? "Signing Up..." : "Sign Up"}
        </button>
      </form>

    </AuthShell>
  );
}
