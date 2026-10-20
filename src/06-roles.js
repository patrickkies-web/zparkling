/* =========================================================
   Roles: a few tongue-in-cheek titles for the guests, made only from
   what they sent through the link and from how their contributions did
   in the games. The birthday people stay the stars; roles are small
   gestures. Ties or thin data: whoever knows the birthday person
   longest, then the younger one, then whoever sent something first.
   ========================================================= */
var ROLE_DEFS = {
  urgestein: { name: 'Das Urgestein' },
  hellseher: { name: 'Der Hellseher' },
  millionen: { name: 'Mister Millionenfrage' },
  messer: { name: 'Das Schweizer Taschenmesser', why: 'hat von jeder Sorte etwas geschickt' },
  frischling: { name: 'Der Frischling', why: 'kennt {F} am kürzesten' },
  plauder: { name: 'Die Plaudertasche', why: 'hat die meisten Erinnerungen an {F} aufgeschrieben' },
  luegen: { name: 'Der Lügenbaron', why: 'hat {F} mit seinen Lügen am besten reingelegt' },
  naechster: { name: 'Das nächste Geburtstagskind', why: 'hat von allen als Nächstes Geburtstag' },
  unbekannt: { name: 'Der große Unbekannte', why: 'bei den Fragen über ihn lag {F} jedes Mal daneben' },
  seele: { name: 'Der Seelenverwandte', why: 'bei den Fragen über ihn lag {F} jedes Mal richtig' },
  quaelgeist: { name: 'Der Quälgeist', why: 'seine Beiträge haben {F} am öftesten scheitern lassen' }
};
var ROLE_ORDER = ['urgestein', 'hellseher', 'millionen', 'messer', 'frischling', 'plauder', 'luegen', 'unbekannt', 'seele', 'quaelgeist', 'naechster'];
var ROLE_OPTIONAL = ['messer', 'millionen', 'frischling', 'unbekannt', 'seele', 'luegen', 'plauder', 'quaelgeist', 'naechster'];
var ROLE_MAX = 6;
var Q_KINDS = ['schaetzen', 'auswahl', 'bereich', 'aufgabe'];
function roleF(r) { return focusNames(r && r.who ? r.who : null); }
function roleText(s, r, name) { return String(s).replace(/\{F\}/g, roleF(r)).replace(/\{N\}/g, name || ''); }

/* ---------- what is known about each guest ---------- */
function roleGuests(r) {
  r = r || R();
  var by = {}, who = r && r.who ? r.who : [];
  S.questions.forEach(function (q) {
    if (q.status !== 'ok' || !isGuestAuthor(q.author)) return;
    var nm = String(q.author).trim(), k = nm.toLowerCase();
    var g = by[k] = by[k] || { name: nm, key: k, items: [], first: q.t || 0, year: null, byear: null, bday: '', types: {} };
    g.items.push(q); g.types[q.type] = (g.types[q.type] || 0) + 1;
    if ((q.t || 0) < g.first) g.first = q.t || 0;
    if (q.type === 'steckbrief') {
      var mine = !q.forId || who.indexOf(q.forId) >= 0;
      if (mine && q.year && (g.year == null || Number(q.year) < g.year)) g.year = Number(q.year);
      if (q.byear) g.byear = Number(q.byear);
      if (q.bday) g.bday = q.bday;
    }
  });
  return Object.keys(by).map(function (k) { return by[k]; });
}
function guestByName(list, name) { var k = String(name || '').trim().toLowerCase(); return list.filter(function (g) { return g.key === k; })[0] || null; }
/* bigger means younger; null when the year of birth is unknown */
function birthKey(g) { return g.byear ? g.byear * 10000 + (g.bday ? bdayKey(g.bday) : 0) : null; }
function tieCmp(a, b) {
  var ya = a.year == null ? 99999 : a.year, yb = b.year == null ? 99999 : b.year;
  if (ya !== yb) return ya - yb;
  var ka = birthKey(a), kb = birthKey(b);
  if (ka != null && kb != null && ka !== kb) return kb - ka;
  if ((ka != null) !== (kb != null)) return ka != null ? -1 : 1;
  return (a.first || 0) - (b.first || 0);
}
function tieSort(list) { return list.slice().sort(tieCmp); }
/* highest score first; equal scores in the tie order */
function rankBy(list, score) {
  return list.map(function (g) { return { g: g, s: score(g) }; }).filter(function (x) { return x.s > 0; })
    .sort(function (a, b) { return b.s - a.s || tieCmp(a.g, b.g); }).map(function (x) { return x.g; });
}
/* in plain words, why someone came first in the tie order */
function tieWhy(g, list, first) {
  if (g.year != null) {
    if (!first) return 'kennt {F} schon seit ' + g.year;
    var same = list.filter(function (x) { return x !== g && x.year === g.year; });
    if (!same.length) return 'kennt {F} seit ' + g.year + ', länger als alle anderen';
    return 'kennt {F} seit ' + g.year + ', genau wie ' + joinNames(same.map(function (x) { return x.name; })) + (birthKey(g) != null && same.some(function (x) { return birthKey(x) != null; }) ? '. Bei Gleichstand gewinnt, wer jünger ist' : '. Bei Gleichstand gewinnt, wer zuerst mitgemacht hat');
  }
  if (birthKey(g) != null) return 'Seit wann, hat keiner verraten. Darum entscheidet das Alter: Jünger gewinnt';
  return 'Seit wann, hat keiner verraten. Darum gewinnt, wer zuerst mitgemacht hat';
}
function gstatOf(r, g) { return (r.gstat && r.gstat[g.key]) || { ok: 0, fail: 0, lieMiss: 0 }; }
/* how a guest's own contribution did in a game: the base for some roles and the closing numbers */
function noteGuestResult(author, ok, isLie) {
  var r = R(); if (!r || r.finished || !isGuestAuthor(author)) return;
  r.gstat = r.gstat || {};
  var k = String(author).trim().toLowerCase(), s = r.gstat[k] = r.gstat[k] || { ok: 0, fail: 0, lieMiss: 0 };
  if (ok) s.ok++; else s.fail++;
  if (isLie && !ok) s.lieMiss++;
}
function projectedMinutes(r) { return Math.round(paceRatio() * (r.planned || 75)); }
function qCount(g) { return Q_KINDS.reduce(function (a, t) { return a + (g.types[t] || 0); }, 0); }

