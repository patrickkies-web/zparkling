/* =========================================================
   The guest form as a small experience:
   the birthday people react to what you do, every kind of
   contribution has its own look and animation, a party pass
   collects points, levels and stickers, a ticket at the end.
   ========================================================= */
var GQ_STYLE = {
  worte: { c: '#8FE3FF', e: 'tags', stamp: 'Notiert' },
  steckbrief: { c: '#48D9A6', e: 'idcard', stamp: 'Geprüft' },
  luege: { c: '#FF7A45', e: 'mask', stamp: 'Pokerface' },
  wer: { c: '#FF8FC4', e: 'letter', stamp: 'Versiegelt' },
  tipp: { c: '#FFC940', e: 'watch', stamp: 'Wette steht' },
  schaetzen: { c: '#9886FF', e: 'jar', stamp: 'Top secret' },
  auswahl: { c: '#FF9A73', e: 'target', stamp: 'Quizfertig' },
  bereich: { c: '#7FA8FF', e: 'ruler', stamp: 'Eingestellt' },
  aufgabe: { c: '#FF7AB6', e: 'flame', stamp: 'Mutprobe' }
};
var G_LEVELS = [[0, 'Zaungast', 'fence'], [20, 'Partygast', 'balloon'], [45, 'Stimmungskanone', 'popper'], [80, 'Ehrengast', 'crown'], [120, 'Legende des Abends', 'trophy']];
var G_STICKERS = [
  ['erst', 'balloon', 'Erster Beitrag', function (s) { return s.done >= 1; }],
  ['bunt', 'palette', 'Vielseitig', function (s) { return s.kinds >= 3; }],
  ['selten', 'diamond', 'Seltenheitsjäger', function (s) { return s.rare >= 1; }],
  ['poker', 'mask', 'Pokerface', function (s) { return !!s.t.luege; }],
  ['agent', 'agent', 'Geheimagent', function (s) { return !!s.t.wer; }],
  ['hell', 'hellseher', 'Hellseher', function (s) { return !!s.t.tipp; }],
  ['quiz', 'target', 'Quizmaster', function (s) { return s.q >= 2; }],
  ['hase', 'bunny', 'Alter Hase', function (s) { return s.hase; }],
  ['mut', 'flame', 'Mutmacher', function (s) { return !!s.t.aufgabe; }]
];
/* what the birthday people say. {N} name, {Y} years, {M} minutes, {L} level */
var GQ_REACT = {
  hello: ['Pssst… heute Abend spielst du mit. Wie heißt du?', 'Hey du! Verrat mir erst mal, wer du bist.', 'Na, bereit, mich ein bisschen auflaufen zu lassen?'],
  name: ['Hi {N}! Schön, dass du dabei bist.', '{N}! Dich hab ich mir gewünscht.', 'Na {N}, bereit für ein bisschen Chaos?'],
  add_worte: ['Nur zwei Worte? Jetzt bin ich gespannt!', 'Wie würdest du mich beschreiben? Sei ehrlich… aber nett.'],
  done_worte: ['Ha, das passt! Daraus wird was Feines.', 'Notiert. Ich bin gespannt, was daraus wird!'],
  add_steckbrief: ['Ein Steckbrief? Mal sehen, wie gut ich dich kenne.', 'Oh, jetzt wird’s persönlich!'],
  add_luege: ['Zwei Wahrheiten, eine Lüge? Ich durchschau dich!', 'Pokerface an. Ich bin bereit.'],
  add_wer: ['Eine Erinnerung? Bitte nichts zu Peinliches…', 'Oh je. Woran erinnerst du dich denn?'],
  add_tipp: ['Wie lange ich wohl brauche? Sei nett!', 'Wetten werden angenommen!'],
  add_frage: ['Eine Frage über mich? Hoffentlich weiß ich das…', 'Uh, Quizzeit. Ich schwitz jetzt schon.'],
  add_aufgabe: ['Eine Aufgabe für mich?! Oh oh.', 'Ich ahne Schlimmes… und freu mich drauf.'],
  rare: ['Das gibt’s noch selten. Doppelte Punkte für dich!', 'Seltenheits-Bonus! Genau so was fehlt noch.'],
  done_steckbrief_y: ['{Y} schon? Wahnsinn, wie die Zeit vergeht!', '{Y}! Und du bist immer noch da. Respekt.'],
  done_steckbrief: ['Steckbrief geprüft. Jetzt weiß ich alles!', 'Notiert. Das frag ich dich heute Abend ab.'],
  done_luege: ['Hmm… ich hab da so eine Ahnung.', 'Verdächtig gut gelogen!'],
  done_wer: ['Ich werd rot! Wer das wohl war…', 'Versiegelt. Ich bin so gespannt!'],
  done_tipp: ['{M}? Das schaff ich locker. Oder?', 'Wette steht. Ich geb mein Bestes!'],
  done_frage: ['Puh, die Antwort weiß ich hoffentlich.', 'Gemein! Aber gut.'],
  done_aufgabe: ['Na gut, ich mach’s. Für dich.', 'Mutprobe angenommen!'],
  lie: ['Aha, das ist also gelogen…', 'Psst, ich hab nicht hingeguckt!'],
  correct: ['Ich guck weg, versprochen!', 'Die richtige Antwort? Ich hab nichts gesehen.'],
  remove: ['Okay, dann eben nicht.', 'Schade! Aber kein Ding.'],
  level: ['Level-Up! Du bist jetzt {L}.', 'Wow, {L}! Weiter so.'],
  missing: ['Fast! Da fehlt noch eine Kleinigkeit.', 'Kurz noch: Ein Feld ist leer geblieben.'],
  sent: ['Danke, {N}! Das wird ein Spaß.', '{N}, du bist spitze! Bis heute Abend.']
};
var GQ_MOOD = { add_worte: 'staunen', done_worte: 'verliebt', hello: '', name: 'jubel', add_steckbrief: 'staunen', add_luege: 'misstrauisch', add_wer: 'verliebt', add_tipp: 'cool', add_frage: 'denken', add_aufgabe: 'mist', rare: 'staunen', done_steckbrief_y: 'staunen', done_steckbrief: 'jubel', done_luege: 'misstrauisch', done_wer: 'verliebt', done_tipp: 'cool', done_frage: 'denken', done_aufgabe: 'jubel', lie: 'misstrauisch', correct: 'cool', remove: 'mist', level: 'jubel', missing: 'denken', sent: 'jubel' };
var FRAGE_TYPES = ['schaetzen', 'auswahl', 'bereich', 'aufgabe'];
function gFam(t) { return t === 'aufgabe' ? 'aufgabe' : FRAGE_TYPES.indexOf(t) >= 0 ? 'frage' : t; }

