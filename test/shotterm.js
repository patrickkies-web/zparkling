const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = code => page.evaluate(c => window.__ev(c), code);
  await ev("A.loadDemo(); A.matPreset({v:'all'}); A.openRun(); A.startRun();");
  const ids = await ev("GAMES.filter(function(g){return TERM_GAMES[g.sp||g.id]!=null || TERM_GAMES[g.id]!=null;}).map(function(g){return g.id+':'+(g.solo?'s':'')+(g.duell?'d':'')+(g.team?'t':'');}).join(',')");
  console.log('term games', ids);
  const first = ids.split(',')[0].split(':')[0];
  await ev("var r=R(); r.pending = makeGameStep(r.who[0], {focus:[r.who[0]], together:'gemeinsam', variant:'socke', themes: themesOf(r.who)}, '" + first + "', 'solo'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; r.steps = 1; commit(); go('step');");
  await page.waitForTimeout(400);
  const h = await page.evaluate(() => document.querySelector('.body').scrollHeight);
  await page.setViewportSize({ width: 400, height: Math.min(2400, h + 200) });
  await page.screenshot({ path: path.join(__dirname, 'shots', '50-terms-closed.png') });
  const btn = await page.$('[data-act="termShow"]');
  if (btn) { await btn.click(); await page.waitForTimeout(300); await page.screenshot({ path: path.join(__dirname, 'shots', '51-terms-open.png') }); }
  console.log(btn ? 'term button found' : 'NO TERM BUTTON');
  console.log(errors.length ? errors.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
})();
