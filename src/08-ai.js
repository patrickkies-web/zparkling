/* =========================================================
   Questions made to measure. Guests send two words about the
   birthday person (what they are like, what they love). On the
   master's tap Claude reads them together with everything else
   the guests wrote about that person and writes 20 questions
   only for them. They are drawn first in the question rounds.
   Runs on the viewer's own Claude account, only where the page
   is opened inside Claude; elsewhere the feature explains itself.
   ========================================================= */
var A = A || {};
var AI_AUTHOR = 'Party-KI';
var AI = { fn: null, state: 'wait', busy: '', ctl: null, msg: {}, prog: 0, open: {} };
(function () {
  try {
    var w = typeof window !== 'undefined' ? window : null;
    if (w && w.claude && typeof w.claude.use === 'function') {
      w.claude.use('sample').then(function (s) {
        AI.fn = s || null; AI.state = s ? 'ready' : 'none';
        if (UI.screen === 'questions') render();
      }, function () { AI.state = 'none'; if (UI.screen === 'questions') render(); });
    } else AI.state = 'none';
  } catch (e) { AI.state = 'none'; }
})();
function aiWords(pid) {
  var tr = [], it = [];
  S.questions.forEach(function (q) {
    if (q.type !== 'worte' || q.status !== 'ok' || (q.forId && q.forId !== pid)) return;
    if (q.trait) tr.push({ w: q.trait, by: q.author });
    if (q.interest) it.push({ w: q.interest, by: q.author });
  });
  return { traits: tr, interests: it };
}
/* everything else the guests wrote about this person, as short lines */
function aiContext(pid) {
  var out = [];
  S.questions.forEach(function (q) {
    if (q.status !== 'ok' || q.ai || !isGuestAuthor(q.author) || (q.forId && q.forId !== pid)) return;
    if (q.type === 'steckbrief' && q.meet) out.push('Kennenlern-Geschichte von ' + q.author + ': ' + q.meet);
    else if (q.type === 'wer') out.push('Erinnerung von ' + q.author + ': ' + q.text);
    else if (q.type === 'aufgabe') out.push('Aufgabe von ' + q.author + ': ' + q.text);
    else if (Q_LADDER.indexOf(q.type) >= 0) out.push('Frage von ' + q.author + ': ' + q.text);
  });
  return out.slice(0, 40).map(function (l) { return l.replace(/\s+/g, ' ').slice(0, 240); });
}
function aiQs(pid) { return S.questions.filter(function (q) { return q.ai && q.forId === pid && q.status === 'ok'; }); }
function aiPrompt(pid) {
  var p = person(pid), w = aiWords(pid), ctx = aiContext(pid), t = evType(), others = E().focus.filter(function (x) { return x.id !== pid; }).map(function (x) { return x.name; });
  var list = function (a) { return a.length ? a.map(function (x) { return x.w + ' (von ' + x.by + ')'; }).join(', ') : 'keine'; };
  return [
    'Du hilfst bei einem Partyspiel auf Deutsch. Gefeiert wird: ' + (t ? t.label : 'eine Party') + '. Im Mittelpunkt steht ' + p.name + (p.nick ? ' (Spitzname „' + p.nick + '“)' : '') + (others.length ? ', zusammen mit ' + others.join(' und ') : '') + '.',
    '',
    'Gäste haben ' + p.name + ' mit je einem Wort beschrieben:',
    'Eigenschaften: ' + list(w.traits),
    'Interessen: ' + list(w.interests),
    ctx.length ? '\nWeitere Beiträge der Gäste über ' + p.name + ':\n- ' + ctx.join('\n- ') : '',
    '',
    'Deine Aufgabe:',
    '1. Charakterisiere ' + p.name + ' in zwei bis drei warmen Sätzen mit einem kleinen Augenzwinkern (dritte Person).',
    '2. Nenne die drei bis sechs wichtigsten Themen aus den Interessen und Beiträgen.',
    '3. Schreib genau 20 Quizfragen, die es so nur für ' + p.name + ' gibt: Sie drehen sich um diese Interessen und Themen. Beispiel zur Orientierung: Mag jemand einen Fußballverein, frag nach dem Gründungsjahr, dem Stadion oder einer Vereinslegende. Gibt es wenig Interessen, nimm Themen aus den Beiträgen (Orte, Hobbys, Lieblingssachen).',
    '',
    'Regeln:',
    '- Nur Fakten, bei denen du dir wirklich sicher bist. Nichts, was sich oft ändert (aktueller Trainer, Tabellenstand, Preise, Mitgliederzahlen).',
    '- Keine Fragen über private Dinge von ' + p.name + ', die du nicht wissen kannst. Die Antwort muss mit Wissen über das Thema lösbar sein.',
    '- Ton: freundlich, mit einem kleinen Schmunzeln, gern mit ' + p.name + ' im Fragetext („' + p.name + ', als Fan weißt du das sicher: …“). Nie bloßstellend.',
    '- Tabu: Aussehen, Gewicht, Gesundheit, Sex, Ex-Partner, Geld, Politik, Religion, Alkoholprobleme, Peinliches. Negative Eigenschaften nicht aufgreifen.',
    '- Mischung: 14 Auswahlfragen mit genau vier kurzen Antworten (höchstens 40 Zeichen), die richtige an wechselnder Stelle, plausible falsche Antworten. Dazu 6 Schätzfragen mit einer Zahl als Lösung, einer Einheit und einer fairen Toleranz.',
    '- Fragen höchstens 140 Zeichen. Leicht bis knifflig gemischt, über die Themen verteilt.',
    '',
    '4. Schreib 10 kurze Sätze für das Spiel Lippenlesen: 4 bis 8 einfache Wörter, gut von den Lippen abzulesen, über ' + p.name + ' und die Themen, mit einem Schmunzeln. Beispiel: „' + p.name + ' singt heute nur Schlager“.',
    '5. Schreib 6 Konter-Sprüche, die ein Gast ' + p.name + ' zuruft, wenn ' + p.name + ' ihn zu einem Duell herausfordert: frech, aber herzlich, höchstens 70 Zeichen, gern mit einem der Interessen.',
    'Für Sätze und Sprüche gelten dieselben Tabus wie für die Fragen.',
    '',
    'Antworte nur mit JSON in genau dieser Form:',
    '{"profil":"…","themen":["…"],"fragen":[{"typ":"auswahl","frage":"…","antworten":["…","…","…","…"],"richtig":2,"thema":"…"},{"typ":"schaetzen","frage":"…","loesung":1887,"einheit":"","toleranz":5,"thema":"…"}],"saetze":["…"],"konter":["…"]}'
  ].join('\n');
}
/* the reply is checked field by field; anything odd is dropped */
function aiApply(pid, res) {
  if (!res || typeof res !== 'object') return 0;
  var list = Array.isArray(res.fragen) ? res.fragen : [], qs = [], now = Date.now();
  list.forEach(function (f, i) {
    if (!f || typeof f !== 'object') return;
    var text = String(f.frage || '').replace(/\s+/g, ' ').trim().slice(0, 220);
    if (text.length < 8) return;
    var q = { id: 'qa' + now.toString(36) + i + Math.floor(Math.random() * 1000), t: now + i, author: AI_AUTHOR, ai: true, forId: pid, status: 'ok', used: false, text: text, unit: '', answer: '', options: [], correct: 0, min: '', max: '', note: '', theme: String(f.thema || '').slice(0, 40) };
    if (f.typ === 'auswahl') {
      var raw = Array.isArray(f.antworten) ? f.antworten : [], c = Number(f.richtig);
      if (raw.length < 2 || raw.length > 4 || !(c >= 0 && c < raw.length) || Math.floor(c) !== c) return;
      var opts = raw.map(function (o) { return String(o == null ? '' : o).replace(/\s+/g, ' ').trim().slice(0, 60); });
      if (opts.some(function (o, k) { return !o || opts.indexOf(o) !== k; })) return;
      q.type = 'auswahl'; q.options = opts; q.correct = c;
    } else if (f.typ === 'schaetzen') {
      var a = Number(String(f.loesung).replace(',', '.'));
      if (!isFinite(a)) return;
      q.type = 'schaetzen'; q.answer = a; q.unit = String(f.einheit || '').trim().slice(0, 20);
      var tol = Number(f.toleranz); if (isFinite(tol) && tol > 0 && tol <= Math.max(10, Math.abs(a) * 0.5)) q.tol = tol;
    } else return;
    qs.push(q);
  });
  if (!qs.length) return 0;
  /* a new set replaces the earlier one, except what was already played */
  S.questions = S.questions.filter(function (q) { return !(q.ai && q.forId === pid && !q.used); }).concat(qs.slice(0, 24));
  S.ai = S.ai || {};
  var clean = function (list, mn, mx, n) { return (Array.isArray(list) ? list : []).map(function (x) { return String(x == null ? '' : x).replace(/\s+/g, ' ').replace(/^[„"“]+|[“"”]+$/g, '').trim(); }).filter(function (x, k, a) { return x.length >= mn && x.length <= mx && a.indexOf(x) === k; }).slice(0, n); };
  var w = aiWords(pid);
  S.ai[pid] = { profile: String(res.profil || '').slice(0, 700), themes: (Array.isArray(res.themen) ? res.themen : []).map(function (x) { return String(x).slice(0, 40); }).filter(Boolean).slice(0, 8), at: now, lines: clean(res.saetze, 8, 90, 14), konter: clean(res.konter, 8, 110, 10), nW: w.traits.length + w.interests.length, nC: aiContext(pid).length };
  return qs.length;
}
/* rounds: the made-to-measure questions first, a few guest questions in between */
function aiMix(pool, k) {
  var ai = shuffle(pool.filter(function (q) { return q.ai; })), gs = shuffle(pool.filter(function (q) { return !q.ai; }));
  var nA = Math.min(ai.length, gs.length ? Math.max(Math.ceil(k * 0.6), k - gs.length) : k);
  var out = ai.slice(0, nA).concat(gs.slice(0, k - nA));
  if (out.length < k) out = out.concat(ai.slice(nA, nA + k - out.length));
  return out;
}
var AI_ERR = {
  not_granted: 'Die App darf Claude gerade nicht fragen. Lade die Seite neu und erlaube es beim nächsten Versuch.',
  sampling_disabled: 'Für dieses Konto ist die KI nicht verfügbar.',
  rate_limited: 'Gerade zu viele Anfragen. Probier es in ein paar Minuten noch einmal.',
  session_expired: 'Bitte melde dich bei Claude neu an.',
  refused: 'Daraus wollte die KI keine Fragen bauen. Schau dir die Worte an und versuch es noch einmal.',
  invalid_json: 'Die Antwort kam unvollständig an. Probier es noch einmal.',
  empty_completion: 'Die Antwort kam leer an. Probier es noch einmal.'
};
var AI_OFF = ['sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'];
function aiProgText(pid) {
  var p = person(pid), w = aiWords(pid), n = w.traits.length + w.interests.length;
  return AI.prog ? AI.prog + ' von 20 Fragen geschrieben …' : 'Die KI liest ' + (n === 1 ? 'ein Wort' : n + ' Worte') + ' über ' + p.name + ' …';
}
A.aiBuild = function (d) {
  var pid = d.id;
  if (!AI.fn || AI.busy || !isFocus(pid)) return;
  if (needPass('Die KI-Fragen gibt es mit dem Game Pass.')) return;
  var ctl = new AbortController();
  AI.ctl = ctl; AI.busy = pid; AI.prog = 0; AI.msg[pid] = '';
  render();
  AI.fn.json(aiPrompt(pid), {
    modelTier: 'complex', cache: false, signal: ctl.signal,
    onText: function (u) {
      var n = Math.min(20, (String(u.text).match(/"frage"\s*:/g) || []).length);
      if (n !== AI.prog) { AI.prog = n; var el = document.getElementById('aiProg'); if (el) el.textContent = aiProgText(pid); }
    }
  }).then(function (res) {
    var n = aiApply(pid, res);
    AI.busy = ''; AI.ctl = null;
    AI.msg[pid] = n ? '' : 'Die Antwort passte nicht ins Spiel. Probier es noch einmal.';
    if (n) AI.open[pid] = true;
    commit();
    if (n) setToast(n + ' Fragen über ' + person(pid).name + ' sind da');
  }, function (e) {
    var c = e && e.code;
    AI.busy = ''; AI.ctl = null;
    if (AI_OFF.indexOf(c) >= 0) AI.state = 'none';
    AI.msg[pid] = c === 'cancelled' ? '' : AI_ERR[c] || 'Die Verbindung ist abgebrochen. Probier es noch einmal.';
    render();
  });
};
A.aiStop = function () { if (AI.ctl) AI.ctl.abort(); };
A.aiOpen = function (d) { AI.open[d.id] = !AI.open[d.id]; render(); };
A.aiDel = function (d) { S.questions.forEach(function (q) { if (q.id === d.id && q.ai) q.status = 'nein'; }); commit(); setToast('Frage rausgeworfen'); };

