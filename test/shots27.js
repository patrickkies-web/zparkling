/* v27: the charge in place, the pack flying out of the button, nothing jumping underneath,
   the tug inside the screen, put back counts down, the level-up emblem. node test/shots27.js [W] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const W = +(process.argv[2] || 375);
const OUT = path.join(__dirname, 'v27-' + W);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const errors = [], notes = [];
  const mk = async () => {
    const ctx = await browser.newContext({ viewport: { width: W, height: 812 }, deviceScaleFactor: 2, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); } catch (e) {} });
    await page.goto('file://' + path.join(__dirname, 'debug.html'));
    return page;
  };
  const ev = (page, code) => page.evaluate(c => window.__ev(c), code);
  const snap = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
  const at = async (page, t) => { await page.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t); await ev(page, 'gkFxSeek(' + t + ')'); };
  const rect = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) }; }, sel);
  const fill = "A.loadDemo(); A.openGuestForm(); gPass().welcomed = true; UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen'; gRender();";

  /* 1. the tug stays inside the screen */
  let p = await mk();
  await ev(p, fill.replace("it.interest = 'Kochen'; ", ''));
  await p.waitForTimeout(2600);
  await p.focus('#qInt_0'); await p.keyboard.type('Kochen'); await ev(p, 'document.activeElement.blur()');
  await p.waitForFunction(() => { const b = document.getElementById('gdraw'); return b && b.classList.contains('tug'); }, null, { timeout: 8000 });
  await at(p, 0);
  let worst = 0;
  for (const t of [0, 160, 250, 330, 460, 540, 680, 770, 830, 980, 1150, 1320]) {
    await at(p, t);
    const r = await rect(p, '#gdraw'), n = await rect(p, '#gdrawN');
    worst = Math.max(worst, r.r - W, n.r - W, -r.l);
    if (t % 2 === 0 && [250, 540, 770, 980].indexOf(t) >= 0) await snap(p, '01-tug-' + String(t).padStart(4, '0'));
  }
  if (worst > 0) errors.push('the tug leaves the screen by ' + worst + 'px');
  else notes.push('tug: stays ' + (-worst) + 'px inside the screen');
  await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); })');
  await p.waitForTimeout(1800); await snap(p, '02-button');
  const n0 = await rect(p, '#gdrawN'), b0 = await rect(p, '#gdraw');
  if (!(n0.r <= b0.r - 8)) errors.push('2× chip too close to the edge: ' + JSON.stringify([n0, b0]));
  await p.close();

  /* 2. the charge, frame by frame (class set by hand, so the clock does not run away) */
  p = await mk();
  await ev(p, fill); await p.waitForTimeout(3600);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(300);
  const cta0 = await rect(p, '#gcta'), btn0 = await rect(p, '#gdraw');
  await ev(p, "document.getElementById('gdraw').classList.add('charge')");
  for (const t of [100, 300, 500, 700]) {
    await at(p, t); await snap(p, '10-charge-' + String(t).padStart(4, '0'));
    const b = await rect(p, '#gdraw'), c = await rect(p, '#gcta');
    if (b.t < cta0.b) errors.push('charge at ' + t + ': the button reaches over Abschicken (' + b.t + ' < ' + cta0.b + ')');
    if (b.r > W || b.l < 0) errors.push('charge at ' + t + ': the button leaves the screen');
    if (JSON.stringify(c) !== JSON.stringify(cta0)) errors.push('charge at ' + t + ': Abschicken moved');
  }
  /* 3. the handoff: the overlay goes on top, the pack starts in the button */
  await at(p, 740);
  await ev(p, "document.getElementById('gcta').__mark = 1; (function(){ var _p = gkPickType; gkPickType = function(){ return { type: 'wenn', n: 0 }; }; gkOpen(); gkPickType = _p; })()");
  const same = await ev(p, "document.getElementById('gcta').__mark === 1");
  if (!same) errors.push('the page was rendered again under the overlay');
  for (const t of [0, 60, 140, 240, 380, 560, 820, 1300]) {
    await at(p, t); await snap(p, '20-handoff-' + String(t).padStart(4, '0'));
    if (t === 0) {
      const pk = await rect(p, '.gk-pack'), mini = btn0;
      const cx = (pk.l + pk.r) / 2, cy = (pk.t + pk.b) / 2;
      notes.push('pack at t=0: center ' + cx.toFixed(0) + ',' + cy.toFixed(0) + ' size ' + (pk.r - pk.l) + 'x' + (pk.b - pk.t) + ' | button ' + mini.l + '-' + mini.r + ' / ' + mini.t + '-' + mini.b);
      if (!(cy > mini.t - 20 && cy < mini.b + 20 && cx < mini.l + 80)) errors.push('the pack does not start in the button');
    }
    const c = await rect(p, '#gcta');
    if (JSON.stringify(c) !== JSON.stringify(cta0)) errors.push('handoff at ' + t + ': Abschicken moved ' + JSON.stringify([cta0, c]));
  }
  const n1 = await ev(p, "document.getElementById('gdrawN').textContent");
  if (n1 !== '1×') errors.push('counter after the draw: ' + n1);
  await p.close();

  /* 4. the real tap, start to finish, then put back */
  p = await mk();
  await ev(p, fill); await p.waitForTimeout(3600);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(300);
  const ctaA = await rect(p, '#gcta');
  await ev(p, "window.__moves = 0; var c0 = document.getElementById('gcta').getBoundingClientRect().top; (function loop(){ var c = document.getElementById('gcta'); if (c && Math.abs(c.getBoundingClientRect().top - c0) > 0.5) window.__moves++; if (!document.querySelector('.gk-ov .gk-panel') || performance.now() < 99999) { if (window.__moving !== false) requestAnimationFrame(loop); } })();");
  await p.tap('#gdraw');
  for (let k = 0; k < 14; k++) { await p.screenshot({ path: path.join(OUT, '25-real-' + String(k).padStart(2, '0') + '.png'), scale: 'css' }); }
  await p.waitForTimeout(300);
  const moves = await ev(p, 'window.__moving = false; window.__moves');
  if (moves) errors.push('Abschicken moved during the opening (' + moves + ' frames)');
  else notes.push('Abschicken stood still from the tap until the overlay was up');
  await p.waitForTimeout(4800);
  await snap(p, '30-card-open');
  await p.tap('.gk-later'); await p.waitForTimeout(900);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(300);
  await snap(p, '31-put-back');
  const after = await ev(p, "(document.getElementById('gdrawN')||{}).textContent + '|' + (document.getElementById('gdrawSub')||{}).textContent + '|' + document.getElementById('gdrawWrap').className");
  if (!/^1×\|Deine letzte Bonuskarte\|.*\bon\b/.test(after)) errors.push('after put back: ' + after);
  else notes.push('after put back: ' + after);
  /* the last card, put back too: the button goes */
  await p.tap('#gdraw'); await p.waitForTimeout(5800);
  await p.tap('.gk-later'); await p.waitForTimeout(900);
  const gone = await ev(p, "!document.getElementById('gdraw')");
  if (!gone) errors.push('button still there after both cards were put back');
  await snap(p, '32-both-put-back');
  await p.close();

  /* 5. the level-up */
  p = await mk();
  await ev(p, fill); await p.waitForTimeout(400);
  await ev(p, "gPass().lvMax = 0; gPass().ptsMax = 0; UI.gPts = 0; document.activeElement && document.activeElement.blur && document.activeElement.blur(); gPassFx(true)"); await p.waitForTimeout(900);
  const e = await page_emb(p);
  await snap(p, '40-levelup');
  if (!e.ok) errors.push('level-up emblem: ' + JSON.stringify(e)); else notes.push('level-up emblem ' + JSON.stringify(e));
  await p.close();

  await browser.close();
  console.log(notes.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
async function page_emb(p) {
  return p.evaluate(() => {
    document.querySelectorAll('.ghfx, .ghfx *').forEach(el => el.getAnimations().forEach(a => { try { a.pause(); a.currentTime = 900; } catch (e) {} }));
    const fx = document.querySelector('.ghfx'), box = fx && fx.querySelector('.ghfx-e'), svg = box && box.querySelector('svg'), hud = document.getElementById('gpass');
    if (!box || !svg) return { ok: false, why: 'missing' };
    if (document.querySelector('.glvlup')) return { ok: false, why: 'fullscreen overlay still there' };
    const b = box.getBoundingClientRect(), s = svg.getBoundingClientRect(), h = hud.getBoundingClientRect(), f = fx.getBoundingClientRect();
    return { ok: s.left >= b.left - 1 && s.right <= b.right + 1 && s.top >= b.top - 1 && s.bottom <= b.bottom + 1 && f.top >= h.top - 12 && f.bottom <= h.bottom + 12, box: Math.round(b.width) + 'x' + Math.round(b.height), svg: Math.round(s.width) + 'x' + Math.round(s.height), fx: Math.round(f.height) + ' in hud ' + Math.round(h.height) };
  });
}
