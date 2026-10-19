
import { Link } from "react-router-dom";

export default function TicketTable({
  tickets = [],
  admin = false,
  onStatusChange,
}) {
  if (!tickets.length) {
    return (
      <div className="empty-state">
        <div>▤</div>
        <strong>No tickets yet</strong>
        <p>Tickets will appear here when they are created.</p>

        {!admin && (
          <Link className="secondary-button" to="/tickets/new">
            Create your first ticket
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ticket</th>
            {admin && <th>User</th>}
            <th>Priority</th>
            <th>Status</th>
            <th>Created at</th>
            {admin && <th>Update status</th>}
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket._id}>
              <td>
                <strong>{ticket.title}</strong>
                <small className="ticket-id">
                  #{ticket._id?.slice(-6).toUpperCase()}
                </small>
              </td>

              {admin && (
                <td>
                  {ticket.createdBy?.name || "Unknown"}
                  <small>{ticket.createdBy?.email || ""}</small>
                </td>
              )}

              <td>
                <span
                  className={`pill priority-${(
                    ticket.priority || "medium"
                  ).toLowerCase()}`}
                >
                  {ticket.priority || "Medium"}
                </span>
              </td>

              <td>
                <span
                  className={`pill status-${(
                    ticket.status || "open"
                  ).toLowerCase().replaceAll(" ", "-")}`}
                >
                  {ticket.status || "Open"}
                </span>
              </td>

              <td>
                {ticket.createdAt
                  ? new Date(ticket.createdAt).toLocaleDateString()
                  : "—"}
              </td>

              {admin && (
                <td>
                  <select
                    aria-label={`Update status for ${ticket.title}`}
                    value={ticket.status}
                    onChange={(event) =>
                      onStatusChange?.(ticket._id, event.target.value)
                    }
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