/* ---------- state ---------- */
var GPASS_KEY = 'altesocke.guest.pass';
function gPass() {
  if (!UI.gPassData) {
    var d = UI.guestMode === 'link' ? lsGet(GPASS_KEY) : null;
    UI.gPassData = d && typeof d.bank === 'number' ? d : { name: '', bank: 0, stickers: [], sent: 0 };
  }
  return UI.gPassData;
}
function gPassSave() { if (UI.guestMode === 'link') lsSet(GPASS_KEY, UI.gPassData); }
function gRareSet() { if (!UI.gRare) UI.gRare = rareTypes(typeCounts()); return UI.gRare; }
function gDone(it) { return !gMissing(it).length && !draftToQ(it, 'Gast', false).err; }
function gItemPts(it) { return gDone(it) ? (gRareSet().indexOf(it.type) >= 0 ? 20 : 10) : 0; }
function gScore() {
  var G = gForm(), pass = gPass(), pts = pass.bank ? pass.bank : 10, kinds = {};
  if (!pass.bank && String(G.author || '').trim().length >= 2) pts += 5;
  G.items.forEach(function (it) { var p = gItemPts(it); if (p) { pts += p; kinds[it.type] = 1; } });
  (G.cards || []).forEach(function (c) { pts += c.pts || 0; kinds[c.type] = 1; });
  return pts + Object.keys(kinds).length * 5;
}
function gLevel(p) { var i = 0; G_LEVELS.forEach(function (x, k) { if (p >= x[0]) i = k; }); return { i: i, l: G_LEVELS[i], next: G_LEVELS[i + 1] || null }; }
function gPct(p) { var lv = gLevel(p); return lv.next ? Math.round((p - lv.l[0]) / (lv.next[0] - lv.l[0]) * 100) : 100; }
function gStats() {
  var s = { done: 0, kinds: 0, rare: 0, t: {}, q: 0, hase: false, cards: 0, leg: false, joker: false }, Y = thisYear();
  (gForm().cards || []).forEach(function (c) { s.cards++; if (c.rar === 'leg') s.leg = true; if (c.type === 'joker') s.joker = true; if (!s.t[c.type]) { s.t[c.type] = 1; s.kinds++; } });
  gForm().items.forEach(function (it) {
    if (!gDone(it)) return;
    s.done++; if (!s.t[it.type]) { s.t[it.type] = 1; s.kinds++; }
    if (gRareSet().indexOf(it.type) >= 0) s.rare++;
    if (FRAGE_TYPES.indexOf(it.type) >= 0) s.q++;
    if (it.type === 'steckbrief' && it.year && Y - Number(it.year) >= 10) s.hase = true;
  });
  return s;
}
function gStickers() {
  var s = gStats(), have = gPass().stickers.slice();
  G_STICKERS.forEach(function (x) { if (x[3](s) && have.indexOf(x[0]) < 0) have.push(x[0]); });
  return have;
}
function gSticker(id) { return G_STICKERS.filter(function (x) { return x[0] === id; })[0]; }
function gVibe(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

/* ---------- small helpers ---------- */
var ZODIAC = [['Steinbock', '♑'], ['Wassermann', '♒'], ['Fische', '♓'], ['Widder', '♈'], ['Stier', '♉'], ['Zwillinge', '♊'], ['Krebs', '♋'], ['Löwe', '♌'], ['Jungfrau', '♍'], ['Waage', '♎'], ['Skorpion', '♏'], ['Schütze', '♐']];
var ZODIAC_CUT = [19, 18, 20, 19, 20, 20, 22, 22, 22, 22, 21, 21];
function zodiac(b) { var d = +b.slice(0, 2), m = +b.slice(3, 5); return ZODIAC[d <= ZODIAC_CUT[m - 1] ? m - 1 : m % 12]; }
function fmtDur(m) { m = Math.round(Number(m)); if (m < 60) return m + ' Minuten'; var h = Math.floor(m / 60), r = m % 60; return h + (h === 1 ? ' Stunde' : ' Stunden') + (r ? ' ' + r + ' Min' : ''); }
function gWho(it) { var e = E(); return e && e.focus.length ? (it.forId && isFocus(it.forId) ? person(it.forId).name : focusNames()) : 'das Geburtstagskind'; }
function gByearOk(it) { var y = Number(String(it.byear || '').trim()); return y >= 1920 && y <= thisYear(); }
function gYears(it) { var y = Number(it.year), Y = thisYear(); return it.year !== '' && y >= 1940 && y <= Y ? Y - y : null; }
function gVars(it) { var n = it ? gYears(it) : null; return { Y: n == null ? '' : n === 1 ? '1 Jahr' : n + ' Jahre', M: it && it.answer !== '' ? fmtDur(it.answer) : '' }; }
function gNum(v) { return v !== '' && v != null && !isNaN(Number(v)); }
function gMissing(it) {
  var m = [], t = String(it.text || '').trim();
  switch (it.type) {
    case 'steckbrief':
      if (!String(it.year || '').trim() && !String(it.bday || '').trim() && !String(it.meet || '').trim()) m.push('mindestens ein Feld');
      if (String(it.year || '').trim() && gYears(it) == null) m.push('ein Jahr zwischen 1940 und ' + thisYear());
      if (String(it.byear || '').trim() && !gByearOk(it)) m.push('ein Jahrgang zwischen 1920 und ' + thisYear());
      if (String(it.bday || '').trim() && !parseBday(it.bday)) m.push(!it.bm ? 'Monat vom Geburtstag' : 'Tag vom Geburtstag (1 bis 31)');
      break;
    case 'luege':
      [0, 1, 2].forEach(function (i) { if (!String(it.options[i] || '').trim()) m.push('Satz ' + (i + 1)); });
      if (!(it.correct >= 0 && it.correct <= 2)) m.push('Lüge antippen');
      break;
    case 'wer': if (t.length < 8) m.push(t ? 'noch ' + (8 - t.length) + ' Zeichen' : 'deine Erinnerung'); break;
    case 'tipp': if (!gNum(it.answer) || Number(it.answer) < 5 || Number(it.answer) > 600) m.push('Minuten zwischen 5 und 600'); break;
    case 'schaetzen': if (!t) m.push('Frage'); if (!gNum(it.answer)) m.push('Lösung'); break;
    case 'auswahl':
      if (!t) m.push('Frage');
      if (it.options.filter(function (o) { return String(o || '').trim(); }).length < 2) m.push('zwei Antworten');
      if (!(it.correct >= 0 && String(it.options[it.correct] || '').trim())) m.push('richtige Antwort antippen');
      break;
    case 'bereich':
      if (!t) m.push('Frage');
      if (!gNum(it.min) || !gNum(it.max) || Number(it.min) >= Number(it.max)) m.push('Bereich von bis');
      else if (!gNum(it.answer) || Number(it.answer) < Number(it.min) || Number(it.answer) > Number(it.max)) m.push('Lösung im Bereich');
      break;
    case 'aufgabe': if (!t) m.push('Aufgabe'); break;
    case 'worte':
      if (!String(it.trait || '').trim()) m.push('ein Wort, das die Person beschreibt');
      if (!String(it.interest || '').trim()) m.push('ein Interesse');
      if (E() && E().focus.length > 1 && !it.forId) m.push('über wen');
      break;
  }
  return m;
}

/* ---------- speech ---------- */
function gSay(evt, it, vars) {
  var line = pick(GQ_REACT[evt] || GQ_REACT.name);
  vars = vars || {}; vars.N = String(gForm().author || '').trim() || 'du';
  line = line.replace(/\{(\w)\}/g, function (m, k) { return vars[k] != null ? vars[k] : ''; });
  var f = E() ? E().focus : [], who = '';
  if (it && it.forId && isFocus(it.forId)) who = it.forId;
  else if (f.length) { UI.gTurn = (UI.gTurn || 0) + 1; who = f[UI.gTurn % f.length].id; }
  UI.gBubble = { text: line, mood: GQ_MOOD[evt] || 'jubel', who: who };
  UI.gPop = true;
}
function gStage(big) {
  var f = E() ? E().focus : [];
  if (!UI.gBubble) gSay(String(gForm().author || '').trim() ? 'name' : 'hello');
  var b = UI.gBubble, sp = f.filter(function (p) { return p.id === b.who; })[0] || f[0];
  /* after sending, the ticket is the hero: the stage steps back */
  var size = big ? (f.length > 2 ? 54 : f.length === 2 ? 68 : 84) : (f.length > 2 ? 76 : f.length === 2 ? 92 : 112);
  var avs = f.map(function (p, i) {
    var talk = sp && p.id === sp.id;
    return '<span class="gav' + (talk ? ' talk' : '') + '" style="--d:' + (-i * 1.3) + 's">' + face(p, size, 'border:4px solid var(--ink);box-sizing:border-box', talk ? b.mood : (b.mood === 'jubel' ? 'jubel' : '')) + '</span>';
  }).join('');
  return '<div class="glights" aria-hidden="true"><i></i><i></i><i></i></div><div class="gbubble' + (UI.gPop ? ' pop' : '') + '">' + (f.length > 1 && sp ? '<span class="gwho">' + esc(sp.name) + '</span>' : '') + '<span aria-live="polite">' + gWords(b.text) + '</span></div><div class="gavs">' + (avs || groupFace(96)) + '</div>';
}
/* every word slides in out of a blur, one after the other */
function gWords(t) { return esc(t).split(' ').map(function (w, k) { return '<span class="gw" style="animation-delay:' + (k * 55) + 'ms">' + w + '</span>'; }).join(' '); }
function gStagePatch() { var el = document.getElementById('gstage'); if (el) el.innerHTML = gStage(!!UI.qSent); UI.gPop = false; }

/* ---------- party pass ---------- */
function gPassInner(p, from) {
  var lv = gLevel(p), nx = lv.next, st = gStickers();
  var w = gLevel(from).i === lv.i ? gPct(from) : 0;
  return '<span class="glvl-e" aria-hidden="true">' + emb(lv.l[2], 28) + '</span>' +
    '<span class="stack grow" style="gap:5px;min-width:0"><span class="lvl">' + esc(lv.l[1]) + '</span>' +
    '<span class="gbar" role="progressbar" aria-label="Party-Level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + gPct(p) + '"><b style="width:' + w + '%"></b></span>' +
    '<span class="ghint">' + (nx ? 'Noch ' + (nx[0] - p) + ' Punkte bis ' + esc(nx[1]) : 'Höchstes Level erreicht!') + '</span></span>' +
    '<span class="stack" style="align-items:flex-end;gap:3px"><span class="pts num"><span id="gptsn">' + from + '</span><small> P</small></span><span class="gstk" aria-label="' + st.length + ' Sticker">' + st.slice(-4).map(function (id) { var x = gSticker(id); return x ? '<span title="' + esc(x[2]) + '">' + emb(x[1], 16) + '</span>' : ''; }).join('') + (st.length > 4 ? '<small>+' + (st.length - 4) + '</small>' : '') + '</span></span>';
}
function gRaf(fn) { try { requestAnimationFrame(fn); } catch (e) { fn(); } }
function gCountUp(el, from, to, dur) {
  if (!el) return;
  var t0 = Date.now();
  var step = function () { var k = Math.min(1, (Date.now() - t0) / dur); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) gRaf(step); };
  gRaf(step);
}
/* Points, level-ups and stickers. While a field is being typed in nothing moves: the guest sees
   the result when the field is left. Every level and every sticker is celebrated once, never again
   after a correction. The celebration happens in the pass bar at the top, not over the whole screen. */
