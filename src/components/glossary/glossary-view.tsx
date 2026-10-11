"use client";

import { useEffect, useState } from "react";
import { Stagger } from "@/components/motion/stagger";
import { useQueryParam } from "@/hooks/use-mounted";
import { slugify } from "@/lib/articles";
import { CATEGORIES, GLOSSARY } from "@/lib/site";

const ALL = "All";
const SORTED = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

export function GlossaryView() {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");
  // A linked term inside an article arrives as ?term=<slug>: scroll to
  // that entry and flash it. Filters start cleared, so it's always on screen.
  const requested = useQueryParam("term");
  const [flashDone, setFlashDone] = useState(false);
  const target = flashDone ? "" : requested;

  useEffect(() => {
    if (!requested) return;
    const scroll = setTimeout(
      () => document.getElementById("glossary-" + requested)?.scrollIntoView({ behavior: "smooth", block: "center" }),
      350
    );
    const fade = setTimeout(() => setFlashDone(true), 2600);
    return () => {
      clearTimeout(scroll);
      clearTimeout(fade);
    };
  }, [requested]);

  const matches = SORTED.filter((entry) => {
    const matchesCategory = category === ALL || entry.category === category;
    const haystack = (entry.term + " " + entry.definition).toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });

  return (
    <>
      <div className="controls glossary-controls">
        <div className="search-wrap">
          <input
            type="search"
            placeholder="Search terms…"
            aria-label="Search glossary"
            onChange={(e) => setQuery(e.target.value.toLowerCase())}
          />
        </div>
        <div className="cat-filter">
          {[ALL, ...CATEGORIES].map((c) => {
            const count = c === ALL ? GLOSSARY.length : GLOSSARY.filter((g) => g.category === c).length;
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
      </div>
      <p className="glossary-count">
        {matches.length === GLOSSARY.length
          ? `${GLOSSARY.length} terms`
          : `Showing ${matches.length} of ${GLOSSARY.length} terms`}
      </p>
      {matches.length === 0 ? (
        <p className="empty-note">No terms match that search yet.</p>
      ) : (
        <Stagger className="glossary-list" resetKey={`${category}|${query}`} step={0.02}>
          {matches.map((entry) => {
            const slug = slugify(entry.term);
            return (
              <div key={entry.term} className={`glossary-item${target === slug ? " is-target" : ""}`} id={"glossary-" + slug}>
                <div className="glossary-item-head">
                  <p className="glossary-term-name">{entry.term}</p>
                  <span className="glossary-category-tag">{entry.category}</span>
                </div>
                <p className="glossary-definition">{entry.definition}</p>
              </div>
            );
          })}
        </Stagger>
      )}
    </>
  );
}
