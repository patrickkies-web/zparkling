/* icon audit on the moving parts: level-up, stickers, card overlay, draw button, joker */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path');
const W = +(process.argv[2] || 375);
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: 812 } });
  const errors = [], issues = {};
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => { localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus'); });
  await page.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => page.evaluate(c => window.__ev(c), c);
  const audit = async (name) => {
    await page.evaluate(() => document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }));
    const res = await page.evaluate(() => {
      const out = [], nm = el => { let s = el.tagName.toLowerCase(); if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.'); return s; };
      document.querySelectorAll('#app svg.emb, #app svg.ic').forEach(svg => {
        const r = svg.getBoundingClientRect(); if (r.width < 1) return;
        const aw = +svg.getAttribute('width'), ah = +svg.getAttribute('height'), p = svg.parentElement, pr = p.getBoundingClientRect();
        if (aw && ah && Math.abs(r.width / r.height - aw / ah) > 0.06) out.push(['squish', nm(p), aw + 'x' + ah + '->' + r.width.toFixed(0) + 'x' + r.height.toFixed(0)]);
        if (pr.width > 2 && (r.left < pr.left - 2 || r.right > pr.right + 2 || r.top < pr.top - 2 || r.bottom > pr.bottom + 2)) out.push(['overflow', nm(p) + ' < ' + nm(p.parentElement), r.width.toFixed(0) + 'x' + r.height.toFixed(0) + ' in ' + pr.width.toFixed(0) + 'x' + pr.height.toFixed(0)]);
      });
      return out;
    });
    res.forEach(x => { const k = x.join(' | '); (issues[k] = issues[k] || []).push(name); });
    await page.screenshot({ path: path.join(__dirname, 'audit-' + name + '.png') });
  };
  const force = (type, n) => "(function(){ var _p = gkPickType; gkPickType = function(){ return { type: '" + type + "', n: " + n + " }; }; gkOpen(); gkPickType = _p; })()";
  await ev("A.loadDemo(); A.openGuestForm(); gPass().welcomed = true; UI.gForm.author = 'Paula'; A.gAdd({ v: 'worte' }); var it = gForm().items[0]; it.forId = E().focus[0].id; it.trait = 'herzlich'; it.interest='Kochen'; gRender();");
  await ev("gPass().lvMax = -1; gPass().ptsMax = 0; UI.gPts = 0; gPassFx(true)"); await page.waitForTimeout(300); await audit('levelup');
  await ev("gHudFx('st', '<span class=\"ghfx-e\">' + emb('cake', 30) + '</span><span class=\"stack\"><small>Sticker freigeschaltet</small><b>Test</b></span>', 2000)"); await page.waitForTimeout(300); await audit('sticker');
  await page.waitForTimeout(2600);
  await ev("(document.querySelector('.body')||{}).scrollTop = 99999"); await page.waitForTimeout(300); await audit('drawbtn');
  for (const t of ['wenn', 'umfrage', 'spruch', 'joker', 'portrait']) { await ev(force(t, 0)); await page.waitForTimeout(5400); await audit('card-' + t); if (t === 'portrait') { await ev('A.gkStart()'); await page.waitForTimeout(300); await audit('paper'); } await ev('A.gkLater()'); await page.waitForTimeout(600); await ev('gPass().burned = 0'); }
  await ev("A.gSubmit()"); await page.waitForTimeout(1500); await audit('finale');
  await ev("A.loadDemo(); A.openRun(); A.startRun(); var r = R(), main = r.who[0]; snapshot('task'); r.pending = makeGameStep(main, { focus: [main], together: r.together, variant: r.variant, themes: themesOf(r.who) }, 'zwiebel', 'solo'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; go('step'); A.stepResolve({ v: 'fail' });");
  await page.waitForTimeout(900); await audit('result-joker');
  await ev("A.jkAsk({ i: '0' })"); await page.waitForTimeout(400); await audit('result-ask');
  Object.keys(issues).sort().forEach(k => console.log(k + '  [' + issues[k].join(', ') + ']'));
  console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no page errors');
  await browser.close();
})();
