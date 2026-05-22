import { redirect } from "next/navigation";
import { loadOrCreatePlan, saveStep } from "../../actions";
import StepShell from "@/components/clientes/planejamento/StepShell";
import StepNav from "@/components/clientes/planejamento/StepNav";
import AssumptionsFields from "@/components/clientes/planejamento/AssumptionsFields";
import {
  ASSUMPTIONS_PROFILES,
  type AssumptionsProfile,
} from "@/lib/planejamento/types";
import { getNextStep, getPreviousStep } from "@/lib/planejamento/steps";

export const dynamic = "force-dynamic";

export default async function PremissasPage() {
  const plan = await loadOrCreatePlan();
  const a = plan.data.assumptions ?? {};
  const prev = getPreviousStep("premissas");

  async function submit(formData: FormData) {
    "use server";
    const profileRaw = formData.get("assumptionsProfile") as
      | AssumptionsProfile
      | "";
    const profile: AssumptionsProfile | undefined =
      profileRaw && profileRaw in ASSUMPTIONS_PROFILES
        ? (profileRaw as AssumptionsProfile)
        : undefined;

    const preset = profile ? ASSUMPTIONS_PROFILES[profile] : null;

    const result = await saveStep("premissas", {
      assumptions: {
        profile,
        inflationAnnualPct: preset?.inflation,
        nominalAnnualPct: preset?.nominal,
        realAnnualPct: preset?.real,
        acknowledgedRanges: formData.get("acknowledgedRanges") === "true",
      },
    });
    if (result.ok) {
      const next = getNextStep("premissas");
      redirect(next?.path ?? "/planejamento-financeiro");
    }
  }

  return (
    <StepShell
      step="premissas"
      completedSteps={plan.completed_steps}
      eyebrow="Etapa 05 · Premissas econômicas"
      title={
        <>
          A régua que vai{" "}
          <span className="italic text-navy-800">medir o futuro</span>.
        </>
      }
      intro="Toda projeção depende de premissas. Não chutes otimistas — faixas honestas, calibradas com histórico brasileiro de longo prazo. Escolha o perfil que faz sentido para o seu horizonte e tolerância a risco."
    >
      <form action={submit}>
        <AssumptionsFields defaults={a} />
        <StepNav backHref={prev?.path} nextLabel="Ver projeção" />
      </form>
    </StepShell>
  );
}
