/* =========================================================
   Party cards and Trinkbuddys.
   - Two more bonus cards next to the Joker: Weiterleiten (silver) and
     the Regel-Karte. Guests draw them in the guest link, the master
     approves them, the guest keeps them for the party.
   - Trinkbuddys, in every mode: at the first task everyone in the focus
     picks a buddy who drinks along. From the first shared drink the bond
     holds a random one to three further games, then a new buddy.
     Whoever is picked and holds Weiterleiten can pass the job on.
   - The Regel-Karte: its holder names a rule, everyone in the focus
     keeps it for five minutes. Breaking it costs one drink, once.
   - The card area: every card in circulation, the timers, and, once the
     guest round is closed, the cards to print with the holders' names.
   ========================================================= */
var RULE_MIN = 5;
var PC_KINDS = ['regel', 'weiter', 'joker'];
QTYPES.push(
  ['weiter', 'Weiterleiten', 'Bonuskarte: wer sie hat und als Trinkbuddy gewählt wird, gibt den Job an jemand anderen weiter.', 'karte'],
  ['regel', 'Regel-Karte', 'Bonuskarte: auf der Party eine Regel aufstellen, die Hauptpersonen halten sie fünf Minuten ein.', 'karte']
);
GQ_STYLE.weiter = { c: '#D9E1EA', e: 'forward', stamp: 'Silber' };
GQ_STYLE.regel = { c: '#FF9A62', e: 'gavel', stamp: 'Regel' };
QK_SHORT.weiter = 'Weiterleiten'; QK_SHORT.regel = 'Regel';
GK_RAR.push({ id: 'wei', name: 'Silber', c: '#EEF2F7', c2: '#8E9BAB', pts: 25 }, { id: 'reg', name: 'Regel', c: '#FF7A45', c2: '#FFC940', pts: 25 });
GQ_REACT.done_weiter = ['Silber! Wer dich als Trinkbuddy will, muss sich warm anziehen.', 'Die Weiterleiten-Karte. Damit bist du schwer zu fassen.'];
GQ_MOOD.done_weiter = 'jubel';
GQ_REACT.done_regel = ['Du darfst eine Regel aufstellen? Bitte sei nett zu mir.', 'Eine Regel-Karte! Ich ahne Schlimmes.'];
GQ_MOOD.done_regel = 'verliebt';
EMB_ART.forward = '<g transform="rotate(-9 22 25)"><rect x="7" y="9" width="27" height="33" rx="5" fill="#E6ECF3" stroke="#1B1530" stroke-width="2.5"/><path d="M12 14l16 0" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".9"/></g>' +
  '<path d="M13 35c3-10 11-15 23-14" fill="none" stroke="#1B1530" stroke-width="3.4" stroke-linecap="round"/><path d="M32 14l7 7-8 6" fill="none" stroke="#1B1530" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
  '<path d="M40 33l1.4 3.2 3.2 1.4-3.2 1.4-1.4 3.2-1.4-3.2-3.2-1.4 3.2-1.4z" fill="#FFFFFF" stroke="#1B1530" stroke-width="1.6" stroke-linejoin="round"/>';
EMB_ART.gavel = '<g transform="rotate(-38 25 21)"><rect x="12" y="11" width="24" height="11" rx="3" fill="#FF9A62" stroke="#1B1530" stroke-width="2.5"/><rect x="8.5" y="12.5" width="4.5" height="8" rx="1.6" fill="#FFC940" stroke="#1B1530" stroke-width="2.2"/><rect x="35" y="12.5" width="4.5" height="8" rx="1.6" fill="#FFC940" stroke="#1B1530" stroke-width="2.2"/><rect x="21.6" y="22" width="4.8" height="20" rx="2.2" fill="#C98B55" stroke="#1B1530" stroke-width="2.2"/></g>' +
  '<rect x="5" y="38" width="24" height="6" rx="2.2" fill="#FFC940" stroke="#1B1530" stroke-width="2.2"/>';

/* ---------- the cards in circulation ---------- */
function pcKey(n) { return String(n || '').trim().toLowerCase(); }
/* the same person: the same name, or the same first name ("Lea" and "Lea M.") */
function pcSame(a, b) { a = pcKey(a); b = pcKey(b); if (!a || !b) return false; return a === b || a.split(/\s+/)[0] === b.split(/\s+/)[0]; }
function pcAll(t) { if (demoOn()) return []; return S.questions.filter(function (q) { return q.type === t && q.status !== 'nein' && isGuestAuthor(q.author); }); }
function pcFree(t) { return pcAll(t).filter(function (q) { return q.status === 'ok' && !q.used; }); }
function pcAny() { return PC_KINDS.some(function (t) { return pcAll(t).length > 0; }); }
function pcName(t) { return { joker: 'Joker', weiter: 'Weiterleiten', regel: 'Regel-Karte' }[t]; }
function pcTitle(t) { return { joker: 'Der Joker', weiter: 'Weiterleiten', regel: 'Die Regel-Karte' }[t]; }
function pcText(t) {
  if (t === 'joker') return 'Befreit eine Hauptperson einmal von einem ' + U() + '. Du entscheidest, ob du ihn einlöst.';
  if (t === 'weiter') return 'Wirst du Trinkbuddy, gibst du den Job an jemand anderen weiter. Einmal einsetzbar.';
  return 'Stell eine Regel auf. Die Hauptpersonen halten sie fünf Minuten ein. Wer sie bricht, trinkt ein ' + U() + '.';
}
function runLive() { var r = R(); return r && !r.finished ? r : null; }

/* ---------- Trinkbuddys ----------
   Picked at the first task. The bond starts with the first drink of the person in the focus
   (the buddy drinks along), then holds a random one to three further games, decided by the app.
   After that, a new buddy is picked at the next task. */
