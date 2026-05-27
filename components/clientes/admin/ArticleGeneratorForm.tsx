"use client";

import { useState, useTransition, useRef } from "react";
import { generateArticles } from "@/app/clientes/(area)/admin/artigos/actions";

type Mode = "url" | "audio" | "transcript";

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

const TABS: Array<{ id: Mode; label: string; hint: string }> = [
  {
    id: "url",
    label: "Link YouTube",
    hint: "Cole a URL — a transcrição é extraída automaticamente via Supadata e o artigo gerado em ~1 min. Caminho mais rápido para a maioria dos vídeos.",
  },
  {
    id: "audio",
    label: "Áudio",
    hint: "Faça upload de um arquivo de áudio (mp3, m4a, wav, ogg). Groq Whisper transcreve em segundos. Limite de 4 MB pelo Vercel — vídeos de até ~10min em 64 kbps, ~20min em 32 kbps.",
  },
  {
    id: "transcript",
    label: "Transcrição",
    hint: "Cole a transcrição direto (do YouTube CC, do script local, ou de qualquer serviço). Sempre funciona, sem limite de tamanho.",
  },
];

// Vercel hobby/pro plan: ~4.5MB pra Server Action body
const MAX_AUDIO_MB = 4;

export default function ArticleGeneratorForm() {
  const [mode, setMode] = useState<Mode>("url");
  const [videoUrl, setVideoUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [audioSizeMB, setAudioSizeMB] = useState<number | null>(null);
  const [generateImages, setGenerateImages] = useState(true);
  const [status, setStatus] = useState<Status>({ phase: "idle" });
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!videoUrl.trim()) return;

    const fd = new FormData(e.currentTarget);
    fd.set("mode", mode);
    if (generateImages) fd.set("generateImages", "on");
    else fd.delete("generateImages");

    setStatus({
      phase: "running",
      message:
        mode === "url"
          ? "Tentando puxar transcrição do YouTube e gerando artigos com IA. ~30s a 1min."
          : mode === "audio"
            ? "Enviando áudio pro Groq Whisper, gerando artigos com IA. ~1 a 2min."
            : "Gerando artigos a partir da transcrição. ~30s a 1min.",
    });

    startTransition(async () => {
      const result = await generateArticles(fd);
      if (result.ok) {
        setStatus({
          phase: "success",
          generatedCount: result.generatedCount ?? 0,
          videoUrl: result.videoUrl ?? videoUrl,
          durationSec: result.durationSec ?? 0,
        });
        setVideoUrl("");
        setTranscript("");
        setAudioFileName(null);
        setAudioSizeMB(null);
        formRef.current?.reset();
      } else {
        setStatus({ phase: "error", error: result.error ?? "Erro desconhecido" });
      }
    });
  };

  const onAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAudioFileName(null);
      setAudioSizeMB(null);
      return;
    }
    setAudioFileName(file.name);
    setAudioSizeMB(file.size / (1024 * 1024));
  };

  const running = isPending || status.phase === "running";
  const activeTab = TABS.find((t) => t.id === mode)!;
  const audioOverLimit = audioSizeMB !== null && audioSizeMB > MAX_AUDIO_MB;
  const canSubmit =
    !running &&
    videoUrl.trim() &&
    (mode === "url" ||
      (mode === "audio" && !!audioFileName && !audioOverLimit) ||
      (mode === "transcript" && transcript.trim().length > 200));

  return (
    <div className="border border-paper-300/60 bg-paper-100 p-8 md:p-10">
      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-paper-300/60">
        {TABS.map((tab) => {
          const active = tab.id === mode;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMode(tab.id)}
              disabled={running}
              className={`px-5 py-3 text-[0.78rem] uppercase tracking-wider2 transition-colors ${
                active
                  ? "border-b-2 border-ink-900 text-ink-900"
                  : "border-b-2 border-transparent text-muted-500 hover:text-ink-800"
              } disabled:opacity-50`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-[0.82rem] leading-relaxed text-muted-600">
        {activeTab.hint}
      </p>

      <form ref={formRef} onSubmit={onSubmit} className="mt-6 space-y-6">
        {/* URL — sempre presente */}
        <div>
          <label
            htmlFor="videoUrl"
            className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
          >
            URL do vídeo no YouTube
            {mode !== "url" && (
              <span className="ml-2 normal-case text-muted-400">
                (necessária pra link inline no artigo)
              </span>
            )}
          </label>
          <input
            id="videoUrl"
            name="videoUrl"
            type="url"
            required
            disabled={running}
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtu.be/abc123XYZ_W"
            className="mt-2 block w-full border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900 disabled:opacity-50"
          />
        </div>

        {/* Campo específico do modo */}
        {mode === "audio" && (
          <div>
            <label
              htmlFor="audioFile"
              className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
            >
              Arquivo de áudio (mp3, m4a, wav, ogg, webm)
            </label>
            <input
              id="audioFile"
              name="audioFile"
              type="file"
              accept="audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/wav,audio/ogg,audio/webm,.mp3,.m4a,.wav,.ogg,.webm"
              required
              disabled={running}
              onChange={onAudioChange}
              className="mt-2 block w-full text-[0.92rem] text-ink-800 file:mr-4 file:border file:border-ink-900 file:bg-paper-100 file:px-4 file:py-2 file:text-[0.7rem] file:uppercase file:tracking-wider2 file:text-ink-900 hover:file:bg-ink-900 hover:file:text-paper-50 disabled:opacity-50"
            />
            {audioFileName && (
              <p
                className={`mt-2 text-[0.82rem] ${
                  audioOverLimit ? "text-red-700" : "text-muted-600"
                }`}
              >
                <strong>{audioFileName}</strong> · {audioSizeMB?.toFixed(2)} MB
                {audioOverLimit && (
                  <>
                    {" "}— acima do limite de {MAX_AUDIO_MB} MB. Comprima o
                    áudio (mp3 32 kbps mono é suficiente pro Whisper) ou use a
                    aba Transcrição.
                  </>
                )}
              </p>
            )}
          </div>
        )}

        {mode === "transcript" && (
          <div>
            <label
              htmlFor="transcript"
              className="text-[0.7rem] uppercase tracking-wider2 text-muted-500"
            >
              Transcrição
            </label>
            <textarea
              id="transcript"
              name="transcript"
              required
              disabled={running}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={12}
              placeholder="Cole aqui o texto da transcrição. Pode vir do YouTube CC, do script local, ou de qualquer serviço de transcrição..."
              className="mt-2 block w-full border border-ink-900/25 bg-paper-50 px-4 py-3 text-[0.95rem] leading-relaxed text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900 disabled:opacity-50"
            />
            <div className="mt-2 flex items-center justify-between text-[0.78rem] text-muted-500">
              <span>{transcript.length.toLocaleString("pt-BR")} caracteres</span>
              {transcript.length > 0 && transcript.length < 200 && (
                <span className="text-amber-700">
                  Mínimo recomendado: 200 caracteres
                </span>
              )}
            </div>
          </div>
        )}

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
            disabled={!canSubmit}
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
            </a>
            {status.durationSec > 0 && (
              <> ({Math.floor(status.durationSec / 60)} min de vídeo)</>
            )}
            . Veja a lista abaixo e clique em "Revisar no Studio" para abrir
            cada um.
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
          {mode === "url" && (
            <p className="mt-3 text-[0.85rem] text-muted-700">
              Dica: se o vídeo não tem legenda disponível (CC), a Supadata
              não consegue extrair. Use <strong>Áudio</strong> (upload mp3)
              ou <strong>Transcrição</strong> (cole o texto) acima.
            </p>
          )}
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
