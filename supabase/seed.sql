-- ============================================================
-- La Nusu Family Portal — Seed Data (Root Only)
-- Jalankan SETELAH schema.sql berhasil dieksekusi
-- ============================================================

-- ─────────────────────────────────────────
-- ANGGOTA (Flat tree — parent_id menunjuk ke ayah)
-- ─────────────────────────────────────────
INSERT INTO public.anggota (id, nama, gelar, jenis_kelamin, lahir, meninggal, foto, cabang, parent_id, ibu_id, kk_id, keterangan, is_root) VALUES
  -- Root
  ('la-nusu',         'La Nusu',          'Leluhur',               'L', '~1940', '~1995', NULL, 'root',      NULL,        NULL,          NULL,              'Leluhur keturunan keluarga besar La Nusu', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- PASANGAN
-- ─────────────────────────────────────────
INSERT INTO public.pasangan (id, anggota_id, nama, gelar, jenis_kelamin, lahir, meninggal, foto, cabang) VALUES
  ('indo-jani',          'la-nusu',      'Indo Jani',     'Istri 1', 'P', '~1942', '~1998', NULL, 'root'),
  ('indo-sabi',          'la-nusu',      'Indo Sabi',     'Istri 2', 'P', '~1948', NULL,    NULL, 'root')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────
-- KEPALA KELUARGA & TRANSAKSI
-- ─────────────────────────────────────────
-- (Dikosongkan untuk produksi)
