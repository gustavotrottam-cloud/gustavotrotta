"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createAdminSupabase } from "@/lib/supabase/server";
import { getOrCreatePlanIdentity, type PlanIdentity } from "@/lib/planejamento/session";
import type { PlanningData, PlanningPlan } from "@/lib/planejamento/types";
import { getNextStep, ACTIVE_STEPS } from "@/lib/planejamento/steps";
import { rateLimit, getClientKey } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Tool é aberta ao público, então a persistência usa o admin client
 * (service_role) e filtra manualmente por identity (profile_id OU anon_session_id).
 * RLS continua protegendo SELECT de outros clientes via API direta,
 * mas todas as operações da tool passam por essas server actions.
 */

function identityFilter(supabase: ReturnType<typeof createAdminSupabase>, identity: PlanIdentity) {
  return identity.kind === "user"
    ? supabase.from("planning_plans").select("*").eq("profile_id", identity.profileId)
    : supabase.from("planning_plans").select("*").eq("anon_session_id", identity.anonSessionId);
}

export async function loadOrCreatePlan(): Promise<PlanningPlan> {
  const identity = await getOrCreatePlanIdentity();
  const supabase = createAdminSupabase();

  const { data: existing } = await identityFilter(supabase, identity).maybeSingle();
  if (existing) return existing as PlanningPlan;

  const insertPayload =
    identity.kind === "user"
      ? { profile_id: identity.profileId }
      : { anon_session_id: identity.anonSessionId };

  const { data: created, error } = await supabase
    .from("planning_plans")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !created) {
    throw new Error(error?.message ?? "Falha ao criar plano");
  }
  return created as PlanningPlan;
}

