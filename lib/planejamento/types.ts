/**
 * Shape do JSONB `data` da tabela planning_plans.
 * Todos os campos são opcionais — o cliente preenche progressivamente.
 *
 * Valores monetários sempre em REAIS DE HOJE (valor presente).
 * O motor de cálculo (Fase C) projeta para o futuro descontando inflação.
 */

export type MaritalStatus =
  | "single"
  | "married"
  | "stable_union"
  | "divorced"
  | "widowed";

export type PropertyRegime =
  | "partial_communion"      // comunhão parcial (padrão BR)
  | "total_communion"        // comunhão total
  | "total_separation"       // separação total
  | "mandatory_separation"   // separação obrigatória
  | "final_participation";   // participação final nos aquestos

export type CashflowMode = "simplified" | "detailed";

export type PlanningData = {
  /** Etapa 01 — Sobre você */
  personal?: {
    age?: number;
    maritalStatus?: MaritalStatus;
    propertyRegime?: PropertyRegime;       // só se married/stable_union
    dependentsCount?: number;
    childrenCount?: number;
    notes?: string;                         // composição familiar livre
  };

  /** Etapa 02 — Objetivo de aposentadoria / IF */
  retirement?: {
    targetAge?: number;                     // idade alvo
    desiredMonthlyIncomeBRL?: number;       // renda mensal desejada (R$ hoje)
    notes?: string;                         // observações livres
  };

  /** Etapa 03 — Fluxo financeiro */
  cashflow?: {
    mode?: CashflowMode;

    // Modo simplificado
    totalMonthlyIncomeBRL?: number;
    totalMonthlyExpensesBRL?: number;

    // Modo detalhado
    income?: {
      salary?: number;
      proLabore?: number;
      dividends?: number;
      rentalIncome?: number;
      variableIncome?: number;
      other?: number;
      otherDescription?: string;
    };
    expenses?: {
      fixed?: number;
      leisure?: number;
      education?: number;
      health?: number;
      other?: number;
    };
  };

  /** Etapa 04 — Estrutura patrimonial */
  patrimony?: {
    mode?: CashflowMode; // simplified | detailed

    // SIMPLIFICADO (totais por categoria)
    financialTotalBRL?: number;
    realAssetsTotalBRL?: number;

    // DETALHADO
    financial?: {
      fixedIncome?: number;
      stocks?: number;
      funds?: number;
      privatePension?: number;
      corporatePension?: number;
      cash?: number;
    };
    realAssets?: {
      properties?: number;
      vehicles?: number;
      land?: number;
      other?: number;
    };

    // Participações societárias (toggle + valor)
    hasOwnership?: boolean;
    ownershipTotalBRL?: number;
    ownershipNotes?: string;
  };

  /** Etapa 05 — Premissas econômicas */
  assumptions?: {
    profile?: AssumptionsProfile;
    // Salvos pra deixar a Fase C ler direto sem precisar do mapa
    inflationAnnualPct?: number;
    nominalAnnualPct?: number;
    realAnnualPct?: number;
    acknowledgedRanges?: boolean;
  };
};

export type AssumptionsProfile = "conservative" | "moderate" | "optimistic";

/**
 * Mapa de premissas pré-definidas.
 * Real = ((1 + nominal) / (1 + inflação)) - 1
 * Valores em % a.a.
 */
export const ASSUMPTIONS_PROFILES: Record<
  AssumptionsProfile,
  { inflation: number; nominal: number; real: number; label: string; description: string }
> = {
  conservative: {
    inflation: 4.0,
    nominal: 7.0,
    real: 2.9,
    label: "Conservador",
    description:
      "Retorno real de ~3% a.a. Premissa cautelosa, típica de horizonte de muito longo prazo ou perfil avesso a risco.",
  },
  moderate: {
    inflation: 4.0,
    nominal: 9.0,
    real: 4.8,
    label: "Moderado",
    description:
      "Retorno real de ~5% a.a. Premissa equilibrada, compatível com alocação diversificada Brasil + global.",
  },
  optimistic: {
    inflation: 4.0,
    nominal: 11.0,
    real: 6.7,
    label: "Otimista",
    description:
      "Retorno real de ~7% a.a. Requer exposição significativa a renda variável e prazo realmente longo.",
  },
};

/** Snapshot do lead gravado no momento em que o PDF foi solicitado */
export type LeadSnapshot = {
  name: string;
  email?: string | null;
  phone: string;     // formato livre, validado no momento da captura
  capturedAt: string; // ISO
};

/** Shape do registro inteiro vindo do banco */
export type PlanningPlan = {
  id: string;                            // PK interna (UUID), nova em migration 005
  profile_id: string | null;             // preenchido quando cliente logado
  anon_session_id: string | null;        // preenchido quando visitante anônimo
  lead_id: string | null;                // FK pra leads (vinculado no PDF)
  lead_data: LeadSnapshot | null;        // snapshot do lead no momento do PDF
  status: "draft" | "completed";
  current_step: string;
  completed_steps: string[];
  data: PlanningData;
  results: unknown | null;
  ai_analysis: unknown | null;
  ai_analyzed_at: string | null;
  created_at: string;
  updated_at: string;
};