function bud(r) {
  if (!r.bud) r.bud = { on: true, map: {}, prev: {}, next: {}, fwd: {}, bond: {}, due: false, n: 0 };
  ['map', 'prev', 'next', 'fwd', 'bond'].forEach(function (k) { if (!r.bud[k]) r.bud[k] = {}; });
  return r.bud;
}
/* this person needs a (new) buddy: none yet, or the bond is over */
function budNeeds(r, pid) { var b = bud(r), x = b.bond[pid]; return !b.map[pid] || !x || x.state === 'end'; }
/* called when the next task is drawn */
function budCheck(r) { if (!r || r.finished) return; var b = bud(r); if (b.on && !b.due && r.who.some(function (id) { return budNeeds(r, id); })) { b.due = true; b.next = {}; b.fwd = {}; } }
function budDue(r) { return !!(r && !r.finished && r.pending && bud(r).on && bud(r).due); }
/* who drinks along with this person right now */
function budOf(pid) { var r = runLive(); if (!r || !bud(r).on || !isFocus(pid)) return ''; var b = bud(r), x = b.bond[pid]; return b.map[pid] && x && x.state !== 'end' ? b.map[pid] : ''; }
function budRand() { return 1 + Math.floor(Math.random() * 3); }
function budGames(n) { return n === 1 ? '1 Spiel' : n + ' Spiele'; }
/* a drink outside a game (the counter, a broken rule): the first one starts the bond */
function budStart(pid) {
  var r = runLive(); if (!r || !bud(r).on) return;
  var b = bud(r), x = b.bond[pid]; if (!x || x.state !== 'wait' || !b.map[pid]) return;
  x.state = 'on'; logRun('info', person(pid).name + ' trinkt, ' + budName(b.map[pid]) + ' trinkt mit. Verbunden für noch ' + budGames(x.left));
}
/* after a game: does the buddy drink along, how long the bond still holds */
function budSettle(P) {
  var r = runLive(); if (!r || !P || !P.result || P.budDone || !bud(r).on) return;
  var b = bud(r); P.budDone = true; P.budInfo = {};
  r.who.forEach(function (pid) {
    var x = b.bond[pid], name = b.map[pid]; if (!x || !name || x.state === 'end') return;
    var row = (P.result.rows || []).filter(function (y) { return y.pid === pid && !y.group; })[0];
    var drinks = !!(row && row.n > 0 && !row.freed && !row.water), info = { name: name, along: false, left: x.left, end: false, start: false };
    if (x.state === 'on') {
      info.along = drinks; x.left -= 1; info.left = Math.max(0, x.left);
      if (x.left <= 0) { x.state = 'end'; info.end = true; logRun('info', person(pid).name + ' und ' + budName(name) + ': die Verbindung ist vorbei'); }
    } else if (drinks) {
      x.state = 'on'; info.along = true; info.start = true; info.left = x.left;
      logRun('info', person(pid).name + ' trinkt, ' + budName(name) + ' trinkt mit. Verbunden für noch ' + budGames(x.left));
    }
    P.budInfo[pid] = info;
  });
  save();
}
function budCard(name) { return budAnon(name) ? null : pcFree('weiter').filter(function (q) { return pcSame(q.author, name); })[0] || null; }
/* a buddy without a name: the master only confirms that someone was found. Nobody has to type a name. */
var BUD_ANON = '\u2022';
function budAnon(n) { return n === BUD_ANON; }
function budName(n) { return budAnon(n) ? 'der Trinkbuddy' : String(n || ''); }
/* names to pick from: the guests known by name (sent something via the link, crew, named tonight), not the previous buddy,
   not someone another focus person already took, not who just passed it on */
