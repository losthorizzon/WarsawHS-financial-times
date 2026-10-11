"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/articles/article-card";
import { Stagger } from "@/components/motion/stagger";
import { LENGTH_FILTERS, articleHref, publishedArticles } from "@/lib/articles";
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from "@/lib/site";
import type { Article } from "@/lib/types";

const ALL = "All";

export function HomeView({ modules }: { modules: ReactNode }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [length, setLength] = useState("all");

  const published = useMemo(() => publishedArticles(), []);

  // "/" pressed on another page lands here with ?focus=search.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("focus") === "search") searchRef.current?.focus();
  }, []);

  const matches = (a: Article, ignoreLength = false) => {
    const matchesCategory = category === ALL || a.category === category;
    const haystack = (a.title + " " + a.summary + " " + a.category).toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesLength = ignoreLength || LENGTH_FILTERS.find((f) => f.key === length)!.test(a);
    return matchesCategory && matchesQuery && matchesLength;
  };

  const filtered = published.filter((a) => matches(a));
  // Length counts follow the current category and search, so a chip never
  // promises articles the other filters would hide.
  const lengthBase = published.filter((a) => matches(a, true));
  const isDefaultView = category === ALL && !query && length === "all";

  const feelingLucky = () => {
    if (published.length === 0) return;
    const pick = published[Math.floor(Math.random() * published.length)];
    router.push(articleHref(pick));
  };

  const emptyMessage = query
    ? "No articles match that search yet."
    : length !== "all"
      ? "No articles of that length here yet. Try another length or section."
      : "No stories published in this section yet. Check back soon.";

  return (
    <section>
      <div className="controls">
        <div className="search-wrap">
          <input
            ref={searchRef}
            type="search"
            id="searchInput"
            placeholder="Search articles…"
            aria-label="Search articles"
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
          />
        </div>
        <button type="button" className="lucky-btn" title="Open a random article" onClick={feelingLucky}>
          I&apos;m Feeling Lucky
        </button>
        <div className="cat-filter">
          {[ALL, ...CATEGORIES].map((c) => {
            const count = c === ALL ? published.length : published.filter((a) => a.category === c).length;
            return (
              <button
                key={c}
                type="button"
                className={`cat-btn${c === category ? " is-active" : ""}`}
                aria-pressed={c === category}
                onClick={() => setCategory(c)}
              >
                {c} <span className="cat-count">({count})</span>
              </button>
            );
          })}
        </div>
        <div className="length-filter-row">
          <span className="filter-group-label">Length</span>
          <div className="cat-filter length-filter" role="group" aria-label="Filter by reading time">
            {LENGTH_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`cat-btn${f.key === length ? " is-active" : ""}`}
                aria-pressed={f.key === length}
                onClick={() => setLength(f.key)}
              >
                {f.label} <span className="cat-count">({lengthBase.filter(f.test).length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The homepage-wide modules only make sense on the unfiltered front
          page; a specific category gets its own small section-front header. */}
      <AnimatePresence mode="wait" initial={false}>
        {!isDefaultView && category !== ALL ? (
          <motion.div
            key={category}
            className="category-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h2 className="category-banner-title">{category}</h2>
            <p className="category-banner-sub">{CATEGORY_DESCRIPTIONS[category] || ""}</p>
          </motion.div>
        ) : isDefaultView ? (
          <motion.div key="modules" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            {modules}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <p className="empty-note">{emptyMessage}</p>
      ) : (
        <Stagger className="grid" resetKey={`${category}|${length}|${query}`}>
          {filtered.map((a) => (
            <ArticleCard key={a.title} article={a} />
          ))}
        </Stagger>
      )}
    </section>
  );
}
