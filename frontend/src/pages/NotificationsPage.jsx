
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function NotificationsPage() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const ticketsPath =
    user?.role === "admin" ? "/admin/tickets" : "/tickets";

  const loadNotifications = useCallback(async () => {
    try {
      const data = await apiRequest("/notifications");

      setNotifications(data.notifications || []);
      setUnreadCount(
        data.unreadCount ??
          (data.notifications || []).filter(
            (item) => !item.readAt
          ).length
      );

      setError("");
    } catch (err) {
      setError(
        err.message || "Could not load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  async function markRead(id) {
    setUpdatingId(id);
    setError("");

    try {
      await apiRequest(`/notifications/${id}/read`, {
        method: "PATCH",
      });

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Could not mark notification as read.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    setError("");

    try {
      await apiRequest("/notifications/read-all", {
        method: "PATCH",
      });

      await loadNotifications();
    } catch (err) {
      setError(err.message || "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString();
  }

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">WORKSPACE</span>
          <h1>Notifications</h1>
          <p>
            Stay informed about ticket submissions and status updates.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={markAllRead}
          disabled={loading || markingAll || unreadCount === 0}
        >
          {markingAll ? "Updating..." : "Mark all as read"}
        </button>
      </div>

      {error && (
        <div className="notice error" role="alert">
          {error}
          <button
            type="button"
            onClick={loadNotifications}
            disabled={loading}
            style={{
              marginLeft: "12px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      <section className="content-card notification-list">
        <div className="card-heading">
          <div>
            <h2>Your notifications</h2>
            <p>
              {unreadCount} unread notification
              {unreadCount === 1 ? "" : "s"}
            </p>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadNotifications}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="loading-text">
            Loading notifications...
          </p>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <span className="notification-empty-icon">
              ♧
            </span>
            <h3>You're all caught up</h3>
            <p>New ticket updates will appear here.</p>
          </div>
        ) : (
          <div className="notification-items">
            {notifications.map((item) => {
              const isUnread = !item.readAt;

              return (
                <article
                  key={item._id}
                  className={`notification-item ${
                    isUnread ? "is-unread" : "is-read"
                  }`}
                >
                  <span className="notification-item-icon">
                    {item.type === "status_changed"
                      ? "↻"
                      : item.type === "ticket_created"
                        ? "＋"
                        : "▤"}
                  </span>

                  <div className="notification-item-content">
                    <div className="notification-item-heading">
                      <h3>
                        {item.title || "Ticket notification"}
                      </h3>

                      {isUnread && (
                        <span
                          className="notification-unread-dot"
                          aria-label="Unread"
                        />
                      )}
                    </div>

                    <p>{item.message}</p>

                    <small>
                      {formatDate(item.createdAt)}
                    </small>

                    {item.ticket && (
                      <div>
                        <Link
                          to={ticketsPath}
                          className="notification-ticket-link"
                        >
                          View tickets →
                        </Link>
                      </div>
                    )}
                  </div>

                  {isUnread && (
                    <button
                      type="button"
                      className="notification-read-button"
                      onClick={() => markRead(item._id)}
                      disabled={
                        updatingId === item._id || markingAll
                      }
                    >
                      {updatingId === item._id
                        ? "Updating..."
                        : "Mark read"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
