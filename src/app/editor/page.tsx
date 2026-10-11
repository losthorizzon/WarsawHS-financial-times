import type { Metadata } from "next";
import { EditorView } from "@/components/editor/editor-view";

export const metadata: Metadata = { title: "Editor Tools", robots: { index: false } };

export default function EditorPage() {
  return (
    <section className="editor-page">
      <p className="page-kicker">Editor Tools</p>
      <h1>Publish to the Site</h1>
      <EditorView />
    </section>
  );
}
