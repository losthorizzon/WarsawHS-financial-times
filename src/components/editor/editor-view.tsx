"use client";

import { Fragment, useRef, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import {
  ARTICLES,
  asset,
  formatDate,
  parseReferences,
  referencesToText,
  splitParagraphs,
} from "@/lib/articles";
import { CATEGORIES, DEFAULT_AUTHOR } from "@/lib/site";
import type { Article } from "@/lib/types";

// ---------- Password gate ----------
// This only keeps a casual visitor who finds the "Editor Tools" link from
// opening the form. It is NOT real security: the page's source (including
// this hash) is public. The real boundary is that publishing means
// committing to the GitHub repo, which needs the repo owner's account.
// Same hash as the original site, so the password hasn't changed.
const EDITOR_PASSWORD_HASH = "051e8b9dc8dd1d134514611ef0a16e13732fe41a2bc353359f726d8f998cdfb6";
const UNLOCK_KEY = "wft-editor-unlocked";
const AUTOSAVE_KEY = "wft-article-autosave";
const DATA_FILE_PATH = "src/data/articles.json";

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// The chosen photo is resized and encoded to a data: URI entirely in the
// browser (canvas + FileReader, no network), then stored in the article.
function resizeAndEncodeImage(file: File, maxWidth: number) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not read that image file."));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Scans for characters that commonly corrupt a published file: an unpaired
// UTF-16 surrogate half (one side of an emoji that lost its other half in a
// paste) or a literal U+FFFD replacement character.
function findEncodingIssue(text: string) {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const isHigh = code >= 0xd800 && code <= 0xdbff;
    const isLow = code >= 0xdc00 && code <= 0xdfff;
    let bad = code === 0xfffd;
    if (isHigh) {
      const next = text.charCodeAt(i + 1);
      bad = !(next >= 0xdc00 && next <= 0xdfff);
    } else if (isLow) {
      const prev = i > 0 ? text.charCodeAt(i - 1) : 0;
      bad = !(prev >= 0xd800 && prev <= 0xdbff);
    }
    if (bad) return text.slice(Math.max(0, i - 25), i + 25);
  }
  return null;
}

function downloadArticlesFile(articles: Article[]) {
  const blob = new Blob([JSON.stringify(articles, null, 2) + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "articles.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface FormState {
  title: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  pullQuote: string;
  imageAlt: string;
  body: string;
  references: string;
  correctionNote: string;
}

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = (): FormState => ({
  title: "",
  category: CATEGORIES[0],
  date: today(),
  author: "",
  summary: "",
  pullQuote: "",
  imageAlt: "",
  body: "",
  references: "",
  correctionNote: "",
});

type Status = { mode: "" | "loading" | "success" | "error"; text: string };

function readUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

function readAutosave(): (FormState & { savedAt: string }) | null {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY) || "null");
    return saved && (saved.title || saved.body) ? saved : null;
  } catch {
    return null;
  }
}

