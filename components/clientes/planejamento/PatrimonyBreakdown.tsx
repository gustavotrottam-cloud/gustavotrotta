"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatBRL, formatBRLShort } from "@/lib/planejamento/format";

type Slice = {
  key: "financial" | "real" | "ownership";
  label: string;
  value: number;
  color: string;
};

const PALETTE: Record<Slice["key"], string> = {
  financial: "#0F1E3A",
  real: "#B8935A",
  ownership: "#4A4F5A",
};

export default function PatrimonyBreakdown({
  financial,
  realAssets,
  ownership,
}: {
  financial: number;
  realAssets: number;
  ownership: number;
}) {
  const total = financial + realAssets + ownership;

  const slices: Slice[] = [
    { key: "financial", label: "Financeiro", value: financial, color: PALETTE.financial },
    { key: "real", label: "Imobilizado", value: realAssets, color: PALETTE.real },
    { key: "ownership", label: "Societário", value: ownership, color: PALETTE.ownership },
  ];

  const visible = slices.filter((s) => s.value > 0);
  const hasAny = total > 0;

  return (
    <section className="border border-paper-300/70 bg-paper-100 p-6 md:p-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <div className="text-[0.7rem] uppercase tracking-wider3 text-muted-500">
            Patrimônio total
          </div>
          <h2 className="mt-2 font-serif text-[1.7rem] leading-[1.15] tracking-editorial text-ink-900 md:text-[1.9rem]">
            Composição do seu{" "}
            <span className="italic text-navy-800">capital hoje</span>
          </h2>
          <div className="mt-5 font-serif text-[2.3rem] leading-none text-ink-900 md:text-[2.6rem]">
            {formatBRL(total)}
          </div>
          <div className="mt-1 text-[0.72rem] uppercase tracking-wider2 text-muted-500">
            Soma de financeiro, imobilizado e societário
          </div>
        </div>

        <div className="lg:col-span-4">
          {hasAny ? (
            <div className="h-[220px] w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={visible}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={visible.length > 1 ? 1.5 : 0}
                    stroke="#FAFAF7"
                    strokeWidth={2}
                    isAnimationActive={false}
                  >
                    {visible.map((s) => (
                      <Cell key={s.key} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#FAFAF7",
                      border: "1px solid #E5E3DA",
                      borderRadius: 0,
                      fontSize: 12,
                      padding: "8px 12px",
                    }}
                    labelStyle={{ color: "#6B6B70" }}
                    formatter={(value, name) => [
                      formatBRL(Number(value ?? 0)),
                      String(name ?? ""),
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-[220px] items-center justify-center border border-dashed border-paper-300/70 text-center text-[0.85rem] text-muted-500">
              Sem patrimônio informado.
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <ul className="space-y-3">
            {slices.map((s) => {
              const pct = hasAny ? (s.value / total) * 100 : 0;
              return (
                <li key={s.key} className="flex items-start gap-3">
                  <span
                    className="mt-[6px] inline-block h-2 w-2 flex-shrink-0"
                    style={{ background: s.color }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[0.72rem] uppercase tracking-wider2 text-muted-600">
                        {s.label}
                      </span>
                      <span className="text-[0.7rem] tracking-wider2 text-muted-500">
                        {hasAny ? `${pct.toFixed(0)}%` : "—"}
                      </span>
                    </div>
                    <div className="mt-0.5 font-serif text-[1.05rem] text-ink-900">
                      {formatBRLShort(s.value)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-8 border-t border-paper-300/70 pt-5">
        <div className="text-[0.65rem] uppercase tracking-wider2 text-gold-600">
          Como isso entra no cálculo
        </div>
        <p className="mt-2 max-w-prose2 text-[0.88rem] leading-relaxed text-muted-600">
          A projeção de renda passiva considera{" "}
          <strong className="font-medium text-ink-900">
            apenas o patrimônio financeiro
          </strong>{" "}
          — capital que já está investido e produzindo retorno. Imobilizado e
          societário aparecem aqui como contexto patrimonial.
        </p>
        {(realAssets > 0 || ownership > 0) && (
          <p className="mt-3 max-w-prose2 text-[0.85rem] leading-relaxed text-muted-500">
            Se em algum momento parte do imobilizado ou da participação
            societária for convertida em caixa — venda de um imóvel, exit da
            empresa — esse evento{" "}
            <span className="italic">acelera bruscamente</span> a construção da
            renda passiva, redesenhando o horizonte de independência financeira.
          </p>
        )}
      </div>
    </section>
  );
}
