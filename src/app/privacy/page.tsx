import type { Metadata } from "next";
import Link from "next/link";
import { CopyEmailButton } from "@/components/site/copy-email-button";
import { FORM_RECIPIENT } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <section className="static-page">
      <p className="page-kicker">Legal</p>
      <h1>Privacy Policy</h1>
      <p>Last Updated September 12, 2026.</p>

      <h2>What we collect, and why.</h2>
      <p>
        Our forms on the{" "}
        <Link className="inline-link" href="/contact/">
          Contact page
        </Link>{" "}
        don&apos;t send anything through this website or any other server: clicking Send opens your own email app with a
        message already addressed to us and filled in from what you typed, which you then choose to send yourself. We only
        ever see what actually arrives in our inbox: your name, email, and message or pitch (plus, optionally, your year or
        grade if you&apos;re applying to write). We use it solely to reply to you. No cookies, analytics, or tracking are
        present on this site. Browsing WFT does not send us any information about you.
      </p>

      <h2>Who else sees it.</h2>
      <p>
        Nobody. Your message travels directly from your own email account to ours, the same as emailing us yourself — no
        third-party service is involved.
      </p>

      <h2>How long we keep it.</h2>
      <p>
        We keep your message only as long as it takes to read and respond to it, plus a reasonable window afterward in
        case we need to follow up. It is then deleted.
      </p>

      <h2>If you&apos;re under 16.</h2>
      <p>
        Poland, like the rest of the EU, sets the age of consent for this kind of data collection at 16. If you are
        younger, parent or guardian permission is required before submitting any form. Parents or guardians may contact us
        to review or remove a child&apos;s submission.
      </p>

      <h2>Your rights.</h2>
      <p>
        You may ask us to share all information we have of you, correct it, or delete it entirely. Email{" "}
        <strong>{FORM_RECIPIENT}</strong> <CopyEmailButton /> for such requests.
      </p>

      <h2>Q&amp;A.</h2>
      <div className="qa-list">
        <details className="qa-item">
          <summary>Was this policy written by a lawyer?</summary>
          <p>No. It is written in plain language by the students who operate this site. If any part is unclear, contact us at the email above.</p>
        </details>
        <details className="qa-item">
          <summary>Who do I contact with privacy questions?</summary>
          <p>
            <strong>{FORM_RECIPIENT}</strong> <CopyEmailButton />
          </p>
        </details>
        <details className="qa-item">
          <summary>Do you use cookies or tracking?</summary>
          <p>No. This site uses no cookies, analytics, or tracking of any kind. We only ever see what you actually type into a form.</p>
        </details>
        <details className="qa-item">
          <summary>Do you share my information with advertisers or other companies?</summary>
          <p>No. We don&apos;t work with advertisers, and no third party is involved at all: our forms send directly from your own email account to ours.</p>
        </details>
      </div>
    </section>
  );
}
