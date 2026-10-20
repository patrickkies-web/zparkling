/* v39: the home page without a bar, the occasion picker, the new intro. node harness/check39.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
const holes = s => /undefined|NaN|\[object|null</.test(s.replace(/data-[a-z]+="[^"]*"/g, ''));
/* 1. home: no bar, sections lead to the guests' page and the games */
{
  const c = load({ seed: 1 }); c.A.loadDemo();
  const h = c.V.home();
  ok(!/class="tabbar"/.test(h), 'No bar at the bottom of the home page');
  ok(/Fragen und Beiträge/.test(h) && /data-act="homeJump" data-v="questions" data-j="qs-neu"/.test(h) && /Gäste einladen/.test(h) && /Selbst Fragen eintragen/.test(h) && /Karten für die Party/.test(h), 'A section leads to everything about the guests');
  ok(/id="hm-spiele"/.test(h) && /data-act="go" data-to="games"/.test(h), 'The games are a section further down');
  ok(!/data-to="counter"/.test(h), 'The Pinnchen counter is not on the home page');
  c.A.homeJump({ v: 'questions', j: 'qs-neu' }); ok(c.UI.screen === 'questions', 'A row opens the guests\' page');
  ['questions', 'games', 'counter'].forEach(sc => { c.go(sc); const x = c.V[sc](); ok(!/class="tabbar"/.test(x) && /data-act="go" data-to="home"/.test(x), sc + ': no bar, a way back to the party'); });
  ok(!holes(h), 'No holes on the home page');
}
/* 2. the example evening starts with the occasion */
{
  const c = load({ seed: 2 }); c.go('landing');
  const L = c.V.landing();
  ok(/data-act="openDemoPick"/.test(L) && !/data-act="loadDemo"/.test(L), 'Landing: the example evening opens the choice first');
  c.A.openDemoPick({ from: 'landing' }); let h = c.V.demoPick();
  ok(c.UI.screen === 'demoPick' && (h.match(/class="dp-tk"/g) || []).length === c.EVENT_TYPES.length && !/dp-tk on/.test(h) && !/25 Socken|25 Stück/.test(h) && !holes(h), 'Every occasion as a ticket, nothing open yet, no sock count');
  c.A.dpSel({ v: 'jga' }); h = c.V.demoPick();
  ok(/class="dp-tk on"/.test(h) && /Junggesellenabschied/.test(h) && /Missionen/.test(h) && /data-act="dpStart"/.test(h), 'A tap opens a short note with a start button');
  c.A.dpStart();
  ok(c.S.demo && c.E().anlass === 'jga' && c.UI.screen === 'home', 'Start: the example evening with that occasion, on the home page');
  const d = load({ seed: 3 }); d.go('landing'); d.A.lpTry({ v: 'treppe' });
  ok(d.UI.screen === 'demoPick' && d.UI.dpSel === 'treppe', 'An occasion on the landing page opens the choice with it selected');
}
/* 3. the intro covers the whole app */
{
  const c = load({ seed: 4 });
  const ids = c.TOUR.map(t => t.id).join(',');
  ok(c.TOUR.length === 10 && ['modes', 'link', 'games', 'dials', 'ready', 'easy', 'cards'].every(x => ids.indexOf(x) >= 0), 'Ten slides: occasions, guests in two steps, settings, prepared, relaxed, cards');
  const tx = c.TOUR.map(t => c.TOUR_TX[t.id]()).map(x => x.h + ' ' + x.t).join(' ');
  ok(/Sockenkranz/.test(tx) && /Polterabend/.test(tx) && /JGA/.test(tx) && /Schritt 1/.test(tx) && /Schritt 2/.test(tx) && /vorbereitet/.test(tx) && /Ohne Zwang/.test(tx) && /überspringen/.test(tx) && /bloßzustellen/.test(tx) && /Karten raus/.test(tx) && /Papier/.test(tx), 'The words are there: occasions, guests, prepared, no compulsion, paper cards');
  c.UI.tourName = 'Lisa'; c.go('tour');
  for (let i = 0; i < c.TOUR.length; i++) { c.UI.tourAt = i; const h = c.V.tour(); if (holes(h)) { ok(false, 'slide ' + c.TOUR[i].id + ' has holes'); } }
  ok(true, 'Every slide renders');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exit(fails ? 1 : 0);
