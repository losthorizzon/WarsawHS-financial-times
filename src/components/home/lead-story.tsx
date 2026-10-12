"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { NewBadge } from "@/components/articles/new-badge";
import { EASE_OUT, WordReveal } from "@/components/motion/reveal";
import { articleHref, asset, authorOf, formatDate, readingTime } from "@/lib/articles";
import type { Article } from "@/lib/types";

/**
 * The front page's lead story: a full-width photograph that drifts slower
 * than the page as you scroll (parallax), with the headline set over it.
 */
export function LeadStory({ article: a }: { article: Article }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.14]);

  return (
    <Link href={articleHref(a)} className="lead-story" ref={ref}>
      <div className="lead-media">
        {a.image && (
          <motion.img
            src={asset(a.image)}
            alt={a.imageAlt || a.title}
            className="lead-image"
            style={{ y: imageY, scale: imageScale }}
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          />
        )}
        <div className="lead-shade" aria-hidden="true" />
      </div>
      <div className="lead-copy">
        <motion.p
          className="lead-kicker"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.2 }}
        >
          <span className="lead-label">Lead story</span> {a.category}
          <NewBadge article={a} />
        </motion.p>
        <WordReveal as="h2" className="lead-title" text={a.title} stagger={0.05} />
        <motion.p
          className="lead-summary"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.55 }}
        >
          {a.summary}
        </motion.p>
        <motion.p
          className="lead-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.75 }}
        >
          By {authorOf(a)} · {formatDate(a.date)} · {readingTime(a.body)}
          <span className="lead-cta" aria-hidden="true">
            Read the story <span className="lead-arrow">→</span>
          </span>
        </motion.p>
      </div>
    </Link>
  );
}
