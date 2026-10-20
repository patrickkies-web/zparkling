/* v33: the bonus card in the example evening says there are more cards */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'v33-375'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch(); const errors = [];
  const p = await (await browser.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, hasTouch: true })).newPage();
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
  await p.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await ev("DEMO_LIMITS = true; A.loadDemo(); A.openGuestForm(); gPass().welcomed = true; UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen'; gRender();");
  await p.waitForTimeout(3800);
  await ev("(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(300);
  const has = await ev("!!document.getElementById('gdraw')");
  if (!has) errors.push('no draw button'); else { await p.tap('#gdraw', { force: true }); await p.waitForTimeout(6500); }
  await p.screenshot({ path: path.join(OUT, '26-demo-card.png') });
  const t = await ev("var m = document.querySelector('.gk-more'); (m ? m.textContent : 'NONE') + ' | type ' + ((document.querySelector('.gk-ov')||{}).className||'')");
  console.log(t);
  await ev("(document.querySelector('.gk-ov')||{}).scrollTop = 99999"); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, '27-demo-card-bottom.png') });
  await browser.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
