/* v26: the long pack opening frame by frame, the tug of the hidden button, the Joker,
   the bigger paper, the keyboard bar. node test/shots26.js [outdir] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, process.argv[2] || 'v26');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const mk = async (opts) => {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 400, height: 860 } }, opts || {}));
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push((page.__name || '') + ': ' + e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push((page.__name || '') + ' console: ' + m.text()); });
    await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); } catch (e) {} });
    await page.goto('file://' + path.join(__dirname, 'debug.html'));
    return page;
  };
  const ev = (page, code) => page.evaluate(c => window.__ev(c), code);
  const snap = async (page, name) => { page.__name = name; await page.screenshot({ path: path.join(OUT, name + '.png') }); };
  const shot = async (page, name, opt) => {
    page.__name = name;
    await page.waitForTimeout((opt && opt.wait) || 450);
    if (opt && opt.full) {
      const h = await page.evaluate(() => { const b = document.querySelector('.body'); return b ? b.scrollHeight + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + 140 : 860; });
      await page.setViewportSize({ width: 400, height: Math.max(860, Math.min(3400, h)) });
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    await page.setViewportSize({ width: 400, height: 860 });
  };
  /* freeze every animation and the spark canvas at time t */
  const at = async (page, t) => { await page.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t); await ev(page, 'gkFxSeek(' + t + ')'); };
  const force = (type, n) => "(function(){ var _p = gkPickType; gkPickType = function(){ return { type: '" + type + "', n: " + n + " }; }; gkOpen(); gkPickType = _p; })()";
  const fillForm = "UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen'; gRender();";

  /* 1. the hidden button: a corner peeks out, gets tugged, shoots out */
  let p = await mk();
  await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;');
  await ev(p, "UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; gRender();");
  await p.waitForTimeout(2600);
  await p.focus('#qInt_0'); await p.type('#qInt_0', 'Kochen');
  await p.waitForTimeout(900);
  const shownWhileTyping = await ev(p, "document.getElementById('gdraw').className");
  if (/on|tug/.test(shownWhileTyping)) errors.push('button came out while still typing: ' + shownWhileTyping);
  await snap(p, '01-typing-no-button');
  await ev(p, "document.activeElement.blur()");
  await p.waitForTimeout(560);
  for (const t of [60, 200, 330, 470, 640, 780, 860, 960, 1150, 1500]) { await at(p, t); await snap(p, '02-tug-' + String(t).padStart(4, '0')); }
  await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); })');
  await p.waitForTimeout(1600); await snap(p, '03-button-fresh');
  await p.close();

  /* 2. the pack opening, frame by frame */
  for (const [type, n, tag] of [['wenn', 0, 'leg'], ['joker', -1, 'jok']]) {
    p = await mk();
    await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;'); await ev(p, fillForm);
    await p.waitForTimeout(2400);
    await ev(p, force(type, n));
    const frames = tag === 'leg' ? [0, 300, 700, 1100, 1500, 1900, 2300, 2600, 2850, 2960, 3030, 3150, 3400, 3700, 3950, 4180, 4420, 4700, 5300] : [1500, 2700, 3050, 3500, 4100, 4500, 5400];
    for (const t of frames) { await at(p, t); await snap(p, '1' + (tag === 'leg' ? '0' : '1') + '-open-' + tag + '-' + String(t).padStart(4, '0')); }
    await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); }); UI.gkFxT = null;');
    await p.waitForTimeout(5600);
    await snap(p, '12-final-' + tag);
    if (tag === 'jok') {
      await p.fill('#gkin', 'Nur gegen eine Umarmung');
      await ev(p, 'A.gkDone()'); await p.waitForTimeout(2600);
      await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(400);
      await snap(p, '13-joker-in-list');
    }
    await p.close();
  }

  /* 3. the bigger paper */
  p = await mk();
  await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;'); await ev(p, fillForm);
  await p.waitForTimeout(2400);
  await ev(p, force('portrait', 2)); await p.waitForTimeout(5500);
  await ev(p, 'A.gkStart()'); await p.waitForTimeout(500);
  const box = await p.locator('#gkcv').boundingBox();
  if (!box || box.width < 330 || box.height < box.width * 1.3) errors.push('paper too small: ' + JSON.stringify(box));
  const stroke = async (list) => { await p.mouse.move(box.x + list[0][0] * box.width, box.y + list[0][1] * box.height); await p.mouse.down(); for (const q of list.slice(1)) await p.mouse.move(box.x + q[0] * box.width, box.y + q[1] * box.height, { steps: 2 }); await p.mouse.up(); };
  const head = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2; head.push([0.5 + Math.cos(a) * 0.32, 0.45 + Math.sin(a) * 0.3]); }
  await stroke(head); await stroke([[0.4, 0.4], [0.41, 0.41]]); await stroke([[0.6, 0.4], [0.61, 0.41]]);
  await ev(p, 'A.gkPen({ v: 1 })');
  const sm = []; for (let i = 0; i <= 12; i++) { const u = i / 12; sm.push([0.38 + u * 0.24, 0.55 + Math.sin(u * Math.PI) * 0.06]); } await stroke(sm);
  await ev(p, 'A.gkPen({ v: 2 })');
  const body = [[0.5, 0.75], [0.5, 0.95]]; await stroke(body); await stroke([[0.3, 0.82], [0.7, 0.82]]);
  await snap(p, '20-paper-drawing');
  await ev(p, 'A.gkUndo()'); await snap(p, '21-paper-undo');
  await ev(p, 'A.gkDone()'); await p.waitForTimeout(2600);
  await ev(p, "(document.querySelector('.body')||{}).scrollTop = 99999"); await p.waitForTimeout(400);
  await snap(p, '22-portrait-mini');
  await p.close();

  /* 4. the Joker at the party */
  p = await mk();
  await ev(p, "A.loadDemo(); go('questions');"); await shot(p, '30-master-jokers', { full: true });
  await ev(p, 'A.openRun(); A.startRun();'); await shot(p, '31-run-jokers', { full: true });
  await ev(p, "var r = R(), main = r.who[0]; snapshot('task'); r.pending = makeGameStep(main, { focus: [main], together: r.together, variant: r.variant, themes: themesOf(r.who) }, 'zwiebel', 'solo'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; go('step'); A.stepResolve({ v: 'fail' });");
  await shot(p, '32-result-joker-btn', { wait: 900 });
  await ev(p, "A.jkAsk({ i: '0' })"); await shot(p, '33-result-joker-ask', { full: true });
  await ev(p, "A.jkUse({ i: '0', id: jokerFree()[0].id })"); await p.waitForTimeout(250); await snap(p, '34-result-joker-used');
  await p.close();

  /* 5. the keyboard bar on a phone */
  p = await mk({ hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  await ev(p, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;');
  await ev(p, "UI.gForm.author = 'Paula'; A.gAdd({ v: 'steckbrief' }); gRender();");
  await p.waitForTimeout(800);
  await p.tap('#qYear_0'); await p.waitForTimeout(400);
  const bar1 = await ev(p, "var b = document.getElementById('kbbar'); b && b.classList.contains('on') ? document.getElementById('kbgo').textContent + '|' + document.getElementById('kbl').textContent : 'none'");
  if (!/Weiter/.test(bar1)) errors.push('keyboard bar missing on a number field: ' + bar1);
  await snap(p, '40-kbbar-year');
  await p.keyboard.type('2014');
  await p.tap('#kbgo'); await p.waitForTimeout(300);
  const after = await ev(p, "document.activeElement && document.activeElement.id");
  if (after !== 'qBd_0') errors.push('Weiter did not move on, focus is ' + after);
  await snap(p, '41-kbbar-next');
  await p.tap('#qMeet_0'); await p.waitForTimeout(300);
  const bar2 = await ev(p, "document.getElementById('kbgo').textContent");
  if (!/Fertig/.test(bar2)) errors.push('last field should say Fertig: ' + bar2);
  await p.keyboard.type('Im Kino'); await p.tap('#kbgo'); await p.waitForTimeout(300);
  const gone = await ev(p, "(document.activeElement && document.activeElement.tagName) + '|' + (document.getElementById('kbbar') ? document.getElementById('kbbar').className : '')");
  if (/INPUT|TEXTAREA/.test(gone.split('|')[0]) || /on/.test(gone.split('|')[1])) errors.push('Fertig did not close: ' + gone);
  await snap(p, '42-kbbar-done');
  await p.close();
  const p2 = await mk();
  await ev(p2, 'A.loadDemo(); A.openGuestForm(); gPass().welcomed = true;'); await p2.click('#qAuthor'); await p2.waitForTimeout(200);
  const deskBar = await ev(p2, "!!(document.getElementById('kbbar') && document.getElementById('kbbar').classList.contains('on'))");
  if (deskBar) errors.push('keyboard bar shows on desktop');
  await p2.close();

  await browser.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no page errors');
})();
