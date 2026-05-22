import { defineField, defineType } from "sanity";

export const categoryType = defineType({
  name: "category",
  title: "Categoria",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "area",
      title: "Área",
      type: "string",
      description: "Onde a categoria aparece na navegação do site",
      options: {
        list: [
          { title: "Cenário & Mercado", value: "mercado" },
          { title: "Biblioteca", value: "biblioteca" },
          { title: "Ambos", value: "ambos" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "displayOrder",
      title: "Ordem de exibição",
      type: "number",
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "area" },
  },
});
