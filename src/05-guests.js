
/* =========================================================
   What guests can contribute through the link, and how the app
   turns it into questions about this very group of guests
   ========================================================= */
var MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
function parseBday(s) {
  var m = /^\s*(\d{1,2})\s*[.,\/\- ]\s*(\d{1,2})\s*[.,\/\-]?\s*$/.exec(String(s || ''));
  if (!m) return '';
  var d = +m[1], mo = +m[2];
  if (d < 1 || d > 31 || mo < 1 || mo > 12) return '';
  return ('0' + d).slice(-2) + '.' + ('0' + mo).slice(-2) + '.';
}
function fmtBday(s) { var p = parseBday(s); if (!p) return ''; return (+p.slice(0, 2)) + '. ' + MONTHS[+p.slice(3, 5) - 1]; }
function isGuestAuthor(n) { return !!n && n !== 'Spielleiter' && n !== AI_AUTHOR; }
/* guests who took part: everyone whose contribution was approved, plus names from the counter */
function knownGuests() {
  var seen = {}, out = [], foc = E() ? E().focus.map(function (p) { return p.name.toLowerCase(); }) : [];
  var add = function (n) { n = String(n || '').trim(); var k = n.toLowerCase(); if (!n || seen[k] || foc.indexOf(k) >= 0) return; seen[k] = 1; out.push(n); };
  S.questions.forEach(function (q) { if (q.status === 'ok' && isGuestAuthor(q.author)) add(q.author); });
  S.people.forEach(function (p) { add(p.name); });
  return out;
}
function nextGuestName(not) {
  var g = knownGuests().filter(function (n) { return !not || n.toLowerCase() !== String(not).toLowerCase(); });
  if (!g.length) return '';
  S.guestTurn = (S.guestTurn || 0) + 1;
  return g[S.guestTurn % g.length];
}
function steckSubs(q) { var s = []; if (q.year) s.push('jahr'); if (q.bday) s.push('bday'); if (q.meet) s.push('kennen'); return s; }
function openSubs(q) { var u = q.usedSubs || []; return steckSubs(q).filter(function (x) { return u.indexOf(x) < 0; }); }
/* how many question slots an approved contribution still holds */
function questionSlots(q) {
  if (q.status !== 'ok' || q.type === 'tipp' || q.type === 'worte' || isCardType(q.type)) return 0;
  if (q.type === 'steckbrief') return openSubs(q).length;
  if (q.used) return 0;
  if (q.type === 'wer') return knownGuests().filter(function (n) { return n.toLowerCase() !== String(q.author).toLowerCase(); }).length >= 2 ? 1 : 0;
  return 1;
}
function questionPlayable(q) { return questionSlots(q) > 0; }
/* prepare a drawn guest contribution: fixed answer options so they do not change on every render */
function prepGuestStep(P, q) {
  if (q.type === 'wer') {
    var others = shuffle(knownGuests().filter(function (n) { return n.toLowerCase() !== String(q.author).toLowerCase(); })).slice(0, 3);
    P.opts = shuffle(others.concat([q.author])); P.correct = P.opts.indexOf(q.author);
  }
  if (q.type === 'steckbrief') {
    P.sub = pick(openSubs(q));
    if (P.sub === 'bday') {
      var right = fmtBday(q.bday), opts = [right], guard = 0;
      while (opts.length < 4 && guard++ < 50) {
        var d = fmtBday((1 + Math.floor(Math.random() * 28)) + '.' + (1 + Math.floor(Math.random() * 12)) + '.');
        if (opts.indexOf(d) < 0) opts.push(d);
      }
      P.opts = shuffle(opts); P.correct = P.opts.indexOf(right);
    }
    if (P.sub === 'kennen') {
      var meets = S.questions.filter(function (x) { return x.type === 'steckbrief' && x.status === 'ok' && x.id !== q.id && x.meet; }).map(function (x) { return x.meet; });
      if (meets.length >= 2) { P.opts = shuffle(shuffle(meets).slice(0, 3).concat([q.meet])); P.correct = P.opts.indexOf(q.meet); }
      else P.opts = null;
    }
  }
  return P;
}
function playableOf(P, q) {
  var who = q.forId && isFocus(q.forId) ? person(q.forId).name : focusNames();
  if (q.type === 'luege') return { type: 'auswahl', text: q.author + ' erzählt drei Dinge über sich. Was davon ist gelogen?', options: q.options, correct: q.correct, author: q.author, tag: 'Zwei Wahrheiten, eine Lüge' };
  if (q.type === 'wer') return { type: 'auswahl', text: 'Wer hat das über ' + who + ' geschrieben? „' + q.text + '“', options: P.opts || [q.author], correct: P.opts ? P.correct : 0, author: '', tag: 'Wer hat’s geschrieben?' };
  if (q.type === 'steckbrief') {
    if (!(q.forId && isFocus(q.forId)) && P.main && isFocus(P.main)) who = person(P.main).name;
    if (P.sub === 'jahr') return { type: 'schaetzen', text: 'Seit welchem Jahr kennt ' + q.author + ' ' + who + '?', answer: q.year, unit: '', tol: 1, author: q.author, tag: 'Steckbrief' };
    if (P.sub === 'bday') return { type: 'auswahl', text: 'Wann hat ' + q.author + ' Geburtstag?', options: P.opts, correct: P.correct, author: q.author, tag: 'Steckbrief' };
    if (P.opts) return { type: 'auswahl', text: 'Wie haben sich ' + q.author + ' und ' + who + ' kennengelernt?', options: P.opts, correct: P.correct, author: q.author, tag: 'Steckbrief' };
    return { type: 'aufgabe', text: 'Erzähl, wie du ' + q.author + ' kennengelernt hast.', note: q.author + ' entscheidet, ob die Geschichte im Kern stimmt.', author: q.author, tag: 'Steckbrief' };
  }
  return q;
}
function markGuestUsed(P) {
  var q = S.questions.filter(function (x) { return x.id === P.qid; })[0];
  if (!q) return;
  if (q.type === 'steckbrief') { q.usedSubs = (q.usedSubs || []).concat([P.sub]); if (!openSubs(q).length) q.used = true; }
  else q.used = true;
}
function tipsList() { return S.questions.filter(function (q) { return q.type === 'tipp' && q.status === 'ok'; }); }
function guestBirthdays() { return S.questions.filter(function (q) { return q.type === 'steckbrief' && q.status === 'ok' && q.bday; }).map(function (q) { return q.author + ' ' + fmtBday(q.bday); }); }
/* estimation tolerance: years need a fixed window, not 15 percent */
function isYearLike(q, truth) { return q.tol != null || (!q.unit && truth > 1000 && truth < 2100 && Math.round(truth) === truth); }
function estTol(q, truth) {
  if (q.tol != null) return q.tol;
  if (q.type === 'bereich') return Math.abs(Number(q.max) - Number(q.min)) * 0.1;
  if (isYearLike(q, truth)) return 2;
  return Math.max(Math.abs(truth) * 0.15, 1);
}
function estTolText(q) {
  var truth = Number(q.answer);
  if (isYearLike(q, truth)) { var t = estTol(q, truth); return 'auf ' + t + (t === 1 ? ' Jahr' : ' Jahre') + ' genau'; }
  return 'auf 15 Prozent genau';
}

