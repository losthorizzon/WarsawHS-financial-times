import Link from "next/link";
import { NewBadge } from "@/components/articles/new-badge";
import SlideTextButton from "@/components/kokonutui/slide-text-button";
import { Sparkline } from "@/components/markets/sparkline";
import { Stagger } from "@/components/motion/stagger";
import {
  MARKET_DATA,
  articleHref,
  authorOf,
  avatarColorFor,
  formatPct,
  formatPrice,
  initialsFor,
  publishedArticles,
} from "@/lib/articles";
import { SNAPSHOT_SYMBOLS } from "@/lib/site";

function MarketPulse() {
  const rows = SNAPSHOT_SYMBOLS.map((sym) => MARKET_DATA.find((m) => m.symbol === sym)).filter((m) => !!m);
  return (
    <div className="module-box">
      <div className="module-head">
        <h2>Market Pulse · 1-Year</h2>
        <SlideTextButton href="/markets/" text="Full Markets →" hoverText="Open Markets →" className="slide-link" />
      </div>
      <div className="snapshot-list">
        {rows.map((m) => {
          const up = m.change1Y >= 0;
          return (
            <Link key={m.symbol} href={`/markets/?symbol=${m.symbol}`} className="snapshot-row" style={{ color: "inherit", textDecoration: "none" }}>
              <span className="snapshot-symbol">{m.symbol}</span>
              <span className="snapshot-name" title={m.name}>
                {m.name}
              </span>
              <Sparkline values={m.spark} up={up} />
              <span className="snapshot-figures">
                <span className="snapshot-price">{formatPrice(m.price)}</span>
                <span className={`snapshot-change ${up ? "up" : "down"}`}>{formatPct(m.change1Y)} 1Y</span>
              </span>
            </Link>
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
      <Stagger className="picks-list" step={0.08}>
        {picks.map((a) => {
          const author = authorOf(a);
          return (
            <Link key={a.title} href={articleHref(a)} className="picks-item">
              <p className="picks-quote">{a.title}</p>
              <NewBadge article={a} block />
              <div className="picks-byline">
                <span className="picks-avatar" style={{ background: avatarColorFor(author) }}>
                  {initialsFor(author)}
                </span>
                <span className="picks-author">{author}</span>
              </div>
            </Link>
          );
        })}
      </Stagger>
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
