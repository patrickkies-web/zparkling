/* =========================================================
   Who is really there, and the Junggesellenabschied.
   The guest link says nothing about who came: many fill it in and stay home,
   others come without filling it in. Pickers and the wheel therefore only know
   names that belong to tonight: the crew the master entered, and names typed
   during the party. What guests sent through the link only feeds the content.
   ========================================================= */
var A = A || {};
var NOT_A_NAME = ['ein gast', 'der gast', 'herausforderer', 'gäste-team', 'die gruppe'];
function crewList() { var e = E(); return e && Array.isArray(e.crew) ? e.crew : []; }
function crewNames() { return crewList().map(function (c) { return c.name; }); }
function isJga() { return !!E() && evType().id === 'jga'; }
/* names typed tonight count as present */
function notePresent(name) {
  var e = E(); name = String(name || '').trim();
  if (!e || !name || name.length > 24 || NOT_A_NAME.indexOf(name.toLowerCase()) >= 0) return;
  if (e.focus.some(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })) return;
  e.here = Array.isArray(e.here) ? e.here : [];
  if (e.here.concat(crewNames()).map(function (x) { return x.toLowerCase(); }).indexOf(name.toLowerCase()) < 0) e.here.push(name);
}
function notePresentFromStep(P) {
  if (!P) return;
  [P.ch && P.ch.guest, P.hc && P.hc.guest, P.gl && P.gl.partner, P.kc && P.kc.mate, P.lip && P.lip.ears, P.giveTo, P.guestName].forEach(notePresent);
  if (P.kc && P.kc.rivals) P.kc.rivals.forEach(notePresent);
}
/* everyone the pickers and the wheel may show: the crew, names typed tonight, challenged guests */
function presentNames() {
  var e = E(), out = [], seen = {}, foc = e ? e.focus.map(function (p) { return p.name.toLowerCase(); }) : [];
  var add = function (n) { n = String(n || '').trim(); var k = n.toLowerCase(); if (!n || seen[k] || foc.indexOf(k) >= 0 || NOT_A_NAME.indexOf(k) >= 0) return; seen[k] = 1; out.push(n); };
  crewNames().forEach(add);
  ((e && e.here) || []).forEach(add);
  var r = R(); if (r && r.duel) Object.keys(r.duel).forEach(function (k) { add(r.duel[k].name); });
  return out;
}

/* ---------- packing list ---------- */
function packOf() { var e = E(); if (!e) return {}; if (!e.pack) e.pack = { stift: true }; return e.pack; }
function packed(id) { return !!packOf()[id]; }
function packLabel(id) { var x = JGA_PACK.filter(function (p) { return p[0] === id; })[0]; return x ? x[1] : id; }

/* ---------- how bold the person is ---------- */
function jgaMut(pid) { var m = +(person(pid).mut || 2); return m >= 1 && m <= 3 ? m : 2; }
function jgaMaxLvl(pid) { return jgaMut(pid) === 1 ? 2 : 3; }
/* chances of the three levels at the start and at the end of the evening */
var JGA_MIX = { 1: [[0.85, 0.15, 0], [0.65, 0.35, 0]], 2: [[0.45, 0.45, 0.1], [0.2, 0.45, 0.35]], 3: [[0.2, 0.5, 0.3], [0.05, 0.35, 0.6]] };
function jgaLevel(pid, x, first) {
  if (first) return 1;
  var a = JGA_MIX[jgaMut(pid)], t = clamp(x || 0, 0, 1);
  return weighted([1, 2, 3].map(function (l, i) { return [l, a[0][i] + (a[1][i] - a[0][i]) * t]; }));
}
function jgaModeOf(r) { return r && r.jga ? r.jga.mode : (S.runCfg && S.runCfg.jgaMode) || 'stadt'; }

