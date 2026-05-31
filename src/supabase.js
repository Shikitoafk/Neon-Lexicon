import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    console.log("Supabase client initialized successfully.");
  } catch (e) {
    console.error("Failed to create Supabase client:", e.message);
  }
} else {
  console.warn("VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing in the environment. Supabase client initialized as null.");
}

export const supabase = supabaseInstance;
