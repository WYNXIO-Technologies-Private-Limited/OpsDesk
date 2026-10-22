import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/useNotifications";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, error, markRead, markAllRead } = useNotifications();
  const [filter, setFilter] = useState("all");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const visibleNotifications = filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications;
  const ticketsPath = user?.role === "admin" ? "/admin/tickets" : "/tickets";

  async function openTicket(notification) {
    setActionError("");
    try {
      await markRead(notification._id);
    } catch (requestError) {
      setActionError(requestError.message || "Could not update notification status.");
    }
    navigate(ticketsPath);
  }

  async function handleMarkAllRead() {
    setActionError("");
    try {
      await markAllRead();
    } catch (requestError) {
      setActionError(requestError.message || "Could not update notifications.");
    }
  }

  return (
    <div className="dashboard-page notifications-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE UPDATES</span>
          <h1>Notifications</h1>
          <p>Stay up to date with ticket activity and changes.</p>
        </div>
        <button className="secondary-button" onClick={handleMarkAllRead} disabled={!unreadCount}>
          Mark all as read
        </button>
      </div>

      {actionError && <div className="notice error" role="alert">{actionError}</div>}
      {error && <div className="notice error" role="alert">{error}</div>}

      <section className="content-card notification-card">
        <div className="notification-toolbar">
          <div className="notification-filters" role="group" aria-label="Filter notifications">
            <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}>All <span>{notifications.length}</span></button>
            <button className={filter === "unread" ? "selected" : ""} onClick={() => setFilter("unread")}>Unread <span>{unreadCount}</span></button>
          </div>
          <span className="notification-total">{unreadCount} unread</span>
        </div>

        {loading ? <p className="loading-text">Loading notifications…</p> : visibleNotifications.length ? (
          <div className="notification-list">
            {visibleNotifications.map((notification) => (
              <article className={`notification-item ${notification.isRead ? "read" : "unread"}`} key={notification._id}>
                <span className={`notification-symbol ${notification.type}`} aria-hidden="true">
                  {notification.type === "status_changed" ? "↻" : notification.type === "new_ticket" ? "＋" : "✓"}
                </span>
                <div className="notification-copy">
                  <div className="notification-title-row">
                    <h2>{notification.title}</h2>
                    {!notification.isRead && <span className="unread-dot" aria-label="Unread" />}
                  </div>
                  <p>{notification.message}</p>
                  {notification.ticket && <small>Ticket: {notification.ticket.title}</small>}
                  <time dateTime={notification.createdAt}>{formatDate(notification.createdAt)}</time>
                </div>
                <button className="notification-open" onClick={() => openTicket(notification)}>
                  View ticket <span aria-hidden="true">→</span>
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state notification-empty">
            <div>♧</div>
            <strong>{filter === "unread" ? "You’re all caught up" : "No notifications yet"}</strong>
            <p>{filter === "unread" ? "New unread updates will appear here." : "Ticket updates will show up here when there’s something new."}</p>
          </div>
        )}
      </section>
    </div>
  );
}
