"use client";

import { useState } from "react";
import FieldGroup from "./FieldGroup";
import SelectCards from "./SelectCards";

const MARITAL_OPTIONS = [
  { value: "single", label: "Solteiro(a)" },
  { value: "married", label: "Casado(a)" },
  { value: "stable_union", label: "União estável" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed", label: "Viúvo(a)" },
];

const REGIME_OPTIONS = [
  {
    value: "partial_communion",
    label: "Comunhão parcial",
    description: "Regime padrão no Brasil.",
  },
  {
    value: "total_communion",
    label: "Comunhão total",
    description: "Todos os bens são comuns ao casal.",
  },
  {
    value: "total_separation",
    label: "Separação total",
    description: "Cada cônjuge mantém o próprio patrimônio.",
  },
  {
    value: "mandatory_separation",
    label: "Separação obrigatória",
    description: "Imposta por lei em alguns casos.",
  },
  {
    value: "final_participation",
    label: "Participação final nos aquestos",
    description: "Híbrido — separação durante, comunhão ao final.",
  },
];

/**
 * Lida com estado civil + regime de bens.
 * Regime só aparece quando o usuário está casado(a) ou em união estável.
 */
export default function MaritalSection({
  maritalDefault,
  regimeDefault,
}: {
  maritalDefault?: string;
  regimeDefault?: string;
}) {
  const [marital, setMarital] = useState<string>(maritalDefault ?? "");
  const showRegime = marital === "married" || marital === "stable_union";

  return (
    <>
      <FieldGroup label="Estado civil">
        <SelectCards
          name="maritalStatus"
          options={MARITAL_OPTIONS}
          defaultValue={maritalDefault}
          columns={3}
          required
          onChange={setMarital}
        />
      </FieldGroup>

      {showRegime && (
        <FieldGroup
          label="Regime de bens"
          hint="Aplicável ao seu vínculo conjugal."
        >
          <SelectCards
            name="propertyRegime"
            options={REGIME_OPTIONS}
            defaultValue={regimeDefault}
            columns={2}
          />
        </FieldGroup>
      )}
    </>
  );
}
