-- ============================================================================
-- Migration 006 — Audit log de ações administrativas
-- ----------------------------------------------------------------------------
-- Tabela append-only que registra ações sensíveis: convidar lead, gerar PDF
-- de cliente/lead, alterar status, deletar plano, etc.
--
-- Propósito:
--  - Conformidade LGPD (registro de acesso a dados pessoais)
--  - Trilha de auditoria pra investigar incidentes
--  - Demonstrar diligência caso haja questionamento regulatório
--
-- Idempotente — pode rodar várias vezes.
-- ============================================================================

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_email text,
  action text not null,                  -- ex: 'lead.invite', 'plan.pdf_download', 'plan.delete'
  target_kind text,                      -- ex: 'lead', 'plan', 'profile'
  target_id text,                        -- ID do recurso afetado (uuid em string pra flexibilidade)
  metadata jsonb default '{}'::jsonb,    -- detalhes adicionais (status anterior/novo, etc.)
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Apenas admin pode ler
drop policy if exists "audit_log_admin_read" on public.audit_log;
create policy "audit_log_admin_read" on public.audit_log
  for select to authenticated
  using (public.is_admin(auth.uid()));

-- Sem policies de INSERT/UPDATE/DELETE pra authenticated/anon = apenas
-- service_role consegue gravar (via lib/audit.ts). Ninguém apaga manualmente.

create index if not exists audit_log_actor_idx
  on public.audit_log (actor_id, created_at desc);

create index if not exists audit_log_target_idx
  on public.audit_log (target_kind, target_id, created_at desc);

create index if not exists audit_log_action_idx
  on public.audit_log (action, created_at desc);
