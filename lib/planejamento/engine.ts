import type { PlanningData } from "./types";
import {
  getMonthlySavings,
  getInvestablePatrimony,
  getMonthlyIncome,
  getMonthlyExpenses,
} from "./aggregation";

/**
 * Engine de projeção patrimonial.
 *
 * Premissas:
 *  - Todos os valores em REAIS DE HOJE (valor presente).
 *  - Taxa de retorno usada é a REAL (já descontada de inflação).
 *  - Aportes mensais continuam até a idade-alvo. Depois, retiradas
 *    mensais iguais à renda desejada começam (modo "consumindo").
 *
 *  Fórmula: cada mês, wealth = wealth × (1 + r_mensal) + aporte − retirada
 *  onde r_mensal = (1 + r_anual)^(1/12) − 1
 */

export type EngineInput = {
  currentAge: number;
  targetAge: number;
  desiredMonthlyIncomeBRL: number;
  initialPatrimonyBRL: number;
  monthlySavingsBRL: number;
  realReturnAnnualPct: number;
  /** Até que idade projetar (default 95) */
  projectUntilAge?: number;
};

export type ProjectionPoint = {
  age: number;
  wealth: number;
  /** Renda mensal que esse patrimônio sustentaria como perpetuidade */
  sustainableIncome: number;
  /** Fase atual: 'accumulating' (pré-aposentadoria) ou 'distributing' (pós) */
  phase: "accumulating" | "distributing";
};

export type EngineResults = {
  inputs: EngineInput;
  derived: {
    monthlyRealRate: number;
    yearsUntilTarget: number;
  };
  projection: ProjectionPoint[];
  atTargetAge: {
    projectedWealthBRL: number;
    sustainableIncomePerpetualBRL: number;
    sustainableIncome25YearsBRL: number;
  };
  goal: {
    desiredMonthlyIncomeBRL: number;
    /** Patrimônio necessário pra gerar renda desejada como perpetuidade */
    wealthNeededPerpetualBRL: number;
    /** Patrimônio necessário considerando consumo em 25 anos */
    wealthNeeded25YearsBRL: number;
  };
  feasibility: {
    /** Idade em que o patrimônio acumulado atinge wealthNeededPerpetual */
    estimatedIFAge: number | null;
    /** Idade em que, no cenário atual, o patrimônio chega a zero (se chegar) */
    depletionAge: number | null;
    /** Aporte mensal adicional necessário pra atingir wealthNeededPerpetual na idade-alvo */
    additionalMonthlySavingsBRL: number | null;
    /** Aporte mensal TOTAL necessário pra atingir o nível de manutenção
     *  (= patrimônio em que juros reais cobrem perpetuamente a renda desejada)
     *  exatamente na idade-alvo. Clamped >= 0. */
    requiredMonthlySavingsBRL: number | null;
    /** Renda mensal sustentável real na idade-alvo */
    sustainableMonthlyIncomeAtTargetBRL: number;
    gapPerpetualBRL: number;  // sustentável − desejada (negativo = falta)
  };
};

