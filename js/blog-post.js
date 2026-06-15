/* ============================================================
   CAUSE & COUNSEL — blog-post.js
   Renders a single article. Tries the Notion proxy
   (/api/posts?slug=...), falls back to CC_MOCK. The block renderer
   consumes Notion's real block shape, so it works for both.
   ============================================================ */
(function () {
  'use strict';

  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function esc(s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function slugify(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  /* ---- Rich text → HTML (Notion annotations) ---- */
  function renderRich(arr) {
    return (arr || []).map(function (t) {
      var txt = esc(t.plain_text);
      var a = t.annotations || {};
      if (a.code) txt = '<code>' + txt + '</code>';
      if (a.bold) txt = '<strong>' + txt + '</strong>';
      if (a.italic) txt = '<em>' + txt + '</em>';
      if (a.strikethrough) txt = '<s>' + txt + '</s>';
      if (a.underline) txt = '<u>' + txt + '</u>';
      if (t.href) txt = '<a href="' + esc(t.href) + '">' + txt + '</a>';
      return txt;
    }).join('');
  }
  function plain(arr) { return (arr || []).map(function (t) { return t.plain_text; }).join(''); }

  /* ---- Blocks → HTML, grouping consecutive list items ---- */
  function renderBlocks(blocks) {
    var html = '';
    var headings = [];
    var i = 0;
    while (i < blocks.length) {
      var b = blocks[i];
      var type = b.type;
      var data = b[type] || {};
      if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
        var tag = type === 'bulleted_list_item' ? 'ul' : 'ol';
        html += '<' + tag + '>';
        while (i < blocks.length && blocks[i].type === type) {
          html += '<li>' + renderRich(blocks[i][type].rich_text) + '</li>';
          i++;
        }
        html += '</' + tag + '>';
        continue;
      }
      switch (type) {
        case 'heading_2': {
          var id2 = slugify(plain(data.rich_text));
          headings.push({ id: id2, text: plain(data.rich_text), level: 2 });
          html += '<h2 id="' + id2 + '">' + renderRich(data.rich_text) + '</h2>';
          break;
        }
        case 'heading_3': {
          var id3 = slugify(plain(data.rich_text));
          headings.push({ id: id3, text: plain(data.rich_text), level: 3 });
          html += '<h3 id="' + id3 + '">' + renderRich(data.rich_text) + '</h3>';
          break;
        }
        case 'heading_1':
          html += '<h2 id="' + slugify(plain(data.rich_text)) + '">' + renderRich(data.rich_text) + '</h2>';
          break;
        case 'paragraph':
          html += '<p>' + renderRich(data.rich_text) + '</p>';
          break;
        case 'quote':
          html += '<blockquote>' + renderRich(data.rich_text) + '</blockquote>';
          break;
        case 'callout':
          html += '<blockquote>' + renderRich(data.rich_text) + '</blockquote>';
          break;
        case 'divider':
          html += '<hr />';
          break;
        case 'code':
          html += '<pre><code>' + esc(plain(data.rich_text)) + '</code></pre>';
          break;
        default:
          if (data.rich_text) html += '<p>' + renderRich(data.rich_text) + '</p>';
      }
      i++;
    }
    return { html: html, headings: headings };
  }

  /* ---- Load: live proxy first, then mock ---- */
  function loadArticle(slug) {
    return fetch('/api/posts?slug=' + encodeURIComponent(slug), { headers: { 'Accept': 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('proxy ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data.post) throw new Error('no post');
        return { post: data.post, blocks: data.blocks || [], related: [], live: true };
      })
      .catch(function () {
        var mock = window.CC_MOCK || { posts: [], articles: {} };
        var post = (mock.posts || []).find(function (p) { return p.slug === slug; });
        if (!post) return null;
        var related = (mock.posts || []).filter(function (p) {
          return p.category === post.category && p.slug !== post.slug;
        }).slice(0, 2);
        return { post: post, blocks: mock.articles[slug] || [], related: related, live: false };
      });
  }

  /* ---- TOC ---- */
  function buildTOC(headings) {
    if (!headings.length) return '';
    var items = headings.map(function (h) {
      return '<a href="#' + h.id + '" class="' + (h.level === 3 ? 'h3' : '') + '" data-id="' + h.id + '">' + esc(h.text) + '</a>';
    }).join('');
    return '<nav class="toc"><h4>On this page</h4>' + items + '</nav>';
  }

  function relatedHTML(list) {
    if (!list.length) return '';
    var cards = list.map(function (p) {
      return '<a class="card card-accent post-card" href="blog-post.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<span class="cat">' + esc(p.category) + '</span>' +
        '<h4>' + esc(p.title) + '</h4>' +
        '<p>' + esc(p.excerpt) + '</p></a>';
    }).join('');
    return '<div class="related"><h3>More from Cause &amp; Counsel</h3><div class="related-grid">' + cards + '</div></div>';
  }

  /* ---- Render whole article ---- */
  function render(result) {
    var loading = document.getElementById('article-loading');
    var errorEl = document.getElementById('article-error');
    var article = document.getElementById('article');
    if (loading) loading.remove();

    if (!result) { errorEl.hidden = false; return; }

    var p = result.post;
    document.title = p.title + ' — Cause & Counsel';
    var rendered = renderBlocks(result.blocks);
    var shareUrl = location.href;
    var tw = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(p.title) + '&url=' + encodeURIComponent(shareUrl);
    var li = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl);

    article.innerHTML =
      '<header class="article-head wrap">' +
        '<a href="blog.html" class="link-read" style="margin-bottom:1.5rem;">← All articles</a>' +
        '<div class="cat" style="margin-top:1rem;">' + esc(p.category) + '</div>' +
        '<h1>' + esc(p.title) + '</h1>' +
        '<div class="article-byline"><span>' + esc(p.author) + '</span><span class="dot">✦</span><span>' + fmtDate(p.date) + '</span><span class="dot">✦</span><span>' + esc(p.readTime) + '</span></div>' +
        '<div class="article-rule"></div>' +
      '</header>' +
      '<div class="wrap"><div class="article-layout">' +
        buildTOC(rendered.headings) +
        '<div class="article-body">' + rendered.html +
          '<div class="article-foot">' +
            '<div class="share-row">' +
              '<span class="lbl">Share</span>' +
              '<a class="share-btn" href="' + tw + '" target="_blank" rel="noopener">✦ X / Twitter</a>' +
              '<a class="share-btn" href="' + li + '" target="_blank" rel="noopener">✦ LinkedIn</a>' +
              '<button class="share-btn" id="copy-link" type="button">✦ Copy link</button>' +
            '</div>' +
            relatedHTML(result.related) +
          '</div>' +
        '</div>' +
        '<div></div>' +
      '</div></div>';

    article.hidden = false;

    initCopy();
    initTOCScroll(rendered.headings);

    var src = document.querySelector('#data-source');
    void src;
  }

  function initCopy() {
    var btn = document.getElementById('copy-link');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var done = function () { if (window.CC && CC.toast) CC.toast('Link copied to clipboard.'); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(done).catch(done);
      else done();
    });
  }

  /* ---- TOC active-state on scroll ---- */
  function initTOCScroll(headings) {
    if (!headings.length || !('IntersectionObserver' in window)) return;
    var links = {};
    document.querySelectorAll('.toc a').forEach(function (a) { links[a.getAttribute('data-id')] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); });
          var lk = links[e.target.id];
          if (lk) lk.classList.add('active');
        }
      });
    }, { rootMargin: '-10% 0px -75% 0px' });
    headings.forEach(function (h) { var el = document.getElementById(h.id); if (el) io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var slug = qs('slug');
    if (!slug) {
      // default to the featured/first post so the page is never empty
      var mock = window.CC_MOCK;
      slug = mock && mock.posts && mock.posts.length ? (mock.posts.find(function (p) { return p.featured; }) || mock.posts[0]).slug : null;
    }
    if (!slug) { document.getElementById('article-loading').remove(); document.getElementById('article-error').hidden = false; return; }
    loadArticle(slug).then(render);
  });
})();
