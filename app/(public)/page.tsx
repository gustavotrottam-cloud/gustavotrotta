import Link from "next/link";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import Portrait from "@/components/Portrait";
import MediaGrid from "@/components/MediaGrid";
import MediaLogosStrip from "@/components/MediaLogosStrip";
import InstitutionalBanner from "@/components/InstitutionalBanner";
import Recognitions from "@/components/Recognitions";
import { youtubeChannelUrl } from "@/lib/media";
import { sanityClient } from "@/sanity/lib/client";
import { articlesQuery } from "@/sanity/lib/queries";

// Permite atualizar os destaques da home quando algo é publicado no Sanity.
export const revalidate = 60;

type HomeArticle = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  readingTimeMin?: number;
  category?: { name: string; slug: string };
};

const pillars = [
  {
    n: "01",
    title: "Estratégia antes de produto",
    body: "Toda alocação parte de objetivos, horizonte e tolerância — não de tendências de mercado. O produto é consequência da estratégia, nunca o ponto de partida.",
  },
  {
    n: "02",
    title: "Visão de longo prazo",
    body: "Decisões financeiras são compostas no tempo. Construímos um plano que sobrevive a ciclos, mudanças de juros e a inevitável volatilidade dos mercados.",
  },
  {
    n: "03",
    title: "Clareza acima de complexidade",
    body: "Estruturas sofisticadas só fazem sentido quando podem ser explicadas. O cliente sai de cada conversa entendendo exatamente o que possui e por quê.",
  },
  {
    n: "04",
    title: "Acompanhamento próximo",
    body: "Patrimônio se constrói em décadas; relacionamento, em conversas regulares. Cada cliente tem uma cadência clara de revisões, ajustes e leitura de cenário.",
  },
];

const areas = [
  {
    title: "Estrutura financeira",
    body: "Organização de fluxo de caixa, dívidas, reserva de liquidez e disciplina de poupança como base de qualquer plano de longo prazo.",
  },
  {
    title: "Gestão de investimentos",
    body: "Alocação por objetivo, risco e horizonte — não por produto da semana. Diversificação real, leitura de cenário e revisão sistemática.",
  },
  {
    title: "Proteção patrimonial",
    body: "Seguros pessoais, blindagem e estruturas que preservam o patrimônio em cenários adversos e na ausência inesperada do provedor.",
  },
  {
    title: "Aposentadoria e independência",
    body: "Projeção de longo prazo, idade-alvo de independência financeira e aporte mensal de manutenção calculados sobre seu próprio cenário.",
  },
  {
    title: "Eficiência tributária",
    body: "Decisões de alocação considerando o impacto fiscal em cada veículo, fase de vida e modalidade de tributação.",
  },
  {
    title: "Planejamento sucessório",
    body: "Estruturação patrimonial pensando em continuidade, proteção e transmissão consciente entre gerações.",
  },
];

