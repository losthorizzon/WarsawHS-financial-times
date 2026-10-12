"use client";

import { motion } from "motion/react";

/** A row of filter chips whose active marker glides between them. */
export function FilterPills({
  id,
  options,
  value,
  onChange,
  small = false,
  label,
}: {
  id: string;
  options: { key: string; label: string; count?: number }[];
  value: string;
  onChange: (key: string) => void;
  small?: boolean;
  label: string;
}) {
  return (
    <div className={`pill-row${small ? " pill-row-small" : ""}`} role="group" aria-label={label}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            className={`pill${active ? " is-active" : ""}`}
            aria-pressed={active}
            onClick={() => onChange(o.key)}
          >
            {active && (
              <motion.span
                layoutId={`pill-${id}`}
                className="pill-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="pill-text">
              {o.label}
              {o.count !== undefined && <span className="cat-count"> {o.count}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
