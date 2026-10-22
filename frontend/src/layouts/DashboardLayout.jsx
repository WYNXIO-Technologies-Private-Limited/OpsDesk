
import { useCallback, useEffect, useState } from "react";
import {
  NavLink,
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../services/api";


const userLinks = [
  ["▦", "Dashboard", "/dashboard"],
  ["▤", "My Tickets", "/tickets"],
  ["＋", "Create Ticket", "/tickets/new"],
  ["♧", "Notifications", "/notifications"],
  ["♙", "Profile", "/profile"],
];

const adminLinks = [
  ["▦", "Dashboard", "/admin"],
  ["▤", "All Tickets", "/admin/tickets"],
  ["♙", "Users", "/admin/users"],
  ["▥", "Reports", "/admin/reports"],
  ["⚙", "Settings", "/admin/settings"],
  ["♧", "Notifications", "/notifications"],
];


export default function DashboardLayout({ admin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState("");

  const links = admin ? adminLinks : userLinks;

  const refreshUnreadCount = useCallback(async () => {
    try {
      const data = await apiRequest("/notifications");
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Keep the dashboard available if notifications cannot be fetched.
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    const interval = setInterval(refreshUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [refreshUnreadCount]);

  useEffect(() => {
    const message = location.state?.toast;

    if (!message) return;

    setToast(message);

    // Clear navigation state so refreshing doesn't repeat the toast.
    navigate(location.pathname, {
      replace: true,
      state: null,
    });

    const timeout = setTimeout(() => setToast(""), 4000);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.state, navigate]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">◉</span>
          Ops<span>Desk</span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          {links.map(([icon, label, to]) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{icon}</span>
              {label}

              {to === "/notifications" && unreadCount > 0 && (
                <span className="sidebar-unread-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          ↪ <span>Logout</span>
        </button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-search">
            ⌕ <span>Support workspace</span>
          </div>

          <div className="topbar-actions">
            <Link
              to="/notifications"
              className="notification-bell"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <span aria-hidden="true">♧</span>

              {unreadCount > 0 && (
                <span className="notification-bell-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="topbar-user">
              <span className="avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>

              <span>
                <strong>{user?.name || "User"}</strong>
                <small>{admin ? "Administrator" : "User"}</small>
              </span>
            </div>
          </div>
        </header>

        {toast && (
          <div className="app-toast" role="status">
            <span>✓</span>
            {toast}
            <button
              type="button"
              onClick={() => setToast("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
