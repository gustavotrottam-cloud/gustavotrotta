/**
 * Bloco de CTAs pra abertura de conta na XP (PF e PJ).
 * Renderizado abaixo do botão de download do PDF, na página de resultados
 * do planejamento financeiro. Os links abrem em aba nova.
 */

const PF_URL = "https://cadastro.xpi.com.br/desktop/step/1?assessor=A26522";
const PJ_URL =
  "https://cadastro.xpempresas.com.br/cadastro/desktop/dados-pessoais/?assessor=A26522";

export default function OpenAccountButtons() {
  return (
    <div className="border border-ink-900/15 bg-paper-100 px-8 py-7 md:px-10 md:py-8">
      <div className="grid items-center gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
            Próximo passo · opcional
          </div>
          <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.15] tracking-editorial text-ink-900 md:text-[1.7rem]">
            Abrir conta para colocar em prática.
          </h3>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-muted-600">
            Se você decidir avançar, abrir conta comigo na XP é o caminho —
            sem cobrança, me torno seu assessor para o acompanhamento.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:col-span-5">
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
        </div>
      </div>
    </div>
  );
}
