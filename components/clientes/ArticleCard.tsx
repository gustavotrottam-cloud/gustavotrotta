import Link from "next/link";
import Image from "next/image";
import { urlForImage } from "@/sanity/lib/image";

type SanityImage = {
  asset?: { _ref?: string; _id?: string };
  alt?: string;
} | undefined;

export type ArticleCardData = {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt: string;
  heroImage?: SanityImage;
  publishedAt: string;
  readingTimeMin?: number;
  isResearch?: boolean;
  category?: { name: string; slug: string };
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ArticleCard({
  article,
  basePath = "/clientes/biblioteca",
}: {
  article: ArticleCardData;
  /** Caminho-base do link do card. Use "/conteudo" para a versão pública. */
  basePath?: string;
}) {
  const href = `${basePath}/${article.slug.current}`;
  const imageUrl = article.heroImage?.asset
    ? urlForImage(article.heroImage).width(800).height(500).fit("crop").url()
    : null;

  return (
    <Link href={href} className="group block h-full">
      <article className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={article.heroImage?.alt ?? article.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 ease-editorial group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-800 via-navy-900 to-ink-700">
              <span className="font-serif text-5xl text-paper-100/15">GT</span>
            </div>
          )}
          {article.isResearch && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 bg-ink-900/90 px-3 py-1.5 text-[0.65rem] uppercase tracking-wider2 text-gold-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
              Research
            </span>
          )}
        </div>

        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex items-baseline justify-between gap-4 text-[0.68rem] uppercase tracking-wider2">
            <span className="text-gold-600">
              {article.category?.name ?? "Geral"}
            </span>
            <span className="text-muted-500">
              {formatDate(article.publishedAt)}
            </span>
          </div>

          <h3 className="mt-3 font-serif text-[1.4rem] leading-[1.15] tracking-editorial text-ink-900 transition-colors duration-300 group-hover:text-navy-800">
            {article.title}
          </h3>

          <p className="mt-3 text-[0.92rem] leading-relaxed text-muted-600 line-clamp-3">
            {article.excerpt}
          </p>

          <div className="mt-5 flex items-center gap-2 text-[0.7rem] uppercase tracking-wider2 text-ink-900">
            <span>Ler artigo</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            {article.readingTimeMin && (
              <span className="ml-auto text-muted-500 normal-case tracking-normal">
                {article.readingTimeMin} min
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
