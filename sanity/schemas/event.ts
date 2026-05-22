import { defineField, defineType } from "sanity";

export const eventType = defineType({
  name: "event",
  title: "Evento",
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
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "kind",
      title: "Tipo",
      type: "string",
      options: {
        list: [
          { title: "Live (online)", value: "live" },
          { title: "Reunião privada", value: "meeting" },
          { title: "Call com gestora", value: "call" },
          { title: "Webinar", value: "webinar" },
          { title: "Presencial", value: "in_person" },
        ],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "startsAt",
      title: "Início",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "durationMin",
      title: "Duração (min)",
      type: "number",
    }),
    defineField({
      name: "location",
      title: "Local",
      type: "string",
      description: "Endereço, sala, ou plataforma (Zoom, Meet, etc.).",
    }),
    defineField({
      name: "meetingUrl",
      title: "Link da reunião (ao vivo)",
      type: "url",
    }),
    defineField({
      name: "recordingUrl",
      title: "Link da gravação (pós-evento)",
      type: "url",
    }),
    defineField({
      name: "materialsUrl",
      title: "Link dos materiais",
      type: "url",
    }),
  ],
  orderings: [
    {
      title: "Próximos primeiro",
      name: "startsAtAsc",
      by: [{ field: "startsAt", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", kind: "kind", startsAt: "startsAt" },
    prepare({ title, kind, startsAt }) {
      const when = startsAt ? new Date(startsAt as string).toLocaleString("pt-BR") : "—";
      return { title: title as string, subtitle: `${kind ?? "evento"} · ${when}` };
    },
  },
});
