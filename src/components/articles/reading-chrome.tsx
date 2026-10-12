"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * The thin bar that fills as the reader scrolls, plus a sticky mini-header
 * (the title) that slides in once the real headline has scrolled away.
 */
export function ReadingChrome({ title }: { title: string }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const titleEl = document.getElementById("articleTitle");
    if (!titleEl) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(titleEl);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div className="reading-progress">
        <motion.div className="reading-progress-fill" style={{ scaleX }} />
      </div>
      <AnimatePresence>
        {showSticky && (
          <motion.div
            className="sticky-article-header"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sticky-article-inner">
              <span className="sticky-article-title">{title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Arrow keys / n·p step through articles, newest to oldest. */
export function ArticleKeyNav({ newerHref, olderHref }: { newerHref?: string; olderHref?: string }) {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el?.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.key === "ArrowRight" || e.key === "n") && olderHref) {
        e.preventDefault();
        router.push(olderHref);
      } else if ((e.key === "ArrowLeft" || e.key === "p") && newerHref) {
        e.preventDefault();
        router.push(newerHref);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, newerHref, olderHref]);
  return null;
}
