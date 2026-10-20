/* the guest invitation: the letter, the invitation, the doors. node test/shotswl.js [W] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const W = +(process.argv[2] || 375), OUT = path.join(__dirname, 'wl-' + W); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch(); const errors = [], notes = [];
  const mk = async (hash) => { const p = await (await browser.newContext({ viewport: { width: W, height: 812 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html') + (hash || '')); return p; };
  const ev = (p, c) => p.evaluate(c => window.__ev(c), c);
  const at = (p, t) => p.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t);
  let p = await mk();
  await ev(p, "A.loadDemo(); lsSet(PASS_KEY, { days: 14, event: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10), bought: Date.now(), changes: 0, test: true }); A.openGuestForm();");
  for (const t of [80, 350, 700, 950, 1100, 1250, 1450, 1650, 1900, 2200, 2600, 3200]) { await at(p, t); await p.screenshot({ path: path.join(OUT, 'a-' + String(t).padStart(4, '0') + '.png') }); }
  await p.evaluate(() => document.getAnimations().forEach(a => a.play())); await p.waitForTimeout(3500);
  const h = await p.evaluate(() => { const b = document.querySelector('.body'); return b.scrollHeight + 200; });
  await p.setViewportSize({ width: W, height: Math.max(812, h) }); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'b-full.png') }); await p.setViewportSize({ width: W, height: 812 });
  const wide = await p.evaluate(W => { const o = []; document.querySelectorAll('.wl *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && r.right > W + 1 && !el.closest('svg')) o.push(el.className); }); return o.slice(0, 4); }, W);
  if (wide.length) errors.push('sticks out: ' + wide.join(' | '));
  await p.tap('[data-act="gWelcome"]');
  for (const t of [60, 200, 380, 600, 900, 1200]) { await at(p, t); await p.screenshot({ path: path.join(OUT, 'c-' + String(t).padStart(4, '0') + '.png') }); }
  await p.evaluate(() => document.getAnimations().forEach(a => a.play())); await p.waitForTimeout(1800);
  const ok = await ev(p, "!document.querySelector('.wl-doors') && !!document.getElementById('qAuthor') && gPass().welcomed");
  if (!ok) errors.push('after the doors the form is not there'); else notes.push('doors gone, form ready');
  await p.screenshot({ path: path.join(OUT, 'd-form.png') });
  await p.close();
  /* the real link, twice */
  p = await mk();
  await ev(p, 'A.loadDemo();'); await p.close();
  await browser.close(); console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
