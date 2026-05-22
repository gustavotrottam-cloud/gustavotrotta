"use client";

import { useState } from "react";
import FieldGroup from "./FieldGroup";
import {
  ASSUMPTIONS_PROFILES,
  type AssumptionsProfile,
  type PlanningData,
} from "@/lib/planejamento/types";

const PROFILE_ORDER: AssumptionsProfile[] = [
  "conservative",
  "moderate",
  "optimistic",
];

export default function AssumptionsFields({
  defaults,
}: {
  defaults: NonNullable<PlanningData["assumptions"]>;
}) {
  const [profile, setProfile] = useState<AssumptionsProfile | "">(
    defaults.profile ?? ""
  );

  const selected = profile ? ASSUMPTIONS_PROFILES[profile] : null;

  return (
    <>
      <FieldGroup
        label="Perfil de premissas econômicas"
        hint="Cada perfil já vem com inflação e juros nominais calibrados — o retorno real é calculado descontando inflação. Mais conservador = projeções mais cautelosas."
      >
        <div className="grid gap-3 md:grid-cols-3">
          {PROFILE_ORDER.map((key) => {
            const p = ASSUMPTIONS_PROFILES[key];
            const isActive = profile === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setProfile(key)}
                className={`group flex flex-col items-start gap-3 border p-5 text-left transition-colors duration-200 ${
                  isActive
                    ? "border-ink-900 bg-ink-900 text-paper-50"
                    : "border-ink-900/15 bg-paper-100 text-ink-900 hover:border-ink-900/40"
                }`}
              >
                <div className="flex w-full items-baseline justify-between">
                  <span className="font-serif text-[1.15rem] tracking-editorial">
                    {p.label}
                  </span>
                  {isActive && (
                    <span aria-hidden className="text-gold-400 text-[0.85rem]">
                      ✓
                    </span>
                  )}
                </div>
                <div
                  className={`text-[1.6rem] font-serif tracking-editorial ${
                    isActive ? "text-gold-400" : "text-navy-800"
                  }`}
                >
                  {p.real.toFixed(1).replace(".", ",")}%
                  <span
                    className={`ml-1 text-[0.75rem] uppercase tracking-wider2 ${
                      isActive ? "text-paper-100/60" : "text-muted-500"
                    }`}
                  >
                    real a.a.
                  </span>
                </div>
                <p
                  className={`text-[0.85rem] leading-snug ${
                    isActive ? "text-paper-100/75" : "text-muted-600"
                  }`}
                >
                  {p.description}
                </p>
                <div
                  className={`mt-auto pt-3 text-[0.7rem] uppercase tracking-wider2 ${
                    isActive ? "text-paper-100/55" : "text-muted-500"
                  }`}
                >
                  Inflação {p.inflation.toFixed(1).replace(".", ",")}% · Nominal{" "}
                  {p.nominal.toFixed(1).replace(".", ",")}%
                </div>
              </button>
            );
          })}
        </div>
        <input
          type="hidden"
          name="assumptionsProfile"
          value={profile}
          required
        />
      </FieldGroup>

      {/* Resumo do que foi escolhido */}
      {selected && (
        <FieldGroup label="Premissas selecionadas">
          <div className="grid gap-px bg-paper-300/70 md:grid-cols-3">
            <Stat label="Inflação esperada" value={`${selected.inflation.toFixed(1).replace(".", ",")}% a.a.`} />
            <Stat label="Juros nominais" value={`${selected.nominal.toFixed(1).replace(".", ",")}% a.a.`} />
            <Stat
              label="Retorno real"
              value={`${selected.real.toFixed(1).replace(".", ",")}% a.a.`}
              highlight
            />
          </div>
          <div className="mt-4 text-[0.85rem] leading-relaxed text-muted-500">
            <strong className="font-medium text-ink-700">
              Por que retorno real?
            </strong>{" "}
            Toda projeção daqui pra frente usa o retorno descontado de inflação.
            Isso preserva o poder de compra real do seu patrimônio ao longo do
            tempo — o que importa, no fim, é o quanto você consegue comprar com
            o que acumulou.
          </div>
        </FieldGroup>
      )}

      {/* Aviso educativo sobre ranges */}
      <FieldGroup label="Sobre as faixas">
        <div className="border-l-2 border-gold-500 bg-paper-200/40 px-5 py-4">
          <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
            Importante
          </div>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-700">
            Não permitimos premissas de retorno real acima de 8% a.a. ou abaixo
            de 0%. Acima desse teto é improvável estatisticamente; abaixo
            sugere planejamento sem expectativa real de crescimento. As três
            faixas acima cobrem 95% dos cenários históricos brasileiros para
            horizontes de 10 anos ou mais.
          </p>
        </div>
        <input
          type="hidden"
          name="acknowledgedRanges"
          value="true"
        />
      </FieldGroup>
    </>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`px-6 py-5 ${
        highlight ? "bg-ink-900 text-paper-50" : "bg-paper-100"
      }`}
    >
      <div
        className={`text-[0.65rem] uppercase tracking-wider2 ${
          highlight ? "text-gold-400" : "text-muted-500"
        }`}
      >
        {label}
      </div>
      <div className="mt-2 font-serif text-[1.5rem] tracking-editorial">
        {value}
      </div>
    </div>
  );
}
