import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;
export const isSupabaseConfigured = Boolean(url && key && !url.includes('seu-projeto') && !key.includes('sua-chave'));
export const supabase = isSupabaseConfigured ? createClient(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;
export function getSupabase() {
  if (!supabase) throw new Error('O Supabase ainda não está configurado. No arquivo .env, preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY com os valores do seu projeto e reinicie npm run dev.');
  return supabase;
}
