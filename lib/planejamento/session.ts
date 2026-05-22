import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Identity de quem está acessando a tool de planejamento:
 *  - Cliente logado (profile_id do auth)
 *  - Visitante anônimo (anon_session_id por cookie HTTP-only)
 *
 * Anônimos ganham um cookie de 90 dias na primeira visita.
 * Se autenticarem depois, o plano fica órfão (anônimo) — não migramos
 * automaticamente; o cliente preenche um novo plano se quiser.
 */

const ANON_COOKIE = "pf_anon";
const ANON_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 dias

export type PlanIdentity =
  | { kind: "user"; profileId: string }
  | { kind: "anon"; anonSessionId: string };

/**
 * Retorna a identity atual. Se for anônimo e ainda não tiver cookie,
 * cria o UUID e seta o cookie. Sempre devolve uma identity válida.
 *
 * IMPORTANTE: só pode ser chamado dentro de Server Actions ou Route Handlers
 * (não em Server Components puros — o `cookies()` é read-only ali).
 * Pra leitura em SC, use `readPlanIdentity()`.
 */
export async function getOrCreatePlanIdentity(): Promise<PlanIdentity> {
  // 1. Tenta como usuário logado primeiro
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return { kind: "user", profileId: user.id };
  }

  // 2. Anônimo — lê cookie (middleware garante criação)
  const store = cookies();
  let anonId = store.get(ANON_COOKIE)?.value;
  if (!anonId || !isUuid(anonId)) {
    anonId = randomUUID();
    // Tenta setar — se chamado de Server Component (read-only ctx),
    // o middleware já cuidou disso. Se for Server Action/Route Handler, persiste agora.
    try {
      store.set(ANON_COOKIE, anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ANON_TTL_SECONDS,
      });
    } catch {
      // Server Component context — middleware é a fonte autoritativa do cookie.
    }
  }
  return { kind: "anon", anonSessionId: anonId };
}

/**
 * Versão read-only — segura pra Server Components. Não cria cookie novo.
 * Se anônimo sem cookie, retorna null (página deve renderizar landing).
 */
export async function readPlanIdentity(): Promise<PlanIdentity | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return { kind: "user", profileId: user.id };
  }

  const store = cookies();
  const anonId = store.get(ANON_COOKIE)?.value;
  if (anonId && isUuid(anonId)) {
    return { kind: "anon", anonSessionId: anonId };
  }
  return null;
}

function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    s
  );
}
