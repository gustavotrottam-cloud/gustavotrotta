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
  openGraph: {
    title: "Gustavo Trotta — Estratégia patrimonial",
    description:
      "Visão integrada das seis áreas do planejamento financeiro — investimentos, proteção, aposentadoria, eficiência tributária e sucessão — com clareza e acompanhamento próximo.",
    type: "website",
    locale: "pt_BR",
  },
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
        {children}
      </body>
    </html>
  );
}
