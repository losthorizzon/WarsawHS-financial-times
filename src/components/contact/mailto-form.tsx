"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { FORM_RECIPIENT } from "@/lib/site";

// Forms hand off to the visitor's own email app: clicking Send opens a
// mailto: link with the address, subject and body already filled in, and
// they hit send there. Nothing is ever transmitted through this site or
// any third-party server.

const LABELS: Record<string, string> = { pitch: "Pitch or writing sample", grade: "Year/grade" };

function messageBodyFor(form: HTMLFormElement) {
  const lines: string[] = [];
  new FormData(form).forEach((value, key) => {
    if (key === "consent" || !String(value).trim()) return;
    const label = LABELS[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
    lines.push(label + ": " + value);
  });
  return lines.join("\n");
}

// Opens the mailto: link in a new tab/window instead of navigating this
// one away, so a visitor using a web mail handler doesn't lose the site.
function openMailto(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function MailtoForm({ kind }: { kind: "contact" | "writer" }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const subject = kind === "contact" ? "WFT contact form" : "WFT writer application";

  const send = (e?: FormEvent) => {
    e?.preventDefault();
    const form = formRef.current!;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    openMailto(
      "mailto:" + FORM_RECIPIENT + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(messageBodyFor(form))
    );
    setSent(true);
    form.reset();
  };

  const consentWhat = kind === "contact" ? "name, email, and message" : "name, email, and pitch";

  return (
    <form className="site-form" ref={formRef} onSubmit={send}>
      {kind === "contact" ? (
        <>
          <div className="field-row">
            <label>
              Your name <input type="text" name="name" required />
            </label>
            <label>
              Your email <input type="email" name="email" required />
            </label>
          </div>
          <label>
            Message <textarea name="message" rows={4} required />
          </label>
        </>
      ) : (
        <>
          <div className="field-row">
            <label>
              Your name <input type="text" name="name" required />
            </label>
            <label>
              Year/grade <input type="text" name="grade" />
            </label>
          </div>
          <label>
            Your email <input type="email" name="email" required />
          </label>
          <label>
            Pitch or writing sample <textarea name="pitch" rows={5} required />
          </label>
        </>
      )}
      <label className="consent-label">
        <input type="checkbox" name="consent" required />
        <span>
          I agree that WFT can store my {consentWhat} to respond to this, per the{" "}
          <Link className="inline-link" href="/privacy/">
            Privacy Policy
          </Link>
          . *
        </span>
      </label>
      <button type="submit" className="btn">
        {kind === "contact" ? "Send Message" : "Send Application"}
      </button>
      <p className={`form-status${sent ? " is-success" : ""}`}>
        {sent &&
          `Opening your email app in a new tab with this filled in — just hit send there. If nothing opens, email us directly at ${FORM_RECIPIENT}.`}
      </p>
    </form>
  );
}
