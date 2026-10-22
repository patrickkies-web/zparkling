/* =========================================================
   Games with their own little screen. The app only helps to play
   them (reaction pad, word caller, secret picks, 90-second rounds,
   a covered sentence). The result always goes the usual way: one
   tap, the Pilot decides the drinks, nothing else is counted.
   The master can always enter the result by hand.
   ========================================================= */
var A = A || {};
/* every new game step gets its own state here */
function prepGameStep(P, ctx) {
  var g = gameById(P.game); if (!g) return P;
  if (P.format === 'duellGast' && g.sp !== 'ketchup') chInit(P);
  if (g.sp === 'lippen') { var ln = drawLine(P.main, 'lippen'); P.lip = { line: ln, own: LIP_LINES.indexOf(ln) < 0, show: false, ears: '' }; }
  if (g.sp === 'gedanken') P.gl = { phase: 'pick', partner: '', partnerId: '', typed: false, spin: null, cats: drawMindCats(P.main), a: [], b: [], at: 0 };
  if (g.sp === 'ketchup') P.kc = { phase: 'setup', mate: '', typed: false, rivals: [], counts: [null, null], at: 0, end: 0, terms: drawTerms(70), ti: 0 };
  if (g.sp === 'blitz') P.bz = { res: [] };
  if (TERM_GAMES[g.id]) { var tf = drawTermsFor(P.main, TERM_GAMES[g.id]); P.terms = { list: tf.list, own: tf.own, show: false }; }
  if (g.sp === 'loeffel') P.lr = { wins: [0, 0], round: 1 };
  return P;
}
function spStep(sp) { var P = stepNow(); if (!P || P.kind !== 'spiel' || P.result) return null; var g = gameOf(P); return g && g.sp === sp ? P : null; }
function oppName(P) { return P.format === 'duell' ? person(P.opp).name : chGuestLabel(P); }
/* the result buttons of a game, by format; hi = the side the app suggests */
function spielButtons(P, hi) {
  var fmt = P.format, mp = person(P.main), cls = function (k, base) { return base + (hi === k ? ' suggest' : ''); };
  if (fmt === 'duell') return '<div class="cta-row"><button type="button" class="' + cls('main', 'btn-dark') + '" style="flex:1" data-act="stepResolve" data-v="win" data-id="' + P.main + '">' + icon('i-trophy', 18) + esc(mp.name) + '</button><button type="button" class="' + cls('opp', 'btn-dark') + '" style="flex:1" data-act="stepResolve" data-v="win" data-id="' + P.opp + '">' + icon('i-trophy', 18) + esc(person(P.opp).name) + '</button></div>';
  if (fmt === 'duellGast' || fmt === 'gruppe') return '<div class="cta-row"><button type="button" class="' + cls('opp', 'btn-dark') + '" style="flex:1" data-act="stepResolve" data-v="fail">' + esc(chGuestLabel(P)) + ' gewinnt</button><button type="button" class="' + cls('main', 'cta mint') + '" style="flex:1" data-act="stepResolve" data-v="ok">' + esc(mp.name) + ' gewinnt</button></div>';
  return '<div class="cta-row"><button type="button" class="' + cls('opp', 'btn-dark') + '" style="flex:1" data-act="stepResolve" data-v="fail">Nicht geschafft</button><button type="button" class="' + cls('main', 'cta mint') + '" style="flex:1" data-act="stepResolve" data-v="ok">' + icon('i-check', 18) + 'Geschafft</button></div>';
}
function manualLink() { return '<button type="button" class="linkbtn" style="align-self:center" data-act="spManual">Ergebnis von Hand eintragen</button>'; }
A.spManual = function () { var P = stepNow(); if (!P) return; P.manual = !P.manual; commit(); };
function roundDots(list, n, cur) {
  return '<div class="ladder mt14">' + Array.apply(null, Array(n)).map(function (x, i) { var st = i < list.length ? (list[i] ? 'ok' : 'no') : i === cur ? 'now' : ''; return '<span class="lstep ' + st + '"><b>' + (i + 1) + '</b></span>'; }).join('') + '</div>';
}
var SPV = {};

