# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Cause & Counsel is a **static, multi-page marketing/content site** for a student-led legal-literacy organization, **deployed on Vercel**. There is **no build step, no framework, and no `package.json`** — pages are hand-written HTML, one `<script>` per page, plus shared CSS. The only server-side code is two serverless functions in `api/`: `posts.js` (Notion blog proxy) and `config.js` (serves public client keys from env vars).

## Running & developing

- **Open pages directly** in a browser (e.g. `open index.html`) for layout/CSS/JS work. Forms, events, and blog all fall back to demo/mock data when their config/functions aren't reachable, so the design renders fully offline.
- **For live behavior, run `vercel dev`** (or any host mapping `api/*.js` to functions) so `/api/config` and `/api/posts` resolve. Set env vars locally via a `.env` file (see `.env.example`).
- **No tests, no linter, no build.** Deployment is drag-and-drop to Vercel (or connect a Git repo for auto-deploys); env vars are set in the Vercel dashboard. See `LAUNCH.md`.

## Credentials / env vars (important)

**No keys live in committed source.** All credentials are environment variables (see `.env.example`; real values in the gitignored `.env`). Two categories:

- **Public, client-side keys** (EmailJS public key + service/template IDs, Google Calendar ID + API key): served to the browser by `api/config.js` from env vars. They're public-by-design (visible in the network tab regardless) — env vars just keep them out of git and let the owner rotate them. The Google key must be HTTP-referrer-restricted at the provider.
- **Secret** (`NOTION_TOKEN`, `NOTION_DB_ID`): used only server-side inside `api/posts.js`, never returned to the browser.

Env var names: `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `GCAL_CALENDAR_ID`, `GCAL_API_KEY`, `NOTION_TOKEN`, `NOTION_DB_ID`.

## Architecture

**Page = HTML file + its own JS.** Each top-level `.html` is a standalone page. Every page loads `styles/global.css` and `js/main.js`; content pages additionally load their specific script:

| Page | Page-specific JS | Data source |
|---|---|---|
| `index.html` | (main.js only) | static |
| `events.html` | `js/events.js` | Google Calendar API v3 (direct browser fetch) |
| `blog.html` | `js/blog.js` | `/api/posts` (Notion proxy) |
| `blog-post.html` | `js/blog-post.js` | `/api/posts?slug=...` |
| `admin.html` | `js/admin.js` | client-side gate + mock data |
| `about.html`, `contact.html` | (main.js only) | static |

**`js/main.js` is the shared base** loaded on every page: theme toggle, scroll-reveal (`.fade-in` → `.visible` via IntersectionObserver, with a 2.6s failsafe), mobile nav, tabs, toast (`window.CC.toast`), nav scroll state, and **all form handling** (EmailJS). Forms are declarative: any `<form data-cc-form>` is wired automatically — `data-cc-label` sets the email subject prefix, `data-cc-success` the toast. `composeEmail()` walks the form's fields and builds one email body, so a single EmailJS template serves all four forms.

**Theme:** dark is default. An inline `<head>` script in each page applies `data-theme="light"` from `localStorage['cc-theme']` *before paint* to avoid flash; `main.js` wires the toggle button.

### The "graceful demo mode" pattern (important)

All three integrations follow the same rule: **if config is missing/empty, fall back to realistic sample data** so the design is always previewable. When editing these, preserve the fallback paths:

- **Forms (EmailJS)** — `js/main.js`: `loadConfig()` fetches `/api/config` once and populates the `EMAILJS` object; `emailjsReady()` checks the three keys are non-empty. Empty (env unset, or `/api/config` unreachable) → demo mode (validates + success toast, sends nothing). The submit handler awaits `loadConfig()` before choosing live-vs-demo.
- **Events (Google Calendar)** — `js/events.js`: `fetchEvents()` calls `loadConfig()` for `calendarId`/`apiKey`; if either is empty it returns `mockEvents()` (dates relative to now), else fetches the Calendar API and `normalize()`s items. The module-level `LIVE` flag drives the "sample data" status message.
- **Blog (Notion)** — `api/posts.js` returns HTTP 501 when env vars are unset; `js/blog.js`/`blog-post.js` catch any failure/empty result and fall back to `window.CC_MOCK` from `js/mock-content.js`.

**Mock blog content is written in Notion's real block/rich-text shape** (`mock-content.js` builds `{type, ...}` objects). This is deliberate: the same `renderBlocks()`/`renderRich()` in `blog-post.js` renders both mock and live Notion data — don't introduce a separate mock-only renderer.

### Notion proxy (`api/posts.js`)

Holds `NOTION_TOKEN`/`NOTION_DB_ID` (env vars) so the secret never reaches the browser. Queries the DB for `Status = Published`, maps a fixed set of Notion properties (Title, Slug, Author, Date, Category, Excerpt, Read Time, Featured, Status) to a clean JSON shape, and fetches block children for single posts. **Property names must match the Notion DB exactly** (see the table in `LAUNCH.md` §4). Default export is the Vercel handler; a Netlify adapter is stubbed at the bottom.

### Admin gate (`js/admin.js`)

Passphrase-only, no accounts. Passphrase is SHA-256'd client-side and compared to `STORED_HASH`; success stores a token in `sessionStorage`. This deters casual access only — the dashboard tables are mock data, real submissions arrive by email. To change the passphrase, regenerate the hash (see comment block in the file or `LAUNCH.md` §5).

### Photos (About page)

Team/founder photos use plain CSS **monogram placeholders** (`.cc-photo` with a `<span class="mono">` showing initials), defined inline in `about.html`. To add a real photo, drop an `<img>` inside the `.cc-photo` div (it's absolutely positioned to cover the monogram). There is no longer a custom element or build dependency here — the previous `<image-slot>` component (which only persisted inside a special preview runtime) was removed because it didn't work on a real host.

## Configuration / secrets

All credentials are env vars (see the "Credentials / env vars" section above and `.env.example`). The **only** file edited by hand for config is `js/admin.js` (`STORED_HASH`, the admin passphrase hash — regenerate via the comment block in that file). See `LAUNCH.md` for the full setup and `EMAILJS-TEMPLATES.md` for the EmailJS template.

> The gitignored `.env` holds the real values; `.env.example` is the committed template. Never commit `.env`.
