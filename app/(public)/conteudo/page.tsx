import Link from "next/link";
import type { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";
import ArticleCard, { type ArticleCardData } from "@/components/clientes/ArticleCard";
import { sanityClient } from "@/sanity/lib/client";
import { articlesQuery, allCategoriesQuery } from "@/sanity/lib/queries";

export const metadata: Metadata = {
  title: "Conteúdo — Gustavo Trotta",
  description:
    "Cenário macroeconômico, análises de mercado, planejamento patrimonial e tributação. Conteúdo editorial sem ruído, voltado a decisões de longo prazo.",
};

export const revalidate = 60;

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export default async function ConteudoPage({
  searchParams,
}: {
  searchParams: { categoria?: string };
}) {
  const activeSlug = searchParams.categoria;

  let articles: ArticleCardData[] = [];
  let categories: Category[] = [];
  let fetchError: string | null = null;

  try {
    [articles, categories] = await Promise.all([
      sanityClient.fetch<ArticleCardData[]>(articlesQuery),
      sanityClient.fetch<Category[]>(allCategoriesQuery),
    ]);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[conteudo] Sanity fetch error:", err);
  }

  // Mostra só categorias que têm pelo menos 1 artigo
  const articleCountByCategory = articles.reduce<Record<string, number>>(
    (acc, a) => {
      const s = a.category?.slug;
      if (s) acc[s] = (acc[s] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const visibleCategories = categories.filter(
    (c) => (articleCountByCategory[c.slug] ?? 0) > 0
  );

  const visibleArticles = activeSlug
    ? articles.filter((a) => a.category?.slug === activeSlug)
    : articles;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Section className="pt-40 md:pt-48 pb-12">
        <Container>
          <div className="max-w-3xl">
            <div className="eyebrow">Conteúdo</div>
            <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.02] tracking-editorial text-ink-900 md:text-[3.6rem]">
              Leitura de cenário e{" "}
              <span className="italic text-navy-800">educação aplicada.</span>
            </h1>
            <p className="mt-8 max-w-prose2 text-[1.05rem] leading-relaxed text-muted-600 md:text-[1.15rem]">
              Análises, artigos e materiais que sustentam decisões de patrimônio
              no longo prazo. Sem ruído, sem promessa de retorno — apenas o que
              tem orientado minhas conversas com clientes.
            </p>
          </div>
        </Container>
      </Section>

      {/* ── FILTROS + LISTA ──────────────────────────────────────────────── */}
      <Section className="pb-32">
        <Container>
          {/* Filtros por categoria */}
          {visibleCategories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-paper-300/70 pb-1">
              <Link
                href="/conteudo"
                className={`-mb-px border-b-2 px-4 py-3 text-[0.78rem] uppercase tracking-wider2 transition-colors ${
                  !activeSlug
                    ? "border-ink-900 text-ink-900"
                    : "border-transparent text-muted-500 hover:text-ink-900"
                }`}
              >
                Todos
                <span
                  className={`ml-2 text-[0.65rem] ${
                    !activeSlug ? "text-gold-600" : "text-muted-400"
                  }`}
                >
                  {articles.length}
                </span>
              </Link>
              {visibleCategories.map((c) => {
                const isActive = activeSlug === c.slug;
                const count = articleCountByCategory[c.slug] ?? 0;
                return (
                  <Link
                    key={c._id}
                    href={`/conteudo?categoria=${c.slug}`}
                    className={`-mb-px border-b-2 px-4 py-3 text-[0.78rem] uppercase tracking-wider2 transition-colors ${
                      isActive
                        ? "border-ink-900 text-ink-900"
                        : "border-transparent text-muted-500 hover:text-ink-900"
                    }`}
                  >
                    {c.name}
                    <span
                      className={`ml-2 text-[0.65rem] ${
                        isActive ? "text-gold-600" : "text-muted-400"
                      }`}
                    >
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Lista */}
          <div className="mt-12">
            {fetchError ? (
              <div className="border border-red-600/30 bg-red-600/5 px-6 py-5 text-[0.92rem] text-red-700">
                Erro ao carregar conteúdo: {fetchError}
              </div>
            ) : visibleArticles.length === 0 ? (
              <div className="max-w-xl border border-ink-900/10 bg-paper-200/40 px-8 py-10">
                <div className="eyebrow">Em curadoria</div>
                <h2 className="mt-3 font-serif text-[1.6rem] tracking-editorial text-ink-900">
                  {activeSlug
                    ? `Sem materiais publicados em "${
                        visibleCategories.find((c) => c.slug === activeSlug)
                          ?.name ?? activeSlug
                      }" ainda`
                    : "Os primeiros materiais estão sendo finalizados"}
                </h2>
                <p className="mt-4 text-[1rem] leading-relaxed text-muted-600">
                  {activeSlug ? (
                    <>
                      Outros temas têm conteúdo publicado. Volte ao filtro{" "}
                      <Link
                        href="/conteudo"
                        className="text-ink-900 underline underline-offset-4 hover:text-navy-800"
                      >
                        Todos
                      </Link>{" "}
                      ou aguarde novas publicações neste tema.
                    </>
                  ) : (
                    <>
                      Acompanhe os próximos materiais no{" "}
                      <a
                        href="https://www.youtube.com/@GustavoMendoncaInvest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink-900 underline underline-offset-4 hover:text-navy-800"
                      >
                        canal no YouTube
                      </a>{" "}
                      ou no LinkedIn.
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
                {visibleArticles.map((article) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                    basePath="/conteudo"
                  />
                ))}
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