function gPassFx(left) {
  var el = document.getElementById('gpass'), p = gScore(), P = gPass();
  if (!el) return;
  if (!left && UI.gPts != null && gkTyping()) { if (!el.innerHTML) el.innerHTML = gPassInner(UI.gPts, UI.gPts); gHudFxResume(el); return; }
  var prev = UI.gPts == null ? p : UI.gPts;
  UI.gPts = p;
  if (p !== prev || !el.innerHTML) el.innerHTML = gPassInner(p, prev);
  var bar = el.querySelector('.gbar b'), target = gPct(p);
  gRaf(function () { gRaf(function () { if (bar) bar.style.width = target + '%'; }); });
  if (p !== prev) gCountUp(document.getElementById('gptsn'), prev, p, 700);
  var best = P.ptsMax == null ? prev : P.ptsMax, lvSeen = P.lvMax == null ? gLevel(prev).i : P.lvMax, lv = gLevel(p);
  var st = gStickers(), seen = P.stSeen || st.slice(), fresh = st.filter(function (x) { return seen.indexOf(x) < 0; });
  if (p > best) {
    el.classList.remove('gain'); void el.offsetWidth; el.classList.add('gain');
    el.insertAdjacentHTML('beforeend', '<span class="gplus" aria-hidden="true">+' + (p - Math.max(prev, best)) + '</span>');
    setTimeout(function () { var x = el.querySelector('.gplus'); if (x) x.remove(); }, 1300);
  }
  var up = lv.i > lvSeen;
  P.ptsMax = Math.max(best, p); P.lvMax = Math.max(lvSeen, lv.i); P.stSeen = seen.concat(fresh); gPassSave();
  if (up) {
    gSay('level', null, { L: lv.l[1] }); gStagePatch(); gVibe([30, 50, 30, 50, 60]); gkHoldBtn();
    gHudFx('lv', '<span class="ghfx-rays" aria-hidden="true"></span><span class="ghfx-e">' + emb(lv.l[2], 34) + '</span><span class="stack" style="gap:1px;min-width:0"><small>Level-Up!</small><b>' + esc(lv.l[1]) + '</b></span>', 2300);
  }
  if (fresh.length) {
    var s = gSticker(fresh[0]);
    if (s) setTimeout(function () { gVibe([16, 40, 16]); gHudFx('st', '<span class="ghfx-e">' + emb(s[1], 30) + '</span><span class="stack" style="gap:1px;min-width:0"><small>Sticker freigeschaltet</small><b>' + esc(s[2]) + '</b></span>', 2100); }, up ? 2350 : 0);
  }
  gHudFxResume(el);
}
/* a celebration inside the pass bar; it survives a re-render and carries on where it was */
/* the bar at the top: the guest's pass, or the master's level */
function gHudEl() { return document.getElementById(UI.guestMode === 'master' ? 'mpass' : 'gpass'); }
function gHudFx(kind, inner, ms) {
  UI.gHudFx = { kind: kind, inner: inner, t0: Date.now(), ms: ms };
  var el = gHudEl(); if (el) { var o = el.querySelector('.ghfx'); if (o) o.remove(); }
  gHudFxResume(el, true);
  clearTimeout(UI.gHudFxT);
  UI.gHudFxT = setTimeout(function () { UI.gHudFx = null; var h = gHudEl(); if (!h) return; var x = h.querySelector('.ghfx'); if (x) x.remove(); h.classList.remove('fxon', 'fx-lv', 'fx-st'); }, ms);
}
function gHudFxResume(el, fresh) {
  var f = UI.gHudFx; if (!el || !f) return;
  var age = Date.now() - f.t0; if (age >= f.ms || el.querySelector('.ghfx')) return;
  el.classList.add('fxon', 'fx-' + f.kind);
  el.insertAdjacentHTML('beforeend', '<span class="ghfx ' + f.kind + '" role="status" style="--dl:-' + (age / 1000).toFixed(2) + 's;--ms:' + (f.ms / 1000) + 's">' + f.inner + '</span>');
  if (fresh) { gBurst(el, f.kind === 'lv' ? '#FFC940' : '#B3A6FF', f.kind === 'lv' ? 26 : 14); if (f.kind === 'lv') gConfetti(16); }
}
function gConfetti(n) {
  var cols = ['#FF7A45', '#48D9A6', '#9886FF', '#FFC940', '#FFFFFF', '#FF8FC4'], fx = '';
  for (var k = 0; k < (n || 22); k++) fx += '<i style="left:' + (6 + Math.random() * 88).toFixed(0) + '%;background:' + cols[k % cols.length] + ';--dx:' + (Math.random() * 140 - 70).toFixed(0) + 'px;--rot:' + (Math.random() * 720 - 360).toFixed(0) + 'deg;animation-delay:' + (Math.random() * 0.3).toFixed(2) + 's"></i>';
  app.insertAdjacentHTML('beforeend', '<div class="fx gfx" aria-hidden="true">' + fx + '</div>');
  setTimeout(function () { var x = app.querySelector('.gfx'); if (x) x.remove(); }, 2000);
}

