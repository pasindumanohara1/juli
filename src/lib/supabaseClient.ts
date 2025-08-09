import { createClient } from "@supabase/supabase-js";

// Env vars from Vite (must start with VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast in dev if misconfigured
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check your .env and restart the dev server."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
