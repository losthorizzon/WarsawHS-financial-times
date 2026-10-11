import type { Metadata } from "next";
import { GlossaryView } from "@/components/glossary/glossary-view";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  return (
    <section className="static-page">
      <p className="page-kicker">Reference</p>
      <h1>Glossary</h1>
      <p>Financial and economic terms used throughout our articles, defined in plain English and collected here for reference.</p>
      <GlossaryView />
    </section>
  );
}
