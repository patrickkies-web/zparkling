/* the Game Pass reveal frame by frame, then once in real time. node test/shotspass.js [W] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const W = +(process.argv[2] || 375);
const OUT = path.join(__dirname, 'pass-' + W);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const errors = [], notes = [];
  const ctx = await browser.newContext({ viewport: { width: W, height: 812 }, deviceScaleFactor: 2, hasTouch: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
  await p.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); } catch (e) {} });
  await p.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => p.evaluate(c => window.__ev(c), c);
  const at = async t => { await p.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t); await ev('pvFxSeek(' + t + ')'); };
  const day = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  await ev("A.loadDemo(); S.demo = false; save(); UI.passDate = '" + day + "'; UI.passPlan = 14; A.passBuy();");
  await ev('UI.pvTok = -1'); /* hold the timers, the frames are set by hand */
  const frames = [300, 900, 1500, 1850, 1960, 2150, 2500, 2900, 3350, 3500, 3700, 3830, 4100, 4280, 4600, 4850, 5100, 5400, 5800, 6250];
  for (const t of frames) {
    await at(t);
    await p.screenshot({ path: path.join(OUT, 'f-' + String(t).padStart(4, '0') + '.png') });
  }
  const gone = await p.evaluate(() => { const r = document.querySelector('.pv-card').getBoundingClientRect(); return Math.round(r.bottom); });
  if (gone > 0) errors.push('the pass is still on screen at the end: bottom ' + gone); else notes.push('at the end the pass is ' + (-gone) + 'px above the screen');
  const screen = await ev('UI.screen');
  if (screen !== 'home') errors.push('under the reveal we should be home, got ' + screen);
  /* real time: it closes by itself */
  await ev('pvClose(true); pvShow({ w: passWindow(14, "' + day + '"), early: false })');
  await p.waitForTimeout(7600);
  const still = await ev("!!document.getElementById('pvov')");
  if (still) errors.push('the reveal did not close by itself');
  /* a tap skips it */
  await ev('pvShow({ w: passWindow(14, "' + day + '"), early: true })');
  await p.waitForTimeout(800); await p.tap('#pvov'); await p.waitForTimeout(700);
  if (await ev("!!document.getElementById('pvov')")) errors.push('a tap did not skip the reveal');
  await browser.close();
  console.log(notes.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
