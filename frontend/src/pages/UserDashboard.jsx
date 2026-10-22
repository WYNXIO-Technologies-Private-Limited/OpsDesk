import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import TicketTable from "../components/TicketTable";
import NotificationPreview from "../components/NotificationPreview";

export default function UserDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/tickets").then(data => setTickets(data.tickets || []))
      .catch(err => setError(err.message)).finally(() => setLoading(false));
  }, []);

  const count = status => tickets.filter(t => t.status === status).length;
  return <div className="dashboard-page">
    <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1><p>Here's an overview of your support tickets.</p></div><Link className="primary-button compact" to="/tickets/new">＋ Create ticket</Link></div>
    {error && <div className="notice error">{error}</div>}
    <div className="stats-grid"><StatCard label="Total tickets" value={tickets.length} icon="▤" tone="blue"/><StatCard label="Open" value={count("Open")} icon="!" tone="red"/><StatCard label="In progress" value={count("In Progress")} icon="◷" tone="orange"/><StatCard label="Resolved" value={count("Resolved")} icon="✓" tone="green"/></div>
    <section className="content-card"><div className="card-heading"><div><h2>Recent tickets</h2><p>Track the latest updates to your requests.</p></div><Link to="/tickets">View all →</Link></div>
      {loading ? <p className="loading-text">Loading tickets…</p> : <TicketTable tickets={tickets.slice(0, 8)} />}
    </section>
    <NotificationPreview />
    <div className="help-banner"><div><strong>Need help with something else?</strong><p>Create a support ticket and our team will take it from there.</p></div><Link className="secondary-button" to="/tickets/new">Report an issue</Link></div>
  </div>;
}
