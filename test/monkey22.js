/* wild clicking through the whole app in a real browser; reports every JS error.
   node test/monkey22.js [actions] [seed] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const N = +(process.argv[2] || 1500), SEED = +(process.argv[3] || 1);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
(async () => {
  const rnd = rng(SEED);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  page.on('dialog', d => d.dismiss());
  await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = code => page.evaluate(c => window.__ev(c), code);
  await ev((process.env.DEMO ? 'DEMO_LIMITS = true; ' : '') + "A.loadDemo(); A.matPreset({v:'all'});");
  const seen = {};
  let stuck = 0;
  for (let i = 0; i < N; i++) {
    /* a running Kranz gets most of the attention */
    if (rnd() < 0.03) await ev("if (S.event && (!S.run || S.run.finished)) { A.openRun(); if (UI.screen==='runSetup') A.startRun(); }").catch(() => {});
    /* now and then put a new kind of card on the table, so the new screens get their share */
    if (rnd() < 0.04) {
      const g = ['daumenblitz', 'loeffelreflex', 'lippenlesen', 'gedankenleser', 'ketchup', 'zwiebel', 'tastbeutel', 'flaschenflip'][Math.floor(rnd() * 8)];
      const f = ['duellGast', 'duell', 'solo', 'team'][Math.floor(rnd() * 4)];
      const hc = rnd() < 0.3;
      await ev("var r = R(); if (r && !r.finished && !r.pending) { if (" + hc + ") r.pending = prepHcStep(r, { kind: 'handicap', track: currentTrack().id, main: currentMain() }); else { var ctx = { focus: r.who.slice(), together: r.together, variant: r.variant, themes: themesOf(r.who) }; r.pending = makeGameStep(currentMain(), ctx, '" + g + "', '" + f + "'); r.pending.track = currentTrack().id; r.pending.unitNo = currentTrack().pos + 1; } snapshot('task'); commit(); go('step'); }").catch(e => errors.push('force: ' + e.message));
    }
    /* and now and then one of the rounds from the bonus cards */
    if (rnd() < 0.03) {
      const gid = ['umfrage', 'sprueche', 'galerie', 'waere'][Math.floor(rnd() * 4)];
      await ev("var r = R(); if (r && !r.finished && !r.pending) { var _c = ggChoose; ggChoose = function (c) { return c.filter(function (g) { return g.id === '" + gid + "'; })[0] || c[0]; }; var st = makeGuestGameStep(currentMain(), null, maxProgress(r)); ggChoose = _c; if (st) { st.track = currentTrack().id; st.unitNo = currentTrack().pos + 1; snapshot('task'); r.pending = st; commit(); go('step'); } }").catch(e => errors.push('force gg: ' + e.message));
    }
    const acts = await page.$$eval('#app [data-act]:not([disabled]), #app [data-bz]', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((e, k) => ({ k, act: e.getAttribute('data-act') || 'bz', bz: e.hasAttribute('data-bz') })));
    const inputs = await page.$$('#app input[type="text"], #app input[type="number"]');
    if (!acts.length) { stuck++; if (stuck > 3) { await ev("go(S.event ? 'home' : 'welcome')"); stuck = 0; } continue; }
    stuck = 0;
    if (inputs.length && rnd() < 0.08) {
      const inp = inputs[Math.floor(rnd() * inputs.length)];
      try { await inp.fill(['Tom', '12', 'Kalle', '', '7,5', 'Tante Rosi'][Math.floor(rnd() * 6)], { timeout: 500 }); } catch (e) {}
      continue;
    }
    /* avoid ending the whole evening too often */
    let pickA = acts[Math.floor(rnd() * acts.length)];
    if (['resetAll', 'endRun', 'askConfirm', 'tourSkip', 'copyText'].indexOf(pickA.act) >= 0 && rnd() < 0.85) pickA = acts[Math.floor(rnd() * acts.length)];
    seen[pickA.act] = (seen[pickA.act] || 0) + 1;
    try {
      const handle = (await page.$$('#app [data-act]:not([disabled]), #app [data-bz]')).filter(Boolean);
      const vis = [];
      for (const h of handle) { const b = await h.boundingBox(); if (b && b.width > 0 && b.height > 0) vis.push(h); }
      const el = vis[pickA.k];
      if (!el) continue;
      if (pickA.bz) await el.dispatchEvent('pointerdown'); else await el.click({ timeout: 800, force: true });
    } catch (e) { /* element went away, fine */ }
    if (rnd() < 0.05) await page.waitForTimeout(400 + Math.floor(rnd() * 2600));
    if (errors.length > 5) break;
  }
  const state = await ev("JSON.stringify({ screen: UI.screen, run: !!S.run, steps: S.run && S.run.steps, hc: S.run && (S.run.hc || []).length, duel: S.run && Object.keys(S.run.duel || {}).length })").catch(() => '?');
  console.log('state', state);
  console.log('acts used', Object.keys(seen).length, Object.keys(seen).filter(k => /^(ch|hc|gl|kc|bz|lr|lip|sp)/.test(k)).map(k => k + ':' + seen[k]).join(' '));
  console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
  if (errors.length) process.exitCode = 1;
})();
