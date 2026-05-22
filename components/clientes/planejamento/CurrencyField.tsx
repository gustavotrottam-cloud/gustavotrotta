"use client";

import { useState } from "react";

function formatBRL(digits: string): string {
  // digits = só números (centavos)
  if (!digits) return "";
  const cents = Number(digits);
  const reais = cents / 100;
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parseToDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Input de moeda com máscara R$ 12.345,67.
 * Emite o valor numérico em REAIS (não centavos) via hidden input com `name`.
 */
export default function CurrencyField({
  name,
  defaultValue,
  placeholder = "R$ 0,00",
  required = false,
}: {
  name: string;
  defaultValue?: number;
  placeholder?: string;
  required?: boolean;
}) {
  // Estado guardado em centavos como string
  const initialDigits = defaultValue
    ? String(Math.round(defaultValue * 100))
    : "";
  const [digits, setDigits] = useState(initialDigits);

  const displayValue = digits ? formatBRL(digits) : "";
  const numericValue = digits ? (Number(digits) / 100).toString() : "";

  return (
    <>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={(e) => setDigits(parseToDigits(e.target.value))}
        placeholder={placeholder}
        className="block w-full border-b border-ink-900/25 bg-transparent py-3 font-serif text-[1.35rem] text-ink-900 outline-none transition-colors placeholder:text-muted-400 placeholder:font-sans placeholder:text-[1rem] focus:border-ink-900"
      />
      <input type="hidden" name={name} value={numericValue} required={required} />
    </>
  );
}
