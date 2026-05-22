import Image from "next/image";
import Reveal from "./Reveal";
import Container from "./Container";

/**
 * Institutional strip: Valor Investimentos × XP affiliation.
 * Uses the cropped Valor banner (slogan removed) as the visual anchor and
 * a discrete editorial caption reinforcing the affiliation and footprint.
 */
export default function InstitutionalBanner() {
  return (
    <section className="relative bg-ink-900 py-20 text-paper-100">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="text-[0.7rem] uppercase tracking-wider3 text-paper-100/55">
                Estrutura institucional
              </div>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-5 font-serif text-3xl leading-[1.15] tracking-editorial md:text-[2.1rem]">
                Sócio da{" "}
                <span className="italic text-gold-400">Valor Investimentos</span>
                , escritório credenciado à XP Investimentos.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 max-w-prose2 text-[0.98rem] leading-relaxed text-paper-100/70">
                Toda operação é executada pela infraestrutura da XP Investimentos,
                através do escritório credenciado Valor Investimentos, com
                atuação em seis estados do Brasil.
              </p>
            </Reveal>
            <Reveal delay={0.13}>
              <a
                href="https://valorinvestimentos.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-3 text-[0.75rem] uppercase tracking-wider2 text-paper-100/85 underline-offset-8 transition-colors hover:text-gold-400 hover:underline"
              >
                Conheça a Valor Investimentos
                <span aria-hidden>→</span>
              </a>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[0.72rem] uppercase tracking-wider2 text-paper-100/60">
                <span>ES</span>
                <span aria-hidden>·</span>
                <span>SP</span>
                <span aria-hidden>·</span>
                <span>RJ</span>
                <span aria-hidden>·</span>
                <span>MG</span>
                <span aria-hidden>·</span>
                <span>DF</span>
                <span aria-hidden>·</span>
                <span>GO</span>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <Reveal direction="left" delay={0.1}>
              <div className="relative aspect-[728/282] overflow-hidden">
                <Image
                  src="/valor-xp-banner.jpg"
                  alt="Valor Investimentos × XP — atuação em ES, SP, RJ, MG, DF e GO"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
                {/* subtle integration overlay so the banner reads as part of the section */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink-900/30 via-transparent to-transparent" />
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
