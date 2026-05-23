import type { MetadataRoute } from "next";
import { sanityClient } from "@/sanity/lib/client";
import { articleSlugsQuery } from "@/sanity/lib/queries";

const BASE_URL = "https://gustavotrotta.com.br";

// Regenera o sitemap a cada hora — artigos novos aparecem rapidamente
// sem martelar o Sanity a cada request de bot.
export const revalidate = 3600;

type ArticleSlug = {
  slug: string;
  publishedAt?: string;
  _updatedAt?: string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/conteudo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/planejamento-financeiro`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/politica-de-privacidade`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await sanityClient.fetch<ArticleSlug[]>(articleSlugsQuery);
    articleRoutes = articles.map((a) => ({
      url: `${BASE_URL}/conteudo/${a.slug}`,
      lastModified: a._updatedAt
        ? new Date(a._updatedAt)
        : a.publishedAt
          ? new Date(a.publishedAt)
          : new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (err) {
    // Sanity offline ou env var ausente — sitemap mantém só as rotas estáticas.
    console.error("[sitemap] Sanity fetch error:", err);
  }

  return [...staticRoutes, ...articleRoutes];
}
