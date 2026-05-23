import { YoutubeTranscript } from "youtube-transcript";

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

/** Tenta puxar a transcrição preferindo PT-BR, com fallback. */
export async function fetchTranscriptForVideo(
  videoId: string
): Promise<TranscriptResult> {
  const tryLangs: Array<string | undefined> = [
    "pt",
    "pt-BR",
    "pt-PT",
    undefined,
  ];
  let lastErr: unknown = null;
  for (const lang of tryLangs) {
    try {
      const opts = lang ? { lang } : {};
      const transcript = await YoutubeTranscript.fetchTranscript(videoId, opts);
      if (!transcript || transcript.length === 0) continue;
      const last = transcript[transcript.length - 1];
      const durationSec = Math.round((last.offset + last.duration) / 1000);
      return {
        text: transcript.map((c) => c.text).join(" "),
        durationSec,
        chunkCount: transcript.length,
        lang: lang ?? "auto",
      };
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Não consegui puxar transcrição (tentei pt, pt-BR, pt-PT, auto). Último erro: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`
  );
}
