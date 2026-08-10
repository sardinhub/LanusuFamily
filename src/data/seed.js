// ============================================================
// DATA DEMO - La Nusu Family Portal
// Struktur silsilah dan data iuran untuk keperluan prototype
// ============================================================

// --- SILSILAH ---
export const SILSILAH = {
  id: "la-nusu",
  nama: "La Nusu",
  gelar: "Leluhur",
  jenis_kelamin: "L",
  lahir: "~1940",
  meninggal: "~1995",
  foto: null,
  cabang: "root",
  keterangan: "Leluhur keturunan keluarga besar La Nusu",
  pasangan: [
    {
      id: "indo-jani",
      nama: "Indo Jani",
      gelar: "Istri 1",
      jenis_kelamin: "P",
      lahir: "~1942",
      meninggal: "~1998",
      foto: null,
      cabang: "indo-jani",
    },
    {
      id: "indo-sabi",
      nama: "Indo Sabi",
      gelar: "Istri 2",
      jenis_kelamin: "P",
      lahir: "~1948",
      meninggal: null,
      foto: null,
      cabang: "indo-sabi",
    },
  ],
  anak: [
    // --- CABANG INDO JANI ---
    {
      id: "damis-nusu",
      nama: "Damis Nusu",
      gelar: "Anak ke-1 (Indo Jani)",
      jenis_kelamin: "L",
      lahir: "1965",
      meninggal: null,
      foto: null,
      cabang: "indo-jani",
      ibu_id: "indo-jani",
      kk_id: "kk-damis",
      keterangan: "Putra sulung dari Indo Jani",
      pasangan: [
        {
          id: "istri-damis",
          nama: "Hj. Ramlah",
          gelar: "Istri",
          jenis_kelamin: "P",
          lahir: "1968",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
        },
      ],
      anak: [
        {
          id: "anak-damis-1",
          nama: "Ahmad Fauzan",
          gelar: "Anak ke-1 (Damis)",
          jenis_kelamin: "L",
          lahir: "1990",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
          ibu_id: "istri-damis",
          kk_id: "kk-fauzan",
          keterangan: "Cucu dari Damis Nusu, sudah berkeluarga",
          pasangan: [
            {
              id: "istri-fauzan",
              nama: "Nur Aini",
              gelar: "Istri",
              jenis_kelamin: "P",
              lahir: "1992",
              meninggal: null,
              foto: null,
              cabang: "indo-jani",
            },
          ],
          anak: [],
        },
        {
          id: "anak-damis-2",
          nama: "Sitti Hajar",
          gelar: "Anak ke-2 (Damis)",
          jenis_kelamin: "P",
          lahir: "1993",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
          ibu_id: "istri-damis",
          kk_id: null,
          keterangan: "Belum berkeluarga",
          pasangan: [],
          anak: [],
        },
        {
          id: "anak-damis-3",
          nama: "M. Rizal",
          gelar: "Anak ke-3 (Damis)",
          jenis_kelamin: "L",
          lahir: "1997",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
          ibu_id: "istri-damis",
          kk_id: null,
          keterangan: "Masih kuliah",
          pasangan: [],
          anak: [],
        },
      ],
    },
    {
      id: "maraunga",
      nama: "Maraunga",
      gelar: "Anak ke-2 (Indo Jani)",
      jenis_kelamin: "L",
      lahir: "1968",
      meninggal: null,
      foto: null,
      cabang: "indo-jani",
      ibu_id: "indo-jani",
      kk_id: "kk-maraunga",
      keterangan: "Putra kedua dari Indo Jani",
      pasangan: [
        {
          id: "istri-maraunga",
          nama: "Hj. Suriani",
          gelar: "Istri",
          jenis_kelamin: "P",
          lahir: "1970",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
        },
      ],
      anak: [
        {
          id: "anak-maraunga-1",
          nama: "Ilham Maraunga",
          gelar: "Anak ke-1 (Maraunga)",
          jenis_kelamin: "L",
          lahir: "1992",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
          ibu_id: "istri-maraunga",
          kk_id: "kk-ilham",
          keterangan: "Sudah berkeluarga, tinggal di Makassar",
          pasangan: [
            {
              id: "istri-ilham",
              nama: "Fitriani",
              gelar: "Istri",
              jenis_kelamin: "P",
              lahir: "1994",
              meninggal: null,
              foto: null,
              cabang: "indo-jani",
            },
          ],
          anak: [],
        },
        {
          id: "anak-maraunga-2",
          nama: "Rahmi Maraunga",
          gelar: "Anak ke-2 (Maraunga)",
          jenis_kelamin: "P",
          lahir: "1995",
          meninggal: null,
          foto: null,
          cabang: "indo-jani",
          ibu_id: "istri-maraunga",
          kk_id: null,
          keterangan: "Belum berkeluarga",
          pasangan: [],
          anak: [],
        },
      ],
    },
    // --- CABANG INDO SABI ---
    {
      id: "munawarah",
      nama: "Munawarah",
      gelar: "Anak ke-3 (Indo Sabi)",
      jenis_kelamin: "P",
      lahir: "1972",
      meninggal: null,
      foto: null,
      cabang: "indo-sabi",
      ibu_id: "indo-sabi",
      kk_id: "kk-munawarah",
      keterangan: "Putri sulung dari Indo Sabi",
      pasangan: [
        {
          id: "suami-munawarah",
          nama: "H. Baharuddin",
          gelar: "Suami",
          jenis_kelamin: "L",
          lahir: "1969",
          meninggal: null,
          foto: null,
          cabang: "indo-sabi",
        },
      ],
      anak: [
        {
          id: "anak-muna-1",
          nama: "Asril Baharuddin",
          gelar: "Anak ke-1 (Munawarah)",
          jenis_kelamin: "L",
          lahir: "1994",
          meninggal: null,
          foto: null,
          cabang: "indo-sabi",
          ibu_id: "munawarah",
          kk_id: "kk-asril",
          keterangan: "Sudah berkeluarga",
          pasangan: [
            {
              id: "istri-asril",
              nama: "Reski Amalia",
              gelar: "Istri",
              jenis_kelamin: "P",
              lahir: "1996",
              meninggal: null,
              foto: null,
              cabang: "indo-sabi",
            },
          ],
          anak: [],
        },
        {
          id: "anak-muna-2",
          nama: "Nurul Hikmah",
          gelar: "Anak ke-2 (Munawarah)",
          jenis_kelamin: "P",
          lahir: "1997",
          meninggal: null,
          foto: null,
          cabang: "indo-sabi",
          ibu_id: "munawarah",
          kk_id: null,
          keterangan: "Sedang menempuh pendidikan",
          pasangan: [],
          anak: [],
        },
      ],
    },
    {
      id: "kamarullah",
      nama: "Kamarullah",
      gelar: "Anak ke-4 (Indo Sabi)",
      jenis_kelamin: "L",
      lahir: "1975",
      meninggal: null,
      foto: null,
      cabang: "indo-sabi",
      ibu_id: "indo-sabi",
      kk_id: "kk-kamarullah",
      keterangan: "Putra bungsu dari Indo Sabi",
      pasangan: [
        {
          id: "istri-kamarullah",
          nama: "Hj. Aminah",
          gelar: "Istri",
          jenis_kelamin: "P",
          lahir: "1977",
          meninggal: null,
          foto: null,
          cabang: "indo-sabi",
        },
      ],
      anak: [
        {
          id: "anak-kamar-1",
          nama: "Wahyudi Kamarullah",
          gelar: "Anak ke-1 (Kamarullah)",
          jenis_kelamin: "L",
          lahir: "1998",
          meninggal: null,
          foto: null,
          cabang: "indo-sabi",
          ibu_id: "istri-kamarullah",
          kk_id: null,
          keterangan: "Masih muda, belum berkeluarga",
          pasangan: [],
          anak: [],
        },
        {
          id: "anak-kamar-2",
          nama: "Nabila Kamarullah",
          gelar: "Anak ke-2 (Kamarullah)",
          jenis_kelamin: "P",
          lahir: "2001",
          meninggal: null,
          foto: null,
          cabang: "indo-sabi",
          ibu_id: "istri-kamarullah",
          kk_id: null,
          keterangan: "Pelajar",
          pasangan: [],
          anak: [],
        },
      ],
    },
  ],
};

