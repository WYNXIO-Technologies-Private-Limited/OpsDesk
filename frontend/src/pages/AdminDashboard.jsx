
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { apiRequest } from "../services/api";
import StatCard from "../components/StatCard";
import TicketTable from "../components/TicketTable";

const COLORS = ["#f24e68", "#ffad35", "#19b982"];

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState(toDateInput(new Date()));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams();

      if (from) query.set("from", from);
      if (to) query.set("to", to);

      const suffix = query.toString();
      const summary = await apiRequest(
        `/admin/overview${suffix ? `?${suffix}` : ""}`
      );

      setOverview(summary);
      setTickets(summary.recentTickets || []);
    } catch (err) {
      setError(err.message || "Unable to load dashboard analytics.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function changeStatus(id, status) {
    setError("");

    try {
      await apiRequest(`/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      await refresh();
    } catch (err) {
      setError(err.message || "Unable to update ticket status.");
    }
  }

  function showAllDates() {
    setFrom("");
    setTo("");
  }

  const stats = overview?.stats || {};

  const total = stats.totalTickets || 0;
  const open = stats.open || 0;
  const inProgress = stats.inProgress || 0;
  const resolved = stats.resolved || 0;

  const statusData = [
    { name: "Open", value: open },
    { name: "In Progress", value: inProgress },
    { name: "Resolved", value: resolved },
  ];

  const trendData = overview?.trend || [];

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Admin dashboard</h1>
          <p>Ticket activity and workspace analytics.</p>
        </div>

        <Link
          className="primary-button compact"
          to="/admin/tickets"
        >
          Manage tickets
        </Link>
      </div>

      <section className="content-card analytics-filters">
        <label>
          From
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>

        <label>
          To
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>

        <button
          type="button"
          className="secondary-button"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh analytics"}
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={showAllDates}
          disabled={loading || (!from && !to)}
        >
          All dates
        </button>
      </section>

      {error && (
        <div className="notice error" role="alert">
          {error}
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            style={{ marginLeft: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !overview ? (
        <p className="loading-text">Loading analytics...</p>
      ) : overview ? (
        <>
          <div className="stats-grid">
            <StatCard
              label="Total tickets"
              value={total}
              icon="▤"
              tone="blue"
            />
            <StatCard
              label="Open"
              value={open}
              icon="!"
              tone="red"
            />
            <StatCard
              label="In progress"
              value={inProgress}
              icon="◷"
              tone="orange"
            />
            <StatCard
              label="Resolved"
              value={resolved}
              icon="✓"
              tone="green"
            />
          </div>

          <div className="analytics-grid">
            <section className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Ticket activity trend</h2>
                  <p>
                    Tickets created per day and their current resolution
                    status
                  </p>
                </div>
              </div>

              {trendData.length === 0 ? (
                <div className="empty-state">
                  <strong>No ticket activity</strong>
                  <p>No tickets were created in this date range.</p>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={trendData}
                      margin={{
                        top: 12,
                        right: 16,
                        left: 0,
                        bottom: 8,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => value.slice(5)}
                        minTickGap={20}
                      />

                      <YAxis
                        allowDecimals={false}
                        width={35}
                      />

                      <Tooltip
                        labelFormatter={(value) => `Date: ${value}`}
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="total"
                        name="Tickets created"
                        stroke="#5b3df5"
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />

                      <Line
                        type="monotone"
                        dataKey="resolved"
                        name="Currently resolved"
                        stroke="#19b982"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="content-card">
              <div className="card-heading">
                <div>
                  <h2>Ticket status</h2>
                  <p>Current status of tickets in the selected period</p>
                </div>
              </div>

              {total === 0 ? (
                <div className="empty-state">
                  <strong>No tickets to display</strong>
                  <p>Try selecting a different date range.</p>
                </div>
              ) : (
                <>
                  <div className="chart-container doughnut-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="52%"
                          outerRadius="78%"
                          paddingAngle={3}
                        >
                          {statusData.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={COLORS[index]}
                            />
                          ))}
                        </Pie>

                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <p className="chart-total">
                    {total} total tickets
                  </p>
                </>
              )}
            </section>
          </div>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <h2>Workspace</h2>
                <p>Workspace statistics</p>
              </div>
            </div>

            <div className="workspace-metric">
              <span>Registered users</span>
              <strong>{stats.totalUsers || 0}</strong>
            </div>

            <div className="workspace-metric">
              <span>Resolution rate</span>
              <strong>{stats.resolutionRate || 0}%</strong>
            </div>

            <div className="workspace-metric">
              <span>Open workload</span>
              <strong>{open + inProgress}</strong>
            </div>

            <Link
              className="secondary-button full-width"
              to="/admin/users"
            >
              Manage users →
            </Link>
          </section>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <h2>Recent tickets</h2>
                <p>Update ticket status directly from this table.</p>
              </div>

              <Link to="/admin/tickets">View all →</Link>
            </div>

            <TicketTable
              tickets={tickets}
              admin
              onStatusChange={changeStatus}
            />
          </section>

          <div className="admin-module-links">
            <Link
              className="secondary-button"
              to="/admin/reports"
            >
              View reports →
            </Link>

            <Link
              className="secondary-button"
              to="/admin/settings"
            >
              Admin settings →
            </Link>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <strong>Dashboard unavailable</strong>
          <p>Refresh the dashboard to try loading the data again.</p>
        </div>
      )}
    </div>
  );
}
