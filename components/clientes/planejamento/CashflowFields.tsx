"use client";

import { useState } from "react";
import FieldGroup from "./FieldGroup";
import CurrencyField from "./CurrencyField";
import type { PlanningData } from "@/lib/planejamento/types";

export default function CashflowFields({
  defaults,
}: {
  defaults: NonNullable<PlanningData["cashflow"]>;
}) {
  const [mode, setMode] = useState<"simplified" | "detailed">(
    defaults.mode ?? "simplified"
  );

  return (
    <>
      {/* Mode toggle */}
      <FieldGroup label="Como prefere preencher?">
        <div className="inline-flex border border-ink-900/15 bg-paper-100 p-1">
          {(
            [
              { value: "simplified" as const, label: "Simplificado" },
              { value: "detailed" as const, label: "Detalhado" },
            ]
          ).map((opt) => {
            const isActive = mode === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMode(opt.value)}
                className={`px-5 py-2 text-[0.75rem] uppercase tracking-wider2 transition-colors ${
                  isActive
                    ? "bg-ink-900 text-paper-50"
                    : "text-muted-500 hover:text-ink-900"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="cashflowMode" value={mode} />
        <div className="mt-3 text-[0.85rem] leading-relaxed text-muted-500">
          {mode === "simplified"
            ? "Valores consolidados — receita total e despesa total."
            : "Detalhado por fonte de receita e categoria de despesa."}
        </div>
      </FieldGroup>

      {mode === "simplified" ? (
        <>
          <FieldGroup label="Receita mensal total" hint="Soma de salário, pró-labore, aluguéis e demais entradas.">
            <CurrencyField
              name="totalMonthlyIncomeBRL"
              defaultValue={defaults.totalMonthlyIncomeBRL}
            />
          </FieldGroup>
          <FieldGroup label="Despesa mensal total" hint="Tudo que sai por mês — fixas + variáveis + lazer.">
            <CurrencyField
              name="totalMonthlyExpensesBRL"
              defaultValue={defaults.totalMonthlyExpensesBRL}
            />
          </FieldGroup>
        </>
      ) : (
        <>
          <FieldGroup label="Receitas mensais">
            <div className="space-y-5">
              <DetailedRow
                label="Salário CLT"
                name="incomeSalary"
                value={defaults.income?.salary}
              />
              <DetailedRow
                label="Pró-labore"
                name="incomeProLabore"
                value={defaults.income?.proLabore}
              />
              <DetailedRow
                label="Dividendos"
                name="incomeDividends"
                value={defaults.income?.dividends}
              />
              <DetailedRow
                label="Aluguéis"
                name="incomeRentalIncome"
                value={defaults.income?.rentalIncome}
              />
              <DetailedRow
                label="Renda variável"
                name="incomeVariable"
                value={defaults.income?.variableIncome}
              />
              <DetailedRow
                label="Outras"
                name="incomeOther"
                value={defaults.income?.other}
              />
            </div>
          </FieldGroup>
          <FieldGroup label="Despesas mensais">
            <div className="space-y-5">
              <DetailedRow
                label="Fixas (moradia, contas, transporte)"
                name="expensesFixed"
                value={defaults.expenses?.fixed}
              />
              <DetailedRow
                label="Lazer"
                name="expensesLeisure"
                value={defaults.expenses?.leisure}
              />
              <DetailedRow
                label="Educação"
                name="expensesEducation"
                value={defaults.expenses?.education}
              />
              <DetailedRow
                label="Saúde"
                name="expensesHealth"
                value={defaults.expenses?.health}
              />
              <DetailedRow
                label="Outras"
                name="expensesOther"
                value={defaults.expenses?.other}
              />
            </div>
          </FieldGroup>
        </>
      )}
    </>
  );
}

function DetailedRow({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value?: number;
}) {
  return (
    <div className="grid items-baseline gap-3 md:grid-cols-[1fr_220px]">
      <div className="text-[0.92rem] text-muted-600">{label}</div>
      <CurrencyField name={name} defaultValue={value} />
    </div>
  );
}
