/* screenshots of every screen: node test/shotsall.js [outdir] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, process.argv[2] || 'all'), W = +(process.env.W || 400), H = +(process.env.H || 860);
fs.mkdirSync(OUT, { recursive: true });
const DUMPS = path.join(__dirname, 'dumps');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const mk = async (tourDone, hash) => {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    page.on('pageerror', e => errors.push(page.__name + ': ' + e.message));
    await page.addInitScript((td) => { try { if (td) localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} }, tourDone);
    await page.goto('file://' + path.join(__dirname, 'debug.html') + (hash || ''));
    return page;
  };
  const ev = (page, code) => page.evaluate(c => window.__ev(c), code);
  const shot = async (page, name, opt) => {
    page.__name = name;
    await page.waitForTimeout((opt && opt.wait) || 450);
    const h = await page.evaluate(() => { const b = document.querySelector('.body'); return b ? b.scrollHeight + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + 140 : 860; });
    if (!(opt && opt.fixed)) await page.setViewportSize({ width: W, height: Math.max(H, Math.min(3200, h)) });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.setViewportSize({ width: W, height: H });
  };
  /* fresh install: the tour */
  let p = await mk(false);
  await ev(p, "UI.tourName = 'Lisa'; render();");
  for (let i = 0; i < 8; i++) { await shot(p, 'a-tour-' + i, { fixed: true, wait: 4500 }); await ev(p, "A.tourNext && A.tourNext()").catch(() => {}); }
  await p.close();
  p = await mk(true);
  await shot(p, 'a-welcome', { fixed: true });
  await ev(p, "go('pass')"); await shot(p, 'a-pass');
  await ev(p, "A.newEvent()"); await shot(p, 'b-setup-1');
  await ev(p, "UI.step = 2; render()"); await shot(p, 'b-setup-2');
  await ev(p, "A.addPerson({})"); await shot(p, 'b-person-form');
  await ev(p, "A.avCat({v:'look'})").catch(() => {}); await shot(p, 'b-person-look');
  await p.close();
  /* the demo party */
  p = await mk(true);
  await ev(p, "A.loadDemo()");
  await shot(p, 'c-home');
  for (let s = 1; s <= 5; s++) { await ev(p, "UI.step = " + s + "; go('setup')"); await shot(p, 'c-setup-' + s); }
  await ev(p, "A.editPerson({i:'0'})"); await shot(p, 'c-person-edit');
  await ev(p, "go('settings')"); await shot(p, 'c-settings');
  await ev(p, "A.openMaterial({})"); await shot(p, 'c-material');
  await ev(p, "A.openCounter({})"); await shot(p, 'c-counter');
  await ev(p, "go('questions')"); await shot(p, 'c-questions');
  await ev(p, "go('games')"); await shot(p, 'c-games');
  await ev(p, "A.openGuestForm()"); await shot(p, 'c-guestform-test');
  await ev(p, "A.openMasterForm()"); await shot(p, 'c-masterform');
  await ev(p, "A.openGuestLive()"); await shot(p, 'c-guestlive');
  await ev(p, "go('home'); A.openRun()"); await shot(p, 'c-runsetup');
  await ev(p, "A.startRun()"); await shot(p, 'c-run-start');
  await p.close();
  p = await mk(true, '#gast-fragen'); await shot(p, 'd-link-guestform'); await p.close();
  p = await mk(true, '#gast-live'); await shot(p, 'd-link-live'); await p.close();
  /* every step kind from the simulation */
  p = await mk(true);
  const files = fs.readdirSync(DUMPS).filter(f => f.endsWith('.json')).sort();
  for (const f of files) {
    const d = JSON.parse(fs.readFileSync(path.join(DUMPS, f), 'utf8'));
    await p.evaluate(d => { window.__ev('(function(d){ S = d.S; for (var k in d.UI) UI[k] = d.UI[k]; UI.confirm = null; if (S.run) S.run.shift = (S.run.shift || 0) + (d.t - Date.now()); render(); var b = document.querySelector(".body"); if (b) b.scrollTop = 0; })')(d); }, d).catch(e => errors.push(f + ': ' + e.message));
    await shot(p, 'e-' + f.replace('.json', ''));
  }
  await p.close();
  console.log(errors.length ? errors.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
})();
