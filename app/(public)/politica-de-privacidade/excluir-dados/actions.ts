"use server";

import { headers } from "next/headers";
import { createAdminSupabase } from "@/lib/supabase/server";
import { rateLimit, getClientKey } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendDeletionConfirmationEmail } from "@/lib/email";
import {
  normalizeEmail,
  hashEmail,
  generateDeletionToken,
  hashDeletionToken,
} from "@/lib/lgpd/token";

const TOKEN_TTL_MIN = 30;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RequestDeletionResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Recebe email do titular, gera token, manda email de confirmação.
 *
 * IMPORTANTE: a resposta é sempre `ok: true` se email é válido e passou
 * Turnstile/rate-limit, INDEPENDENTE de existir dado pra esse email.
 * Isso evita um oráculo "email-existe-no-sistema" que atacantes poderiam
 * usar pra enumeração.
 */
export async function requestDeletion(
  formData: FormData
): Promise<RequestDeletionResult> {
  // Honeypot — bot preencheu, retorna sucesso silencioso (não dá pista)
  const honeypot = (formData.get("website") as string | null)?.trim() ?? "";
  if (honeypot) {
    return { ok: true };
  }

  // Consentimento explícito é obrigatório
  const consent = formData.get("consent") === "on";
  if (!consent) {
    return {
      ok: false,
      error: "É necessário confirmar que você é titular dos dados.",
    };
  }

  // Rate limit por IP — exclusão é irreversível, então 3/hora é o teto
  const ip = getClientKey();
  const rl = await rateLimit({
    key: `lgpd-deletion:${ip}`,
    limit: 3,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return {
      ok: false,
      error:
        "Muitas solicitações deste endereço. Aguarde uma hora antes de tentar novamente.",
    };
  }

  // Turnstile
  const turnstileToken =
    (formData.get("cf-turnstile-response") as string | null) ?? null;
  const tr = await verifyTurnstile(turnstileToken);
  if (!tr.ok && !tr.bypassed) {
    return {
      ok: false,
      error: tr.error ?? "Verificação anti-bot falhou. Recarregue a página.",
    };
  }

  // Email
  const rawEmail = (formData.get("email") as string | null)?.trim() ?? "";
  if (!EMAIL_RE.test(rawEmail)) {
    return {
      ok: false,
      error: "Email inválido. Confira o endereço e tente de novo.",
    };
  }
  const email = normalizeEmail(rawEmail);

  // Pré-check: o email existe em algum dado nosso?
  // Se não, retornamos ok sem inserir/enviar — não vaza existência.
  const supabase = createAdminSupabase();
  const { count: leadsCount, error: leadsErr } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .ilike("email", email);

  if (leadsErr) {
    console.error("[lgpd-deletion] leads count error:", leadsErr);
    // Em erro do DB, melhor responder genericamente que dar erro 500
    return { ok: true };
  }

  const hasData = (leadsCount ?? 0) > 0;
  if (!hasData) {
    // Email não tem dado conosco — sucesso silencioso
    return { ok: true };
  }

  // Gera token + hash, persiste, manda email
  const rawToken = generateDeletionToken();
  const tokenHash = hashDeletionToken(rawToken);
  const emailHash = hashEmail(email);
  const userAgent = headers().get("user-agent")?.slice(0, 300) ?? null;

  const { error: insertErr } = await supabase
    .from("deletion_requests")
    .insert({
      email_hash: emailHash,
      email, // plaintext temporário, será anulado na confirmação
      token_hash: tokenHash,
      ip_address: ip.slice(0, 100),
      user_agent: userAgent,
      expires_at: new Date(Date.now() + TOKEN_TTL_MIN * 60 * 1000).toISOString(),
    });

  if (insertErr) {
    console.error("[lgpd-deletion] insert error:", insertErr);
    return {
      ok: false,
      error: "Erro interno. Tente novamente em alguns minutos.",
    };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://gustavotrotta.com.br";
  const confirmUrl = `${baseUrl}/politica-de-privacidade/excluir-dados/confirmar?token=${encodeURIComponent(rawToken)}`;

  // Envia email; falha silenciosa (request já tá no banco, user pode retentar)
  await sendDeletionConfirmationEmail({
    to: email,
    confirmUrl,
    expiresInMinutes: TOKEN_TTL_MIN,
  });

  return { ok: true };
}
