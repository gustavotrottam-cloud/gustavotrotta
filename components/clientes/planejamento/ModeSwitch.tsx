"use client";

import { useState } from "react";

export default function ModeSwitch({
  name,
  defaultValue = "simplified",
  onChange,
}: {
  name: string;
  defaultValue?: "simplified" | "detailed";
  onChange?: (value: "simplified" | "detailed") => void;
}) {
  const [mode, setMode] = useState<"simplified" | "detailed">(defaultValue);

  const handle = (value: "simplified" | "detailed") => {
    setMode(value);
    onChange?.(value);
  };

  return (
    <>
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
              onClick={() => handle(opt.value)}
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
      <input type="hidden" name={name} value={mode} />
    </>
  );
}
