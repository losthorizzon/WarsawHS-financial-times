import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Style & Submission Guide" };

export default function StyleGuidePage() {
  return (
    <section className="static-page">
      <p className="page-kicker">For Contributors</p>
      <h1>Style &amp; Submission Guide</h1>
      <p>
        All submissions should be authentic, communicating economic and financial concepts clearly, precisely. If
        plagiarism is detected, it will not be published.
      </p>

      <h2>Tone</h2>
      <p>
        Use plain, precise language. A technical term should be defined at first use if it is necessary to the piece.
        Write in a clear, direct voice, favoring clarity over complexity.
      </p>

      <h2>Structure</h2>
      <p>
        Open with a concrete example or development, then connect it to the broader concept it illustrates. Most pieces
        run three to six paragraphs; there is no minimum length requirement.
      </p>

      <h2>Sourcing</h2>
      <p>
        Every factual or statistical claim must be supported by a credible source: a link, dataset, book, or interview.
        Original analysis and opinion do not require sourcing. List sources in Editor Tools&apos; References field, one per
        line.
      </p>

      <h2>Images</h2>
      <p>
        Optional. Any image must be one you have the right to use, such as an original photograph or a clearly licensed
        image (e.g. Pexels, Unsplash), as Editor Tools uploads it directly into the page.
      </p>

      <h2>Submission process</h2>
      <p>
        Submit a pitch, consisting of a topic and a brief statement of angle, through the{" "}
        <Link className="inline-link" href="/contact/">
          Contact page
        </Link>
        . Once approved, the piece is submitted to an editor for entry.
      </p>
    </section>
  );
}
