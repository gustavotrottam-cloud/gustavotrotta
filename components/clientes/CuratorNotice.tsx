import { ReactNode } from "react";

/**
 * Editorial "em curadoria" notice — usado nas seções da Fase 1 antes
 * do CMS estar populado. Mantém tom premium sem parecer "em construção".
 */
export default function CuratorNotice({
  title = "Em curadoria",
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="relative border border-ink-900/10 bg-paper-100 p-8 md:p-10">
      <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold-500" />
      <div className="text-[0.7rem] uppercase tracking-wider2 text-gold-600">
        {title}
      </div>
      <div className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-muted-600">
        {children}
      </div>
    </aside>
  );
}
