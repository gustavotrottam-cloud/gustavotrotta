/** @type {import('next').NextConfig} */

/**
 * Security headers — aplicados em todas as rotas.
 * Referências:
 *  - https://nextjs.org/docs/app/api-reference/next-config-js/headers
 *  - https://owasp.org/www-project-secure-headers/
 *
 * CSP é o mais delicado: permitimos inline-styles (Next + Tailwind precisam)
 * mas bloqueamos scripts externos exceto domínios confiáveis (Cloudflare
 * Turnstile, etc.). Ajuste conforme adicionar novas integrações.
 */
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next/React precisa de inline pra hydration; unsafe-eval só em dev
      `script-src 'self' 'unsafe-inline' ${
        process.env.NODE_ENV === "development" ? "'unsafe-eval'" : ""
      } https://challenges.cloudflare.com`,
      // Tailwind/styled-components → inline. Fontes do Google.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      // Imagens: Supabase Storage, Sanity, YouTube thumbnails, data URIs
      "img-src 'self' data: blob: https://*.supabase.co https://cdn.sanity.io https://i.ytimg.com",
      // YouTube embed (vídeos da Mídia)
      "frame-src 'self' https://www.youtube.com https://challenges.cloudflare.com",
      // Conexões: Supabase API + Sanity + Cloudflare Turnstile (XHR/fetch do widget)
      "connect-src 'self' https://*.supabase.co https://*.sanity.io https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["sanity"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/vi/**" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Rotas do PDF interno: Puppeteer headless precisa acessar.
      // Não setamos X-Frame-Options aqui pra Puppeteer poder renderizar.
      {
        source: "/pdf/:path*",
        headers: securityHeaders.filter((h) => h.key !== "X-Frame-Options"),
      },
    ];
  },
};

export default nextConfig;
