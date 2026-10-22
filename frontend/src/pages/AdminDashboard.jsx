
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import StatCard from "../components/StatCard";
import TicketTable from "../components/TicketTable";
import NotificationPreview from "../components/NotificationPreview";
import { useNotifications } from "../context/useNotifications";

export default function AdminDashboard() {
  const { refreshNotifications } = useNotifications();
  const [overview, setOverview] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [summary, allTickets] = await Promise.all([
        apiRequest("/admin/overview"),
        apiRequest("/tickets"),
      ]);

      setOverview(summary);
      setTickets(allTickets.tickets || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshId = window.setTimeout(refresh, 0);
    return () => window.clearTimeout(refreshId);
  }, [refresh]);

  async function changeStatus(id, status) {
    try {
      await apiRequest(`/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await refreshNotifications();
      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update ticket status.");
    }
  }

  const s = overview?.stats || {};
  const total = s.totalTickets || 0;

  const bars = [
    ["Open", s.open || 0, "bar-red"],
    ["In Progress", s.inProgress || 0, "bar-orange"],
    ["Resolved", s.resolved || 0, "bar-green"],
  ];

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Admin dashboard</h1>
          <p>Overview of support tickets and workspace activity.</p>
        </div>
        <Link className="primary-button compact" to="/admin/tickets">
          Manage tickets
        </Link>
      </div>

      {error && <div className="notice error" role="alert">{error}</div>}

      {loading ? (
        <p className="loading-text">Loading analytics…</p>
      ) : (
        <>
          <div className="stats-grid">
            <StatCard label="Total tickets" value={total} icon="▤" tone="blue" />
            <StatCard label="Open" value={s.open} icon="!" tone="red" />
            <StatCard label="In progress" value={s.inProgress} icon="◷" tone="orange" />
            <StatCard label="Resolved" value={s.resolved} icon="✓" tone="green" />
          </div>

          <div className="analytics-grid">
            <section className="content-card chart-card">
              <div className="card-heading">
                <div>
                  <h2>Tickets overview</h2>
                  <p>Current ticket status distribution</p>
                </div>
              </div>

              <div className="bar-chart">
                {bars.map(([label, value, cls]) => (
                  <div className="bar-row" key={label}>
                    <span>{label}</span>
                    <div className="bar-track">
                      <div
                        className={`bar-fill ${cls}`}
                        style={{
                          width: `${
                            total
                              ? Math.max(3, (value / total) * 100)
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Workspace</h2>
                  <p>At a glance</p>
                </div>
              </div>

              <div className="workspace-metric">
                <span>Registered users</span>
                <strong>{s.totalUsers || 0}</strong>
              </div>

              <div className="workspace-metric">
                <span>Resolution rate</span>
                <strong>
                  {total
                    ? Math.round(((s.resolved || 0) / total) * 100)
                    : 0}%
                </strong>
              </div>

              <div className="workspace-metric">
                <span>Open workload</span>
                <strong>
                  {(s.open || 0) + (s.inProgress || 0)}
                </strong>
              </div>

              <Link className="secondary-button full-width" to="/admin/users">
                Manage users →
              </Link>
            </section>
          </div>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <h2>Recent tickets</h2>
                <p>Update ticket status directly from this table.</p>
              </div>
              <Link to="/admin/tickets">View all →</Link>
            </div>

            <TicketTable
              tickets={tickets.slice(0, 8)}
              admin
              onStatusChange={changeStatus}
            />
          </section>
          <NotificationPreview />
        </>
      )}
    </div>
  );
}
