import { ReactNode } from "react";

export default function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-paper-300/60 py-7 first:border-t-0 first:pt-0">
      <div className="text-[0.7rem] uppercase tracking-wider2 text-muted-500">
        {label}
      </div>
      <div className="mt-4">{children}</div>
      {hint && (
        <div className="mt-3 text-[0.85rem] leading-relaxed text-muted-500">
          {hint}
        </div>
      )}
    </div>
  );
}
