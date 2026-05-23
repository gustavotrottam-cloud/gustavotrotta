import type { PlanningData } from "./types";

/**
 * Helpers para extrair valores agregados do `data` JSONB
 * — funciona tanto no modo simplificado quanto no detalhado.
 */

export function sumValues(
  obj: Record<string, number | string | undefined> | undefined
): number {
  if (!obj) return 0;
  return Object.values(obj).reduce<number>((acc, v) => {
    // Ignora strings (campos como otherDescription) — só soma números
    if (typeof v !== "number") return acc;
    return acc + (Number.isFinite(v) ? v : 0);
  }, 0);
}

export function getMonthlyIncome(cashflow: PlanningData["cashflow"]): number {
  if (!cashflow) return 0;
  if (cashflow.mode === "detailed") return sumValues(cashflow.income);
  return cashflow.totalMonthlyIncomeBRL ?? 0;
}

export function getMonthlyExpenses(cashflow: PlanningData["cashflow"]): number {
  if (!cashflow) return 0;
  if (cashflow.mode === "detailed") return sumValues(cashflow.expenses);
  return cashflow.totalMonthlyExpensesBRL ?? 0;
}

export function getMonthlySavings(cashflow: PlanningData["cashflow"]): number {
  return Math.max(0, getMonthlyIncome(cashflow) - getMonthlyExpenses(cashflow));
}

export function getFinancialTotal(patrimony: PlanningData["patrimony"]): number {
  if (!patrimony) return 0;
  if (patrimony.mode === "detailed") return sumValues(patrimony.financial);
  return patrimony.financialTotalBRL ?? 0;
}

export function getRealAssetsTotal(patrimony: PlanningData["patrimony"]): number {
  if (!patrimony) return 0;
  if (patrimony.mode === "detailed") return sumValues(patrimony.realAssets);
  return patrimony.realAssetsTotalBRL ?? 0;
}

export function getOwnershipTotal(patrimony: PlanningData["patrimony"]): number {
  if (!patrimony) return 0;
  return patrimony.hasOwnership ? patrimony.ownershipTotalBRL ?? 0 : 0;
}

/**
 * Patrimônio total líquido considerado pra projeção.
 * Por padrão inclui só financeiro + societário (são realizáveis).
 * Ativos imobilizados ficam fora — moradia e veículos não geram renda passiva.
 */
export function getInvestablePatrimony(patrimony: PlanningData["patrimony"]): number {
  return getFinancialTotal(patrimony) + getOwnershipTotal(patrimony);
}

export function getTotalPatrimony(patrimony: PlanningData["patrimony"]): number {
  return (
    getFinancialTotal(patrimony) +
    getRealAssetsTotal(patrimony) +
    getOwnershipTotal(patrimony)
  );
}

/** Checa se o plano tem dados suficientes pra gerar projeções */
export function isReadyForProjection(data: PlanningData): {
  ready: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!data.personal?.age) missing.push("idade atual");
  if (!data.retirement?.targetAge) missing.push("idade-alvo");
  if (!data.retirement?.desiredMonthlyIncomeBRL) missing.push("renda desejada");
  if (!data.cashflow) missing.push("fluxo financeiro");
  if (!data.patrimony) missing.push("patrimônio");
  if (!data.assumptions?.realAnnualPct) missing.push("premissas econômicas");
  return { ready: missing.length === 0, missing };
}
