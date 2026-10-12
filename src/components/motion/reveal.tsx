"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Fades and lifts its content in the first time it scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "p" | "blockquote" | "li";
}) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  );
}

const wordsContainer: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
};
const word: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE_OUT } },
};

/**
 * Splits a headline into words that rise into place one after another.
 * The full text stays in the accessible name; each word is presentational.
 */
export function WordReveal({
  text,
  className,
  stagger = 0.045,
  as = "span",
  id,
}: {
  text: string;
  className?: string;
  stagger?: number;
  as?: "span" | "h1" | "h2";
  id?: string;
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} id={id} aria-label={text} initial="hidden" animate="show" variants={wordsContainer} custom={stagger}>
      {text.split(" ").map((w, i) => (
        <motion.span key={i} aria-hidden="true" variants={word} style={{ display: "inline-block", whiteSpace: "pre" }}>
          {w + (i < text.split(" ").length - 1 ? " " : "")}
        </motion.span>
      ))}
    </Tag>
  );
}

/** A horizontal rule that draws itself from the left when it enters view. */
export function DrawRule({ className }: { className?: string }) {
  return (
    <motion.span
      aria-hidden="true"
      className={className}
      style={{ display: "block", transformOrigin: "0 50%" }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: EASE_OUT }}
    />
  );
}
