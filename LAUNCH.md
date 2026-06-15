# Cause & Counsel — Launch & Onboarding Guide

Everything you need to take this site from "looks done" to **fully functional and live**.
None of this needs a developer — it's all creating free accounts and pasting in keys.

There are **6 systems** to set up. You can launch a useful site with just steps **1, 2, and 6**, then add the rest whenever you're ready.

---

## At a glance — what's live vs. what needs setup

| Feature | Status now | Goes live after |
|---|---|---|
| All pages, design, navigation, light/dark mode | ✅ Working | — |
| Photo slots (drag images in) | ✅ Working | — |
| Forms (newsletter, submit article, join, contact) | ⏳ Demo mode (shows "thank you", sends nothing) | **Step 2 — EmailJS** |
| Events page | ⏳ Sample events | **Step 3 — Google Calendar** |
| Blog | ⏳ Sample posts | **Step 4 — Notion** |
| Admin dashboard | ⚠️ Demo password | **Step 5 — change passphrase** |

> **Minimum to launch today:** Step 1 (host) + Step 2 (email) + Step 6 (your real contact details).
> That alone gives a fully working site where people can read everything and every form reaches your inbox.

---

## Step 1 — Host the site (do this first)

The blog uses a small server-side function to keep your Notion key secret, so the files need to be hosted (not just opened from your computer).

**Recommended: Vercel (free).**

1. Create a **GitHub** account and upload this project as a repository.
   (Or use the Vercel desktop app / drag-and-drop deploy — either works.)
2. Create a **Vercel** account and **import the GitHub repo**.
3. Vercel gives you a live URL immediately (e.g. `cause-and-counsel.vercel.app`).
   Every time you save a change to GitHub, the site redeploys automatically.
4. **Custom domain** (optional, later): in Vercel → Settings → Domains, add `causeandcounsel.in` (or your domain) and follow the DNS instructions.

*Alternative: Netlify works too and is equally good.*

---

## Step 2 — Make the forms send email (EmailJS)

