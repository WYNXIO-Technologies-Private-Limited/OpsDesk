import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useNotifications } from "../context/useNotifications";

export default function CreateTicket() {
  const [form, setForm] = useState({ title: "", description: "", category: "General", priority: "Medium" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function submit(e) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      await apiRequest("/tickets", { method: "POST", body: JSON.stringify(form) });
      await refreshNotifications();
      navigate("/tickets", { replace: true });
    }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }
  return <div className="dashboard-page narrow-page"><div className="page-heading"><div><span className="eyebrow">SUPPORT REQUEST</span><h1>Create a ticket</h1><p>Describe the issue so the support team can help.</p></div><Link to="/tickets" className="back-link">← Back to tickets</Link></div><form className="content-card ticket-form" onSubmit={submit}>{error && <div className="notice error">{error}</div>}
    <label>Ticket title<input name="title" value={form.title} onChange={update} maxLength="160" placeholder="e.g. Unable to access server" required /></label>
    <label>Category<select name="category" value={form.category} onChange={update}><option>General</option><option>Hardware</option><option>Software</option><option>Network</option><option>Access</option><option>Other</option></select></label>
    <label>Priority<select name="priority" value={form.priority} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></label>
    <label>Description<textarea name="description" value={form.description} onChange={update} rows="6" maxLength="5000" placeholder="Explain what happened and what you have tried…" required /></label>
    <button className="primary-button" disabled={loading}>{loading ? "Submitting…" : "Submit ticket"}</button>
  </form></div>;
}
