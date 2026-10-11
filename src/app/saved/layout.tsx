import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Saved Articles" };

export default function SavedLayout({ children }: { children: ReactNode }) {
  return children;
}
