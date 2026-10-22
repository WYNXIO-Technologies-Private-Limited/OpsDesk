import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import LoginPage from "./components/LoginPage";
import Register from "./components/Register";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TicketsPage from "./pages/TicketsPage.jsx";
import CreateTicket from "./pages/CreateTicket";
import AdminUsers from "./pages/AdminUsers";
import ProfilePage from "./pages/ProfilePage";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import NotificationsPage from "./pages/NotificationsPage";
import "./dashboard.css";

function HomeRedirect() {
  const { user, checking } = useAuth();

  if (checking) {
    return <div className="page-loading">Loading OpsDesk…</div>;
  }

  return (
    <Navigate
      to={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"}
      replace
    />
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/signup" element={<Register />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated user routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/new" element={<ProtectedRoute role="user" />}>
            <Route index element={<CreateTicket />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      {/* Administrator-only routes */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout admin />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/tickets" element={<TicketsPage />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
