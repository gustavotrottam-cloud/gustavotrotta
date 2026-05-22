import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import Section from "@/components/Section";
import { loadOrCreatePlan, resetCurrentPlan } from "./actions";
import { ACTIVE_STEPS, getStep } from "@/lib/planejamento/steps";

export const dynamic = "force-dynamic";

export default async function PlanejamentoLanding({
  searchParams,
}: {
  searchParams: { baixado?: string };
}) {
  const justDownloaded = searchParams?.baixado === "1";

  // Server action chamada pelo form "Começar do zero"
  async function startOverAction() {
    "use server";
    await resetCurrentPlan();
    // Após reset: anon precisa de novo contato; logged já é conhecido
    redirect("/planejamento-financeiro/contato");
  }

  const plan = await loadOrCreatePlan();
  const completedSet = new Set(plan.completed_steps);
  const hasStarted = plan.completed_steps.length > 0;
  const isAllDone =
    plan.status === "completed" ||
    ACTIVE_STEPS.every((s) => completedSet.has(s.id));
  const currentStep = getStep(plan.current_step) ?? ACTIVE_STEPS[0];

  // Define o destino do CTA principal:
  // - Logado: vai direto pra etapa (não passa por /contato)
  // - Anon sem lead capturado: vai pra /contato (gate de entrada)
  // - Anon com lead: continua de onde parou
  const needsContact = plan.profile_id === null && plan.lead_id === null;
  const primaryHref = needsContact
    ? "/planejamento-financeiro/contato"
    : isAllDone
      ? "/planejamento-financeiro/editar/resultados"
      : currentStep.path;
  const primaryLabel = needsContact
    ? "Liberar ferramenta"
    : isAllDone
      ? "Ver resultados"
      : hasStarted
        ? "Continuar"
        : "Começar agora";

  return (
    <>
      {/* Hero editorial */}
      <Section className="pt-40 md:pt-48 lg:pt-52 pb-12 md:pb-16">
        <Container>
          <div className="max-w-3xl">
            <div className="eyebrow">Planejamento Financeiro</div>
            <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[3.4rem] lg:text-[4rem]">
              Uma visão honesta do seu{" "}
              <span className="italic text-navy-800">patrimônio</span>{" "}
              em 6 minutos.
            </h1>
            <p className="mt-8 max-w-prose2 text-[1.05rem] leading-relaxed text-muted-600 md:text-[1.15rem]">
              Ferramenta gratuita para quem trata o patrimônio como projeto de
              décadas. Em 6 etapas curtas você desenha sua situação atual,
              define suas metas e recebe uma projeção de longo prazo — com
              estimativa de independência financeira, renda sustentável e
              aporte necessário pra manter o plano de pé.
            </p>
            <p className="mt-5 max-w-prose2 text-[0.92rem] leading-relaxed text-muted-500">
              Pra começar: nome completo e WhatsApp (DDD + número). Ao final,
              você baixa o documento em PDF. É premissa, não promessa: um
              exercício de planejamento, não recomendação de investimento.
            </p>
          </div>
        </Container>
      </Section>

      <Section className="pb-20 md:pb-28">
        <Container>
          {/* Banner pós-download */}
          {justDownloaded && (
            <div className="mb-10 border border-emerald-700/40 bg-emerald-50 px-7 py-6">
              <div className="text-[0.7rem] uppercase tracking-wider2 text-emerald-700">
                Plano baixado com sucesso
              </div>
              <h2 className="mt-2 font-serif text-[1.4rem] leading-[1.2] tracking-editorial text-ink-900">
                Pronto! Quer fazer outro estudo?
              </h2>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted-600">
                Pode preencher para outra pessoa — um familiar, um sócio, ou
                refazer com premissas diferentes. Os dados anteriores não
                aparecem mais aqui.
              </p>
              <Link
                href="/planejamento-financeiro/contato"
                className="mt-5 inline-flex items-center gap-3 bg-emerald-700 px-6 py-3 text-[0.7rem] uppercase tracking-wider2 text-paper-50 transition-all hover:bg-emerald-800"
              >
                Iniciar novo plano <span aria-hidden>→</span>
              </Link>
            </div>
          )}

          {/* Status bloc */}
          <div className="border-y border-paper-300/70 py-10">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="text-[0.7rem] uppercase tracking-wider3 text-gold-600">
                  {isAllDone
                    ? "Plano concluído"
                    : hasStarted
                      ? "Em andamento"
                      : "Comece quando quiser"}
                </div>
                <h2 className="mt-3 font-serif text-[1.8rem] leading-[1.15] tracking-editorial text-ink-900 md:text-[2.1rem]">
                  {needsContact
                    ? "Preencha seus dados pra liberar a ferramenta."
                    : isAllDone
                      ? "Você completou todas as etapas."
                      : hasStarted
                        ? `Próxima etapa: ${currentStep.title}.`
                        : "São 6 etapas curtas pra começar."}
                </h2>
                <p className="mt-4 max-w-prose2 text-[0.98rem] leading-relaxed text-muted-600">
                  {needsContact
                    ? "Nome completo e WhatsApp (DDD + número). 30 segundos. Em troca, você libera as 6 etapas do planejamento e o download do PDF final."
                    : isAllDone
                      ? "Acesse os resultados, revise as etapas e baixe o documento sempre que quiser."
                      : hasStarted
                        ? "Seus dados ficam salvos automaticamente. Continue quando quiser — sem precisar concluir tudo de uma vez."
                        : "Pode pausar e voltar depois — tudo fica salvo no seu navegador. Estimativa total: 6 minutos."}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    href={primaryHref}
                    className="inline-flex items-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800"
                  >
                    {primaryLabel}
                    <span aria-hidden>→</span>
                  </Link>
                  {(hasStarted || isAllDone) && !needsContact && (
                    <form action={startOverAction} className="inline">
                      <button
                        type="submit"
                        className="text-[0.72rem] uppercase tracking-wider2 text-muted-500 underline-offset-4 hover:text-ink-900 hover:underline"
                      >
                        ou começar do zero
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
                  As 6 etapas
                </div>
                <ol className="mt-4 space-y-3">
                  {ACTIVE_STEPS.map((step) => {
                    const done = completedSet.has(step.id);
                    const isCurrent = !done && step.id === plan.current_step;
                    return (
                      <li key={step.id}>
                        <Link
                          href={done || isCurrent ? step.path : "#"}
                          className={`group flex items-baseline gap-4 border-b border-paper-300/60 pb-3 transition-colors ${
                            done || isCurrent
                              ? "hover:border-ink-900/40"
                              : "pointer-events-none"
                          }`}
                        >
                          <span
                            className={`shrink-0 font-serif text-[0.95rem] ${
                              done
                                ? "text-gold-500"
                                : isCurrent
                                  ? "text-ink-900"
                                  : "text-muted-400"
                            }`}
                          >
                            {String(step.number).padStart(2, "0")}
                          </span>
                          <span className="flex-1">
                            <span
                              className={`block font-serif text-[1.05rem] tracking-editorial ${
                                done || isCurrent
                                  ? "text-ink-900"
                                  : "text-muted-500"
                              }`}
                            >
                              {step.title}
                            </span>
                          </span>
                          {done && (
                            <span
                              aria-hidden
                              className="text-gold-500 text-[0.85rem]"
                            >
                              ✓
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>

          {/* O que você recebe */}
          <div className="mt-16 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="eyebrow">O que você recebe</div>
              <h2 className="mt-4 font-serif text-[1.8rem] leading-[1.15] tracking-editorial text-ink-900 md:text-[2.1rem]">
                Mais do que números — uma{" "}
                <span className="italic text-navy-800">leitura</span> do seu cenário.
              </h2>
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-7">
                <li className="border-l border-gold-500/40 pl-5">
                  <div className="font-serif text-[1.15rem] text-ink-900">
                    Projeção patrimonial ano a ano
                  </div>
                  <p className="mt-1 text-[0.93rem] leading-relaxed text-muted-600">
                    Curva do seu patrimônio até os 95 anos, em reais de hoje —
                    descontado de inflação.
                  </p>
                </li>
                <li className="border-l border-gold-500/40 pl-5">
                  <div className="font-serif text-[1.15rem] text-ink-900">
                    Idade estimada de independência financeira
                  </div>
                  <p className="mt-1 text-[0.93rem] leading-relaxed text-muted-600">
                    Em que momento, mantendo seu aporte atual, seu patrimônio
                    sustenta a renda desejada perpetuamente.
                  </p>
                </li>
                <li className="border-l border-gold-500/40 pl-5">
                  <div className="font-serif text-[1.15rem] text-ink-900">
                    Aporte mensal de manutenção
                  </div>
                  <p className="mt-1 text-[0.93rem] leading-relaxed text-muted-600">
                    Quanto você precisa aportar por mês pra atingir o nível de
                    manutenção na idade-alvo — preservando o principal.
                  </p>
                </li>
                <li className="border-l border-gold-500/40 pl-5">
                  <div className="font-serif text-[1.15rem] text-ink-900">
                    Documento editorial em PDF
                  </div>
                  <p className="mt-1 text-[0.93rem] leading-relaxed text-muted-600">
                    5 páginas com capa, sumário executivo, gráfico, premissas e
                    leitura do cenário. Pronto pra arquivar ou levar pra uma
                    conversa.
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-16 border-t border-paper-300/70 pt-6 text-[0.78rem] leading-relaxed text-muted-500">
            Este planejamento é informativo e educacional. Não constitui
            recomendação de investimento nem promessa de rentabilidade. Decisões
            patrimoniais devem ser tomadas com acompanhamento de profissional
            credenciado, considerando o seu perfil completo, objetivos
            específicos e horizonte de tempo.
          </div>
        </Container>
      </Section>
    </>
  );
}
