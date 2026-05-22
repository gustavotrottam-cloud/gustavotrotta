import { defineField, defineType } from "sanity";

export const videoType = defineType({
  name: "video",
  title: "Vídeo",
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
      title: "Resumo (1 linha)",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "youtubeId",
      title: "ID do YouTube",
      type: "string",
      description: 'Apenas o ID (a parte após "v=" na URL). Ex: hGYrUP6o9hg',
      validation: (r) => r.required(),
    }),
    defineField({
      name: "channel",
      title: "Canal",
      type: "string",
      description: "CNN Brasil Money, Jovem Pan News, Money Times, etc.",
    }),
    defineField({
      name: "program",
      title: "Programa",
      type: "string",
      description: "Money News, Giro do Mercado, Estúdio News (opcional).",
    }),
    defineField({
      name: "durationMin",
      title: "Duração (min)",
      type: "number",
    }),
    defineField({
      name: "publishedAt",
      title: "Publicado em",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
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
    select: { title: "title", channel: "channel", program: "program" },
    prepare({ title, channel, program }) {
      const sub = [channel, program].filter(Boolean).join(" · ");
      return { title: title as string, subtitle: sub || "Vídeo" };
    },
  },
});
