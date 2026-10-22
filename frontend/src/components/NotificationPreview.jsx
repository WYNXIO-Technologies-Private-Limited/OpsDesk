import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/useNotifications";

function relativeTime(value) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function NotificationPreview() {
  const { user } = useAuth();
  const { notifications, loading } = useNotifications();
  const path = user?.role === "admin" ? "/admin/notifications" : "/notifications";

  return (
    <section className="content-card notification-preview">
      <div className="card-heading">
        <div><h2>Notifications</h2><p>Recent ticket activity</p></div>
        <Link to={path}>View all →</Link>
      </div>
      {loading ? <p className="loading-text">Loading notifications…</p> : notifications.length ? (
        <div className="notification-preview-list">
          {notifications.slice(0, 4).map((item) => (
            <Link className={`notification-preview-item ${item.isRead ? "read" : "unread"}`} to={path} key={item._id}>
              <span className={`notification-symbol ${item.type}`} aria-hidden="true">{item.type === "status_changed" ? "↻" : item.type === "new_ticket" ? "＋" : "✓"}</span>
              <span className="notification-preview-copy"><strong>{item.title}</strong><small>{item.message}</small></span>
              <time>{relativeTime(item.createdAt)}</time>
            </Link>
          ))}
        </div>
      ) : (
        <div className="notification-preview-empty">No ticket updates yet. We’ll let you know when something happens.</div>
      )}
    </section>
  );
}