/* ---------- picking a mission ---------- */
function missionData(pid) {
  var f = guestFacts(pid), p = person(pid);
  var clean = function (list) { var o = []; list.forEach(function (x) { var w = String(x.w || '').trim(); if (w && o.map(function (y) { return y.toLowerCase(); }).indexOf(w.toLowerCase()) < 0) o.push(w.slice(0, 40)); }); return o; };
  var mem = S.questions.filter(function (q) { return q.type === 'wer' && q.status === 'ok' && isGuestAuthor(q.author) && (!q.forId || q.forId === pid) && String(q.text || '').trim(); }).map(function (q) { var t = String(q.text).trim(); return t.length > 220 ? t.slice(0, 217) + '…' : t; });
  return { P: String(p.partner || '').trim(), I: clean(f.interests), T: clean(f.traits), M: mem };
}
function missionOk(m, d, mode) {
  if (mode === 'drinnen' && !m.bar) return false;
  if (!m.take.every(packed)) return false;
  if (m.dat.indexOf('P') >= 0 && !d.P) return false;
  if (m.dat.indexOf('I') >= 0 && !d.I.length) return false;
  if (m.dat.indexOf('T') >= 0 && !d.T.length) return false;
  if (m.dat.indexOf('M') >= 0 && !d.M.length) return false;
  return true;
}
function missionsUsed() { S.used = S.used || {}; return (S.used.jga = S.used.jga || []); }
function missionFill(s, pid, fill) {
  var n = person(pid).name;
  return String(s).replace(/\{Ns\}/g, possessive(n)).replace(/\{N\}/g, n).replace(/\{P\}/g, fill.P || '').replace(/\{I\}/g, fill.I || '').replace(/\{T\}/g, fill.T || '').replace(/\{M\}/g, fill.M || '');
}
/* a fresh mission of level L; when that level is used up, the nearest one below, then above (never above max) */
function jgaPick(L, max, d, mode, not) {
  var used = missionsUsed(), order = [L];
  for (var k = 1; k < 3; k++) { if (L - k >= 1) order.push(L - k); if (L + k <= max) order.push(L + k); }
  for (var i = 0; i < order.length; i++) {
    var c = JGA_TASKS.filter(function (m) { return m.lvl === order[i] && m.id !== not && used.indexOf(m.id) < 0 && missionOk(m, d, mode); });
    if (c.length) return pick(c);
  }
  /* everything played: the one played longest ago */
  var all = JGA_TASKS.filter(function (m) { return m.lvl <= max && m.id !== not && missionOk(m, d, mode); });
  if (!all.length) return null;
  return all.sort(function (a, b) { return used.indexOf(a.id) - used.indexOf(b.id); })[0];
}
function missionAvailable(pid, r) { var d = missionData(pid), mode = jgaModeOf(r); return JGA_TASKS.some(function (m) { return m.lvl <= jgaMaxLvl(pid) && missionOk(m, d, mode); }); }
/* opt: max (level cap), not (mission to avoid), x (progress) */
function makeMissionStep(main, r, opt) {
  opt = opt || {};
  var d = missionData(main), mode = jgaModeOf(r);
  var x = opt.x != null ? opt.x : (r ? maxProgress(r) : 0.5);
  var first = r ? !(r.kinds || []).some(function (k) { return k === 'mission'; }) : false;
  var max = Math.min(opt.max || 3, jgaMaxLvl(main)), L = Math.min(max, jgaLevel(main, x, first));
  var m = jgaPick(L, max, d, mode, opt.not); if (!m) return null;
  var used = missionsUsed(), at = used.indexOf(m.id); if (at >= 0) used.splice(at, 1); used.push(m.id);
  var fill = { P: d.P, I: d.I.length ? pick(d.I) : '', T: d.T.length ? pick(d.T) : '', M: d.M.length ? pick(d.M) : '' };
  return { kind: 'mission', mid: m.id, lvl: m.lvl, main: main, title: missionFill(m.title, main, fill), text: missionFill(m.t, main, fill), win: missionFill(m.win, main, fill), take: m.take.slice(), buy: m.buy, s: m.s, sid: uid('s') };
}
/* refusing costs a drink, unless max, tempo brake or a breather say no, or the person is already one over the personal target */
function refuseRow(pid) {
  var b = budget(pid);
  if (b.C >= b.M || needsPause(pid) || hcHas(pid, 'atem') || b.C >= Math.min(b.M, Math.ceil(b.Tp) + 1)) return drinkRow(pid, 'Mission verweigert');
  return { pid: pid, name: person(pid).name, n: 1, note: 'Mission verweigert', done: true };
}
function noteMission(r, P, how) {
  if (!r) return;
  var s = r.jstat = r.jstat || { ok: 0, fail: 0, refuse: 0, wild: 0, best: '' };
  s[how] += 1;
  if (how === 'ok' && P.lvl === 3) { s.wild += 1; s.best = P.title; }
  else if (how === 'ok' && !s.best && P.lvl === 2) s.best = P.title;
}