/* ---------- who would get which role ---------- */
function roleCandidates(r, id, list) {
  if (id === 'urgestein') return tieSort(list);
  if (id === 'hellseher') {
    var proj = projectedMinutes(r);
    var tips = tipsList().map(function (q) { return { g: guestByName(list, q.author), d: Math.abs(Number(q.answer) - proj) }; }).filter(function (x) { return x.g; });
    if (!tips.length) return [];
    var best = Math.min.apply(null, tips.map(function (x) { return x.d; }));
    return tieSort(tips.filter(function (x) { return x.d === best; }).map(function (x) { return x.g; }));
  }
  if (id === 'millionen') { var top = rankBy(list, qCount), tot = list.reduce(function (a, g) { return a + qCount(g); }, 0); return top.length && qCount(top[0]) >= 3 && qCount(top[0]) >= tot / 3 ? top : []; }
  if (id === 'messer') return tieSort(list.filter(function (g) { return formTypes().every(function (t) { return g.types[t[0]]; }); }));
  if (id === 'frischling') {
    var withY = list.filter(function (g) { return g.year != null; });
    if (withY.length < 3) return [];
    var oldest = Math.min.apply(null, withY.map(function (g) { return g.year; }));
    return rankBy(withY.filter(function (g) { return g.year > oldest; }), function (g) { return g.year - 1900; });
  }
  if (id === 'plauder') return rankBy(list, function (g) { return (g.types.wer || 0) >= 2 ? g.types.wer : 0; });
  if (id === 'luegen') return rankBy(list, function (g) { return gstatOf(r, g).lieMiss; });
  if (id === 'naechster') return rankBy(list.filter(function (g) { return g.bday; }), function (g) { return 400 - daysToBday(g.bday); });
  if (id === 'unbekannt') return rankBy(list, function (g) { var s = gstatOf(r, g); return s.fail >= 2 && !s.ok ? s.fail : 0; });
  if (id === 'seele') return rankBy(list, function (g) { var s = gstatOf(r, g); return s.ok >= 2 && !s.fail ? s.ok : 0; });
  if (id === 'quaelgeist') return rankBy(list, function (g) { var s = gstatOf(r, g); return s.fail >= 3 && s.fail > s.ok ? s.fail - s.ok : 0; });
  return [];
}
function roleState(r) { r.roles = r.roles || { who: {}, why: {}, shown: {}, used: {} }; return r.roles; }
function optTaken(st, name) { return ROLE_OPTIONAL.some(function (k) { return st.who[k] === name; }); }
function roomFor(st) { return Object.keys(st.who).length + (st.who.urgestein ? 0 : 1) + (st.who.hellseher ? 0 : 1) < ROLE_MAX; }
/* hand out a role (with dry only look who would get it). The Urgestein and the Hellseher come
   every evening; weak data for them falls back to the tie order. Everything else only on clear data. */
function pickRole(r, id, dry) {
  var st = roleState(r); if (st.who[id]) return st.who[id];
  var list = roleGuests(r); if (!list.length) return '';
  var required = id === 'urgestein' || id === 'hellseher';
  if (!required && !roomFor(st)) return '';
  var cand = roleCandidates(r, id, list), g, why = '';
  if (id === 'urgestein') { g = cand[0]; why = tieWhy(g, list, true); }
  else if (id === 'hellseher') {
    var urg = st.who.urgestein || tieSort(list)[0].name;
    var other = function (x) { return list.length < 2 || x.name !== urg; };
    g = cand.filter(other)[0];
    if (g) why = 'liegt im Tippspiel gerade am nächsten dran';
    else { g = tieSort(list).filter(other)[0] || list[0]; why = tieWhy(g, list, g === tieSort(list)[0]) + '. Da sieht man so einiges kommen'; }
  } else {
    g = cand.filter(function (x) { return !optTaken(st, x.name); })[0];
    if (g) why = id === 'millionen' ? 'hat ' + qCount(g) + ' Fragen geschickt, mehr als alle anderen' : ROLE_DEFS[id].why || '';
  }
  if (!g) return '';
  if (!dry) { st.who[id] = g.name; st.why[id] = why; }
  return g.name;
}
function roleWhy(r, id) { var st = roleState(r); return roleText(st.why[id] || ROLE_DEFS[id].why || '', r); }
/* the host for the guests' questions: whoever sent the most, otherwise the tie order */
function pickHost(r) {
  var st = roleState(r); if (st.who.millionen) return st.who.millionen;
  var n = pickRole(r, 'millionen'); if (n) return n;
  var list = roleGuests(r); if (!list.length || !roomFor(st)) return '';
  var order = tieSort(list), g = order.filter(function (x) { return !optTaken(st, x.name); })[0]; if (!g) return '';
  st.who.millionen = g.name; st.why.millionen = tieWhy(g, list, g === order[0]) + ', darum gehört das Mikrofon ihm';
  return g.name;
}

