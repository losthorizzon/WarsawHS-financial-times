import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ArticleActions } from "@/components/articles/article-actions";
import { NewBadge } from "@/components/articles/new-badge";
import { ArticleKeyNav, ReadingChrome } from "@/components/articles/reading-chrome";
import { ArticleHero } from "@/components/articles/article-hero";
import { Reveal, WordReveal } from "@/components/motion/reveal";
import {
  articleHref,
  asset,
  authorHref,
  authorOf,
  findArticleBySlug,
  formatDate,
  linkArticleBody,
  previousInCategory,
  publishedArticles,
  readingTime,
  relatedArticles,
  slugify,
} from "@/lib/articles";

export function generateStaticParams() {
  return publishedArticles().map((a) => ({ slug: slugify(a.title) }));
}

export async function generateMetadata({ params }: PageProps<"/articles/[slug]">): Promise<Metadata> {
  const a = findArticleBySlug((await params).slug);
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function ArticlePage({ params }: PageProps<"/articles/[slug]">) {
  const { slug } = await params;
  const a = findArticleBySlug(slug);
  if (!a) notFound();

  const author = authorOf(a);
  const paragraphs = linkArticleBody(a.body);
  const prev = previousInCategory(a);
  const related = relatedArticles(a);

  const list = publishedArticles();
  const pos = list.findIndex((x) => x.title === a.title);
  const newer = list[pos - 1];
  const older = list[pos + 1];

  return (
    <section>
      <ReadingChrome title={a.title} />
      <ArticleKeyNav newerHref={newer && articleHref(newer)} olderHref={older && articleHref(older)} />
      <Link href="/" className="back-link">
        ← Back to all articles
      </Link>
      <article>
        <p className="article-kicker">
          {a.category}
          <NewBadge article={a} />
        </p>
        <WordReveal as="h1" className="article-title" id="articleTitle" text={a.title} />
        <p className="article-dek">{a.summary}</p>
        {a.image && <ArticleHero src={asset(a.image)} alt={a.imageAlt || a.title} />}
        <div className="article-meta">
          <span className="article-byline">
            By{" "}
            <Link href={authorHref(author)} className="byline-link">
              {author}
            </Link>
          </span>
          <span aria-hidden="true">·</span>
          <span>{formatDate(a.date)}</span>
          <span aria-hidden="true">·</span>
          <span>{readingTime(a.body)}</span>
        </div>

        <ArticleActions slug={slug} title={a.title} />

        <div className="article-body" id="articleBody">
          {paragraphs.map((segments, i) => (
            <Fragment key={i}>
              <Reveal as="p" y={10}>
                {segments.map((s, j) =>
                  s.kind === "glossary" ? (
                    <Link key={j} href={`/glossary/?term=${slugify(s.term)}`} className="glossary-term">
                      {s.text}
                    </Link>
                  ) : s.kind === "ticker" ? (
                    <Link key={j} href={`/markets/?symbol=${s.symbol}`} className="ticker-link">
                      {s.text}
                    </Link>
                  ) : (
                    <Fragment key={j}>{s.text}</Fragment>
                  )
                )}
              </Reveal>
              {i === 0 && a.pullQuote && (
                <Reveal as="blockquote" className="pull-quote" y={0}>
                  {a.pullQuote}
                </Reveal>
              )}
            </Fragment>
          ))}
        </div>

        {a.corrections && a.corrections.length > 0 && (
          <div className="corrections">
            <h3>Corrections</h3>
            <ul>
              {a.corrections.map((c, i) => (
                <li key={i}>
                  <span className="correction-date">{formatDate(c.date)}:</span> {c.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {a.references && a.references.length > 0 && (
          <div className="references">
            <h3>References</h3>
            <ol>
              {a.references.map((r, i) => (
                <li key={i}>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener">
                      {r.label}
                    </a>
                  ) : (
                    r.label
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {prev && (
          <Link href={articleHref(prev)} className="prev-teaser">
            {prev.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="prev-teaser-thumb" src={asset(prev.image)} alt="" />
            )}
            <span className="prev-teaser-text">
              <p className="prev-teaser-eyebrow">Previously in {prev.category}</p>
              <span className="prev-teaser-title">{prev.title}</span>
            </span>
          </Link>
        )}

        {related.length > 0 && (
          <div className="related">
            <h3>More in this category</h3>
            <div className="related-list">
              {related.map((r) => (
                <Link key={r.title} href={articleHref(r)} className="related-item">
                  <p className="card-kicker">{r.category}</p>
                  <h4 className="card-title">{r.title}</h4>
                  <p className="card-date">{formatDate(r.date)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
