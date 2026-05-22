import Link from "next/link";
import PageHeader from "@/components/clientes/PageHeader";
import CuratorNotice from "@/components/clientes/CuratorNotice";
import ArticleCard, { type ArticleCardData } from "@/components/clientes/ArticleCard";
import { sanityClient } from "@/sanity/lib/client";
import {
  articlesByAreaQuery,
  categoriesByAreaQuery,
} from "@/sanity/lib/queries";

// Revalida a cada 60s — quando você publicar no Studio, aparece em até 1 min
export const revalidate = 60;

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
};

export default async function BibliotecaPage({
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
      sanityClient.fetch<ArticleCardData[]>(articlesByAreaQuery, {
        area: "biblioteca",
      }),
      sanityClient.fetch<Category[]>(categoriesByAreaQuery, {
        area: "biblioteca",
      }),
    ]);
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[biblioteca] Sanity fetch error:", err);
  }

  const visibleArticles = activeSlug
    ? articles.filter((a) => a.category?.slug === activeSlug)
    : articles;

  const countByCategory = articles.reduce<Record<string, number>>((acc, a) => {
    const s = a.category?.slug;
    if (s) acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Biblioteca premium"
        title={
          <>
            Materiais selecionados,{" "}
            <span className="italic text-navy-800">
              organizados por tema
            </span>
            .
          </>
        }
        intro="PDFs, relatórios, artigos e estudos exclusivos para clientes — curados para aprofundar temas que importam ao patrimônio de longo prazo."
      />

      {/* Filtros por categoria */}
      {categories.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-paper-300/70 pb-1">
          <Link
            href="/clientes/biblioteca"
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
          {categories.map((c) => {
            const isActive = activeSlug === c.slug;
            const count = countByCategory[c.slug] ?? 0;
            return (
              <Link
                key={c._id}
                href={`/clientes/biblioteca?categoria=${c.slug}`}
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

      {/* Lista de artigos */}
      <div className="mt-12">
        {fetchError ? (
          <div className="border border-red-600/30 bg-red-600/5 px-6 py-5 text-[0.92rem] text-red-700">
            Erro ao carregar conteúdo: {fetchError}
          </div>
        ) : visibleArticles.length === 0 ? (
          <CuratorNotice
            title={
              activeSlug
                ? `Sem materiais em "${
                    categories.find((c) => c.slug === activeSlug)?.name ?? activeSlug
                  }" ainda`
                : "Acervo em curadoria"
            }
          >
            {activeSlug
              ? "Outros temas têm conteúdo. Volte ao filtro \"Todos\" ou aguarde novas publicações neste tema."
              : "Os primeiros materiais estão sendo finalizados. Você recebe um email curto quando há algo novo no seu tema de interesse."}
          </CuratorNotice>
        ) : (
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {visibleArticles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
