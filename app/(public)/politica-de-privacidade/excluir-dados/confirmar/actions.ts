"use server";

import { createAdminSupabase } from "@/lib/supabase/server";
import { hashDeletionToken } from "@/lib/lgpd/token";

export type DeletionStats = {
  leads: number;
  planning_plans: number;
  auth_users: number;
};

export type ConfirmDeletionResult =
  | { ok: true; stats: DeletionStats }
  | { ok: false; reason: "invalid" | "expired" | "already_done" | "error"; message: string };

/**
 * Confirma e executa a exclusão dos dados do titular.
 *
 * Fluxo:
 *   1. Hash o token recebido na URL
 *   2. Busca `deletion_requests` por token_hash
 *   3. Valida não-expirado + não-completado
 *   4. Lê email plaintext do row
 *   5. Deleta leads + planning_plans associados via service_role
 *   6. Marca row como completed + ANULA email plaintext (zera PII)
 *   7. Grava entrada no audit_log
 */
export async function confirmDeletion(
  rawToken: string
): Promise<ConfirmDeletionResult> {
  if (!rawToken || rawToken.length < 20) {
    return { ok: false, reason: "invalid", message: "Token ausente ou inválido." };
  }

  const supabase = createAdminSupabase();
  const tokenHash = hashDeletionToken(rawToken);

  // 1. Lookup do request
  const { data: req, error: lookupErr } = await supabase
    .from("deletion_requests")
    .select("id, email, email_hash, requested_at, expires_at, completed_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (lookupErr) {
    console.error("[lgpd-deletion] lookup error:", lookupErr);
    return { ok: false, reason: "error", message: "Erro ao validar a solicitação. Tente novamente em alguns minutos." };
  }
  if (!req) {
    return {
      ok: false,
      reason: "invalid",
      message: "Link inválido ou não encontrado. Solicite uma nova exclusão se necessário.",
    };
  }
  if (req.completed_at) {
    return {
      ok: false,
      reason: "already_done",
      message: "Esta solicitação já foi confirmada anteriormente. Os dados associados ao email já foram excluídos.",
    };
  }
  if (new Date(req.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      reason: "expired",
      message: "Este link expirou. Solicite uma nova exclusão pra receber um link válido.",
    };
  }
  if (!req.email) {
    return {
      ok: false,
      reason: "error",
      message: "Solicitação corrompida (email ausente). Crie uma nova.",
    };
  }

  const email = req.email;

  // 2. Deletar leads + planning_plans associados
  const stats: DeletionStats = { leads: 0, planning_plans: 0, auth_users: 0 };

  // 2a. Capturar IDs dos leads antes de deletar (precisamos pros plans)
  const { data: leadsToDelete } = await supabase
    .from("leads")
    .select("id")
    .ilike("email", email);

  const leadIds = ((leadsToDelete ?? []) as Array<{ id: string }>).map(
    (l) => l.id
  );

  // 2b. Deletar planning_plans vinculados (FK é set null, então fazemos
  //     explicit cleanup pra cumprir "exclusão definitiva")
  if (leadIds.length > 0) {
    const { count: plansCount } = await supabase
      .from("planning_plans")
      .delete({ count: "exact" })
      .in("lead_id", leadIds);
    stats.planning_plans += plansCount ?? 0;
  }

  // 2c. Deletar planning_plans cujo lead_data jsonb tenha o email (snapshot)
  //     Esses podem não ter FK (lead foi deletado anteriormente).
  const { count: snapshotPlans } = await supabase
    .from("planning_plans")
    .delete({ count: "exact" })
    .eq("lead_data->>email", email);
  stats.planning_plans += snapshotPlans ?? 0;

  // 2d. Deletar os leads
  if (leadIds.length > 0) {
    const { count: leadsCount } = await supabase
      .from("leads")
      .delete({ count: "exact" })
      .in("id", leadIds);
    stats.leads = leadsCount ?? 0;
  }

  // 2e. Deletar usuário auth se existir (caso raro: cliente com conta admin)
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers({
      perPage: 200,
    });
    const match = (usersData?.users ?? []).find(
      (u: { email?: string }) =>
        u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) {
      const { error: delUserErr } = await supabase.auth.admin.deleteUser(
        match.id
      );
      if (!delUserErr) stats.auth_users = 1;
    }
  } catch (err) {
    // Lista de usuários falhou (ex: muitos users) — não é crítico, segue
    console.warn("[lgpd-deletion] auth users lookup failed:", err);
  }

  // 3. Marca completed + anula PII (email plaintext)
  await supabase
    .from("deletion_requests")
    .update({
      completed_at: new Date().toISOString(),
      email: null,
      metadata: stats,
    })
    .eq("id", req.id);

  // 4. Audit log (sem PII)
  await supabase.from("audit_log").insert({
    action: "lgpd.self_deletion",
    target_kind: "deletion_request",
    target_id: req.id,
    metadata: {
      email_hash: req.email_hash,
      ...stats,
    },
  });

  return { ok: true, stats };
}
