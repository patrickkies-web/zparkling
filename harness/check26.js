/* targeted checks: the Joker card, the upright drawings. node harness/check26.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
function party(seed) { const c = load({ seed }); c.A.loadDemo(); return c; }
function guest(c, name) {
  c.A.openGuestForm(); c.gPass().welcomed = true; c.UI.gForm.author = name || 'Paula';
  c.A.gAdd({ v: 'worte' }); const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen';
  c.gRender();
}
const holes = s => /\{[A-Za-z]+\}|undefined|NaN/.test(s);

/* 1. drawing a Joker */
{
  const c = party(1);
  c.S.questions = c.S.questions.filter(q => q.type !== 'joker');
  guest(c); c.GK_JOKER_P = 1;
  const p = c.gkPickType();
  ok(p.type === 'joker', 'With luck, the pack holds the Joker');
  c.gkOpen(); const k = c.UI.gk;
  ok(k.type === 'joker' && k.rar === 'jok' && k.pts === 25 && c.gkValid(k), 'Joker card: its own rarity, 25 points, nothing to fill in');
  const html = c.V.guestForm();
  ok(/Der Joker!/.test(html) && /Bedingung/.test(html) && !holes(html.replace(/data-[a-z]+="[^"]*"|--[a-z0-9-]+:[^;"]*/g, '')), 'The Joker card explains itself');
  c.setBind('gk.text', 'Nur gegen eine Umarmung, und zwar eine richtig lange, bitte schön!!');
  ok(c.UI.gk.text.length <= 60, 'The condition is cut at 60 characters');
  c.setBind('gk.text', 'Nur gegen eine Umarmung');
  c.A.gkDone(); c.flushTimers();
  ok(c.gForm().cards.length === 1 && c.gForm().cards[0].type === 'joker' && c.gForm().cards[0].text === 'Nur gegen eine Umarmung', 'The Joker lands in the list with its condition');
  ok(c.gkPickType().type !== 'joker', 'One Joker per guest');
  c.A.gSubmit();
  const q = c.S.questions.filter(x => x.type === 'joker')[0];
  ok(q && q.status === 'offen' && q.author === 'Paula' && q.forId === '', 'It reaches the master like any contribution');
  ok(c.gPass().joker === true, 'The pass remembers the Joker');
  c.A.qAnother(); c.A.gAdd({ v: 'worte' }); const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'a'; it.interest = 'b';
  ok(c.gkPickType().type !== 'joker', 'No second Joker on the next visit');
}
/* 2. only a few per party */
{
  const c = party(2);
  guest(c); c.GK_JOKER_P = 1;
  const cap = c.gkJokerCap(), have = c.guestSubmissions().filter(q => q.type === 'joker').length;
  for (let i = have; i < cap; i++) c.S.questions.push({ id: 'jk' + i, t: 1, author: 'J' + i, forId: '', type: 'joker', text: '', status: 'ok', used: false, options: [], correct: 0 });
  ok(c.gkPickType().type !== 'joker', 'When ' + cap + ' Jokers are out, no more come');
}
/* 3. the master sees who holds one */
{
  const c = party(3);
  const free = c.jokerFree().map(q => q.author);
  ok(free.length === 2 && free.indexOf('Max') >= 0 && free.indexOf('Sara') >= 0, 'Demo: Max and Sara hold a Joker');
  c.go('questions');
  const h = c.V.questions();
  c.A.openCards({ from: 'questions' }); const hc = c.V.cards();
  ok(/Im Umlauf/.test(h) && /Max/.test(h) && /Der Joker|Joker/.test(hc) && /Nur gegen eine Umarmung/.test(hc), 'The guests page shows the cards, the card area the Jokers with their conditions');
  c.A.openRun(); c.A.startRun();
  ok(/Joker im Umlauf/.test(c.V.run()) && /Max/.test(c.V.run()), 'The run screen shows who holds one');
}
/* 4. using a Joker */
function lostStep(c) {
  const r = c.R(), main = r.who[0];
  c.snapshot('task');
  r.pending = c.makeGameStep(main, { focus: [main], together: r.together, variant: r.variant, themes: c.themesOf(r.who) }, 'zwiebel', 'solo');
  r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; c.go('step');
  c.A.stepResolve({ v: 'fail' });
  return r.pending;
}
{
  const c = party(4);
  c.A.openRun(); c.A.startRun();
  const P = lostStep(c), row = P.result.rows[0], main = row.pid;
  ok(row && row.n === 1 && c.jokerRowOk(row), 'A lost game: one drink, a Joker could help');
  ok(/Joker fragen\?/.test(c.renderStepScreen(P, false)) && /Max oder Sara/.test(c.renderStepScreen(P, false)), 'Under the result: ask for a Joker, with who holds one');
  c.A.jkAsk({ i: '0' });
  const html = c.renderStepScreen(P, false);
  ok(/Joker fragen/.test(html) && /Gibt frei/.test(html) && /Keiner gibt frei/.test(html), 'Asking shows who holds one, the guest decides');
  const before = c.drinksOf(main), credit = (c.S.jokerCredit || {})[main] || 0, max = c.jokerFree()[0];
  c.A.jkUse({ i: '0', id: max.id });
  ok(row.n === 0 && row.freed && !row.done && /Joker von/.test(row.note), 'The drink is gone, the row says whose Joker it was');
  ok(max.used && max.usedFor === c.person(main).name, 'The Joker is spent');
  ok(((c.S.jokerCredit || {})[main] || 0) === credit + 1, 'The Pilot does not hand the drink back later');
  ok(c.jokerFree().length === 1, 'One Joker left');
  c.A.jkUse({ i: '0', id: c.jokerFree()[0].id });
  ok(c.jokerFree().length === 1, 'A freed row cannot take a second Joker');
  c.A.stepContinue();
  ok(c.drinksOf(main) === before, 'Nothing was booked in the counter');
  ok(c.R().log.some(l => /Joker: /.test(l.text)), 'The log notes it');
  /* undo brings the Joker back */
  c.A.runUndo();
  ok(c.S.questions.filter(q => q.id === max.id)[0].used === false, 'Undo gives the Joker back');
}
/* 5. what a Joker cannot do */
{
  const c = party(5);
  c.A.openRun(); c.A.startRun();
  const P = lostStep(c), row = P.result.rows[0];
  c.A.stepJoker({ i: '0' });
  ok(row.water && !c.jokerRowOk(row), 'A row already on water needs no Joker');
  ok(!c.jokerRowOk({ pid: '', name: 'Alle', n: 1, group: true }), 'Guests drinking as a group: no Joker');
  ok(!c.jokerRowOk({ pid: 'x', name: 'Kalle', n: 1 }), 'Only for the birthday people');
  c.S.questions.forEach(q => { if (q.type === 'joker') q.status = 'nein'; });
  ok(c.jokerFree().length === 0, 'A rejected Joker does not count');
  c.S.questions.forEach(q => { if (q.type === 'joker') q.status = 'offen'; });
  ok(c.jokerFree().length === 0, 'Nor one waiting for approval');
}
/* 6. upright drawings */
{
  const c = party(6);
  const s = [[0, 0, 0, 999, 999, 500, 500]];
  const up = c.gkEncode(s, true), sq = c.gkEncode(s);
  ok(/^P\|/.test(up) && !/^P/.test(sq), 'New drawings are marked upright');
  ok(JSON.stringify(c.gkStrokes(up)) === JSON.stringify(s), 'The mark does not disturb the strokes');
  const a = c.drawSvg(up, 120), b = c.drawSvg(sq, 120);
  ok(/viewBox="0 0 750 1000"/.test(a) && /height="160"/.test(a) && /L749 999/.test(a), 'Upright drawings keep their shape');
  ok(/viewBox="0 0 1000 1000"/.test(b) && /height="120"/.test(b), 'Old square drawings still work');
  ok(c.GK_DRAW_SECS === 45, 'Drawing time: 45 seconds');
}
/* 7. the opening timeline is in order */
{
  const c = party(7), T = c.GK_T;
  ok(T.charge < T.tear && T.tear < T.rise && T.rise < T.flip && T.flip < T.flash2 && T.flash2 < T.stamp && T.stamp < T.panel && T.panel < T.focus, 'Charge, tear, rise, flip, stamp, panel in order');
  ok(T.tear - T.charge >= 2000, 'The charge takes more than two seconds');
  const fr = c.gkShakeFrames('leg'), amp = f => { const m = /translate\(([-\d.]+)px,([-\d.]+)px\)/.exec(f.transform); return Math.abs(+m[1]) + Math.abs(+m[2]); };
  const early = Math.max.apply(null, fr.slice(0, 40).map(amp)), late = Math.max.apply(null, fr.slice(180, 245).map(amp)), freeze = Math.max.apply(null, fr.slice(250).map(amp));
  ok(early < 1.2 && late > 6 && freeze < late / 3, 'The tremble starts tiny, grows big, freezes right before the tear (' + early.toFixed(1) + ' → ' + late.toFixed(1) + ' → ' + freeze.toFixed(1) + ')');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exitCode = fails ? 1 : 0;
