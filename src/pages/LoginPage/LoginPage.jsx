import React, { useState } from "react";
import { signIn } from "../../lib/db";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      // AuthContext akan otomatis mendeteksi login via onAuthStateChange
    } catch (err) {
      setError(
        err.message === "Invalid login credentials"
          ? "Email atau kata sandi salah."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background decoration */}
      <div className="login-bg">
        <div className="login-bg-orb orb-1" />
        <div className="login-bg-orb orb-2" />
        <div className="login-bg-orb orb-3" />
      </div>

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">🏡</div>
          <h1 className="login-brand-name">La Nusu</h1>
          <p className="login-brand-sub">Family Portal</p>
        </div>

        {/* Form */}
        <form className="login-card" onSubmit={handleSubmit} id="login-form">
          <h2 className="login-title">Masuk ke Akun Anda</h2>
          <p className="login-desc">
            Masukkan email dan kata sandi yang diberikan oleh admin keluarga.
          </p>

          {error && (
            <div className="login-error" role="alert">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="login-input"
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Kata Sandi</label>
            <div className="login-input-wrap">
              <input
                id="login-password"
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="login-input"
              />
              <button
                type="button"
                className="login-show-pass"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
                aria-label={showPass ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-btn ${loading ? "loading" : ""}`}
            disabled={loading}
            id="login-submit-btn"
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Memverifikasi...
              </>
            ) : (
              "Masuk →"
            )}
          </button>
        </form>

        <p className="login-footer">
          Belum punya akun? Hubungi Admin Keluarga La Nusu.
        </p>
      </div>
    </div>
  );
}
