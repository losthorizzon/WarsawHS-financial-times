"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { useState } from "react";

/** Floating "back to top" button whose ring fills as you scroll down the page. */
export function BackToTop() {
  const { scrollY, scrollYProgress } = useScroll();
  const ring = useSpring(scrollYProgress, { stiffness: 160, damping: 30 });
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setVisible(y >= 600));

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          className="back-to-top"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <svg className="ring" viewBox="0 0 48 48" aria-hidden="true">
            <circle className="ring-track" cx="24" cy="24" r="21" fill="none" strokeWidth="2.5" />
            <motion.circle
              className="ring-fill"
              cx="24"
              cy="24"
              r="21"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: ring }}
            />
          </svg>
          <span className="arrow">↑</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
