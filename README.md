# The Warsaw High Financial Times

The site at https://losthorizzon.github.io/WarsawHS-financial-times/, built with
[Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com),
[Motion](https://motion.dev), [Kokonut UI](https://kokonutui.com) and
[BKLit UI](https://bklit.com).

## Run it on your computer

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Where things live

| What | Where |
| --- | --- |
| Articles | `src/data/articles.json` |
| Article photos | `public/images/articles/` |
| Market data (fixed one-year snapshot) | `src/data/market.json` |
| Glossary, team, categories | `src/lib/site.ts` |
| Pages (one folder per URL) | `src/app/` |
| Site styles | `src/app/globals.css` |
| Kokonut UI pieces | `src/components/kokonutui/` |
| BKLit UI charts | `src/components/charts/` |

## Publishing an article

1. Open **Editor Tools** (footer link) on the live site and unlock it.
2. Write the article and press **Publish Article**. This downloads an updated `articles.json`.
3. On GitHub, open `src/data/`, choose **Add file → Upload files**, drop in the downloaded
   `articles.json` (it replaces the old one) and commit.
4. The **Deploy to GitHub Pages** workflow rebuilds the site; it is live in about two minutes.

## Adding more Kokonut UI / BKLit UI components

Both libraries are registered in `components.json`, so any component installs with one command:

```bash
npx shadcn@latest add @kokonutui/<component-name>
npx shadcn@latest add @bklit/<component-name>
```

When the CLI asks to overwrite `button.tsx`, answer **no**. The project's button has a small
addition (`ButtonProps`) that Kokonut components rely on.

## Deployment

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site into static files
and publishes them to GitHub Pages. One-time setting: **Settings → Pages → Source: GitHub Actions**.

Old links to `warsawfintimes.html#article/...` keep working: `public/warsawfintimes.html`
forwards them to the matching page.

### Leftover files from the old site

`index.html` and `warsawfintimes.html` in the repo root are the original single-file site.
They keep the old site online until Pages is switched to "GitHub Actions" (the new site is
built from `src/`, so these two files are not part of it). Once the new site is live they can
be deleted.