function budKnown() {
  var out = [], seen = {}, e = E(), foc = e ? e.focus.map(function (p) { return pcKey(p.name); }) : [];
  var add = function (n) { n = String(n || '').trim(); var k = pcKey(n); if (!n || seen[k] || foc.indexOf(k) >= 0 || budAnon(n)) return; seen[k] = 1; out.push(n); };
  (typeof guestSubmissions === 'function' ? guestSubmissions() : []).forEach(function (q) { if (q && q.status !== 'nein' && isGuestAuthor(q.author)) add(q.author); });
  presentNames().forEach(add);
  return out;
}
function budPool(r, pid, picks) {
  var b = bud(r), taken = {};
  Object.keys(picks).forEach(function (k) { if (k !== pid && picks[k] && !budAnon(picks[k])) taken[pcKey(picks[k])] = 1; });
  r.who.forEach(function (k) { if (k !== pid && !budNeeds(r, k) && b.map[k] && !budAnon(b.map[k])) taken[pcKey(b.map[k])] = 1; });
  var all = budKnown().filter(function (n) { return !taken[pcKey(n)] && !pcSame(n, b.fwd[pid]); });
  var fresh = all.filter(function (n) { return !pcSame(n, b.map[pid]); });
  return fresh.length ? fresh : all;
}
function budMode() { var r = runLive(); if (!r) return ''; if (budDue(r)) return 'swap'; if (UI.budFwd && r.who.indexOf(UI.budFwd) >= 0) return 'fwd'; return ''; }
V.buddy = function () {
  var r = runLive(), mode = budMode();
  if (!mode) { UI.budFwd = null; return V.run(); }
  var b = bud(r), picks = mode === 'swap' ? b.next : {}, ids = mode === 'swap' ? r.who.filter(function (id) { return budNeeds(r, id); }) : [UI.budFwd];
  var first = mode === 'swap' && !b.n, all = ids.every(function (id) { return picks[id]; });
  var hero = '<div class="bd-hero' + (first ? ' first' : '') + '"><span class="bd-glasses" aria-hidden="true">' + emb('cheers', 92) + '</span>' +
    '<h1>' + (mode === 'fwd' ? 'Weitergeleitet!' : first ? 'Zeit für Trinkbuddys!' : 'Neuer Trinkbuddy!') + '</h1>' +
    '<p>' + (mode === 'fwd' ? esc(b.fwd[UI.budFwd] || '') + ' hat die Weiterleiten-Karte gezogen. Wer übernimmt den Job?'
      : first ? 'Jede Hauptperson sucht sich jemanden aus. Muss sie trinken, trinkt ihr Buddy mit. Wie lange ihr verbunden bleibt, entscheidet die App: ab dem ersten gemeinsamen ' + esc(U()) + ' noch ein bis drei Spiele.'
      : 'Die Verbindung ist vorbei. Wer trinkt als Nächstes mit? Ab dem ersten gemeinsamen ' + esc(U()) + ' hält sie wieder ein bis drei Spiele.') + '</p></div>';
  var rows = ids.map(function (id) {
    var p = person(id), pick = picks[id], pool = budPool(r, id, picks), card = pick ? budCard(pick) : null;
    var was = b.map[id] && mode === 'swap' ? (budAnon(b.map[id]) ? 'Bisher: jemand ohne Namen' : 'Bisher: ' + esc(b.map[id])) : 'Wer trinkt mit?';
    var head = '<div class="bd-who">' + face(p, 46, '', 'jubel') + '<span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(p.name) + ' wählt</b><span>' + (b.fwd[id] ? esc(b.fwd[id]) + ' hat weitergeleitet' : was) + '</span></span></div>';
    if (pick) {
      var anon = budAnon(pick);
      return '<div class="bd-row done">' + head + '<div class="bd-pick">' + (anon ? '<span class="bd-anon">' + emb('cheers', 28) + '</span>' : guestFace(pick, 44, '', 'jubel')) + '<span class="stack grow" style="gap:1px;min-width:0"><b>' + (anon ? 'Buddy gefunden' : esc(pick)) + '</b><span>trinkt mit, wenn ' + esc(p.name) + ' trinkt</span></span><button type="button" class="linkbtn" data-act="budClear" data-id="' + id + '">Ändern</button></div>' +
        (card ? '<div class="bd-fwd"><span class="bd-fwd-e">' + emb('forward', 30) + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(pick) + ' hat eine Weiterleiten-Karte</b><span>Setzt sie die Karte ein, sucht sie aus, wer stattdessen mittrinkt.</span></span><button type="button" class="bd-fwd-go" data-act="budFwd" data-id="' + id + '">Weiterleiten</button></div>' : '') + '</div>';
    }
    /* no typing here: the names known from the link (and the crew) as chips, otherwise one tap that says "found someone" */
    var chips = pool.map(function (n) { return '<button type="button" class="bd-chip" data-act="budPick" data-id="' + id + '" data-v="' + esc(n) + '">' + guestFace(n, 30) + '<span>' + esc(n) + '</span></button>'; }).join('');
    var ok = '<button type="button" class="bd-chip ok" data-act="budPick" data-id="' + id + '" data-v="' + BUD_ANON + '">' + icon('i-check', 16) + '<span>' + (pool.length ? 'Jemand anderes, ohne Namen' : 'Buddy gefunden') + '</span></button>';
    return '<div class="bd-row">' + head + '<p class="small mt8">' + (pool.length ? 'Antippen, wer mittrinkt, oder einfach bestätigen. Namen sind freiwillig.' : 'Einfach bestätigen, sobald sich jemand gefunden hat. Niemand muss einen Namen eintippen.') + '</p><div class="bd-chips">' + chips + ok + '</div></div>';
  }).join('');
  var body = hero + '<div class="bd-rows">' + rows + '</div>';
  var foot = mode === 'swap' ? '<button type="button" class="cta mint" data-act="budGo"' + (all ? '' : ' disabled') + '>' + icon('i-check', 18) + (all ? 'Prost, weiter zur Aufgabe' : ids.length > 1 ? 'Erst alle Buddys wählen' : 'Erst den Buddy wählen') + '</button>' : '';
  return scr(topbar(mode === 'fwd' ? (UI.budFrom || 'run') : 'run', mode === 'fwd' ? 'Weiterleiten' : 'Trinkbuddys'), body, foot, 'bdscr');
};
A.budPick = function (d) {
  var r = runLive(), name = String(d.v || '').trim(); if (!r || !name || !d.id) return;
  var b = bud(r), mode = budMode(); if (!budAnon(name)) notePresent(name); UI.budType = null; UI.budTxt = '';
  if (mode === 'fwd') {
    b.map[d.id] = name; delete b.fwd[d.id]; UI.budFwd = null;
    logRun('info', (budAnon(name) ? 'Jemand' : name) + ' übernimmt als Trinkbuddy für ' + person(d.id).name);
    commit(); go(UI.budFrom || 'run'); setToast((budAnon(name) ? 'Der neue Buddy' : name) + ' trinkt jetzt mit ' + person(d.id).name + ' mit'); return;
  }
  b.next[d.id] = name; commit();
};
A.budClear = function (d) { var r = runLive(); if (!r) return; delete bud(r).next[d.id]; commit(); };
A.budTypeOpen = function (d) { UI.budType = d.id; UI.budTxt = ''; render(); var el = document.getElementById('budIn'); if (el && el.focus) try { el.focus(); } catch (e) {} };
A.budTypeOk = function (d) { var v = String(UI.budTxt || '').trim(); if (v.length < 2) { setToast('Bitte einen Namen eintippen'); return; } A.budPick({ id: d.id, v: v }); };
/* the picked buddy plays Weiterleiten: the card is used, someone else has to be chosen; the bond goes on */
A.budFwd = function (d) {
  var r = runLive(); if (!r) return;
  var b = bud(r), swap = budDue(r) && budNeeds(r, d.id), name = swap ? b.next[d.id] : b.map[d.id], q = budCard(name);
  if (!name || !q) return;
  q.used = true; q.usedAt = now(); q.usedFor = person(d.id).name;
  b.fwd[d.id] = name;
  if (swap) delete b.next[d.id];
  else { UI.budFwd = d.id; UI.budFrom = UI.screen === 'buddy' ? (UI.budFrom || 'run') : UI.screen; }
  logRun('info', name + ' setzt die Weiterleiten-Karte ein');
  try { if (navigator.vibrate) navigator.vibrate([30, 40, 30, 40, 90]); } catch (e) {}
  commit(); if (!swap) go('buddy'); setToast(name + ' leitet weiter!');
};
A.budGo = function () {
  var r = runLive(); if (!r) return; var b = bud(r), ids = r.who.filter(function (id) { return budNeeds(r, id); });
  if (!b.due || !ids.every(function (id) { return b.next[id]; })) return;
  ids.forEach(function (id) { b.prev[id] = b.map[id]; b.map[id] = b.next[id]; var n = budRand(); b.bond[id] = { state: 'wait', left: n, total: n }; });
  b.next = {}; b.fwd = {}; b.due = false; b.n += 1;
  logRun('info', (b.n === 1 ? 'Trinkbuddys: ' : 'Neuer Trinkbuddy: ') + ids.map(function (id) { return person(id).name + ' mit ' + (budAnon(b.map[id]) ? 'jemandem' : b.map[id]); }).join(', '));
  commit(); go('step');
};

