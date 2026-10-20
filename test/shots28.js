/* v28 in the browser: setup steps, the cheer, the cockpit, words on buttons, menus. node test/shots28.js [W] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const W = +(process.argv[2] || 375);
const OUT = path.join(__dirname, 'v28-' + W);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const errors = [], notes = [];
  const mk = async () => {
    const ctx = await browser.newContext({ viewport: { width: W, height: 812 }, deviceScaleFactor: 2, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_|net::/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { try { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); } catch (e) {} });
    await page.goto('file://' + path.join(__dirname, 'debug.html'));
    return page;
  };
  const ev = (page, code) => page.evaluate(c => window.__ev(c), code);
  const snap = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
  const full = async (page, name) => {
    await page.waitForTimeout(350);
    const h = await page.evaluate(() => { const b = document.querySelector('.body'); return b ? b.scrollHeight + (document.querySelector('.head') ? document.querySelector('.head').offsetHeight : 0) + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + 40 : 812; });
    await page.setViewportSize({ width: W, height: Math.max(812, Math.min(3000, h)) }); await page.waitForTimeout(250);
    await snap(page, name); await page.setViewportSize({ width: W, height: 812 });
  };
  const at = (page, t) => page.evaluate(t => { document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = t; } catch (e) {} }); }, t);
  /* nothing may stick out of the screen sideways */
  const wide = async (page, name) => { const o = await page.evaluate(W => { const out = []; document.querySelectorAll('#app *').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1) && !el.closest('.kick-rays, .kick-conf, .gl-rays, .fx, .qx-jump, .av-cats, .ck-svg')) out.push(el.tagName + '.' + (el.className && el.className.baseVal == null ? el.className : '') + ' ' + Math.round(r.left) + '-' + Math.round(r.right)); }); return out.slice(0, 5); }, W); if (o.length) errors.push(name + ': sticks out ' + o.join(' | ')); };

  /* 1. setup in three steps, then the cheer */
  let p = await mk();
  await ev(p, "A.loadDemo(); A.matPreset({ v: 'all' }); A.openRun();");
  await full(p, '01-setup-1'); await wide(p, 'setup-1');
  await p.tap('[data-act="cfgNext"]'); await full(p, '02-setup-2'); await wide(p, 'setup-2');
  await p.tap('[data-act="cfgNext"]'); await full(p, '03-setup-3'); await wide(p, 'setup-3');
  await p.tap('[data-act="startRun"]'); await ev(p, 'clearTimeout(UI.kickT)');
  for (const t of [60, 200, 380, 650, 1000, 1400]) { await at(p, t); await snap(p, '10-kick-' + String(t).padStart(4, '0')); }
  await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); }); UI.kickT = setTimeout(kickClose, 600);');
  await p.waitForTimeout(2200);
  const kickGone = await ev(p, "!document.querySelector('.kick')");
  if (!kickGone) errors.push('the cheer did not go away');
  await snap(p, '20-cockpit'); await full(p, '21-cockpit-full'); await wide(p, 'cockpit');
  /* one station further, the ring reacts */
  await ev(p, "var r = R(); snapshot('task'); r.pending = makeGameStep(r.who[0], { focus: [r.who[0]], together: r.together, variant: r.variant, themes: themesOf(r.who) }, 'zwiebel', 'solo'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; go('step');");
  await p.waitForTimeout(300); await snap(p, '30-step-head'); await wide(p, 'step');
  for (let k = 0; k < 3; k++) {
    await ev(p, "var r = R(); r.tracks[0].pos += 1; r.steps += 1;");
  }
  await ev(p, "go('run')");
  for (const t of [0, 250, 500, 800, 1300]) { await at(p, t); await snap(p, '31-ring-' + String(t).padStart(4, '0')); }
  await ev(p, 'document.getAnimations().forEach(function(a){ a.play(); })');
  await p.tap('[data-act="askConfirm"][data-v="endRun"]'); await p.waitForTimeout(500); await snap(p, '32-end-confirm');
  await p.close();

  /* 2. other kinds of evenings */
  for (const [anl, setup, tag] of [['treppe', '', 'zeit'], ['geburtstag', "var c = cfgDefaults(); c.together = 'gegeneinander'; c.variant = 'runden';", 'race'], ['party', "var c = cfgDefaults(); c.variant = 'wuerfel';", 'dice']]) {
    p = await mk();
    await ev(p, "A.loadDemo(); A.matPreset({ v: 'all' }); A.setEventAnlass({ v: '" + anl + "' }); A.openRun(); " + setup + " UI.cfgStep = 3; A.startRun(); kickClose();");
    if (tag === 'race') await ev(p, "R().tracks[0].pos = 6; R().tracks[1].pos = 4; R().steps = 10; render();");
    await p.waitForTimeout(900); await full(p, '40-cockpit-' + tag); await wide(p, 'cockpit-' + tag);
    await p.close();
  }

  /* 3. the menus */
  p = await mk();
  await ev(p, "A.loadDemo(); go('games');"); await full(p, '50-games'); await wide(p, 'games');
  await ev(p, "go('settings');"); await full(p, '51-settings'); await wide(p, 'settings');
  await ev(p, "go('questions');"); await p.waitForTimeout(500); await snap(p, '52-questions-top');
  await p.tap('[data-act="jump"][data-v="qs-runden"]'); await p.waitForTimeout(900); await snap(p, '53-questions-jump');
  const vis = await ev(p, "(function(){ var b = document.querySelector('.body'), h = document.getElementById('qs-runden'), j = document.querySelector('.qx-jump'); var hb = h.getBoundingClientRect(), jb = j.getBoundingClientRect(); return Math.round(hb.top - jb.bottom); })()");
  if (vis < 0 || vis > 60) errors.push('jump landed badly: heading is ' + vis + 'px below the chips'); else notes.push('jump: heading ' + vis + 'px under the chips');
  await ev(p, "go('home');"); await snap(p, '54-home');
  await ev(p, "A.openMaterial({ from: 'games' })"); await p.waitForTimeout(300); await snap(p, '55-material-head');
  await p.close();

  await browser.close();
  console.log(notes.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