/* ---------- when roles come up ---------- */
function maxProgress(r) { return Math.max.apply(null, r.tracks.map(function (t) { return t.done ? 1 : trackProgress(t); })); }
/* the last stretch of the evening: the next task could be the last one */
function nearEnd(r) {
  if (r.variant === 'abend') return elapsedMin() >= r.planned - 1.5 * zeitInterval();
  if (r.variant === 'zeit') return r.tracks.some(function (t) { return !t.done && zeitEst(t).p >= 0.85; });
  var open = r.tracks.filter(function (t) { return !t.done; });
  if (open.length !== 1) return false;
  var left = open[0].total - open[0].pos;
  if (r.variant === 'runden') return left <= 1;
  if (r.variant === 'wuerfel') return left <= 6;
  return left <= 2;
}
var GAG_ROLES = ['unbekannt', 'seele', 'luegen', 'plauder', 'quaelgeist'];
var GAG_TEXT = {
  unbekannt: '{F} sagt drei Dinge über {N}, die stimmen. {N} hilft nicht mit.',
  seele: '{N} und {F}: ein Selfie zu zweit, jetzt sofort.',
  luegen: '{N} tischt eine allerletzte Lüge auf. Alle raten, ob sie stimmt.',
  plauder: '{N} erzählt die ganze Geschichte hinter einer der Erinnerungen.',
  quaelgeist: '{N} macht {F} zur Wiedergutmachung ein ehrliches Kompliment.'
};
function gagsPossible(r) { return GAG_ROLES.some(function (id) { return !!pickRole(r, id, true); }); }
/* side-effect free: is a role moment due now? */
function roleInjection(r) {
  if (!r || r.finished || r.lastDone || r.forceGame || !roleGuests(r).length) return null;
  var st = roleState(r), tr = currentTrack(), main = currentMain(), end = nearEnd(r);
  if (!st.shown.frischling && !end && maxProgress(r) >= 0.3 && pickRole(r, 'frischling', true)) return { kind: 'rolle', role: 'frischling', track: tr.id, main: main };
  if (!end) return null;
  if (!st.ehre && gagsPossible(r)) return { kind: 'ehre', track: tr.id, main: main };
  if (!st.hell && pinnedOpen(r).length <= 1 && !(r.jga && r.jga.mode === 'stadt')) return { kind: 'hellseher', track: tr.id, main: main };
  return null;
}
function hellPending(r) { return !!r && !(r.roles && r.roles.hell) && roleGuests(r).length > 0 && !(r.jga && r.jga.mode === 'stadt'); }
/* fill a role moment once it is really drawn */
function prepRoleStep(r, P) {
  var st = roleState(r);
  pickRole(r, 'urgestein');
  if (P.kind === 'rolle') { P.name = pickRole(r, P.role); st.shown[P.role] = true; }
  if (P.kind === 'ehre') {
    st.ehre = true; P.items = [];
    GAG_ROLES.forEach(function (id) { if (P.items.length >= 3) return; var n = pickRole(r, id); if (n) { P.items.push({ role: id, name: n }); st.shown[id] = true; } });
    pickRole(r, 'naechster');
  }
  if (P.kind === 'hellseher') {
    st.hell = true; st.shown.hellseher = true;
    P.name = pickRole(r, 'hellseher');
    pickRole(r, 'naechster');
    var q = fillQueue(r, 4), urg = pinnedOpen(r)[0], fin = urg || (q[0] ? gameById(q[0]) : null);
    var th = themesOf(r.who);
    if (!fin) fin = shuffle(GAMES.filter(function (g) { return needsOk(g) && fitsTheme(g, th) && gameAllowed(g) && safeFor(g, r.who); }))[0] || GAMES[0];
    var decoys = q.map(gameById).filter(function (g) { return g && g.id !== fin.id; }).slice(0, 2);
    var more = shuffle(GAMES.filter(function (g) { return g.id !== fin.id && decoys.indexOf(g) < 0 && fitsTheme(g, th) && needsOk(g) && !isUsed('games', g); }));
    decoys = decoys.concat(more).slice(0, 3);
    P.game = fin.id; P.opts = shuffle(decoys.concat([fin])).map(function (g) { return g.id; }); P.correct = P.opts.indexOf(fin.id); P.choice = null;
  }
  return P;
}
/* small role banners on ordinary steps: the quiz host and the one-time swap */
function attachRoles(r, step) {
  if (!step || !roleGuests(r).length) return step;
  var st = roleState(r);
  if ((step.kind === 'frage' || (step.kind === 'gast' && (step.mode === 'leiter' || step.mode === 'board'))) && maxProgress(r) >= 0.15) { var h = pickHost(r); if (h) { step.host = h; step.hostNew = !st.shown.millionen; st.shown.millionen = true; } }
  if (step.kind === 'spiel' && !step.last && !st.shown.messer && maxProgress(r) >= 0.4) { var m = pickRole(r, 'messer'); if (m) { step.swapBy = m; st.shown.messer = true; } }
  return step;
}
function roleBanner(P) {
  var r = R(); if (!r || stepIsFree()) return '';
  var b = function (id, name, text, extra) { var d = ROLE_DEFS[id]; return '<div class="roleban mt14"><span class="rb-e" aria-hidden="true">' + roleIcon(id, 30) + '</span><span class="stack grow" style="gap:2px;min-width:0"><span class="rb-l">' + esc(d.name) + ' · ' + esc(name) + '</span><span class="rb-t">' + esc(text) + '</span></span>' + (extra || '') + '</div>'; };
  if (P.reader) return b('urgestein', P.reader, (P.readerNew ? 'Neue Rolle! ' + P.reader + ' ' + roleWhy(r, 'urgestein') + '. ' : '') + P.reader + ' liest die letzte Aufgabe vor. Langsam, laut und mit Gefühl. Nicht da? Dann der Spielleiter.');
  if (P.host) return b('millionen', P.host, (P.hostNew ? 'Neue Rolle! ' + P.host + ' ' + roleWhy(r, 'millionen') + '. ' : '') + P.host + (P.mode === 'leiter' ? ' moderiert die Runde und liest jede Frage vor, mit Spannungspause wie im Fernsehen.' : P.mode === 'board' ? ' moderiert die Tafel: „Wir haben die Gäste gefragt …“ und hält den Spickzettel.' : P.type === 'aufgabe' ? ' liest diese Aufgabe vor, feierlich wie bei einer Preisverleihung.' : ' liest diese Frage vor, mit Spannungspause wie im Fernsehen.') + ' Nicht da? Dann übernimmt der Spielleiter.');
  if (P.swappedBy) return b('messer', P.swappedBy, P.swappedBy + ' hat getauscht. Diese Aufgabe gilt jetzt.');
  if (P.swapBy && !roleState(r).used.messer) return b('messer', P.swapBy, 'Neue Rolle! ' + P.swapBy + ' ' + roleWhy(r, 'messer') + ' und darf diese Aufgabe einmal tauschen. Jetzt oder nie.', '<button type="button" class="rb-btn" data-act="roleSwap">Tauschen</button>');
  return '';
}
function roleChip(P) { return P.kind === 'rolle' ? 'Neue Rolle' : P.kind === 'ehre' ? 'Ehrenrunde' : P.kind === 'hellseher' ? 'Der Hellseher' : ''; }
function roleLabel(P) { return P.kind === 'rolle' ? 'Eine Rolle wird verliehen' : P.kind === 'ehre' ? 'Ehrenrunde vor dem Finale' : P.kind === 'hellseher' ? 'Der Hellseher ist dran' : ''; }

