"use client";

import { Cell, Pie, PieChart } from "recharts";
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

/**
 * Variante PDF do PatrimonyBreakdown — dimensões fixas, sem ResponsiveContainer,
 * sem Tooltip (PDF não é interativo). Pensado pra encaixar na metade superior
 * de uma página A4 (margens 22mm).
 */
export default function PdfPatrimonyBreakdown({
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "8mm",
        alignItems: "center",
      }}
    >
      <div>
        {total > 0 ? (
          <PieChart width={200} height={200}>
            <Pie
              data={visible}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={90}
              paddingAngle={visible.length > 1 ? 1.5 : 0}
              stroke="#FAFAF7"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {visible.map((s) => (
                <Cell key={s.key} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              border: "1px dashed #E5E3DA",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9pt",
              color: "#6B6B70",
            }}
          >
            Sem patrimônio
          </div>
        )}
      </div>

      <div>
        <div
          style={{
            fontSize: "7.5pt",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#6B6B70",
          }}
        >
          Patrimônio total
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif), serif",
            fontSize: "22pt",
            lineHeight: 1.05,
            color: "#101014",
            marginTop: "2mm",
          }}
        >
          {formatBRL(total)}
        </div>

        <table
          className="pdf-table"
          style={{ marginTop: "5mm", fontSize: "9.5pt" }}
        >
          <tbody>
            {slices.map((s) => {
              const pct = total > 0 ? (s.value / total) * 100 : 0;
              return (
                <tr key={s.key}>
                  <td style={{ width: "8mm" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "3mm",
                        height: "3mm",
                        background: s.color,
                      }}
                    />
                  </td>
                  <td>{s.label}</td>
                  <td className="right" style={{ width: "30mm" }}>
                    {formatBRLShort(s.value)}
                  </td>
                  <td
                    className="right"
                    style={{ width: "16mm", color: "#6B6B70" }}
                  >
                    {total > 0 ? `${pct.toFixed(0)}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
