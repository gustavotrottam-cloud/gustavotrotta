-- ============================================================================
-- Migration 002 — Tabela de leads (interesse de acesso à área)
-- ----------------------------------------------------------------------------
-- Cole no SQL Editor do Supabase e rode.
-- ============================================================================

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  message text,
  source text default 'login_form',
  status text not null default 'new',
  contacted_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

drop policy if exists "leads_admin_read" on public.leads;
create policy "leads_admin_read" on public.leads
  for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "leads_admin_update" on public.leads;
create policy "leads_admin_update" on public.leads
  for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Sem policy de INSERT pra `anon` ou `authenticated` = apenas `service_role`
-- consegue inserir (via API route /api/leads, que protege contra spam).

create index if not exists leads_status_created_at_idx
  on public.leads (status, created_at desc);
