"use client";

import { useState } from "react";
import FieldGroup from "./FieldGroup";
import CurrencyField from "./CurrencyField";
import type { PlanningData } from "@/lib/planejamento/types";

export default function PatrimonyFields({
  defaults,
}: {
  defaults: NonNullable<PlanningData["patrimony"]>;
}) {
  const [mode, setMode] = useState<"simplified" | "detailed">(
    defaults.mode ?? "simplified"
  );
  const [hasOwnership, setHasOwnership] = useState<boolean>(
    defaults.hasOwnership ?? false
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
        <input type="hidden" name="patrimonyMode" value={mode} />
        <div className="mt-3 text-[0.85rem] leading-relaxed text-muted-500">
          {mode === "simplified"
            ? "Valor total por categoria — mais rápido."
            : "Detalhamento por classe de ativo — mais preciso."}
        </div>
      </FieldGroup>

      {/* Patrimônio financeiro */}
      {mode === "simplified" ? (
        <FieldGroup
          label="Patrimônio financeiro · total"
          hint="Soma de investimentos, renda fixa, ações, fundos, previdência e caixa."
        >
          <CurrencyField
            name="financialTotalBRL"
            defaultValue={defaults.financialTotalBRL}
            placeholder="R$ 0,00"
          />
        </FieldGroup>
      ) : (
        <FieldGroup label="Patrimônio financeiro · detalhado">
          <div className="space-y-5">
            <Row label="Renda fixa (CDB, debêntures, isentos, títulos públicos)" name="financialFixedIncome" value={defaults.financial?.fixedIncome} />
            <Row label="Ações e ETFs" name="financialStocks" value={defaults.financial?.stocks} />
            <Row label="Fundos (multimercado, hedge, etc.)" name="financialFunds" value={defaults.financial?.funds} />
            <Row label="Previdência privada (PGBL/VGBL pessoa física)" name="financialPrivatePension" value={defaults.financial?.privatePension} />
            <Row label="Previdência corporativa" name="financialCorporatePension" value={defaults.financial?.corporatePension} />
            <Row label="Caixa e contas remuneradas" name="financialCash" value={defaults.financial?.cash} />
          </div>
        </FieldGroup>
      )}

      {/* Ativos imobilizados */}
      {mode === "simplified" ? (
        <FieldGroup
          label="Ativos imobilizados · total"
          hint="Soma de imóveis, veículos, terrenos e demais bens físicos a valor de mercado."
        >
          <CurrencyField
            name="realAssetsTotalBRL"
            defaultValue={defaults.realAssetsTotalBRL}
            placeholder="R$ 0,00"
          />
        </FieldGroup>
      ) : (
        <FieldGroup label="Ativos imobilizados · detalhado">
          <div className="space-y-5">
            <Row label="Imóveis residenciais e comerciais" name="realProperties" value={defaults.realAssets?.properties} />
            <Row label="Veículos" name="realVehicles" value={defaults.realAssets?.vehicles} />
            <Row label="Terrenos" name="realLand" value={defaults.realAssets?.land} />
            <Row label="Outros bens físicos" name="realOther" value={defaults.realAssets?.other} />
          </div>
        </FieldGroup>
      )}

      {/* Participações societárias - toggle */}
      <FieldGroup
        label="Possui participação societária?"
        hint="Empresa própria ou cotas em sociedades. Empresa usada apenas para recebimento de salário não conta — a referência é valor econômico realizável."
      >
        <div className="inline-flex border border-ink-900/15 bg-paper-100 p-1">
          {(
            [
              { value: false, label: "Não" },
              { value: true, label: "Sim" },
            ]
          ).map((opt) => {
            const isActive = hasOwnership === opt.value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setHasOwnership(opt.value)}
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
        <input
          type="hidden"
          name="hasOwnership"
          value={hasOwnership ? "true" : "false"}
        />
      </FieldGroup>

      {hasOwnership && (
        <>
          <FieldGroup
            label="Valor econômico estimado das participações"
            hint="Informe apenas a sua parte — não o valuation total da empresa. Exemplo: se a empresa vale R$ 5 mi e você detém 50%, o valor a registrar é R$ 2,5 mi. Estimativa realista do valor de venda hoje; conservador é melhor que otimista."
          >
            <CurrencyField
              name="ownershipTotalBRL"
              defaultValue={defaults.ownershipTotalBRL}
              placeholder="R$ 0,00"
            />
          </FieldGroup>

          <FieldGroup
            label="Observações sobre as participações"
            hint="Setor, liquidez, expectativa de exit, complexidade societária. Espaço livre."
          >
            <textarea
              name="ownershipNotes"
              defaultValue={defaults.ownershipNotes ?? ""}
              rows={3}
              placeholder="Opcional"
              className="block w-full resize-none border-b border-ink-900/25 bg-transparent py-3 text-[1rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 focus:border-ink-900"
            />
          </FieldGroup>
        </>
      )}
    </>
  );
}

function Row({
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
