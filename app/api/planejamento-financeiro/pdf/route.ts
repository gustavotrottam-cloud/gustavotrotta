import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import { readPlanIdentity } from "@/lib/planejamento/session";
import { signPdfToken } from "@/lib/pdf/token";
import { renderPdfFromUrl } from "@/lib/pdf/render";
import { logAdminAction } from "@/lib/audit";
import { rateLimit, getClientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Gera o PDF do planejamento financeiro.
 *
 * Autorização:
 *  - Logado dono do plano OU admin: livre
 *  - Anônimo: precisa ter lead vinculado (= aceitou capturar dados)
 *
 * Admin pode passar `?planId=X` pra gerar PDF de qualquer plano.
 */
export async function GET(request: NextRequest) {
  // Rate limit: máx 10 PDFs por IP por hora (Puppeteer custa caro)
  const ip = getClientKey();
  const rl = await rateLimit({
    key: `pdf:${ip}`,
    limit: 10,
    windowSeconds: 3600,
  });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Limite de downloads atingido. Aguarde uma hora." },
      { status: 429 }
    );
  }

  const supabase = createServerSupabase();
  const admin = createAdminSupabase();

  const url = new URL(request.url);
  const requestedPlanId = url.searchParams.get("planId");

  const identity = await readPlanIdentity();

  // Caso 1: admin querendo um plano específico
  if (requestedPlanId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const { data: plan } = await admin
      .from("planning_plans")
      .select("id, lead_data, profile:profiles(full_name)")
      .eq("id", requestedPlanId)
      .maybeSingle();
    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
    }

    const displayName =
      (plan.lead_data as { name?: string } | null)?.name ??
      (plan.profile as { full_name?: string } | null)?.full_name ??
      "cliente";

    await logAdminAction({
      action: "plan.pdf_download_admin",
      targetKind: "plan",
      targetId: plan.id,
      metadata: { display_name: displayName },
    });

    return await streamPdf(request, plan.id, displayName);
  }

  // Caso 2: sessão anônima ou logada — busca o plano da identity
  if (!identity) {
    return NextResponse.json(
      { error: "Sem sessão de planejamento" },
      { status: 401 }
    );
  }

  const query =
    identity.kind === "user"
      ? admin
          .from("planning_plans")
          .select("id, lead_data, lead_id, profile:profiles(full_name)")
          .eq("profile_id", identity.profileId)
      : admin
          .from("planning_plans")
          .select("id, lead_data, lead_id")
          .eq("anon_session_id", identity.anonSessionId);

  const { data: plan } = await query.maybeSingle();
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });
  }

  // Anônimo: tem que ter lead vinculado
  if (identity.kind === "anon" && !plan.lead_id) {
    return NextResponse.json(
      { error: "Preencha seus dados antes de baixar o PDF" },
      { status: 403 }
    );
  }

  const displayName =
    (plan.lead_data as { name?: string } | null)?.name ??
    (identity.kind === "user"
      ? (plan as { profile?: { full_name?: string } | null }).profile?.full_name
      : null) ??
    "cliente";

  return await streamPdf(request, plan.id, displayName);
}

async function streamPdf(
  request: NextRequest,
  planId: string,
  displayName: string
) {
  const requestUrl = new URL(request.url);
  const origin =
    process.env.PDF_PUBLIC_ORIGIN || `${requestUrl.protocol}//${requestUrl.host}`;
  const viewUrl = `${origin}/pdf/planejamento/${planId}`;

  try {
    const token = signPdfToken(planId);
    const pdfBuffer = await renderPdfFromUrl(viewUrl, token);

    const slug = (displayName || "cliente")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const filename = `planejamento-${slug || "cliente"}-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[planejamento-financeiro/pdf]", err);
    const message = err instanceof Error ? err.message : "Erro inesperado";
    return NextResponse.json(
      { error: "Falha ao gerar PDF", detail: message },
      { status: 500 }
    );
  }
}
