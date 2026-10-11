"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { FORM_RECIPIENT, INSTAGRAM_URL, SITE_TAGLINE, SITE_TITLE } from "@/lib/site";

const FOOTER_LINKS = [
  { href: "/privacy/", label: "Privacy Policy" },
  { href: "/style-guide/", label: "Style Guide" },
  { href: "/corrections/", label: "Corrections" },
  { href: "/saved/", label: "Saved Articles" },
  { href: "/editor/", label: "Editor Tools" },
];

export function SiteFooter() {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2200 });

  return (
    <footer className="site-footer">
      <p className="footer-mark">{SITE_TITLE}</p>
      <p className="footer-tagline">{SITE_TAGLINE}</p>
      <p className="footer-social">
        <button
          type="button"
          className="social-link"
          aria-label="Copy our email address"
          title={FORM_RECIPIENT}
          onClick={() => copyToClipboard(FORM_RECIPIENT)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 6l10 7 10-7" />
          </svg>
        </button>
        <a className="social-link" href={INSTAGRAM_URL} target="_blank" rel="noopener" aria-label="Follow us on Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4.5" />
            <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <AnimatePresence>
          {isCopied && (
            <motion.span
              className="footer-copy-feedback"
              // x keeps the stylesheet's centering, which Motion's own transform would otherwise replace.
              initial={{ opacity: 0, y: 4, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, x: "-50%" }}
            >
              Email address copied
            </motion.span>
          )}
        </AnimatePresence>
      </p>
      <p>Articles reflect the views of their authors.</p>
      <p className="footer-links-row">
        {FOOTER_LINKS.map((l, i) => (
          <span key={l.href}>
            {i > 0 && (
              <span aria-hidden="true" style={{ color: "var(--hairline)", margin: "0 0.4rem" }}>
                ·
              </span>
            )}
            <Link className="footer-editor-link" href={l.href}>
              {l.label}
            </Link>
          </span>
        ))}
      </p>
    </footer>
  );
}
