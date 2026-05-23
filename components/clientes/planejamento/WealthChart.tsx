"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectionPoint } from "@/lib/planejamento/engine";
import { formatBRL, formatBRLShort } from "@/lib/planejamento/format";

export default function WealthChart({
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
  /** Patrimônio em que juros reais cobrem perpetuamente a renda desejada.
   *  Renderiza linha horizontal pontilhada com label. */
  maintenanceLevel?: number;
}) {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer>
        <AreaChart
          data={projection}
          margin={{ top: 20, right: 24, bottom: 6, left: 56 }}
        >
          <defs>
            <linearGradient id="wealthFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F1E3A" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#0F1E3A" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#E5E3DA" strokeDasharray="0" vertical={false} />

          <XAxis
            dataKey="age"
            stroke="#6B6B70"
            tick={{ fontSize: 11, fill: "#6B6B70" }}
            tickLine={false}
            axisLine={{ stroke: "#E5E3DA" }}
            interval="preserveStartEnd"
            label={{
              value: "Idade",
              position: "insideBottom",
              offset: -2,
              fontSize: 10,
              fill: "#8C8C90",
              letterSpacing: "0.12em",
            }}
          />

          <YAxis
            stroke="#6B6B70"
            tick={{ fontSize: 11, fill: "#6B6B70" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => formatBRLShort(v)}
            width={56}
          />

          <Tooltip
            cursor={{ stroke: "#0F1E3A", strokeDasharray: "3 3" }}
            contentStyle={{
              background: "#FAFAF7",
              border: "1px solid #E5E3DA",
              borderRadius: 0,
              fontSize: 12,
              padding: "10px 14px",
            }}
            labelStyle={{ color: "#6B6B70", marginBottom: 4 }}
            formatter={(value) => [formatBRL(Number(value ?? 0)), "Patrimônio"]}
            labelFormatter={(age) => `${age} anos`}
          />

          {/* Linha horizontal de manutenção — patrimônio onde juros reais
              cobrem a renda desejada perpetuamente */}
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
                fontSize: 10,
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
              fontSize: 10,
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
                fontSize: 10,
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
                fontSize: 10,
              }}
            />
          )}

          <Area
            type="monotone"
            dataKey="wealth"
            stroke="#0F1E3A"
            strokeWidth={1.75}
            fill="url(#wealthFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
