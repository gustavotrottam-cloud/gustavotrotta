"use client";

import { useState, useTransition } from "react";
import { generateArticles } from "@/app/clientes/(area)/admin/artigos/actions";

type Status =
  | { phase: "idle" }
  | { phase: "running"; message: string }
  | {
      phase: "success";
      generatedCount: number;
      videoUrl: string;
      durationSec: number;
    }
  | { phase: "error"; error: string };

export default function ArticleGeneratorForm() {
  const [videoUrl, setVideoUrl] = useState("");
  const [generateImages, setGenerateImages] = useState(true);
  const [status, setStatus] = useState<Status>({ phase: "idle" });
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    setStatus({
      phase: "running",
      message:
        "Puxando transcrição, gerando artigos com IA e criando rascunhos no Sanity. Isso pode levar 30s a 1min — não feche a aba.",
    });

    startTransition(async () => {
      const result = await generateArticles({
        videoUrl: videoUrl.trim(),
        generateImages,
      });
      if (result.ok) {
        setStatus({
          phase: "success",
          generatedCount: result.generatedCount ?? 0,
          videoUrl: result.videoUrl ?? videoUrl,
          durationSec: result.durationSec ?? 0,
        });
        setVideoUrl("");
      } else {
        setStatus({ phase: "error", error: result.error ?? "Erro desconhecido" });
      }
    });
  };

  const running = isPending || status.phase === "running";

  return (
    <div className="border border-paper-300/60 bg-paper-100 p-8 md:p-10">
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="videoUrl"
            className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
          >
            URL do vídeo no YouTube
          </label>
          <input
            id="videoUrl"
            type="url"
            required
            disabled={running}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/abc123XYZ_W ou ID puro"
            className="mt-2 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900 disabled:opacity-50"
          />
          <p className="mt-2 text-[0.78rem] text-muted-500">
            Funciona com `youtu.be/...`, `youtube.com/watch?v=...` ou o ID de
            11 caracteres direto.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={generateImages}
            disabled={running}
            onChange={(e) => setGenerateImages(e.target.checked)}
            className="mt-1 h-4 w-4 accent-ink-900"
          />
          <span className="text-[0.92rem] leading-relaxed text-ink-800">
            Gerar hero image temática para cada artigo (recomendado).{" "}
            <span className="text-muted-500">
              Usa Pollinations (FLUX) — gratuito, ~10s por imagem.
            </span>
          </span>
        </label>

        <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={running || !videoUrl.trim()}
            className="inline-flex items-center justify-center gap-3 bg-ink-900 px-8 py-4 text-[0.72rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {running ? "Gerando..." : "Gerar rascunhos"}
            {!running && <span aria-hidden>→</span>}
          </button>

          {status.phase === "running" && (
            <span className="inline-flex items-center gap-2 text-[0.78rem] text-muted-600">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold-500" />
              Em processo
            </span>
          )}
        </div>
      </form>

      {/* Feedback */}
      {status.phase === "running" && (
        <div className="mt-6 border-l-2 border-gold-500 bg-paper-200/40 px-5 py-4 text-[0.92rem] leading-relaxed text-ink-800">
          {status.message}
        </div>
      )}

      {status.phase === "success" && (
        <div className="mt-6 border border-emerald-700/30 bg-emerald-50 px-5 py-5">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-emerald-800">
            Rascunhos criados
          </div>
          <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-900">
            <strong>{status.generatedCount}</strong> artigo
            {status.generatedCount === 1 ? "" : "s"} gerado
            {status.generatedCount === 1 ? "" : "s"} a partir de{" "}
            <a
              href={status.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-800 underline underline-offset-4"
            >
              {status.videoUrl}
            </a>{" "}
            ({Math.floor(status.durationSec / 60)} min de vídeo). Veja a lista
            abaixo e clique em "Revisar no Studio" para abrir cada um.
          </p>
        </div>
      )}

      {status.phase === "error" && (
        <div className="mt-6 border border-red-600/30 bg-red-600/5 px-5 py-4">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-red-700">
            Falha
          </div>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-red-700">
            {status.error}
          </p>
          <button
            onClick={() => setStatus({ phase: "idle" })}
            className="mt-3 text-[0.78rem] text-red-700 underline underline-offset-4 hover:text-red-900"
          >
            Limpar e tentar de novo
          </button>
        </div>
      )}
    </div>
  );
}
