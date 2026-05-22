import PageHeader from "@/components/clientes/PageHeader";
import CuratorNotice from "@/components/clientes/CuratorNotice";

const kinds = [
  {
    label: "Lives",
    body: "Encontros ao vivo para discussão de cenário e perguntas dos clientes em tempo real.",
  },
  {
    label: "Reuniões privadas",
    body: "Revisões individuais de carteira, planejamento patrimonial e leitura de momento.",
  },
  {
    label: "Calls com gestoras",
    body: "Conversas exclusivas com gestores de fundos de destaque, abertas a clientes selecionados.",
  },
  {
    label: "Palestras e eventos",
    body: "Eventos corporativos, universidades e encontros presenciais.",
  },
];

export default function AgendaPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Agenda"
        title={
          <>
            Encontros, lives e{" "}
            <span className="italic text-navy-800">conversas curadas</span>.
          </>
        }
        intro="Eventos exclusivos para clientes — confirme presença, acesse materiais e reveja gravações em um único lugar."
      />

      <div className="mt-12 grid gap-px bg-paper-300/70 md:grid-cols-2">
        {kinds.map((k, i) => (
          <div key={k.label} className="bg-paper-100 px-8 py-9">
            <div className="text-[0.68rem] uppercase tracking-wider2 text-gold-600">
              {String(i + 1).padStart(2, "0")} · Formato
            </div>
            <h2 className="mt-3 font-serif text-[1.55rem] tracking-editorial text-ink-900">
              {k.label}
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-600">
              {k.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <CuratorNotice>
          A agenda estará ativa com confirmação de presença, lembretes
          automáticos e gravações pós-evento. Atualmente, agendamentos
          continuam pelo WhatsApp ou email enquanto a área é finalizada.
        </CuratorNotice>
      </div>
    </div>
  );
}
