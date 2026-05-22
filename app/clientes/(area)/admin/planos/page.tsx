import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import PageHeader from "@/components/clientes/PageHeader";
import { computeFromData } from "@/lib/planejamento/engine";
import { isReadyForProjection } from "@/lib/planejamento/aggregation";
import { formatBRLShort } from "@/lib/planejamento/format";
import type { PlanningPlan, LeadSnapshot } from "@/lib/planejamento/types";

export const dynamic = "force-dynamic";

type PlanRow = PlanningPlan & {
  profile: {
    id: string;
    full_name: string | null;
  } | null;
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    status: string;
  } | null;
};

function formatRelativeUpdate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminPlanosPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/clientes/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/clientes");

  const admin = createAdminSupabase();

  const { data: plans, error } = await admin
    .from("planning_plans")
    .select(
      `id, profile_id, anon_session_id, lead_id, lead_data, status, current_step, completed_steps, data, results, created_at, updated_at,
       profile:profiles(id, full_name),
       lead:leads(id, name, email, phone, status)`
    )
    .order("updated_at", { ascending: false });

  const rows = (plans ?? []) as unknown as PlanRow[];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Admin · Planos"
        title={
          <>
            Planos do{" "}
            <span className="italic text-navy-800">funil</span>.
          </>
        }
        intro="Todos os planejamentos preenchidos no /planejamento-financeiro — de clientes logados e leads anônimos. Baixe o PDF de cada um, veja o lead vinculado e revise o progresso."
      />

      <div className="mt-10">
        {error ? (
          <div className="border border-red-600/30 bg-red-600/5 px-6 py-5 text-[0.92rem] text-red-700">
            Falha ao carregar planos: {error.message}
          </div>
        ) : rows.length === 0 ? (
          <div className="border border-paper-300/70 bg-paper-100 px-7 py-12 text-center">
            <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
              Sem planos ainda
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-600">
              Quando alguém preencher o /planejamento-financeiro, aparece aqui.
            </p>
          </div>
        ) : (
          <div className="border border-paper-300/60 bg-paper-100">
            <div className="grid grid-cols-12 gap-4 border-b border-paper-300/70 px-6 py-3 text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              <div className="col-span-1">Tipo</div>
              <div className="col-span-3">Nome / Contato</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Etapa</div>
              <div className="col-span-2 text-right">Patrimônio @ alvo</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>

            {rows.map((row) => {
              const ready = isReadyForProjection(row.data).ready;
              const results = ready ? computeFromData(row.data) : null;
              const isCompleted = row.status === "completed";
              const isAnon = row.profile_id === null;
              const leadData = row.lead_data as LeadSnapshot | null;

              const name =
                leadData?.name ||
                row.profile?.full_name ||
                row.lead?.name ||
                "—";
              const contactEmail = row.lead?.email || leadData?.email || "";
              const contactPhone = row.lead?.phone || leadData?.phone || "";

              return (
                <div
                  key={row.id}
                  className="grid grid-cols-12 items-center gap-4 border-b border-paper-300/50 px-6 py-5 last:border-b-0 hover:bg-paper-200/40"
                >
                  <div className="col-span-1">
                    {isAnon ? (
                      <span className="inline-flex items-center gap-1 border border-gold-500/40 bg-gold-500/10 px-2 py-1 text-[0.6rem] uppercase tracking-wider2 text-gold-700">
                        Lead
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 border border-navy-800/40 bg-navy-800/5 px-2 py-1 text-[0.6rem] uppercase tracking-wider2 text-navy-800">
                        Cliente
                      </span>
                    )}
                  </div>

                  <div className="col-span-3">
                    <Link
                      href={`/clientes/admin/planos/${row.id}`}
                      className="block hover:opacity-80"
                    >
                      <div className="font-serif text-[1.05rem] text-ink-900 underline-offset-4 hover:underline">
                        {name}
                      </div>
                    </Link>
                    {contactEmail && !contactEmail.includes("planejamento.local") && (
                      <div className="text-[0.78rem] text-muted-500 break-all">
                        {contactEmail}
                      </div>
                    )}
                    {contactPhone && (
                      <div className="text-[0.78rem] text-muted-500">
                        {contactPhone}
                      </div>
                    )}
                    <div className="mt-1 text-[0.68rem] uppercase tracking-wider2 text-muted-400">
                      Atualizado em {formatRelativeUpdate(row.updated_at)}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center gap-2 border px-3 py-1 text-[0.65rem] uppercase tracking-wider2 ${
                        isCompleted
                          ? "border-emerald-700/30 bg-emerald-50 text-emerald-800"
                          : "border-gold-500/40 bg-gold-500/5 text-gold-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCompleted ? "bg-emerald-600" : "bg-gold-500"
                        }`}
                      />
                      {isCompleted ? "Concluído" : "Em andamento"}
                    </span>
                  </div>

                  <div className="col-span-2 text-[0.85rem] text-ink-700">
                    {row.current_step}
                    <div className="mt-0.5 text-[0.68rem] uppercase tracking-wider2 text-muted-400">
                      {row.completed_steps?.length ?? 0} / 6
                    </div>
                  </div>

                  <div className="col-span-2 text-right">
                    {results ? (
                      <span className="font-serif text-[1.1rem] text-ink-900">
                        {formatBRLShort(
                          results.atTargetAge.projectedWealthBRL
                        )}
                      </span>
                    ) : (
                      <span className="text-[0.78rem] text-muted-400">—</span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href={`/clientes/admin/planos/${row.id}`}
                      className="inline-flex items-center gap-1 border border-paper-300 px-3 py-2 text-[0.62rem] uppercase tracking-wider2 text-ink-900 transition-all hover:bg-paper-200/70"
                      title="Ver dados preenchidos"
                    >
                      Ver
                    </Link>
                    {ready ? (
                      <a
                        href={`/api/planejamento-financeiro/pdf?planId=${row.id}`}
                        className="inline-flex items-center gap-1 border border-ink-900 px-3 py-2 text-[0.62rem] uppercase tracking-wider2 text-ink-900 transition-all hover:bg-ink-900 hover:text-paper-50"
                        title="Baixar PDF"
                      >
                        <svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        PDF
                      </a>
                    ) : (
                      <span className="text-[0.6rem] uppercase tracking-wider2 text-muted-400">
                        —
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-10 border-t border-paper-300/70 pt-6 text-[0.75rem] leading-relaxed text-muted-500">
        Tag <strong>Lead</strong> = visitante anônimo (sessão por cookie). Quando
        os dados de contato aparecem, é porque a pessoa preencheu o formulário
        antes de baixar o PDF. Tag <strong>Cliente</strong> = cliente logado da
        área exclusiva. PDFs disponíveis a partir da etapa de Resultados.
      </div>
    </div>
  );
}