/* ---------- Lippenlesen ---------- */
SPV.lippen = function (P, g) {
  var lip = P.lip || { line: drawLine(P.main, 'lippen'), show: false };
  var body = spielCard(P, g) +
    '<span class="eyebrow mt18 block">Wer hält ' + (P.format === 'team' ? 'euch' : 'dir') + ' die Ohren zu?</span>' + pickerHtml({ act: 'lipEars', sel: lip.ears, bind: 'lip.ears', typed: lip.typed ? lip.ears : '', label: 'Wer hält die Ohren zu?' }) +
    '<span class="eyebrow mt18 block">Der Satz, nur für den Sprecher</span>' +
    '<button type="button" class="lipbox' + (lip.show ? ' open' : '') + '" data-act="lipShow" aria-pressed="' + !!lip.show + '">' + (lip.show ? '<b>' + esc(lip.line) + '</b>' + (lip.own ? '<small>' + emb('wand', 16) + 'Passend zu ' + esc(person(P.main).name) + ', aus den Beiträgen der Gäste</small>' : '') + '<span class="sub">Antippen zum Verdecken</span>' : '<span class="lip-dots" aria-hidden="true">●●●● ●●● ●●●●●</span><span class="sub">Nur der Sprecher tippt hier. ' + esc(person(P.main).name) + ' schaut weg!</span>') + '</button>' +
    '<button type="button" class="linkbtn mt6" data-act="lipNew">' + icon('i-shuffle', 15) + 'Anderer Satz</button>' + timerBlock(90, P.sid + 'lip');
  return { body: body, foot: spielButtons(P) };
};
A.lipShow = function () { var P = spStep('lippen'); if (!P) return; P.lip.show = !P.lip.show; commit(); };
A.lipNew = function () { var P = spStep('lippen'); if (!P) return; var ln = drawLine(P.main, 'lippen', P.lip.line); P.lip.line = ln; P.lip.own = LIP_LINES.indexOf(ln) < 0; P.lip.show = true; commit(); };
A.lipEars = function (d) { var P = spStep('lippen'); if (!P) return; P.lip.ears = P.lip.ears === d.v && !P.lip.typed ? '' : d.v; P.lip.typed = false; commit(); };

/* ---------- terms for the master to whisper ---------- */
function termBoxHtml(P) {
  var t = P.terms; if (!t || !t.list || !t.list.length || P.result) return '';
  return '<span class="eyebrow mt18 block">Begriffe für den Spielleiter</span><button type="button" class="lipbox' + (t.show ? ' open' : '') + '" data-act="termShow" aria-pressed="' + !!t.show + '">' +
    (t.show ? '<span class="terms">' + t.list.map(function (x) { return '<b' + (t.own.indexOf(x) >= 0 ? ' class="own"' : '') + '>' + esc(x) + '</b>'; }).join('') + '</span>' + (t.own.length ? '<small>' + emb('wand', 16) + 'Markiert: passend zu ' + esc(person(P.main).name) + ', aus den Worten der Gäste</small>' : '') + '<span class="sub">Antippen zum Verdecken</span>'
      : '<span class="lip-dots" aria-hidden="true">●●●●● ●●●● ●●●●●●</span><span class="sub">Nur der Spielleiter schaut. Flüstern, darstellen, raten!</span>') + '</button>';
}
A.termShow = function () { var P = stepNow(); if (!P || !P.terms) return; P.terms.show = !P.terms.show; commit(); };

