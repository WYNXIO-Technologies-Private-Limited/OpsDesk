const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("opsdesk_token");
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("opsdesk_token");
      sessionStorage.removeItem("opsdesk_user");
    }
    throw new Error(data.message || "Request failed.");
  }
  return data;
}
