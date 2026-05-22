import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardCard({
  eyebrow,
  title,
  children,
  href,
  cta,
  accent = false,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  href?: string;
  cta?: string;
  accent?: boolean;
  className?: string;
}) {
  const inner = (
    <article
      className={`group relative h-full overflow-hidden border ${
        accent
          ? "border-ink-900 bg-ink-900 text-paper-100"
          : "border-paper-300/70 bg-paper-100 text-ink-900"
      } px-7 py-7 transition-all duration-300 ${
        href ? "hover:-translate-y-0.5 hover:shadow-lg" : ""
      } ${className}`}
    >
      <span
        className={`absolute left-0 top-0 bottom-0 w-[2px] ${
          accent ? "bg-gold-400" : "bg-gold-500/0 group-hover:bg-gold-500"
        } transition-colors duration-300`}
      />
      {eyebrow && (
        <div
          className={`text-[0.68rem] uppercase tracking-wider2 ${
            accent ? "text-gold-400" : "text-gold-600"
          }`}
        >
          {eyebrow}
        </div>
      )}
      <h3
        className={`mt-3 font-serif text-[1.5rem] leading-[1.15] tracking-editorial md:text-[1.7rem] ${
          accent ? "text-paper-100" : "text-ink-900"
        }`}
      >
        {title}
      </h3>
      {children && (
        <div
          className={`mt-4 text-[0.95rem] leading-relaxed ${
            accent ? "text-paper-100/75" : "text-muted-600"
          }`}
        >
          {children}
        </div>
      )}
      {cta && href && (
        <div
          className={`mt-6 inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-wider2 ${
            accent ? "text-paper-100" : "text-ink-900"
          }`}
        >
          {cta}
          <span
            aria-hidden
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      )}
    </article>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}
