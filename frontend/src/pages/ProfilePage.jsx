
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  const name = user?.name || "OpsDesk User";
  const email = user?.email || "Email unavailable";
  const role = user?.role || "user";

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="dashboard-page profile-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT SETTINGS</span>
          <h1>My Profile</h1>
          <p>View your OpsDesk account information.</p>
        </div>

        <Link className="secondary-button" to="/dashboard">
          ← Dashboard
        </Link>
      </div>

      <section className="profile-hero content-card">
        <div className="profile-avatar">{initials || "U"}</div>

        <div className="profile-identity">
          <h2>{name}</h2>
          <p>{email}</p>
          <span className={`profile-role ${role === "admin" ? "admin" : ""}`}>
            {role === "admin" ? "Administrator" : "User account"}
          </span>
        </div>

        <div className="profile-account-status">
          <span className="profile-status-dot" />
          Account active
        </div>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Personal information</h2>
            <p>Your registered account details.</p>
          </div>
          <span className="profile-readonly-label">Read only</span>
        </div>

        <div className="profile-fields">
          <div className="profile-field">
            <span>Full name</span>
            <strong>{name}</strong>
          </div>

          <div className="profile-field">
            <span>Email address</span>
            <strong>{email}</strong>
          </div>

          <div className="profile-field">
            <span>Account role</span>
            <strong>{role === "admin" ? "Administrator" : "User"}</strong>
          </div>

          <div className="profile-field">
            <span>Account ID</span>
            <strong className="profile-account-id">
              {user?._id || user?.id || "Not available"}
            </strong>
          </div>
        </div>
      </section>

      <section className="content-card profile-security-card">
        <div className="profile-security-icon">✓</div>
        <div>
          <h2>Account security</h2>
          <p>
            Your account is protected by OpsDesk authentication.
            Never share your password or login token with anyone.
          </p>
        </div>
      </section>

      <section className="help-banner">
        <div>
          <strong>Need support?</strong>
          <p>Create a ticket if you need help with your account.</p>
        </div>

        <Link className="primary-button compact" to="/tickets/new">
          Create ticket
        </Link>
      </section>
    </div>
  );
}
