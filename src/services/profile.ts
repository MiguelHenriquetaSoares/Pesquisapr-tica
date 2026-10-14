import { getSupabase } from '../lib/supabase';
export type Profile = { id: string; nome_completo: string; data_nascimento: string | null; apelido: string; avatar_path: string | null };
export async function loadProfile(userId: string) {
  const { data, error } = await getSupabase().from('perfis').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}
export async function saveProfile(profile: Pick<Profile, 'nome_completo'|'data_nascimento'|'apelido'>, userId: string) {
  const { data, error } = await getSupabase().from('perfis').upsert({ id: userId, ...profile }, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data as Profile;
}
export async function uploadAvatar(userId: string, file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Selecione um arquivo de imagem.');
  if (file.size > 5 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 5 MB.');
  const client = getSupabase();
  const path = userId + '/avatar-' + Date.now() + '.' + (file.name.split('.').pop() || 'jpg').replace(/[^a-zA-Z0-9]/g, '');
  const { error } = await client.storage.from('fotos-perfil').upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { error: updateError } = await client.from('perfis').upsert({ id: userId, avatar_path: path }, { onConflict: 'id' });
  if (updateError) throw updateError;
  return path;
}
export async function avatarUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await getSupabase().storage.from('fotos-perfil').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
