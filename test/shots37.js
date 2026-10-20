/* v37: buddies, rules, the card area, the new bonus cards, printing. node test/shots37.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'v37'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [];
  const mk = async (w, h) => { const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    p.on('pageerror', e => errors.push(e.message));
    await p.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); window.print = () => { window.__printed = (window.__printed || 0) + 1; }; });
    await p.goto('file://' + path.join(__dirname, 'debug.html')); return p; };
  const shot = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
  const setup = "A.loadDemo(); A.matPreset({v:'all'}); E().crew = [{name:'Tom'},{name:'Lea'},{name:'Max'},{name:'Nina'}]; A.openRun(); A.cfgNext(); A.cfgNext(); A.startRun(); kickClose(); R().shift += 6*60000; R().pending = null; A.runNext();";
  for (const [tag, w, h] of [['phone', 390, 844], ['laptop', 1440, 900]]) {
    const p = await mk(w, h); const ev = c => p.evaluate(c => window.__ev(c), c);
    await ev(setup); await p.waitForTimeout(1300); await shot(p, tag + '-01-buddy');
    await ev("A.budPick({ id: R().who[0], v: 'Lea' }); render();"); await p.waitForTimeout(400);
    await ev("(document.querySelector('.body')||{}).scrollTop = 300"); await p.waitForTimeout(200); await shot(p, tag + '-02-buddy-lea');
    await ev("R().who.slice(1).forEach(function (id, i) { A.budPick({ id: id, v: ['Max','Nina'][i] }); }); A.budGo();");
    await ev("S.questions.push({ id: 'qrX', t: 1, author: 'Tom', forId: '', type: 'regel', text: '', status: 'ok', used: false, options: [], correct: 0, rar: 'reg' }); A.openCards({from:'run'}); A.ruleOpen({id:'qrX'}); setBind('rule.text', 'Keine Hände benutzen'); A.ruleStart(); R().rules[0].broke[R().who[0]] = true; go('run');");
    await p.waitForTimeout(1200); await ev("var b = document.querySelector('.body'); var z = document.querySelector('.zc'); if (b && z) b.scrollTop = z.getBoundingClientRect().top - 200;"); await p.waitForTimeout(300); await shot(p, tag + '-03-cockpit');
    await ev("go('step')"); await p.waitForTimeout(900); await shot(p, tag + '-04-step-rule');
    await ev("A.collectClose(); A.openCards({from:'run'});"); await p.waitForTimeout(900); await shot(p, tag + '-05-cards');
    await ev("var b = document.querySelector('.body'); b.scrollTop = b.scrollHeight"); await p.waitForTimeout(300); await shot(p, tag + '-06-cards-print');
    await p.close();
  }
  /* the new bonus cards being drawn, in the guest link */
  for (const t of ['weiter', 'regel']) {
    const p = await mk(390, 844); const ev = c => p.evaluate(c => window.__ev(c), c);
    await ev("A.loadDemo(); A.openGuestForm(); gPass().welcomed = true; UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'lieb'; it.interest = 'Kochen'; gRender(); S.questions = S.questions.filter(function(q){return q.type !== '" + t + "';}); GK_JOKER_P = 0; GK_WEITER_P = " + (t === 'weiter' ? 1 : 0) + "; GK_REGEL_P = " + (t === 'regel' ? 1 : 0) + ";");
    await p.waitForTimeout(3600); await ev("(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(300);
    await p.tap('#gdraw', { force: true }).catch(() => ev('gkOpen()')); await p.waitForTimeout(6500); await shot(p, 'card-' + t);
    await p.close();
  }
  /* printing: a real PDF, playing cards and A4 */
  for (const fmt of ['karte', 'a4']) {
    const p = await mk(1200, 900); const ev = c => p.evaluate(c => window.__ev(c), c);
    await ev("A.loadDemo(); S.questions.push({ id: 'q2', t: 2, author: 'Nina', forId: '', type: 'weiter', text: '', status: 'ok', used: false, options: [], correct: 0, rar: 'wei' }); A.collectClose(); A.openCards({from:'questions'}); A.prFmt({v:'" + fmt + "'}); A.prGo();");
    await p.waitForTimeout(800);
    await p.emulateMedia({ media: 'print' });
    await p.pdf({ path: path.join(OUT, 'print-' + fmt + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
    await p.close();
  }
  await b.close(); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
