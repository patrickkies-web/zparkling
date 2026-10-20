/* the guests' page in full, demo and full version: node test/qpage.js [tag] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const TAG = process.argv[2] || 'before'; const OUT = path.join(__dirname, 'v40'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [];
  for (const [mode, setup] of [['demo', "DEMO_LIMITS = true; A.loadDemo(); go('questions')"], ['full', "A.loadDemo(); S.demo = false; go('questions')"]]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html'));
    await p.evaluate(c => window.__ev(c), setup); await p.waitForTimeout(1500);
    const H = await p.evaluate(() => document.querySelector('.body').scrollHeight);
    await p.setViewportSize({ width: 390, height: Math.min(H + 60, 9000) }); await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(OUT, TAG + '-q-' + mode + '.png') });
    await p.close();
  }
  await b.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
