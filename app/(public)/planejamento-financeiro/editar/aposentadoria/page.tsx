import { redirect } from "next/navigation";
import { loadOrCreatePlan, saveStep } from "../../actions";
import StepShell from "@/components/clientes/planejamento/StepShell";
import StepNav from "@/components/clientes/planejamento/StepNav";
import FieldGroup from "@/components/clientes/planejamento/FieldGroup";
import NumberField from "@/components/clientes/planejamento/NumberField";
import CurrencyField from "@/components/clientes/planejamento/CurrencyField";
import { getNextStep, getPreviousStep } from "@/lib/planejamento/steps";

export const dynamic = "force-dynamic";

export default async function AposentadoriaPage() {
  const plan = await loadOrCreatePlan();
  const r = plan.data.retirement ?? {};
  const prev = getPreviousStep("aposentadoria");

  async function submit(formData: FormData) {
    "use server";
    const targetAgeRaw = formData.get("targetAge");
    const incomeRaw = formData.get("desiredMonthlyIncomeBRL");

    const result = await saveStep("aposentadoria", {
      retirement: {
        targetAge: targetAgeRaw ? Number(targetAgeRaw) : undefined,
        desiredMonthlyIncomeBRL: incomeRaw ? Number(incomeRaw) : undefined,
        notes: (formData.get("notes") as string) || undefined,
      },
    });
    if (result.ok) {
      const next = getNextStep("aposentadoria");
      redirect(next?.path ?? "/planejamento-financeiro");
    }
  }

  return (
    <StepShell
      step="aposentadoria"
      completedSteps={plan.completed_steps}
      eyebrow="Etapa 02 · Objetivo de longo prazo"
      title={
        <>
          Em que momento você quer{" "}
          <span className="italic text-navy-800">reduzir o ritmo</span>?
        </>
      }
      intro="Pense em independência financeira mais do que em aposentadoria. A pergunta real: a partir de quando trabalhar deve ser uma escolha, não uma necessidade?"
    >
      <form action={submit}>
        <FieldGroup
          label="Idade-alvo de independência"
          hint="Não precisa ser exata — uma janela aproximada já basta pra calibrar a estratégia."
        >
          <NumberField
            name="targetAge"
            defaultValue={r.targetAge}
            placeholder="Idade-alvo"
            min={30}
            max={90}
            suffix="anos"
            required
          />
        </FieldGroup>

        <FieldGroup
          label="Renda mensal desejada na época"
          hint="Em reais de hoje (valor presente). O cálculo já desconta inflação ao projetar — você não precisa ajustar."
        >
          <CurrencyField
            name="desiredMonthlyIncomeBRL"
            defaultValue={r.desiredMonthlyIncomeBRL}
            placeholder="R$ 25.000,00"
            required
          />
        </FieldGroup>

        <FieldGroup
          label="Observações"
          hint="O que essa renda precisa cobrir? Plano de saúde, viagens, doações, sucessão? Quanto mais contexto, melhor a leitura do plano."
        >
          <textarea
            name="notes"
            defaultValue={r.notes ?? ""}
            rows={3}
            placeholder="Opcional"
            className="block w-full resize-none border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
          />
        </FieldGroup>

        <StepNav backHref={prev?.path} />
      </form>
    </StepShell>
  );
}