/* ---------- Gedankenleser ---------- */
function glHits(gl) { var h = 0; (gl.a || []).forEach(function (x, i) { if (x != null && x === gl.b[i]) h++; }); return h; }
function glDecided(gl) { var played = gl.b.length, h = glHits(gl); return h >= 3 || h + (5 - played) < 3 || played >= 5; }
SPV.gedanken = function (P, g) {
  var gl = P.gl, mp = person(P.main), pn = gl.partner || 'dein Partner', body = '', foot = '';
  if (P.manual) return { body: spielCard(P, g), foot: spielButtons(P) + manualLink() };
  if (gl.phase === 'pick') {
    var others = E().focus.filter(function (p) { return p.id !== P.main; }).map(function (p) { return { label: p.name, v: p.name, face: face(p, 40) }; });
    body = spielCard(P, g) + '<span class="eyebrow mt18 block">Wer liest die Gedanken von ' + esc(mp.name) + '?</span>' + pickerHtml({ act: 'glPartner', sel: gl.partner, bind: 'gl.partner', typed: gl.typed ? gl.partner : '', wheel: 'glWheel', spin: gl.spin, extra: others, label: 'Partner auswählen' });
    foot = (spinning(gl.spin) ? '<button type="button" class="cta" disabled>' + emb('wheel', 26) + 'Das Rad dreht …</button>' : '<button type="button" class="cta" data-act="glGo">' + emb('brain', 26) + (gl.partner ? 'Los, mit ' + esc(gl.partner) : 'Los geht’s') + '</button>') + manualLink();
    return { body: body, foot: foot };
  }
  var hits = glHits(gl), c = gl.cats[gl.at] || gl.cats[0], picks = function (act, mark) {
    return '<div class="gl-grid mt14">' + c.terms.map(function (t, i) { return '<button type="button" class="gl-t' + (mark === i ? ' is-sel' : '') + '" data-act="' + act + '" data-i="' + i + '"><span>' + esc(t) + '</span></button>'; }).join('') + '</div>';
  };
  var head = '<div class="gl-head"><span class="gl-e" aria-hidden="true">' + emb('brain', 34) + '</span><span class="stack grow" style="gap:2px"><span class="gl-l">Runde ' + Math.min(5, gl.at + 1) + ' von 5 · ' + hits + (hits === 1 ? ' Treffer' : ' Treffer') + '</span><b class="gl-c">' + esc(c.cat) + '</b></span></div>' + roundDots(gl.b.map(function (x, i) { return gl.a[i] === x; }), 5, gl.at);
  if (gl.phase === 'a') {
    body = head + '<p class="lead mt14" style="color:var(--text)"><b>' + esc(mp.name) + ' tippt heimlich.</b> ' + esc(pn) + ' schaut weg!</p>' + picks('glA', null);
    foot = manualLink();
  } else if (gl.phase === 'pass') {
    body = head + '<div class="gl-pass mt14">' + emb('lock', 48) + '<b>Gewählt!</b><span>Jetzt das Handy verdeckt an ' + esc(pn) + ' geben.</span></div>';
    foot = '<button type="button" class="cta" data-act="glPass">' + esc(gl.partner || 'Partner') + ' ist bereit</button>';
  } else if (gl.phase === 'b') {
    body = head + '<p class="lead mt14" style="color:var(--text)"><b>' + esc(pn) + ', was hat ' + esc(mp.name) + ' gewählt?</b> Bauchgefühl!</p>' + picks('glB', null);
    foot = manualLink();
  } else if (gl.phase === 'reveal') {
    var k = gl.b.length - 1, cc = gl.cats[k], same = gl.a[k] === gl.b[k];
    body = head + '<div class="gl-rev ' + (same ? 'ok' : 'no') + ' mt14"><span>' + esc(mp.name) + ': <b>' + esc(cc.terms[gl.a[k]]) + '</b></span><span>' + esc(pn) + ': <b>' + esc(cc.terms[gl.b[k]]) + '</b></span><strong>' + (same ? 'Gedanken gelesen!' : 'Leider daneben.') + '</strong></div>';
    foot = glDecided(gl) ? '<button type="button" class="cta" data-act="glDone">Zum Ergebnis</button>' : '<button type="button" class="cta" data-act="glNext">Nächste Runde</button>';
  } else {
    body = head + '<div class="card pad mt14"><p class="name" style="font-size:16px">' + hits + ' von ' + gl.b.length + ' Runden gleich. ' + (hits >= 3 ? 'Ihr seid ein Herz und eine Seele.' : 'Nötig waren drei.') + '</p></div>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Auswerten</button>';
  }
  return { body: body, foot: foot };
};
function glStep() { var P = spStep('gedanken'); return P && P.gl ? P : null; }
A.glPartner = function (d) { var P = glStep(); if (!P) return; P.gl.partner = P.gl.partner === d.v && !P.gl.typed ? '' : d.v; P.gl.typed = false; P.gl.spin = null; commit(); };
A.glWheel = function () { var P = glStep(); if (!P) return; var pool = guestPool(); if (pool.length < 2) return; var s = spinPick(pool); P.gl.partner = s.name; P.gl.typed = false; P.gl.spin = s; commit(); afterSpin(P); };
A.glGo = function () {
  var P = glStep(); if (!P) return;
  var nm = String(P.gl.partner || '').trim() || 'Ein Gast', f = E().focus.filter(function (p) { return p.id !== P.main && p.name.toLowerCase() === nm.toLowerCase(); })[0];
  P.gl.partner = nm; P.gl.partnerId = f ? f.id : ''; P.gl.phase = 'a'; P.gl.at = 0; P.gl.a = []; P.gl.b = []; P.gl.spin = null; commit();
};
A.glA = function (d) { var P = glStep(); if (!P || P.gl.phase !== 'a') return; P.gl.a[P.gl.at] = +d.i; P.gl.phase = 'pass'; commit(); };
A.glPass = function () { var P = glStep(); if (!P || P.gl.phase !== 'pass') return; P.gl.phase = 'b'; commit(); };
A.glB = function (d) { var P = glStep(); if (!P || P.gl.phase !== 'b') return; P.gl.b[P.gl.at] = +d.i; P.gl.phase = 'reveal'; commit(); try { if (navigator.vibrate) navigator.vibrate(P.gl.a[P.gl.at] === +d.i ? [30, 40, 30] : 60); } catch (e) {} };
A.glNext = function () { var P = glStep(); if (!P || P.gl.phase !== 'reveal') return; if (glDecided(P.gl)) { P.gl.phase = 'done'; commit(); return; } P.gl.at += 1; P.gl.phase = 'a'; commit(); };
A.glDone = function () { var P = glStep(); if (!P) return; P.gl.phase = 'done'; commit(); };

