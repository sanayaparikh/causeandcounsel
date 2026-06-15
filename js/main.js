/* ============================================================
   CAUSE & COUNSEL — main.js
   Theme toggle · Scroll reveals · Mobile nav · Tabs · Toast
   · EmailJS form sending
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Theme toggle ----------
     The chosen theme is applied before paint by a tiny inline script in
     each page's <head> (reads localStorage 'cc-theme'). Here we inject the
     toggle button into the nav and wire persistence. Dark is the default. */
  function initTheme() {
    var SUN = '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>';
    var MOON = '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    var cta = document.querySelector('.nav-cta');
    if (!cta) return;
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle light or dark theme');
    btn.innerHTML = SUN + MOON;
    cta.insertBefore(btn, cta.firstChild);
    btn.addEventListener('click', function () {
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      var next = isLight ? 'dark' : 'light';
      if (next === 'light') document.documentElement.setAttribute('data-theme', 'light');
      else document.documentElement.removeAttribute('data-theme');
      try { localStorage.setItem('cc-theme', next); } catch (e) {}
    });
  }

  /* ---------- Tabs ----------
     [data-tabs] wraps a tab bar (.tab[data-tab]) and panels
     (.tab-panel[data-tab-panel]). A tab may declare data-tab-alias="x y"
     so URL hashes (#submit, #join) open the right panel. */
  function initTabs() {
    var groups = [];
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var tabs = [].slice.call(group.querySelectorAll('.tab'));
      var panels = [].slice.call(group.querySelectorAll('.tab-panel'));
      function activate(name) {
        if (!name || !tabs.some(function (t) { return t.getAttribute('data-tab') === name; })) return;
        tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-tab') === name); });
        panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-tab-panel') === name); });
      }
      function fromHash(hash) {
        var match = tabs.filter(function (t) {
          return t.getAttribute('data-tab') === hash || (t.getAttribute('data-tab-alias') || '').split(' ').indexOf(hash) > -1;
        })[0];
        if (match) activate(match.getAttribute('data-tab'));
      }
      tabs.forEach(function (t) { t.addEventListener('click', function () { activate(t.getAttribute('data-tab')); }); });
      groups.push(fromHash);
      var h = (location.hash || '').replace('#', '');
      if (h) fromHash(h);
    });
    if (groups.length) {
      window.addEventListener('hashchange', function () {
        var h = (location.hash || '').replace('#', '');
        groups.forEach(function (fn) { fn(h); });
      });
    }
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.fade-in');
    var revealAll = function () { els.forEach(function (el) { el.classList.add('visible'); }); };
    if (!('IntersectionObserver' in window) || !els.length) {
      revealAll();
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
    // Failsafe: never leave content permanently hidden (offscreen iframes,
    // print, or an observer that never fires).
    setTimeout(revealAll, 2600);
  }

  /* ---------- Hero entrance ---------- */
  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    // setTimeout (not rAF) so it still fires when the iframe is backgrounded.
    setTimeout(function () { hero.classList.add('in'); }, 80);
  }

  /* ---------- Mobile nav drawer ---------- */
  function initNav() {
    var burger = document.querySelector('.nav-burger');
    if (!burger) return;
    burger.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    document.querySelectorAll('.nav-drawer a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('nav-open');
    });
  }

  /* ---------- Toast ---------- */
  var toastWrap;
  function toast(msg, ms) {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'toast-wrap';
      document.body.appendChild(toastWrap);
    }
    var t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = '<span class="tk">✦</span><span>' + msg + '</span>';
    toastWrap.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('show'); });
    setTimeout(function () {
      t.classList.remove('show');
      setTimeout(function () { t.remove(); }, 400);
    }, ms || 3800);
  }
  window.CC = window.CC || {};
  window.CC.toast = toast;

  /* ---------- Form handling ----------
     Forms send real email via EmailJS (https://www.emailjs.com). The site
     composes the subject + a formatted body in JavaScript and sends it
     through ONE universal template, so all four forms work on the free
     tier (which allows only 2 templates). The template only needs three
     variables: {{subject}}, {{message}}, {{reply_to}}. See
     EMAILJS-TEMPLATES.md for the exact template to paste.

     The three EmailJS keys are NOT hardcoded — they're read from the host's
     environment variables and served to the browser by /api/config (set
     EMAILJS_PUBLIC_KEY / EMAILJS_SERVICE_ID / EMAILJS_TEMPLATE_ID in Vercel).
     Until those are set, forms run in DEMO mode: validate + success toast,
     no email sent — so the design is fully usable in preview. */
  var EMAILJS = { publicKey: '', serviceId: '', templateId: '' };

  // Fetch public client config (EmailJS keys) from the serverless endpoint
  // once, and reuse the in-flight promise for any caller.
  var configPromise = null;
  function loadConfig() {
    if (configPromise) return configPromise;
    configPromise = fetch('/api/config', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (c) {
        if (c && c.emailjs) {
          EMAILJS.publicKey  = c.emailjs.publicKey  || '';
          EMAILJS.serviceId  = c.emailjs.serviceId  || '';
          EMAILJS.templateId = c.emailjs.templateId || '';
        }
      })
      .catch(function () { /* stay in demo mode */ });
    return configPromise;
  }

  var emailjsInited = false;
  function emailjsReady() {
    return !!window.emailjs &&
      !!EMAILJS.publicKey && !!EMAILJS.serviceId && !!EMAILJS.templateId;
  }
  function ensureEmailjsInit() {
    if (emailjsReady() && !emailjsInited) {
      window.emailjs.init({ publicKey: EMAILJS.publicKey });
      emailjsInited = true;
    }
  }

  // Turn a field name like "first_name" into a label "First name".
  function prettyLabel(name) {
    var s = name.replace(/[_-]+/g, ' ').trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Build { subject, message, reply_to, from_name } from a form's fields.
  function composeEmail(form) {
    var formName = form.getAttribute('data-cc-label') || 'Website form';
    var data = new FormData(form);
    var lines = [];
    var email = '', primaryName = '';
    data.forEach(function (value, key) {
      var v = (value == null ? '' : String(value)).trim();
      if (!v) return;
      if (!email && /email/i.test(key)) email = v;
      if (!primaryName && /^(name|first_name)$/i.test(key)) primaryName = v;
      // Checkboxes report 'on' by default — make that readable.
      if (v === 'on') v = 'Yes';
      lines.push(prettyLabel(key) + ': ' + v);
    });
    var subject = formName + (primaryName ? ' — ' + primaryName : '');
    var message = 'New "' + formName + '" submission from the Cause & Counsel website.\n\n' +
      lines.join('\n') + '\n\n— Sent automatically from causeandcounsel.in';
    return { subject: subject, message: message, reply_to: email || 'no-reply@causeandcounsel.in', from_name: primaryName || 'Cause & Counsel Website', form_name: formName };
  }

  function initForms() {
    document.querySelectorAll('form[data-cc-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('[type="submit"]');
        var label = btn ? btn.textContent : '';
        var success = form.getAttribute('data-cc-success') || 'Thank you — your message has been received.';
        var finish = function (ok) {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          if (ok) { form.reset(); toast(success); }
          else { toast('Something went wrong. Please try again, or email contact@causeandcounsel.in directly.'); }
        };
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        // Make sure config has arrived before choosing live-vs-demo.
        loadConfig().then(function () {
          if (emailjsReady()) {
            ensureEmailjsInit();
            window.emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, composeEmail(form))
              .then(function () { finish(true); })
              .catch(function () { finish(false); });
          } else {
            // Demo mode — no EmailJS keys configured in env yet
            setTimeout(function () { finish(true); }, 700);
          }
        });
      });
    });
  }

  /* ---------- Year stamp ---------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Nav scroll state ---------- */
  function initNavScroll() {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initTabs();
    initReveal();
    initHero();
    initNav();
    initForms();
    initYear();
    initNavScroll();
    loadConfig(); // warm the config cache so the first form submit is instant
  });
})();
