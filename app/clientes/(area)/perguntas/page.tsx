import PageHeader from "@/components/clientes/PageHeader";
import CuratorNotice from "@/components/clientes/CuratorNotice";

const channels = [
  {
    label: "FAQ inteligente",
    body: "Respostas curtas e objetivas para as dúvidas mais frequentes — investimentos, proteção, aposentadoria, tributação e sucessão.",
  },
  {
    label: "Busca por tema",
    body: "Procure por palavra-chave e veja a resposta direta + os materiais da biblioteca relacionados.",
  },
  {
    label: "Pergunte ao assessor",
    body: "Envie sua pergunta. Respondida pessoalmente em até 1 dia útil — sem chatbot genérico de gerente.",
  },
  {
    label: "Histórico privado",
    body: "Suas perguntas anteriores ficam organizadas — fácil voltar e reler quando precisar.",
  },
];

export default function PerguntasPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Perguntas"
        title={
          <>
            Sua linha direta para{" "}
            <span className="italic text-navy-800">dúvidas reais</span>.
          </>
        }
        intro="Investimento sério é feito de perguntas — não de palpites. Aqui você procura, lê, envia uma dúvida específica e recebe resposta consultiva, não automatizada."
      />

      <div className="mt-12 grid gap-px bg-paper-300/70 md:grid-cols-2">
        {channels.map((c, i) => (
          <div key={c.label} className="bg-paper-100 px-8 py-9">
            <div className="text-[0.68rem] uppercase tracking-wider2 text-gold-600">
              {String(i + 1).padStart(2, "0")} · Canal
            </div>
            <h2 className="mt-3 font-serif text-[1.55rem] tracking-editorial text-ink-900">
              {c.label}
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-600">
              {c.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <CuratorNotice>
          Em curadoria. Por enquanto, sua linha mais rápida continua pelo
          WhatsApp ou email. Futuramente esta área terá busca semântica
          (com IA treinada nos materiais do canal) e respostas instantâneas
          para perguntas frequentes.
        </CuratorNotice>
      </div>
    </div>
  );
}