/* ---------- Ketchup-Montagsmaler ---------- */
function kcTeams(P) {
  var kc = P.kc, mp = person(P.main), duel = P.format === 'duell';
  var t0 = [mp.name, kc.mate || 'Partner'], t1 = duel ? [person(P.opp).name, kc.rivals[0] || 'Partner'] : [kc.rivals[0] || 'Gast 1', kc.rivals[1] || 'Gast 2'];
  return [t0, t1];
}
SPV.ketchup = function (P, g) {
  var kc = P.kc, mp = person(P.main), duel = P.format === 'duell', T = kcTeams(P), body = '', foot = '';
  if (P.manual) return { body: spielCard(P, g), foot: spielButtons(P) + manualLink() };
  var score = '<div class="kc-score mt14">' + [0, 1].map(function (i) { return '<span class="kc-team' + (kc.at === i && kc.phase !== 'done' && kc.phase !== 'setup' ? ' now' : '') + '"><small>Team ' + (i + 1) + '</small><b>' + esc(T[i].join(' & ')) + '</b><em>' + (kc.counts[i] == null ? '–' : kc.counts[i]) + '</em></span>'; }).join('<i class="kc-vs">:</i>') + '</div>';
  if (kc.phase === 'setup') {
    body = spielCard(P, g) + '<span class="eyebrow mt18 block">Wer rät mit ' + esc(mp.name) + '?</span>' + pickerHtml({ act: 'kcMate', sel: kc.mate, bind: 'kc.mate', typed: kc.typed ? kc.mate : '', label: 'Partner auswählen' }) +
      '<span class="eyebrow mt18 block">' + (duel ? 'Wer rät mit ' + esc(person(P.opp).name) + '?' : 'Das andere Team: zwei Gäste') + '</span>' +
      '<div class="pk-grid mt10">' + guestPool().filter(function (n) { return n !== kc.mate; }).slice(0, 18).map(function (n) { var s = kc.rivals.indexOf(n) >= 0; return '<button type="button" class="pk' + (s ? ' is-sel' : '') + '" data-act="kcRival" data-v="' + esc(n) + '" aria-pressed="' + s + '">' + guestFace(n, 40) + '<span>' + esc(n) + '</span></button>'; }).join('') + '</div>' +
      '<p class="small mt8">Namen sind freiwillig. Gezählt wird bei Gästen nichts.</p>';
    foot = '<button type="button" class="cta" data-act="kcReady">' + emb('ketchup', 26) + 'Teams stehen</button>' + manualLink();
  } else if (kc.phase === 'ready') {
    body = score + '<div class="kc-ready mt14">' + emb('ketchup', 56) + '<b>Team ' + (kc.at + 1) + ': ' + esc(T[kc.at].join(' & ')) + '</b><span>' + esc(T[kc.at][0]) + ' malt und schaut aufs Handy, ' + esc(T[kc.at][1]) + ' rät und schaut auf den Teller. 90 Sekunden.</span></div>';
    foot = '<button type="button" class="cta" data-act="kcGo">' + icon('i-clock', 18) + '90 Sekunden starten</button>';
  } else if (kc.phase === 'play') {
    var left = kc.end - Date.now(), over = left <= 0;
    body = score + '<div class="kc-play' + (over ? ' over' : '') + ' mt14"><span class="kc-time num" data-spend="' + kc.end + '" data-sprender="1">' + (over ? 'Zeit um!' : mmss(left)) + '</span>' +
      (over ? '<b class="kc-term">' + kc.counts[kc.at] + (kc.counts[kc.at] === 1 ? ' Begriff' : ' Begriffe') + '</b>' : '<small>Malen:</small><b class="kc-term">' + esc(kc.terms[kc.ti % kc.terms.length]) + '</b>') + '</div>';
    foot = over ? '<button type="button" class="cta" data-act="kcStop">' + (kc.at === 0 ? 'Team 2 ist dran' : 'Zum Ergebnis') + '</button>'
      : '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="kcSkip">Überspringen</button><button type="button" class="cta mint" style="flex:1.4" data-act="kcHit">' + icon('i-check', 18) + 'Erraten!</button></div><button type="button" class="linkbtn" style="align-self:center" data-act="kcStop">Runde beenden</button>';
  } else {
    var c0 = kc.counts[0] || 0, c1 = kc.counts[1] || 0;
    body = score + '<div class="card pad mt14"><p class="name" style="font-size:16px">' + (c0 === c1 ? 'Gleichstand, ' + c0 + ' zu ' + c1 + '. Niemand trinkt.' : 'Team ' + (c0 > c1 ? 1 : 2) + ' gewinnt ' + Math.max(c0, c1) + ' zu ' + Math.min(c0, c1) + '.') + '</p></div>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="eval">Auswerten</button>';
  }
  return { body: body, foot: foot };
};
function kcStep() { var P = spStep('ketchup'); return P && P.kc ? P : null; }
A.kcMate = function (d) { var P = kcStep(); if (!P) return; P.kc.mate = P.kc.mate === d.v && !P.kc.typed ? '' : d.v; P.kc.typed = false; P.kc.rivals = P.kc.rivals.filter(function (x) { return x !== P.kc.mate; }); commit(); };
A.kcRival = function (d) {
  var P = kcStep(); if (!P) return; var rv = P.kc.rivals, at = rv.indexOf(d.v), max = P.format === 'duell' ? 1 : 2;
  if (at >= 0) rv.splice(at, 1); else { rv.push(d.v); while (rv.length > max) rv.shift(); }
  commit();
};
A.kcReady = function () { var P = kcStep(); if (!P) return; P.kc.phase = 'ready'; P.kc.at = 0; commit(); };
A.kcGo = function () { var P = kcStep(); if (!P || P.kc.phase !== 'ready') return; P.kc.end = Date.now() + 90000; P.kc.counts[P.kc.at] = 0; P.kc.phase = 'play'; commit(); };
A.kcHit = function () { var P = kcStep(); if (!P || P.kc.phase !== 'play') return; if (Date.now() > P.kc.end) { render(); return; } P.kc.counts[P.kc.at] += 1; P.kc.ti += 1; commit(); try { if (navigator.vibrate) navigator.vibrate(20); } catch (e) {} };
A.kcSkip = function () { var P = kcStep(); if (!P || P.kc.phase !== 'play') return; P.kc.ti += 1; commit(); };
A.kcStop = function () { var P = kcStep(); if (!P || P.kc.phase !== 'play') return; if (P.kc.at === 0) { P.kc.at = 1; P.kc.phase = 'ready'; } else P.kc.phase = 'done'; commit(); };

