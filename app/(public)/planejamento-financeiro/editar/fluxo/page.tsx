import { redirect } from "next/navigation";
import { loadOrCreatePlan, saveStep } from "../../actions";
import StepShell from "@/components/clientes/planejamento/StepShell";
import StepNav from "@/components/clientes/planejamento/StepNav";
import CashflowFields from "@/components/clientes/planejamento/CashflowFields";
import { getNextStep, getPreviousStep } from "@/lib/planejamento/steps";
import type { CashflowMode } from "@/lib/planejamento/types";

export const dynamic = "force-dynamic";

function num(formData: FormData, key: string): number | undefined {
  const v = formData.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function FluxoPage() {
  const plan = await loadOrCreatePlan();
  const c = plan.data.cashflow ?? {};
  const prev = getPreviousStep("fluxo");

  async function submit(formData: FormData) {
    "use server";
    const mode = (formData.get("cashflowMode") as CashflowMode) || "simplified";

    const result = await saveStep("fluxo", {
      cashflow: {
        mode,
        totalMonthlyIncomeBRL:
          mode === "simplified" ? num(formData, "totalMonthlyIncomeBRL") : undefined,
        totalMonthlyExpensesBRL:
          mode === "simplified" ? num(formData, "totalMonthlyExpensesBRL") : undefined,
        income:
          mode === "detailed"
            ? {
                salary: num(formData, "incomeSalary"),
                proLabore: num(formData, "incomeProLabore"),
                dividends: num(formData, "incomeDividends"),
                rentalIncome: num(formData, "incomeRentalIncome"),
                variableIncome: num(formData, "incomeVariable"),
                other: num(formData, "incomeOther"),
              }
            : undefined,
        expenses:
          mode === "detailed"
            ? {
                fixed: num(formData, "expensesFixed"),
                leisure: num(formData, "expensesLeisure"),
                education: num(formData, "expensesEducation"),
                health: num(formData, "expensesHealth"),
                other: num(formData, "expensesOther"),
              }
            : undefined,
      },
    });
    if (result.ok) {
      const next = getNextStep("fluxo");
      redirect(next?.path ?? "/planejamento-financeiro");
    }
  }

  return (
    <StepShell
      step="fluxo"
      completedSteps={plan.completed_steps}
      eyebrow="Etapa 03 · Fluxo financeiro"
      title={
        <>
          Quanto entra e quanto sai{" "}
          <span className="italic text-navy-800">por mês</span>.
        </>
      }
      intro="A capacidade de poupança mensal é o motor de qualquer plano. Você escolhe entre preenchimento consolidado (mais rápido) ou detalhado por categoria."
    >
      <form action={submit}>
        <CashflowFields defaults={c} />
        <StepNav backHref={prev?.path} />
      </form>
    </StepShell>
  );
}