/* ---------- the crew's jobs: a small moment between two missions ---------- */
function jgaRole(id) { return JGA_ROLES.filter(function (x) { return x.id === id; })[0] || null; }
function crewWithRoles() { return crewList().filter(function (c) { return c.role && jgaRole(c.role); }); }
function crewState(r) { r.jcrew = r.jcrew || { n: 0, last: -9, used: [], by: {} }; return r.jcrew; }
function crewJobsLeft(r) {
  var st = crewState(r), out = [];
  crewWithRoles().forEach(function (c) { jgaRole(c.role).jobs.forEach(function (j, i) { var k = c.id + ':' + c.role + ':' + i; if (st.used.indexOf(k) < 0) out.push({ c: c, i: i, k: k }); }); });
  return out;
}
/* side-effect free: is a crew job due? Every third or fourth task, a few per evening, never in the very last stretch */
function crewInjection(r) {
  if (!r || !r.jga || r.finished || r.lastDone || r.forceGame || !r.steps) return null;
  var st = crewState(r), cap = Math.max(2, Math.ceil((r.planSteps || 20) / 3.5));
  if (st.n >= cap || r.steps - st.last < 3 + (st.n % 2) || nearEnd(r)) return null;
  if (!crewJobsLeft(r).length) return null;
  return { kind: 'crew', track: currentTrack().id, main: currentMain() };
}
function prepCrewStep(r, P) {
  var st = crewState(r), left = crewJobsLeft(r);
  var low = Math.min.apply(null, left.map(function (x) { return st.by[x.c.id] || 0; }));
  var pickd = pick(left.filter(function (x) { return (st.by[x.c.id] || 0) === low; }));
  st.n += 1; st.last = r.steps; st.used.push(pickd.k); st.by[pickd.c.id] = (st.by[pickd.c.id] || 0) + 1;
  var role = jgaRole(pickd.c.role), fill = function (s) { return String(s).replace(/\{C\}/g, pickd.c.name).replace(/\{N\}/g, person(P.main).name); };
  P.cid = pickd.c.id; P.name = pickd.c.name; P.role = role.id; P.text = fill(role.jobs[pickd.i]); P.amt = fill(role.amt); P.sid = uid('s');
  return P;
}

