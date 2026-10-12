"use client";

import { getSavedSlugs } from "@/components/articles/article-actions";
import { ArticleCard } from "@/components/articles/article-card";
import { Stagger } from "@/components/motion/stagger";
import { useMounted } from "@/hooks/use-mounted";
import { publishedArticles, slugify } from "@/lib/articles";
import type { Article } from "@/lib/types";

// Kept entirely in this browser's own storage, never sent anywhere.
export default function SavedPage() {
  const mounted = useMounted();
  const saved: Article[] | null = mounted
    ? publishedArticles().filter((a) => getSavedSlugs().includes(slugify(a.title)))
    : null;

  return (
    <section className="saved-page">
      <p className="page-kicker">Reading List</p>
      <h1>Saved Articles</h1>
      <p className="markets-disclaimer">Kept only in this browser, on this device — not sent anywhere, not visible to anyone else.</p>
      {saved === null ? null : saved.length === 0 ? (
        <p className="empty-note">Nothing saved yet — use &quot;Save for later&quot; on any article.</p>
      ) : (
        <Stagger className="grid">
          {saved.map((a) => (
            <ArticleCard key={a.title} article={a} />
          ))}
        </Stagger>
      )}
    </section>
  );
}
