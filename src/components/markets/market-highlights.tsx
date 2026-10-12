"use client";

import NumberFlow from "@number-flow/react";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarYAxis } from "@/components/charts/bar-y-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { EASE_OUT } from "@/components/motion/reveal";
import { MARKET_DATA, formatPct } from "@/lib/articles";

const sorted = [...MARKET_DATA].sort((a, b) => b.change1Y - a.change1Y);
const best = sorted[0];
const worst = sorted[sorted.length - 1];
const risers = MARKET_DATA.filter((m) => m.change1Y >= 0).length;
const median = (() => {
  const v = sorted.map((m) => m.change1Y);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
})();

const pct = { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1, signDisplay: "always" } as const;

/** Four headline numbers for the whole snapshot; they count up when first seen. */
export function MarketStats({ onSelect }: { onSelect: (symbol: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const cards = [
    { label: "Best performer", value: best.change1Y / 100, sub: `${best.symbol} · ${best.tickerLabel}`, symbol: best.symbol, tone: "up" },
    { label: "Worst performer", value: worst.change1Y / 100, sub: `${worst.symbol} · ${worst.tickerLabel}`, symbol: worst.symbol, tone: "down" },
    { label: "Median move", value: median / 100, sub: `Across all ${MARKET_DATA.length} instruments`, tone: median >= 0 ? "up" : "down" },
    { label: "Rose over the year", value: risers, sub: `of ${MARKET_DATA.length} instruments`, tone: "", count: true },
  ];

  return (
    <div className="stat-cards" ref={ref}>
      {cards.map((c, i) => {
        const Tag = c.symbol ? motion.button : motion.div;
        return (
          <Tag
            key={c.label}
            className="stat-card"
            {...(c.symbol ? { type: "button" as const, onClick: () => onSelect(c.symbol!), title: `Chart ${c.symbol}` } : {})}
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.08 }}
          >
            <p className="stat-label">{c.label}</p>
            <p className={`stat-value ${c.tone}`}>
              {c.count ? (
                <NumberFlow locales="en-US" value={inView ? c.value : 0} />
              ) : (
                <NumberFlow locales="en-US" value={inView ? c.value : 0} format={pct} />
              )}
            </p>
            <p className="stat-sub">{c.sub}</p>
          </Tag>
        );
      })}
    </div>
  );
}

// The six biggest risers and six biggest fallers. Each row carries its move
// in either "gain" or "loss" (the other is 0), so one stacked bar per row
// comes out green or red. Losses are drawn by size; the tooltip keeps the sign.
const MOVES = [...sorted.slice(0, 6), ...sorted.slice(-6)].map((m) => ({
  name: m.symbol,
  gain: Math.max(0, m.change1Y),
  loss: Math.max(0, -m.change1Y),
  change: m.change1Y,
  label: m.tickerLabel,
}));

/** BKLit UI horizontal bar chart of the year's biggest moves. */
export function MovesChart() {
  return (
    <motion.div
      className="moves-chart"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
    >
      <p className="featured-chart-title">Biggest moves · 1 year</p>
      <h2 className="featured-chart-name">
        Winners &amp; losers <span className="featured-chart-fullname">the six best and six worst</span>
      </h2>
      <div className="moves-plot">
        <BarChart
          data={MOVES}
          xDataKey="name"
          orientation="horizontal"
          stacked
          aspectRatio={undefined}
          barGap={0.28}
          margin={{ top: 12, right: 16, bottom: 8, left: 56 }}
          className="h-full w-full"
        >
          <Grid horizontal={false} vertical strokeDasharray="3,4" />
          <Bar dataKey="gain" fill="var(--up)" lineCap={3} />
          <Bar dataKey="loss" fill="var(--down)" lineCap={3} />
          <BarYAxis />
          <ChartTooltip
            showDatePill={false}
            rows={(p) => [
              {
                color: (p.change as number) >= 0 ? "var(--up)" : "var(--down)",
                label: `${p.name} · ${p.label}`,
                value: formatPct(p.change as number),
              },
            ]}
          />
        </BarChart>
      </div>
      <p className="moves-legend">
        <span className="gain">Gained</span>
        <span className="loss">Lost (bar length = size of the fall)</span>
      </p>
    </motion.div>
  );
}