/* ---------- emblems for the crew and the missions ---------- */
EMB_ART.camera = '<rect x="5" y="14" width="38" height="26" rx="5" fill="#9886FF" stroke="#1B1530" stroke-width="2.5"/><path d="M16 14l3-6h10l3 6" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="27" r="8.5" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5"/><circle cx="24" cy="27" r="4" fill="#5B8CFF" stroke="#1B1530" stroke-width="2"/><circle cx="37" cy="20" r="2" fill="#FFC940" stroke="#1B1530" stroke-width="1.5"/>';
EMB_ART.compass = '<circle cx="24" cy="24" r="17" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.5"/><circle cx="24" cy="24" r="12.5" fill="#48D9A6" stroke="#1B1530" stroke-width="2"/><path d="M24 12l4 12h-8z" fill="#FF5A2E" stroke="#1B1530" stroke-width="1.8" stroke-linejoin="round"/><path d="M24 36l-4-12h8z" fill="#FFFFFF" stroke="#1B1530" stroke-width="1.8" stroke-linejoin="round"/><circle cx="24" cy="24" r="2" fill="#1B1530"/>';
EMB_ART.coin = '<circle cx="24" cy="24" r="16" fill="#FFC940" stroke="#1B1530" stroke-width="2.5"/><circle cx="24" cy="24" r="11.5" fill="none" stroke="#1B1530" stroke-width="1.6" stroke-dasharray="2 3"/><path d="M28.5 17.5c-1.2-1-2.8-1.5-4.4-1.5-3.7 0-6.4 3.4-6.4 8s2.7 8 6.4 8c1.6 0 3.2-.5 4.4-1.5M15.5 22h9M15.5 26.5h9" fill="none" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round"/>';
EMB_ART.medkit = '<rect x="6" y="14" width="36" height="26" rx="5" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><path d="M18 14v-4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" fill="none" stroke="#1B1530" stroke-width="2.5"/><path d="M24 20v14M17 27h14" stroke="#FF5A2E" stroke-width="5" stroke-linecap="round"/>';
EMB_ART.city = '<rect x="5" y="24" width="8" height="18" fill="#7FA8FF" stroke="#1B1530" stroke-width="2.2"/><rect x="13" y="12" width="10" height="30" fill="#9886FF" stroke="#1B1530" stroke-width="2.2"/><rect x="23" y="20" width="8" height="22" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.2"/><rect x="31" y="8" width="10" height="34" fill="#48D9A6" stroke="#1B1530" stroke-width="2.2"/><path d="M16 18h4M16 24h4M16 30h4M34 14h4M34 20h4M34 26h4M26 26h2M26 32h2" stroke="#FFC940" stroke-width="2.2" stroke-linecap="round"/><path d="M2 42h44" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/>';
EMB_ART.backpack = '<path d="M14 18a10 10 0 0 1 20 0v20a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z" fill="#FF7A45" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 12V9a5 5 0 0 1 10 0v3" fill="none" stroke="#1B1530" stroke-width="2.5"/><rect x="18" y="27" width="12" height="9" rx="2" fill="#FFC940" stroke="#1B1530" stroke-width="2.2"/><path d="M21 27v-2h6v2" fill="none" stroke="#1B1530" stroke-width="2"/>';
EMB_ART.bag = '<path d="M10 16h28l-2.5 25a3 3 0 0 1-3 2.7H15.5a3 3 0 0 1-3-2.7z" fill="#48D9A6" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 20v-7a6 6 0 0 1 12 0v7" fill="none" stroke="#1B1530" stroke-width="2.5" stroke-linecap="round"/><circle cx="18" cy="21" r="1.8" fill="#1B1530"/><circle cx="30" cy="21" r="1.8" fill="#1B1530"/>';
EMB_ART.ring = '<circle cx="24" cy="30" r="12" fill="none" stroke="#1B1530" stroke-width="7.5"/><circle cx="24" cy="30" r="12" fill="none" stroke="#FFC940" stroke-width="3.6"/><path d="M18 11l6-6 6 6-6 7z" fill="#8FE3FF" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/>';
function heatHtml(lvl, size) { size = size || 22; var o = ''; for (var i = 1; i <= 3; i++) o += '<span class="jm-f' + (i <= lvl ? ' on' : '') + '">' + emb('flame', size) + '</span>'; return '<span class="jm-heat" role="img" aria-label="Stufe ' + lvl + ' von 3">' + o + '</span>'; }

