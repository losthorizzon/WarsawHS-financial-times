import Link from "next/link";

export default function NotFound() {
  return (
    <section className="static-page">
      <p className="page-kicker">404</p>
      <h1>Page not found</h1>
      <p>That page doesn&apos;t exist, or it has moved.</p>
      <p>
        <Link className="inline-link" href="/">
          Back to all articles
        </Link>
      </p>
    </section>
  );
}