/* ---------- rules ---------- */
function rulesOf(r) { if (!r.rules) r.rules = []; return r.rules; }
function ruleLive(x) { return !x.done && now() < x.until; }
/* rules whose five minutes are over: closed once, with a line in the log */
function ruleSweep() {
  var r = runLive(); if (!r) return false;
  var ch = false;
  rulesOf(r).forEach(function (x) {
    if (x.done || now() < x.until) return;
    x.done = true; ch = true;
    var ok = x.who.filter(function (id) { return !x.broke[id]; }).map(function (id) { return person(id).name; });
    logRun('info', 'Regel vorbei' + (ok.length ? ': ' + joinNames(ok) + (ok.length === 1 ? ' hat' : ' haben') + ' durchgehalten' : ''));
  });
  return ch;
}
A.ruleOpen = function (d) {
  if (!runLive()) { setToast('Regeln gehen los, sobald das Spiel läuft'); return; }
  UI.ruleDraft = { qid: d.id, text: '' }; render();
  var el = document.getElementById('ruleIn'); if (el && el.focus) try { el.focus(); } catch (e) {}
};
A.ruleCancel = function () { UI.ruleDraft = null; render(); };
A.ruleStart = function () {
  var r = runLive(), dr = UI.ruleDraft; if (!r || !dr) return;
  var q = pcFree('regel').filter(function (x) { return x.id === dr.qid; })[0], text = String(dr.text || '').trim();
  if (!q || text.length < 2) { setToast('Wie lautet die Regel?'); return; }
  q.used = true; q.usedAt = now(); q.usedFor = text;
  rulesOf(r).push({ id: uid('rl'), qid: q.id, by: q.author, text: text, t0: now(), until: now() + RULE_MIN * 60000, who: r.who.slice(), broke: {}, done: false });
  UI.ruleDraft = null;
  logRun('info', 'Regel von ' + q.author + ': ' + text);
  try { if (navigator.vibrate) navigator.vibrate([40, 50, 40]); } catch (e) {}
  commit(); setToast('Die Regel gilt jetzt fünf Minuten');
};
/* broken: one drink, no matter how often; never over the maximum */
A.ruleBroke = function (d) {
  var r = runLive(); if (!r) return;
  var x = rulesOf(r).filter(function (y) { return y.id === d.id; })[0];
  if (!x || !ruleLive(x) || x.broke[d.pid] || x.who.indexOf(d.pid) < 0) return;
  x.broke[d.pid] = true;
  var p = person(d.pid), bg = budget(d.pid), bd = budOf(d.pid);
  if (bg.C < bg.M) { addDrink(d.pid, 1, 'regel', 'Regel gebrochen: ' + x.text); budStart(d.pid); bd = budOf(d.pid); setToast(p.name + ' trinkt ein ' + U() + (bd ? ', ' + budName(bd) + ' trinkt mit' : '')); x.water = x.water || {}; }
  else { x.water = x.water || {}; x.water[d.pid] = true; setToast(p.name + ' ist am Maximum, es gibt Wasser'); }
  logRun('fail', p.name + ' hat die Regel gebrochen' + (bg.C < bg.M ? ' und trinkt ein ' + U() : ', am Maximum gibt es Wasser'));
  commit();
};

/* ---------- live timers ---------- */
function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60); s = s % 60; return m + ':' + (s < 10 ? '0' : '') + s; }
function zt(until, done, rer) { return '<b class="zt num" data-until="' + until + '"' + (done ? ' data-done="' + esc(done) + '"' : '') + (rer ? ' data-rerender="1"' : '') + '>' + (until > now() ? mmss(until - now()) : esc(done || '0:00')) + '</b>'; }
function ztTick() {
  if (typeof document === 'undefined' || !document.querySelectorAll) return;
  var els = document.querySelectorAll('[data-until]'), re = false;
  for (var i = 0; i < els.length; i++) {
    var el = els[i], left = +el.getAttribute('data-until') - now();
    if (left > 0) el.textContent = mmss(left);
    else { el.textContent = el.getAttribute('data-done') || '0:00'; if (el.getAttribute('data-rerender')) re = true; }
  }
  if (re && ruleSweep()) commit();
}
if (typeof window !== 'undefined' && window.requestAnimationFrame && typeof setInterval === 'function') setInterval(ztTick, 1000);