/* ---------- the mission card ---------- */
function missionView(P) {
  var mp = person(P.main), lv = JGA_LEVELS[P.lvl] || JGA_LEVELS[1];
  var extra = (P.take.length ? '<p class="jm-need">' + emb('backpack', 22) + '<span><b>Dabei:</b> ' + esc(P.take.map(packLabel).join(', ')) + '</span></p>' : '') +
    (P.buy ? '<p class="jm-need">' + emb('bag', 22) + '<span><b>Unterwegs besorgen:</b> ' + esc(P.buy) + '</span></p>' : '');
  var say = P.title + '. ' + P.text + ' ' + P.win;
  var body = bigCard(lv.c, 'Mission · ' + lv.name, esc(P.title),
    '<p class="g-how">' + esc(P.text) + '</p><p class="g-win">' + icon('i-flag', 15) + '<span>' + esc(P.win) + '</span></p>' + extra +
    '<div class="row" style="position:relative;gap:8px;justify-content:space-between;flex-wrap:wrap">' + heatHtml(P.lvl, 22) + '<button type="button" class="g-say" data-act="speak" data-t="' + esc(say) + '">' + icon('i-play', 13) + 'Vorlesen</button></div>');
  body += '<div class="mt18 row" style="justify-content:center">' + face(mp, 84, '', P.lvl === 3 ? 'cool' : '') + '</div>' +
    '<p class="jm-fair">' + emb('shield', 22) + '<span>Wer Nein sagt, wird in Ruhe gelassen, dann fragt ' + esc(mp.name) + ' einfach jemand anderen. Nichts Verbotenes, niemand unter 18.</span></p>' +
    (P.result ? '' : timerBlock(P.s, 'm' + P.mid));
  var foot = '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="stepResolve" data-v="fail">Nicht geschafft</button><button type="button" class="cta mint" style="flex:1" data-act="stepResolve" data-v="ok">' + icon('i-check', 18) + 'Geschafft</button></div>' +
    '<button type="button" class="linkbtn" style="align-self:center" data-act="stepResolve" data-v="refuse">Verweigert, das kostet 1 ' + esc(U()) + '</button>';
  return { body: body, foot: foot };
}
function crewStepView(P) {
  var role = jgaRole(P.role) || { name: 'Truppe', art: 'popper' };
  var body = bigCard('var(--violet)', 'Truppen-Auftrag', esc(P.name) + ' ist dran!', '<p class="g-how">' + esc(P.text) + '</p>') +
    '<div class="rolecard big mt14"><span class="rc-e" aria-hidden="true">' + emb(role.art, 46) + '</span><span class="stack" style="gap:3px;min-width:0"><span class="rc-l">' + esc(role.name) + '</span><b class="rc-n">' + esc(P.name) + '</b><span class="rc-w">' + esc(P.amt || '') + '</span></span></div>' +
    '<p class="small mt10">Wer kneift, trinkt eins. Gezählt wird bei der Truppe nichts, der Pilot rechnet nur für ' + esc(person(P.main).name) + '.</p>';
  var foot = '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="stepResolve" data-v="fail">Gekniffen</button><button type="button" class="cta mint" style="flex:1" data-act="stepResolve" data-v="ok">' + icon('i-check', 18) + 'Erledigt</button></div>';
  return { body: body, foot: foot };
}

