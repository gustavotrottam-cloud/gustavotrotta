import { extractVideoId, fetchTranscriptForVideo } from "./fetchTranscript";
import { transcribeAudioWithGroq } from "./transcribeWithGroq";
import {
  generateArticlesFromTranscript,
  type AvailableCategory,
} from "./generateWithGemini";
import { generateAndUploadHeroImage } from "./generateHeroImage";
import { createDraftArticles } from "./publishToSanity";
import type { GenerationResult } from "./types";

type CommonCreds = {
  categories: AvailableCategory[];
  generateImages?: boolean;
  geminiKey: string;
  sanityProject: string;
  sanityDataset: string;
  sanityToken: string;
};

export type GenerateFromUrlOptions = CommonCreds & {
  videoUrl: string;
};

export type GenerateFromAudioOptions = CommonCreds & {
  /** URL canônica do vídeo no YouTube (pra link inline no artigo). */
  videoUrl: string;
  audioFile: File;
  groqKey: string;
};

export type GenerateFromTranscriptOptions = CommonCreds & {
  videoUrl: string;
  transcript: string;
  /** Duração do vídeo em segundos (opcional, default 0 — usado só pra metadata). */
  durationSec?: number;
};

/**
 * Caminho 1: URL do YouTube → tenta `youtube-transcript`.
 * Funciona em local sempre. Em produção (Vercel) falha quase sempre por
 * IP fingerprinting do YouTube em datacenters. Mantido como atalho rápido.
 */
export async function generateFromYoutubeUrl(
  opts: GenerateFromUrlOptions
): Promise<GenerationResult> {
  try {
    const videoId = extractVideoId(opts.videoUrl);
    if (!videoId) {
      return {
        ok: false,
        error: "URL inválida. Esperado YouTube link ou ID de 11 caracteres.",
      };
    }
    const cleanUrl = `https://youtu.be/${videoId}`;
    const transcript = await fetchTranscriptForVideo(videoId);
    return runCorePipeline({
      videoId,
      cleanUrl,
      transcriptText: transcript.text,
      durationSec: transcript.durationSec,
      ...opts,
    });
  } catch (err) {
    return wrapError(err);
  }
}

/**
 * Caminho 2: upload de arquivo de áudio → Groq Whisper Large v3 Turbo.
 * Funciona em qualquer ambiente (não depende do IP da Vercel ser ou não
 * reconhecido pelo YouTube). Limite efetivo de upload: ~4.5MB pela Vercel.
 */
export async function generateFromAudio(
  opts: GenerateFromAudioOptions
): Promise<GenerationResult> {
  try {
    const videoId = extractVideoId(opts.videoUrl);
    if (!videoId) {
      return {
        ok: false,
        error: "URL do vídeo inválida (necessária pra link inline no artigo).",
      };
    }
    const cleanUrl = `https://youtu.be/${videoId}`;
    const transcribed = await transcribeAudioWithGroq(opts.audioFile, opts.groqKey);
    return runCorePipeline({
      videoId,
      cleanUrl,
      transcriptText: transcribed.text,
      durationSec: transcribed.durationSec,
      ...opts,
    });
  } catch (err) {
    return wrapError(err);
  }
}

/**
 * Caminho 3: transcrição colada diretamente. Pula a etapa de transcrição.
 * Sempre funciona — útil quando o user já tem o texto (rodou script local,
 * pegou CC do YouTube, etc).
 */
export async function generateFromTranscript(
  opts: GenerateFromTranscriptOptions
): Promise<GenerationResult> {
  try {
    const videoId = extractVideoId(opts.videoUrl);
    if (!videoId) {
      return {
        ok: false,
        error: "URL do vídeo inválida (necessária pra link inline no artigo).",
      };
    }
    if (!opts.transcript.trim()) {
      return { ok: false, error: "Transcrição vazia." };
    }
    const cleanUrl = `https://youtu.be/${videoId}`;
    return runCorePipeline({
      videoId,
      cleanUrl,
      transcriptText: opts.transcript.trim(),
      durationSec: opts.durationSec ?? 0,
      ...opts,
    });
  } catch (err) {
    return wrapError(err);
  }
}

// ─── Core compartilhado ─────────────────────────────────────────────────

type CoreInput = CommonCreds & {
  videoId: string;
  cleanUrl: string;
  transcriptText: string;
  durationSec: number;
};

async function runCorePipeline(input: CoreInput): Promise<GenerationResult> {
  // 1. Gemini gera N artigos estruturados
  const { articles } = await generateArticlesFromTranscript({
    transcript: input.transcriptText,
    videoUrl: input.cleanUrl,
    videoId: input.videoId,
    durationSec: input.durationSec,
    categories: input.categories,
    apiKey: input.geminiKey,
  });

  // 2. (Opcional) Hero images em paralelo
  const heroAssetBySlug: Record<string, string> = {};
  const heroAltBySlug: Record<string, string> = {};
  if (input.generateImages !== false) {
    const results = await Promise.allSettled(
      articles.map((a) =>
        generateAndUploadHeroImage({
          prompt: a.heroPrompt,
          slug: a.slug,
          sanityProject: input.sanityProject,
          sanityDataset: input.sanityDataset,
          sanityToken: input.sanityToken,
        }).then((assetId) => ({ slug: a.slug, assetId, alt: a.heroAlt }))
      )
    );
    results.forEach((r) => {
      if (r.status === "fulfilled") {
        heroAssetBySlug[r.value.slug] = r.value.assetId;
        heroAltBySlug[r.value.slug] = r.value.alt;
      } else {
        console.warn("[hero image] falhou:", r.reason);
      }
    });
  }

  // 3. Cria drafts no Sanity
  const { draftIds } = await createDraftArticles({
    articles,
    heroAssetBySlug,
    heroAltBySlug,
    sanityProject: input.sanityProject,
    sanityDataset: input.sanityDataset,
    sanityToken: input.sanityToken,
  });

  return {
    ok: true,
    videoId: input.videoId,
    videoUrl: input.cleanUrl,
    durationSec: input.durationSec,
    generatedCount: articles.length,
    draftIds,
  };
}

function wrapError(err: unknown): GenerationResult {
  console.error("[article-generator]", err);
  return {
    ok: false,
    error: err instanceof Error ? err.message : "Erro desconhecido",
  };
}
