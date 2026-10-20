/* screenshots of the bonus cards: the pack opening frame by frame, every card, the party rounds.
   node test/shotscards.js [outdir] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, process.argv[2] || 'cards');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const mk = async (hash) => {
    const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
    page.on('pageerror', e => errors.push((page.__name || '') + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|ERR_NAME|net::/.test(m.text())) errors.push((page.__name || '') + ' console: ' + m.text()); });
    await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} });
    await page.goto('file://' + path.join(__dirname, 'debug.html') + (hash || ''));
    return page;
  };
  const ev = (page, code) => page.evaluate(c => window.__ev(c), code);
  const snap = async (page, name) => { page.__name = name; await page.screenshot({ path: path.join(OUT, name + '.png') }); };
  const shot = async (page, name, opt) => {
    page.__name = name;
    await page.waitForTimeout((opt && opt.wait) || 450);
    if (opt && opt.full) {
      const h = await page.evaluate(() => { const b = document.querySelector('.body'); return b ? b.scrollHeight + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + 140 : 860; });
      await page.setViewportSize({ width: 400, height: Math.max(860, Math.min(3400, h)) });
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.setViewportSize({ width: 400, height: 860 });
  };
  /* freeze every running animation at time t (ms since it started) */
  const at = (page, t) => page.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t);
  const force = (type, n) => "(function(){ var _p = gkPickType; gkPickType = function(){ return { type: '" + type + "', n: " + n + " }; }; gkOpen(); gkPickType = _p; })()";
  const fillForm = "UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen'; gRender();";

  /* 1. the hidden button slides out under Abschicken */
  let p = await mk();
  await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;');
  await ev(p, "UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; gRender();");
  await shot(p, '01-before-ready', { wait: 900 });
  await ev(p, "var it = gForm().items[0]; it.interest = 'Kochen'; gLive(0);");
  for (const t of [80, 250, 450, 900]) { await at(p, t); await snap(p, '02-button-pop-' + t); }
  await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); })');
  await p.waitForTimeout(1200);
  await snap(p, '03-button-idle');
  /* the charge: the button shakes and swells */
  await ev(p, "var b = document.getElementById('gdraw'), w = document.getElementById('gdrawWrap'); w.classList.add('charging'); b.classList.remove('pop'); b.classList.add('charge');");
  for (const t of [200, 450, 620]) { await at(p, t); await snap(p, '04-charge-' + t); }
  await p.close();

  /* 2. the pack opening, frame by frame (legendary) */
  p = await mk();
  await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;'); await ev(p, fillForm);
  await p.waitForTimeout(300);
  await ev(p, force('wenn', 0));
  const frames = [0, 250, 600, 900, 1200, 1440, 1540, 1640, 1800, 2000, 2250, 2420, 2600, 2800, 2950, 3200, 3700];
  for (const t of frames) { await at(p, t); await snap(p, '10-open-' + String(t).padStart(4, '0')); }
  await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); })');
  await p.waitForTimeout(4200);
  await snap(p, '11-wenn-leg-final');
  await p.type('#gkin', 'Faultier');
  await snap(p, '12-wenn-typed');
  await ev(p, 'A.gkDone()');
  await p.waitForTimeout(300); await snap(p, '13-redeem-away');
  await p.waitForTimeout(900);
  await shot(p, '14-form-with-card', { full: true, wait: 300 });
  /* the second card: the button comes back with the last draw */
  await p.waitForTimeout(300);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999");
  await snap(p, '15-second-button');
  await ev(p, force('umfrage', 2));
  await p.waitForTimeout(4200);
  await snap(p, '16-umfrage-epi');
  await p.type('#gkin', 'Kaugummi');
  await ev(p, 'A.gkDone()'); await p.waitForTimeout(1300);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999");
  await snap(p, '17-no-more-cards');
  await ev(p, 'A.gSubmit()'); await p.waitForTimeout(1200);
  await shot(p, '18-finale', { full: true });
  await ev(p, 'A.gFlip()'); await p.waitForTimeout(1200); await snap(p, '19-finale-back');
  await p.close();

  /* 3. the other cards, final state */
  for (const [type, n, name] of [['spruch', 6, '20-spruch-sel'], ['umfrage', 0, '21-umfrage-leg'], ['portrait', 1, '22-portrait-epi'], ['wenn', 5, '23-wenn-sel']]) {
    p = await mk();
    await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;'); await ev(p, fillForm);
    await p.waitForTimeout(200);
    await ev(p, force(type, n));
    await p.waitForTimeout(4300);
    await snap(p, name);
    if (type === 'portrait') {
      await ev(p, 'A.gkStart()'); await p.waitForTimeout(400);
      await snap(p, '24-portrait-draw-empty');
      const box = await p.locator('#gkcv').boundingBox();
      const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; pts.push([0.5 + Math.cos(a) * 0.3, 0.52 + Math.sin(a) * 0.34]); }
      const stroke = async (list) => { await p.mouse.move(box.x + list[0][0] * box.width, box.y + list[0][1] * box.height); await p.mouse.down(); for (const q of list.slice(1)) await p.mouse.move(box.x + q[0] * box.width, box.y + q[1] * box.height, { steps: 2 }); await p.mouse.up(); };
      await stroke(pts);
      await stroke([[0.4, 0.45], [0.41, 0.46]]); await stroke([[0.6, 0.45], [0.61, 0.46]]);
      await ev(p, 'A.gkPen({ v: 1 })');
      const sm = []; for (let i = 0; i <= 12; i++) { const u = i / 12; sm.push([0.38 + u * 0.24, 0.62 + Math.sin(u * Math.PI) * 0.08]); }
      await stroke(sm);
      await ev(p, 'A.gkPen({ v: 2 })');
      const hair = []; for (let i = 0; i <= 10; i++) hair.push([0.25 + i * 0.05, i % 2 ? 0.12 : 0.2]);
      await stroke(hair);
      await snap(p, '25-portrait-drawing');
      await ev(p, 'UI.gk.t0 = Date.now() - 16500; gkTick();'); await p.waitForTimeout(150); await snap(p, '26-portrait-hurry');
      await ev(p, 'UI.gk.t0 = Date.now() - 21000; gkTick();'); await p.waitForTimeout(700); await snap(p, '27-portrait-over');
      await ev(p, 'render()'); await p.waitForTimeout(200); await snap(p, '28-portrait-after-rerender');
      await ev(p, 'A.gkDone()'); await p.waitForTimeout(1400);
      await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999");
      await snap(p, '29-portrait-mini');
    }
    await p.close();
  }

  /* 4. link mode: the card limit survives a second visit */
  p = await mk();
  await ev(p, 'A.loadDemo()');
  await p.goto('file://' + path.join(__dirname, 'debug.html') + '#gast-fragen'); await p.reload();
  await ev(p, fillForm); await p.waitForTimeout(200);
  await ev(p, force('spruch', 3)); await p.waitForTimeout(4200);
  await p.type('#gkin', 'Passt scho!'); await ev(p, 'A.gkDone()'); await p.waitForTimeout(800);
  await ev(p, 'A.gSubmit()'); await p.waitForTimeout(600);
  await ev(p, 'A.qAnother()'); await ev(p, "A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E() ? E().focus[0].id : ''; it.trait = 'lieb'; it.interest = 'Tanzen'; gRender();");
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(900);
  await snap(p, '30-link-second-visit');
  const left = await ev(p, 'gkLeft()');
  if (left !== 1) errors.push('link mode: expected 1 card left after one redeemed, got ' + left);
  await p.close();

  /* 5. the party rounds */
  p = await mk();
  await ev(p, 'A.loadDemo()');
  const round = async (id) => ev(p, "(function(){ var _c = ggChoose; ggChoose = function (c) { return c.filter(function (g) { return g.id === '" + id + "'; })[0] || c[0]; }; var st = makeGuestGameStep(E().focus[0].id, null); ggChoose = _c; S.free = { step: st, from: 'games' }; go('free'); return st && st.gg; })()");
  let got = await round('umfrage'); if (got !== 'umfrage') errors.push('no umfrage round: ' + got);
  await shot(p, '40-board', { full: true });
  await ev(p, 'A.gbSpy()'); await shot(p, '41-board-spy', { full: true });
  await ev(p, "A.gbHit({ i: '0' })"); await p.waitForTimeout(120); await snap(p, '42-board-hit-anim');
  await ev(p, 'A.gbMiss()'); await p.waitForTimeout(160); await snap(p, '43-board-bigx');
  await ev(p, "A.gbHit({ i: '2' })"); await ev(p, 'A.gbMiss()'); await ev(p, 'A.gbMiss()');
  await shot(p, '44-board-closed', { full: true, wait: 1000 });
  await ev(p, "A.stepResolve({ v: 'eval' })"); await shot(p, '45-board-result', { full: true, wait: 900 });
  got = await round('sprueche'); if (got !== 'sprueche') errors.push('no sprueche round: ' + got);
  await shot(p, '46-judge-cue', { full: true });
  await ev(p, 'A.gjOpen()'); await shot(p, '47-judge-open', { full: true });
  await ev(p, "A.gjMark({ v: '1' }); A.gjOpen(); A.gjMark({ v: '0' }); A.gjOpen(); A.gjMark({ v: '1' }); A.gjOpen(); A.gjMark({ v: '1' });");
  await shot(p, '48-judge-done', { full: true });
  await ev(p, "A.stepResolve({ v: 'eval' })"); await shot(p, '49-judge-result', { full: true, wait: 900 });
  got = await round('galerie'); if (got !== 'galerie') errors.push('no galerie round: ' + got);
  await shot(p, '50-galerie', { full: true });
  got = await round('waere'); if (got !== 'waere') errors.push('no waere round: ' + got);
  await shot(p, '51-waere', { full: true });
  await ev(p, "var P = stepNow(); P.items.forEach(function (it, k) { A.ggChoose({ k: String(k), i: String(it.correct) }); }); A.stepResolve({ v: 'eval' });");
  await shot(p, '52-waere-result', { full: true, wait: 900 });
  await ev(p, "go('questions')"); await shot(p, '53-master-questions', { full: true });
  await ev(p, "UI.qKind = 'portrait'; UI.qFilter = 'ok'; render();"); await shot(p, '54-master-portraits', { full: true });
  await p.close();

  await browser.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
})();
