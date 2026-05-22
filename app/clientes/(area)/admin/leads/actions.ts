"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { logAdminAction } from "@/lib/audit";

type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/** Verifica que o usuário atual é admin. Lança se não for. */
async function requireAdmin(): Promise<void> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") throw new Error("Acesso negado");
}

/** Muda o status de um lead. */
export async function setLeadStatus(
  leadId: string,
  status: "new" | "contacted" | "converted" | "archived"
): Promise<ActionResult> {
  try {
    await requireAdmin();

    if (!leadId) return { ok: false, error: "Lead inválido" };
    const allowed = ["new", "contacted", "converted", "archived"];
    if (!allowed.includes(status)) {
      return { ok: false, error: "Status inválido" };
    }

    const admin = createAdminSupabase();
    const updateData: Record<string, unknown> = { status };
    if (status === "contacted" || status === "converted") {
      updateData.contacted_at = new Date().toISOString();
    }

    const { error } = await admin
      .from("leads")
      .update(updateData)
      .eq("id", leadId);
    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      action: status === "archived" ? "lead.archive" : "lead.status_change",
      targetKind: "lead",
      targetId: leadId,
      metadata: { new_status: status },
    });

    revalidatePath("/clientes/admin/leads");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

/**
 * Converte um lead em cliente:
 *  1. Verifica se o email já existe em auth.users; se sim, só marca como convertido.
 *  2. Senão, dispara invite (envia magic link); marca lead como convertido.
 */
export async function inviteLead(leadId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    if (!leadId) return { ok: false, error: "Lead inválido" };

    const admin = createAdminSupabase();

    const { data: lead, error: leadError } = await admin
      .from("leads")
      .select("id, email, name")
      .eq("id", leadId)
      .maybeSingle();
    if (leadError || !lead) {
      return { ok: false, error: "Lead não encontrado" };
    }

    // Checa se já é usuário
    const { data: existingList } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    const existing = existingList?.users?.find(
      (u: { email?: string }) => u.email?.toLowerCase() === lead.email.toLowerCase()
    );

    if (existing) {
      // Já é cliente — só marca como convertido
      await admin
        .from("leads")
        .update({
          status: "converted",
          contacted_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      await logAdminAction({
        action: "lead.invite",
        targetKind: "lead",
        targetId: leadId,
        metadata: { already_user: true, email: lead.email },
      });

      revalidatePath("/clientes/admin/leads");
      return {
        ok: true,
        message: `${lead.email} já era cliente — lead marcado como convertido.`,
      };
    }

    // Convida (envia magic link de invite)
    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
      lead.email,
      {
        data: { full_name: lead.name ?? null },
      }
    );
    if (inviteError) {
      return { ok: false, error: `Falha ao convidar: ${inviteError.message}` };
    }

    await admin
      .from("leads")
      .update({
        status: "converted",
        contacted_at: new Date().toISOString(),
      })
      .eq("id", leadId);

    await logAdminAction({
      action: "lead.invite",
      targetKind: "lead",
      targetId: leadId,
      metadata: { invited: true, email: lead.email },
    });

    revalidatePath("/clientes/admin/leads");
    return {
      ok: true,
      message: `Convite enviado para ${lead.email}.`,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}
