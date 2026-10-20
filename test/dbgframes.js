const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  page.on('pageerror', e => console.log('ERR', e.message));
  await page.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => page.evaluate(c => window.__ev(c), c);
  await ev("A.loadDemo(); A.openGuestForm(); UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest='Kochen'; gRender();");
  await page.waitForTimeout(2600);
  await ev("(function(){ var _p = gkPickType; gkPickType = function(){ return { type: '" + (process.argv[3] || 'wenn') + "', n: " + (process.argv[4] || '0') + " }; }; gkOpen(); gkPickType = _p; })()");
    const ts = (process.argv[2] || '2850,3030,4250,4420').split(',').map(Number);
  for (const t of ts) { await page.evaluate(t => document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }), t); await ev('gkFxSeek(' + t + ')'); await page.screenshot({ path: path.join(__dirname, 'fr-' + t + '.png') }); }
  await browser.close();
})();
