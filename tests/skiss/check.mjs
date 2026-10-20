// Testsvit för skiss-sidan. Kör: node tests/skiss/check.mjs
// Startar en egen server som beter sig som GitHub Pages (404.html för saknade filer),
// mockar n8n-webhooken med tests/skiss/fixtures.json och blockerar externa resurser.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FIX = JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/skiss/fixtures.json'), 'utf8'));
const TYPES = { frisor: 'Frisör', barberare: 'Barbershop', nagel: 'Nagelstudio', lash: 'Fransstudio', skonhet: 'Skönhetssalong', hudvard: 'Hudvård', massage: 'Massage', tatuering: 'Tatueringsstudio', fotvard: 'Fotvård', bryn: 'Brynstudio' };
const LABEL_OVERRIDE = { 'art-of-hair-norrkoping': 'Frisör' };
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = http.createServer((q, r) => {
  let f = path.join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (fs.existsSync(f) && fs.statSync(f).isFile()) { r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); return fs.createReadStream(f).pipe(r); }
  r.writeHead(404, { 'content-type': MIME['.html'] }); fs.createReadStream(path.join(ROOT, '404.html')).pipe(r);
});
await new Promise(res => server.listen(0, res));
const BASE = 'http://localhost:' + server.address().port;

const results = [];
const ok = (name, w, cond, why) => { results.push((cond ? 'PASS ' : 'FAIL ') + name + ' ' + w + (cond ? '' : ': ' + why)); };

const browser = await chromium.launch();
async function open(url, w) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 500 ? 844 : 860 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(m.text()); });
  p.on('dialog', d => { errors.push('dialog: ' + d.message()); d.dismiss(); });
  await p.route(/^https?:\/\/(?!localhost)/, r => {
    const u = r.request().url();
    if (u.startsWith('https://mystiq.app.n8n.cloud/')) {
      const slug = new URL(u).searchParams.get('slug');
      return r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(FIX[slug] || { hittad: false }) });
    }
    if (u.startsWith('https://images.unsplash.com/')) return r.fulfill({ status: 200, contentType: 'image/gif', body: PIXEL });
    return r.abort();
  });
  await p.goto(BASE + url, { waitUntil: 'load' });
  await p.waitForTimeout(600);
  return { p, ctx, errors };
}

