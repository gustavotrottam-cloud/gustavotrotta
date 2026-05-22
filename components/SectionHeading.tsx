import { ReactNode } from "react";
import Reveal from "./Reveal";

export default function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <Reveal>
          <div className="eyebrow">{eyebrow}</div>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-serif text-4xl leading-[1.05] tracking-editorial text-ink-900 md:text-5xl lg:text-[3.4rem]">
          {title}
        </h2>
      </Reveal>
      {intro && (
        <Reveal delay={0.1}>
          <p className="mt-6 text-[1.05rem] leading-relaxed text-muted-600 md:text-[1.1rem]">
            {intro}
          </p>
        </Reveal>
      )}
    </div>
  );
}
