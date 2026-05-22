import Link from "next/link";
import { ACTIVE_STEPS, type StepId } from "@/lib/planejamento/steps";

export default function PlanProgress({
  currentStepId,
  completedSteps,
}: {
  currentStepId: StepId;
  completedSteps: string[];
}) {
  const completedSet = new Set(completedSteps);

  return (
    <nav aria-label="Progresso do planejamento" className="mb-12">
      <div className="text-[0.65rem] uppercase tracking-wider3 text-muted-500">
        Progresso
      </div>
      <ol className="mt-4 grid gap-1 sm:grid-cols-3">
        {ACTIVE_STEPS.map((step) => {
          const isActive = step.id === currentStepId;
          const isDone = completedSet.has(step.id);
          const status = isActive ? "active" : isDone ? "done" : "pending";

          const baseRow =
            "relative block border-t-2 pt-3 transition-colors duration-300";
          const borderClass =
            status === "active"
              ? "border-ink-900"
              : status === "done"
              ? "border-gold-500"
              : "border-paper-300";

          const inner = (
            <>
              <div className="flex items-baseline justify-between">
                <span
                  className={`text-[0.65rem] uppercase tracking-wider2 ${
                    status === "active"
                      ? "text-ink-900"
                      : status === "done"
                      ? "text-gold-600"
                      : "text-muted-400"
                  }`}
                >
                  {step.eyebrow}
                </span>
                {status === "done" && (
                  <span aria-hidden className="text-gold-500 text-[0.85rem]">
                    ✓
                  </span>
                )}
              </div>
              <div
                className={`mt-1 font-serif text-[1.05rem] tracking-editorial ${
                  status === "pending" ? "text-muted-500" : "text-ink-900"
                }`}
              >
                {step.title}
              </div>
            </>
          );

          // Done steps are clickable (revisit). Active and pending are not.
          if (status === "done") {
            return (
              <li key={step.id}>
                <Link
                  href={step.path}
                  className={`${baseRow} ${borderClass} hover:opacity-80`}
                >
                  {inner}
                </Link>
              </li>
            );
          }
          return (
            <li key={step.id}>
              <div className={`${baseRow} ${borderClass}`}>{inner}</div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
