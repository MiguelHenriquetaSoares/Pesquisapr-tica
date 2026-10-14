import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
const redirectBase = (import.meta.env.VITE_APP_URL as string | undefined)?.replace(/\/$/, '') || window.location.origin;
export const getSession = async () => getSupabase().auth.getSession();
export const onAuthChange = (callback: (session: Session | null, user: User | null) => void) =>
  getSupabase().auth.onAuthStateChange((_event, session) => callback(session, session?.user ?? null));
export const signIn = (email: string, password: string) => getSupabase().auth.signInWithPassword({ email, password });
export const signUp = (email: string, password: string) => getSupabase().auth.signUp({
  email, password, options: { emailRedirectTo: redirectBase + '/boas-vindas' }
});
export const signOut = () => getSupabase().auth.signOut();
export const sendPasswordReset = (email: string) => getSupabase().auth.resetPasswordForEmail(email, {
  redirectTo: redirectBase + '/nova-senha'
});
export const updatePassword = (password: string) => getSupabase().auth.updateUser({ password });
