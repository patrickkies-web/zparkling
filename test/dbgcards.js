const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  page.on('pageerror', e => console.log('ERR', e.message));
  await page.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => page.evaluate(c => window.__ev(c), c);
  await ev('A.loadDemo(); A.openGuestForm();');
  await ev("UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen'; gRender();");
  await page.waitForTimeout(300);
  await ev("(function(){ var _p = gkPickType; gkPickType = function(){ return { type: 'wenn', n: 0 }; }; gkOpen(); gkPickType = _p; })()");
  for (const t of [100, 900, 1700, 2600, 4000]) { await page.waitForTimeout(t === 100 ? 100 : 800); await page.screenshot({ path: path.join(__dirname, 'dbg-' + t + '.png') }); }
  console.log(await ev("var cs=getComputedStyle(document.getElementById('gkov')); [cs.position,cs.top,cs.bottom,cs.height,cs.inset,cs.display].join(' ')")); console.log(await ev("var o=document.getElementById('gkov'); var ch=[]; for (var e=o; e; e=e.parentElement) ch.push(e.tagName+'.'+e.className+'#'+e.id); ch.join(' < ')")); console.log(await ev("JSON.stringify({gk: UI.gk && UI.gk.type, ov: !!document.getElementById('gkov'), cls: document.getElementById('gkov') && document.getElementById('gkov').className, anims: document.getAnimations().length, r: JSON.stringify(document.getElementById('gkov').getBoundingClientRect())})"));
  await browser.close();
})();
