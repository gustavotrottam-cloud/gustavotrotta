import { groq } from "next-sanity";

/** Todos os artigos/research publicados, ordenados por data desc. */
export const articlesQuery = groq`*[_type == "article"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  heroImage,
  publishedAt,
  readingTimeMin,
  isResearch,
  "category": category->{name, "slug": slug.current, area},
}`;

/** Artigos filtrados por área (mercado / biblioteca / ambos). */
export const articlesByAreaQuery = groq`*[
  _type == "article"
  && (category->area == $area || category->area == "ambos")
] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  heroImage,
  publishedAt,
  readingTimeMin,
  isResearch,
  "category": category->{name, "slug": slug.current},
}`;

/** Apenas relatórios de research. */
export const researchQuery = groq`*[_type == "article" && isResearch == true] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  heroImage,
  executiveSummary,
  keyInsights,
  whyItMatters,
  publishedAt,
  "category": category->{name, "slug": slug.current},
}`;

/** Artigo completo por slug. */
export const articleBySlugQuery = groq`*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  excerpt,
  body,
  heroImage,
  publishedAt,
  readingTimeMin,
  isResearch,
  executiveSummary,
  keyInsights,
  whyItMatters,
  attachedPdf{asset->{url, originalFilename}},
  tags,
  "category": category->{name, "slug": slug.current, area},
}`;

/** Vídeos. */
export const videosQuery = groq`*[_type == "video"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  excerpt,
  youtubeId,
  channel,
  program,
  durationMin,
  publishedAt,
  "category": category->{name, "slug": slug.current},
}`;

/** Categorias por área (filtragem usada na biblioteca privada). */
export const categoriesByAreaQuery = groq`*[
  _type == "category" && (area == $area || area == "ambos")
] | order(displayOrder asc, name asc) {
  _id, name, "slug": slug.current, description, area
}`;

/** Todas as categorias (usado na central pública de conteúdo). */
export const allCategoriesQuery = groq`*[_type == "category"] | order(displayOrder asc, name asc) {
  _id, name, "slug": slug.current, description, area
}`;

/** Eventos futuros. */
export const upcomingEventsQuery = groq`*[_type == "event" && startsAt >= now()] | order(startsAt asc) {
  _id,
  title,
  slug,
  description,
  kind,
  startsAt,
  durationMin,
  location,
  meetingUrl,
}`;

/** Eventos passados com gravação. */
export const pastEventsWithRecordingQuery = groq`*[
  _type == "event" && startsAt < now() && defined(recordingUrl)
] | order(startsAt desc) {
  _id, title, slug, description, startsAt, recordingUrl, materialsUrl
}`;
