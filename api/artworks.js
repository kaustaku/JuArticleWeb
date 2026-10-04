import { put, list } from '@vercel/blob';
const OK = ['image/jpeg','image/png','image/webp','image/gif'];
const clean = s => String(s||'').trim().slice(0,80);
export default async function handler(req, res) {
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return req.method === 'GET' ? res.json([]) : res.status(503).json({ error: 'Uploads are not set up yet. Connect a Vercel Blob store.' });
  try {
    if (req.method === 'GET') {
      const { blobs } = await list({ prefix: 'art-meta/' });
      const items = (await Promise.all(blobs.map(b => fetch(b.url).then(r => r.json()).catch(() => null)))).filter(Boolean);
      items.sort((a, b) => b.createdAt - a.createdAt);
      res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
      return res.json(items);
    }
    if (req.method === 'POST') {
      const type = req.headers['content-type'], size = +req.headers['content-length'] || 0;
      const title = clean(req.query.title), by = clean(req.query.by);
      if (!OK.includes(type)) return res.status(400).json({ error: 'Upload a JPG, PNG, WebP or GIF image.' });
      if (size > 4e6) return res.status(413).json({ error: 'Image is over 4 MB.' });
      if (!title || !by) return res.status(400).json({ error: 'Add a title and your name.' });
      const id = Date.now().toString(36);
      const img = await put(`art/${id}`, req, { access: 'public', contentType: type, addRandomSuffix: true });
      const meta = { id, title, by, src: img.url, createdAt: Date.now() };
      await put(`art-meta/${id}.json`, JSON.stringify(meta), { access: 'public', contentType: 'application/json', addRandomSuffix: true });
      return res.status(201).json(meta);
    }
    res.status(405).end();
  } catch (e) { res.status(500).json({ error: 'Something went wrong. Try again.' }); }
}
