import { ReactNode } from "react";

export default function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative py-24 md:py-32 ${className}`}>
      {children}
    </section>
  );
}
