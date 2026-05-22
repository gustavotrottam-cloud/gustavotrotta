import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import Portrait from "@/components/Portrait";
import Recognitions from "@/components/Recognitions";

export const metadata: Metadata = {
  title: "Sobre — Gustavo Trotta",
  description:
    "Trajetória, formação e filosofia de trabalho de Gustavo Trotta, assessor de investimentos e sócio da Valor Investimentos / XP.",
};

const trajectory = [
  {
    year: "2017",
    title: "Bacharel em Engenharia Mecânica · UFF",
    body: "Graduação na Universidade Federal Fluminense, formação que moldou o método de trabalho: ler o sistema, mapear variáveis e só então propor a intervenção.",
  },
  {
    year: "2017 – 2022",
    title: "Engenheiro em multinacional automotiva francesa",
    body: "Cinco anos atuando em ambiente de engenharia industrial de alta complexidade, lidando com tomada de decisão sob restrições reais e processos de melhoria contínua.",
  },
  {
    year: "2022",
    title: "Ingresso no mercado financeiro · Associado da Valor Investimentos",
    body: "Transição de carreira motivada pelo interesse em alocação patrimonial, planejamento e cenário macroeconômico. Entrada na Valor Investimentos como associado, dando início à dedicação integral à assessoria patrimonial.",
  },
  {
    year: "2024",
    title: "Sócio da Valor Investimentos e certificação CFP",
    body: "Promoção a sócio da Valor Investimentos — escritório credenciado da XP — e obtenção do CFP (Certified Financial Planner), a certificação mais reconhecida internacionalmente em planejamento financeiro.",
  },
  {
    year: "2024",
    title: "Premiações na unidade São Paulo da Valor",
    body: "Reconhecimento como Melhor Assessor e Maior Captador da unidade São Paulo da Valor Investimentos no ano da promoção a sócio.",
  },
  {
    year: "2026",
    title: "Bacharel em Finanças Corporativas · Ohio University",
    body: "Formação internacional em Finanças Corporativas pela Ohio University, aprofundando a leitura de fundamentos, governança e estratégia patrimonial em padrão global.",
  },
  {
    year: "Hoje",
    title: "Educador e estrategista",
    body: "Atendimento consultivo a famílias e profissionais em paralelo a participações regulares em emissoras de TV nacionais e produção de conteúdo educacional.",
  },
];

const credentials = [
  "CFP — Certified Financial Planner (Planejador Financeiro Certificado), 2024",
  "Bacharel em Finanças Corporativas · Ohio University, 2026",
  "Engenharia Mecânica · Universidade Federal Fluminense",
  "Assessor de investimentos credenciado pela ANCORD",
  "Sócio da Valor Investimentos — escritório credenciado XP",
];

const principles = [
  {
    n: "I",
    title: "Método antes de opinião",
    body: "Toda decisão patrimonial parte de um processo replicável: diagnóstico, objetivos, estrutura e revisão. Opinião sem método é palpite.",
  },
  {
    n: "II",
    title: "O cliente entende o próprio patrimônio",
    body: "Se uma estrutura não pode ser explicada em uma conversa, ela está mal desenhada ou mal compreendida. Clareza é parte da entrega.",
  },
  {
    n: "III",
    title: "Tempo é a variável principal",
    body: "Juros compostos, tributação, sucessão — todas as decisões grandes se resolvem no tempo. O curto prazo é, na prática, uma distração.",
  },
  {
    n: "IV",
    title: "Independência editorial",
    body: "Conteúdo, leitura de cenário e recomendações são feitos com a mesma honestidade que se usa para a própria família.",
  },
];

