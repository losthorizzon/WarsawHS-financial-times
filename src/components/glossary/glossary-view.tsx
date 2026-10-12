"use client";

import { useEffect, useState } from "react";
import { Reveal } from "@/components/motion/reveal";
import { FilterPills } from "@/components/site/filter-pills";
import { useQueryParam } from "@/hooks/use-mounted";
import { slugify } from "@/lib/articles";
import { CATEGORIES, GLOSSARY } from "@/lib/site";

const ALL = "All";
const SORTED = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

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

  // Matching terms grouped under their first letter, in A–Z order.
  const groups = new Map<string, typeof matches>();
  for (const entry of matches) {
    const letter = entry.term[0].toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), entry]);
  }

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
        <FilterPills
          id="glossary-category"
          label="Filter by section"
          value={category}
          onChange={setCategory}
          options={[ALL, ...CATEGORIES].map((c) => ({
            key: c,
            label: c,
            count: c === ALL ? GLOSSARY.length : GLOSSARY.filter((g) => g.category === c).length,
          }))}
        />
      </div>
      <p className="glossary-count">
        {matches.length === GLOSSARY.length
          ? `${GLOSSARY.length} terms`
          : `Showing ${matches.length} of ${GLOSSARY.length} terms`}
      </p>
      <nav className="az-bar" aria-label="Jump to letter">
        {ALPHABET.map((letter) => (
          <button
            key={letter}
            type="button"
            className="az-letter"
            disabled={!groups.has(letter)}
            onClick={() => document.getElementById("letter-" + letter)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            {letter}
          </button>
        ))}
      </nav>
      {matches.length === 0 ? (
        <p className="empty-note">No terms match that search yet.</p>
      ) : (
        <div className="glossary-list" key={`${category}|${query}`}>
          {[...groups].map(([letter, entries]) => (
            <Reveal key={letter} y={12}>
              <h2 className="glossary-letter" id={"letter-" + letter}>
                {letter}
              </h2>
              {entries.map((entry) => {
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
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
