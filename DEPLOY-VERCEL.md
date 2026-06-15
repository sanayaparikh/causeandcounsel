# Deploying Cause & Counsel to Vercel (drag-and-drop)

This site is ready to run on Vercel with **zero build configuration**. The HTML
is served statically; the `api/` folder becomes serverless functions
automatically. No credentials are in the code — they all come from Vercel
environment variables.

> ⚠️ **Do NOT upload `.env`.** It holds the real secrets and is only your local
> cheat-sheet to copy values from. The `.vercelignore` excludes it, but if you
> drag a folder in the browser, double-check `.env` isn't part of the upload.
> The real values go into Vercel's dashboard (Step 3), not into uploaded files.

---

## Step 1 — Deploy the files

**Option A — Browser drag-and-drop (simplest):**
1. Log into the target Vercel account → **Add New… → Project**.
2. Choose the **"deploy a template / upload"** path and **drag the project
   folder** (everything except `.env`) into the uploader.
3. Framework preset: **Other** (it's a static site). Leave build & output
   settings empty. Deploy. You'll get a live `*.vercel.app` URL.

**Option B — Vercel CLI (most reliable for the `/api` functions):**
```bash
npm i -g vercel        # one time
cd "Cause & Counsel"
vercel                 # follow prompts → links/creates the project
vercel --prod          # promote to production
```
The CLI honors `.vercelignore`, so `.env` is never uploaded.

At this point the site is live but in **demo mode** — forms show a thank-you but
send nothing, events/blog show sample data — because no env vars are set yet.

---

## Step 2 — (none) the code needs no edits

Everything is driven by env vars. Skip straight to Step 3.

---

## Step 3 — Add the environment variables

In Vercel → **Project → Settings → Environment Variables**, add each of these
(values are in your local `.env`). Set the environment to **Production** (and
Preview if you want preview deploys live too):

| Variable | What it's for | Secret? |
|---|---|---|
| `EMAILJS_PUBLIC_KEY` | Forms (EmailJS) | public |
| `EMAILJS_SERVICE_ID` | Forms (EmailJS) | public |
| `EMAILJS_TEMPLATE_ID` | Forms (EmailJS) | public |
| `GCAL_CALENDAR_ID` | Events (Google Calendar) | public |
| `GCAL_API_KEY` | Events (Google Calendar) | public |
| `NOTION_TOKEN` | Blog (Notion) | **SECRET** |
| `NOTION_DB_ID` | Blog (Notion) | semi-secret |

The "public" ones end up in the browser anyway (that's normal for these
services). The `NOTION_TOKEN` is the only true secret — it stays server-side in
`api/posts.js` and is never sent to the browser.

---

## Step 4 — Redeploy

Env vars only take effect on a new deployment.
- **Dashboard:** Deployments tab → ⋯ on the latest → **Redeploy**.
- **CLI:** `vercel --prod` again.

After redeploy: submit a form (should arrive by email), open `/events.html`
(should show live calendar events), open `/blog.html` (should show live Notion
posts). If any still shows sample data, re-check that variable's spelling and
that you redeployed.

---

## Step 5 — Lock down the public keys at the provider

Because the EmailJS and Google keys are visible in the browser, restrict them
where they're issued:
- **Google Cloud Console** → the API key → **Application restrictions →
  HTTP referrers** → add your Vercel domain (and custom domain).
- **EmailJS** → allow only your domain(s).

---

## Custom domain (optional)

Vercel → Project → **Settings → Domains** → add `causeandcounsel.in` (or your
domain) and follow the DNS instructions. Re-add the domain to the Google/EmailJS
restrictions above once live.
