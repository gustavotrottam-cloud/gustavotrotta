import { extractVideoId, fetchTranscriptForVideo } from "./fetchTranscript";
import {
  generateArticlesFromTranscript,
  type AvailableCategory,
} from "./generateWithClaude";
import { generateAndUploadHeroImage } from "./generateHeroImage";
import { createDraftArticles } from "./publishToSanity";
import type { GenerationResult } from "./types";

export type GenerateOptions = {
  videoUrl: string;
  /** Lista de categorias disponíveis (vindas do Sanity). */
  categories: AvailableCategory[];
  /** Gera hero image via Pollinations + sobe no Sanity. Default true. */
  generateImages?: boolean;
  /** Chave Anthropic. */
  anthropicKey: string;
  /** Credenciais Sanity. */
  sanityProject: string;
  sanityDataset: string;
  sanityToken: string;
};

/**
 * Pipeline completo: URL YouTube → transcrição → Claude → (Pollinations) → Sanity drafts.
 * Retorna lista de IDs de drafts criados.
 */
export async function generateArticlesFromYoutube(
  opts: GenerateOptions
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

    // 1. Transcrição
    const transcript = await fetchTranscriptForVideo(videoId);

    // 2. Claude — gera N artigos estruturados
    const { articles } = await generateArticlesFromTranscript({
      transcript: transcript.text,
      videoUrl: cleanUrl,
      videoId,
      durationSec: transcript.durationSec,
      categories: opts.categories,
      apiKey: opts.anthropicKey,
    });

    // 3. (Opcional) Gera hero images em paralelo
    const heroAssetBySlug: Record<string, string> = {};
    const heroAltBySlug: Record<string, string> = {};
    if (opts.generateImages !== false) {
      const results = await Promise.allSettled(
        articles.map((a) =>
          generateAndUploadHeroImage({
            prompt: a.heroPrompt,
            slug: a.slug,
            sanityProject: opts.sanityProject,
            sanityDataset: opts.sanityDataset,
            sanityToken: opts.sanityToken,
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

    // 4. Cria drafts no Sanity
    const { draftIds } = await createDraftArticles({
      articles,
      heroAssetBySlug,
      heroAltBySlug,
      sanityProject: opts.sanityProject,
      sanityDataset: opts.sanityDataset,
      sanityToken: opts.sanityToken,
    });

    return {
      ok: true,
      videoId,
      videoUrl: cleanUrl,
      durationSec: transcript.durationSec,
      generatedCount: articles.length,
      draftIds,
    };
  } catch (err) {
    console.error("[generateArticlesFromYoutube]", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}
