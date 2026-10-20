/* a few pages at laptop size: node test/deskquick.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'deskq'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [];
  const p = await b.newPage({ viewport: { width: +(process.env.W || 1440), height: +(process.env.H || 900) } });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
  await p.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => p.evaluate(c => window.__ev(c), c);
  const shots = (process.env.SHOTS || "home:A.loadDemo(); go('home')|games:go('games')|questions:go('questions')").split('|');
  for (const s of shots) { const i = s.indexOf(':'); await ev(s.slice(i + 1)); await p.waitForTimeout(1300); await p.screenshot({ path: path.join(OUT, s.slice(0, i) + '.png') }); }
  await b.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
