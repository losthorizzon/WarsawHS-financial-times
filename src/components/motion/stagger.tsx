"use client";

import { motion, useReducedMotion } from "motion/react";
import { Children, type ReactNode } from "react";

/**
 * Fades and lifts each child in, one after another. `resetKey` replays the
 * entrance when it changes (e.g. a new filter), so the list visibly
 * refreshes instead of silently swapping its contents.
 */
export function Stagger({
  children,
  className,
  resetKey,
  step = 0.06,
}: {
  children: ReactNode;
  className?: string;
  resetKey?: string;
  step?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <div className={className} key={resetKey}>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={(child as { key?: string }).key ?? i}
          className="stagger-item"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 8) * step }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

/** A single block that fades up into place on first render. */
export function FadeIn({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
