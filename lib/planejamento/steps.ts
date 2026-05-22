/**
 * Definição das etapas do planejamento financeiro.
 * Tool é pública (rota `/planejamento-financeiro/...`), funciona pra
 * visitantes anônimos e clientes logados.
 */

export type StepId =
  | "pessoal"
  | "aposentadoria"
  | "fluxo"
  | "patrimonio"
  | "premissas"
  | "resultados";

export type StepDef = {
  id: StepId;
  number: number;
  eyebrow: string;
  title: string;
  intro: string;
  path: string;
  available: boolean;
};

const BASE = "/planejamento-financeiro/editar";

export const STEPS: StepDef[] = [
  {
    id: "pessoal",
    number: 1,
    eyebrow: "Etapa 01",
    title: "Sobre você",
    intro:
      "Idade, estrutura familiar e dependentes. Esses dados ancoram todas as projeções patrimoniais.",
    path: `${BASE}/pessoal`,
    available: true,
  },
  {
    id: "aposentadoria",
    number: 2,
    eyebrow: "Etapa 02",
    title: "Objetivo de longo prazo",
    intro:
      "Em que idade você quer reduzir o ritmo de trabalho — e com qual renda mensal hoje você se sentiria confortável vivendo.",
    path: `${BASE}/aposentadoria`,
    available: true,
  },
  {
    id: "fluxo",
    number: 3,
    eyebrow: "Etapa 03",
    title: "Fluxo financeiro",
    intro:
      "Receitas e despesas mensais. Você escolhe entre preenchimento detalhado ou consolidado — o que for mais rápido pra você.",
    path: `${BASE}/fluxo`,
    available: true,
  },
  {
    id: "patrimonio",
    number: 4,
    eyebrow: "Etapa 04",
    title: "Estrutura patrimonial",
    intro:
      "Patrimônio financeiro, ativos imobilizados e participações societárias — o retrato do que você acumulou até aqui.",
    path: `${BASE}/patrimonio`,
    available: true,
  },
  {
    id: "premissas",
    number: 5,
    eyebrow: "Etapa 05",
    title: "Premissas econômicas",
    intro:
      "Inflação, juros e retorno real esperado de longo prazo. Premissas calibradas — não chutes otimistas.",
    path: `${BASE}/premissas`,
    available: true,
  },
  {
    id: "resultados",
    number: 6,
    eyebrow: "Etapa 06",
    title: "Visão integrada",
    intro:
      "Projeção patrimonial, idade estimada de independência financeira e sustentabilidade de longo prazo.",
    path: `${BASE}/resultados`,
    available: true,
  },
];

export const ACTIVE_STEPS = STEPS.filter((s) => s.available);

export function getStep(id: string): StepDef | undefined {
  return STEPS.find((s) => s.id === id);
}

export function getNextStep(currentId: string): StepDef | undefined {
  const idx = ACTIVE_STEPS.findIndex((s) => s.id === currentId);
  return idx >= 0 ? ACTIVE_STEPS[idx + 1] : undefined;
}

export function getPreviousStep(currentId: string): StepDef | undefined {
  const idx = ACTIVE_STEPS.findIndex((s) => s.id === currentId);
  return idx > 0 ? ACTIVE_STEPS[idx - 1] : undefined;
}
