import type { Metadata } from "next";
import { MarketsView } from "@/components/markets/markets-view";

export const metadata: Metadata = { title: "Markets" };

// Market data is a fixed one-year lookback snapshot (src/data/market.json).
// It is not refreshed automatically; the page always says so.
export default function MarketsPage() {
  return (
    <section className="markets-page">
      <p className="page-kicker">Data &amp; Analysis</p>
      <h1>Markets</h1>
      <p className="markets-note">One-year lookback</p>
      <p className="markets-disclaimer">
        <strong>One-year lookback.</strong> Price change only; dividends excluded. Fixed snapshot, not a live feed. Past
        performance does not predict future returns.
      </p>
      <MarketsView />
    </section>
  );
}