/* ---------- the role cards ---------- */
function roleCardHtml(r, id, name, task, big) {
  var d = ROLE_DEFS[id];
  return '<div class="rolecard' + (big ? ' big' : '') + '"><span class="rc-e" aria-hidden="true">' + roleIcon(id, big ? 46 : 34) + '</span><span class="stack" style="gap:3px;min-width:0"><span class="rc-l">' + esc(d.name) + '</span><b class="rc-n">' + esc(name) + '</b><span class="rc-w">' + esc(roleWhy(r, id)) + '</span>' + (task ? '<span class="rc-t">' + esc(task) + '</span>' : '') + '</span></div>';
}
function roleView(P) {
  var r = R(), body = '', foot = '';
  if (P.kind === 'rolle') {
    var task = P.role === 'frischling' ? roleText('Willkommen im Club: {N} erzählt in drei Sätzen, wie das erste Treffen mit {F} war. Danach gibt es Applaus.', r, P.name) : '';
    body = bigCard('var(--violet)', 'Neue Rolle', 'Die App verleiht eine Rolle!', '<p style="position:relative;font-weight:700">Mit einem Augenzwinkern, versteht sich. Kurz vorlesen, dann geht es weiter.</p>') + '<div class="mt14">' + roleCardHtml(r, P.role, P.name, task, true) + '</div>' +
      '<p class="small mt10">' + esc(P.name) + ' ist heute nicht da? Einfach weiter. Die Rolle bleibt für den Abspann.</p>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="rolle">Erledigt, weiter</button>';
  } else if (P.kind === 'ehre') {
    body = bigCard('var(--pink)', 'Ehrenrunde', 'Bevor es ins Finale geht', '<p style="position:relative;font-weight:700">Ein paar Gäste haben sich mit ihren Beiträgen eine Rolle verdient. Jetzt ist ihr kurzer Auftritt.</p>') +
      '<div class="stack gap10 mt14">' + P.items.map(function (it) { return roleCardHtml(r, it.role, it.name, roleText(GAG_TEXT[it.role], r, it.name), false); }).join('') + '</div>' +
      '<p class="small mt10">Wer heute nicht da ist, wird übersprungen. Die Rolle bleibt für den Abspann.</p>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="ehre">Alle durch, weiter</button>';
  } else if (P.kind === 'hellseher') {
    body = bigCard('var(--violet)', 'Der Hellseher', 'Welches Spiel kommt als Letztes?', '<p style="position:relative;font-weight:700">' + esc(P.name) + ' schaut in die Kugel und tippt auf eins.</p>') +
      '<div class="mt14">' + roleCardHtml(r, 'hellseher', P.name, '', true) + '</div>' +
      '<span class="eyebrow mt18 block">Was sieht ' + esc(P.name) + '?</span><div class="stack gap8 mt10">' + P.opts.map(function (gid, i) {
        var g = gameById(gid), s = P.choice === i;
        return '<button type="button" class="opt row' + (s ? ' is-sel' : '') + '" data-act="stepChoice" data-i="' + i + '" aria-pressed="' + s + '" style="min-height:56px;border-radius:18px;padding:8px 12px 8px 8px;gap:12px"><span class="tile-ic" style="width:36px;height:36px;border-radius:12px;background:' + ['var(--orange)', 'var(--mint)', 'var(--violet)', 'var(--sun)'][i % 4] + ';font:800 14px var(--display)">' + 'ABCD'[i] + '</span><span class="grow" style="font-size:15px;font-weight:700">' + esc(g ? g.name : gid) + '</span><span class="check">' + icon('i-check', 14) + '</span></button>';
      }).join('') + '</div><p class="small mt10">Liegt ' + esc(P.name) + ' richtig, wird auf die Kugel getrunken. Liegt ' + esc(P.name) + ' daneben, muss ' + esc(P.name) + ' nicht trinken: den ganzen Abend hellgesehen, nur das Letzte nicht, das zählt nicht. Ist ' + esc(P.name) + ' heute nicht da, tippt die Gruppe stellvertretend.</p>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval"' + (P.choice == null ? ' disabled' : '') + '>Auflösen</button>';
  }
  return { body: body, foot: foot };
}
/* the next birthday person, at the very last finale */
function finaleRoleHtml(r) {
  if (!r) return '';
  var n = roleState(r).who.naechster; if (!n) return '';
  var g = guestByName(roleGuests(r), n), fam = r.fam || 'kranz', job = (E().focus[0] && faOf(E().focus[0]).job) || '';
  var gift = fam === 'kranz' ? 'die letzte ' + unitOf(r.tracks[0]).unit + ' vom Kranz' : fam === 'zeit' ? (job === 'putzen' ? 'den Putzlappen' : 'den Besen') : 'die Würfel';
  return '<div class="mt14">' + roleCardHtml(r, 'naechster', n, n + (g && g.bday ? ' (' + fmtBday(g.bday) + ')' : '') + ' bekommt ' + gift + ' als freundliche Vorwarnung: Du bist die oder der Nächste!', true) + '</div>';
}
/* the roles handed out so far, for the master's overview */
function rolesCard(r) {
  var st = r && r.roles; if (!st) return '';
  var ids = ROLE_ORDER.filter(function (id) { return st.who[id] && st.shown[id]; });
  if (!ids.length) return '';
  return '<span class="eyebrow mt18 block">Rollen bisher</span><div class="chips mt10">' + ids.map(function (id) { return '<span class="tag" style="height:32px;gap:6px">' + roleIcon(id, 20) + '' + esc(st.who[id]) + '<span class="sub" style="font-weight:700">' + esc(ROLE_DEFS[id].name) + '</span></span>'; }).join('') + '</div>';
}

