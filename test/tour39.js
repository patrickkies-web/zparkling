/* every slide of the intro after its animation: node test/tour39.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'v39'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => errors.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => p.evaluate(c => window.__ev(c), c);
  const n = await ev('TOUR.length');
  for (let i = 0; i < n; i++) {
    await ev("UI.tourName = 'Lisa'; UI.tourPause = true; UI.tourAt = " + i + "; UI.tourFrom = ''; go('tour');");
    await p.waitForTimeout(7200);
    await p.screenshot({ path: path.join(OUT, 'tour-' + i + '.png') });
  }
  await b.close(); console.log(n + ' slides', errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
