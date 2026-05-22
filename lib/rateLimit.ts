import "server-only";
import { headers } from "next/headers";

/**
 * Rate limiting via Upstash Redis REST API.
 *
 * Configuração:
 *   UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
 *   UPSTASH_REDIS_REST_TOKEN=AY...
 *
 * Se as env vars não estão presentes, a função permite tudo (fail-open) —
 * isso é desejável em dev local, mas em produção SEMPRE configure.
 *
 * Estratégia: sliding window simplificado via INCR + EXPIRE atômico.
 * Pra cargas muito altas, considere upgrade pra @upstash/ratelimit (algoritmo
 * mais preciso), mas pra MVP isso basta.
 *
 * Uso:
 *   const { allowed, remaining, resetAt } = await rateLimit({
 *     key: `contato:${ip}`,
 *     limit: 5,
 *     windowSeconds: 60,
 *   });
 *   if (!allowed) return { ok: false, error: "Muitas tentativas. Tente em alguns minutos." };
 */

export type RateLimitResult = {
  /** Se a requisição foi permitida */
  allowed: boolean;
  /** Quantas requisições ainda restam na janela atual */
  remaining: number;
  /** Timestamp Unix em segundos quando o limite reseta */
  resetAt: number;
  /** Quando true, Upstash não está configurado (dev fail-open) */
  bypassed?: boolean;
};

/**
 * Devolve um identificador "razoável" do cliente pra usar como chave.
 * Em ordem: X-Forwarded-For (primeiro IP) → X-Real-IP → fallback "unknown".
 * Atrás de Vercel/Cloudflare esses headers são confiáveis.
 */
export function getClientKey(): string {
  const hdr = headers();
  const fwd = hdr.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  const real = hdr.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function rateLimit(input: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Fail-open quando não configurado (dev)
  if (!url || !token) {
    return {
      allowed: true,
      remaining: input.limit,
      resetAt: Math.floor(Date.now() / 1000) + input.windowSeconds,
      bypassed: true,
    };
  }

  const key = `rl:${input.key}`;
  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + input.windowSeconds;

  try {
    // Pipeline: INCR + (se for o primeiro request, EXPIRE)
    const resp = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["EXPIRE", key, String(input.windowSeconds), "NX"],
      ]),
      // Pequeno timeout — se Upstash estiver lento, fail-open
      signal: AbortSignal.timeout(2000),
    });

    if (!resp.ok) {
      console.warn("[rateLimit] upstash error", resp.status);
      return { allowed: true, remaining: input.limit, resetAt, bypassed: true };
    }

    const json = (await resp.json()) as Array<{ result: number | null }>;
    const current = Number(json[0]?.result ?? 1);
    const remaining = Math.max(0, input.limit - current);

    return {
      allowed: current <= input.limit,
      remaining,
      resetAt,
    };
  } catch (err) {
    console.warn("[rateLimit] failed, fail-open:", err);
    return { allowed: true, remaining: input.limit, resetAt, bypassed: true };
  }
}