/* one active rule: the text, the clock, who broke it */
function ruleHtml(x, compact) {
  var live = ruleLive(x);
  var ppl = x.who.map(function (id) {
    var p = person(id);
    if (x.broke[id]) return '<span class="rl-p broke">' + face(p, 24) + esc(p.name) + (x.water && x.water[id] ? ' · Wasser' : ' trinkt') + '</span>';
    if (!live) return '<span class="rl-p ok">' + face(p, 24) + esc(p.name) + ' hat durchgehalten</span>';
    return '<button type="button" class="rl-p" data-act="ruleBroke" data-id="' + x.id + '" data-pid="' + id + '">' + face(p, 24) + esc(p.name) + ' hat sie gebrochen</button>';
  }).join('');
  return '<div class="rl' + (live ? '' : ' over') + (compact ? ' compact' : '') + '"><div class="rl-h"><span class="rl-e">' + emb('gavel', compact ? 26 : 32) + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>„' + esc(x.text) + '“</b><span>Regel von ' + esc(x.by) + '</span></span>' +
    (live ? '<span class="rl-t">' + zt(x.until, 'vorbei', true) + '</span>' : '<span class="rl-t done">vorbei</span>') + '</div><div class="rl-ps">' + ppl + '</div></div>';
}
/* on the step screens: only what runs right now */
function ruleStrip() {
  var r = runLive(); if (!r) return '';
  var live = rulesOf(r).filter(ruleLive);
  return live.length ? '<div class="rl-strip">' + live.map(function (x) { return ruleHtml(x, true); }).join('') + '</div>' : '';
}
/* in the cockpit and the card area: buddies, rules, the way to the cards */
function partyRunHtml(r, full) {
  var b = bud(r), out = accRunHtml(r);
  if (b.on) {
    var pairs = r.who.filter(function (id) { return budOf(id); });
    out += '<div class="zc-row"><span class="zc-e">' + emb('cheers', 30) + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>Trinkbuddys</b><span>' + (pairs.length ? 'Ab dem ersten gemeinsamen ' + esc(U()) + ' noch 1 bis 3 Spiele verbunden' : 'Gewählt wird bei der nächsten Aufgabe') + '</span></span></div>';
    if (pairs.length) out += '<div class="zc-pairs">' + pairs.map(function (id) {
      var n = b.map[id], x = b.bond[id], card = budCard(n);
      var st = x.state === 'wait' ? 'wartet aufs erste ' + U() : 'noch ' + budGames(x.left);
      return '<div class="zc-pair">' + face(person(id), 30) + '<span class="zc-amp">' + icon('i-cup', 14) + '</span>' + (budAnon(n) ? '<span class="bd-anon sm">' + emb('cheers', 20) + '</span>' : guestFace(n, 30)) + '<span class="grow"><b>' + esc(person(id).name) + '</b> mit <b>' + (budAnon(n) ? 'Buddy' : esc(n)) + '</b><small class="zc-st">' + esc(st) + '</small></span>' + (card ? '<button type="button" class="zc-fwd" data-act="budFwd" data-id="' + id + '">' + emb('forward', 18) + 'Weiterleiten</button>' : '') + '</div>';
    }).join('') + '</div>';
  }
  var rules = rulesOf(r).filter(function (x) { return ruleLive(x) || (full && x.done); });
  out += rules.map(function (x) { return ruleHtml(x, false); }).join('');
  var free = 0; PC_KINDS.forEach(function (t) { free += pcFree(t).length; });
  if (!full) out += '<button type="button" class="zc-go" data-act="openCards" data-from="run">' + icon('i-star', 16) + '<span class="grow">Kartenbereich</span>' + (free ? '<span class="zc-n">' + free + ' im Umlauf</span>' : '') + icon('i-next', 16) + '</button>';
  return out ? '<span class="eyebrow mt18 block">Karten und Timer</span><div class="zc mt10">' + out + '</div>' : '';
}

