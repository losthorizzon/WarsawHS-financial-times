import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { BackToTop } from "@/components/site/back-to-top";
import { KeyboardShortcuts } from "@/components/site/keyboard-shortcuts";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SITE_TAGLINE, SITE_TITLE } from "@/lib/site";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  // Optical sizing, as the original Google Fonts link loaded it: headlines
  // and body text each get the letter shapes drawn for their size.
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: { default: SITE_TITLE, template: `%s · ${SITE_TITLE}` },
  description: SITE_TAGLINE,
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%231e2a5e'/%3E%3Ctext x='32' y='44' font-family='Georgia,serif' font-size='36' font-weight='700' fill='%23ffffff' text-anchor='middle'%3EW%3C/text%3E%3C/svg%3E",
  },
};

// Applied before the rest of the page paints so a returning dark-mode
// reader never sees a flash of the light theme first.
const themeScript = `try{if(localStorage.getItem('wft-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <main className="page" id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <BackToTop />
        <KeyboardShortcuts />
      </body>
    </html>
  );
}
