import Link from "next/link";
import Container from "./Container";
import Section from "./Section";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import {
  socialChannels,
  instagramPosts,
  linkedinPosts,
  type SocialPost,
} from "@/lib/social";

type Article = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  readingTimeMin?: number;
  category?: { name: string; slug: string };
};

/**
 * EmCirculacao — bloco vivo de 3 colunas (Leitura semanal · Instagram ·
 * LinkedIn). Substitui a antiga seção #conteudo (que listava 3 artigos)
 * por uma visão multi-canal de presença e atividade intelectual.
 *
 * Os artigos são server-fetched no page.tsx e passados como prop. Os
 * posts de Instagram/LinkedIn estão em `lib/social.ts` — atualizar lá
 * conforme novas postagens.
 */
export default function EmCirculacao({ articles }: { articles: Article[] }) {
  const featured = articles.slice(0, 2);

  return (
    <Section id="em-circulacao" className="bg-paper-200/40">
      <Container>
        <SectionHeading
          eyebrow="Em circulação"
          title={
            <>
              Leitura de cenário,{" "}
              <span className="italic text-navy-800">em todos os canais.</span>
            </>
          }
          intro="Artigos longos, posts e análises curtas — cada canal tem um ritmo. O que circula entre clientes circula também publicamente."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-10">
          {/* ── Coluna 1: Leitura semanal ──────────────────────────── */}
          <Column
            label="Leitura semanal"
            cadence="Artigos editoriais"
            ctaLabel="Ver todos os artigos"
            ctaHref="/conteudo"
            icon={<IconArticle />}
          >
            {featured.length > 0 ? (
              featured.map((a, i) => (
                <ArticleCard
                  key={a._id}
                  article={a}
                  delay={0.1 + i * 0.06}
                />
              ))
            ) : (
              <EmptyState
                message="Acompanhe os próximos materiais na central."
                href="/conteudo"
                cta="Acessar central"
              />
            )}
          </Column>

          {/* ── Coluna 2: Instagram ────────────────────────────────── */}
          <Column
            label="Instagram"
            cadence={socialChannels.instagram.cadence}
            ctaLabel={`Acompanhar ${socialChannels.instagram.handle}`}
            ctaHref={socialChannels.instagram.url}
            external
            icon={<IconInstagram />}
          >
            {instagramPosts.map((p, i) => (
              <SocialCard key={p.excerpt} post={p} delay={0.1 + i * 0.06} />
            ))}
          </Column>

          {/* ── Coluna 3: LinkedIn ─────────────────────────────────── */}
          <Column
            label="LinkedIn"
            cadence={socialChannels.linkedin.cadence}
            ctaLabel={`Acompanhar ${socialChannels.linkedin.handle}`}
            ctaHref={socialChannels.linkedin.url}
            external
            icon={<IconLinkedIn />}
          >
            {linkedinPosts.map((p, i) => (
              <SocialCard key={p.excerpt} post={p} delay={0.1 + i * 0.06} />
            ))}
          </Column>
        </div>
      </Container>
    </Section>
  );
}

/* ── Sub-components ──────────────────────────────────────────────── */

function Column({
  label,
  cadence,
  ctaLabel,
  ctaHref,
  external = false,
  icon,
  children,
}: {
  label: string;
  cadence: string;
  ctaLabel: string;
  ctaHref: string;
  external?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const ctaProps = external
    ? { target: "_blank", rel: "noopener noreferrer" as const }
    : {};
  return (
    <Reveal>
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-ink-900/15 pb-4">
          <span className="text-ink-900">{icon}</span>
          <div className="flex-1">
            <div className="font-serif text-[1.05rem] leading-none tracking-editorial text-ink-900">
              {label}
            </div>
            <div className="mt-1 text-[0.65rem] uppercase tracking-wider2 text-muted-500">
              {cadence}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-1 flex-col gap-8">{children}</div>

        <div className="mt-8 pt-6 border-t border-ink-900/10">
          <Link
            href={ctaHref}
            {...ctaProps}
            className="text-[0.72rem] uppercase tracking-wider2 text-ink-900 underline-offset-8 hover:underline"
          >
            {ctaLabel} →
          </Link>
        </div>
      </div>
    </Reveal>
  );
}

function ArticleCard({
  article,
  delay,
}: {
  article: Article;
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <Link
        href={`/conteudo/${article.slug.current}`}
        className="group block"
      >
        <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-600">
          {article.category?.name ?? "Artigo"}
        </div>
        <h3 className="mt-3 font-serif text-[1.2rem] leading-[1.2] tracking-editorial text-ink-900 transition-colors group-hover:text-navy-800">
          {article.title}
        </h3>
        <p className="mt-3 text-[0.88rem] leading-relaxed text-muted-600 line-clamp-3">
          {article.excerpt}
        </p>
        {article.readingTimeMin && (
          <div className="mt-3 text-[0.65rem] uppercase tracking-wider2 text-muted-500">
            Leitura · {article.readingTimeMin} min
          </div>
        )}
      </Link>
    </Reveal>
  );
}

function SocialCard({ post, delay }: { post: SocialPost; delay: number }) {
  return (
    <Reveal delay={delay}>
      <a
        href={post.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
          {post.date}
        </div>
        <p className="mt-3 font-serif text-[1.05rem] leading-[1.3] tracking-editorial text-ink-900 transition-colors group-hover:text-navy-800">
          {post.excerpt}
        </p>
      </a>
    </Reveal>
  );
}

function EmptyState({
  message,
  href,
  cta,
}: {
  message: string;
  href: string;
  cta: string;
}) {
  return (
    <Reveal delay={0.1}>
      <div className="border border-ink-900/10 bg-paper-100 px-6 py-8">
        <p className="font-serif text-[1rem] leading-relaxed text-ink-900">
          {message}
        </p>
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-wider2 text-ink-900 underline-offset-8 hover:underline"
        >
          {cta} →
        </Link>
      </div>
    </Reveal>
  );
}

/* ── Ícones (svg inline, peso muito leve) ────────────────────────── */

function IconArticle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M5 4h11l3 3v13H5z" />
      <path d="M8 10h8M8 14h8M8 18h5" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.3" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM3 9.5h4V21H3V9.5zm6.5 0h3.8v1.62h.05a4.2 4.2 0 013.78-2.08c4.04 0 4.79 2.66 4.79 6.12V21h-4v-5.18c0-1.24-.02-2.84-1.73-2.84-1.74 0-2 1.35-2 2.75V21h-3.99V9.5z" />
    </svg>
  );
}
