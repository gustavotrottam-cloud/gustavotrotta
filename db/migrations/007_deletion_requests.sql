-- Migration 007: LGPD self-service data deletion requests
--
-- Implementa o caminho auto-serviço de exclusão de dados (art. 18 LGPD).
-- Fluxo:
--   1. Titular submete email em /politica-de-privacidade/excluir-dados
--   2. Server gera token aleatório, armazena hash + email_hash + expiração
--   3. Email com link de confirmação é enviado via Resend
--   4. Titular clica → /excluir-dados/confirmar?token=...
--   5. Server valida (hash+não-expirado+não-completado) → deleta dados
--
-- Segurança:
--   - Email é hashado (sha256) antes de armazenar; raw nunca persiste
--   - Token raw existe só na URL do email; DB armazena HMAC-SHA256(token)
--   - Linha persiste após completion como trilha de auditoria
--   - Service-role-only (sem policies de select/insert pra clientes)
--   - Tokens expiram em 30 minutos
--
-- Idempotente: pode rodar várias vezes sem erro.

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),

  -- sha256 hex do email normalizado (trim + lowercase). Persistido mesmo
  -- depois de completed_at, pra detectar abuso (mesmo titular pedindo
  -- exclusão repetidas vezes) e pra trilha de auditoria.
  email_hash text not null,

  -- Email plaintext, necessário pra executar a exclusão dos registros
  -- vinculados. ANULADO no momento da confirmação (`confirmDeletion`).
  -- Em linhas expiradas-sem-confirmação, persiste até cleanup manual.
  -- Ciclo de vida típico: existe ≤ 30 minutos.
  email text,

  -- HMAC-SHA256 do token bruto, assinado com PDF_TOKEN_SECRET no app.
  -- Único pra detectar reuse + permitir lookup direto.
  token_hash text not null unique,

  -- Trilha de auditoria (não-PII em si, mas útil pra detectar abuso)
  ip_address text,
  user_agent text,

  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  completed_at timestamptz,

  -- Resumo do que foi deletado, sem PII (ex: { leads: 2, planning_plans: 1 })
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists deletion_requests_email_hash_idx
  on public.deletion_requests(email_hash);

create index if not exists deletion_requests_pending_idx
  on public.deletion_requests(expires_at)
  where completed_at is null;

alter table public.deletion_requests enable row level security;

-- Sem policies — só service_role acessa.
-- (RLS habilitada mas sem policies = nada acessível via anon/authenticated)

comment on table public.deletion_requests is
  'LGPD art. 18 — self-service data deletion requests. Service-role only. Email and token stored as hashes only; raw values never persisted. Row retained after completion as audit trail.';
