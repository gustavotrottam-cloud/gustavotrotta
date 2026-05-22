import { formatBRL } from "@/lib/planejamento/format";

/**
 * Comparação visual entre renda mensal desejada e renda sustentável projetada.
 * Sem chart library — apenas barras CSS proporcionais.
 */
export default function IncomeComparison({
  desired,
  sustainable,
}: {
  desired: number;
  sustainable: number;
}) {
  const max = Math.max(desired, sustainable, 1);
  const desiredPct = (desired / max) * 100;
  const sustainablePct = (sustainable / max) * 100;
  const gap = sustainable - desired;
  const gapPositive = gap >= 0;

  return (
    <div>
      <div className="space-y-5">
        <BarRow
          label="Renda desejada"
          value={desired}
          widthPct={desiredPct}
          color="bg-ink-900"
        />
        <BarRow
          label="Renda sustentável projetada"
          value={sustainable}
          widthPct={sustainablePct}
          color={gapPositive ? "bg-emerald-600" : "bg-red-600/70"}
        />
      </div>

      <div
        className={`mt-7 flex items-baseline justify-between border-t pt-5 ${
          gapPositive
            ? "border-emerald-600/30"
            : "border-red-600/30"
        }`}
      >
        <div className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
          {gapPositive ? "Folga" : "Déficit"}
        </div>
        <div
          className={`font-serif text-[1.4rem] tracking-editorial ${
            gapPositive ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {gapPositive ? "+" : ""}
          {formatBRL(gap)}
          <span className="ml-2 text-[0.7rem] uppercase tracking-wider2 text-muted-500">
            por mês
          </span>
        </div>
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  widthPct,
  color,
}: {
  label: string;
  value: number;
  widthPct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[0.78rem] uppercase tracking-wider2 text-muted-600">
          {label}
        </span>
        <span className="font-serif text-[1.1rem] text-ink-900">
          {formatBRL(value)}
        </span>
      </div>
      <div className="mt-2 h-2 w-full bg-paper-300/60">
        <div
          className={`h-full ${color} transition-all duration-700 ease-editorial`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}
