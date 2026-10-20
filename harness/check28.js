/* v28: setup in steps, the kick-off, the cockpit, words on the buttons, tidier menus. node harness/check28.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
const holes = s => /undefined|NaN|\[object|null</.test(s.replace(/data-[a-z]+="[^"]*"/g, ''));
function party(seed, anlass) { const c = load({ seed }); c.A.loadDemo(); c.A.matPreset({ v: 'all' }); if (anlass) c.A.setEventAnlass({ v: anlass }); return c; }

/* 1. three steps with the plan at the end */
{
  const c = party(1);
  c.A.openRun();
  ok(c.UI.screen === 'runSetup' && c.cfgStepNow() === 1, 'Opening the game starts at step 1');
  let h = c.V.runSetup();
  ok(/Wer spielt mit\?/.test(h) && /wz-s now/.test(h) && /Weiter/.test(h) && !/Los geht/.test(h), 'Step 1: who plays, a Weiter button, no start yet');
  ok(/class="navbtn"[^>]*data-to="home"[^>]*>.*?<span>Party<\/span>/.test(h), 'The back button says where it goes: Party');
  c.A.cfgNext(); h = c.V.runSetup();
  ok(c.cfgStepNow() === 2 && /Wie geht ihr den Kranz ab\?/.test(h) && /Stück für Stück/.test(h) && /Zurück/.test(h), 'Step 2: the kind of game, with Zurück');
  c.A.cfgNext(); h = c.V.runSetup();
  ok(c.cfgStepNow() === 3 && /Alles bereit\?/.test(h) && /Abend speichern/.test(h) && !/Los geht/.test(h) && /Plan des Piloten/.test(h), 'Step 3: the plan and a save button, the start waits at home');
  ok((h.match(/class="wz-sum"/g) || []).length === 4 && /Material/.test(h) && /Ändern/.test(h), 'The plan has four lines with the material, each can be changed');
  ok(!holes(h), 'Step 3 has no holes');
  c.A.cfgStep({ v: '1' });
  ok(c.cfgStepNow() === 1, 'Tapping a line or a step jumps back');
  c.A.cfgPrev();
  ok(c.cfgStepNow() === 1, 'There is nothing before step 1');
}
/* 2. the JGA needs its crew before going on */
{
  const c = party(2, 'jga');
  c.A.openRun();
  c.A.cfgNext();
  ok(c.cfgStepNow() === 1 && /Truppe/.test(c.UI.cfgErr), 'Without a crew the JGA stays on step 1 and says why');
  c.A.cfgStep({ v: '3' });
  ok(c.cfgStepNow() === 1, 'Jumping ahead is blocked too');
}
/* 3. the start and the cockpit */
{
  const c = party(3);
  c.A.openRun(); c.A.cfgNext(); c.A.cfgNext(); c.A.startRun();
  ok(c.UI.screen === 'run' && c.UI.kickOn === true, 'Los geht’s: the cheer starts');
  c.kickClose();
  ok(!c.UI.kickOn, 'The cheer ends');
  const r = c.R(), h = c.V.run();
  ok(/ist dran/.test(h) && /class="ck-ring"/.test(h) && /von 25/.test(h) && /abgenommen/.test(h), 'Cockpit: who is next and the ring, 0 von 25');
  ok(/Zeit/.test(h) && /Tempo/.test(h) && /Gespielt/.test(h), 'Three tiles: time, tempo, played');
  ok(/<span>Party<\/span>/.test(h) && /<span>Rückgängig<\/span>/.test(h), 'Head: Party and Rückgängig in words');
  ok(/Werkzeuge/.test(h) && /Spiel beenden/.test(h) && /Pinnchen eintragen/.test(h), 'The tools as a grid');
  ok((h.match(/class="logrow"/g) || []).length === 1, 'Zuletzt shows only the newest entry');
  ok(!holes(h), 'No holes in the cockpit');
  /* one station further: the ring shows it, once */
  c.snapshot('task');
  r.pending = c.makeGameStep(r.who[0], { focus: [r.who[0]], together: r.together, variant: r.variant, themes: c.themesOf(r.who) }, 'zwiebel', 'solo');
  r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; c.go('step');
  const sh = c.V.step();
  ok(/<span>Übersicht<\/span>/.test(sh) && /tb-ctx/.test(sh) && /Anderes Spiel/.test(sh), 'A task: Übersicht and Anderes Spiel in words, the card name below');
  c.A.stepResolve({ v: 'ok' }); c.A.stepContinue();
  const pos = r.tracks[0].pos;
  if (c.UI.screen !== 'run') c.go('run');
  const h1 = c.app.innerHTML; c.flushTimers(); const h2 = c.V.run();
  ok(pos >= 1 && /ck-it[^"]* just/.test(h1) && /ck-arc go/.test(h1), 'The station just done pops, the arc grows');
  ok(!/ck-it[^"]* just/.test(h2) && !/ck-arc go/.test(h2), 'Only once: the next look is calm');
  c.A.ckLog(); ok((c.V.run().match(/class="logrow"/g) || []).length > 1, 'Ganzer Verlauf opens the log');
  c.A.askConfirm({ v: 'endRun' });
  ok(/Spiel jetzt beenden\?/.test(c.V.run()), 'Spiel beenden asks first');
}
/* 4. sweeping the stairs: a clock ring */
{
  const c = party(4, 'treppe');
  c.A.openRun(); c.A.cfgNext();
  ok(/Wie lange dauert das Event\?/.test(c.V.runSetup()) && /Zubehör-Wechsel/.test(c.V.runSetup()), 'Event: step 2 asks how long, with the tools to switch');
  c.A.cfgNext(); c.A.startRun();
  const h = c.V.run();
  ok(/Event läuft/.test(h) && /Minuten/.test(h) && /Status-Check/.test(h) && !holes(h), 'Event cockpit: minutes ring and Status-Check');
}
/* 5. against each other: the race */
{
  const c = party(5, 'geburtstag');
  c.A.openRun(); const rc = c.cfgDefaults(); rc.together = 'gegeneinander'; rc.variant = 'runden';
  c.A.cfgNext(); c.A.cfgNext();
  ok(/pro Person/.test(c.V.runSetup()), 'The plan says rounds per person');
  c.A.startRun();
  const h = c.V.run();
  ok(/Das Rennen/.test(h) && (h.match(/class="ck-race/g) || []).length === 2 && /gespielt/.test(h) && !holes(h), 'Two tracks: the race list');
}
/* 6. dice on a free evening */
{
  const c = party(6, 'party');
  c.A.openRun(); const rc = c.cfgDefaults(); rc.variant = 'wuerfel';
  c.A.cfgNext(); c.A.cfgNext(); c.A.startRun();
  const h = c.V.run();
  ok(/Würfeln/.test(h) && /Felder geschafft/.test(h) && !holes(h), 'Dice: fields in the ring, Würfeln below');
}
/* 7. the menus */
{
  const c = party(7);
  c.go('games'); let h = c.V.games();
  ok((h.match(/class="gtile gm-t"/g) || []).length === 7 && /bleibt geheim/.test(h), 'Spiele: seven equal tiles, the secret in one line');
  c.go('settings'); h = c.V.settings();
  ok(!/Pro Spiel trinkt jede Person höchstens/.test(h) && /So rechnet der Pinnchen-Pilot/.test(h), 'Settings: the long Pilot text is folded');
  ok((h.match(/data-act="setEventAnlass"/g) || []).length === 0 && /data-act="setTypeOpen"/.test(h), 'Settings: only the chosen party type, the list on demand');
  c.A.setPilotOpen(); c.A.setTypeOpen(); h = c.V.settings();
  ok(/Pro Spiel trinkt jede Person höchstens/.test(h) && (h.match(/data-act="setEventAnlass"/g) || []).length === 8, 'Both open on a tap');
  c.A.setEventAnlass({ v: c.E().anlass });
  ok(!c.UI.setTypeOpen, 'Picking closes the list');
  c.go('questions'); h = c.V.questions();
  ok(/class="qx-jump"/.test(h) && /data-v="qs-neu"/.test(h) && /id="qs-neu"/.test(h) && /id="qs-alle"/.test(h) && /id="qs-runden"/.test(h), 'Fragen: chips jump to each part');
  const j = party(8, 'jga'); j.go('games');
  ok((j.V.games().match(/class="gtile gm-t"/g) || []).length === 8, 'JGA: the mission is one more tile');
}
/* 8. the challenge only asks for a name when names were entered beforehand */
{
  const c = party(9);
  c.A.openRun(); c.A.cfgNext(); c.A.cfgNext(); c.A.startRun(); c.kickClose();
  const r = c.R(), main = r.who[0];
  const mk = () => { c.snapshot('task'); r.pending = c.makeGameStep(main, { focus: [main], together: r.together, variant: r.variant, themes: c.themesOf(r.who) }, 'zwiebel', 'duellGast'); r.pending.track = r.tracks[0].id; r.pending.unitNo = 1; c.go('step'); return r.pending; };
  let P = mk(), h = c.V.step();
  ok(P.ch.phase === 'play' && !/Kampfansage/.test(h) && /sucht sich einen Gegner aus der Menge aus/.test(h) && /Der Gast gewinnt/.test(h), 'No list: no picking, no announcement, someone from the crowd');
  ok(/Verliert der Gast, ist fällig/.test(h) && /chStakeNext/.test(h), 'The stake is already there and can be swapped');
  const s0 = P.ch.stake; c.A.chStakeNext(); ok(P.ch.stake !== s0, 'Anderer: the next stake');
  c.A.stepResolve({ v: 'ok' });
  ok(P.result.rows.some(x => x.stake && x.name === 'Der Gast'), 'The guest pays the stake, no drink');
  c.A.stepContinue();
  c.E().crew = [{ name: 'Tom' }, { name: 'Lea' }];
  P = mk(); h = c.V.step();
  ok(P.ch.phase === 'pick' && /Gegen wen spielt/.test(h) && /Tom/.test(h) && /Gegen jemand aus der Menge/.test(h) && !/Kampfansage/.test(h), 'With a list: pick a face, or anyone from the crowd');
  c.A.chGuest({ v: 'Tom' }); h = c.V.step();
  ok(/Gegen Tom spielen/.test(h), 'The button names the opponent');
  c.A.chGo(); h = c.V.step();
  ok(P.ch.phase === 'play' && /Tom gewinnt/.test(h) && /Anderen Gegner wählen/.test(h), 'Straight into the game, the opponent can still be changed');
}
/* 9. the Game Pass reveal */
{
  const c = party(10);
  const end = c.pvFlyPos(1), mid = c.pvFlyPos(0.62);
  ok(end.y < -600 && Math.abs(end.rot + 352) < 1 && end.sc < 0.5, 'The pass flies out at the top, after one full loop, getting smaller');
  ok(mid.rot < -100 && mid.rot > -330, 'Mid-flight it is turning through the loop');
  ok(c.pvFlightFrames().length === 91, 'The flight as 91 frames');
  ok(/Game Pass aktiv!/.test(c.pvHtml({ w: c.passWindow(14, '2026-11-14'), early: false })) && /Game Pass gesichert!/.test(c.pvHtml({ w: c.passWindow(14, '2026-11-14'), early: true })), 'It says active, or secured when it starts later');
  c.S.demo = false; c.UI.passDate = '2026-11-14'; c.A.passBuy();
  ok(c.UI.screen === 'home' && c.UI.pvOn === true, 'Buying the pass goes home and starts the reveal');
  c.pvClose(true); ok(!c.UI.pvOn, 'It can be skipped');
}
/* 10. the invitation for guests */
{
  const c = party(11);
  c.A.openGuestForm();
  let h = c.V.guestForm();
  ok(/Du bist eingeladen!/.test(h) && /Ich bin dabei!/.test(h) && /wl-intro/.test(h) && /Jonas/.test(h) && /Mia/.test(h) && !/Wie heißt du\?/.test(h), 'First the invitation: who is celebrated, one button, no form yet');
  ok(/Ein Abend voller Spiele/.test(h) && /zwei Minuten/.test(h) && !holes(h), 'It says what this is, without holes');
  c.A.gWelcome();
  h = c.V.guestForm();
  ok(c.gPass().welcomed && /Wie heißt du\?/.test(h) && /class="scr gscr gtest gin"/.test(c.app.innerHTML), 'Ich bin dabei: the form, arriving piece by piece');
  ok(!/class="scr gscr gtest gin"/.test((c.render(), c.app.innerHTML)), 'Only once');
  /* the guest link remembers it */
  const l = party(12);
  l.UI.guestMode = 'link'; l.UI.screen = 'guestForm'; l.UI.gPassData = null; l.UI.qSent = '';
  ok(/Du bist eingeladen!/.test(l.V.guestForm()), 'Link: the invitation on the first visit');
  l.A.gWelcome(); l.UI.gPassData = null;
  ok(!/Du bist eingeladen!/.test(l.V.guestForm()) && /Wie heißt du\?/.test(l.V.guestForm()), 'Link: next visit goes straight to the form');
  const m = party(13); m.A.openMasterForm();
  ok(!/Du bist eingeladen!/.test(m.V.guestForm()), 'The master’s own form has no invitation');
}
/* 11. first setup: two questions, then what comes next */
{
  const c = load({ seed: 21 });
  c.A.newEvent();
  let h = c.V.setup();
  ok(/Schritt 1 von 2/.test(h) && /Was wird gefeiert\?/.test(h), 'Step 1 of 2: what is celebrated');
  ok(c.playableCount() > 20, 'A typical party is assumed for the material (' + c.playableCount() + ' games)');
  c.A.setupNext(); h = c.V.setup();
  ok(/Schritt 2 von 2/.test(h) && /Wer wird gefeiert\?/.test(h), 'Step 2 of 2: who is celebrated');
  c.A.setupNext(); ok(c.UI.step === 2 && /mindestens eine Person/.test(c.UI.setupErr), 'Nobody yet: it asks for a person');
  c.E().focus.push({ id: 'f1', name: 'Lena', anlass: 'sockenkranz', count: 25 }); c.A.setupNext(); h = c.V.setup();
  ok(c.UI.step === 3 && /Eure Party steht!/.test(h) && /So geht’s weiter/.test(h) && /Den Abend einstellen/.test(h) && /Gäste einladen/.test(h) && /Zur Party/.test(h), 'Then the page that says what comes next');
  ok(/Lena/.test(c.E().name), 'The evening got a name: ' + c.E().name);
  c.A.setupFinish();
  ok(c.UI.screen === 'home', 'Zur Party: home');
}
/* 12. the start on the home screen waits for the evening to be set up */
{
  const c = party(22);
  c.go('home'); let h = c.V.home();
  ok(/class="play locked"/.test(h) && /Erst den Abend einstellen/.test(h) && /Ladet eure Gäste ein|ladet noch mehr ein/.test(h), 'Not set up: the start is locked, a banner says why, the hero asks to invite guests');
  ok(h.indexOf('setbar') < h.indexOf('guestcard'), 'The pink guest card comes after the banner');
  c.A.heroGo();
  ok(!c.R() && c.UI.screen === 'home' && /Stell zuerst den Abend ein/.test(c.UI.toast), 'Tapping start says: set it up first');
  c.A.openRun(); c.A.cfgNext(); c.A.cfgNext(); c.A.cfgSave();
  h = c.app.innerHTML;
  ok(c.UI.screen === 'home' && c.cfgSaved() && /class="play ready unlocked"/.test(h) && /Abend eingestellt/.test(h), 'Saved: home, the start unlocks and begs to be pressed');
  ok(/class="play ready"/.test(c.V.home()), 'And keeps begging');
  c.A.heroGo();
  ok(c.R() && c.UI.screen === 'run' && c.UI.kickOn, 'Now the start starts, with the cheer');
  c.kickClose(); c.go('home');
  ok(!/setbar/.test(c.V.home()) && /Weiter am Kranz/.test(c.V.home()), 'While playing: no banner, the button goes back to the game');
  const d = party(23); d.A.openRun(); d.A.cfgNext(); d.A.cfgNext(); d.A.cfgSave(); d.A.setEventAnlass({ v: 'geburtstag' });
  ok(!d.cfgSaved(), 'Another kind of party: set it up again');
}
/* 13. the example evening: a golden banner everywhere, the pass page wants to be bought */
{
  const c = party(24);
  ok(c.S.demo, 'The example evening');
  let seen = 0;
  [['home', () => c.V.home()], ['games', () => c.V.games()], ['questions', () => c.V.questions()], ['settings', () => c.V.settings()], ['counter', () => c.V.counter()], ['runSetup', () => (c.A.openRun(), c.V.runSetup())]].forEach(x => { c.UI.screen = x[0]; if (/class="demobar"/.test(x[1]())) seen++; });
  ok(seen === 6, 'The golden banner is on every master screen (' + seen + ' of 6)');
  c.UI.screen = 'pass'; ok(!/class="demobar"/.test(c.V.pass()), 'Not on the pass page itself');
  c.A.openGuestForm(); ok(!/class="demobar"/.test(c.V.guestForm()), 'Not in the guest view');
  c.UI.passDate = '2026-11-20'; c.UI.screen = 'pass'; const h = c.V.pass();
  ok(/class="p-plan[^"]* hot"/.test(h) && /pp-fizz/.test(h) && /pp-bait/.test(h) && /Bester Wert/.test(h), 'The 30-day pass fizzes, with the golden pass dangling in front of it');
  ok(/nur 43 Cent pro Tag/.test(h) && /nur 71 Cent pro Tag/.test(h), 'Price per day, honest');
  ok((h.match(/class="pf-t"/g) || []).length === 8 && /140\+/.test(h) && /class="cta p-buy"/.test(h) && /Game Pass für/.test(h), 'Everything inside, in big, and a golden buy button');
  ok(!holes(h), 'No holes on the pass page');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exitCode = fails ? 1 : 0;
