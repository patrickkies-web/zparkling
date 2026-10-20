/* the landing page as served, on a laptop and a phone: node test/landing.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const http = require('http'), fs = require('fs'), path = require('path');
const PUB = path.join(__dirname, '..', 'public'), OUT = path.join(__dirname, 'landing'); fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let f = decodeURIComponent(q.url.split('?')[0]); if (f.endsWith('/')) f += 'index.html'; const p = path.join(PUB, f);
  if (!p.startsWith(PUB) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); });
srv.listen(0, async () => {
  const base = 'http://127.0.0.1:' + srv.address().port + '/', errors = [], notes = [];
  const browser = await chromium.launch();
  for (const [name, w, h] of [['laptop', 1280, 800], ['tablet', 820, 1180], ['phone', 390, 844]]) {
    const p = await (await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: name === 'laptop' ? 1 : 2, hasTouch: name !== 'laptop' })).newPage();
    p.on('pageerror', e => errors.push(name + ': ' + e.message));
    await p.goto(base); await p.waitForTimeout(3800);
    await p.screenshot({ path: path.join(OUT, name + '-fold.png') });
    const H = await p.evaluate(() => document.querySelector('.body').scrollHeight);
    const over = await p.evaluate(() => { const b = document.querySelector('.body'); return b.scrollWidth - b.clientWidth; });
    if (over > 0) errors.push(name + ': sideways scroll ' + over + 'px');
    await p.setViewportSize({ width: w, height: Math.min(H, 9000) }); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, name + '-full.png') });
    notes.push(name + ' page height ' + H);
    await p.close();
  }
  /* Intro starten leads into the intro, an occasion into the example evening */
  const p = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage();
  p.on('pageerror', e => errors.push('flow: ' + e.message));
  await p.goto(base); await p.waitForTimeout(600);
  await p.tap('.lp-top [data-act="lpIntro"]'); await p.waitForTimeout(700);
  const s1 = await p.evaluate(() => document.querySelector('.scr').className);
  if (!/tourscr/.test(s1)) errors.push('intro button opened ' + s1); else notes.push('Intro starten opens the intro');
  await p.goto(base); await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.lp-occs .dp-tk-top[data-v="jga"]').scrollIntoView());
  await p.tap('.lp-occs .dp-tk-top[data-v="jga"]'); await p.waitForTimeout(800);
  const s2 = await p.evaluate(() => (document.querySelector('.demobar') ? 'demo ' : '') + document.body.innerText.slice(0, 400).replace(/\s+/g, ' '));
  notes.push('JGA tile: ' + s2.slice(0, 160));
  await browser.close(); srv.close();
  console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
});
