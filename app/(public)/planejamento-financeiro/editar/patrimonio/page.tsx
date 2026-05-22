import { redirect } from "next/navigation";
import { loadOrCreatePlan, saveStep } from "../../actions";
import StepShell from "@/components/clientes/planejamento/StepShell";
import StepNav from "@/components/clientes/planejamento/StepNav";
import PatrimonyFields from "@/components/clientes/planejamento/PatrimonyFields";
import { getNextStep, getPreviousStep } from "@/lib/planejamento/steps";
import type { CashflowMode } from "@/lib/planejamento/types";

export const dynamic = "force-dynamic";

function num(formData: FormData, key: string): number | undefined {
  const v = formData.get(key);
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function PatrimonioPage() {
  const plan = await loadOrCreatePlan();
  const pat = plan.data.patrimony ?? {};
  const prev = getPreviousStep("patrimonio");

  async function submit(formData: FormData) {
    "use server";
    const mode = (formData.get("patrimonyMode") as CashflowMode) || "simplified";
    const hasOwnership = formData.get("hasOwnership") === "true";

    const result = await saveStep("patrimonio", {
      patrimony: {
        mode,
        financialTotalBRL:
          mode === "simplified" ? num(formData, "financialTotalBRL") : undefined,
        realAssetsTotalBRL:
          mode === "simplified" ? num(formData, "realAssetsTotalBRL") : undefined,
        financial:
          mode === "detailed"
            ? {
                fixedIncome: num(formData, "financialFixedIncome"),
                stocks: num(formData, "financialStocks"),
                funds: num(formData, "financialFunds"),
                privatePension: num(formData, "financialPrivatePension"),
                corporatePension: num(formData, "financialCorporatePension"),
                cash: num(formData, "financialCash"),
              }
            : undefined,
        realAssets:
          mode === "detailed"
            ? {
                properties: num(formData, "realProperties"),
                vehicles: num(formData, "realVehicles"),
                land: num(formData, "realLand"),
                other: num(formData, "realOther"),
              }
            : undefined,
        hasOwnership,
        ownershipTotalBRL: hasOwnership
          ? num(formData, "ownershipTotalBRL")
          : undefined,
        ownershipNotes: hasOwnership
          ? (formData.get("ownershipNotes") as string) || undefined
          : undefined,
      },
    });
    if (result.ok) {
      const next = getNextStep("patrimonio");
      redirect(next?.path ?? "/planejamento-financeiro");
    }
  }

  return (
    <StepShell
      step="patrimonio"
      completedSteps={plan.completed_steps}
      eyebrow="Etapa 04 · Estrutura patrimonial"
      title={
        <>
          O retrato do que você{" "}
          <span className="italic text-navy-800">acumulou até aqui</span>.
        </>
      }
      intro="Patrimônio financeiro, ativos imobilizados e participações societárias. Sem precisão milimétrica — uma fotografia honesta basta. Você pode atualizar quando quiser."
    >
      <form action={submit}>
        <PatrimonyFields defaults={pat} />
        <StepNav backHref={prev?.path} />
      </form>
    </StepShell>
  );
}
