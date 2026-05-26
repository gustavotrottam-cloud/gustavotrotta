import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer id="contato" className="border-t border-paper-300/70 bg-paper-100 pt-20 pb-12">
      <Container>
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-serif text-2xl tracking-editorial text-ink-900">
              Gustavo <span className="text-gold-500">Trotta</span>
            </div>
            <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-muted-500">
              Estratégia patrimonial, visão de longo prazo e acompanhamento próximo.
              Assessor de investimentos e sócio da Valor Investimentos / XP.
            </p>
            <a
              href="https://wa.me/5511932212045?text=Ol%C3%A1%20Gustavo%2C%20gostaria%20de%20agendar%20uma%20conversa."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center border border-ink-900 px-6 py-3 text-[0.72rem] uppercase tracking-wider2 text-ink-900 transition-all hover:bg-ink-900 hover:text-paper-50"
            >
              Agendar uma conversa
            </a>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow">Navegação</div>
            <ul className="mt-5 space-y-3 text-[0.9rem] text-ink-700">
              <li>
                <Link href="/sobre" className="hover:text-ink-900 transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/#filosofia" className="hover:text-ink-900 transition-colors">
                  Filosofia
                </Link>
              </li>
              <li>
                <Link href="/#areas" className="hover:text-ink-900 transition-colors">
                  Áreas de atuação
                </Link>
              </li>
              <li>
                <Link href="/conteudo" className="hover:text-ink-900 transition-colors">
                  Central de conteúdo
                </Link>
              </li>
              <li>
                <Link href="/#midia" className="hover:text-ink-900 transition-colors">
                  Mídia e autoridade
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="eyebrow">Contato</div>
            <ul className="mt-5 space-y-3 text-[0.9rem] text-ink-700">
              <li>
                <a
                  href="mailto:gustavo.mendonca@valorinvestimentos.com.br"
                  className="hover:text-ink-900 transition-colors"
                >
                  gustavo.mendonca@valorinvestimentos.com.br
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5511932212045"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition-colors"
                >
                  +55 11 93221-2045 · WhatsApp
                </a>
              </li>
              <li>São Paulo · Brasil</li>
            </ul>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[0.78rem] uppercase tracking-wider2 text-muted-500">
              <a
                href="https://www.linkedin.com/in/gustavo-trotta/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink-900 transition-colors"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com/gustavotmendonca"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink-900 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://www.youtube.com/@GustavoMendoncaInvest"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink-900 transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-paper-300/70 pt-8">
          <div className="flex flex-col gap-5 text-[0.72rem] text-muted-500 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-2">
              <span>© {new Date().getFullYear()} Gustavo Trotta. Todos os direitos reservados.</span>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Link
                  href="/politica-de-privacidade"
                  className="hover:text-ink-900 underline-offset-4 hover:underline"
                >
                  Política de Privacidade
                </Link>
                <Link
                  href="/planejamento-financeiro"
                  className="hover:text-ink-900 underline-offset-4 hover:underline"
                >
                  Planejamento Financeiro
                </Link>
              </div>
            </div>
            <span className="max-w-xl md:text-right">
              Material informativo. Não constitui recomendação de investimento. Valor Investimentos é escritório credenciado da XP Investimentos CCTVM S/A.
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