const widths = [390, 1366];
for (const slug of Object.keys(FIX)) for (const w of widths) {
  const d = FIX[slug], c = d.innehall;
  const { p, ctx, errors } = await open('/skiss/' + slug, w);
  const s = await p.evaluate(() => {
    const vis = el => !!el && !el.closest('[hidden]') && el.getClientRects().length > 0;
    const ld = document.querySelector('script[type="application/ld+json"]');
    let ldObj = null; try { ldObj = ld && JSON.parse(ld.textContent); } catch (e) { ldObj = 'PARSEFEL'; }
    return {
      sw: document.documentElement.scrollWidth, iw: innerWidth,
      h1: document.querySelector('h1')?.textContent.trim(),
      title: document.title,
      tagline: document.getElementById('hero-tagline')?.textContent.trim(),
      services: document.querySelectorAll('#services .service').length,
      prices: [...document.querySelectorAll('#services .service__price')].map(e => e.textContent.trim()).filter(Boolean),
      trust: vis(document.getElementById('trust')),
      trustItems: document.querySelectorAll('#trust-list li').length,
      hours: [...document.querySelectorAll('.hours div')].filter(vis).length,
      priceNote: vis(document.getElementById('price-note')),
      steps: vis(document.getElementById('besok')),
      book: [...document.querySelectorAll('[data-book]')].map(a => [a.getAttribute('href'), a.getAttribute('target')]),
      faq: [...document.querySelectorAll('#faq details')].filter(vis).map(e => e.querySelector('summary').textContent.trim()),
      faqEmpty: [...document.querySelectorAll('#faq details')].filter(vis).some(e => !e.querySelector('p')?.textContent.trim()),
      ld: ldObj,
      jsLinks: document.querySelectorAll('a[href^="javascript:"]').length,
      injected: document.querySelectorAll('main img[src="x"], main b, main i, main script:not([type])').length,
      notesHidden: [...document.querySelectorAll('.note')].every(n => !vis(n)),
      noteCount: document.querySelectorAll('.note').length,
      fromSite: vis(document.getElementById('from-site')),
    };
  });
  const label = LABEL_OVERRIDE[slug] || TYPES[d.typ] || 'Salong';
  ok(slug, w, s.sw <= s.iw, 'sidledsscroll ' + s.sw);
  ok(slug, w, errors.length === 0, 'fel: ' + errors.join(' | '));
  ok(slug, w, s.h1 === d.namn, 'h1 "' + s.h1 + '"');
  const wantTitle = d.namn + ' – ' + label + (d.stad ? ' i ' + d.stad : '');
  if (slug !== 'test-hostile') ok(slug, w, s.title === wantTitle, 'title "' + s.title + '" ≠ "' + wantTitle + '"');
  ok(slug, w, s.jsLinks === 0, 'javascript:-länk finns');
  ok(slug, w, s.injected === 0, 'element skapade ur data');
  ok(slug, w, s.ld && s.ld !== 'PARSEFEL' && s.ld.name === d.namn, 'JSON-LD saknas/fel');
  ok(slug, w, s.notesHidden && s.noteCount > 0, 'anteckningar syns från början eller saknas');
  const hasBook = c && /^https:\/\//.test(c.bokningslank || '');
  const validTel = (d.telefon || '').replace(/[^\d+]/g, '').length >= 6;
  for (const [href, target] of s.book) {
    const good = hasBook ? (href === c.bokningslank && target === '_blank') : validTel ? href.startsWith('tel:') : href.endsWith('#hitta');
    ok(slug, w, good, 'bokningsknapp ' + href);
  }
  ok(slug, w, s.book.length >= 2, 'för få boka-knappar');
  ok(slug, w, !s.faqEmpty, 'fråga utan svar');
  if (c) {
    const tag = c.tagline && !/[<>]/.test(c.tagline) ? c.tagline : null;
    if (tag) ok(slug, w, s.tagline === tag, 'tagline "' + s.tagline + '"');
    const real = c.tjanster.filter(t => t.namn).length;
    if (real) ok(slug, w, s.services === Math.min(10, real), 'tjänster ' + s.services);
    if (real) ok(slug, w, s.prices.every(pr => c.tjanster.some(t => t.pris && pr.includes(t.pris.replace(/<[^>]*>/g, '')) || t.pris === pr)), 'pris som inte finns i data: ' + s.prices.join(','));
    ok(slug, w, s.trust === (c.fordelar.length > 0), 'trygghet synlig=' + s.trust);
    if (c.fordelar.length) ok(slug, w, s.trustItems === Math.min(4, c.fordelar.length), 'fördelar ' + s.trustItems);
    ok(slug, w, s.hours === Math.min(7, c.oppettider.length), 'tider ' + s.hours);
    ok(slug, w, s.fromSite, 'raden "Texterna kommer från er nuvarande sida" saknas');
    ok(slug, w, !s.steps, '"Så går ett besök till" ska inte visas med innehåll');
  } else {
    ok(slug, w, s.hours === 0, 'påhittade öppettider');
    ok(slug, w, s.priceNote, 'exempelpris-raden saknas');
    ok(slug, w, s.steps, '"Så går ett besök till" saknas');
    ok(slug, w, !s.fromSite, 'raden om nuvarande sida ska inte visas');
  }
  if (d.adress && !/[<>]/.test(d.adress)) ok(slug, w, s.faq.includes('Var ligger ni?'), 'FAQ adress saknas');

  // Anteckningar slås på med knappen
  const t = await p.$('#notes-toggle');
  if (t) {
    await t.click();
    const on = await p.evaluate(() => ({ pressed: document.getElementById('notes-toggle').getAttribute('aria-pressed'), shown: [...document.querySelectorAll('.note')].some(n => n.getClientRects().length > 0) }));
    ok(slug, w, on.pressed === 'true' && on.shown, 'anteckningar slås inte på');
  } else ok(slug, w, false, '#notes-toggle saknas');
  await ctx.close();
}

// Reservvarianten för alla tio typer
for (const typ of Object.keys(TYPES)) for (const w of widths) {
  const { p, ctx, errors } = await open('/skiss/?n=Test&s=Ume%C3%A5&t=' + typ, w);
  const s = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, title: document.title, hours: document.querySelectorAll('.hours div').length }));
  ok('typ-' + typ, w, s.sw <= s.iw && errors.length === 0, 'sw ' + s.sw + ' fel ' + errors.join('|'));
  ok('typ-' + typ, w, s.title === 'Test – ' + TYPES[typ] + ' i Umeå', 'title ' + s.title);
  ok('typ-' + typ, w, s.hours === 0, 'påhittade öppettider');
  await ctx.close();
}

await browser.close();
server.close();
const fails = results.filter(r => r.startsWith('FAIL'));
console.log(fails.join('\n'));
console.log(`${results.length - fails.length}/${results.length} PASS`);
process.exit(fails.length ? 1 : 0);