/* little particles out of an element, scaled for the phone frame on desktop */
function gScale() { var a = app.getBoundingClientRect(); return a.width && app.offsetWidth ? a.width / app.offsetWidth : 1; }
function gBurst(src, color, n) {
  if (!src || !src.getBoundingClientRect || !app.animate) return;
  var a = app.getBoundingClientRect(), r = src.getBoundingClientRect(), sc = gScale();
  var cx = (r.left + r.width / 2 - a.left) / sc, cy = (r.top + r.height / 2 - a.top) / sc;
  for (var k = 0; k < (n || 12); k++) {
    var d = document.createElement('i'), ang = Math.PI * 2 * k / (n || 12) + Math.random() * 0.4, dist = 34 + Math.random() * 30;
    d.className = 'gdot'; d.style.left = cx + 'px'; d.style.top = cy + 'px'; d.style.background = k % 3 ? color : '#FFFFFF';
    app.appendChild(d);
    var an = d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(calc(-50% + ' + (Math.cos(ang) * dist).toFixed(0) + 'px), calc(-50% + ' + (Math.sin(ang) * dist).toFixed(0) + 'px)) scale(.2)', opacity: 0 }], { duration: 600 + Math.random() * 250, easing: 'cubic-bezier(.2,.8,.3,1)' });
    an.onfinish = (function (x) { return function () { x.remove(); }; })(d);
  }
}
/* the emoji of a kind flies from its row down to the new card */
function gFly(t, i) {
  var src = app.querySelector('[data-act="gAdd"][data-v="' + t + '"] .gtile'), dst = document.getElementById('gi' + i), bodyEl = app.querySelector('.body');
  if (!src || !bodyEl || !src.getBoundingClientRect || !app.animate) return;
  var a = app.getBoundingClientRect(), r = src.getBoundingClientRect(), bb = bodyEl.getBoundingClientRect(), sc = gScale();
  var ty = ((dst ? Math.min(dst.getBoundingClientRect().top + 12, bb.bottom - 30) : bb.bottom - 30) - r.top) / sc;
  var tx = ((dst ? dst.getBoundingClientRect().left + 14 : r.left) - r.left) / sc;
  var el = document.createElement('span');
  el.className = 'gfly'; el.innerHTML = emb(GQ_STYLE[t].e, 32); el.style.left = ((r.left - a.left) / sc) + 'px'; el.style.top = ((r.top - a.top) / sc) + 'px';
  app.appendChild(el);
  var an = el.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1, filter: 'blur(0)' },
    { transform: 'translate(' + (tx * 0.4).toFixed(0) + 'px,' + (ty * 0.35 - 70).toFixed(0) + 'px) scale(1.7) rotate(-18deg)', opacity: 1, filter: 'blur(0)', offset: 0.42 },
    { transform: 'translate(' + tx.toFixed(0) + 'px,' + ty.toFixed(0) + 'px) scale(.45) rotate(20deg)', opacity: 0, filter: 'blur(6px)' }
  ], { duration: 820, easing: 'cubic-bezier(.3,.7,.35,1)' });
  an.onfinish = function () { el.remove(); };
}
/* a field was confirmed: check mark or shake */
function gFieldFx(input, ok) {
  var f = input.closest && (input.closest('.field') || input.closest('.glie') || input.parentNode);
  if (!f) return;
  f.classList.remove('gok', 'gno'); void f.offsetWidth; f.classList.add(ok ? 'gok' : 'gno');
  setTimeout(function () { f.classList.remove('gok', 'gno'); }, 900);
}
function gShakeEl(el) { if (!el) return; el.classList.remove('gshk'); void el.offsetWidth; el.classList.add('gshk'); setTimeout(function () { el.classList.remove('gshk'); }, 600); }
function gScrollTo(el, off) { var b = app.querySelector('.body'); if (!el || !b || !el.getBoundingClientRect) return; var top = b.scrollTop + (el.getBoundingClientRect().top - b.getBoundingClientRect().top) / gScale() - (off || 90); try { b.scrollTo({ top: top, behavior: 'smooth' }); } catch (e) { b.scrollTop = top; } }
function gWave() { var rows = app.querySelectorAll('.qrow'); for (var k = 0; k < rows.length; k++) { var r = rows[k]; r.style.animationDelay = (k * 60) + 'ms'; r.classList.remove('gwave'); void r.offsetWidth; r.classList.add('gwave'); } setTimeout(function () { for (var k = 0; k < rows.length; k++) rows[k].classList.remove('gwave'); }, 1400); }
/* is this one field filled well enough to count as confirmed? */
function gFieldOk(input, it) {
  var v = String(input.value || '').trim(), bind = input.getAttribute('data-bind') || '', f = bind.split('.').pop();
  if (!v) return false;
  if (f === 'year') return gYears(it) != null;
  if (f === 'byear') return gByearOk(it);
  if (f === 'bd') return +v >= 1 && +v <= 31;
  if (f === 'answer' || f === 'min' || f === 'max') return gNum(v.replace(',', '.'));
  if (bind.indexOf('.text') > 0 && it.type === 'wer') return v.length >= 8;
  return true;
}
/* Enter in a field: confirm it, then jump on */
function gEnter(el, e) {
  if (el.tagName === 'TEXTAREA' && e.shiftKey) return;
  e.preventDefault();
  if (el.id === 'qAuthor') {
    var nm = String(gForm().author || '').trim();
    if (nm.length < 2) { gFieldFx(el, false); gSay('hello'); gStagePatch(); return; }
    gFieldFx(el, true); UI.gGreeted = nm; gSay('name'); gStagePatch(); gPassFx(); el.blur(); gVibe(15);
    var first = app.querySelector('.qrow'); if (first) { gScrollTo(first, 120); setTimeout(gWave, 250); }
    return;
  }
  var card = el.closest && el.closest('.gcard'); if (!card) { el.blur(); return; }
  var i = +card.id.slice(2), it = gForm().items[i]; if (!it) return;
  gFieldFx(el, gFieldOk(el, it));
  var bind = el.getAttribute('data-bind') || '';
  if (/\.bd$/.test(bind) && !it.bm) { var mon = card.querySelector('.gmon'); if (mon) { mon.focus({ preventScroll: true }); var grid = card.querySelector('.gmonths'); gShakeEl(grid); } return; }
  var fields = Array.prototype.slice.call(card.querySelectorAll('input[data-bind], textarea[data-bind]'));
  var next = fields[fields.indexOf(el) + 1];
  if (next) { next.focus({ preventScroll: true }); gScrollTo(next, 150); return; }
  el.blur();
  if (gDone(it)) {
    card.classList.remove('just-done', 'gcheer'); void card.offsetWidth; card.classList.add('gcheer');
    gSay(gDoneEvt(it), it, gVars(it)); gStagePatch(); gVibe([20, 40, 20]);
    gBurst(card.querySelector('.ghead .e'), GQ_STYLE[it.type].c, 14);
    var items = gForm().items;
    for (var k = 0; k < items.length; k++) {
      if (!gDone(items[k])) { var c2 = document.getElementById('gi' + k), f2 = c2 && c2.querySelector('input[data-bind], textarea[data-bind]'); if (c2) { gScrollTo(c2, 110); if (f2) setTimeout(function () { f2.focus({ preventScroll: true }); }, 380); } return; }
    }
    var cta = document.getElementById('gcta'); if (cta) { cta.classList.remove('gpulse'); void cta.offsetWidth; cta.classList.add('gpulse'); }
  } else {
    gShakeEl(document.getElementById('gstat' + i)); gSay('missing'); gStagePatch();
  }
}
/* birthday: day field plus month buttons */
function gBdaySync(it) {
  var d = String(it.bd || '').replace(/\D/g, ''), m = it.bm ? String(it.bm) : '';
  it.bday = d || m ? (parseBday(d + '.' + m + '.') || (d + '.' + m)) : '';
}

