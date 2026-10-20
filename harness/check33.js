/* v33: celebrations in the pass bar and only once, the glow, the master's overview, the limited example evening. node harness/check33.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
const holes = s => /undefined|NaN|\[object|null</.test(s.replace(/data-[a-z]+="[^"]*"/g, ''));
function party(seed, demo) { const c = load({ seed, demo }); c.A.loadDemo(); c.A.matPreset({ v: 'all' }); return c; }
const typing = (c, on) => { c.document.activeElement = on ? { tagName: 'INPUT' } : null; };

/* 1. nothing pops while typing, a level is celebrated once, in the pass bar */
{
  const c = party(1);
  const hud = c.document.createElement(), byId = c.document.getElementById;
  c.document.getElementById = id => id === 'gpass' ? hud : byId(id);
  c.A.openGuestForm(); c.gPass().welcomed = true; c.UI.gForm.author = 'Paula'; c.gRender();
  const p0 = c.UI.gPts;
  c.A.gAdd({ v: 'steckbrief' }); const it = c.gForm().items[0];
  typing(c, true); it.year = '2010'; c.gPassFx();
  ok(c.UI.gPts === p0 && !c.UI.gHudFx, 'While the field is being typed in: no points, no level, nothing flies');
  typing(c, false); c.gPassFx(true);
  ok(c.UI.gPts > p0 && c.UI.gHudFx && c.UI.gHudFx.kind === 'lv', 'Field left: the level-up shows (' + p0 + ' → ' + c.UI.gPts + ')');
  ok(!/glvlup|gstickpop/.test(c.app.innerHTML), 'No overlay over the whole screen');
  c.advance(0.1); c.flushTimers();
  const lv = c.gPass().lvMax, best = c.gPass().ptsMax;
  /* a correction: the year is gone for a moment, then back */
  it.year = ''; c.gPassFx(true); it.year = '2011'; c.gPassFx(true);
  ok(!c.UI.gHudFx && c.gPass().lvMax === lv && c.gPass().ptsMax === best, 'A correction does not celebrate the same level again');
  ok(typeof c.gHudFx === 'function' && typeof c.gLevelOverlay === 'undefined', 'The full-screen level overlay is gone');
}
/* 2. the master sees what came in, per kind, and what is missing */
{
  const c = party(2);
  c.go('questions'); const h = c.V.questions();
  const n = c.guestSubmissions().filter(q => !q.ai).length;
  ok(/class="qo mt14"/.test(h) && new RegExp('qo-n num">' + n + '<').test(h), 'Overview with the number of contributions (' + n + ')');
  ok(/Stufe: /.test(h) && /class="qo-mile/.test(h) && /Noch <b>\d+<\/b> bis/.test(h) && /weitere Gäste|weiterer Gast/.test(h), 'Levels of the party, how far to the next, how many guests that takes');
  ok((h.match(/class="qo-t[ "]/g) || []).length === c.QTYPES.length && /Mehr Gäste einladen/.test(h), 'A tile per kind and a button to invite more');
  ok(!holes(h), 'No holes');
  c.A.qKindJump({ v: 'luege' }); ok(c.UI.qKind === 'luege', 'A tile filters the list below');
}
/* 3. the example evening: a part is open, the rest says Game Pass */
{
  const c = party(3, true);
  ok(c.demoOn(), 'Example evening with limits');
  c.go('home'); let h = c.V.home();
  ok(/So machen eure Gäste mit/.test(h) && (h.match(/class="dm-type[ "]/g) || []).length === c.EVENT_TYPES.length && /Einladung als Gast ansehen/.test(h), 'Home: how guests take part, and every party type to try');
  c.A.setEventAnlass({ v: 'treppe' }); ok(c.E().anlass === 'treppe', 'A party type is switched with one tap');
  c.A.setEventAnlass({ v: 'socken' });
  c.A.openGuestForm(); c.gPass().welcomed = true; h = c.V.guestForm();
  ok((h.match(/data-act="gAdd"/g) || []).length === 3 && /Noch 6 weitere Beitragsarten/.test(h), 'Guest view: three kinds open, the others only counted');
  c.A.gAdd({ v: 'steckbrief' }); ok(!c.gForm().items.length, 'A locked kind cannot be added');
  const kinds = {}; for (let i = 0; i < 60; i++) kinds[c.gkPickType().type] = 1;
  ok(Object.keys(kinds).every(k => ['portrait', 'wenn'].indexOf(k) >= 0), 'Bonus cards: only the two open kinds (' + Object.keys(kinds).join(', ') + ')');
  c.UI.gk = { type: 'wenn', rar: 'sel', pts: 15, text: '', strokes: [], phase: 'ready', forId: c.E().focus[0].id, cat: 'tier', played: true, no: 1, key: 'x' };
  ok(/Es gibt noch mehr Karten/.test(c.gkPanelHtml(c.UI.gk)), 'The card says there are more, without showing them');
  c.UI.gk = null;
  c.UI.guestMode = ''; c.go('questions'); h = c.V.questions();
  ok((h.match(/class="qx-t[ "]/g) || []).length === 5 && /class="qo-t lock"/.test(h) && /Mit dem Game Pass/.test(h) && !/Joker im Umlauf/.test(h), 'Master page: five kinds, the rest locked, the KI and the Joker behind the pass');
  c.go('games'); h = c.V.games();
  ok((h.match(/gtile gm-t dlk/g) || []).length === 4, 'Spiele: four tiles locked');
  c.A.freeQuick({ v: 'quiz' }); ok(c.UI.screen === 'pass', 'A locked game leads to the Game Pass');
  c.go('home'); c.A.openRun(); c.UI.cfgStep = 3; c.A.cfgSave(); c.A.heroGo(); c.kickClose();
  c.R().steps = c.DEMO_STEPS; h = c.V.run();
  ok(/Das war der Beispiel-Abend/.test(h) && /Mit dem Game Pass weiterspielen/.test(h), 'After five stations the example run ends with the pass');
  c.A.runNext(); ok(c.UI.screen === 'pass', 'Going on leads to the Game Pass');
}
/* 4. outside the example evening nothing is locked */
{
  const c = party(4, true); c.S.demo = false;
  ok(!c.demoOn() && c.demoTypeOk('steckbrief') && c.demoFreeOk('quiz') && !/dm-guests/.test((c.go('home'), c.V.home())), 'A real party: everything open');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exitCode = fails ? 1 : 0;
