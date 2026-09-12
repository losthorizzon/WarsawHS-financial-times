const state = {
  category: "All",
  query: "",
};

const el = (id) => document.getElementById(id);

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  el("todayDate").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  loadCategories();
  loadArticles();
  loadTicker();

  el("searchInput").addEventListener("input", debounce((e) => {
    state.query = e.target.value;
    loadArticles();
  }, 300));

  el("submitOpenBtn").addEventListener("click", () => toggleOverlay("submitOverlay", true));
  el("submitClose").addEventListener("click", () => toggleOverlay("submitOverlay", false));
  el("readerClose").addEventListener("click", () => toggleOverlay("readerOverlay", false));

  el("articleForm").addEventListener("submit", handleSubmit);

  // click outside panel closes overlay
  document.querySelectorAll(".overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("is-open");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay.is-open").forEach((o) => o.classList.remove("is-open"));
    }
  });
});

function toggleOverlay(id, open) {
  el(id).classList.toggle("is-open", open);
  el(id).setAttribute("aria-hidden", String(!open));
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ---------------------------------------------------------------------
// Categories / nav
// ---------------------------------------------------------------------

async function loadCategories() {
  const res = await fetch("/api/categories");
  const data = await res.json();
  const nav = el("categoryNav");
  const select = el("categorySelect");

  data.categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "navlink";
    btn.textContent = cat;
    btn.dataset.category = cat;
    btn.addEventListener("click", () => {
      state.category = cat;
      document.querySelectorAll(".navlink").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      loadArticles();
    });
    nav.appendChild(btn);

    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  // "Front Page" button (already in markup) resets to All
  nav.querySelector('[data-category="All"]').addEventListener("click", (e) => {
    state.category = "All";
    document.querySelectorAll(".navlink").forEach((b) => b.classList.remove("is-active"));
    e.target.classList.add("is-active");
    loadArticles();
  });
}

// ---------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------

async function loadArticles() {
  const params = new URLSearchParams({ status: "published" });
  if (state.category && state.category !== "All") params.set("category", state.category);
  if (state.query) params.set("q", state.query);

  const list = el("articleList");
  const res = await fetch(`/api/articles?${params.toString()}`);
  const data = await res.json();

  list.innerHTML = "";

  if (data.articles.length === 0) {
    list.innerHTML = `<p class="empty-note">No articles here yet — be the first to write one.</p>`;
    return;
  }

  data.articles.forEach((a) => {
    const card = document.createElement("article");
    card.className = "story";
    card.innerHTML = `
      <p class="story__kicker">${escapeHtml(a.category)}</p>
      <h3 class="story__title">${escapeHtml(a.title)}</h3>
      <p class="story__summary">${escapeHtml(a.summary)}</p>
      <p class="story__byline">By ${escapeHtml(a.author)}${a.grade ? " · " + escapeHtml(a.grade) : ""} — ${timeAgo(a.created_at)}</p>
    `;
    card.addEventListener("click", () => openArticle(a.id));
    list.appendChild(card);
  });
}

async function openArticle(id) {
  const res = await fetch(`/api/articles/${id}`);
  const data = await res.json();
  if (data.error) return;

  const a = data.article;
  el("readerCategory").textContent = a.category;
  el("readerTitle").textContent = a.title;
  el("readerByline").textContent = `By ${a.author}${a.grade ? " · " + a.grade : ""} — ${timeAgo(a.created_at)}`;
  el("readerBody").innerHTML = a.body
    .split(/\n\s*\n/)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join("");

  toggleOverlay("readerOverlay", true);
}

// ---------------------------------------------------------------------
// Ticker
// ---------------------------------------------------------------------

async function loadTicker() {
  const res = await fetch("/api/stats");
  const data = await res.json();
  const track = el("tickerTrack");

  const items = data.ticker.length
    ? data.ticker.map((t) => `${t.category.toUpperCase()} — ${t.title}`)
    : ["Welcome to the desk — submit the first article of the day"];

  // duplicate content for seamless scroll loop
  const html = [...items, ...items]
    .map((text) => `<span class="ticker__item">${escapeHtml(text)}</span>`)
    .join("");
  track.innerHTML = html;
}

// ---------------------------------------------------------------------
// Submission
// ---------------------------------------------------------------------

async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const status = el("formStatus");
  const payload = Object.fromEntries(new FormData(form).entries());

  status.textContent = "Sending…";
  status.className = "form-status";

  try {
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || "Something went wrong.";
      status.className = "form-status is-error";
      return;
    }

    status.textContent = data.message;
    status.className = "form-status is-ok";
    form.reset();
    setTimeout(() => toggleOverlay("submitOverlay", false), 1800);
  } catch (err) {
    status.textContent = "Could not reach the server. Try again.";
    status.className = "form-status is-error";
  }
}

// ---------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------

function timeAgo(unixSeconds) {
  const seconds = Math.floor(Date.now() / 1000) - unixSeconds;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [name, secs] of units) {
    const val = Math.floor(seconds / secs);
    if (val >= 1) return `${val} ${name}${val > 1 ? "s" : ""} ago`;
  }
  return "just now";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
