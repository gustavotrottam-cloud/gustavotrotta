import type { MetadataRoute } from "next";

const BASE_URL = "https://gustavotrotta.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/clientes/",
          "/api/",
          "/pdf/",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
