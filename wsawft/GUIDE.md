# Publishing Guide: Getting The Warsaw Highschool Financial Times online

This covers three things in order: putting the site on the public internet,
making it findable in search, and actually growing a readership. Do them in
that order — a fast, indexable site with no readers is a much better problem
to have than a popular site nobody can reach.

---

## 1. Before you deploy anywhere: change the editor key

Open a terminal in the project folder and set a real secret instead of the
placeholder one in `server.py`:

```bash
export WHFT_ADMIN_KEY="pick-something-long-and-only-editors-know"
```

You'll set this same value as an environment variable on whatever host you
pick below, so write it down somewhere safe (a password manager, not a
sticky note on the group chat).

---

## 2. Choosing a host

The honest trade-off for a small Python site like this one, as of 2026:

| Host | Cost | Custom domain | Data persistence | Best for |
|---|---|---|---|---|
| **PythonAnywhere** | Free | No (subdomain only) | Yes, disk persists | Fastest way to get something real online |
| **Render** (free web service) | Free | Yes | No — disk resets on redeploy/restart | A demo you'll upgrade later |
| **Render** (paid "Starter" plan) | ~$7/month | Yes | Yes, with a persistent disk add-on | The site once it has real readers |

The detail that catches people out: most free container hosts (Render,
Railway, Fly.io) give you a filesystem that gets wiped every time the app
redeploys or restarts after inactivity. Since this project stores articles in
a single SQLite file on disk, that means **your published articles would
vanish on a free Render-style host**. PythonAnywhere's free tier is the
exception — its disk persists — which makes it the better starting point for
a real school paper, even though you're stuck with a `pythonanywhere.com`
subdomain until you upgrade.

Recommended path: **start on PythonAnywhere to launch fast and keep your
data, then move to a paid host with a persistent disk once you want your own
domain name.**

### Option A — PythonAnywhere (recommended to start)

1. Create a free account at pythonanywhere.com.
2. Open a **Bash console** from the dashboard and upload your project (drag
   the `wsawft` folder into the Files tab, or `git clone` it if it's on
   GitHub).
3. Go to the **Web** tab → **Add a new web app** → choose **Manual
   configuration** → Python 3.10+.
4. Because this project doesn't use a WSGI framework, the simplest approach
   is to run `server.py` from an **Always-on task** (available on paid
   accounts) or adapt the routing into a WSGI app using PythonAnywhere's
   Flask quickstart template — worth doing once you outgrow the free tier
   anyway, since PythonAnywhere's web app slots expect a WSGI entry point
   rather than a script that binds its own port.
5. Set the environment variable `WHFT_ADMIN_KEY` in the Web tab's
   "Environment variables" section.
6. Reload the web app. Your site is live at
   `https://yourusername.pythonanywhere.com`.

### Option B — Render (best once you want a real domain)

1. Push the project to a GitHub repository.
2. On render.com, choose **New → Web Service**, connect the repo.
3. Build command: (leave blank — nothing to install)
4. Start command: `python3 server.py`
5. Add environment variable `WHFT_ADMIN_KEY` and `PORT` (Render sets `PORT`
   automatically; `server.py` already reads it).
6. On the free plan, accept that the database resets periodically — fine for
   testing. When you're ready to go live for real, upgrade to a Starter
   instance and attach a **persistent disk** mounted at the project
   directory so `articles.db` survives restarts.
7. Under **Settings → Custom Domain**, add your own domain once you own one
   (see below). Render issues free HTTPS automatically.

### Buying a domain

A `.pl` domain (fitting for a Warsaw school) or a `.com` typically costs
$10–20/year from a registrar like Namecheap, OVH, or home.pl. Point its DNS
at whichever host you chose, following that host's custom-domain
instructions — both PythonAnywhere and Render walk you through the exact DNS
records to add.

---

## 3. Making it searchable

"Searchable" has two different meanings here, both worth doing:

### Search *within* the site

Already built in — the search bar hits `/api/articles?q=...` and matches
title, summary, body, and author. Nothing more to do.

### Findable *on Google*

This takes a bit of setup but nothing complicated:

1. **Add a sitemap.** Search engines use this to discover every article URL.
   Since articles are added dynamically, generate `sitemap.xml` from your
   database rather than writing it by hand — a small script that queries
   published articles and writes their URLs is enough. Regenerate it
   whenever new articles are approved (a simple cron job or a line added to
   the approve endpoint).
2. **Add a `robots.txt`** in the `static/` folder that allows crawling and
   points to your sitemap:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://yourdomain.com/sitemap.xml
   ```
3. **Verify the site in Google Search Console** (search.google.com/search-console) —
   add your domain, verify ownership via a DNS record, and submit your
   sitemap there. This is what actually gets your pages crawled and indexed,
   rather than waiting for Google to find you by chance.
4. **Give each article a real URL**, not just a JSON id behind a
   single-page app. Right now, articles open in an overlay on the front
   page, which search engines can't index individually. For real
   discoverability, add a server route like `/article/<id>` that renders a
   plain HTML page with the title, author, and body for that one article —
   keep the overlay for browsing, but make sure each story also has its own
   crawlable page.
5. **Fill in `<meta>` tags per article** (title, description) once you have
   individual article pages, so links shared on social media show a proper
   preview.

Items 4 and 5 are the biggest lift technically — happy to build the
per-article page route and sitemap generator into `server.py` if you want to
go ahead with that next.

---

## 4. Actually growing a readership

The technical side gets you found; this part gets you read.

- **Publish on a rhythm.** Even one article a week, every week, beats
  sporadic bursts — readers and search engines both reward consistency.
- **Get it linked from somewhere with existing traffic.** Ask the school to
  link it from the official school website or newsletter — that single
  backlink does more for your Google ranking than almost anything else on
  this list.
- **Recruit writers deliberately.** A rotating roster of 5–10 student
  writers across different grades, each committing to one article a month,
  produces a much steadier stream than an open call that anyone can ignore.
- **Share individual articles, not just the homepage**, on class group
  chats or school social media — once article pages exist (see item 4
  above), each one is a shareable unit on its own.
- **Track what's actually read.** The `/api/stats` endpoint already counts
  views per article — check it periodically to see what topics land, and
  assign more of what works.
- **Keep an editor in the loop.** The moderation queue exists so a
  consistent voice and quality bar can be maintained even with many
  contributors — treat that review step as seriously as a real newsroom
  would.

---

## Nice next steps, roughly in order of value

1. Per-article URLs + sitemap (unlocks real SEO — see section 3).
2. A simple `/admin` page with a login form instead of curl commands for
   moderation.
3. Email or Slack notification to editors when a new article is submitted.
4. An RSS feed (`/feed.xml`) — some readers and teachers may prefer it, and
   it's a small addition once per-article pages exist.
5. Migrate from SQLite to a small hosted Postgres (e.g. a free tier from
   Supabase or Neon) once you outgrow a single host's disk — this is a
   natural point to reach for once the paper has real, ongoing traffic.
