import { ReactNode } from "react";

export default function StatCard({
  eyebrow,
  value,
  caption,
  variant = "default",
}: {
  eyebrow: string;
  value: ReactNode;
  caption?: ReactNode;
  variant?: "default" | "accent" | "warning" | "success";
}) {
  const styles = {
    default: "bg-paper-100 text-ink-900 border-paper-300/70",
    accent: "bg-ink-900 text-paper-50 border-ink-900",
    warning: "bg-paper-100 text-ink-900 border-red-600/40",
    success: "bg-paper-100 text-ink-900 border-emerald-600/40",
  };
  const eyebrowStyles = {
    default: "text-muted-500",
    accent: "text-gold-400",
    warning: "text-red-700",
    success: "text-emerald-700",
  };

  return (
    <div className={`relative border ${styles[variant]} px-7 py-7`}>
      {variant === "accent" && (
        <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold-400" />
      )}
      <div
        className={`text-[0.65rem] uppercase tracking-wider2 ${eyebrowStyles[variant]}`}
      >
        {eyebrow}
      </div>
      <div className="mt-3 font-serif text-[1.9rem] leading-[1.1] tracking-editorial md:text-[2.1rem]">
        {value}
      </div>
      {caption && (
        <div
          className={`mt-3 text-[0.85rem] leading-snug ${
            variant === "accent" ? "text-paper-100/70" : "text-muted-600"
          }`}
        >
          {caption}
        </div>
      )}
    </div>
  );
}