// --- DATA KEPALA KELUARGA & IURAN ---
export const KEPALA_KELUARGA = [
  {
    id: "kk-damis",
    nama_kk: "Damis Nusu",
    nama_pasangan: "Hj. Ramlah",
    jumlah_anggota: 5, // KK + istri + 3 anak
    tagihan_bulanan: 50000,
    cabang: "indo-jani",
    alamat: "Jl. Merdeka No. 12, Baubau",
    telepon: "0812-3456-7890",
    anggota_id: "damis-nusu",
  },
  {
    id: "kk-maraunga",
    nama_kk: "Maraunga",
    nama_pasangan: "Hj. Suriani",
    jumlah_anggota: 4, // KK + istri + 2 anak
    tagihan_bulanan: 40000,
    cabang: "indo-jani",
    alamat: "Jl. Wolter Monginsidi No. 5, Baubau",
    telepon: "0813-9876-5432",
    anggota_id: "maraunga",
  },
  {
    id: "kk-munawarah",
    nama_kk: "H. Baharuddin",
    nama_pasangan: "Munawarah",
    jumlah_anggota: 4, // KK + istri + 2 anak
    tagihan_bulanan: 40000,
    cabang: "indo-sabi",
    alamat: "Jl. Pahlawan No. 8, Kendari",
    telepon: "0815-1234-5678",
    anggota_id: "munawarah",
  },
  {
    id: "kk-kamarullah",
    nama_kk: "Kamarullah",
    nama_pasangan: "Hj. Aminah",
    jumlah_anggota: 4, // KK + istri + 2 anak
    tagihan_bulanan: 40000,
    cabang: "indo-sabi",
    alamat: "Jl. Diponegoro No. 3, Baubau",
    telepon: "0816-8765-4321",
    anggota_id: "kamarullah",
  },
  {
    id: "kk-fauzan",
    nama_kk: "Ahmad Fauzan",
    nama_pasangan: "Nur Aini",
    jumlah_anggota: 2, // KK + istri (belum punya anak)
    tagihan_bulanan: 20000,
    cabang: "indo-jani",
    alamat: "Jl. Sudirman No. 45, Makassar",
    telepon: "0817-2345-6789",
    anggota_id: "anak-damis-1",
  },
  {
    id: "kk-ilham",
    nama_kk: "Ilham Maraunga",
    nama_pasangan: "Fitriani",
    jumlah_anggota: 3, // KK + istri + 1 anak
    tagihan_bulanan: 30000,
    cabang: "indo-jani",
    alamat: "Jl. Rappocini No. 7, Makassar",
    telepon: "0818-3456-7891",
    anggota_id: "anak-maraunga-1",
  },
  {
    id: "kk-asril",
    nama_kk: "Asril Baharuddin",
    nama_pasangan: "Reski Amalia",
    jumlah_anggota: 2, // KK + istri
    tagihan_bulanan: 20000,
    cabang: "indo-sabi",
    alamat: "Jl. Imam Bonjol No. 15, Kendari",
    telepon: "0819-4567-8902",
    anggota_id: "anak-muna-1",
  },
];

