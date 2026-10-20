/* focused monkey: stays inside a running Kranz and hammers the new v22 screens. node test/monkeyrun.js [actions] [seed] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const N = +(process.argv[2] || 800), SEED = +(process.argv[3] || 1);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
(async () => {
  const rnd = rng(SEED);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 860 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message + ' @ ' + (e.stack || '').split('\n')[1]));
  page.on('dialog', d => d.accept());
  await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = code => page.evaluate(c => window.__ev(c), code);
  const JGA = !!process.env.MONKEY_JGA;
  await ev("A.loadDemo(); A.matPreset({v:'all'});" + (JGA ? " A.setEventAnlass({v:'jga'}); ['Kalle','Sabine','Ole','Ben'].forEach(function(n){ UI.crewName = n; A.crewAdd(); }); A.crewDeal();" : '') + " A.openRun(); A.startRun();");
  const seen = {}; let forced = 0, runs = 1, inv = [];
  const GAMES = ['daumenblitz', 'loeffelreflex', 'lippenlesen', 'gedankenleser', 'ketchup', 'zwiebel', 'tastbeutel', 'flaschenflip', 'pantomime', 'erklaeren', 'montagsmaler', 'rueckenmalen', 'kuechenwaage', 'topfecho'];
  for (let i = 0; i < N; i++) {
    /* keep it in the Kranz */
    await ev("if (!S.run || S.run.finished) { if (UI.screen !== 'finish' || Math.random() < 0.3) { A.openRun(); if (UI.screen === 'runSetup') A.startRun(); } } else if (['run','step','finish'].indexOf(UI.screen) < 0) go(S.run.pending ? 'step' : 'run');").catch(e => errors.push('keep: ' + e.message));
    if (rnd() < 0.12) {
      const g = GAMES[Math.floor(rnd() * GAMES.length)];
      const f = ['duellGast', 'duell', 'solo', 'team'][Math.floor(rnd() * 4)];
      const hc = rnd() < 0.25;
      forced++;
      await ev("var r = R(); if (r && !r.finished && !r.pending) { snapshot('task'); if (" + JGA + " && Math.random() < 0.5) { if (Math.random() < 0.3 && crewWithRoles().length) { r.pending = prepCrewStep(r, { kind: 'crew', track: currentTrack().id, main: currentMain() }); } else { r.pending = makeMissionStep(currentMain(), r); r.pending.track = currentTrack().id; r.pending.unitNo = currentTrack().pos + 1; } } else if (" + hc + ") r.pending = prepHcStep(r, { kind: 'handicap', track: currentTrack().id, main: currentMain() }); else { var ctx = { focus: r.who.slice(), together: r.together, variant: r.variant, themes: themesOf(r.who) }; r.pending = makeGameStep(currentMain(), ctx, '" + g + "', '" + f + "'); r.pending.track = currentTrack().id; r.pending.unitNo = currentTrack().pos + 1; } commit(); go('step'); }").catch(e => errors.push('force: ' + e.message));
    }
    const vis = [];
    for (const h of await page.$$('#app [data-act]:not([disabled]), #app [data-bz]')) { const b = await h.boundingBox().catch(() => null); if (b && b.width > 0 && b.height > 0) vis.push(h); }
    if (!vis.length) { await page.waitForTimeout(200); continue; }
    const inputs = await page.$$('#app input[type="text"]');
    if (inputs.length && rnd() < 0.1) { try { await inputs[Math.floor(rnd() * inputs.length)].fill(['Tom', 'Kalle', '', 'Tante Rosi', 'Lea'][Math.floor(rnd() * 5)], { timeout: 500 }); } catch (e) {} continue; }
    let el = vis[Math.floor(rnd() * vis.length)];
    let act = await el.evaluate(e => e.getAttribute('data-act') || 'bz').catch(() => '?');
    if (['resetAll', 'endRun', 'askConfirm', 'tourSkip', 'copyText', 'openTour', 'goHome'].indexOf(act) >= 0 && rnd() < 0.9) { el = vis[Math.floor(rnd() * vis.length)]; act = await el.evaluate(e => e.getAttribute('data-act') || 'bz').catch(() => '?'); }
    seen[act] = (seen[act] || 0) + 1;
    try { if (act === 'bz') await el.dispatchEvent('pointerdown'); else await el.click({ timeout: 800, force: true }); } catch (e) {}
    if (rnd() < 0.08) await page.waitForTimeout(300 + Math.floor(rnd() * 3000));
    /* invariant: never more than one drink per person per step, never past the max */
    if (i % 25 === 0) {
      const v = await ev("(function(){ var out=[]; var M=E().max; S.people.forEach(function(p){ if (drinksOf(p.id) > M) out.push('max '+p.name); }); return out.join(','); })()").catch(e => 'eval ' + e.message);
      if (v) inv.push(v);
    }
    if (errors.length > 5) break;
  }
  const state = await ev("JSON.stringify({ screen: UI.screen, steps: S.run && S.run.steps, hc: S.run && (S.run.hc || []).length, duel: S.run && Object.keys(S.run.duel || {}).length })").catch(() => '?');
  console.log('state', state, 'forced', forced);
  console.log('new acts', Object.keys(seen).filter(k => /^(ch|hc|gl|kc|bz|lr|lip|sp|term|crew|pack|cfg)/.test(k) || k === 'stepResolve' || k === 'runOther').map(k => k + ':' + seen[k]).join(' '));
  console.log(inv.length ? 'INVARIANT ' + inv.join(' | ') : 'invariants ok');
  console.log(errors.length ? 'ERRORS\n' + errors.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
  if (errors.length || inv.length) process.exitCode = 1;
})();
