"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState } from "react";
import { FloatingPaths } from "@/components/kokonutui/background-paths";
import { EASE_OUT } from "@/components/motion/reveal";
import { SITE_TAGLINE, SITE_TITLE } from "@/lib/site";
import { NAV } from "./site-nav";

// Soft white-to-pale-blue strokes: texture on the navy, never a pattern
// that competes with the title.
const PATH_GRADIENT: [string, string, string] = [
  "rgba(255, 255, 255, 0.05)",
  "rgba(147, 168, 230, 0.2)",
  "rgba(255, 255, 255, 0.04)",
];

/** The big title block: drifting Kokonut lines behind a letter-by-letter reveal. */
export function MastheadTitle() {
  const words = SITE_TITLE.split(" ");
  // Running letter count before each word, so the reveal flows left to right.
  const offsets = words.map((_, w) => words.slice(0, w).join("").length);
  return (
    <header className="site-header masthead">
      <div className="masthead-paths" aria-hidden="true">
        <FloatingPaths position={1} gradient={PATH_GRADIENT} />
        <FloatingPaths position={-1} gradient={PATH_GRADIENT} />
      </div>
      <div className="site-header-inner masthead-inner">
        <motion.p
          className="masthead-kicker"
          initial={{ opacity: 0, letterSpacing: "0.5em" }}
          animate={{ opacity: 1, letterSpacing: "0.22em" }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        >
          Warsaw · Economics · Markets · Ideas
        </motion.p>
        <Link href="/" className="site-title" aria-label={SITE_TITLE}>
          {/* Letters are grouped per word so a line can only wrap between words. */}
          {words.map((word, w) => (
            <Fragment key={w}>
            <span aria-hidden="true" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {Array.from(word).map((ch, i) => (
                <motion.span
                  key={i}
                  style={{ display: "inline-block" }}
                  initial={{ opacity: 0, y: "0.35em", filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 + (offsets[w] + i) * 0.018 }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
            {w < words.length - 1 && " "}
            </Fragment>
          ))}
        </Link>
        <motion.div
          className="masthead-rule"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.5 }}
        />
        <motion.p
          className="masthead-tagline"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.8 }}
        >
          {SITE_TAGLINE}
        </motion.p>
      </div>
    </header>
  );
}

/**
 * A slim navy bar that slides down once the full masthead has scrolled
 * away, so the sections stay one click from anywhere. Article pages skip
 * it: they show their own sticky headline bar instead.
 */
export function CompactHeader() {
  const pathname = usePathname() ?? "/";
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setShown(y > 360));

  if (pathname.startsWith("/articles/")) return null;

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          className="compact-header"
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 38 }}
        >
          <div className="compact-header-inner">
            <Link href="/" className="compact-title">
              The Warsaw High <em>Financial Times</em>
            </Link>
            <nav className="compact-nav" aria-label="Sections">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link key={item.href} href={item.href} className={`compact-link${active ? " is-active" : ""}`}>
                    {item.label}
                    {active && <motion.span layoutId="compact-underline" className="compact-underline" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
