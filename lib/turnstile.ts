import "server-only";

/**
 * Cloudflare Turnstile — alternativa ao reCAPTCHA, friendly à LGPD
 * (não rastreia, não envia dados pessoais).
 *
 * Configuração:
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAA...  (visível no client, OK)
 *   TURNSTILE_SECRET_KEY=0x4AAA...            (segredo, server only)
 *
 * Sem essas envs configuradas, a verificação é "pulada" (true) — útil em dev.
 *
 * Doc: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

export type TurnstileResult = {
  ok: boolean;
  /** Detalhe quando ok=false */
  error?: string;
  /** true quando Turnstile não configurado (skip em dev) */
  bypassed?: boolean;
};

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstile(token: string | undefined | null): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Sem secret = não configurado = pula (fail-open em dev)
  if (!secret) {
    return { ok: true, bypassed: true };
  }

  if (!token) {
    return { ok: false, error: "Verificação anti-bot ausente. Recarregue a página." };
  }

  try {
    const resp = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(5000),
    });

    if (!resp.ok) {
      console.warn("[turnstile] http error", resp.status);
      // Em caso de falha do CF, fail-open pra não derrubar conversão
      return { ok: true, bypassed: true };
    }

    const json = (await resp.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!json.success) {
      console.warn("[turnstile] failed", json["error-codes"]);
      return { ok: false, error: "Verificação anti-bot falhou. Tente novamente." };
    }

    return { ok: true };
  } catch (err) {
    console.warn("[turnstile] verify error, fail-open:", err);
    return { ok: true, bypassed: true };
  }
}
