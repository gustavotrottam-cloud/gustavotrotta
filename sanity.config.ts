import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schema } from "./sanity/schemas";

// projectId e dataset são informações públicas (aparecem na URL do Studio).
// Hardcodados aqui porque o Sanity CLI build não carrega o .env.local do Next.
export default defineConfig({
  name: "default",
  title: "Gustavo Trotta · CMS",
  projectId: "as54et5s",
  dataset: "production",
  schema,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Conteúdo")
          .items([
            S.listItem()
              .title("Artigos / Research")
              .child(
                S.documentTypeList("article")
                  .title("Artigos / Research")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
              ),
            S.listItem()
              .title("Vídeos")
              .child(
                S.documentTypeList("video")
                  .title("Vídeos")
                  .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
              ),
            S.listItem()
              .title("Eventos")
              .child(
                S.documentTypeList("event")
                  .title("Eventos")
                  .defaultOrdering([{ field: "startsAt", direction: "asc" }])
              ),
            S.divider(),
            S.listItem()
              .title("Categorias")
              .child(
                S.documentTypeList("category")
                  .title("Categorias")
                  .defaultOrdering([
                    { field: "area", direction: "asc" },
                    { field: "displayOrder", direction: "asc" },
                  ])
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: "2025-01-01" }),
  ],
});
