import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabase, createAdminSupabase } from "@/lib/supabase/server";
import PageHeader from "@/components/clientes/PageHeader";
import LeadRow, { type Lead } from "@/components/clientes/admin/LeadRow";

export const dynamic = "force-dynamic";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "new", label: "Novos" },
  { value: "contacted", label: "Contactados" },
  { value: "converted", label: "Convertidos" },
  { value: "archived", label: "Arquivados" },
];

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  // Defesa em camadas: middleware + layout + check aqui
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

  const filter = searchParams.status ?? "all";

  const admin = createAdminSupabase();
  let query = admin
    .from("leads")
    .select(
      "id, email, name, phone, message, source, status, contacted_at, created_at, metadata"
    )
    .order("created_at", { ascending: false });
  if (filter !== "all") {
    query = query.eq("status", filter);
  }
  const { data: leads, error } = await query;

  // Contagem por status (independente do filtro)
  const { data: allLeads } = await admin
    .from("leads")
    .select("status");
  const counts: Record<string, number> = { all: allLeads?.length ?? 0 };
  for (const l of allLeads ?? []) {
    counts[l.status] = (counts[l.status] ?? 0) + 1;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Admin · Leads"
        title={
          <>
            Interesses recebidos pelo{" "}
            <span className="italic text-navy-800">site</span>.
          </>
        }
        intro="Cada contato que chega pela página de acesso aparece aqui. Marque o status conforme avançam — ou converta direto em cliente com um clique."
      />

      {/* Filtros */}
      <div className="mt-10 flex flex-wrap items-center gap-2 border-b border-paper-300/70 pb-1">
        {FILTERS.map((f) => {
          const isActive = filter === f.value;
          const count = counts[f.value] ?? 0;
          return (
            <Link
              key={f.value}
              href={
                f.value === "all"
                  ? "/clientes/admin/leads"
                  : `/clientes/admin/leads?status=${f.value}`
              }
              className={`group relative -mb-px border-b-2 px-4 py-3 text-[0.78rem] uppercase tracking-wider2 transition-colors ${
                isActive
                  ? "border-ink-900 text-ink-900"
                  : "border-transparent text-muted-500 hover:text-ink-900"
              }`}
            >
              {f.label}
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

      {/* Lista */}
      <div className="mt-2">
        {error ? (
          <div className="border border-red-600/30 bg-red-600/5 px-6 py-5 text-[0.92rem] text-red-700">
            Falha ao carregar leads: {error.message}
          </div>
        ) : !leads || leads.length === 0 ? (
          <div className="border border-paper-300/70 bg-paper-100 px-7 py-12 text-center">
            <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
              Sem leads {filter !== "all" ? `em "${FILTERS.find((f) => f.value === filter)?.label.toLowerCase()}"` : "ainda"}
            </div>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-muted-600">
              {filter === "all"
                ? "Quando alguém deixar interesse na tela de acesso, aparecerá aqui."
                : "Mude o filtro acima para ver leads em outro estado."}
            </p>
          </div>
        ) : (
          <div className="border-x border-t border-paper-300/60 bg-paper-100">
            {(leads as Lead[]).map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>

      {/* Footnote */}
      <div className="mt-10 border-t border-paper-300/70 pt-6 text-[0.75rem] leading-relaxed text-muted-500">
        Convidar como cliente envia automaticamente um magic link para o email
        do lead. Se o email já tem conta na área, o sistema apenas marca o lead
        como convertido (sem reenviar email).
      </div>
    </div>
  );
}
