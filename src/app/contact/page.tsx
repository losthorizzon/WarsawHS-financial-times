import type { Metadata } from "next";
import Link from "next/link";
import { MailtoForm } from "@/components/contact/mailto-form";
import { CopyEmailButton } from "@/components/site/copy-email-button";
import { FORM_RECIPIENT, INSTAGRAM_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="static-page">
      <p className="page-kicker">Get In Touch</p>
      <h1>Contact</h1>
      <p>
        Have a question, correction or complaint? Reach us at <strong>{FORM_RECIPIENT}</strong> <CopyEmailButton /> or on
        Instagram{" "}
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener">
          @tbsmarketminds
        </a>
        .
      </p>
      <p className="privacy-note">
        If you&apos;re under 16, parent or guardian consent is required before submitting any form below. See our{" "}
        <Link className="inline-link" href="/privacy/">
          Privacy Policy
        </Link>{" "}
        on what we do with the information you send us.
      </p>

      <p className="field-hint" style={{ marginTop: 0 }}>
        Fill this out and tap Send Message — it opens your email app with this pre-filled and addressed to {FORM_RECIPIENT},
        ready for you to send.
      </p>
      <MailtoForm kind="contact" />

      <h2>Want to work with us?</h2>
      <p>
        Join our editorial team or contribute as a one-time guest writer. Fill out the short application below and tap
        Send Application — it opens your email app with everything filled in, addressed to {FORM_RECIPIENT}. For article
        formatting and submission requirements, see our{" "}
        <Link className="inline-link" href="/style-guide/">
          Style &amp; Submission Guide
        </Link>
        .
      </p>
      <MailtoForm kind="writer" />
    </section>
  );
}
