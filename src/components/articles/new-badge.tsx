"use client";

import { useMounted } from "@/hooks/use-mounted";
import { isNewArticle } from "@/lib/articles";
import type { Article } from "@/lib/types";

/**
 * "New" for an article's first 7 days, judged by the visitor's own clock.
 * Rendered after mount only: the pages are built ahead of time, so the
 * build machine's date must never decide it.
 */
export function NewBadge({ article, block = false }: { article: Article; block?: boolean }) {
  const mounted = useMounted();
  if (!mounted || !isNewArticle(article)) return null;
  if (block) {
    return (
      <p style={{ margin: "0 0 0.5rem" }}>
        <span className="new-badge" style={{ marginLeft: 0 }}>
          New
        </span>
      </p>
    );
  }
  return (
    <>
      {" "}
      <span className="new-badge">New</span>
    </>
  );
}
