import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabase } from "@/lib/supabase/server";
import { notifyLeadByEmail } from "@/lib/email";
import { rateLimit, getClientKey } from "@/lib/rateLimit";

/** Telefone brasileiro: exige pelo menos 10 dígitos quando removidos não-numéricos. */
function isValidPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

/**
 * Recebe interesse de acesso à área exclusiva.
 * - Valida campos
 * - Insere em `public.leads` via service_role
 * - Dispara email pro admin via Resend (silencia falha pra não bloquear lead)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: máx 5 envios por IP por minuto
    const ip = getClientKey();
    const rl = await rateLimit({
      key: `api-leads:${ip}`,
      limit: 5,
      windowSeconds: 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }

    const email = String(body.email ?? "").trim().toLowerCase();
    const name = String(body.name ?? "").trim().slice(0, 200) || null;
    const phoneRaw = String(body.phone ?? "").trim().slice(0, 40);
    const message = String(body.message ?? "").trim().slice(0, 2000) || null;
    const source = String(body.source ?? "login_form").slice(0, 50);

    if (!email) {
      return NextResponse.json({ error: "Email obrigatório" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }
    if (!phoneRaw) {
      return NextResponse.json(
        { error: "Telefone obrigatório" },
        { status: 400 }
      );
    }
    if (!isValidPhone(phoneRaw)) {
      return NextResponse.json(
        {
          error:
            "Telefone inválido. Inclua DDD + número (ex.: 11 91234-5678).",
        },
        { status: 400 }
      );
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Sistema em configuração" },
        { status: 503 }
      );
    }

    const supabase = createAdminSupabase();
    const { error: insertError } = await supabase.from("leads").insert({
      email,
      name,
      phone: phoneRaw,
      message,
      source,
      metadata: {
        ip: request.headers.get("x-forwarded-for") ?? null,
        user_agent: request.headers.get("user-agent")?.slice(0, 400) ?? null,
      },
    });

    if (insertError) {
      console.error("[api/leads] insert error:", insertError);
      return NextResponse.json(
        { error: "Falha ao registrar interesse" },
        { status: 500 }
      );
    }

    // Notifica admin por email — falha silenciosa, lead já está salvo no banco
    const result = await notifyLeadByEmail({
      email,
      name,
      phone: phoneRaw,
      message,
      source,
      createdAt: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
    });
    if (!result.sent) {
      console.warn("[api/leads] email notification skipped:", result.reason);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/leads] unexpected:", err);
    return NextResponse.json(
      { error: "Erro inesperado" },
      { status: 500 }
    );
  }
}
