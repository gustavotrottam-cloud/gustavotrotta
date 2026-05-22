import { ReactNode } from "react";

export default function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <div className="max-w-3xl">
      <div className="eyebrow">{eyebrow}</div>
      <h1 className="mt-4 font-serif text-[2.2rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.8rem]">
        {title}
      </h1>
      {intro && (
        <p className="mt-5 text-[1rem] leading-relaxed text-muted-600 md:text-[1.05rem]">
          {intro}
        </p>
      )}
    </div>
  );
}
