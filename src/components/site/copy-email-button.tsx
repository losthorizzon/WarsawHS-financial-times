"use client";

import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { FORM_RECIPIENT } from "@/lib/site";

/** The small inline "Copy" link next to the email address. */
export function CopyEmailButton() {
  const [failed, setFailed] = useState(false);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2200 });

  const copy = () => {
    if (!navigator.clipboard?.writeText) {
      setFailed(true);
      setTimeout(() => setFailed(false), 2200);
      return;
    }
    copyToClipboard(FORM_RECIPIENT);
  };

  return (
    <button type="button" className="inline-link" onClick={copy}>
      {isCopied ? "Copied!" : failed ? "Copy failed" : "Copy"}
    </button>
  );
}