/* =========================================================
   How many contributions of each kind came in so far
   (shown in the guest form, so guests can fill the gaps)
   ========================================================= */
function inboxList() {
  if (UI.guestMode !== 'link') return [];
  var have = {}; S.questions.forEach(function (q) { have[q.id] = 1; });
  return (lsGet(INBOX_Q) || []).filter(function (q) { return !have[q.id]; });
}
function guestSubmissions() { return S.questions.concat(inboxList()).filter(function (q) { return q.status !== 'nein' && isGuestAuthor(q.author); }); }
function typeCounts() {
  var c = {}; QTYPES.forEach(function (t) { c[t[0]] = 0; });
  guestSubmissions().forEach(function (q) { if (c[q.type] != null) c[q.type] += 1; });
  return c;
}
/* the kinds that lag behind: at most three, only if there is a gap at all */
function rareTypes(c) {
  var keys = formTypes().map(function (t) { return t[0]; }), vals = keys.map(function (k) { return c[k]; });
  var mx = Math.max.apply(null, vals), mn = Math.min.apply(null, vals);
  if (mx === mn) return [];
  return keys.filter(function (k) { return c[k] === mn; }).slice(0, 3);
}

/* =========================================================
   Gästespiele: games the app builds from what several guests
   sent in together. It checks on its own whether there is enough
   material. Only some of the ready ones come up in a game.
   ========================================================= */
