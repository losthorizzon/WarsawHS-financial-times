"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { motion, useInView } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { NewBadge } from "@/components/articles/new-badge";
import SlideTextButton from "@/components/kokonutui/slide-text-button";
import { Sparkline } from "@/components/markets/sparkline";
import { EASE_OUT } from "@/components/motion/reveal";
import {
  MARKET_DATA,
  articleHref,
  authorOf,
  avatarColorFor,
  initialsFor,
  publishedArticles,
} from "@/lib/articles";
import { SNAPSHOT_SYMBOLS } from "@/lib/site";

const priceFormat = (v: number): Format => ({
  style: "currency",
  currency: "USD",
  maximumFractionDigits: v >= 1000 ? 0 : 2,
  minimumFractionDigits: v >= 1000 ? 0 : 2,
});

function MarketPulse() {
  const ref = useRef<HTMLDivElement>(null);
  // Figures count up from zero the first time the panel comes into view.
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const rows = SNAPSHOT_SYMBOLS.map((sym) => MARKET_DATA.find((m) => m.symbol === sym)).filter((m) => !!m);

  return (
    <div className="module-box" ref={ref}>
      <div className="module-head">
        <h2>Market Pulse · 1-Year</h2>
        <SlideTextButton href="/markets/" text="Full Markets →" hoverText="Open Markets →" className="slide-link" />
      </div>
      <div className="snapshot-list">
        {rows.map((m, i) => {
          const up = m.change1Y >= 0;
          return (
            <motion.div
              key={m.symbol}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.07 }}
            >
              <Link href={`/markets/?symbol=${m.symbol}`} className="snapshot-row">
                <span className="snapshot-symbol">{m.symbol}</span>
                <span className="snapshot-name" title={m.name}>
                  {m.name}
                </span>
                <Sparkline values={m.spark} up={up} delay={0.2 + i * 0.07} />
                <span className="snapshot-figures">
                  <span className="snapshot-price">
                    <NumberFlow locales="en-US" value={inView ? m.price : 0} format={priceFormat(m.price)} />
                  </span>
                  <span className={`snapshot-change ${up ? "up" : "down"}`}>
                    <NumberFlow
                      locales="en-US"
                      value={inView ? m.change1Y / 100 : 0}
                      format={{ style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: "always" }}
                      suffix=" 1Y"
                    />
                  </span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
      <p className="markets-note" style={{ padding: "0.6rem 1.1rem 0.8rem", margin: "auto 0 0" }}>
        One-year lookback
      </p>
    </div>
  );
}

// Always the 3 most recently dated published articles, so a new article
// automatically bumps the oldest one out — no manual "feature this" step.
function TopOfTheFold() {
  const picks = publishedArticles().slice(0, 3);
  return (
    <div className="module-box">
      <div className="module-head">
        <h2>Top of the Fold</h2>
      </div>
      <div className="picks-list">
        {picks.map((a, i) => {
          const author = authorOf(a);
          return (
            <motion.div
              key={a.title}
              className="stagger-item"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.09 }}
            >
              <Link href={articleHref(a)} className="picks-item">
                <span className="picks-rank" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="picks-body">
                  <p className="picks-quote">{a.title}</p>
                  <NewBadge article={a} block />
                  <span className="picks-byline">
                    <span className="picks-avatar" style={{ background: avatarColorFor(author) }}>
                      {initialsFor(author)}
                    </span>
                    <span className="picks-author">{author}</span>
                  </span>
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function HomeModules() {
  return (
    <div className="home-modules">
      <MarketPulse />
      <TopOfTheFold />
    </div>
  );
}
