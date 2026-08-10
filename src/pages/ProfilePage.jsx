import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { BULAN_LIST, BULAN_LABELS } from "../lib/db";
import "./ProfilePage.css";

const STATUS_CONFIG = {
  lunas: { label: "Lunas", class: "badge-lunas", icon: "✅" },
  pending: { label: "Menunggu Verifikasi", class: "badge-pending", icon: "⏳" },
  menunggak: { label: "Menunggak", class: "badge-menunggak", icon: "❌" },
  belum: { label: "Belum Bayar", class: "badge-belum", icon: "⬜" },
};

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export default function ProfilePage() {
  const { activeKK, kepalaKeluarga, transaksi, loading, submitBuktiTransaksi, notify } = useApp();
  
  const kk = kepalaKeluarga?.find((k) => k.id === activeKK);
  const [uploadBulan, setUploadBulan] = useState("2025-08");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (loading) {
    return (
      <div className="page-content page-fade">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Memuat data profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!kk) {
    return (
      <div className="page-content page-fade">
        <div className="container">
          <p>Kepala Keluarga tidak ditemukan atau Anda tidak terdaftar sebagai KK.</p>
        </div>
      </div>
    );
  }

  // Karena RLS transaksi user hanya mengembalikan milik user ini, kita tetap filter jaga-jaga
  const transaksiKK = transaksi.filter((t) => t.kk_id === kk.id).sort(
    (a, b) => b.bulan_iuran.localeCompare(a.bulan_iuran)
  );

  const totalDibayar = transaksiKK.filter((t) => t.status === "lunas").reduce((s, t) => s + t.nominal_bayar, 0);
  const tunggakan = transaksiKK.filter((t) => t.status === "menunggak" || t.status === "belum").length;

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      notify("error", "Pilih file bukti transfer terlebih dahulu.");
      return;
    }
    
    setUploading(true);
    try {
      // NOTE: Di implementasi nyata, kita harus upload file ini ke Supabase Storage dulu
      // dan ambil URL-nya. Untuk mock/prototype, kita buat simulasi bukti URL.
      const fakeUrl = `https://dummy-storage.com/${uploadFile.name}`;
      
      const newTx = {
        id: `tx-${Date.now()}`,
        kk_id: kk.id,
        bulan_iuran: uploadBulan,
        nominal_bayar: kk.tagihan_bulanan,
        status: "pending",
        tgl_bayar: new Date().toISOString().split('T')[0],
        keterangan: "Upload via web portal",
        bukti_url: fakeUrl
      };
      
      await submitBuktiTransaksi(newTx);
      setUploadFile(null);
    } catch (err) {
      // Error handled in context
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-content page-fade">
      <div className="container">
        <div className="section-header">
          <div className="section-icon">👤</div>
          <div>
            <h1>Dashboard Kepala Keluarga</h1>
            <p>Riwayat iuran dan status pembayaran keluarga Anda</p>
          </div>
        </div>

        {/* KK Profile Card */}
        <div className="profile-hero glass-card">
          <div className="profile-hero-avatar">
            {kk.nama_kk.charAt(0)}
          </div>
          <div className="profile-hero-info">
            <h2>{kk.nama_kk}</h2>
            <p>Pasangan: <strong>{kk.nama_pasangan}</strong></p>
            <p>📍 {kk.alamat}</p>
            <p>📱 {kk.telepon}</p>
          </div>
          <div className="profile-hero-stats">
            <div className="profile-stat">
              <span>{kk.jumlah_anggota}</span>
              <label>Anggota KK</label>
            </div>
            <div className="profile-stat">
              <span>{formatRupiah(kk.tagihan_bulanan)}</span>
              <label>Tagihan/Bulan</label>
            </div>
            <div className="profile-stat">
              <span className={`badge badge-${kk.cabang === "indo-jani" ? "branch-a" : "branch-b"}`}>
                {kk.cabang === "indo-jani" ? "Indo Jani" : "Indo Sabi"}
              </span>
              <label>Garis Keturunan</label>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Riwayat Setoran */}
          <div>
            <div className="glass-card" style={{ padding: "var(--spacing-lg)" }}>
              <h3 style={{ marginBottom: 16 }}>📅 Riwayat Iuran</h3>
              <div className="profile-summary-row">
                <div className="profile-summary-item">
                  <span className="stat-value" style={{ fontSize: 20, color: "var(--color-lunas)" }}>
                    {formatRupiah(totalDibayar)}
                  </span>
                  <span className="stat-label">Total Dibayarkan</span>
                </div>
                <div className="profile-summary-item">
                  <span className="stat-value" style={{ fontSize: 20, color: tunggakan > 0 ? "var(--color-menunggak)" : "var(--color-lunas)" }}>
                    {tunggakan}
                  </span>
                  <span className="stat-label">Bulan Tunggakan</span>
                </div>
              </div>
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Bulan</th>
                      <th>Nominal</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaksiKK.map((t) => {
                      const cfg = STATUS_CONFIG[t.status] || STATUS_CONFIG.belum;
                      return (
                        <tr key={t.id}>
                          <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                            {BULAN_LABELS[t.bulan_iuran]}
                          </td>
                          <td>{formatRupiah(t.nominal_bayar)}</td>
                          <td>
                            <span className={`badge ${cfg.class}`}>{cfg.icon} {cfg.label}</span>
                          </td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {t.tgl_bayar || "—"}
                          </td>
                          <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {t.keterangan || "—"}
                          </td>
                        </tr>
                      );
                    })}
                    {transaksiKK.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                          Belum ada riwayat iuran
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Upload Bukti Transfer */}
          <div>
            <div className="glass-card-gold upload-panel">
              <h3 className="upload-title">📤 Upload Bukti Setoran</h3>
              <p className="upload-desc">
                Kirimkan bukti transfer untuk bulan yang ingin dikonfirmasi.
                Admin/Bendahara akan memverifikasi dalam 1×24 jam.
              </p>
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-field">
                  <label>Bulan Iuran</label>
                  <select
                    value={uploadBulan}
                    onChange={(e) => setUploadBulan(e.target.value)}
                    className="filter-select"
                    style={{ width: "100%" }}
                  >
                    {BULAN_LIST.map((b) => (
                      <option key={b} value={b}>{BULAN_LABELS[b]}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Bukti Transfer</label>
                  <div className="upload-drop-zone" onClick={() => document.getElementById("bukti-file").click()}>
                    {uploadFile ? (
                      <div className="upload-file-info">
                        <span>📄 {uploadFile.name}</span>
                        <span className="file-size">({(uploadFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ) : (
                      <>
                        <span className="upload-icon">📁</span>
                        <p>Klik atau drag foto/screenshot bukti transfer</p>
                        <span className="upload-hint">JPG, PNG, PDF · Maks. 5MB</span>
                      </>
                    )}
                    <input
                      id="bukti-file"
                      type="file"
                      accept="image/*,.pdf"
                      style={{ display: "none" }}
                      onChange={(e) => setUploadFile(e.target.files[0] || null)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-full ${uploading ? "uploading" : ""}`}
                  disabled={uploading}
                >
                  {uploading ? "⏳ Mengirim..." : "✅ Kirim Bukti Setoran"}
                </button>
              </form>
            </div>

            {/* Aturan Iuran */}
            <div className="glass-card" style={{ padding: "var(--spacing-lg)", marginTop: "var(--spacing-md)" }}>
              <h3 style={{ marginBottom: 12 }}>📌 Aturan Iuran</h3>
              <div className="rules-list">
                <div className="rule-item">
                  <span>💡</span>
                  <p>Tagihan dihitung berdasarkan jumlah anggota KK: <strong>Rp10.000/orang/bulan</strong></p>
                </div>
                <div className="rule-item">
                  <span>📅</span>
                  <p>Iuran dibayar paling lambat tanggal <strong>10 setiap bulan</strong></p>
                </div>
                <div className="rule-item">
                  <span>🏦</span>
                  <p>Transfer ke rekening Bendahara atau tunai saat pertemuan</p>
                </div>
                <div className="rule-item">
                  <span>⏳</span>
                  <p>Verifikasi bukti transfer oleh Admin dalam 1×24 jam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
