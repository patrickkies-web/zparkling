/* =========================================================
   The challenge (Herausforderung): the birthday person plays against
   a guest. Without names entered beforehand (Gäste vor Ort, the JGA
   crew) there is nothing to pick: the birthday person grabs someone
   from the crowd and the game starts right away. With a list, the
   opponent is picked from the faces or the wheel, then the game starts.
   Guests never drink in a challenge: if the guest loses, he pays the
   stake. Once per evening and birthday person a lost challenge can be
   played again (Revanche-Karte).
   ========================================================= */
var A = A || {};
var ART_MORE = {
  angst: '<path d="M10 42V20a14 14 0 0 1 28 0v22l-4.5-4-4.5 4-4.5-4-4.5 4-4.5-4z" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="19" cy="21" rx="2.6" ry="3.4" fill="#1B1530"/><ellipse cx="29" cy="21" rx="2.6" ry="3.4" fill="#1B1530"/><ellipse cx="24" cy="30" rx="3.4" ry="4" fill="#1B1530"/><path d="M13 13l-3-3M35 13l3-3" stroke="#FF7A45" stroke-width="2.6" stroke-linecap="round"/>',
  liebling: '<path d="M14 26c-3-9 1-18 11-19 8 0 13 6 12 14l-1 7c-1 4-4 6-8 6H20c-3 0-5-3-6-8z" fill="#FF7A45" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 26c4 1 6-1 7-4" fill="none" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round"/><rect x="17" y="34" width="16" height="9" rx="2.5" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.4"/><path d="M27 15c-1.6-2.2-5-1.4-5 1.2 0 2.6 5 5.2 5 5.2s5-2.6 5-5.2c0-2.6-3.4-3.4-5-1.2z" fill="#FF8FC4" stroke="#1B1530" stroke-width="1.8" stroke-linejoin="round"/>',
  hand: '<rect x="12" y="21" width="24" height="21" rx="8" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.4"/><rect x="13" y="11" width="5.5" height="16" rx="2.75" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.2"/><rect x="19.5" y="7" width="5.5" height="19" rx="2.75" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.2"/><rect x="26" y="8" width="5.5" height="18" rx="2.75" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.2"/><rect x="32" y="12" width="5" height="14" rx="2.5" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.2"/><path d="M12 31h24" stroke="#5B8CFF" stroke-width="5"/><path d="M12 31h24" stroke="#1B1530" stroke-width="1.6" stroke-dasharray="2 3"/>',
  snail: '<path d="M5 39h29c4 0 7-2 8-6l2-5-4 1-2 3H5z" fill="#48D9A6" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="21" cy="27" r="11" fill="#FFC940" stroke="#1B1530" stroke-width="2.5"/><path d="M21 27a3.5 3.5 0 1 1 3.5 3.5M21 27a7.5 7.5 0 1 0 7.5-6" fill="none" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round"/><path d="M40 28l2-9M36 28l-1-9" stroke="#1B1530" stroke-width="2.2" stroke-linecap="round"/><circle cx="42" cy="18" r="1.9" fill="#1B1530"/><circle cx="35" cy="18" r="1.9" fill="#1B1530"/>',
  rocket: '<path d="M24 4c7 5 10 13 9 22l-4 7H19l-4-7c-1-9 2-17 9-22z" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="17" r="4" fill="#5B8CFF" stroke="#1B1530" stroke-width="2"/><path d="M15 26l-5 6 1 6 7-5M33 26l5 6-1 6-7-5" fill="#FF7A45" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M20 35c0 4 2 7 4 9 2-2 4-5 4-9z" fill="#FFC940" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/>',
  swap: '<path d="M10 20a14 14 0 0 1 25-7" fill="none" stroke="#1B1530" stroke-width="7" stroke-linecap="round"/><path d="M10 20a14 14 0 0 1 25-7" fill="none" stroke="#48D9A6" stroke-width="3.4" stroke-linecap="round"/><path d="M37 5l1 10-10-1z" fill="#48D9A6" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/><path d="M38 28a14 14 0 0 1-25 7" fill="none" stroke="#1B1530" stroke-width="7" stroke-linecap="round"/><path d="M38 28a14 14 0 0 1-25 7" fill="none" stroke="#FF8FC4" stroke-width="3.4" stroke-linecap="round"/><path d="M11 43l-1-10 10 1z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2" stroke-linejoin="round"/>',
  whisper: '<path d="M8 27c4-6 10-6 16-3 6-3 12-3 16 3-4 7-10 9-16 9s-12-2-16-9z" fill="#FF7A8A" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 27h32" stroke="#1B1530" stroke-width="2"/><rect x="21" y="7" width="6.5" height="32" rx="3.25" fill="#FBE0CB" stroke="#1B1530" stroke-width="2.4"/>',
  robot: '<rect x="11" y="14" width="26" height="22" rx="5" fill="#B9B4CC" stroke="#1B1530" stroke-width="2.5"/><circle cx="19" cy="24" r="3" fill="#48D9A6" stroke="#1B1530" stroke-width="1.8"/><circle cx="29" cy="24" r="3" fill="#48D9A6" stroke="#1B1530" stroke-width="1.8"/><path d="M18 31h12" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="2 2"/><path d="M24 14V9" stroke="#1B1530" stroke-width="2.4"/><circle cx="24" cy="7" r="2.6" fill="#FF7A45" stroke="#1B1530" stroke-width="1.8"/><path d="M11 22H7v8h4M37 22h4v8h-4" fill="#B9B4CC" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/>',
  note: '<path d="M18 36V12l20-5v23" fill="none" stroke="#1B1530" stroke-width="3" stroke-linejoin="round"/><path d="M18 18l20-5" stroke="#1B1530" stroke-width="3"/><ellipse cx="13" cy="36" rx="6" ry="4.5" fill="#FF7A45" stroke="#1B1530" stroke-width="2.4"/><ellipse cx="33" cy="30" rx="6" ry="4.5" fill="#FFC940" stroke="#1B1530" stroke-width="2.4"/>',
  chainball: '<circle cx="30" cy="31" r="12" fill="#3A3463" stroke="#1B1530" stroke-width="2.5"/><path d="M25 24a6 6 0 0 1 6-3" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" opacity=".7"/><ellipse cx="9" cy="9" rx="5" ry="3.4" transform="rotate(40 9 9)" fill="none" stroke="#1B1530" stroke-width="2.6"/><ellipse cx="14.5" cy="14.5" rx="5" ry="3.4" transform="rotate(40 14.5 14.5)" fill="none" stroke="#FFC940" stroke-width="2.6"/><ellipse cx="20" cy="20" rx="5" ry="3.4" transform="rotate(40 20 20)" fill="none" stroke="#1B1530" stroke-width="2.6"/>',
  spoon: '<ellipse cx="17" cy="15" rx="8" ry="10" transform="rotate(-35 17 15)" fill="#E6E2F7" stroke="#1B1530" stroke-width="2.5"/><path d="M22 22l17 17" stroke="#1B1530" stroke-width="7" stroke-linecap="round"/><path d="M22 22l17 17" stroke="#E6E2F7" stroke-width="3.4" stroke-linecap="round"/><path d="M12 12a5 5 0 0 1 4-3" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>',
  bolt: '<path d="M27 4L10 27h11l-4 17 20-25H26z" fill="#FFC940" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/>',
  lips: '<path d="M6 24c5-8 12-8 18-4 6-4 13-4 18 4-5 9-12 12-18 12S11 33 6 24z" fill="#FF7A8A" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 24c5 2 11 3 16 1 5 2 11 1 16-1" fill="none" stroke="#1B1530" stroke-width="2"/><path d="M14 20a6 6 0 0 1 5-2" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/>',
  brain: '<path d="M24 9c-3-4-10-3-11 2-5 0-8 5-6 9-3 3-2 8 2 9 0 4 4 7 8 5 2 3 6 3 7 0V9z" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><path d="M24 9c3-4 10-3 11 2 5 0 8 5 6 9 3 3 2 8-2 9 0 4-4 7-8 5-2 3-6 3-7 0V9z" fill="#B3A6FF" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><path d="M13 18c3 0 5 2 5 5M35 18c-3 0-5 2-5 5M16 29c2-1 4-1 6 1M32 29c-2-1-4-1-6 1" fill="none" stroke="#1B1530" stroke-width="2" stroke-linecap="round"/>',
  ketchup: '<path d="M17 16h14l2 6v18a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V22z" fill="#FF5A2E" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 16l2-6h6l2 6" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M23 10V5h2v5" fill="#F4F1FF" stroke="#1B1530" stroke-width="2"/><rect x="18" y="26" width="12" height="9" rx="2" fill="#FFFFFF" stroke="#1B1530" stroke-width="1.8"/><path d="M21 31c1-2 2 1 3-1s2 1 3-1" fill="none" stroke="#48D9A6" stroke-width="2" stroke-linecap="round"/>',
  wheel: '<circle cx="24" cy="25" r="17" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><path d="M24 25V8A17 17 0 0 1 40.2 20z" fill="#FF7A45"/><path d="M24 25l16.2-5A17 17 0 0 1 34 39z" fill="#FFC940"/><path d="M24 25l10 14a17 17 0 0 1-20 0z" fill="#48D9A6"/><path d="M24 25L14 39A17 17 0 0 1 7.8 20z" fill="#9886FF"/><path d="M24 25L7.8 20A17 17 0 0 1 24 8z" fill="#FF8FC4"/><circle cx="24" cy="25" r="17" fill="none" stroke="#1B1530" stroke-width="2.5"/><circle cx="24" cy="25" r="3.5" fill="#1B1530"/><path d="M19 2h10l-5 7z" fill="#1B1530"/>'
};
Object.keys(ART_MORE).forEach(function (k) { EMB_ART[k] = ART_MORE[k]; });
ROLE_ART.angst = ART_MORE.angst; ROLE_ART.liebling = ART_MORE.liebling;
ROLE_DEFS.angst = { name: 'Der Angstgegner', why: 'hat {F} bei den Herausforderungen am öftesten besiegt' };
ROLE_DEFS.liebling = { name: 'Der Lieblingsgegner', why: 'wurde von {F} am öftesten herausgefordert' };