Right now all four forms validate and say "thank you" but **send nothing**. EmailJS makes them email your inbox — no backend needed. The free tier only allows 2 templates, so the site is built to need **just ONE** (it composes each email's subject + body itself).

1. Create a free account at **emailjs.com**.
2. **Add an email service** (connect your Gmail or other inbox). Note the **Service ID** (looks like `service_xxxxxxx`).
3. **Create ONE email template** (see `EMAILJS-TEMPLATES.md` for the exact thing to paste). Its subject is `{{subject}}`, its body is `{{message}}`, its Reply-To is `{{reply_to}}`, and its To is your team inbox. Note the **Template ID** (e.g. `template_inbox`).
4. Find your **Public Key**: EmailJS → Account → API Keys.
5. In **Vercel → your project → Settings → Environment Variables**, add three (these are read by `/api/config` and handed to the browser — no code edit needed):

   ```
   EMAILJS_PUBLIC_KEY  = your_public_key
   EMAILJS_SERVICE_ID  = service_xxxxxxx
   EMAILJS_TEMPLATE_ID = template_inbox
   ```

   Redeploy. As soon as those are set, all four forms send live email. Until then they stay in safe demo mode.

**What each form emails you:**

| Form | Page | Subject line | Includes |
|---|---|---|---|
| Newsletter | Home | Newsletter signup — <name> | first name, email, interest |
| Submit an article | Home (Get Involved → Write) | Article submission — <name> | name, email, institution, title, category, word count, abstract, declarations |
| Join the team | Home (Get Involved → Join) | Team application — <name> | name, year, email, institution, role, why, topic |
| Contact | Contact page | Contact message — <name> | name, email, subject, message |

The site formats each email for you and sets **Reply-To** to the submitter, so you can reply straight from your inbox.

> **Free tier:** ~200 emails/month and 2 templates — the site only needs 1, leaving a slot free for an optional auto-reply later. Upgrade if volume grows.

---

## Step 3 — Connect Google Calendar (Events page)

The Events page shows sample events until this is wired. Once done, your team just adds events in Google Calendar and they appear on the site automatically — no code changes ever.

1. Create a **dedicated Google Calendar** (e.g. "Cause & Counsel Events").
2. Set it to **public**: Calendar settings → Access permissions → "Make available to public".
3. Copy the **Calendar ID**: Calendar settings → Integrate calendar → "Calendar ID" (looks like `...@group.calendar.google.com`).
4. Get an **API key**: go to **Google Cloud Console** → create a project → enable the **Google Calendar API** → Credentials → Create API key. Restrict it to the Calendar API and your domain (HTTP referrer) for safety.
5. In **Vercel → Settings → Environment Variables**, add both (read by `/api/config`, no code edit needed):

   ```
   GCAL_CALENDAR_ID = ...@group.calendar.google.com
   GCAL_API_KEY     = your_api_key
   ```

   Redeploy.

**How events should be entered** (in Google Calendar):
- **Title** → event name
- **Location** → venue name, or "Online" / "Zoom" (the site auto-tags online events)
- **Description** → 2–3 line summary. Paste an RSVP link anywhere in it and the site turns it into an "RSVP / Details" button.
- **Date & time** → start and end as normal.

Upcoming events show automatically; past ones collapse into a "Past events" section.

---

## Step 4 — Connect Notion (Blog CMS)

The blog shows sample posts until this is wired. Once done, your team writes articles in Notion and publishes them with one click — no developer needed.

1. Create a **Notion database** with these properties (exact names matter):

   | Property | Type | Notes |
   |---|---|---|
   | Title | Title | The article headline |
   | Slug | Text | URL-friendly, e.g. `tenant-rights-india` |
   | Author | Text | Writer's name |
   | Date | Date | Publish date |
   | Category | Select | Match the blog filters (Know Your Rights, Constitutional Law, etc.) |
   | Excerpt | Text | 1–2 sentence summary shown on cards |
   | Read Time | Text | e.g. "6 min read" |
   | Featured | Checkbox | If checked, it's the big featured post |
   | Status | Select | `Draft` / `Published` — only Published shows |

2. Create a **Notion integration**: notion.so/my-integrations → New integration → copy the **Internal Integration Secret**.
3. **Share the database** with that integration: open the database → "..." menu → Connections → add your integration.
4. Copy the **Database ID** from its URL (the long string before the `?`).
5. In **Vercel** → your project → Settings → Environment Variables, add two:

   ```
   NOTION_TOKEN  = secret_xxxxxxxxxxxx
   NOTION_DB_ID  = your_database_id
   ```

   Redeploy (Vercel does this automatically when you save env vars).

**Publishing flow from now on:** write the article in the Notion page body → set **Status = Published** → it appears on the site within a couple of minutes.

> **Why env vars and not the code file?** The Notion token is a secret. It must live on the server (Vercel), never in the browser. The included `api/posts.js` function reads it safely. This is also why the site needs hosting (Step 1).

---

## Step 5 — Change the admin password

The team dashboard at **`admin.html`** is locked with a demo passphrase: **`counsel2025`**. Change it before sharing the link.

1. Pick a new passphrase.
2. Generate its **SHA-256 hash**: open any browser, press F12 → Console, paste this (replace the passphrase), press Enter:

   ```js
   crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-passphrase'))
     .then(b => console.log(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')));
   ```

3. Copy the long hash it prints.
4. Open **`js/admin.js`** and replace the value of `STORED_HASH` near the top with your new hash.

> The dashboard's submission tables currently show **sample rows**. They can later be pointed at your EmailJS history or a Google Sheet, but that's optional — your real submissions already arrive by email (Step 2). The "Manage content" links (Google Calendar, Notion, EmailJS) work as soon as those accounts exist.

---

## Step 6 — Swap in your real content

- **Email & social handles:** replace `contact@causeandcounsel.in` and `@causeandcounsel` (in the footer of every page and on the Contact page) with your real ones.
- **Team & founder photos:** the **About** page shows tasteful monogram placeholders (initials) until you add real photos. To add one: put the image in an `images/` folder and drop an `<img>` inside the relevant `.cc-photo` placeholder, e.g. `<div class="cc-photo"><img src="images/sanaya.jpg" alt="Sanaya Parikh"></div>` (there's a comment next to the founder photo showing exactly this). The image automatically covers the monogram.
- **Team names & bios:** update the placeholder team members on the About page with real people (or leave the "Open seat" cards if you're recruiting).
- **Founder bio:** confirm Sanaya's details on the About page read the way you want.

---

## File reference — where everything lives

```
/
├── index.html          Home (hero, about, goals bento, blog preview, newsletter, get-involved tabs)
├── events.html         Events (Google Calendar)
├── blog.html           Blog listing (Notion)
├── blog-post.html      Single article (Notion)
├── about.html          Founder, team, pillars, mission
├── contact.html        Contact form + direct channels
├── admin.html          Password-protected team dashboard
├── styles/
│   └── global.css      All shared styling + light/dark theme tokens
├── js/
│   ├── main.js         Theme toggle, forms, tabs (reads keys from /api/config)
│   ├── events.js       Events page (reads calendar config from /api/config)
│   ├── blog.js         Blog listing logic
│   ├── blog-post.js    Single-article rendering
│   ├── mock-content.js Sample blog posts (used until Notion is connected)
│   └── admin.js        ← Admin passphrase hash (Step 5) — the one file you edit
├── api/
│   ├── config.js       Serves public client keys (EmailJS, Calendar) from env vars
│   └── posts.js        Notion proxy (reads NOTION_TOKEN / NOTION_DB_ID env vars)
└── .env.example        Template for all environment variables
```

**No keys live in the code anymore.** All credentials are Vercel environment variables (see `.env.example`). The only file you'd ever edit by hand is `js/admin.js` to change the admin passphrase (Step 5).

---

## Quick launch checklist

- [ ] **1.** Deploy to Vercel (drag-and-drop or import) → site is live
- [ ] **2.** EmailJS account + **1 template** → add `EMAILJS_*` env vars in Vercel
- [ ] **6.** Replace email address + social handles; add team photos & bios
- [ ] *(then)* **3.** Google Calendar public + API key → add `GCAL_*` env vars in Vercel
- [ ] *(then)* **4.** Notion database + integration → add `NOTION_TOKEN` & `NOTION_DB_ID` in Vercel
- [ ] **5.** Change the admin passphrase hash in `js/admin.js`
- [ ] Add your custom domain in Vercel

---

*Prepared for Cause & Counsel · June 2026*
