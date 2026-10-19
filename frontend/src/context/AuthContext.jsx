import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("opsdesk_user") || "null"); }
    catch { return null; }
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("opsdesk_token");
    if (!token) { setChecking(false); return; }
    apiRequest("/auth/me")
      .then((data) => { setUser(data.user); sessionStorage.setItem("opsdesk_user", JSON.stringify(data.user)); })
      .catch(() => { setUser(null); })
      .finally(() => setChecking(false));
  }, []);

  async function login(email, password, remember = false) {
    const data = await apiRequest("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password })
    });
    // Demo project: sessionStorage is cleared when the browser tab session ends.
    // The remember option is intentionally not persisted to localStorage.
    sessionStorage.setItem("opsdesk_token", data.token);
    sessionStorage.setItem("opsdesk_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    sessionStorage.removeItem("opsdesk_token");
    sessionStorage.removeItem("opsdesk_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, checking, login, logout }), [user, checking]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