/* ---------- Daumen-Blitz ---------- */
function bzState(P) { if (!UI.bz || UI.bz.sid !== P.sid) { if (UI.bz && UI.bz.timer) clearTimeout(UI.bz.timer); UI.bz = { sid: P.sid, state: 'idle', goAt: 0, timer: null }; } return UI.bz; }
function bzWins(P) { var w = [0, 0]; P.bz.res.forEach(function (x) { if (x.w === 0 || x.w === 1) w[x.w]++; }); return w; }
function bzSoloOk(P) { return P.bz.res.filter(function (x) { return x.ms != null && x.ms < 400; }).length >= 2; }
function bzDone(P) { if (P.format === 'solo') return P.bz.res.length >= 3; var w = bzWins(P); return w[0] >= 2 || w[1] >= 2; }
SPV.blitz = function (P, g) {
  var st = bzState(P), duel = P.format !== 'solo', done = bzDone(P), mp = person(P.main), names = [mp.name, duel ? oppName(P) : ''];
  var secs = function (ms) { return (ms / 1000).toFixed(2).replace('.', ',') + ' s'; };
  var res = duel ? bzWins(P) : null;
  var list = P.bz.res.map(function (x, i) { return '<span class="bz-r">' + (duel ? (i + 1) + '. ' + esc(names[x.w]) + (x.early != null ? ' (Fehlstart ' + esc(names[x.early]) + ')' : x.ms != null ? ' · ' + secs(x.ms) : '') : (i + 1) + '. ' + (x.ms == null ? 'Zu früh' : secs(x.ms))) + '</span>'; }).join('');
  /* the round starts from the middle of the pads: there is nothing to look for below */
  var startLabel = duel ? 'Runde ' + (P.bz.res.length + 1) + ' starten' : 'Versuch ' + (P.bz.res.length + 1) + ' von 3';
  var mid = st.state === 'idle' && !done
    ? '<button type="button" class="bz-go" data-act="bzStart">' + emb('bolt', 20) + startLabel + '</button>'
    : '<div class="bz-mid" id="bzMid">' + (st.state === 'wait' ? 'Noch nicht! Gleich wird’s grün …' : st.state === 'go' ? 'JETZT!' : 'Entschieden!') + '</div>';
  var arena = duel
    ? '<div class="bz-arena st-' + st.state + '" id="bzArena"><button type="button" class="bz-pad top" data-bz="1"><span>' + esc(names[1]) + ' · ' + res[1] + '</span></button>' + mid + '<button type="button" class="bz-pad bot" data-bz="0"><span>' + esc(names[0]) + ' · ' + res[0] + '</span></button></div>'
    : '<div class="bz-arena solo st-' + st.state + '" id="bzArena"><button type="button" class="bz-pad bot" data-bz="0"><span>' + esc(mp.name) + '</span></button>' + mid + '</div>';
  var hi = done ? (duel ? (res[0] >= 2 ? 'main' : 'opp') : (bzSoloOk(P) ? 'main' : 'opp')) : '';
  var body = spielCard(P, g) + arena + (list ? '<div class="bz-list mt10">' + list + '</div>' : '') +
    (done ? '<p class="small mt10" style="text-align:center">' + (duel ? esc(names[res[0] >= 2 ? 0 : 1]) + ' holt zwei Runden.' : bzSoloOk(P) ? 'Zwei Versuche unter 0,4 Sekunden. Geschafft!' : 'Nicht zweimal unter 0,4 Sekunden.') + ' Unten bestätigen.</p>' : '');
  return { body: body, foot: spielButtons(P, hi) };
};
A.bzStart = function () {
  var P = spStep('blitz'); if (!P || bzDone(P)) return;
  var st = bzState(P); if (st.state !== 'idle') return;
  st.state = 'wait'; render();
  st.timer = setTimeout(function () {
    if (UI.bz !== st || st.state !== 'wait') return;
    var P2 = stepNow(); if (!P2 || P2.sid !== st.sid) { st.state = 'idle'; return; }
    st.state = 'go'; st.goAt = Date.now();
    var el = document.getElementById('bzArena'), mid = document.getElementById('bzMid');
    if (el) { el.classList.remove('st-wait'); el.classList.add('st-go'); }
    if (mid) mid.textContent = 'JETZT!';
  }, 1200 + Math.random() * 2600);
};
function bzTap(side) {
  var P = spStep('blitz'); if (!P) return;
  var st = bzState(P), duel = P.format !== 'solo';
  if (st.state === 'wait') {
    clearTimeout(st.timer); st.state = 'idle';
    P.bz.res.push(duel ? { w: 1 - side, early: side } : { ms: null, early: 0 });
  } else if (st.state === 'go') {
    var ms = Date.now() - st.goAt; st.state = 'idle';
    P.bz.res.push(duel ? { w: side, ms: ms } : { ms: ms });
  } else return;
  try { if (navigator.vibrate) navigator.vibrate(40); } catch (e) {}
  commit();
}

