/* =========================================================
   Fegen and putzen: the accessories. The master only says how many.
   They go from the hardest to the easiest (toothbrush ... broom).
   Every four minutes the next task carries a chance: whoever makes it
   may swap to the next accessory, otherwise it is the drink as always.
   No screen of its own: a hint on the task, a field in the result.
   ========================================================= */
var A = A || {};
var ACC_MIN = 4;
var ACC_LADDER = { fegen: ['Zahnbürste', 'Pinsel', 'Spülbürste', 'Staubwedel', 'Handfeger', 'Besen'], putzen: ['Wattestäbchen', 'Zahnbürste', 'Taschentuch', 'Socke', 'Schwamm', 'Lappen'] };
var ACC_KINDS = ['spiel', 'schaetzen', 'quiz', 'frage', 'gast', 'menge'];
function accJob() { var f = E() ? E().focus[0] : null; return f && faOf(f).job === 'putzen' ? 'putzen' : 'fegen'; }
/* n parts, spread over the ladder: always from the hardest to the easiest */
function accItems(job, n) {
  var L = ACC_LADDER[job] || ACC_LADDER.fegen, out = []; n = clamp(n || 4, 2, L.length);
  for (var k = 0; k < n; k++) out.push(L[Math.round(k * (L.length - 1) / (n - 1))]);
  return out;
}
function accN(c) { return clamp(c.accN || 4, 2, 6); }
function accCountBlock(c) {
  var items = accItems(accJob(), accN(c));
  return '<span class="eyebrow mt22 block">Zubehör</span><div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">Wie viele Teile?</span><span class="sub">Vom schwersten zum leichtesten</span></span>' + stepper('cfgAccN', accN(c), '', 'Zubehörteile') + '</div>' +
    '<div class="acc-ladder mt10">' + items.map(function (it, i) { return (i ? '<span class="acc-arr" aria-hidden="true">' + icon('i-next', 13) + '</span>' : '') + '<span class="acc-step' + (i ? '' : ' first') + (i === items.length - 1 ? ' last' : '') + '">' + esc(it) + '</span>'; }).join('') + '</div></div>' +
    '<p class="small mt8">Alle ' + ACC_MIN + ' Minuten wird eine Aufgabe zur Zubehör-Chance: Wer sie schafft, darf zum nächsten Teil greifen. Sonst gibt es das ' + esc(E().unit) + '.</p>';
}
A.cfgAccN = function (d) { var c = cfgDefaults(); c.accN = clamp(accN(c) + (+d.d), 2, 6); commit(); };
/* when the next task is drawn: after four minutes it carries the chance */
function accOffer(r) {
  var P = r && r.pending; if (!P || r.fam !== 'zeit' || P.accWin || P.result || ACC_KINDS.indexOf(P.kind) < 0) return;
  var tr = trackById(P.track) || currentTrack(); if (!tr || tr.done) return;
  var items = (r.acc && r.acc.items) || []; if (items.length < 2 || tr.accIdx >= items.length - 1) return;
  /* a duel between the people of the same track always has a loser: no chance there */
  if (P.format === 'duell' && P.opp && tr.ids.indexOf(P.opp) >= 0) return;
  if (now() - (r.accAt || r.t0) < ACC_MIN * 60000) return;
  P.accWin = { track: tr.id, from: items[tr.accIdx], to: items[tr.accIdx + 1], ids: tr.ids.slice() };
}
/* once the result is there: won means nobody of the track has to drink */
function accSettle(P) {
  var r = R(), a = P && P.accWin; if (!r || !a || a.done || !P.result) return;
  var tr = trackById(a.track); if (!tr) return;
  var lost = (P.result.rows || []).some(function (x) { return x.pid && a.ids.indexOf(x.pid) >= 0 && x.n > 0 && !x.freed; });
  a.done = true; a.won = !lost; r.accAt = now();
  if (a.won) { tr.accIdx = Math.min(r.acc.items.length - 1, tr.accIdx + 1); logRun('acc', focusNames(tr.ids) + ': Wechsel gewonnen, jetzt mit ' + a.to); }
  else logRun('info', focusNames(tr.ids) + ': kein Zubehör-Wechsel, weiter mit ' + a.from);
  save();
}
function accTaskHtml(P) {
  var a = P && P.accWin; if (!a || P.result) return '';
  return '<div class="acc-chance"><span class="acc-e">' + icon('i-broom', 20) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>Zubehör-Chance!</b><span>Schafft ' + esc(focusNames(a.ids)) + ' das, geht es mit ' + esc(a.to) + ' statt ' + esc(a.from) + ' weiter. Sonst gibt es das ' + esc(U()) + '.</span></span></div>';
}
function accResultHtml(P) {
  var a = P && P.accWin; if (!a || !a.done) return '';
  return a.won ? '<div class="acc-res won mt14"><span class="acc-e">' + icon('i-broom', 22) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>Zubehör-Wechsel gewonnen!</b><span>Ab jetzt mit ' + esc(a.to) + ' statt ' + esc(a.from) + '. Einmal laut feiern!</span></span></div>'
    : '<div class="acc-res mt14"><span class="acc-e">' + icon('i-broom', 22) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>Kein Wechsel diesmal</b><span>Es bleibt bei ' + esc(a.from) + ', dafür gibt es das ' + esc(U()) + '. In ' + ACC_MIN + ' Minuten kommt die nächste Chance.</span></span></div>';
}
/* in the cockpit: what is in the hand, when the next chance comes */
function accRunHtml(r) {
  if (!r || r.fam !== 'zeit' || !r.acc || (r.acc.items || []).length < 2) return '';
  return r.tracks.map(function (tr) {
    var items = r.acc.items, i = Math.min(tr.accIdx, items.length - 1), last = i >= items.length - 1;
    return '<div class="zc-row"><span class="zc-e acc-ic">' + icon('i-broom', 22) + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(items[i]) + (r.tracks.length > 1 ? ' · ' + esc(focusNames(tr.ids)) : '') + '</b><span>' + (last ? 'Das leichteste Teil ist erreicht' : 'Nächste Chance auf ' + esc(items[i + 1]) + ' nach') + '</span></span>' + (last ? '' : '<span class="zc-t">' + zt((r.accAt || r.t0) + ACC_MIN * 60000, 'fällig') + '</span>') + '</div>';
  }).join('');
}
