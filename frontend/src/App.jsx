
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./components/Register";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";

function ProtectedDashboard() {
  const token =
    localStorage.getItem("opsdesk-token") ||
    sessionStorage.getItem("opsdesk-token");

  return token ? <Dashboard /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedDashboard />} />
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