/* ---------- picking a guest: faces, the wheel, or a name ---------- */
/* only people who are there tonight: the crew the master entered and names typed during the party (never the guest link) */
function guestPool() { return presentNames(); }
/* opts: act (data-act for a face), sel, bind (input), wheel (data-act of the wheel), extra: [{label, v, face}] */
function spinning(spin) { return !!(spin && spin.at && Date.now() - spin.at < 2600); }
/* one render when the wheel stops, so the drawn name lights up */
function afterSpin(P) { var sid = P.sid; setTimeout(function () { var Q = stepNow(); if (Q && Q.sid === sid && (UI.screen === 'step' || UI.screen === 'free')) render(); }, 2650); }
function pickerHtml(opts) {
  var names = (opts.names || guestPool()).slice(0, 18), sel = spinning(opts.spin) ? '' : String(opts.sel || '').toLowerCase();
  var chip = function (label, v, faceHtml) {
    var s = sel && String(v).toLowerCase() === sel;
    return '<button type="button" class="pk' + (s ? ' is-sel' : '') + '" data-act="' + opts.act + '" data-v="' + esc(v) + '" aria-pressed="' + s + '">' + faceHtml + '<span>' + esc(label) + '</span></button>';
  };
  var chips = (opts.extra || []).map(function (x) { return chip(x.label, x.v, x.face); }).join('') + names.map(function (n) { return chip(n, n, guestFace(n, 40)); }).join('');
  var spin = opts.spin && opts.spin.at && Date.now() - opts.spin.at < 3100 ? wheelHtml(opts.spin, names) : '';
  return '<div class="pk-grid mt10" role="group" aria-label="' + esc(opts.label || 'Gast auswählen') + '">' + (chips || '<p class="small" style="grid-column:1/-1">Noch keine Namen von heute Abend. Tipp einen Namen ein, beim nächsten Mal steht er hier zur Auswahl.</p>') + '</div>' +
    spin +
    '<div class="row gap8 mt10">' + (opts.wheel && names.length >= 2 ? '<button type="button" class="pk-wheel" data-act="' + opts.wheel + '">' + emb('wheel', 26) + 'Glücksrad</button>' : '') +
    '<label class="grow" for="pk-' + opts.bind.replace(/\W/g, '') + '"><span class="sr">Anderer Name</span><input id="pk-' + opts.bind.replace(/\W/g, '') + '" class="input" type="text" autocomplete="off" maxlength="24" placeholder="Anderer Name" data-bind="' + opts.bind + '" value="' + esc(opts.typed || '') + '"></label></div>';
}
/* the wheel turns to the name that was drawn; pure CSS, it keeps turning from where it is after a re-render */
function wheelHtml(spin, names) {
  var list = names.slice(0, 8); if (list.indexOf(spin.name) < 0) list[list.length - 1] = spin.name;
  var n = list.length, i = list.indexOf(spin.name), seg = 360 / n, to = 360 * 5 - (i + 0.5) * seg;
  var cols = ['#FF7A45', '#FFC940', '#48D9A6', '#9886FF', '#FF8FC4', '#7FA8FF', '#F4F1FF', '#FF9A73'];
  var grad = list.map(function (x, k) { return cols[k % cols.length] + ' ' + (k * seg).toFixed(1) + 'deg ' + ((k + 1) * seg).toFixed(1) + 'deg'; }).join(', ');
  var el = Math.max(0, (Date.now() - spin.at) / 1000);
  return '<div class="wh-over" style="animation-delay:-' + el.toFixed(2) + 's" aria-live="polite"><div class="wh"><span class="wh-pin" aria-hidden="true"></span><div class="wh-disc" style="background:conic-gradient(' + grad + ');--to:' + to.toFixed(1) + 'deg;animation-delay:-' + el.toFixed(2) + 's">' +
    list.map(function (x, k) { return '<span class="wh-l" style="transform:rotate(' + ((k + 0.5) * seg).toFixed(1) + 'deg)"><b>' + esc(x.slice(0, 10)) + '</b></span>'; }).join('') + '</div>' +
    '<p class="wh-res" style="animation-delay:' + Math.max(0, 2.4 - el).toFixed(2) + 's">' + esc(spin.name) + '!</p></div></div>';
}
function spinPick(names) { var list = names.slice(0, 8); return { name: pick(list), at: Date.now() }; }

