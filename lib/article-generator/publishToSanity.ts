import { randomUUID } from "node:crypto";
import type { GeneratedArticle, ArticleBlock } from "./types";

/** Converte um ArticleBlock (formato da IA) em um Portable Text block do Sanity. */
function toPortableTextBlock(block: ArticleBlock) {
  const k = () => randomUUID().slice(0, 12);
  if (block.link) {
    // Bloco com link inline: precisamos quebrar o texto pra inserir o link.
    // Pra simplificar, assumimos que `text` é o "lead" antes do link e `link.text` é o trecho linkado.
    const linkKey = k();
    return {
      _type: "block",
      _key: k(),
      style: block.style,
      markDefs: [{ _key: linkKey, _type: "link", href: block.link.href }],
      children: [
        { _type: "span", _key: k(), text: block.text, marks: [] },
        { _type: "span", _key: k(), text: block.link.text, marks: [linkKey] },
        { _type: "span", _key: k(), text: ".", marks: [] },
      ],
    };
  }
  return {
    _type: "block",
    _key: k(),
    style: block.style,
    markDefs: [],
    children: [{ _type: "span", _key: k(), text: block.text, marks: [] }],
  };
}

/** Resolve slug de categoria pro _id real do Sanity (cat-{slug}). */
function categoryRef(slug: string) {
  return { _type: "reference", _ref: `cat-${slug}` };
}

export async function createDraftArticles(opts: {
  articles: GeneratedArticle[];
  /** Map articleSlug -> sanity asset _id (pra heroImage). Pode ser parcial. */
  heroAssetBySlug?: Record<string, string>;
  /** Alt text por slug (pra acessibilidade do heroImage). */
  heroAltBySlug?: Record<string, string>;
  sanityProject: string;
  sanityDataset: string;
  sanityToken: string;
}): Promise<{ draftIds: string[] }> {
  const now = new Date().toISOString();

  const mutations = opts.articles.map((a) => {
    const draftId = `drafts.${randomUUID()}`;
    const heroAsset = opts.heroAssetBySlug?.[a.slug];
    const heroAlt = opts.heroAltBySlug?.[a.slug] ?? a.heroAlt;

    const doc: Record<string, unknown> = {
      _id: draftId,
      _type: "article",
      title: a.title,
      slug: { _type: "slug", current: a.slug },
      excerpt: a.excerpt,
      category: categoryRef(a.categorySlug),
      body: a.body.map(toPortableTextBlock),
      tags: a.tags,
      readingTimeMin: a.readingTimeMin,
      publishedAt: now,
      isResearch: false,
    };

    if (heroAsset) {
      doc.heroImage = {
        _type: "image",
        asset: { _type: "reference", _ref: heroAsset },
        alt: heroAlt,
      };
    }

    return { create: doc };
  });

  const resp = await fetch(
    `https://${opts.sanityProject}.api.sanity.io/v2024-01-01/data/mutate/${opts.sanityDataset}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.sanityToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mutations }),
    }
  );
  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(
      `Sanity mutate falhou (${resp.status}): ${JSON.stringify(data)}`
    );
  }
  return {
    draftIds: mutations.map((m) => (m.create as { _id: string })._id),
  };
}
