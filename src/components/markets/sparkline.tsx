"use client";

import { motion } from "motion/react";

/** Tiny trend line that draws itself from left to right as it scrolls into view. */
export function Sparkline({
  values,
  up,
  width = 60,
  height = 24,
  className = "snapshot-spark",
  delay = 0,
}: {
  values: number[];
  up: boolean;
  width?: number;
  height?: number;
  className?: string;
  delay?: number;
}) {
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const flat = max === min;
  const range = max - min || 1;
  const stepX = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const points = values
    .map((v, i) => {
      const x = pad + i * stepX;
      // No variance (e.g. right after a data reset): draw a flat line
      // centered in the chart, not pinned to the bottom edge.
      const y = flat ? height / 2 : pad + (1 - (v - min) / range) * (height - pad * 2);
      return x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ");
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <motion.polyline
        points={points}
        fill="none"
        stroke={up ? "var(--up)" : "var(--down)"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </svg>
  );
}
