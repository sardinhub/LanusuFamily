import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { usePasscode } from "../../context/PasscodeContext";
import { signOut } from "../../lib/db";
import "./Navbar.css";

export default function Navbar() {
  const { role, kepalaKeluarga, activeKK } = useApp();
  const { profile } = useAuth();
  const { guestMode, exitGuest } = usePasscode();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Cari nama KK yang sedang login
  const myKK = kepalaKeluarga?.find((k) => k.id === activeKK);
  const displayName = guestMode
    ? "Anggota Keluarga"
    : role === "admin"
      ? (profile?.nama || "Admin")
      : (myKK?.nama_kk || profile?.nama || "Anggota");

  const handleLogout = async () => {
    setMenuOpen(false);
    if (guestMode) {
      exitGuest();
      navigate("/login");
      return;
    }
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

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Brand */}
          <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
            <span className="navbar-brand-icon">🏡</span>
            <div>
              <div className="navbar-brand-name">La Nusu</div>
              <div className="navbar-brand-sub">Family Portal</div>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <div className="navbar-links">
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`} end>
              <span>🌳</span> Silsilah
            </NavLink>
            <NavLink to="/keuangan" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
              <span>💰</span> Keuangan
            </NavLink>
            {!guestMode && role === "user" && (
              <NavLink to="/profil" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
                <span>👤</span> Profil KK
              </NavLink>
            )}
            {!guestMode && role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>
                <span>⚙️</span> Admin
              </NavLink>
            )}
          </div>

          {/* Right side */}
          <div className="navbar-right">
            {/* User badge — desktop only */}
            <div className={`navbar-user-badge ${role === "admin" && !guestMode ? "is-admin" : ""} ${guestMode ? "is-guest" : ""}`}>
              <span className="role-indicator" />
              <span className="navbar-user-name">{displayName}</span>
              <span className="navbar-role-label">
                {guestMode ? "👨‍👩‍👧 Anggota" : role === "admin" ? "⚙️ Admin" : "👤 Anggota"}
              </span>
            </div>

            {/* Logout button — desktop */}
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

            {/* Hamburger — mobile only */}
            <button
              className={`navbar-hamburger ${menuOpen ? "open" : ""}`}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu"
              id="navbar-hamburger"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="navbar-mobile-backdrop" onClick={closeMenu} />
      )}
      <div className={`navbar-mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="navbar-mobile-user">
          <span className={`mobile-role-dot ${guestMode ? "guest" : role === "admin" ? "admin" : ""}`} />
          <div>
            <div className="mobile-user-name">{displayName}</div>
            <div className="mobile-user-role">
              {guestMode ? "Akses Anggota Keluarga" : role === "admin" ? "Administrator" : "Kepala Keluarga"}
            </div>
          </div>
        </div>
        <nav className="navbar-mobile-links">
          <NavLink to="/" className={({ isActive }) => `mobile-link ${isActive ? "active" : ""}`} end onClick={closeMenu}>
            <span>🌳</span> Silsilah
          </NavLink>
          <NavLink to="/keuangan" className={({ isActive }) => `mobile-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
            <span>💰</span> Keuangan
          </NavLink>
          {!guestMode && role === "user" && (
            <NavLink to="/profil" className={({ isActive }) => `mobile-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              <span>👤</span> Profil KK
            </NavLink>
          )}
          {!guestMode && role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `mobile-link ${isActive ? "active" : ""}`} onClick={closeMenu}>
              <span>⚙️</span> Admin
            </NavLink>
          )}
        </nav>
        <button className="mobile-logout-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "⏳" : "🚪"} Keluar
        </button>
      </div>
    </>
  );
}
