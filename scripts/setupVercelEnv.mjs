#!/usr/bin/env node
/**
 * Adiciona env vars na Vercel via API.
 * Uso: node scripts/setupVercelEnv.mjs <vercel-token> <project-id>
 */
import { readFileSync } from "node:fs";

const token = process.argv[2];
const projectId = process.argv[3];

if (!token || !projectId) {
  console.error("Usage: node setupVercelEnv.mjs <token> <projectId>");
  process.exit(1);
}

// Lê .env.local e parse as variáveis
const envFile = readFileSync(".env.local", "utf8");
const envVars = {};
for (const line of envFile.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx < 0) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  let value = trimmed.slice(eqIdx + 1).trim();
  // Remove aspas se estiver entre elas
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  envVars[key] = value;
}

// Overrides pra produção
envVars.NEXT_PUBLIC_SITE_URL = "https://gustavotrotta.com.br";
envVars.PDF_PUBLIC_ORIGIN = "https://gustavotrotta.com.br";
envVars.CHROMIUM_PACK_URL = "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

// Monta payload (array de objetos)
const payload = Object.entries(envVars).map(([key, value]) => ({
  key,
  value,
  type: "encrypted",
  target: ["production", "preview", "development"],
}));

console.log(`Enviando ${payload.length} env vars pro projeto ${projectId}...`);

const resp = await fetch(
  `https://api.vercel.com/v10/projects/${projectId}/env`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }
);

const result = await resp.json();
console.log(`HTTP ${resp.status}`);
if (result.created) {
  console.log(`✓ Criadas: ${result.created.length}`);
}
if (result.failed?.length) {
  console.log(`✗ Falhas: ${result.failed.length}`);
  console.log(JSON.stringify(result.failed, null, 2));
}
if (!result.created && !result.failed) {
  console.log(JSON.stringify(result, null, 2));
}
process.exit(resp.ok ? 0 : 1);
