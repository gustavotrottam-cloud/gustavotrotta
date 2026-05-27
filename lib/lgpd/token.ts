import "server-only";
import crypto from "node:crypto";

/**
 * Helpers de hashing pro fluxo de auto-exclusão LGPD.
 *
 * Conceitualmente:
 *   - `normalizeEmail`: lower-case + trim. Usado pra match estável.
 *   - `hashEmail`: sha256 hex do email normalizado. Permite buscar requests
 *      sem armazenar email em claro.
 *   - `generateDeletionToken`: 32 bytes aleatórios em base64url (43 chars).
 *      Esse é o token que vai pra URL do email.
 *   - `hashDeletionToken`: HMAC-SHA256(PDF_TOKEN_SECRET, token). Esse é o
 *      valor que armazenamos no DB. Sem o secret, não dá pra forjar/colidir.
 *
 * Reuso de PDF_TOKEN_SECRET: a chave já existe pra assinar tokens de PDF,
 * e é segredo do servidor. Não há colisão de uso porque os contextos são
 * diferentes (PDF tokens são JWTs com payload, deletion tokens são opacos).
 */

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function hashEmail(email: string): string {
  return crypto
    .createHash("sha256")
    .update(normalizeEmail(email))
    .digest("hex");
}

export function generateDeletionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

function getSigningSecret(): string {
  const secret =
    process.env.PDF_TOKEN_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || secret.length < 16) {
    throw new Error(
      "LGPD deletion: nenhum segredo disponível (PDF_TOKEN_SECRET ou SUPABASE_SERVICE_ROLE_KEY)"
    );
  }
  return secret;
}

export function hashDeletionToken(rawToken: string): string {
  return crypto
    .createHmac("sha256", getSigningSecret())
    .update(rawToken)
    .digest("base64url");
}
