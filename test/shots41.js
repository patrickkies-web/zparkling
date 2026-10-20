/* v41: the pilot's plan in the setup, the demo home banner. node test/shots41.js */
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
    await ev("DEMO_LIMITS = true; A.loadDemo(); A.setEventAnlass({ v: 'treppe' })"); await p.waitForTimeout(600);
    await ev("UI.cfgStep = 3; go('runSetup')"); await p.waitForTimeout(700);
    const H = await p.evaluate(() => document.querySelector('.body').scrollHeight);
    await p.setViewportSize({ width: w, height: Math.min(H + 40, 4200) }); await p.waitForTimeout(400); await p.screenshot({ path: path.join(OUT, tag + '-s3-plan.png') });
    await p.setViewportSize({ width: w, height: h });
    await ev("go('home')"); await p.waitForTimeout(700);
    await p.evaluate(() => { const el = document.querySelector('.dm-switch'); el && el.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(OUT, tag + '-h-banner.png') });
    await p.close();
  }
  await b.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
