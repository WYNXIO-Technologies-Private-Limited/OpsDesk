import { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage(
      "Demo only: connect this form to the authentication API."
    );
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>OpsDesk</h1>
        <h2>Welcome Back</h2>
        <p>Sign in to your support account</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>

          <label className="remember">
            <input type="checkbox" />
            Remember me
          </label>

          <button type="submit">Login</button>
          <p role="status">{message}</p>
        </form>

        <p>
          Don't have an account?{" "}
          <a href="/signup">Sign up</a>
        </p>
      </section>
    </main>
  );
}