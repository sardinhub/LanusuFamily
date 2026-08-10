-- ============================================================
-- La Nusu Family Portal — Seed Data
-- Jalankan SETELAH schema.sql berhasil dieksekusi
-- ============================================================

-- ─────────────────────────────────────────
-- ANGGOTA (Flat tree — parent_id menunjuk ke ayah)
-- ─────────────────────────────────────────
INSERT INTO public.anggota (id, nama, gelar, jenis_kelamin, lahir, meninggal, foto, cabang, parent_id, ibu_id, kk_id, keterangan, is_root) VALUES
  -- Root
  ('la-nusu',         'La Nusu',          'Leluhur',               'L', '~1940', '~1995', NULL, 'root',      NULL,        NULL,          NULL,              'Leluhur keturunan keluarga besar La Nusu', TRUE),
  -- Generasi 1 — Anak La Nusu
  ('damis-nusu',      'Damis Nusu',       'Anak ke-1 (Indo Jani)', 'L', '1965',  NULL,    NULL, 'indo-jani', 'la-nusu',   'indo-jani',   'kk-damis',        'Putra sulung dari Indo Jani', FALSE),
  ('maraunga',        'Maraunga',         'Anak ke-2 (Indo Jani)', 'L', '1968',  NULL,    NULL, 'indo-jani', 'la-nusu',   'indo-jani',   'kk-maraunga',     'Putra kedua dari Indo Jani', FALSE),
  ('munawarah',       'Munawarah',        'Anak ke-3 (Indo Sabi)', 'P', '1972',  NULL,    NULL, 'indo-sabi', 'la-nusu',   'indo-sabi',   'kk-munawarah',    'Putri sulung dari Indo Sabi', FALSE),
  ('kamarullah',      'Kamarullah',       'Anak ke-4 (Indo Sabi)', 'L', '1975',  NULL,    NULL, 'indo-sabi', 'la-nusu',   'indo-sabi',   'kk-kamarullah',   'Putra bungsu dari Indo Sabi', FALSE),
  -- Generasi 2 — Cucu La Nusu
  ('anak-damis-1',    'Ahmad Fauzan',     'Anak ke-1 (Damis)',     'L', '1990',  NULL,    NULL, 'indo-jani', 'damis-nusu','istri-damis',  'kk-fauzan',       'Cucu dari Damis Nusu, sudah berkeluarga', FALSE),
  ('anak-damis-2',    'Sitti Hajar',      'Anak ke-2 (Damis)',     'P', '1993',  NULL,    NULL, 'indo-jani', 'damis-nusu','istri-damis',  NULL,              'Belum berkeluarga', FALSE),
  ('anak-damis-3',    'M. Rizal',         'Anak ke-3 (Damis)',     'L', '1997',  NULL,    NULL, 'indo-jani', 'damis-nusu','istri-damis',  NULL,              'Masih kuliah', FALSE),
  ('anak-maraunga-1', 'Ilham Maraunga',   'Anak ke-1 (Maraunga)',  'L', '1992',  NULL,    NULL, 'indo-jani', 'maraunga',  'istri-maraunga','kk-ilham',      'Sudah berkeluarga, tinggal di Makassar', FALSE),
  ('anak-maraunga-2', 'Rahmi Maraunga',   'Anak ke-2 (Maraunga)',  'P', '1995',  NULL,    NULL, 'indo-jani', 'maraunga',  'istri-maraunga', NULL,            'Belum berkeluarga', FALSE),
  ('anak-muna-1',     'Asril Baharuddin', 'Anak ke-1 (Munawarah)', 'L', '1994',  NULL,    NULL, 'indo-sabi', 'munawarah', 'munawarah',   'kk-asril',        'Sudah berkeluarga', FALSE),
  ('anak-muna-2',     'Nurul Hikmah',     'Anak ke-2 (Munawarah)', 'P', '1997',  NULL,    NULL, 'indo-sabi', 'munawarah', 'munawarah',   NULL,              'Sedang menempuh pendidikan', FALSE),
  ('anak-kamar-1',    'Wahyudi Kamarullah','Anak ke-1 (Kamarullah)','L', '1998',  NULL,    NULL, 'indo-sabi', 'kamarullah','istri-kamarullah', NULL,         'Masih muda, belum berkeluarga', FALSE),
  ('anak-kamar-2',    'Nabila Kamarullah','Anak ke-2 (Kamarullah)', 'P', '2001',  NULL,    NULL, 'indo-sabi', 'kamarullah','istri-kamarullah', NULL,         'Pelajar', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- PASANGAN
-- ─────────────────────────────────────────
INSERT INTO public.pasangan (id, anggota_id, nama, gelar, jenis_kelamin, lahir, meninggal, foto, cabang) VALUES
  ('indo-jani',          'la-nusu',      'Indo Jani',     'Istri 1', 'P', '~1942', '~1998', NULL, 'root'),
  ('indo-sabi',          'la-nusu',      'Indo Sabi',     'Istri 2', 'P', '~1948', NULL,    NULL, 'root'),
  ('istri-damis',        'damis-nusu',   'Hj. Ramlah',    'Istri',   'P', '1968',  NULL,    NULL, 'indo-jani'),
  ('istri-maraunga',     'maraunga',     'Hj. Suriani',   'Istri',   'P', '1970',  NULL,    NULL, 'indo-jani'),
  ('suami-munawarah',    'munawarah',    'H. Baharuddin', 'Suami',   'L', '1969',  NULL,    NULL, 'indo-sabi'),
  ('istri-kamarullah',   'kamarullah',   'Hj. Aminah',    'Istri',   'P', '1977',  NULL,    NULL, 'indo-sabi'),
  ('istri-fauzan',       'anak-damis-1', 'Nur Aini',      'Istri',   'P', '1992',  NULL,    NULL, 'indo-jani'),
  ('istri-ilham',        'anak-maraunga-1','Fitriani',    'Istri',   'P', '1994',  NULL,    NULL, 'indo-jani'),
  ('istri-asril',        'anak-muna-1',  'Reski Amalia',  'Istri',   'P', '1996',  NULL,    NULL, 'indo-sabi')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- KEPALA KELUARGA
-- ─────────────────────────────────────────
INSERT INTO public.kepala_keluarga (id, nama_kk, nama_pasangan, jumlah_anggota, tagihan_bulanan, cabang, alamat, telepon, anggota_id) VALUES
  ('kk-damis',     'Damis Nusu',      'Hj. Ramlah',   5, 50000, 'indo-jani', 'Jl. Merdeka No. 12, Baubau',           '0812-3456-7890', 'damis-nusu'),
  ('kk-maraunga',  'Maraunga',        'Hj. Suriani',  4, 40000, 'indo-jani', 'Jl. Wolter Monginsidi No. 5, Baubau',  '0813-9876-5432', 'maraunga'),
  ('kk-munawarah', 'H. Baharuddin',   'Munawarah',    4, 40000, 'indo-sabi', 'Jl. Pahlawan No. 8, Kendari',          '0815-1234-5678', 'munawarah'),
  ('kk-kamarullah','Kamarullah',      'Hj. Aminah',   4, 40000, 'indo-sabi', 'Jl. Diponegoro No. 3, Baubau',         '0816-8765-4321', 'kamarullah'),
  ('kk-fauzan',    'Ahmad Fauzan',    'Nur Aini',     2, 20000, 'indo-jani', 'Jl. Sudirman No. 45, Makassar',        '0817-2345-6789', 'anak-damis-1'),
  ('kk-ilham',     'Ilham Maraunga',  'Fitriani',     3, 30000, 'indo-jani', 'Jl. Rappocini No. 7, Makassar',        '0818-3456-7891', 'anak-maraunga-1'),
  ('kk-asril',     'Asril Baharuddin','Reski Amalia', 2, 20000, 'indo-sabi', 'Jl. Imam Bonjol No. 15, Kendari',      '0819-4567-8902', 'anak-muna-1')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- TRANSAKSI IURAN
-- ─────────────────────────────────────────
INSERT INTO public.transaksi (id, kk_id, bulan_iuran, nominal_bayar, status, tgl_bayar, keterangan) VALUES
  -- kk-damis
  ('tx-001', 'kk-damis', '2025-02', 50000, 'lunas',    '2025-02-03', 'Transfer BRI'),
  ('tx-002', 'kk-damis', '2025-03', 50000, 'lunas',    '2025-03-01', 'Transfer BRI'),
  ('tx-003', 'kk-damis', '2025-04', 50000, 'lunas',    '2025-04-05', 'Transfer BRI'),
  ('tx-004', 'kk-damis', '2025-05', 50000, 'lunas',    '2025-05-02', 'Transfer BRI'),
  ('tx-005', 'kk-damis', '2025-06', 50000, 'lunas',    '2025-06-04', 'Transfer BRI'),
  ('tx-006', 'kk-damis', '2025-07', 50000, 'lunas',    '2025-07-01', 'Transfer BRI'),
  ('tx-007', 'kk-damis', '2025-08', 50000, 'pending',  '2025-08-09', 'Menunggu verifikasi'),
  -- kk-maraunga
  ('tx-011', 'kk-maraunga', '2025-02', 40000, 'lunas',     '2025-02-07', 'Transfer BSI'),
  ('tx-012', 'kk-maraunga', '2025-03', 40000, 'lunas',     '2025-03-10', 'Transfer BSI'),
  ('tx-013', 'kk-maraunga', '2025-04', 40000, 'lunas',     '2025-04-08', 'Transfer BSI'),
  ('tx-014', 'kk-maraunga', '2025-05', 40000, 'lunas',     '2025-05-09', 'Transfer BSI'),
  ('tx-015', 'kk-maraunga', '2025-06', 40000, 'menunggak', NULL,         'Belum ada konfirmasi'),
  ('tx-016', 'kk-maraunga', '2025-07', 40000, 'menunggak', NULL,         'Belum ada konfirmasi'),
  ('tx-017', 'kk-maraunga', '2025-08', 40000, 'menunggak', NULL,         'Belum ada konfirmasi'),
  -- kk-munawarah
  ('tx-021', 'kk-munawarah', '2025-02', 40000, 'lunas', '2025-02-05', 'Titip via Kamarullah'),
  ('tx-022', 'kk-munawarah', '2025-03', 40000, 'lunas', '2025-03-03', 'Titip via Kamarullah'),
  ('tx-023', 'kk-munawarah', '2025-04', 40000, 'lunas', '2025-04-04', 'Transfer BNI'),
  ('tx-024', 'kk-munawarah', '2025-05', 40000, 'lunas', '2025-05-05', 'Transfer BNI'),
  ('tx-025', 'kk-munawarah', '2025-06', 40000, 'lunas', '2025-06-02', 'Transfer BNI'),
  ('tx-026', 'kk-munawarah', '2025-07', 40000, 'lunas', '2025-07-03', 'Transfer BNI'),
  ('tx-027', 'kk-munawarah', '2025-08', 40000, 'lunas', '2025-08-01', 'Transfer BNI'),
  -- kk-kamarullah
  ('tx-031', 'kk-kamarullah', '2025-02', 40000, 'lunas',   '2025-02-04', 'Tunai ke Bendahara'),
  ('tx-032', 'kk-kamarullah', '2025-03', 40000, 'lunas',   '2025-03-02', 'Tunai ke Bendahara'),
  ('tx-033', 'kk-kamarullah', '2025-04', 40000, 'lunas',   '2025-04-01', 'Tunai ke Bendahara'),
  ('tx-034', 'kk-kamarullah', '2025-05', 40000, 'lunas',   '2025-05-03', 'Tunai ke Bendahara'),
  ('tx-035', 'kk-kamarullah', '2025-06', 40000, 'lunas',   '2025-06-01', 'Tunai ke Bendahara'),
  ('tx-036', 'kk-kamarullah', '2025-07', 40000, 'lunas',   '2025-07-02', 'Transfer BRI'),
  ('tx-037', 'kk-kamarullah', '2025-08', 40000, 'pending', '2025-08-08', 'Menunggu verifikasi'),
  -- kk-fauzan
  ('tx-041', 'kk-fauzan', '2025-02', 20000, 'lunas', '2025-02-10', 'Transfer BCA'),
  ('tx-042', 'kk-fauzan', '2025-03', 20000, 'lunas', '2025-03-12', 'Transfer BCA'),
  ('tx-043', 'kk-fauzan', '2025-04', 20000, 'lunas', '2025-04-11', 'Transfer BCA'),
  ('tx-044', 'kk-fauzan', '2025-05', 20000, 'lunas', '2025-05-10', 'Transfer BCA'),
  ('tx-045', 'kk-fauzan', '2025-06', 20000, 'lunas', '2025-06-09', 'Transfer BCA'),
  ('tx-046', 'kk-fauzan', '2025-07', 20000, 'lunas', '2025-07-08', 'Transfer BCA'),
  ('tx-047', 'kk-fauzan', '2025-08', 20000, 'lunas', '2025-08-02', 'Transfer BCA'),
  -- kk-ilham
  ('tx-051', 'kk-ilham', '2025-02', 30000, 'lunas',     '2025-02-08', 'Transfer Mandiri'),
  ('tx-052', 'kk-ilham', '2025-03', 30000, 'lunas',     '2025-03-07', 'Transfer Mandiri'),
  ('tx-053', 'kk-ilham', '2025-04', 30000, 'lunas',     '2025-04-09', 'Transfer Mandiri'),
  ('tx-054', 'kk-ilham', '2025-05', 30000, 'menunggak', NULL,         'Belum konfirmasi'),
  ('tx-055', 'kk-ilham', '2025-06', 30000, 'menunggak', NULL,         'Belum konfirmasi'),
  ('tx-056', 'kk-ilham', '2025-07', 30000, 'lunas',     '2025-07-15', 'Transfer Mandiri (telat)'),
  ('tx-057', 'kk-ilham', '2025-08', 30000, 'belum',     NULL,         ''),
  -- kk-asril
  ('tx-061', 'kk-asril', '2025-02', 20000, 'lunas',   '2025-02-06', 'Transfer BNI'),
  ('tx-062', 'kk-asril', '2025-03', 20000, 'lunas',   '2025-03-05', 'Transfer BNI'),
  ('tx-063', 'kk-asril', '2025-04', 20000, 'lunas',   '2025-04-06', 'Transfer BNI'),
  ('tx-064', 'kk-asril', '2025-05', 20000, 'lunas',   '2025-05-07', 'Transfer BNI'),
  ('tx-065', 'kk-asril', '2025-06', 20000, 'lunas',   '2025-06-06', 'Transfer BNI'),
  ('tx-066', 'kk-asril', '2025-07', 20000, 'lunas',   '2025-07-05', 'Transfer BNI'),
  ('tx-067', 'kk-asril', '2025-08', 20000, 'pending', '2025-08-07', 'Menunggu verifikasi')
ON CONFLICT (id) DO NOTHING;
