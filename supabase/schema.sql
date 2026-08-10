-- ============================================================
-- La Nusu Family Portal — Supabase Schema
-- Jalankan file ini di SQL Editor Supabase (Project > SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────
-- 1. TABEL PROFILES (extend auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  nama        TEXT,
  role        TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  kk_id       TEXT,           -- null jika admin, diisi jika anggota KK
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: otomatis buat profil saat user baru daftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nama, role, kk_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'kk_id'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─────────────────────────────────────────
-- 2. TABEL ANGGOTA (flat tree)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.anggota (
  id              TEXT PRIMARY KEY,
  nama            TEXT NOT NULL,
  gelar           TEXT,
  jenis_kelamin   TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  lahir           TEXT,
  meninggal       TEXT,
  foto            TEXT,
  cabang          TEXT,
  parent_id       TEXT REFERENCES public.anggota(id) ON DELETE SET NULL,
  ibu_id          TEXT,
  kk_id           TEXT,
  keterangan      TEXT,
  is_root         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. TABEL PASANGAN
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pasangan (
  id              TEXT PRIMARY KEY,
  anggota_id      TEXT NOT NULL REFERENCES public.anggota(id) ON DELETE CASCADE,
  nama            TEXT NOT NULL,
  gelar           TEXT,
  jenis_kelamin   TEXT CHECK (jenis_kelamin IN ('L', 'P')),
  lahir           TEXT,
  meninggal       TEXT,
  foto            TEXT,
  cabang          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 4. TABEL KEPALA KELUARGA
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.kepala_keluarga (
  id                TEXT PRIMARY KEY,
  nama_kk           TEXT NOT NULL,
  nama_pasangan     TEXT,
  jumlah_anggota    INT DEFAULT 1,
  tagihan_bulanan   INT DEFAULT 0,
  cabang            TEXT,
  alamat            TEXT,
  telepon           TEXT,
  anggota_id        TEXT REFERENCES public.anggota(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 5. TABEL TRANSAKSI IURAN
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transaksi (
  id              TEXT PRIMARY KEY,
  kk_id           TEXT NOT NULL REFERENCES public.kepala_keluarga(id) ON DELETE CASCADE,
  bulan_iuran     TEXT NOT NULL,  -- format: "2025-08"
  nominal_bayar   INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'belum' CHECK (status IN ('lunas', 'pending', 'menunggak', 'belum')),
  tgl_bayar       DATE,
  keterangan      TEXT,
  bukti_url       TEXT,           -- URL file bukti transfer (Supabase Storage)
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────

-- Enable RLS semua tabel
ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pasangan           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kepala_keluarga    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi          ENABLE ROW LEVEL SECURITY;

-- Helper function cek role
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function cek kk_id user
CREATE OR REPLACE FUNCTION public.get_my_kk_id()
RETURNS TEXT AS $$
  SELECT kk_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- === PROFILES ===
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- === ANGGOTA ===
-- Semua bisa baca
CREATE POLICY "Anyone authenticated can read anggota" ON public.anggota
  FOR SELECT USING (auth.role() = 'authenticated');

-- Hanya admin yang bisa insert/update/delete
CREATE POLICY "Only admin can insert anggota" ON public.anggota
  FOR INSERT WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Only admin can update anggota" ON public.anggota
  FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "Only admin can delete anggota" ON public.anggota
  FOR DELETE USING (public.get_my_role() = 'admin');

-- === PASANGAN ===
CREATE POLICY "Anyone authenticated can read pasangan" ON public.pasangan
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can manage pasangan" ON public.pasangan
  FOR ALL USING (public.get_my_role() = 'admin');

-- === KEPALA KELUARGA ===
CREATE POLICY "Anyone authenticated can read kk" ON public.kepala_keluarga
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admin can manage kk" ON public.kepala_keluarga
  FOR ALL USING (public.get_my_role() = 'admin');

-- === TRANSAKSI ===
-- User bisa baca transaksi KK mereka sendiri; admin bisa baca semua
CREATE POLICY "User can read own transaksi" ON public.transaksi
  FOR SELECT USING (
    kk_id = public.get_my_kk_id() OR public.get_my_role() = 'admin'
  );

-- User bisa insert transaksi (upload bukti) untuk KK mereka sendiri
CREATE POLICY "User can insert own transaksi" ON public.transaksi
  FOR INSERT WITH CHECK (
    kk_id = public.get_my_kk_id() OR public.get_my_role() = 'admin'
  );

-- Hanya admin yang bisa update status transaksi
CREATE POLICY "Only admin can update transaksi" ON public.transaksi
  FOR UPDATE USING (public.get_my_role() = 'admin');

CREATE POLICY "Only admin can delete transaksi" ON public.transaksi
  FOR DELETE USING (public.get_my_role() = 'admin');

-- ─────────────────────────────────────────
-- 7. UPDATED_AT TRIGGER
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_anggota_updated_at
  BEFORE UPDATE ON public.anggota
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_kk_updated_at
  BEFORE UPDATE ON public.kepala_keluarga
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER set_transaksi_updated_at
  BEFORE UPDATE ON public.transaksi
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
