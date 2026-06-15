# Cause & Counsel — EmailJS Template (free-tier friendly)

The free EmailJS plan allows only **2 templates** — and you only need **one**. All four forms (newsletter, article submission, join application, contact) send through a **single universal template**. The website assembles a tidy subject line and message body in the background, so one template handles everything.

---

## Create ONE template

In EmailJS → **Email Templates** → Create New Template.

| EmailJS field | What to put |
|---|---|
| **Template Name** | `Cause & Counsel — Website` (anything readable) |
| **Template ID** | `template_inbox` ← note this exact ID; you'll paste it into the site |
| **To Email** | Your team inbox (e.g. `contact@causeandcounsel.in`) |
| **From Name** | `{{from_name}}` |
| **Reply To** | `{{reply_to}}` ← lets you reply straight to the person |
| **Subject** | *(copy below)* |
| **Content** | *(copy below)* |

### Subject
```
{{subject}}
```

### Content (body)
```
{{message}}
```

That's the whole template. The site fills `{{subject}}`, `{{message}}`, `{{reply_to}}`, and `{{from_name}}` automatically — you don't list individual fields.

---

## What the emails will look like

Because the message body is assembled by the site, each form arrives clearly labelled. Examples:

**Newsletter signup →**
```
Subject: Newsletter signup — Neha

New "Newsletter signup" submission from the Cause & Counsel website.

First name: Neha
Email: neha@example.com
Interest: Know Your Rights

— Sent automatically from causeandcounsel.in
```

**Article submission →**
```
Subject: Article submission — Aarav

New "Article submission" submission from the Cause & Counsel website.

First name: Aarav
Last name: Mehta
Email: aarav@example.com
Institution: NLSIU Bengaluru
Title: Your rights as a tenant in India
Category: Know Your Rights
Word count: 1200
Abstract: A plain-English guide to deposits and eviction...
Original: Yes
Review: Yes
Rights: Yes

— Sent automatically from causeandcounsel.in
```

**Team application →**
```
Subject: Team application — Ananya

New "Team application" submission from the Cause & Counsel website.

Name: Ananya Iyer
Year: 2nd year
Email: ananya@example.com
Institution: NLSIU Bengaluru
Role: Research Lead
Why: I care deeply about access to justice...
Topic: gig-worker protections

— Sent automatically from causeandcounsel.in
```

**Contact message →**
```
Subject: Contact message — Tara

New "Contact message" submission from the Cause & Counsel website.

Name: Tara Menon
Email: tara@example.com
Subject: Partnership
Message: We'd love to collaborate on a workshop...

— Sent automatically from causeandcounsel.in
```

> Every field the visitor fills in is included automatically, labelled from its field name (e.g. `first_name` → "First name"). Empty fields are skipped. You never have to maintain a separate template per form.

---

## Wire it into the site

Open **`js/main.js`** and paste your three values near the top:

```js
var EMAILJS = {
  publicKey:  'PASTE_YOUR_PUBLIC_KEY',     // EmailJS → Account → API Keys
  serviceId:  'PASTE_YOUR_SERVICE_ID',     // EmailJS → Email Services (service_xxx)
  templateId: 'template_inbox'             // the Template ID you created above
};
```

As soon as all three are real (no "PLACEHOLDER"), every form sends live email. Until then they stay in safe demo mode (validate + "thank you", nothing sent).

---

## Optional: use your 2nd free template to auto-reply

If you'd like visitors to get a "thanks, we received it" confirmation, you can later add a second template and a one-line `emailjs.send(...)` call. Not required for launch — ask if you want this wired up.

---

## Test

After pasting the keys, submit each form once. You should receive a clearly-labelled email within seconds, and hitting **Reply** in your inbox will go straight back to the person who filled it in.

---

*Prepared for Cause & Counsel · June 2026*