/* ---------- the master's view ---------- */
function aiAnswer(q) {
  if (q.type === 'auswahl') return q.options[q.correct] || '';
  return fmtNum(q.answer) + (q.unit ? ' ' + q.unit : '');
}
function aiCard(p, k) {
  var w = aiWords(p.id), info = (S.ai || {})[p.id], qs = aiQs(p.id), busy = AI.busy === p.id, nW = w.traits.length + w.interests.length;
  var used = qs.filter(function (q) { return q.used; }).length, ctxN = aiContext(p.id).length;
  var words = nW ? '<div class="ai-words">' + w.traits.map(function (x, i) { return '<span class="ai-w tr" style="--r:' + [-3, 2, -1, 3][i % 4] + 'deg">' + esc(x.w) + '</span>'; }).join('') + w.interests.map(function (x, i) { return '<span class="ai-w in" style="--r:' + [2, -3, 3, -1][i % 4] + 'deg">' + esc(x.w) + '</span>'; }).join('') + '</div>'
    : '<p class="ai-note">Noch keine Worte über ' + esc(p.name) + '. Sie kommen über den Gäste-Link, Beitrag „In zwei Worten“.</p>';
  var can = nW >= 2 || (nW >= 1 && ctxN >= 1) || ctxN >= 3;
  var act;
  if (busy) act = '<div class="ai-busy" role="status"><span class="ai-spin" aria-hidden="true">' + emb('wand', 26) + '</span><span class="grow" id="aiProg">' + esc(aiProgText(p.id)) + '</span><button type="button" class="qx-mini" data-act="aiStop">Stopp</button></div>';
  else if (AI.state === 'none') act = '<p class="ai-note">Die KI-Fragen laufen in der veröffentlichten App auf claude.ai, über dein Claude-Konto. Hier ist die KI gerade nicht erreichbar.</p>';
  else if (AI.state === 'wait') act = '<p class="ai-note">Die KI wird verbunden …</p>';
  else act = '<button type="button" class="ai-go" data-act="aiBuild" data-id="' + p.id + '"' + (can && !AI.busy ? '' : ' disabled') + '>' + emb('wand', 24) + (qs.length ? 'Neue Fragen über ' + esc(p.name) + ' bauen' : '20 Fragen über ' + esc(p.name) + ' bauen') + '</button>' +
    (can ? '' : '<p class="ai-note">Sobald zwei Worte über ' + esc(p.name) + ' freigegeben sind, kann die KI loslegen.</p>');
  var msg = AI.msg[p.id] ? '<p class="ai-err">' + esc(AI.msg[p.id]) + '</p>' : '';
  var res = '';
  if (qs.length) {
    var open = !!AI.open[p.id];
    res = (info && info.profile ? '<div class="ai-prof"><p>„' + esc(info.profile) + '“</p>' + (info.themes && info.themes.length ? '<div class="ai-th">' + info.themes.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') + '</div>' : '') +
      (info && ((info.lines || []).length || (info.konter || []).length) ? '<p class="ai-note">Dazu ' + (info.lines || []).length + ' Sätze fürs Lippenlesen und ' + (info.konter || []).length + ' Konter-Sprüche für Herausforderungen.</p>' : '') +
      (info && info.nW != null && nW + ctxN > info.nW + (info.nC || 0) ? '<p class="ai-note" style="color:var(--sun)">Seit dem letzten Bauen kam Neues von den Gästen dazu. Neu bauen lohnt sich.</p>' : '') +
      '<button type="button" class="ai-lt" data-act="aiOpen" data-id="' + p.id + '" aria-expanded="' + open + '"><span class="stack grow" style="gap:2px;min-width:0"><b>' + qs.length + ' Fragen nur für ' + esc(p.name) + '</b><small>' + (used ? used + ' schon gespielt, der Rest kommt bevorzugt in den Fragerunden' : 'Kommen bevorzugt in den Fragerunden') + '</small></span>' + icon('i-next', 16) + '</button>' +
      (open ? '<p class="ai-note">Die KI kann sich bei Fakten irren. Wirf raus, was nicht stimmt oder nicht passt.</p><div class="ai-ql">' + qs.map(function (q) {
        return '<div class="ai-q' + (q.used ? ' used' : '') + '"><span class="ai-q-ic">' + emb(qStyle(q.type).e, 20) + '</span><span class="stack grow" style="gap:4px;min-width:0"><span class="ai-q-t">' + esc(q.text) + '</span><span class="ai-q-a">' + icon('i-check', 12) + esc(aiAnswer(q)) + (q.theme ? '<i>' + esc(q.theme) + '</i>' : '') + '</span></span>' +
          (q.used ? '<span class="qx-used">gespielt</span>' : '<button type="button" class="ai-x" data-act="aiDel" data-id="' + q.id + '" aria-label="Frage rauswerfen">' + icon('i-close', 14) + '</button>') + '</div>';
      }).join('') + '</div>' : '');
  }
  return '<div class="ai-card" style="--i:' + k + '"><div class="ai-top">' + face(p, 46) + '<span class="stack grow" style="gap:2px;min-width:0"><b>' + esc(p.name) + '</b><small>' + (nW ? (nW === 1 ? 'Ein Wort' : nW + ' Worte') + ' von den Gästen' : 'Wartet auf Worte') + (ctxN ? ', ' + ctxN + (ctxN === 1 ? ' weiterer Beitrag' : ' weitere Beiträge') : '') + '</small></span></div>' +
    words + res + act + msg + '</div>';
}
function aiSection() {
  var e = E(); if (!AI_HOST || !e || !e.focus.length) return '';
  if (demoOn()) return qPanel('qs-ki', '#B3A6FF', 'wand', 'Maßgeschneidert mit KI', 'Aus den Worten der Gäste baut die KI eigene Fragen und Sprüche.', null, demoLockRow('Die KI-Fragen gibt es mit dem Game Pass.'));
  return qPanel('qs-ki', '#B3A6FF', 'wand', 'Maßgeschneidert mit KI', 'Im Gäste-Link schickt jeder zwei Worte: wie ' + (e.focus.length > 1 ? 'eure Leute im Mittelpunkt sind' : esc(e.focus[0].name) + ' ist') + ' und wofür ' + (e.focus.length > 1 ? 'sie brennen' : esc(e.focus[0].name) + ' brennt') + '. Auf Knopfdruck baut die KI daraus 20 Fragen, Sätze fürs Lippenlesen und Konter-Sprüche. Auch ohne KI fließen die Worte in Sätze und Sprüche ein.', null,
    e.focus.map(aiCard).join(''));
}

