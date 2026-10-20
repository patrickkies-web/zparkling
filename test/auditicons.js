/* screenshots of every screen: node test/shotsall.js [outdir] */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, process.argv[2] || 'audit'); const W = +(process.argv[3] || 375); const issues = {};
fs.mkdirSync(OUT, { recursive: true });
const DUMPS = path.join(__dirname, 'dumps');
(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const mk = async (tourDone, hash) => {
    const page = await browser.newPage({ viewport: { width: W, height: 812 } });
    page.on('pageerror', e => errors.push(page.__name + ': ' + e.message));
    await page.addInitScript((td) => { try { if (td) localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); } catch (e) {} }, tourDone);
    await page.addInitScript(() => { window.__RESET = ':where(button) { -webkit-appearance: none; appearance: none; padding: 1px 6px; font-size: 13.3333px; border-radius: 0; } :where(input:not([type]), input[type="text"], input[type="number"], input[type="search"], input[type="tel"], input[type="email"], input[type="url"], textarea) { -webkit-appearance: none; appearance: none; }'; });
    await page.goto('file://' + path.join(__dirname, 'debug.html') + (hash || ''));
    return page;
  };
  const ev = (page, code) => page.evaluate(c => window.__ev(c), code);
  const shot = async (page, name, opt) => {
    page.__name = name;
    await page.waitForTimeout((opt && opt.wait) || 350);
    const h = await page.evaluate(() => { const b = document.querySelector('.body'); return b ? b.scrollHeight + (document.querySelector('.foot') ? document.querySelector('.foot').offsetHeight : 0) + 140 : 812; });
    if (!(opt && opt.fixed)) await page.setViewportSize({ width: W, height: Math.max(812, Math.min(4000, h)) });
    await page.waitForTimeout(150);
    const res = await page.evaluate(() => {
      const out = [];
      const name = el => { let s = el.tagName.toLowerCase(); if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.'); return s; };
      document.querySelectorAll('#app svg.emb, #app svg.ic').forEach(svg => {
        const r = svg.getBoundingClientRect(); if (r.width < 1 || r.height < 1) return;
        const cs = getComputedStyle(svg); if (cs.visibility === 'hidden') return;
        const aw = +svg.getAttribute('width'), ah = +svg.getAttribute('height');
        const p = svg.parentElement, pr = p.getBoundingClientRect(), pp = p.parentElement ? name(p.parentElement) : '';
        if (aw && ah && Math.abs(r.width / r.height - aw / ah) > 0.06) out.push(['squish', name(p) + ' < ' + pp, aw + 'x' + ah + ' -> ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0)]);
        else if (aw && r.width < aw * 0.85 && !/transform|scale/.test(cs.transform + '')) out.push(['shrunk', name(p) + ' < ' + pp, aw + ' -> ' + r.width.toFixed(0)]);
        const pcs = getComputedStyle(p);
        if (pr.width > 2 && pr.height > 2 && pcs.overflow !== 'visible' + 'x' && (r.left < pr.left - 2 || r.right > pr.right + 2 || r.top < pr.top - 2 || r.bottom > pr.bottom + 2)) out.push(['overflow', name(p) + ' < ' + pp, 'svg ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0) + ' in ' + pr.width.toFixed(0) + 'x' + pr.height.toFixed(0)]);
      });
      /* things that should be round or square */
      document.querySelectorAll('#app .t-face, #app .tile-ic, #app .glvl-e, #app .glu-e, #app .qx-row-ic, #app .qx-fam-ic, #app .jk-e, #app .jk-chip, #app .gk-dhead-e, #app .rb-e, #app .qx-ic, #app .ini, #app .swatch, #app .checkbox, #app .radio, #app .iconbtn, #app .stackav > *, #app .gabc, #app .gb-no, #app .lstep, #app .av').forEach(el => {
        const r = el.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
        if (el.classList.contains('lstep')) return;
        if (Math.abs(r.width - r.height) > 2) out.push(['notsquare', name(el) + ' < ' + (el.parentElement ? name(el.parentElement) : ''), r.width.toFixed(0) + 'x' + r.height.toFixed(0)]);
      });
      /* A/B: the reset for iPhone must not move anything in Chromium */
      {
        const els = [...document.querySelectorAll('#app button, #app input, #app textarea, #kbbar button')];
        const meas = () => els.map(b => { const r = b.getBoundingClientRect(), sv = b.querySelector && b.querySelector('svg'), q = sv ? sv.getBoundingClientRect() : null, cs = getComputedStyle(b); return [r.left, r.top, r.width, r.height, q ? q.left : 0, q ? q.top : 0, q ? q.width : 0].map(v => Math.round(v * 10) / 10).join(',') + '|' + cs.backgroundColor + '|' + cs.borderTopWidth + '|' + cs.borderTopLeftRadius + '|' + cs.boxShadow; });
        const A0 = meas(), st = document.createElement('style'); st.textContent = window.__RESET || ''; document.head.appendChild(st); const B0 = meas(); st.remove();
        els.forEach((el, i) => { if (A0[i] !== B0[i]) out.push(['abdiff', name(el), A0[i] + ' -> ' + B0[i]]); });
      }
      /* buttons that live on the browser's own padding and font: iPhone Safari uses other defaults */
      document.querySelectorAll('#app button, #kbbar button').forEach(el => {
        const cs = getComputedStyle(el), r = el.getBoundingClientRect(); if (r.width < 2) return;
        if (cs.paddingLeft === '6px' && cs.paddingTop === '1px') out.push(['uapad', name(el) + ' < ' + (el.parentElement ? name(el.parentElement) : ''), (el.querySelector('svg') ? 'svg ' : '') + r.width.toFixed(0) + 'x' + r.height.toFixed(0)]);
        if (cs.fontSize === '13.3333px' && el.textContent.trim()) out.push(['uafont', name(el), JSON.stringify(el.textContent.trim().slice(0, 20))]);
        if (cs.color === 'rgb(0, 0, 0)') out.push(['uacolor', name(el), '']);
      });
      /* icon-only chips and buttons: the symbol sits in the middle */
      document.querySelectorAll('#app button, #app span, #app a, #app div, #app label').forEach(el => {
        if (el.children.length !== 1 || el.children[0].tagName.toLowerCase() !== 'svg' || el.textContent.trim()) return;
        const cs = getComputedStyle(el), bg = cs.backgroundColor, bw = parseFloat(cs.borderTopWidth) || 0;
        if ((bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') && !bw && cs.backgroundImage === 'none') return;
        const r = el.getBoundingClientRect(), q = el.children[0].getBoundingClientRect(); if (r.width < 12 || q.width < 4) return;
        const dx = (q.left + q.right) / 2 - (r.left + r.right) / 2, dy = (q.top + q.bottom) / 2 - (r.top + r.bottom) / 2;
        if (Math.abs(dx) > 1.6 || Math.abs(dy) > 1.6) out.push(['offcenter', name(el) + ' < ' + (el.parentElement ? name(el.parentElement) : ''), 'dx ' + dx.toFixed(1) + ' dy ' + dy.toFixed(1) + ' in ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0)]);
        if (Math.abs(r.width - r.height) > 2 && parseFloat(cs.borderTopLeftRadius) >= Math.min(r.width, r.height) / 2 - 1) out.push(['oval', name(el) + ' < ' + (el.parentElement ? name(el.parentElement) : ''), r.width.toFixed(0) + 'x' + r.height.toFixed(0)]);
      });
      return out;
    });
    res.forEach(x => { const k = x[0] + ' | ' + x[1] + ' | ' + x[2]; (issues[k] = issues[k] || []).push(name); });
    await page.setViewportSize({ width: W, height: 812 });
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
  Object.keys(issues).sort().forEach(k => console.log(k + '   [' + issues[k].length + '] ' + issues[k].slice(0, 3).join(', ')));
  console.log(errors.length ? errors.join('\n') : 'NO PAGE ERRORS');
  await browser.close();
})();