/* ---------- the card area ---------- */
A.openCards = function (d) { UI.cardsFrom = (d && d.from) || (runLive() ? 'run' : 'questions'); UI.ruleDraft = null; go('cards'); };
function pcStatus(q) {
  var t = q.type, tm = q.usedAt ? new Date(q.usedAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';
  if (q.status === 'offen') return 'Wartet unter „Neu eingegangen“ auf deine Freigabe';
  if (q.used) return t === 'regel' ? 'Eingelöst um ' + tm + ': „' + (q.usedFor || '') + '“' : t === 'weiter' ? 'Eingesetzt um ' + tm + (q.usedFor ? ', für ' + q.usedFor : '') : 'Eingelöst für ' + (q.usedFor || 'eine Hauptperson');
  if (t === 'joker') return 'Wird beim Ergebnis gefragt, wenn jemand trinken muss';
  if (t === 'weiter') { var r = runLive(); return r && bud(r).on && r.who.some(function (id) { return pcSame(bud(r).map[id], q.author); }) ? 'Ist gerade Trinkbuddy und kann weiterleiten' : 'Kommt zum Einsatz, wenn ' + q.author + ' Trinkbuddy wird'; }
  return runLive() ? 'Einlösbar, sobald ' + q.author + ' eine Regel ansagt' : 'Einlösbar, sobald das Spiel läuft';
}
function pcItem(q) {
  var t = q.type, act = '';
  if (q.status === 'ok' && !q.used && t === 'regel' && runLive()) {
    if (UI.ruleDraft && UI.ruleDraft.qid === q.id) {
      return '<div class="pc-item open"><div class="row gap10">' + guestFace(q.author, 40) + '<span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(q.author) + ' sagt eine Regel an</b><span>Gilt fünf Minuten für ' + esc(joinNames(runLive().who.map(function (id) { return person(id).name; }))) + '</span></span></div>' +
        '<input id="ruleIn" class="input mt10" type="text" maxlength="80" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" data-bind="rule.text" value="' + esc(UI.ruleDraft.text || '') + '" placeholder="z. B. Keine Hände benutzen">' +
        '<div class="cta-row mt10"><button type="button" class="btn-dark" style="flex:0 0 auto;padding:0 18px" data-act="ruleCancel">Abbrechen</button><button type="button" class="cta" id="ruleGo" data-act="ruleStart"' + (String(UI.ruleDraft.text || '').trim().length >= 2 ? '' : ' disabled') + '>' + icon('i-clock', 18) + 'Fünf Minuten starten</button></div></div>';
    }
    act = '<button type="button" class="pc-act" data-act="ruleOpen" data-id="' + q.id + '">Einlösen</button>';
  }
  if (q.status === 'ok' && !q.used && t === 'weiter') {
    var r = runLive(), pid = r && bud(r).on ? r.who.filter(function (id) { return pcSame(bud(r).map[id], q.author); })[0] : null;
    if (pid) act = '<button type="button" class="pc-act" data-act="budFwd" data-id="' + pid + '">Weiterleiten</button>';
  }
  return '<div class="pc-item' + (q.used ? ' used' : '') + '">' + guestFace(q.author, 40) + '<span class="stack grow" style="gap:2px;min-width:0"><b>' + esc(q.author) + (q.text && t === 'joker' ? ' <small>· Bedingung: ' + esc(q.text) + '</small>' : '') + '</b><span>' + esc(pcStatus(q)) + '</span></span>' + act + '</div>';
}
function pcKindBlock(t) {
  var all = pcAll(t); if (!all.length) return '';
  var free = all.filter(function (q) { return q.status === 'ok' && !q.used; }).length;
  return '<div class="pc-kind pk-' + t + ' mt14"><div class="pc-kh"><span class="pc-ke">' + emb(GQ_STYLE[t].e, 34) + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(pcName(t)) + '</b><span>' + esc(pcText(t)) + '</span></span><span class="pc-kn">' + free + '</span></div>' +
    all.map(pcItem).join('') + '</div>';
}
V.cards = function () {
  ruleSweep();
  var r = runLive(), from = UI.cardsFrom || (r ? 'run' : 'questions'), body;
  if (demoOn()) body = '<p class="lead">Joker, Weiterleiten und die Regel-Karte ziehen eure Gäste als Bonuskarte. Hier löst du sie auf der Party ein und druckst sie vorher aus.</p>' + demoLockRow('Die Karten gibt es mit dem Game Pass.');
  else {
    var timers = r ? partyRunHtml(r, true) : '';
    var lists = PC_KINDS.map(pcKindBlock).join('');
    if (!lists) lists = '<div class="qx-empty mt14">' + emb('forward', 34) + '<span>Noch keine Karten im Umlauf. Gäste ziehen sie als Bonuskarte im Gäste-Link: den Joker, Weiterleiten in Silber und die Regel-Karte.</span></div>';
    body = dk(timers + '<span class="eyebrow mt18 block">Im Umlauf</span>' + lists, printBlock(), 'dk-cards');
  }
  return scr(topbar(from, 'Karten'), body, '');
};

/* ---------- closing the guest round ---------- */
function collectCloseHtml() {
  if (demoOn()) return '';
  if (S.collectClosed) return '<div class="cr-box mt10">' + icon('i-lock', 18) + '<span class="stack grow" style="gap:2px;min-width:0"><b>Gäste-Runde geschlossen</b><span>Neue Beiträge und Bonuskarten kommen nicht mehr an. Jetzt kannst du die Karten drucken.</span></span></div>' +
    '<div class="cta-row mt10">' + (UI.screen === 'cards' ? '' : '<button type="button" class="btn-dark" style="flex:1" data-act="openCards" data-from="questions">' + icon('i-print', 18) + 'Karten drucken</button>') + '<button type="button" class="btn-ghost" style="' + (UI.screen === 'cards' ? 'flex:1' : 'flex:0 0 auto;width:auto;padding:0 18px') + '" data-act="collectOpen">Gäste-Runde wieder öffnen</button></div>';
  if (UI.confirm === 'collectClose') return confirmBox('Gäste-Runde schließen?', 'Danach können Gäste nichts mehr schicken und keine Bonuskarten mehr ziehen. Du kannst sie jederzeit wieder öffnen.', 'collectClose', 'Schließen');
  return '<button type="button" class="cr-btn mt10" data-act="askConfirm" data-v="collectClose">' + icon('i-lock', 18) + '<span class="stack grow" style="gap:2px;min-width:0;text-align:left"><b>Gäste-Runde schließen</b><span>Kurz vor der Party. Danach druckst du die Karten mit den Namen.</span></span>' + icon('i-next', 16) + '</button>';
}
A.collectClose = function () { S.collectClosed = true; S.collectClosedAt = now(); UI.confirm = null; commit(); setToast('Gäste-Runde geschlossen'); };
A.collectOpen = function () { S.collectClosed = false; commit(); setToast('Gäste-Runde wieder offen'); };
/* the guest link after closing */
function gClosedView() {
  var head = UI.guestMode === 'test' ? '<div class="testbanner">' + icon('i-user', 18) + '<span class="grow">Testansicht: So sieht der Link für Gäste aus.</span><button type="button" class="tag plain" data-act="go" data-to="' + UI.guestFrom + '" style="height:30px;color:var(--sun)">Zurück</button></div>' : '';
  var body = '<div class="cr-guest">' + emb('lock', 70) + '<h1 class="h1 mt18">Die Runde ist geschlossen</h1><p class="lead mt10">Danke an alle, die mitgemacht haben! Die Party ist in Vorbereitung. Wer eine Bonuskarte gezogen hat, bekommt sie vor dem Start in die Hand.</p></div>';
  return scr(head, body, '', 'crscr');
}

/* ---------- printing ---------- */
function printCards() { var out = []; PC_KINDS.forEach(function (t) { pcAll(t).forEach(function (q) { if (q.status === 'ok' && !q.used) out.push(q); }); }); return out; }
function pcLogo() { return brandTile(0, '#2C2750'); }
/* The card's colours are drawn as SVG shapes, not as CSS backgrounds. Browsers
   drop backgrounds when printing unless „Hintergrundgrafiken“ is on (Safari
   has no such switch at all), and a card of white text on white paper looks
   see-through. Shapes are content and print everywhere. The card is 63 × 88
   in every size, so one viewBox in tenths of a millimetre fits them all. */
var PC_INK = {
  joker: { f: [135, [['#FF6FD8', 0], ['#FFC940', .3], ['#6FE3FF', .6], ['#9886FF', .8], ['#FF6FD8', 1]]], p: ['#3E3488', '#1D1A40', '#141130'], c: '#FF9BE6', a: '#FFD3F3', g: '#FF6FD8', r: '#5A4A70' },
  weiter: { f: [120, [['#FDFEFF', 0], ['#C6CFDA', .16], ['#8C98A8', .32], ['#F2F5F9', .48], ['#9AA6B5', .64], ['#FFFFFF', .8], ['#B4BEC9', 1]]], p: ['#56627A', '#2A3142', '#1A1F2B'], c: '#E2E9F1', a: '#DCE3EC', g: '#E2E9F1', r: '#5E6677', sh: [[.26, 0], [.42, .2], [.52, 0], [.64, .1], [.72, 0]] },
  regel: { f: [135, [['#FF7A45', 0], ['#FFC940', .5], ['#FF5A5A', 1]]], p: ['#3E3488', '#1D1A40', '#141130'], c: '#FFB27A', a: '#FFD9B8', g: '#FF7A45', r: '#5C4A62' }
};
var pcSeq = 0;
/* a CSS-style angled gradient (0deg up, 90deg right) over the box x,y,w,h, in user units */
function pcLin(id, deg, stops, x, y, w, h) {
  var a = deg * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a), L = Math.abs(w * dx) + Math.abs(h * dy), cx = x + w / 2, cy = y + h / 2, r = function (v) { return Math.round(v * 10) / 10; };
  return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="' + r(cx - dx * L / 2) + '" y1="' + r(cy - dy * L / 2) + '" x2="' + r(cx + dx * L / 2) + '" y2="' + r(cy + dy * L / 2) + '">' +
    stops.map(function (s) { return '<stop offset="' + s[1] + '" stop-color="' + s[0] + '"' + (s[2] != null ? ' stop-opacity="' + s[2] + '"' : '') + '></stop>'; }).join('') + '</linearGradient>';
}
/* frame, dark panel, dots and shine; ids are per card, a gradient inside a hidden card would not resolve */
function pcBgSvg(t, n) {
  var k = PC_INK[t] || PC_INK.joker, F = 24.7, pw = 630 - 2 * F, ph = 880 - 2 * F, sh = k.sh || [[.32, 0], [.44, .13], [.56, 0]];
  var panel = function (fill) { return '<rect x="' + F + '" y="' + F + '" width="' + pw + '" height="' + ph + '" rx="26" fill="' + fill + '"></rect>'; };
  return '<svg class="pc-bg" viewBox="0 0 630 880" preserveAspectRatio="none" aria-hidden="true"><defs>' +
    pcLin(n + 'f', k.f[0], k.f[1], 0, 0, 630, 880) +
    '<radialGradient id="' + n + 'p" cx=".5" cy="0" r="1" gradientTransform="translate(.5 0) scale(1.2 .7) translate(-.5 0)"><stop offset="0" stop-color="' + k.p[0] + '"></stop><stop offset=".62" stop-color="' + k.p[1] + '"></stop><stop offset="1" stop-color="' + k.p[2] + '"></stop></radialGradient>' +
    '<pattern id="' + n + 'd" width="28.6" height="28.6" patternUnits="userSpaceOnUse"><circle cx="14.3" cy="14.3" r="2.1" fill="#FFFFFF" fill-opacity=".09"></circle></pattern>' +
    pcLin(n + 's', 115, sh.map(function (s) { return ['#FFFFFF', s[0], s[1]]; }), F, F, pw, ph) + '</defs>' +
    '<rect width="630" height="880" rx="39" fill="url(#' + n + 'f)"></rect>' + panel('url(#' + n + 'p)') + panel('url(#' + n + 'd)') + panel('url(#' + n + 's)') + '</svg>';
}
/* the emblem's disc with its glow and thin ring. The ring is a solid colour and
   comes last: a translucent stroke right before a gradient fill made poppler
   (Linux print filters) draw the disc with the stroke's alpha */
