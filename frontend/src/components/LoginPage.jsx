
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message || "");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage("Demo only: connect this form to the authentication API.");
  }

  return (
    <main className="login-page">
      <section className="login-layout">
        {/* Left branding panel */}
        <aside className="login-brand-panel">
          <div className="login-brand-glow" />

          <Link to="/login" className="login-brand-logo">
            <span className="login-brand-icon">
              <svg
                width="52"
                height="52"
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
            <span>
              Ops<span className="login-brand-accent">Desk</span>
            </span>
          </Link>

          <div className="login-brand-content">
            <h1>
              IT Support &amp; Incident
              <br />
              Management System
            </h1>

            <p className="login-brand-description">
              Report issues. Track progress.
              <br />
              Get support.
            </p>

            <div className="login-illustration" aria-hidden="true">
              <div className="illustration-orbit orbit-a" />
              <div className="illustration-orbit orbit-b" />

              <div className="floating-message message-left">
                <span />
                <span />
              </div>

              <div className="floating-message message-top">
                <span />
                <span />
                <span />
              </div>

              <div className="floating-user">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
              </div>

              <div className="illustration-person">
                <div className="person-hair" />
                <div className="person-head">
                  <div className="person-ear" />
                  <div className="person-eye" />
                </div>
                <div className="person-neck" />
                <div className="person-body" />
                <div className="person-arm" />
                <div className="person-laptop">
                  <div className="laptop-screen">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="laptop-base" />
                </div>
              </div>

              <div className="illustration-desk" />
            </div>
          </div>

          <div className="login-brand-benefits">
            <div>
              <span className="benefit-icon">↗</span>
              <span>Fast Support</span>
            </div>
            <div>
              <span className="benefit-icon">▣</span>
              <span>Track Issues</span>
            </div>
            <div>
              <span className="benefit-icon">▥</span>
              <span>Better Productivity</span>
            </div>
          </div>
        </aside>

        {/* Right login form */}
        <section className="login-form-panel">
          <div className="login-form-container">
            <div className="login-form-heading">
              <div className="login-mobile-brand">
                <span className="login-mobile-brand-icon">O</span>
                <span>Ops<span>Desk</span></span>
              </div>

              <h2>Welcome Back</h2>
              <p>Login to your OpsDesk account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="login-input-shell">
                <svg className="login-input-icon" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>

                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="user@example.com"
                  autoComplete="email"
                  aria-label="Email address"
                  required
                />
              </div>

              <div className="login-input-shell">
                <svg className="login-input-icon" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  <circle cx="12" cy="15" r="1" />
                </svg>

                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-label="Password"
                  required
                />

                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true">
                    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                    {!showPassword && <path d="M3 3l18 18" />}
                  </svg>
                </button>
              </div>

              <div className="login-options">
                <label className="login-remember">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="login-forgot"
                  onClick={() =>
                    setMessage("Password reset is not configured yet.")
                  }
                >
                  Forgot Password?
                </button>
              </div>

              <p
                className="login-message"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>

              <button type="submit" className="login-submit">
                Login
              </button>
            </form>

            <div className="login-divider">
              <span />
              <p>or continue with</p>
              <span />
            </div>

            <div className="login-social-buttons">
              <button
                type="button"
                aria-label="Google login unavailable"
                title="Google login is not configured"
              >
                <svg viewBox="0 0 48 48" width="22" height="22"
                  aria-hidden="true">
                  <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z" />
                  <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z" />
                  <path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z" />
                  <path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.9-5.9C34.1 5.9 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="GitHub login unavailable"
                title="GitHub login is not configured"
              >
                <svg viewBox="0 0 24 24" width="21" height="21"
                  fill="currentColor" aria-hidden="true">
                  <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15.99 1.7 2.6 1.21 3.23.92.1-.72.39-1.21.7-1.49-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.08 1.15a10.7 10.7 0 0 1 5.6 0c2.14-1.45 3.08-1.15 3.08-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.25-5.1 5.52.4.35.75 1.02.75 2.06v3.06c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
                </svg>
              </button>

              <button
                type="button"
                aria-label="Microsoft login unavailable"
                title="Microsoft login is not configured"
              >
                <svg viewBox="0 0 24 24" width="21" height="21"
                  aria-hidden="true">
                  <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
                  <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
                  <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
                  <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
                </svg>
              </button>
            </div>

            <p className="login-signup-link">
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
