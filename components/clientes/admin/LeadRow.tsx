"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import StatusPill from "./StatusPill";
import { setLeadStatus, inviteLead } from "@/app/clientes/(area)/admin/leads/actions";

export type Lead = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  status: string;
  contacted_at: string | null;
  created_at: string;
  metadata?: { plan_id?: string } | null;
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function phoneToWa(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  // Se já vier com 55, mantém; senão prepende
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

export default function LeadRow({ lead }: { lead: Lead }) {
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const handle = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    startTransition(async () => {
      setFlash(null);
      const r = await fn();
      if (r.ok) {
        setFlash({ kind: "ok", text: r.message ?? "Atualizado." });
      } else {
        setFlash({ kind: "error", text: r.error ?? "Falha." });
      }
      setTimeout(() => setFlash(null), 5000);
    });

  const waLink = phoneToWa(lead.phone);

  return (
    <article className="group relative border-b border-paper-300/60 bg-paper-100 px-7 py-7 transition-colors duration-200 hover:bg-paper-200/40">
      <span className="absolute left-0 top-7 bottom-7 w-[2px] bg-gold-500/0 transition-colors group-hover:bg-gold-500" />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
        {/* Identidade */}
        <div className="lg:col-span-4">
          <div className="flex items-center gap-3">
            <StatusPill status={lead.status} />
            <span className="text-[0.7rem] text-muted-500">
              {formatDate(lead.created_at)}
            </span>
          </div>
          <h3 className="mt-4 font-serif text-[1.4rem] leading-[1.15] tracking-editorial text-ink-900">
            {lead.name ?? "Sem nome"}
          </h3>
          <div className="mt-2 space-y-1 text-[0.88rem] text-muted-600">
            <div>
              <a
                href={`mailto:${lead.email}`}
                className="hover:text-ink-900 hover:underline underline-offset-4"
              >
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div>
                {waLink ? (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink-900 hover:underline underline-offset-4"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span>{lead.phone}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mensagem / Plano vinculado */}
        <div className="lg:col-span-5">
          {/* Tag de origem + link pro plano quando vier do planejamento */}
          {lead.source === "planejamento-financeiro" && (
            <div className="mb-4 border border-gold-500/40 bg-gold-500/5 px-4 py-3">
              <div className="text-[0.62rem] uppercase tracking-wider2 text-gold-700">
                Origem · Planejamento Financeiro
              </div>
              {lead.metadata?.plan_id ? (
                <Link
                  href={`/clientes/admin/planos/${lead.metadata.plan_id}`}
                  className="mt-2 inline-flex items-center gap-2 text-[0.85rem] font-medium text-ink-900 underline underline-offset-4 hover:text-gold-700"
                >
                  Ver dados completos do plano →
                </Link>
              ) : (
                <div className="mt-1 text-[0.78rem] text-muted-500">
                  Plano vinculado não localizado.
                </div>
              )}
            </div>
          )}

          {lead.message ? (
            <>
              <div className="text-[0.65rem] uppercase tracking-wider2 text-muted-500">
                Mensagem
              </div>
              <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-700">
                "{lead.message}"
              </p>
            </>
          ) : lead.source !== "planejamento-financeiro" ? (
            <div className="text-[0.88rem] italic text-muted-500">
              (sem mensagem)
            </div>
          ) : null}
          {lead.contacted_at && (
            <div className="mt-3 text-[0.7rem] uppercase tracking-wider2 text-muted-500">
              Última ação: {formatDate(lead.contacted_at)}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 lg:col-span-3 lg:items-end">
          <button
            onClick={() => handle(() => inviteLead(lead.id))}
            disabled={pending || lead.status === "converted"}
            className="inline-flex items-center justify-center gap-2 bg-ink-900 px-4 py-2.5 text-[0.68rem] uppercase tracking-wider2 text-paper-50 transition-all duration-200 hover:bg-navy-800 disabled:opacity-50"
          >
            {pending ? "..." : "Convidar como cliente"}
            <span aria-hidden>→</span>
          </button>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {lead.status !== "contacted" && (
              <button
                onClick={() => handle(() => setLeadStatus(lead.id, "contacted"))}
                disabled={pending}
                className="text-[0.7rem] uppercase tracking-wider2 text-muted-600 underline underline-offset-4 hover:text-ink-900 disabled:opacity-50"
              >
                Contactado
              </button>
            )}
            {lead.status !== "archived" && (
              <button
                onClick={() => handle(() => setLeadStatus(lead.id, "archived"))}
                disabled={pending}
                className="text-[0.7rem] uppercase tracking-wider2 text-muted-600 underline underline-offset-4 hover:text-ink-900 disabled:opacity-50"
              >
                Arquivar
              </button>
            )}
            {lead.status !== "new" && (
              <button
                onClick={() => handle(() => setLeadStatus(lead.id, "new"))}
                disabled={pending}
                className="text-[0.7rem] uppercase tracking-wider2 text-muted-600 underline underline-offset-4 hover:text-ink-900 disabled:opacity-50"
              >
                Reabrir
              </button>
            )}
          </div>
        </div>
      </div>

      {flash && (
        <div
          className={`mt-4 border px-4 py-2 text-[0.82rem] ${
            flash.kind === "ok"
              ? "border-emerald-600/30 bg-emerald-600/5 text-emerald-700"
              : "border-red-600/30 bg-red-600/5 text-red-700"
          }`}
        >
          {flash.text}
        </div>
      )}
    </article>
  );
}
