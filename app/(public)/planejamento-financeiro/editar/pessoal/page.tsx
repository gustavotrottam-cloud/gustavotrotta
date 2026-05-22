import { redirect } from "next/navigation";
import { loadOrCreatePlan, saveStep } from "../../actions";
import StepShell from "@/components/clientes/planejamento/StepShell";
import StepNav from "@/components/clientes/planejamento/StepNav";
import FieldGroup from "@/components/clientes/planejamento/FieldGroup";
import NumberField from "@/components/clientes/planejamento/NumberField";
import MaritalSection from "@/components/clientes/planejamento/MaritalSection";
import { getNextStep } from "@/lib/planejamento/steps";
import type {
  MaritalStatus,
  PropertyRegime,
} from "@/lib/planejamento/types";

export const dynamic = "force-dynamic";

const STATES_WITH_REGIME: MaritalStatus[] = ["married", "stable_union"];

export default async function PessoalPage() {
  const plan = await loadOrCreatePlan();
  const p = plan.data.personal ?? {};

  async function submit(formData: FormData) {
    "use server";
    const ageRaw = formData.get("age");
    const dependentsRaw = formData.get("dependentsCount");
    const childrenRaw = formData.get("childrenCount");
    const marital =
      (formData.get("maritalStatus") as MaritalStatus) || undefined;
    const regimeRaw =
      (formData.get("propertyRegime") as PropertyRegime) || undefined;

    const propertyRegime =
      marital && STATES_WITH_REGIME.includes(marital) ? regimeRaw : undefined;

    const result = await saveStep("pessoal", {
      personal: {
        age: ageRaw ? Number(ageRaw) : undefined,
        maritalStatus: marital,
        propertyRegime,
        dependentsCount: dependentsRaw ? Number(dependentsRaw) : undefined,
        childrenCount: childrenRaw ? Number(childrenRaw) : undefined,
        notes: (formData.get("notes") as string) || undefined,
      },
    });
    if (result.ok) {
      const next = getNextStep("pessoal");
      redirect(next?.path ?? "/planejamento-financeiro");
    }
  }

  return (
    <StepShell
      step="pessoal"
      completedSteps={plan.completed_steps}
      eyebrow="Etapa 01 · Sobre você"
      title={
        <>
          Vamos começar por{" "}
          <span className="italic text-navy-800">você</span>.
        </>
      }
      intro="Idade, estado civil e dependentes. Esses dados ancoram toda a projeção patrimonial que faremos juntos."
    >
      <form action={submit}>
        <FieldGroup label="Idade atual">
          <NumberField
            name="age"
            defaultValue={p.age}
            placeholder="Sua idade"
            min={18}
            max={100}
            suffix="anos"
            required
          />
        </FieldGroup>

        <MaritalSection
          maritalDefault={p.maritalStatus}
          regimeDefault={p.propertyRegime}
        />

        <FieldGroup label="Número de filhos">
          <NumberField
            name="childrenCount"
            defaultValue={p.childrenCount}
            placeholder="0"
            min={0}
            max={20}
            suffix="filhos"
          />
        </FieldGroup>

        <FieldGroup
          label="Dependentes adicionais"
          hint="Pais, sogros, irmãos, etc. — pessoas que dependem financeiramente de você."
        >
          <NumberField
            name="dependentsCount"
            defaultValue={p.dependentsCount}
            placeholder="0"
            min={0}
            max={20}
            suffix="pessoas"
          />
        </FieldGroup>

        <FieldGroup
          label="Observações"
          hint="Espaço livre. Contexto familiar, planos de mudança, qualquer coisa relevante."
        >
          <textarea
            name="notes"
            defaultValue={p.notes ?? ""}
            rows={3}
            placeholder="Opcional — qualquer informação que ajude a montar o seu plano"
            className="block w-full resize-none border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
          />
        </FieldGroup>

        <StepNav backHref="/planejamento-financeiro" />
      </form>
    </StepShell>
  );
}
