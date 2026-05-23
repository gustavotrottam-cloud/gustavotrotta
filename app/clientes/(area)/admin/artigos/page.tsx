import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import PageHeader from "@/components/clientes/PageHeader";
import ArticleGeneratorForm from "@/components/clientes/admin/ArticleGeneratorForm";

export const dynamic = "force-dynamic";

type RecentArticle = {
  _id: string;
  title: string;
  slug?: { current?: string };
  publishedAt?: string;
  category?: { name?: string };
};

async function fetchRecentArticles(): Promise<RecentArticle[]> {
  const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const token = process.env.SANITY_API_TOKEN;
  if (!project || !dataset || !token) return [];

  // Pega últimos 15 documentos article — drafts E publicados — pra mostrar status
  try {
    const q = `*[_type=="article"] | order(_updatedAt desc)[0...15]{_id, title, slug, publishedAt, "category": category->{name}}`;
    const resp = await fetch(
      `https://${project}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(q)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const data = await resp.json();
    return data.result ?? [];
  } catch {
    return [];
  }
}

function formatDate(iso?: string) {
  if (!iso) return "—";
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

export default async function AdminArtigosPage() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/clientes/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") redirect("/clientes");

  const articles = await fetchRecentArticles();
  const drafts = articles.filter((a) => a._id.startsWith("drafts."));
  const published = articles.filter((a) => !a._id.startsWith("drafts."));

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="Admin · Artigos"
        title={
          <>
            Geração de artigos a partir do{" "}
            <span className="italic text-navy-800">YouTube</span>.
          </>
        }
        intro="Cole o link de um vídeo seu. A IA puxa a transcrição, reescreve em sua voz autoral, gera as hero images e cria rascunhos no Sanity. Você revisa e publica no Studio."
      />

      <div className="mt-10">
        <ArticleGeneratorForm />
      </div>

      {/* Lista de rascunhos pendentes */}
      <div className="mt-14">
        <div className="flex items-center justify-between border-b border-paper-300/70 pb-3">
          <h2 className="font-serif text-[1.3rem] tracking-editorial text-ink-900">
            Rascunhos pendentes de revisão
          </h2>
          <span className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
            {drafts.length} rascunho{drafts.length === 1 ? "" : "s"}
          </span>
        </div>

        {drafts.length === 0 ? (
          <div className="mt-6 border border-paper-300/60 bg-paper-100 px-7 py-10 text-center">
            <p className="text-[0.95rem] leading-relaxed text-muted-600">
              Nenhum rascunho aguardando revisão. Quando você gerar artigos
              acima, eles aparecem aqui até serem publicados no Studio.
            </p>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-paper-300/60 border-y border-paper-300/60">
            {drafts.map((a) => (
              <li
                key={a._id}
                className="flex flex-col gap-2 px-2 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="font-serif text-[1.05rem] leading-tight text-ink-900">
                    {a.title}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
                    <span className="text-gold-600">
                      {a.category?.name ?? "Sem categoria"}
                    </span>
                    <span>·</span>
                    <span>{formatDate(a.publishedAt)}</span>
                  </div>
                </div>
                <a
                  href={`https://gustavotrotta.sanity.studio/structure/article;${a._id.replace(
                    "drafts.",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 border border-ink-900 px-4 py-2 text-[0.68rem] uppercase tracking-wider2 text-ink-900 transition-all hover:bg-ink-900 hover:text-paper-50"
                >
                  Revisar no Studio →
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Histórico de publicados (referência) */}
      {published.length > 0 && (
        <div className="mt-14">
          <h2 className="border-b border-paper-300/70 pb-3 font-serif text-[1.1rem] tracking-editorial text-ink-700">
            Publicados recentemente
          </h2>
          <ul className="mt-4 space-y-2 text-[0.88rem]">
            {published.slice(0, 8).map((a) => (
              <li
                key={a._id}
                className="flex items-baseline gap-3 text-muted-600"
              >
                <span className="text-[0.7rem] tabular-nums text-muted-500">
                  {formatDate(a.publishedAt)}
                </span>
                <span className="text-ink-800">{a.title}</span>
                {a.slug?.current && (
                  <Link
                    href={`/conteudo/${a.slug.current}`}
                    target="_blank"
                    className="ml-auto shrink-0 text-[0.72rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
                  >
                    Ver no site →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
