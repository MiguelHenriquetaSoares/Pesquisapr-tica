-- Execute no SQL Editor do Supabase. Dados do perfil ficam vinculados ao id do Auth.
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome_completo text not null default '',
  data_nascimento date,
  apelido text not null default '',
  avatar_path text,
  atualizado_em timestamptz not null default now()
);
alter table public.perfis enable row level security;
revoke all on public.perfis from anon;
grant select, insert, update on public.perfis to authenticated;
drop policy if exists "Usuário lê o próprio perfil" on public.perfis;
create policy "Usuário lê o próprio perfil" on public.perfis for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Usuário cria o próprio perfil" on public.perfis;
create policy "Usuário cria o próprio perfil" on public.perfis for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Usuário atualiza o próprio perfil" on public.perfis;
create policy "Usuário atualiza o próprio perfil" on public.perfis for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-perfil', 'fotos-perfil', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists "Usuário vê a própria foto" on storage.objects;
create policy "Usuário vê a própria foto" on storage.objects for select to authenticated using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Usuário envia a própria foto" on storage.objects;
create policy "Usuário envia a própria foto" on storage.objects for insert to authenticated with check (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Usuário altera a própria foto" on storage.objects;
create policy "Usuário altera a própria foto" on storage.objects for update to authenticated using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Usuário exclui a própria foto" on storage.objects;
create policy "Usuário exclui a própria foto" on storage.objects for delete to authenticated using (bucket_id = 'fotos-perfil' and (storage.foldername(name))[1] = (select auth.uid())::text);
