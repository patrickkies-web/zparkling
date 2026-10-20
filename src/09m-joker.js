/* =========================================================
   The Joker from the bonus cards. A guest who holds one can
   free the player from one drink. The player has to ask, the
   guest decides. The master always sees who holds a Joker.
   ========================================================= */
function jokerAll() { if (demoOn()) return []; return S.questions.filter(function (q) { return q.type === 'joker' && q.status !== 'nein' && isGuestAuthor(q.author); }); }
function jokerFree() { if (demoOn()) return []; return S.questions.filter(function (q) { return q.type === 'joker' && q.status === 'ok' && !q.used && isGuestAuthor(q.author); }); }
/* can this row of a result be freed by a Joker? */
function jokerRowOk(r) { return !!(r && r.pid && isFocus(r.pid) && r.n > 0 && !r.group && !r.water && !r.freed); }
A.jkAsk = function (d) { var i = +d.i; UI.jkAsk = UI.jkAsk === i ? -1 : i; render(); var el = document.getElementById('jkask'); if (el && el.scrollIntoView) { try { el.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} } };
A.jkUse = function (d) {
  var P = stepNow(); if (!P || !P.result) return;
  var row = P.result.rows[+d.i], q = jokerFree().filter(function (x) { return x.id === d.id; })[0];
  if (!jokerRowOk(row) || !q) return;
  S.jokerCredit = S.jokerCredit || {}; S.jokerCredit[row.pid] = (S.jokerCredit[row.pid] || 0) + row.n;
  row.n = 0; row.done = false; row.freed = true; row.by = q.author; row.note = 'Joker von ' + q.author + (q.text ? '. Bedingung: ' + q.text : '');
  q.used = true; q.usedFor = row.name; q.usedAt = now();
  if (R() && UI.screen !== 'free') logRun('info', 'Joker: ' + q.author + ' befreit ' + row.name + ' von einem ' + U());
  UI.jkAsk = -1; UI.jkFx = row.pid;
  try { if (navigator.vibrate) navigator.vibrate([30, 40, 30, 40, 90]); } catch (e) {}
  commit(); setToast(q.author + ' zieht den Joker!');
};
function jokerNames(list) { var n = list.map(function (q) { return q.author; }); return n.length > 4 ? n.length + ' Gäste' : n.length === 1 ? n[0] : n.slice(0, -1).join(', ') + ' oder ' + n[n.length - 1]; }
/* under the result rows: a bar to ask, then who could be asked */
function jokerAskHtml(P) {
  var i = UI.jkAsk, rows = (P.result && P.result.rows) || [], row = rows[i], list = jokerFree();
  if (!list.length) return '';
  if (i == null || i < 0 || !jokerRowOk(row)) {
    return rows.map(function (r, k) {
      if (!jokerRowOk(r)) return '';
      return '<button type="button" class="jk-bar mt10" data-act="jkAsk" data-i="' + k + '"><span class="jk-e" aria-hidden="true">' + emb('joker', 30) + '</span><span class="stack grow" style="gap:2px;min-width:0;text-align:left"><b>Joker fragen?</b><small>' + esc(jokerNames(list)) + (list.length === 1 ? ' kann ' : ' können ') + esc(r.name) + ' das ' + esc(U()) + ' erlassen.</small></span>' + icon('i-next', 18) + '</button>';
    }).join('');
  }
  return '<div class="jk-ask mt10" id="jkask"><div class="jk-head"><span class="jk-e" aria-hidden="true">' + emb('joker', 34) + '</span><span class="stack" style="gap:2px;min-width:0"><b>Joker fragen</b><span>' + esc(row.name) + ' fragt nach. Nur wer da ist und Ja sagt, gibt seinen Joker frei.</span></span></div>' +
    list.map(function (q) {
      return '<div class="jk-row">' + guestFace(q.author, 38) + '<span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(q.author) + '</b><small>' + (q.text ? 'Bedingung: ' + esc(q.text) : 'Ohne Bedingung') + '</small></span><button type="button" class="jk-yes" data-act="jkUse" data-i="' + i + '" data-id="' + esc(q.id) + '">' + icon('i-check', 14) + 'Gibt frei</button></div>';
    }).join('') +
    '<button type="button" class="jk-no" data-act="jkAsk" data-i="' + i + '">Keiner gibt frei, dann wird getrunken</button></div>';
}
/* the master's overview on the guests' page */
function jokerSection() {
  var all = jokerAll(); if (!all.length) return '';
  var free = all.filter(function (q) { return q.status === 'ok' && !q.used; }).length;
  return '<h3 class="qx-h" id="qs-joker">Joker im Umlauf<span class="qx-n">' + free + '</span></h3><p class="qx-lead">Wer einen Joker hat, kann das Geburtstagskind einmal von einem ' + esc(U()) + ' befreien. Gefragt wird beim Ergebnis, der Gast entscheidet.</p>' +
    '<div class="jk-list">' + all.map(function (q) {
      var st = q.used ? 'Eingelöst für ' + (q.usedFor || 'das Geburtstagskind') : q.status === 'offen' ? 'Wartet oben auf deine Freigabe' : 'Im Umlauf';
      return '<div class="jk-item' + (q.used ? ' used' : '') + '">' + guestFace(q.author, 40) + '<span class="stack grow" style="gap:2px;min-width:0"><b>' + esc(q.author) + '</b><small>' + esc(st) + (q.text ? ' · Bedingung: ' + esc(q.text) : '') + '</small></span><span class="jk-chip">' + emb('joker', 24) + '</span></div>';
    }).join('') + '</div>';
}
/* a line on the run screen */
function jokerRunCard() {
  var list = jokerFree(); if (!list.length) return '';
  var names = list.map(function (q) { return q.author; });
  return '<div class="card pad mt10 row jk-run" style="padding:10px 14px"><span class="jk-e" aria-hidden="true">' + emb('joker', 30) + '</span><span class="grow small" style="color:var(--text)"><b>Joker im Umlauf:</b> ' + esc(joinNames(names)) + '. Wer verliert, darf ' + (names.length === 1 ? 'fragen' : 'sie fragen') + '.</span></div>';
}
