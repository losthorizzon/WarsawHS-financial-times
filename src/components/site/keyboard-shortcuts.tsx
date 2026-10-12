"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const isTyping = () => {
  const el = document.activeElement as HTMLElement | null;
  const tag = el?.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || !!el?.isContentEditable;
};

/** "/" jumps to the article search box from anywhere on the site. */
export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || isTyping()) return;
      e.preventDefault();
      const input = document.getElementById("searchInput");
      if (input) input.focus();
      else router.push("/?focus=search");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, pathname]);

  return null;
}
