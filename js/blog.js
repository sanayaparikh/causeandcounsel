/* ============================================================
   CAUSE & COUNSEL — blog.js
   Fetches /api/posts (the Notion proxy). When the proxy isn't
   configured (501) or unreachable, falls back to CC_MOCK so the
   listing renders in preview. Category filter + Load More are
   client-side over the loaded set.
   ============================================================ */
(function () {
  'use strict';

  var PAGE_SIZE = 9;
  var state = { all: [], filtered: [], shown: 0, category: 'All', live: false };

  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  /* ---- Load posts: try the live proxy, else mock ---- */
  function loadPosts() {
    return fetch('/api/posts', { headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('proxy ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data.posts || !data.posts.length) throw new Error('empty');
        state.live = true;
        return data.posts;
      })
      .catch(function () {
        state.live = false;
        return (window.CC_MOCK && window.CC_MOCK.posts) ? window.CC_MOCK.posts.slice() : [];
      });
  }

  /* ---- Templates ---- */
  function featuredHTML(p) {
    return '' +
      '<a class="feature fade-in" href="blog-post.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="feature-img"><span class="badge">Featured</span><span class="ph">Article image</span></div>' +
        '<div class="feature-body">' +
          '<span class="cat">' + esc(p.category) + '</span>' +
          '<h2>' + esc(p.title) + '</h2>' +
          '<p>' + esc(p.excerpt) + '</p>' +
          '<div class="feature-meta"><span>' + esc(p.author) + '</span><span>·</span><span>' + fmtDate(p.date) + '</span><span>·</span><span>' + esc(p.readTime) + '</span></div>' +
          '<span class="link-read">Read article →</span>' +
        '</div>' +
      '</a>';
  }

  function cardHTML(p) {
    return '' +
      '<a class="card card-accent post-card fade-in" href="blog-post.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<span class="cat">' + esc(p.category) + '</span>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.excerpt) + '</p>' +
        '<div class="meta"><span>' + esc(p.author) + '</span><span>·</span><span>' + fmtDate(p.date) + '</span><span>·</span><span>' + esc(p.readTime) + '</span></div>' +
      '</a>';
  }

  function revealIn(scope) {
    (scope || document).querySelectorAll('.fade-in:not(.visible)').forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---- Render ---- */
  function applyFilter() {
    var cat = state.category;
    // Featured only shows under "All"
    var featured = state.all.find(function (p) { return p.featured; });
    var pool = state.all.filter(function (p) {
      if (cat !== 'All' && p.category !== cat) return false;
      if (cat === 'All' && featured && p.slug === featured.slug) return false; // don't duplicate the featured card
      return true;
    });
    state.filtered = pool;
    state.shown = 0;

    var featuredSlot = document.getElementById('featured-slot');
    if (cat === 'All' && featured) {
      featuredSlot.innerHTML = featuredHTML(featured);
      featuredSlot.hidden = false;
    } else {
      featuredSlot.innerHTML = '';
      featuredSlot.hidden = true;
    }

    document.getElementById('post-grid').innerHTML = '';
    renderMore();

    document.getElementById('no-results').hidden = pool.length > 0 || (cat === 'All' && featured);
    revealIn(featuredSlot);
  }

  function renderMore() {
    var grid = document.getElementById('post-grid');
    grid.hidden = false;
    var next = state.filtered.slice(state.shown, state.shown + PAGE_SIZE);
    grid.insertAdjacentHTML('beforeend', next.map(cardHTML).join(''));
    state.shown += next.length;
    revealIn(grid);
    var wrap = document.getElementById('load-more-wrap');
    wrap.hidden = state.shown >= state.filtered.length;
  }

  /* ---- Wire up ---- */
  function initFilters() {
    document.getElementById('filter-bar').addEventListener('click', function (e) {
      var btn = e.target.closest('.filter-pill');
      if (!btn) return;
      document.querySelectorAll('.filter-pill').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.category = btn.getAttribute('data-cat');
      applyFilter();
    });
    document.getElementById('load-more').addEventListener('click', renderMore);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFilters();
    loadPosts().then(function (posts) {
      state.all = posts.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
      var sk = document.getElementById('blog-skeleton');
      if (sk) sk.remove();
      var src = document.getElementById('data-source');
      if (src) src.textContent = state.live
        ? 'Posts publish live from Notion.'
        : 'Showing sample posts — connect the Notion proxy (/api/posts) to go live.';
      applyFilter();
    });
  });
})();
