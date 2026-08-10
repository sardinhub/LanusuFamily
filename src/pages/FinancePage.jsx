import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  BULAN_LIST,
  BULAN_LABELS,
  getTotalTerkumpul,
  getStatusKK,
  getJumlahTunggakan,
  getLeaderboardBulanIni,
} from "../lib/db";
import "./FinancePage.css";

const STATUS_CONFIG = {
  lunas: { label: "Lunas", class: "badge-lunas", icon: "✅" },
  pending: { label: "Menunggu", class: "badge-pending", icon: "⏳" },
  menunggak: { label: "Menunggak", class: "badge-menunggak", icon: "❌" },
  belum: { label: "Belum", class: "badge-belum", icon: "⬜" },
};

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getStatusCounts(transaksi, kepalaKeluarga, bulan) {
  const counts = { lunas: 0, pending: 0, menunggak: 0, belum: 0 };
  kepalaKeluarga.forEach((kk) => {
    const s = getStatusKK(transaksi, kk.id, bulan);
    counts[s] = (counts[s] || 0) + 1;
  });
  return counts;
}

export default function FinancePage() {
  const { kepalaKeluarga, transaksi, loading } = useApp();
  const [filterBulan, setFilterBulan] = useState("2025-08");
  const [filterCabang, setFilterCabang] = useState("semua");

  if (loading) {
    return (
      <div className="page-content page-fade">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Memuat data keuangan...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalTerkumpul = getTotalTerkumpul(transaksi);
  const totalTagihan = kepalaKeluarga.reduce((sum, kk) => sum + kk.tagihan_bulanan, 0);
  const kkLunasBulanIni = kepalaKeluarga.filter(
    (kk) => getStatusKK(transaksi, kk.id, filterBulan) === "lunas"
  ).length;
  const persenLunas = kepalaKeluarga.length
    ? Math.round((kkLunasBulanIni / kepalaKeluarga.length) * 100)
    : 0;

  const statusCounts = getStatusCounts(transaksi, kepalaKeluarga, filterBulan);
  const leaderboard = getLeaderboardBulanIni(transaksi, kepalaKeluarga);

  const filteredKK = kepalaKeluarga.filter(
    (kk) => filterCabang === "semua" || kk.cabang === filterCabang
  );

  return (
    <div className="page-content page-fade">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-icon">💰</div>
          <div>
            <h1>Transparansi Keuangan</h1>
            <p>Rekap iuran Family Gathering keturunan La Nusu — terbuka untuk seluruh anggota</p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <span className="stat-label">Total Kas Terkumpul</span>
            <span className="stat-value">{formatRupiah(totalTerkumpul)}</span>
            <span className="stat-sub">Seluruh periode · hanya yang terverifikasi</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Kepala Keluarga Aktif</span>
            <span className="stat-value">{kepalaKeluarga.length}</span>
            <span className="stat-sub">Total KK yang terdaftar</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Tagihan Per Bulan</span>
            <span className="stat-value">{formatRupiah(totalTagihan)}</span>
            <span className="stat-sub">Potensi kas bulanan bila semua lunas</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Lunas Bulan Ini</span>
            <span
              className="stat-value"
              style={{ color: persenLunas >= 70 ? "var(--color-lunas)" : "var(--color-menunggak)" }}
            >
              {persenLunas}%
            </span>
            <div className="progress-bar-wrap" style={{ marginTop: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${persenLunas}%` }} />
            </div>
            <span className="stat-sub" style={{ marginTop: 4 }}>
              {statusCounts.lunas} dari {kepalaKeluarga.length} KK · {BULAN_LABELS[filterBulan]}
            </span>
          </div>
        </div>

        {/* Status Badges summary */}
        <div className="status-summary">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="status-summary-item glass-card">
              <span className={`badge ${cfg.class}`}>
                {cfg.icon} {cfg.label}
              </span>
              <span className="status-count">{statusCounts[key] || 0} KK</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="finance-filters">
          <div className="filter-group">
            <label>📅 Bulan</label>
            <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="filter-select">
              {BULAN_LIST.map((b) => (
                <option key={b} value={b}>{BULAN_LABELS[b]}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>🌿 Garis Keturunan</label>
            <select value={filterCabang} onChange={(e) => setFilterCabang(e.target.value)} className="filter-select">
              <option value="semua">Semua Garis Keturunan</option>
              <option value="indo-jani">Garis Keturunan Indo Jani</option>
              <option value="indo-sabi">Garis Keturunan Indo Sabi</option>
            </select>
          </div>
        </div>

        <div className="finance-grid">
          {/* KK Status Cards */}
          <div className="finance-main">
            <h3 className="section-subtitle">📋 Status Iuran — {BULAN_LABELS[filterBulan]}</h3>
            <div className="kk-grid">
              {filteredKK.map((kk) => {
                const status = getStatusKK(transaksi, kk.id, filterBulan);
                const tunggakan = getJumlahTunggakan(transaksi, kk.id);
                const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.belum;
                return (
                  <div key={kk.id} className={`kk-card glass-card kk-card--${status}`}>
                    <div className="kk-card-top">
                      <div className="kk-avatar">{kk.nama_kk.charAt(0)}</div>
                      <div className="kk-info">
                        <strong className="kk-name">{kk.nama_kk}</strong>
                        <span className="kk-pasangan">& {kk.nama_pasangan}</span>
                      </div>
                      <span className={`badge ${cfg.class}`}>{cfg.icon} {cfg.label}</span>
                    </div>
                    <div className="kk-card-details">
                      <div className="kk-detail">
                        <span>🏠 Anggota</span>
                        <span>{kk.jumlah_anggota} orang</span>
                      </div>
                      <div className="kk-detail">
                        <span>💵 Tagihan</span>
                        <span>{formatRupiah(kk.tagihan_bulanan)}/bln</span>
                      </div>
                      <div className="kk-detail">
                        <span>🌿 Garis Keturunan</span>
                        <span className={`badge badge-${kk.cabang === "indo-jani" ? "branch-a" : "branch-b"} badge-xs`}>
                          {kk.cabang === "indo-jani" ? "Indo Jani" : "Indo Sabi"}
                        </span>
                      </div>
                      {tunggakan > 0 && (
                        <div className="kk-detail kk-detail--alert">
                          <span>⚠️ Tunggakan</span>
                          <span className="text-danger">{tunggakan} bulan</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="finance-side">
            <div className="glass-card-gold leaderboard">
              <h3 className="leaderboard-title">🏆 Papan Apresiasi</h3>
              <p className="leaderboard-subtitle">Tercepat bayar — {BULAN_LABELS["2025-08"]}</p>
              {leaderboard.length === 0 ? (
                <p className="leaderboard-empty">Belum ada yang lunas bulan ini</p>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((item, i) => (
                    <div key={item.id} className="leaderboard-item">
                      <span className="lb-rank">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                      </span>
                      <div className="lb-info">
                        <strong>{item.nama_kk}</strong>
                        <span>{item.tgl_bayar}</span>
                      </div>
                      <span className="lb-amount">{formatRupiah(item.nominal_bayar)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rekap Tabel Lengkap */}
            <div className="glass-card rekap-panel">
              <h3 style={{ marginBottom: 16 }}>📊 Rekap Seluruh Periode</h3>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Kepala Keluarga</th>
                      {BULAN_LIST.slice(-4).map((b) => (
                        <th key={b}>{BULAN_LABELS[b].split(" ")[0]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {kepalaKeluarga.map((kk) => (
                      <tr key={kk.id}>
                        <td>
                          <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                            {kk.nama_kk}
                          </div>
                          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                            {formatRupiah(kk.tagihan_bulanan)}/bln
                          </div>
                        </td>
                        {BULAN_LIST.slice(-4).map((b) => {
                          const s = getStatusKK(transaksi, kk.id, b);
                          const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.belum;
                          return (
                            <td key={b} style={{ textAlign: "center" }}>
                              <span className={`badge ${cfg.class}`} style={{ fontSize: 11, padding: "2px 7px" }}>
                                {cfg.icon}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
