import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Token curto-prazo pra autorizar Puppeteer a abrir a /pdf-view interna
 * sem precisar de cookie de sessão.
 *
 * Formato: base64url(JSON.stringify(payload)).base64url(HMAC-SHA256)
 * Payload: { profileId, exp } — exp em segundos desde epoch.
 *
 * Segredo: env PDF_TOKEN_SECRET. Em produção precisa estar configurado.
 * Em dev, se ausente, cai num fallback derivado do SUPABASE_SERVICE_ROLE_KEY
 * — apenas pra não quebrar setup local; nunca deixar prod sem PDF_TOKEN_SECRET.
 */

const DEFAULT_TTL_SECONDS = 90;

function getSecret(): string {
  const explicit = process.env.PDF_TOKEN_SECRET;
  if (explicit && explicit.length >= 16) return explicit;

  const fallback = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (fallback && fallback.length >= 16) return fallback;

  throw new Error(
    "PDF_TOKEN_SECRET ausente. Defina em .env.local (mínimo 16 caracteres)."
  );
}

function b64urlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64urlDecode(input: string): Buffer {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(normalized, "base64");
}

export type PdfTokenPayload = {
  /** UUID do planning_plan (não do profile — aceita anon ou logged) */
  planId: string;
  exp: number;
};

export function signPdfToken(
  planId: string,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): string {
  const payload: PdfTokenPayload = {
    planId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sig = createHmac("sha256", getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${b64urlEncode(sig)}`;
}

export function verifyPdfToken(token: string): PdfTokenPayload | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = createHmac("sha256", getSecret())
    .update(payloadB64)
    .digest();
  const providedSig = b64urlDecode(sigB64);

  if (
    expectedSig.length !== providedSig.length ||
    !timingSafeEqual(expectedSig, providedSig)
  ) {
    return null;
  }

  let payload: PdfTokenPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString("utf8"));
  } catch {
    return null;
  }

  if (!payload?.planId || typeof payload.exp !== "number") return null;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}
