import type { Metadata } from "next";
import Link from "next/link";
import { articleHref, formatDate, publishedArticles } from "@/lib/articles";

export const metadata: Metadata = { title: "Corrections" };

export default function CorrectionsPage() {
  const withCorrections = publishedArticles().filter((a) => a.corrections && a.corrections.length > 0);
  return (
    <section className="static-page">
      <p className="page-kicker">Accountability</p>
      <h1>Corrections</h1>
      <p>Every correction issued on this site, in one place, dated and attached to the article it applies to.</p>
      {withCorrections.length === 0 ? (
        <p className="empty-note">No corrections have been issued.</p>
      ) : (
        withCorrections.map((a) => (
          <div className="corrections-index-item" key={a.title}>
            <Link href={articleHref(a)} className="corrections-index-title">
              {a.title}
            </Link>
            <ul>
              {a.corrections!.map((c, i) => (
                <li key={i}>
                  <span className="corrections-index-date">{formatDate(c.date)}:</span> {c.text}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  );
}