const presence = [
  {
    kind: "Entrevistas em TV",
    body: "Aparições recorrentes em CNN Brasil, Jovem Pan News, Record News, VEJA+, Money Times e Jornal da Record.",
  },
  {
    kind: "Palestras",
    body: "Eventos corporativos, universidades e encontros privados de investidores.",
  },
  {
    kind: "Conteúdos",
    body: "Vídeos, artigos e relatórios de cenário circulando entre clientes e leitores.",
  },
  {
    kind: "Encontros",
    body: "Reuniões consultivas com clientes individuais e grupos familiares.",
  },
];

export default function SobrePage() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <Section className="pt-40 md:pt-48 pb-16">
        <Container>
          <div className="grid items-end gap-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="eyebrow">Sobre · Gustavo Trotta</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.02] tracking-editorial text-ink-900 md:text-[4rem] lg:text-[4.6rem]">
                  Um método consultivo, <span className="italic text-navy-800">construído com tempo.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 max-w-prose2 text-[1.08rem] leading-relaxed text-muted-600 md:text-[1.15rem]">
                  Trajetória, formação, certificações e a filosofia que orienta cada
                  conversa com cliente. Sem retórica de vendas, sem promessas — apenas
                  o que tem sustentado relações de longo prazo.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-5">
              <Reveal direction="left" delay={0.1}>
                <Portrait
                  src="/gustavo-trotta-sobre.jpg"
                  alt="Gustavo Trotta — retrato profissional"
                  caption="Retrato · Estúdio"
                  priority
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── TRAJETÓRIA ─────────────────────────────────────────────────────── */}
      <Section className="bg-paper-200/60">
        <Container>
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="eyebrow">Trajetória</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial text-ink-900 md:text-[2.7rem]">
                  Da engenharia ao patrimônio.
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-[1rem] leading-relaxed text-muted-600">
                  Uma sequência de escolhas conectadas por um único critério:
                  profundidade. Aprender a fundo antes de praticar, praticar antes
                  de ensinar.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <ol className="relative border-l border-ink-900/15">
                {trajectory.map((t, i) => (
                  <Reveal key={t.year} delay={i * 0.06}>
                    <li className="relative pl-10 pb-12 last:pb-0">
                      <span className="absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full bg-gold-500" />
                      <div className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
                        {t.year}
                      </div>
                      <h3 className="mt-2 font-serif text-2xl tracking-editorial text-ink-900 md:text-[1.75rem]">
                        {t.title}
                      </h3>
                      <p className="mt-3 max-w-prose2 text-[0.98rem] leading-relaxed text-muted-600">
                        {t.body}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── FORMAÇÃO E CREDENCIAIS ─────────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="eyebrow">Formação · Credenciais</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial text-ink-900 md:text-[2.7rem]">
                  Rigor técnico como <span className="italic text-navy-800">premissa.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-prose2 text-[1rem] leading-relaxed text-muted-600">
                  Cada certificação é uma camada a mais de profundidade — não um
                  selo de marketing. A lista existe porque o trabalho de assessorar
                  patrimônio exige preparo formal e contínuo.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
                {credentials.map((c, i) => (
                  <Reveal key={c} delay={i * 0.05}>
                    <li className="flex items-start gap-6 py-6">
                      <span className="mt-1 font-serif text-[0.95rem] text-gold-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.02rem] text-ink-900">{c}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── RECONHECIMENTOS ────────────────────────────────────────────────── */}
      <Recognitions variant="light" />

      {/* ── FILOSOFIA DE TRABALHO ──────────────────────────────────────────── */}
      <Section className="bg-ink-900 text-paper-100">
        <Container>
          <div className="max-w-3xl">
            <Reveal>
              <div className="text-[0.7rem] uppercase tracking-wider3 text-paper-100/60">
                Filosofia de trabalho
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial md:text-[3.2rem]">
                Quatro princípios <span className="italic text-gold-400">não negociáveis.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 text-[1.02rem] leading-relaxed text-paper-100/75">
                Eles não estão aqui porque soam bem. Estão porque, na prática, são
                o que tem feito diferença em relações que já passaram por mais de
                um ciclo de mercado.
              </p>
            </Reveal>
          </div>

          <div className="mt-20 grid gap-x-12 gap-y-14 md:grid-cols-2">
            {principles.map((p, i) => (
              <Reveal key={p.n} delay={i * 0.06}>
                <div className="flex gap-8">
                  <div className="shrink-0 font-serif text-2xl text-gold-400">
                    {p.n}
                  </div>
                  <div>
                    <h3 className="font-serif text-[1.7rem] tracking-editorial">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-[0.98rem] leading-relaxed text-paper-100/75">
                      {p.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── COMO TRABALHO COM CLIENTES ─────────────────────────────────────── */}
      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="eyebrow">Forma de acompanhamento</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial text-ink-900 md:text-[2.7rem]">
                  Cadência de <span className="italic text-navy-800">conversas reais.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 text-[1rem] leading-relaxed text-muted-600">
                  O acompanhamento não vive de relatórios automáticos. Vive de
                  conversas regulares — calibradas pelo momento do cliente e pelo
                  momento do mercado.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <div className="grid gap-px bg-ink-900/10 sm:grid-cols-2">
                {[
                  {
                    n: "01",
                    title: "Diagnóstico inicial",
                    body: "Uma conversa de leitura completa: objetivos, estrutura atual, riscos identificados e pontos cegos.",
                  },
                  {
                    n: "02",
                    title: "Desenho da estratégia",
                    body: "Estrutura escrita, compreensível, com horizonte e critérios claros de revisão. Sem caixa-preta.",
                  },
                  {
                    n: "03",
                    title: "Implementação consultiva",
                    body: "Cada movimento é discutido antes de executado. Você sai do telefone sabendo o que comprou e por quê.",
                  },
                  {
                    n: "04",
                    title: "Revisões periódicas",
                    body: "Encontros marcados em cadência clara para revisar cenário, ajustar e — quando necessário — não fazer nada.",
                  },
                ].map((s, i) => (
                  <Reveal key={s.n} delay={i * 0.05}>
                    <div className="bg-paper-100 p-10">
                      <div className="font-serif text-[0.9rem] text-gold-500">{s.n}</div>
                      <h3 className="mt-4 font-serif text-2xl tracking-editorial text-ink-900">
                        {s.title}
                      </h3>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-600">
                        {s.body}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── PRESENÇA / AUTORIDADE ──────────────────────────────────────────── */}
      <Section className="bg-paper-200/60">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="eyebrow">Presença pública</div>
              </Reveal>
              <Reveal delay={0.05}>
                <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial text-ink-900 md:text-[2.7rem]">
                  Educação como <span className="italic text-navy-800">parte do ofício.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-prose2 text-[1rem] leading-relaxed text-muted-600">
                  Falar em público, escrever, conceder entrevistas — tudo isso
                  obriga a pensar com mais clareza e a expor o raciocínio à
                  crítica. Por isso é parte do trabalho, não um acessório dele.
                </p>
              </Reveal>
            </div>
            <div className="lg:col-span-7">
              <ul className="grid gap-px bg-paper-300/70 sm:grid-cols-2">
                {presence.map((p, i) => (
                  <Reveal key={p.kind} delay={i * 0.05}>
                    <li className="bg-paper-100 p-8">
                      <div className="text-[0.72rem] uppercase tracking-wider2 text-gold-600">
                        {p.kind}
                      </div>
                      <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-900">
                        {p.body}
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
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
                <h2 className="mt-6 font-serif text-4xl leading-[1.04] tracking-editorial md:text-[3.4rem]">
                  Vamos conversar sobre o seu <span className="italic text-gold-400">cenário atual.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-prose2 text-[1rem] leading-relaxed text-paper-100/75">
                  Uma reunião inicial, sem compromisso, para entender objetivos,
                  estrutura e se há encaixe para um acompanhamento de longo prazo.
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
    </>
  );
}
