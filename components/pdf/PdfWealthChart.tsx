"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionPoint } from "@/lib/planejamento/engine";
import { formatBRLShort } from "@/lib/planejamento/format";

/**
 * Variante do WealthChart para PDF — dimensões FIXAS (sem ResponsiveContainer)
 * pra evitar problemas de timing/resize no Puppeteer.
 *
 * 620 × 280 cabe confortavelmente numa A4 com margens de 22mm.
 */
export default function PdfWealthChart({
  projection,
  targetAge,
  estimatedIFAge,
  depletionAge,
  maintenanceLevel,
}: {
  projection: ProjectionPoint[];
  targetAge: number;
  estimatedIFAge: number | null;
  depletionAge: number | null;
  maintenanceLevel?: number;
}) {
  return (
    <AreaChart
      width={620}
      height={280}
      data={projection}
      margin={{ top: 16, right: 24, bottom: 8, left: 52 }}
    >
      <defs>
        <linearGradient id="pdfWealthFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F1E3A" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#0F1E3A" stopOpacity={0} />
        </linearGradient>
      </defs>

      <CartesianGrid stroke="#E5E3DA" strokeDasharray="0" vertical={false} />

      <XAxis
        dataKey="age"
        stroke="#6B6B70"
        tick={{ fontSize: 9, fill: "#6B6B70" }}
        tickLine={false}
        axisLine={{ stroke: "#E5E3DA" }}
        interval="preserveStartEnd"
      />

      <YAxis
        stroke="#6B6B70"
        tick={{ fontSize: 9, fill: "#6B6B70" }}
        tickLine={false}
        axisLine={false}
        tickFormatter={(v: number) => formatBRLShort(v)}
        width={52}
      />

      {maintenanceLevel && maintenanceLevel > 0 && (
        <ReferenceLine
          y={maintenanceLevel}
          stroke="#16294F"
          strokeDasharray="6 3"
          strokeWidth={1}
          label={{
            value: `Manutenção · ${formatBRLShort(maintenanceLevel)}`,
            position: "insideBottomLeft",
            fill: "#16294F",
            fontSize: 9,
            letterSpacing: "0.12em",
            offset: 6,
          }}
        />
      )}

      <ReferenceLine
        x={targetAge}
        stroke="#B8935A"
        strokeDasharray="4 4"
        label={{
          value: `Alvo · ${targetAge}`,
          position: "insideTopRight",
          fill: "#B8935A",
          fontSize: 9,
          letterSpacing: "0.12em",
        }}
      />

      {estimatedIFAge && estimatedIFAge !== targetAge && (
        <ReferenceLine
          x={estimatedIFAge}
          stroke="#0F1E3A"
          strokeDasharray="2 4"
          label={{
            value: `IF · ${estimatedIFAge}`,
            position: "insideTopLeft",
            fill: "#0F1E3A",
            fontSize: 9,
            letterSpacing: "0.12em",
          }}
        />
      )}

      {depletionAge && (
        <ReferenceLine
          x={depletionAge}
          stroke="#a83232"
          strokeDasharray="2 4"
          label={{
            value: `Esgota · ${depletionAge}`,
            position: "insideTopRight",
            fill: "#a83232",
            fontSize: 9,
          }}
        />
      )}

      <Area
        type="monotone"
        dataKey="wealth"
        stroke="#0F1E3A"
        strokeWidth={1.5}
        fill="url(#pdfWealthFill)"
        isAnimationActive={false}
      />
    </AreaChart>
  );
}
