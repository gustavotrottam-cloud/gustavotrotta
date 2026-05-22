import { redirect } from "next/navigation";
import { loadOrCreatePlan } from "../actions";
import { readPlanIdentity } from "@/lib/planejamento/session";

/**
 * Guard de acesso ao fluxo de etapas:
 *  - Cliente logado: livre, segue direto
 *  - Anônimo SEM lead capturado: redireciona pra /contato
 *  - Anônimo COM lead capturado: segue
 *
 * Como /contato chama loadOrCreatePlan no submit, sabemos que ao chegar aqui
 * o plan já existe. Se for anon sem lead_id, é porque pulou o gate.
 */
export default async function EditarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const identity = await readPlanIdentity();

  // Logged: passa direto, sem precisar capturar
  if (identity?.kind === "user") {
    return <>{children}</>;
  }

  // Anon: garante que tem lead capturado
  const plan = await loadOrCreatePlan();
  if (!plan.lead_id) {
    redirect("/planejamento-financeiro/contato");
  }

  return <>{children}</>;
}
