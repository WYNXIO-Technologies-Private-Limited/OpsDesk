
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "../services/api";

function dateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function csvCell(value) {
  let text = String(value ?? "");

  // Prevent spreadsheet formula injection in exported user-controlled data.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export default function AdminReports() {
  const [from, setFrom] = useState(
    dateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  );
  const [to, setTo] = useState(dateInputValue(new Date()));
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (from) params.set("from", from);
      if (to) params.set("to", to);

      const result = await apiRequest(
        `/admin/reports?${params.toString()}`
      );

      setReport(result);
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  function exportCSV() {
    if (!report) return;

    const rows = [
      [
        "Ticket ID",
        "Title",
        "Category",
        "Priority",
        "Status",
        "Created By",
        "Created By Email",
        "Assigned To",
        "Created At",
      ],
      ...report.tickets.map((ticket) => [
        ticket._id,
        ticket.title,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.createdBy?.name,
        ticket.createdBy?.email,
        ticket.assignedTo?.name,
        ticket.createdAt
          ? new Date(ticket.createdAt).toISOString()
          : "",
      ]),
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `opsdesk-report-${from || "all"}-to-${to || "all"}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  const summary = report?.summary || {};

  return (
    <div className="dashboard-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>Ticket reports</h1>
          <p>Review ticket activity and export report data.</p>
        </div>
      </div>

      <section className="content-card">
        <div className="report-filter-grid">
          <label>
            Start date
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>

          <label>
            End date
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>

          <button
            className="primary-button"
            onClick={loadReport}
            disabled={loading}
          >
            {loading ? "Loading…" : "Generate report"}
          </button>

          <button
            className="secondary-button"
            onClick={exportCSV}
            disabled={!report || loading}
          >
            Export CSV
          </button>
        </div>
      </section>

      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="loading-text">Generating report…</p>
      ) : report ? (
        <>
          <div className="stats-grid">
            <ReportStat label="Total tickets" value={summary.total} />
            <ReportStat label="Open" value={summary.open} />
            <ReportStat
              label="In progress"
              value={summary.inProgress}
            />
            <ReportStat label="Resolved" value={summary.resolved} />
          </div>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <h2>Resolution summary</h2>
                <p>
                  {from || "All dates"} to {to || "All dates"}
                </p>
              </div>
            </div>

            <div className="workspace-metric">
              <span>Resolution rate</span>
              <strong>{summary.resolutionRate || 0}%</strong>
            </div>

            <div className="workspace-metric">
              <span>Unresolved tickets</span>
              <strong>
                {(summary.open || 0) + (summary.inProgress || 0)}
              </strong>
            </div>
          </section>

          <section className="content-card">
            <div className="card-heading">
              <div>
                <h2>Ticket activity</h2>
                <p>
                  {report.tickets.length} records returned by the API
                </p>
              </div>
            </div>

            {report.tickets.length === 0 ? (
              <div className="empty-state">
                <strong>No tickets found</strong>
                <p>Try a different date range.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created by</th>
                      <th>Created at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.tickets.map((ticket) => (
                      <tr key={ticket._id}>
                        <td>
                          <strong>{ticket.title}</strong>
                          <small className="ticket-id">
                            {ticket._id}
                          </small>
                        </td>
                        <td>{ticket.category || "General"}</td>
                        <td>{ticket.priority}</td>
                        <td>
                          <span
                            className={`pill status-${ticket.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td>
                          {ticket.createdBy?.name || "Unknown"}
                        </td>
                        <td>
                          {ticket.createdAt
                            ? new Date(
                                ticket.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {report.tickets.length >= 5000 && (
              <p className="notice">
                The API limits reports to 5,000 ticket records. The
                summary counts are calculated across all matching tickets.
                Refine the date range if you need to export fewer records.
              </p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function ReportStat({ label, value }) {
  return (
    <article className="stat-card">
      <div>
        <p>{label}</p>
        <strong>{value ?? 0}</strong>
      </div>
    </article>
  );
}
