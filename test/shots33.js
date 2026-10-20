/* v33: nothing pops while typing, the pass bar celebrates, the glow, the master's overview, the limited example evening. node test/shots33.js [W] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const W = +(process.argv[2] || 375), OUT = path.join(__dirname, 'v33-' + W); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch(); const errors = [], notes = [];
  const mk = async () => { const p = await (await browser.newContext({ viewport: { width: W, height: 812 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on('pageerror', e => errors.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html')); return p; };
  const ev = (p, c) => p.evaluate(c => window.__ev(c), c);
  const at = (p, t) => p.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t);

  /* 1. the guest types a Steckbrief: nothing flies until the field is left */
  let p = await mk();
  await ev(p, "A.loadDemo(); A.openGuestForm(); gPass().welcomed = true; UI.gForm.author = 'Paula'; A.gAdd({ v: 'steckbrief' }); gRender();");
  await p.waitForTimeout(1500);
  await p.tap('#qYear_0'); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, '01-glow-focus.png') });
  await p.keyboard.type('2010', { delay: 120 });
  await p.waitForTimeout(600);
  const during = await ev(p, "(UI.gHudFx ? UI.gHudFx.kind : '-') + '|' + !!app.querySelector('.glvlup, .gstickpop') + '|' + UI.gPts");
  if (!/^-\|false/.test(during)) errors.push('something popped while typing: ' + during); else notes.push('while typing: nothing (' + during + ')');
  await p.screenshot({ path: path.join(OUT, '02-typing.png') });
  await p.tap('#qBd_0'); await p.waitForTimeout(150);
  const after = await ev(p, "(UI.gHudFx ? UI.gHudFx.kind : '-') + '|' + UI.gPts + '|' + document.activeElement.id");
  notes.push('field left (to the next field): ' + after);
  if (!/^lv\|/.test(after)) errors.push('no level-up in the pass bar after leaving the field: ' + after);
  for (const t of [100, 300, 700, 1300, 2000]) { await at(p, t); await p.screenshot({ path: path.join(OUT, '03-hud-' + String(t).padStart(4, '0') + '.png') }); }
  await p.evaluate(() => document.getAnimations().forEach(a => a.play()));
  await p.waitForTimeout(5000);
  /* a correction: back to the year field, change it, leave */
  await ev(p, "UI.gHudFx = null;");
  await p.tap('#qYear_0'); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace'); await p.keyboard.type('11', { delay: 120 });
  await p.tap('#qBd_0'); await p.waitForTimeout(300);
  const again = await ev(p, "(UI.gHudFx ? UI.gHudFx.kind : '-')");
  if (again !== '-') errors.push('the correction celebrated again: ' + again); else notes.push('correction: no new celebration');
  await ev(p, 'document.activeElement.blur()'); await p.waitForTimeout(500);
  const glow = await ev(p, "app.classList.contains('gglow')"); if (glow) errors.push('glow stays after leaving the card');
  await p.close();

  /* 2. the master's overview */
  p = await mk();
  await ev(p, "A.loadDemo(); go('questions');"); await p.waitForTimeout(1600);
  await p.screenshot({ path: path.join(OUT, '10-overview.png') });
  await p.close();

  /* 3. the example evening with its limits */
  p = await mk();
  await ev(p, "DEMO_LIMITS = true; A.loadDemo();"); await p.waitForTimeout(600);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 560"); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, '20-demo-home.png') });
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 1000"); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, '21-demo-home2.png') });
  await ev(p, "go('games')"); await p.waitForTimeout(400); await ev(p, "(document.querySelector('.body')||{}).scrollTop = 200"); await p.waitForTimeout(200); await p.screenshot({ path: path.join(OUT, '22-demo-games.png') });
  await ev(p, "go('questions')"); await p.waitForTimeout(1500); await p.screenshot({ path: path.join(OUT, '23-demo-overview.png') });
  await ev(p, "A.openGuestForm(); gPass().welcomed = true; gRender();"); await p.waitForTimeout(1200);
  await ev(p, "var b = document.querySelector('.body'); b.scrollTop = document.querySelector('.demolock').offsetTop - 420;"); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, '24-demo-guest.png') });
  await ev(p, "go('home'); A.openRun(); UI.cfgStep = 3; A.cfgSave(); A.heroGo(); kickClose(); R().steps = DEMO_STEPS; render();"); await p.waitForTimeout(600); await p.screenshot({ path: path.join(OUT, '25-demo-run-end.png') });
  await p.close();
  await browser.close(); console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
