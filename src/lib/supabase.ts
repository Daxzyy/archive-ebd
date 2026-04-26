import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables (Secrets).'
    );
  }
  
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  return client;
};

// For backward compatibility and ease of use where we assume it's configured
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null as unknown as SupabaseClient;

export type Archive = {
  id: string;
  image_url: string;
  description: string;
  date: string | null;
  date_unknown: boolean;
  tags: string[];
  source: string;
  created_at: string;
};
