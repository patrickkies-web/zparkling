/* v37: Weiterleiten and Regel as bonus cards, Trinkbuddys every five minutes, rules with one drink,
   the card area, closing the guest round, printing. node harness/check37.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
const holes = s => /undefined|NaN|\[object|null</.test(s.replace(/data-[a-z]+="[^"]*"/g, ''));
function party(seed) { const c = load({ seed }); c.A.loadDemo(); c.A.matPreset({ v: 'all' }); return c; }
function guest(c, name) { c.A.openGuestForm(); c.gPass().welcomed = true; c.UI.gForm.author = name || 'Paula'; c.A.gAdd({ v: 'worte' }); const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'lieb'; it.interest = 'Kochen'; }
function run(c) { c.E().crew = [{ name: 'Tom' }, { name: 'Lea' }, { name: 'Max' }, { name: 'Nina' }]; c.A.openRun(); c.A.cfgNext(); c.A.cfgNext(); c.A.startRun(); c.kickClose(); return c.R(); }
function next(c) { c.R().pending = null; c.A.runNext(); }

/* 1. the two new bonus cards */
for (const [t, rar, pv] of [['weiter', 'wei', 'GK_WEITER_P'], ['regel', 'reg', 'GK_REGEL_P']]) {
  const c = party(t === 'weiter' ? 1 : 2);
  c.S.questions = c.S.questions.filter(q => q.type !== t);
  guest(c); c.GK_JOKER_P = 0; c.GK_WEITER_P = t === 'weiter' ? 1 : 0; c.GK_REGEL_P = t === 'regel' ? 1 : 0;
  ok(c.gkPickType().type === t, t + ': with luck the pack holds it');
  c.gkOpen(); const k = c.UI.gk;
  ok(k.type === t && k.rar === rar && k.pts === 25 && c.gkValid(k) && !k.forId, t + ': its own look, 25 points, nothing to fill in');
  const html = c.V.guestForm();
  ok(new RegExp(t === 'weiter' ? 'Weiterleiten!' : 'Die Regel-Karte!').test(html) && /Karte einstecken/.test(html) && !holes(html.replace(/--[a-z0-9-]+:[^;"]*/g, '')), t + ': the card explains itself');
  c.A.gkDone(); c.flushTimers();
  ok(c.gForm().cards.length === 1 && c.gForm().cards[0].type === t, t + ': lands in the guest\'s list');
  ok(c.gkPickType().type !== t, t + ': one per guest');
  c.A.gSubmit();
  const q = c.S.questions.filter(x => x.type === t)[0];
  ok(q && q.status === 'offen' && q.author === 'Paula' && c.gPass()[t] === true, t + ': reaches the master, the pass remembers it');
  ok(c.questionSlots(Object.assign({}, q, { status: 'ok' })) === 0, t + ': never content for a game');
}
/* 2. Trinkbuddys: picked at the first task; from the first shared drink a random 1-3 further games */
{
  const c = party(3); const r = run(c);
  ok(r.bud && r.bud.on && !r.bud.due, 'A new run has Trinkbuddys switched on');
  next(c);
  ok(r.bud.due && c.budDue(r), 'At the first task the buddies are picked');
  let h = c.V.step();
  ok(/Zeit für Trinkbuddys!/.test(h) && /ein bis drei Spiele/.test(h) && /data-act="budPick"/.test(h) && !holes(h), 'The step waits: everyone in the focus picks first');
  const who = r.who.slice();
  c.A.budPick({ id: who[0], v: 'Tom' });
  if (who[1]) { h = c.V.step(); ok(!new RegExp('data-id="' + who[1] + '" data-v="Tom"').test(h), 'Someone already picked is not offered twice'); c.A.budPick({ id: who[1], v: 'Max' }); }
  c.A.budGo();
  const x = r.bud.bond[who[0]];
  ok(!r.bud.due && x && x.state === 'wait' && x.left >= 1 && x.left <= 3 && c.budOf(who[0]) === 'Tom', 'Buddies set, the app drew ' + x.left + ' games, the bond waits for the first drink');
  r.pending.result = { rows: who.map(id => ({ pid: id, name: 'x', n: 0 })) }; c.V.step();
  ok(x.state === 'wait' && x.left === x.total, 'A game without a drink: the bond has not started');
  next(c); const Q = r.pending; Q.result = { rows: [{ pid: who[0], name: 'x', n: 1 }] }; const hq = c.V.step();
  ok(x.state === 'on' && Q.budInfo[who[0]].along && Q.budInfo[who[0]].start && /Trinkbuddy Tom trinkt mit/.test(hq), 'The first drink: Tom drinks along, the bond starts');
  const total = x.total; let g = 0, along = 0;
  while (x.state === 'on' && g < 6) { next(c); const G = r.pending; G.result = { rows: [{ pid: who[0], name: 'x', n: g % 2 ? 0 : 1 }] }; c.V.step(); if (G.budInfo && G.budInfo[who[0]] && G.budInfo[who[0]].along) along++; g++; }
  ok(g === total && x.state === 'end', 'Then it holds exactly ' + total + ' more games');
  ok(along === Math.ceil(total / 2), 'In those games Tom drinks along exactly when ' + c.person(who[0]).name + ' drinks');
  ok(c.budOf(who[0]) === '', 'After that no buddy');
  next(c); h = c.V.step();
  ok(r.bud.due && /Neuer Trinkbuddy!/.test(h) && /Bisher: Tom/.test(h) && !new RegExp('data-id="' + who[0] + '" data-v="Tom"').test(h), 'At the next task a new buddy, not the same one again');
  if (who[1]) ok(!new RegExp('data-act="budPick" data-id="' + who[1] + '"').test(h), 'Only who needs a new buddy picks');
  c.A.budPick({ id: who[0], v: 'Nina' }); c.A.budGo();
  ok(c.budOf(who[0]) === 'Nina' && r.bud.bond[who[0]].state === 'wait', 'New bond, waiting again');
  if (who[1]) { c.A.drinkPlus({ id: who[1] }); ok(r.bud.bond[who[1]].state === 'on', 'A drink from the counter starts a waiting bond too'); }
  ok(/Trinkbuddys/.test(c.V.run()) && /Karten und Timer/.test(c.V.run()) && /wartet aufs erste|noch \d Spiel/.test(c.V.run()), 'The cockpit shows each bond');
}
/* 3. Weiterleiten when picked */
{
  const c = party(4); const r = run(c);
  c.S.questions = c.S.questions.filter(q => q.type !== 'weiter');
  c.S.questions.push({ id: 'qw1', t: 1, author: 'Lea', forId: '', type: 'weiter', text: '', status: 'ok', used: false, options: [], correct: 0, rar: 'wei' });
  next(c);
  const pid = r.who[0];
  c.A.budPick({ id: pid, v: 'Lea' });
  let h = c.V.step();
  ok(/Lea hat eine Weiterleiten-Karte/.test(h) && /data-act="budFwd"/.test(h), 'Lea is picked and holds Weiterleiten: she can pass it on');
  c.A.budFwd({ id: pid });
  const q = c.S.questions.filter(x => x.id === 'qw1')[0];
  ok(q.used && !r.bud.next[pid] && r.bud.fwd[pid] === 'Lea', 'The card is used, a new buddy has to be chosen');
  h = c.V.step();
  ok(/Lea hat weitergeleitet/.test(h) && !new RegExp('data-id="' + pid + '" data-v="Lea"').test(h), 'Lea is not offered again');
  c.A.budPick({ id: pid, v: 'Max' }); (r.who.slice(1)).forEach((id, i) => c.A.budPick({ id, v: ['Nina', 'Tom'][i] })); c.A.budGo();
  ok(r.bud.map[pid] === 'Max', 'Max drinks along instead');
}
/* 4. the Regel-Karte: five minutes, one drink, once */
{
  const c = party(5); const r = run(c);
  c.S.questions.push({ id: 'qr1', t: 1, author: 'Tom', forId: '', type: 'regel', text: '', status: 'ok', used: false, options: [], correct: 0, rar: 'reg' });
  c.A.openCards({ from: 'run' }); let h = c.V.cards();
  ok(/Regel-Karte/.test(h) && /data-act="ruleOpen"/.test(h) && !holes(h), 'The card area offers to redeem the rule');
  c.A.ruleOpen({ id: 'qr1' }); c.setBind('rule.text', 'Keine Hände benutzen'); c.A.ruleStart();
  const x = r.rules[0], pid = r.who[0], d0 = c.drinksOf(pid);
  ok(x && x.text === 'Keine Hände benutzen' && x.who.length === r.who.length && c.S.questions.filter(q => q.id === 'qr1')[0].used, 'The rule runs for everyone in the focus, the card is used');
  h = c.V.cards();
  ok(/data-until="/.test(h) && /hat sie gebrochen/.test(h), 'A running clock and a button per person');
  c.A.ruleBroke({ id: x.id, pid }); c.A.ruleBroke({ id: x.id, pid });
  ok(c.drinksOf(pid) === d0 + 1, 'Broken twice: still one drink');
  next(c); ok(/rl-strip/.test(c.V.step()) || c.budDue(r), 'The rule is on the step screen too');
  c.advance(5.1); c.ruleSweep();
  ok(x.done && !c.ruleLive(x), 'After five minutes the rule is over');
  const other = r.who[1];
  if (other) { const d1 = c.drinksOf(other); c.A.ruleBroke({ id: x.id, pid: other }); ok(c.drinksOf(other) === d1, 'After the five minutes nothing is booked'); }
  /* at the maximum: water */
  c.S.questions.push({ id: 'qr2', t: 2, author: 'Max', forId: '', type: 'regel', text: '', status: 'ok', used: false, options: [], correct: 0, rar: 'reg' });
  c.A.ruleOpen({ id: 'qr2' }); c.setBind('rule.text', 'Nicht Ja sagen'); c.A.ruleStart();
  const y = r.rules[1]; const M = c.budget(pid).M; while (c.drinksOf(pid) < M) c.addDrink(pid, 1, 'test');
  c.A.ruleBroke({ id: y.id, pid });
  ok(c.drinksOf(pid) === M && y.water && y.water[pid], 'At the maximum the rule costs water, never more');
}
/* 5. closing the guest round, printing */
{
  const c = party(6);
  c.go('questions'); let h = c.V.questions();
  ok(/Gäste-Runde schließen/.test(h) && /Karten im Umlauf/.test(h) && /Zum Kartenbereich/.test(h), 'The guests\' page: close the round, the cards in circulation');
  c.A.openCards({ from: 'questions' }); h = c.V.cards();
  ok(/Erst die Gäste-Runde schließen/.test(h) && !/data-act="prGo"/.test(h), 'Printing waits for the closed round');
  c.A.collectClose();
  ok(c.S.collectClosed, 'Round closed');
  h = c.V.cards();
  ok(/data-act="prGo"/.test(h) && /Spielkarte/.test(h) && /A4/.test(h) && /class="pc pc-joker/.test(h) && /class="pc pc-weiter/.test(h) && /class="pc pc-regel/.test(h) && !holes(h), 'Then: formats, the cards with names, a preview');
  const n = c.printCards().length, html = c.A.prGo();
  ok(typeof html === 'string' && (html.match(/class="pc pc-/g) || []).length === n && /pp-grid/.test(html) && /Für<\/span><b>Max<\/b>/.test(html), 'Playing cards: nine to a sheet, with the holder\'s name (' + n + ' cards)');
  c.A.prFmt({ v: 'a4' }); const a4 = c.A.prGo();
  ok((a4.match(/class="pp-page pp-one"/g) || []).length === n && /class="pc pc-[a-z]+ big"/.test(a4), 'A4: one big card per page');
  c.A.prToggle({ id: c.printCards()[0].id }); ok((c.A.prGo().match(/class="pc pc-/g) || []).length === n - 1, 'A card can be left out');
  /* the guest link after closing */
  c.UI.guestMode = 'link'; c.UI.qSent = null; h = c.V.guestForm();
  ok(/Die Runde ist geschlossen/.test(h) && !/data-act="gAdd"/.test(h), 'Guests see that the round is closed');
  c.UI.guestMode = ''; c.A.collectOpen(); ok(!c.S.collectClosed, 'It can be opened again');
}
/* 6. switched off in the setup; the example evening keeps the cards behind the pass */
{
  const c = party(7); c.cfgDefaults(); c.A.cfgBuddy();
  ok(c.cfgDefaults().buddy === false, 'Trinkbuddys can be switched off in the setup');
  const r = run(c); next(c);
  ok(!r.bud.on && !r.bud.due && !c.budDue(r), 'Switched off: no buddies');
  const d = load({ seed: 8, demo: true }); d.DEMO_LIMITS = true; d.A.loadDemo();
  ok(d.pcAll('weiter').length === 0 && /Game Pass/.test(d.V.cards()), 'Example evening: the cards stay behind the Game Pass');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exit(fails ? 1 : 0);
