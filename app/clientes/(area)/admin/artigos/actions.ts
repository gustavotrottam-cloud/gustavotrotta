"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  generateFromYoutubeUrl,
  generateFromAudio,
  generateFromTranscript,
} from "@/lib/article-generator";
import type { AvailableCategory } from "@/lib/article-generator/generateWithGemini";
import type { GenerationResult } from "@/lib/article-generator/types";

export type GenerateMode = "url" | "audio" | "transcript";

/**
 * Server Action única que despacha pros 3 caminhos.
 * Usa FormData pra suportar upload de áudio (modo "audio").
 *
 * Campos esperados:
 *   - mode: "url" | "audio" | "transcript" (obrigatório)
 *   - videoUrl: string (obrigatório em todos os modos — pra link inline no artigo)
 *   - generateImages: "on" | undefined (checkbox)
 *   - audioFile: File (modo "audio")
 *   - transcript: string (modo "transcript")
 */
export async function generateArticles(
  formData: FormData
): Promise<GenerationResult> {
  // 1. Auth — só admin
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { ok: false, error: "Acesso restrito ao administrador" };
  }

  // 2. Envs Gemini + Sanity (sempre necessárias)
  const geminiKey = process.env.GEMINI_API_KEY;
  const sanityProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const sanityToken = process.env.SANITY_API_TOKEN;
  if (!geminiKey) {
    return {
      ok: false,
      error:
        "GEMINI_API_KEY não configurada. Adicione no .env.local e nas env vars da Vercel.",
    };
  }
  if (!sanityProject || !sanityDataset || !sanityToken) {
    return { ok: false, error: "Configuração Sanity incompleta no servidor" };
  }

  // 3. Categorias do Sanity
  let categories: AvailableCategory[] = [];
  try {
    const resp = await fetch(
      `https://${sanityProject}.api.sanity.io/v2024-01-01/data/query/${sanityDataset}?query=${encodeURIComponent(
        '*[_type=="category"]{"slug": slug.current, name, area, description}'
      )}`,
      { headers: { Authorization: `Bearer ${sanityToken}` } }
    );
    const data = await resp.json();
    categories = data.result ?? [];
  } catch (err) {
    return {
      ok: false,
      error: `Falha ao buscar categorias do Sanity: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }
  if (categories.length === 0) {
    return { ok: false, error: "Nenhuma categoria configurada no Sanity" };
  }

  // 4. Despacha por modo
  const mode = formData.get("mode") as GenerateMode | null;
  const videoUrl = (formData.get("videoUrl") as string | null)?.trim() ?? "";
  const generateImages = formData.get("generateImages") === "on";

  if (!videoUrl) {
    return { ok: false, error: "URL do vídeo é obrigatória." };
  }

  const baseCreds = {
    categories,
    generateImages,
    geminiKey,
    sanityProject,
    sanityDataset,
    sanityToken,
  };

  let result: GenerationResult;

  if (mode === "url") {
    result = await generateFromYoutubeUrl({ ...baseCreds, videoUrl });
  } else if (mode === "audio") {
    const audioFile = formData.get("audioFile") as File | null;
    if (!audioFile || audioFile.size === 0) {
      return { ok: false, error: "Arquivo de áudio não enviado." };
    }
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return {
        ok: false,
        error:
          "GROQ_API_KEY não configurada. Crie em https://console.groq.com e adicione nas env vars.",
      };
    }
    result = await generateFromAudio({
      ...baseCreds,
      videoUrl,
      audioFile,
      groqKey,
    });
  } else if (mode === "transcript") {
    const transcript = (formData.get("transcript") as string | null)?.trim() ?? "";
    if (!transcript) {
      return { ok: false, error: "Transcrição vazia." };
    }
    const durationSecRaw = formData.get("durationSec") as string | null;
    const durationSec = durationSecRaw ? parseInt(durationSecRaw, 10) : 0;
    result = await generateFromTranscript({
      ...baseCreds,
      videoUrl,
      transcript,
      durationSec: Number.isNaN(durationSec) ? 0 : durationSec,
    });
  } else {
    return { ok: false, error: `Modo inválido: ${mode}` };
  }

  if (result.ok) {
    revalidatePath("/clientes/admin/artigos");
    revalidatePath("/conteudo");
  }
  return result;
}
