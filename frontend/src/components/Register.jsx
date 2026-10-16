
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  function EyeIcon({ crossed = false }) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
        {crossed && <path d="M3 3l18 18" />}
      </svg>
    );
  }

  function FeatureIcon({ type }) {
    const paths = {
      ticket: (
        <>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6M8 15l2 2 5-5" />
        </>
      ),
      progress: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </>
      ),
      support: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </>
      ),
    };

    return (
      <svg
        width="23"
        height="23"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths[type]}
      </svg>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login", {
        state: {
          message: "Registration successful! Please log in.",
        },
      });
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Please try again."
          : error.message || "Something went wrong. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="register-page">
      <section className="register-layout">
        {/* Left branding panel */}
        <aside className="register-brand-panel">
          <div className="brand-glow brand-glow-one" />
          <div className="brand-glow brand-glow-two" />

          <Link to="/register" className="brand-logo">
            <span className="brand-logo-icon">
              <svg
                width="37"
                height="37"
                viewBox="0 0 40 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 21v-4a13 13 0 0 1 26 0v4" />
                <rect x="4" y="18" width="7" height="12" rx="3" />
                <rect x="29" y="18" width="7" height="12" rx="3" />
                <path d="M33 30c-2 5-7 6-13 6" />
                <path d="M17 34h4" />
              </svg>
            </span>
            <span className="brand-logo-text">
              Ops<span>Desk</span>
            </span>
          </Link>

          <div className="brand-content">
            <span className="brand-eyebrow">SUPPORT MADE SIMPLE</span>

            <h1>
              Create an account
              <br />
              <span>and take control.</span>
            </h1>

            <p className="brand-description">
              Join OpsDesk and start reporting and tracking your support
              tickets easily.
            </p>

            <div className="brand-features">
              <div className="brand-feature">
                <div className="feature-icon feature-blue">
                  <FeatureIcon type="ticket" />
                </div>
                <div>
                  <h3>Create Tickets</h3>
                  <p>Report your issues quickly</p>
                </div>
              </div>

              <div className="brand-feature">
                <div className="feature-icon feature-purple">
                  <FeatureIcon type="progress" />
                </div>
                <div>
                  <h3>Track Progress</h3>
                  <p>Stay updated with real-time status</p>
                </div>
              </div>

              <div className="brand-feature">
                <div className="feature-icon feature-orange">
                  <FeatureIcon type="support" />
                </div>
                <div>
                  <h3>Get Support</h3>
                  <p>Work together for faster resolution</p>
                </div>
              </div>
            </div>
          </div>

          <div className="brand-footer">
            <span className="footer-status-dot" />
            Your workspace for better support
          </div>

          <div className="brand-decoration" aria-hidden="true">
            <div className="decoration-orbit orbit-one" />
            <div className="decoration-orbit orbit-two" />
            <div className="decoration-square" />
          </div>
        </aside>

        {/* Right registration form */}
        <section className="register-form-panel">
          <div className="register-form-container">
            <div className="form-heading">
              <div className="mobile-brand">
                <span className="mobile-brand-dot">O</span>
                <span>
                  Ops<span>Desk</span>
                </span>
              </div>

              <h2>Create Your Account</h2>
              <p>Sign up to get started with OpsDesk</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="register-field">
                <label htmlFor="name">Full Name</label>
                <div className="input-shell">
                  <svg
                    className="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M5 21v-2a7 7 0 0 1 14 0v2Z" />
                  </svg>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="email">Email Address</label>
                <div className="input-shell">
                  <svg
                    className="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="john@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="password">Password</label>
                <div className="input-shell">
                  <svg
                    className="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <circle cx="12" cy="15" r="1" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <EyeIcon crossed={!showPassword} />
                  </button>
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-shell">
                  <svg
                    className="field-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                    <circle cx="12" cy="15" r="1" />
                  </svg>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((prev) => !prev)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    <EyeIcon crossed={!showConfirmPassword} />
                  </button>
                </div>
              </div>

              <p
                role="status"
                aria-live="polite"
                className={`register-message ${messageType}`}
              >
                {message}
              </p>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="register-spinner" />
                    Creating Account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <p className="register-login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>

            <p className="register-security-note">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              A simpler way to manage your support
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
