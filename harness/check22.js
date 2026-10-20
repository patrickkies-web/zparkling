/* targeted checks for the v22 mechanics: node harness/check22.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
function freshRun(seed, opts) {
  const c = load({ seed: seed || 5 });
  c.A.loadDemo(); c.A.matPreset({ v: 'all' });
  if (opts && opts.one) c.E().focus = c.E().focus.slice(0, 1);
  c.A.openRun(); const rc = c.cfgDefaults(); rc.variant = 'socke'; rc.together = 'gemeinsam'; if (opts && opts.shared) rc.shared = opts.shared;
  c.A.startRun();
  return c;
}
function force(c, game, fmt, main) {
  const r = c.R(); main = main || r.who[0];
  const ctx = { focus: fmt === 'duell' ? r.who.slice() : [main], together: r.together, variant: r.variant, themes: c.themesOf(r.who) };
  c.snapshot('task');
  r.pending = c.makeGameStep(main, ctx, game, fmt); r.pending.track = r.tracks[0].id; r.pending.unitNo = r.tracks[0].pos + 1; r.steps = Math.max(1, r.steps);
  c.go('step');
  return r.pending;
}
function addHc(c, id, pid, min) { const r = c.R(); r.hc = r.hc || []; r.hc.push({ id, pid, by: 'Tom', start: c.now(), end: c.now() + (min || 10) * 60000, off: false }); }

/* 1. Strafe statt Pinnchen: the drink becomes a penalty and is booked like a joker */
{
  const c = freshRun(11); const pid = c.R().who[0];
  addHc(c, 'tausch', pid);
  c.Math.random = () => 0.0; /* the Pilot would say: drink */
  const credit0 = (c.S.jokerCredit || {})[pid] || 0, tp0 = c.budget(pid).Tp;
  force(c, 'zwiebel', 'solo', pid); c.A.stepResolve({ v: 'fail' });
  const row = c.R().pending.result.rows.find(x => x.pid === pid);
  ok(row && row.n === 0 && row.swap && /Strafe/.test(row.note), 'Tausch: loss becomes a penalty');
  ok(((c.S.jokerCredit || {})[pid] || 0) === credit0 + 1, 'Tausch: booked as joker credit');
  { const b = c.budget(pid); ok(b.credit === credit0 + 1 && Math.abs(b.Tp - Math.max(0, Math.min(b.M, b.T * b.f) - b.credit)) < 1e-9, 'Tausch: the Pilot target drops by one (credit ' + b.credit + ', tp before ' + tp0.toFixed(2) + ' after ' + b.Tp.toFixed(2) + ' incl. skill shift)'); }
  const d0 = c.drinksOf(pid); c.A.stepContinue(); ok(c.drinksOf(pid) === d0, 'Tausch: nothing is counted');
}
/* 2. Atempause: losses cost water */
{
  const c = freshRun(12); const pid = c.R().who[0];
  addHc(c, 'atem', pid); c.Math.random = () => 0.0;
  force(c, 'zwiebel', 'solo', pid); c.A.stepResolve({ v: 'fail' });
  const row = c.R().pending.result.rows.find(x => x.pid === pid);
  ok(row && row.n === 0 && /Atempause/.test(row.note), 'Atempause: water on a loss');
}
/* 3. Vollgas: a loss costs one even when the Pilot would let it go, but never past target+1 or the max */
{
  const c = freshRun(13); const pid = c.R().who[0];
  addHc(c, 'vollgas', pid, 60); c.Math.random = () => 0.999;
  force(c, 'zwiebel', 'solo', pid); c.A.stepResolve({ v: 'fail' });
  let row = c.R().pending.result.rows.find(x => x.pid === pid);
  ok(row && row.n === 1 && /Vollgas/.test(row.note), 'Vollgas: a loss costs one');
  c.A.stepContinue();
  /* push the person to target+1 by hand: then Vollgas stops */
  const b = c.budget(pid); for (let k = c.drinksOf(pid); k < Math.min(b.M, Math.ceil(b.Tp) + 1); k++) c.addDrink(pid, 1, 'manuell');
  c.advance(30);
  force(c, 'zwiebel', 'solo', pid); c.A.stepResolve({ v: 'fail' });
  row = c.R().pending.result.rows.find(x => x.pid === pid);
  ok(row && row.n === 0, 'Vollgas: stops one over the personal target');
}
/* 4. Revanche: second result counts, the card is used once, the guest never drinks */
{
  const c = freshRun(14, { one: true }); const pid = c.R().who[0];
  const P = force(c, 'zwiebel', 'duellGast', pid);
  ok(P.ch && P.ch.phase === 'play' && P.ch.stake, 'Without a guest list the challenge starts right away, with a stake');
  c.E().crew = [{ name: 'Tom' }, { name: 'Lea' }];
  c.chInit(P); ok(P.ch.phase === 'pick', 'With names entered beforehand the opponent is picked first');
  c.A.chGuest({ v: 'Tom' }); c.A.chGo();
  ok(P.ch.phase === 'play' && P.guestName === 'Tom' && P.ch.stake, 'Picking starts the game, no announcement in between');
  c.A.stepResolve({ v: 'fail' });
  ok(c.canRevanche(c.R().pending), 'Revanche offered after a lost challenge');
  const drinks0 = c.drinksOf(pid);
  c.A.chRevanche();
  ok(!c.R().pending.result && c.R().pending.revanche && c.R().rev[pid], 'Revanche resets the result and uses the card');
  ok(!c.R().duel || !c.R().duel.tom, 'Revanche: the first loss is not in the duel stats');
  c.A.stepResolve({ v: 'ok' });
  const rows = c.R().pending.result.rows;
  ok(rows.length === 1 && rows[0].stake && rows[0].n === 0 && rows[0].name === 'Tom', 'Guest pays the stake, no drink');
  ok(!c.canRevanche(c.R().pending), 'No second Revanche');
  c.A.stepContinue();
  ok(c.drinksOf(pid) === drinks0, 'Revanche won: nothing to drink');
  ok(c.R().duel.tom.n === 1 && c.R().duel.tom.fw === 1, 'Duel stats count the final result');
  /* the card is gone for the evening */
  force(c, 'zwiebel', 'duellGast', pid); c.A.chGuest({ v: 'Lea' }); c.A.chGo(); c.A.stepResolve({ v: 'fail' });
  ok(!c.canRevanche(c.R().pending), 'Revanche-Karte only once per evening');
}
/* 5. The station: comes once on short evenings, twice on long ones, never near the end, never as the first card */
{
  for (const [shared, want] of [[20, 1], [40, 2]]) {
    const c = freshRun(15 + shared, { shared });
    const r = c.R(); let seen = 0, guard = 0, firstPos = -1;
    c.Math.random = (function () { let a = 7; return () => { a = (a * 9301 + 49297) % 233280; return a / 233280; }; })();
    while (!r.finished && guard++ < 400 && c.R() === r) {
      if (!r.pending) c.A.runNext();
      const P = c.R().pending;
      if (P.kind === 'handicap') {
        seen++; if (firstPos < 0) firstPos = c.maxProgress(r);
        if (c.nearEnd(r)) { fails++; console.log('FAIL station near the end'); }
        c.A.hcNext(); c.A.hcChoose({ v: P.hc.cards[0] }); c.A.hcPicked(); c.A.stepResolve({ v: 'handicap' });
      } else {
        try { require('./sim').resolveStep(c, P, Math.random); } catch (e) { console.log('resolve error', e.message); break; }
        if (c.stepNow() && c.stepNow().result) c.A.stepContinue();
      }
      c.advance(2.5);
      if (c.UI.screen === 'step' && c.R() && !c.R().pending) c.go('run');
    }
    ok(seen === want, 'Station count on a ' + shared + '-unit Kranz: ' + seen + ' (want ' + want + ')');
    ok(firstPos >= 0.4, 'Station not before 40 % (' + firstPos.toFixed(2) + ')');
  }
}
/* 6. A handicap runs out by itself, and a win can end it early */
{
  const c = freshRun(16); const pid = c.R().who[0];
  addHc(c, 'reim', pid, 5);
  ok(c.hcActive(pid).length === 1, 'Handicap active');
  c.advance(6);
  ok(c.hcActive(pid).length === 0, 'Handicap runs out after its time');
  addHc(c, 'roboter', pid, 15);
  force(c, 'zwiebel', 'solo', pid); c.A.stepResolve({ v: 'ok' });
  ok(/legt/.test(c.hcReleaseHtml(c.R().pending)), 'A win offers to drop it');
  const i = c.R().hc.findIndex(h => h.id === 'roboter');
  c.A.hcRelease({ i: String(i) });
  ok(c.hcActive(pid).length === 0, 'Dropped after the win');
  addHc(c, 'tausch', pid, 15); c.A.stepContinue();
  force(c, 'zwiebel', 'solo', pid); c.A.stepResolve({ v: 'ok' });
  ok(!/legt/.test(c.hcReleaseHtml(c.R().pending)), 'Gifts (Strafe statt Pinnchen) are not dropped by a win');
}
/* 7. Undo puts the station back; rewinding over it removes the handicap */
{
  const c = freshRun(17); const r = c.R(), pid = r.who[0];
  r.steps = 3; c.snapshot('task');
  r.pending = c.prepHcStep(r, { kind: 'handicap', track: r.tracks[0].id, main: pid });
  c.go('step'); c.A.hcNext(); c.A.hcChoose({ v: r.pending.hc.cards[0] }); c.A.hcPicked(); c.A.stepResolve({ v: 'handicap' });
  ok(c.hcActive(pid).length === 1, 'Station applied');
  c.A.runUndo();
  ok(c.R().pending && c.R().pending.kind === 'handicap' && c.hcActive(pid).length === 0, 'Undo brings the station card back');
  c.A.runUndo();
  ok(!c.R().pending && c.hcActive(pid).length === 0, 'Undo again: no station, no handicap');
}
/* 8. Gedankenleser and Ketchup count themselves; guests never land in the counter */
{
  const c = freshRun(18); const r = c.R(), pid = r.who[0], other = r.who[1];
  force(c, 'gedankenleser', 'solo', pid);
  c.A.glPartner({ v: 'Tom' }); c.A.glGo();
  for (let k = 0; k < 5 && c.stepNow().gl.phase !== 'done'; k++) { c.A.glA({ i: '0' }); c.A.glPass(); c.A.glB({ i: '1' }); c.A.glNext(); }
  ok(c.stepNow().gl.phase === 'done', 'Gedankenleser ends early when it cannot be won anymore');
  c.Math.random = () => 0;
  c.A.stepResolve({ v: 'eval' });
  const rows = c.R().pending.result.rows;
  ok(rows.some(x => x.pid === pid && x.n === 1) && rows.some(x => x.group && x.name === 'Tom'), 'Gedankenleser lost: player via Pilot, guest along');
  c.A.stepContinue();
  force(c, 'ketchup', 'duell', pid);
  c.A.kcMate({ v: 'Lea' }); c.A.kcRival({ v: 'Max' }); c.A.kcReady(); c.A.kcGo(); c.A.kcHit(); c.A.kcHit(); c.A.kcStop(); c.A.kcGo(); c.A.kcHit(); c.A.kcStop();
  c.A.stepResolve({ v: 'eval' });
  const kr = c.R().pending.result.rows;
  ok(kr.some(x => x.pid === other) && kr.some(x => x.group && x.name === 'Max') && !kr.some(x => x.pid === pid), 'Ketchup: the team with fewer terms drinks, the guest uncounted');
}
console.log(fails ? fails + ' FAILED' : 'ALL CHECKS OK');
process.exitCode = fails ? 1 : 0;
