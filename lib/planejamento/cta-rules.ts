/**
 * Regras de roteamento dos CTAs no final do planejamento financeiro.
 *
 * Lógica de negócio: clientes com patrimônio financeiro suficiente são
 * direcionados pra abertura de conta direta com o assessor. Quem está
 * abaixo do threshold é roteado pro time (atendimento por especialista
 * que dá vazão a esse perfil sem sobrecarregar o assessor sênior).
 */

/** Patrimônio financeiro mínimo (em BRL) pra abertura de conta direta. */
export const ACCOUNT_OPENING_THRESHOLD_BRL = 300_000;

export type CtaFlow =
  | { kind: "account-opening"; financialPatrimony: number }
  | { kind: "team-handoff"; financialPatrimony: number };

/**
 * Decide qual fluxo de CTA mostrar com base no patrimônio financeiro
 * declarado pelo usuário no planejamento.
 */
export function resolveCtaFlow(financialPatrimony: number): CtaFlow {
  if (financialPatrimony >= ACCOUNT_OPENING_THRESHOLD_BRL) {
    return { kind: "account-opening", financialPatrimony };
  }
  return { kind: "team-handoff", financialPatrimony };
}
