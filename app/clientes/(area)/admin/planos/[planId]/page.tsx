import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import PageHeader from "@/components/clientes/PageHeader";
import { computeFromData } from "@/lib/planejamento/engine";
import {
  isReadyForProjection,
  getMonthlyIncome,
  getMonthlyExpenses,
  getMonthlySavings,
  getFinancialTotal,
  getRealAssetsTotal,
  getOwnershipTotal,
  getTotalPatrimony,
} from "@/lib/planejamento/aggregation";
import { formatBRL, formatBRLShort } from "@/lib/planejamento/format";
import type {
  PlanningPlan,
  LeadSnapshot,
  AssumptionsProfile,
} from "@/lib/planejamento/types";
import { ASSUMPTIONS_PROFILES } from "@/lib/planejamento/types";

export const dynamic = "force-dynamic";

const MARITAL_LABEL: Record<string, string> = {
  single: "Solteiro(a)",
  married: "Casado(a)",
  stable_union: "União estável",
  divorced: "Divorciado(a)",
  widowed: "Viúvo(a)",
};

const REGIME_LABEL: Record<string, string> = {
  partial_communion: "Comunhão parcial",
  total_communion: "Comunhão total",
  total_separation: "Separação total",
  mandatory_separation: "Separação obrigatória",
  final_participation: "Participação final nos aquestos",
};

