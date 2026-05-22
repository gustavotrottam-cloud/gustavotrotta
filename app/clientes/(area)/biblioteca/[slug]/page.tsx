import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { sanityClient } from "@/sanity/lib/client";
import { articleBySlugQuery } from "@/sanity/lib/queries";
import { urlForImage } from "@/sanity/lib/image";

export const revalidate = 60;

type Article = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  body?: unknown[];
  heroImage?: { asset?: { _ref?: string }; alt?: string };
  publishedAt: string;
  readingTimeMin?: number;
  isResearch?: boolean;
  executiveSummary?: string;
  keyInsights?: string[];
  whyItMatters?: string;
  attachedPdf?: { asset?: { url?: string; originalFilename?: string } };
  tags?: string[];
  category?: { name: string; slug: string };
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const ptComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-5 text-[1.05rem] leading-[1.7] text-ink-800">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-12 font-serif text-[1.8rem] leading-[1.2] tracking-editorial text-ink-900 md:text-[2rem]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-9 font-serif text-[1.4rem] leading-[1.2] tracking-editorial text-ink-900">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-7 border-l-2 border-gold-500 pl-6 font-serif text-[1.25rem] italic leading-relaxed text-ink-700">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium text-ink-900">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-navy-800 underline underline-offset-4 hover:text-ink-900"
      >
        {children}
      </a>
    ),
  },
};

export default async function ArticleDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let article: Article | null = null;
  try {
    article = await sanityClient.fetch<Article | null>(articleBySlugQuery, {
      slug: params.slug,
    });
  } catch (err) {
    console.error("[article] fetch error:", err);
  }

  if (!article) notFound();

  const heroUrl = article.heroImage?.asset
    ? urlForImage(article.heroImage).width(1600).height(900).fit("crop").url()
    : null;

  return (
    <article className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <nav className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
        <Link href="/clientes/biblioteca" className="hover:text-ink-900">
          Biblioteca
        </Link>
        {article.category && (
          <>
            <span className="mx-2 text-muted-400">·</span>
            <Link
              href={`/clientes/biblioteca?categoria=${article.category.slug}`}
              className="hover:text-ink-900"
            >
              {article.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Header */}
      <header className="mt-6">
        {article.isResearch && (
          <div className="mb-4 inline-flex items-center gap-1.5 border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-[0.65rem] uppercase tracking-wider2 text-gold-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Relatório de Research
          </div>
        )}
        <h1 className="font-serif text-[2.4rem] leading-[1.1] tracking-editorial text-ink-900 md:text-[3rem]">
          {article.title}
        </h1>
        <p className="mt-5 text-[1.1rem] leading-relaxed text-muted-600 md:text-[1.2rem]">
          {article.excerpt}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-paper-300/70 pb-6 text-[0.78rem] text-muted-500">
          <span>{formatDate(article.publishedAt)}</span>
          {article.readingTimeMin && (
            <>
              <span aria-hidden>·</span>
              <span>{article.readingTimeMin} min de leitura</span>
            </>
          )}
          <span aria-hidden>·</span>
          <span className="uppercase tracking-wider2">Gustavo Trotta</span>
        </div>
      </header>

      {/* Hero image */}
      {heroUrl && (
        <div className="relative mt-10 aspect-[16/9] overflow-hidden">
          <Image
            src={heroUrl}
            alt={article.heroImage?.alt ?? article.title}
            fill
            sizes="(min-width: 1024px) 720px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Research structured block */}
      {article.isResearch &&
        (article.executiveSummary || article.keyInsights?.length || article.whyItMatters) && (
          <section className="mt-12 border border-ink-900/10 bg-paper-200/40 p-8 md:p-10">
            <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
              Resumo executivo
            </div>
            {article.executiveSummary && (
              <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-800">
                {article.executiveSummary}
              </p>
            )}
            {article.keyInsights && article.keyInsights.length > 0 && (
              <>
                <div className="mt-8 text-[0.7rem] uppercase tracking-wider2 text-gold-600">
                  Principais insights
                </div>
                <ol className="mt-3 space-y-3">
                  {article.keyInsights.map((insight, i) => (
                    <li key={i} className="flex gap-4 text-[1rem] leading-relaxed text-ink-800">
                      <span className="shrink-0 font-serif text-gold-500">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ol>
              </>
            )}
            {article.whyItMatters && (
              <>
                <div className="mt-8 text-[0.7rem] uppercase tracking-wider2 text-gold-600">
                  Por que importa
                </div>
                <p className="mt-3 text-[1.05rem] leading-relaxed text-ink-800">
                  {article.whyItMatters}
                </p>
              </>
            )}
          </section>
        )}

      {/* Body */}
      {article.body && Array.isArray(article.body) && article.body.length > 0 && (
        <div className="mt-12">
          <PortableText value={article.body as never} components={ptComponents} />
        </div>
      )}

      {/* PDF attachment */}
      {article.attachedPdf?.asset?.url && (
        <div className="mt-12 border border-ink-900/10 bg-paper-100 p-6">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
            Anexo
          </div>
          <a
            href={article.attachedPdf.asset.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 font-serif text-[1.1rem] text-ink-900 hover:text-navy-800"
          >
            {article.attachedPdf.asset.originalFilename ?? "Material em PDF"} →
          </a>
        </div>
      )}

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mt-12 flex flex-wrap gap-2 border-t border-paper-300/70 pt-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="bg-paper-200/60 px-3 py-1 text-[0.75rem] text-muted-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Back to list */}
      <div className="mt-16 border-t border-paper-300/70 pt-8">
        <Link
          href="/clientes/biblioteca"
          className="inline-flex items-center gap-2 text-[0.78rem] uppercase tracking-wider2 text-ink-900 hover:underline underline-offset-4"
        >
          <span aria-hidden>←</span>
          Voltar à biblioteca
        </Link>
      </div>
    </article>
  );
}
