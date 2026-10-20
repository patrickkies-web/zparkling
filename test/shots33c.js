const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
(async () => {
  const browser = await chromium.launch(); const errors = [];
  for (const demo of [false, true]) {
    const p = await (await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html'));
    const ev = c => p.evaluate(c => window.__ev(c), c);
    await ev((demo ? 'DEMO_LIMITS = true; ' : '') + "A.loadDemo(); go('questions');"); await p.waitForTimeout(1500);
    await ev("var b = document.querySelector('.body'), q = document.querySelector('.qo'); b.scrollTop = q.offsetTop - 120;"); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(__dirname, 'v33-375', '11-overview-tiles' + (demo ? '-demo' : '') + '.png') });
    await p.tap('.qo-cta', { force: true }); await p.waitForTimeout(900);
    console.log('after CTA:', await ev("var l = document.getElementById('qs-link'); l ? Math.round(l.getBoundingClientRect().top) : 'none'"));
    await p.close();
  }
  await browser.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
