import "server-only";
import { headers } from "next/headers";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";

/**
 * Audit log helper — registra ações sensíveis de administradores.
 *
 * Uso típico em server actions / route handlers:
 *   await logAdminAction({
 *     action: "plan.pdf_download",
 *     targetKind: "plan",
 *     targetId: planId,
 *     metadata: { source: "admin/planos" },
 *   });
 *
 * Falhas no log NÃO interrompem a operação principal — log é "best effort"
 * pra não derrubar funcionalidade por problema de telemetria.
 */

export type AuditAction =
  // Lead actions
  | "lead.create"
  | "lead.status_change"
  | "lead.invite"
  | "lead.archive"
  // Plan actions
  | "plan.pdf_download_admin"
  | "plan.delete"
  | "plan.complete"
  | "plan.view_details"
  // Profile actions
  | "profile.promote"
  | "profile.demote"
  // Misc
  | "admin.login";

export async function logAdminAction(input: {
  action: AuditAction;
  targetKind?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Audit log só faz sentido pra ações de admin. Se chamado sem user, ignora.
    if (!user) return;

    const adminClient = createAdminSupabase();
    const hdr = headers();

    await adminClient.from("audit_log").insert({
      actor_id: user.id,
      actor_email: user.email ?? null,
      action: input.action,
      target_kind: input.targetKind ?? null,
      target_id: input.targetId ?? null,
      metadata: input.metadata ?? {},
      ip:
        hdr.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        hdr.get("x-real-ip") ??
        null,
      user_agent: hdr.get("user-agent")?.slice(0, 400) ?? null,
    });
  } catch (err) {
    // Best effort — não propaga
    console.warn("[audit] log failed:", err);
  }
}