/* ---------- Löffel-Reflex ---------- */
function lrState(P) { if (!UI.lr || UI.lr.sid !== P.sid) { if (UI.lr && UI.lr.timer) clearTimeout(UI.lr.timer); UI.lr = { sid: P.sid, state: 'idle', words: [], i: -1, timer: null }; } return UI.lr; }
function lrDone(P) { return P.lr.wins[0] >= 2 || P.lr.wins[1] >= 2; }
SPV.loeffel = function (P, g) {
  var st = lrState(P), done = lrDone(P), names = [person(P.main).name, oppName(P)], w = P.lr.wins;
  var word = st.state === 'idle' ? (done ? 'Entschieden!' : '…') : st.words[st.i] || '…';
  var voice = UI.lrVoice !== false;
  var body = spielCard(P, g) +
    '<div class="lr-score mt14"><span><b>' + esc(names[0]) + '</b><em>' + w[0] + '</em></span><i>' + emb('spoon', 30) + '</i><span><b>' + esc(names[1]) + '</b><em>' + w[1] + '</em></span></div>' +
    '<div class="lr-word' + (st.state === 'grab' ? ' grab' : '') + ' mt14" id="lrWord" aria-live="assertive">' + esc(word) + '</div>';
  var foot = '';
  if (st.state === 'call') {
    body += '<p class="small mt10" style="text-align:center">Greift jemand bei einem falschen Wort zu, tipp auf seinen Fehlgriff.</p>';
    foot = '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="lrFoul" data-v="0">Fehlgriff ' + esc(names[0]) + '</button><button type="button" class="btn-dark" style="flex:1" data-act="lrFoul" data-v="1">Fehlgriff ' + esc(names[1]) + '</button></div><button type="button" class="linkbtn" style="align-self:center" data-act="lrStop">Runde abbrechen</button>';
  } else if (st.state === 'grab') {
    foot = '<span class="eyebrow" style="text-align:center">Wer hatte den Löffel zuerst?</span><div class="cta-row"><button type="button" class="cta" style="flex:1" data-act="lrPoint" data-v="0">' + esc(names[0]) + '</button><button type="button" class="cta" style="flex:1" data-act="lrPoint" data-v="1">' + esc(names[1]) + '</button></div>';
  } else {
    body += (done ? '<p class="small mt10" style="text-align:center">' + esc(names[w[0] >= 2 ? 0 : 1]) + ' holt zwei Runden. Unten bestätigen.</p>' : '<button type="button" class="btn-dark mt14" style="width:100%" data-act="lrStart">' + emb('spoon', 22) + 'Runde ' + (w[0] + w[1] + 1) + ': Wörter rufen</button>') +
      '<button type="button" class="linkbtn mt6" data-act="lrVoice">' + icon(voice ? 'i-bubble' : 'i-close', 15) + (voice ? 'Wörter werden vorgelesen' : 'Stumm, nur auf dem Bildschirm') + '</button>';
    foot = spielButtons(P, done ? (w[0] >= 2 ? 'main' : 'opp') : '');
  }
  return { body: body, foot: foot };
};
function lrSchedule(st) {
  st.timer = setTimeout(function () {
    if (UI.lr !== st || st.state !== 'call') return;
    var P2 = stepNow(); if (!P2 || P2.sid !== st.sid || UI.screen === 'run') { st.state = 'idle'; return; }
    st.i += 1; var w = st.words[st.i];
    var el = document.getElementById('lrWord');
    if (w === 'Löffel') { st.state = 'grab'; render(); if (UI.lrVoice !== false) sayNow('Löffel!'); return; }
    if (el) { el.textContent = w; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
    if (UI.lrVoice !== false) sayNow(w);
    lrSchedule(st);
  }, 900 + Math.random() * 1300);
}
A.lrStart = function () {
  var P = spStep('loeffel'); if (!P || lrDone(P)) return;
  var st = lrState(P); if (st.state !== 'idle') return;
  var n = 3 + Math.floor(Math.random() * 7);
  st.words = shuffle(SPOON_DECOYS).slice(0, n).concat(['Löffel']); st.i = -1; st.state = 'call';
  render(); lrSchedule(st);
};
function lrEnd(P, winner) { var st = lrState(P); clearTimeout(st.timer); st.state = 'idle'; P.lr.wins[winner] += 1; P.lr.round += 1; commit(); }
A.lrPoint = function (d) { var P = spStep('loeffel'); if (!P || lrState(P).state !== 'grab') return; lrEnd(P, +d.v); };
A.lrFoul = function (d) { var P = spStep('loeffel'); if (!P || lrState(P).state === 'idle') return; lrEnd(P, 1 - (+d.v)); };
A.lrStop = function () { var P = spStep('loeffel'); if (!P) return; var st = lrState(P); clearTimeout(st.timer); st.state = 'idle'; render(); };
A.lrVoice = function () { UI.lrVoice = UI.lrVoice === false; render(); };

/* ---------- results of the games that count themselves ---------- */
function resolveSpecial(P, d) {
  var g = gameOf(P); if (!g || (g.sp !== 'gedanken' && g.sp !== 'ketchup')) return null;
  var main = P.main, mp = person(main), forced = d.v === 'ok' || d.v === 'fail' || d.v === 'win';
  if (g.sp === 'gedanken') {
    var gl = P.gl || { a: [], b: [], cats: [], partner: '' };
    if (!forced && gl.phase !== 'done') return false;
    var hits = glHits(gl), ok = forced ? (d.v === 'ok' || (d.v === 'win' && d.id === main)) : hits >= 3, rows = [], pn = gl.partner || 'Der Partner';
    if (!ok) {
      rows.push(drinkRow(main, 'Gedanken nicht gelesen'));
      if (gl.partnerId && isFocus(gl.partnerId) && gl.partnerId !== main) rows.push(drinkRow(gl.partnerId, 'Gedanken nicht gelesen'));
      else rows.push({ pid: '', name: pn, n: 1, group: true, note: 'trinkt mit' });
    }
    recordAttempt(main, ok); if (gl.partnerId && isFocus(gl.partnerId) && gl.partnerId !== main) recordAttempt(gl.partnerId, ok);
    var lines = (gl.b || []).map(function (x, i) { var c = gl.cats[i]; return { ok: gl.a[i] === x, t: c.cat + (/[?!]$/.test(c.cat) ? ' ' : ': ') + c.terms[gl.a[i]] + ' / ' + c.terms[x] }; });
    return { ok: ok, rows: rows, title: ok ? (forced ? 'Gedanken gelesen!' : hits + ' Treffer, Gedanken gelesen!') : (forced ? 'Gedanken nicht gelesen' : 'Nur ' + hits + ' Treffer, beide trinken'), tone: ok ? 'ok' : 'fail', text: mp.name + ' und ' + pn, lines: lines, win: ok ? [main].concat(gl.partnerId && isFocus(gl.partnerId) ? [gl.partnerId] : []) : [] };
  }
  /* Ketchup: two teams of two, fewer terms drinks, a tie lets everyone off */
  var kc = P.kc || { counts: [0, 0], rivals: [], mate: '' }, duel = P.format === 'duell', T = P.kc ? kcTeams(P) : [[mp.name, 'Partner'], ['Gast', 'Gast']];
  if (!forced && kc.phase !== 'done') return false;
  var c0 = kc.counts[0] || 0, c1 = kc.counts[1] || 0, tie = !forced && c0 === c1;
  var win0 = forced ? (d.v === 'ok' || (d.v === 'win' && d.id === main)) : c0 > c1;
  var rws = [];
  if (!tie) {
    if (!win0) { rws.push(drinkRow(main, 'Ketchup verloren')); rws.push(nameRow(kc.mate || 'Partner', 1)); }
    else if (duel) { rws.push(drinkRow(P.opp, 'Ketchup verloren')); rws.push(nameRow(kc.rivals[0] || 'Partner', 1)); }
    else rws.push({ pid: '', name: joinNames(T[1]), n: 1, group: true, note: 'Ketchup verloren' });
  }
  recordAttempt(main, tie || win0); if (duel) recordAttempt(P.opp, tie || !win0);
  return { ok: tie || win0, rows: rws, title: tie ? 'Gleichstand, ' + c0 + ' zu ' + c1 : (win0 ? T[0].join(' & ') : T[1].join(' & ')) + (forced ? ' gewinnen' : ' gewinnen ' + Math.max(c0, c1) + ' zu ' + Math.min(c0, c1)), tone: tie ? 'sun' : win0 ? 'ok' : 'fail', text: tie ? 'Niemand trinkt.' : '', lines: [], win: tie ? [] : win0 ? [main] : duel ? [P.opp] : [] };
}

/* countdowns of the special games: text only; once at zero, one render to show the next button */
function spTick() {
  var els = document.querySelectorAll('[data-spend]');
  for (var k = 0; k < els.length; k++) {
    var left = +els[k].getAttribute('data-spend') - Date.now();
    if (left > 0) els[k].textContent = mmss(left);
    else if (els[k].getAttribute('data-sprender') === '1') { els[k].setAttribute('data-sprender', '0'); try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} render(); return; }
  }
}