function pcArtSvg(t, n) {
  var k = PC_INK[t] || PC_INK.joker;
  return '<svg class="pc-f pc-fa" viewBox="0 0 100 100" aria-hidden="true"><defs>' +
    '<radialGradient id="' + n + 'g"><stop offset=".55" stop-color="' + k.g + '" stop-opacity=".5"></stop><stop offset="1" stop-color="' + k.g + '" stop-opacity="0"></stop></radialGradient>' +
    '<radialGradient id="' + n + 'a" cx=".35" cy=".3" r=".955"><stop offset="0" stop-color="#FFFFFF"></stop><stop offset=".72" stop-color="' + k.a + '"></stop></radialGradient></defs>' +
    '<circle cx="50" cy="50" r="78" fill="url(#' + n + 'g)"></circle><circle cx="50" cy="50" r="50" fill="url(#' + n + 'a)"></circle><circle cx="50" cy="50" r="51.3" fill="none" stroke="' + k.r + '" stroke-width="2.6"></circle></svg>';
}
/* a plain fill behind a chip or box; the element's own border-radius clips it */
function pcFill(color, op) { return '<svg class="pc-f" viewBox="0 0 10 10" preserveAspectRatio="none" aria-hidden="true"><rect width="10" height="10" fill="' + color + '"' + (op != null ? ' fill-opacity="' + op + '"' : '') + '></rect></svg>'; }
function pcCardHtml(q, big) {
  var t = q.type, e = E(), date = typeof gWelcomeDate === 'function' ? gWelcomeDate() : '', k = PC_INK[t] || PC_INK.joker, n = 'pc' + (++pcSeq) + '-';
  return '<div class="pc pc-' + t + (big ? ' big' : '') + '">' + pcBgSvg(t, n) + '<div class="pc-in">' +
    '<div class="pc-top"><span class="pc-chip">' + pcFill(k.c) + '<span>' + esc(t === 'weiter' ? 'Silber' : t === 'regel' ? 'Regel' : 'Joker') + '</span></span><span class="pc-brand">' + pcLogo() + 'zparkling</span></div>' +
    '<div class="pc-art">' + pcArtSvg(t, n) + '<span class="pc-ring"></span>' + emb(GQ_STYLE[t].e, 60) + '</div>' +
    '<span class="pc-k">Bonuskarte</span><b class="pc-t">' + esc(pcTitle(t)) + '</b><p class="pc-x">' + esc(pcText(t)) + '</p>' +
    (t === 'joker' && q.text ? '<p class="pc-cond">Bedingung: ' + esc(q.text) + '</p>' : '') +
    '<div class="pc-for">' + pcFill('#FFFFFF', .08) + '<span>Für</span><b>' + esc(q.author) + '</b></div>' +
    '<div class="pc-foot"><span>' + esc(e && e.name ? e.name : focusNames()) + '</span><span>' + esc(date) + '</span></div></div></div>';
}
function printBlock() {
  if (!S.collectClosed) return '<span class="eyebrow mt18 block">Drucken</span><div class="pr-wait mt10">' + emb('lock', 40) + '<span class="stack grow" style="gap:4px;min-width:0"><b>Erst die Gäste-Runde schließen</b><span>Solange Gäste noch Karten ziehen, kann sich die Liste ändern. Schließ die Runde kurz vor der Party, dann druckst du die Karten mit den Namen aus und verteilst sie vor dem Start.</span></span></div>' + collectCloseHtml();
  var list = printCards(), fmt = UI.prFmt || 'karte', sel = UI.prOff || {};
  if (!list.length) return '<span class="eyebrow mt18 block">Drucken</span><div class="pr-wait mt10">' + emb('forward', 40) + '<span class="stack grow" style="gap:4px;min-width:0"><b>Nichts zu drucken</b><span>Es ist keine freigegebene Karte im Umlauf.</span></span></div>' + collectCloseHtml();
  var n = list.filter(function (q) { return !sel[q.id]; }).length;
  var seg = '<div class="seg mt10" style="grid-template-columns:repeat(2,minmax(0,1fr));height:48px" role="group" aria-label="Format">' + [['karte', 'Spielkarte'], ['a4', 'A4, eine pro Seite']].map(function (x) { var s = fmt === x[0]; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="prFmt" data-v="' + x[0] + '" aria-pressed="' + s + '">' + x[1] + '</button>'; }).join('') + '</div>';
  var pick = list.map(function (q) { var on = !sel[q.id]; return '<button type="button" class="pr-pick' + (on ? ' on' : '') + '" data-act="prToggle" data-id="' + q.id + '" aria-pressed="' + on + '"><span class="pr-box">' + (on ? icon('i-check', 14) : '') + '</span>' + emb(GQ_STYLE[q.type].e, 24) + '<span class="grow"><b>' + esc(pcName(q.type)) + '</b> für ' + esc(q.author) + '</span></button>'; }).join('');
  var prev = list.filter(function (q) { return !sel[q.id]; }).slice(0, 6).map(function (q) { return '<div class="pr-cell">' + pcCardHtml(q, false) + '</div>'; }).join('');
  return '<span class="eyebrow mt18 block">Drucken</span><p class="small mt6">' + (fmt === 'a4' ? 'Jede Karte groß auf einer eigenen A4-Seite, zum Überreichen.' : 'Bis zu neun Karten pro A4-Blatt in Spielkartengröße (63 × 88 mm), zum Ausschneiden.') + '</p>' + seg +
    '<div class="pr-picks mt10">' + pick + '</div>' +
    (prev ? '<div class="pr-prev mt14' + (fmt === 'a4' ? ' a4' : '') + '">' + prev + '</div>' : '') +
    '<button type="button" class="cta mt14" data-act="prGo"' + (n ? '' : ' disabled') + '>' + icon('i-print', 18) + (n === 1 ? 'Eine Karte drucken' : n + ' Karten drucken') + '</button>' +
    '<p class="small mt8">Die Farben kommen ohne weitere Einstellung mit. Als PDF speichern geht im Druckdialog auch.</p>' + collectCloseHtml();
}
A.prFmt = function (d) { UI.prFmt = d.v === 'a4' ? 'a4' : 'karte'; render(); };
A.prToggle = function (d) { UI.prOff = UI.prOff || {}; UI.prOff[d.id] = !UI.prOff[d.id]; render(); };
/* the pages go into a print-only layer outside the app, then the browser prints */
function printPagesHtml(list, fmt) {
  if (fmt === 'a4') return list.map(function (q) { return '<div class="pp-page pp-one">' + pcCardHtml(q, true) + '</div>'; }).join('');
  var out = '';
  for (var i = 0; i < list.length; i += 9) out += '<div class="pp-page pp-grid">' + list.slice(i, i + 9).map(function (q) { return '<div class="pp-cut">' + pcCardHtml(q, false) + '</div>'; }).join('') + '</div>';
  return out;
}
A.prGo = function () {
  var sel = UI.prOff || {}, list = printCards().filter(function (q) { return !sel[q.id]; }); if (!list.length) return;
  var html = printPagesHtml(list, UI.prFmt || 'karte');
  if (typeof document === 'undefined' || !document.body) return html;
  var el = document.getElementById('zpPrint');
  if (!el) { el = document.createElement('div'); el.id = 'zpPrint'; document.body.appendChild(el); }
  el.innerHTML = html;
  setTimeout(function () { try { window.print(); } catch (e) { setToast('Drucken klappt hier nicht. Öffne zparkling im Browser.'); } }, 120);
  return html;
};
/* ---------- on the guests' page ---------- */
function pcSection() {
  var demo = demoOn(), all = [];
  PC_KINDS.forEach(function (t) { all = all.concat(pcAll(t)); });
  if (!demo && !all.length) return qPanel('qs-joker', '#C6CFDA', 'forward', 'Karten für die Party', 'Gäste ziehen im Gäste-Link Bonuskarten: den Joker, Weiterleiten in Silber und die Regel-Karte. Hier siehst du, wer welche hat.', 0, '<div class="qx-empty">' + emb('forward', 34) + '<span>Noch keine Karten gezogen. Sobald Gäste mitmachen, tauchen sie hier auf.</span></div>');
  var list = all.length ? all : [{ id: 'd1', type: 'joker', author: 'Max', text: '', status: 'ok' }, { id: 'd2', type: 'weiter', author: 'Lea', text: '', status: 'ok' }, { id: 'd3', type: 'regel', author: 'Tom', text: '', status: 'ok' }];
  var free = list.filter(function (q) { return q.status === 'ok' && !q.used; }).length;
  var cards = '<div class="pc-shelf">' + list.slice(0, 12).map(function (q) {
    var st = q.status === 'offen' ? 'Wartet auf Freigabe' : q.used ? 'Eingelöst' : 'Im Umlauf';
    return '<div class="pc-slot' + (q.used ? ' used' : '') + '"><div class="pc-mini">' + pcCardHtml(q, false) + '</div><span class="pc-st">' + esc(st) + '</span></div>';
  }).join('') + '</div>';
  var inner = cards + (demo ? '<button type="button" class="qx-own mt10" data-act="openCards" data-from="questions"><span class="qx-own-ic">' + emb('forward', 30) + '</span><span class="stack grow" style="gap:2px;text-align:left"><b>Zum Kartenbereich</b><small>Einlösen und ansehen, wie die Karten gedruckt werden</small></span>' + icon('i-next', 16) + '</button>' + demoLockRow('Für eure eigene Party ziehen die Gäste ihre Karten mit dem Game Pass.') :
    '<button type="button" class="qx-own mt10" data-act="openCards" data-from="questions"><span class="qx-own-ic">' + emb('forward', 30) + '</span><span class="stack grow" style="gap:2px;text-align:left"><b>Zum Kartenbereich</b><small>' + (S.collectClosed ? 'Einlösen und drucken' : 'Einlösen, und drucken nach dem Schließen der Gäste-Runde') + '</small></span>' + icon('i-next', 16) + '</button>');
  return qPanel('qs-joker', '#C6CFDA', 'forward', 'Karten für die Party', 'Der Joker erlässt ein ' + esc(U()) + ', Weiterleiten gibt den Trinkbuddy-Job ab, die Regel-Karte startet eine Regel für fünf Minuten.', demo ? null : free, inner);
}
