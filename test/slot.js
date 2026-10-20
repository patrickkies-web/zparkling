/* the slot machine and the bar colour: node test/slot.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'v38'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [], notes = [];
  for (const [tag, w, h] of [['phone', 390, 844], ['laptop', 1440, 900]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('file://' + path.join(__dirname, 'debug.html'));
    await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, tag + '-slot-spin.png'), clip: { x: 0, y: 0, width: w, height: 330 } });
    await p.waitForTimeout(2600); await p.screenshot({ path: path.join(OUT, tag + '-slot-stop.png'), clip: { x: 0, y: 0, width: w, height: 330 } });
    const seen = new Set();
    for (let k = 0; k < 3; k++) { await p.waitForTimeout(4700); (await p.evaluate(() => [...document.querySelectorAll('.lp-reel')].filter(r => getComputedStyle(r).display !== 'none').map(r => r.getAttribute('data-pos')))).forEach(x => seen.add(x)); }
    notes.push(tag + ': occasions shown after a few spins: ' + seen.size + ' of 8');
    notes.push(tag + ' tint landing: ' + await p.evaluate(() => document.querySelector('meta[name=theme-color]').content));
    await p.evaluate(() => window.__ev("A.loadDemo()")); await p.waitForTimeout(1200);
    notes.push(tag + ' tint demo home: ' + await p.evaluate(() => document.querySelector('meta[name=theme-color]').content));
    await p.evaluate(() => window.__ev("go('pass')")); await p.waitForTimeout(1200);
    notes.push(tag + ' tint pass: ' + await p.evaluate(() => document.querySelector('meta[name=theme-color]').content));
    await p.evaluate(() => window.__ev("S.demo = false; go('home')")); await p.waitForTimeout(1200);
    notes.push(tag + ' tint home without banner: ' + await p.evaluate(() => document.querySelector('meta[name=theme-color]').content));
    await p.close();
  }
  await b.close(); console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
