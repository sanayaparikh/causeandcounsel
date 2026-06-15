/* ============================================================
   CAUSE & COUNSEL — Notion CMS proxy  (Vercel / Netlify function)
   Route: /api/posts

   WHY THIS EXISTS
   The Notion Integration Token must NEVER ship in front-end JS.
   This serverless function holds the secret, calls Notion, filters
   for Published posts, and returns clean JSON the browser can render.

   DEPLOY
   - Vercel:  place this file at /api/posts.js → it's served at /api/posts
   - Netlify: rename to netlify/functions/posts.js and set
              publish redirects, or keep the path via netlify.toml.

   ENV VARS (set in your host dashboard — do NOT hardcode):
     NOTION_TOKEN  = secret_xxx   (Notion integration secret)
     NOTION_DB_ID  = xxxxxxxx     (the blog database id from its URL)

   Single post:  /api/posts?slug=companies-act-2013-founders-guide
   Listing:      /api/posts
   ============================================================ */

const NOTION_TOKEN = process.env.NOTION_TOKEN || 'PLACEHOLDER_NOTION_TOKEN';
const NOTION_DB_ID = process.env.NOTION_DB_ID || 'PLACEHOLDER_NOTION_DB_ID';
const NOTION_VERSION = '2022-06-28';

/* ---- Property readers (defensive against missing fields) ---- */
function rich(arr) { return (arr || []).map(t => t.plain_text).join(''); }
function readProp(props, name, type) {
  const p = props[name];
  if (!p) return '';
  switch (type || p.type) {
    case 'title':       return rich(p.title);
    case 'rich_text':   return rich(p.rich_text);
    case 'select':      return p.select ? p.select.name : '';
    case 'date':        return p.date ? p.date.start : '';
    case 'checkbox':    return !!p.checkbox;
    default:            return '';
  }
}

function mapPage(page) {
  const p = page.properties || {};
  return {
    id: page.id,
    title:    readProp(p, 'Title', 'title'),
    slug:     readProp(p, 'Slug', 'rich_text'),
    author:   readProp(p, 'Author', 'rich_text'),
    date:     readProp(p, 'Date', 'date'),
    category: readProp(p, 'Category', 'select'),
    excerpt:  readProp(p, 'Excerpt', 'rich_text'),
    readTime: readProp(p, 'Read Time', 'rich_text'),
    featured: readProp(p, 'Featured', 'checkbox'),
    status:   readProp(p, 'Status', 'select')
  };
}

/* ---- Query the database for published posts ---- */
async function queryDatabase() {
  const res = await fetch(`https://api.notion.com/v1/databases/${NOTION_DB_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: { property: 'Status', select: { equals: 'Published' } },
      sorts: [{ property: 'Date', direction: 'descending' }]
    })
  });
  if (!res.ok) throw new Error(`Notion query failed: ${res.status}`);
  const data = await res.json();
  return (data.results || []).map(mapPage);
}

/* ---- Fetch the block children for a single post (the article body) ---- */
async function fetchBlocks(blockId) {
  let blocks = [];
  let cursor;
  do {
    const url = new URL(`https://api.notion.com/v1/blocks/${blockId}/children`);
    url.searchParams.set('page_size', '100');
    if (cursor) url.searchParams.set('start_cursor', cursor);
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${NOTION_TOKEN}`, 'Notion-Version': NOTION_VERSION }
    });
    if (!res.ok) throw new Error(`Notion blocks failed: ${res.status}`);
    const data = await res.json();
    blocks = blocks.concat(data.results || []);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);
  return blocks;
}

/* ---- Handler (Vercel signature; Netlify wrapper at bottom) ---- */
module.exports = async function handler(req, res) {
  // CORS — restrict origin to your domain in production.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');

  if (/PLACEHOLDER/.test(NOTION_TOKEN) || /PLACEHOLDER/.test(NOTION_DB_ID)) {
    res.statusCode = 501;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'not_configured',
      message: 'Set NOTION_TOKEN and NOTION_DB_ID env vars to enable the live blog. The site falls back to sample posts until then.'
    }));
    return;
  }

  try {
    const slug = req.query ? req.query.slug : new URL(req.url, 'http://x').searchParams.get('slug');
    const posts = await queryDatabase();

    if (slug) {
      const post = posts.find(p => p.slug === slug);
      if (!post) { res.statusCode = 404; res.end(JSON.stringify({ error: 'not_found' })); return; }
      const blocks = await fetchBlocks(post.id);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ post, blocks }));
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ posts }));
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'server_error', message: String(err.message || err) }));
  }
};

/* ---- Netlify Functions adapter (uncomment if deploying to Netlify) ----
exports.handler = async (event) => {
  const slug = event.queryStringParameters && event.queryStringParameters.slug;
  // ... call queryDatabase()/fetchBlocks() and return { statusCode, body }
};
*/
