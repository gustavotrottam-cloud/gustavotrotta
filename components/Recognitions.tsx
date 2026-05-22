import Image from "next/image";
import Reveal from "./Reveal";
import Container from "./Container";
import Section from "./Section";

const awards = [
  {
    label: "Melhor Assessor",
    detail: "Unidade São Paulo · Valor Investimentos",
    year: "2024",
  },
  {
    label: "Maior Captador",
    detail: "Unidade São Paulo · Valor Investimentos",
    year: "2024",
  },
];

/**
 * Recognition section — pairs the real award-plaques photo (taken at the
 * Valor São Paulo office) with editorial cards listing each prize.
 *
 * Two variants:
 *  - "light" + non-compact (Sobre): full description paragraph
 *  - "light" + compact (Home):       teaser version, no description
 *  - "dark":                         inverted palette (kept for future reuse)
 */
export default function Recognitions({
  variant = "light",
  compact = false,
}: {
  variant?: "light" | "dark";
  compact?: boolean;
}) {
  const dark = variant === "dark";
  const eyebrowClr = dark ? "text-paper-100/60" : "text-muted-500";
  const headingClr = dark ? "text-paper-100" : "text-ink-900";
  const bodyClr = dark ? "text-paper-100/70" : "text-muted-600";
  const cardBg = dark ? "bg-ink-800" : "bg-paper-100";
  const cardBorder = dark ? "border-paper-100/10" : "border-ink-900/10";
  const goldText = dark ? "text-gold-400" : "text-gold-600";

  return (
    <Section
      className={`${
        dark ? "bg-ink-900 text-paper-100" : "bg-paper-200/60 text-ink-900"
      } ${compact ? "py-20 md:py-24" : ""}`}
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ── Photo of the actual plaques ─────────────────────────────── */}
          <div className="lg:col-span-6">
            <Reveal>
              <figure className="relative">
                <div className="relative aspect-[3/4] overflow-hidden bg-ink-800 shadow-xl shadow-ink-900/15">
                  <Image
                    src="/premios-2024.jpg"
                    alt="Placas dos prêmios Melhor Assessor e Maior Captador da unidade São Paulo da Valor Investimentos, ano 2024, com a vista da cidade de São Paulo ao fundo"
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                  {/* subtle vignette so the photo integrates with the section */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_55%,_rgba(0,0,0,0.35)_100%)]" />
                  {/* editorial corner marks */}
                  <span className="pointer-events-none absolute left-4 top-4 h-3 w-3 border-l border-t border-paper-100/55" />
                  <span className="pointer-events-none absolute right-4 top-4 h-3 w-3 border-r border-t border-paper-100/55" />
                  <span className="pointer-events-none absolute left-4 bottom-4 h-3 w-3 border-l border-b border-paper-100/55" />
                  <span className="pointer-events-none absolute right-4 bottom-4 h-3 w-3 border-r border-b border-paper-100/55" />
                </div>
                <figcaption
                  className={`mt-4 text-[0.72rem] uppercase tracking-wider2 ${eyebrowClr}`}
                >
                  Placas de premiação · Valor São Paulo · 2024
                </figcaption>
              </figure>
            </Reveal>
          </div>

          {/* ── Text + award cards ──────────────────────────────────────── */}
          <div className="flex flex-col justify-center lg:col-span-6">
            <Reveal>
              <div
                className={`text-[0.7rem] uppercase tracking-wider3 ${eyebrowClr}`}
              >
                Reconhecimentos
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2
                className={`mt-5 font-serif text-3xl leading-[1.08] tracking-editorial md:text-[2.6rem] ${headingClr}`}
              >
                Premiado pela{" "}
                <span className={`italic ${dark ? "text-gold-400" : "text-gold-500"}`}>
                  Valor Investimentos
                </span>
                .
              </h2>
            </Reveal>
            {!compact && (
              <Reveal delay={0.1}>
                <p
                  className={`mt-6 max-w-prose2 text-[1rem] leading-relaxed ${bodyClr}`}
                >
                  Em 2024, ano da promoção a sócio da Valor Investimentos, recebi
                  dois reconhecimentos internos da unidade São Paulo: Melhor
                  Assessor e Maior Captador. As placas — fotografadas acima, com
                  a vista da cidade — sintetizam o critério que orienta o
                  trabalho: desempenho mensurável e confiança dos clientes.
                </p>
              </Reveal>
            )}

            <ul className="mt-10 grid gap-5">
              {awards.map((a, i) => (
                <Reveal key={a.label} delay={0.15 + i * 0.08}>
                  <li
                    className={`relative overflow-hidden ${cardBg} border ${cardBorder} px-7 py-7 md:px-8`}
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold-400 via-gold-500 to-gold-600" />
                    <div className="flex items-baseline justify-between gap-4">
                      <div
                        className={`text-[0.7rem] uppercase tracking-wider2 ${goldText}`}
                      >
                        Prêmio · {a.year}
                      </div>
                    </div>
                    <div
                      className={`mt-3 font-serif text-[1.9rem] leading-[1.06] tracking-editorial md:text-[2.1rem] ${headingClr}`}
                    >
                      {a.label}
                    </div>
                    <div className={`mt-2 text-[0.88rem] leading-relaxed ${bodyClr}`}>
                      {a.detail}
                    </div>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
