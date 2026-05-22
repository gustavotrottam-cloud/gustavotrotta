import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

/**
 * Layout do site público (Home, Sobre, futuras páginas institucionais).
 * O chrome (Navbar, Footer, botão WhatsApp) só aparece aqui — a área
 * `/clientes` tem layout próprio.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
