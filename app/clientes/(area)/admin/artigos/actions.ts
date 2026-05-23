"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  generateArticlesFromYoutube,
  type GenerateOptions,
} from "@/lib/article-generator";
import type { AvailableCategory } from "@/lib/article-generator/generateWithClaude";
import type { GenerationResult } from "@/lib/article-generator/types";

/** Server Action: gera N artigos a partir de URL YouTube. Só admin. */
export async function generateArticles(input: {
  videoUrl: string;
  generateImages?: boolean;
}): Promise<GenerationResult> {
  // 1. Auth check — só admin
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Não autenticado" };
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { ok: false, error: "Acesso restrito ao administrador" };
  }

  // 2. Valida envs
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const sanityProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const sanityToken = process.env.SANITY_API_TOKEN;
  if (!anthropicKey) {
    return {
      ok: false,
      error: "ANTHROPIC_API_KEY não configurada. Adicione no .env.local e nas env vars da Vercel.",
    };
  }
  if (!sanityProject || !sanityDataset || !sanityToken) {
    return {
      ok: false,
      error: "Configuração Sanity incompleta no servidor",
    };
  }

  // 3. Busca categorias disponíveis no Sanity
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

  // 4. Roda o pipeline completo
  const opts: GenerateOptions = {
    videoUrl: input.videoUrl,
    categories,
    generateImages: input.generateImages !== false,
    anthropicKey,
    sanityProject,
    sanityDataset,
    sanityToken,
  };

  const result = await generateArticlesFromYoutube(opts);

  if (result.ok) {
    revalidatePath("/clientes/admin/artigos");
    revalidatePath("/conteudo");
  }
  return result;
}
