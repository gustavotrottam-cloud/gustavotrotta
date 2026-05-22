"use client";

import { useState } from "react";

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

/**
 * Grupo de cards selecionáveis (estilo radio premium).
 * Submete `name=value` no form quando algum é selecionado.
 */
export default function SelectCards({
  name,
  options,
  defaultValue,
  columns = 2,
  required = false,
  onChange,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  columns?: 1 | 2 | 3;
  required?: boolean;
  onChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useState<string>(defaultValue ?? "");

  const gridClass =
    columns === 3
      ? "sm:grid-cols-3"
      : columns === 2
      ? "sm:grid-cols-2"
      : "grid-cols-1";

  const handleClick = (value: string) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <>
      <div className={`grid gap-3 ${gridClass}`}>
        {options.map((opt) => {
          const isActive = selected === opt.value;
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => handleClick(opt.value)}
              className={`group relative flex flex-col items-start gap-1 border px-5 py-4 text-left transition-colors duration-200 ${
                isActive
                  ? "border-ink-900 bg-ink-900 text-paper-50"
                  : "border-ink-900/15 bg-paper-100 text-ink-900 hover:border-ink-900/40"
              }`}
            >
              {isActive && (
                <span className="absolute right-4 top-4 text-gold-400 text-[0.85rem]">
                  ✓
                </span>
              )}
              <span className="font-serif text-[1.05rem] leading-tight tracking-editorial">
                {opt.label}
              </span>
              {opt.description && (
                <span
                  className={`text-[0.78rem] leading-snug ${
                    isActive ? "text-paper-100/70" : "text-muted-500"
                  }`}
                >
                  {opt.description}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <input
        type="hidden"
        name={name}
        value={selected}
        required={required}
      />
    </>
  );
}
