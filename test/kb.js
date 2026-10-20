/* v41: the keyboard never hides a field. A fake visualViewport stands in for the phone's keyboard. node test/kb.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs'); const OUT = path.join(__dirname, 'v41'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(), errors = [], notes = [];
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
  p.on('pageerror', e => errors.push(e.message));
  await p.addInitScript(() => {
    localStorage.setItem('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 })); localStorage.setItem('altesocke.sound', 'aus');
    /* a visualViewport we can shrink like a keyboard would */
    const ls = {}; const fake = { height: window.innerHeight, width: window.innerWidth, offsetTop: 0, offsetLeft: 0, scale: 1,
      addEventListener: (t, f) => { (ls[t] = ls[t] || []).push(f); }, removeEventListener: () => {} };
    window.__kb = (h) => { fake.height = window.innerHeight - h; (ls.resize || []).forEach(f => f()); };
    Object.defineProperty(window, 'visualViewport', { value: fake, configurable: true });
  });
  await p.goto('file://' + path.join(__dirname, 'debug.html'));
  const ev = c => p.evaluate(c => window.__ev(c), c);
  await ev("A.loadDemo(); A.openGuestForm()"); await p.waitForTimeout(500); await ev("A.gWelcome()"); await p.waitForTimeout(900);
  await ev("A.gAdd({ v: 'luege' })"); await p.waitForTimeout(500);
  notes.push('kbbar present: ' + await p.evaluate(() => !!document.getElementById('kbbar')));
  /* submit with the name missing: the name field gets the focus */
  await ev("A.gSubmit()"); await p.waitForTimeout(600);
  notes.push('after submit, active: ' + await p.evaluate(() => document.activeElement && document.activeElement.id));
  /* the keyboard comes up (336px): the app shrinks, the field stays visible */
  await p.evaluate(() => window.__kb(336)); await p.waitForTimeout(700);
  const st = await p.evaluate(() => { const w = document.querySelector('.wrap'), a = document.activeElement, r = a.getBoundingClientRect(); return { kb: document.body.classList.contains('kb'), wrapH: w.getBoundingClientRect().height, fieldTop: r.top, fieldBottom: r.bottom, foot: !!document.querySelector('.foot') && getComputedStyle(document.querySelector('.foot')).display }; });
  notes.push('keyboard up: ' + JSON.stringify(st));
  if (!st.kb || st.wrapH > 844 - 336 + 1 || st.fieldBottom > 844 - 336) errors.push('field hidden behind the keyboard: ' + JSON.stringify(st));
  await p.screenshot({ path: path.join(OUT, 'phone-kb-name.png') });
  /* now the name is there, a card is missing: submit jumps into the card */
  await p.evaluate(() => window.__kb(0)); await p.waitForTimeout(300);
  await ev("gForm().author = 'Kim'; gRender()"); await p.waitForTimeout(300);
  await ev("A.gSubmit()"); await p.waitForTimeout(600);
  const a2 = await p.evaluate(() => { const a = document.activeElement; return a && a.getAttribute('data-bind'); });
  notes.push('after submit 2, active: ' + a2);
  await p.evaluate(() => window.__kb(336)); await p.waitForTimeout(700);
  const st2 = await p.evaluate(() => { const a = document.activeElement, r = a.getBoundingClientRect(), c = a.closest('.gcard'); return { fieldTop: r.top, fieldBottom: r.bottom, cardMarked: c && c.className, hint: a.getAttribute('enterkeyhint') }; });
  notes.push('card jump: ' + JSON.stringify(st2));
  if (st2.fieldBottom > 844 - 336 || st2.fieldTop < 0) errors.push('card field hidden: ' + JSON.stringify(st2));
  await p.screenshot({ path: path.join(OUT, 'phone-kb-card.png') });
  /* the last field of a card says Fertig */
  const hints = await p.evaluate(() => [...document.querySelectorAll('.gcard input[data-bind], .gcard textarea[data-bind]')].map(f => f.getAttribute('enterkeyhint')));
  notes.push('hints: ' + hints.join(','));
  await b.close(); console.log(notes.join('\n')); console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no errors');
})();
