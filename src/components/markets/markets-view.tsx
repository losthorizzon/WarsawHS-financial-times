"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useQueryParam } from "@/hooks/use-mounted";
import { MARKET_DATA, formatPct, formatPrice } from "@/lib/articles";
import type { Instrument } from "@/lib/types";
import { FeaturedChart } from "./featured-chart";
import { Sparkline } from "./sparkline";

// "group" keeps the tables grouped by asset type; "best" / "worst" flatten
// everything into one list ranked by one-year change.
const SORTS = [
  ["group", "By group"],
  ["best", "Best performers"],
  ["worst", "Worst performers"],
] as const;
type Sort = (typeof SORTS)[number][0];

function MarketTable({ rows, selected, onSelect }: { rows: Instrument[]; selected: string; onSelect: (s: string) => void }) {
  return (
    <div className="table-scroll">
      <table className="markets-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th className="num">Price</th>
            <th className="num">1-Year Change</th>
            <th>1-Year Trend</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => {
            const up = m.change1Y >= 0;
            return (
              <tr
                key={m.symbol}
                tabIndex={0}
                className={m.symbol === selected ? "is-selected" : undefined}
                aria-selected={m.symbol === selected}
                onClick={() => onSelect(m.symbol)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(m.symbol);
                  }
                }}
              >
                <td className="sym">{m.symbol}</td>
                <td className="name">{m.name}</td>
                <td className="num">{formatPrice(m.price)}</td>
                <td className={`num ${up ? "up" : "down"}`}>{formatPct(m.change1Y)}</td>
                <td className="chart-cell">
                  <Sparkline values={m.spark} up={up} width={100} height={30} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function MarketsView() {
  const [sort, setSort] = useState<Sort>("group");
  const [picked, setSymbol] = useState<string | null>(null);

  // A ticker link inside an article (or a Market Pulse row) arrives as
  // ?symbol=XYZ: load that chart and bring it into view.
  const requested = useQueryParam("symbol");
  const symbol = picked ?? (requested || MARKET_DATA[0].symbol);
  useEffect(() => {
    if (requested) document.getElementById("featured")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [requested]);

  const select = (s: string) => {
    setSymbol(s);
    const url = new URL(window.location.href);
    url.searchParams.set("symbol", s);
    window.history.replaceState(null, "", url);
  };

  const featured = MARKET_DATA.find((m) => m.symbol === symbol) ?? MARKET_DATA[0];
  const groups = [...new Set(MARKET_DATA.map((m) => m.group))];
  const sorted = [...MARKET_DATA].sort((x, y) => (sort === "best" ? y.change1Y - x.change1Y : x.change1Y - y.change1Y));

  return (
    <>
      <div className="markets-sortbar" role="group" aria-label="Sort markets">
        {SORTS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`cat-btn${key === sort ? " is-active" : ""}`}
            aria-pressed={key === sort}
            onClick={() => setSort(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <FeaturedChart instrument={featured} />

      <motion.div key={sort} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
        {sort === "group" ? (
          groups.map((g) => (
            <div className="markets-group" key={g}>
              <h2>{g}</h2>
              <MarketTable rows={MARKET_DATA.filter((m) => m.group === g)} selected={featured.symbol} onSelect={select} />
            </div>
          ))
        ) : (
          <div className="markets-group">
            <h2>{sort === "best" ? "Best to worst" : "Worst to best"} over the past year</h2>
            <MarketTable rows={sorted} selected={featured.symbol} onSelect={select} />
          </div>
        )}
      </motion.div>
    </>
  );
}
