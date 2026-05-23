/** Bloco do corpo do artigo no formato Portable Text (subset). */
export type ArticleBlock = {
  style: "normal" | "h2" | "h3" | "blockquote";
  text: string;
  /** Opcional: marca o trecho como link inline. */
  link?: { text: string; href: string };
};

/** Artigo gerado pela IA. Ainda não é o documento Sanity — ver toSanityArticle. */
export type GeneratedArticle = {
  title: string;
  slug: string;
  excerpt: string;
  categorySlug: string;
  tags: string[];
  readingTimeMin: number;
  body: ArticleBlock[];
  heroPrompt: string;
  heroAlt: string;
};

export type GenerationResult = {
  ok: boolean;
  videoId?: string;
  videoUrl?: string;
  videoTitle?: string;
  durationSec?: number;
  generatedCount?: number;
  draftIds?: string[];
  error?: string;
};
