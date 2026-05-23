import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: "as54et5s",
    dataset: "production",
  },
  studioHost: "gustavotrotta",
  /**
   * autoUpdates do Studio — campo aceito pelo Sanity CLI em runtime mas não
   * tipado no CliConfig público.
   */
  // @ts-expect-error — deployment não está no tipo público mas é suportado
  deployment: {
    autoUpdates: true,
  },
});
