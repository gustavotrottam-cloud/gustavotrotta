import Link from "next/link";
import { redirect } from "next/navigation";
import { loadOrCreatePlan, markPlanCompleted } from "../../actions";
import StepShell from "@/components/clientes/planejamento/StepShell";
import StatCard from "@/components/clientes/planejamento/StatCard";
import WealthChart from "@/components/clientes/planejamento/WealthChart";
import IncomeComparison from "@/components/clientes/planejamento/IncomeComparison";
import PdfDownloadButton from "@/components/clientes/planejamento/PdfDownloadButton";
import OpenAccountButtons from "@/components/clientes/planejamento/OpenAccountButtons";
import { computeFromData } from "@/lib/planejamento/engine";
import {
  isReadyForProjection,
  getMonthlySavings,
} from "@/lib/planejamento/aggregation";
import { formatBRL, formatBRLShort } from "@/lib/planejamento/format";
import { getPreviousStep, ACTIVE_STEPS } from "@/lib/planejamento/steps";

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const plan = await loadOrCreatePlan();
  const prev = getPreviousStep("resultados");
  const readiness = isReadyForProjection(plan.data);

  if (!readiness.ready) {
    return (
      <StepShell
        step="resultados"
        completedSteps={plan.completed_steps}
        eyebrow="Etapa 06 · Visão integrada"
        title={
          <>
            Quase lá. Faltam{" "}
            <span className="italic text-navy-800">algumas peças</span>.
          </>
        }
        intro="Pra gerar a projeção patrimonial, todas as etapas anteriores precisam estar preenchidas. Os campos que faltam estão listados abaixo."
      >
        <div className="border border-gold-500/40 bg-gold-500/5 p-6">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
            Faltam preencher
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[0.95rem] text-ink-700">
            {readiness.missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </div>
        <div className="mt-10 flex justify-between border-t border-paper-300/70 pt-6">
          <Link
            href="/planejamento-financeiro"
            className="text-[0.78rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
          >
            ← Voltar ao plano
          </Link>
          <Link
            href={ACTIVE_STEPS[0].path}
            className="inline-flex items-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800"
          >
            Começar do início <span aria-hidden>→</span>
          </Link>
        </div>
      </StepShell>
    );
  }

  const results = computeFromData(plan.data);
  if (!results) {
    redirect("/planejamento-financeiro");
  }

  const { atTargetAge, goal, feasibility, projection, inputs, derived } =
    results;

  const monthlySavings = getMonthlySavings(plan.data.cashflow);
  const ifAge = feasibility.estimatedIFAge;
  const gap = feasibility.gapPerpetualBRL;
  const isFeasible = gap >= 0;

  // PDF endpoint único pra ambos (anon e logged) — autoriza por cookie
  const pdfHref = "/api/planejamento-financeiro/pdf";

  return (
    <StepShell
      step="resultados"
      completedSteps={plan.completed_steps}
      eyebrow="Etapa 06 · Visão integrada"
      title={
        <>
          A projeção do seu{" "}
          <span className="italic text-navy-800">patrimônio</span>.
        </>
      }
      intro={`Cenário considerando retorno real de ${inputs.realReturnAnnualPct.toFixed(1).replace(".", ",")}% a.a., aporte de ${formatBRL(monthlySavings)}/mês e os ${derived.yearsUntilTarget} anos até a idade-alvo. Valores em reais de hoje.`}
    >
      {/* Download direto — dados já foram capturados na entrada */}
      <div className="mb-6">
        <PdfDownloadButton
          pdfHref={pdfHref}
          greetingName={plan.lead_data?.name ?? null}
          onCompleted={markPlanCompleted}
        />
      </div>

      {/* CTAs opcionais — abertura de conta na XP via assessor */}
      <div className="mb-10">
        <OpenAccountButtons />
      </div>

      {/* Stats principais */}
      <section className="grid gap-px bg-paper-300/70 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          eyebrow={`Patrimônio aos ${inputs.targetAge}`}
          value={formatBRLShort(atTargetAge.projectedWealthBRL)}
          caption="Projetado mantendo aportes até a idade-alvo."
          variant="accent"
        />
        <StatCard
          eyebrow="Renda mensal sustentável"
          value={formatBRLShort(
            feasibility.sustainableMonthlyIncomeAtTargetBRL
          )}
          caption={`Sem consumir o principal — vivendo dos juros reais aos ${inputs.targetAge}.`}
        />
        <StatCard
          eyebrow="Idade de IF estimada"
          value={ifAge ? `${ifAge} anos` : "—"}
          caption={
            ifAge
              ? ifAge <= inputs.targetAge
                ? "Plano vai atingir antes do alvo."
                : "Acima da idade-alvo no cenário atual."
              : "Não atingida no horizonte projetado."
          }
          variant={ifAge && ifAge <= inputs.targetAge ? "success" : "default"}
        />
        <StatCard
          eyebrow="Diferença mensal"
          value={
            <span
              className={isFeasible ? "text-emerald-700" : "text-red-700"}
            >
              {isFeasible ? "+" : ""}
              {formatBRLShort(gap)}
            </span>
          }
          caption={
            isFeasible
              ? "Sua renda sustentável supera a desejada."
              : "Falta gerar essa diferença pra cobrir 100% do desejado."
          }
          variant={isFeasible ? "success" : "warning"}
        />
      </section>

      {/* Chart */}
      <section className="mt-14">
        <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
          Evolução patrimonial
        </div>
        <h2 className="mt-2 font-serif text-[1.8rem] leading-[1.15] tracking-editorial text-ink-900">
          {projection[projection.length - 1].wealth > 0
            ? "Trajetória até o horizonte projetado"
            : "Trajetória até a depleção"}
        </h2>
        <p className="mt-3 max-w-prose2 text-[0.95rem] leading-relaxed text-muted-600">
          Acumulação até{" "}
          <strong className="font-medium text-ink-900">
            {inputs.targetAge} anos
          </strong>
          , depois retiradas mensais de{" "}
          {formatBRL(inputs.desiredMonthlyIncomeBRL)}. Linha dourada vertical
          marca a idade-alvo. Linha pontilhada azul horizontal marca o nível de
          manutenção — patrimônio em que os juros reais bastam para cobrir a
          renda desejada perpetuamente
          {feasibility.depletionAge
            ? ". Linha vermelha mostra quando o patrimônio chegaria a zero"
            : ""}
          .
        </p>
        <div className="mt-8 border border-paper-300/70 bg-paper-100 p-6">
          <WealthChart
            projection={projection}
            targetAge={inputs.targetAge}
            maintenanceLevel={goal.wealthNeededPerpetualBRL}
            estimatedIFAge={feasibility.estimatedIFAge}
            depletionAge={feasibility.depletionAge}
          />
        </div>
      </section>

      {/* Aporte de manutenção */}
      {feasibility.requiredMonthlySavingsBRL !== null && (
        <section className="mt-14">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
                Aporte mensal de manutenção
              </div>
              <h2 className="mt-2 font-serif text-[1.6rem] leading-[1.2] tracking-editorial text-ink-900">
                Quanto preciso aportar pra{" "}
                <span className="italic text-navy-800">manter o patrimônio</span>
              </h2>
              <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-600">
                Valor mensal de aporte que faz o patrimônio atingir{" "}
                <strong className="font-medium text-ink-900">exatamente</strong>{" "}
                o nível de manutenção aos {inputs.targetAge} anos — ponto a
                partir do qual a renda desejada é paga só com juros reais,
                preservando o principal em reais de hoje.
              </p>
            </div>
            <div className="lg:col-span-7">
              <div className="border border-ink-900 bg-ink-900 p-8 text-paper-50">
                <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-400">
                  Aporte de manutenção
                </div>
                <div className="mt-3 font-serif text-[2.4rem] leading-[1.05] tracking-editorial md:text-[2.8rem]">
                  {formatBRL(feasibility.requiredMonthlySavingsBRL)}
                  <span className="ml-2 text-[0.8rem] uppercase tracking-wider2 text-paper-100/55">
                    / mês
                  </span>
                </div>
                <div className="mt-6 grid gap-5 border-t border-paper-100/15 pt-5 sm:grid-cols-2">
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-wider2 text-paper-100/55">
                      Aporte atual
                    </div>
                    <div className="mt-1 font-serif text-[1.2rem]">
                      {formatBRL(monthlySavings)} / mês
                    </div>
                  </div>
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-wider2 text-paper-100/55">
                      {monthlySavings >= feasibility.requiredMonthlySavingsBRL
                        ? "Folga sobre o necessário"
                        : "Falta por mês"}
                    </div>
                    <div
                      className={`mt-1 font-serif text-[1.2rem] ${
                        monthlySavings >= feasibility.requiredMonthlySavingsBRL
                          ? "text-emerald-400"
                          : "text-gold-400"
                      }`}
                    >
                      {monthlySavings >= feasibility.requiredMonthlySavingsBRL
                        ? "+"
                        : ""}
                      {formatBRL(
                        monthlySavings -
                          feasibility.requiredMonthlySavingsBRL
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-6 text-[0.85rem] leading-relaxed text-paper-100/70">
                  {monthlySavings >= feasibility.requiredMonthlySavingsBRL
                    ? "Seu aporte atual supera o necessário — você vai chegar à idade-alvo acima do nível de manutenção, acumulando uma folga real."
                    : "Aumentando o aporte mensal nesse valor, o patrimônio chega ao nível de manutenção no horizonte projetado. Outras alavancas: aumentar prazo, reduzir renda desejada ou revisar premissas."}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Comparativo de renda */}
      <section className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
            Renda na idade-alvo
          </div>
          <h2 className="mt-2 font-serif text-[1.6rem] leading-[1.2] tracking-editorial text-ink-900">
            Desejado vs sustentável
          </h2>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-600">
            Sustentável = renda que o patrimônio gera vivendo só dos juros
            reais, sem tocar no principal. Manter o principal preserva a renda
            ao longo do tempo.
          </p>
        </div>
        <div className="lg:col-span-7">
          <IncomeComparison
            desired={inputs.desiredMonthlyIncomeBRL}
            sustainable={feasibility.sustainableMonthlyIncomeAtTargetBRL}
          />
        </div>
      </section>

      {/* Análise de gap */}
      <section className="mt-14 border border-ink-900/10 bg-paper-200/40 p-8 md:p-10">
        <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
          Leitura do cenário
        </div>
        <h2 className="mt-3 font-serif text-[1.7rem] leading-[1.2] tracking-editorial text-ink-900 md:text-[2rem]">
          {isFeasible
            ? "O plano se sustenta nas premissas atuais."
            : "Existe um gap a ser endereçado."}
        </h2>
        <div className="mt-5 grid gap-8 md:grid-cols-2">
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Patrimônio necessário (renda perpétua)
            </div>
            <div className="mt-2 font-serif text-[1.5rem] text-ink-900">
              {formatBRL(goal.wealthNeededPerpetualBRL)}
            </div>
          </div>
          <div>
            <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              Patrimônio necessário (consumindo em 25 anos)
            </div>
            <div className="mt-2 font-serif text-[1.5rem] text-ink-900">
              {formatBRL(goal.wealthNeeded25YearsBRL)}
            </div>
          </div>
        </div>
        {!isFeasible && feasibility.additionalMonthlySavingsBRL !== null && (
          <div className="mt-7 border-t border-ink-900/10 pt-5">
            <div className="text-[0.65rem] uppercase tracking-wider2 text-red-700">
              Para fechar o gap até a idade-alvo
            </div>
            <div className="mt-2 font-serif text-[1.6rem] text-ink-900">
              + {formatBRL(feasibility.additionalMonthlySavingsBRL)}
              <span className="ml-2 text-[0.75rem] uppercase tracking-wider2 text-muted-500">
                por mês adicionais
              </span>
            </div>
            <p className="mt-3 max-w-prose2 text-[0.9rem] leading-relaxed text-muted-600">
              Aporte mensal extra estimado pra atingir o patrimônio de renda
              perpétua na idade-alvo, mantendo as premissas atuais. Aumentar
              prazo, revisar premissas ou ajustar o objetivo também são
              alternativas.
            </p>
          </div>
        )}
        {isFeasible && (
          <p className="mt-5 max-w-prose2 text-[0.92rem] leading-relaxed text-muted-600">
            Mantendo o aporte mensal de {formatBRL(monthlySavings)} e o
            retorno real de{" "}
            {inputs.realReturnAnnualPct.toFixed(1).replace(".", ",")}% a.a.,
            seu patrimônio projetado aos {inputs.targetAge} anos sustenta a
            renda desejada como perpetuidade — sem consumir o principal.
          </p>
        )}
      </section>

      {/* Nav */}
      <div className="mt-16 flex items-center justify-between border-t border-paper-300/70 pt-6">
        <Link
          href={prev?.path ?? "/planejamento-financeiro"}
          className="text-[0.78rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
        >
          ← Voltar a premissas
        </Link>
        <Link
          href="/planejamento-financeiro"
          className="text-[0.78rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
        >
          Ver progresso →
        </Link>
      </div>

      {/* Disclaimer reforçado */}
      <div className="mt-10 border border-paper-300/70 bg-paper-100 p-6 text-[0.78rem] leading-relaxed text-muted-600">
        <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-600 mb-2">
          Aviso importante
        </div>
        <p>
          Este planejamento é informativo e educacional.{" "}
          <strong className="text-ink-900">
            Não constitui recomendação de investimento
          </strong>{" "}
          nem promessa de rentabilidade. Projeções são determinísticas — não
          consideram volatilidade ano a ano nem eventos extraordinários.
          Decisões patrimoniais devem ser tomadas com acompanhamento de{" "}
          <strong className="text-ink-900">profissional credenciado</strong>,
          considerando o seu perfil completo, objetivos específicos e horizonte
          de tempo. Resultados reais podem diferir significativamente.
        </p>
      </div>
    </StepShell>
  );
}
