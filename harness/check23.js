/* targeted checks: who is there tonight, and the Junggesellenabschied. node harness/check23.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
function party(seed, anlass) { const c = load({ seed }); c.A.loadDemo(); c.A.matPreset({ v: 'all' }); if (anlass) c.A.setEventAnlass({ v: anlass }); return c; }
function crew(c, names) { names.forEach(n => { c.UI.crewName = n; c.A.crewAdd(); }); }

/* 1. the guest link says nothing about who is there */
{
  const c = party(1);
  c.A.openRun(); c.A.startRun();
  ok(c.guestPool().length === 0, 'Without a list, the pickers know nobody from the link (' + c.guestPool().join(',') + ')');
  const links = c.knownGuests();
  ok(links.length >= 5, 'The demo still has ' + links.length + ' guests in the link data');
  const r = c.R(), main = r.who[0];
  c.snapshot('task'); r.pending = c.makeGameStep(main, { focus: [main], together: r.together, variant: r.variant, themes: c.themesOf(r.who) }, 'zwiebel', 'duellGast'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; r.steps = 1; c.go('step');
  ok(r.pending.ch && r.pending.ch.phase === 'play', 'Without a list the challenge does not ask for a name');
  c.A.stepResolve({ v: 'ok' }); c.A.stepContinue(); c.notePresent('Kalle');
  ok(c.guestPool().indexOf('Kalle') >= 0 && c.guestPool().every(n => links.indexOf(n) < 0 || n === 'Kalle'), 'A name typed tonight is offered next time, link guests are not');
  crew(c, ['Sabine', 'Ole']);
  ok(['Sabine', 'Ole', 'Kalle'].every(n => c.guestPool().indexOf(n) >= 0), 'Names on the guest list are offered');
}
/* 2. role moments have a way out when a link guest is not there */
{
  const c = party(2);
  c.A.openRun(); c.A.startRun();
  const r = c.R();
  const P = c.prepRoleStep(r, { kind: 'rolle', role: 'frischling', track: r.tracks[0].id, main: r.who[0] });
  r.pending = P; c.go('step');
  const html = c.renderStepScreen(P, false);
  ok(/nicht da/.test(html), 'Role card says what to do if the guest is not there');
}
/* 3. a JGA needs its crew */
{
  const c = party(3, 'jga');
  c.A.openRun(); c.A.startRun();
  ok(!c.R() && /Truppe/.test(c.UI.cfgErr), 'JGA does not start without a crew');
  crew(c, ['Kalle', 'Sabine', 'Ole']); c.A.startRun();
  ok(!!c.R() && c.R().jga && c.R().jga.mode === 'stadt', 'JGA starts with a crew, in the city by default');
}
/* 4. levels follow how bold the person is; the first mission is harmless */
{
  for (const mut of [1, 2, 3]) {
    const c = party(10 + mut, 'jga'); crew(c, ['Kalle', 'Sabine']);
    c.E().focus.forEach(p => { p.mut = mut; });
    c.JGA_PACK.forEach(p => { if (!c.packed(p[0])) c.A.packToggle({ v: p[0] }); });
    c.A.openRun(); c.A.startRun();
    const r = c.R(), main = r.who[0], seen = { 1: 0, 2: 0, 3: 0 };
    const first = c.makeMissionStep(main, r);
    let bad = 0;
    for (let i = 0; i < 300; i++) { r.kinds = ['mission']; c.S.used.jga = []; const m = c.makeMissionStep(main, r, { x: i / 300 }); seen[m.lvl]++; if (/\{[A-Za-z]+\}/.test(m.text + m.title + m.win)) bad++; }
    ok(first.lvl === 1, 'Mut ' + mut + ': first mission is harmless');
    ok(mut > 1 || seen[3] === 0, 'Mut ' + mut + ': levels ' + JSON.stringify(seen) + (mut === 1 ? ', never wild' : ''));
    ok(mut === 1 || seen[3] > 0, 'Mut ' + mut + ': wild missions do come up');
    ok(bad === 0, 'Mut ' + mut + ': no open placeholders');
  }
}
/* 5. packing list, partner and the bar decide what is possible */
{
  const c = party(20, 'jga'); crew(c, ['Kalle', 'Sabine']);
  c.E().focus.forEach(p => { p.partner = ''; p.mut = 3; });
  c.JGA_PACK.forEach(p => { if (c.packed(p[0])) c.A.packToggle({ v: p[0] }); });
  c.S.runCfg = null; c.A.openRun(); c.cfgDefaults().jgaMode = 'drinnen'; c.A.startRun();
  const r = c.R(), main = r.who[0]; let bad = 0, n = 0;
  for (let i = 0; i < 400; i++) { r.kinds = ['mission']; const m = c.makeMissionStep(main, r, { x: Math.random() }); const t = c.JGA_TASKS.find(x => x.id === m.mid); n++; if (t.take.length || t.dat.indexOf('P') >= 0 || !t.bar) bad++; }
  ok(bad === 0, 'Nothing unpacked, no partner, in a bar: only fitting missions (' + n + ' draws)');
  ok(c.nextGamePeek() !== undefined, 'Peek still works in the bar');
}
/* 6. refusing costs one, unless max or brake say no */
{
  const c = party(30, 'jga'); crew(c, ['Kalle', 'Sabine']); c.A.openRun(); c.A.startRun();
  const r = c.R(), main = r.who[0];
  const force = () => { c.snapshot('task'); r.pending = c.makeMissionStep(main, r); r.pending.track = r.tracks[0].id; r.pending.unitNo = r.tracks[0].pos + 1; c.go('step'); return r.pending; };
  force(); c.A.stepResolve({ v: 'refuse' });
  let row = r.pending.result.rows.find(x => x.pid === main);
  ok(row && row.n === 1, 'Refusing costs one');
  c.A.stepContinue(); c.advance(0.5);
  c.addDrink(main, 1, 'manuell'); /* two within four minutes now */
  force(); c.A.stepResolve({ v: 'refuse' });
  row = r.pending.result.rows.find(x => x.pid === main);
  ok(row && row.n === 0 && row.water, 'Refusing right after two drinks: water (tempo brake)');
  c.A.stepContinue(); c.advance(30);
  const M = c.E().max; while (c.drinksOf(main) < M) c.addDrink(main, 1, 'manuell');
  c.advance(30);
  force(); c.A.stepResolve({ v: 'refuse' });
  row = r.pending.result.rows.find(x => x.pid === main);
  ok(row && row.n === 0 && /Maximum/.test(row.note), 'Refusing at the maximum: no drink, a penalty instead');
}
/* 7. crew jobs: only for people with a role, refusing is never counted */
{
  const c = party(40, 'jga'); crew(c, ['Kalle', 'Sabine', 'Ole']);
  c.A.crewRole({ id: c.crewList()[0].id, v: 'fotograf' });
  c.A.openRun(); c.A.startRun();
  const r = c.R(); r.steps = 5; r.jcrew.last = 0;
  const inj = c.crewInjection(r);
  ok(!!inj, 'A crew job comes up after a few missions');
  const P = c.prepCrewStep(r, inj); r.pending = P; c.go('step');
  ok(P.name === 'Kalle' && P.role === 'fotograf' && !/\{/.test(P.text), 'The job goes to the one with the role');
  const d0 = c.S.drinks.length; c.A.stepResolve({ v: 'fail' }); c.A.stepContinue();
  ok(c.S.drinks.length === d0 && !c.R().pending, 'Kneifen: the crew member drinks along, nothing is counted');
  ok(c.R().steps === 5, 'A crew job is a moment, it does not count as a task');
}
/* 8. a city JGA has no Hellseher (there is no last minigame) */
{
  const c = party(50, 'jga'); crew(c, ['Kalle', 'Sabine']); c.A.openRun(); c.A.startRun();
  const r = c.R(); r.tracks[0].pos = r.tracks[0].total - 1; r.steps = 12;
  const inj = c.roleInjection(r);
  ok(!inj || inj.kind !== 'hellseher', 'No Hellseher in the city');
  ok(r.plan.indexOf('spiel') < 0 && r.plan.indexOf('partner') < 0, 'In the city the plan has missions instead of minigames, no partner game');
}
console.log(fails ? fails + ' FAILED' : 'ALL CHECKS OK');
process.exitCode = fails ? 1 : 0;