function okGuest(type, pending) {
  return S.questions.concat(pending ? inboxList() : []).filter(function (q) { return (pending ? q.status !== 'nein' : q.status === 'ok') && q.type === type && isGuestAuthor(q.author); });
}
function aboutMain(q, main) { return !main || !q.forId || !isFocus(q.forId) || q.forId === main; }
function latestBy(list) {
  var by = {}, out = [];
  list.forEach(function (q) { var k = String(q.author).toLowerCase(); if (!by[k] || (by[k].t || 0) < (q.t || 0)) by[k] = q; });
  Object.keys(by).forEach(function (k) { out.push(by[k]); });
  return out;
}
function subUsed(q, sub) { return (q.usedSubs || []).indexOf(sub) >= 0; }
function thisYear() { return new Date(now()).getFullYear(); }
function daysToBday(b) {
  var d = new Date(now()), t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var x = new Date(d.getFullYear(), +b.slice(3, 5) - 1, +b.slice(0, 2));
  if (x < t) x.setFullYear(x.getFullYear() + 1);
  return Math.round((x - t) / 86400000);
}
function bdayKey(b) { return (+b.slice(3, 5)) * 100 + (+b.slice(0, 2)); }
/* the guests' own questions go into the Millionenfrage-Runde, easy ones first */
var Q_LADDER = ['auswahl', 'schaetzen', 'bereich'];
var GG_POOL = {
  jahr: function (main, pend) { return latestBy(okGuest('steckbrief', pend).filter(function (q) { return q.year && aboutMain(q, main); })); },
  bday: function (main, pend) { return latestBy(okGuest('steckbrief', pend).filter(function (q) { return q.bday; })); },
  meet: function (main, pend) { return okGuest('steckbrief', pend).filter(function (q) { return q.meet && aboutMain(q, main) && !subUsed(q, 'kennen'); }); },
  luege: function (main, pend) { return okGuest('luege', pend).filter(function (q) { return !q.used; }); },
  wer: function (main, pend) { return okGuest('wer', pend).filter(function (q) { return !q.used && aboutMain(q, main); }); },
  frage: function (main, pend) { return S.questions.concat(pend ? inboxList() : []).filter(function (q) { return (pend ? q.status !== 'nein' : q.status === 'ok') && Q_LADDER.indexOf(q.type) >= 0 && !q.used && aboutMain(q, main); }); },
  /* from the bonus cards */
  portrait: function (main, pend) { return okGuest('portrait', pend).filter(function (q) { return !q.used && gkDecode(q.draw).length && aboutMain(q, main); }); },
  wenn: function (main, pend) { return okGuest('wenn', pend).filter(function (q) { return !q.used && wennCat(q.cat) && String(q.text || '').trim() && aboutMain(q, main); }); },
  spruch: function (main, pend) { return okGuest('spruch', pend).filter(function (q) { return !q.used && String(q.text || '').trim().length >= 3 && aboutMain(q, main); }); },
  umfrage: function (main, pend) { return okGuest('umfrage', pend).filter(function (q) { return !q.used && umfrageQ(q.qk) && wordKey(q.text) && aboutMain(q, main); }); }
};
var GG_NEED = {
  jahr: ['Steckbrief mit dem Jahr, seit dem ihr euch kennt', 'Steckbriefe mit dem Jahr, seit dem ihr euch kennt'],
  bday: ['Steckbrief mit Geburtstag', 'Steckbriefe mit Geburtstag'],
  meet: ['Steckbrief mit Kennenlern-Geschichte', 'Steckbriefe mit Kennenlern-Geschichte'],
  luege: ['„Zwei Wahrheiten, eine Lüge“', '„Zwei Wahrheiten, eine Lüge“'],
  wer: ['Erinnerung für „Wer hat’s geschrieben?“', 'Erinnerungen für „Wer hat’s geschrieben?“'],
  frage: ['Frage (Schätzen, Auswahl oder Bereich)', 'Fragen (Schätzen, Auswahl oder Bereich)'],
  portrait: ['Porträt', 'Porträts'],
  wenn: ['„Wenn … wäre“-Kategorie', '„Wenn … wäre“-Kategorien'],
  spruch: ['Lieblingsspruch', 'Lieblingssprüche'],
  umfrage: ['Antwort auf dieselbe Umfrage', 'Antworten auf dieselbe Umfrage']
};
var GG_FEM = ['wer', 'frage', 'wenn', 'umfrage'];
function ggNeedText(fam, miss) { return 'Noch ' + (miss === 1 ? 'ein' + (GG_FEM.indexOf(fam) >= 0 ? 'e ' : ' ') + GG_NEED[fam][0] : miss + ' ' + GG_NEED[fam][1]); }
var byYear = function (q) { return q.year; }, byBday = function (q) { return q.bday; }, byAuthor = function (q) { return String(q.author).toLowerCase(); }, byId = function (q) { return q.id; };
var byCatK = function (q) { return q.cat + '|' + (q.forId || ''); }, byQk = function (q) { return q.qk + '|' + (q.forId || ''); };
/* Top-Antworten: the biggest group of answers to one question */
function umfrageMax(pool) { var g = groupsBy(pool, byQk), m = 0; Object.keys(g).forEach(function (k) { m = Math.max(m, g[k].length); }); return m; }
/* w: how strong a round feels, early in the evening the lighter ones, the strongest towards the end.
   round: built from fresh contributions, can come several times; the others reveal the same
   years or birthdays and come once per evening. */
