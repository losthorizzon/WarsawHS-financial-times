"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/articles/article-card";
import { DrawRule, EASE_OUT } from "@/components/motion/reveal";
import { LENGTH_FILTERS, articleHref, publishedArticles } from "@/lib/articles";
import { CATEGORIES, CATEGORY_DESCRIPTIONS } from "@/lib/site";
import type { Article } from "@/lib/types";
import { FilterPills } from "@/components/site/filter-pills";
import { LeadStory } from "./lead-story";

const ALL = "All";

export function HomeView({ modules }: { modules: ReactNode }) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  const [length, setLength] = useState("all");

  const published = useMemo(() => publishedArticles(), []);
  const lead = published[0];

  // "/" pressed on another page lands here with ?focus=search.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("focus") === "search") {
      searchRef.current?.focus();
      searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const matches = (a: Article, ignoreLength = false) => {
    const matchesCategory = category === ALL || a.category === category;
    const haystack = (a.title + " " + a.summary + " " + a.category).toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    const matchesLength = ignoreLength || LENGTH_FILTERS.find((f) => f.key === length)!.test(a);
    return matchesCategory && matchesQuery && matchesLength;
  };

  const isDefaultView = category === ALL && !query && length === "all";
  // The lead story already sits at the top, so the unfiltered feed starts
  // with the next one; any filter searches the whole archive.
  const filtered = published.filter((a) => matches(a) && !(isDefaultView && a === lead));
  // Length counts follow the current category and search, so a chip never
  // promises articles the other filters would hide.
  const lengthBase = published.filter((a) => matches(a, true));

  const feelingLucky = () => {
    if (published.length === 0) return;
    router.push(articleHref(published[Math.floor(Math.random() * published.length)]));
  };

  const emptyMessage = query
    ? "No articles match that search yet."
    : length !== "all"
      ? "No articles of that length here yet. Try another length or section."
      : "No stories published in this section yet. Check back soon.";

  return (
    <section className="home">
      {lead && <LeadStory article={lead} />}

      {modules}

      <div className="section-head">
        <h2 className="section-title">Latest stories</h2>
        <DrawRule className="section-rule" />
      </div>

      <div className="controls">
        <div className="search-wrap">
          <input
            ref={searchRef}
            type="search"
            id="searchInput"
            placeholder="Search articles…  (press / )"
            aria-label="Search articles"
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
          />
        </div>
        <motion.button
          type="button"
          className="lucky-btn"
          title="Open a random article"
          onClick={feelingLucky}
          whileHover={{ rotate: -2, scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
        >
          🎲 I&apos;m Feeling Lucky
        </motion.button>
        <FilterPills
          id="category"
          label="Filter by section"
          value={category}
          onChange={setCategory}
          options={[ALL, ...CATEGORIES].map((c) => ({
            key: c,
            label: c,
            count: c === ALL ? published.length : published.filter((a) => a.category === c).length,
          }))}
        />
        <div className="length-filter-row">
          <span className="filter-group-label">Length</span>
          <FilterPills
            id="length"
            small
            label="Filter by reading time"
            value={length}
            onChange={setLength}
            options={LENGTH_FILTERS.map((f) => ({ key: f.key, label: f.label, count: lengthBase.filter(f.test).length }))}
          />
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {category !== ALL && (
          <motion.div
            key={category}
            className="category-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <h2 className="category-banner-title">{category}</h2>
            <p className="category-banner-sub">{CATEGORY_DESCRIPTIONS[category] || ""}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards that survive a filter change glide to their new spot;
          the rest fade out and new ones fade in. */}
      <LayoutGroup>
        <motion.div layout className="grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((a, i) => (
              <motion.div
                key={a.title}
                layout
                className="grid-item"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -6% 0px" }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: EASE_OUT, delay: (i % 2) * 0.08 }}
              >
                <ArticleCard article={a} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
      <AnimatePresence>
        {filtered.length === 0 && (
          <motion.p className="empty-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {emptyMessage}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
