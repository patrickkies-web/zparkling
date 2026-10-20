/* =========================================================
   The master's own entries. As interactive as the guest link (the same
   cards, the same live checks), but for someone who enters a lot:
   - a plan for the evening: per kind what is there and what a good
     evening needs, one tap adds a card
   - "Als Nächstes": the kind that is missing most, with an idea
   - master levels on a larger scale; a level-up shows in the bar at the
     top when saving, nothing pops in between
   Everything saved is approved at once.
   ========================================================= */
var M_KINDS = ['worte', 'schaetzen', 'auswahl', 'bereich', 'aufgabe'];
var M_LEVELS = [[0, 'Planer', 'pen'], [5, 'Gastgeber', 'balloon'], [12, 'Quizmaster', 'target'], [22, 'Showmaster', 'popper'], [35, 'Spielleiter-Profi', 'crown'], [50, 'Legende des Abends', 'trophy']];
function mGoal(t) { var f = E() ? E().focus.length : 1; return { worte: f, schaetzen: 5, auswahl: 5, bereich: 3, aufgabe: 4 }[t] || 3; }
/* the example evening opens two kinds, the rest comes with the Game Pass */
function mDemoOk(t) { return !demoOn() || t === 'worte' || t === 'schaetzen'; }
function mSaved() { return S.questions.filter(function (q) { return !q.ai && q.author === 'Spielleiter' && q.status !== 'nein'; }).length; }
function mReady() { return gForm().items.filter(gDone).length; }
function mLevel(n) { var i = 0; M_LEVELS.forEach(function (x, k) { if (n >= x[0]) i = k; }); return { i: i, l: M_LEVELS[i], next: M_LEVELS[i + 1] || null }; }
/* what the evening already has of a kind: approved from anyone, plus what is ready in the form */
function mHave(t) { return S.questions.filter(function (q) { return q.type === t && q.status === 'ok' && !q.ai; }).length + gForm().items.filter(function (it) { return it.type === t && gDone(it); }).length; }
function mNext() {
  var list = M_KINDS.filter(mDemoOk).map(function (t) { return { t: t, r: mHave(t) / Math.max(1, mGoal(t)) }; }).filter(function (x) { return x.r < 1; });
  list.sort(function (a, b) { return a.r - b.r; });
  return list[0] ? list[0].t : '';
}
function mIdea(t) {
  var p = E() && E().focus[0], N = p ? p.name : 'die Hauptperson', Ns = p ? possessive(p.name) : 'ihr';
  return { worte: 'Ein Wort, wie ' + N + ' ist, und eins, wofür ' + N + ' brennt.', schaetzen: 'Zum Beispiel: Wie viele Länder hat ' + N + ' schon bereist?', auswahl: 'Zum Beispiel: Was war ' + Ns + ' erster Berufswunsch?', bereich: 'Zum Beispiel: Wie viele Stunden schläft ' + N + ' am Wochenende?', aufgabe: 'Zum Beispiel: drei Zungenbrecher am Stück, ohne Fehler.' }[t] || '';
}
function mWhat(t) { return { worte: 'Daraus werden Sätze, Sprüche und Fragen', schaetzen: 'Wer näher dran ist, gewinnt', auswahl: 'Eine von bis zu vier Antworten stimmt', bereich: 'Mit dem Schieberegler raten', aufgabe: 'Etwas tun, mit eigener Regel' }[t] || ''; }
function mHudInner() {
  var n = mSaved(), add = mReady(), lv = mLevel(n), nx = lv.next;
  var span = nx ? nx[0] - lv.l[0] : 1, pct = nx ? Math.round((n - lv.l[0]) / span * 100) : 100, pct2 = nx ? Math.min(100, Math.round((n + add - lv.l[0]) / span * 100)) : 100;
  return '<span class="glvl-e" aria-hidden="true">' + emb(lv.l[2], 28) + '</span>' +
    '<span class="stack grow" style="gap:5px;min-width:0"><span class="lvl">' + esc(lv.l[1]) + '</span>' +
    '<span class="gbar mbar" role="progressbar" aria-label="Spielleiter-Level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:' + pct2 + '%"></i><b style="width:' + pct + '%"></b></span>' +
    '<span class="ghint">' + (nx ? (add ? '+' + add + ' beim Speichern · ' : '') + 'Noch ' + Math.max(0, nx[0] - n) + ' bis ' + esc(nx[1]) : 'Höchstes Level erreicht!') + '</span></span>' +
    '<span class="stack" style="align-items:flex-end;gap:1px"><span class="pts num">' + n + '</span><small class="mhud-s">eingetragen</small></span>';
}
function mHudPatch() { var el = document.getElementById('mpass'); if (el && !el.querySelector('.ghfx')) el.innerHTML = mHudInner(); }
function mCtaLabel() {
  var G = gForm(), n = G.items.length, d = G.items.filter(gDone).length;
  if (!n) return 'Speichern';
  if (d === n) return (n === 1 ? '1 Eintrag' : n + ' Einträge') + ' speichern';
  return (n === 1 ? '1 Eintrag' : n + ' Einträge') + ' · ' + d + ' von ' + n + ' fertig';
}
function mPlanRow(t) {
  var st = qStyle(t), have = mHave(t), goal = mGoal(t), ok = mDemoOk(t), pct = Math.min(100, Math.round(have / Math.max(1, goal) * 100)), n = gCount(t);
  if (!ok) return '<button type="button" class="m-goal lock" data-act="demoLocked" style="--tc:' + st.c + '"><span class="m-goal-e">' + emb(st.e, 26) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>' + esc(qTypeLabel(t)) + '</b><small>Mit dem Game Pass</small></span>' + icon('i-lock', 16) + '</button>';
  return '<button type="button" class="m-goal' + (have >= goal ? ' full' : '') + '" data-act="gAdd" data-v="' + t + '" style="--tc:' + st.c + '"><span class="m-goal-e">' + emb(st.e, 26) + '</span>' +
    '<span class="stack grow" style="gap:4px;min-width:0"><span class="row" style="gap:8px;justify-content:space-between"><b>' + esc(qTypeLabel(t)) + '</b><span class="m-goal-n">' + have + ' von ' + goal + '</span></span>' +
    '<span class="m-goal-bar"><i style="width:' + pct + '%"></i></span><small>' + esc(mWhat(t)) + (n ? ' · ' + n + ' in Arbeit' : '') + '</small></span><span class="m-goal-add" aria-hidden="true">' + icon('i-plus', 18) + '</span></button>';
}
function masterStudio() {
  var G = gForm(), e = E(), nx = mNext(), names = e && e.focus.length ? focusNames() : 'die Hauptperson';
  var head = topbar('questions', 'Selbst eintragen') + '<div class="ghud mhud" id="mpass">' + mHudInner() + '</div>';
  var saved = UI.mSaved ? '<div class="m-saved mt10">' + icon('i-check', 18) + '<span class="grow">' + (UI.mSaved.n === 1 ? 'Ein Eintrag ist' : UI.mSaved.n + ' Einträge sind') + ' gespeichert und freigegeben' + (UI.mSaved.up ? '. Neues Level: ' + esc(UI.mSaved.up) + '!' : '.') + '</span><button type="button" class="linkbtn" data-act="go" data-to="questions">Ansehen</button></div>' : '';
  var coach = nx ? '<div class="m-next mt14" style="--tc:' + qStyle(nx).c + '"><span class="m-next-k">' + icon('i-sparkle', 14) + 'Als Nächstes</span><div class="row gap10 mt8"><span class="m-next-e">' + emb(qStyle(nx).e, 34) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>' + esc(qTypeLabel(nx)) + '</b><span>' + esc(mIdea(nx)) + '</span></span></div>' +
    '<button type="button" class="m-next-go" data-act="gAdd" data-v="' + nx + '">' + icon('i-plus', 16) + 'Jetzt eintragen</button></div>'
    : '<div class="m-next done mt14"><span class="m-next-k">' + icon('i-check', 14) + 'Alles drin</span><b class="block mt8">Stark! Der Abend hat alles, was er braucht.</b><span class="block small mt6">Mehr geht immer: Jede weitere Frage macht die Runden bunter.</span></div>';
  var plan = '<span class="eyebrow mt22 block">Dein Plan für den Abend</span><div class="m-plan mt10">' + M_KINDS.map(mPlanRow).join('') + '</div>';
  var order = M_KINDS, numBy = {};
  var list = G.items.map(function (it, i) { return { it: it, i: i }; }).sort(function (a, b) { return order.indexOf(a.it.type) - order.indexOf(b.it.type) || a.i - b.i; });
  var cards = list.map(function (x) { numBy[x.it.type] = (numBy[x.it.type] || 0) + 1; return gCard(x.it, x.i, qTypeLabel(x.it.type) + (gCount(x.it.type) > 1 ? ' ' + numBy[x.it.type] : '')); }).join('');
  var work = '<span class="eyebrow mt22 block">In Arbeit' + (G.items.length ? ' · ' + G.items.length : '') + '</span>' +
    (cards || '<div class="empty mt10">Tipp links im Plan eine Art an oder nimm den Vorschlag. Die Karte erscheint hier, du füllst sie aus und speicherst alles auf einmal.</div>') +
    (UI.qErr ? '<p class="err mt14">' + esc(UI.qErr) + '</p>' : '');
  var intro = saved + '<h1 class="h1 mt10">Deine Fragen für den Abend</h1><p class="lead mt8">Du kennst ' + esc(names) + ' am besten. Was du hier einträgst, ist sofort freigegeben und landet in den Runden.</p>';
  var body = intro + dk(coach + plan, work, 'dk-master');
  var all = G.items.length > 0 && G.items.every(gDone);
  return scr(head, body, '<button type="button" class="cta' + (all ? ' mint gready' : '') + '" id="gcta" data-act="mSave">' + esc(mCtaLabel()) + '</button>', 'gscr mscr dw');
}
A.mSave = function () {
  var G = gForm(), out = [], first = -1;
  UI.qErr = '';
  if (!G.items.length) { UI.qErr = 'Tipp im Plan an, was du eintragen willst.'; gRender(); return; }
  G.items.forEach(function (it, i) { var r = draftToQ(it, 'Spielleiter', true), miss = gMissing(it); it.err = miss.length ? 'Fehlt noch: ' + miss.join(', ') : r.err; if (it.err) { if (first < 0) first = i; } else out.push(r.q); });
  if (first >= 0) {
    var bad = G.items.filter(function (x) { return x.err; }).length;
    UI.qErr = bad === 1 ? 'Bei einem Eintrag fehlt noch etwas, er ist rot markiert.' : 'Bei ' + bad + ' Einträgen fehlt noch etwas, sie sind rot markiert.';
    UI.gShake = true; gVibe([40, 30, 40]); gRender(); scrollToEl('gi' + first); return;
  }
  var lv0 = mLevel(mSaved()).i;
  out.forEach(function (q, i) { q.id = q.id + 'm' + i; q.t = q.t + i; q.author = 'Spielleiter'; q.status = 'ok'; });
  S.questions = S.questions.concat(out); save();
  G.items = []; UI.gRare = null;
  var lv = mLevel(mSaved()), up = lv.i > lv0;
  UI.mSaved = { n: out.length, up: up ? lv.l[1] : '' };
  gRender(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0;
  gVibe(up ? [30, 60, 30, 60, 120] : [20, 40, 20]);
  setToast(out.length === 1 ? 'Gespeichert und freigegeben' : out.length + ' Einträge gespeichert und freigegeben');
  if (up) gHudFx('lv', '<span class="ghfx-rays" aria-hidden="true"></span><span class="ghfx-e">' + emb(lv.l[2], 34) + '</span><span class="stack" style="gap:1px;min-width:0"><small>Level-Up!</small><b>' + esc(lv.l[1]) + '</b></span>', 2600);
};
