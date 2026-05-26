import Container from "./Container";
import Section from "./Section";
import Reveal from "./Reveal";

const principles = [
  {
    n: "01",
    title: "Começo pela estratégia, nunca pelo produto.",
    body: "Toda alocação parte de objetivos, horizonte e tolerância — não do que está em vitrine. O produto é consequência, jamais o ponto de partida.",
  },
  {
    n: "02",
    title: "Penso em décadas, não em ciclos.",
    body: "Decisões financeiras são compostas no tempo. Construo planos que sobrevivem a juros que sobem, juros que caem, e à volatilidade que sempre volta.",
  },
  {
    n: "03",
    title: "Só recomendo o que consigo explicar.",
    body: "Estruturas sofisticadas só fazem sentido quando podem ser sustentadas em uma conversa. O cliente entende o que possui — e por quê — depois de cada revisão.",
  },
  {
    n: "04",
    title: "Acompanho. Não entrego e vou embora.",
    body: "Patrimônio se constrói em décadas; relacionamento, em conversas regulares. Cada cliente tem cadência clara de revisões, ajustes e leitura de cenário.",
  },
];

const naoFaco = [
  "Não vendo produto da semana.",
  "Não opero alavancagem em conta de cliente.",
  "Não prometo rentabilidade.",
  "Não atendo investidor que busca giro de curto prazo.",
];

/**
 * Manifesto editorial — substitui a antiga seção "Filosofia".
 * Tom: primeira pessoa, declarativo, sem adjetivos genéricos.
 * Sub-bloco "O que eu não faço" em fundo dark para criar contraste interno.
 */
export default function ComoEuPenso() {
  return (
    <Section id="como-penso" className="bg-paper-100">
      <Container>
        {/* ── Manifesto ────────────────────────────────────────────────── */}
        <div className="max-w-4xl">
          <Reveal>
            <div className="eyebrow">Como eu penso</div>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 font-serif text-[2.6rem] leading-[1.04] tracking-editorial text-ink-900 md:text-[3.6rem] lg:text-[4.2rem]">
              Patrimônio é{" "}
              <span className="italic text-navy-800">tempo organizado.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-8 max-w-prose2 text-[1.05rem] leading-relaxed text-muted-600 md:text-[1.15rem]">
              Cada decisão de hoje é uma aposta em quem você quer ser daqui a
              vinte anos. Por isso o trabalho começa antes do produto — começa
              em entender o que você está construindo, em que prazo, e em qual
              cenário.
            </p>
          </Reveal>
        </div>

        {/* ── 4 princípios ─────────────────────────────────────────────── */}
        <div className="mt-24 grid gap-x-12 gap-y-16 md:grid-cols-2">
          {principles.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.06}>
              <div className="relative pl-8">
                <span className="absolute left-0 top-2 h-[calc(100%-1rem)] w-[2px] bg-gradient-to-b from-gold-400 via-gold-500 to-gold-500/0" />
                <div className="font-serif text-[1rem] text-gold-600">
                  {p.n}
                </div>
                <h3 className="mt-4 font-serif text-2xl leading-[1.15] tracking-editorial text-ink-900 md:text-[1.7rem]">
                  {p.title}
                </h3>
                <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-600">
                  {p.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── O que eu não faço — bloco contrastante dark ──────────────── */}
        <Reveal delay={0.1}>
          <div className="mt-28 bg-ink-900 px-8 py-14 text-paper-100 md:px-14 md:py-16">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                <div className="text-[0.7rem] uppercase tracking-wider3 text-gold-400">
                  O que eu não faço
                </div>
                <h3 className="mt-5 font-serif text-3xl leading-[1.08] tracking-editorial md:text-[2.4rem]">
                  Tão importante quanto o método é{" "}
                  <span className="italic text-gold-400">o que fica de fora.</span>
                </h3>
              </div>
              <div className="lg:col-span-7">
                <ul className="grid gap-5">
                  {naoFaco.map((item, i) => (
                    <Reveal key={item} delay={0.2 + i * 0.05}>
                      <li className="flex items-baseline gap-5 border-b border-paper-100/10 pb-5 last:border-b-0">
                        <span className="shrink-0 font-serif text-[0.85rem] text-gold-400">
                          —
                        </span>
                        <span className="font-serif text-[1.25rem] leading-snug tracking-editorial text-paper-100 md:text-[1.4rem]">
                          {item}
                        </span>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
