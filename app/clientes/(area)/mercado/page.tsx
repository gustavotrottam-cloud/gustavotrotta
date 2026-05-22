import PageHeader from "@/components/clientes/PageHeader";
import CuratorNotice from "@/components/clientes/CuratorNotice";

const categories = [
  { slug: "juros", name: "Juros", desc: "Política monetária, Selic, curva de juros." },
  { slug: "inflacao", name: "Inflação", desc: "IPCA, expectativas, núcleos, dinâmica." },
  { slug: "brasil", name: "Brasil", desc: "Macroeconomia doméstica, política fiscal." },
  { slug: "eua", name: "EUA", desc: "Fed, Treasuries, dados de atividade." },
  { slug: "renda-fixa", name: "Renda Fixa", desc: "Pré, pós, indexada, crédito privado." },
  { slug: "acoes", name: "Ações", desc: "Ibovespa, setores, fluxo, tese." },
  { slug: "fundos-imobiliarios", name: "Fundos Imobiliários", desc: "Tijolo, papel, dividend yield, gestão." },
  { slug: "cambio", name: "Câmbio", desc: "Dólar, real, fluxo cambial, paridade." },
];

export default function MercadoPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Cenário & Mercado"
        title={
          <>
            Leitura de cenário,
            <br />
            <span className="italic text-navy-800">organizada por tema</span>.
          </>
        }
        intro="Vídeos curtos, textos objetivos, áudios e resumos semanais sobre o que está acontecendo nos mercados e por que importa para a sua carteira."
      />

      <div className="mt-12 grid gap-px bg-paper-300/70 md:grid-cols-2 lg:grid-cols-4">
        {categories.map((c) => (
          <div
            key={c.slug}
            className="group relative bg-paper-100 px-7 py-9 transition-colors duration-300 hover:bg-paper-200/60"
          >
            <span className="absolute left-0 top-9 bottom-9 w-[2px] bg-gold-500/0 transition-colors group-hover:bg-gold-500" />
            <div className="text-[0.68rem] uppercase tracking-wider2 text-muted-500">
              Tema
            </div>
            <h2 className="mt-3 font-serif text-[1.5rem] tracking-editorial text-ink-900">
              {c.name}
            </h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-muted-600">
              {c.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <CuratorNotice>
          O acervo está sendo populado a partir das aparições em mídia,
          relatórios próprios e leituras semanais. Em breve, esta área terá
          vídeos curtos, gráficos comentados e resumos toda semana. Você é
          notificado por email quando há material novo.
        </CuratorNotice>
      </div>
    </div>
  );
}
