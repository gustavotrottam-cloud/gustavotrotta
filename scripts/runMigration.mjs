#!/usr/bin/env node
/**
 * One-shot: aplica uma migration via Supabase Management API.
 * Uso: node scripts/runMigration.mjs <path-to-sql> <PAT>
 */
import { readFileSync } from "node:fs";

const sqlPath = process.argv[2];
const pat = process.argv[3];
const projectRef = process.env.SUPABASE_PROJECT_REF || "pfujcrlcbsoqkalpulev";

if (!sqlPath || !pat) {
  console.error("Usage: node runMigration.mjs <sql-file> <pat>");
  process.exit(1);
}

const sql = readFileSync(sqlPath, "utf8");
console.log(`Lendo ${sqlPath} (${sql.length} bytes)`);

const resp = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);

const text = await resp.text();
console.log(`HTTP ${resp.status}`);
console.log(text);
process.exit(resp.ok ? 0 : 1);
