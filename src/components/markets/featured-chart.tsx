"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo } from "react";
import { Area, AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { useIsNarrow } from "@/hooks/use-mounted";
import { MARKET, formatPct, formatPrice } from "@/lib/articles";
import type { Instrument } from "@/lib/types";

// The snapshot stores ~64 evenly spaced closes across the one-year window
// (MARKET.from → MARKET.asOf) without their dates, so each point's date is
// reconstructed by spacing them evenly across that window.
function toSeries(m: Instrument) {
  const start = new Date(MARKET.from + "T00:00:00").getTime();
  const end = new Date(MARKET.asOf + "T00:00:00").getTime();
  const step = m.spark.length > 1 ? (end - start) / (m.spark.length - 1) : 0;
  return m.spark.map((price, i) => ({ date: new Date(start + i * step), price }));
}

/** The "Featured 1-Year Trend" panel at the top of the Markets page (BKLit UI area chart). */
export function FeaturedChart({ instrument: m }: { instrument: Instrument }) {
  const up = m.change1Y >= 0;
  const color = up ? "var(--up)" : "var(--down)";
  const data = useMemo(() => toSeries(m), [m]);
  const narrow = useIsNarrow();

  return (
    <div className="featured-chart" id="featured">
      <div className="featured-chart-head">
        <div>
          <p className="featured-chart-title">{m.group} &middot; Featured 1-Year Trend</p>
          <h2 className="featured-chart-name">
            {m.symbol} <span className="featured-chart-fullname">{m.name}</span>
          </h2>
        </div>
        <div className="featured-chart-figures">
          <div className="featured-chart-price">{formatPrice(m.price)}</div>
          <div className={`featured-chart-change ${up ? "up" : "down"}`}>{formatPct(m.change1Y)} over the past year</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={m.symbol}
          className="featured-chart-plot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <AreaChart data={data} aspectRatio={undefined} margin={{ top: 16, right: 12, bottom: 32, left: 52 }} className="h-full w-full">
            <Grid strokeDasharray="3,4" />
            <Area dataKey="price" fill={color} stroke={color} fillOpacity={0.22} strokeWidth={2.2} />
            <YAxis numTicks={4} formatValue={(v) => formatPrice(v)} />
            <XAxis numTicks={narrow ? 3 : 5} />
            <ChartTooltip
              rows={(point) => [{ color, label: m.symbol, value: formatPrice(point.price as number) }]}
            />
          </AreaChart>
        </motion.div>
      </AnimatePresence>

      <p className="featured-chart-hint">Hover the chart to read any point. Click a row in the tables below to load its chart here.</p>
    </div>
  );
}
