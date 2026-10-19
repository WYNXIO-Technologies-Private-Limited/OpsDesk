import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const userLinks = [
  ["▦", "Dashboard", "/dashboard"],
  ["▤", "My Tickets", "/tickets"],
  ["＋", "Create Ticket", "/tickets/new"],
  ["♧", "Profile", "/profile"]
];
const adminLinks = [
  ["▦", "Dashboard", "/admin"],
  ["▤", "All Tickets", "/admin/tickets"],
  ["♙", "Users", "/admin/users"]
];

export default function DashboardLayout({ admin = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = admin ? adminLinks : userLinks;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="brand-mark">◉</span> Ops<span>Desk</span></div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {links.map(([icon, label, to]) => (
            <NavLink
  key={to}
  to={to}
  end
  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
>
              <span className="nav-icon">{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <button className="logout-button" onClick={handleLogout}>↪ <span>Logout</span></button>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-search">⌕ <span>Support workspace</span></div>
          <div className="topbar-user"><span className="avatar">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span><span><strong>{user?.name}</strong><small>{admin ? "Administrator" : "User"}</small></span></div>
        </header>
        <section className="page-content"><Outlet /></section>
      </main>
    </div>
  );
}
