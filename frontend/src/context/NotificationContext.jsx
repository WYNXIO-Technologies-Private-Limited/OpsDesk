import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";
import { useAuth } from "./AuthContext";
import { NotificationContext } from "./notificationContextCore";

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiRequest("/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return undefined;
    }
    const initialLoadId = window.setTimeout(refreshNotifications, 0);
    const intervalId = window.setInterval(refreshNotifications, 30000);
    const onFocus = () => refreshNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearTimeout(initialLoadId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, refreshNotifications]);

  const markRead = useCallback(async (id) => {
    const current = notifications.find((item) => item._id === id);
    if (!current || current.isRead) return;
    setNotifications((items) => items.map((item) => item._id === id ? { ...item, isRead: true } : item));
    setUnreadCount((count) => Math.max(0, count - 1));
    try {
      await apiRequest(`/notifications/${id}/read`, { method: "PATCH" });
    } catch (requestError) {
      await refreshNotifications();
      throw requestError;
    }
  }, [notifications, refreshNotifications]);

  const markAllRead = useCallback(async () => {
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
    try {
      await apiRequest("/notifications/read-all", { method: "PATCH" });
    } catch (requestError) {
      setNotifications(previous);
      await refreshNotifications();
      throw requestError;
    }
  }, [notifications, refreshNotifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markRead,
    markAllRead
  }), [notifications, unreadCount, loading, error, refreshNotifications, markRead, markAllRead]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
