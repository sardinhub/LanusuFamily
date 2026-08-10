import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "../../lib/db";
import "./Navbar.css";

export default function Navbar() {
  const { role, kepalaKeluarga, activeKK } = useApp();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  // Cari nama KK yang sedang login
  const myKK = kepalaKeluarga?.find((k) => k.id === activeKK);
  const displayName = role === "admin"
    ? (profile?.nama || "Admin")
    : (myKK?.nama_kk || profile?.nama || "Anggota");

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🏡</span>
          <div>
            <div className="navbar-brand-name">La Nusu</div>
            <div className="navbar-brand-sub">Family Portal</div>
          </div>
        </NavLink>

        {/* Navigation Links */}
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`} end>
            <span>🌳</span> Silsilah
          </NavLink>
          <NavLink to="/keuangan" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
            <span>💰</span> Keuangan
          </NavLink>
          {role === "user" && (
            <NavLink to="/profil" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              <span>👤</span> Profil KK
            </NavLink>
          )}
          {role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              <span>⚙️</span> Admin
            </NavLink>
          )}
        </div>

        {/* Right side: user info + logout */}
        <div className="navbar-right">
          {/* Role badge */}
          <div className={`navbar-user-badge ${role === "admin" ? "is-admin" : ""}`}>
            <span className="role-indicator" />
            <span className="navbar-user-name">{displayName}</span>
            <span className="navbar-role-label">
              {role === "admin" ? "⚙️ Admin" : "👤 Anggota"}
            </span>
          </div>

          {/* Logout button */}
          <button
            className="navbar-logout-btn"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Keluar dari akun"
            id="navbar-logout-btn"
          >
            {loggingOut ? "⏳" : "🚪"}
            <span className="logout-label">Keluar</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
