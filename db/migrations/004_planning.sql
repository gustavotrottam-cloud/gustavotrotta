-- ============================================================================
-- Migration 004 — Planejamento financeiro (1 plano por cliente)
-- ----------------------------------------------------------------------------
-- Tabela single-row-per-client com toda a data do plano em JSONB.
-- RLS isola por cliente (cada profile só vê o próprio plano).
-- ============================================================================

create table if not exists public.planning_plans (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'draft',          -- 'draft' | 'completed'
  current_step text not null default 'pessoal',  -- id da etapa atual
  completed_steps text[] not null default '{}',  -- ids das etapas completadas
  data jsonb not null default '{}'::jsonb,       -- todos os campos do formulário
  results jsonb default null,                     -- cache dos cálculos (fase C)
  ai_analysis jsonb default null,                 -- cache da análise IA (fase D)
  ai_analyzed_at timestamptz default null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.planning_plans enable row level security;

drop policy if exists "planning_own" on public.planning_plans;
create policy "planning_own" on public.planning_plans
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Trigger pra updated_at automático
create or replace function public.touch_planning_plans()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists planning_plans_touch on public.planning_plans;
create trigger planning_plans_touch
  before update on public.planning_plans
  for each row execute function public.touch_planning_plans();
