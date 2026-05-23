import Groq from "groq-sdk";

/**
 * Transcreve áudio via Groq Whisper Large v3 Turbo.
 *
 * Por que Groq (e não OpenAI): ~10× mais barato ($0.04/h vs $0.36/h),
 * free tier generoso, e velocidade absurda (~299× real-time — vídeo de
 * 30min sai em segundos). Suporta PT-BR nativamente.
 *
 * Limite de arquivo: 25MB no free tier, 100MB pago (via URL).
 * Aqui aceitamos o que o Vercel Server Action passar — limite efetivo
 * acaba sendo 4.5MB (Vercel platform cap, não nosso).
 */

export type TranscribeResult = {
  text: string;
  /** Duração estimada em segundos. Whisper retorna se `response_format=verbose_json`. */
  durationSec: number;
};

export async function transcribeAudioWithGroq(
  audioFile: File,
  apiKey: string
): Promise<TranscribeResult> {
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY ausente. Crie em https://console.groq.com → API Keys e adicione nas env vars."
    );
  }

  const groq = new Groq({ apiKey });

  // verbose_json devolve segments + duration, útil pra UI mostrar metadata
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3-turbo",
    language: "pt",
    response_format: "verbose_json",
    temperature: 0,
  });

  // O SDK retorna { text, duration, segments, ... } quando verbose_json
  // Tipagem do SDK varia entre versões, então acessamos defensivamente
  const text = (transcription as { text?: string }).text ?? "";
  const duration = (transcription as { duration?: number }).duration ?? 0;

  if (!text.trim()) {
    throw new Error("Groq retornou transcrição vazia. Áudio pode estar mudo ou corrompido.");
  }

  return {
    text: text.trim(),
    durationSec: Math.round(duration),
  };
}
