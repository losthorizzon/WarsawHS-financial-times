import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/articles/article-card";
import { Stagger } from "@/components/motion/stagger";
import { allAuthors, authorOf, publishedArticles, slugify } from "@/lib/articles";
import { TEAM_ROLES } from "@/lib/site";

const findAuthor = (slug: string) => allAuthors().find((n) => slugify(n) === slug);

export function generateStaticParams() {
  return allAuthors().map((name) => ({ slug: slugify(name) }));
}

export async function generateMetadata({ params }: PageProps<"/authors/[slug]">): Promise<Metadata> {
  const name = findAuthor((await params).slug);
  return name ? { title: name } : {};
}

export default async function AuthorPage({ params }: PageProps<"/authors/[slug]">) {
  const name = findAuthor((await params).slug);
  if (!name) notFound();
  const info = TEAM_ROLES[name];
  const articles = publishedArticles().filter((a) => authorOf(a) === name);

  return (
    <section id="page-author">
      <Link href="/" className="back-link">
        ← Back to all articles
      </Link>
      <p className="page-kicker">Author</p>
      <h1>{name}</h1>
      {info && <p className="author-role">{info.role}</p>}
      {info?.bio && <p className="author-bio">{info.bio}</p>}
      {articles.length === 0 ? (
        <p className="empty-note">No articles from this author yet.</p>
      ) : (
        <Stagger className="grid">
          {articles.map((a) => (
            <ArticleCard key={a.title} article={a} />
          ))}
        </Stagger>
      )}
    </section>
  );
}