// --- TRANSAKSI IURAN (6 bulan terakhir) ---
const bulanList = ["2025-02", "2025-03", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08"];

// Helper untuk membuat transaksi
function tx(id, kk_id, bulan, nominal, status, tgl_bayar, keterangan = "") {
  return { id, kk_id, bulan_iuran: bulan, nominal_bayar: nominal, status, tgl_bayar, keterangan };
}

export const TRANSAKSI = [
  // kk-damis (tagihan 50.000)
  tx("tx-001", "kk-damis", "2025-02", 50000, "lunas", "2025-02-03", "Transfer BRI"),
  tx("tx-002", "kk-damis", "2025-03", 50000, "lunas", "2025-03-01", "Transfer BRI"),
  tx("tx-003", "kk-damis", "2025-04", 50000, "lunas", "2025-04-05", "Transfer BRI"),
  tx("tx-004", "kk-damis", "2025-05", 50000, "lunas", "2025-05-02", "Transfer BRI"),
  tx("tx-005", "kk-damis", "2025-06", 50000, "lunas", "2025-06-04", "Transfer BRI"),
  tx("tx-006", "kk-damis", "2025-07", 50000, "lunas", "2025-07-01", "Transfer BRI"),
  tx("tx-007", "kk-damis", "2025-08", 50000, "pending", "2025-08-09", "Menunggu verifikasi"),

  // kk-maraunga (tagihan 40.000)
  tx("tx-011", "kk-maraunga", "2025-02", 40000, "lunas", "2025-02-07", "Transfer BSI"),
  tx("tx-012", "kk-maraunga", "2025-03", 40000, "lunas", "2025-03-10", "Transfer BSI"),
  tx("tx-013", "kk-maraunga", "2025-04", 40000, "lunas", "2025-04-08", "Transfer BSI"),
  tx("tx-014", "kk-maraunga", "2025-05", 40000, "lunas", "2025-05-09", "Transfer BSI"),
  tx("tx-015", "kk-maraunga", "2025-06", 40000, "menunggak", null, "Belum ada konfirmasi"),
  tx("tx-016", "kk-maraunga", "2025-07", 40000, "menunggak", null, "Belum ada konfirmasi"),
  tx("tx-017", "kk-maraunga", "2025-08", 40000, "menunggak", null, "Belum ada konfirmasi"),

  // kk-munawarah (tagihan 40.000)
  tx("tx-021", "kk-munawarah", "2025-02", 40000, "lunas", "2025-02-05", "Titip via Kamarullah"),
  tx("tx-022", "kk-munawarah", "2025-03", 40000, "lunas", "2025-03-03", "Titip via Kamarullah"),
  tx("tx-023", "kk-munawarah", "2025-04", 40000, "lunas", "2025-04-04", "Transfer BNI"),
  tx("tx-024", "kk-munawarah", "2025-05", 40000, "lunas", "2025-05-05", "Transfer BNI"),
  tx("tx-025", "kk-munawarah", "2025-06", 40000, "lunas", "2025-06-02", "Transfer BNI"),
  tx("tx-026", "kk-munawarah", "2025-07", 40000, "lunas", "2025-07-03", "Transfer BNI"),
  tx("tx-027", "kk-munawarah", "2025-08", 40000, "lunas", "2025-08-01", "Transfer BNI"),

  // kk-kamarullah (tagihan 40.000)
  tx("tx-031", "kk-kamarullah", "2025-02", 40000, "lunas", "2025-02-04", "Tunai ke Bendahara"),
  tx("tx-032", "kk-kamarullah", "2025-03", 40000, "lunas", "2025-03-02", "Tunai ke Bendahara"),
  tx("tx-033", "kk-kamarullah", "2025-04", 40000, "lunas", "2025-04-01", "Tunai ke Bendahara"),
  tx("tx-034", "kk-kamarullah", "2025-05", 40000, "lunas", "2025-05-03", "Tunai ke Bendahara"),
  tx("tx-035", "kk-kamarullah", "2025-06", 40000, "lunas", "2025-06-01", "Tunai ke Bendahara"),
  tx("tx-036", "kk-kamarullah", "2025-07", 40000, "lunas", "2025-07-02", "Transfer BRI"),
  tx("tx-037", "kk-kamarullah", "2025-08", 40000, "pending", "2025-08-08", "Menunggu verifikasi"),

  // kk-fauzan (tagihan 20.000)
  tx("tx-041", "kk-fauzan", "2025-02", 20000, "lunas", "2025-02-10", "Transfer BCA"),
  tx("tx-042", "kk-fauzan", "2025-03", 20000, "lunas", "2025-03-12", "Transfer BCA"),
  tx("tx-043", "kk-fauzan", "2025-04", 20000, "lunas", "2025-04-11", "Transfer BCA"),
  tx("tx-044", "kk-fauzan", "2025-05", 20000, "lunas", "2025-05-10", "Transfer BCA"),
  tx("tx-045", "kk-fauzan", "2025-06", 20000, "lunas", "2025-06-09", "Transfer BCA"),
  tx("tx-046", "kk-fauzan", "2025-07", 20000, "lunas", "2025-07-08", "Transfer BCA"),
  tx("tx-047", "kk-fauzan", "2025-08", 20000, "lunas", "2025-08-02", "Transfer BCA"),

  // kk-ilham (tagihan 30.000)
  tx("tx-051", "kk-ilham", "2025-02", 30000, "lunas", "2025-02-08", "Transfer Mandiri"),
  tx("tx-052", "kk-ilham", "2025-03", 30000, "lunas", "2025-03-07", "Transfer Mandiri"),
  tx("tx-053", "kk-ilham", "2025-04", 30000, "lunas", "2025-04-09", "Transfer Mandiri"),
  tx("tx-054", "kk-ilham", "2025-05", 30000, "menunggak", null, "Belum konfirmasi"),
  tx("tx-055", "kk-ilham", "2025-06", 30000, "menunggak", null, "Belum konfirmasi"),
  tx("tx-056", "kk-ilham", "2025-07", 30000, "lunas", "2025-07-15", "Transfer Mandiri (telat)"),
  tx("tx-057", "kk-ilham", "2025-08", 30000, "belum", null, ""),

  // kk-asril (tagihan 20.000)
  tx("tx-061", "kk-asril", "2025-02", 20000, "lunas", "2025-02-06", "Transfer BNI"),
  tx("tx-062", "kk-asril", "2025-03", 20000, "lunas", "2025-03-05", "Transfer BNI"),
  tx("tx-063", "kk-asril", "2025-04", 20000, "lunas", "2025-04-06", "Transfer BNI"),
  tx("tx-064", "kk-asril", "2025-05", 20000, "lunas", "2025-05-07", "Transfer BNI"),
  tx("tx-065", "kk-asril", "2025-06", 20000, "lunas", "2025-06-06", "Transfer BNI"),
  tx("tx-066", "kk-asril", "2025-07", 20000, "lunas", "2025-07-05", "Transfer BNI"),
  tx("tx-067", "kk-asril", "2025-08", 20000, "pending", "2025-08-07", "Menunggu verifikasi"),
];

export const BULAN_LIST = bulanList;

export const BULAN_LABELS = {
  "2025-02": "Februari 2025",
  "2025-03": "Maret 2025",
  "2025-04": "April 2025",
  "2025-05": "Mei 2025",
  "2025-06": "Juni 2025",
  "2025-07": "Juli 2025",
  "2025-08": "Agustus 2025",
};

// Helper: hitung total terkumpul (hanya yang lunas)
export function getTotalTerkumpul() {
  return TRANSAKSI.filter((t) => t.status === "lunas").reduce(
    (sum, t) => sum + t.nominal_bayar,
    0
  );
}

// Helper: status KK untuk bulan tertentu
export function getStatusKK(kk_id, bulan) {
  const tx = TRANSAKSI.find((t) => t.kk_id === kk_id && t.bulan_iuran === bulan);
  if (!tx) return "belum";
  return tx.status;
}

// Helper: berapa bulan KK menunggak
export function getJumlahTunggakan(kk_id) {
  return TRANSAKSI.filter(
    (t) => t.kk_id === kk_id && (t.status === "menunggak" || t.status === "belum")
  ).length;
}

// Helper: leaderboard bulan ini
export function getLeaderboardBulanIni() {
  const bulanIni = "2025-08";
  return TRANSAKSI.filter(
    (t) => t.bulan_iuran === bulanIni && t.status === "lunas" && t.tgl_bayar
  )
    .sort((a, b) => new Date(a.tgl_bayar) - new Date(b.tgl_bayar))
    .map((t) => {
      const kk = KEPALA_KELUARGA.find((k) => k.id === t.kk_id);
      return { ...t, nama_kk: kk?.nama_kk };
    });
}
