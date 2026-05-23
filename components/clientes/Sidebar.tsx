"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const nav: NavItem[] = [
  {
    href: "/clientes",
    label: "Dashboard",
    icon: <path d="M3 12 12 4l9 8M5 10v10h14V10" />,
  },
  {
    href: "/clientes/mercado",
    label: "Cenário & Mercado",
    icon: (
      <>
        <path d="M3 17l5-6 4 4 8-9" />
        <path d="M14 6h6v6" />
      </>
    ),
  },
  {
    href: "/clientes/biblioteca",
    label: "Biblioteca",
    icon: (
      <>
        <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V5z" />
        <path d="M4 19a2 2 0 0 1 2-2h14" />
      </>
    ),
  },
  {
    href: "/clientes/research",
    label: "Research",
    icon: (
      <>
        <path d="M7 3h7l5 5v13H7z" />
        <path d="M14 3v5h5M9 13h6M9 17h4" />
      </>
    ),
  },
  {
    href: "/clientes/agenda",
    label: "Agenda",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="1" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </>
    ),
  },
  {
    href: "/clientes/perguntas",
    label: "Perguntas",
    icon: (
      <>
        <path d="M21 12a8 8 0 1 1-3.2-6.4L21 4l-1.5 4.3" />
        <path d="M9 10a3 3 0 1 1 4.5 2.6c-.6.3-1.5.8-1.5 1.9" />
        <circle cx="12" cy="17" r=".5" />
      </>
    ),
  },
];

const adminNav: NavItem[] = [
  {
    href: "/clientes/admin/leads",
    label: "Leads",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    href: "/clientes/admin/planos",
    label: "Planos",
    icon: (
      <>
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </>
    ),
  },
  {
    href: "/clientes/admin/artigos",
    label: "Artigos",
    icon: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </>
    ),
  },
];

export default function Sidebar({
  userLabel,
  role = "client",
}: {
  userLabel: string;
  role?: "client" | "admin";
}) {
  const pathname = usePathname();

  const renderItem = (item: NavItem) => {
    const isActive =
      item.href === "/clientes"
        ? pathname === "/clientes"
        : pathname.startsWith(item.href);
    return (
      <li key={item.href}>
        <Link
          href={item.href}
          className={`group relative flex items-center gap-4 rounded-sm px-4 py-3 text-[0.92rem] transition-colors duration-200 ${
            isActive
              ? "bg-ink-900 text-paper-50"
              : "text-ink-700 hover:bg-paper-200"
          }`}
        >
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-gold-400" />
          )}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            {item.icon}
          </svg>
          <span>{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="hidden w-72 shrink-0 border-r border-paper-300/70 bg-paper-100 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      {/* Brand */}
      <div className="border-b border-paper-300/70 px-7 py-7">
        <Link href="/" className="block">
          <div className="font-serif text-[1.15rem] tracking-editorial text-ink-900">
            Gustavo <span className="text-gold-500">Trotta</span>
          </div>
          <div className="mt-1.5 text-[0.65rem] uppercase tracking-wider3 text-muted-500">
            Área Exclusiva
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="space-y-1">{nav.map(renderItem)}</ul>

        {role === "admin" && (
          <>
            <div className="mx-4 mt-8 mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-paper-300/80" />
              <span className="text-[0.62rem] uppercase tracking-wider3 text-gold-600">
                Admin
              </span>
              <span className="h-px flex-1 bg-paper-300/80" />
            </div>
            <ul className="space-y-1">{adminNav.map(renderItem)}</ul>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-paper-300/70 px-7 py-6">
        <div className="text-[0.65rem] uppercase tracking-wider3 text-muted-500">
          Logado como
        </div>
        <div className="mt-1.5 truncate text-[0.92rem] text-ink-900">
          {userLabel}
        </div>
        {role === "admin" && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider2 text-gold-600">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            Administrador
          </div>
        )}
      </div>
    </aside>
  );
}
