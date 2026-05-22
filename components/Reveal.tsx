"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

type Direction = "up" | "left" | "none";

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const offsets = {
    up: { y: 28, x: 0 },
    left: { y: 0, x: 28 },
    none: { y: 0, x: 0 },
  } as const;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, ...offsets[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.85, delay, ease: [0.22, 0.61, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
