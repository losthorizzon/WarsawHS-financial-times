import articlesData from "@/data/articles.json";
import marketData from "@/data/market.json";
import { AVATAR_COLORS, DEFAULT_AUTHOR, GLOSSARY } from "./site";
import type { Article, GlossaryEntry, MarketData, Reference } from "./types";

export const ARTICLES = articlesData as Article[];
export const MARKET = marketData as MarketData;
export const MARKET_DATA = MARKET.instruments;

// Prefixes a /public path with the GitHub Pages base path. data: URIs
// (images added through Editor Tools) pass through untouched.
export function asset(path: string) {
  if (!path.startsWith("/")) return path;
  return (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + path;
}

// Turns a title into a stable, URL-safe slug ("Why the Cafeteria Vending
// Machine..." -> "why-the-cafeteria-vending-machine..."), so an article
// can be linked directly without needing a separate id field on every
// article. Same rule as the original site, so old #article/<slug> links
// still resolve.
export function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const authorOf = (a: Article) => a.author || DEFAULT_AUTHOR;

/** Published (non-draft) articles, newest first. */
export function publishedArticles() {
  return ARTICLES.filter((a) => a.status !== "draft").sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function findArticleBySlug(slug: string) {
  return publishedArticles().find((a) => slugify(a.title) === slug);
}

export function articleHref(a: Article) {
  return `/articles/${slugify(a.title)}/`;
}

export function authorHref(name: string) {
  return `/authors/${slugify(name)}/`;
}

export function allAuthors() {
  return [...new Set(publishedArticles().map(authorOf))];
}

export function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function readMinutes(paragraphs: string[]) {
  const words = paragraphs.join(" ").trim().split(/\s+/).filter(Boolean).length;
  // Rounding UP (not to the nearest minute) so a 4-minute-20-second piece
  // reads as "5 min" instead of quietly shrinking to "4 min" — a reader
  // should never end up spending longer than the label promised.
  return Math.max(1, Math.ceil(words / 200));
}

export const readingTime = (paragraphs: string[]) => readMinutes(paragraphs) + " min read";

// Length filter on the homepage: "quick" is anything under 4 minutes.
export const LENGTH_FILTERS = [
  { key: "all", label: "Any length", test: () => true },
  { key: "quick", label: "Quick reads (under 4 min)", test: (a: Article) => readMinutes(a.body) < 4 },
  { key: "deep", label: "Deep dives (4+ min)", test: (a: Article) => readMinutes(a.body) >= 4 },
];

// An article is "New" for its first 7 days (its publish date plus the six
// days after). Compared against the visitor's own clock, so the badge
// expires by itself with nothing to edit. A future-dated article isn't
// badged until its date arrives.
export function isNewArticle(a: Article, now = new Date()) {
  const published = new Date(a.date + "T00:00:00");
  if (isNaN(published.getTime())) return false;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((today.getTime() - published.getTime()) / 86400000);
  return days >= 0 && days < 7;
}

export function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function avatarColorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/** Same-category pieces, newest first, excluding the current one. */
export function relatedArticles(current: Article) {
  return publishedArticles()
    .filter((a) => a.title !== current.title && a.category === current.category)
    .slice(0, 3);
}

// The single most recent OLDER piece in the same category: a stronger,
// more prominent nudge than the plain "More in this category" list,
// pointing at exactly one specific next read.
export function previousInCategory(current: Article) {
  return publishedArticles().find(
    (a) => a.title !== current.title && a.category === current.category && a.date < current.date
  );
}

// ---------- References ----------

// Accepts one reference per line: "Label — https://..." (em dash or
// hyphen), a bare URL, or a plain label with no link (a book, an
// interview) — shown as plain text instead of a hyperlink.
export function parseReferences(raw: string): Reference[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+[—-]\s+/);
      if (parts.length >= 2) {
        const url = parts.pop()!.trim();
        const label = parts.join(" - ").trim();
        return /^https?:\/\//i.test(url) ? { label, url } : { label: line, url: "" };
      }
      return /^https?:\/\//i.test(line) ? { label: line, url: line } : { label: line, url: "" };
    });
}

// The inverse of parseReferences — turns stored {label, url} objects
// back into the one-per-line text the References textarea expects.
export function referencesToText(refs?: Reference[]) {
  if (!refs) return "";
  return refs
    .map((r) => {
      if (!r.url) return r.label;
      if (r.label === r.url) return r.url;
      return r.label + " - " + r.url;
    })
    .join("\n");
}

export function splitParagraphs(raw: string) {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

// ---------- Markets formatting ----------

export function formatPrice(value: number) {
  if (value >= 1000) return "$" + value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + value.toFixed(2);
}

export const formatPct = (value: number) => (value >= 0 ? "+" : "") + value.toFixed(2) + "%";

// ---------- In-article linking: glossary terms + ticker symbols ----------

export type BodySegment =
  | { kind: "text"; text: string }
  | { kind: "glossary"; text: string; term: string }
  | { kind: "ticker"; text: string; symbol: string };

// Matched longest-first so a multi-word term ("GDP growth rate") is
// linked whole, before a shorter term that's also a substring of it
// ("GDP") gets a chance to split it apart.
const GLOSSARY_SORTED: GlossaryEntry[] = [...GLOSSARY].sort((a, b) => b.term.length - a.term.length);
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Splits each paragraph into plain text, glossary links and ticker links.
 * Glossary terms link only their FIRST mention across the whole article
 * (a common word like "inflation" can appear a dozen times, and linking
 * every one would bury the piece in underlines); ticker symbols link
 * every time they appear.
 */
export function linkArticleBody(paragraphs: string[]): BodySegment[][] {
  const used = new Set<string>();
  const symbols = MARKET_DATA.map((m) => m.symbol).sort((a, b) => b.length - a.length);
  const tickerRe = new RegExp("\\b(" + symbols.map(escapeRe).join("|") + ")\\b", "g");

  const splitTickers = (text: string): BodySegment[] => {
    const out: BodySegment[] = [];
    let last = 0;
    for (const m of text.matchAll(tickerRe)) {
      if (m.index! > last) out.push({ kind: "text", text: text.slice(last, m.index) });
      out.push({ kind: "ticker", text: m[0], symbol: m[0] });
      last = m.index! + m[0].length;
    }
    if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
    return out;
  };

  return paragraphs.map((p) => {
    // Find this paragraph's first-mention glossary matches without
    // letting a shorter term re-match inside an already-claimed longer one.
    const claimed: { start: number; end: number; term: string }[] = [];
    for (const entry of GLOSSARY_SORTED) {
      if (used.has(entry.term)) continue;
      const re = new RegExp("\\b" + escapeRe(entry.term) + "\\b", "gi");
      for (const m of p.matchAll(re)) {
        const start = m.index!;
        const end = start + m[0].length;
        if (claimed.some((c) => start < c.end && end > c.start)) continue;
        claimed.push({ start, end, term: entry.term });
        used.add(entry.term);
        break;
      }
    }
    claimed.sort((a, b) => a.start - b.start);

    const segments: BodySegment[] = [];
    let cursor = 0;
    for (const c of claimed) {
      if (c.start > cursor) segments.push(...splitTickers(p.slice(cursor, c.start)));
      segments.push({ kind: "glossary", text: p.slice(c.start, c.end), term: c.term });
      cursor = c.end;
    }
    if (cursor < p.length) segments.push(...splitTickers(p.slice(cursor)));
    return segments;
  });
}
