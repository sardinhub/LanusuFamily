import React, { useState, useMemo } from "react";
import { useApp, flattenTree } from "../context/AppContext";
import { BULAN_LABELS, BULAN_LIST } from "../lib/db";
import "./AdminPage.css";

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

const STATUS_CONFIG = {
  lunas: { label: "Lunas", class: "badge-lunas", icon: "✅" },
  pending: { label: "Pending", class: "badge-pending", icon: "⏳" },
  menunggak: { label: "Menunggak", class: "badge-menunggak", icon: "❌" },
  belum: { label: "Belum", class: "badge-belum", icon: "⬜" },
};

const EMPTY_ANGGOTA = {
  nama: "",
  jenis_kelamin: "L",
  lahir: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  parent_id: "",
  cabang: "indo-jani",
  keterangan: "",
  sudah_menikah: false,
  pasangan_list: [
    { nama_pasangan: "", lahir_pasangan: "", tempat_lahir_pasangan: "", tanggal_lahir_pasangan: "" }
  ]
};

// ────────────────────────────────────────────────
// Sub-komponen: Form Tambah Anggota Silsilah
// ────────────────────────────────────────────────
function SilsilahForm({ anggotaList, onSubmit }) {
  const [form, setForm] = useState(EMPTY_ANGGOTA);
  const [errors, setErrors] = useState({});

  // Auto-detect cabang dari parent yang dipilih
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    const parent = anggotaList.find((a) => a.id === parentId);
    setForm((f) => ({
      ...f,
      parent_id: parentId,
      cabang: parent?.cabang && parent.cabang !== "root" ? parent.cabang : f.cabang,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nama.trim()) errs.nama = "Nama wajib diisi";
    if (!form.parent_id) errs.parent_id = "Pilih orang tua";
    if (!form.lahir.trim() && !form.tanggal_lahir) errs.lahir = "Tahun atau tanggal lahir wajib diisi";
    if (form.sudah_menikah) {
      form.pasangan_list.forEach((p, index) => {
        if (!p.nama_pasangan.trim()) {
          errs[`nama_pasangan_${index}`] = "Nama pasangan wajib diisi";
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const pasangan = form.sudah_menikah
      ? form.pasangan_list.map((p, index) => ({
          nama: p.nama_pasangan,
          gelar: form.jenis_kelamin === "L" ? (form.pasangan_list.length > 1 ? `Istri ${index + 1}` : "Istri") : (form.pasangan_list.length > 1 ? `Suami ${index + 1}` : "Suami"),
          jenis_kelamin: form.jenis_kelamin === "L" ? "P" : "L",
          lahir: p.lahir_pasangan || (p.tanggal_lahir_pasangan ? p.tanggal_lahir_pasangan.substring(0, 4) : null),
          tempat_lahir: p.tempat_lahir_pasangan || null,
          tanggal_lahir: p.tanggal_lahir_pasangan || null,
          meninggal: null,
          foto: null,
          cabang: form.cabang,
        }))
      : null;

    const newAnggota = {
      nama: form.nama.trim(),
      gelar: "", // akan diisi otomatis oleh context/tree
      jenis_kelamin: form.jenis_kelamin,
      lahir: form.lahir.trim() || (form.tanggal_lahir ? form.tanggal_lahir.substring(0, 4) : null),
      tempat_lahir: form.tempat_lahir.trim() || null,
      tanggal_lahir: form.tanggal_lahir || null,
      meninggal: null,
      foto: null,
      cabang: form.cabang,
      ibu_id: null,
      kk_id: null,
      keterangan: form.keterangan.trim(),
      is_root: false
    };

    onSubmit(form.parent_id, newAnggota, pasangan, form.nama);
    setForm(EMPTY_ANGGOTA);
    setErrors({});
  };

  const selectedParent = anggotaList.find((a) => a.id === form.parent_id);

  return (
    <form onSubmit={handleSubmit} className="silsilah-form">
      {/* Pilih Orang Tua */}
      <div className="form-section">
        <h4 className="form-section-title">👤 Data Orang Tua</h4>
        <div className="form-field">
          <label>Orang Tua *</label>
          <select
            className={`filter-select full-width ${errors.parent_id ? "input-error" : ""}`}
            value={form.parent_id}
            onChange={handleParentChange}
          >
            <option value="">— Pilih orang tua —</option>
            {anggotaList.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nama}
                {a.jenis_kelamin === "L" ? " (Ayah)" : " (Ibu)"}
                {" — "}
                {a.cabang === "root" ? "La Nusu" : a.cabang === "indo-jani" ? "Indo Jani" : "Indo Sabi"}
              </option>
            ))}
          </select>
          {errors.parent_id && <span className="error-msg">{errors.parent_id}</span>}
          {selectedParent && (
            <div className="parent-preview">
              <span>Menambahkan keturunan dari:</span>
              <strong>{selectedParent.nama}</strong>
              {selectedParent.id !== "la-nusu" && (
                <span className={`badge badge-${selectedParent.cabang === "indo-jani" ? "branch-a" : selectedParent.cabang === "indo-sabi" ? "branch-b" : "gold"}`}>
                  {selectedParent.cabang === "indo-jani" ? "Indo Jani" : "Indo Sabi"}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Data Anggota Baru */}
      <div className="form-section">
        <h4 className="form-section-title">🧑 Data Anggota Baru</h4>
        <div className="form-row">
          <div className="form-field">
            <label>Nama Lengkap *</label>
            <input
              type="text"
              className={`form-input ${errors.nama ? "input-error" : ""}`}
              placeholder="Nama lengkap"
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
            />
            {errors.nama && <span className="error-msg">{errors.nama}</span>}
          </div>
          <div className="form-field">
            <label>Jenis Kelamin *</label>
            <div className="gender-toggle">
              <button
                type="button"
                className={`gender-btn ${form.jenis_kelamin === "L" ? "active" : ""}`}
                onClick={() => setForm({ ...form, jenis_kelamin: "L" })}
              >
                👨 Laki-laki
              </button>
              <button
                type="button"
                className={`gender-btn ${form.jenis_kelamin === "P" ? "active" : ""}`}
                onClick={() => setForm({ ...form, jenis_kelamin: "P" })}
              >
                👩 Perempuan
              </button>
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Tanggal Lahir</label>
            <input
              type="date"
              className="form-input"
              value={form.tanggal_lahir}
              onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Tempat Lahir</label>
            <input
              type="text"
              className="form-input"
              placeholder="cth: Makassar"
              value={form.tempat_lahir}
              onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })}
            />
          </div>
          <div className="form-field">
            <label>Tahun Lahir (Alternatif) *</label>
            <input
              type="text"
              className={`form-input ${errors.lahir ? "input-error" : ""}`}
              placeholder="cth: 1990"
              value={form.lahir}
              onChange={(e) => setForm({ ...form, lahir: e.target.value })}
              maxLength={4}
            />
            {errors.lahir && <span className="error-msg">{errors.lahir}</span>}
          </div>
          <div className="form-field">
            {selectedParent?.id === "la-nusu" ? (
              <>
                <label>Dari Istri (Garis Keturunan) *</label>
                <select
                  className="filter-select full-width"
                  value={form.cabang}
                  onChange={(e) => setForm({ ...form, cabang: e.target.value })}
                >
                  <option value="indo-jani">Istri 1: Indo Jani</option>
                  <option value="indo-sabi">Istri 2: Indo Sabi</option>
                </select>
              </>
            ) : (
              <>
                <label>Garis Keturunan</label>
                <input
                  type="text"
                  className="form-input"
                  disabled
                  value={form.cabang === "indo-jani" ? "Garis Keturunan Indo Jani (Otomatis)" : "Garis Keturunan Indo Sabi (Otomatis)"}
                />
              </>
            )}
          </div>
        </div>
        <div className="form-field">
          <label>Keterangan (opsional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="cth: Tinggal di Makassar, sedang kuliah, dll."
            value={form.keterangan}
            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
          />
        </div>
      </div>

      {/* Pasangan */}
      <div className="form-section">
        <h4 className="form-section-title">💑 Status Pernikahan</h4>
        <div className="toggle-checkbox-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={form.sudah_menikah}
              onChange={(e) => setForm({ ...form, sudah_menikah: e.target.checked })}
            />
            <span className="toggle-switch" />
            Sudah menikah / memiliki pasangan
          </label>
        </div>

        {form.sudah_menikah && (
          <div className="pasangan-fields">
            {form.pasangan_list.map((p, index) => (
              <div key={index} style={{ marginBottom: "12px", padding: "12px", border: "1px solid #333", borderRadius: "8px" }}>
                <h5 style={{ marginTop: 0, marginBottom: "8px", fontSize: "0.85rem", color: "#ccc" }}>
                  Pasangan ke-{index + 1}
                  {index > 0 && (
                    <button type="button" onClick={() => {
                      const newList = [...form.pasangan_list];
                      newList.splice(index, 1);
                      setForm({ ...form, pasangan_list: newList });
                    }} style={{ marginLeft: "8px", background: "none", border: "none", color: "#ff4d4f", cursor: "pointer", fontSize: "0.8rem" }}>
                      Hapus
                    </button>
                  )}
                </h5>
                <div className="form-row">
                  <div className="form-field">
                    <label>Nama Pasangan *</label>
                    <input
                      type="text"
                      className={`form-input ${errors[`nama_pasangan_${index}`] ? "input-error" : ""}`}
                      placeholder={form.jenis_kelamin === "L" ? "Nama istri" : "Nama suami"}
                      value={p.nama_pasangan}
                      onChange={(e) => {
                        const newList = [...form.pasangan_list];
                        newList[index].nama_pasangan = e.target.value;
                        setForm({ ...form, pasangan_list: newList });
                      }}
                    />
                    {errors[`nama_pasangan_${index}`] && <span className="error-msg">{errors[`nama_pasangan_${index}`]}</span>}
                  </div>
                  <div className="form-field">
                    <label>Tanggal Lahir</label>
                    <input
                      type="date"
                      className="form-input"
                      value={p.tanggal_lahir_pasangan}
                      onChange={(e) => {
                        const newList = [...form.pasangan_list];
                        newList[index].tanggal_lahir_pasangan = e.target.value;
                        setForm({ ...form, pasangan_list: newList });
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Tempat Lahir</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="cth: Bone"
                      value={p.tempat_lahir_pasangan}
                      onChange={(e) => {
                        const newList = [...form.pasangan_list];
                        newList[index].tempat_lahir_pasangan = e.target.value;
                        setForm({ ...form, pasangan_list: newList });
                      }}
                    />
                  </div>
                  <div className="form-field">
                    <label>Tahun Lahir</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="cth: 1992"
                      value={p.lahir_pasangan}
                      onChange={(e) => {
                        const newList = [...form.pasangan_list];
                        newList[index].lahir_pasangan = e.target.value;
                        setForm({ ...form, pasangan_list: newList });
                      }}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: "100%", fontSize: "0.85rem", marginTop: "8px" }}
              onClick={() => setForm({ ...form, pasangan_list: [...form.pasangan_list, { nama_pasangan: "", lahir_pasangan: "", tempat_lahir_pasangan: "", tanggal_lahir_pasangan: "" }] })}
            >
              ➕ Tambah Pasangan Lainnya
            </button>
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
        ➕ Tambahkan ke Silsilah
      </button>
    </form>
  );
}

// ────────────────────────────────────────────────
// Sub-komponen: Daftar Anggota Silsilah (tabel)
// ────────────────────────────────────────────────
function AnggotaList({ anggotaList, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const filtered = anggotaList.filter((a) =>
    a.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="anggota-list-wrap">
      <div className="anggota-list-header">
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Cari nama anggota..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <span className="anggota-count">{anggotaList.length} anggota terdaftar</span>
      </div>
      <div className="table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>JK</th>
              <th>Garis Keturunan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                  {a.nama}
                </td>
                <td>{a.jenis_kelamin === "L" ? "👨" : "👩"}</td>
                <td>
                  <span className={`badge badge-${a.cabang === "indo-jani" ? "branch-a" : a.cabang === "indo-sabi" ? "branch-b" : "gold"}`} style={{ fontSize: 11 }}>
                    {a.cabang === "root" ? "La Nusu" : a.cabang === "indo-jani" ? "Indo Jani" : "Indo Sabi"}
                  </span>
                </td>
                <td>
                  {a.id === "la-nusu" ? (
                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Root</span>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEdit(a)}
                        title={`Edit ${a.nama}`}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDelete(a.id, a.nama)}
                        title={`Hapus ${a.nama} beserta seluruh cabangnya`}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "var(--text-muted)", padding: 24 }}>
                  Tidak ada anggota yang cocok dengan pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Halaman Utama Admin
// ────────────────────────────────────────────────
export default function AdminPage() {
  const { role, notify, silsilah, kepalaKeluarga, transaksi, loading, addAnggota, updateAnggota, deleteAnggota, addKepalaKeluarga, konfirmasiTransaksi } = useApp();
  const [activeTab, setActiveTab] = useState("verifikasi");
  const [editAnggotaItem, setEditAnggotaItem] = useState(null);
  const [newKK, setNewKK] = useState({
    nama_kk: "", nama_pasangan: "", jumlah_anggota: 2, cabang: "indo-jani", alamat: "", telepon: ""
  });

  // Flatten silsilah untuk dropdown orang tua — re-compute saat tree berubah
  const anggotaList = useMemo(() => flattenTree(silsilah), [silsilah]);

  if (loading) {
    return (
      <div className="page-content page-fade">
        <div className="container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Memuat data admin...</p>
          </div>
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="page-content page-fade">
        <div className="container">
          <div className="access-denied glass-card">
            <span>🔒</span>
            <h2>Akses Ditolak</h2>
            <p>Halaman ini hanya dapat diakses oleh Admin/Bendahara.</p>
            <p>Silakan switch ke Mode Admin di navbar (atau login sebagai admin).</p>
          </div>
        </div>
      </div>
    );
  }

  const pendingList = transaksi.filter((t) => t.status === "pending");
  const lunasList = transaksi.filter((t) => t.status === "lunas");

  const handleVerify = (txId, action) => {
    konfirmasiTransaksi(txId, action === "approve" ? "lunas" : "menunggak", {
      tgl_bayar: action === "approve" ? new Date().toISOString().slice(0, 10) : null
    });
  };

  const handleAddKK = (e) => {
    e.preventDefault();
    if (!newKK.nama_kk || !newKK.nama_pasangan) {
      notify("error", "Nama Kepala Keluarga dan pasangan wajib diisi.");
      return;
    }
    
    addKepalaKeluarga(newKK);
    setNewKK({ nama_kk: "", nama_pasangan: "", jumlah_anggota: 2, cabang: "indo-jani", alamat: "", telepon: "" });
  };

  const handleAddAnggota = (parentId, anggota, pasangan, nama) => {
    addAnggota(parentId, anggota, pasangan);
  };

  const handleEditAnggotaSave = (e) => {
    e.preventDefault();
    if (!editAnggotaItem.nama.trim()) {
      notify("error", "Nama wajib diisi.");
      return;
    }
    const toUpdate = { ...editAnggotaItem };
    if (toUpdate.tanggal_lahir) {
      toUpdate.lahir = toUpdate.tanggal_lahir.substring(0, 4);
    }
    updateAnggota(toUpdate);
    setEditAnggotaItem(null);
  };

  const handleDeleteAnggota = (id, nama) => {
    if (!window.confirm(`Hapus "${nama}" beserta seluruh cabang di bawahnya?\n\nTindakan ini tidak dapat dibatalkan dan akan terhapus dari database.`)) return;
    deleteAnggota(id);
  };

  const totalKas = lunasList.reduce((s, t) => s + t.nominal_bayar, 0);

  return (
    <div className="page-content page-fade">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-icon">⚙️</div>
          <div>
            <h1>Panel Admin / Bendahara</h1>
            <p>Verifikasi setoran, kelola silsilah keluarga, dan monitoring keuangan</p>
          </div>
          <span className="badge badge-gold" style={{ marginLeft: "auto" }}>Mode Admin Aktif</span>
        </div>

        {/* Summary Stats */}
        <div className="stats-grid" style={{ marginBottom: "var(--spacing-xl)" }}>
          <div className="glass-card stat-card">
            <span className="stat-label">Total Kas Terverifikasi</span>
            <span className="stat-value">{formatRupiah(totalKas)}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Menunggu Verifikasi</span>
            <span className="stat-value" style={{ color: pendingList.length > 0 ? "var(--color-pending)" : "var(--color-lunas)" }}>
              {pendingList.length}
            </span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Total KK Terdaftar</span>
            <span className="stat-value">{kepalaKeluarga.length}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Anggota Silsilah</span>
            <span className="stat-value" style={{ color: "var(--color-branch-b)" }}>{anggotaList.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {[
            { key: "verifikasi", label: "✅ Verifikasi Setoran", count: pendingList.length },
            { key: "silsilah", label: "🌳 Kelola Silsilah", count: null },
            { key: "kk", label: "🏠 Tambah KK Baru", count: null },
            { key: "rekap", label: "📊 Rekap Lengkap", count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="tab-badge">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Verifikasi */}
        {activeTab === "verifikasi" && (
          <div className="tab-content">
            {pendingList.length === 0 ? (
              <div className="empty-state glass-card">
                <span>🎉</span>
                <h3>Tidak ada setoran yang menunggu verifikasi</h3>
                <p>Semua setoran sudah diproses.</p>
              </div>
            ) : (
              <div className="verif-list">
                {pendingList.map((tx) => {
                  const kk = kepalaKeluarga.find((k) => k.id === tx.kk_id);
                  return (
                    <div key={tx.id} className="verif-card glass-card">
                      <div className="verif-header">
                        <div className="kk-avatar">{kk?.nama_kk.charAt(0)}</div>
                        <div>
                          <strong className="verif-name">{kk?.nama_kk}</strong>
                          <span className="verif-bulan">{BULAN_LABELS[tx.bulan_iuran]}</span>
                        </div>
                        <span className="badge badge-pending" style={{ marginLeft: "auto" }}>⏳ Pending</span>
                      </div>
                      <div className="verif-details">
                        <div className="verif-row">
                          <span>Nominal</span><strong>{formatRupiah(tx.nominal_bayar)}</strong>
                        </div>
                        <div className="verif-row">
                          <span>Tgl Upload</span><strong>{tx.tgl_bayar || "—"}</strong>
                        </div>
                        <div className="verif-row">
                          <span>Keterangan</span><strong>{tx.keterangan || "—"}</strong>
                        </div>
                      </div>
                      <div className="verif-mock-proof">
                        <div className="proof-placeholder">
                          {tx.bukti_url ? (
                            <a href={tx.bukti_url} target="_blank" rel="noreferrer" style={{ color: "var(--color-accent)" }}>📄 Lihat Bukti Transfer</a>
                          ) : (
                            <>
                              📄 bukti_transfer_{tx.kk_id}_{tx.bulan_iuran}.jpg
                              <span className="proof-hint">(Simulasi — Supabase Storage di Fase 2)</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="verif-actions">
                        <button className="btn btn-success" onClick={() => handleVerify(tx.id, "approve")}>
                          ✅ Setujui
                        </button>
                        <button className="btn btn-danger" onClick={() => handleVerify(tx.id, "reject")}>
                          ❌ Tolak
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Kelola Silsilah */}
        {activeTab === "silsilah" && (
          <div className="tab-content">
            <div className="silsilah-tab-layout">
              {/* Panel Kiri: Form */}
              <div className="silsilah-panel-left">
                <div className="glass-card silsilah-panel-card">
                  <div className="silsilah-panel-header">
                    <h3>➕ Tambah Anggota Baru</h3>
                    <p>Isi formulir di bawah untuk menambahkan anak, cucu, atau anggota generasi baru ke dalam silsilah.</p>
                  </div>
                  <SilsilahForm anggotaList={anggotaList} onSubmit={handleAddAnggota} />
                </div>
              </div>

              {/* Panel Kanan: Daftar Anggota */}
              <div className="silsilah-panel-right">
                <div className="glass-card silsilah-panel-card">
                  <div className="silsilah-panel-header">
                    <h3>📋 Daftar Anggota Silsilah</h3>
                    <p>Semua anggota yang terdaftar saat ini. Klik 🗑 untuk menghapus anggota beserta cabangnya.</p>
                  </div>
                  <AnggotaList
                    anggotaList={anggotaList}
                    onEdit={setEditAnggotaItem}
                    onDelete={handleDeleteAnggota}
                  />
                </div>
              </div>
            </div>

            {/* Info tip */}
            <div className="silsilah-tip">
              <span>💡</span>
              <p>
                Anggota yang baru ditambahkan akan <strong>langsung tersimpan di database Supabase</strong>.
                Pergi ke halaman <a href="/" onClick={(e) => { e.preventDefault(); window.location.href="/"; }}>🌳 Silsilah</a> untuk melihat hasilnya.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Tambah KK */}
        {activeTab === "kk" && (
          <div className="tab-content">
            <div className="glass-card add-kk-form">
              <h3 style={{ marginBottom: 20 }}>🏠 Daftarkan Kepala Keluarga Baru</h3>
              <p style={{ marginBottom: 20, fontSize: 13, color: "var(--text-muted)" }}>
                Gunakan formulir ini untuk mendaftarkan anggota keluarga yang baru menikah atau baru diidentifikasi sebagai Kepala Keluarga.
              </p>
              <form onSubmit={handleAddKK} className="kk-form">
                <div className="form-row">
                  <div className="form-field">
                    <label>Nama Kepala Keluarga *</label>
                    <input type="text" className="form-input" placeholder="Nama lengkap KK"
                      value={newKK.nama_kk} onChange={(e) => setNewKK({ ...newKK, nama_kk: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Nama Pasangan *</label>
                    <input type="text" className="form-input" placeholder="Nama lengkap pasangan"
                      value={newKK.nama_pasangan} onChange={(e) => setNewKK({ ...newKK, nama_pasangan: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Jumlah Anggota KK</label>
                    <input type="number" className="form-input" min="1" max="20"
                      value={newKK.jumlah_anggota} onChange={(e) => setNewKK({ ...newKK, jumlah_anggota: parseInt(e.target.value) })} />
                    <span className="input-hint">Tagihan: {formatRupiah(newKK.jumlah_anggota * 10000)}/bulan (Rp10.000/orang)</span>
                  </div>
                  <div className="form-field">
                    <label>Garis Keturunan</label>
                    <select
                      className="filter-select full-width"
                      value={newKK.cabang}
                      onChange={(e) => setNewKK({ ...newKK, cabang: e.target.value })}
                    >
                      <option value="indo-jani">Garis Keturunan Indo Jani</option>
                      <option value="indo-sabi">Garis Keturunan Indo Sabi</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label>Alamat</label>
                    <input type="text" className="form-input" placeholder="Alamat lengkap"
                      value={newKK.alamat} onChange={(e) => setNewKK({ ...newKK, alamat: e.target.value })} />
                  </div>
                  <div className="form-field">
                    <label>Telepon / WhatsApp</label>
                    <input type="text" className="form-input" placeholder="08xx-xxxx-xxxx"
                      value={newKK.telepon} onChange={(e) => setNewKK({ ...newKK, telepon: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">➕ Daftarkan Kepala Keluarga</button>
              </form>
            </div>
          </div>
        )}

        {/* Tab: Rekap */}
        {activeTab === "rekap" && (
          <div className="tab-content">
            <div className="glass-card" style={{ padding: "var(--spacing-lg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3>📊 Rekap Lengkap Semua Periode</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => notify("info", "Fitur export CSV akan tersedia di Fase 2 dengan Supabase Storage.")}>
                  📥 Export CSV
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Kepala Keluarga</th>
                      <th>Garis Keturunan</th>
                      <th>Jml Anggota</th>
                      <th>Tagihan/bln</th>
                      {BULAN_LIST.map((b) => (
                        <th key={b} style={{ textAlign: "center" }}>{BULAN_LABELS[b].split(" ")[0]}</th>
                      ))}
                      <th>Total Bayar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kepalaKeluarga.map((kk) => {
                      const totalKK = transaksi
                        .filter((t) => t.kk_id === kk.id && t.status === "lunas")
                        .reduce((s, t) => s + t.nominal_bayar, 0);
                      return (
                        <tr key={kk.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{kk.nama_kk}</div>
                            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>& {kk.nama_pasangan}</div>
                          </td>
                          <td>
                            <span className={`badge badge-${kk.cabang === "indo-jani" ? "branch-a" : "branch-b"}`} style={{ fontSize: 11 }}>
                              {kk.cabang === "indo-jani" ? "Indo Jani" : "Indo Sabi"}
                            </span>
                          </td>
                          <td style={{ color: "var(--color-gold)", fontWeight: 600, fontSize: 13 }}>
                            {formatRupiah(kk.tagihan_bulanan)}
                          </td>
                          {BULAN_LIST.map((b) => {
                            const tx = transaksi.find((t) => t.kk_id === kk.id && t.bulan_iuran === b);
                            const s = tx?.status || "belum";
                            const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.belum;
                            return (
                              <td key={b} style={{ textAlign: "center" }}>
                                <span className={`badge ${cfg.class}`} style={{ fontSize: 11, padding: "2px 7px" }}>
                                  {cfg.icon}
                                </span>
                              </td>
                            );
                          })}
                          <td style={{ fontWeight: 700, color: "var(--color-lunas)", fontSize: 13 }}>
                            {formatRupiah(totalKK)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editAnggotaItem && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: 24, position: "relative" }}>
            <button
              onClick={() => setEditAnggotaItem(null)}
              style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--text-muted)", fontSize: 20, cursor: "pointer" }}
            >
              ✕
            </button>
            <h3 style={{ marginBottom: 16 }}>✏️ Edit Anggota Silsilah</h3>
            <form onSubmit={handleEditAnggotaSave}>
              <div className="form-field">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-input full-width"
                  value={editAnggotaItem.nama}
                  onChange={(e) => setEditAnggotaItem({ ...editAnggotaItem, nama: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Tanggal Lahir</label>
                  <input
                    type="date"
                    className="form-input full-width"
                    value={editAnggotaItem.tanggal_lahir || ""}
                    onChange={(e) => setEditAnggotaItem({ ...editAnggotaItem, tanggal_lahir: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Tempat Lahir</label>
                  <input
                    type="text"
                    className="form-input full-width"
                    value={editAnggotaItem.tempat_lahir || ""}
                    onChange={(e) => setEditAnggotaItem({ ...editAnggotaItem, tempat_lahir: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Tahun Lahir</label>
                  <input
                    type="text"
                    className="form-input full-width"
                    value={editAnggotaItem.lahir || ""}
                    onChange={(e) => setEditAnggotaItem({ ...editAnggotaItem, lahir: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Gelar / Subtitle</label>
                  <input
                    type="text"
                    className="form-input full-width"
                    value={editAnggotaItem.gelar || ""}
                    onChange={(e) => setEditAnggotaItem({ ...editAnggotaItem, gelar: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-field">
                <label>Keterangan</label>
                <input
                  type="text"
                  className="form-input full-width"
                  value={editAnggotaItem.keterangan || ""}
                  onChange={(e) => setEditAnggotaItem({ ...editAnggotaItem, keterangan: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary full-width" style={{ marginTop: 16 }}>
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
