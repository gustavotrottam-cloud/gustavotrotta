"use client";

import { useState, useTransition } from "react";

type Props = {
  /** URL do endpoint que serve o PDF */
  pdfHref: string;
  /** Nome capturado no contato — usado pra personalizar a UI */
  greetingName?: string | null;
  /** Server action chamada após download — marca plano completo + limpa cookie */
  onCompleted: () => Promise<{ ok: boolean; error?: string }>;
};

async function downloadPdfBlob(pdfHref: string, filename: string): Promise<void> {
  const resp = await fetch(pdfHref, { credentials: "same-origin" });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`PDF retornou ${resp.status}. ${body.slice(0, 120)}`);
  }
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export default function PdfDownloadButton({
  pdfHref,
  greetingName,
  onCompleted,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const filename = `planejamento-financeiro-${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
        await downloadPdfBlob(pdfHref, filename);
        await onCompleted();
        setTimeout(() => {
          window.location.href = "/planejamento-financeiro?baixado=1";
        }, 400);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha no download");
      }
    });
  }

  return (
    <div className="border border-ink-900 bg-ink-900 px-8 py-7 text-paper-50">
      <div className="grid items-center gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-400">
            Documento editorial · 5 páginas
          </div>
          <h3 className="mt-2 font-serif text-[1.5rem] leading-[1.15] tracking-editorial md:text-[1.7rem]">
            {greetingName
              ? `Seu plano está pronto, ${greetingName.split(" ")[0]}.`
              : "Seu plano está pronto."}
          </h3>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-paper-100/70">
            Baixe o PDF com capa, projeção, leitura do cenário e disclaimers.
            Documento informativo — não constitui recomendação de investimento.
          </p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className="inline-flex items-center gap-3 bg-paper-50 px-7 py-4 text-[0.7rem] uppercase tracking-wider2 text-ink-900 transition-all duration-300 hover:bg-gold-400 disabled:opacity-60"
          >
            {pending ? (
              "Gerando PDF..."
            ) : (
              <>
                <DownloadIcon />
                Baixar plano
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-5 border border-gold-400/40 bg-gold-400/10 px-4 py-3 text-[0.85rem] text-gold-200">
          {error}
        </div>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
