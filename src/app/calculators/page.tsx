import type { Metadata } from "next";
import { CalculatorsView } from "@/components/calculators/calculators-view";

export const metadata: Metadata = { title: "Calculators" };

export default function CalculatorsPage() {
  return (
    <section className="static-page">
      <p className="page-kicker">Tools</p>
      <h1>Calculators</h1>
      <p>
        Three quick ways to see the ideas in our articles with your own numbers. Nothing you type leaves your device, and
        the results work in any currency.
      </p>
      <CalculatorsView />
    </section>
  );
}
