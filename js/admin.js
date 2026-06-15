/* ============================================================
   CAUSE & COUNSEL — admin.js
   Passphrase-only gate (no user accounts). The passphrase is hashed
   client-side with SHA-256 and compared to STORED_HASH. On success a
   session token lives in sessionStorage (clears when the tab closes).

   CHANGE THE PASSPHRASE
   1. Run in any browser console:
        const h = async p => Array.from(new Uint8Array(
          await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p))
        )).map(b=>b.toString(16).padStart(2,'0')).join('');
        await h('your-new-passphrase');
   2. Paste the result into STORED_HASH below.

   Default passphrase (demo): "counsel2025" — change before launch.

   NOTE: client-side gating deters casual access only. No sensitive
   data lives on the site itself (forms go to Formspree/email). For
   real auth later, swap this for Supabase magic-link — the dashboard
   markup stays the same.
   ============================================================ */
(function () {
  'use strict';

  var STORED_HASH = 'f4de3220ee176d66342c5a708dd60e648478b4e672ec447776a7d3b0bc2dfcfb'; // sha256('counsel2025')
  var SESSION_KEY = 'cc_admin_session';

  /* ---- Mock dashboard data (real data comes from Formspree API / Google Sheet) ---- */
  var DATA = {
    articles: [
      { title: 'The right to be forgotten in Indian data law', author: 'Ishaan Verma', category: 'Constitutional Law', date: '2026-06-13' },
      { title: 'Understanding anticipatory bail', author: 'Meera Nair', category: 'Criminal Law', date: '2026-06-11' },
      { title: 'GST for freelancers, simplified', author: 'Rohan Das', category: 'Corporate & Startup', date: '2026-06-09' },
      { title: 'Maternity benefits under Indian law', author: 'Priya Khanna', category: 'Labour Law', date: '2026-06-05' }
    ],
    joins: [
      { name: 'Ananya Iyer', role: 'Research Lead', institution: 'NLSIU Bengaluru', date: '2026-06-12' },
      { name: 'Vivaan Gupta', role: 'Design & Social', institution: 'NALSAR Hyderabad', date: '2026-06-10' },
      { name: 'Saira Bhat', role: 'Events & Seminars', institution: 'GNLU Gandhinagar', date: '2026-06-08' }
    ],
    subs: [
      { name: 'Neha Kapoor', email: 'neha.k@example.com', interest: 'Know Your Rights', date: '2026-06-14' },
      { name: 'Arjun Sethi', email: 'arjun.sethi@example.com', interest: 'Corporate & Startup', date: '2026-06-13' },
      { name: 'Tara Menon', email: 'tara.menon@example.com', interest: 'Constitutional Law', date: '2026-06-12' },
      { name: 'Dev Malhotra', email: 'dev.m@example.com', interest: 'Workshops & Events', date: '2026-06-11' },
      { name: 'Riya Joshi', email: 'riya.joshi@example.com', interest: 'Criminal Law', date: '2026-06-10' }
    ],
    subsTotal: 248
  };

  var PAGES = [
    { name: 'Home', file: 'index.html' },
    { name: 'Events', file: 'events.html' },
    { name: 'Blog', file: 'blog.html' },
    { name: 'About', file: 'about.html' },
    { name: 'Contact', file: 'contact.html' }
  ];

  /* ---- Crypto ---- */
  function sha256(str) {
    var data = new TextEncoder().encode(str);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function fmt(iso) { var d = new Date(iso); return isNaN(d) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }

  /* ---- Views ---- */
  function showDashboard() {
    document.getElementById('lock').style.display = 'none';
    document.getElementById('dash').classList.add('show');
    populate();
  }

  function isAuthed() {
    try { return sessionStorage.getItem(SESSION_KEY) === STORED_HASH; } catch (e) { return false; }
  }

  /* ---- Populate dashboard ---- */
  function populate() {
    document.getElementById('stat-subs').textContent = DATA.subsTotal;
    document.getElementById('stat-articles').textContent = DATA.articles.length;
    document.getElementById('stat-joins').textContent = DATA.joins.length;

    document.getElementById('count-articles').textContent = DATA.articles.length + ' pending';
    document.getElementById('count-joins').textContent = DATA.joins.length + ' pending';
    document.getElementById('count-subs').textContent = DATA.subsTotal + ' total';

    document.getElementById('tbl-articles').innerHTML = DATA.articles.map(function (a) {
      return '<tr><td>' + esc(a.title) + '</td><td><span class="muted">' + esc(a.author) + '</span></td>' +
        '<td><span class="mono">' + esc(a.category) + '</span></td><td><span class="mono">' + fmt(a.date) + '</span></td>' +
        '<td><span class="pill review">Review</span></td></tr>';
    }).join('');

    document.getElementById('tbl-joins').innerHTML = DATA.joins.map(function (j) {
      return '<tr><td>' + esc(j.name) + '</td><td><span class="mono">' + esc(j.role) + '</span></td>' +
        '<td><span class="muted">' + esc(j.institution) + '</span></td><td><span class="mono">' + fmt(j.date) + '</span></td>' +
        '<td><span class="pill pending">Pending</span></td></tr>';
    }).join('');

    document.getElementById('tbl-subs').innerHTML = DATA.subs.map(function (s) {
      return '<tr><td>' + esc(s.name) + '</td><td><span class="mono">' + esc(s.email) + '</span></td>' +
        '<td><span class="muted">' + esc(s.interest) + '</span></td><td><span class="mono">' + fmt(s.date) + '</span></td></tr>';
    }).join('');

    var origin = location.href.replace(/admin\.html.*$/, '');
    document.getElementById('copy-list').innerHTML = PAGES.map(function (p) {
      var url = origin + p.file;
      return '<div class="copy-row"><span class="cr-name">' + esc(p.name) + '</span>' +
        '<span class="cr-url">' + esc(url) + '</span>' +
        '<button type="button" data-url="' + esc(url) + '">Copy</button></div>';
    }).join('');
    document.getElementById('copy-list').addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-url]');
      if (!btn) return;
      var url = btn.getAttribute('data-url');
      var done = function () { var t = btn.textContent; btn.textContent = 'Copied ✦'; setTimeout(function () { btn.textContent = t; }, 1400); };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(done).catch(done); else done();
    });

    document.getElementById('demo-note').textContent =
      '✦ Submission tables show sample data. Wire them to the Formspree API (or an embedded Google Sheet) to display live entries. Newsletter, article, and join submissions all flow through Formspree.';
  }

  /* ---- Auth flow ---- */
  function initLock() {
    var form = document.getElementById('lock-form');
    var input = document.getElementById('passphrase');
    var errEl = document.getElementById('lock-error');
    var card = document.getElementById('lock-card');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      sha256(input.value.trim()).then(function (hash) {
        if (hash === STORED_HASH) {
          try { sessionStorage.setItem(SESSION_KEY, STORED_HASH); } catch (err) {}
          showDashboard();
        } else {
          errEl.classList.add('show');
          card.classList.remove('lock-shake');
          void card.offsetWidth;
          card.classList.add('lock-shake');
          input.value = '';
          input.focus();
        }
      });
    });

    input.addEventListener('input', function () { errEl.classList.remove('show'); });
  }

  function initSignout() {
    document.getElementById('signout').addEventListener('click', function () {
      try { sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
      location.reload();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLock();
    initSignout();
    if (isAuthed()) showDashboard();
    else document.getElementById('passphrase').focus();
  });
})();
