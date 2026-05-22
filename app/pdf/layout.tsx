import type { Metadata } from "next";
import "./pdf.css";

export const metadata: Metadata = {
  title: "Plano patrimonial · PDF",
  robots: { index: false, follow: false },
};

export default function PdfLayout({ children }: { children: React.ReactNode }) {
  return <div className="pdf-root">{children}</div>;
}
