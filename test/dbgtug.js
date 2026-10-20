const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  await page.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => page.evaluate(c => window.__ev(c), c);
  await ev("A.loadDemo(); A.openGuestForm(); UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest='Kochen'; gRender();");
  await page.waitForTimeout(3500);
  await ev("UI.gDrawSeen = false; var b = document.getElementById('gdraw'); b.classList.remove('on'); document.getElementById('gdrawWrap').classList.remove('on','fresh'); gkReveal();");
  await page.waitForTimeout(200);
  console.log(await page.evaluate(() => document.elementsFromPoint(200, 845).map(e => e.tagName + '.' + e.className + ' ' + getComputedStyle(e).borderStyle + ' ' + getComputedStyle(e).outlineStyle).slice(0, 6).join('\n')));
  await browser.close();
})();