/* ---------- the closing credits: the evening in numbers ---------- */
function abspannLines(r) {
  var list = roleGuests(r); if (!list.length) return [];
  var F = roleF(r), lines = [], Y = thisYear();
  var total = list.reduce(function (a, g) { return a + g.items.length; }, 0);
  lines.push(total + (total === 1 ? ' Beitrag' : ' Beiträge') + ' von ' + list.length + (list.length === 1 ? ' Gast' : ' Gästen') + ' steckten heute in den Spielen.');
  var top = rankBy(list, function (g) { return g.items.length; });
  if (top.length && list.length > 1 && (top.length < 2 || top[0].items.length > top[1].items.length)) lines.push('Am fleißigsten war ' + top[0].name + ' mit ' + top[0].items.length + (top[0].items.length === 1 ? ' Beitrag.' : ' Beiträgen.'));
  var yrs = list.filter(function (g) { return g.year != null; }).reduce(function (a, g) { return a + Math.max(0, Y - g.year); }, 0);
  if (yrs) lines.push('Zusammengerechnet kennen die Gäste ' + F + ' schon ' + yrs + (yrs === 1 ? ' Jahr.' : ' Jahre.'));
  var played = list.map(function (g) { var s = gstatOf(r, g); return { g: g, n: s.ok + s.fail, ok: s.ok }; }).filter(function (x) { return x.n; });
  var sumN = played.reduce(function (a, x) { return a + x.n; }, 0), sumOk = played.reduce(function (a, x) { return a + x.ok; }, 0);
  if (sumN) lines.push('Bei den Beiträgen der Gäste ' + (r.who.length > 1 ? 'lagen ' : 'lag ') + F + ' ' + sumOk + ' von ' + sumN + ' Mal richtig.');
  var best = played.filter(function (x) { return x.n >= 2; }).sort(function (a, b) { return b.ok / b.n - a.ok / a.n || b.n - a.n || tieCmp(a.g, b.g); });
  if (best.length >= 2 && best[0].ok / best[0].n > best[best.length - 1].ok / best[best.length - 1].n) {
    var hi = best[0], lo = best[best.length - 1];
    lines.push('Bei ' + hi.g.name + ' klappte es am besten (' + hi.ok + ' von ' + hi.n + '), bei ' + lo.g.name + ' am wenigsten (' + lo.ok + ' von ' + lo.n + ').');
  }
  return lines;
}
function abspannHtml(r) {
  if (!r) return '';
  if (!roleGuests(r).length) return duelAbspannHtml(r);
  var st = roleState(r), lines = abspannLines(r);
  var reader = st.who.millionen || st.who.urgestein || '';
  var ids = ROLE_ORDER.filter(function (id) { return st.who[id]; });
  return '<span class="eyebrow mt22 block">Der Abend in Zahlen</span>' +
    '<div class="ansage mt10"><div class="row" style="justify-content:space-between;gap:10px"><span class="ansage-l">' + icon('i-bubble', 14) + (reader ? 'Vorlesen: ' + esc(reader) : 'Zum Vorlesen') + '</span><button type="button" class="ansage-play" data-act="speak" aria-label="Vorlesen lassen">' + icon('i-play', 14) + 'Vorlesen</button></div><p class="ansage-t" style="font-size:16px">' + lines.map(esc).join(' ') + '</p></div>' +
    (ids.length ? '<span class="eyebrow mt22 block">Die Rollen des Abends</span><div class="stack gap10 mt10">' + ids.map(function (id) { return roleCardHtml(r, id, st.who[id], '', false); }).join('') + '</div><p class="small mt8">Zum Abfotografieren. Beim nächsten Fest gibt es neue Rollen.</p>' : '') +
    duelAbspannHtml(r);
}

