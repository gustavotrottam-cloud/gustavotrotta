import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createAdminSupabase } from "@/lib/supabase/server";
import { verifyPdfToken } from "@/lib/pdf/token";
import { computeFromData } from "@/lib/planejamento/engine";
import {
  getMonthlyIncome,
  getMonthlyExpenses,
  getMonthlySavings,
  getFinancialTotal,
  getRealAssetsTotal,
  getOwnershipTotal,
  getTotalPatrimony,
  isReadyForProjection,
} from "@/lib/planejamento/aggregation";
import { formatBRL, formatBRLShort } from "@/lib/planejamento/format";
import type { PlanningPlan } from "@/lib/planejamento/types";
import { resolveCtaFlow } from "@/lib/planejamento/cta-rules";
import PdfWealthChart from "@/components/pdf/PdfWealthChart";
import PdfPatrimonyBreakdown from "@/components/pdf/PdfPatrimonyBreakdown";

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

function formatToday(): string {
  return new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default async function PdfPlanejamentoPage({
  params,
}: {
  params: { planId: string };
}) {
  const headerList = headers();
  const token = headerList.get("x-pdf-token") ?? "";
  const payload = verifyPdfToken(token);

  if (!payload || payload.planId !== params.planId) {
    notFound();
  }

  const supabase = createAdminSupabase();

  // Plan pode estar vinculado a profile (logado) OU a lead (anônimo)
  const { data: plan } = await supabase
    .from("planning_plans")
    .select(
      "id, profile_id, anon_session_id, lead_id, lead_data, status, current_step, completed_steps, data, results, ai_analysis, ai_analyzed_at, created_at, updated_at"
    )
    .eq("id", params.planId)
    .maybeSingle();

  if (!plan) notFound();

  // Determina nome de exibição do cliente
  let displayName = "Cliente";
  const leadData = plan.lead_data as { name?: string; email?: string } | null;
  if (leadData?.name) {
    displayName = leadData.name;
  } else if (plan.profile_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", plan.profile_id)
      .maybeSingle();
    displayName =
      profile?.full_name ||
      profile?.email?.split("@")[0] ||
      "Cliente";
  }

  const typed = plan as unknown as PlanningPlan;
  const readiness = isReadyForProjection(typed.data);
  if (!readiness.ready) {
    return (
      <div className="pdf-page">
        <div className="pdf-eyebrow">Plano incompleto</div>
        <h1 className="pdf-h1" style={{ marginTop: 12 }}>
          Faltam <span className="italic-navy">algumas peças</span>.
        </h1>
        <p className="pdf-prose" style={{ marginTop: 24 }}>
          Não foi possível gerar a projeção. Itens pendentes:{" "}
          {readiness.missing.join(", ")}.
        </p>
      </div>
    );
  }

  const results = computeFromData(typed.data);
  if (!results) notFound();

  const { atTargetAge, goal, feasibility, projection, inputs, derived } =
    results!;

  const data = typed.data;
  const monthlyIncome = getMonthlyIncome(data.cashflow);
  const monthlyExpenses = getMonthlyExpenses(data.cashflow);
  const monthlySavings = getMonthlySavings(data.cashflow);
  const financialTotal = getFinancialTotal(data.patrimony);
  const realAssetsTotal = getRealAssetsTotal(data.patrimony);
  const ownershipTotal = getOwnershipTotal(data.patrimony);
  const totalPatrimony = getTotalPatrimony(data.patrimony);

  const gap = feasibility.gapPerpetualBRL;
  const isFeasible = gap >= 0;
  const ifAge = feasibility.estimatedIFAge;
  const today = formatToday();
  const ctaFlow = resolveCtaFlow(financialTotal);

  const maxIncome = Math.max(
    inputs.desiredMonthlyIncomeBRL,
    feasibility.sustainableMonthlyIncomeAtTargetBRL,
    1
  );

  return (
    <>
      {/* ============ PÁGINA 1 — CAPA ============ */}
      <div className="pdf-page cover">
        <div className="cover-top">
          <div className="cover-brand">
            Gustavo <span className="gold">Trotta</span>
          </div>
          <div className="cover-tag">Valor Investimentos · XP</div>
        </div>

        <div className="cover-mid">
          <div className="cover-eyebrow">Planejamento financeiro</div>
          <div className="cover-title">
            Visão integrada do seu{" "}
            <span className="accent">patrimônio</span>.
          </div>
          <p className="cover-lead">
            Projeção determinística construída a partir do seu fluxo, da sua
            estrutura patrimonial e das premissas escolhidas. Valores em reais
            de hoje, descontados de inflação.{" "}
            <strong style={{ color: "#FAFAF7" }}>
              Documento informativo — não constitui recomendação de investimento.
            </strong>
          </p>
        </div>

        <div className="cover-bottom">
          <div className="col">
            <div className="label">Elaborado para</div>
            <div className="val">{displayName}</div>
          </div>
          <div className="col">
            <div className="label">Data</div>
            <div className="val">{today}</div>
          </div>
          <div className="col">
            <div className="label">Horizonte</div>
            <div className="val">
              {inputs.currentAge} → {inputs.targetAge} anos
            </div>
          </div>
        </div>
      </div>

      {/* ============ PÁGINA 2 — SUMÁRIO + GRÁFICO ============ */}
      <div className="pdf-page">
        <div className="pdf-eyebrow">Sumário executivo</div>
        <h1 className="pdf-h1" style={{ marginTop: 6 }}>
          A projeção do seu{" "}
          <span className="italic-navy">patrimônio</span>.
        </h1>
        <p className="pdf-prose" style={{ marginTop: 12 }}>
          Cenário considerando retorno real de{" "}
          {inputs.realReturnAnnualPct.toFixed(1).replace(".", ",")}% a.a.,
          aporte de {formatBRL(monthlySavings)}/mês e os{" "}
          {derived.yearsUntilTarget} anos até a idade-alvo.
        </p>

        <div className="pdf-statgrid" style={{ marginTop: 10 }}>
          <div className="pdf-stat accent">
            <div className="label">Patrimônio aos {inputs.targetAge}</div>
            <div className="value">
              {formatBRLShort(atTargetAge.projectedWealthBRL)}
            </div>
            <div className="caption">
              Projetado mantendo aportes até a idade-alvo.
            </div>
          </div>
          <div className="pdf-stat">
            <div className="label">Renda mensal sustentável</div>
            <div className="value">
              {formatBRLShort(feasibility.sustainableMonthlyIncomeAtTargetBRL)}
            </div>
            <div className="caption">
              Vivendo dos juros reais aos {inputs.targetAge} — sem consumir o
              principal.
            </div>
          </div>
          <div className="pdf-stat">
            <div className="label">Idade de IF estimada</div>
            <div className="value">{ifAge ? `${ifAge} anos` : "—"}</div>
            <div className="caption">
              {ifAge
                ? ifAge <= inputs.targetAge
                  ? "Plano vai atingir antes do alvo."
                  : "Acima da idade-alvo no cenário atual."
                : "Não atingida no horizonte projetado."}
            </div>
          </div>
          <div className="pdf-stat">
            <div className="label">Diferença mensal</div>
            <div className={`value ${isFeasible ? "success" : "warning"}`}>
              {isFeasible ? "+" : ""}
              {formatBRLShort(gap)}
            </div>
            <div className="caption">
              {isFeasible
                ? "Sua renda sustentável supera a desejada."
                : "Falta gerar essa diferença pra cobrir o desejado."}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="pdf-eyebrow">Evolução patrimonial</div>
          <h2 className="pdf-h2" style={{ marginTop: 4 }}>
            Trajetória até o horizonte projetado
          </h2>
          <p className="pdf-prose" style={{ marginTop: 6 }}>
            Acumulação até {inputs.targetAge} anos, depois retiradas de{" "}
            {formatBRL(inputs.desiredMonthlyIncomeBRL)}/mês. Linha dourada
            marca a idade-alvo; linha pontilhada azul marca o nível de
            manutenção.
          </p>
          <div style={{ marginTop: 8, marginLeft: -8 }}>
            <PdfWealthChart
              projection={projection}
              targetAge={inputs.targetAge}
              maintenanceLevel={goal.wealthNeededPerpetualBRL}
              estimatedIFAge={feasibility.estimatedIFAge}
              depletionAge={feasibility.depletionAge}
            />
          </div>
        </div>

        <PdfFooter pageLabel="02" today={today} />
      </div>

      {/* ============ PÁGINA 3 — DADOS DO PLANO ============ */}
      <div className="pdf-page">
        <div className="pdf-eyebrow">Premissas e estrutura</div>
        <h1 className="pdf-h1" style={{ marginTop: 6 }}>
          O ponto de <span className="italic-navy">partida</span>.
        </h1>

        <div style={{ marginTop: 16 }}>
          <h3 className="pdf-h3">Composição do patrimônio</h3>
          <div style={{ marginTop: 6 }}>
            <PdfPatrimonyBreakdown
              financial={financialTotal}
              realAssets={realAssetsTotal}
              ownership={ownershipTotal}
            />
          </div>
          <p
            className="pdf-prose"
            style={{ marginTop: 6, fontSize: "9pt", color: "#6B6B70" }}
          >
            A projeção de renda passiva considera{" "}
            <strong style={{ color: "#101014" }}>
              apenas o patrimônio financeiro
            </strong>{" "}
            — capital já investido e produzindo retorno. Imobilizado e
            societário entram aqui como contexto patrimonial.
            {(realAssetsTotal > 0 || ownershipTotal > 0) && (
              <>
                {" "}
                A conversão futura de parte desses ativos em caixa — venda de
                imóvel, exit da empresa — <em>acelera bruscamente</em> a
                construção da renda passiva.
              </>
            )}
          </p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 className="pdf-h3">Sobre você</h3>
          <table className="pdf-table" style={{ marginTop: 6 }}>
            <tbody>
              <tr>
                <td>Idade atual</td>
                <td className="right">{data.personal?.age} anos</td>
              </tr>
              <tr>
                <td>Estado civil</td>
                <td className="right">
                  {data.personal?.maritalStatus
                    ? MARITAL_LABEL[data.personal.maritalStatus] ?? "—"
                    : "—"}
                </td>
              </tr>
              {data.personal?.propertyRegime && (
                <tr>
                  <td>Regime de bens</td>
                  <td className="right">
                    {REGIME_LABEL[data.personal.propertyRegime] ?? "—"}
                  </td>
                </tr>
              )}
              {(data.personal?.dependentsCount ?? 0) > 0 && (
                <tr>
                  <td>Dependentes</td>
                  <td className="right">{data.personal?.dependentsCount}</td>
                </tr>
              )}
              {(data.personal?.childrenCount ?? 0) > 0 && (
                <tr>
                  <td>Filhos</td>
                  <td className="right">{data.personal?.childrenCount}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 className="pdf-h3">Objetivo de aposentadoria</h3>
          <table className="pdf-table" style={{ marginTop: 6 }}>
            <tbody>
              <tr>
                <td>Idade-alvo</td>
                <td className="right">{inputs.targetAge} anos</td>
              </tr>
              <tr>
                <td>Renda mensal desejada</td>
                <td className="right">
                  {formatBRL(inputs.desiredMonthlyIncomeBRL)}
                </td>
              </tr>
              <tr>
                <td>Horizonte até o alvo</td>
                <td className="right">{derived.yearsUntilTarget} anos</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 className="pdf-h3">Fluxo financeiro mensal</h3>
          <table className="pdf-table" style={{ marginTop: 6 }}>
            <tbody>
              <tr>
                <td>Receita total</td>
                <td className="right">{formatBRL(monthlyIncome)}</td>
              </tr>
              <tr>
                <td>Despesa total</td>
                <td className="right">−{formatBRL(monthlyExpenses)}</td>
              </tr>
              <tr style={{ fontWeight: 500 }}>
                <td>Capacidade de aporte</td>
                <td className="right">{formatBRL(monthlySavings)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 className="pdf-h3">Estrutura patrimonial</h3>
          <table className="pdf-table" style={{ marginTop: 6 }}>
            <tbody>
              <tr>
                <td>Ativos financeiros</td>
                <td className="right">{formatBRL(financialTotal)}</td>
              </tr>
              {realAssetsTotal > 0 && (
                <tr>
                  <td>Ativos imobilizados</td>
                  <td className="right">{formatBRL(realAssetsTotal)}</td>
                </tr>
              )}
              {ownershipTotal > 0 && (
                <tr>
                  <td>Participações societárias</td>
                  <td className="right">{formatBRL(ownershipTotal)}</td>
                </tr>
              )}
              <tr style={{ fontWeight: 500 }}>
                <td>Patrimônio total</td>
                <td className="right">{formatBRL(totalPatrimony)}</td>
              </tr>
              <tr>
                <td style={{ color: "#6B6B70", fontSize: "9pt" }}>
                  Patrimônio considerado na projeção (só financeiro)
                </td>
                <td
                  className="right"
                  style={{ color: "#6B6B70", fontSize: "9pt" }}
                >
                  {formatBRL(financialTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16 }}>
          <h3 className="pdf-h3">Premissas econômicas</h3>
          <table className="pdf-table" style={{ marginTop: 6 }}>
            <tbody>
              <tr>
                <td>Inflação anual</td>
                <td className="right">
                  {data.assumptions?.inflationAnnualPct
                    ?.toFixed(1)
                    .replace(".", ",")}
                  %
                </td>
              </tr>
              <tr>
                <td>Retorno nominal anual</td>
                <td className="right">
                  {data.assumptions?.nominalAnnualPct
                    ?.toFixed(1)
                    .replace(".", ",")}
                  %
                </td>
              </tr>
              <tr style={{ fontWeight: 500 }}>
                <td>Retorno real anual (motor da projeção)</td>
                <td className="right">
                  {inputs.realReturnAnnualPct.toFixed(1).replace(".", ",")}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <PdfFooter pageLabel="03" today={today} />
      </div>

      {/* ============ PÁGINA 4 — LEITURA + APORTE DE MANUTENÇÃO ============ */}
      <div className="pdf-page">
        <div className="pdf-eyebrow">Leitura do cenário</div>
        <h1 className="pdf-h1" style={{ marginTop: 6 }}>
          {isFeasible
            ? "O plano se sustenta nas premissas atuais."
            : "Existe um gap a ser endereçado."}
        </h1>

        <div style={{ marginTop: 18 }}>
          <h3 className="pdf-h3">Renda mensal na idade-alvo</h3>
          <div style={{ marginTop: 10 }}>
            <div className="pdf-bar-row">
              <div className="lbl">Desejada</div>
              <div className="track">
                <div
                  className="fill gold"
                  style={{
                    width: `${
                      (inputs.desiredMonthlyIncomeBRL / maxIncome) * 100
                    }%`,
                  }}
                />
              </div>
              <div className="amount">
                {formatBRL(inputs.desiredMonthlyIncomeBRL)}
              </div>
            </div>
            <div className="pdf-bar-row">
              <div className="lbl">Sustentável</div>
              <div className="track">
                <div
                  className="fill"
                  style={{
                    width: `${
                      (feasibility.sustainableMonthlyIncomeAtTargetBRL /
                        maxIncome) *
                      100
                    }%`,
                  }}
                />
              </div>
              <div className="amount">
                {formatBRL(feasibility.sustainableMonthlyIncomeAtTargetBRL)}
              </div>
            </div>
          </div>
          <p className="pdf-prose" style={{ marginTop: 4, fontSize: "9.5pt" }}>
            Sustentável = renda que o patrimônio gera vivendo só dos juros
            reais. Manter o principal preserva a renda ao longo do tempo.
          </p>
        </div>

        {feasibility.requiredMonthlySavingsBRL !== null && (
          <div style={{ marginTop: 18 }}>
            <h3 className="pdf-h3">Aporte mensal de manutenção</h3>
            <p className="pdf-prose" style={{ marginTop: 4, fontSize: "9.5pt" }}>
              Valor mensal de aporte que faz o patrimônio atingir{" "}
              <strong>exatamente</strong> o nível de manutenção aos{" "}
              {inputs.targetAge} anos — ponto a partir do qual a renda desejada
              é paga só com juros reais, preservando o principal em reais de
              hoje.
            </p>
            <div className="pdf-highlight" style={{ marginTop: 10 }}>
              <div>
                <div className="label-gold">Aporte de manutenção</div>
                <div className="value-big">
                  {formatBRL(feasibility.requiredMonthlySavingsBRL)}
                  <span className="unit">/ mês</span>
                </div>
              </div>
              <div className="secondary" style={{ display: "grid", gap: "5mm" }}>
                <div>
                  <div className="label">Aporte atual</div>
                  <div className="val">{formatBRL(monthlySavings)} / mês</div>
                </div>
                <div>
                  <div className="label">
                    {monthlySavings >= feasibility.requiredMonthlySavingsBRL
                      ? "Folga sobre o necessário"
                      : "Falta por mês"}
                  </div>
                  <div
                    className={`val ${
                      monthlySavings >= feasibility.requiredMonthlySavingsBRL
                        ? "emerald"
                        : "gold"
                    }`}
                  >
                    {monthlySavings >= feasibility.requiredMonthlySavingsBRL
                      ? "+"
                      : ""}
                    {formatBRL(
                      monthlySavings - feasibility.requiredMonthlySavingsBRL
                    )}
                  </div>
                </div>
              </div>
              <div className="note">
                {monthlySavings >= feasibility.requiredMonthlySavingsBRL
                  ? "Seu aporte atual supera o necessário — você chegará à idade-alvo acima do nível de manutenção, acumulando uma folga real."
                  : "Aumentando o aporte mensal nesse valor, o patrimônio chega ao nível de manutenção no horizonte projetado. Outras alavancas: aumentar prazo, reduzir renda desejada ou revisar premissas."}
              </div>
            </div>
          </div>
        )}

        <div className="pdf-reading" style={{ marginTop: 14 }}>
          <div className="label-gold">Patrimônio necessário</div>
          <div
            style={{
              marginTop: "5mm",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6mm",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "7.5pt",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#6B6B70",
                }}
              >
                Para renda perpétua
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontSize: "16pt",
                  marginTop: "2mm",
                }}
              >
                {formatBRL(goal.wealthNeededPerpetualBRL)}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: "7.5pt",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#6B6B70",
                }}
              >
                Consumindo em 25 anos
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif), serif",
                  fontSize: "16pt",
                  marginTop: "2mm",
                }}
              >
                {formatBRL(goal.wealthNeeded25YearsBRL)}
              </div>
            </div>
          </div>
          {!isFeasible &&
            feasibility.additionalMonthlySavingsBRL !== null &&
            feasibility.additionalMonthlySavingsBRL > 0 && (
              <p
                className="pdf-prose"
                style={{
                  marginTop: "5mm",
                  fontSize: "9.5pt",
                  paddingTop: "5mm",
                  borderTop: "1px solid rgba(14,14,16,0.08)",
                }}
              >
                Aporte adicional estimado pra fechar o gap até a idade-alvo
                mantendo as premissas:{" "}
                <strong>
                  +{formatBRL(feasibility.additionalMonthlySavingsBRL)}/mês
                </strong>
                . Alternativas: aumentar o prazo, revisar premissas ou ajustar
                o objetivo de renda.
              </p>
            )}
        </div>

        <PdfFooter pageLabel="04" today={today} />
      </div>

      {/* ============ PÁGINA 5 — DISCLAIMERS ESTENDIDOS + CONTATO ============ */}
      <div className="pdf-page">
        <div className="pdf-eyebrow">Avisos legais e contato</div>
        <h1 className="pdf-h1" style={{ marginTop: 6 }}>
          Notas <span className="italic-navy">importantes</span>.
        </h1>

        {/* Tarja de alerta */}
        <div
          style={{
            marginTop: 16,
            background: "#0E0E10",
            color: "#FAFAF7",
            padding: "5mm 6mm",
          }}
        >
          <div
            style={{
              fontSize: "7.5pt",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#C8A461",
              marginBottom: "2mm",
            }}
          >
            Importante
          </div>
          <p
            style={{
              fontSize: "10pt",
              lineHeight: 1.45,
              margin: 0,
            }}
          >
            <strong>
              Este documento não constitui recomendação de investimento.
            </strong>{" "}
            Não há promessa de rentabilidade. Decisões patrimoniais devem ser
            tomadas com acompanhamento de profissional credenciado, considerando
            seu perfil completo, objetivos específicos e horizonte de tempo.
          </p>
        </div>

        <div style={{ marginTop: 14 }}>
          <h3 className="pdf-h3">Natureza do documento</h3>
          <p className="pdf-disclaimer" style={{ marginTop: 6 }}>
            Este relatório é um exercício de planejamento patrimonial gerado
            automaticamente a partir das informações e premissas fornecidas
            pelo próprio usuário, sem análise individualizada do contexto
            completo de vida, perfil de risco ou objetivos não declarados. As
            projeções são determinísticas — não consideram volatilidade ano a
            ano, eventos extraordinários, alterações fiscais futuras, mudanças
            no marco regulatório ou descontinuidades de mercado. Todos os
            valores estão expressos em reais de hoje (valor presente), com
            retornos descontados de inflação. Resultados reais podem diferir
            significativamente das projeções aqui apresentadas.
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <h3 className="pdf-h3">Limites e compliance</h3>
          <p className="pdf-disclaimer" style={{ marginTop: 6 }}>
            Não constitui oferta de produto, recomendação de investimento,
            aconselhamento jurídico, contábil ou tributário. Não há promessa
            nem garantia de rentabilidade — investimentos envolvem riscos,
            incluindo a possível perda do principal. Rentabilidade passada não
            é garantia de rentabilidade futura. O documento não substitui
            análise personalizada feita por profissional credenciado. As
            alocações eventualmente discutidas em reunião posterior são objeto
            de recomendações específicas devidamente documentadas. O assessor
            de investimentos é credenciado à XP Investimentos CCTVM S.A. e pode
            ser consultado na Ancord.
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <h3 className="pdf-h3">Premissas-chave da projeção</h3>
          <ul
            className="pdf-disclaimer"
            style={{ marginTop: 6, paddingLeft: "5mm" }}
          >
            <li style={{ marginBottom: "2mm" }}>
              Todos os valores em <strong>reais de hoje</strong>. O motor usa
              taxa REAL anual de{" "}
              {inputs.realReturnAnnualPct.toFixed(1).replace(".", ",")}%.
            </li>
            <li style={{ marginBottom: "2mm" }}>
              Patrimônio considerado na projeção:{" "}
              <strong>financeiro + societário</strong>. Ativos imobilizados
              (moradia, veículos) ficam de fora por não gerarem renda passiva
              diretamente.
            </li>
            <li style={{ marginBottom: "2mm" }}>
              Aportes são constantes e mantidos até a idade-alvo. A partir
              dela, começam retiradas iguais à renda mensal desejada.
            </li>
            <li>
              "Renda sustentável perpétua" = patrimônio × taxa real / 12, ou
              seja, vivendo só dos juros reais sem consumir o principal.
            </li>
          </ul>
        </div>

        {/* Próximo passo — variante por patrimônio financeiro */}
        {ctaFlow.kind === "account-opening" ? (
          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #E5E3DA",
              paddingTop: "7mm",
            }}
          >
            <div className="pdf-eyebrow">Quando decidir avançar</div>
            <h3 className="pdf-h3" style={{ marginTop: 4 }}>
              Caminhos para começar.
            </h3>
            <p
              className="pdf-prose"
              style={{ marginTop: 4, fontSize: "9.5pt" }}
            >
              Abrir conta comigo na XP inicia o acompanhamento próximo. Passo
              a ser seu assessor dedicado, revisando e ajustando a estratégia
              patrimonial em cadência regular.
            </p>

            <div
              style={{
                marginTop: "5mm",
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "4mm",
              }}
            >
              <a
                href="https://cadastro.xpi.com.br/desktop/step/1?assessor=A26522"
                style={{
                  display: "block",
                  padding: "4mm 4mm",
                  border: "1px solid #0E0E10",
                  textDecoration: "none",
                  color: "#0E0E10",
                }}
              >
                <div
                  style={{
                    fontSize: "7pt",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#C8A461",
                  }}
                >
                  Abrir conta
                </div>
                <div
                  style={{
                    marginTop: "1.5mm",
                    fontFamily: "var(--font-serif), serif",
                    fontSize: "11pt",
                  }}
                >
                  Pessoa Física
                </div>
                <div
                  style={{
                    marginTop: "2mm",
                    fontSize: "7.5pt",
                    color: "#6B6B70",
                    wordBreak: "break-all",
                  }}
                >
                  cadastro.xpi.com.br
                </div>
              </a>

              <a
                href="https://cadastro.xpempresas.com.br/cadastro/desktop/dados-pessoais/?assessor=A26522"
                style={{
                  display: "block",
                  padding: "4mm 4mm",
                  border: "1px solid #0E0E10",
                  textDecoration: "none",
                  color: "#0E0E10",
                }}
              >
                <div
                  style={{
                    fontSize: "7pt",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "#C8A461",
                  }}
                >
                  Abrir conta
                </div>
                <div
                  style={{
                    marginTop: "1.5mm",
                    fontFamily: "var(--font-serif), serif",
                    fontSize: "11pt",
                  }}
                >
                  Pessoa Jurídica
                </div>
                <div
                  style={{
                    marginTop: "2mm",
                    fontSize: "7.5pt",
                    color: "#6B6B70",
                    wordBreak: "break-all",
                  }}
                >
                  cadastro.xpempresas.com.br
                </div>
              </a>

              <a
                href="https://wa.me/5511932212045?text=Ol%C3%A1%20Gustavo%2C%20fiz%20o%20planejamento%20financeiro%20no%20seu%20site%20e%20gostaria%20de%20agendar%20uma%20reuni%C3%A3o."
                style={{
                  display: "block",
                  padding: "4mm 4mm",
                  border: "1px solid #25D366",
                  background: "#25D366",
                  textDecoration: "none",
                  color: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    fontSize: "7pt",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                  }}
                >
                  Conversar antes
                </div>
                <div
                  style={{
                    marginTop: "1.5mm",
                    fontFamily: "var(--font-serif), serif",
                    fontSize: "11pt",
                  }}
                >
                  Agendar reunião
                </div>
                <div style={{ marginTop: "2mm", fontSize: "7.5pt", opacity: 0.85 }}>
                  WhatsApp · 11 93221-2045
                </div>
              </a>
            </div>
          </div>
        ) : (
          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #E5E3DA",
              paddingTop: "7mm",
            }}
          >
            <div className="pdf-eyebrow">Quando decidir avançar</div>
            <h3 className="pdf-h3" style={{ marginTop: 4 }}>
              Caminho para começar.
            </h3>
            <p
              className="pdf-prose"
              style={{ marginTop: 4, fontSize: "9.5pt" }}
            >
              Para acompanhar seus primeiros passos com a atenção que esse
              momento merece, encaminho você diretamente a um especialista do
              meu time. Mesmo método, mesmo cuidado — pensado para esse
              estágio.
            </p>

            <div style={{ marginTop: "5mm" }}>
              <a
                href="https://wa.me/5511932212045?text=Ol%C3%A1%20Gustavo%2C%20fiz%20o%20planejamento%20financeiro%20no%20seu%20site%20e%20gostaria%20de%20falar%20com%20algu%C3%A9m%20do%20seu%20time."
                style={{
                  display: "block",
                  padding: "5mm 6mm",
                  border: "1px solid #25D366",
                  background: "#25D366",
                  textDecoration: "none",
                  color: "#FFFFFF",
                }}
              >
                <div
                  style={{
                    fontSize: "7pt",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    opacity: 0.85,
                  }}
                >
                  Falar com especialista
                </div>
                <div
                  style={{
                    marginTop: "1.5mm",
                    fontFamily: "var(--font-serif), serif",
                    fontSize: "12pt",
                  }}
                >
                  Falar com especialista do time
                </div>
                <div style={{ marginTop: "2mm", fontSize: "7.5pt", opacity: 0.85 }}>
                  WhatsApp · 11 93221-2045
                </div>
              </a>
            </div>
          </div>
        )}

        {/* Contato — sempre visível */}
        <div
          style={{
            marginTop: "7mm",
            paddingTop: "5mm",
            borderTop: "1px solid #E5E3DA",
          }}
        >
          <div className="pdf-eyebrow">Contato</div>
          <div
            style={{
              marginTop: 4,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "6mm",
              fontSize: "9.5pt",
              lineHeight: 1.55,
            }}
          >
            <div>
              <div>
                <strong>Gustavo Trotta</strong>
              </div>
              <div style={{ color: "#6B6B70" }}>
                Valor Investimentos · XP · CFP®
              </div>
            </div>
            <div style={{ color: "#3a3a3d" }}>
              <div>gustavo.mendonca@valorinvestimentos.com.br</div>
              <div>São Paulo · Brasil</div>
            </div>
          </div>
        </div>

        <PdfFooter pageLabel="05" today={today} />
      </div>
    </>
  );
}

function PdfFooter({ pageLabel, today }: { pageLabel: string; today: string }) {
  return (
    <div className="pdf-footer">
      <div className="brand">
        Gustavo <span className="gold">Trotta</span> · Valor · XP
      </div>
      <div style={{ textAlign: "center", flex: 1, fontSize: "6.5pt", color: "#8C8C90" }}>
        Documento informativo — não constitui recomendação de investimento
      </div>
      <div>
        {today} · Pág. {pageLabel}
      </div>
    </div>
  );
}
