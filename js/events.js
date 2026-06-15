/* ============================================================
   CAUSE & COUNSEL — events.js
   Google Calendar API v3 integration + mock fallback.

   SETUP (see LAUNCH.md §3):
   1. Make a dedicated public Google Calendar.
   2. Create a Google Cloud API key, restricted to the Calendar API
      and your site's domain (HTTP referrer).
   3. Set GCAL_CALENDAR_ID and GCAL_API_KEY as env vars in Vercel.
      These are served to the browser by /api/config (they're public-by-
      design, just kept out of the committed source). Once both are set,
      this file fetches live events automatically — admins just add events
      in Google Calendar and they appear here.

   Until both env vars are set, the page renders realistic MOCK events
   so the design is fully visible in preview.
   ============================================================ */
(function () {
  'use strict';

  // Set true once we successfully decide to fetch from the live calendar.
  var LIVE = false;

  /* ---- Load public client config (calendar id + api key) from env ---- */
  function loadConfig() {
    return fetch('/api/config', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) {
        return (c && c.calendar) ? c.calendar : {};
      })
      .catch(function () { return {}; });
  }

  /* ---- Mock data (only used while placeholders remain) ----
     Dates are generated relative to "now" so the demo always has a
     believable mix of upcoming and past events. */
  function mockEvents() {
    var now = new Date();
    function at(daysFromNow, h, m) {
      var d = new Date(now);
      d.setDate(d.getDate() + daysFromNow);
      d.setHours(h, m || 0, 0, 0);
      return d;
    }
    return [
      {
        title: 'Know Your Rights: Tenancy & Eviction',
        start: at(6, 18, 0), end: at(6, 19, 30),
        location: 'Online (Zoom)',
        description: 'A practical walkthrough of tenant protections in India — security deposits, notice periods, and what to do when a landlord oversteps. RSVP: https://causeandcounsel.in/rsvp/tenancy'
      },
      {
        title: 'Decoding the Companies Act for Founders',
        start: at(13, 17, 30), end: at(13, 19, 0),
        location: 'JGLS Moot Court Hall, Sonipat',
        description: 'Incorporation, director duties, and the compliance calendar — a founder-friendly seminar with a live Q&A. Open to all student entrepreneurs. https://causeandcounsel.in/rsvp/companies-act'
      },
      {
        title: 'Speaker Series: Access to Justice in India',
        start: at(21, 18, 0), end: at(21, 19, 30),
        location: 'Online (YouTube Live)',
        description: 'A conversation with a practising advocate on the real barriers between people and the courts — and what closes the gap.'
      },
      {
        title: 'Workshop: Reading a Judgment Without Fear',
        start: at(34, 16, 0), end: at(34, 17, 30),
        location: 'India Habitat Centre, New Delhi',
        description: 'Hands-on session on how to read and break down a court judgment — citations, ratio, and obiter — in plain language. https://causeandcounsel.in/rsvp/judgments'
      },
      {
        title: 'Labour Law for Gig Workers — Open Clinic',
        start: at(48, 18, 30), end: at(48, 20, 0),
        location: 'Online (Zoom)',
        description: 'An open clinic on the rights of gig and platform workers under Indian labour codes. Bring your questions.'
      },
      /* --- past --- */
      {
        title: 'Launch Conversation: Why Legal Literacy?',
        start: at(-12, 18, 0), end: at(-12, 19, 30),
        location: 'JGLS, Sonipat',
        description: 'Our founding conversation on demystifying the law — and the case for student-led legal education.'
      },
      {
        title: 'Consumer Rights in the Age of E-Commerce',
        start: at(-26, 17, 0), end: at(-26, 18, 30),
        location: 'Online (Zoom)',
        description: 'Refunds, returns, and the Consumer Protection Act, 2019 — what every online shopper should know.'
      },
      {
        title: 'Constitution Day: Fundamental Rights 101',
        start: at(-44, 11, 0), end: at(-44, 12, 30),
        location: 'Delhi Public Library',
        description: 'A beginner-friendly primer on Part III of the Constitution, delivered for Constitution Day.'
      }
    ];
  }

  /* ---- Normalise a Google Calendar API item to our shape ---- */
  function normalize(items) {
    return (items || []).map(function (it) {
      var startRaw = it.start && (it.start.dateTime || it.start.date);
      var endRaw   = it.end && (it.end.dateTime || it.end.date);
      var allDay   = !!(it.start && it.start.date && !it.start.dateTime);
      return {
        title: it.summary || 'Untitled event',
        start: startRaw ? new Date(startRaw) : null,
        end: endRaw ? new Date(endRaw) : null,
        allDay: allDay,
        location: it.location || '',
        description: it.description || ''
      };
    }).filter(function (e) { return e.start; });
  }

  /* ---- Fetch ---- */
  function fetchEvents() {
    return loadConfig().then(function (cfg) {
      var CALENDAR_ID = cfg.calendarId || '';
      var API_KEY     = cfg.apiKey     || '';
      if (!CALENDAR_ID || !API_KEY) {
        // Not configured — show realistic sample events.
        return new Promise(function (resolve) { setTimeout(function () { resolve(mockEvents()); }, 650); });
      }
      LIVE = true;
      // Wide window so we can show both upcoming and recent past events.
      var timeMin = new Date(); timeMin.setMonth(timeMin.getMonth() - 6);
      var url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) +
        '/events?key=' + encodeURIComponent(API_KEY) +
        '&timeMin=' + encodeURIComponent(timeMin.toISOString()) +
        '&orderBy=startTime&singleEvents=true&maxResults=50';
      return fetch(url)
        .then(function (r) { if (!r.ok) throw new Error('Calendar API ' + r.status); return r.json(); })
        .then(function (data) { return normalize(data.items); });
    });
  }

  /* ---- Helpers ---- */
  var MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var WKD = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function fmtTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    var ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return h + (m ? ':' + pad(m) : '') + ' ' + ap;
  }
  function timeRange(e) {
    if (e.allDay) return 'All day';
    var s = fmtTime(e.start);
    return e.end ? s + ' – ' + fmtTime(e.end) : s;
  }
  function extractUrl(text) {
    var m = (text || '').match(/https?:\/\/[^\s)<]+/);
    return m ? m[0] : null;
  }
  function cleanDesc(text, url) {
    var t = (text || '').replace(/RSVP:?\s*/i, '');
    if (url) t = t.replace(url, '');
    t = t.replace(/<[^>]+>/g, '').trim();
    return t.replace(/\s{2,}/g, ' ');
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }

  function isOnline(loc) { return /online|zoom|meet|youtube|webinar|virtual/i.test(loc || ''); }

  /* ---- Render one card ---- */
  function cardHTML(e) {
    var d = e.start;
    var url = extractUrl(e.description);
    var desc = cleanDesc(e.description, url);
    var online = isOnline(e.location);
    var locLabel = e.location || (online ? 'Online' : 'Venue TBA');
    var tag = online
      ? '<span class="event-tag online">✦ Online</span>'
      : '<span class="event-tag">✦ In person</span>';
    var rsvp = url
      ? '<a href="' + esc(url) + '" target="_blank" rel="noopener" class="link-read">RSVP / Details →</a>'
      : '<a href="contact.html" class="link-read">Ask about this →</a>';
    return '' +
      '<div class="card card-accent event-card fade-in">' +
        '<div class="event-date">' +
          '<div class="d-day">' + pad(d.getDate()) + '</div>' +
          '<div class="d-mon">' + MONTHS[d.getMonth()] + '</div>' +
          '<div class="d-wk">' + WKD[d.getDay()] + '</div>' +
          '<div class="d-yr">' + d.getFullYear() + '</div>' +
        '</div>' +
        '<div class="event-main">' +
          tag +
          '<h3>' + esc(e.title) + '</h3>' +
          '<div class="event-meta">' +
            '<span><span class="ic">◷</span>' + timeRange(e) + '</span>' +
            '<span><span class="ic">⟁</span>' + esc(locLabel) + '</span>' +
          '</div>' +
          (desc ? '<p class="event-desc">' + esc(desc) + '</p>' : '') +
          rsvp +
        '</div>' +
      '</div>';
  }

  /* ---- Reveal helper (mirror main.js so injected cards animate) ---- */
  function revealInjected(container) {
    var els = container.querySelectorAll('.fade-in');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add('visible'); }); }, 2600);
  }

  /* ---- Orchestrate ---- */
  function render(events) {
    var skeleton = document.getElementById('events-skeleton');
    var upcomingEl = document.getElementById('events-upcoming');
    var emptyEl = document.getElementById('events-empty');
    var pastSection = document.getElementById('past-section');
    var pastEl = document.getElementById('events-past');
    var pastCount = document.getElementById('past-count');
    var source = document.getElementById('data-source');

    var now = new Date();
    var upcoming = events.filter(function (e) { return (e.end || e.start) >= now; })
                         .sort(function (a, b) { return a.start - b.start; });
    var past = events.filter(function (e) { return (e.end || e.start) < now; })
                     .sort(function (a, b) { return b.start - a.start; });

    if (skeleton) skeleton.remove();

    if (upcoming.length) {
      upcomingEl.innerHTML = upcoming.map(cardHTML).join('');
      upcomingEl.hidden = false;
      revealInjected(upcomingEl);
    } else {
      emptyEl.hidden = false;
    }

    if (past.length) {
      pastEl.innerHTML = past.map(cardHTML).join('');
      pastEl.querySelectorAll('.fade-in').forEach(function (el) { el.classList.add('visible'); });
      pastCount.textContent = '(' + past.length + ')';
      pastSection.hidden = false;
    }

    if (source && !LIVE) {
      source.textContent = 'Showing sample events — set GCAL_CALENDAR_ID + GCAL_API_KEY env vars to go live.';
    }
  }

  function fail() {
    var skeleton = document.getElementById('events-skeleton');
    var emptyEl = document.getElementById('events-empty');
    var source = document.getElementById('data-source');
    if (skeleton) skeleton.remove();
    if (emptyEl) {
      emptyEl.hidden = false;
      emptyEl.querySelector('h3').textContent = 'Couldn’t load events';
      emptyEl.querySelector('p').textContent = 'We had trouble reaching the calendar. Please refresh, or check back shortly.';
    }
    if (source) source.textContent = 'Calendar temporarily unavailable.';
  }

  /* ---- Past toggle ---- */
  function initPastToggle() {
    var btn = document.getElementById('past-toggle');
    var wrap = document.getElementById('past-wrap');
    if (!btn || !wrap) return;
    btn.addEventListener('click', function () {
      var open = wrap.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initPastToggle();
    fetchEvents().then(render).catch(fail);
  });
})();
