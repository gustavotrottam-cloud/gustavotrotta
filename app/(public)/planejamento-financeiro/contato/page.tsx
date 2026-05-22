import { redirect } from "next/navigation";
import Container from "@/components/Container";
import Section from "@/components/Section";
import ContactGateForm from "@/components/clientes/planejamento/ContactGateForm";
import { loadOrCreatePlan, registerContactAndStart } from "../actions";
import { readPlanIdentity } from "@/lib/planejamento/session";
import { ACTIVE_STEPS } from "@/lib/planejamento/steps";

export const dynamic = "force-dynamic";

/**
 * Gate de entrada — anônimo PRECISA passar por aqui antes de preencher.
 * Cliente logado pula direto pra etapa 01 (já conhecido).
 */
export default async function ContatoPage() {
  const identity = await readPlanIdentity();

  // Logged: pula gate
  if (identity?.kind === "user") {
    redirect(ACTIVE_STEPS[0].path);
  }

  const plan = await loadOrCreatePlan();

  // Anon com lead já capturado: pula gate (apenas oferece editar caso queira corrigir)
  // Decisão de produto: se já tem lead, vai direto pra etapa atual. Não trava de novo.
  if (plan.lead_id) {
    redirect(plan.current_step
      ? `/planejamento-financeiro/editar/${plan.current_step}`
      : ACTIVE_STEPS[0].path);
  }

  return (
    <>
      <Section className="pt-40 md:pt-48 lg:pt-52 pb-20 md:pb-28">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-14 lg:grid-cols-12 lg:gap-20">
            {/* Lado esquerdo — narrativa */}
            <div className="lg:col-span-5">
              <div className="eyebrow">Planejamento Financeiro</div>
              <h1 className="mt-6 font-serif text-[2.4rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.8rem]">
                Antes de começar,{" "}
                <span className="italic text-navy-800">seus dados</span>.
              </h1>
              <p className="mt-7 text-[1rem] leading-relaxed text-muted-600">
                Nome completo e WhatsApp são o suficiente. Em troca, você ganha
                uma análise patrimonial completa em 6 minutos e um documento
                editorial em PDF pra arquivar.
              </p>
              <ul className="mt-8 space-y-4 border-l border-gold-500/40 pl-5 text-[0.92rem] leading-relaxed text-muted-600">
                <li>
                  <strong className="font-medium text-ink-900">
                    Por que pedimos?
                  </strong>{" "}
                  Porque o plano vira uma conversa. Eventualmente entramos em
                  contato pra revisar com você — só se você quiser.
                </li>
                <li>
                  <strong className="font-medium text-ink-900">
                    Seus dados são confidenciais.
                  </strong>{" "}
                  Não compartilhamos com terceiros. Não enviamos email
                  publicitário em massa.
                </li>
                <li>
                  <strong className="font-medium text-ink-900">
                    Você pode preencher para outra pessoa.
                  </strong>{" "}
                  Familiar, sócio, colega — basta colocar o nome e telefone
                  dela.
                </li>
              </ul>
            </div>

            {/* Lado direito — form */}
            <div className="lg:col-span-7">
              <div className="border border-paper-300/70 bg-paper-100 p-8 md:p-10">
                <div className="mb-8 border-b border-paper-300/70 pb-5">
                  <div className="text-[0.65rem] uppercase tracking-wider3 text-gold-600">
                    Etapa de liberação
                  </div>
                  <div className="mt-2 font-serif text-[1.4rem] leading-[1.15] tracking-editorial text-ink-900">
                    Preencha pra liberar a ferramenta
                  </div>
                </div>

                <ContactGateForm
                  registerContact={registerContactAndStart}
                  nextHref={ACTIVE_STEPS[0].path}
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
