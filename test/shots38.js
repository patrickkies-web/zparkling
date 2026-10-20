/* v38: the master's studio, accessories when sweeping, the date field. node test/shots38.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'v38'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [], notes = [];
  const mk = async (w, h) => { const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
    await p.goto('file://' + path.join(__dirname, 'debug.html')); return p; };
  for (const [tag, w, h] of [['phone', 390, 844], ['laptop', 1440, 900]]) {
    let p = await mk(w, h); const ev = c => p.evaluate(c => window.__ev(c), c);
    await ev("A.loadDemo(); A.openMasterForm();"); await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, tag + '-m1-studio.png') });
    await ev("A.gAdd({ v: 'schaetzen' });"); await p.waitForTimeout(900);
    const f = await p.$('.gcard textarea, .gcard input[type=text]'); if (f) { await f.click(); await p.keyboard.type('Wie viele Länder hat Jonas schon bereist?', { delay: 5 }); }
    await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, tag + '-m2-card.png') });
    await ev("var it = gForm().items[0]; it.text = 'Wie viele Länder hat Jonas schon bereist?'; it.answer = '14'; for (var k = 0; k < 4; k++) { A.gAdd({ v: 'auswahl' }); var x = gForm().items[gForm().items.length - 1]; x.text = 'Frage ' + k; x.options = ['A','B','C','']; x.correct = 1; } gRender(); A.mSave();");
    await p.waitForTimeout(700); await p.screenshot({ path: path.join(OUT, tag + '-m3-saved.png') });
    await p.close();
    /* sweeping */
    p = await mk(w, h); const ev2 = c => p.evaluate(c => window.__ev(c), c);
    await ev2("A.loadDemo(); A.matPreset({v:'all'}); A.setEventAnlass({ v: 'treppe' }); A.openRun(); A.cfgNext();"); await p.waitForTimeout(700);
    await ev2("var b = document.querySelector('.body'); b.scrollTop = b.scrollHeight;"); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, tag + '-a1-setup.png') });
    await ev2("A.cfgNext(); A.startRun(); kickClose(); R().bud.on = false; R().pending = null; R().shift += 4.2 * 60000; A.runNext(); var t = 0; while (!R().pending.accWin && t < 8) { R().pending = null; R().shift += 60000; A.runNext(); t++; } render();");
    await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, tag + '-a2-chance.png') });
    notes.push(tag + ' chance on: ' + await ev2("R().pending.kind + ' ' + !!R().pending.accWin"));
    await ev2("var P = R().pending; P.result = { title: 'Geschafft!', text: '', tone: 'ok', stamp: 1, rows: [{ pid: R().who[0], name: person(R().who[0]).name, n: 0, note: 'geschafft' }] }; render();");
    await p.waitForTimeout(1400); await p.screenshot({ path: path.join(OUT, tag + '-a3-won.png') });
    await ev2("R().pending = null; go('run')"); await p.waitForTimeout(900);
    await ev2("var b = document.querySelector('.body'), z = document.querySelector('.zc'); if (z) b.scrollTop = z.getBoundingClientRect().top - 200;"); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, tag + '-a4-cockpit.png') });
    await p.close();
    /* the date field */
    p = await mk(w, h); const ev3 = c => p.evaluate(c => window.__ev(c), c);
    await ev3("A.loadDemo(); go('pass')"); await p.waitForTimeout(800);
    const dims = await p.evaluate(() => { const i = document.getElementById('passDate'), f = i && i.closest('.field'); if (!i) return 'none'; const a = i.getBoundingClientRect(), c = (f || i.parentElement).getBoundingClientRect(); return Math.round(a.width) + ' in ' + Math.round(c.width); });
    notes.push(tag + ' date field width: ' + dims);
    await p.fill('#passDate', '2026-12-24'); await p.waitForTimeout(150);
    notes.push(tag + ' while picking, buy button: ' + await p.evaluate(() => { const b = document.querySelector('.p-buy'); return b.disabled + ' / ' + b.textContent.trim(); }) + ' / input still the same element: ' + await p.evaluate(() => document.activeElement && document.activeElement.id));
    await p.close();
  }
  await b.close(); console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