export function EditorView() {
  const mounted = useMounted();
  const [unlockedOverride, setUnlocked] = useState(false);
  const unlocked = unlockedOverride || (mounted && readUnlocked());
  const [password, setPassword] = useState("");
  const [gateStatus, setGateStatus] = useState<Status>({ mode: "", text: "" });

  // Articles as they'd be after this session's edits (each publish
  // builds on the previous one, so several can be made in a row).
  const [articles, setArticles] = useState<Article[]>(ARTICLES);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [image, setImage] = useState("");
  const [status, setStatus] = useState<Status>({ mode: "", text: "" });
  // undefined = not yet decided this visit, so fall back to what's stored.
  const [autosaveOverride, setAutosave] = useState<(FormState & { savedAt: string }) | null | undefined>(undefined);
  const autosave = autosaveOverride !== undefined ? autosaveOverride : mounted ? readAutosave() : null;
  const fileRef = useRef<HTMLInputElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const attemptUnlock = async () => {
    if (!password) return setGateStatus({ mode: "error", text: "Enter the password first." });
    if ((await sha256Hex(password)) === EDITOR_PASSWORD_HASH) {
      try {
        sessionStorage.setItem(UNLOCK_KEY, "1");
      } catch {}
      setUnlocked(true);
    } else {
      setGateStatus({ mode: "error", text: "Incorrect password." });
    }
  };

  const update = (patch: Partial<FormState>) => {
    const next = { ...form, ...patch };
    setForm(next);
    // Only a brand-new article is autosaved; an edit already has a
    // published version to fall back to.
    if (editing !== null) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      if (!next.title && !next.body) return;
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...next, savedAt: new Date().toISOString() }));
      } catch {}
    }, 1500);
  };

  const clearAutosave = () => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
    } catch {}
    setAutosave(null);
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm());
    setImage("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const loadArticle = (idx: number) => {
    const a = articles[idx];
    setEditing(idx);
    setForm({
      title: a.title,
      category: a.category,
      date: a.date,
      author: a.author || "",
      summary: a.summary,
      pullQuote: a.pullQuote || "",
      imageAlt: a.imageAlt || "",
      body: a.body.join("\n\n"),
      references: referencesToText(a.references),
      correctionNote: "",
    });
    setImage(a.image || "");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onImage = async (file?: File) => {
    if (!file) return setImage("");
    try {
      setStatus({ mode: "loading", text: "Processing image…" });
      setImage(await resizeAndEncodeImage(file, 1200));
      setStatus({ mode: "", text: "" });
    } catch {
      setImage("");
      setStatus({ mode: "error", text: "Couldn't process that image. Try a different file." });
    }
  };

  const publish = () => {
    const paragraphs = splitParagraphs(form.body);
    if (!form.title.trim() || !form.category || !form.date || !form.summary.trim() || paragraphs.length === 0) {
      return setStatus({ mode: "error", text: "Please fill in the title, category, date, summary, and body first." });
    }
    const a: Article = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      summary: form.summary.trim(),
      body: paragraphs,
    };
    if (form.author.trim()) a.author = form.author.trim();
    if (form.pullQuote.trim()) a.pullQuote = form.pullQuote.trim();
    if (image) a.image = image;
    if (form.imageAlt.trim()) a.imageAlt = form.imageAlt.trim();
    const refs = parseReferences(form.references);
    if (refs.length > 0) a.references = refs;

    const next = [...articles];
    if (editing !== null) {
      // An edit keeps any corrections already on the article, then adds
      // this one too if a note was written for it.
      const corrections = [...(articles[editing].corrections ?? [])];
      if (form.correctionNote.trim()) corrections.push({ date: today(), text: form.correctionNote.trim() });
      if (corrections.length > 0) a.corrections = corrections;
      next[editing] = a;
    } else {
      next.push(a);
    }

    const issue = findEncodingIssue(JSON.stringify(next));
    if (issue) {
      return setStatus({
        mode: "error",
        text: `Found a broken character (near “…${issue}…”). This usually comes from a pasted emoji or special character losing half of itself — retype that part instead of pasting it, then publish again.`,
      });
    }

    downloadArticlesFile(next);
    setArticles(next);
    setStatus({
      mode: "success",
      text: `${editing !== null ? "Article updated!" : "Article published!"} Downloaded articles.json — upload it to ${DATA_FILE_PATH} in the GitHub repo (replacing the old one) and commit. The site rebuilds itself and goes live in about two minutes.`,
    });
    if (editing === null) clearAutosave();
    resetForm();
  };

  const paragraphs = splitParagraphs(form.body);
  const previewRefs = parseReferences(form.references);

  if (!unlocked) {
    return (
      <div className="tool-card">
        <div className="module-head">
          <h2>Enter Editor Password</h2>
        </div>
        <div className="tool-card-body">
          <p className="field-hint" style={{ marginTop: 0 }}>
            This area is password-protected so only the site owner can publish or edit articles.
          </p>
          <div className="field">
            <label className="field-label" htmlFor="editorPasswordInput">
              Password
            </label>
            <input
              type="password"
              id="editorPasswordInput"
              autoComplete="current-password"
              placeholder="Enter the editor password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attemptUnlock()}
            />
          </div>
          <button type="button" className="btn" onClick={attemptUnlock}>
            Unlock Editor Tools
          </button>
          <p className={`publish-status${gateStatus.mode ? " is-" + gateStatus.mode : ""}`}>{gateStatus.text}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="editor-note">
        Publishing downloads an updated <code>articles.json</code>. To make it live, open the repo on GitHub, go to{" "}
        <code>{DATA_FILE_PATH}</code>, choose “Upload files” in that folder, drop the downloaded file in and commit. GitHub
        rebuilds and redeploys the site on its own.
      </p>
      <div className="tool-card">
        <div className="module-head">
          <h2>Publish / Edit Article</h2>
        </div>
        <div className="tool-card-body">
          <div className="field">
            <label className="field-label" htmlFor="ea-edit-select">
              Load an existing article to edit (optional)
            </label>
            <select
              id="ea-edit-select"
              value={editing ?? ""}
              onChange={(e) => (e.target.value === "" ? resetForm() : loadArticle(parseInt(e.target.value, 10)))}
            >
              <option value="">— New Article —</option>
              {articles.map((a, i) => (
                <option key={i} value={i}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          {autosave && editing === null && (
            <p className="field-hint" style={{ marginTop: 0 }}>
              A draft from{" "}
              {new Date(autosave.savedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}{" "}
              is saved in this browser.{" "}
              <button
                type="button"
                className="inline-link"
                onClick={() => {
                  const { title, category, date, author, summary, pullQuote, imageAlt, body, references } = autosave;
                  setForm({ ...emptyForm(), title, category, date, author, summary, pullQuote, imageAlt, body, references });
                  setAutosave(null);
                }}
              >
                Restore it
              </button>{" "}
              or{" "}
              <button type="button" className="inline-link" onClick={clearAutosave}>
                discard it
              </button>
              .
            </p>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label className="field-label" htmlFor="ea-title">
                Title *
              </label>
              <input
                type="text"
                id="ea-title"
                placeholder="Why the Cafeteria Vending Machine Is a Lesson in Inflation"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="ea-category">
                  Category *
                </label>
                <select id="ea-category" value={form.category} onChange={(e) => update({ category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="ea-date">
                  Publish date *
                </label>
                <input type="date" id="ea-date" value={form.date} onChange={(e) => update({ date: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ea-author">
                Byline (author)
              </label>
              <input
                type="text"
                id="ea-author"
                placeholder="Defaults to “The Editorial Team”"
                value={form.author}
                onChange={(e) => update({ author: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ea-summary">
                Summary / dek *
              </label>
              <textarea
                id="ea-summary"
                rows={2}
                placeholder="One or two sentences that hook the reader."
                value={form.summary}
                onChange={(e) => update({ summary: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ea-pullquote">
                Pull quote (optional)
              </label>
              <textarea
                id="ea-pullquote"
                rows={2}
                placeholder="A short standout line after the first paragraph."
                value={form.pullQuote}
                onChange={(e) => update({ pullQuote: e.target.value })}
              />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="field-label" htmlFor="ea-image">
                  Hero image (optional)
                </label>
                <input ref={fileRef} type="file" id="ea-image" accept="image/*" onChange={(e) => onImage(e.target.files?.[0])} />
                <p className="field-hint" style={{ margin: "0.4rem 0 0" }}>
                  Download the photo first (e.g. from Pexels), then upload it here. When editing an article, its current
                  image carries over unless you pick a new one.{" "}
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => {
                      setImage("");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Remove image
                  </button>
                </p>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="ea-imagealt">
                  Image alt text (optional)
                </label>
                <input
                  type="text"
                  id="ea-imagealt"
                  placeholder="Briefly describe the image"
                  value={form.imageAlt}
                  onChange={(e) => update({ imageAlt: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ea-body">
                Body *
              </label>
              <textarea
                id="ea-body"
                rows={10}
                placeholder="Write the article. Leave a blank line between paragraphs."
                value={form.body}
                onChange={(e) => update({ body: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="ea-references">
                References (recommended)
              </label>
              <textarea
                id="ea-references"
                rows={4}
                placeholder={"One source per line, e.g.:\nU.S. Bureau of Labor Statistics - https://www.bls.gov/cpi/\nhttps://en.wikipedia.org/wiki/Cost-push_inflation"}
                value={form.references}
                onChange={(e) => update({ references: e.target.value })}
              />
            </div>
            <p className="field-hint" style={{ marginBottom: 0 }}>
              Every factual or statistical claim should be backed by a source. One per line: either &quot;Label - URL&quot;
              or a bare URL; a label with no URL (a book, an interview) is shown as plain text.
            </p>
            {editing !== null && (
              <div className="field" style={{ marginTop: "1.1rem" }}>
                <label className="field-label" htmlFor="ea-correction-note">
                  Correction note (optional)
                </label>
                <textarea
                  id="ea-correction-note"
                  rows={2}
                  placeholder="An earlier version of this article stated..."
                  value={form.correctionNote}
                  onChange={(e) => update({ correctionNote: e.target.value })}
                />
                <p className="field-hint" style={{ marginBottom: 0 }}>
                  Appends a dated note under the article, shown to readers. Leave blank if this edit doesn&apos;t need one.
                </p>
              </div>
            )}
          </form>
          <button type="button" className="btn" style={{ marginTop: "1.1rem" }} onClick={publish}>
            {editing !== null ? "Save Changes" : "Publish Article"}
          </button>
          <div className={`publish-status${status.mode ? " is-" + status.mode : ""}`}>{status.text}</div>

          <div className="preview-box">
            <p className="article-kicker">{form.category || "–"}</p>
            <h1 className="article-title">{form.title.trim() || "Your headline will appear here"}</h1>
            <p className="article-dek">{form.summary.trim()}</p>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="article-hero" src={asset(image)} alt={form.imageAlt || form.title} />
            )}
            <div className="article-meta">
              <span className="article-byline">By {form.author.trim() || DEFAULT_AUTHOR}</span>
              <span aria-hidden="true">·</span>
              <span>{form.date ? formatDate(form.date) : ""}</span>
            </div>
            <div className="article-body">
              {paragraphs.map((p, i) => (
                <Fragment key={i}>
                  <p>{p}</p>
                  {i === 0 && form.pullQuote.trim() && <blockquote className="pull-quote">{form.pullQuote.trim()}</blockquote>}
                </Fragment>
              ))}
            </div>
            {previewRefs.length > 0 && (
              <div className="references">
                <h3>References</h3>
                <ol>
                  {previewRefs.map((r, i) => (
                    <li key={i}>
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener">
                          {r.label}
                        </a>
                      ) : (
                        r.label
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
