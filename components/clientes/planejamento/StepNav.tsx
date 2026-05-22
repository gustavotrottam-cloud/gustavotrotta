"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

export default function StepNav({
  backHref,
  nextLabel = "Continuar",
}: {
  backHref?: string;
  nextLabel?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-14 flex items-center justify-between border-t border-paper-300/70 pt-6">
      {backHref ? (
        <Link
          href={backHref}
          className="text-[0.78rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
        >
          ← Voltar
        </Link>
      ) : (
        <Link
          href="/planejamento-financeiro"
          className="text-[0.78rem] uppercase tracking-wider2 text-muted-500 hover:text-ink-900"
        >
          ← Sair do plano
        </Link>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : nextLabel}
        {!pending && <span aria-hidden>→</span>}
      </button>
    </div>
  );
}
