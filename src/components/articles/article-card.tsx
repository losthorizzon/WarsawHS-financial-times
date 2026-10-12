import Link from "next/link";
import { articleHref, asset, authorOf, formatDate, readingTime } from "@/lib/articles";
import type { Article } from "@/lib/types";
import { NewBadge } from "./new-badge";

export function ArticleCard({ article: a }: { article: Article }) {
  return (
    <Link href={articleHref(a)} className="card">
      {a.image && (
        <span className="card-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="card-thumb" src={asset(a.image)} alt={a.imageAlt || a.title} loading="lazy" />
        </span>
      )}
      <p className="card-kicker">
        {a.category}
        <NewBadge article={a} />
      </p>
      <h3 className="card-title">
        <span className="card-title-line">{a.title}</span>
      </h3>
      <p className="card-summary">{a.summary}</p>
      <p className="card-date">
        {authorOf(a)} &middot; {formatDate(a.date)} &middot; {readingTime(a.body)}
      </p>
    </Link>
  );
}
