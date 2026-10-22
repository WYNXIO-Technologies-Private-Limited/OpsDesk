
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { apiRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function TicketsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin";

  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingTicketId, setUpdatingTicketId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.toast || "");

  const loadTickets = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data = await apiRequest("/tickets");
      setTickets(data.tickets || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load tickets.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  async function changeStatus(ticketId, status) {
    setError("");
    setSuccess("");
    setUpdatingTicketId(ticketId);

    try {
      await apiRequest(`/tickets/${ticketId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setSuccess(`Ticket status updated to "${status}".`);

      await loadTickets(true);

      setSelectedTicket((current) => {
        if (!current || current._id !== ticketId) {
          return current;
        }

        return { ...current, status };
      });
    } catch (err) {
      setError(err.message || "Unable to update ticket status.");
    } finally {
      setUpdatingTicketId(null);
    }
  }

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesSearch = [
        ticket.title,
        ticket.description,
        ticket.category,
        ticket._id,
        ticket.createdBy?.name,
        ticket.createdBy?.email,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesStatus =
        statusFilter === "All" || ticket.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const counts = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    progress: tickets.filter(
      (ticket) => ticket.status === "In Progress"
    ).length,
    resolved: tickets.filter(
      (ticket) => ticket.status === "Resolved"
    ).length,
  };

  function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  }

  return (
    <div className="dashboard-page tickets-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {isAdmin ? "ADMINISTRATION" : "SUPPORT WORKSPACE"}
          </span>

          <h1>{isAdmin ? "All Tickets" : "My Tickets"}</h1>

          <p>
            {isAdmin
              ? "Review support requests and manage ticket status."
              : "Track your support requests and follow their progress."}
          </p>
        </div>

        <div className="ticket-page-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => loadTickets(true)}
            disabled={loading || refreshing}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

          {!isAdmin && (
            <Link
              className="primary-button compact"
              to="/tickets/new"
            >
              + Create ticket
            </Link>
          )}
        </div>
      </div>

      {success && (
        <div className="notice success" role="status">
          {success}
          <button
            type="button"
            className="ticket-inline-button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="notice error" role="alert">
          {error}
          <button
            type="button"
            className="ticket-inline-button"
            onClick={() => loadTickets()}
          >
            Try again
          </button>
        </div>
      )}

      <div className="stats-grid">
        <article className="stat-card tone-blue">
          <div className="stat-icon">▤</div>
          <div>
            <p>Total tickets</p>
            <strong>{counts.total}</strong>
          </div>
        </article>

        <article className="stat-card tone-red">
          <div className="stat-icon">!</div>
          <div>
            <p>Open</p>
            <strong>{counts.open}</strong>
          </div>
        </article>

        <article className="stat-card tone-orange">
          <div className="stat-icon">◷</div>
          <div>
            <p>In progress</p>
            <strong>{counts.progress}</strong>
          </div>
        </article>

        <article className="stat-card tone-green">
          <div className="stat-icon">✓</div>
          <div>
            <p>Resolved</p>
            <strong>{counts.resolved}</strong>
          </div>
        </article>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>{isAdmin ? "Manage tickets" : "All my tickets"}</h2>
            <p>
              {isAdmin
                ? "Search tickets, review details, and update status."
                : "Search and filter your support requests."}
            </p>
          </div>

          <span className="ticket-result-count">
            {filteredTickets.length} result(s)
          </span>
        </div>

        <div className="ticket-filters">
          <input
            type="search"
            aria-label="Search tickets"
            placeholder={
              isAdmin
                ? "Search tickets, users or categories..."
                : "Search title, description or category..."
            }
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="All">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {loading ? (
          <p className="loading-text">Loading tickets...</p>
        ) : !error && filteredTickets.length === 0 ? (
          <div className="empty-state">
            <div>▤</div>
            <strong>
              {tickets.length
                ? "No matching tickets"
                : "No tickets yet"}
            </strong>
            <p>
              {tickets.length
                ? "Try changing your search or filters."
                : "Tickets will appear here when they are created."}
            </p>

            {!isAdmin && tickets.length === 0 && (
              <Link className="primary-button" to="/tickets/new">
                + Create your first ticket
              </Link>
            )}
          </div>
        ) : (
          !error && (
            <div className="table-wrap">
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    {isAdmin && <th>User</th>}
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Details</th>
                    {isAdmin && <th>Update status</th>}
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>
                        <strong>{ticket.title}</strong>
                        <small className="ticket-id">
                          #{ticket._id?.slice(-6).toUpperCase()}
                        </small>
                      </td>

                      {isAdmin && (
                        <td>
                          {ticket.createdBy?.name || "Unknown"}
                          <small>
                            {ticket.createdBy?.email || ""}
                          </small>
                        </td>
                      )}

                      <td>{ticket.category || "General"}</td>

                      <td>
                        <span
                          className={`pill priority-${(
                            ticket.priority || "Medium"
                          ).toLowerCase()}`}
                        >
                          {ticket.priority || "Medium"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`pill status-${(
                            ticket.status || "Open"
                          ).toLowerCase().replaceAll(" ", "-")}`}
                        >
                          {ticket.status || "Open"}
                        </span>
                      </td>

                      <td>{formatDate(ticket.createdAt)}</td>

                      <td>
                        <button
                          type="button"
                          className="ticket-view-button"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          View
                        </button>
                      </td>

                      {isAdmin && (
                        <td>
                          <select
                            aria-label={`Update status for ${ticket.title}`}
                            value={ticket.status || "Open"}
                            disabled={updatingTicketId === ticket._id}
                            onChange={(event) =>
                              changeStatus(ticket._id, event.target.value)
                            }
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">
                              In Progress
                            </option>
                            <option value="Resolved">Resolved</option>
                          </select>

                          {updatingTicketId === ticket._id && (
                            <small>Saving...</small>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>

      {selectedTicket && (
        <div
          className="ticket-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTicket(null);
            }
          }}
        >
          <section
            className="content-card ticket-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-detail-title"
          >
            <div className="card-heading">
              <div>
                <span className="eyebrow">TICKET DETAILS</span>
                <h2 id="ticket-detail-title">
                  {selectedTicket.title}
                </h2>
                <p>Reference #{selectedTicket._id}</p>
              </div>

              <button
                type="button"
                className="ticket-close-button"
                onClick={() => setSelectedTicket(null)}
                aria-label="Close ticket details"
              >
                ✕
              </button>
            </div>

            {isAdmin && (
              <div className="ticket-detail-grid">
                <div>
                  <span>Submitted by</span>
                  <strong>
                    {selectedTicket.createdBy?.name || "Unknown"}
                  </strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>
                    {selectedTicket.createdBy?.email || "—"}
                  </strong>
                </div>
              </div>
            )}

            <div className="ticket-detail-grid">
              <div>
                <span>Category</span>
                <strong>
                  {selectedTicket.category || "General"}
                </strong>
              </div>

              <div>
                <span>Priority</span>
                <strong>
                  {selectedTicket.priority || "Medium"}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{selectedTicket.status || "Open"}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>{formatDate(selectedTicket.createdAt)}</strong>
              </div>
            </div>

            <div className="ticket-description">
              <h3>Description</h3>
              <p>{selectedTicket.description}</p>
            </div>

            {isAdmin && (
              <label className="ticket-status-editor">
                Update ticket status
                <select
                  value={selectedTicket.status || "Open"}
                  disabled={updatingTicketId === selectedTicket._id}
                  onChange={(event) =>
                    changeStatus(
                      selectedTicket._id,
                      event.target.value
                    )
                  }
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </label>
            )}

            <button
              type="button"
              className="secondary-button"
              onClick={() => setSelectedTicket(null)}
            >
              Close details
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