/* ---------- live parts of a card ---------- */
function gPatch(id, html) {
  var el = document.getElementById(id); if (!el) return false;
  UI.gLast = UI.gLast || {};
  if (UI.gLast[id] === html) return false;
  UI.gLast[id] = html; el.innerHTML = html;
  return true;
}
function gKeep(id, html) { UI.gLast = UI.gLast || {}; UI.gLast[id] = html; return html; }
function gPreview(it) {
  var A = String(gForm().author || '').trim() || 'Du', W = gWho(it), t = String(it.text || '').trim(), lines = [];
  if (it.type === 'steckbrief') {
    if (String(it.year || '').trim()) lines.push('Seit welchem Jahr kennt ' + A + ' ' + W + '?');
    if (String(it.bday || '').trim()) lines.push('Wann hat ' + A + ' Geburtstag?');
    if (String(it.meet || '').trim()) lines.push('Wie haben sich ' + A + ' und ' + W + ' kennengelernt?');
    if (!lines.length) lines.push('Füll ein Feld aus, dann siehst du hier, welche Fragen daraus werden.');
  } else if (it.type === 'luege') lines.push(A + ' erzählt drei Dinge über sich. Was davon ist gelogen?');
  else if (it.type === 'wer') lines.push('Wer hat das über ' + W + ' geschrieben?' + (t ? ' „' + t + '“' : ''));
  else if (it.type === 'tipp') lines.push('Am Ende des Abends: Wer lag mit seinem Tipp am nächsten dran?');
  else if (it.type === 'worte') { var iw = String(it.interest || '').trim(); lines.push(iw ? 'Daraus werden eigene Fragen und Sprüche für ' + W + ', zum Beispiel rund um ' + iw + '.' : 'Aus allen Worten der Gäste werden Fragen und Sprüche, die es nur bei ' + W + ' gibt.'); }
  else if (it.type === 'aufgabe') lines.push(t ? 'Aufgabe für ' + W + ': ' + t : 'Hier erscheint deine Aufgabe für ' + W + '.');
  else lines.push(t || 'Hier erscheint deine Frage, so wie sie im Spiel aussieht.');
  var extra = '';
  if (it.type === 'auswahl') { var o = it.options.filter(function (x) { return String(x || '').trim(); }); if (o.length) extra = '<span class="gprev-o">' + o.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</span>'; }
  return '<span class="gprev-l">So kommt’s im Spiel</span>' + lines.map(function (l) { return '<span class="gprev-q">' + esc(l) + '</span>'; }).join('') + extra;
}
function gStat(it) {
  if (gDone(it)) { var p = gItemPts(it); return '<span class="gst ok">' + icon('i-check', 14) + 'Bereit · +' + p + ' Punkte' + (p > 10 ? ' (Seltenheits-Bonus)' : '') + '</span>'; }
  return '<span class="gst">Fehlt noch: ' + esc(gMissing(it).join(', ')) + '</span>';
}
function gLiveW(it) {
  if (it.type === 'steckbrief') {
    var pills = [], n = gYears(it), b = parseBday(it.bday);
    if (n != null) pills.push([emb('cheers', 20), n === 0 ? 'Frisch dabei, seit diesem Jahr' : '<b class="gcnt" data-to="' + n + '">' + n + '</b>' + (n === 1 ? ' Jahr' : ' Jahre') + ' Freundschaft' + (n >= 10 ? ', alter Hase!' : ''), 'pop']);
    if (b) { var z = zodiac(b); pills.push(['<b class="zod">' + z[1] + '\uFE0E</b>', esc(fmtBday(b) + ' · ' + z[0]), 'flip']); }
    if (String(it.meet || '').trim().length >= 4) pills.push([emb('book', 20), 'Kennenlern-Geschichte drin', 'slide']);
    return pills.map(function (p) { return '<span class="gpill ' + p[2] + '"><span class="e" aria-hidden="true">' + p[0] + '</span>' + p[1] + '</span>'; }).join('');
  }
  if (it.type === 'tipp') {
    var m = Number(it.answer), ok = gNum(it.answer) && m >= 5 && m <= 600, frac = ok ? Math.min(m, 120) / 120 : 0, C = 2 * Math.PI * 40;
    return '<div class="gdial"><svg viewBox="0 0 100 100" width="132" height="132" aria-hidden="true"><circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-2)" stroke-width="10"/>' +
      '<circle class="arc" cx="50" cy="50" r="40" fill="none" stroke="#FFC940" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - frac)).toFixed(1) + '" transform="rotate(-90 50 50)"/>' +
      '<line class="hand" x1="50" y1="50" x2="50" y2="18" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" style="transform:rotate(' + (frac * 360).toFixed(0) + 'deg)"/><circle cx="50" cy="50" r="5" fill="#FFFFFF"/></svg>' +
      '<span class="stack" style="gap:2px"><b class="gdial-t">' + (ok ? esc(fmtDur(m)) : 'Wie lange?') + '</b><span class="sub">' + (ok ? (m > 120 ? 'Über zwei Stunden, mutig!' : m <= 30 ? 'Sportlich!' : 'Klingt realistisch') : 'Die Uhr zeigt deinen Tipp') + '</span></span></div>';
  }
  if (it.type === 'schaetzen') {
    var a = gNum(it.answer), str = a ? fmtNum(it.answer) : '?', prev = it._num || '';
    var digits = str.split('').map(function (ch, k) { return '<span class="gd' + (ch !== prev[k] ? ' roll' : '') + '">' + esc(ch) + '</span>'; }).join('');
    it._num = str;
    return '<div class="gnum' + (a ? ' on' : '') + '"><b>' + digits + '</b>' + (String(it.unit || '').trim() ? '<span>' + esc(it.unit) + '</span>' : '') + '</div><span class="sub">' + (a ? 'Die Lösung kennst nur du. Pssst!' : 'Hier erscheint deine geheime Lösung') + '</span>';
  }
  if (it.type === 'bereich') {
    var mn = Number(it.min), mx = Number(it.max), an = Number(it.answer), valid = gNum(it.min) && gNum(it.max) && mn < mx, inR = valid && gNum(it.answer) && an >= mn && an <= mx;
    var pc = inR ? (an - mn) / (mx - mn) * 100 : 50;
    return '<div class="gscale"><span class="sub">' + (valid ? esc(fmtNum(mn)) : 'von') + '</span><div class="gs-track"><i class="' + (inR ? 'on' : '') + '" style="left:' + pc.toFixed(1) + '%"></i></div><span class="sub">' + (valid ? esc(fmtNum(mx)) : 'bis') + '</span></div><span class="sub">' + (inR ? 'Lösung ' + esc(fmtNum(an)) + (String(it.unit || '').trim() ? ' ' + esc(it.unit) : '') + ', so sieht der Regler im Spiel aus' : 'Stell Bereich und Lösung ein') + '</span>';
  }
  if (it.type === 'worte') {
    var tw = String(it.trait || '').trim(), iw2 = String(it.interest || '').trim();
    return tw || iw2 ? '<div class="gwords">' + (tw ? '<span class="gwd tr">' + esc(tw) + '</span>' : '') + (iw2 ? '<span class="gwd in">' + esc(iw2) + '</span>' : '') + '</div>' : '';
  }
  if (it.type === 'wer') {
    var len = String(it.text || '').trim().length;
    return len >= 8 ? '<span class="gseal"><span class="e" aria-hidden="true">' + emb('lock', 24) + '</span>Versiegelt: Dein Name bleibt bis zur Auflösung geheim</span>' : '<span class="gpill"><span class="e" aria-hidden="true">' + emb('pen', 18) + '</span>' + (len ? 'Noch ' + (8 - len) + ' Zeichen, dann wird versiegelt' : 'Schreib los, niemand sieht, dass es von dir ist') + '</span>';
  }
  return '';
}
/* smooth updates for the dial and the scale instead of rebuilding them */
function gLiveSmooth(i, it) {
  var box = document.getElementById('glive' + i); if (!box) return false;
  if (it.type === 'tipp' && box.querySelector('.gdial')) {
    var m = Number(it.answer), ok = gNum(it.answer) && m >= 5 && m <= 600, frac = ok ? Math.min(m, 120) / 120 : 0, C = 2 * Math.PI * 40;
    box.querySelector('.arc').setAttribute('stroke-dashoffset', (C * (1 - frac)).toFixed(1));
    box.querySelector('.hand').style.transform = 'rotate(' + (frac * 360).toFixed(0) + 'deg)';
    var tmp = document.createElement('div'); tmp.innerHTML = gLiveW(it);
    box.querySelector('.gdial-t').textContent = tmp.querySelector('.gdial-t').textContent;
    box.querySelector('.gdial .sub').textContent = tmp.querySelector('.gdial .sub').textContent;
    return true;
  }
  if (it.type === 'bereich' && box.querySelector('.gs-track i')) {
    var tmp2 = document.createElement('div'); tmp2.innerHTML = gLiveW(it);
    var ni = tmp2.querySelector('.gs-track i'), oi = box.querySelector('.gs-track i');
    oi.style.left = ni.style.left; oi.className = ni.className;
    var subs = box.querySelectorAll(':scope > .sub, .gscale > .sub'), nsubs = tmp2.querySelectorAll(':scope > .sub, .gscale > .sub');
    for (var k = 0; k < subs.length && k < nsubs.length; k++) subs[k].textContent = nsubs[k].textContent;
    return true;
  }
  return false;
}
function gStampHtml(it) { return '<span class="gstamp">' + esc(GQ_STYLE[it.type].stamp) + '</span>'; }
function gDoneEvt(it) { if (it.type === 'steckbrief') return gYears(it) != null ? 'done_steckbrief_y' : 'done_steckbrief'; return 'done_' + gFam(it.type); }
/* called on every keystroke in a card: patch only what changed */
function gLive(i) {
  var it = gForm().items[i]; if (!it) return;
  if (!gLiveSmooth(i, it) && gPatch('glive' + i, gLiveW(it))) {
    var cnt = document.querySelector('#glive' + i + ' .gcnt'); if (cnt) gCountUp(cnt, 0, +cnt.getAttribute('data-to'), 650);
  }
  gPatch('gprev' + i, gPreview(it)); gPatch('gstat' + i, gStat(it));
  var done = gDone(it), card = document.getElementById('gi' + i);
  if (card) { card.classList.toggle('is-done', done); card.classList.remove('has-err'); }
  gPatch('gsb' + i, done ? gStampHtml(it) : '');
  if (done && !it._done) {
    if (card) { card.classList.remove('just-done'); void card.offsetWidth; card.classList.add('just-done'); }
    gSay(gDoneEvt(it), it, gVars(it)); gStagePatch(); gVibe([20, 40, 20]);
    if (card) gBurst(card.querySelector('.ghead .e'), GQ_STYLE[it.type].c, 12);
  }
  it._done = done; it.err = done ? '' : it.err;
  gPassFx(); gCtaPatch();
}
function gCtaLabel() {
  if (UI.guestMode === 'master') return mCtaLabel();
  var G = gForm(), c = (G.cards || []).length, n = G.items.length + c, d = G.items.filter(gDone).length + c;
  if (!n) return 'Abschicken';
  if (d === n) return (n === 1 ? '1 Beitrag' : n + ' Beiträge') + ' abschicken';
  return (n === 1 ? '1 Beitrag' : n + ' Beiträge') + ' · ' + d + ' von ' + n + ' bereit';
}
function gAllReady() { var G = gForm(); return G.items.length + (G.cards || []).length > 0 && G.items.every(gDone); }
function gCtaPatch() { var b = document.getElementById('gcta'); if (b) { var all = gAllReady(); b.textContent = gCtaLabel(); b.classList.toggle('mint', all); b.classList.toggle('gready', all); } if (UI.guestMode === 'master') mHudPatch(); else gkBtnPatch(); }
/* after a full render: clear one-shot effects, run the pass animation */
function gAfter() {
  var fly = UI.gFlyT, spark = UI.gSpark, just = UI.gJust;
  UI.gPop = false; UI.gBump = ''; UI.gNew = ''; UI.gJust = ''; UI.gLie = ''; UI.gSpark = ''; UI.gShake = false; UI.gFlyT = null; UI.gkJust = ''; UI.gIn = false;
  if (UI.screen === 'guestForm' && UI.guestMode !== 'master') gPassFx();
  if (UI.screen === 'guestForm' && UI.guestMode === 'master') gHudFxResume(gHudEl());
  if (fly) gFly(fly.t, fly.i);
  if (spark) { var on = app.querySelector('.gabc.spark'); if (on) gBurst(on, on.closest('.gcard') ? getComputedStyle(on.closest('.gcard')).getPropertyValue('--tc') || '#FFC940' : '#FFC940', 12); }
  if (just) { var jc = app.querySelector('.gcard.just-done'); if (jc) gBurst(jc.querySelector('.ghead .e'), getComputedStyle(jc).getPropertyValue('--tc') || '#FFC940', 12); }
  var cnt = app.querySelectorAll('.gcard.just-added .gcnt'); for (var k = 0; k < cnt.length; k++) gCountUp(cnt[k], 0, +cnt[k].getAttribute('data-to'), 650);
  if (UI.gFinFx) { UI.gFinFx = false; gConfetti(46); }
  if (UI.screen === 'guestForm' && UI.guestMode !== 'master') gkBtnPatch();
}
function gRender() { render(); gAfter(); }

/* ---------- the cards ---------- */
function gForBlock(it, i) {
  var who = E() ? E().focus : [];
  if (it.type === 'tipp' || who.length < 2) return '';
  return '<span class="eyebrow mt14 block">Über wen?</span><div class="chips mt10" role="group" aria-label="Über wen">' +
    (it.type === 'worte' ? '' : '<button type="button" class="chip-btn sm' + (!it.forId ? ' is-sel' : '') + '" data-act="gFor" data-k="' + i + '" data-v="" aria-pressed="' + !it.forId + '">Alle</button>') +
    who.map(function (p) { var s = it.forId === p.id; return '<button type="button" class="chip-btn sm' + (s ? ' is-sel' : '') + '" data-act="gFor" data-k="' + i + '" data-v="' + p.id + '" aria-pressed="' + s + '">' + face(p, 22) + esc(p.name) + '</button>'; }).join('') + '</div>';
}
/* numbers are text fields with a number keyboard: comma and point both work */
function gField(label, id, bind, val, ph, kind, extra) {
  var mode = kind === 'num' ? ' inputmode="decimal"' : kind === 'int' || kind === 'big' ? ' inputmode="numeric"' : '';
  var inp = kind === 'area' ? '<textarea id="' + id + '" class="input area' + (extra || '') + '" data-bind="' + bind + '" enterkeyhint="next" placeholder="' + esc(ph) + '">' + esc(val) + '</textarea>'
    : '<input id="' + id + '" class="input' + (kind === 'big' ? ' big' : '') + '" type="text"' + mode + (kind === 'int' ? ' maxlength="4"' : '') + ' autocomplete="off" enterkeyhint="next" data-bind="' + bind + '" value="' + esc(val) + '" placeholder="' + esc(ph) + '">';
  return '<label class="field mt10" for="' + id + '">' + label + inp + '</label>';
}
function gBdayField(it, i) {
  var s = '_' + i;
  return '<div class="field mt10"><span>Dein Geburtstag</span><div class="gbday"><label class="gday" for="qBd' + s + '"><span class="sr">Tag</span><input id="qBd' + s + '" class="input" type="text" inputmode="numeric" maxlength="2" autocomplete="off" enterkeyhint="next" data-bind="g.' + i + '.bd" value="' + esc(it.bd || '') + '" placeholder="Tag"></label>' +
    '<div class="gmonths" role="group" aria-label="Monat">' + MONTHS.map(function (m, k) { var sel = String(it.bm || '') === String(k + 1); return '<button type="button" class="gmon' + (sel ? ' on' : '') + '" data-act="gMonth" data-k="' + i + '" data-v="' + (k + 1) + '" aria-pressed="' + sel + '" aria-label="' + m + '">' + m.slice(0, 3) + '</button>'; }).join('') + '</div></div></div>';
}
function gFields(it, i) {
  var b = 'g.' + i + '.', s = '_' + i, W = gWho(it), A = String(gForm().author || '').trim() || 'du', o = '';
  if (it.type === 'worte') {
    o += gField('Ein Wort, das ' + esc(W) + ' beschreibt', 'qTrait' + s, b + 'trait', it.trait, 'z. B. herzlich, chaotisch, Ruhepol', 'text') +
      gField('Wofür brennt ' + esc(W) + '?', 'qInt' + s, b + 'interest', it.interest, 'z. B. Hamburger SV, Kochen, Harry Potter', 'text') +
      '<p class="small mt8">Kurz und lieb gemeint. ' + (AI_HOST ? 'Aus den Worten aller Gäste baut die KI am Ende eigene Fragen.' : 'Aus den Worten aller Gäste werden am Ende Sätze und Sprüche für die Spiele.') + '</p>';
  } else if (it.type === 'steckbrief') {
    o += gField('Seit welchem Jahr kennst du ' + esc(W) + '?', 'qYear' + s, b + 'year', it.year, 'z. B. 2014', 'int') +
      gBdayField(it, i) +
      gField('Dein Jahrgang (freiwillig)', 'qByear' + s, b + 'byear', it.byear || '', 'z. B. 1994', 'int') +
      gField('Wie habt ihr euch kennengelernt?', 'qMeet' + s, b + 'meet', it.meet, 'z. B. Im ersten Semester in der Statistik-Vorlesung', 'area') +
      '<p class="small mt8">Mindestens eins davon. Jedes Feld wird zu einer eigenen Frage über dich. Der Jahrgang bleibt geheim, er entscheidet nur bei Gleichstand.</p>';
  } else if (it.type === 'luege') {
    o += '<p class="small mt10">Drei Sätze über dich. Tipp bei der Lüge auf „Lüge?“.</p><div class="stack gap8 mt10">' + [0, 1, 2].map(function (j) {
      var sel = it.correct === j, any = it.correct >= 0 && it.correct <= 2;
      return '<div class="glie' + (sel ? ' is-lie' : any ? ' is-true' : '') + (sel && UI.gLie === it.key ? ' shake' : '') + '"><label class="grow" for="qOpt' + s + '_' + j + '"><span class="sr">Satz ' + (j + 1) + '</span><input id="qOpt' + s + '_' + j + '" class="input" type="text" enterkeyhint="next" autocomplete="off" data-bind="' + b + 'opt.' + j + '" value="' + esc(it.options[j]) + '" placeholder="' + esc(['z. B. Ich war schon mal in Australien', 'z. B. Ich kann jonglieren', 'z. B. Ich habe einen Hamster'][j]) + '"></label>' +
        '<button type="button" class="glie-btn" data-act="gCorrect" data-k="' + i + '" data-i="' + j + '" aria-pressed="' + sel + '" aria-label="Satz ' + (j + 1) + ' ist gelogen">' + (sel ? 'Lüge!' : any ? 'wahr' : 'Lüge?') + '</button></div>';
    }).join('') + '</div>';
  } else if (it.type === 'wer') {
    o += '<label class="field mt10 gveilbox" for="qText' + s + '">Deine Erinnerung an ' + esc(W) + '<textarea id="qText' + s + '" class="input area gletter" data-bind="' + b + 'text" enterkeyhint="done" placeholder="z. B. Wir sind beim Abiball zusammen in den Pool gefallen.">' + esc(it.text) + '</textarea><span class="gveil" aria-hidden="true">' + emb('lock', 20) + 'Versiegelt, antippen zum Lesen</span></label>';
  } else if (it.type === 'tipp') {
    o += gField('Wie viele Minuten dauert ' + esc(runNameText()) + '?', 'qTipp' + s, b + 'answer', it.answer, 'Minuten', 'big');
  } else if (it.type === 'aufgabe') {
    o += gField('Was muss ' + esc(W) + ' tun?', 'qText' + s, b + 'text', it.text, 'z. B. Den Trinkspruch vom Abiball aufsagen', 'area') +
      gField('So wird gewertet', 'qNote' + s, b + 'note', it.note, 'z. B. Geschafft, wenn zwei Gäste es bestätigen', 'area');
  } else {
    o += gField('Deine Frage', 'qText' + s, b + 'text', it.text, 'Was willst du über ' + W + ' wissen?', 'area');
    if (it.type === 'schaetzen') o += '<div class="grid2">' + gField('Lösung', 'qAns' + s, b + 'answer', it.answer, 'z. B. 31', 'num') + gField('Einheit', 'qUnit' + s, b + 'unit', it.unit, 'z. B. Paar', 'text') + '</div>';
    if (it.type === 'bereich') o += '<div class="grid3">' + gField('Von', 'qMin' + s, b + 'min', it.min, '0', 'num') + gField('Bis', 'qMax' + s, b + 'max', it.max, '100', 'num') + gField('Lösung', 'qAnsB' + s, b + 'answer', it.answer, '', 'num') + '</div>' + gField('Einheit', 'qUnitB' + s, b + 'unit', it.unit, 'optional', 'text');
    if (it.type === 'auswahl') o += '<p class="small mt10">Bis zu vier Antworten. Tipp den Buchstaben der richtigen an.</p><div class="stack gap8 mt10">' + [0, 1, 2, 3].map(function (j) {
      var sel = it.correct === j;
      return '<div class="row gap8"><button type="button" class="gabc' + (sel ? ' on' : '') + (sel && UI.gSpark === it.key ? ' spark' : '') + '" data-act="gCorrect" data-k="' + i + '" data-i="' + j + '" aria-pressed="' + sel + '" aria-label="Antwort ' + 'ABCD'[j] + ' ist richtig">' + (sel ? icon('i-check', 16) : 'ABCD'[j]) + '</button><label class="grow" for="qOpt' + s + '_' + j + '"><span class="sr">Antwort ' + 'ABCD'[j] + '</span><input id="qOpt' + s + '_' + j + '" class="input" type="text" enterkeyhint="next" autocomplete="off" data-bind="' + b + 'opt.' + j + '" value="' + esc(it.options[j]) + '" placeholder="Antwort ' + 'ABCD'[j] + (j > 1 ? ' (optional)' : '') + '"></label></div>';
    }).join('') + '</div>';
  }
  return o;
}
function gCard(it, i, title) {
  var st = GQ_STYLE[it.type], done = gDone(it);
  var cls = 'gcard' + (done ? ' is-done' : '') + (UI.gNew === it.key ? ' just-added' : '') + (UI.gJust === it.key ? ' just-done' : '') + (it.err ? ' has-err' : '') + (it.err && UI.gShake ? ' shake' : '') + ' t-' + it.type;
  it._done = done;
  return '<div class="' + cls + '" id="gi' + i + '" style="--tc:' + st.c + '">' +
    '<div class="ghead"><span class="e" aria-hidden="true">' + emb(st.e, 24) + '</span><b class="grow">' + esc(title) + '</b><span id="gsb' + i + '">' + gKeep('gsb' + i, done ? gStampHtml(it) : '') + '</span><button type="button" class="gdel" data-act="gDel" data-k="' + i + '" aria-label="' + esc(title) + ' entfernen">' + icon('i-trash', 16) + '</button></div>' +
    '<div class="gbody">' + gForBlock(it, i) + gFields(it, i) +
    '<div class="glive" id="glive' + i + '">' + gKeep('glive' + i, gLiveW(it)) + '</div>' +
    '<div class="gprev" id="gprev' + i + '">' + gKeep('gprev' + i, gPreview(it)) + '</div>' +
    '<div class="mt10" id="gstat' + i + '">' + gKeep('gstat' + i, gStat(it)) + '</div>' +
    (it.err && !gMissing(it).length ? '<p class="err mt8">' + esc(it.err) + '</p>' : '') + '</div></div>';
}

/* ---------- the page ---------- */
function gCrowd() {
  var names = {}; guestSubmissions().forEach(function (q) { names[String(q.author).toLowerCase()] = q.author; });
  var list = Object.keys(names).map(function (k) { return names[k]; });
  if (!list.length) return '<p class="small mt10" style="text-align:center">Du bist der erste Gast. Du machst den Anfang!</p>';
  var cols = ['#48D9A6', '#9886FF', '#FFC940', '#FF7A45', '#FF8FC4', '#7FA8FF'];
  var bubbles = list.slice(0, 5).map(function (n, i) { return '<span class="ini" style="width:30px;height:30px;font-size:11px;background:' + cols[i % cols.length] + ';border:2px solid var(--ink);margin-left:' + (i ? -8 : 0) + 'px">' + esc(initials(n)) + '</span>'; }).join('') + (list.length > 5 ? '<span class="ini" style="width:30px;height:30px;font-size:11px;background:var(--surface-2);color:var(--white);border:2px solid var(--ink);margin-left:-8px">+' + (list.length - 5) + '</span>' : '');
  return '<div class="row mt10" style="justify-content:center;gap:10px"><span class="row" style="gap:0">' + bubbles + '</span><span class="small" style="color:var(--text);font-weight:700">' + (list.length === 1 ? '1 Gast ist' : list.length + ' Gäste sind') + ' schon dabei</span></div>';
}
function guestMultiForm() {
  var G = gForm(), e = E(), pass = gPass();
  if (!G.author && pass.name) G.author = pass.name;
  var p0 = gScore(), head = gHead(p0, UI.gPts == null ? p0 : UI.gPts);
  if (UI.qSent) return gFinale(head);
  if (gWelcomeNeeded()) return gWelcomeView();
  var cnt = typeCounts(), rare = gRareSet().filter(demoTypeOk), hint = ggHint();
  if (hint && demoOn() && ['luege', 'wer'].indexOf(hint.fam) < 0) hint = null;
  var nudge = '';
  if (rare.length) nudge = 'Psst: ' + joinNames(rare.map(qTypeLabel)) + ' gibt es noch selten. Dafür gibt’s doppelte Punkte. Musst du aber nicht.';
  var row = function (t) {
    var n = gCount(t[0]), mx = gMax(t[0]), c = cnt[t[0]], isRare = rare.indexOf(t[0]) >= 0, vb = GQ_VERB[t[0]], st = GQ_STYLE[t[0]];
    var meta = '<span class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap"><span class="sub" style="font-weight:800;color:' + (c ? 'var(--text)' : 'var(--muted)') + '">' + (c ? 'Schon ' + c + '× eingereicht' : 'Noch nichts eingereicht') + '</span>' + (isRare ? '<span class="tag" style="min-height:20px;padding:0 8px;font-size:11px;background:var(--sun);color:var(--ink)">Noch selten · 2× Punkte</span>' : '') + '</span>';
    var top = n ? '<span class="sub" style="font-weight:800;color:var(--text)">' + vb[0] + '</span><span class="row" style="gap:6px;align-items:baseline;flex-wrap:wrap"><b class="qty">' + n + '×</b><span style="font-size:16px;font-weight:800;color:var(--white)">' + vb[1] + '</span></span>' : '<span style="font-size:15px;font-weight:800">' + t[1] + '</span>';
    var main = '<button type="button" class="opt row qrow-main' + (n ? ' is-sel' : '') + '" data-act="gAdd" data-v="' + t[0] + '" aria-label="' + esc(t[1]) + (n ? ', ' + n + ' ausgewählt' + (n < mx ? ', antippen für noch eins' : '') : ', antippen zum Hinzufügen') + '" style="--tc:' + st.c + '"><span class="gtile" aria-hidden="true">' + emb(st.e, 30) + '</span><span class="stack grow" style="min-width:0">' + top + '<span class="sub qdesc">' + t[2] + '</span>' + meta + '</span><span class="qplus' + (n >= mx ? ' off' : '') + '" aria-hidden="true">' + icon('i-plus', 18) + '</span></button>';
    var minus = n ? '<button type="button" class="qminus" data-act="gSub" data-v="' + t[0] + '" aria-label="Eins weniger: ' + esc(t[1]) + '">' + icon('i-minus', 22) + '</button>' : '';
    return '<div class="qrow' + (UI.gBump === t[0] ? ' bump' : '') + '">' + main + minus + '</div>';
  };
  var group = function (key, label) { var list = QTYPES.filter(function (t) { return t[3] === key && demoTypeOk(t[0]); }); if (!list.length) return ''; return '<span class="sub block mt14" style="font-weight:800;color:var(--text)">' + label + '</span><div class="stack gap8 mt8">' + list.map(row).join('') + '</div>'; };
  var order = QTYPES.map(function (t) { return t[0]; }), numBy = {};
  var list = G.items.map(function (it, i) { return { it: it, i: i }; }).sort(function (a, b) { return order.indexOf(a.it.type) - order.indexOf(b.it.type) || a.i - b.i; });
  var cards = list.map(function (x) {
    numBy[x.it.type] = (numBy[x.it.type] || 0) + 1;
    return gCard(x.it, x.i, qTypeLabel(x.it.type) + (gCount(x.it.type) > 1 ? ' ' + numBy[x.it.type] : ''));
  }).join('');
  var n = G.items.length, p = gScore(), from = UI.gPts == null ? p : UI.gPts;
  var allDone = gAllReady();
  var body = '<div class="gbrand">' + guestHeader('Mitmachen') + '</div><div class="gstage" id="gstage">' + gStage() + '</div>' +
    (e ? '<h1 class="h1 mt14" style="text-align:center">Mach mit beim Abend von ' + esc(focusNames()) + '</h1>' : '<h1 class="h1 mt14" style="text-align:center">Mach mit</h1>') +
    '<p class="lead mt8" style="text-align:center">Aus deinem Beitrag wird heute Abend ein Spiel. Wann er drankommt, bleibt eine Überraschung.</p>' + gCrowd() +
    '<label class="field mt18" for="qAuthor">Wie heißt du?<input id="qAuthor" class="input big gname" type="text" autocomplete="given-name" enterkeyhint="done" data-bind="g.author" value="' + esc(G.author) + '" placeholder="Vor- oder Spitzname"></label>' +
    (nudge || hint ? '<div class="gnudge mt14">' + (nudge ? '<p>' + esc(nudge) + '</p>' : '') + (hint ? '<p class="hl">' + esc(ggNeedText(hint.fam, hint.miss)) + ', dann baut die App daraus eine eigene Runde.</p>' : '') + '</div>' : '') +
    '<span class="eyebrow mt22 block">Was möchtest du beitragen?</span><p class="small mt6">Alles freiwillig. Tipp an, worauf du Lust hast, gern auch mehrmals.</p>' +
    group('kurz', 'Ganz schnell, in zehn Sekunden') + group('ich', 'Über dich') + group('frage', 'Eine Frage stellen') +
    (demoOn() && demoHiddenTypes('') ? demoLockRow('Noch ' + demoHiddenTypes('') + ' weitere Beitragsarten gibt es mit dem Game Pass', 'demoInfo') : '') +
    '<span class="eyebrow mt22 block">Deine Beiträge' + (n ? ' · ' + n : '') + '</span>' +
    (cards || '<div class="empty mt10">Noch nichts ausgewählt. Tipp oben eine Art an, dann erscheint hier deine Karte dazu.</div>') +
    gkMiniHtml() +
    (UI.qErr ? '<p class="err mt14">' + UI.qErr + '</p>' : '');
  return scr(head, body, '<button type="button" class="cta' + (allDone ? ' mint gready' : '') + '" id="gcta" data-act="gSubmit">' + esc(gCtaLabel()) + '</button>' + gkBtnHtml(), 'gscr' + (UI.guestMode === 'test' ? ' gtest' : '') + (UI.gIn ? ' gin' : '')) + gkOverlay();
}
/* the party pass sits fixed at the top edge of the screen */
function gHead(p, from) {
  var banner = UI.guestMode === 'test' ? '<div class="testbanner" style="margin-bottom:10px">' + icon('i-user', 18) + '<span class="grow">Testansicht: So sieht der Link für Gäste aus.</span><button type="button" class="tag plain" data-act="go" data-to="' + UI.guestFrom + '" style="height:30px;color:var(--sun)">Zurück</button></div>' : '';
  return banner + '<div class="ghud" id="gpass">' + gPassInner(p, from) + '</div>';
}
function gFinale(head) {
  var f = UI.gFinal || { pts: gScore(), n: 1, no: 1, stickers: gStickers() }, lv = gLevel(f.pts);
  var stk = f.stickers.map(function (id, k) { var s = gSticker(id); return s ? '<span class="gt-s" style="animation-delay:' + (0.5 + k * 0.12).toFixed(2) + 's" title="' + esc(s[2]) + '"><span aria-hidden="true">' + emb(s[1], 22) + '</span><small>' + esc(s[2]) + '</small></span>' : ''; }).join('');
  var kinds = f.types ? Object.keys(f.types).map(function (t) { return '<span class="gt-k"><span aria-hidden="true">' + emb(GQ_STYLE[t].e, 18) + '</span>' + f.types[t] + '× ' + esc(qTypeLabel(t)) + '</span>'; }).join('') : '';
  var body = '<div class="gbrand">' + guestHeader('Mitmachen') + '</div><div class="gstage" id="gstage">' + gStage(true) + '</div>' +
    '<div class="gtk-wrap mt18"><div class="gticket" data-act="gFlip" role="button" aria-label="Ticket umdrehen">' +
    '<div class="gt-face gt-front"><div class="gt-holo" aria-hidden="true"></div><div class="gt-top"><span>Party-Pass</span><span>' + esc(E() ? E().name || ('Abend von ' + focusNames()) : 'Party') + '</span></div>' +
    '<div class="gt-main"><span class="gt-lbl">Gast Nr. ' + f.no + '</span><b class="gt-name">' + esc(UI.qSent) + '</b><span class="gt-lvl">' + emb(lv.l[2], 20) + ' ' + esc(lv.l[1]) + ' · ' + f.pts + ' Punkte</span></div>' +
    (stk ? '<div class="gt-stk">' + stk + '</div>' : '') +
    '<div class="gt-perf" aria-hidden="true"></div>' +
    '<div class="gt-foot"><b>' + (f.n === 1 ? 'Dein Beitrag ist' : 'Deine ' + f.n + ' Beiträge sind') + ' angekommen.</b> Der Spielleiter gibt sie frei. Ob und wann sie drankommen, vielleicht sogar in einem Gästespiel, siehst du heute Abend.<span class="gt-turn">Antippen zum Umdrehen</span></div></div>' +
    '<div class="gt-face gt-back"><div class="gt-top"><span>Rückseite</span><span>' + esc(UI.qSent) + '</span></div><div class="gt-main"><span class="gt-lbl">Das hast du eingereicht</span><div class="gt-kinds">' + kinds + '</div><span class="gt-lvl mt14">Heute Abend gilt: Augen auf! Vielleicht erkennst du deinen Beitrag wieder.</span></div><div class="gt-foot">Antippen zum Zurückdrehen</div></div>' +
    '</div></div>';
  var more = '<button type="button" class="btn-ghost gfin-more" data-act="qAnother">' + icon('i-plus', 16) + 'Noch etwas beitragen</button>';
  var foot = UI.guestMode === 'test' ? '<div class="cta-row"><button type="button" class="btn-dark gfin-done" data-act="go" data-to="' + UI.guestFrom + '">Fertig</button>' + more + '</div>' : more;
  return scr(head, body, foot, 'gscr gfin' + (UI.guestMode === 'test' ? ' gtest' : ''));
}

