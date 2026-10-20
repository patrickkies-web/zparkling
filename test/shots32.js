/* v32: two-step setup, the next-steps page, the locked start, the golden demo banner, the pass page. node test/shots32.js [W] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const W = +(process.argv[2] || 375), OUT = path.join(__dirname, 'v32-' + W); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch(); const errors = [], notes = [];
  const mk = async () => { const p = await (await browser.newContext({ viewport: { width: W, height: 812 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html')); return p; };
  const ev = (p, c) => p.evaluate(c => window.__ev(c), c);
  const at = (p, t) => p.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t);
  const full = async (p, name) => { await p.waitForTimeout(300); const h = await p.evaluate(() => { const b = document.querySelector('.body'); return (b ? b.scrollHeight : 700) + (document.querySelector('.head') ? document.querySelector('.head').offsetHeight : 0) + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + 60; });
    await p.setViewportSize({ width: W, height: Math.max(812, Math.min(3600, h)) }); await p.waitForTimeout(250); await p.screenshot({ path: path.join(OUT, name + '.png') }); await p.setViewportSize({ width: W, height: 812 }); };
  const wide = async (p, name) => { const o = await p.evaluate(W => { const out = []; document.querySelectorAll('#app *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1) && !el.closest('.t-conf, .gl-rays, .fx, .qx-jump, .av-cats, .kick-rays, .pv, svg, .hero, .wl-card, .ob-card, .t-final')) out.push(el.tagName + '.' + (typeof el.className === 'string' ? el.className : '') + ' ' + Math.round(r.left) + '-' + Math.round(r.right)); }); return out.slice(0, 5); }, W); if (o.length) errors.push(name + ': sticks out ' + o.join(' | ')); };

  /* 1. a new party, two steps */
  let p = await mk();
  await ev(p, 'A.newEvent()'); await full(p, '01-step1'); await wide(p, 'step1');
  await p.tap('[data-act="setupNext"]'); await full(p, '02-step2');
  await ev(p, "E().focus.push({ id: 'f1', name: 'Lena', anlass: 'sockenkranz', count: 25, av: avRandom() }); render();");
  await p.tap('[data-act="setupNext"]');
  for (const t of [100, 450, 800, 1150, 1500, 2200]) { await at(p, t); await p.screenshot({ path: path.join(OUT, '03-done-' + String(t).padStart(4, '0') + '.png') }); }
  await p.evaluate(() => document.getAnimations().forEach(a => a.play())); await p.waitForTimeout(2200); await full(p, '04-done-full'); await wide(p, 'done');
  await p.tap('[data-act="setupFinish"]'); await p.waitForTimeout(1200); await full(p, '05-home-locked'); await wide(p, 'home-locked');
  await p.tap('.play'); await p.waitForTimeout(250); await p.screenshot({ path: path.join(OUT, '06-home-nudge.png') });
  const toast = await ev(p, "UI.toast + '|' + UI.screen + '|' + !!R()"); if (!/Stell zuerst/.test(toast) || /\|true$/.test(toast)) errors.push('locked start: ' + toast); else notes.push('locked start says: ' + toast.split('|')[0]);
  await p.tap('.setbar'); await p.waitForTimeout(300); await p.tap('[data-act="cfgNext"]'); await p.tap('[data-act="cfgNext"]'); await full(p, '07-step3');
  await p.tap('[data-act="cfgSave"]');
  for (const t of [100, 400, 900, 1500, 2200]) { await at(p, t); await p.screenshot({ path: path.join(OUT, '08-ready-' + String(t).padStart(4, '0') + '.png') }); }
  await p.evaluate(() => document.getAnimations().forEach(a => a.play())); await p.waitForTimeout(500); await full(p, '09-home-ready');
  await p.tap('.play.ready', { force: true }); await p.waitForTimeout(400);
  const scr = await ev(p, 'UI.screen'); notes.push('ready start without pass goes to: ' + scr);
  await p.close();

  /* 2. the example evening: the banner everywhere */
  p = await mk();
  await ev(p, "A.loadDemo();"); await p.waitForTimeout(800); await p.screenshot({ path: path.join(OUT, '20-demo-home.png') }); await wide(p, 'demo-home');
  for (const [code, name] of [["go('games')", '21-demo-games'], ["go('questions')", '22-demo-questions'], ["A.openRun()", '23-demo-setup'], ["UI.cfgStep = 3; A.cfgSave(); A.heroGo(); kickClose();", '24-demo-run'], ["var r = R(); snapshot('task'); r.pending = makeGameStep(r.who[0], { focus: [r.who[0]], together: r.together, variant: r.variant, themes: themesOf(r.who) }, 'zwiebel', 'solo'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; go('step');", '25-demo-step']]) {
    await ev(p, code); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, name + '.png') });
    const has = await ev(p, "!!document.querySelector('.demobar')"); if (!has) errors.push('no demo banner on ' + name);
  }
  await p.tap('.demobar', { force: true }); await p.waitForTimeout(500);
  if ((await ev(p, 'UI.screen')) !== 'pass') errors.push('the demo banner does not lead to the pass');
  await ev(p, "UI.passDate = new Date(Date.now() + 9 * 86400000).toISOString().slice(0, 10); render();");
  await p.waitForTimeout(1500); await p.screenshot({ path: path.join(OUT, '30-pass-top.png') });
  await full(p, '31-pass-full'); await wide(p, 'pass');
  await ev(p, "var b = document.querySelector('.body'); var h = document.querySelector('.p-plans'); b.scrollTop = h.offsetTop - 120;"); await p.waitForTimeout(300);
  for (const t of [300, 900, 1500]) { await p.waitForTimeout(600); await p.screenshot({ path: path.join(OUT, '32-plans-' + t + '.png') }); }
  await p.close();
  await browser.close(); console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
