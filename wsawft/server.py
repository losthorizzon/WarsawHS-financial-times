#!/usr/bin/env python3
"""
Warsaw Highschool Financial Times — backend server.

Pure Python standard library only (http.server + sqlite3), so it runs on
any machine with Python 3 installed — no pip install, no network access
required to set up. See GUIDE.md for how to put this on the public internet.
"""

import json
import os
import re
import sqlite3
import time
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "articles.db")
STATIC_DIR = os.path.join(BASE_DIR, "static")
PORT = int(os.environ.get("PORT", 8000))

# Change this before you publish the site. It gates the moderation endpoints.
# Better yet: set it via an environment variable, see GUIDE.md.
ADMIN_KEY = os.environ.get("WHFT_ADMIN_KEY", "editor-desk-2026")

CATEGORIES = [
    "Markets",
    "Personal Finance",
    "School Economy",
    "Global Trade",
    "Op-Ed",
    "Career & Internships",
]

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    return conn


def init_db():
    conn = get_db()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS articles (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            grade TEXT,
            category TEXT NOT NULL,
            summary TEXT NOT NULL,
            body TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            views INTEGER NOT NULL DEFAULT 0,
            created_at INTEGER NOT NULL
        )
        """
    )
    conn.commit()

    # Seed a couple of sample articles on first run so the site isn't empty.
    count = conn.execute("SELECT COUNT(*) AS c FROM articles").fetchone()["c"]
    if count == 0:
        samples = [
            (
                "Why the Cafeteria Vending Machine Is a Lesson in Inflation",
                "Zofia Nowak",
                "3B",
                "School Economy",
                "A snack price hike sparked a spreadsheet — and a real lesson in cost-push inflation.",
                (
                    "When the price of a chocolate bar in the school vending machine rose from "
                    "4 to 5 zloty overnight, most students grumbled and moved on. A few of us in "
                    "the economics club decided to actually investigate.\n\n"
                    "We found the distributor had raised wholesale prices twice this year, citing "
                    "higher cocoa and transport costs — a textbook case of cost-push inflation "
                    "playing out in miniature, one hallway away from where we're taught the theory.\n\n"
                    "The bigger question we couldn't shake: if a 25% price jump on candy causes this "
                    "much noise, how do families absorb the same shock across an entire grocery bill? "
                    "We don't have a clean answer, but we do have a new appreciation for what those "
                    "inflation charts in our textbooks actually mean at ground level."
                ),
            ),
            (
                "A First-Year Guide to Opening a Student Savings Account in Poland",
                "Kacper Wisniewski",
                "1A",
                "Personal Finance",
                "What actually happens when a 16-year-old walks into a bank branch, explained plainly.",
                (
                    "Most of us will earn our first real money this year — tutoring, summer jobs, "
                    "birthday transfers from grandparents — and have nowhere structured to put it. "
                    "Here is what I learned opening my own account last month.\n\n"
                    "Under Polish law, minors aged 13 and over can open a bank account with a parent "
                    "or guardian's consent. Most major banks offer youth accounts with no monthly fee "
                    "and a debit card, though withdrawal limits and online payment permissions usually "
                    "need a parent's sign-off in the banking app.\n\n"
                    "My biggest surprise: interest rates on these accounts are close to zero. If you're "
                    "saving for something more than a year out, it's worth asking a parent about a "
                    "linked savings sub-account instead, which usually pays better."
                ),
            ),
        ]
        for title, author, grade, category, summary, body in samples:
            conn.execute(
                """
                INSERT INTO articles
                    (id, title, author, grade, category, summary, body, status, views, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)
                """,
                (
                    str(uuid.uuid4()),
                    title,
                    author,
                    grade,
                    category,
                    summary,
                    body,
                    12,
                    int(time.time()) - 86400,
                ),
            )
        conn.commit()
    conn.close()


def row_to_dict(row, include_body=True):
    d = {
        "id": row["id"],
        "title": row["title"],
        "author": row["author"],
        "grade": row["grade"],
        "category": row["category"],
        "summary": row["summary"],
        "status": row["status"],
        "views": row["views"],
        "created_at": row["created_at"],
    }
    if include_body:
        d["body"] = row["body"]
    return d


# ---------------------------------------------------------------------------
# Request handler
# ---------------------------------------------------------------------------


class Handler(BaseHTTPRequestHandler):
    server_version = "WHFT/1.0"

    # -- helpers -------------------------------------------------------

    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def _serve_static(self, path):
        if path == "/":
            path = "/index.html"
        safe_path = os.path.normpath(path).lstrip("/")
        full_path = os.path.join(STATIC_DIR, safe_path)
        if not full_path.startswith(STATIC_DIR) or not os.path.isfile(full_path):
            self.send_error(404, "Not found")
            return

        ext = os.path.splitext(full_path)[1]
        content_type = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
            ".svg": "image/svg+xml",
        }.get(ext, "application/octet-stream")

        with open(full_path, "rb") as f:
            data = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        # Quieter default logging.
        print("[whft]", fmt % args)

    # -- routing ---------------------------------------------------------

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)

        if path == "/api/articles":
            self._handle_list_articles(qs)
        elif path == "/api/categories":
            self._send_json({"categories": CATEGORIES})
        elif path == "/api/stats":
            self._handle_stats()
        elif re.match(r"^/api/articles/[\w-]+$", path):
            article_id = path.rsplit("/", 1)[-1]
            self._handle_get_article(article_id)
        elif path == "/api/pending":
            self._handle_pending(qs)
        else:
            self._serve_static(path)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/articles":
            self._handle_submit_article()
        elif re.match(r"^/api/articles/[\w-]+/approve$", path):
            article_id = path.split("/")[3]
            self._handle_moderate(article_id, "published")
        elif re.match(r"^/api/articles/[\w-]+/reject$", path):
            article_id = path.split("/")[3]
            self._handle_moderate(article_id, "rejected")
        else:
            self.send_error(404, "Not found")

    # -- handlers ----------------------------------------------------------

    def _handle_list_articles(self, qs):
        status = qs.get("status", ["published"])[0]
        category = qs.get("category", [""])[0]
        search = qs.get("q", [""])[0].strip()

        conn = get_db()
        query = "SELECT * FROM articles WHERE status = ?"
        params = [status]

        if category and category != "All":
            query += " AND category = ?"
            params.append(category)

        if search:
            query += " AND (title LIKE ? OR summary LIKE ? OR body LIKE ? OR author LIKE ?)"
            like = f"%{search}%"
            params.extend([like, like, like, like])

        query += " ORDER BY created_at DESC"
        rows = conn.execute(query, params).fetchall()
        conn.close()

        articles = [row_to_dict(r, include_body=False) for r in rows]
        self._send_json({"articles": articles, "count": len(articles)})

    def _handle_get_article(self, article_id):
        conn = get_db()
        row = conn.execute("SELECT * FROM articles WHERE id = ?", (article_id,)).fetchone()
        if row is None:
            conn.close()
            self._send_json({"error": "Article not found"}, status=404)
            return
        conn.execute("UPDATE articles SET views = views + 1 WHERE id = ?", (article_id,))
        conn.commit()
        conn.close()
        self._send_json({"article": row_to_dict(row)})

    def _handle_submit_article(self):
        data = self._read_json_body()
        title = (data.get("title") or "").strip()
        author = (data.get("author") or "").strip()
        grade = (data.get("grade") or "").strip()
        category = (data.get("category") or "").strip()
        summary = (data.get("summary") or "").strip()
        body = (data.get("body") or "").strip()

        errors = []
        if len(title) < 5:
            errors.append("Title needs to be at least 5 characters.")
        if len(author) < 2:
            errors.append("Author name is required.")
        if category not in CATEGORIES:
            errors.append("Choose a valid section.")
        if len(summary) < 20:
            errors.append("Summary needs to be at least 20 characters.")
        if len(body) < 200:
            errors.append("Article body needs to be at least 200 characters.")

        if errors:
            self._send_json({"error": " ".join(errors)}, status=400)
            return

        article_id = str(uuid.uuid4())
        conn = get_db()
        conn.execute(
            """
            INSERT INTO articles
                (id, title, author, grade, category, summary, body, status, views, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)
            """,
            (article_id, title, author, grade, category, summary, body, int(time.time())),
        )
        conn.commit()
        conn.close()
        self._send_json(
            {"message": "Submitted. Your article is now awaiting editor review.", "id": article_id},
            status=201,
        )

    def _handle_pending(self, qs):
        key = qs.get("key", [""])[0]
        if key != ADMIN_KEY:
            self._send_json({"error": "Invalid editor key."}, status=403)
            return
        conn = get_db()
        rows = conn.execute(
            "SELECT * FROM articles WHERE status = 'pending' ORDER BY created_at ASC"
        ).fetchall()
        conn.close()
        self._send_json({"articles": [row_to_dict(r) for r in rows]})

    def _handle_moderate(self, article_id, new_status):
        data = self._read_json_body()
        if data.get("key") != ADMIN_KEY:
            self._send_json({"error": "Invalid editor key."}, status=403)
            return
        conn = get_db()
        conn.execute("UPDATE articles SET status = ? WHERE id = ?", (new_status, article_id))
        conn.commit()
        conn.close()
        self._send_json({"message": f"Article marked {new_status}."})

    def _handle_stats(self):
        conn = get_db()
        published = conn.execute(
            "SELECT COUNT(*) AS c FROM articles WHERE status = 'published'"
        ).fetchone()["c"]
        pending = conn.execute(
            "SELECT COUNT(*) AS c FROM articles WHERE status = 'pending'"
        ).fetchone()["c"]
        total_views = conn.execute(
            "SELECT COALESCE(SUM(views), 0) AS v FROM articles WHERE status = 'published'"
        ).fetchone()["v"]
        top = conn.execute(
            "SELECT title, category FROM articles WHERE status = 'published' "
            "ORDER BY views DESC LIMIT 5"
        ).fetchall()
        conn.close()
        self._send_json(
            {
                "published": published,
                "pending": pending,
                "total_views": total_views,
                "ticker": [{"title": r["title"], "category": r["category"]} for r in top],
            }
        )


def main():
    init_db()
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Warsaw Highschool Financial Times running at http://localhost:{PORT}")
    print(f"Editor key (for moderation): {ADMIN_KEY}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.shutdown()


if __name__ == "__main__":
    main()
