/* targeted checks: the bonus cards in the guest link and the rounds they make. node harness/check25.js */
'use strict';
const { load } = require('./run');
let fails = 0;
function ok(cond, msg) { if (!cond) { fails++; console.log('FAIL', msg); } else console.log('ok  ', msg); }
function party(seed) { const c = load({ seed }); c.A.loadDemo(); return c; }
/* a guest in the test view with one finished contribution */
function guest(c, name) {
  c.A.openGuestForm(); c.gPass().welcomed = true; c.UI.gForm.author = name || 'Paula';
  c.A.gAdd({ v: 'worte' }); const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen';
  c.gRender();
}
function openCard(c, type, n) { const p = c.gkPickType; c.gkPickType = () => ({ type, n }); c.gkOpen(); c.gkPickType = p; return c.UI.gk; }
function redeem(c, text) { if (text != null) c.setBind('gk.text', text); c.A.gkDone(); c.flushTimers(); }
const holes = s => /\{[A-Za-z]+\}|undefined|NaN|null/.test(s);

/* 1. the button only exists when everything is filled in */
{
  const c = party(1);
  c.A.openGuestForm(); c.gPass().welcomed = true; c.UI.gForm.author = 'Paula'; c.A.gAdd({ v: 'worte' });
  ok(!c.gkCanDraw(), 'No card while a contribution is unfinished');
  const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen';
  ok(c.gkCanDraw() && c.gkLeft() === 2, 'Everything filled: two cards to draw');
  c.A.gAdd({ v: 'luege' });
  ok(!c.gkCanDraw(), 'A new unfinished contribution hides the button again');
  c.A.gDel({ k: '1' });
  ok(c.gkCanDraw(), 'Removing it brings the button back');
  const html = c.V.guestForm();
  ok(/id="gdraw"/.test(html) && /Karte ziehen/.test(html), 'The button is rendered under Abschicken');
}
/* 2. the app picks the kind the guests sent least */
{
  const c = party(2);
  guest(c); c.GK_JOKER_P = 0; c.GK_WEITER_P = 0; c.GK_REGEL_P = 0;
  const cnt = c.gkCounts();
  const mn = Math.min.apply(null, c.GK_KINDS.map(k => cnt[k]));
  const seen = {};
  for (let k = 0; k < 40; k++) { const p = c.gkPickType(); seen[p.type] = 1; if (cnt[p.type] !== mn) { ok(false, 'picked ' + p.type + ' with ' + cnt[p.type] + ' while the least is ' + mn); break; } }
  ok(Object.keys(seen).every(t => cnt[t] === mn), 'Always the least present kind (' + Object.keys(seen).join(', ') + ' with ' + mn + ')');
  /* make portrait the only rare one */
  c.S.questions = c.S.questions.filter(q => q.type !== 'portrait');
  ok(c.gkPickType().type === 'portrait' && c.gkPickType().n === 0, 'With no portraits at all, the portrait comes');
  ok(c.gkRarity(0).id === 'leg' && c.gkRarity(2).id === 'epi' && c.gkRarity(7).id === 'sel', 'Rarity: none yet is legendary, a few epic, many rare');
  const k = openCard(c, c.gkPickType().type, 0);
  ok(k && k.type === 'portrait' && k.rar === 'leg' && k.pts === 30, 'The drawn card is a legendary portrait worth 30');
}
/* 3. two cards, the second only after the first is redeemed, then no more */
{
  const c = party(3);
  guest(c);
  c.A.gDraw(); ok(c.UI.gkBusy, 'The button charges before the pack opens');
  c.flushTimers();
  const k1 = c.UI.gk;
  ok(!!k1 && !c.gkCanDraw(), 'A card is open, no second one in the meantime');
  c.A.gDraw(); ok(c.UI.gk === k1, 'Tapping again does not open another pack');
  if (k1.type === 'portrait') { c.A.gkStart(); k1.strokes = [[0, 100, 100, 200, 200, 300, 300, 400, 400, 500, 500, 600, 600]]; k1.strokes.push([1, 100, 900, 300, 900, 500, 900, 700, 900, 900, 900, 900, 100]); redeem(c); }
  else redeem(c, k1.type === 'spruch' ? 'Das kriegen wir hin' : 'Faultier');
  ok(!c.UI.gk && c.gForm().cards.length === 1, 'First card redeemed into the list');
  ok(c.gkCanDraw() && c.gkLeft() === 1, 'One more card can be drawn');
  ok(/>1×</.test(c.V.guestForm()), 'The button counts down to 1×');
  const k2 = openCard(c, 'umfrage', 1);
  ok(k2.no === 2, 'The second card says Karte 2 von 2');
  redeem(c, 'Handy');
  ok(c.gkLeft() === 0 && !c.gkCanDraw(), 'After two cards there are no more');
  ok(!/id="gdraw"/.test(c.V.guestForm()), 'And the button is gone');
  const before = c.S.questions.length;
  c.A.gSubmit();
  const sent = c.S.questions.slice(before);
  ok(sent.length === 3 && sent.filter(q => c.isCardType(q.type)).length === 2, 'Submit sends the contribution and both cards');
  ok(sent.every(q => q.status === 'offen' && q.author === 'Paula'), 'Cards wait for the master like everything else');
  const u = sent.filter(q => q.type === 'umfrage')[0];
  ok(u && u.qk && c.umfrageQ(u.qk) && u.text === 'Handy' && u.forId, 'The survey answer keeps its question and person');
  ok(c.gPass().cards === 2, 'The pass remembers the two cards');
  c.A.qAnother(); c.A.gAdd({ v: 'worte' }); const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'lieb'; it.interest = 'Tanzen';
  ok(c.gkLeft() === 0 && !c.gkCanDraw(), 'Contributing again does not give new cards');
}
/* 3b. putting a card back uses up the draw */
{
  const c = party(31);
  guest(c);
  ok(/>2×</.test(c.V.guestForm()), 'The button says 2×');
  c.UI.gDrawSeen = true; /* it came out, the guest tapped it */
  openCard(c, 'wenn', 3); c.A.gkLater(); c.flushTimers();
  ok(!c.UI.gk && c.gkLeft() === 1 && c.gkCanDraw(), 'Putting a card back uses up one draw');
  const h = c.V.guestForm();
  ok(/>1×</.test(h) && /Deine letzte Bonuskarte/.test(h), 'The button now says 1×, the last card');
  ok(/class="gdraw-wrap on/.test(h), 'The button stays out, no second tug');
  const k = openCard(c, 'spruch', 3);
  ok(k && k.no === 2, 'The next one is Karte 2 von 2');
  c.A.gkLater(); c.flushTimers();
  ok(c.gkLeft() === 0 && !c.gkCanDraw() && !/id="gdraw"/.test(c.V.guestForm()), 'Both put back: no cards left, the button is gone');
  ok(!(c.gForm().cards || []).length, 'Nothing landed in the list');
  c.A.gDraw(); c.flushTimers();
  ok(!c.UI.gk, 'Tapping where the button was opens nothing');
}
/* 3c. in the guest link the used draw survives a reload */
{
  const c = party(32);
  guest(c); c.UI.guestMode = 'link'; c.UI.gPassData = null;
  openCard(c, 'wenn', 3); c.A.gkLater(); c.flushTimers();
  c.UI.gPassData = null;
  ok(c.gPass().burned === 1 && c.gkLeft() === 1, 'Reloading the link does not give the card back');
}
/* 4. inputs are checked */
{
  const c = party(4);
  guest(c);
  const k = openCard(c, 'wenn', 0);
  c.setBind('gk.text', ' '); c.A.gkDone();
  ok(!!c.UI.gk && !c.gForm().cards, 'An empty word is not accepted');
  c.setBind('gk.text', 'Ein ganz langes Wort das nicht endet und nicht endet');
  ok(c.UI.gk.text.length <= 28, 'Words are cut at 28 characters');
  c.A.gkLater();
  const p = openCard(c, 'portrait', 0);
  ok(!c.gkValid(p), 'A portrait needs drawing first');
  c.A.gkStart(); ok(p.phase === 'draw' && !c.gkValid(p), 'The clock runs, still nothing drawn');
  p.strokes = [[0, 500, 500, 520, 520]];
  ok(!c.gkValid(p), 'A dot is not a portrait');
  p.strokes = [[0, 200, 200, 300, 250, 400, 300, 500, 350, 600, 400, 700, 450, 800, 500, 850, 520, 870, 540, 880, 560, 890, 570]];
  ok(c.gkValid(p), 'A real stroke counts');
  c.advance(30 / 60); c.gkTick();
  ok(p.phase === 'draw', 'After 30 seconds there is still time (45 in all)');
  c.advance(16 / 60); c.gkTick();
  ok(p.phase === 'over', 'After 45 seconds the time is up');
  c.A.gkDone(); c.flushTimers();
  const card = c.gForm().cards[0];
  ok(card && card.draw && c.gkDecode(card.draw).length === 1 && c.gkDecode(card.draw)[0].pts.length === p.strokes[0].length - 1, 'The drawing survives encoding');
}
/* 5. drawings from outside cannot break the page */
{
  const c = party(5);
  const svg = c.drawSvg('9zz<script>|0a"b"c|xx' + "'onload='alert(1)" + '|1' + '00'.repeat(4), 50);
  ok(!/<script|onload|"b"/.test(svg), 'A forged drawing turns into numbers only');
  ok(c.gkDecode('').length === 0 && c.gkDecode(null).length === 0, 'Empty drawings are empty');
  const s = [[0, 0, 0, 999, 999, 500, 1], [3, 10, 20, 30, 40]];
  const back = c.gkStrokes(c.gkEncode(s));
  ok(JSON.stringify(back) === JSON.stringify(s), 'Encoding round trip is exact');
}
/* 6. Top-Antworten concentrate on one question */
{
  const c = party(6);
  guest(c);
  c.S.questions = c.S.questions.filter(q => q.type !== 'umfrage');
  const id = c.E().focus[1].id;
  ['Kaffee', 'Kaffee', 'Tee'].forEach((t, i) => c.S.questions.push({ id: 'uq' + i, t: 1, author: 'G' + i, forId: id, type: 'umfrage', qk: 'geld', text: t, status: 'ok', used: false, options: [], correct: 0 }));
  let same = 0; for (let k = 0; k < 20; k++) { const u = c.gkUmfragePick(); if (u.qk === 'geld' && u.forId === id) same++; }
  ok(same === 20, 'The next survey card goes to the question that already has answers');
  for (let i = 3; i < 8; i++) c.S.questions.push({ id: 'uq' + i, t: 1, author: 'H' + i, forId: id, type: 'umfrage', qk: 'geld', text: 'X' + i, status: 'ok', used: false, options: [], correct: 0 });
  let full = 0; for (let k = 0; k < 20; k++) { const u = c.gkUmfragePick(); if (u.qk === 'geld' && u.forId === id) full++; }
  ok(full === 0, 'A full question makes room for the next one');
  ok(c.wordKey('Kaugummis') === c.wordKey('kaugummi') && c.wordKey('das Handy') === c.wordKey('Handy') && c.wordKey('Weißbier') === c.wordKey('weissbier'), 'Same word, other spelling counts as the same answer');
}
/* 7. card contributions never come as single questions */
{
  const c = party(7);
  ok(c.S.questions.filter(q => c.isCardType(q.type)).every(q => c.questionSlots(q) === 0), 'Cards hold no single-question slots');
  for (let k = 0; k < 30; k++) { const st = c.buildFree('frage'); if (st && c.isCardType((c.S.questions.filter(q => q.id === st.qid)[0] || {}).type)) { ok(false, 'a card came as a single question'); break; } }
  ok(c.rareTypes(c.typeCounts()).every(t => !c.isCardType(t)), 'The rare-kinds nudge only names kinds a guest can pick');
  ok(c.formTypes().length === 9 && c.QTYPES.length === 16, 'Nine kinds in the form, seven more from the cards');
}
/* 8. the rounds */
function forceRound(c, id, main) {
  const ch = c.ggChoose; c.ggChoose = cand => cand.filter(g => g.id === id)[0] || null;
  let st = null; try { st = c.makeGuestGameStep(main || c.E().focus[0].id, null); } catch (e) { st = null; }
  c.ggChoose = ch; return st && st.gg === id ? st : null;
}
{
  const c = party(8);
  const main = c.E().focus[0].id, mn = c.person(main).name;
  const ready = c.ggReadyFor(main).map(g => g.id);
  ok(['galerie', 'waere', 'sprueche', 'umfrage'].every(id => ready.indexOf(id) >= 0), 'The demo makes all four card rounds for ' + mn + ' (' + ready.join(', ') + ')');
  /* board */
  let P = forceRound(c, 'umfrage', main);
  ok(P && P.mode === 'board' && P.items.length === 4 && P.items[0].n === 2 && P.need === 3, 'Top-Antworten: four answers, the most frequent first, three needed');
  ok(P && !holes(P.text + P.qtext + P.rule), 'Board texts are complete: ' + (P && P.text));
  c.S.free = { step: P, from: 'games' }; c.go('free');
  c.A.gbHit({ i: '0' }); c.A.gbMiss(); c.A.gbMiss();
  ok(P.items[0].hit && P.strikes === 2 && !c.gbClosed(P), 'A hit and two misses, the board is still open');
  c.A.gbMiss(); c.A.gbHit({ i: '1' });
  ok(c.gbClosed(P) && !P.items[1].hit && P.strikes === 3, 'The third miss closes the board');
  c.A.gbMiss(); ok(P.strikes === 3, 'Never more than three misses');
  const html = c.renderStepScreen ? c.renderStepScreen(P, true) : '';
  ok(!html || /gb-board/.test(html), 'The board renders');
  c.A.stepResolve({ v: 'eval' });
  ok(P.result && P.result.tone === 'fail' && P.result.rows.length === 1 && P.result.rows[0].pid === main && P.result.rows[0].n === 1, 'One of four found: the birthday person drinks one, nobody else');
  ok(P.result.lines.length === 4 && P.result.lines.every(l => /(Gast|Gäste) \(/.test(l.t)), 'The resolution names who said what');
  /* judge */
  P = forceRound(c, 'sprueche', main);
  ok(P && P.mode === 'judge' && P.items.length >= 3 && P.items.every(x => x.cue && x.cue !== x.full && x.full.indexOf(x.cue.replace(/ ….*$/, '').replace(/….*$/, '')) === 0), 'Sprüche: only the start of each saying shows');
  c.S.free = { step: P, from: 'games' }; c.go('free');
  c.A.gjMark({ v: '1' }); ok(P.hits.length === 0, 'Nothing is marked before uncovering');
  P.items.forEach(() => { c.A.gjOpen(); c.A.gjMark({ v: '1' }); });
  c.A.stepResolve({ v: 'eval' });
  ok(P.result && P.result.tone === 'ok' && P.result.rows.every(r => r.group), 'All sayings sit: the guests may toast, the birthday person does not drink');
  ok(c.spruchCue('Läuft!') === 'L… (5 Buchstaben)' && c.spruchCue('Passt scho!') === 'Passt …', 'Short sayings still leave something to guess');
  /* wenn */
  P = forceRound(c, 'waere', main);
  ok(P && P.mode === 'multi' && P.items.length >= 3 && P.items.every(it => it.options.length === 4 && it.correct >= 0 && it.options.filter(o => c.wordKey(o) === c.wordKey(it.options[it.correct])).length === 1), 'Wenn … wäre: one real answer, three made up, never the same word');
  const tier = P.items.filter(it => /Tier/.test(it.prompt))[0];
  ok(!tier || /auch genannt: (Bär|Faultier)/.test(tier.reveal), 'Other answers in the same category come with the reveal');
  /* gallery */
  P = forceRound(c, 'galerie', main);
  ok(P && P.items.length === 3 && P.items.every(it => it.draw && it.options[it.correct] === it.reveal && it.options.length >= 3), 'Porträt-Galerie: three drawings, the artist among the names');
  /* rounds spend the material */
  c.S.free = { step: P, from: 'games' }; c.go('free');
  P.items.forEach((it, k) => c.A.ggChoose({ k: String(k), i: String(it.correct) })); c.A.stepResolve({ v: 'eval' });
  ok(!forceRound(c, 'galerie', main), 'The same portraits do not come twice');
  /* the hint in the guest form never points at card material */
  const h = c.ggHint();
  ok(!h || c.CARD_FAMS.indexOf(h.fam) < 0, 'The guest form hint never asks for card material');
  /* the master sees everything */
  c.go('questions');
  const qh = c.V.questions();
  ok(/Porträt von/.test(qh) && /Lieblingsspruch/.test(qh) && !holes(qh.replace(/data-[a-z]+="[^"]*"/g, '')), 'The master view shows the cards, without holes');
  ok(/Kommt über die Bonuskarten|Porträts/.test(c.qRounds().html), 'The round inventory lists the card material');
}
/* 9. lip reading takes sayings only when their round is through */
{
  const c = party(9);
  const main = c.E().focus[0].id;
  const lines = c.personalLines(main, 'lippen');
  ok(lines.indexOf('Passt scho!') < 0, 'Sayings stay secret while their round can still come');
  c.S.questions.forEach(q => { if (q.type === 'spruch') q.used = true; });
  ok(c.personalLines(main, 'lippen').indexOf('Passt scho!') >= 0, 'After the round, they show up for lip reading');
}
/* 10. the overlay renders for every kind and rarity without holes */
{
  const c = party(10);
  guest(c);
  let bad = 0;
  ['portrait', 'wenn', 'spruch', 'umfrage'].forEach(t => [0, 2, 9].forEach(n => {
    openCard(c, t, n); c.UI.gk.played = false;
    const h1 = c.V.guestForm(), h2 = c.V.guestForm();
    if (!/gk-play/.test(h1) || !/gk-static/.test(h2) || holes(h1.replace(/data-[a-z]+="[^"]*"|--[a-z0-9]+:[^;"]*/g, ''))) { bad++; console.log('   ', t, n); }
    if (t === 'portrait') { c.A.gkStart(); if (!/gk-drawmode/.test(c.V.guestForm())) bad++; }
    c.A.gkLater(); c.flushTimers(); c.gPass().burned = 0;
  }));
  ok(!bad, 'Every card renders: first the opening, then the still card');
}
console.log(fails ? fails + ' FAILED' : 'all ok');
process.exitCode = fails ? 1 : 0;