var GG = [
  { id: 'laengste', fam: 'jahr', name: 'Wer kennt am längsten?', need: 3, val: byYear, about: 'Steckbriefen', w: 1.2 },
  { id: 'zeitstrahl', fam: 'jahr', name: 'Freundschafts-Zeitstrahl', need: 4, val: byYear, about: 'Steckbriefen', w: 1.7 },
  { id: 'jahre', fam: 'jahr', name: 'Jahre voller Freundschaft', need: 3, val: byAuthor, about: 'Steckbriefen', w: 1.0 },
  { id: 'naechster', fam: 'bday', name: 'Wer feiert als Nächstes?', need: 3, val: byBday, about: 'Steckbriefen', w: 1.0 },
  { id: 'kalender', fam: 'bday', name: 'Geburtstags-Kalender', need: 4, val: byBday, about: 'Steckbriefen', w: 1.4 },
  { id: 'kennen', fam: 'meet', name: 'Wie war das nochmal?', need: 3, val: byId, about: 'Kennenlern-Geschichten', w: 2.0, round: true, cap: 5 },
  { id: 'millionen', fam: 'frage', name: 'Millionenfrage-Runde', need: 3, val: byId, about: 'Fragen der Gäste', w: 2.5, round: true, cap: 6 },
  { id: 'erinnerungen', fam: 'wer', name: 'Erinnerungs-Memory', need: 3, val: byId, about: 'Erinnerungen', w: 2.8, round: true, cap: 5 },
  { id: 'luegen', fam: 'luege', name: 'Lügen-Runde', need: 3, val: byId, about: 'Lügen', w: 3.0, round: true, cap: 5 },
  /* from the bonus cards */
  { id: 'galerie', fam: 'portrait', name: 'Porträt-Galerie', need: 3, val: byId, about: 'Porträts', w: 2.2, round: true, cap: 5 },
  { id: 'waere', fam: 'wenn', name: 'Wenn … wäre', need: 3, val: byCatK, about: '„Wenn … wäre“-Antworten', w: 1.5, round: true, cap: 5 },
  { id: 'sprueche', fam: 'spruch', name: 'Sprüche-Klopfer', need: 3, val: byId, about: 'Lieblingssprüche', w: 2.0, round: true, cap: 5 },
  { id: 'umfrage', fam: 'umfrage', name: 'Top-Antworten', need: 4, val: byQk, have: umfrageMax, about: 'Umfrage-Antworten', w: 2.6, round: true, cap: 6 }
];
var ROUND_FAMS = ['luege', 'wer', 'meet', 'frage', 'portrait', 'wenn', 'spruch', 'umfrage'], ONCE_FAMS = ['jahr', 'bday'];
var CARD_FAMS = ['portrait', 'wenn', 'spruch', 'umfrage'];
function famNeed(f) { var n = 0; GG.forEach(function (g) { if (g.fam === f && (!n || g.need < n)) n = g.need; }); return n || 3; }
function ggById(id) { return GG.filter(function (g) { return g.id === id; })[0]; }
function ggUsed() { S.used = S.used || {}; return (S.used.gg = S.used.gg || []); }
/* the same years or birthdays are not revealed twice in one evening */
function ggFamUsed(fam) { return ONCE_FAMS.indexOf(fam) >= 0 && ggUsed().some(function (id) { var g = ggById(id); return g && g.fam === fam; }); }
function groupsBy(pool, val) { var g = {}; pool.forEach(function (q) { var v = String(val(q)); (g[v] = g[v] || []).push(q); }); return g; }
/* matching to names needs at least three names to choose from */
function namesOk(fam) { return (fam !== 'wer' && fam !== 'meet' && fam !== 'portrait') || knownGuests().length >= 3; }
function ggHave(g, main, pend) { if (!namesOk(g.fam)) return 0; var pool = GG_POOL[g.fam](main, pend); return g.have ? g.have(pool) : Object.keys(groupsBy(pool, g.val)).length; }
function ggHaveAny(g, pend) { var f = E() ? E().focus : []; if (!f.length) return ggHave(g, '', pend); return Math.max.apply(null, f.map(function (p) { return ggHave(g, p.id, pend); })); }
function ggReady(g, main) { return !ggFamUsed(g.fam) && ggHave(g, main) >= g.need; }
function ggReadyFor(main, not) { return GG.filter(function (g) { return g.id !== not && ggReady(g, main); }); }
function ggReadyFams(ids) { var f = {}; GG.forEach(function (g) { if (ids.some(function (id) { return ggReady(g, id); })) f[g.fam] = 1; }); return Object.keys(f).length; }
/* one of each value (no two guests with the same year in one question), in random order */
function distinctPick(pool, val, n) { var g = groupsBy(pool, val); return shuffle(Object.keys(g)).map(function (k) { return pick(g[k]); }).slice(0, n); }
/* different guests first, then more from the same guests */
function spreadPick(pool, n) {
  var by = groupsBy(shuffle(pool), byAuthor), keys = shuffle(Object.keys(by)), out = [];
  while (out.length < n && keys.some(function (k) { return by[k].length; })) keys.forEach(function (k) { if (out.length < n && by[k].length) out.push(by[k].shift()); });
  return out;
}
/* how much the guests sent, per kind of material, and how many rounds it makes */
/* have: how much material counts for the evening, rounds: how many rounds it makes, show: what the master sees */
function famStock(f, id) {
  var pool = GG_POOL[f](id), need = famNeed(f);
  if (f === 'umfrage') { var g = groupsBy(pool, byQk), ready = 0, mx = 0; Object.keys(g).forEach(function (k) { mx = Math.max(mx, g[k].length); if (g[k].length >= need) ready++; }); return { have: ready * 4, rounds: ready, show: mx }; }
  var n = f === 'wenn' ? Object.keys(groupsBy(pool, byCatK)).length : pool.length;
  return { have: n, rounds: Math.floor(n / need), show: n };
}
function roundInventory(main, ids) {
  var who = ids || (main ? [main] : ['']), inv = {};
  ROUND_FAMS.forEach(function (f) {
    var best = { have: 0, rounds: 0, show: 0 };
    if (namesOk(f)) who.forEach(function (id) { var s = famStock(f, id); if (s.have > best.have || (s.have === best.have && s.show > best.show)) best = s; });
    inv[f] = best;
  });
  ONCE_FAMS.forEach(function (f) { var ok = !ggFamUsed(f) && GG.some(function (g) { return g.fam === f && who.some(function (id) { return ggHave(g, id) >= g.need; }); }); inv[f] = { have: ok ? 1 : 0, rounds: ok ? 1 : 0 }; });
  return inv;
}
/* round size: what the guests sent, spread over the rounds still to come. 3 to 6 questions */
function roundTarget(main) {
  var r = R(); if (!r || !r.plan) return 4;
  var inv = roundInventory(main), items = 0, fixed = 0;
  ROUND_FAMS.forEach(function (f) { if (f !== 'umfrage') items += inv[f].have; else fixed += inv[f].rounds; });
  ONCE_FAMS.forEach(function (f) { fixed += inv[f].rounds; });
  var rounds = personalBudget(r).remG;
  return Math.max(3, Math.min(6, Math.round(items / Math.max(1, rounds - fixed))));
}
function needOf(k) { return Math.ceil(k * 0.6 - 1e-9); }
/* state of every Gästespiel, for the hint in the guest form */
function ggStatus(pend) {
  return GG.map(function (g) {
    var played = ggUsed().indexOf(g.id) >= 0, famDone = ggFamUsed(g.fam) && !played, have = ggHaveAny(g, pend);
    return { g: g, played: played, famDone: famDone, ready: (g.round || !played) && !famDone && have >= g.need, miss: Math.max(0, g.need - have) };
  });
}
/* the closest kind of material that still unlocks a new Gästespiel */
function ggHint() {
  var st = ggStatus(true), fams = {}, best = null;
  st.forEach(function (s) { if (s.ready || s.played || s.famDone) fams[s.g.fam] = 1; });
  st.forEach(function (s) { if (fams[s.g.fam] || !s.miss || CARD_FAMS.indexOf(s.g.fam) >= 0) return; if (!best || s.miss < best.miss) best = s; });
  return best ? { fam: best.g.fam, miss: best.miss } : null;
}
function ggWinRow(P) {
  var w = P.win; if (!w) return null;
  if (w.single) { var row = nameRow(w.name, 1); row.note = w.note || ''; return row; }
  if (!w.names.length) return null;
  return { pid: '', name: joinNames(w.names), n: 1, group: true, note: (w.note ? w.note + ', ' : '') + 'wer da ist' };
}
/* which round comes now: early the lighter ones, towards the end the strongest */
function ggChoose(cand, prog) {
  if (prog == null) return pick(cand);
  var t = 1 + 2 * Math.min(1, Math.max(0, prog));
  var w = cand.map(function (g) { return Math.exp(-Math.pow(g.w - t, 2) / 0.7); }), sum = w.reduce(function (a, x) { return a + x; }, 0), x = Math.random() * sum;
  for (var i = 0; i < cand.length; i++) { x -= w[i]; if (x <= 0) return cand[i]; }
  return cand[cand.length - 1];
}
function makeGuestGameStep(main, not, prog) {
  var cand = ggReadyFor(main, not);
  if (!cand.length) return null;
  var g = ggChoose(cand, prog), mn = person(main).name, pool = GG_POOL[g.fam](main), Y = thisYear();
  var P = { kind: 'gast', gg: g.id, name: g.name, main: main, marks: [], credit: [], lines: [], choice: null, answerFocus: '', group: '' };
  var take = function (list, sub) { list.forEach(function (q) { P.marks.push({ qid: q.id, sub: sub || '' }); if (isGuestAuthor(q.author) && P.credit.indexOf(q.author) < 0) P.credit.push(q.author); }); };
  var sinceTxt = function (q) { var y = Y - q.year; return 'seit ' + q.year + (y > 0 ? ' (' + y + (y === 1 ? ' Jahr)' : ' Jahre)') : ''); };
  var k = g.round ? Math.max(g.need, Math.min(g.cap, pool.length, prog == null ? 4 : roundTarget(main))) : 0;
  var authors = function (list) { var o = []; list.forEach(function (q) { if (isGuestAuthor(q.author) && o.indexOf(q.author) < 0) o.push(q.author); }); return o; };
  if (g.id === 'laengste') {
    var reps = distinctPick(pool, byYear, 4).sort(function (a, b) { return a.year - b.year; });
    var short = Math.random() < 0.35, right = short ? reps[reps.length - 1] : reps[0];
    P.mode = 'auswahl';
    P.text = 'Wer von diesen Gästen kennt ' + mn + ' am ' + (short ? 'kürzesten' : 'längsten') + '?';
    P.opts = shuffle(reps.map(function (q) { return q.author; })); P.correct = P.opts.indexOf(right.author);
    P.lines = reps.map(function (q) { return { ok: q === right, t: q.author + ': ' + sinceTxt(q) }; });
    P.win = { single: true, name: right.author, note: short ? 'der Neuzugang stößt mit an' : 'auf die längste Freundschaft' };
    take(reps, 'jahr');
  } else if (g.id === 'zeitstrahl') {
    var n = Object.keys(groupsBy(pool, byYear)).length >= 6 ? 5 : 4;
    var rz = distinctPick(pool, byYear, n);
    P.mode = 'sort';
    P.text = 'Wer kennt ' + mn + ' am längsten? Bring die Gäste in die richtige Reihenfolge.';
    P.sortLabel = 'Zuerst, wer ' + mn + ' am längsten kennt';
    P.items = rz.map(function (q) { return { label: q.author, rank: q.year }; });
    P.pickOrder = [];
    P.lines = rz.slice().sort(function (a, b) { return a.year - b.year; }).map(function (q, i) { return { t: (i + 1) + '. ' + q.author + ': ' + sinceTxt(q) }; });
    P.win = { names: authors(rz), note: 'stoßen auf die Freundschaft an' };
    take(rz, 'jahr');
  } else if (g.id === 'jahre') {
    var rj = shuffle(pool).slice(0, 6), sum = 0;
    rj.forEach(function (q) { sum += Math.max(0, Y - q.year); });
    P.mode = 'schaetzen';
    P.text = joinNames(rj.map(function (q) { return q.author; })) + ' kennen ' + mn + ' schon eine Weile. Wie viele Jahre sind das zusammengerechnet?';
    P.answer = sum; P.unit = 'Jahre'; P.tol = Math.max(2, Math.round(sum * 0.15));
    P.lines = rj.map(function (q) { return { t: q.author + ': ' + sinceTxt(q) }; });
    P.win = { names: authors(rj), note: 'stoßen auf ' + sum + ' Jahre an' };
    take(rj, 'jahr');
  } else if (g.id === 'naechster') {
    var rb = distinctPick(pool, byBday, 4), early = Math.random() < 0.4;
    var key = early ? function (q) { return bdayKey(q.bday); } : function (q) { return daysToBday(q.bday); };
    rb.sort(function (a, b) { return key(a) - key(b); });
    P.mode = 'auswahl';
    P.text = early ? 'Wer von diesen Gästen hat am frühesten im Jahr Geburtstag?' : 'Wer von diesen Gästen hat als Nächstes Geburtstag?';
    P.opts = shuffle(rb.map(function (q) { return q.author; })); P.correct = P.opts.indexOf(rb[0].author);
    P.lines = rb.map(function (q, i) { var dd = daysToBday(q.bday); return { ok: i === 0, t: q.author + ': ' + fmtBday(q.bday) + (early ? '' : dd === 0 ? ' (heute!)' : ' (in ' + dd + (dd === 1 ? ' Tag)' : ' Tagen)')) }; });
    P.win = { single: true, name: rb[0].author, note: 'darauf wird schon mal vorgefeiert' };
    take(rb, 'bday');
  } else if (g.id === 'kalender') {
    var rk = distinctPick(pool, byBday, Object.keys(groupsBy(pool, byBday)).length >= 6 ? 5 : 4);
    P.mode = 'sort';
    P.text = 'Wer hat wann Geburtstag? Sortier die Gäste durchs Jahr, vom Januar bis zum Dezember.';
    P.sortLabel = 'Zuerst, wer am frühesten im Jahr Geburtstag hat';
    P.items = rk.map(function (q) { return { label: q.author, rank: bdayKey(q.bday) }; });
    P.pickOrder = [];
    P.lines = rk.slice().sort(function (a, b) { return bdayKey(a.bday) - bdayKey(b.bday); }).map(function (q, i) { return { t: (i + 1) + '. ' + q.author + ': ' + fmtBday(q.bday) }; });
    P.win = { names: authors(rk), note: 'stoßen auf ihre Geburtstage an' };
    take(rk, 'bday');
  } else if (g.id === 'kennen' || g.id === 'erinnerungen') {
    var mem = g.id === 'erinnerungen', rm = spreadPick(pool, k);
    /* the authors plus a few other guests, so it is not just elimination */
    var names = authors(rm); shuffle(knownGuests()).forEach(function (n) { if (names.length < 4 && names.map(function (x) { return x.toLowerCase(); }).indexOf(n.toLowerCase()) < 0) names.push(n); });
    names = shuffle(names);
    P.mode = 'multi';
    P.text = mem ? 'Von wem stammt welche Erinnerung an ' + mn + '? Ordne jede dem richtigen Gast zu.' : 'Wer hat ' + mn + ' wie kennengelernt? Ordne jede Geschichte dem richtigen Gast zu.';
    P.items = rm.map(function (q) { return { prompt: '„' + (mem ? q.text : q.meet) + '“', options: names, correct: names.indexOf(q.author), reveal: q.author, by: q.author }; });
    P.choices = P.items.map(function () { return null; });
    P.win = { names: authors(rm), note: 'wurden erkannt' };
    take(rm, mem ? '' : 'kennen');
  } else if (g.id === 'luegen') {
    var rl = spreadPick(pool, k);
    P.mode = 'multi'; P.long = true;
    P.text = rl.length + ' Lügen von den Gästen. Wie viele davon entlarvt ' + mn + '?';
    P.items = rl.map(function (q) { return { prompt: q.author + ' erzählt:', options: q.options, correct: q.correct, reveal: q.options[q.correct], by: q.author }; });
    P.choices = P.items.map(function () { return null; });
    P.win = { names: authors(rl), note: 'beim Lügen erwischt' };
    take(rl, '');
  } else if (g.id === 'millionen') {
    var rq = aiMix(pool, k).sort(function (a, b) { return Q_LADDER.indexOf(a.type) - Q_LADDER.indexOf(b.type); });
    P.mode = 'leiter';
    P.ai = rq.some(function (q) { return q.ai; });
    P.items = rq.map(function (q) { return { qid: q.id, type: q.type, text: q.text, options: q.options, correct: q.correct, answer: q.answer, unit: q.unit, min: q.min, max: q.max, tol: q.tol, ai: !!q.ai, author: q.author }; });
    P.at = 0; P.hits = []; P.given = []; P.lv = ''; P.revealed = false;
    P.win = { names: authors(rq), note: 'haben ' + mn + ' gut gefordert' };
    take(rq, '');
  } else if (g.id === 'galerie') {
    /* the portraits from the bonus cards: who drew which one? */
    var rp = spreadPick(pool, k), pn = authors(rp);
    shuffle(knownGuests()).forEach(function (n) { if (pn.length < 4 && pn.map(function (x) { return x.toLowerCase(); }).indexOf(n.toLowerCase()) < 0) pn.push(n); });
    pn = shuffle(pn);
    P.mode = 'multi'; P.gal = true;
    P.text = 'Die Gäste haben ' + mn + ' gemalt, jeder unter Zeitdruck. Wer hat welches Porträt gemalt?';
    P.items = rp.map(function (q, i) { return { prompt: 'Porträt ' + (i + 1), draw: q.draw, options: pn, correct: pn.indexOf(q.author), reveal: q.author, by: q.author, line: 'Porträt ' + (i + 1) + ' hat ' + q.author + ' gemalt' }; });
    P.choices = P.items.map(function () { return null; });
    P.win = { names: authors(rp), note: 'haben ' + mn + ' verewigt' };
    take(rp, '');
  } else if (g.id === 'waere') {
    /* one real answer of the guests per category, three the app made up */
    var cats = groupsBy(pool, byCatK), ck = shuffle(Object.keys(cats));
    ck = ck.slice(0, Math.max(g.need, Math.min(g.cap, ck.length, prog == null ? 4 : roundTarget(main))));
    P.mode = 'multi'; P.wenn = true;
    P.text = 'Wenn ' + mn + ' … wäre! Die Gäste haben geantwortet, die App hat Quatsch dazugemischt. Welche Antwort ist echt?';
    P.items = ck.map(function (key) {
      var list = cats[key], c = wennCat(list[0].cat), byW = {}, order = [];
      list.forEach(function (q) { var w = wordKey(q.text) || String(q.text).toLowerCase(); if (!byW[w]) { byW[w] = { label: String(q.text).trim(), by: [] }; order.push(w); } byW[w].by.push(q.author); });
      var top = shuffle(order).sort(function (a, b) { return byW[b].by.length - byW[a].by.length; })[0], keys = {};
      order.forEach(function (w) { keys[w] = 1; });
      var dec = shuffle(c[4].filter(function (d) { return !keys[wordKey(d)]; })).slice(0, 3);
      var opts = shuffle([byW[top].label].concat(dec)), rest = order.filter(function (w) { return w !== top; }).map(function (w) { return byW[w].label; });
      var rev = byW[top].label + ' (' + joinNames(byW[top].by) + ')' + (rest.length ? ', auch genannt: ' + rest.join(', ') : '');
      return { prompt: 'Wenn ' + mn + ' ' + c[1] + ' wäre …', options: opts, correct: opts.indexOf(byW[top].label), reveal: rev, by: byW[top].by[0], line: 'Wenn ' + mn + ' ' + c[1] + ' wäre: ' + rev };
    });
    P.choices = P.items.map(function () { return null; });
    var wa = []; ck.forEach(function (key) { wa = wa.concat(cats[key]); });
    P.win = { names: authors(wa), note: 'haben ' + mn + ' durchschaut' };
    take(wa, '');
  } else if (g.id === 'sprueche') {
    /* the sayings: only the start shows, the rest has to come from the birthday person */
    var rs = spreadPick(pool, k);
    P.mode = 'judge';
    P.text = rs.length + ' Sprüche, die ' + mn + ' angeblich ständig sagt. Die App zeigt nur den Anfang, ' + mn + ' ergänzt.';
    P.items = rs.map(function (q) { var t = String(q.text).trim(); return { full: t, cue: spruchCue(t), by: q.author }; });
    P.at = 0; P.open = false; P.hits = [];
    P.win = { names: authors(rs), note: 'kennen ' + mn + ' ganz genau' };
    take(rs, '');
  } else if (g.id === 'umfrage') {
    /* Top-Antworten: the answers of one question on a board, the most frequent first */
    var gq = groupsBy(pool, byQk), full = Object.keys(gq).filter(function (x) { return gq[x].length >= g.need; });
    var mxs = Math.max.apply(null, full.map(function (x) { return gq[x].length; }).concat([0]));
    var pickK = pick(full.filter(function (x) { return gq[x].length === mxs; })), ans = gq[pickK], agg = {}, ord = [];
    ans.forEach(function (q) { var w = wordKey(q.text); if (!agg[w]) { agg[w] = { label: String(q.text).trim(), n: 0, by: [] }; ord.push(w); } agg[w].n++; agg[w].by.push(q.author); });
    var board = shuffle(ord).sort(function (a, b) { return agg[b].n - agg[a].n; }).slice(0, 6).map(function (w) { return { label: agg[w].label, n: agg[w].n, by: agg[w].by, hit: false }; });
    P.mode = 'board';
    P.qtext = umfrageText(ans[0].qk, mn); P.asked = ans.length;
    P.text = 'Wir haben ' + ans.length + ' Gäste gefragt: ' + P.qtext;
    P.items = board; P.strikes = 0;
    P.win = { names: authors(ans), note: 'stehen auf der Tafel' };
    take(ans, '');
  }
  var items = P.items ? P.items.length : 0;
  if (P.mode === 'multi' || P.mode === 'leiter' || P.mode === 'judge' || P.mode === 'board') { P.need = needOf(items); P.big = items >= 5 && P.mode !== 'board'; }
  if (P.mode === 'sort') P.big = items >= 5;
  if (P.mode === 'leiter') { var nAi = P.items.filter(function (x) { return x.ai; }).length; P.text = items + (nAi === items ? ' Fragen, maßgeschneidert für ' + mn : nAi ? ' Fragen an ' + mn + ', von den Gästen und eigens für ' + mn + ' gebaut' : ' Fragen der Gäste an ' + mn) + ', eine nach der anderen. Wie im Fernsehen, nur ohne Joker.'; }
  P.rule = P.mode === 'sort' ? 'Ein vertauschtes Nachbarpaar ist erlaubt.' : P.mode === 'board' ? 'Mindestens ' + P.need + ' von ' + items + ' Antworten finden, bevor drei Fehlversuche voll sind.' : P.mode === 'judge' ? 'Mindestens ' + P.need + ' von ' + items + ' Sprüchen müssen sitzen.' + (P.big ? ' Große Runde!' : '') : P.need ? 'Mindestens ' + P.need + ' von ' + items + ' richtig.' + (P.big ? ' Große Runde!' : '') : '';
  return P;
}
/* the start of a saying, the rest is for the birthday person */
function spruchCue(t) {
  var w = String(t || '').trim().split(/\s+/).filter(Boolean);
  if (w.length >= 3) return w.slice(0, Math.ceil(w.length / 2)).join(' ') + ' …';
  if (w.length === 2) return w[0] + ' …';
  var s = (w[0] || '').replace(/[.!?,;:…]+$/, '');
  return s.charAt(0) + '… (' + s.length + ' Buchstaben)';
}
function ggInversions(order, items) {
  var r = order.map(function (i) { return items[i].rank; }), n = 0;
  for (var a = 0; a < r.length; a++) for (var b = a + 1; b < r.length; b++) if (r[a] > r[b]) n++;
  return n;
}
/* spend the game and the contributions it revealed */
function markGuestGame(P) {
  if (ggUsed().indexOf(P.gg) < 0) ggUsed().push(P.gg);
  P.marks.forEach(function (m) {
    var q = S.questions.filter(function (x) { return x.id === m.qid; })[0];
    if (!q) return;
    if (m.sub) { if (!subUsed(q, m.sub)) q.usedSubs = (q.usedSubs || []).concat([m.sub]); if (!openSubs(q).length) q.used = true; }
    else q.used = true;
  });
}

