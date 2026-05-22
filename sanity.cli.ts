import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "as54et5s",
    dataset: "production",
  },
  studioHost: "gustavotrotta",
  deployment: {
    /**
     * Habilita auto-update do Studio quando o deploy roda — Sanity puxa
     * a versão mais recente do core compatível, sem precisar deploy manual
     * sempre que tem patch de segurança.
     */
    autoUpdates: true,
  },
});
