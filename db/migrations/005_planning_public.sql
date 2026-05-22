-- ============================================================================
-- Migration 005 — Planejamento Financeiro aberto a anônimos (funil de leads)
-- ----------------------------------------------------------------------------
-- A ferramenta sai da área exclusiva e vira aberta ao público.
-- Visitantes anônimos preenchem com persistência via cookie (anon_session_id).
-- Ao baixar o PDF, viram leads (com nome + DDD+telefone obrigatórios).
--
-- Mudanças no schema:
--  - planning_plans ganha id próprio (UUID) como PK
--  - profile_id vira nullable (era PK)
--  - adiciona anon_session_id (nullable, UNIQUE quando preenchido)
--  - adiciona lead_id (FK pra leads, set null on delete)
--  - constraint: pelo menos um dos identificadores deve existir
--  - RLS: split de SELECT/MODIFY pro próprio cliente + SELECT pra admin
--
-- Idempotente — pode rodar várias vezes sem efeito colateral.
-- ============================================================================

-- 0. Garantir que leads.phone existe (foi adicionado fora de migration originalmente)
alter table public.leads
  add column if not exists phone text;

-- 1. Adicionar id próprio + anon_session_id + lead_id em planning_plans
alter table public.planning_plans
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists anon_session_id uuid,
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists lead_data jsonb;

-- Popula id pra rows existentes
update public.planning_plans set id = gen_random_uuid() where id is null;
alter table public.planning_plans alter column id set not null;

-- 2. Trocar PK: de profile_id para id
do $$
begin
  if exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    where t.relname = 'planning_plans'
      and c.contype = 'p'
      and c.conname = 'planning_plans_pkey'
  ) then
    -- Só dropa se a PK atual ainda é em profile_id
    if exists (
      select 1
      from pg_constraint c
      join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
      where c.conname = 'planning_plans_pkey'
        and a.attname = 'profile_id'
    ) then
      alter table public.planning_plans drop constraint planning_plans_pkey;
    end if;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.planning_plans'::regclass
      and contype = 'p'
  ) then
    alter table public.planning_plans add primary key (id);
  end if;
end $$;

-- 3. profile_id agora pode ser null
alter table public.planning_plans alter column profile_id drop not null;

-- 4. Constraint: pelo menos um identificador deve existir
alter table public.planning_plans
  drop constraint if exists planning_plans_identity_check;
alter table public.planning_plans
  add constraint planning_plans_identity_check
    check (profile_id is not null or anon_session_id is not null);

-- 5. Unique parcial por identificador (permite null)
create unique index if not exists planning_plans_profile_id_unique
  on public.planning_plans (profile_id) where profile_id is not null;

create unique index if not exists planning_plans_anon_session_id_unique
  on public.planning_plans (anon_session_id) where anon_session_id is not null;

create index if not exists planning_plans_lead_id_idx
  on public.planning_plans (lead_id) where lead_id is not null;

create index if not exists planning_plans_updated_at_idx
  on public.planning_plans (updated_at desc);

-- 6. RLS — split de policies
drop policy if exists "planning_own" on public.planning_plans;
drop policy if exists "planning_own_select" on public.planning_plans;
drop policy if exists "planning_own_modify" on public.planning_plans;
drop policy if exists "planning_admin_read" on public.planning_plans;

create policy "planning_own_select" on public.planning_plans
  for select to authenticated
  using (profile_id = auth.uid());

create policy "planning_own_modify" on public.planning_plans
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "planning_admin_read" on public.planning_plans
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- (Sem policy pra `anon` — anônimos passam por service_role via API/actions.)
