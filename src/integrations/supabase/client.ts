import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Mengambil URL dan Key dari Environment Variables (Vite/Vercel)
// Pastikan variabel VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sudah diset di Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log error jika variabel tidak ditemukan (untuk debugging)
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase environment variables are missing. Please check your .env file or Vercel project settings.");
}

// Membuat client Supabase yang terhubung ke project Anda sendiri
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseKey || ''
);
