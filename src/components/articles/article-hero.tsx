"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { EASE_OUT } from "@/components/motion/reveal";

/** The article's lead photo: eases in from a soft zoom, then drifts gently as you scroll past. */
export function ArticleHero({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <motion.div
      ref={ref}
      className="article-hero-wrap"
      initial={{ opacity: 0, clipPath: "inset(6% 6% 6% 6% round 6px)" }}
      animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 6px)" }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.1 }}
    >
      <motion.img
        className="article-hero"
        src={src}
        alt={alt}
        style={{ y, scale: 1.1 }}
        initial={{ filter: "blur(8px)" }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      />
    </motion.div>
  );
}
