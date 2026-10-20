/* =========================================================
   Step cards (shared by the run and standalone games)
   ========================================================= */
function curStep() { return UI.screen === 'free' || UI.liveFrom === 'free' && UI.screen === 'live' ? (S.free && S.free.step) : (R() && R().pending); }
function stepIsFree() { return UI.screen === 'free' || (UI.screen === 'live' && UI.liveFrom === 'free'); }
function stepFocusIds() {
  if (!stepIsFree() && R()) return R().who.slice();
  return E().focus.map(function (p) { return p.id; });
}
function gameOf(P) { return GAMES.filter(function (g) { return g.id === P.game; })[0]; }
function questionOf(P) {
  if (P.kind === 'frage') { var gq = S.questions.filter(function (q) { return q.id === P.qid; })[0]; return gq ? playableOf(P, gq) : null; }
  if (P.kind === 'schaetzen') { var e = ESTIMATES[P.idx]; return { type: 'schaetzen', text: e.text, answer: e.answer, unit: e.unit, author: '' }; }
  if (P.kind === 'gast') return P.mode === 'auswahl' ? { type: 'auswahl', text: P.text, options: P.opts, correct: P.correct, author: '' } : P.mode === 'schaetzen' ? { type: 'schaetzen', text: P.text, answer: P.answer, unit: P.unit, tol: P.tol, author: '' } : null;
  if (P.kind === 'quiz') { var m = QUIZ_MC[P.idx]; return { type: 'auswahl', text: m.text, options: m.options, correct: m.correct, author: '' }; }
  return null;
}
function bigCard(bg, badge, title, extra) {
  return '<div class="bigcard stack gap10" style="background:' + bg + '"><svg aria-hidden="true" width="120" height="120" viewBox="0 0 40 56" style="position:absolute;right:-26px;top:-14px;opacity:.13;transform:rotate(18deg)"><use href="#sk" fill="#15122B"></use></svg><span class="badge">' + badge + '</span><h2>' + title + '</h2>' + (extra || '') + '</div><!--bc-->';
}
function vsRow(a, b) {
  return '<div class="mt18 vsrow"><div class="stack" style="align-items:center;gap:6px">' + a + '</div><div class="stack" style="align-items:center;gap:6px">' + b + '</div><span class="vs" aria-hidden="true">VS</span></div>';
}
function who(pid, size, mood) { var p = person(pid); return face(p, size, '', mood) + '<span class="name">' + esc(p.name) + '</span>'; }
function groupWho(size, label) { return groupFace(size) + '<span class="name">' + esc(label || 'Die Gruppe') + '</span>'; }
function linkBtn() {
  var on = stepIsFree() || (R() && R().link);
  return on ? '<button type="button" class="chip-btn sm mt10" data-act="liveOpen">' + icon('i-link', 14) + 'Gruppe per Link fragen</button>' : '';
}
function liveSummary(P) {
  if (P.groupFrom) return '<p class="small mt6" style="color:var(--mint)">' + esc(P.groupFrom) + '</p>';
  return '';
}
function stepChip(P) {
  var free = stepIsFree(), main = person(P.main || (P.ids && P.ids[0]) || '');
  if (free) return 'Freies Spiel';
  var r = R();
  if (P.kind === 'toast') return 'Anstoßen';
  if (P.kind === 'acc') return 'Zubehör';
  if (P.kind === 'check') return 'Status-Check';
  if (P.kind === 'roll') return 'Würfeln für ' + main.name;
  if (P.kind === 'handicap') return 'Handicap-Station';
  if (P.kind === 'crew') return 'Truppen-Auftrag';
  if (roleChip(P)) return roleChip(P);
  if (P.last) return 'Das letzte Spiel';
  if (isTimed(r)) return 'Einlage für ' + main.name;
  var tr = trackById(P.track) || currentTrack();
  return unitOf(tr).unit + ' ' + (P.unitNo || '') + ' für ' + main.name;
}
function mainSwitch(P) {
  if (!stepIsFree() || P.result) return '';
  var f = E().focus;
  if (f.length < 2 || ['wwe', 'partner', 'gast', 'menge'].indexOf(P.kind) >= 0) return '';
  return '<div class="chips mt14" role="group" aria-label="Wer spielt">' + f.map(function (p) { var s = P.main === p.id; return '<button type="button" class="person-chip' + (s ? ' is-sel' : '') + '" data-act="freeMain" data-v="' + p.id + '" aria-pressed="' + s + '">' + face(p, 26) + esc(p.name) + '</button>'; }).join('') + '</div>';
}
/* who is on the result card, and how they look: winners cheer, losers pull a face */
function resultCast(P, res) {
  var k = P.kind, f = P.format, ids = [], guest = null, gMood = '';
  var rows = res.rows || [];
  if (k === 'spiel') ids = f === 'team' ? (P.team || [P.main]).slice() : f === 'duell' ? [P.main, P.opp] : [P.main];
  else if (k === 'menge') ids = (P.team || [P.main]).slice();
  else if (k === 'toast') ids = (P.ids || []).slice();
  else if (k === 'partner') ids = (P.teams || []).map(function (t) { return t.back; });
  else if (k === 'wwe') { var lo = rows.filter(function (r) { return r.pid && isFocus(r.pid); })[0]; ids = lo ? [lo.pid] : []; }
  else if (k === 'hellseher') { guest = P.name; gMood = res.tone === 'sun' ? 'jubel' : 'mist'; }
  else if (k === 'crew') { guest = P.name; gMood = res.tone === 'ok' ? 'jubel' : 'mist'; }
  else if (P.main) ids = [P.main];
  var seen = {};
  ids = ids.filter(function (id) { if (!id || seen[id] || !isFocus(id)) return false; seen[id] = true; return true; });
  var win = P.winIds || [], decided = win.length > 0;
  var cast = ids.map(function (id) {
    var m = win.indexOf(id) >= 0 ? 'jubel' : decided ? 'mist' : k === 'wwe' ? 'staunen' : res.tone === 'fail' ? 'mist' : res.tone === 'ok' || res.tone === 'sun' ? 'jubel' : '';
    return { id: id, mood: m, crown: decided && win.indexOf(id) >= 0 };
  });
  if (k === 'spiel' && (f === 'duellGast' || f === 'gruppe') && P.ch) { guest = chGuestLabel(P); gMood = res.tone === 'fail' ? 'jubel' : 'mist'; }
  if (guest) cast.push({ guest: guest, mood: gMood, crown: gMood === 'jubel' && cast.length > 0 });
  /* a crown only makes sense when someone else on the card lost */
  var mixed = cast.some(function (c) { return c.crown; }) && cast.some(function (c) { return !c.crown; });
  cast.forEach(function (c) { if (!mixed) c.crown = false; });
  return cast;
}
function resultHero(P, res, fresh) {
  var cast = resultCast(P, res), n = cast.length;
  var party = (res.tone === 'ok' || res.tone === 'sun') && P.kind !== 'wwe';
  var bg = res.tone === 'info' ? 'var(--violet)' : toneBg(res.tone);
  var fills = res.tone === 'ok' ? ['#15122B', '#FFFFFF', '#FF7A45', '#9886FF', '#FFC940', '#15122B'] : ['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FF7A45', '#15122B'];
  var size = n <= 1 ? 96 : n === 2 ? 84 : 68;
  var faces = cast.map(function (c, i) {
    var st = 'border:5px solid var(--ink);box-sizing:border-box';
    var f = c.guest ? guestFace(c.guest, size, st, c.mood) : face(person(c.id), size, st, c.mood);
    return '<span class="rh-f' + (fresh ? ' pop' : '') + '" style="--i:' + i + '">' + (c.crown && n > 1 ? '<span class="rh-crown">' + emb('crown', 34) + '</span>' : '') + f + '</span>';
  }).join('');
  var cls = 'bigcard rhero' + (party ? ' party' : '') + (cast.some(function (c) { return c.crown; }) && n > 1 ? ' crowned' : '') + (fresh && res.tone === 'fail' ? ' shake' : '');
  return '<div class="' + cls + '" style="background:' + bg + '">' +
    (party ? garland(350, fills) : '<svg aria-hidden="true" width="120" height="120" viewBox="0 0 40 56" style="position:absolute;right:-26px;top:-14px;opacity:.13;transform:rotate(18deg)"><use href="#sk" fill="#15122B"></use></svg>') +
    (faces ? '<div class="rh-faces">' + faces + '</div>' : '') +
    '<span class="badge">Ergebnis</span><h2>' + esc(res.title) + '</h2>' + (res.text ? '<p>' + esc(res.text) + '</p>' : '') + '</div>';
}
function resultView(P) {
  var res = P.result, jkFree = jokerFree().length, jkFx = UI.jkFx;
  UI.jkFx = null;
  var rows = (res.rows || []).map(function (r, i) {
    var left = r.stake ? guestFace(r.name, 34) : r.group ? groupFace(34) : (r.pid ? face(person(r.pid), 34) : groupFace(34));
    var many = r.group && (/ & /.test(r.name) || /^Alle\b/.test(r.name));
    var txt = r.freed ? esc(r.name) + ' ist befreit!<span class="sub block" style="color:var(--sun)">' + esc(r.note) + '</span>' : r.stake ? esc(r.name) + ' löst den Wetteinsatz ein: <span style="color:var(--sun)">' + esc(r.note) + '</span>' : r.water ? esc(r.name) + ': ' + esc(r.note) : esc(r.name) + (many ? ' trinken je ' : ' trinkt ') + r.n + ' ' + esc(U()) + (r.note ? ' <span class="sub">' + esc(r.note) + '</span>' : '');
    if (r.freed) left = '<span class="jk-face">' + left + '<i>' + emb('joker', 20) + '</i></span>';
    if (r.alt) txt += '<span class="sub block" style="color:var(--sun)">' + esc(r.alt) + '</span>';
    if (r.pilot) txt += '<span class="sub block" style="color:var(--violet-text)">' + esc(r.pilot) + '</span>';
    var ctrl = '';
    if (!r.group && !r.water && r.pid && r.n > 0) {
      ctrl = (jokersLeft(r.pid) > 0 && isFocus(r.pid) ? '<button type="button" class="tag plain" data-act="stepJoker" data-i="' + i + '" style="height:32px;color:var(--mint)">' + icon('i-drop', 14) + 'Joker</button>' : '') +
        '<button type="button" class="checkbox' + (r.done ? ' is-sel' : '') + '" data-act="drinkToggle" data-i="' + i + '" aria-pressed="' + !!r.done + '" aria-label="' + esc(r.name) + ' hat getrunken">' + (r.done ? icon('i-check', 14) : '') + '</button>';
    }
    return '<div class="res' + (r.freed && jkFx === r.pid ? ' jk-pop' : '') + '">' + left + '<span class="grow" style="font-size:14px;font-weight:700;line-height:1.35">' + txt + '</span>' + ctrl + '</div>';
  }).join('');
  var move = res.move ? '<div class="card pad mt10 row"><span class="tile-ic" style="width:32px;height:32px;border-radius:10px;background:' + (res.move.kind === 'zurueck' ? 'var(--orange)' : 'var(--mint)') + '">' + icon(res.move.kind === 'zurueck' ? 'i-undo' : 'i-arrow', 16) + '</span><span class="grow small" style="color:var(--text)"><b>' + esc(res.moveText) + '</b>' + (res.move.why ? '<br>' + esc(res.move.why) : '') + '</span></div>' : '';
  /* one celebration (or one shake) per result, not on every re-render */
  var fresh = res.stamp && UI.fxDone !== res.stamp, fx = '';
  if (fresh) UI.fxDone = res.stamp;
  if (fresh && (res.tone === 'ok' || res.tone === 'sun')) {
    var cols = ['#FF7A45', '#48D9A6', '#9886FF', '#FFC940', '#FFFFFF', '#15122B'];
    for (var k = 0; k < 18; k++) fx += '<i style="left:' + (8 + Math.random() * 84).toFixed(0) + '%;background:' + cols[k % cols.length] + ';--dx:' + (Math.random() * 120 - 60).toFixed(0) + 'px;--rot:' + (Math.random() * 720 - 360).toFixed(0) + 'deg;animation-delay:' + (Math.random() * 0.25).toFixed(2) + 's"></i>';
    fx = '<div class="fx" aria-hidden="true">' + fx + '</div>';
  }
  var card = resultHero(P, res, fresh);
  var lines = (res.lines || []).map(function (l) {
    var ic = l.ok === true ? '<span class="tile-ic" style="width:26px;height:26px;border-radius:9px;background:var(--mint)">' + icon('i-check', 14) + '</span>' : l.ok === false ? '<span class="tile-ic" style="width:26px;height:26px;border-radius:9px;background:var(--orange)">' + icon('i-close', 14) + '</span>' : '';
    return '<div class="res" style="min-height:44px">' + ic + '<span class="grow" style="font-size:14px;font-weight:700;line-height:1.35">' + esc(l.t) + '</span></div>';
  }).join('');
  return '<div style="position:relative">' + fx + card + '</div>' +
    (rows ? '<div class="card padrows mt14">' + rows + '</div>' + jokerAskHtml(P) + ((res.rows || []).some(function (r) { return !r.group && !r.water && r.pid && r.n > 0; }) ? '<p class="res-hint"><span class="checkbox is-sel" aria-hidden="true">' + icon('i-check', 11) + '</span>Haken = getrunken, das landet im Zähler. Gäste zählen nicht.</p>' : '') : '') + move +
    revancheHtml(P) + hcReleaseHtml(P) +
    (lines ? '<span class="eyebrow mt18 block">Auflösung</span><div class="card padrows mt10">' + lines + '</div>' : '');
}
function durOf(text) {
  var m = /(\d+)\s*Sekunden/.exec(text || ''); if (m) return +m[1];
  m = /(\d+)\s*Minuten?/.exec(text || ''); return m ? +m[1] * 60 : 0;
}
function timerBlock(secs, key) {
  if (!secs) return '';
  var on = UI.timer && UI.timer.key === key, left = on ? Math.max(0, Math.ceil((UI.timer.end - Date.now()) / 1000)) : secs;
  var label = secs >= 60 && secs % 60 === 0 ? (secs / 60) + (secs === 60 ? ' Minute' : ' Minuten') : secs + ' Sekunden';
  var txt = !on ? 'Timer ' + label + ' starten' : left > 0 ? 'Noch ' + (left >= 60 ? Math.floor(left / 60) + ':' + ('0' + left % 60).slice(-2) : left + ' Sekunden') : 'Zeit ist um! Nochmal starten';
  return '<button type="button" class="btn-dark mt14" style="width:100%;' + (on && left === 0 ? 'background:var(--orange);color:var(--ink)' : '') + '" data-act="timerStart" data-s="' + secs + '" data-k="' + esc(key) + '"' + (on && left > 0 ? ' aria-live="polite"' : '') + '>' + icon('i-clock', 18) + txt + '</button>';
}
/* the game card explains itself: what to do, when it counts, what is needed. Read it out with one tap. */
function spielCard(P, g) {
  var fmt = P.format, main = P.main, mp = person(main);
  var tx = gameTx(g, fmt) || ['', ''], how = unitText(tx[0], main), win = unitText(tx[1], main);
  var bg = { solo: 'var(--violet)', duell: 'var(--sun)', duellGast: 'var(--sun)', team: 'var(--orange)', gruppe: 'var(--mint)' }[fmt] || 'var(--violet)';
  var gn = chGuest(P);
  var pickLine = fmt === 'duellGast' ? (gn ? esc(mp.name) + ' gegen ' + esc(accGuest(gn)) + '.' : esc(mp.name) + ' sucht sich einen Gegner aus der Menge aus.') : fmt === 'team' ? esc(focusNames(P.team)) + ' spielen zusammen.' : fmt === 'duell' ? esc(mp.name) + ' gegen ' + esc(person(P.opp).name) + '.' : '';
  var say = g.name + '. ' + (fmt === 'duellGast' ? (gn ? mp.name + ' gegen ' + accGuest(gn) + '. ' : mp.name + ' sucht sich einen Gegner aus der Menge aus. ') : '') + how + ' ' + win;
  return bigCard(bg, (P.last ? 'Letztes Spiel · ' : '') + (P.revanche ? 'Revanche · ' : '') + esc(FMT_LABEL[fmt] || '') + ' · ' + esc(g.cat), esc(g.name),
    (pickLine ? '<p class="g-pick">' + pickLine + '</p>' : '') +
    '<p class="g-how">' + esc(how) + '</p><p class="g-win">' + icon('i-flag', 15) + '<span>' + esc(win) + '</span></p>' +
    '<div class="row" style="position:relative;gap:8px;justify-content:space-between;flex-wrap:wrap">' + (g.mat ? '<span class="row" style="gap:6px;font-size:13px;font-weight:800">' + icon('i-box', 16) + esc(g.mat) + '</span>' : '<span class="row" style="gap:6px;font-size:13px;font-weight:800">' + icon('i-check', 16) + 'Ohne Material</span>') +
    '<button type="button" class="g-say" data-act="speak" data-t="' + esc(say) + '">' + icon('i-play', 13) + 'Vorlesen</button></div>');
}
function spielView(P) {
  var g = gameOf(P), fmt = P.format, main = P.main, mp = person(main);
  /* the challenge: only with a list of names there is a guest to pick first */
  if (P.ch && fmt === 'duellGast' && P.ch.phase === 'pick' && !P.result) return chView(P, g);
  /* games with their own little screen */
  if (g.sp && SPV[g.sp]) return SPV[g.sp](P, g);
  var tx = gameTx(g, fmt) || ['', ''];
  var timer = P.result ? '' : timerBlock(durOf(unitText(tx[0], main) + ' ' + unitText(tx[1], main)), P.game + fmt + main);
  var body = spielCard(P, g), foot = spielButtons(P);
  if (fmt === 'solo') body += '<div class="mt18 row" style="justify-content:center">' + face(mp, 84) + '</div>';
  else if (fmt === 'duell') body += vsRow(who(main, 76), who(P.opp, 76)) + '<span class="eyebrow mt18 block">Wer hat gewonnen?</span>';
  else if ((fmt === 'duellGast' || fmt === 'gruppe') && P.ch) {
    var G = chGuest(P);
    body += vsRow(who(main, 76), G ? guestFace(G, 76) + '<span class="name">' + esc(G) + '</span>' : groupWho(76, 'Aus der Menge')) +
      (P.ch.stake ? '<div class="stakeline mt14">' + emb('target', 26) + '<span class="grow"><small>Verliert ' + esc(G || 'der Gast') + ', ist fällig:</small>' + esc(P.ch.stake) + '</span>' + ((P.ch.stakes || []).length > 1 && !P.result ? '<button type="button" class="linkbtn" data-act="chStakeNext" aria-label="Anderer Einsatz">' + icon('i-shuffle', 15) + 'Anderer</button>' : '') + '</div>' : '') +
      (chCanPick() && !P.result ? '<button type="button" class="linkbtn mt8" style="align-self:flex-start" data-act="chBack">' + icon('i-back', 15) + (G ? 'Anderen Gegner wählen' : 'Gegner aus der Liste wählen') + '</button>' : '');
  } else if (fmt === 'duellGast' || fmt === 'gruppe') {
    body += vsRow(who(main, 76), groupWho(76, P.guestName || 'Herausforderer')) +
      '<label class="field mt14" for="guestName">Wen fordert ' + esc(mp.name) + ' heraus? (optional)<input id="guestName" class="input" type="text" placeholder="Name, nur für die Anzeige" data-bind="step.guestName" value="' + esc(P.guestName || '') + '"></label>';
  } else if (fmt === 'team') body += '<div class="mt18 row" style="justify-content:center;gap:10px">' + P.team.map(function (id) { return face(person(id), 72); }).join('') + '</div>';
  body += termBoxHtml(P) + timer;
  return { body: body, foot: foot };
}
/* the guests know their own answers: no live vote for Gästespiele */
function linkBtnFor(P) { return P.kind === 'gast' ? '' : linkBtn(); }
function ggCredit(P) { return '<span class="row" style="position:relative;gap:8px;font-size:13px;font-weight:800;align-items:flex-start">' + icon('i-users', 16) + '<span>' + (P.credit.length ? 'Gebaut aus den Beiträgen von ' + esc(joinNames(P.credit)) + (P.ai ? ', dazu Fragen maßgeschneidert per KI' : '') : P.ai ? 'Maßgeschneidert per KI aus den Worten der Gäste' : 'Fragen vom Spielleiter') + '</span></span>'; }
function ggCard(P) {
  return bigCard('var(--pink)', (P.big ? 'Große Runde · ' : 'Gäste-Runde · ') + esc(P.name), esc(P.text), (P.rule ? '<p style="position:relative;font-size:14px;font-weight:700;line-height:1.4">' + esc(P.rule) + '</p>' : '') + ggCredit(P));
}
function questionView(P) {
  var q = questionOf(P), main = P.main, mp = person(main), gg = P.kind === 'gast';
  var author = gg ? ggCredit(P) : q.author ? '<span class="row" style="position:relative;gap:8px;font-size:13px;font-weight:800">' + icon('i-bubble', 16) + (q.ai ? 'Maßgeschneidert per KI' : 'Frage von ' + esc(q.author)) + '</span>' : '';
  var badge = gg ? 'Gäste-Runde · ' + esc(P.name) : P.kind === 'frage' ? (q.tag ? 'Von den Gästen · ' + q.tag : 'Frage der Gäste · ' + qTypeLabel(q.type)) : P.kind === 'schaetzen' ? 'Schätzen gegen die Gruppe' : 'Quiz';
  var body = bigCard(gg ? 'var(--pink)' : P.kind === 'frage' ? 'var(--mint)' : P.kind === 'schaetzen' ? 'var(--violet)' : '#FF9A73', badge, esc(q.text), author);

  var foot = '';
  if (q.type === 'schaetzen') {
    body += '<div class="grid2 mt18"><label class="field" for="fa">Tipp von ' + esc(mp.name) + '<input id="fa" class="input" type="number" inputmode="decimal" data-bind="step.answerFocus" value="' + esc(P.answerFocus) + '" placeholder="' + esc(q.unit ? 'Zahl in ' + q.unit : 'Zahl') + '"></label>' +
      '<label class="field" for="ga">Tipp der Gruppe<input id="ga" class="input" type="number" inputmode="decimal" data-bind="step.group" value="' + esc(P.group) + '" placeholder="optional"></label></div>' + liveSummary(P) + linkBtnFor(P) +
      '<p class="small mt10">' + (q.unit ? 'Einheit: ' + esc(q.unit) + '. ' : '') + 'Mit Gruppentipp gewinnt, wer näher dran ist. Ohne Gruppe zählt ein Treffer ' + estTolText(q) + '.</p>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Auflösen</button>';
  } else if (q.type === 'bereich') {
    var mn = Number(q.min), mx = Number(q.max), v = P.answerFocus === '' ? Math.round((mn + mx) / 2) : Number(P.answerFocus);
    body += '<div class="card pad mt18"><div class="row" style="justify-content:space-between"><span class="name">Tipp von ' + esc(mp.name) + '</span><span class="num" id="frShow" style="font:800 20px var(--display);color:var(--white)">' + fmtNum(v) + ' ' + esc(q.unit || '') + '</span></div>' +
      '<label class="sr" for="fr">Tipp</label><input id="fr" class="range mt10" type="range" min="' + mn + '" max="' + mx + '" step="' + (mx - mn > 50 ? 1 : 0.5) + '" value="' + v + '" data-bind="step.answerFocusLive"><div class="row sub" style="justify-content:space-between"><span>' + fmtNum(mn) + '</span><span>' + fmtNum(mx) + '</span></div></div>' +
      '<label class="field mt10" for="ga2">Tipp der Gruppe (optional)<input id="ga2" class="input" type="number" data-bind="step.group" value="' + esc(P.group) + '"></label>' + liveSummary(P) + linkBtnFor(P);
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Auflösen</button>';
  } else if (q.type === 'auswahl') {
    body += '<span class="eyebrow mt18 block">Was sagt ' + esc(mp.name) + '?</span><div class="stack gap8 mt10">' + q.options.map(function (o, i) {
      var s = P.choice === i;
      return '<button type="button" class="opt row' + (s ? ' is-sel' : '') + '" data-act="stepChoice" data-i="' + i + '" aria-pressed="' + s + '" style="min-height:58px;border-radius:18px;padding:8px 12px 8px 8px;gap:12px"><span class="tile-ic" style="width:36px;height:36px;border-radius:12px;background:' + ['var(--orange)', 'var(--mint)', 'var(--violet)', 'var(--sun)'][i % 4] + ';font:800 14px var(--display)">' + 'ABCD'[i] + '</span><span class="grow" style="font-size:15px;font-weight:700">' + esc(o) + '</span><span class="check">' + icon('i-check', 14) + '</span></button>';
    }).join('') + '</div>' + liveSummary(P) + linkBtnFor(P);
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval"' + (P.choice == null ? ' disabled' : '') + '>Auflösen</button>';
  } else if (q.type === 'aufgabe') {
    body += '<div class="card pad mt18"><span class="eyebrow">So wird gewertet</span><p class="mt6" style="font-size:15px;font-weight:700;line-height:1.4">' + esc(q.note || 'Der Spielleiter entscheidet.') + '</p></div><div class="mt14 row" style="justify-content:center">' + face(mp, 76) + '</div>';
    foot = '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="stepResolve" data-v="fail">Nicht geschafft</button><button type="button" class="cta mint" style="flex:1" data-act="stepResolve" data-v="ok">' + icon('i-check', 18) + 'Geschafft</button></div>';
  }
  return { body: body, foot: foot };
}
/* Gästespiele with several answers at once: sorting and matching */
function gastView(P) {
  var body = ggCard(P), foot = '', mp = person(P.main);
  if (P.mode === 'sort') {
    var placed = P.pickOrder || [];
    body += '<span class="eyebrow mt18 block">' + esc(mp.name) + ' tippt an: ' + esc(P.sortLabel) + '</span>' +
      (placed.length ? '<div class="stack gap8 mt10">' + placed.map(function (i, n) {
        return '<button type="button" class="opt row is-sel" data-act="ggSortDel" data-i="' + i + '" aria-label="' + esc(P.items[i].label) + ' wieder herausnehmen" style="min-height:54px;border-radius:18px;padding:8px 12px 8px 8px;gap:12px"><span class="tile-ic" style="width:36px;height:36px;border-radius:12px;background:var(--sun);font:800 15px var(--display)">' + (n + 1) + '</span><span class="grow" style="font-size:15px;font-weight:800">' + esc(P.items[i].label) + '</span>' + icon('i-close', 16) + '</button>';
      }).join('') + '</div>' : '') +
      (placed.length < P.items.length ? '<div class="chips mt14" role="group" aria-label="Noch einsortieren">' + P.items.map(function (it, i) { return placed.indexOf(i) >= 0 ? '' : '<button type="button" class="chip-btn" data-act="ggSort" data-i="' + i + '">' + icon('i-plus', 14) + esc(it.label) + '</button>'; }).join('') + '</div>' : '') +
      '<p class="small mt10">Antippen setzt den Namen auf den nächsten Platz, nochmal antippen nimmt ihn wieder heraus.</p>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval"' + (placed.length < P.items.length ? ' disabled' : '') + '>Auflösen</button>';
  } else {
    body += P.items.map(function (it, k) {
      var opts = it.options.map(function (o, i) {
        var s = P.choices[k] === i;
        return P.long
          ? '<button type="button" class="opt row' + (s ? ' is-sel' : '') + '" data-act="ggChoose" data-k="' + k + '" data-i="' + i + '" aria-pressed="' + s + '" style="min-height:50px;border-radius:16px;padding:8px 12px;gap:10px"><span class="grow" style="font-size:14px;font-weight:700;line-height:1.35">' + esc(o) + '</span><span class="check">' + icon('i-check', 14) + '</span></button>'
          : '<button type="button" class="chip-btn sm' + (s ? ' is-sel' : '') + '" data-act="ggChoose" data-k="' + k + '" data-i="' + i + '" aria-pressed="' + s + '">' + esc(o) + '</button>';
      }).join('');
      if (it.draw) return '<div class="card pad mt14 gg-gal"><span class="eyebrow block">' + esc(it.prompt) + ' · ' + (k + 1) + ' von ' + P.items.length + '</span><div class="gg-frame">' + drawSvg(it.draw, 236) + '</div><div class="chips mt10" role="group" aria-label="Wer hat es gemalt?">' + opts + '</div></div>';
      return '<div class="card pad mt14"><span class="eyebrow block">' + (P.long ? 'Was ist gelogen?' : (k + 1) + ' von ' + P.items.length) + '</span><p class="name mt6" style="font-size:15px;line-height:1.4">' + esc(it.prompt) + '</p>' + (P.long ? '<div class="stack gap8 mt10">' + opts + '</div>' : '<div class="chips mt10" role="group" aria-label="' + (P.wenn ? 'Welche Antwort ist echt?' : 'Von wem?') + '">' + opts + '</div>') + '</div>';
    }).join('');
    var open = P.choices.filter(function (c) { return c == null; }).length;
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval"' + (open ? ' disabled' : '') + '>' + (open ? 'Noch ' + open + ' offen' : 'Auflösen') + '</button>';
  }
  return { body: body, foot: foot };
}
/* the Millionenfrage-Runde: the guests' questions one after another, like a quiz show ladder */
function leiterHit(it, v) {
  if (it.type === 'auswahl') return v === it.correct;
  var truth = Number(it.answer), x = Number(v);
  return !isNaN(x) && Math.abs(x - truth) <= estTol(it, truth);
}
function leiterView(P) {
  var mp = person(P.main), n = P.items.length, it = P.items[P.at], done = P.hits.length;
  var hits = P.hits.filter(Boolean).length;
  var ladder = '<div class="ladder mt14" aria-label="' + hits + ' von ' + n + ' richtig, mindestens ' + P.need + ' nötig">' + P.items.map(function (x, i) {
    var st = i < P.hits.length ? (P.hits[i] ? 'ok' : 'no') : i === P.at ? 'now' : '';
    return '<span class="lstep ' + st + '"><b>' + (i + 1) + '</b>' + (i + 1 === P.need ? '<i>Ziel</i>' : '') + '</span>';
  }).join('') + '</div>';
  var body = ggCard(P) + ladder;
  var foot = '';
  var allDone = done >= n;
  if (!allDone) {
    var reveal = P.revealed && P.hits.length === P.at + 1;
    body += '<div class="card pad mt14"><span class="eyebrow block">Frage ' + (P.at + 1) + ' von ' + n + (it.author && isGuestAuthor(it.author) ? ' · von ' + esc(it.author) : it.ai ? ' · maßgeschneidert' : '') + '</span><p class="name mt6" style="font-size:17px;line-height:1.38">' + esc(it.text) + '</p>';
    if (it.type === 'auswahl') {
      body += '<div class="stack gap8 mt10">' + it.options.map(function (o, i) {
        var s = (reveal ? P.given[P.at] : P.choice) === i, right = reveal && i === it.correct, wrong = reveal && s && i !== it.correct;
        return '<button type="button" class="opt row' + (s ? ' is-sel' : '') + (right ? ' is-right' : '') + (wrong ? ' is-wrong' : '') + '" data-act="stepChoice" data-i="' + i + '" aria-pressed="' + s + '"' + (reveal ? ' disabled' : '') + ' style="min-height:54px;border-radius:16px;padding:8px 12px 8px 8px;gap:12px"><span class="tile-ic" style="width:34px;height:34px;border-radius:11px;background:' + ['var(--orange)', 'var(--mint)', 'var(--violet)', 'var(--sun)'][i % 4] + ';font:800 14px var(--display)">' + 'ABCD'[i] + '</span><span class="grow" style="font-size:15px;font-weight:700">' + esc(o) + '</span><span class="check">' + icon('i-check', 14) + '</span></button>';
      }).join('') + '</div>';
    } else if (it.type === 'bereich') {
      var mn = Number(it.min), mx = Number(it.max), v = reveal ? Number(P.given[P.at]) : P.lv === '' ? Math.round((mn + mx) / 2) : Number(P.lv);
      body += '<div class="row mt10" style="justify-content:space-between"><span class="sub">Tipp von ' + esc(mp.name) + '</span><span class="num" id="lvShow" style="font:800 20px var(--display);color:var(--white)">' + fmtNum(v) + ' ' + esc(it.unit || '') + '</span></div>' +
        '<label class="sr" for="lvr">Tipp</label><input id="lvr" class="range mt10" type="range" min="' + mn + '" max="' + mx + '" step="' + (mx - mn > 50 ? 1 : 0.5) + '" value="' + v + '" data-bind="step.lvLive"' + (reveal ? ' disabled' : '') + '><div class="row sub" style="justify-content:space-between"><span>' + fmtNum(mn) + '</span><span>' + fmtNum(mx) + '</span></div>';
    } else {
      body += '<label class="field mt10" for="lvi">Tipp von ' + esc(mp.name) + (it.unit ? ' (' + esc(it.unit) + ')' : '') + '<input id="lvi" class="input" type="text" inputmode="decimal" data-bind="step.lv" value="' + esc(reveal ? P.given[P.at] : P.lv) + '" placeholder="Zahl"' + (reveal ? ' disabled' : '') + '></label><p class="small mt6">Zählt als richtig ' + esc(estTolText(it)) + '.</p>';
    }
    if (reveal) {
      var ok = P.hits[P.at];
      body += '<div class="lreveal ' + (ok ? 'ok' : 'no') + ' mt10">' + icon(ok ? 'i-check' : 'i-close', 16) + '<span>' + (ok ? 'Richtig!' : 'Leider daneben.') + (it.type === 'auswahl' ? (ok ? '' : ' Richtig ist: ' + esc(it.options[it.correct])) : ' Lösung: ' + esc(fmtNum(Number(it.answer)) + (it.unit ? ' ' + it.unit : ''))) + '</span></div>';
    }
    body += '</div>';
    var canLock = it.type === 'auswahl' ? P.choice != null : it.type === 'bereich' ? true : String(P.lv).trim() !== '' && !isNaN(Number(String(P.lv).replace(',', '.')));
    foot = reveal ? '<button type="button" class="cta" data-act="ggNext">' + (P.at + 1 < n ? 'Nächste Frage' : 'Zum Ergebnis') + '</button>'
      : '<button type="button" class="cta" data-act="ggLock"' + (canLock ? '' : ' disabled') + '>Eingeloggt? Auflösen!</button>';
  } else {
    body += '<div class="card pad mt14"><p class="name" style="font-size:16px">' + hits + ' von ' + n + ' richtig. Nötig waren ' + P.need + '.</p></div>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Runde werten</button>';
  }
  return { body: body, foot: foot };
}
/* Top-Antworten: the board, like in the game show. The master holds the cheat sheet and taps what was said. */
function boardView(P) {
  var mp = person(P.main), n = P.items.length, hits = P.items.filter(function (x) { return x.hit; }).length;
  var closed = P.strikes >= 3 || hits === n, spy = !!UI.gbSpy, just = UI.gbJust, xNow = UI.gbX && UI.gbX !== UI.gbXDone;
  if (xNow) UI.gbXDone = UI.gbX;
  UI.gbJust = null;
  var rows = P.items.map(function (it, i) {
    var open = it.hit || closed, st = it.hit ? ' hit' : closed ? ' miss' : '';
    return '<button type="button" class="gb-row' + st + (just === i ? ' just' : '') + '" data-act="gbHit" data-i="' + i + '"' + (open ? ' disabled' : '') + ' aria-label="' + (open ? esc(it.label) + ', ' + it.n + (it.n === 1 ? ' Gast' : ' Gäste') : 'Antwort ' + (i + 1) + ' aufdecken') + '">' +
      '<span class="gb-no">' + (i + 1) + '</span><span class="gb-ans">' + (open ? '<b>' + esc(it.label) + '</b>' : spy ? '<i>' + esc(it.label) + '</i>' : '') + '</span><span class="gb-cnt">' + (open ? it.n : '') + '</span></button>';
  }).join('');
  var xs = ''; for (var k = 0; k < 3; k++) xs += '<span class="gb-x' + (k < P.strikes ? ' on' : '') + (xNow && k === P.strikes - 1 ? ' fresh' : '') + '">' + icon('i-close', 22) + '</span>';
  var body = ggCard(P) +
    '<div class="gb-board mt14"><div class="gb-q"><span>Wir haben ' + P.asked + ' Gäste gefragt</span><b>' + esc(P.qtext) + '</b></div><div class="gb-rows">' + rows + '</div>' +
    '<div class="gb-foot"><span class="gb-score">' + hits + ' von ' + n + ' gefunden · nötig ' + P.need + '</span><span class="gb-xs" aria-label="' + P.strikes + ' von 3 Fehlversuchen">' + xs + '</span></div>' +
    (xNow ? '<div class="gb-bigx" aria-hidden="true">' + icon('i-close', 120) + '</div>' : '') + '</div>';
  if (!closed) body += '<div class="row mt10" style="gap:10px;align-items:flex-start"><button type="button" class="gb-spy' + (spy ? ' on' : '') + '" data-act="gbSpy" aria-pressed="' + spy + '">' + icon(spy ? 'i-check' : 'i-user', 15) + 'Spickzettel</button><p class="small grow" style="margin:0">' + (spy ? 'Nur für dich. Sagt ' + esc(mp.name) + ' etwas von der Tafel, tipp die Zeile an.' : 'Dreh den Spickzettel auf, dann siehst nur du die Antworten.') + '</p></div>';
  else body += '<div class="card pad mt14"><p class="name" style="font-size:16px">' + (hits === n ? 'Die Tafel ist leer geräumt!' : 'Drei Fehlversuche, die Tafel ist zu.') + ' ' + hits + ' von ' + n + ' gefunden, nötig waren ' + P.need + '.</p></div>';
  var foot = closed ? '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Runde werten</button>'
    : '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="gbMiss">' + icon('i-close', 18) + 'Daneben</button><button type="button" class="cta" style="flex:1" data-act="stepResolve" data-v="eval">Werten</button></div>';
  return { body: body, foot: foot };
}
/* Sprüche-Klopfer: the start of a saying, the birthday person finishes it, the master uncovers */
function judgeView(P) {
  var mp = person(P.main), n = P.items.length, done = P.hits.length >= n, hits = P.hits.filter(Boolean).length;
  var ladder = '<div class="ladder mt14" aria-label="' + hits + ' von ' + n + ' Sprüchen sitzen">' + P.items.map(function (x, i) {
    var st = i < P.hits.length ? (P.hits[i] ? 'ok' : 'no') : i === P.at ? 'now' : '';
    return '<span class="lstep ' + st + '"><b>' + (i + 1) + '</b>' + (i + 1 === P.need ? '<i>Ziel</i>' : '') + '</span>';
  }).join('') + '</div>';
  var body = ggCard(P) + ladder, foot;
  if (!done) {
    var it = P.items[P.at];
    body += '<div class="gj-card mt14' + (P.open ? ' open' : '') + '"><span class="gj-l">Spruch ' + (P.at + 1) + ' von ' + n + '</span><p class="gj-q">„' + esc(P.open ? it.full : it.cue) + '“</p>' +
      (P.open ? '<span class="gj-by">' + guestFace(it.by, 28) + 'Eingeschickt von ' + esc(it.by) + '</span>' : '<span class="gj-hint">' + esc(mp.name) + ' ergänzt laut. Dann deckst du auf.</span>') + '</div>';
    foot = P.open ? '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="gjMark" data-v="0">' + icon('i-close', 18) + 'Daneben</button><button type="button" class="cta mint" style="flex:1" data-act="gjMark" data-v="1">' + icon('i-check', 18) + 'Sitzt!</button></div>'
      : '<button type="button" class="cta" data-act="gjOpen">Aufdecken</button>';
  } else {
    body += '<div class="card pad mt14"><p class="name" style="font-size:16px">' + hits + ' von ' + n + ' Sprüchen sitzen. Nötig waren ' + P.need + '.</p></div>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Runde werten</button>';
  }
  return { body: body, foot: foot };
}
/* Gegen die Menge */
function mengeView(P) {
  var team = focusNames(P.team), many = P.team.length > 1, body = '', foot = '';
  var opt = function (k, o, sel, extra) { return '<button type="button" class="opt row' + (sel ? ' is-sel' : '') + (extra || '') + '" data-act="mengeGuess" data-k="' + k + '" data-o="' + o + '" aria-pressed="' + sel + '" style="min-height:50px;border-radius:16px;padding:8px 12px;gap:10px;flex:1"><span class="grow" style="font-size:15px;font-weight:800">' + esc(MENGE[P.qs[k]][1 + o]) + '</span><span class="check">' + icon('i-check', 14) + '</span></button>'; };
  if (P.phase === 'vote') {
    var linkN = mengeLinkCount(P), handN = P.hands.reduce(function (a, h) { return Math.max(a, h[0] + h[1]); }, 0);
    body = bigCard('var(--sun)', 'Gegen die Menge', 'Die Gäste stimmen ab', '<p style="position:relative;font-weight:700">Fünf Fragen, je zwei Antworten. Danach ' + (many ? 'raten ' : 'rät ') + esc(team) + ', was die Mehrheit gewählt hat. Drei Treffer, und die Runde ist geschafft.</p>') +
      '<div class="card padrows mt14">' + P.qs.map(function (i, k) { return '<div class="res" style="min-height:52px"><span class="tile-ic" style="width:30px;height:30px;border-radius:10px;background:var(--sun);font:800 13px var(--display)">' + (k + 1) + '</span><span class="stack grow" style="gap:2px;min-width:0"><span class="name" style="font-size:14px">' + esc(MENGE[i][0]) + '</span>' + (MENGE[i][0].indexOf(MENGE[i][1]) >= 0 && MENGE[i][0].indexOf(MENGE[i][2]) >= 0 ? '' : '<span class="sub">' + esc(MENGE[i][1]) + ' oder ' + esc(MENGE[i][2]) + '</span>') + '</span></div>'; }).join('') + '</div>' +
      '<span class="eyebrow mt18 block">Abstimmen per Link</span>' +
      (P.code ? '<div class="mt10">' + shareBlock(APP_URL + '#gast-live', 'Gegen die Menge! Stimm hier ab, fünf schnelle Fragen: ' + APP_URL + '#gast-live', P.code, 'openGuestLive') + '</div>' +
        '<div class="card pad mt10 row"><span class="dotlive" style="background:var(--mint)"></span><span class="grow name">' + linkN + (linkN === 1 ? ' Gast hat' : ' Gäste haben') + ' abgestimmt</span></div><p class="small mt6">Die Verteilung bleibt geheim, bis aufgelöst wird.</p>'
        : '<button type="button" class="cta mt10" data-act="mengeLink">' + icon('i-link', 18) + 'Abstimmung per Link starten</button><p class="small mt6">Schick den Link in die Gruppe. Jeder stimmt auf dem eigenen Handy ab.</p>') +
      '<span class="eyebrow mt18 block">Oder per Handzeichen</span>' +
      (P.handOpen ? '<p class="small mt6"><b style="color:var(--text)">' + esc(team) + ' ' + (many ? 'machen' : 'macht') + ' jetzt die Augen zu.</b> Lies jede Frage vor und zähl die Hände.</p>' + P.qs.map(function (i, k) {
        return '<div class="card pad mt10"><span class="eyebrow block">' + (k + 1) + '. ' + esc(MENGE[i][0]) + '</span>' + [0, 1].map(function (o) { return '<div class="row mt8"><span class="grow name" style="font-size:14px">' + esc(MENGE[i][1 + o]) + '</span>' + stepper('mengeHand', P.hands[k][o], ' data-k="' + k + '" data-o="' + o + '"', MENGE[i][1 + o]) + '</div>'; }).join('') + '</div>';
      }).join('') : '<button type="button" class="btn-dark mt10" style="width:100%" data-act="mengeHands">' + icon('i-users', 18) + 'Hände zählen' + (handN ? ' (' + handN + ' gezählt)' : '') + '</button>') +
      '<p class="small mt10">Link und Handzeichen werden zusammengezählt.</p>';
    foot = '<button type="button" class="cta" data-act="mengeClose">Abstimmung beenden</button>';
  } else if (P.phase === 'guess') {
    body = bigCard('var(--sun)', 'Gegen die Menge', 'Was hat die Mehrheit gewählt?', '<p style="position:relative;font-weight:700">' + esc(team) + (many ? ' einigen sich' : ' entscheidet') + ' bei jeder Frage auf eine Antwort.</p>') +
      P.qs.map(function (i, k) { return '<div class="card pad mt14"><span class="eyebrow block">' + (k + 1) + ' von ' + P.qs.length + '</span><p class="name mt6" style="font-size:16px;line-height:1.38">' + esc(MENGE[i][0]) + '</p><div class="row gap8 mt10">' + opt(k, 0, P.guesses[k] === 0) + opt(k, 1, P.guesses[k] === 1) + '</div></div>'; }).join('');
    var openG = P.guesses.filter(function (g) { return g == null; }).length;
    foot = '<button type="button" class="cta" data-act="mengeReveal"' + (openG ? ' disabled' : '') + '>' + (openG ? 'Noch ' + openG + ' offen' : 'Auflösen') + '</button>';
  } else {
    var done = P.qs.slice(0, P.at + 1).filter(function (q, k) { return mengeHit(P, k); }).length;
    body = bigCard('var(--sun)', 'Gegen die Menge', 'Die Auflösung', '<p style="position:relative;font-weight:700">' + done + ' von ' + (P.at + 1) + ' getroffen. Drei Treffer braucht es.</p>') +
      '<div class="ladder mt14">' + P.qs.map(function (q, k) { var st = k <= P.at ? (mengeHit(P, k) ? 'ok' : 'no') : k === P.at + 1 ? 'now' : ''; return '<span class="lstep ' + st + '"><b>' + (k + 1) + '</b></span>'; }).join('') + '</div>' +
      P.qs.slice(0, P.at + 1).map(function (i, k) {
        var t = P.tally[k], sum = Math.max(1, t[0] + t[1]), hit = mengeHit(P, k), last = k === P.at;
        return '<div class="card pad mt14' + (last ? ' mreveal' : '') + '"><span class="eyebrow block">' + (k + 1) + '. ' + esc(MENGE[i][0]) + '</span>' + [0, 1].map(function (o) {
          var pc = Math.round(t[o] / sum * 100), maj = t[o] > t[1 - o] || t[0] === t[1];
          return '<div class="mbar mt8' + (maj ? ' maj' : '') + '"><span class="mb-f" style="width:' + pc + '%"></span><span class="mb-l">' + esc(MENGE[i][1 + o]) + (P.guesses[k] === o ? ' · getippt' : '') + '</span><span class="mb-n">' + t[o] + '</span></div>';
        }).join('') + '<div class="lreveal ' + (hit ? 'ok' : 'no') + ' mt10">' + icon(hit ? 'i-check' : 'i-close', 16) + '<span>' + (t[0] === t[1] ? 'Gleichstand, zählt als richtig.' : hit ? 'Richtig, die Menge ist durchschaut.' : 'Daneben, die Menge sah das anders.') + '</span></div></div>';
      }).reverse().join('');
    foot = P.at < P.qs.length - 1 ? '<button type="button" class="cta" data-act="mengeNext">Nächste Frage auflösen</button>' : '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Runde werten</button>';
  }
  return { body: body, foot: foot };
}
function wweCands(P) { return P.cands || stepFocusIds(); }
function wweView(P) {
  var cands = wweCands(P), votes = P.votes || {}, total = 0;
  cands.forEach(function (id) { total += votes[id] || 0; });
  var rows = cands.map(function (id) {
    var p = person(id), v = votes[id] || 0;
    return '<div class="vote-row">' + face(p, 44) + '<span class="stack grow gap6"><span class="name">' + esc(p.name) + '</span><span class="bar"><b style="width:' + (total ? Math.round(v / total * 100) : 0) + '%"></b></span></span>' +
      '<div class="stepper"><button type="button" class="iconbtn sm" data-act="wweVote" data-id="' + id + '" data-d="-1" aria-label="Stimme für ' + esc(p.name) + ' entfernen">' + icon('i-minus', 14) + '</button><span class="val num" style="min-width:30px;font-size:16px">' + v + '</span><button type="button" class="iconbtn sm" data-act="wweVote" data-id="' + id + '" data-d="1" aria-label="Stimme für ' + esc(p.name) + '">' + icon('i-plus', 14) + '</button></div></div>';
  }).join('');
  var body = bigCard('var(--sun)', 'Wer würde eher', esc(WWE[P.idx])) +
    '<span class="eyebrow mt18 block">Stimmen · ' + total + '</span><div class="card padrows mt10">' + rows + '</div>' + liveSummary(P) + linkBtn() +
    '<p class="small mt10">Wer die meisten Stimmen bekommt, trinkt.</p>';
  return { body: body, foot: '<button type="button" class="cta" data-act="stepResolve" data-v="eval"' + (total ? '' : ' disabled') + '>Auflösen</button>' };
}
function plv(name, one, many) { return name.indexOf(' & ') >= 0 ? many : one; }
/* with a real dice on the table: the master types in what was rolled */
/* a die face with real pips instead of a digit */
var PIPS = { 1: [[15, 15]], 2: [[8, 8], [22, 22]], 3: [[8, 8], [15, 15], [22, 22]], 4: [[8, 8], [22, 8], [8, 22], [22, 22]], 5: [[8, 8], [22, 8], [15, 15], [8, 22], [22, 22]], 6: [[8, 8], [22, 8], [8, 15], [22, 15], [8, 22], [22, 22]] };
function dicePips(n, size) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 30 30" aria-hidden="true">' + (PIPS[n] || []).map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.3" fill="' + (n === 1 ? '#FF7A45' : '#15122B') + '"></circle>'; }).join('') + '</svg>';
}
function rollView(P) {
  var mp = person(P.main);
  var body = bigCard('var(--sun)', 'Würfeln', esc(mp.name) + ' würfelt mit dem echten Würfel', '<p style="position:relative;font-weight:700">Tipp die gewürfelte Zahl an. Danach kommt die Aufgabe.</p>') +
    '<div class="grid3 mt18">' + [1, 2, 3, 4, 5, 6].map(function (n) { return '<button type="button" class="dice plain" data-act="rollPick" data-v="' + n + '" aria-label="' + n + ' gewürfelt" style="width:100%;height:84px;flex:none;animation:none;cursor:pointer">' + dicePips(n, 52) + '</button>'; }).join('') + '</div>';
  return { body: body, foot: '<button type="button" class="btn-ghost" data-act="rollPick" data-v="0">' + icon('i-dice', 18) + 'Doch in der App würfeln</button>' };
}
function partnerTeam(P, i) { var t = P.teams[i]; return t.frontLabel && t.backName ? t.frontLabel + ' & ' + t.backName : t.backName || t.frontLabel || 'Team ' + (i + 1); }
function partnerFace(P, i, size) { var t = P.teams[i]; return t.back ? face(person(t.back), size) : groupFace(size); }
function partnerScore(P) {
  var cell = function (i) { var lead = P.wins[i] > P.wins[1 - i]; return '<span class="stack" style="align-items:center;gap:6px;min-width:0;text-align:center">' + partnerFace(P, i, 44) + '<span class="sub" style="font-weight:800;color:' + (lead ? 'var(--white)' : 'var(--muted)') + ';overflow-wrap:anywhere">' + esc(partnerTeam(P, i)) + '</span></span>'; };
  return '<div class="card pad mt14" style="display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:10px;align-items:center">' + cell(0) +
    '<span class="stack" style="align-items:center;gap:2px"><span class="num" style="font:900 34px/1 var(--display);color:var(--white)">' + P.wins[0] + ':' + P.wins[1] + '</span><span class="sub">Best of ' + P.bestOf + '</span></span>' + cell(1) + '</div>';
}
function partnerView(P) {
  if (!P.wins) { P.wins = [0, 0]; P.hist = []; P.bestOf = 3; P.round = 1; P.starter = 0; }
  var ch = PARTNER[P.ch], t = P.teams;
  var need = Math.floor(P.bestOf / 2) + 1;
  var bidderTeam = t[P.bidder];
  var badge = 'Mein Partner kann, Runde ' + P.round;
  var rules = '<p style="position:relative;font-weight:700">Die vorne bieten, wie viel die Person hinter ihnen schafft. Wer zuerst „Zeig mal!“ sagt, lässt das Gebot beweisen.</p>';
  var other = '<button type="button" class="linkbtn mt10" data-act="partnerOther">' + icon('i-shuffle', 16) + 'Andere Challenge</button>';
  var body = '', foot = '';
  if (P.phase === 'setup') {
    body = bigCard('var(--mint)', 'Mein Partner kann …', 'Mehrere Runden, ein Sieger', '<p style="position:relative;font-weight:700">Jede Runde gibt es eine neue Challenge. Die vorne bieten, die hinten müssen liefern. Wer zuerst ' + need + ' Runden holt, gewinnt, und das andere Team trinkt.</p>') +
      '<span class="eyebrow mt18 block">Team 1</span><div class="card pad mt10"><div class="row">' + partnerFace(P, 0, 40) + '<span class="stack grow"><span class="sub">hinten, muss liefern</span><span class="name">' + esc(t[0].backName) + '</span></span></div>' +
      '<label class="field mt10" for="pt0f">Vorne, bietet<input id="pt0f" class="input" type="text" data-bind="partner.0.frontLabel" value="' + esc(t[0].frontLabel) + '" placeholder="z. B. Lea"></label></div>' +
      '<span class="eyebrow mt18 block">Team 2</span><div class="card pad mt10">' + (t[1].back ? '<div class="row">' + partnerFace(P, 1, 40) + '<span class="stack grow"><span class="sub">hinten, muss liefern</span><span class="name">' + esc(t[1].backName) + '</span></span></div>' : '<p class="small">Zwei Gäste bilden das Gegen-Team. Namen sind freiwillig, gezählt wird bei Gästen nichts.</p><label class="field mt10" for="pt1b">Hinten, muss liefern<input id="pt1b" class="input" type="text" data-bind="partner.1.backName" value="' + esc(t[1].backName) + '" placeholder="Name (optional)"></label>') +
      '<label class="field mt10" for="pt1f">Vorne, bietet<input id="pt1f" class="input" type="text" data-bind="partner.1.frontLabel" value="' + esc(t[1].frontLabel) + '" placeholder="Name (optional)"></label></div>' +
      '<span class="eyebrow mt18 block">Wie viele Runden?</span><div class="seg mt10" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Runden">' + [3, 5, 7].map(function (n) { var s = P.bestOf === n; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="partnerRounds" data-v="' + n + '" aria-pressed="' + s + '">Best of ' + n + '</button>'; }).join('') + '</div>' +
      '<p class="small mt8">Wer zuerst ' + need + ' Runden gewinnt, hat das Spiel. Das Bieten beginnt abwechselnd.</p>' +
      '<div class="card pad mt14"><span class="eyebrow block">Challenge Runde 1</span><p class="name mt6" style="font-size:16px">… ' + esc(ch.t) + '</p>' + (ch.needs && ch.needs.length ? '<p class="sub mt6 inline-ic">' + icon('i-box', 13) + esc(ch.needs.map(matLabel).join(', ')) + '</p>' : '') + other + '</div>';
    foot = '<button type="button" class="cta" data-act="partnerStart">Runde 1 starten</button>';
  } else if (P.phase === 'between') {
    var last = P.hist[P.hist.length - 1];
    body = '<div class="bigcard stack gap10" style="background:' + (last.ok ? 'var(--mint)' : 'var(--orange)') + '"><span class="badge">Runde ' + (P.round - 1) + ' entschieden</span><h2>' + esc(partnerTeam(P, last.winner)) + ' ' + plv(partnerTeam(P, last.winner), 'holt', 'holen') + ' die Runde</h2><p style="position:relative;font-weight:700">' + esc((t[last.bidder].backName || 'Team ' + (last.bidder + 1)) + (last.ok ? ' hat die ' + last.bid + ' geschafft.' : ' hat die ' + last.bid + ' nicht geschafft.')) + '</p></div>' +
      partnerScore(P) +
      '<div class="card pad mt14"><span class="eyebrow block">Challenge Runde ' + P.round + '</span><p class="name mt6" style="font-size:16px">… ' + esc(ch.t) + '</p>' + (ch.needs && ch.needs.length ? '<p class="sub mt6 inline-ic">' + icon('i-box', 13) + esc(ch.needs.map(matLabel).join(', ')) + '</p>' : '') +
      '<p class="small mt6">' + esc(partnerTeam(P, P.starter)) + ' ' + plv(partnerTeam(P, P.starter), 'fängt', 'fangen') + ' mit dem Bieten an.</p>' + other + '</div>';
    foot = '<button type="button" class="cta" data-act="partnerNext">Runde ' + P.round + ' starten</button>';
  } else if (P.phase === 'bid') {
    var otherTeam = partnerTeam(P, 1 - P.bidder);
    body = bigCard('var(--mint)', badge, '… ' + esc(ch.t), rules) + partnerScore(P) +
      '<div class="card pad mt14 stack" style="align-items:center;gap:6px;text-align:center"><span class="sub">Aktuelles Gebot von ' + esc(partnerTeam(P, P.bidder)) + '</span>' +
      '<span class="bidnum num">' + P.bid + '</span><span class="name">' + esc(bidderTeam.backName || 'Team ' + (P.bidder + 1)) + ' schafft ' + P.bid + ' ' + esc(ch.u) + '</span>' +
      '<div class="row gap8 mt10">' + stepper('partnerBid', '', '', 'Gebot').replace('<span class="val num"></span>', '') + '</div></div>' +
      '<p class="small mt10">' + esc(otherTeam) + (otherTeam.indexOf(' & ') >= 0 ? ' sind' : ' ist') + ' dran: mehr bieten oder „Zeig mal!“.</p>' + other;
    foot = '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="partnerRaise">' + icon('i-plus', 18) + 'Mehr bieten</button><button type="button" class="cta" style="flex:1" data-act="partnerShow">Zeig mal!</button></div>';
  } else if (P.phase === 'show') {
    var left = P.timerEnd ? Math.max(0, Math.ceil((P.timerEnd - Date.now()) / 1000)) : ch.s;
    body = bigCard('var(--mint)', badge, '… ' + esc(ch.t), '') + partnerScore(P) +
      '<div class="card pad mt14 stack" style="align-items:center;gap:6px;text-align:center"><span class="sub">' + esc(bidderTeam.backName || 'Team ' + (P.bidder + 1)) + ' muss schaffen</span><span class="bidnum num">' + P.bid + '</span><span class="name">' + esc(ch.u) + '</span></div>' +
      (ch.s ? '<button type="button" class="btn-dark mt14" style="width:100%" data-act="partnerTimer"' + (P.timerEnd && left > 0 ? ' disabled' : '') + '>' + icon('i-clock', 18) + (P.timerEnd ? (left > 0 ? 'Noch ' + left + ' Sekunden' : 'Zeit ist um!') : 'Timer ' + ch.s + ' Sekunden starten') + '</button>' : '') +
      (/Geburtstage der anwesenden Gäste/.test(ch.t) && guestBirthdays().length ? '<div class="card pad mt14"><span class="eyebrow block">Zum Nachprüfen</span><p class="small mt6" style="color:var(--text)">' + esc(guestBirthdays().join(', ')) + '</p></div>' : '') +
      '<div class="card pad mt14"' + (P.achieved >= P.bid ? ' style="border-color:var(--mint)"' : '') + '><div class="row"><span class="stack grow"><span class="name">Geschafft bisher</span><span class="sub"' + (P.achieved >= P.bid ? ' style="color:var(--mint);font-weight:800"' : '') + '>' + (P.achieved >= P.bid ? 'Gebot erreicht!' : 'mitzählen, noch ' + (P.bid - P.achieved)) + '</span></span>' + stepper('partnerAch', P.achieved, '', 'Geschafft') + '</div></div>';
    foot = '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="partnerDone" data-v="fail">Nicht geschafft</button><button type="button" class="cta mint" style="flex:1" data-act="partnerDone" data-v="ok">' + icon('i-check', 18) + 'Geschafft</button></div>';
  } else {
    body = bigCard('var(--mint)', 'Mein Partner kann …', esc(partnerTeam(P, P.wins[0] > P.wins[1] ? 0 : 1)) + ' ' + plv(partnerTeam(P, P.wins[0] > P.wins[1] ? 0 : 1), 'gewinnt', 'gewinnen'), '') + partnerScore(P);
  }
  return { body: body, foot: foot };
}
function injectionView(P) {
  var r = R(), body = '', foot = '';
  if (P.kind === 'toast') {
    body = bigCard('var(--sun)', 'Anstoß-Moment', 'Alle stoßen an!', '<p style="position:relative;font-weight:700">' + esc(focusNames(P.ids)) + ' trinken je 1 ' + esc(U()) + '. Gäste dürfen mitmachen, Wasser zählt auch.' + (P.ids.some(needsPause) ? ' Wer gerade schon zwei kurz hintereinander hatte, stößt mit Wasser an.' : '') + '</p>') +
      '<div class="row mt18" style="justify-content:center;gap:10px">' + P.ids.map(function (id) { return face(person(id), 72, '', 'jubel'); }).join('') + '</div>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="toast">' + icon('i-cup', 18) + 'Prost!</button>';
  } else if (P.kind === 'acc') {
    var tr = trackById(P.track), items = r.acc.items, next = items[(tr.accIdx + 1) % items.length];
    var nm = focusNames(tr.ids);
    body = bigCard('var(--violet)', 'Zubehör-Wechsel', esc(nm) + ': Ab jetzt mit ' + esc(next) + '!', '<p style="position:relative;font-weight:700">Bisher: ' + esc(items[tr.accIdx % items.length]) + '. Wechsel ' + (tr.accDone + 1) + ' von ' + r.acc.swaps + '.</p>') +
      '<div class="card pad mt14 accswap"><span class="stackav">' + tr.ids.map(function (id) { return face(person(id), 44, '', 'staunen'); }).join('') + '</span><span class="acc-t"><s>' + esc(items[tr.accIdx % items.length]) + '</s>' + icon('i-arrow', 18) + '<b>' + esc(next) + '</b></span></div>' +
      '<span class="eyebrow mt18 block">Reihenfolge</span><div class="chips mt10">' + items.map(function (it, i) { return '<span class="tag" style="height:30px;' + (it === next ? 'color:var(--ink);background:var(--sun)' : '') + '">' + esc(it) + '</span>'; }).join('') + '</div>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="acc">Gewechselt</button>';
  } else if (P.kind === 'check') {
    body = P.last ? bigCard('var(--violet)', 'Endspurt', 'Das letzte Spiel ist durch!', '<p style="position:relative;font-weight:700">Jetzt nur noch fertig machen. Schieb den Regler auf 100 %, sobald alles erledigt ist.</p>')
      : bigCard('var(--violet)', 'Status-Check', 'Wie weit seid ihr?', '<p style="position:relative;font-weight:700">Schätz ehrlich. Die App plant Einlagen, Zubehör und ' + esc(U()) + ' danach neu.</p>');
    r.tracks.forEach(function (t) {
      if (t.done) return;
      var v = UI.checkVals && UI.checkVals[t.id] != null ? UI.checkVals[t.id] : Math.round(zeitEst(t).p * 100);
      body += '<div class="card pad mt14"><div class="row">' + '<span class="stackav">' + t.ids.map(function (id) { return face(person(id), 36); }).join('') + '</span><span class="grow name">' + esc(focusNames(t.ids)) + '</span><span class="num" id="ckShow' + t.id + '" style="font:800 20px var(--display);color:var(--white)">' + v + ' %</span></div>' +
        '<label class="sr" for="ck' + t.id + '">Fortschritt</label><input id="ck' + t.id + '" class="range mt10" type="range" min="0" max="100" step="5" value="' + v + '" data-bind="check.' + t.id + '"><div class="row sub" style="justify-content:space-between"><span>gerade angefangen</span><span>fertig</span></div></div>';
    });
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="check">Status übernehmen</button>';
  } else if (P.kind === 'finale') {
    var t2 = trackById(P.track), rr = R(), rfam = rr.fam || 'kranz', fids = rr.variant === 'abend' ? rr.who : t2.ids;
    var fBadge = rr.variant === 'abend' ? 'Zeit ist um' : rfam === 'frei' ? (rr.variant === 'wuerfel' ? 'Im Ziel' : 'Geschafft') : 'Kranz geschafft';
    var fTitle = rr.variant === 'abend' ? 'Der Spielabend ist geschafft!' : rfam === 'frei' ? (rr.variant === 'wuerfel' ? esc(focusNames(t2.ids)) + (t2.ids.length > 1 ? ' sind' : ' ist') + ' im Ziel!' : 'Die letzte Runde ist gespielt!') : 'Die letzte ' + esc(unitOf(t2).unit) + ' ist ab!';
    body = '<div class="bigcard stack gap10" style="background:var(--accent);min-height:300px;justify-content:flex-end">' + garland(350, ['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#15122B']) +
      '<div class="row" style="position:relative;justify-content:center;gap:8px;margin-bottom:8px">' + fids.map(function (id) { return face(person(id), 92, 'border:5px solid var(--ink);box-sizing:border-box', 'jubel'); }).join('') + '</div>' +
      '<span class="badge" style="align-self:center">' + fBadge + '</span><h2 style="text-align:center;font-size:24px">' + fTitle + '</h2></div><p class="lead mt14" style="text-align:center">Alle jubeln. Zum Abschluss:</p>' +
      '<div class="card padrows mt10">' + fids.map(function (id) { var cr = closingRow(id); return '<div class="res">' + face(person(id), 36) + '<span class="grow name">' + esc(cr.name) + '</span><span class="tag" style="background:' + (cr.n ? 'var(--accent);color:var(--ink)' : 'var(--surface-2);color:var(--mint)') + '">' + icon(cr.n ? 'i-shot' : 'i-drop', 13) + (cr.n ? '1 ' + esc(U()) : 'Wasser') + '</span></div>'; }).join('') + '</div>' +
      '<p class="small mt8" style="text-align:center">Wer deutlich unter dem persönlichen Ziel liegt, bekommt ein Abschluss-' + esc(U()) + '. Alle anderen stoßen mit Wasser an.</p>' +
      (rr.variant === 'abend' || rr.tracks.every(function (t) { return t.done || t.id === P.track; }) ? finaleRoleHtml(rr) : '');
    if (fids.length > 2) body = body.replace('width:92px;height:92px', 'width:72px;height:72px');
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="finale">Feiern und weiter</button>';
  } else if (P.kind === 'glueck') {
    var mp = person(P.main);
    body = bigCard('var(--mint)', (R() && !isTimed(R()) ? 'Glücks-' + esc(unitOf(trackById(P.track)).unit) : 'Glücksmoment'), P.variantG === 'frei' ? ((R() && (R().fam || 'kranz') === 'kranz') ? 'Einfach abhängen, keine Aufgabe!' : 'Durchatmen, keine Aufgabe!') : esc(mp.name) + ' verteilt 1 ' + esc(U()) + ' an einen Gast.') +
      '<div class="mt18 row" style="justify-content:center">' + face(mp, 84, '', 'jubel') + '</div>' +
      (P.variantG === 'verteilen' ? '<label class="field mt14" for="giveTo">An wen? (optional)<input id="giveTo" class="input" type="text" data-bind="step.giveTo" value="' + esc(P.giveTo || '') + '" placeholder="Name, nur für die Anzeige"></label>' : '');
    foot = '<button type="button" class="cta mint" data-act="stepResolve" data-v="ok">Weiter</button>';
  }
  return { body: body, foot: foot };
}
function renderStepScreen(P, free) {
  if (!P) return free ? V.home() : V.run();
  var dice = P.roll && !P.result ? '<div class="row gap14" style="margin-bottom:14px"><span class="dice" role="img" aria-label="' + P.roll + '">' + dicePips(P.roll, 44) + '</span><span class="small" style="font-size:14px;font-weight:700;color:var(--text)">Gewürfelt: ' + P.roll + '. ' + ((R().fam || 'kranz') === 'frei' ? P.roll + (P.roll === 1 ? ' Feld' : ' Felder') + ' vor auf dem Spielfeld.' : 'Am Kranz ' + P.roll + ' weiter, die letzte zählt.') + '</span></div>' : '';
  var v;
  if (P.result) v = { body: resultView(P), foot: '<button type="button" class="cta" data-act="stepContinue">Weiter</button>' };
  else if (P.kind === 'spiel') v = spielView(P);
  else if (P.kind === 'frage' || P.kind === 'schaetzen' || P.kind === 'quiz') v = questionView(P);
  else if (P.kind === 'gast') v = P.mode === 'leiter' ? leiterView(P) : P.mode === 'board' ? boardView(P) : P.mode === 'judge' ? judgeView(P) : P.mode === 'sort' || P.mode === 'multi' ? gastView(P) : questionView(P);
  else if (P.kind === 'wwe') v = wweView(P);
  else if (P.kind === 'partner') v = partnerView(P);
  else if (P.kind === 'roll') v = rollView(P);
  else if (P.kind === 'menge') v = mengeView(P);
  else if (P.kind === 'handicap') v = hcView(P);
  else if (P.kind === 'mission') v = missionView(P);
  else if (P.kind === 'crew') v = crewStepView(P);
  else if (roleChip(P)) v = roleView(P);
  else v = injectionView(P);
  /* first row: where the buttons lead, in words. Second row: what this card is */
  var swap = !P.result && ['spiel', 'schaetzen', 'quiz', 'wwe', 'frage', 'gast', 'mission'].indexOf(P.kind) >= 0;
  var back = free ? navBtn('data-act="freeCancel"', 'i-close', 'Abbrechen') : navBtn('data-act="go" data-to="run" aria-label="Zur Übersicht, die Karte bleibt offen"', 'i-back', 'Übersicht');
  var other = swap ? navBtn('data-act="' + (free ? 'freeOther' : 'runOther') + '" aria-label="' + (P.kind === 'mission' ? 'Andere Mission, nie eine wildere' : 'Anderes Spiel, zum Beispiel wenn Material fehlt') + '"', 'i-shuffle', P.kind === 'mission' ? 'Andere' : 'Anderes Spiel') : '<span></span>';
  var head = '<div class="topbar tb3">' + back + '<span></span>' + other + '</div><div class="tb-ctx"><span class="sock-chip"><span aria-hidden="true">' + themeIc('#FFFFFF', 11) + '</span>' + esc(stepChip(P)) + '</span></div>';
  /* announcement right under the first card, rule questions at the end */
  var withRules = !P.result && ['spiel', 'frage', 'schaetzen', 'quiz', 'wwe', 'gast', 'partner', 'glueck', 'toast', 'mission', 'crew'].indexOf(P.kind) >= 0 || (!P.result && P.kind === 'menge' && P.phase === 'vote') || (P.kind === 'handicap' && P.hc && P.hc.phase === 'pick');
  var bodyHtml = v.body;
  if (withRules && (P.kind !== 'partner' || P.phase === 'setup')) bodyHtml = bodyHtml.replace('<!--bc-->', (P.result ? '' : roleBanner(P)) + (P.kind === 'spiel' ? '' : ansageHtml(P)));
  if (withRules) bodyHtml += faqHtml(P, rulesKey(P));
  return scr(head, (free ? '' : hcStepBar(P)) + (P.result ? '' : dice) + bodyHtml + mainSwitch(P) + (free ? '' : prepHint(P)), v.foot);
}
/* during a task: the next minigame, covered */
function prepHint(P) {
  if (['spiel', 'frage', 'schaetzen', 'quiz', 'wwe', 'gast', 'partner', 'glueck', 'toast', 'menge', 'mission'].indexOf(P.kind) < 0 || P.last) return '';
  return peekCard();
}
V.step = function () { return renderStepScreen(R() && R().pending, false); };
V.free = function () { return renderStepScreen(S.free && S.free.step, true); };

/* =========================================================
   Live link (master view + guest view)
   ========================================================= */
function liveAnswers() { return S.live ? (lsGet(LIVE_ANS + S.live.code) || []) : []; }
V.live = function () {
  var L = S.live;
  if (!L) return V.home();
  var ans = liveAnswers();
  var link = APP_URL + '#gast-live';
  var wa = 'Live-Runde! Stimm hier ab, nur für diese Frage freigeschaltet: ' + link;
  var summary = '';
  if (L.kind === 'schaetzen' || L.kind === 'bereich') {
    var med = median(ans.map(function (a) { return Number(a.v); }));
    summary = '<div class="card pad mt14 row"><span class="grow name">Mittlerer Tipp der Gruppe</span><span class="num" style="font:800 20px var(--display)">' + (med == null ? '–' : fmtNum(med)) + ' ' + esc(L.unit || '') + '</span></div>';
  } else if (L.kind === 'wwe' || L.kind === 'auswahl') {
    var labels = L.kind === 'wwe' ? L.cands.map(function (c) { return c.name; }) : L.options;
    var keys = L.kind === 'wwe' ? L.cands.map(function (c) { return c.id; }) : L.options.map(function (o, i) { return String(i); });
    var cnt = {}; ans.forEach(function (a) { cnt[a.v] = (cnt[a.v] || 0) + 1; });
    summary = '<div class="card padrows mt14">' + keys.map(function (k, i) { var n = cnt[k] || 0; return '<div class="vote-row" style="min-height:52px"><span class="grow stack gap6"><span class="name">' + esc(labels[i]) + '</span><span class="bar"><b style="width:' + (ans.length ? Math.round(n / ans.length * 100) : 0) + '%"></b></span></span><span class="num" style="font:800 18px var(--display);min-width:28px;text-align:right">' + n + '</span></div>'; }).join('') + '</div>';
  }
  var list = ans.slice(-6).reverse().map(function (a) { return '<span class="tag" style="height:28px">' + esc(a.n || 'Gast') + '</span>'; }).join('');
  var body = '<div class="bigcard stack gap10" style="background:var(--sun)"><span class="badge">Live, nur diese Frage</span><h2>' + esc(L.text) + '</h2></div>' +
    '<div class="mt14">' + shareBlock(link, wa, L.code, 'openGuestLive') + '</div>' +
    '<span class="eyebrow mt18 block">' + ans.length + ' ' + (ans.length === 1 ? 'Antwort' : 'Antworten') + '</span>' + (list ? '<div class="chips mt10">' + list + '</div>' : '<p class="small mt6">Noch keine Antworten. Die Liste aktualisiert sich von selbst.</p>') + summary;
  return scr(topbar(UI.liveFrom, 'Gruppe per Link'), body, '<button type="button" class="cta" data-act="liveApply"' + (ans.length ? '' : ' disabled') + '>Runde schließen und übernehmen</button>');
};
V.guestLive = function () {
  var L = UI.guestMode === 'link' ? lsGet(LIVE_KEY) : S.live;
  var banner = UI.guestMode === 'test' ? '<div class="testbanner">' + icon('i-user', 18) + '<span class="grow">Testansicht: So sehen die Gäste die Live-Frage.</span><button type="button" class="tag plain" data-act="go" data-to="' + (L && L.kind === 'menge' ? (UI.liveFrom === 'free' ? 'free' : 'step') : 'live') + '" style="height:30px;color:var(--sun)">Zurück</button></div>' : '';
  var head = banner + '<div class="' + (banner ? 'mt14' : '') + '">' + guestHeader('Live') + '</div>';
  if (!L || !L.open) return scr(head, '<div class="bigcard waitcard mt14" style="background:var(--violet)">' + garland(350, ['#15122B', '#FFFFFF', '#48D9A6', '#FFC940', '#FF7A45', '#15122B']) +
    '<span class="wait-e" aria-hidden="true">' + sockIc('#FF7A45', 40) + '</span><span class="badge">Live-Runde</span><h2>Gleich geht’s los.</h2>' +
    '<p>Sobald der Spielleiter eine Abstimmung startet, erscheint sie hier. Lass die Seite einfach offen.</p><span class="wait-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>' +
    '<div class="card pad mt14 row" style="align-items:flex-start"><span class="tile-ic" style="width:40px;height:40px;border-radius:12px;background:var(--sun)">' + icon('i-bubble', 20) + '</span><span class="stack grow" style="gap:3px"><span class="name">So läuft’s</span><span class="sub">Frage lesen, antippen, abschicken. Dein Tipp landet sofort beim Spielleiter, dein Name nur, wenn du ihn einträgst.</span></span></div>', '');
  if (UI.liveSent) {
    return scr(head, '<div class="bigcard stack gap10" style="background:var(--mint)"><span class="badge">Abgestimmt</span><h2>Danke! Das Ergebnis siehst du gleich beim Spielleiter.</h2></div>',
      '<button type="button" class="cta" data-act="liveNext">Nächster Gast stimmt ab</button>');
  }
  var input = '';
  if (L.kind === 'schaetzen') {
    var sv = UI.liveVal === '' ? '' : Number(UI.liveVal), smax = L.sMax || 100;
    input = '<div class="card pad mt18"><div class="row" style="justify-content:space-between"><span class="name">Dein Tipp</span><span class="num" id="lvShow" style="font:800 20px var(--display)">' + (sv === '' ? '–' : fmtNum(sv) + ' ' + esc(L.unit || '')) + '</span></div>' +
      '<label class="sr" for="lvr">Tipp per Schieberegler</label><input id="lvr" class="range mt10" type="range" min="0" max="' + smax + '" step="' + (L.sStep || 1) + '" value="' + (sv === '' ? 0 : Math.min(sv, smax)) + '" data-bind="liveValRange">' +
      '<div class="row sub" style="justify-content:space-between"><span>0</span><span>' + fmtNum(smax) + '</span></div></div>' +
      '<label class="field mt14" for="lv">Oder genau eintippen' + (L.unit ? ' (' + esc(L.unit) + ')' : '') + '<input id="lv" class="input" type="number" inputmode="decimal" data-bind="liveVal" value="' + esc(UI.liveVal) + '" placeholder="Zahl"></label>';
  }
  if (L.kind === 'bereich') {
    var v = UI.liveVal === '' ? Math.round((Number(L.min) + Number(L.max)) / 2) : Number(UI.liveVal);
    input = '<div class="card pad mt18"><div class="row" style="justify-content:space-between"><span class="name">Dein Tipp</span><span class="num" id="lvShow" style="font:800 20px var(--display)">' + fmtNum(v) + ' ' + esc(L.unit || '') + '</span></div><label class="sr" for="lvr">Tipp</label><input id="lvr" class="range mt10" type="range" min="' + L.min + '" max="' + L.max + '" value="' + v + '" data-bind="liveValRange"></div>';
  }
  if (L.kind === 'auswahl') input = '<div class="stack gap8 mt18">' + L.options.map(function (o, i) { var s = UI.liveVal === String(i); return '<button type="button" class="opt' + (s ? ' is-sel' : '') + '" data-act="liveChoose" data-v="' + i + '" aria-pressed="' + s + '" style="padding:14px;border-radius:18px;font-size:15px;font-weight:700">' + esc(o) + '</button>'; }).join('') + '</div>';
  if (L.kind === 'wwe') input = '<div class="grid2 mt18">' + L.cands.map(function (c) { var s = UI.liveVal === c.id; var p = person(c.id); return '<button type="button" class="opt' + (s ? ' is-sel' : '') + '" data-act="liveChoose" data-v="' + c.id + '" aria-pressed="' + s + '" style="min-height:170px;border-radius:24px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px">' + (p.av ? face(p, 84) : groupFace(84)) + '<span style="font:800 16px var(--display)">' + esc(c.name) + '</span></button>'; }).join('') + '</div>';
  if (L.kind === 'menge') {
    var mv = UI.mengeVals || [], openM = L.items.filter(function (x, k) { return mv[k] !== 0 && mv[k] !== 1; }).length;
    var bodyM = '<div style="border-radius:28px;background:var(--sun);padding:22px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.14)"><span class="badge" style="display:inline-block;padding:5px 10px;border-radius:99px;background:var(--ink);color:var(--white);font:800 11px var(--display)">Gegen die Menge</span><h1 class="mt10" style="font:800 21px/1.22 var(--display);color:var(--ink);text-wrap:balance">Was magst du lieber?</h1><p class="mt6" style="color:var(--ink);font-weight:700">Fünf schnelle Fragen. Die Geburtstagskinder müssen gleich raten, was die meisten gewählt haben.</p></div>' +
      L.items.map(function (it, k) { return '<div class="card pad mt14"><span class="eyebrow block">' + (k + 1) + ' von ' + L.items.length + '</span><p class="name mt6" style="font-size:16px;line-height:1.38">' + esc(it.t) + '</p><div class="row gap8 mt10">' + it.o.map(function (o, j) { var sel = mv[k] === j; return '<button type="button" class="opt row' + (sel ? ' is-sel' : '') + '" data-act="liveMenge" data-k="' + k + '" data-o="' + j + '" aria-pressed="' + sel + '" style="min-height:52px;border-radius:16px;padding:8px 12px;gap:10px;flex:1"><span class="grow" style="font-size:15px;font-weight:800">' + esc(o) + '</span><span class="check">' + icon('i-check', 14) + '</span></button>'; }).join('') + '</div></div>'; }).join('') +
      '<label class="field mt18" for="ln">Dein Name (optional)<input id="ln" class="input" type="text" data-bind="liveName" value="' + esc(UI.liveName) + '"></label>';
    return scr(head, bodyM, '<button type="button" class="cta" data-act="liveSubmit"' + (openM ? ' disabled' : '') + '>' + (openM ? 'Noch ' + openM + ' offen' : 'Abschicken') + '</button><p class="small" style="text-align:center">Anonym · niemand sieht, was du gewählt hast</p>');
  }
  var body = '<div style="border-radius:28px;background:var(--violet);padding:22px;box-shadow:inset 0 -6px 0 rgba(0,0,0,.14)"><h1 style="font:800 21px/1.22 var(--display);color:var(--ink);text-wrap:balance">' + esc(L.text) + '</h1></div>' +
    '<label class="field mt18" for="ln">Dein Name (optional)<input id="ln" class="input" type="text" data-bind="liveName" value="' + esc(UI.liveName) + '"></label>' + input;
  return scr(head, body, '<button type="button" class="cta" data-act="liveSubmit">Abschicken</button><p class="small" style="text-align:center">Kein Download nötig · nur für diese Frage freigeschaltet</p>');
};

