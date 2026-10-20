/* the website as it is served: node test/site.js (serves public/ on a local port) */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const http = require('http'), fs = require('fs'), path = require('path');
const PUB = path.join(__dirname, '..', 'public'), OUT = path.join(__dirname, 'site'); fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let f = decodeURIComponent(q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; const p = path.join(PUB, f);
  if (!p.startsWith(PUB) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
srv.listen(0, async () => {
  const base = 'http://127.0.0.1:' + srv.address().port + '/', errors = [], notes = [], miss = [];
  const browser = await chromium.launch();
  const mk = async () => { const p = await (await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on('pageerror', e => errors.push(e.message)); p.on('response', r => { if (r.status() >= 400) miss.push(r.status() + ' ' + r.url()); }); return p; };
  /* 1. a first visit: tour, title, icons, manifest */
  let p = await mk(); await p.goto(base); await p.waitForTimeout(1500);
  notes.push('title: ' + await p.title());
  const head = await p.evaluate(() => ({ icon: !!document.querySelector('link[rel=icon]'), touch: !!document.querySelector('link[rel=apple-touch-icon]'), man: !!document.querySelector('link[rel=manifest]'), lang: document.documentElement.lang, bg: getComputedStyle(document.body).backgroundColor }));
  notes.push('head: ' + JSON.stringify(head));
  for (const f of ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'manifest.webmanifest']) { const r = await p.request.get(base + f); if (r.status() !== 200) errors.push(f + ' ' + r.status()); }
  await p.screenshot({ path: path.join(OUT, '01-first-visit.png') });
  const brand = await p.evaluate(() => document.body.innerText.indexOf('zparkling') >= 0 && document.body.innerText.toLowerCase().indexOf('alte socke') < 0);
  if (!brand) errors.push('the tour does not say zparkling'); else notes.push('tour shows zparkling');
  /* 2. the example evening: invite link points here, no KI */
  await p.evaluate(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); }); await p.reload(); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, '02-welcome.png') });
  const demoBtn = await p.$('.lp-hero [data-act="openDemoPick"]'); if (demoBtn) { await demoBtn.tap(); await p.waitForTimeout(900); await p.tap('.dp-tk-top[data-v="socken"]', { force: true }); await p.waitForTimeout(600); await p.tap('.dp-tk.on .dp-go', { force: true }); await p.waitForTimeout(1200); } else errors.push('no example evening button');
  await p.screenshot({ path: path.join(OUT, '03-home.png') });
  const fr = await p.$('[data-act="go"][data-to="questions"]'); if (fr) { await fr.tap(); await p.waitForTimeout(1200); }
  const q = await p.evaluate(() => ({ ki: !!document.getElementById('qs-ki'), chip: [...document.querySelectorAll('.qx-jb')].map(b => b.textContent).join(','), link: (document.body.innerHTML.match(/https?:\/\/[^"'<\s]*#gast-fragen/) || [''])[0] }));
  notes.push('questions page: ' + JSON.stringify(q));
  if (q.ki || /KI/.test(q.chip)) errors.push('KI still on the website');
  if (q.link !== base + '#gast-fragen') errors.push('invite link is ' + q.link);
  await p.evaluate(() => { const l = document.getElementById('qs-link'); if (l) l.scrollIntoView(); }); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, '04-invite.png') });
  await p.close();
  /* 3. a guest opens the link on another phone */
  p = await mk(); await p.goto(base + '#gast-fragen'); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(OUT, '05-guest-letter.png') });
  const go = await p.$('.wl-go'); if (go) { await go.tap({ force: true }); await p.waitForTimeout(1800); } else errors.push('no invitation button for the guest');
  await p.screenshot({ path: path.join(OUT, '06-guest-form.png') });
  const gtext = await p.evaluate(() => document.body.innerText);
  if (/\bKI\b/.test(gtext)) errors.push('guest form mentions the KI');
  await p.close();
  await browser.close(); srv.close();
  console.log(notes.join('\n')); if (miss.length) console.log('HTTP misses:\n' + [...new Set(miss)].join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
});
