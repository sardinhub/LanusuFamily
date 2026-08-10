import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { usePasscode } from "./PasscodeContext";
import {
  fetchSilsilah,
  fetchAnggotaFlat,
  fetchKepalaKeluarga,
  fetchTransaksi,
  insertAnggota,
  updateAnggota as dbUpdateAnggota,
  deleteAnggota as dbDeleteAnggota,
  insertKepalaKeluarga,
  updateStatusTransaksi,
  insertTransaksi,
} from "../lib/db";

const AppContext = createContext(null);

// ── Helper: flatten tree untuk dropdown ──
export function flattenTree(node, result = []) {
  if (!node) return result;
  const { anak, pasangan, ...rest } = node;
  result.push(rest);
  if (node.anak?.length) {
    node.anak.forEach((child) => flattenTree(child, result));
  }
  return result;
}

const initialState = {
  selectedMember: null,
  notification: null,
  // Data dari Supabase
  silsilah: null,
  anggotaFlat: [],
  kepalaKeluarga: [],
  transaksi: [],
  // Loading states
  loading: true,
  loadingTransaksi: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_SELECTED_MEMBER":
      return { ...state, selectedMember: action.payload };
    case "CLEAR_SELECTED_MEMBER":
      return { ...state, selectedMember: null };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.payload };
    case "CLEAR_NOTIFICATION":
      return { ...state, notification: null };

    // Data loaded dari Supabase
    case "SET_DATA":
      return {
        ...state,
        silsilah: action.payload.silsilah,
        anggotaFlat: action.payload.anggotaFlat,
        kepalaKeluarga: action.payload.kepalaKeluarga,
        transaksi: action.payload.transaksi,
        loading: false,
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_LOADING_TRANSAKSI":
      return { ...state, loadingTransaksi: action.payload };

    // Transaksi updates (optimistic update)
    case "UPDATE_TRANSAKSI": {
      return {
        ...state,
        transaksi: state.transaksi.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    }
    case "ADD_TRANSAKSI":
      return { ...state, transaksi: [action.payload, ...state.transaksi] };
    case "SET_TRANSAKSI":
      return { ...state, transaksi: action.payload };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const { user, profile } = useAuth();
  const { guestMode } = usePasscode();
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Load semua data saat user login ATAU guest mode aktif ──
  const loadData = useCallback(async () => {
    // Muat data jika login Supabase ATAU akses via passcode (guest)
    if (!user && !guestMode) {
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // Guest hanya bisa lihat semua data publik (silsilah + transaksi umum)
      const kkId = profile?.role === "user" ? profile?.kk_id : null;
      const [silsilah, anggotaFlat, kepalaKeluarga, transaksi] = await Promise.all([
        fetchSilsilah(),
        fetchAnggotaFlat(),
        fetchKepalaKeluarga(),
        fetchTransaksi(kkId),
      ]);
      dispatch({
        type: "SET_DATA",
        payload: { silsilah, anggotaFlat, kepalaKeluarga, transaksi },
      });
    } catch (err) {
      console.error("Gagal load data:", err.message);
      dispatch({ type: "SET_LOADING", payload: false });
      notify("error", "Gagal memuat data. Periksa koneksi dan coba lagi.");
    }
  }, [user, profile, guestMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Notifications ──
  const notify = (type, message) => {
    dispatch({ type: "SET_NOTIFICATION", payload: { type, message } });
    setTimeout(() => dispatch({ type: "CLEAR_NOTIFICATION" }), 3500);
  };

  // ── Selected Member ──
  const setSelectedMember = (member) =>
    dispatch({ type: "SET_SELECTED_MEMBER", payload: member });
  const clearSelectedMember = () => dispatch({ type: "CLEAR_SELECTED_MEMBER" });

  // ── CRUD Anggota (admin only — memanggil Supabase) ──
  const addAnggota = async (parentId, anggotaData, pasanganData = null) => {
    try {
      const slug = anggotaData.nama.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const newId = `anggota-${slug}-${Date.now()}`;
      let finalPasanganData = null;
      if (pasanganData) {
        if (Array.isArray(pasanganData)) {
          finalPasanganData = pasanganData.map((p, i) => ({
            ...p,
            id: `pasangan-${slug}-${Date.now()}-${i}`
          }));
        } else {
          finalPasanganData = { ...pasanganData, id: `pasangan-${slug}-${Date.now()}` };
        }
      }

      await insertAnggota(
        { ...anggotaData, id: newId, parent_id: parentId },
        finalPasanganData
      );
      notify("success", `Anggota "${anggotaData.nama}" berhasil ditambahkan.`);
      await loadData(); // Refresh seluruh tree
    } catch (err) {
      notify("error", `Gagal menambah anggota: ${err.message}`);
    }
  };

  const updateAnggota = async (anggotaData) => {
    try {
      const { id, anak, pasangan, ...updates } = anggotaData;
      await dbUpdateAnggota(id, updates);
      notify("success", `Data "${anggotaData.nama}" berhasil diperbarui.`);
      await loadData();
    } catch (err) {
      notify("error", `Gagal memperbarui anggota: ${err.message}`);
    }
  };

  const deleteAnggota = async (anggotaId) => {
    try {
      await dbDeleteAnggota(anggotaId);
      notify("success", "Anggota berhasil dihapus.");
      await loadData();
    } catch (err) {
      notify("error", `Gagal menghapus anggota: ${err.message}`);
    }
  };

  // ── CRUD Kepala Keluarga ──
  const addKepalaKeluarga = async (kkData) => {
    try {
      const slug = kkData.nama_kk.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const newId = `kk-${slug}-${Date.now()}`;
      
      const { selected_id, ...restKkData } = kkData;
      const payload = {
        ...restKkData,
        id: newId,
        tagihan_bulanan: kkData.jumlah_anggota * 10000,
        anggota_id: selected_id || null,
      };
      
      await insertKepalaKeluarga(payload);
      notify("success", `Kepala Keluarga "${kkData.nama_kk}" berhasil didaftarkan.`);
      await loadData();
    } catch (err) {
      notify("error", `Gagal menambah Kepala Keluarga: ${err.message}`);
    }
  };

  // ── Transaksi ──
  const konfirmasiTransaksi = async (txId, status, extra = {}) => {
    try {
      const updated = await updateStatusTransaksi(txId, { status, ...extra });
      dispatch({ type: "UPDATE_TRANSAKSI", payload: updated });
      notify("success", `Status iuran berhasil diubah ke "${status}".`);
    } catch (err) {
      notify("error", `Gagal update status: ${err.message}`);
    }
  };

  const submitBuktiTransaksi = async (txData) => {
    try {
      const newTx = await insertTransaksi(txData);
      dispatch({ type: "ADD_TRANSAKSI", payload: newTx });
      notify("success", "Bukti iuran berhasil dikirim. Menunggu verifikasi admin.");
    } catch (err) {
      notify("error", `Gagal mengirim bukti: ${err.message}`);
    }
  };

  const catatPembayaranAdmin = async (txData) => {
    try {
      const newTx = await insertTransaksi(txData);
      dispatch({ type: "ADD_TRANSAKSI", payload: newTx });
      notify("success", "Pembayaran iuran berhasil dicatat sebagai Lunas.");
    } catch (err) {
      notify("error", `Gagal mencatat pembayaran: ${err.message}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        // Role & KK dari profile Supabase
        role: profile?.role ?? "user",
        activeKK: profile?.kk_id ?? null,
        profile,
        // Actions
        setSelectedMember,
        clearSelectedMember,
        notify,
        addAnggota,
        updateAnggota,
        deleteAnggota,
        addKepalaKeluarga,
        konfirmasiTransaksi,
        submitBuktiTransaksi,
        catatPembayaranAdmin,
        refreshData: loadData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
