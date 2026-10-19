
import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await apiRequest("/admin/users");
      setUsers(data.users || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load registered users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return users;

    return users.filter((user) =>
      [user.name, user.email, user._id]
        .some((value) => String(value || "").toLowerCase().includes(query))
    );
  }, [users, search]);

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
    <div className="dashboard-page admin-users-page">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>View and manage registered OpsDesk accounts.</p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => loadUsers(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh users"}
        </button>
      </div>

      {error && (
        <div className="notice error" role="alert">
          {error}
          <button
            type="button"
            className="ticket-inline-button"
            onClick={() => loadUsers()}
          >
            Try again
          </button>
        </div>
      )}

      <div className="stats-grid">
        <article className="stat-card tone-blue">
          <div className="stat-icon">♙</div>
          <div>
            <p>Registered users</p>
            <strong>{users.length}</strong>
          </div>
        </article>

        <article className="stat-card tone-green">
          <div className="stat-icon">✓</div>
          <div>
            <p>Loaded successfully</p>
            <strong>{loading ? "—" : error ? "—" : "Yes"}</strong>
          </div>
        </article>
      </div>

      <section className="content-card">
        <div className="card-heading">
          <div>
            <h2>Registered accounts</h2>
            <p>Search users by name, email or account ID.</p>
          </div>

          <span className="ticket-result-count">
            {filteredUsers.length} user(s)
          </span>
        </div>

        <div className="ticket-filters admin-user-filters">
          <input
            type="search"
            placeholder="Search users..."
            aria-label="Search registered users"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p className="loading-text">Loading registered users...</p>
        ) : !error && filteredUsers.length === 0 ? (
          <div className="empty-state">
            <div>♙</div>
            <strong>
              {users.length ? "No matching users" : "No registered users found"}
            </strong>
            <p>
              {users.length
                ? "Try a different search term."
                : "Newly registered accounts will appear here."}
            </p>
          </div>
        ) : (
          !error && (
            <div className="table-wrap">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email address</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Account ID</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => {
                    const initials = (user.name || "U")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("");

                    return (
                      <tr key={user._id}>
                        <td>
                          <div className="admin-user-identity">
                            <span className="admin-user-avatar">
                              {initials || "U"}
                            </span>
                            <strong>{user.name || "Unnamed user"}</strong>
                          </div>
                        </td>

                        <td>{user.email || "—"}</td>

                        <td>
                          <span className="profile-role">User</span>
                        </td>

                        <td>{formatDate(user.createdAt)}</td>

                        <td>
                          <span className="admin-user-id">
                            {user._id || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        <p className="admin-users-footnote">
          For security, passwords and authentication tokens are never displayed.
        </p>
      </section>
    </div>
  );
}
