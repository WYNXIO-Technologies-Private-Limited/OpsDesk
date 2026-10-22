
import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";

const defaultPreferences = {
  ticketCreated: true,
  ticketStatusChanged: true,
  ticketAssigned: true,
};

export default function AdminSettings() {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const result = await apiRequest("/admin/settings");

        if (!active) return;

        setProfile({
          name: result.user.name || "",
          email: result.user.email || "",
        });

        setPreferences({
          ...defaultPreferences,
          ...(result.user.notificationPreferences || {}),
        });
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load settings.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function saveProfile(event) {
    event.preventDefault();
    clearMessages();
    setSaving(true);

    try {
      const result = await apiRequest("/admin/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: profile.name }),
      });

      setProfile((current) => ({
        ...current,
        name: result.user.name,
      }));

      setSuccess(result.message);
    } catch (err) {
      setError(err.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    clearMessages();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);

    try {
      const result = await apiRequest("/admin/settings/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess(result.message);
    } catch (err) {
      setError(err.message || "Could not change password.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNotifications(event) {
    event.preventDefault();
    clearMessages();
    setSaving(true);

    try {
      const result = await apiRequest(
        "/admin/settings/notifications",
        {
          method: "PATCH",
          body: JSON.stringify({
            notificationPreferences: preferences,
          }),
        }
      );

      setPreferences({
        ...defaultPreferences,
        ...(result.user.notificationPreferences || {}),
      });

      setSuccess(result.message);
    } catch (err) {
      setError(err.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="loading-text">Loading administrator settings…</p>;
  }

  return (
    <div className="dashboard-page narrow-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Settings</h1>
          <p>Manage your administrator account and preferences.</p>
        </div>
      </div>

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="notice success" role="status">
          {success}
        </div>
      )}

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Administrator profile</h2>
            <p>Update your account details.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={saveProfile}>
          <label>
            Full name
            <input
              value={profile.name}
              onChange={(e) =>
                setProfile({ ...profile, name: e.target.value })
              }
              maxLength={100}
              required
            />
          </label>

          <label>
            Email address
            <input value={profile.email} readOnly />
            <small>Email editing is not enabled.</small>
          </label>

          <button className="primary-button" disabled={saving}>
            Save profile
          </button>
        </form>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Change password</h2>
            <p>Verify your current password before changing it.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={changePassword}>
          <label>
            Current password
            <input
              type="password"
              autoComplete="current-password"
              value={passwords.currentPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  currentPassword: e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={passwords.newPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  newPassword: e.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={passwords.confirmPassword}
              onChange={(e) =>
                setPasswords({
                  ...passwords,
                  confirmPassword: e.target.value,
                })
              }
              required
            />
          </label>

          <button className="primary-button" disabled={saving}>
            Change password
          </button>
        </form>
      </section>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Notification preferences</h2>
            <p>
              Choose which ticket events you want to enable preferences for.
            </p>
          </div>
        </div>

        <form className="settings-form" onSubmit={saveNotifications}>
          <label className="settings-toggle">
            <span>
              <strong>Ticket created</strong>
              <small>Preference for newly created tickets.</small>
            </span>
            <input
              type="checkbox"
              checked={preferences.ticketCreated}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  ticketCreated: e.target.checked,
                })
              }
            />
          </label>

          <label className="settings-toggle">
            <span>
              <strong>Ticket status changed</strong>
              <small>Preference for ticket status updates.</small>
            </span>
            <input
              type="checkbox"
              checked={preferences.ticketStatusChanged}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  ticketStatusChanged: e.target.checked,
                })
              }
            />
          </label>

          <label className="settings-toggle">
            <span>
              <strong>Ticket assigned</strong>
              <small>Preference for ticket assignments.</small>
            </span>
            <input
              type="checkbox"
              checked={preferences.ticketAssigned}
              onChange={(e) =>
                setPreferences({
                  ...preferences,
                  ticketAssigned: e.target.checked,
                })
              }
            />
          </label>

          <button className="primary-button" disabled={saving}>
            Save preferences
          </button>
        </form>
      </section>
    </div>
  );
}
