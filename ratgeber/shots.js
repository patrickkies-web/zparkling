/* Bildschirmaufnahmen aus der App für die Ratgeber-Seiten: node ratgeber/shots.js (vorher sh build.sh) */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'shots-png'), DUMPS = path.join(__dirname, '..', 'test', 'dumps');
fs.mkdirSync(OUT, { recursive: true }); // danach: python3 ratgeber/webp.py (macht WebP in public/ratgeber/img)
(async () => {
  const b = await chromium.launch(), errors = [];
  const mk = async () => {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, '..', 'test', 'debug.html'));
    /* Google Fonts ist im Testlauf nicht erreichbar: dieselben Schriften lokal (OFL, ratgeber/fonts) */
    await p.addStyleTag({ content: "@font-face{font-family:Unbounded;font-weight:600 900;src:url('file://" + path.join(__dirname, 'fonts', 'Unbounded.ttf') + "') format('truetype')}@font-face{font-family:Figtree;font-weight:400 800;src:url('file://" + path.join(__dirname, 'fonts', 'Figtree.ttf') + "') format('truetype')}" });
    await p.evaluate(() => document.fonts.ready);
    return p;
  };
  const ev = (p, c) => p.evaluate(c => window.__ev(c), c);
  const shot = async (p, name, wait) => { await p.waitForTimeout(wait || 700); await p.evaluate(() => { window.__ev("UI.toast = ''"); document.querySelectorAll('.toast').forEach(t => t.remove()); }); await p.waitForTimeout(80); await p.screenshot({ path: path.join(OUT, name + '.png') }); console.log(name); };
  const dump = async (p, f) => { const d = JSON.parse(fs.readFileSync(path.join(DUMPS, f), 'utf8')); await p.evaluate(d => { window.__ev('(function(d){ S = d.S; for (var k in d.UI) UI[k] = d.UI[k]; UI.confirm = null; if (S.run) S.run.shift = (S.run.shift || 0) + (d.t - Date.now()); render(); var b = document.querySelector(".body"); if (b) b.scrollTop = 0; })')(d); }, d); };
  let p = await mk();
  await ev(p, "A.loadDemo()"); await shot(p, 'home');
  await ev(p, "A.openDemoPick({ from: 'home' })"); await shot(p, 'picker');
  await ev(p, "A.setEventAnlass({ v: 'socken' }); go('home'); UI.cfgStep = 3; go('runSetup')"); await shot(p, 'pilot');
  await ev(p, "go('home'); A.openRun(); UI.cfgStep = 1; A.cfgSave(); A.heroGo(); kickClose(); render();"); await p.waitForTimeout(1600); await shot(p, 'cockpit-kranz');
  await ev(p, "A.setEventAnlass({ v: 'treppe' }); S.run = null; S.runCfg = null; go('home'); A.openRun(); A.startRun(); kickClose(); render();"); await p.waitForTimeout(1600); await shot(p, 'cockpit-treppe');
  await ev(p, "go('home'); A.openGuestForm()"); await p.waitForTimeout(400); await ev(p, "A.gWelcome()"); await p.waitForTimeout(1600); await shot(p, 'einladung');
  await ev(p, "gForm().author = 'Lea'; A.gAdd({ v: 'luege' }); var it = gForm().items[0]; it.forId = ''; it.options = ['Ich war schon mal in Australien', 'Ich kann jonglieren', 'Ich habe einen Hamster']; it.lie = 1; gRender(); var b = document.querySelector('.body'); b.scrollTop = b.scrollHeight;"); await shot(p, 'gast-luege');
  await ev(p, "go('home'); A.openCards({ from: 'home' })"); await shot(p, 'karten');
  await p.close();
  /* steps from the simulation */
  p = await mk();
  for (const [f, name] of [['step-spiel-solo.json', 'spiel'], ['step-wwe.json', 'wwe'], ['step-schaetzen.json', 'schaetzen'], ['step-spiel-duell.json', 'duell'], ['step-gast.json', 'gast-runde'], ['step-rolle.json', 'rolle'], ['step-acc.json', 'zubehoer']]) {
    if (!fs.existsSync(path.join(DUMPS, f))) { console.log('fehlt', f); continue; }
    await dump(p, f); await shot(p, name);
  }
  await p.close();
  /* a JGA mission */
  p = await mk();
  await ev(p, "A.loadDemo(); A.setEventAnlass({ v: 'jga' }); UI.crewName = 'Tom'; A.crewAdd(); UI.crewName = 'Lea'; A.crewAdd(); UI.crewName = 'Max'; A.crewAdd(); go('home'); A.openRun(); A.startRun(); kickClose();");
  await p.waitForTimeout(800);
  const found = await p.evaluate(() => { for (let k = 0; k < 40; k++) { const r = window.__ev('R()'); const P = r && r.pending; if (P && P.kind === 'mission' && !P.result) return true; if (P && !P.result) window.__ev("R().pending.result = { rows: [] }"); window.__ev("A.runNext()"); } return false; });
  await ev(p, "render()");
  /* the buddy screen comes first: keep it as its own picture, then pick buddies and show the mission */
  const buddy = await p.evaluate(() => window.__ev("budMode() === 'swap'"));
  if (buddy) {
    await shot(p, 'trinkbuddys');
    await ev(p, "(function(){ var r = runLive(), b = bud(r), names = presentNames(); r.who.filter(function (id) { return budNeeds(r, id); }).forEach(function (id, i) { var pool = budPool(r, id, b.next); A.budPick({ id: id, v: pool[0] || names[i] || 'Tom' }); }); A.budGo(); render(); })()");
  }
  await shot(p, found ? 'mission' : 'mission-x');
  await p.close();
  await b.close(); console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'ok');
})();
