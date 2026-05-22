import PageHeader from "@/components/clientes/PageHeader";
import CuratorNotice from "@/components/clientes/CuratorNotice";

const features = [
  {
    label: "Resumo executivo",
    body: "Em 3–5 linhas, o que o relatório diz e a conclusão central. Você decide se vale o tempo de leitura completa antes de abrir o PDF.",
  },
  {
    label: "Principais insights",
    body: "3 a 6 pontos numerados extraídos do material — os argumentos que importam, separados do ruído.",
  },
  {
    label: "Contexto de mercado",
    body: "Como o relatório se conecta ao cenário atual e à sua carteira. A análise por trás da análise.",
  },
  {
    label: "Por que importa",
    body: "Implicação prática: o que isso muda (ou não muda) na alocação, no horizonte e na cabeça.",
  },
];

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Research"
        title={
          <>
            Curadoria editorial de{" "}
            <span className="italic text-navy-800">relatórios e teses</span>.
          </>
        }
        intro="Aqui não é um repositório de PDFs. Cada material recebe um tratamento editorial — você vê o essencial antes de decidir mergulhar no documento completo."
      />

      <div className="mt-12 grid gap-px bg-paper-300/70 md:grid-cols-2">
        {features.map((f, i) => (
          <div key={f.label} className="bg-paper-100 px-8 py-9">
            <div className="text-[0.68rem] uppercase tracking-wider2 text-gold-600">
              {String(i + 1).padStart(2, "0")} · Estrutura
            </div>
            <h2 className="mt-3 font-serif text-[1.55rem] leading-[1.15] tracking-editorial text-ink-900">
              {f.label}
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-600">
              {f.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <CuratorNotice>
          Primeiros relatórios em fase de curadoria. Fontes incluem casas de
          research da XP, cartas de gestoras independentes, análises
          macroeconômicas e teses de investimento. Cada peça passa por
          tratamento editorial antes de chegar a você.
        </CuratorNotice>
      </div>
    </div>
  );
}
