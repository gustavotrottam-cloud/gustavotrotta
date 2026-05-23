import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gustavo Trotta — Estratégia patrimonial e visão de longo prazo",
  description:
    "Assessor CFP e sócio da Valor Investimentos / XP. Visão integrada das seis áreas do planejamento financeiro — investimentos, proteção, aposentadoria, eficiência tributária e sucessão — com clareza e acompanhamento próximo.",
  metadataBase: new URL("https://gustavotrotta.com.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gustavo Trotta — Estratégia patrimonial",
    description:
      "Visão integrada das seis áreas do planejamento financeiro — investimentos, proteção, aposentadoria, eficiência tributária e sucessão — com clareza e acompanhamento próximo.",
    type: "website",
    locale: "pt_BR",
    url: "https://gustavotrotta.com.br",
    siteName: "Gustavo Trotta",
  },
};

// Schema.org Person — estampado em todas as páginas via layout root.
// sameAs ajuda o Google a conectar o profissional aos perfis sociais
// e habilita o Knowledge Panel ao longo do tempo.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gustavo Trotta",
  jobTitle: "Assessor de investimentos · Certified Financial Planner (CFP)",
  url: "https://gustavotrotta.com.br",
  image: "https://gustavotrotta.com.br/gustavo-trotta-hero.jpg",
  worksFor: {
    "@type": "FinancialService",
    name: "Valor Investimentos",
    description:
      "Escritório credenciado XP Investimentos — atuação em ES, SP, RJ, MG, DF e GO.",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Universidade Federal Fluminense (UFF)",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "Ohio University",
    },
  ],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    name: "Certified Financial Planner (CFP)",
    credentialCategory: "certification",
    recognizedBy: {
      "@type": "Organization",
      name: "Planejar — Associação Brasileira de Planejamento Financeiro",
    },
  },
  knowsAbout: [
    "Planejamento financeiro",
    "Gestão de investimentos",
    "Previdência privada",
    "Eficiência tributária",
    "Planejamento sucessório",
    "Renda fixa",
    "Fundos imobiliários",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-11-93221-2045",
    contactType: "customer service",
    areaServed: "BR",
    availableLanguage: ["Portuguese"],
  },
  sameAs: [
    "https://www.linkedin.com/in/gustavo-trotta/",
    "https://instagram.com/gustavotmendonca",
    "https://www.youtube.com/@GustavoMendoncaInvest",
  ],
};

/**
 * Root layout — minimal. Apenas html, body, fontes e estilos globais.
 * O chrome do site público (Navbar, Footer, WhatsApp) vive em
 * `app/(public)/layout.tsx`. A área logada usa `app/clientes/layout.tsx`.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-paper-100 text-ink-900 font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
