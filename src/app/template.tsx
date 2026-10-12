"use client";

import { motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";

// The very first page a visitor lands on paints immediately (it's already in
// the downloaded HTML); every page reached by clicking around afterwards
// glides in, so moving between sections feels continuous.
declare global {
  interface Window {
    __wftHasMounted?: boolean;
  }
}

export default function Template({ children }: { children: ReactNode }) {
  // Read-only here (no mutation during render); the flag is set after mount.
  const [animate] = useState(() => typeof window !== "undefined" && window.__wftHasMounted === true);
  useEffect(() => {
    window.__wftHasMounted = true;
  }, []);
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 14 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
