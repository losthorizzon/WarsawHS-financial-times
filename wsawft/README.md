# The Warsaw Highschool Financial Times

A student newspaper site for economics and finance writing. Anyone can submit
an article; an editor approves it before it goes live. Readers can browse by
section and search everything that's published.

## What's inside

```
wsawft/
├── server.py          # Backend — pure Python, no installs needed
├── static/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── articles.db        # Created automatically on first run
```

There is no build step and no dependencies to install — `server.py` only uses
Python's standard library (`http.server`, `sqlite3`).

## Running it locally

You need Python 3.8 or newer. Check with:

```bash
python3 --version
```

Then, from inside the `wsawft` folder:

```bash
python3 server.py
```

Open **http://localhost:8000** in a browser. That's it — the database file
(`articles.db`) is created automatically with two sample articles already
published so the front page isn't empty.

## How the moderation queue works

Anyone can fill in the "Submit an article" form on the site. Their piece is
saved with status `pending` — it will **not** appear on the site until an
editor approves it. This keeps quality control in human hands, which matters
for a school paper.

To review pending articles, an editor uses the moderation API directly (there
is deliberately no public admin page, to keep the surface area small):

```bash
# List everything waiting for review
curl "http://localhost:8000/api/pending?key=editor-desk-2026"

# Approve one (copy its id from the list above)
curl -X POST "http://localhost:8000/api/articles/ARTICLE_ID/approve" \
  -H "Content-Type: application/json" \
  -d '{"key":"editor-desk-2026"}'

# Or reject one
curl -X POST "http://localhost:8000/api/articles/ARTICLE_ID/reject" \
  -H "Content-Type: application/json" \
  -d '{"key":"editor-desk-2026"}'
```

**Change the editor key before you publish this anywhere.** It's set with an
environment variable so you never have to hardcode it in the code:

```bash
export WHFT_ADMIN_KEY="something-only-editors-know"
python3 server.py
```

If you'd rather have a real clickable moderation page instead of curl
commands, that's a good next feature to add — see the "Nice next steps"
section in `GUIDE.md`.

## Customizing

- **Sections/categories** — edit the `CATEGORIES` list near the top of
  `server.py`.
- **Colors and fonts** — all in `static/style.css` under `:root` at the top
  of the file.
- **Site name and tagline** — in `static/index.html`, inside the `<header>`.

## A note on data

Everything lives in one SQLite file, `articles.db`. To back it up, just copy
that file. To reset the whole site, delete it and restart the server — it
will recreate an empty database with the two sample articles.
