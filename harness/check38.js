/* v38: date fields do not re-render while picking, accessories when sweeping, the master's guided entry, the slot machine. node harness/check38.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
const holes = s => /undefined|NaN|\[object|null</.test(s.replace(/data-[a-z]+="[^"]*"/g, ''));
function party(seed, anlass) { const c = load({ seed }); c.A.loadDemo(); c.A.matPreset({ v: 'all' }); if (anlass) c.A.setEventAnlass({ v: anlass }); return c; }

/* 1. picking a date does not rebuild the page (iPhone closed the picker) */
{
  const c = party(1); c.go('pass');
  const before = c.app.innerHTML; c.setBind('pass.date', '2026-12-24');
  ok(c.UI.passDate === '2026-12-24' && c.app.innerHTML === before && c.UI.dateDirty === 'passDate', 'A picked date is kept, the page waits until the field is left');
}
/* 2. sweeping: only the number of accessories; every four minutes a chance */
{
  const c = party(2, 'treppe');
  c.A.openRun(); c.A.cfgNext();
  let h = c.V.runSetup();
  ok(/Wie viele Teile\?/.test(h) && /acc-step first">Zahnbürste/.test(h) && /acc-step[^"]*last">Besen/.test(h) && !/accName/.test(h), 'Setup: only the count, from the toothbrush to the broom');
  c.A.cfgAccN({ d: '1' }); ok(c.cfgDefaults().accN === 5, 'The count goes up');
  c.A.cfgNext(); h = c.V.runSetup();
  ok(!/Zubehör-Wechsel/.test(h), 'No accessory extras on step 3');
  c.A.startRun(); c.kickClose(); const r = c.R(); r.bud.on = false;
  ok(r.acc.items.length === 5 && r.acc.items[0] === 'Zahnbürste' && r.acc.items[4] === 'Besen' && !r.accPts.length, 'The run takes the ladder, no switch screens');
  r.pending = null; c.A.runNext();
  ok(!r.pending.accWin, 'Before four minutes: no chance');
  let tries = 0;
  do { r.pending = null; c.advance(4.1); c.A.runNext(); tries++; } while (!r.pending.accWin && tries < 30);
  const P = r.pending;
  ok(P.accWin && P.accWin.from === 'Zahnbürste' && P.accWin.to === r.acc.items[1], 'After four minutes a task carries the chance (' + P.kind + ')');
  ok(/Zubehör-Chance!/.test(c.V.step()), 'The task says what can be won');
  /* won: nobody of the track drinks */
  P.result = { title: 'x', rows: [{ pid: r.who[0], name: 'x', n: 0 }] };
  c.V.step();
  ok(P.accWin.done && P.accWin.won && c.trackById(P.accWin.track).accIdx === 1 && /Zubehör-Wechsel gewonnen!/.test(c.V.step()), 'Won: swap to the next part, a field in the result');
  r.pending = null; c.advance(4.1); tries = 0;
  do { r.pending = null; r.toasts = {}; r.zeit.lastCheck = c.now(); c.advance(0.5); c.A.runNext(); tries++; } while (!r.pending.accWin && tries < 30);
  const Q = r.pending; Q.result = { title: 'x', rows: [{ pid: r.who[0], name: 'x', n: 1 }] }; c.V.step();
  ok(Q.accWin && Q.accWin.done && !Q.accWin.won && c.trackById(Q.accWin.track).accIdx === 1 && /Kein Wechsel diesmal/.test(c.V.step()), 'Lost: the drink, no swap');
  ok(/Nächste Chance auf/.test(c.V.run()), 'The cockpit shows the part in the hand and the next chance');
}
/* 3. Kranz: no accessories any more */
{
  const c = party(3); c.A.openRun(); c.A.cfgNext(); c.A.cfgNext();
  ok(!/Zubehör/.test(c.V.runSetup()), 'Kranz: no accessory extras');
  c.A.startRun(); ok(c.R().acc.items.length === 0, 'Kranz run without accessories');
}
/* 4. the master enters, guided, with his own levels */
{
  const c = party(4);
  c.A.openGuestForm(); c.UI.gForm.author = 'Paula'; c.A.gAdd({ v: 'worte' });
  c.A.openMasterForm();
  let h = c.V.guestForm();
  ok(/Deine Fragen für den Abend/.test(h) && /id="mpass"/.test(h) && /Dein Plan für den Abend/.test(h) && /Als Nächstes|Alles drin/.test(h) && !holes(h), 'The master gets his own guided page with a level bar');
  ok(c.gForm().items.length === 0 && c.UI.gForm.items.length === 1, 'His form is his own, the guest test stays separate');
  const n0 = c.mSaved(), lv0 = c.mLevel(n0);
  c.A.gAdd({ v: 'schaetzen' }); const it = c.gForm().items[0];
  ok(it && it.type === 'schaetzen' && /class="gcard/.test(c.V.guestForm()), 'A tap in the plan adds a card like in the guest link');
  c.A.mSave(); ok(c.S.questions.length && /fehlt noch/i.test(c.UI.qErr), 'Unfinished cards are not saved');
  it.text = 'Wie viele Länder hat Jonas bereist?'; it.answer = '12';
  ok(c.gDone(it), 'Filled in: ready');
  for (let k = 0; k < 6; k++) { c.A.gAdd({ v: 'schaetzen' }); const x = c.gForm().items[c.gForm().items.length - 1]; x.text = 'Frage ' + k + ' über Jonas?'; x.answer = String(k + 2); }
  ok(/7 Einträge speichern/.test(c.V.guestForm()), 'The button counts what is ready');
  c.A.mSave();
  const mine = c.S.questions.filter(q => q.author === 'Spielleiter' && q.type === 'schaetzen');
  ok(c.mSaved() === n0 + 7 && mine.every(q => q.status === 'ok') && !c.gForm().items.length, 'Saved and approved at once');
  ok(c.mLevel(c.mSaved()).i > lv0.i ? (c.UI.mSaved.up && c.UI.gHudFx && c.UI.gHudFx.kind === 'lv') : true, 'A level-up shows in the bar at the top (' + lv0.l[1] + ' → ' + c.mLevel(c.mSaved()).l[1] + ')');
  ok(/gespeichert und freigegeben/.test(c.V.guestForm()), 'The page says it is saved');
}
/* 5. the slot machine on the landing page */
{
  const c = load({ seed: 5 }); c.go('landing'); const h = c.V.landing();
  ok(/id="lpslot"/.test(h) && (h.match(/class="lp-reel"/g) || []).length === 5 && c.EVENT_TYPES.every(t => h.indexOf('data-v="' + t.id + '"') >= 0) && !holes(h), 'Landing: a slot machine with every occasion');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exit(fails ? 1 : 0);
