import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar/Navbar";
import LoginPage from "./pages/LoginPage/LoginPage";
import TreePage from "./pages/TreePage";
import FinancePage from "./pages/FinancePage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import BirthdayModal from "./components/BirthdayModal/BirthdayModal";
import "./index.css";

// ── Toast notification global ──
function Toast() {
  const { notification } = useApp();
  if (!notification) return null;
  return (
    <div className={`toast toast-${notification.type}`}>
      {notification.type === "success" && "✅"}
      {notification.type === "error" && "❌"}
      {notification.type === "info" && "💡"}
      <span>{notification.message}</span>
    </div>
  );
}

// ── Loading screen ──
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
        background: "var(--bg-primary)",
        color: "var(--text-muted)",
      }}
    >
      <div style={{ fontSize: "3rem" }}>🏡</div>
      <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
        La Nusu Family Portal
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid rgba(129,93,255,0.2)",
          borderTopColor: "var(--color-accent)",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }}
      />
    </div>
  );
}

// ── Protected route — redirect ke /login jika belum login ──
function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// ── Admin-only route ──
function AdminRoute({ children }) {
  const { role } = useApp();
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
}

// ── App content (inside BrowserRouter + Providers) ──
function AppContent() {
  const { user, authLoading } = useAuth();

  if (authLoading) return <LoadingScreen />;

  // Jika belum login, hanya tampilkan halaman login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <AppProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><TreePage /></ProtectedRoute>} />
        <Route path="/keuangan" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
        <Route path="/profil" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toast />
      <BirthdayModal />
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
