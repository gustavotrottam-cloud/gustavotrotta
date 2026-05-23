import { resolveCtaFlow } from "@/lib/planejamento/cta-rules";

/**
 * Bloco de CTAs no final do planejamento financeiro.
 *
 * - Patrimônio financeiro ≥ R$ 300k → abertura de conta (PF, PJ) + WhatsApp.
 * - Patrimônio financeiro < R$ 300k → handoff pro time (botão WhatsApp único).
 *
 * Toda a regra está em `lib/planejamento/cta-rules.ts` pra reuso no PDF.
 */

const PF_URL = "https://cadastro.xpi.com.br/desktop/step/1?assessor=A26522";
const PJ_URL =
  "https://cadastro.xpempresas.com.br/cadastro/desktop/dados-pessoais/?assessor=A26522";

const WHATSAPP_ADVANCE_URL =
  "https://wa.me/5511932212045?text=" +
  encodeURIComponent(
    "Olá Gustavo, fiz o planejamento financeiro no seu site e gostaria de agendar uma reunião para conversar sobre os próximos passos."
  );

const WHATSAPP_TEAM_URL =
  "https://wa.me/5511932212045?text=" +
  encodeURIComponent(
    "Olá Gustavo, fiz o planejamento financeiro no seu site e gostaria de falar com alguém do seu time."
  );

type Props = {
  /** Total declarado em patrimônio financeiro (categoria patrimony.financial). */
  financialPatrimony: number;
};

export default function OpenAccountButtons({ financialPatrimony }: Props) {
  const flow = resolveCtaFlow(financialPatrimony);

  if (flow.kind === "account-opening") {
    return <AccountOpeningBlock />;
  }
  return <TeamHandoffBlock />;
}

/* ─── Variante para patrimônio ≥ R$ 300k ─────────────────────────── */
function AccountOpeningBlock() {
  return (
    <div className="border border-ink-900/15 bg-paper-100 px-8 py-7 md:px-10 md:py-8">
      <div className="grid items-start gap-8 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
            Próximo passo
          </div>
          <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.15] tracking-editorial text-ink-900 md:text-[1.7rem]">
            Quando decidir avançar.
          </h3>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-600">
            Abrir conta comigo na XP inicia o acompanhamento próximo. Passo
            a ser seu assessor dedicado — construindo, revisando e ajustando
            a estratégia patrimonial com você, em cadência regular.
          </p>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-500">
            Se preferir conversar antes, agende uma reunião pelo WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-6">
          <a
            href={PF_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between gap-3 border border-ink-900 px-6 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-paper-50"
          >
            <span>Abrir conta · Pessoa Física</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={PJ_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between gap-3 border border-ink-900 px-6 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-paper-50"
          >
            <span>Abrir conta · Pessoa Jurídica</span>
            <span aria-hidden>→</span>
          </a>
          <a
            href={WHATSAPP_ADVANCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between gap-3 bg-[#25D366] px-6 py-4 text-[0.72rem] uppercase tracking-wider2 text-white transition-all duration-300 hover:bg-[#1ebe57]"
          >
            <span className="inline-flex items-center gap-2.5">
              <WhatsAppIcon />
              Agendar reunião · WhatsApp
            </span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Variante para patrimônio < R$ 300k ─────────────────────────── */
function TeamHandoffBlock() {
  return (
    <div className="border border-ink-900/15 bg-paper-100 px-8 py-7 md:px-10 md:py-8">
      <div className="grid items-start gap-8 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
            Próximo passo
          </div>
          <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.15] tracking-editorial text-ink-900 md:text-[1.7rem]">
            Quando decidir avançar.
          </h3>
          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-600">
            Para acompanhar seus primeiros passos com a atenção que esse
            momento merece, encaminho você diretamente a um especialista do
            meu time. Mesmo método, mesmo cuidado — pensado para esse
            estágio.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-6">
          <a
            href={WHATSAPP_TEAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between gap-3 bg-[#25D366] px-6 py-4 text-[0.72rem] uppercase tracking-wider2 text-white transition-all duration-300 hover:bg-[#1ebe57]"
          >
            <span className="inline-flex items-center gap-2.5">
              <WhatsAppIcon />
              Falar com especialista do time
            </span>
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.37c0-4.53 3.69-8.21 8.23-8.21 2.2 0 4.27.86 5.82 2.41a8.16 8.16 0 0 1 2.41 5.82c0 4.54-3.69 8.22-8.23 8.22zm4.51-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.81-.78.97-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.23-.74-.66-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.24.25-.41.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1.01 2.55.12.16 1.74 2.66 4.21 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.55.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.18-.48-.3z" />
    </svg>
  );
}
