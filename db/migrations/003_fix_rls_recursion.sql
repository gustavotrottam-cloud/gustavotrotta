-- ============================================================================
-- Migration 003 — Fix RLS recursion
-- ----------------------------------------------------------------------------
-- O pattern original `exists (select 1 from profiles where ...)` dentro da
-- policy em profiles causava recursão infinita ("infinite recursion detected
-- in policy for relation profiles"). Substituímos por função SECURITY DEFINER
-- que bypassa RLS na verificação de admin.
-- ============================================================================

-- 1. Função helper que bypassa RLS
create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role = 'admin' from public.profiles where id = user_id), false);
$$;

grant execute on function public.is_admin(uuid) to authenticated;

-- 2. Reescreve todas as policies que tinham o EXISTS recursivo

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin(auth.uid()));

-- content_items
drop policy if exists "content_published_for_clients" on public.content_items;
create policy "content_published_for_clients" on public.content_items
  for select to authenticated
  using (status = 'published' or public.is_admin(auth.uid()));

drop policy if exists "content_admin_write" on public.content_items;
create policy "content_admin_write" on public.content_items
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- events
drop policy if exists "events_admin_write" on public.events;
create policy "events_admin_write" on public.events
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- content_views
drop policy if exists "views_admin_select" on public.content_views;
create policy "views_admin_select" on public.content_views
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- leads
drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads
  for select to authenticated
  using (public.is_admin(auth.uid()));

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update to authenticated
  using (public.is_admin(auth.uid()));