const PROFILE_LABEL: Record<AssumptionsProfile, string> = {
  conservative: "Conservador",
  moderate: "Moderado",
  optimistic: "Otimista",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatStepName(stepId: string): string {
  const map: Record<string, string> = {
    pessoal: "Sobre você",
    aposentadoria: "Objetivo de aposentadoria",
    fluxo: "Fluxo financeiro",
    patrimonio: "Estrutura patrimonial",
    premissas: "Premissas econômicas",
    resultados: "Visão integrada",
  };
  return map[stepId] ?? stepId;
}

export default async function AdminPlanoDetailPage({
  params,
}: {
  params: { planId: string };
}) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/clientes/login");

  const { data: profileMe } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileMe?.role !== "admin") redirect("/clientes");

  const admin = createAdminSupabase();

  const { data: plan } = await admin
    .from("planning_plans")
    .select(
      `id, profile_id, anon_session_id, lead_id, lead_data, status, current_step, completed_steps, data, results, created_at, updated_at,
       profile:profiles(id, full_name),
       lead:leads(id, name, email, phone, status, created_at)`
    )
    .eq("id", params.planId)
    .maybeSingle();

  if (!plan) notFound();

  const typed = plan as unknown as PlanningPlan & {
    profile: { id: string; full_name: string | null } | null;
    lead: {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      status: string;
      created_at: string;
    } | null;
  };

  const isAnon = typed.profile_id === null;
  const leadData = typed.lead_data as LeadSnapshot | null;
  const data = typed.data;

  const displayName =
    leadData?.name ||
    typed.profile?.full_name ||
    typed.lead?.name ||
    "—";
  const contactEmail = typed.lead?.email || leadData?.email || "—";
  const contactPhone = typed.lead?.phone || leadData?.phone || "—";

  // Cálculos agregados
  const monthlyIncome = getMonthlyIncome(data.cashflow);
  const monthlyExpenses = getMonthlyExpenses(data.cashflow);
  const monthlySavings = getMonthlySavings(data.cashflow);
  const financialTotal = getFinancialTotal(data.patrimony);
  const realAssetsTotal = getRealAssetsTotal(data.patrimony);
  const ownershipTotal = getOwnershipTotal(data.patrimony);
  const totalPatrimony = getTotalPatrimony(data.patrimony);

  const readiness = isReadyForProjection(data);
  const results = readiness.ready ? computeFromData(data) : null;

  const completedSet = new Set(typed.completed_steps ?? []);
  const stepIds = ["pessoal", "aposentadoria", "fluxo", "patrimonio", "premissas", "resultados"];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Breadcrumb */}
      <Link
        href="/clientes/admin/planos"
        className="inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
      >
        ← Voltar para todos os planos
      </Link>

      <PageHeader
        eyebrow={isAnon ? "Lead · Planejamento Financeiro" : "Cliente · Planejamento Financeiro"}
        title={
          <>
            {displayName}
          </>
        }
        intro={`Dados preenchidos pelo ${isAnon ? "lead" : "cliente"} na ferramenta pública. Tudo que aparece aqui foi inserido por ele(a) — útil pra qualificar antes do contato.`}
      />

      {/* Resumo / contato */}
      <section className="mt-10 border border-paper-300/70 bg-paper-100 p-7">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Tipo
            </div>
            <div className="mt-2">
              {isAnon ? (
                <span className="inline-flex items-center gap-1 border border-gold-500/40 bg-gold-500/10 px-2 py-1 text-[0.65rem] uppercase tracking-wider2 text-gold-700">
                  Lead anônimo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 border border-navy-800/40 bg-navy-800/5 px-2 py-1 text-[0.65rem] uppercase tracking-wider2 text-navy-800">
                  Cliente logado
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              WhatsApp
            </div>
            <div className="mt-2 font-serif text-[1.05rem] text-ink-900">
              {contactPhone}
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Email
            </div>
            <div className="mt-2 font-serif text-[1.05rem] text-ink-900 break-all">
              {contactEmail.includes("planejamento.local") ? (
                <span className="text-muted-400">— (não informado)</span>
              ) : (
                contactEmail
              )}
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Status do plano
            </div>
            <div className="mt-2">
              <span
                className={`inline-flex items-center gap-2 border px-3 py-1 text-[0.65rem] uppercase tracking-wider2 ${
                  typed.status === "completed"
                    ? "border-emerald-700/30 bg-emerald-50 text-emerald-800"
                    : "border-gold-500/40 bg-gold-500/5 text-gold-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    typed.status === "completed"
                      ? "bg-emerald-600"
                      : "bg-gold-500"
                  }`}
                />
                {typed.status === "completed" ? "Concluído" : "Em andamento"}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Etapa atual
            </div>
            <div className="mt-2 text-[0.95rem] text-ink-900">
              {formatStepName(typed.current_step)}
              <span className="ml-2 text-[0.7rem] uppercase tracking-wider2 text-muted-400">
                ({typed.completed_steps?.length ?? 0} / 6 etapas)
              </span>
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Última atualização
            </div>
            <div className="mt-2 text-[0.95rem] text-ink-900">
              {formatDate(typed.updated_at)}
            </div>
          </div>
        </div>

        {readiness.ready && (
          <div className="mt-7 border-t border-paper-300/70 pt-5">
            <a
              href={`/api/planejamento-financeiro/pdf?planId=${typed.id}`}
              className="inline-flex items-center gap-3 border border-ink-900 px-6 py-3 text-[0.7rem] uppercase tracking-wider2 text-ink-900 transition-all hover:bg-ink-900 hover:text-paper-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Baixar PDF deste plano
            </a>
          </div>
        )}
      </section>

      {/* Progresso visual */}
      <section className="mt-10">
        <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
          Progresso pelas 6 etapas
        </div>
        <ol className="mt-4 grid gap-1 sm:grid-cols-3 md:grid-cols-6">
          {stepIds.map((stepId) => {
            const done = completedSet.has(stepId);
            const isCurrent = !done && stepId === typed.current_step;
            return (
              <li
                key={stepId}
                className={`border-t-2 pt-3 ${
                  done
                    ? "border-gold-500"
                    : isCurrent
                      ? "border-ink-900"
                      : "border-paper-300"
                }`}
              >
                <div
                  className={`text-[0.62rem] uppercase tracking-wider2 ${
                    done
                      ? "text-gold-600"
                      : isCurrent
                        ? "text-ink-900"
                        : "text-muted-400"
                  }`}
                >
                  {done ? "Concluída" : isCurrent ? "Atual" : "Pendente"}
                </div>
                <div
                  className={`mt-1 font-serif text-[0.95rem] ${
                    done || isCurrent ? "text-ink-900" : "text-muted-500"
                  }`}
                >
                  {formatStepName(stepId)}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 01 — Sobre */}
      <DataSection
        eyebrow="Etapa 01"
        title="Sobre você"
        completed={completedSet.has("pessoal")}
      >
        {data.personal ? (
          <DataTable
            rows={[
              ["Idade atual", data.personal.age ? `${data.personal.age} anos` : null],
              [
                "Estado civil",
                data.personal.maritalStatus
                  ? MARITAL_LABEL[data.personal.maritalStatus] ?? data.personal.maritalStatus
                  : null,
              ],
              [
                "Regime de bens",
                data.personal.propertyRegime
                  ? REGIME_LABEL[data.personal.propertyRegime] ?? data.personal.propertyRegime
                  : null,
              ],
              [
                "Filhos",
                data.personal.childrenCount !== undefined
                  ? String(data.personal.childrenCount)
                  : null,
              ],
              [
                "Dependentes adicionais",
                data.personal.dependentsCount !== undefined
                  ? String(data.personal.dependentsCount)
                  : null,
              ],
              ["Observações", data.personal.notes || null],
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </DataSection>

      {/* 02 — Aposentadoria */}
      <DataSection
        eyebrow="Etapa 02"
        title="Objetivo de longo prazo"
        completed={completedSet.has("aposentadoria")}
      >
        {data.retirement ? (
          <DataTable
            rows={[
              [
                "Idade-alvo",
                data.retirement.targetAge ? `${data.retirement.targetAge} anos` : null,
              ],
              [
                "Renda mensal desejada (em R$ de hoje)",
                data.retirement.desiredMonthlyIncomeBRL
                  ? formatBRL(data.retirement.desiredMonthlyIncomeBRL)
                  : null,
              ],
              ["Observações", data.retirement.notes || null],
            ]}
          />
        ) : (
          <EmptyState />
        )}
      </DataSection>

      {/* 03 — Fluxo */}
      <DataSection
        eyebrow="Etapa 03"
        title="Fluxo financeiro mensal"
        completed={completedSet.has("fluxo")}
      >
        {data.cashflow ? (
          <>
            <div className="mb-3 text-[0.72rem] uppercase tracking-wider2 text-gold-600">
              Modo: {data.cashflow.mode === "detailed" ? "Detalhado" : "Simplificado"}
            </div>
            {data.cashflow.mode === "detailed" ? (
              <>
                <SubsectionTitle>Receitas</SubsectionTitle>
                <DataTable
                  rows={[
                    ["Salário", money(data.cashflow.income?.salary)],
                    ["Pró-labore", money(data.cashflow.income?.proLabore)],
                    ["Dividendos", money(data.cashflow.income?.dividends)],
                    ["Aluguéis recebidos", money(data.cashflow.income?.rentalIncome)],
                    ["Renda variável", money(data.cashflow.income?.variableIncome)],
                    ["Outros", money(data.cashflow.income?.other)],
                  ]}
                />
                <SubsectionTitle>Despesas</SubsectionTitle>
                <DataTable
                  rows={[
                    ["Fixas", money(data.cashflow.expenses?.fixed)],
                    ["Lazer", money(data.cashflow.expenses?.leisure)],
                    ["Educação", money(data.cashflow.expenses?.education)],
                    ["Saúde", money(data.cashflow.expenses?.health)],
                    ["Outros", money(data.cashflow.expenses?.other)],
                  ]}
                />
              </>
            ) : (
              <DataTable
                rows={[
                  ["Receita total", money(data.cashflow.totalMonthlyIncomeBRL)],
                  ["Despesa total", money(data.cashflow.totalMonthlyExpensesBRL)],
                ]}
              />
            )}
            <div className="mt-6 grid gap-px bg-paper-300/70 sm:grid-cols-3 border border-paper-300/70">
              <Stat label="Receita total" value={formatBRL(monthlyIncome)} />
              <Stat label="Despesa total" value={`−${formatBRL(monthlyExpenses)}`} />
              <Stat
                label="Capacidade de aporte"
                value={formatBRL(monthlySavings)}
                accent
              />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </DataSection>

      {/* 04 — Patrimônio */}
      <DataSection
        eyebrow="Etapa 04"
        title="Estrutura patrimonial"
        completed={completedSet.has("patrimonio")}
      >
        {data.patrimony ? (
          <>
            <div className="mb-3 text-[0.72rem] uppercase tracking-wider2 text-gold-600">
              Modo: {data.patrimony.mode === "detailed" ? "Detalhado" : "Simplificado"}
            </div>
            {data.patrimony.mode === "detailed" ? (
              <>
                <SubsectionTitle>Ativos financeiros</SubsectionTitle>
                <DataTable
                  rows={[
                    ["Renda fixa", money(data.patrimony.financial?.fixedIncome)],
                    ["Ações", money(data.patrimony.financial?.stocks)],
                    ["Fundos", money(data.patrimony.financial?.funds)],
                    [
                      "Previdência privada (pessoa física)",
                      money(data.patrimony.financial?.privatePension),
                    ],
                    [
                      "Previdência corporativa",
                      money(data.patrimony.financial?.corporatePension),
                    ],
                    ["Caixa / liquidez", money(data.patrimony.financial?.cash)],
                  ]}
                />
                <SubsectionTitle>Ativos imobilizados</SubsectionTitle>
                <DataTable
                  rows={[
                    ["Imóveis", money(data.patrimony.realAssets?.properties)],
                    ["Veículos", money(data.patrimony.realAssets?.vehicles)],
                    ["Terrenos", money(data.patrimony.realAssets?.land)],
                    ["Outros", money(data.patrimony.realAssets?.other)],
                  ]}
                />
              </>
            ) : (
              <DataTable
                rows={[
                  ["Ativos financeiros (total)", money(data.patrimony.financialTotalBRL)],
                  ["Ativos imobilizados (total)", money(data.patrimony.realAssetsTotalBRL)],
                ]}
              />
            )}

            <SubsectionTitle>Participações societárias</SubsectionTitle>
            <DataTable
              rows={[
                [
                  "Possui participação societária?",
                  data.patrimony.hasOwnership ? "Sim" : "Não",
                ],
                [
                  "Valor estimado",
                  data.patrimony.hasOwnership
                    ? money(data.patrimony.ownershipTotalBRL)
                    : null,
                ],
                [
                  "Observações",
                  data.patrimony.hasOwnership
                    ? data.patrimony.ownershipNotes || null
                    : null,
                ],
              ]}
            />

            <div className="mt-6 grid gap-px bg-paper-300/70 sm:grid-cols-2 lg:grid-cols-4 border border-paper-300/70">
              <Stat label="Financeiro" value={formatBRLShort(financialTotal)} />
              <Stat label="Imobilizado" value={formatBRLShort(realAssetsTotal)} />
              <Stat label="Societário" value={formatBRLShort(ownershipTotal)} />
              <Stat
                label="Total"
                value={formatBRLShort(totalPatrimony)}
                accent
              />
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </DataSection>

      {/* 05 — Premissas */}
      <DataSection
        eyebrow="Etapa 05"
        title="Premissas econômicas"
        completed={completedSet.has("premissas")}
      >
        {data.assumptions ? (
          <>
            {data.assumptions.profile && (
              <div className="mb-4">
                <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
                  Perfil escolhido
                </div>
                <div className="mt-2 font-serif text-[1.4rem] text-ink-900">
                  {PROFILE_LABEL[data.assumptions.profile]}
                </div>
                <div className="mt-1 text-[0.85rem] text-muted-600">
                  {ASSUMPTIONS_PROFILES[data.assumptions.profile]?.description}
                </div>
              </div>
            )}
            <DataTable
              rows={[
                [
                  "Inflação anual",
                  data.assumptions.inflationAnnualPct !== undefined
                    ? `${data.assumptions.inflationAnnualPct.toFixed(1).replace(".", ",")}%`
                    : null,
                ],
                [
                  "Retorno nominal anual",
                  data.assumptions.nominalAnnualPct !== undefined
                    ? `${data.assumptions.nominalAnnualPct.toFixed(1).replace(".", ",")}%`
                    : null,
                ],
                [
                  "Retorno real anual (motor da projeção)",
                  data.assumptions.realAnnualPct !== undefined
                    ? `${data.assumptions.realAnnualPct.toFixed(1).replace(".", ",")}%`
                    : null,
                ],
              ]}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </DataSection>

      {/* 06 — Resultados computados */}
      {results && (
        <DataSection
          eyebrow="Etapa 06"
          title="Resultados da projeção"
          completed={completedSet.has("resultados")}
        >
          <div className="grid gap-px bg-paper-300/70 sm:grid-cols-2 lg:grid-cols-4 border border-paper-300/70">
            <Stat
              label={`Patrimônio aos ${results.inputs.targetAge}`}
              value={formatBRLShort(results.atTargetAge.projectedWealthBRL)}
              accent
            />
            <Stat
              label="Renda mensal sustentável"
              value={formatBRLShort(
                results.feasibility.sustainableMonthlyIncomeAtTargetBRL
              )}
            />
            <Stat
              label="Idade de IF estimada"
              value={
                results.feasibility.estimatedIFAge
                  ? `${results.feasibility.estimatedIFAge} anos`
                  : "—"
              }
            />
            <Stat
              label="Diferença mensal"
              value={`${results.feasibility.gapPerpetualBRL >= 0 ? "+" : ""}${formatBRLShort(
                results.feasibility.gapPerpetualBRL
              )}`}
            />
          </div>
          {results.feasibility.requiredMonthlySavingsBRL !== null && (
            <div className="mt-5 border border-ink-900/10 bg-paper-200/40 p-5">
              <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-600">
                Aporte mensal de manutenção
              </div>
              <div className="mt-2 font-serif text-[1.4rem] text-ink-900">
                {formatBRL(results.feasibility.requiredMonthlySavingsBRL)} / mês
              </div>
              <p className="mt-2 text-[0.85rem] leading-relaxed text-muted-600">
                Aporte mensal necessário pra atingir o nível de manutenção na
                idade-alvo. Atual:{" "}
                <strong>{formatBRL(monthlySavings)}/mês</strong>.
              </p>
            </div>
          )}
        </DataSection>
      )}

      {/* Footer */}
      <div className="mt-12 border-t border-paper-300/70 pt-6 text-[0.75rem] leading-relaxed text-muted-500">
        Plano criado em {formatDate(typed.created_at)}. Última atualização em{" "}
        {formatDate(typed.updated_at)}. Os dados são preenchidos pela própria
        pessoa — use como qualificação inicial pra preparar uma conversa.
      </div>
    </div>
  );
}

/* ============================================================================
 * Helpers de UI
 * ========================================================================== */

function money(v: number | undefined): string | null {
  if (v === undefined || v === null) return null;
  return formatBRL(v);
}

function DataSection({
  eyebrow,
  title,
  completed,
  children,
}: {
  eyebrow: string;
  title: string;
  completed: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t border-paper-300/70 pt-8">
      <div className="mb-5 flex items-baseline justify-between">
        <div>
          <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-600">
            {eyebrow}
          </div>
          <h2 className="mt-1 font-serif text-[1.5rem] tracking-editorial text-ink-900 md:text-[1.7rem]">
            {title}
          </h2>
        </div>
        {completed ? (
          <span className="text-[0.65rem] uppercase tracking-wider2 text-gold-500">
            ✓ Preenchida
          </span>
        ) : (
          <span className="text-[0.65rem] uppercase tracking-wider2 text-muted-400">
            Não preenchida
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function SubsectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 mb-2 text-[0.65rem] uppercase tracking-wider2 text-muted-500">
      {children}
    </div>
  );
}

function DataTable({
  rows,
}: {
  rows: Array<[string, string | null]>;
}) {
  const filtered = rows.filter(([, v]) => v !== null && v !== "");
  if (filtered.length === 0) {
    return <EmptyState />;
  }
  return (
    <table className="w-full text-[0.95rem]">
      <tbody>
        {filtered.map(([label, value]) => (
          <tr key={label} className="border-b border-paper-300/40 last:border-b-0">
            <td className="py-3 pr-4 text-muted-600">{label}</td>
            <td className="py-3 text-right font-serif text-ink-900 [font-variant-numeric:tabular-nums]">
              {value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-paper-100 px-5 py-4 ${
        accent ? "border-l-2 border-gold-500" : ""
      }`}
    >
      <div className="text-[0.62rem] uppercase tracking-wider2 text-muted-500">
        {label}
      </div>
      <div className="mt-1 font-serif text-[1.25rem] text-ink-900">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border border-paper-300/60 bg-paper-100/40 px-5 py-4 text-[0.85rem] text-muted-400">
      Nenhum dado preenchido nesta etapa.
    </div>
  );
}
