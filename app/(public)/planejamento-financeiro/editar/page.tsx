import { redirect } from "next/navigation";
import { loadOrCreatePlan } from "../actions";
import { getStep, ACTIVE_STEPS } from "@/lib/planejamento/steps";

export const dynamic = "force-dynamic";

export default async function EditarRedirectPage() {
  const plan = await loadOrCreatePlan();
  const step = getStep(plan.current_step) ?? ACTIVE_STEPS[0];
  redirect(step.path);
}