/* ---------- role emblems: small drawn badges instead of emojis ---------- */
var EMB_INK = '#1B1530';
var ROLE_ART = {
  urgestein: '<path d="M14 40c-2-10-1-22 4-28 4-5 12-6 16-2 5 5 6 18 4 30z" fill="#B9B4CC" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 22h5M28 22h5" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><path d="M23 24v7h4" fill="none" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 35h10" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><path d="M15 15c3-4 7-4 9-2" fill="none" stroke="#48D9A6" stroke-width="3" stroke-linecap="round"/>',
  hellseher: '<path d="M14 40h20l-3-5H17z" fill="#C2552B" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="21" r="13" fill="#9886FF" stroke="#1B1530" stroke-width="2.5"/><path d="M17 17a8 8 0 0 1 6-5" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><path d="M28 22l1.5-4 1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5z" fill="#FFC940"/>',
  millionen: '<rect x="17" y="6" width="14" height="20" rx="7" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5"/><path d="M17 13h14M17 19h14" stroke="#1B1530" stroke-width="1.6"/><path d="M12 21a12 12 0 0 0 24 0" fill="none" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><path d="M24 33v7M18 41h12" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="26" r="2" fill="#FFC940"/>',
  messer: '<rect x="8" y="22" width="30" height="13" rx="6.5" fill="#FF7A45" stroke="#1B1530" stroke-width="2.5"/><path d="M21 25.5v6M18 28.5h6" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M32 22L42 9l-2 13z" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M12 22l-2-8 5 8" fill="#F4F1FF" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/>',
  frischling: '<path d="M24 6c8 0 14 12 14 21a14 14 0 0 1-28 0C10 18 16 6 24 6z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5"/><path d="M11 24l5 3 4-4 4 4 4-4 4 4 5-3" fill="none" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><circle cx="20" cy="16" r="1.8" fill="#1B1530"/><circle cx="28" cy="16" r="1.8" fill="#1B1530"/><path d="M22 20l2 2.5 2-2.5z" fill="#FF7A45"/>',
  plauder: '<path d="M6 10h22a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H16l-6 5v-5H6a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><path d="M22 20h20a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-3v5l-6-5H22a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4z" fill="#48D9A6" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="27" cy="28.5" r="1.8" fill="#1B1530"/><circle cx="32" cy="28.5" r="1.8" fill="#1B1530"/><circle cx="37" cy="28.5" r="1.8" fill="#1B1530"/>',
  luegen: '<circle cx="20" cy="24" r="13" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.5"/><path d="M30 24h13a3 3 0 0 1 0 6H31" fill="#E0A77A" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="21" cy="19" r="1.8" fill="#1B1530"/><path d="M14 30c3 2 6 2 9 0" fill="none" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round"/><path d="M10 13c3-5 12-6 17-2" fill="none" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round"/>',
  naechster: '<rect x="8" y="20" width="32" height="20" rx="3" fill="#FFC940" stroke="#1B1530" stroke-width="2.5"/><rect x="6" y="14" width="36" height="8" rx="3" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.5"/><path d="M24 14v26" stroke="#1B1530" stroke-width="2.5"/><path d="M24 14c-3-6-10-7-10-2s7 3 10 2zM24 14c3-6 10-7 10-2s-7 3-10 2z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/>',
  unbekannt: '<circle cx="20" cy="20" r="12" fill="#5B8CFF" stroke="#1B1530" stroke-width="2.5"/><path d="M29 29l11 11" stroke="#1B1530" stroke-width="4.5" stroke-linecap="round"/><path d="M16.5 16.5a3.5 3.5 0 1 1 5 3.2c-1.3.6-1.5 1.3-1.5 2.6" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="26" r="1.6" fill="#fff"/>',
  seele: '<path d="M17 38S5 30 5 20a7 7 0 0 1 12-5 7 7 0 0 1 12 5c0 10-12 18-12 18z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><path d="M31 40s-11-7-11-16a6.5 6.5 0 0 1 11-4.5 6.5 6.5 0 0 1 11 4.5c0 9-11 16-11 16z" fill="#FF7A45" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/>',
  quaelgeist: '<path d="M12 16L9 5l9 7M36 16l3-11-9 7" fill="#FF7A45" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="26" r="14" fill="#FF7A45" stroke="#1B1530" stroke-width="2.5"/><path d="M16 21l5 2M32 21l-5 2" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round"/><path d="M17 30c4 4 10 4 14 0" fill="#fff" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/>'
};
function roleIcon(id, size) { size = size || 32; return '<svg class="emb" width="' + size + '" height="' + size + '" viewBox="0 0 48 48" aria-hidden="true">' + (ROLE_ART[id] || '') + '</svg>'; }
/* ---------- more drawn emblems for the guest form, the pass and the home screen ---------- */
var EMB_ART = {
  idcard: '<rect x="5" y="11" width="38" height="27" rx="4" fill="#48D9A6" stroke="#1B1530" stroke-width="2.5"/><rect x="10" y="17" width="11" height="14" rx="2" fill="#FFFFFF" stroke="#1B1530" stroke-width="2"/><circle cx="15.5" cy="22" r="2.6" fill="#1B1530"/><path d="M11.5 30c1-3 7-3 8 0z" fill="#1B1530"/><path d="M25 19h13M25 24h10M25 29h12" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round"/>',
  mask: '<g transform="rotate(-8 24 24)"><rect x="11" y="6" width="26" height="36" rx="4" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><path d="M16 21c2.5-3 5.5-3 8 0 2.5-3 5.5-3 8 0-1 4.5-4.5 7-8 7s-7-2.5-8-7z" fill="#FF7A45" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/><circle cx="20.5" cy="22.5" r="1.4" fill="#1B1530"/><circle cx="27.5" cy="22.5" r="1.4" fill="#1B1530"/><path d="M15 11h4M29 37h4" stroke="#FF7A45" stroke-width="2.6" stroke-linecap="round"/></g>',
  letter: '<rect x="5" y="12" width="38" height="26" rx="3.5" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.5"/><path d="M6 14l18 13 18-13" fill="none" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 35s-6-3.6-6-7.6a3.3 3.3 0 0 1 6-1.9 3.3 3.3 0 0 1 6 1.9c0 4-6 7.6-6 7.6z" fill="#FF5A2E" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/>',
  watch: '<circle cx="24" cy="27" r="15" fill="#FFC940" stroke="#1B1530" stroke-width="2.5"/><rect x="20" y="5" width="8" height="5" rx="1.5" fill="#1B1530"/><path d="M24 10v2M35 15l2.5-2.5" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="27" r="10" fill="#FFFFFF" stroke="#1B1530" stroke-width="2"/><path d="M24 27l5-6" stroke="#FF5A2E" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="27" r="2" fill="#1B1530"/>',
  jar: '<path d="M14 14h20v4c3 2 5 5 5 9v8a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5v-8c0-4 2-7 5-9z" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><rect x="12" y="8" width="24" height="6" rx="2" fill="#9886FF" stroke="#1B1530" stroke-width="2.5"/><circle cx="18" cy="31" r="3.2" fill="#FF7A45" stroke="#1B1530" stroke-width="1.6"/><circle cx="25" cy="34" r="3.2" fill="#48D9A6" stroke="#1B1530" stroke-width="1.6"/><circle cx="31" cy="28" r="3.2" fill="#FFC940" stroke="#1B1530" stroke-width="1.6"/><circle cx="23" cy="26" r="3.2" fill="#FF8FC4" stroke="#1B1530" stroke-width="1.6"/><circle cx="31" cy="35.5" r="2.6" fill="#5B8CFF" stroke="#1B1530" stroke-width="1.6"/>',
  target: '<circle cx="22" cy="26" r="16" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><circle cx="22" cy="26" r="10.5" fill="#FF9A73" stroke="#1B1530" stroke-width="2.2"/><circle cx="22" cy="26" r="5" fill="#FFFFFF" stroke="#1B1530" stroke-width="2"/><path d="M22 26L39 9" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/><path d="M35 6l7-1-1 7-5 1z" fill="#48D9A6" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/>',
  ruler: '<rect x="4" y="14" width="40" height="14" rx="3" fill="#7FA8FF" stroke="#1B1530" stroke-width="2.5"/><path d="M10 14v5M16 14v3M22 14v5M28 14v3M34 14v5M40 14v3" stroke="#1B1530" stroke-width="2" stroke-linecap="round"/><path d="M28 32l-6 9h12z" fill="#FFC940" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/>',
  flame: '<path d="M24 4c2 7 11 11 11 22a11 11 0 0 1-22 0c0-6 3-9 5-12 1 4 3 5 4 5-1-6 0-10 2-15z" fill="#FF7A45" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 26c2 3 5 5 5 9a5 5 0 0 1-10 0c0-3 3-5 5-9z" fill="#FFC940" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/>',
  fence: '<circle cx="24" cy="15" r="10" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.5"/><circle cx="20.5" cy="14" r="2" fill="#1B1530"/><circle cx="27.5" cy="14" r="2" fill="#1B1530"/><path d="M6 24l3-4 3 4v19H6zM17 24l3-4 3 4v19h-6zM28 24l3-4 3 4v19h-6zM39 24l3-4 3 4v19h-6z" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M4 30h42M4 38h42" stroke="#1B1530" stroke-width="2.2"/>',
  balloon: '<path d="M24 32c-8 0-13-7-13-14a13 13 0 0 1 26 0c0 7-5 14-13 14z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.5"/><path d="M21.5 32l2.5 3 2.5-3z" fill="#1B1530"/><path d="M24 35c-3 4 3 6 0 10" fill="none" stroke="#1B1530" stroke-width="2" stroke-linecap="round"/><path d="M17 13a7 7 0 0 1 5-4" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>',
  popper: '<path d="M6 42l8-22 14 14z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M10 33l5 5M12 26l10 10" stroke="#FF7A45" stroke-width="2.6"/><path d="M26 16c3-3 4-7 2-10M32 21c4-1 7 0 9 3M30 12l3-4" fill="none" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round"/><circle cx="38" cy="10" r="2.6" fill="#48D9A6" stroke="#1B1530" stroke-width="1.6"/><rect x="34" y="28" width="5" height="5" rx="1" transform="rotate(20 36 30)" fill="#9886FF" stroke="#1B1530" stroke-width="1.6"/><circle cx="20" cy="9" r="2.2" fill="#FF8FC4" stroke="#1B1530" stroke-width="1.6"/>',
  crown: '<path d="M7 36L5 14l11 9 8-13 8 13 11-9-2 22z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><rect x="7" y="35" width="34" height="6" rx="2" fill="#FF7A45" stroke="#1B1530" stroke-width="2.5"/><circle cx="24" cy="28" r="3" fill="#FF8FC4" stroke="#1B1530" stroke-width="1.8"/><circle cx="14" cy="30" r="2.2" fill="#48D9A6" stroke="#1B1530" stroke-width="1.6"/><circle cx="34" cy="30" r="2.2" fill="#5B8CFF" stroke="#1B1530" stroke-width="1.6"/>',
  trophy: '<path d="M14 6h20v12a10 10 0 0 1-20 0z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 10H8c0 6 3 9 7 10M34 10h6c0 6-3 9-7 10" fill="none" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><path d="M21 28h6v6h-6z" fill="#FFC940" stroke="#1B1530" stroke-width="2.2"/><rect x="14" y="34" width="20" height="8" rx="2" fill="#1B1530"/><path d="M24 10l1.6 3.4 3.6.4-2.7 2.4.8 3.6L24 18l-3.3 1.8.8-3.6-2.7-2.4 3.6-.4z" fill="#FFFFFF"/>',
  palette: '<path d="M24 6C13 6 5 13 5 23c0 9 7 15 14 15 3 0 3-3 2-5s0-4 3-4h6c7 0 13-4 13-11C43 11 35 6 24 6z" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="14" cy="21" r="3.2" fill="#FF7A45" stroke="#1B1530" stroke-width="1.6"/><circle cx="20" cy="13" r="3.2" fill="#FFC940" stroke="#1B1530" stroke-width="1.6"/><circle cx="29" cy="12" r="3.2" fill="#48D9A6" stroke="#1B1530" stroke-width="1.6"/><circle cx="36" cy="18" r="3.2" fill="#9886FF" stroke="#1B1530" stroke-width="1.6"/>',
  diamond: '<path d="M14 8h20l8 11-18 23L6 19z" fill="#8FE3FF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M6 19h36M14 8l5 11 5 23 5-23 5-11M19 19l5-11 5 11" fill="none" stroke="#1B1530" stroke-width="1.8" stroke-linejoin="round"/>',
  agent: '<path d="M5 22c5 3 33 3 38 0" fill="none" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/><path d="M12 21c0-7 3-13 6-13 2 0 4 2 6 2s4-2 6-2c3 0 6 6 6 13z" fill="#5A5480" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M12.5 17c8 2 15 2 23 0" stroke="#FF7A45" stroke-width="3"/><rect x="10" y="27" width="12" height="9" rx="3.5" fill="#1B1530"/><rect x="26" y="27" width="12" height="9" rx="3.5" fill="#1B1530"/><path d="M22 30h4" stroke="#1B1530" stroke-width="2.4"/><path d="M13 29.5l3-1" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round"/>',
  bunny: '<path d="M18 20c-3-6-4-14-1-15s6 7 6 13M30 20c3-6 4-14 1-15s-6 7-6 13" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><path d="M17.5 9c0 3 1 7 2 9M30.5 9c0 3-1 7-2 9" stroke="#FF8FC4" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="30" r="12" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><circle cx="20" cy="28" r="1.8" fill="#1B1530"/><circle cx="28" cy="28" r="1.8" fill="#1B1530"/><path d="M22.4 32h3.2L24 34z" fill="#FF8FC4" stroke="#1B1530" stroke-width="1.2" stroke-linejoin="round"/><path d="M21 37c1.5 1 4.5 1 6 0" fill="none" stroke="#1B1530" stroke-width="1.6" stroke-linecap="round"/>',
  cheers: '<g transform="rotate(-13 15 24)"><path d="M6 6h18l-2 15a7 7 0 0 1-14 0z" fill="#FFC940" stroke="#1B1530" stroke-width="2.6" stroke-linejoin="round"/><path d="M8.5 12h13" stroke="#FFFFFF" stroke-width="2.6"/><path d="M15 28v10M9 40h12" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/></g><g transform="rotate(13 33 24)"><path d="M24 6h18l-2 15a7 7 0 0 1-14 0z" fill="#FFC940" stroke="#1B1530" stroke-width="2.6" stroke-linejoin="round"/><path d="M26.5 12h13" stroke="#FFFFFF" stroke-width="2.6"/><path d="M33 28v10M27 40h12" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/></g>',
  book: '<path d="M24 12c-5-4-12-4-18-2v28c6-2 13-2 18 2 5-4 12-4 18-2V10c-6-2-13-2-18 2z" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 12v28" stroke="#1B1530" stroke-width="2.2"/><path d="M10 17c3-1 7-1 10 0M10 23c3-1 7-1 10 0M10 29c3-1 7-1 10 0M28 17c3-1 7-1 10 0M28 23c3-1 7-1 10 0" stroke="#9886FF" stroke-width="2" stroke-linecap="round"/>',
  lock: '<path d="M15 21v-6a9 9 0 0 1 18 0v6" fill="none" stroke="#1B1530" stroke-width="3.2"/><rect x="9" y="20" width="30" height="22" rx="5" fill="#FFC940" stroke="#1B1530" stroke-width="2.5"/><circle cx="24" cy="29" r="3" fill="#1B1530"/><path d="M24 31v5" stroke="#1B1530" stroke-width="3" stroke-linecap="round"/>',
  pen: '<path d="M10 38l3-9L32 10l6 6-19 19z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 14l6 6" stroke="#1B1530" stroke-width="2.2"/><path d="M10 38l3-9 6 6z" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M8 43h16" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round"/>',
  bulb: '<path d="M24 5a13 13 0 0 0-8 23c2 2 3 4 3 6h10c0-2 1-4 3-6a13 13 0 0 0-8-23z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 38h10M20.5 42.5h7" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><path d="M18 17a7 7 0 0 1 5-5" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>',
  chain: '<path d="M21 13l3-3a8 8 0 0 1 11.3 11.3l-3 3" fill="none" stroke="#1B1530" stroke-width="8" stroke-linecap="round"/><path d="M21 13l3-3a8 8 0 0 1 11.3 11.3l-3 3" fill="none" stroke="#48D9A6" stroke-width="4" stroke-linecap="round"/><path d="M27 35l-3 3a8 8 0 0 1-11.3-11.3l3-3" fill="none" stroke="#1B1530" stroke-width="8" stroke-linecap="round"/><path d="M27 35l-3 3a8 8 0 0 1-11.3-11.3l3-3" fill="none" stroke="#FF7A45" stroke-width="4" stroke-linecap="round"/><path d="M19 29l10-10" stroke="#1B1530" stroke-width="3.4" stroke-linecap="round"/>',
  vote: '<path d="M17 27V7h14v20" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M20 15l3 3 5-6" fill="none" stroke="#48D9A6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="8" y="22" width="32" height="20" rx="3" fill="#9886FF" stroke="#1B1530" stroke-width="2.5"/><path d="M15 27h18" stroke="#1B1530" stroke-width="3" stroke-linecap="round"/>',
  dice: '<g transform="rotate(-10 24 24)"><rect x="8" y="8" width="32" height="32" rx="8" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><circle cx="17" cy="17" r="3" fill="#1B1530"/><circle cx="31" cy="17" r="3" fill="#1B1530"/><circle cx="24" cy="24" r="3" fill="#FF7A45"/><circle cx="17" cy="31" r="3" fill="#1B1530"/><circle cx="31" cy="31" r="3" fill="#1B1530"/></g>',
  shield: '<path d="M24 5l16 6v11c0 10-7 17-16 21C15 39 8 32 8 22V11z" fill="#5B8CFF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M17 23l5 5 9-10" fill="none" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>',
  loop: '<path d="M24 24c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8z" fill="none" stroke="#1B1530" stroke-width="8" stroke-linejoin="round"/><path d="M24 24c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8z" fill="none" stroke="#FF8FC4" stroke-width="4" stroke-linejoin="round"/>',
  tags: '<g transform="rotate(-8 20 17)"><path d="M6 9h22l6 7-6 7H6a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3z" fill="#8FE3FF" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="27" cy="16" r="2" fill="#1B1530"/><path d="M8.5 14h12M8.5 18h8" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round"/></g><g transform="rotate(7 28 32)"><path d="M13 25h22l6 7-6 7H13a3 3 0 0 1-3-3v-8a3 3 0 0 1 3-3z" fill="#FFC940" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="34" cy="32" r="2" fill="#1B1530"/><path d="M15.5 30h12M15.5 34h7" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round"/></g>',
  wand: '<path d="M8 41L30 19" stroke="#1B1530" stroke-width="7" stroke-linecap="round"/><path d="M8 41L30 19" stroke="#9886FF" stroke-width="3.4" stroke-linecap="round"/><path d="M26.5 22.5L30 19" stroke="#FFFFFF" stroke-width="3.4" stroke-linecap="round"/><path d="M35 4l2.2 5.3 5.3 2.2-5.3 2.2L35 19l-2.2-5.3-5.3-2.2 5.3-2.2z" fill="#FFC940" stroke="#1B1530" stroke-width="1.9" stroke-linejoin="round"/><path d="M14 8l1.4 3.2 3.2 1.4-3.2 1.4L14 17.2l-1.4-3.2-3.2-1.4 3.2-1.4z" fill="#FF8FC4" stroke="#1B1530" stroke-width="1.6" stroke-linejoin="round"/><path d="M40 26l1.1 2.5 2.5 1.1-2.5 1.1L40 33.3l-1.1-2.6-2.5-1.1 2.5-1.1z" fill="#48D9A6" stroke="#1B1530" stroke-width="1.5" stroke-linejoin="round"/>',
  cake: '<path d="M8 24h32v15a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 31c3 3 5 3 8 0s5 3 8 0 5 3 8 0 5 3 8 0" fill="none" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/><path d="M17 24v-8M24 24v-8M31 24v-8" stroke="#1B1530" stroke-width="3" stroke-linecap="round"/><path d="M17 12.5c-1.8-1.6-.7-3.8 0-5.5.7 1.7 1.8 3.9 0 5.5zM24 12.5c-1.8-1.6-.7-3.8 0-5.5.7 1.7 1.8 3.9 0 5.5zM31 12.5c-1.8-1.6-.7-3.8 0-5.5.7 1.7 1.8 3.9 0 5.5z" fill="#FFC940" stroke="#1B1530" stroke-width="1.4" stroke-linejoin="round"/>',
  garland: '<path d="M1 12Q24 26 47 12" fill="none" stroke="#F4F1FF" stroke-width="2.2" stroke-linecap="round"/><g transform="translate(6 13.5) scale(.42)"><use href="#sk" fill="#FF7A45" stroke="#1B1530" stroke-width="4.5"/></g><g transform="translate(18.5 17) scale(.42)"><use href="#sk" fill="#FFFFFF" stroke="#1B1530" stroke-width="4.5"/></g><g transform="translate(31 13.5) scale(.42)"><use href="#sk" fill="#48D9A6" stroke="#1B1530" stroke-width="4.5"/></g>'
};
function emb(id, size) { size = size || 28; return '<svg class="emb" width="' + size + '" height="' + size + '" viewBox="0 0 48 48" aria-hidden="true">' + (EMB_ART[id] || ROLE_ART[id] || '') + '</svg>'; }

