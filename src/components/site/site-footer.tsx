"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { FORM_RECIPIENT, INSTAGRAM_URL, SITE_TAGLINE, SITE_TITLE } from "@/lib/site";
import { NAV } from "./site-nav";

const MORE_LINKS = [
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
      <div className="footer-inner">
        <Reveal className="footer-top">
          <div className="footer-brand">
            <p className="footer-mark">{SITE_TITLE}</p>
            <p className="footer-tagline">{SITE_TAGLINE}</p>
            <p className="footer-social">
              <motion.button
                type="button"
                className="social-link"
                aria-label="Copy our email address"
                title={FORM_RECIPIENT}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => copyToClipboard(FORM_RECIPIENT)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 6l10 7 10-7" />
                </svg>
              </motion.button>
              <motion.a
                className="social-link"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener"
                aria-label="Follow us on Instagram"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.92 }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
                </svg>
              </motion.a>
              <AnimatePresence>
                {isCopied && (
                  <motion.span
                    className="footer-copy-feedback"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Email address copied
                  </motion.span>
                )}
              </AnimatePresence>
            </p>
          </div>
          <nav className="footer-col" aria-label="Sections">
            <h3>Sections</h3>
            <ul>
              {NAV.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav className="footer-col" aria-label="More">
            <h3>More</h3>
            <ul>
              {MORE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>
        <div className="footer-bottom">
          <p>Articles reflect the views of their authors.</p>
          <p>Written by students in Warsaw · {FORM_RECIPIENT}</p>
        </div>
      </div>
    </footer>
  );
}
