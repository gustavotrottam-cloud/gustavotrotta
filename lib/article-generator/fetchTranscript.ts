/** Extrai o ID de um vídeo YouTube em URLs como:
 *  - https://youtu.be/VIDEO_ID
 *  - https://youtu.be/VIDEO_ID?si=...
 *  - https://www.youtube.com/watch?v=VIDEO_ID
 *  - https://www.youtube.com/embed/VIDEO_ID
 *  - VIDEO_ID puro (11 chars)
 */
export function extractVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Já é o ID puro
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace(/^\//, "").split("/")[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
      // /embed/ID, /shorts/ID, /v/ID
      const parts = url.pathname.split("/").filter(Boolean);
      const last = parts[parts.length - 1] ?? "";
      if (/^[A-Za-z0-9_-]{11}$/.test(last)) return last;
    }
  } catch {
    // fall through
  }
  return null;
}

export type TranscriptResult = {
  text: string;
  durationSec: number;
  chunkCount: number;
  lang: string;
};

type SupadataChunk = {
  text: string;
  offset: number;
  duration: number;
  lang?: string;
};

type SupadataResponse = {
  content: SupadataChunk[];
  lang: string;
  availableLangs?: string[];
};

const SUPADATA_ENDPOINT = "https://api.supadata.ai/v1/youtube/transcript";

/**
 * Puxa transcrição via Supadata API (https://supadata.ai).
 *
 * Por que não `youtube-transcript`: YouTube bloqueia IPs de datacenter
 * (Vercel, AWS, etc) com "Sign in to confirm you're not a bot". Supadata
 * usa proxies residenciais e funciona consistentemente em produção.
 *
 * Free tier: 100 transcripts/mês (mais que suficiente pro ritmo do site).
 *
 * Estratégia: tenta primeiro `lang=pt` (Supadata trata como prefixo, aceita
 * pt/pt-BR/pt-PT). Se vídeo não tiver caption em português, fallback pra
 * qualquer idioma disponível.
 */
export async function fetchTranscriptForVideo(
  videoId: string
): Promise<TranscriptResult> {
  const apiKey = process.env.SUPADATA_API_KEY;
  if (!apiKey) {
    throw new Error(
      "SUPADATA_API_KEY não configurada. Crie em https://dash.supadata.ai/organizations/api-key e adicione no .env.local + Vercel."
    );
  }

  const attempts: Array<string | null> = ["pt", null];
  let lastErr: unknown = null;

  for (const lang of attempts) {
    try {
      const params = new URLSearchParams({ videoId, text: "false" });
      if (lang) params.set("lang", lang);

      const resp = await fetch(`${SUPADATA_ENDPOINT}?${params.toString()}`, {
        headers: { "x-api-key": apiKey },
      });

      if (!resp.ok) {
        const body = await resp.text();
        lastErr = new Error(
          `Supadata ${resp.status}: ${body.slice(0, 300)}`
        );
        continue;
      }

      const data = (await resp.json()) as SupadataResponse;
      if (!data.content || data.content.length === 0) {
        lastErr = new Error(
          `Supadata retornou content vazio (lang=${lang ?? "auto"})`
        );
        continue;
      }

      const last = data.content[data.content.length - 1];
      const durationSec = Math.round((last.offset + last.duration) / 1000);
      return {
        text: data.content.map((c) => c.text).join(" "),
        durationSec,
        chunkCount: data.content.length,
        lang: data.lang ?? lang ?? "auto",
      };
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(
    `Não consegui puxar transcrição via Supadata. Último erro: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  );
}
