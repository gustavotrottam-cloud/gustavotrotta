"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "./Container";

const links = [
  { href: "/#como-penso", label: "Como penso" },
  { href: "/sobre", label: "Sobre" },
  { href: "/#areas", label: "Áreas" },
  { href: "/#em-circulacao", label: "Em circulação" },
  { href: "/#midia", label: "Mídia" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-editorial ${
        scrolled
          ? "bg-paper-100/90 backdrop-blur-md border-b border-paper-300/60"
          : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="font-serif text-[1.25rem] tracking-editorial text-ink-900"
          >
            Gustavo <span className="text-gold-500">Trotta</span>
          </Link>

          <nav className="hidden gap-10 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[0.85rem] text-muted-500 transition-colors duration-300 hover:text-ink-900"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex lg:items-center lg:gap-5">
            <a
              href="https://wa.me/5511932212045?text=Ol%C3%A1%20Gustavo%2C%20gostaria%20de%20agendar%20uma%20conversa."
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.7rem] uppercase tracking-wider2 text-muted-500 transition-colors duration-300 hover:text-ink-900"
            >
              Agendar conversa
            </a>
            <Link
              href="/planejamento-financeiro"
              className="inline-flex items-center gap-2 bg-ink-900 px-5 py-2.5 text-[0.7rem] uppercase tracking-wider2 text-paper-50 transition-all duration-300 hover:bg-navy-800"
            >
              Planejamento Financeiro
              <span aria-hidden>→</span>
            </Link>
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="lg:hidden text-ink-900"
          >
            <span className="block h-px w-7 bg-ink-900 mb-1.5" />
            <span className="block h-px w-7 bg-ink-900 mb-1.5" />
            <span className="block h-px w-5 bg-ink-900" />
          </button>
        </div>
      </Container>

      {open && (
        <div className="lg:hidden border-t border-paper-300/60 bg-paper-100/95 backdrop-blur-md">
          <Container>
            <nav className="flex flex-col gap-5 py-8">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-2xl text-ink-900"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/planejamento-financeiro"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex w-fit items-center gap-2 bg-ink-900 px-5 py-2.5 text-[0.7rem] uppercase tracking-wider2 text-paper-50"
              >
                Planejamento Financeiro
                <span aria-hidden>→</span>
              </Link>
              <a
                href="https://wa.me/5511932212045?text=Ol%C3%A1%20Gustavo%2C%20gostaria%20de%20agendar%20uma%20conversa."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex w-fit items-center text-[0.78rem] uppercase tracking-wider2 text-muted-500"
              >
                Agendar conversa →
              </a>
            </nav>
          </Container>
        </div>
      )}
    </header>
  );
}
