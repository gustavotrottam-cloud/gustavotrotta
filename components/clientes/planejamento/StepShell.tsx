import { ReactNode } from "react";
import PlanProgress from "./PlanProgress";
import type { StepId } from "@/lib/planejamento/steps";

export default function StepShell({
  step,
  completedSteps,
  eyebrow,
  title,
  intro,
  children,
}: {
  step: StepId;
  completedSteps: string[];
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-20 md:px-10 md:pt-40 md:pb-28">
      <PlanProgress currentStepId={step} completedSteps={completedSteps} />

      <header className="mb-12">
        <div className="text-[0.7rem] uppercase tracking-wider3 text-gold-600">
          {eyebrow}
        </div>
        <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.05] tracking-editorial text-ink-900 md:text-[2.8rem]">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 text-[1.05rem] leading-relaxed text-muted-600">
            {intro}
          </p>
        )}
      </header>

      {children}
    </div>
  );
}
