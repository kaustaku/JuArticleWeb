export const SITE = {
  name: 'Fringe',
  tagline: 'Articles and art from the JU Physics batch.',
  // Comments use Giscus (GitHub Discussions). Fill these in after setup; see README.
  giscus: { repo: '', repoId: '', category: 'Announcements', categoryId: '' }
};
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function chrome(active){
  document.title = document.title ? `${document.title} · ${SITE.name}` : SITE.name;
  document.body.insertAdjacentHTML('afterbegin', `<header class="site"><div class="wrap">
    <a class="brand" href="/">${SITE.name}</a><nav>
    <a href="/" ${active==='articles'?'aria-current="page"':''}>Articles</a>
    <a href="/gallery.html" ${active==='art'?'aria-current="page"':''}>Gallery</a></nav></div></header>`);
  document.body.insertAdjacentHTML('beforeend', `<footer><div class="wrap">${SITE.name}, by the JU Physics batch.</div></footer>`);
}
export async function getArticles(){
  const a = await (await fetch('/data/articles.json')).json();
  return a.sort((x,y)=>y.date.localeCompare(x.date));
}
export const fmtDate = d => new Date(d).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
export function articleItem(a){
  return `<a class="item" href="/article.html?slug=${encodeURIComponent(a.slug)}"><h3>${esc(a.title)}</h3>
  <div class="meta">${esc(a.author)}, ${fmtDate(a.date)}</div><p>${esc(a.summary)}</p></a>`;
}
export async function getArt(){
  try{ const r = await fetch('/api/artworks'); return r.ok ? await r.json() : []; }catch{ return []; }
}
export function artFigure(w){
  return `<figure data-src="${esc(w.src)}"><img loading="lazy" src="${esc(w.src)}" alt="${esc(w.title)} by ${esc(w.by)}">
  <figcaption>${esc(w.title)} <span>by ${esc(w.by)}</span></figcaption></figure>`;
}
export function lightbox(container){
  const d = document.createElement('dialog'); d.innerHTML='<img alt="">'; document.body.append(d);
  d.addEventListener('click',()=>d.close());
  container.addEventListener('click',e=>{const f=e.target.closest('figure'); if(f){d.firstChild.src=f.dataset.src; d.showModal();}});
}
export function comments(term){
  const g = SITE.giscus, box = document.getElementById('comments');
  if(!g.repo){ box.innerHTML='<p class="empty">Comments will appear here once Giscus is set up (see README).</p>'; return; }
  const s = document.createElement('script');
  Object.entries({src:'https://giscus.app/client.js','data-repo':g.repo,'data-repo-id':g.repoId,'data-category':g.category,
   'data-category-id':g.categoryId,'data-mapping':'specific','data-term':term,'data-reactions-enabled':'1',
   'data-input-position':'top','data-theme':'preferred_color_scheme','data-lang':'en',crossorigin:'anonymous'})
   .forEach(([k,v])=>s.setAttribute(k,v));
  s.async = true; box.append(s);
}