/* ---------- the challenge itself ---------- */
function chGuest(P) { return String((P.ch && P.ch.guest) || P.guestName || '').trim(); }
function chGuestLabel(P) { return chGuest(P) || 'Der Gast'; }
/* the placeholder guest in the middle of a sentence: "gegen einen Gast", not "gegen Ein Gast" */
function accGuest(n) { return n === 'Ein Gast' || n === 'Der Gast' ? 'einen Gast' : n; }
/* an opponent is only picked when the master entered names beforehand */
function chCanPick() { return crewNames().length > 0; }
function chView(P, g) {
  var ch = P.ch, mp = person(P.main), tx = gameTx(g, P.format) || ['', ''];
  var how = unitText(tx[0], P.main), win = unitText(tx[1], P.main);
  var body = bigCard('var(--sun)', 'Herausforderung · ' + esc(g.cat), esc(g.name), '<p class="g-how" style="font-size:15px">' + esc(how) + '</p><p class="g-win">' + icon('i-flag', 15) + '<span>' + esc(win) + '</span></p>') +
    '<span class="eyebrow mt18 block">Gegen wen spielt ' + esc(mp.name) + '?</span>' +
    pickerHtml({ act: 'chGuest', sel: ch.guest, bind: 'ch.guest', typed: ch.typed ? ch.guest : '', wheel: 'chWheel', spin: ch.spin, label: 'Gegner auswählen' });
  var foot = spinning(ch.spin) ? '<button type="button" class="cta" disabled>' + emb('wheel', 26) + 'Das Rad dreht …</button>' :
    '<button type="button" class="cta" data-act="chGo">' + icon('i-play', 18) + (ch.guest ? 'Gegen ' + esc(ch.guest) + ' spielen' : 'Gegen jemand aus der Menge') + '</button>';
  return { body: body, foot: foot };
}
/* a fresh challenge on a game step: straight to the game unless there is a list to pick from */
function chInit(P) {
  P.ch = { phase: chCanPick() ? 'pick' : 'play', guest: '', typed: false, stakes: drawStakes(P.main, 'Der Gast'), stake: '', spin: null };
  P.ch.stake = P.ch.stakes[0] || '';
  return P;
}
function chStep() { var P = stepNow(); return P && P.kind === 'spiel' && P.ch ? P : null; }
A.chGuest = function (d) { var P = chStep(); if (!P) return; P.ch.guest = P.ch.guest === d.v && !P.ch.typed ? '' : d.v; P.ch.typed = false; P.ch.spin = null; commit(); };
A.chWheel = function () { var P = chStep(); if (!P) return; var pool = guestPool(); if (pool.length < 2) return; var s = spinPick(pool); P.ch.guest = s.name; P.ch.typed = false; P.ch.spin = s; commit(); afterSpin(P); };
A.chGo = function () {
  var P = chStep(); if (!P) return;
  var G = String(P.ch.guest || '').trim();
  P.ch.guest = G; P.guestName = G; P.ch.phase = 'play'; P.ch.spin = null;
  P.ch.stakes = drawStakes(P.main, G || 'Der Gast'); P.ch.stake = P.ch.stakes[0] || '';
  commit(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0;
};
/* the stake can be swapped on the game card */
A.chStakeNext = function () { var P = chStep(); if (!P || P.result || !P.ch.stakes.length) return; var i = P.ch.stakes.indexOf(P.ch.stake); P.ch.stake = P.ch.stakes[(i + 1) % P.ch.stakes.length]; commit(); };
A.chBack = function () { var P = chStep(); if (!P || P.result || !chCanPick()) return; P.ch.phase = 'pick'; commit(); };
/* read a line out right on the tap that asked for it */
function sayNow(t) {
  try { var ss = window.speechSynthesis; if (!ss || !t) return; ss.cancel(); var u = new SpeechSynthesisUtterance(t); u.lang = 'de-DE'; u.rate = 1.04; u.pitch = 1.1; var v = (ss.getVoices() || []).filter(function (x) { return /^de/i.test(x.lang); })[0]; if (v) u.voice = v; ss.speak(u); } catch (e) {}
}
/* the guest lost: no drink, the stake instead */
function stakeRow(P) {
  var G = chGuest(P) || 'Der Gast';
  var st = (P.ch && P.ch.stake) || lineFill(STAKES[0], P.main, { G: G });
  return { pid: '', name: G, n: 0, stake: true, note: st };
}

/* ---------- who challenged whom, for the closing credits ---------- */
function noteDuel(name, focusWon) {
  var r = R(); name = String(name || '').trim();
  if (!r || r.finished || !name || name === 'Ein Gast') return;
  r.duel = r.duel || {};
  var k = name.toLowerCase(), d = r.duel[k] = r.duel[k] || { name: name, n: 0, gw: 0, fw: 0 };
  d.n += 1; if (focusWon) d.fw += 1; else d.gw += 1;
}
function duelRoles(r) {
  var list = Object.keys((r && r.duel) || {}).map(function (k) { return r.duel[k]; }), out = [];
  var angst = list.filter(function (d) { return d.gw > 0; }).sort(function (a, b) { return b.gw - a.gw || b.gw / b.n - a.gw / a.n || b.n - a.n; })[0];
  if (angst) out.push({ id: 'angst', name: angst.name, text: angst.name + ' hat ' + roleF(r) + ' ' + (angst.gw === 1 ? 'einmal' : angst.gw + '-mal') + ' besiegt' + (angst.fw ? ' und ' + (angst.fw === 1 ? 'einmal' : angst.fw + '-mal') + ' verloren.' : ' und nie verloren.') });
  var lieb = list.filter(function (d) { return d.n >= 2 && (!angst || d.name !== angst.name); }).sort(function (a, b) { return b.n - a.n || b.fw - a.fw; })[0];
  if (lieb) out.push({ id: 'liebling', name: lieb.name, text: lieb.name + ' wurde ' + lieb.n + '-mal herausgefordert. Bilanz für ' + roleF(r) + ': ' + lieb.fw + ':' + lieb.gw + '.' });
  return out;
}
function duelAbspannHtml(r) {
  var list = Object.keys((r && r.duel) || {}).map(function (k) { return r.duel[k]; });
  if (!list.length) return '';
  var n = 0, fw = 0, gw = 0; list.forEach(function (d) { n += d.n; fw += d.fw; gw += d.gw; });
  var roles = duelRoles(r);
  return '<span class="eyebrow mt22 block">Die Herausforderungen</span><div class="card pad mt10 row" style="gap:14px"><span class="tile-ic" style="width:46px;height:46px;border-radius:14px;background:#F4F1FF">' + emb('liebling', 32) + '</span><span class="stack grow" style="gap:2px"><span class="name">' + n + (n === 1 ? ' Herausforderung' : ' Herausforderungen') + '</span><span class="sub">' + esc(roleF(r)) + ' gewann ' + fw + ', die Gäste ' + gw + '.</span></span><span class="num" style="font:900 26px var(--display);color:var(--white)">' + fw + ':' + gw + '</span></div>' +
    (roles.length ? '<div class="stack gap10 mt10">' + roles.map(function (x) { var d = ROLE_DEFS[x.id]; return '<div class="rolecard"><span class="rc-e" aria-hidden="true">' + roleIcon(x.id, 34) + '</span><span class="stack" style="gap:3px;min-width:0"><span class="rc-l">' + esc(d.name) + '</span><b class="rc-n">' + esc(x.name) + '</b><span class="rc-w">' + esc(x.text) + '</span></span></div>'; }).join('') + '</div>' : '');
}

/* ---------- the Revanche-Karte ---------- */
function canRevanche(P) {
  var r = R();
  return !!(r && !stepIsFree() && P && P.result && P.kind === 'spiel' && P.format === 'duellGast' && P.result.tone === 'fail' && !P.revanche && !(r.rev && r.rev[P.main]));
}
function revancheHtml(P) {
  if (!canRevanche(P)) return '';
  var G = chGuest(P);
  return '<button type="button" class="revcard mt14" data-act="chRevanche"><span class="rev-e" aria-hidden="true">' + emb('swap', 34) + '</span><span class="stack grow" style="gap:2px;text-align:left;min-width:0"><b>Revanche-Karte ausspielen</b><span>Einmal pro Abend: nochmal gegen ' + esc(G || 'denselben Gast') + '. Es zählt das zweite Ergebnis.</span></span><span class="rev-cta">Revanche!</span></button>';
}
A.chRevanche = function () {
  var r = R(), P = r && r.pending;
  if (!canRevanche(P)) return;
  /* go back to right before this result was entered, exactly like undo, then play the same challenge again */
  var i = r.hist ? r.hist.length - 1 : -1, h = i >= 0 ? r.hist[i] : null;
  if (!h || h.kind !== 'action' || !h.run.pending || h.run.pending.sid !== P.sid) { setToast('Revanche geht hier nicht mehr'); return; }
  var pid = P.main, G = chGuest(P) || 'denselben Gast';
  if (!restoreSnap(i)) return;
  var r2 = R(), P2 = r2.pending;
  r2.rev = r2.rev || {}; r2.rev[pid] = true;
  P2.revanche = true; if (P2.ch) P2.ch.phase = 'play';
  logRun('info', person(pid).name + ' spielt die Revanche-Karte gegen ' + G);
  UI.timer = null; UI.fxDone = null;
  commit(); go('step'); setToast('Revanche! Es zählt das zweite Ergebnis');
};
