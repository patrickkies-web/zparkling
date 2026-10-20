/* =========================================================
   The Handicap-Station: a moment between two tasks, never a task
   itself. The birthday person names a guest, the guest picks one
   of three cards. A card runs for a while (time-based) and ends on
   its own; a win in a later game can end a real handicap early.
   Handicaps never cause drinks. Tempo cards only change how the
   Pilot decides a loss: Atempause (water), Vollgas (no luck with
   water, still under max and brake, at most one over the personal
   target), Strafe statt Pinnchen (a penalty instead, booked like a
   water joker so the Pilot does not catch up later).
   ========================================================= */
var A = A || {};
var HC_CARDS = {
  schwach: { k: 'bad', name: 'Schwache Hand', e: 'hand', t: 'Alles nur noch mit der schwachen Hand: Glas, Spiele, Händeschütteln.' },
  reim: { k: 'bad', name: 'Reim-Zwang', e: 'note', t: '{N} spricht nur noch in Reimen. Klappt es nicht, buhen die Gäste.' },
  dritte: { k: 'bad', name: 'Dritte Person', e: 'idcard', t: '{N} spricht von sich nur noch in der dritten Person: „{N} hätte gern noch Chips.“' },
  fluester: { k: 'bad', name: 'Flüster-Modus', e: 'whisper', t: '{N} darf nur noch flüstern.' },
  roboter: { k: 'bad', name: 'Roboter', e: 'robot', t: '{N} bewegt sich und spricht nur noch wie ein Roboter.' },
  schatten: { k: 'bad', name: 'Der Schatten', e: 'agent', t: '{G} wird zum Schatten von {N} und macht alles nach, was {N} tut.' },
  kopf: { k: 'bad', name: 'Kopfschmuck', e: 'crown', t: '{G} setzt {N} etwas Albernes auf den Kopf. Es bleibt oben.' },
  kompliment: { k: 'bad', name: 'Charme-Pflicht', e: 'letter', t: 'Bevor {N} etwas sagt, gibt es erst ein Kompliment an jemanden.' },
  auge: { k: 'bad', name: 'Ein Auge zu', e: 'mask', t: '{N} hält bei allem ein Auge zu.' },
  janein: { k: 'bad', name: 'Ja-Nein-Verbot', e: 'lock', t: 'Kein Ja, kein Nein, kein Nicken, kein Kopfschütteln.' },
  atem: { k: 'atem', name: 'Atempause', e: 'snail', t: 'Verlorene Spiele kosten {N} nur Wasser.' },
  vollgas: { k: 'vollgas', name: 'Vollgas', e: 'rocket', t: 'Jede Niederlage kostet {N} ein {U}, ohne Glück mit Wasser. Maximum und Tempo-Bremse gelten trotzdem.' },
  tausch: { k: 'tausch', name: 'Strafe statt {U}', e: 'swap', t: 'Bei Niederlagen gibt es für {N} eine Strafe statt {U}. Das {U} wird nicht nachgeholt.' }
};
var HC_BAD = Object.keys(HC_CARDS).filter(function (k) { return HC_CARDS[k].k === 'bad'; });
var HC_SPECIAL = ['atem', 'vollgas', 'tausch'];
function hcFill(s, pid, by) { return String(s).replace(/\{N\}/g, person(pid).name).replace(/\{G\}/g, by || 'Der Gast').replace(/\{U\}/g, U()); }
function hcName(id) { var c = HC_CARDS[id]; return c ? hcFill(c.name, '') : ''; }
/* can a win end it early? the real handicaps and Vollgas, not the gifts */
function hcReleasable(id) { var c = HC_CARDS[id]; return !!c && (c.k === 'bad' || c.k === 'vollgas'); }
function hcList(r) { r = r || R(); return (r && r.hc) || []; }
function hcLive(h) { return !h.off && now() < h.end; }
function hcActive(pid) { var r = R(); if (!r || r.finished) return []; return hcList(r).filter(function (h) { return h.pid === pid && hcLive(h); }); }
/* used by the Pilot: is a tempo card of this kind running for the person? */
function hcHas(pid, kind) { return hcActive(pid).some(function (h) { return (HC_CARDS[h.id] || {}).k === kind; }); }
function hcDur(r) { return clamp(Math.round((r.planned || 60) * 0.18), 8, 20); }
function hcPoints(r) { return (r.planSteps || 20) >= 30 ? [0.4, 0.7] : [0.45]; }
function hcWho(r) {
  var v = r.hcVisits || {}, cur = currentMain();
  return r.who.slice().sort(function (a, b) { return (v[a] || 0) - (v[b] || 0) || (b === cur) - (a === cur); })[0];
}
/* side-effect free: is the station due now? */
function hcInjection(r) {
  if (!r || r.finished || r.lastDone || r.forceGame || !r.steps) return null;
  var pts = hcPoints(r), n = r.hcN || 0;
  if (n >= pts.length || nearEnd(r) || maxProgress(r) < pts[n]) return null;
  return { kind: 'handicap', track: currentTrack().id, main: hcWho(r) };
}
function prepHcStep(r, P) {
  var have = hcActive(P.main).map(function (h) { return h.id; });
  var bad = shuffle(HC_BAD.filter(function (k) { return have.indexOf(k) < 0; })).slice(0, 2);
  var sp = shuffle(HC_SPECIAL.filter(function (k) { return have.indexOf(k) < 0; }))[0];
  P.sid = uid('s');
  P.hc = { phase: 'pick', guest: '', typed: false, spin: null, cards: shuffle(bad.concat(sp ? [sp] : [])), choice: '', dur: hcDur(r) };
  return P;
}
/* the card is chosen: it starts now */
function hcApply(r, P) {
  r.hc = r.hc || []; r.hcVisits = r.hcVisits || {};
  var live = r.hc.filter(function (h) { return h.pid === P.main && hcLive(h); });
  /* never more than two at once: the oldest ends */
  if (live.length >= 2) { live.sort(function (a, b) { return a.start - b.start; })[0].off = true; }
  var t = now();
  r.hc.push({ id: P.hc.choice, pid: P.main, by: P.hc.guest || '', start: t, end: t + P.hc.dur * 60000, off: false, sid: P.sid });
  r.hcN = (r.hcN || 0) + 1; r.hcVisits[P.main] = (r.hcVisits[P.main] || 0) + 1;
  logRun('info', 'Handicap für ' + person(P.main).name + ': ' + hcName(P.hc.choice) + (P.hc.guest ? ', ausgesucht von ' + P.hc.guest : ''));
}
function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }
function hcChip(h, big) {
  var c = HC_CARDS[h.id] || {};
  return '<span class="hc-chip' + (big ? ' big' : '') + (c.k !== 'bad' ? ' ' + c.k : '') + '" title="' + esc(hcFill(c.t || '', h.pid, h.by)) + '"><span class="hc-e" aria-hidden="true">' + emb(c.e, big ? 26 : 20) + '</span><b>' + esc(hcName(h.id)) + '</b><span class="hc-time num" data-hcend="' + h.end + '">' + mmss(h.end - now()) + '</span></span>';
}
/* on a task card: what is running for the people who play now */
function hcStepBar(P) {
  var r = R(); if (!r || stepIsFree() || !P) return '';
  var ids = [P.main].concat(P.opp ? [P.opp] : [], P.team || []).filter(function (x, i, a) { return x && a.indexOf(x) === i; });
  var chips = ids.map(function (id) { return hcActive(id).map(function (h) { return (ids.length > 1 ? '<span class="hc-who">' + esc(person(id).name) + '</span>' : '') + hcChip(h); }).join(''); }).join('');
  return chips ? '<div class="hc-bar">' + chips + '</div>' : '';
}
/* on the overview: every running card, the master can end one */
function hcRunCard(r) {
  var live = hcList(r).map(function (h, i) { return { h: h, i: i }; }).filter(function (x) { return hcLive(x.h); });
  if (!live.length) return '';
  return '<span class="eyebrow mt18 block">Handicaps</span><div class="card pad mt10 stack gap10">' + live.map(function (x) {
    var c = HC_CARDS[x.h.id] || {};
    return '<div class="row" style="gap:10px;align-items:flex-start">' + face(person(x.h.pid), 36) + '<span class="stack grow" style="gap:4px;min-width:0">' + hcChip(x.h) + '<span class="sub">' + esc(hcFill(c.t || '', x.h.pid, x.h.by)) + '</span></span><button type="button" class="iconbtn sm" data-act="hcEnd" data-i="' + x.i + '" aria-label="Handicap beenden">' + icon('i-close', 14) + '</button></div>';
  }).join('') + '</div>';
}
/* after a won game: the winner may drop a handicap */
function hcReleaseHtml(P) {
  var r = R(); if (!r || stepIsFree() || !P || !P.result) return '';
  var out = '';
  (P.winIds || []).forEach(function (pid) {
    hcList(r).forEach(function (h, i) {
      if (h.pid !== pid || !hcLive(h) || !hcReleasable(h.id)) return;
      out += '<button type="button" class="hc-free mt10" data-act="hcRelease" data-i="' + i + '">' + emb((HC_CARDS[h.id] || {}).e, 26) + '<span class="grow" style="text-align:left">Sieg! ' + esc(person(pid).name) + ' legt „' + esc(hcName(h.id)) + '“ ab</span>' + icon('i-check', 16) + '</button>';
    });
  });
  return out;
}
/* the station card */
function hcView(P) {
  var mp = person(P.main), hc = P.hc, body = '', foot = '', G = String(hc.guest || '').trim() || 'Ein Gast';
  if (hc.phase === 'pick') {
    var others = E().focus.filter(function (p) { return p.id !== P.main; }).map(function (p) { return { label: p.name, v: p.name, face: face(p, 40) }; });
    body = bigCard('var(--violet)', 'Handicap-Station', esc(mp.name) + ' bekommt ein Handicap', '<p style="position:relative;font-weight:700">' + esc(mp.name) + ' bestimmt, wer es aussucht. Es läuft etwa ' + hc.dur + ' Minuten und verschwindet dann von selbst.</p>') +
      '<span class="eyebrow mt18 block">Wer sucht aus?</span>' + pickerHtml({ act: 'hcGuest', sel: hc.guest, bind: 'hc.guest', typed: hc.typed ? hc.guest : '', wheel: 'hcWheel', spin: hc.spin, extra: others, label: 'Wer sucht das Handicap aus?' });
    foot = spinning(hc.spin) ? '<button type="button" class="cta" disabled>' + emb('wheel', 26) + 'Das Rad dreht …</button>' : '<button type="button" class="cta" data-act="hcNext">' + emb('chainball', 26) + (hc.guest ? esc(hc.guest) + ' sucht aus' : 'Weiter') + '</button>';
  } else if (hc.phase === 'choose') {
    body = bigCard('var(--violet)', 'Handicap-Station', esc(G) + ', such aus!', '<p style="position:relative;font-weight:700">Drei Karten für ' + esc(mp.name) + '. Eine davon gilt die nächsten ' + hc.dur + ' Minuten.</p>') +
      '<div class="stack gap10 mt14">' + hc.cards.map(function (id) {
        var c = HC_CARDS[id], on = hc.choice === id;
        return '<button type="button" class="hc-card' + (on ? ' is-sel' : '') + (c.k !== 'bad' ? ' ' + c.k : '') + '" data-act="hcChoose" data-v="' + id + '" aria-pressed="' + on + '"><span class="hc-ce" aria-hidden="true">' + emb(c.e, 40) + '</span><span class="stack grow" style="gap:3px;min-width:0;text-align:left"><b>' + esc(hcName(id)) + '</b><span>' + esc(hcFill(c.t, P.main, G)) + '</span>' + (c.k !== 'bad' ? '<small>' + (c.k === 'vollgas' ? 'Tempo rauf' : c.k === 'atem' ? 'Tempo runter' : 'Joker-Karte') + '</small>' : '') + '</span><span class="check">' + icon('i-check', 14) + '</span></button>';
      }).join('') + '</div><button type="button" class="linkbtn mt10" data-act="hcBack">' + icon('i-back', 15) + 'Doch jemand anderes</button>';
    foot = '<button type="button" class="cta" data-act="hcPicked"' + (hc.choice ? '' : ' disabled') + '>Das soll es sein</button>';
  } else {
    var c = HC_CARDS[hc.choice] || {};
    body = '<div class="hc-big"><span class="hc-be" aria-hidden="true">' + emb(c.e, 76) + '</span><span class="hc-bl">Handicap für ' + esc(mp.name) + '</span><b>' + esc(hcName(hc.choice)) + '</b><p>' + esc(hcFill(c.t || '', P.main, G)) + '</p><span class="hc-bt">' + icon('i-clock', 16) + 'läuft ' + hc.dur + ' Minuten</span></div>' +
      '<p class="small mt14" style="text-align:center">' + (hcReleasable(hc.choice) ? 'Gewinnt ' + esc(mp.name) + ' später ein Spiel, kann das Handicap früher fallen.' : 'Ausgesucht von ' + esc(G) + '. Läuft ab und verschwindet von selbst.') + '</p>';
    foot = '<button type="button" class="cta" data-act="stepResolve" data-v="handicap">' + icon('i-play', 18) + 'Handicap startet jetzt</button>';
  }
  return { body: body, foot: foot };
}
function hcStep() { var P = stepNow(); return P && P.kind === 'handicap' && P.hc ? P : null; }
A.hcGuest = function (d) { var P = hcStep(); if (!P) return; P.hc.guest = P.hc.guest === d.v && !P.hc.typed ? '' : d.v; P.hc.typed = false; P.hc.spin = null; commit(); };
A.hcWheel = function () { var P = hcStep(); if (!P) return; var pool = guestPool(); if (pool.length < 2) return; var s = spinPick(pool); P.hc.guest = s.name; P.hc.typed = false; P.hc.spin = s; commit(); afterSpin(P); };
A.hcNext = function () { var P = hcStep(); if (!P) return; P.hc.guest = String(P.hc.guest || '').trim() || 'Ein Gast'; P.hc.phase = 'choose'; P.hc.spin = null; commit(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0; };
A.hcBack = function () { var P = hcStep(); if (!P) return; P.hc.phase = 'pick'; commit(); };
A.hcChoose = function (d) { var P = hcStep(); if (!P || P.hc.cards.indexOf(d.v) < 0) return; P.hc.choice = d.v; commit(); };
A.hcPicked = function () { var P = hcStep(); if (!P || !P.hc.choice) return; P.hc.phase = 'done'; commit(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0; sayNow(hcName(P.hc.choice) + ' für ' + person(P.main).name + '!'); };
A.hcRelease = function (d) {
  var r = R(), h = r && hcList(r)[+d.i]; if (!h || !hcLive(h)) return;
  h.off = true; h.offAt = now();
  logRun('info', person(h.pid).name + ' legt „' + hcName(h.id) + '“ mit einem Sieg ab');
  commit(); setToast('Handicap abgelegt');
};
A.hcEnd = function (d) {
  var r = R(), h = r && hcList(r)[+d.i]; if (!h || !hcLive(h)) return;
  h.off = true; h.offAt = now();
  logRun('info', 'Handicap „' + hcName(h.id) + '“ für ' + person(h.pid).name + ' beendet');
  commit(); setToast('Handicap beendet');
};
/* the little timers count down in place, nothing is rebuilt, no input loses focus */
function hcTick() {
  var els = document.querySelectorAll('[data-hcend]');
  for (var k = 0; k < els.length; k++) { var left = +els[k].getAttribute('data-hcend') - now(); els[k].textContent = left > 0 ? mmss(left) : 'vorbei'; if (left <= 0) els[k].classList.add('over'); }
}