export async function saveStep(
  stepId: string,
  patch: Partial<PlanningData>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const identity = await getOrCreatePlanIdentity();
    const supabase = createAdminSupabase();

    const { data: existing } = await identityFilter(supabase, identity).maybeSingle();
    if (!existing) {
      // Cria primeiro
      await loadOrCreatePlan();
    }

    const { data: current } = await identityFilter(supabase, identity).maybeSingle();
    if (!current) {
      return { ok: false, error: "Plano não encontrado" };
    }

    const mergedData: PlanningData = {
      ...((current.data as PlanningData) ?? {}),
      ...patch,
    };

    const completedSet = new Set<string>(current.completed_steps ?? []);
    completedSet.add(stepId);

    const next = getNextStep(stepId);
    const newCurrentStep = next?.id ?? stepId;
    const isCompleted =
      ACTIVE_STEPS.every((s) => completedSet.has(s.id)) && !next;

    const updateFilter = identity.kind === "user"
      ? { profile_id: identity.profileId }
      : { anon_session_id: identity.anonSessionId };

    const { error: updateError } = await supabase
      .from("planning_plans")
      .update({
        data: mergedData,
        completed_steps: Array.from(completedSet),
        current_step: newCurrentStep,
        status: isCompleted ? "completed" : "draft",
      })
      .match(updateFilter);

    if (updateError) {
      console.error("[planejamento/saveStep]", updateError);
      return { ok: false, error: updateError.message };
    }

    revalidatePath("/planejamento-financeiro");
    return { ok: true };
  } catch (err) {
    console.error("[planejamento/saveStep] unexpected", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

export async function saveStepAndAdvance(
  stepId: string,
  patch: Partial<PlanningData>
): Promise<void> {
  const result = await saveStep(stepId, patch);
  if (!result.ok) {
    throw new Error(result.error ?? "Falha ao salvar");
  }
  const next = getNextStep(stepId);
  redirect(next?.path ?? "/planejamento-financeiro");
}

/* ============================================================================
 * Lead capture — anon DEVE preencher nome + DDD+telefone ANTES de começar a
 * preencher o planejamento. Lead criado já na rota /contato.
 * ========================================================================== */

function isValidBRPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

/**
 * Captura o contato no INÍCIO do fluxo (pré-etapa 01). Cria/vincula lead.
 * Redireciona pra primeira etapa após sucesso.
 *
 * Cliente logado: pula a captura, redireciona direto pra etapa 01.
 */
export async function registerContactAndStart(input: {
  name: string;
  phone: string;
  email?: string;
  consent: boolean;
  /** Honeypot — vazio em humanos */
  website?: string;
  /** Token Turnstile (anti-bot) */
  turnstileToken?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    // Honeypot: se preenchido, é bot. Finge sucesso pra não dar feedback ao
    // bot, mas não persiste nada.
    if (input.website && input.website.trim().length > 0) {
      console.warn("[registerContactAndStart] honeypot tripped");
      return { ok: true };
    }

    // Rate limit: máx 5 submissões por IP por minuto (proteção contra bots/spam)
    const ip = getClientKey();
    const rl = await rateLimit({
      key: `contato:${ip}`,
      limit: 5,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return {
        ok: false,
        error: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
      };
    }

    // Verificação anti-bot via Cloudflare Turnstile (pula em dev se não configurado)
    const turnstileCheck = await verifyTurnstile(input.turnstileToken);
    if (!turnstileCheck.ok) {
      return { ok: false, error: turnstileCheck.error ?? "Verificação anti-bot falhou" };
    }

    const name = input.name?.trim().slice(0, 200) ?? "";
    const phone = input.phone?.trim().slice(0, 40) ?? "";
    const email = input.email?.trim().toLowerCase().slice(0, 200) || null;

    if (!input.consent)
      return { ok: false, error: "Aceite da política de privacidade obrigatório" };
    if (name.length < 2) return { ok: false, error: "Nome obrigatório" };
    if (!isValidBRPhone(phone))
      return { ok: false, error: "Telefone inválido (DDD + número)" };
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return { ok: false, error: "Email inválido" };

    const identity = await getOrCreatePlanIdentity();
    const supabase = createAdminSupabase();

    // Logged: só carrega o plano (lead = profile, não precisa criar row em leads)
    if (identity.kind === "user") {
      await loadOrCreatePlan();
      return { ok: true };
    }

    // Anon: garante que o plano existe
    const plan = await loadOrCreatePlan();
    const capturedAt = new Date().toISOString();
    const leadData = { name, phone, email, capturedAt };
    const leadEmail = email ?? `anon-${identity.anonSessionId.slice(0, 8)}@planejamento.local`;

    if (plan.lead_id) {
      // Já capturou antes — atualiza dados (caso queira corrigir)
      await supabase
        .from("leads")
        .update({ name, phone, ...(email ? { email } : {}) })
        .eq("id", plan.lead_id);
      await supabase
        .from("planning_plans")
        .update({ lead_data: leadData })
        .eq("id", plan.id);
    } else {
      const { data: lead, error: leadErr } = await supabase
        .from("leads")
        .insert({
          email: leadEmail,
          name,
          phone,
          source: "planejamento-financeiro",
          status: "new",
          metadata: {
            plan_id: plan.id,
            anon_session_id: identity.anonSessionId,
            captured_via: "contato_inicial",
            // LGPD: registro do consentimento explícito
            consent: {
              version: "v1",
              acceptedAt: capturedAt,
              policyUrl: "/politica-de-privacidade",
            },
          },
        })
        .select("id")
        .single();

      if (leadErr || !lead) {
        console.error("[registerContactAndStart] lead insert", leadErr);
        return { ok: false, error: "Falha ao registrar contato" };
      }

      const { error: linkErr } = await supabase
        .from("planning_plans")
        .update({ lead_id: lead.id, lead_data: leadData })
        .eq("id", plan.id);

      if (linkErr) {
        console.error("[registerContactAndStart] link", linkErr);
        return { ok: false, error: "Falha ao vincular plano" };
      }
    }

    revalidatePath("/clientes/admin/leads");
    revalidatePath("/clientes/admin/planos");
    return { ok: true };
  } catch (err) {
    console.error("[registerContactAndStart]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

/**
 * Marca o plano como concluído após o download do PDF + limpa cookie anônimo
 * pra próxima visita receber sessão nova. NÃO apaga o plano — admin precisa
 * dos dados em /admin/planos mesmo após download.
 */
export async function markPlanCompleted(): Promise<{ ok: boolean; error?: string }> {
  try {
    const identity = await getOrCreatePlanIdentity();
    const supabase = createAdminSupabase();

    const matchFilter = identity.kind === "user"
      ? { profile_id: identity.profileId }
      : { anon_session_id: identity.anonSessionId };

    const { error } = await supabase
      .from("planning_plans")
      .update({ status: "completed" })
      .match(matchFilter);

    if (error) {
      console.error("[markPlanCompleted]", error);
      return { ok: false, error: error.message };
    }

    if (identity.kind === "anon") {
      try {
        cookies().delete("pf_anon");
      } catch {
        // read-only ctx
      }
    }

    revalidatePath("/clientes/admin/planos");
    return { ok: true };
  } catch (err) {
    console.error("[markPlanCompleted]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}

/**
 * Apaga o plano atual e limpa a sessão anônima. Usado depois que o PDF foi
 * baixado, ou quando o usuário clica em "Começar do zero". Pra clientes
 * logados, apenas apaga o plano (mantém o login).
 *
 * Os dados não somem do mundo — o lead.metadata.plan_data segura o snapshot
 * completo pro admin. Só o ESTADO da sessão zera.
 */
export async function resetCurrentPlan(): Promise<{ ok: boolean; error?: string }> {
  try {
    const identity = await getOrCreatePlanIdentity();
    const supabase = createAdminSupabase();

    const deleteFilter = identity.kind === "user"
      ? { profile_id: identity.profileId }
      : { anon_session_id: identity.anonSessionId };

    const { error } = await supabase
      .from("planning_plans")
      .delete()
      .match(deleteFilter);

    if (error) {
      console.error("[resetCurrentPlan] delete", error);
      return { ok: false, error: error.message };
    }

    // Anônimo: também limpa cookie pra próxima visita receber UUID novo
    if (identity.kind === "anon") {
      try {
        cookies().delete("pf_anon");
      } catch {
        // ignored (read-only context)
      }
    }

    revalidatePath("/planejamento-financeiro");
    return { ok: true };
  } catch (err) {
    console.error("[resetCurrentPlan]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro inesperado",
    };
  }
}
