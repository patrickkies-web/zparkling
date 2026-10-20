/* wild tapping through the guest link with the bonus cards: node test/monkeyguest.js [actions] [seed] [link] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const N = +(process.argv[2] || 600), SEED = +(process.argv[3] || 1), LINK = process.argv[4] === 'link';
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
(async () => {
  const rnd = rng(SEED);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  const errors = [], seen = {};
  page.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  page.on('dialog', d => d.dismiss());
  await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} });
  const url = 'file://' + path.join(__dirname, 'debug.html');
  await page.goto(url);
  const ev = code => page.evaluate(c => window.__ev(c), code);
  await ev('A.loadDemo()');
  const open = async () => { if (LINK) { await page.goto(url + '#gast-fragen'); await page.reload(); } else await ev('A.openGuestForm()'); };
  await open();
  let cards = 0, opened = 0;
  for (let i = 0; i < N; i++) {
    const scr = await ev('UI.screen').catch(() => '');
    if (scr !== 'guestForm') { await (LINK ? open() : ev("A.openGuestForm()")).catch(() => {}); continue; }
    /* sometimes finish every open contribution, so the card button shows up */
    if (rnd() < 0.12) await ev("var G = gForm(); if (!G.author) G.author = 'Gast" + (i % 7) + "'; G.items.forEach(function (it) { it.forId = it.forId || (E() ? E().focus[0].id : ''); if (it.type === 'worte') { it.trait = it.trait || 'lieb'; it.interest = it.interest || 'Tanzen'; } if (it.type === 'wer' || it.type === 'aufgabe' || it.type === 'schaetzen' || it.type === 'auswahl' || it.type === 'bereich') it.text = it.text || 'Eine schöne Frage'; if (it.type === 'schaetzen') it.answer = it.answer || '7'; if (it.type === 'bereich') { it.min = '0'; it.max = '10'; it.answer = '5'; } if (it.type === 'auswahl') { it.options = ['A', 'B', '', '']; it.correct = 0; } if (it.type === 'luege') { it.options = ['a', 'b', 'c']; it.correct = 1; } if (it.type === 'tipp') it.answer = '60'; if (it.type === 'steckbrief') it.year = '2012'; }); gRender();").catch(e => errors.push('fill: ' + e.message));
    const gk = await ev('UI.gk ? UI.gk.type + ":" + UI.gk.phase : ""').catch(() => '');
    if (gk) {
      const t = gk.split(':')[0], ph = gk.split(':')[1];
      if (t === 'portrait' && ph === 'draw' && rnd() < 0.7) {
        const box = await page.locator('#gkcv').boundingBox().catch(() => null);
        if (box) { await page.mouse.move(box.x + rnd() * box.width, box.y + rnd() * box.height); await page.mouse.down(); for (let k = 0; k < 6; k++) await page.mouse.move(box.x + rnd() * box.width, box.y + rnd() * box.height, { steps: 3 }); await page.mouse.up(); }
      }
      if (t === 'portrait' && ph === 'ready' && rnd() < 0.6) await ev('A.gkStart()').catch(() => {});
      if (t !== 'portrait' && rnd() < 0.7) { try { await page.fill('#gkin', ['Faultier', 'Passt scho!', 'x', '', 'Handy', 'Ein sehr langes Wort ohne Ende hier', 'Kaugummi'][Math.floor(rnd() * 7)], { timeout: 500 }); } catch (e) {} }
      if (rnd() < 0.35) { try { await page.click('#gkgo:not([disabled])', { timeout: 400 }); seen.gkDoneClick = (seen.gkDoneClick || 0) + 1; await page.waitForTimeout(700); } catch (e) {} }
      if (rnd() < 0.15) await page.keyboard.press('Enter').catch(() => {});
      if (rnd() < 0.08) await ev('if (UI.gk && UI.gk.phase === "draw") { UI.gk.t0 = Date.now() - 25000; gkTick(); }').catch(() => {});
    }
    const acts = await page.$$eval('#app [data-act]:not([disabled])', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).pointerEvents !== 'none'; }).map((e, k) => ({ k, act: e.getAttribute('data-act') })));
    const inputs = await page.$$('#app input[type="text"]:not(#gkin), #app textarea');
    if (inputs.length && rnd() < 0.15) { const inp = inputs[Math.floor(rnd() * inputs.length)]; try { await inp.fill(['Tom', '12', 'Kalle', '', '7,5', 'Wir sind in den Pool gefallen', '2014'][Math.floor(rnd() * 7)], { timeout: 500 }); } catch (e) {} continue; }
    if (!acts.length) continue;
    let pickA = acts[Math.floor(rnd() * acts.length)];
    /* the new things get more attention */
    const pref = acts.filter(a => /^(gDraw|gk|gSubmit|qAnother)/.test(a.act));
    if (pref.length && rnd() < 0.45) pickA = pref[Math.floor(rnd() * pref.length)];
    if (pickA.act === 'go' && rnd() < 0.8) continue;
    seen[pickA.act] = (seen[pickA.act] || 0) + 1;
    if (pickA.act === 'gDraw') opened++;
    try {
      const all = await page.$$('#app [data-act]:not([disabled])');
      const vis = []; for (const h of all) { const b = await h.boundingBox(); if (b && b.width > 0 && b.height > 0 && await h.evaluate(e => getComputedStyle(e).pointerEvents !== 'none')) vis.push(h); }
      if (vis[pickA.k]) await vis[pickA.k].click({ timeout: 800, force: true });
    } catch (e) {}
    if (rnd() < 0.25) await page.waitForTimeout(200 + Math.floor(rnd() * 3600));
    /* invariants */
    const st = await ev("JSON.stringify({ c: (gForm().cards || []).length, left: gkLeft(), pass: gPass().cards || 0, gk: !!UI.gk, ov: !!document.getElementById('gkov'), clock: !!UI.gkClock, ph: UI.gk && UI.gk.phase })").catch(() => null);
    if (st) {
      const s = JSON.parse(st); cards = Math.max(cards, s.c + s.pass);
      if (s.c + s.pass > 2) errors.push('more than two cards: ' + st);
      if (s.left < 0) errors.push('negative cards left: ' + st);
      if (s.gk && !s.ov && scr === 'guestForm') errors.push('card open without overlay: ' + st);
      if (s.clock && s.ph !== 'draw') errors.push('clock running outside drawing: ' + st);
    }
    if (errors.length > 5) break;
  }
  console.log('opened', opened, 'max cards', cards, 'acts', Object.keys(seen).filter(k => /^g/.test(k)).map(k => k + ':' + seen[k]).join(' '));
  console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
  if (errors.length) process.exitCode = 1;
})();
