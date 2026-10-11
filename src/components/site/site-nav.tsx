"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Articles", match: (p: string) => p === "/" || p.startsWith("/articles") || p.startsWith("/authors") },
  { href: "/markets/", label: "Markets", match: (p: string) => p.startsWith("/markets") },
  { href: "/glossary/", label: "Glossary", match: (p: string) => p.startsWith("/glossary") },
  { href: "/calculators/", label: "Calculators", match: (p: string) => p.startsWith("/calculators") },
  { href: "/about/", label: "About", match: (p: string) => p.startsWith("/about") },
  { href: "/contact/", label: "Contact", match: (p: string) => p.startsWith("/contact") },
];

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="site-nav">
      <div className="site-nav-inner">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link${active ? " is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
              {active && (
                <motion.span
                  layoutId="nav-underline"
                  className="nav-underline"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
