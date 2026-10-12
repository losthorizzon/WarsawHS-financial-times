import Link from "next/link";
import { MARKET_DATA, formatPct } from "@/lib/articles";
import { CompactHeader, MastheadTitle } from "./masthead";
import { SiteNav } from "./site-nav";
import { UtilityBar } from "./utility-bar";

function TickerItems({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <span className={duplicate ? "ticker-dup" : undefined} aria-hidden={duplicate || undefined}>
      {MARKET_DATA.map((m) => {
        const up = m.change1Y >= 0;
        return (
          <span className="ticker-item" key={m.symbol}>
            {m.symbol}{" "}
            <span className={`ticker-pill ${up ? "up" : "down"}`}>
              {up ? "▲" : "▼"} {formatPct(m.change1Y)}
            </span>
          </span>
        );
      })}
      <span className="ticker-item ticker-cta">Visit Markets Data</span>
    </span>
  );
}

/** Ticker + utility bar + title + nav: one continuous navy block. */
export function SiteHeader() {
  return (
    <>
      <Link href="/markets/" className="ticker-tape" aria-label="View full markets data">
        <span className="ticker-label">Markets · 1-Year</span>
        <div className="ticker-scroll ticker-fade">
          {/* A fixed pace per item, so the tape doesn't race with 50 of them. */}
          <div className="ticker-track" style={{ animationDuration: `${MARKET_DATA.length * 2}s` }}>
            <TickerItems />
            <TickerItems duplicate />
          </div>
        </div>
      </Link>

      <UtilityBar />

      <MastheadTitle />

      <SiteNav />
      <CompactHeader />
    </>
  );
}