export default async function HomePage() {
  // Os 3 artigos mais recentes do Sanity. Falha silenciosa: se o fetch
  // quebrar, a seção #conteudo apenas convida pra /conteudo sem destaques.
  let featuredArticles: HomeArticle[] = [];
  try {
    const all = await sanityClient.fetch<HomeArticle[]>(articlesQuery);
    featuredArticles = all.slice(0, 3);
  } catch (err) {
    console.error("[home] Sanity fetch error:", err);
  }

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <Section className="pt-40 md:pt-48 lg:pt-52 pb-20 md:pb-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7 lg:pr-6">
              <Reveal>
                <div className="eyebrow">Gustavo Trotta · Assessor de investimentos</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.02] tracking-editorial text-ink-900 md:text-[3.6rem] lg:text-[4.4rem]">
                  Estratégia patrimonial
                  <br />
                  com clareza e
                  <br />
                  <span className="italic text-navy-800">visão de longo prazo.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-8 max-w-prose2 text-[1.05rem] leading-relaxed text-muted-600 md:text-[1.15rem]">
                  Acompanhamento próximo para famílias e profissionais que tratam o
                  patrimônio como um projeto de décadas — não como uma sucessão de
                  decisões pontuais.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="/planejamento-financeiro"
                    className="inline-flex items-center gap-3 bg-ink-900 px-7 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800"
                  >
                    Planejamento Financeiro Gratuito
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/conteudo"
                    className="inline-flex items-center gap-3 px-1 py-2 text-[0.78rem] uppercase tracking-wider2 text-ink-900 underline-offset-8 hover:underline"
                  >
                    Acessar conteúdos
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.35}>
                <div className="mt-16 grid grid-cols-3 gap-8 border-t border-paper-300/70 pt-8 max-w-xl">
                  <div>
                    <div className="font-serif text-3xl text-ink-900">CFP</div>
                    <div className="mt-1 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
                      Certified Financial Planner
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl text-ink-900">4+</div>
                    <div className="mt-1 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
                      Anos no mercado
                    </div>
                  </div>
                  <div>
                    <div className="font-serif text-3xl text-ink-900">Ohio</div>
                    <div className="mt-1 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
                      Finanças Corporativas
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal direction="left" delay={0.1}>
                <Portrait
                  src="/gustavo-trotta-hero.jpg"
                  alt="Gustavo Trotta, assessor de investimentos e sócio da Valor Investimentos / XP"
                  caption="Gustavo Trotta · São Paulo"
                  priority
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── AUTORIDADE — VISTOS EM ─────────────────────────────────────────── */}
      <Section className="py-16 md:py-20">
        <Container>
          <MediaLogosStrip />
        </Container>
      </Section>

      {/* ── RECONHECIMENTOS ────────────────────────────────────────────────── */}
      <Recognitions variant="light" compact />

      {/* ── PLANEJAMENTO FINANCEIRO — ferramenta gratuita (destaque alto na home) ─ */}
      <Section id="planejamento" className="bg-ink-900 text-paper-100">
        <Container>
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="text-[0.7rem] uppercase tracking-wider3 text-gold-400">
                  Planejamento Financeiro · Ferramenta gratuita
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial md:text-[3.2rem]">
                  Em 6 minutos, uma <span className="italic text-gold-400">leitura honesta</span> do seu patrimônio.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 max-w-prose2 text-[1.02rem] leading-relaxed text-paper-100/75">
                  Uma calculadora não — uma ferramenta de planejamento. Você
                  desenha sua situação atual, define seu objetivo de longo
                  prazo, e recebe uma projeção patrimonial com idade estimada
                  de independência financeira, aporte mensal de manutenção e
                  análise do gap.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 max-w-prose2 text-[0.95rem] leading-relaxed text-paper-100/60">
                  Ao final, baixe um documento editorial em PDF de 5 páginas
                  pronto pra arquivar ou levar pra uma conversa. Gratuito,
                  sem cadastro pra começar.
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    href="/planejamento-financeiro"
                    className="inline-flex items-center gap-3 bg-gold-400 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-paper-50"
                  >
                    Iniciar meu planejamento
                    <span aria-hidden>→</span>
                  </Link>
                  <span className="text-[0.78rem] text-paper-100/55">
                    Gratuito · ~6 min · Resultado em PDF
                  </span>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.2}>
                <ol className="space-y-5 border-l border-paper-100/15 pl-6">
                  {[
                    { n: "01", t: "Sobre você", d: "Idade, estado civil, dependentes" },
                    { n: "02", t: "Objetivo de longo prazo", d: "Idade-alvo + renda desejada" },
                    { n: "03", t: "Fluxo financeiro", d: "Receitas e despesas mensais" },
                    { n: "04", t: "Estrutura patrimonial", d: "Financeiro, imobilizado, societário" },
                    { n: "05", t: "Premissas econômicas", d: "Inflação, juros e retorno real" },
                    { n: "06", t: "Visão integrada", d: "Projeção + leitura + PDF" },
                  ].map((step) => (
                    <li key={step.n} className="flex items-baseline gap-5">
                      <span className="shrink-0 font-serif text-[0.95rem] text-gold-400">
                        {step.n}
                      </span>
                      <div>
                        <div className="font-serif text-[1.05rem] tracking-editorial">
                          {step.t}
                        </div>
                        <div className="mt-0.5 text-[0.82rem] text-paper-100/55">
                          {step.d}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>
              <Reveal delay={0.35}>
                <p className="mt-8 text-[0.75rem] leading-relaxed text-paper-100/45">
                  Documento informativo — não constitui recomendação de
                  investimento nem promessa de rentabilidade.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── FILOSOFIA ──────────────────────────────────────────────────────── */}
      <Section id="filosofia" className="bg-paper-200/60">
        <Container>
          <SectionHeading
            eyebrow="Filosofia"
            title={
              <>
                Quatro princípios que sustentam <span className="italic text-navy-800">cada decisão</span>.
              </>
            }
            intro="Não trabalhamos por tese de curto prazo nem por produto da semana. Cada estratégia parte dos mesmos quatro pontos — independentemente do perfil de cliente, do tamanho do patrimônio ou do momento do mercado."
          />

          <div className="mt-20 grid gap-x-12 gap-y-16 md:grid-cols-2">
            {pillars.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.06}>
                <div className="flex gap-8">
                  <div className="shrink-0 font-serif text-[1.6rem] text-gold-500">
                    {p.n}
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl tracking-editorial text-ink-900 md:text-[1.7rem]">
                      {p.title}
                    </h3>
                    <p className="mt-4 text-[0.98rem] leading-relaxed text-muted-600">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── SOBRE (resumo) ─────────────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-5">
              <Reveal>
                <Portrait
                  src="/gustavo-trotta-sobre.jpg"
                  alt="Gustavo Trotta em retrato profissional"
                  ratio="portrait"
                  caption="Sobre · Gustavo Trotta"
                />
              </Reveal>
            </div>
            <div className="lg:col-span-7 lg:pl-4">
              <Reveal>
                <div className="eyebrow">Sobre</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial text-ink-900 md:text-[3rem]">
                  Engenheiro de formação, <span className="italic text-navy-800">estrategista por escolha.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 text-[1.02rem] leading-relaxed text-muted-600">
                  Formado em Engenharia Mecânica pela UFF em 2017, atuou cinco
                  anos como engenheiro em uma multinacional automotiva francesa
                  antes de ingressar no mercado financeiro em 2022, como associado
                  da Valor Investimentos. Em 2024, tornou-se sócio da companhia e
                  obteve a certificação CFP — Certified Financial Planner.
                </p>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 text-[1.02rem] leading-relaxed text-muted-600">
                  Bacharel em Finanças Corporativas pela Ohio University. Dedica-se
                  ao planejamento financeiro com visão integrada — investimentos,
                  proteção, aposentadoria, eficiência tributária e sucessão —
                  com o mesmo rigor analítico que a engenharia ensinou. Em paralelo,
                  mantém presença regular em emissoras nacionais como comentarista
                  de cenário econômico.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <Link
                  href="/sobre"
                  className="mt-10 inline-flex items-center gap-3 text-[0.78rem] uppercase tracking-wider2 text-ink-900 underline-offset-8 hover:underline"
                >
                  Conhecer a trajetória completa
                  <span aria-hidden>→</span>
                </Link>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── ÁREAS DE ATUAÇÃO ───────────────────────────────────────────────── */}
      <Section id="areas" className="bg-ink-900 text-paper-100">
        <Container>
          <div className="max-w-3xl">
            <Reveal>
              <div className="text-[0.7rem] uppercase tracking-wider3 text-paper-100/60">
                As 6 áreas do planejamento financeiro
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial md:text-[3.2rem]">
                Uma visão <span className="italic text-gold-400">integrada</span> do patrimônio.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-paper-100/70">
                A certificação CFP organiza o planejamento financeiro em seis áreas
                interdependentes. Cada uma é tratada como peça de um mesmo sistema —
                uma decisão em investimentos conversa com proteção, tributação e
                sucessão. É essa visão integrada que sustenta o acompanhamento.
              </p>
            </Reveal>
          </div>

          <div className="mt-20 grid gap-px bg-paper-100/10 md:grid-cols-2 lg:grid-cols-3">
            {areas.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.04}>
                <div className="relative h-full bg-ink-900 p-10">
                  <div className="font-serif text-[0.9rem] text-gold-400">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-5 font-serif text-2xl tracking-editorial md:text-[1.6rem]">
                    {a.title}
                  </h3>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-paper-100/70">
                    {a.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── CONTEÚDO EM DESTAQUE ──────────────────────────────────────────── */}
      <Section id="conteudo">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Central de conteúdo"
              title={
                <>
                  Leitura de cenário e <span className="italic text-navy-800">educação aplicada.</span>
                </>
              }
              intro="Análises, artigos e materiais que circulam entre clientes e em mídia especializada. Nada de ruído — apenas o que sustenta uma decisão melhor."
            />
            <Reveal delay={0.15}>
              <Link
                href="/conteudo"
                className="shrink-0 self-start text-[0.78rem] uppercase tracking-wider2 text-ink-900 underline-offset-8 hover:underline md:self-end"
              >
                Ver todos os conteúdos →
              </Link>
            </Reveal>
          </div>

          {featuredArticles.length > 0 ? (
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {featuredArticles.map((article, i) => (
                <Reveal key={article._id} delay={i * 0.08}>
                  <Link
                    href={`/conteudo/${article.slug.current}`}
                    className="group block h-full"
                  >
                    <article className="flex h-full flex-col border-t border-ink-900/15 pt-8 transition-all duration-500 group-hover:border-ink-900/40">
                      <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
                        {article.category?.name ?? "Conteúdo"}
                      </div>
                      <h3 className="mt-5 font-serif text-[1.55rem] leading-[1.15] tracking-editorial text-ink-900 transition-colors group-hover:text-navy-800">
                        {article.title}
                      </h3>
                      <p className="mt-4 text-[0.95rem] leading-relaxed text-muted-600">
                        {article.excerpt}
                      </p>
                      <div className="mt-auto pt-8 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
                        {article.readingTimeMin
                          ? `Leitura · ${article.readingTimeMin} min`
                          : "Ler artigo →"}
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal>
              <div className="mt-16 border border-ink-900/10 bg-paper-200/40 px-8 py-12 text-center md:px-16">
                <p className="font-serif text-[1.4rem] leading-relaxed text-ink-900">
                  Acompanhe os próximos materiais na central de conteúdo.
                </p>
                <Link
                  href="/conteudo"
                  className="mt-6 inline-flex items-center gap-3 border border-ink-900 px-6 py-3 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-ink-900 hover:text-paper-50"
                >
                  Acessar central →
                </Link>
              </div>
            </Reveal>
          )}
        </Container>
      </Section>

      {/* ── MÍDIA / AUTORIDADE ─────────────────────────────────────────────── */}
      <Section id="midia" className="bg-paper-200/60">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              eyebrow="Mídia e autoridade"
              title={
                <>
                  Presença em <span className="italic text-navy-800">veículos de referência.</span>
                </>
              }
              intro="Comentários sobre cenário macroeconômico, política monetária, mercado de capitais e planejamento patrimonial em emissoras de TV, rádios e portais especializados."
            />
            <Reveal delay={0.15}>
              <a
                href={youtubeChannelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 self-start text-[0.78rem] uppercase tracking-wider2 text-ink-900 underline-offset-8 hover:underline md:self-end"
              >
                Acompanhar no YouTube →
              </a>
            </Reveal>
          </div>

          <div className="mt-16">
            <MediaGrid />
          </div>
        </Container>
      </Section>

      {/* ── CTA FINAL ──────────────────────────────────────────────────────── */}
      <Section className="bg-navy-900 text-paper-100">
        <Container>
          <div className="grid items-end gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Reveal>
                <div className="text-[0.7rem] uppercase tracking-wider3 text-paper-100/60">
                  Próximo passo
                </div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-6 font-serif text-4xl leading-[1.04] tracking-editorial md:text-[3.6rem]">
                  Uma conversa, sem compromisso,
                  <br />
                  para entender <span className="italic text-gold-400">se faz sentido.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-prose2 text-[1.02rem] leading-relaxed text-paper-100/75">
                  A primeira conversa é uma leitura honesta do seu cenário
                  atual — objetivos, estrutura, pontos cegos. Se houver
                  encaixe, seguimos. Se não, você sai com clareza mesmo assim.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <Reveal delay={0.15}>
                <Link
                  href="mailto:gustavo.mendonca@valorinvestimentos.com.br"
                  className="inline-flex items-center gap-3 bg-paper-100 px-8 py-5 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all hover:bg-gold-400"
                >
                  Agendar conversa
                  <span aria-hidden>→</span>
                </Link>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── INSTITUCIONAL — VALOR × XP ─────────────────────────────────────── */}
      <InstitutionalBanner />
    </>
  );
}
