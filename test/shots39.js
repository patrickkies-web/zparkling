/* v39: the home page without a bar, the occasion picker. node test/shots39.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'v41'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [];
  for (const [tag, w, h] of [['phone', 390, 844], ['laptop', 1440, 900]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: tag === 'phone' ? 2 : 1 });
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html'));
    const ev = c => p.evaluate(c => window.__ev(c), c);
    await ev("DEMO_LIMITS = true; A.openDemoPick({ from: 'landing' })"); await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, tag + '-p1-pick.png') });
    await p.click('.dp-tk-top[data-v="treppe"]', { force: true }); await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, tag + '-p2-open.png') });
    await p.click('.dp-tk.on .dp-go', { force: true }); await p.waitForTimeout(1500); await p.screenshot({ path: path.join(OUT, tag + '-h1-home.png') });
    const H = await p.evaluate(() => document.querySelector('.body').scrollHeight);
    await p.setViewportSize({ width: w, height: Math.min(H + 40, 4200) }); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, tag + '-h2-home-full.png') });
    console.log(tag, 'tabbar present:', await p.evaluate(() => !!document.querySelector('.tabbar')), '| anlass:', await ev('E().anlass'));
    await p.close();
  }
  await b.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
