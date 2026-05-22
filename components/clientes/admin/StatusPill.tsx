type Status = "new" | "contacted" | "converted" | "archived";

const labels: Record<Status, string> = {
  new: "Novo",
  contacted: "Contactado",
  converted: "Convertido",
  archived: "Arquivado",
};

const styles: Record<Status, string> = {
  new: "bg-gold-500/10 text-gold-600 border-gold-500/40",
  contacted: "bg-navy-800/10 text-navy-800 border-navy-800/30",
  converted: "bg-emerald-600/10 text-emerald-700 border-emerald-600/30",
  archived: "bg-muted-500/10 text-muted-600 border-muted-400/30",
};

export default function StatusPill({ status }: { status: string }) {
  const s = (status as Status) in labels ? (status as Status) : "new";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-3 py-1 text-[0.65rem] uppercase tracking-wider2 ${styles[s]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          s === "new"
            ? "bg-gold-500"
            : s === "contacted"
            ? "bg-navy-800"
            : s === "converted"
            ? "bg-emerald-600"
            : "bg-muted-500"
        }`}
      />
      {labels[s]}
    </span>
  );
}