/* ---------- the crew screen: names (and for a JGA roles and the packing list) ---------- */
V.crew = function () {
  var jga = isJga(), list = crewList(), ed = UI.crewEdit;
  var taken = {}; list.forEach(function (c) { if (c.role) taken[c.role] = c; });
  var rows = list.map(function (c, i) {
    var role = c.role ? jgaRole(c.role) : null;
    return '<div class="crew-row' + (ed === c.id ? ' open' : '') + '">' + guestFace(c.name, 42) +
      '<span class="stack grow" style="gap:2px;min-width:0"><b>' + esc(c.name) + '</b>' + (jga ? '<span class="sub">' + (role ? esc(role.name) : 'Noch keine Rolle') + '</span>' : '') + '</span>' +
      (jga ? '<button type="button" class="chip-btn sm" data-act="crewEdit" data-v="' + c.id + '" aria-expanded="' + (ed === c.id) + '">' + (role ? emb(role.art, 18) + 'Rolle' : icon('i-plus', 14) + 'Rolle') + '</button>' : '') +
      '<button type="button" class="iconbtn sm" data-act="crewDel" data-i="' + i + '" aria-label="' + esc(c.name) + ' entfernen">' + icon('i-close', 16) + '</button></div>' +
      (jga && ed === c.id ? '<div class="crew-roles">' + JGA_ROLES.map(function (ro) {
        var h = taken[ro.id], mine = c.role === ro.id;
        return '<button type="button" class="crew-role' + (mine ? ' is-sel' : '') + '" data-act="crewRole" data-id="' + c.id + '" data-v="' + ro.id + '" aria-pressed="' + mine + '"><span class="cr-e">' + emb(ro.art, 30) + '</span><span class="stack" style="gap:2px;min-width:0;text-align:left"><b>' + esc(ro.name) + '</b><span>' + esc(ro.amt.replace(/\{N\}/g, focusNames())) + '</span>' + (h && !mine ? '<i>vergeben an ' + esc(h.name) + '</i>' : '') + '</span></button>';
      }).join('') + (c.role ? '<button type="button" class="linkbtn" data-act="crewRole" data-id="' + c.id + '" data-v="">Rolle wieder wegnehmen</button>' : '') + '</div>' : '');
  }).join('');
  var add = '<div class="row gap8 mt14"><label class="grow" for="crewName"><span class="sr">Name</span><input id="crewName" class="input" type="text" maxlength="24" autocomplete="off" placeholder="Name eintippen" data-bind="crewName" value="' + esc(UI.crewName || '') + '"></label><button type="button" class="iconbtn" data-act="crewAdd" aria-label="Hinzufügen" style="width:48px;height:48px;flex-basis:48px;background:var(--accent);color:var(--ink)">' + icon('i-plus', 20) + '</button></div>';
  var body = '<div class="bigcard stack gap10" style="background:' + (jga ? 'var(--sun)' : 'var(--mint)') + '"><span class="badge">' + (jga ? 'Junggesellenabschied' : 'Heute vor Ort') + '</span><h2>' + (jga ? 'Wer ist in der Truppe?' : 'Wer ist heute da?') + '</h2><p style="position:relative;font-weight:700">' +
    (jga ? 'Trag alle ein, die mitziehen, und verteil Rollen mit Augenzwinkern. Wer eine Rolle hat, bekommt ab und zu einen eigenen Auftrag.' : 'Nur für das Glücksrad und die Auswahl bei Herausforderungen. Wer sich über den Link einträgt, muss nicht da sein, darum zählt nur, wer hier steht oder heute eingetippt wird.') + '</p></div>' +
    add + (rows ? '<div class="stack gap8 mt14">' + rows + '</div>' : '<div class="empty mt14">Noch niemand eingetragen.</div>') +
    (jga && list.length ? '<button type="button" class="btn-ghost mt14" data-act="crewDeal">' + emb('dice', 22) + 'Freie Rollen zufällig verteilen</button>' : '');
  if (jga) {
    var d = E().focus[0] ? missionData(E().focus[0].id) : { P: '', I: [], T: [], M: [] };
    var n = JGA_TASKS.filter(function (m) { return missionOk(m, d, 'stadt'); }).length;
    body += '<span class="eyebrow mt22 block">Packliste</span><p class="small mt6">Was ihr dabeihabt, macht weitere Missionen möglich. Kleinkram wie Postkarten oder Klopapier besorgt ihr unterwegs.</p>' +
      '<div class="chips mt10">' + JGA_PACK.map(function (p) { var on = packed(p[0]); return '<button type="button" class="chip-btn sm' + (on ? ' is-sel' : '') + '" data-act="packToggle" data-v="' + p[0] + '" aria-pressed="' + on + '">' + (on ? icon('i-check', 14) : '') + esc(p[1]) + '</button>'; }).join('') + '</div>' +
      '<p class="small mt10"><b style="color:var(--white)">' + n + ' von ' + JGA_TASKS.length + ' Missionen</b> sind damit möglich.' + (d.P ? '' : ' Tipp: Beim Junggesellen eintragen, wen er heiratet, dann kommen noch mehr dazu.') + '</p>';
  }
  return scr(topbar(UI.crewFrom || 'runSetup', jga ? 'Die Truppe' : 'Gäste vor Ort'), body, '<button type="button" class="cta" data-act="go" data-to="' + (UI.crewFrom || 'runSetup') + '">Fertig</button>');
};
A.openCrew = function (d) { UI.crewFrom = (d && d.from) || UI.screen; UI.crewEdit = null; go('crew'); };
A.crewAdd = function () {
  var e = E(), n = String(UI.crewName || '').trim().slice(0, 24); if (!n) return;
  e.crew = crewList();
  if (e.crew.some(function (c) { return c.name.toLowerCase() === n.toLowerCase(); }) || e.focus.some(function (p) { return p.name.toLowerCase() === n.toLowerCase(); })) { setToast(n + ' steht schon drin'); return; }
  e.crew.push({ id: uid('c'), name: n, role: '' }); UI.crewName = ''; UI.cfgErr = '';
  commit(); var i = document.getElementById('crewName'); if (i) i.focus();
};
A.crewDel = function (d) { var e = E(); e.crew = crewList(); var c = e.crew[+d.i]; if (!c) return; e.crew.splice(+d.i, 1); if (UI.crewEdit === c.id) UI.crewEdit = null; commit(); };
A.crewEdit = function (d) { UI.crewEdit = UI.crewEdit === d.v ? null : d.v; render(); };
A.crewRole = function (d) {
  var list = crewList(), c = list.filter(function (x) { return x.id === d.id; })[0]; if (!c) return;
  if (d.v) { var h = list.filter(function (x) { return x.role === d.v && x !== c; })[0]; if (h) h.role = c.role || ''; }
  c.role = d.v || ''; UI.crewEdit = null; commit();
};
A.crewDeal = function () {
  var list = crewList(), used = list.map(function (c) { return c.role; }).filter(Boolean);
  var free = shuffle(JGA_ROLES.map(function (r) { return r.id; }).filter(function (id) { return used.indexOf(id) < 0; }));
  list.forEach(function (c) { if (!c.role && free.length) c.role = free.shift(); });
  commit(); setToast('Rollen verteilt');
};
A.packToggle = function (d) { var p = packOf(); p[d.v] = !p[d.v]; commit(); };
A.cfgJga = function (d) { cfgDefaults().jgaMode = d.v === 'drinnen' ? 'drinnen' : 'stadt'; commit(); };
A.cfgMut = function (d) { var p = E().focus.filter(function (x) { return x.id === d.id; })[0]; if (!p) return; p.mut = clamp(+d.v || 2, 1, 3); commit(); };
A.draftMut = function (d) { UI.draft.mut = clamp(+d.v || 2, 1, 3); render(); };

