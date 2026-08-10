// ============================================================
// db.js — Helper functions untuk query Supabase
// Semua operasi database terpusat di sini
// ============================================================
import { supabase } from "./supabase";

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

/** Login dengan email + password */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Logout */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Ambil profil user yang sedang login (role + kk_id) */
export async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// SILSILAH (reconstruct tree dari flat rows)
// ─────────────────────────────────────────

/** Ambil semua anggota + pasangan, kembalikan sebagai nested tree */
export async function fetchSilsilah() {
  // Ambil semua anggota sekaligus pasangan dalam satu query
  const [{ data: anggotaRows, error: e1 }, { data: pasanganRows, error: e2 }] =
    await Promise.all([
      supabase.from("anggota").select("*").order("lahir"),
      supabase.from("pasangan").select("*"),
    ]);

  if (e1) throw e1;
  if (e2) throw e2;

  // Buat map pasangan berdasarkan anggota_id
  const pasanganMap = {};
  for (const p of pasanganRows || []) {
    if (!pasanganMap[p.anggota_id]) pasanganMap[p.anggota_id] = [];
    pasanganMap[p.anggota_id].push(p);
  }

  // Rekonstruksi tree dari flat list
  const nodeMap = {};
  for (const a of anggotaRows || []) {
    nodeMap[a.id] = {
      ...a,
      pasangan: pasanganMap[a.id] || [],
      anak: [],
    };
  }

  let root = null;
  for (const a of anggotaRows || []) {
    if (a.is_root) {
      root = nodeMap[a.id];
    } else if (a.parent_id && nodeMap[a.parent_id]) {
      nodeMap[a.parent_id].anak.push(nodeMap[a.id]);
    }
  }

  return root;
}

/** Ambil semua anggota sebagai flat list (untuk dropdown) */
export async function fetchAnggotaFlat() {
  const { data, error } = await supabase
    .from("anggota")
    .select("id, nama, cabang, gelar, jenis_kelamin, lahir, tempat_lahir, tanggal_lahir")
    .order("nama");
  if (error) throw error;
  return data || [];
}

// ─────────────────────────────────────────
// KEPALA KELUARGA
// ─────────────────────────────────────────

/** Ambil semua KK */
export async function fetchKepalaKeluarga() {
  const { data, error } = await supabase
    .from("kepala_keluarga")
    .select("*")
    .order("nama_kk");
  if (error) throw error;
  return data || [];
}

/** Tambah KK baru */
export async function insertKepalaKeluarga(kkData) {
  const { data, error } = await supabase
    .from("kepala_keluarga")
    .insert(kkData)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// TRANSAKSI
// ─────────────────────────────────────────

/** Ambil semua transaksi (admin) atau transaksi KK tertentu (user) */
export async function fetchTransaksi(kkId = null) {
  let query = supabase.from("transaksi").select("*").order("bulan_iuran", { ascending: false });
  if (kkId) query = query.eq("kk_id", kkId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/** Update status transaksi (admin only) */
export async function updateStatusTransaksi(txId, updates) {
  const { data, error } = await supabase
    .from("transaksi")
    .update(updates)
    .eq("id", txId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Insert transaksi baru */
export async function insertTransaksi(transaksi) {
  const { data, error } = await supabase
    .from("transaksi")
    .insert(transaksi)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─────────────────────────────────────────
// CRUD ANGGOTA (admin only)
// ─────────────────────────────────────────

/** Tambah anggota baru + pasangan (opsional) */
export async function insertAnggota(anggotaData, pasanganData = null) {
  const { data, error } = await supabase
    .from("anggota")
    .insert(anggotaData)
    .select()
    .single();
  if (error) throw error;

  if (pasanganData) {
    const pArray = Array.isArray(pasanganData) ? pasanganData : [pasanganData];
    if (pArray.length > 0) {
      const payload = pArray.map(p => ({ ...p, anggota_id: data.id }));
      const { error: pe } = await supabase.from("pasangan").insert(payload);
      if (pe) throw pe;
    }
  }

  return data;
}

/** Update data anggota */
export async function updateAnggota(id, updates) {
  const { data, error } = await supabase
    .from("anggota")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Hapus anggota (cascade ke pasangan dan anak via DB) */
export async function deleteAnggota(id) {
  const { error } = await supabase.from("anggota").delete().eq("id", id);
  if (error) throw error;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

export const BULAN_LABELS = {
  "2025-02": "Februari 2025",
  "2025-03": "Maret 2025",
  "2025-04": "April 2025",
  "2025-05": "Mei 2025",
  "2025-06": "Juni 2025",
  "2025-07": "Juli 2025",
  "2025-08": "Agustus 2025",
};

export const BULAN_LIST = Object.keys(BULAN_LABELS);

export function getTotalTerkumpul(transaksi) {
  return transaksi
    .filter((t) => t.status === "lunas")
    .reduce((sum, t) => sum + t.nominal_bayar, 0);
}

export function getStatusKK(transaksi, kk_id, bulan) {
  const tx = transaksi.find((t) => t.kk_id === kk_id && t.bulan_iuran === bulan);
  if (!tx) return "belum";
  return tx.status;
}

export function getJumlahTunggakan(transaksi, kk_id) {
  return transaksi.filter(
    (t) => t.kk_id === kk_id && (t.status === "menunggak" || t.status === "belum")
  ).length;
}

export function getLeaderboardBulanIni(transaksi, kepalaKeluarga, bulan = "2025-08") {
  return transaksi
    .filter((t) => t.bulan_iuran === bulan && t.status === "lunas" && t.tgl_bayar)
    .sort((a, b) => new Date(a.tgl_bayar) - new Date(b.tgl_bayar))
    .map((t) => {
      const kk = kepalaKeluarga.find((k) => k.id === t.kk_id);
      return { ...t, nama_kk: kk?.nama_kk };
    });
}
