import { defineField, defineType } from "sanity";

export const articleType = defineType({
  name: "article",
  title: "Artigo / Research",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo (1-2 linhas)",
      type: "text",
      rows: 3,
      description: "Aparece nos cards e na pré-leitura.",
      validation: (r) => r.required().max(320),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "reference",
      to: [{ type: "category" }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Imagem de destaque",
      type: "image",
      options: { hotspot: true },
      fields: [
        { name: "alt", type: "string", title: "Texto alternativo (acessibilidade)" },
      ],
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Parágrafo", value: "normal" },
            { title: "Subtítulo 2", value: "h2" },
            { title: "Subtítulo 3", value: "h3" },
            { title: "Citação", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Negrito", value: "strong" },
              { title: "Itálico", value: "em" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [{ name: "href", type: "url" }],
              },
            ],
          },
        },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "readingTimeMin",
      title: "Tempo de leitura (min)",
      type: "number",
    }),
    defineField({
      name: "publishedAt",
      title: "Publicado em",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isResearch",
      title: "É um relatório de research?",
      type: "boolean",
      initialValue: false,
      description:
        "Ative para liberar campos estruturados (resumo executivo, insights, por que importa).",
    }),
    defineField({
      name: "executiveSummary",
      title: "Resumo executivo",
      type: "text",
      rows: 4,
      hidden: ({ document }) => !document?.isResearch,
    }),
    defineField({
      name: "keyInsights",
      title: "Principais insights",
      type: "array",
      of: [{ type: "string" }],
      hidden: ({ document }) => !document?.isResearch,
    }),
    defineField({
      name: "whyItMatters",
      title: "Por que importa",
      type: "text",
      rows: 3,
      hidden: ({ document }) => !document?.isResearch,
    }),
    defineField({
      name: "attachedPdf",
      title: "PDF anexado (opcional)",
      type: "file",
      options: { accept: "application/pdf" },
    }),
  ],
  orderings: [
    {
      title: "Mais recentes",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitleRef: "category.name",
      media: "heroImage",
      isResearch: "isResearch",
    },
    prepare({ title, subtitleRef, media, isResearch }) {
      return {
        title: title as string,
        subtitle: `${isResearch ? "Research" : "Artigo"} · ${subtitleRef ?? "—"}`,
        media,
      };
    },
  },
});
