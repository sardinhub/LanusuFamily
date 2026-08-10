import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️  Supabase env vars tidak ditemukan.\n" +
    "Buat file .env dengan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.\n" +
    "Lihat .env.example untuk panduan."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