/** Converte taxa anual em mensal (forma composta correta) */
function annualToMonthly(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

/** PV de anuidade: capital necessário pra pagar `pmt` ao mês por `n` meses a juros `r` */
function pvAnnuity(pmt: number, r: number, n: number): number {
  if (r === 0) return pmt * n;
  return pmt * (1 - Math.pow(1 + r, -n)) / r;
}

export function computePlan(input: EngineInput): EngineResults {
  const projectUntilAge = input.projectUntilAge ?? 95;
  const r = annualToMonthly(input.realReturnAnnualPct);
  const annualR = input.realReturnAnnualPct / 100;
  const yearsUntilTarget = Math.max(0, input.targetAge - input.currentAge);

  const projection: ProjectionPoint[] = [];
  let wealth = input.initialPatrimonyBRL;
  let depletionAge: number | null = null;
  let estimatedIFAge: number | null = null;
  let projectedWealthAtTarget = 0;

  // Patrimônio necessário pra renda perpétua (PV de perpetuidade): C / r
  const wealthNeededPerpetual = annualR > 0
    ? (input.desiredMonthlyIncomeBRL * 12) / annualR
    : input.desiredMonthlyIncomeBRL * 12 * 50; // fallback

  // Patrimônio necessário pra 25 anos (300 meses)
  const wealthNeeded25Years = pvAnnuity(
    input.desiredMonthlyIncomeBRL,
    r,
    25 * 12
  );

  // Snapshot inicial
  projection.push({
    age: input.currentAge,
    wealth,
    sustainableIncome: wealth * annualR / 12,
    phase: input.currentAge >= input.targetAge ? "distributing" : "accumulating",
  });

  // Projeta ano a ano (composta mês a mês internamente)
  for (let age = input.currentAge + 1; age <= projectUntilAge; age++) {
    const phase: "accumulating" | "distributing" =
      age <= input.targetAge ? "accumulating" : "distributing";

    for (let m = 0; m < 12; m++) {
      wealth = wealth * (1 + r);
      if (phase === "accumulating") {
        wealth += input.monthlySavingsBRL;
      } else {
        wealth -= input.desiredMonthlyIncomeBRL;
      }
    }

    if (age === input.targetAge) {
      projectedWealthAtTarget = Math.max(0, wealth);
    }

    if (
      estimatedIFAge === null &&
      wealth >= wealthNeededPerpetual &&
      input.desiredMonthlyIncomeBRL > 0
    ) {
      estimatedIFAge = age;
    }

    if (wealth <= 0 && depletionAge === null && age > input.targetAge) {
      depletionAge = age;
    }

    projection.push({
      age,
      wealth: Math.max(0, wealth),
      sustainableIncome: Math.max(0, wealth) * annualR / 12,
      phase,
    });

    if (wealth <= 0 && age > input.targetAge) break;
  }

  // Se já está na idade-alvo (ou passou), o patrimônio "no target" é o inicial
  if (input.currentAge >= input.targetAge) {
    projectedWealthAtTarget = input.initialPatrimonyBRL;
  }

  const sustainableMonthlyAtTarget = projectedWealthAtTarget * annualR / 12;
  const sustainable25 = pvAnnuity(
    projectedWealthAtTarget / (25 * 12),
    r,
    25 * 12
  );

  // Aporte mensal TOTAL pra atingir wealthNeededPerpetual na idade-alvo.
  // FV alvo = PV*(1+r)^n + PMT * ((1+r)^n - 1)/r  =>  resolve pra PMT
  let requiredMonthlySavings: number | null = null;
  let additionalMonthlySavings: number | null = null;
  if (yearsUntilTarget > 0) {
    const n = yearsUntilTarget * 12;
    const fvOfInitial = input.initialPatrimonyBRL * Math.pow(1 + r, n);
    const factor = (Math.pow(1 + r, n) - 1) / r;
    const requiredPMT = (wealthNeededPerpetual - fvOfInitial) / factor;
    requiredMonthlySavings = Math.max(0, requiredPMT);
    additionalMonthlySavings = Math.max(0, requiredPMT - input.monthlySavingsBRL);
  }

  return {
    inputs: input,
    derived: {
      monthlyRealRate: r,
      yearsUntilTarget,
    },
    projection,
    atTargetAge: {
      projectedWealthBRL: Math.round(projectedWealthAtTarget),
      sustainableIncomePerpetualBRL: Math.round(sustainableMonthlyAtTarget),
      sustainableIncome25YearsBRL: Math.round(Math.max(0, sustainable25)),
    },
    goal: {
      desiredMonthlyIncomeBRL: input.desiredMonthlyIncomeBRL,
      wealthNeededPerpetualBRL: Math.round(wealthNeededPerpetual),
      wealthNeeded25YearsBRL: Math.round(wealthNeeded25Years),
    },
    feasibility: {
      estimatedIFAge,
      depletionAge,
      additionalMonthlySavingsBRL:
        additionalMonthlySavings !== null
          ? Math.round(additionalMonthlySavings)
          : null,
      requiredMonthlySavingsBRL:
        requiredMonthlySavings !== null
          ? Math.round(requiredMonthlySavings)
          : null,
      sustainableMonthlyIncomeAtTargetBRL: Math.round(sustainableMonthlyAtTarget),
      gapPerpetualBRL: Math.round(
        sustainableMonthlyAtTarget - input.desiredMonthlyIncomeBRL
      ),
    },
  };
}

/** Atalho: monta input do engine a partir do PlanningData */
export function planToEngineInput(
  data: PlanningData
): EngineInput | null {
  const currentAge = data.personal?.age;
  const targetAge = data.retirement?.targetAge;
  const desired = data.retirement?.desiredMonthlyIncomeBRL;
  const realAnnual = data.assumptions?.realAnnualPct;

  if (!currentAge || !targetAge || !desired || realAnnual === undefined)
    return null;

  return {
    currentAge,
    targetAge,
    desiredMonthlyIncomeBRL: desired,
    initialPatrimonyBRL: getInvestablePatrimony(data.patrimony),
    monthlySavingsBRL: getMonthlySavings(data.cashflow),
    realReturnAnnualPct: realAnnual,
  };
}

/** Atalho conveniente */
export function computeFromData(data: PlanningData): EngineResults | null {
  const input = planToEngineInput(data);
  if (!input) return null;
  return computePlan(input);
}

/** Helpers utilitários expostos pra UI também */
export const summaryHelpers = {
  monthlyIncome: getMonthlyIncome,
  monthlyExpenses: getMonthlyExpenses,
  monthlySavings: getMonthlySavings,
  investablePatrimony: getInvestablePatrimony,
};
