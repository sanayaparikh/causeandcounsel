/* ============================================================
   CAUSE & COUNSEL — public client config  (Vercel function)
   Route: /api/config

   WHY THIS EXISTS
   This is a static site with no build step, so the browser-side
   keys (EmailJS, Google Calendar) can't be baked in from env vars
   at build time. Instead this function reads them from the host's
   environment variables at request time and hands the browser ONLY
   the values that are public-by-design anyway.

   These keys are NOT secret — they are visible in the browser the
   moment the site uses them. The point of serving them from env is
   to keep them OUT of the committed source, so the repo carries no
   credentials and the owner can rotate them in the Vercel dashboard
   without a code change. Protect the Google key with an HTTP-referrer
   restriction in Google Cloud; restrict EmailJS to your domain.

   The Notion token is the only real secret and is NOT returned here —
   it stays server-side inside api/posts.js.

   ENV VARS (set in the Vercel dashboard):
     EMAILJS_PUBLIC_KEY   EMAILJS_SERVICE_ID   EMAILJS_TEMPLATE_ID
     GCAL_CALENDAR_ID     GCAL_API_KEY
   ============================================================ */

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Cache at the edge briefly; config changes are rare.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    emailjs: {
      publicKey:  process.env.EMAILJS_PUBLIC_KEY  || '',
      serviceId:  process.env.EMAILJS_SERVICE_ID  || '',
      templateId: process.env.EMAILJS_TEMPLATE_ID || ''
    },
    calendar: {
      calendarId: process.env.GCAL_CALENDAR_ID || '',
      apiKey:     process.env.GCAL_API_KEY     || ''
    }
  }));
};
