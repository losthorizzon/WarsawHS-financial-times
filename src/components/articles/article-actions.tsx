"use client";

import { Link as LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";
import SocialButton, { type ShareItem } from "@/components/kokonutui/social-button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useMounted } from "@/hooks/use-mounted";
import { LinkedInIcon, WhatsAppIcon, XIcon } from "./brand-icons";

const SAVED_KEY = "wft-saved-articles";
const FONT_KEY = "wft-font-step";

export function getSavedSlugs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]");
  } catch {
    return [];
  }
}

function setSavedSlugs(slugs: string[]) {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(slugs));
  } catch {}
}

// Article text size (A− / A+), remembered per browser.
function readFontStep() {
  try {
    return parseInt(localStorage.getItem(FONT_KEY) || "0", 10) || 0;
  } catch {
    return 0;
  }
}

function applyFontStep(step: number) {
  const body = document.getElementById("articleBody");
  if (body) body.style.fontSize = 1.14 + step * 0.14 + "rem";
}

const SHARE_ITEMS: ShareItem[] = [
  { icon: XIcon, label: "Share on X" },
  { icon: LinkedInIcon, label: "Share on LinkedIn" },
  { icon: WhatsAppIcon, label: "Share on WhatsApp" },
  { icon: LinkIcon, label: "Copy link" },
];

export function ArticleActions({ slug, title }: { slug: string; title: string }) {
  const mounted = useMounted();
  const [savedOverride, setSaved] = useState<boolean | null>(null);
  const [fontOverride, setFontStep] = useState<number | null>(null);
  const saved = savedOverride ?? (mounted && getSavedSlugs().includes(slug));
  const fontStep = fontOverride ?? (mounted ? readFontStep() : 0);
  const [copyFailed, setCopyFailed] = useState(false);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 1800 });

  // Apply the remembered size to the article body once on arrival.
  useEffect(() => applyFontStep(readFontStep()), []);

  const changeFont = (delta: number) => {
    const next = Math.min(3, Math.max(-2, fontStep + delta));
    setFontStep(next);
    applyFontStep(next);
    try {
      localStorage.setItem(FONT_KEY, String(next));
    } catch {}
  };

  const toggleSaved = () => {
    const slugs = getSavedSlugs();
    const i = slugs.indexOf(slug);
    if (i === -1) slugs.push(slug);
    else slugs.splice(i, 1);
    setSavedSlugs(slugs);
    setSaved(i === -1);
  };

  const copyLink = () => {
    if (!navigator.clipboard?.writeText) {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 1800);
      return;
    }
    copyToClipboard(window.location.href);
  };

  const share = (index: number) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(title);
    const targets = [
      `https://x.com/intent/post?text=${text}&url=${url}`,
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      `https://wa.me/?text=${text}%20${url}`,
    ];
    if (index < targets.length) window.open(targets[index], "_blank", "noopener");
    else copyLink();
  };

  return (
    <div className="article-actions">
      <div className="share-wrap">
        <SocialButton label={isCopied ? "Link copied!" : "Share"} items={SHARE_ITEMS} onShare={share} />
      </div>
      <button type="button" className="action-btn" onClick={copyLink}>
        {isCopied ? "Link copied!" : copyFailed ? "Couldn't copy; use the address bar instead" : "Copy link"}
      </button>
      <button type="button" className="action-btn" onClick={() => window.print()}>
        Print / Save PDF
      </button>
      <button type="button" className="action-btn" aria-label="Decrease text size" onClick={() => changeFont(-1)}>
        A−
      </button>
      <button type="button" className="action-btn" aria-label="Increase text size" onClick={() => changeFont(1)}>
        A+
      </button>
      <button type="button" className="action-btn" aria-pressed={saved} onClick={toggleSaved}>
        {saved ? "Saved ✓" : "Save for later"}
      </button>
    </div>
  );
}