/* the JGA block in the start screen; for every other party just the optional guest list */
function crewSetupHtml(c) {
  var list = crewList(), jga = isJga();
  if (!jga) return '<button type="button" class="card pad row plain mt14" data-act="openCrew" data-from="runSetup" style="width:100%"><span class="tile-ic" style="width:44px;height:44px;border-radius:13px;background:var(--mint)">' + icon('i-users', 22) + '</span><span class="stack grow" style="text-align:left;gap:2px"><span class="name">Gäste vor Ort (optional)</span><span class="sub">' + (list.length ? esc(joinNames(list.slice(0, 4).map(function (x) { return x.name; }))) + (list.length > 4 ? ' und ' + (list.length - 4) + ' weitere' : '') : 'Namen für Glücksrad und Herausforderungen') + '</span></span>' + icon('i-next', 18) + '</button>';
  var roles = crewWithRoles().length, mode = c.jgaMode === 'drinnen' ? 'drinnen' : 'stadt';
  var muts = E().focus.filter(function (p) { return c.who[p.id]; }).map(function (p) {
    var m = jgaMut(p.id);
    return '<div class="card pad mt10"><div class="row gap10">' + face(p, 36) + '<span class="stack grow" style="gap:2px"><span class="name">Wie mutig ist ' + esc(p.name) + '?</span><span class="sub">' + esc(JGA_MUT[m].sub) + '</span></span></div>' +
      '<div class="seg mt10" style="grid-template-columns:repeat(3,minmax(0,1fr));height:46px" role="group" aria-label="Mut von ' + esc(p.name) + '">' + [1, 2, 3].map(function (k) { var s = m === k; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="cfgMut" data-id="' + p.id + '" data-v="' + k + '" aria-pressed="' + s + '">' + ['', 'Schüchtern', 'Ausgeglichen', 'Offen'][k] + '</button>'; }).join('') + '</div></div>';
  }).join('');
  return '<span class="eyebrow mt22 block">Wo seid ihr unterwegs?</span><div class="seg mt10" style="grid-template-columns:repeat(2,minmax(0,1fr));height:48px" role="group" aria-label="Wo">' +
    [['stadt', 'In der Stadt'], ['drinnen', 'Drinnen, in der Bar']].map(function (x) { var s = mode === x[0]; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="cfgJga" data-v="' + x[0] + '" aria-pressed="' + s + '">' + x[1] + '</button>'; }).join('') + '</div>' +
    '<p class="small mt8">' + (mode === 'stadt' ? 'Missionen mit Leuten auf der Straße statt Minispielen. Dazu Gäste-Runden, Quizfragen und Truppen-Aufträge.' : 'Minispiele wie auf jeder Party, dazwischen Missionen, die auch in einer Bar gehen.') + '</p>' +
    muts +
    '<button type="button" class="card pad row plain mt10" data-act="openCrew" data-from="runSetup" style="width:100%"><span class="tile-ic" style="width:44px;height:44px;border-radius:13px;background:var(--sun)">' + emb('crown', 28) + '</span><span class="stack grow" style="text-align:left;gap:2px"><span class="name">Die Truppe und die Packliste</span><span class="sub">' + (list.length ? list.length + (list.length === 1 ? ' Person' : ' Personen') + ', ' + roles + (roles === 1 ? ' Rolle' : ' Rollen') + ' verteilt' : 'Noch niemand eingetragen. Das ist beim JGA Pflicht.') + '</span></span>' + icon('i-next', 18) + '</button>';
}
/* the closing credits: how the missions went and who had which office */
function jgaAbspannHtml(r) {
  if (!r || !r.jga) return '';
  var s = r.jstat || { ok: 0, fail: 0, refuse: 0, wild: 0, best: '' }, tot = s.ok + s.fail + s.refuse, F = focusNames(r.who);
  var crew = crewWithRoles();
  if (!tot && !crew.length) return '';
  var lines = tot ? [F + ' ' + (r.who.length > 1 ? 'haben' : 'hat') + ' ' + s.ok + ' von ' + tot + (tot === 1 ? ' Mission' : ' Missionen') + ' geschafft.'] : [];
  if (s.refuse) lines.push(s.refuse + (s.refuse === 1 ? '-mal' : '-mal') + ' wurde verweigert.');
  if (s.wild) lines.push(s.wild + (s.wild === 1 ? ' wilde Mission' : ' wilde Missionen') + ' erfüllt, zuletzt „' + s.best + '“.');
  else if (s.best) lines.push('Die mutigste geschaffte Mission: „' + s.best + '“.');
  return '<span class="eyebrow mt22 block">Die Missionen</span>' + (lines.length ? '<div class="ansage mt10"><div class="row" style="justify-content:space-between;gap:10px"><span class="ansage-l">' + icon('i-bubble', 14) + 'Zum Vorlesen</span><button type="button" class="ansage-play" data-act="speak" aria-label="Vorlesen lassen">' + icon('i-play', 14) + 'Vorlesen</button></div><p class="ansage-t" style="font-size:16px">' + lines.map(esc).join(' ') + '</p></div>' : '') +
    (crew.length ? '<span class="eyebrow mt22 block">Die Truppe</span><div class="stack gap10 mt10">' + crew.map(function (c) { var ro = jgaRole(c.role); return '<div class="rolecard"><span class="rc-e" aria-hidden="true">' + emb(ro.art, 34) + '</span><span class="stack" style="gap:3px;min-width:0"><span class="rc-l">' + esc(ro.name) + '</span><b class="rc-n">' + esc(c.name) + '</b><span class="rc-w">' + esc(ro.amt.replace(/\{N\}/g, F)) + '</span></span></div>'; }).join('') + '</div>' : '');
}
KIND_RULES.mission = { a: 'Mission! {N} hat einen Auftrag mitten unter Leuten. Wer verweigert, trinkt. Wer Nein sagt, wird in Ruhe gelassen.', f: [['Was ist, wenn ein Fremder nicht mitmacht?', 'Dann wird er in Ruhe gelassen, und {N} fragt jemand anderen. Das zählt nicht als gescheitert.'], ['Was kostet Verweigern?', 'Eins aus dem Glas, solange Maximum und Tempo-Bremse es zulassen. Bei „Nicht geschafft“ entscheidet der Pilot.'], ['Darf die Truppe helfen?', 'Anfeuern ja, die Mission erledigen nein.'], ['Ist die Mission zu heftig?', 'Mit dem Tauschen-Knopf oben kommt eine andere, nie eine wildere.']] };
KIND_RULES.crew = { a: 'Truppen-Auftrag! Jetzt ist jemand aus der Truppe dran, mit seiner Rolle.', f: [['Muss man mitmachen?', 'Wer kneift, trinkt eins. Gezählt wird bei der Truppe nichts.'], ['Wer entscheidet, ob es erledigt ist?', 'Die Truppe, im Zweifel der Spielleiter.']] };
