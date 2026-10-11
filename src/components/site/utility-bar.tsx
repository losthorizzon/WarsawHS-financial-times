"use client";

import { useState, useSyncExternalStore } from "react";
import { useMounted } from "@/hooks/use-mounted";

const todayLabel = () =>
  new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

// Re-checked once a minute and when the tab regains focus, so a tab left
// open past midnight rolls over on its own.
function subscribeToClock(onChange: () => void) {
  const onVisible = () => !document.hidden && onChange();
  document.addEventListener("visibilitychange", onVisible);
  const timer = setInterval(onChange, 60000);
  return () => {
    document.removeEventListener("visibilitychange", onVisible);
    clearInterval(timer);
  };
}

export function UtilityBar() {
  // Read from each visitor's own clock, never baked in at build time.
  const today = useSyncExternalStore(subscribeToClock, todayLabel, () => "");
  const mounted = useMounted();
  const [darkOverride, setDarkOverride] = useState<boolean | null>(null);
  const isDark = darkOverride ?? (mounted && document.documentElement.classList.contains("dark"));

  const toggleTheme = () => {
    const dark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("wft-theme", dark ? "dark" : "light");
    } catch {}
    setDarkOverride(dark);
  };

  return (
    <div className="utility-bar">
      <div className="utility-bar-inner">
        <span>{today}</span>
        <button type="button" className="theme-toggle" aria-pressed={isDark} onClick={toggleTheme}>
          {isDark ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </div>
  );
}
