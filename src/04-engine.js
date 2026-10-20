/* =========================================================
   Helpers
   ========================================================= */
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function joinNames(arr) { arr = arr.filter(Boolean); if (arr.length <= 1) return arr.join(''); return arr.slice(0, -1).join(', ') + ' & ' + arr[arr.length - 1]; }
function fmtNum(v) { if (v === '' || v == null || isNaN(v)) return '–'; var n = Number(v); return n.toLocaleString('de-DE', { maximumFractionDigits: 2 }); }
function median(a) { a = a.filter(function (x) { return !isNaN(x); }).map(Number).sort(function (x, y) { return x - y; }); if (!a.length) return null; var m = Math.floor(a.length / 2); return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; }
function weighted(list) { var tot = 0; list.forEach(function (x) { tot += Math.max(0, x[1]); }); var r = Math.random() * tot; for (var i = 0; i < list.length; i++) { r -= Math.max(0, list[i][1]); if (r <= 0 && list[i][1] > 0) return list[i][0]; } return list[0][0]; }
function makeCode() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }

/* =========================================================
   Storage
   ========================================================= */
var KEY = 'altesocke.app.v2', INBOX_Q = 'altesocke.inbox.q', LIVE_KEY = 'altesocke.live', LIVE_ANS = 'altesocke.live.ans.';
var S;
function fresh() { return { v: 2, seq: 1, event: null, people: [], drinks: [], jokers: {}, questions: [], collectCode: '', run: null, runCfg: null, live: null, games: 0 }; }
function lsGet(k) { try { var r = localStorage.getItem(k); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
function load() { var d = lsGet(KEY); return d && d.v === 2 ? d : null; }
function save() { lsSet(KEY, S); if (S.live) lsSet(LIVE_KEY, S.live); }
function uid(p) { S.seq = (S.seq || 1) + 1; return p + S.seq + Math.floor(Math.random() * 90 + 10); }
function now() { return Date.now() + (S && S.run && S.run.shift ? S.run.shift : 0); }

/* merge questions guests sent through the link (same browser) */
function mergeInbox() {
  var inbox = lsGet(INBOX_Q);
  if (!inbox || !inbox.length) return 0;
  var have = {};
  S.questions.forEach(function (q) { have[q.id] = 1; });
  var n = 0;
  inbox.forEach(function (q) { if (!have[q.id]) { S.questions.push(q); n++; } });
  lsDel(INBOX_Q);
  if (n) save();
  return n;
}

/* =========================================================
   People
   ========================================================= */
var PEOPLE_COLORS = ['#48D9A6', '#9886FF', '#FFC940', '#FF7A45', '#F4F1FF', '#FF7AB6', '#5B8CFF', '#7FE3C0', '#FFD970'];
function newEvent() { return { name: '', anlass: 'socken', focus: [], unit: 'Pinnchen', max: 10, target: 70, jokers: 2, mats: {} }; }
function E() { return S.event; }
function U() { return (E() && E().unit) || 'Pinnchen'; }
function allPeople() { return E() ? E().focus.concat(S.people) : []; }
function person(id) { var p = allPeople().filter(function (x) { return x.id === id; })[0]; return p || { id: id, name: '?', color: '#F4F1FF' }; }
function isFocus(id) { return !!E() && E().focus.some(function (f) { return f.id === id; }); }
function faOf(p) { return FA[p.anlass] || FA.party; }
function focusNames(ids) { return joinNames((ids ? ids.map(person) : E().focus).map(function (f) { return f.name; })); }
function initials(name) { var parts = String(name || '?').trim().split(/\s+/); var s = parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2); return s.toUpperCase(); }
function addPersonByName(name) {
  name = String(name || '').trim();
  if (!name) return null;
  var ex = allPeople().filter(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })[0];
  if (ex) return ex.id;
  var p = { id: uid('p'), name: name, color: PEOPLE_COLORS[S.people.length % PEOPLE_COLORS.length] };
  S.people.push(p);
  return p.id;
}

/* =========================================================
   Drinks, jokers, budget
   ========================================================= */
function addDrink(pid, n, src, note) { if (!n) return; S.drinks.push({ id: uid('d'), t: now(), pid: pid, n: n, src: src || 'manuell', note: note || '' }); }
function drinksOf(pid, since) { return S.drinks.reduce(function (a, d) { return d.pid === pid && (!since || d.t >= since) ? a + d.n : a; }, 0); }
function jokersLeft(pid) { return Math.max(0, (E().jokers || 0) - (S.jokers[pid] || 0)); }
/* The maximum and the target count for the whole evening: free play, the Kranz and
   entries in the counter all add up. A water joker lowers the target by what it replaced,
   so the pilot does not simply hand the drink back later. */
function budget(pid) {
  var M = E().max, T = Math.max(1, Math.round(M * E().target / 100));
  var C = drinksOf(pid);
  var f = skillFactor(pid), credit = (S.jokerCredit && S.jokerCredit[pid]) || 0;
  var Tp = Math.max(0, Math.min(M, T * f) - credit);
  return { M: M, T: T, C: C, Tp: Tp, f: f, credit: credit };
}
/* personal target: strong players drift below the plan, weak ones above (never over the max) */
var FAIL_BASE = 0.5;
function skillFactor(pid) {
  var s = S.run && S.run.stats && S.run.stats[pid];
  if (!s || !s.att) return 1;
  var q = failRate(pid), conf = s.att / (s.att + 4);
  return 1 + conf * (clamp(q / FAIL_BASE, 0.6, 1.25) - 1);
}
function skillLabel(pid) {
  var f = skillFactor(pid);
  if (f < 0.9) return 'spielt stark';
  if (f > 1.08) return 'hat Pech';
  return '';
}
function closingRow(pid) {
  var b = budget(pid);
  if (b.C < b.M && b.C <= b.Tp - 0.75 && !needsPause(pid)) return { pid: pid, name: person(pid).name, n: 1, note: 'Abschluss', done: true };
  return { pid: pid, name: person(pid).name, n: 0, water: true, note: 'Abschluss mit Wasser' };
}
function toastCount(T) { return T >= 2 ? Math.max(1, Math.round(T * 0.3)) : 0; }
function toastRemaining(pid) {
  var r = S.run; if (!r || !r.toasts[pid]) return 0;
  return Math.max(0, r.toasts[pid].pts.length - r.toasts[pid].done);
}
function failRate(pid) { var s = (S.run && S.run.stats[pid]) || { att: 0, fail: 0 }; return (s.fail + 0.9) / (s.att + 2); }

/* =========================================================
   Run (Kranz abgehen / Fegen) state
   ========================================================= */
function R() { return S.run; }
function elapsedMin() { return R() ? Math.max(0, (now() - R().t0) / 60000) : 0; }
function trackOf(pid) { var r = R(); for (var i = 0; i < r.tracks.length; i++) if (r.tracks[i].ids.indexOf(pid) >= 0) return r.tracks[i]; return r.tracks[0]; }
/* party type, themes, units */
function evType() { var e = E(); var t = e && EVENT_TYPES.filter(function (x) { return x.id === e.anlass; })[0]; return t || EVENT_TYPES[EVENT_TYPES.length - 1]; }
function evFam() { return evType().fam; }
function evLabel() {
  var t = evType(), f = E().focus, k = {};
  f.forEach(function (p) { k[p.anlass] = true; });
  if (t.fam === 'kranz' && f.length) return k.sockenkranz && k.schachtelkranz ? 'Socken- & Schachtelkranz' : k.schachtelkranz ? 'Schachtelkranz' : 'Sockenkranz';
  if (t.fam === 'zeit' && f.length) return k.treppe && k.klinke ? 'Fegen & Klinken putzen' : k.klinke ? 'Klinken putzen' : 'Treppe fegen';
  return t.label;
}
function themesOf(ids) {
  var th = {}; th[evType().id] = true;
  (ids || E().focus.map(function (p) { return p.id; })).forEach(function (id) { (PERSON_THEMES[person(id).anlass] || []).forEach(function (x) { th[x] = true; }); });
  return th;
}
function curThemes() { var r = R(); return themesOf(r && !r.finished && !S.free ? r.who : null); }
function fitsTheme(x, th) { return !x || !x.only || x.only.some(function (t) { return th[t]; }); }
function gameFits(g, th) { return fitsTheme(g, th || themesOf(null)); }
function isTimed(r) { r = r || R(); return !!r && (r.variant === 'zeit' || r.variant === 'abend'); }
function unitText(s, pid) {
  if (!s || s.indexOf('{') < 0) return s;
  var fa = pid ? faOf(person(pid)) : FA[evType().person];
  if (fa.kind !== 'kranz') fa = FA.sockenkranz;
  return s.replace(/\{UN\}/g, fa.units).replace(/\{U\}/g, fa.unit);
}
function unitArt(unit) { var g = unit === 'Meter' ? 'm' : unit === 'Feld' ? 'n' : 'f'; return { ein: g === 'f' ? 'eine' : g === 'm' ? 'einen' : 'ein', naechst: g === 'f' ? 'zur nächsten' : 'zum nächsten' }; }
function unitOf(tr) {
  var r = R(), fam = r.fam || 'kranz';
  if (r.variant === 'meter') return { unit: 'Meter', units: 'Meter', ic: 'i-ruler' };
  if (r.variant === 'runden') return { unit: 'Runde', units: 'Runden', ic: 'i-flag' };
  if (r.variant === 'abend') return { unit: 'Einlage', units: 'Einlagen', ic: 'i-sparkle' };
  if (r.variant === 'wuerfel' && fam === 'frei') return { unit: 'Feld', units: 'Felder', ic: 'i-dice' };
  var fa = faOf(person(tr.ids[0]));
  if (r.variant === 'zeit') return { unit: fa.unit, units: fa.units, job: fa.job || 'fegen', jobVerb: fa.jobVerb || 'fegt', ic: 'i-broom' };
  if (tr.ids.length > 1 && !tr.ids.every(function (id) { return faOf(person(id)).unit === fa.unit; })) return { unit: 'Station', units: 'Stationen', ic: 'i-flag' };
  return { unit: fa.unit, units: fa.units, ic: fa.unit === 'Schachtel' ? 'i-box' : 'sock' };
}
function zeitEst(tr) {
  var r = R(), el = elapsedMin(), P = r.planned || 60, p;
  if (r.variant === 'abend') { p = tr.done ? 1 : Math.min(1, el / P); return { p: p, total: P, elapsed: el, remaining: Math.max(0, P - el) }; }
  var last = tr.checks.length ? tr.checks[tr.checks.length - 1] : null;
  if (tr.done) p = 1;
  else if (!last) p = Math.min(0.97, el / P);
  else {
    var lt = (last.t - r.t0) / 60000;
    var rate = last.p > 0 && lt > 0.5 ? last.p / lt : 1 / P;
    p = Math.min(0.97, last.p + Math.max(0, el - lt) * rate);
  }
  var total = P;
  if (p > 0.05 && !tr.done) { var w = Math.min(1, p * 1.4); total = w * (el / p) + (1 - w) * P; }
  if (tr.done) total = el;
  return { p: p, total: total, elapsed: el, remaining: Math.max(0, total - el) };
}
function trackProgress(tr) {
  if (isTimed()) return zeitEst(tr).p;
  return tr.total ? tr.pos / tr.total : 0;
}
function progressOf(pid) { return trackProgress(trackOf(pid)); }
function zeitInterval() {
  var r = R(), tot = r.planned;
  var ests = r.tracks.filter(function (t) { return !t.done; }).map(zeitEst);
  if (ests.length) tot = Math.max.apply(null, ests.map(function (e) { return e.total; }));
  var N = Math.max(3, Math.round(r.planned / 7));
  return clamp(tot / N, 3, 12);
}
function remainingChances(pid) {
  var r = R(), tr = trackOf(pid), n = tr.ids.length;
  /* timed: remaining minutes divided by the real pace of the evening so far */
  if (isTimed(r)) { var per = r.steps >= 3 ? clamp(elapsedMin() / r.steps, 1.5, 15) : zeitInterval(); return Math.max(0.5, zeitEst(tr).remaining / per / n); }
  var rem = tr.total - tr.pos;
  /* against each other: duels, votes and pair games on the other tracks hit this person too */
  if (r.together === 'gegeneinander') r.tracks.forEach(function (t) { if (t !== tr && !t.done) rem += 0.1 * (t.total - t.pos); });
  if (r.variant === 'wuerfel') rem = rem / 3.5;
  return Math.max(0.5, rem / n);
}
function paceRatio() {
  var r = R(); if (!r || !r.planned) return 1;
  var el = elapsedMin();
  if (r.variant === 'abend') return 1;
  if (r.variant === 'zeit') {
    var ests = r.tracks.filter(function (t) { return !t.done; }).map(zeitEst);
    if (!ests.length) return 1;
    return Math.max.apply(null, ests.map(function (e) { return e.total; })) / r.planned;
  }
  if (r.steps < 2 || el < 1) return 1;
  var avg = el / r.steps, rem = 0;
  r.tracks.forEach(function (t) { if (!t.done) rem += (t.total - t.pos) / (r.variant === 'wuerfel' ? 3.5 : 1); });
  return (el + rem * avg) / r.planned;
}
function behindCurve(pid) { var b = budget(pid); return b.Tp * progressOf(pid) - b.C; }

/* tempo brake, toasts and counter entries included:
   never more than 2 within 4 minutes, and two in quick succession (within 5 minutes)
   is fine twice an evening, only the third time it is water instead */
var HARD_MIN = 4, HARD_MAX = 2, DOUBLE_MIN = 5, DOUBLES_OK = 2;
function drinkTimes(pid) { return S.drinks.filter(function (d) { return d.pid === pid && d.n > 0; }).map(function (d) { return d.t; }).sort(function (a, b) { return a - b; }); }
function doublesSoFar(ts) { var n = 0; for (var i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] <= DOUBLE_MIN * 60000) n++; return n; }
function pauseReason(pid) {
  if (!pid) return '';
  var ts = drinkTimes(pid), t = now();
  if (ts.filter(function (x) { return x >= t - HARD_MIN * 60000; }).length >= HARD_MAX) return 'hart';
  if (ts.length && t - ts[ts.length - 1] <= DOUBLE_MIN * 60000 && doublesSoFar(ts) >= DOUBLES_OK) return 'dritte';
  return '';
}
function needsPause(pid) { return !!pauseReason(pid); }
function pauseNote(pid) { return pauseReason(pid) === 'hart' ? 'Schon zwei in den letzten Minuten, diesmal Wasser' : 'Zum dritten Mal zwei kurz hintereinander, diesmal Wasser'; }
/* how many drinks a lost task costs this person right now */
function stakeFor(pid) {
  var b = budget(pid), room = b.M - b.C;
  if (room <= 0) return { n: 0, reason: 'limit' };
  if (needsPause(pid)) return { n: 0, reason: 'pause' };
  /* tempo cards from the Handicap-Station: a breather, or full throttle (still under the max and the brake, at most one over the personal target) */
  if (hcHas(pid, 'atem')) return { n: 0, reason: 'atem' };
  if (hcHas(pid, 'vollgas') && b.C < Math.min(b.M, Math.ceil(b.Tp) + 1)) return { n: 1, reason: 'vollgas' };
  var need = Math.max(0, b.Tp - b.C - toastRemaining(pid));
  var Rc = remainingChances(pid), q = failRate(pid);
  /* never more than one per game: the pilot only decides whether this loss costs one or is let off with water */
  var raw = need / Math.max(0.6, Rc * q);
  var n = Math.random() < Math.min(1, raw) ? 1 : 0;
  if (need > 0 && Rc <= 2) n = 1;
  n = Math.min(n, 1, room);
  return { n: n, reason: n ? 'normal' : (need <= 0 ? 'voraus' : 'glueck'), raw: raw };
}
function stakeOutside(pid) {
  var r = R();
  if (pid && isFocus(pid) && r && !r.finished && r.who.indexOf(pid) >= 0) return stakeFor(pid);
  if (pid && isFocus(pid)) { var b = budget(pid); if (b.C >= b.M) return { n: 0, reason: 'limit' }; return needsPause(pid) ? { n: 0, reason: 'pause' } : { n: 1, reason: 'normal' }; }
  return { n: 1, reason: 'normal' };
}

/* decide forward / back after a step */
function decideMove(pid, ok, tr, roll) {
  var r = R(), u = unitOf(tr), ratio = paceRatio();
  var cap = Math.max(1, Math.round(tr.total * 0.12));
  var full = roll || 1, half = roll ? Math.max(1, Math.ceil(roll / 2)) : 1;
  if (ok) {
    var bonus = 0;
    if (ratio > 1.25 && Math.random() < 0.6) bonus = 1;
    else if (ratio > 1.1 && Math.random() < 0.3) bonus = 1;
    return { delta: full + bonus, kind: bonus ? 'bonus' : 'vor', why: bonus ? 'Ihr seid etwas langsamer als geplant, deshalb gibt es ' + unitArt(u.unit).ein + ' Bonus-' + u.unit + '.' : '' };
  }
  if (ratio > 1.1) return { delta: half, kind: 'vor', why: 'Trotz Fehlversuch geht es weiter, sonst wird es zu lang.' };
  if (r.lastMove === 'zurueck' || r.backs >= cap || tr.pos < 2) return { delta: half, kind: 'vor', why: roll ? 'Zur Strafe nur die halbe Strecke.' : '' };
  var pb = 0.18;
  if (behindCurve(pid) > 1) pb += 0.25;
  if (ratio < 0.85) pb += 0.15;
  if (Math.random() < pb) return { delta: -1, kind: 'zurueck', why: 'Zur Strafe geht es ' + unitArt(u.unit).ein + ' ' + u.unit + ' zurück' + ((r.fam || 'kranz') === 'kranz' ? ': Die letzte wird wieder angeklammert.' : '.') };
  return { delta: half, kind: 'vor', why: roll ? 'Zur Strafe nur die halbe Strecke.' : '' };
}

/* =========================================================
   Start a run
   ========================================================= */
function variantsFor(fam) { return fam === 'zeit' ? ['zeit'] : fam === 'frei' ? ['runden', 'wuerfel', 'abend'] : ['socke', 'meter', 'wuerfel']; }
function cfgDefaults() {
  var f = E().focus, fam = evFam();
  var job = fam === 'zeit' && f.length ? (faOf(f[0]).job || 'fegen') : 'fegen';
  var c = S.runCfg || {};
  var vs = variantsFor(fam);
  if (c.fam !== fam || vs.indexOf(c.variant) < 0) { c.variant = vs[0]; c.minutes = 0; c.acc = null; c.fam = fam; }
  if (!c.who) { c.who = {}; f.forEach(function (p) { c.who[p.id] = true; }); }
  f.forEach(function (p) { if (c.who[p.id] === undefined) c.who[p.id] = true; });
  if (!c.together) c.together = 'gemeinsam';
  if (!c.counts) c.counts = {};
  f.forEach(function (p) { if (!c.counts[p.id]) c.counts[p.id] = p.count || 25; });
  if (!c.shared) c.shared = f.length ? Math.round(f.reduce(function (a, p) { return a + (p.count || 25); }, 0) / f.length) : 25;
  if (!c.meters) c.meters = 12;
  if (!c.rounds) c.rounds = 20;
  if (!c.fields) c.fields = 40;
  if (!c.dice) c.dice = 'app';
  if (!c.minutes) c.minutes = c.variant === 'zeit' ? 60 : c.variant === 'abend' ? 120 : 75;
  if (!c.acc) c.acc = { items: fam === 'zeit' ? ACC_SUGGEST[job].slice(0, 4) : [], swaps: 0 };
  if (!c.acc.swaps && c.acc.items.length >= 2) c.acc.swaps = Math.round(c.acc.items.length * 1.5);
  if (c.link === undefined) c.link = true;
  S.runCfg = c;
  return c;
}
function cfgWho() { var c = cfgDefaults(); return E().focus.filter(function (p) { return c.who[p.id]; }).map(function (p) { return p.id; }); }
function cfgTogether() { var who = cfgWho(); return who.length < 2 ? 'allein' : S.runCfg.together; }
function trackLen(c, id, tog) {
  if (c.variant === 'meter') return c.meters;
  if (c.fam === 'frei') return c.variant === 'wuerfel' ? c.fields : c.rounds;
  if (c.variant === 'zeit' || c.variant === 'abend') return 0;
  return tog === 'gemeinsam' ? c.shared : c.counts[id];
}
function cfgSteps() {
  var c = cfgDefaults(), who = cfgWho(), tog = cfgTogether();
  if (c.variant === 'zeit' || c.variant === 'abend') return Math.max(3, Math.round(c.minutes / 7));
  var steps = 0;
  if (tog === 'gemeinsam') steps = trackLen(c, who[0], tog);
  else who.forEach(function (id) { steps += trackLen(c, id, tog); });
  if (c.variant === 'wuerfel') steps = steps / 3.5;
  return Math.round(steps);
}
/* With at most one drink per game, short games cannot reach the target through losses alone.
   Toast moments fill part of the gap, but never more than 40 % of what is still open. */
function planToasts(id, tasksPerPerson) {
  var b = budget(id), open = Math.max(0, b.Tp - b.C);
  var base = toastCount(open), fromLosses = tasksPerPerson * 0.5 * 0.9;
  var wanted = Math.ceil(open - fromLosses - 1);
  return Math.max(base, Math.min(wanted, Math.round(open * 0.4)));
}
function planEstimate(id, tasksPerPerson) {
  var b = budget(id), open = Math.max(0, b.Tp - b.C);
  var reach = planToasts(id, tasksPerPerson) + tasksPerPerson * 0.5 + 1;
  return Math.min(b.M, Math.round(b.C + Math.min(open, reach)));
}
function startRun() {
  var c = cfgDefaults(), who = cfgWho(), tog = cfgTogether();
  if (!who.length) return false;
  var r = {
    id: uid('r'), t0: Date.now(), shift: 0, variant: c.variant, fam: c.fam, together: tog, who: who, planned: c.minutes,
    tracks: [], turn: 0, rot: 0, steps: 0, lastStepT: Date.now(), stats: {}, backs: 0, lastMove: '', toasts: {},
    acc: { items: (c.acc.items || []).filter(Boolean), swaps: c.acc.items.length ? c.acc.swaps : 0 },
    zeit: { lastInt: Date.now(), lastCheck: Date.now() }, log: [], pending: null, hist: [], finished: false,
    used: { games: [], est: [], mc: [], wwe: [], partner: [] }, link: !!c.link, lastAction: '', kinds: [], lastCats: [], planSteps: cfgSteps(), decks: {}, plan: null, planPos: 0, dice: c.dice || 'app'
  };
  if (c.variant === 'abend') { r.acc = { items: [], swaps: 0 }; }
  /* Trinkbuddys (on unless switched off in the setup) and the rules of the Regel-Karte */
  /* accessories only when sweeping or cleaning: the count from the setup, from the hardest to the easiest */
  r.acc = c.fam === 'zeit' ? { items: accItems(accJob(), accN(c)), swaps: 0 } : { items: [], swaps: 0 }; r.accAt = r.t0;
  r.bud = { on: c.buddy !== false, map: {}, prev: {}, next: {}, fwd: {}, bond: {}, due: false, n: 0 }; r.rules = [];
  /* Junggesellenabschied: missions out in the city (or in the bar), crew jobs in between */
  if (evType().id === 'jga') { r.jga = { mode: c.jgaMode === 'drinnen' ? 'drinnen' : 'stadt' }; r.jcrew = { n: 0, last: -9, used: [], by: {} }; }
  var mk = function (ids, total) { return { id: uid('t'), ids: ids, total: total, pos: 0, done: false, checks: [], accIdx: 0, accDone: 0 }; };
  if (tog === 'gemeinsam') r.tracks.push(mk(who.slice(), trackLen(c, who[0], tog)));
  else who.forEach(function (id) { r.tracks.push(mk([id], trackLen(c, id, tog))); });
  S.run = r;
  who.forEach(function (id) {
    r.stats[id] = { att: 0, fail: 0 };
    var n = planToasts(id, r.planSteps / Math.max(1, who.length)), pts = [];
    for (var k = 1; k <= n; k++) pts.push(k / (n + 1));
    r.toasts[id] = { pts: pts, done: 0 };
  });
  r.accPts = [];
  for (var k = 1; k <= r.acc.swaps; k++) r.accPts.push(k / (r.acc.swaps + 1));
  /* roll the whole game once: shuffled decks and the plan of task kinds */
  r.plan = buildPlan(r, r.planSteps + 4); r.planPos = 0;
  [['games', GAMES], ['est', ESTIMATES], ['mc', QUIZ_MC], ['wwe', WWE], ['partner', PARTNER]].forEach(function (x) { deckOf(x[0], x[1]); });
  logRun('start', (tog === 'gemeinsam' ? focusNames(who) + ' starten gemeinsam' : tog === 'gegeneinander' ? focusNames(who) + ' treten gegeneinander an' : person(who[0]).name + ' startet'));
  S.games = (S.games || 0) + 1;
  return true;
}
function logRun(kind, text) { R().log.unshift({ t: now(), kind: kind, text: text }); if (R().log.length > 60) R().log.pop(); }
/* Undo: before every task (kind 'task') and every decision (kind 'action') the whole
   game state is saved. Going back restores run, drinks from games, jokers, used games and
   questions; drinks entered by hand in the counter stay, they really happened. */
function runPosText(r) {
  if (isTimed(r)) return 'nach ' + Math.round(elapsedMin()) + ' Min';
  return r.tracks.map(function (t) { var u = unitOf(t); return (r.tracks.length > 1 ? person(t.ids[0]).name + ': ' : '') + u.unit + ' ' + t.pos + ' von ' + t.total; }).join(' · ');
}
function snapshot(kind) {
  var r = R(); if (!r) return;
  var run = clone(r); delete run.hist; run.log = run.log.slice(0, 25);
  var snap = {
    kind: kind || 'action', t: Date.now(), run: run, drinks: clone(S.drinks), jokers: clone(S.jokers || {}), jokerCredit: clone(S.jokerCredit || {}),
    used: clone(S.used || {}), qUsed: S.questions.filter(function (q) { return q.used; }).map(function (q) { return q.id; }), qSubs: S.questions.reduce(function (a, q) { if (q.usedSubs) a[q.id] = q.usedSubs.slice(); return a; }, {}), guestTurn: S.guestTurn || 0, people: S.people.map(function (p) { return p.id; }),
    meta: { steps: r.steps, pos: runPosText(r), at: now(), no: kind === 'task' ? (r.taskNo = (r.taskNo || 0) + 1) : r.taskNo || 0 }
  };
  r.hist = r.hist || [];
  r.hist.push(snap);
  /* keep up to 40 task points and the last 12 single decisions */
  var tasks = 0, acts = 0;
  for (var i = r.hist.length - 1; i >= 0; i--) {
    var k = r.hist[i].kind === 'task';
    if (k) tasks++; else acts++;
    if ((k && tasks > 40) || (!k && acts > 12)) r.hist.splice(i, 1);
  }
}
function pendingLabel(P) {
  if (!P) return '';
  if (P.kind === 'spiel') { var g = GAMES.filter(function (x) { return x.id === P.game; })[0]; return g ? g.name : 'Minispiel'; }
  if (P.kind === 'gast') return 'Gäste-Runde: ' + P.name;
  if (P.kind === 'mission') return 'Mission: ' + P.title;
  if (P.kind === 'crew') return 'Truppen-Auftrag: ' + P.name;
  return { menge: 'Gegen die Menge', frage: 'Frage der Gäste', schaetzen: 'Schätzfrage', quiz: 'Quiz', wwe: 'Wer würde eher', partner: 'Mein Partner kann', glueck: 'Glücks-Moment', toast: 'Anstoßen', acc: 'Zubehör-Wechsel', check: 'Status-Check', finale: 'Finale', rolle: 'Neue Rolle', ehre: 'Ehrenrunde', hellseher: 'Der Hellseher', handicap: 'Handicap-Station' }[P.kind] || '';
}
/* small moments between tasks: they never count as a task and never move the Kranz */
var MOMENT_KINDS = ['toast', 'acc', 'check', 'rolle', 'ehre', 'hellseher', 'handicap', 'crew'];
function rewindInfo(i) {
  var r = R(), snap = r.hist[i]; if (!snap) return null;
  var keep = {}; snap.drinks.forEach(function (d) { keep[d.id] = 1; });
  var per = {}, n = 0;
  S.drinks.forEach(function (d) { if (!keep[d.id] && d.src !== 'manuell' && d.pid) { per[d.pid] = (per[d.pid] || 0) + d.n; n += d.n; } });
  return { snap: snap, tasks: Math.max(0, r.steps - snap.run.steps) + (r.pending && MOMENT_KINDS.indexOf(r.pending.kind) < 0 ? 1 : 0), drinks: n, per: per };
}
function restoreSnap(i) {
  var r = R(); if (!r || !r.hist || !r.hist[i]) return false;
  var hist = r.hist, snap = hist[i];
  var keep = {}; snap.drinks.forEach(function (d) { keep[d.id] = 1; });
  var manual = S.drinks.filter(function (d) { return !keep[d.id] && d.src === 'manuell'; });
  S.run = clone(snap.run); S.run.hist = hist.slice(0, i);
  S.drinks = clone(snap.drinks).concat(manual);
  S.jokers = clone(snap.jokers); S.jokerCredit = clone(snap.jokerCredit); S.used = clone(snap.used);
  S.questions.forEach(function (q) { q.used = snap.qUsed.indexOf(q.id) >= 0; if (snap.qSubs) q.usedSubs = (snap.qSubs[q.id] || []).slice(); });
  S.guestTurn = snap.guestTurn || 0;
  S.people = S.people.filter(function (p) { return snap.people.indexOf(p.id) >= 0 || S.drinks.some(function (d) { return d.pid === p.id; }); });
  return true;
}
function undo() { var r = R(); return !!(r && r.hist && r.hist.length && restoreSnap(r.hist.length - 1)); }
function currentTrack() {
  var r = R();
  if (r.together === 'gegeneinander') return r.tracks[r.turn % r.tracks.length];
  return r.tracks[0];
}
function currentMain() {
  var r = R(), tr = currentTrack();
  if (r.together === 'gemeinsam') return tr.ids[r.rot % tr.ids.length];
  return tr.ids[0];
}
function advanceTurn() {
  var r = R();
  r.rot += 1;
  if (r.together === 'gegeneinander') {
    for (var i = 1; i <= r.tracks.length; i++) {
      var idx = (r.turn + i) % r.tracks.length;
      if (!r.tracks[idx].done) { r.turn = idx; return true; }
    }
    return false;
  }
  return !r.tracks[0].done;
}
function allDone() { return R().tracks.every(function (t) { return t.done; }); }

/* =========================================================
   What happens next: injections first, then an action
   ========================================================= */
function dueInjection() {
  var r = R();
  // toasts
  for (var i = 0; i < r.who.length; i++) {
    var id = r.who[i], tz = r.toasts[id], tr = trackOf(id);
    /* a toast waits a little if someone just had one, so it does not use up a quick double */
    var justDrank = drinkTimes(id).some(function (t) { return t >= now() - DOUBLE_MIN * 60000; });
    if (tz && tz.done < tz.pts.length && trackProgress(tr) >= tz.pts[tz.done] + (justDrank ? 0.1 : 0) && !tr.done) {
      var ids = r.together === 'gemeinsam' ? tr.ids.filter(function (x) { return r.toasts[x].done < r.toasts[x].pts.length; }) : [id];
      return { kind: 'toast', ids: ids, track: tr.id };
    }
  }
  // accessory swaps
  if (r.acc.items.length >= 2) {
    for (var j = 0; j < r.tracks.length; j++) {
      var t = r.tracks[j];
      if (!t.done && t.accDone < r.accPts.length && trackProgress(t) >= r.accPts[t.accDone]) return { kind: 'acc', track: t.id };
    }
  }
  // status checks (time mode)
  if (r.variant === 'zeit') {
    var since = (now() - r.zeit.lastCheck) / 60000;
    var est = r.tracks.filter(function (t) { return !t.done; }).map(zeitEst);
    var tot = est.length ? Math.max.apply(null, est.map(function (e) { return e.total; })) : r.planned;
    if (since >= Math.max(6, tot / 6)) return { kind: 'check' };
  }
  return null;
}
function trackById(id) { return R().tracks.filter(function (t) { return t.id === id; })[0]; }
/* single guest contributions: only the Aufgaben (they are real actions). On very long Kränze the
   leftovers that do not make a full round anymore fill gaps too. */
function singleOk(q, r) {
  if (q.type === 'aufgabe') return true;
  if (!r || (r.planSteps || 0) < 35) return false;
  if (q.type === 'steckbrief') return true;
  var fam = q.type === 'luege' ? 'luege' : q.type === 'wer' ? 'wer' : Q_LADDER.indexOf(q.type) >= 0 ? 'frage' : '';
  return !!fam && GG_POOL[fam](q.forId || '').length < 3;
}
function availableQuestions(main) {
  var r = R();
  return S.questions.filter(function (q) { return questionPlayable(q) && singleOk(q, r) && (!q.forId || q.forId === main); });
}
function partnerReady(main) {
  var r = R();
  return !!person(main).partner || (r && r.who.length >= 2);
}
/* At the start of every game the app rolls the whole evening once in the background:
   a plan of which kind of task comes when, and shuffled decks of games and questions.
   The personal part (rounds built from what the guests sent) carries the evening: how big it is
   depends on how much the guests sent compared to the number of tasks, 20 to 60 percent.
   It gets denser towards the end. App questions are seasoning, the rest are minigames. */
function shareFor(D, n) { return D ? Math.max(0.2, Math.min(0.6, 0.2 + 0.4 * Math.min(1, D / (3 * Math.max(1, n))))) : 0; }
/* what is left of the guests' material: items for rounds, how many rounds that makes, single Aufgaben */
function personalStock(r) {
  var inv = roundInventory('', r.who), items = 0, roundsCap = 0;
  ROUND_FAMS.forEach(function (f) { items += inv[f].have; roundsCap += inv[f].rounds; });
  ONCE_FAMS.forEach(function (f) { items += inv[f].rounds * 4; roundsCap += inv[f].rounds; });
  var singles = S.questions.filter(function (q) { return questionPlayable(q) && singleOk(q, r) && (!q.forId || r.who.indexOf(q.forId) >= 0); }).length;
  return { items: items, roundsCap: roundsCap, singles: singles };
}
/* the personal part of the whole evening: share by how much the guests sent compared to the number of tasks */
function personalBudget(r) {
  var k = r.kinds || [], steps = k.length, done = k.filter(function (x) { return x === 'gast' || x === 'frage'; }).length;
  var doneF = k.filter(function (x) { return x === 'frage'; }).length;
  var left = Math.max(1, Math.round(tasksLeft(r))), n = steps + left, st = personalStock(r);
  var share = shareFor(st.items + st.singles + (r.persUsed || 0), n);
  var B = Math.min(Math.round(share * n), done + st.roundsCap + st.singles);
  var remF = Math.max(0, Math.min(st.singles, Math.ceil(B * 0.25) - doneF)), remG = Math.max(0, Math.min(st.roundsCap, B - done - remF));
  if (remG + remF < B - done) remF = Math.min(st.singles, B - done - remG);
  return { B: B, done: done, steps: steps, left: left, remG: remG, remF: remF, share: share };
}
/* for the plan: the expected personal share, so the seasoning can adapt */
function personalPlan(r, n) { var st = personalStock(r), share = shareFor(st.items + st.singles, n); return { share: Math.min(share, n ? Math.min(st.roundsCap + st.singles, Math.round(share * n)) / n : 0) }; }
/* how much of the personal part should be done at progress x: few at the start,
   more in the middle, most in the last third */
function curveShare(x) {
  var seg = [[0.2, 0.35], [0.65, 1], [1, 1.7]], acc = 0, tot = 0, prev = 0;
  seg.forEach(function (sg) { var w = (sg[0] - prev) * sg[1]; tot += w; if (x > prev) acc += (Math.min(x, sg[0]) - prev) * sg[1]; prev = sg[0]; });
  return acc / tot;
}
/* side-effect free: does the next task become a personal one (a round of the guests, or a single Aufgabe)?
   Done so far plus what the remaining contributions allow, spread along the curve over the tasks still to come. */
function personalNext(r, main) {
  if (!r || r.forceGame || r.lastDone) return '';
  var kinds = r.kinds || [], prev = kinds[kinds.length - 1];
  if (prev === 'gast' || prev === 'frage') return '';
  var pb = personalBudget(r);
  if (!pb.remG && !pb.remF) return '';
  var x = (pb.steps + 1) / (pb.steps + pb.left);
  if (pb.done + 1 > pb.B * curveShare(x) + 0.5) return '';
  var canG = pb.remG > 0 && ggReadyFor(main).length > 0, canF = pb.remF > 0 && availableQuestions(main).length > 0;
  if (!canG && !canF) return '';
  /* singles: at most a quarter of the personal part, spread in between */
  var doneF = kinds.filter(function (k) { return k === 'frage'; }).length;
  if (canF && (!canG || doneF < Math.floor((pb.done + 1) * 0.25 + 0.5))) return 'frage';
  return canG ? 'gast' : 'frage';
}
function buildPlan(r, n) {
  var P = Math.max(4, Math.round(n)), focusN = r.who.length, k;
  var horizon = Math.max(4, Math.min(P, r.plan ? P : (r.planSteps || P)));
  var slots = []; for (k = 0; k < P; k++) slots.push('spiel');
  var free = function (pos, tok) {
    /* nearest free slot to pos that does not sit right next to the same kind */
    for (var d = 0; d < P; d++) {
      var c = [pos + d, pos - d];
      for (var e = 0; e < 2; e++) {
        var q = c[e];
        if (q < 0 || q >= P || slots[q] !== 'spiel') continue;
        if ((q > 0 && slots[q - 1] === tok) || (q < P - 1 && slots[q + 1] === tok)) continue;
        if (tok !== 'spiel' && (tok === 'gast' || tok === 'frage') && ((q > 0 && /^(gast|frage)$/.test(slots[q - 1])) || (q < P - 1 && /^(gast|frage)$/.test(slots[q + 1])))) continue;
        return q;
      }
    }
    return -1;
  };
  /* the personal rounds are not placed here: they come in as the evening goes (personalNext) */
  var pp = personalPlan(r, horizon), queued = (r.plan || []).slice(r.planPos || 0);
  /* the pair game: once per evening, somewhere in the middle third */
  var partnerQueued = queued.indexOf('partner') >= 0;
  if (!r.jga && !(S.used && S.used.partnerGame) && !partnerQueued && !r.partnerPlanned && horizon >= 8) {
    var pp2 = free(Math.floor(horizon / 3 + Math.random() * horizon / 3), 'partner');
    if (pp2 >= 0) { slots[pp2] = 'partner'; r.partnerPlanned = true; }
  }
  /* Gegen die Menge: once in the middle of the evening, twice on long ones */
  var mengeN = horizon >= 30 ? 2 : horizon >= 10 ? 1 : 0;
  mengeN -= queued.filter(function (x) { return x === 'menge'; }).length + (r.mengePlanned || 0);
  for (k = 0; k < mengeN; k++) { var mq = free(Math.floor(horizon * (k ? 0.62 + Math.random() * 0.22 : 0.3 + Math.random() * 0.28)), 'menge'); if (mq >= 0) { slots[mq] = 'menge'; r.mengePlanned = (r.mengePlanned || 0) + 1; } }
  /* seasoning: app questions, more when the guests sent little */
  var spice = Math.round((0.10 + 0.15 * (1 - Math.min(1, pp.share / 0.6))) * horizon), rest = [];
  for (k = 0; k < spice; k++) rest.push(['schaetzen', 'schaetzen', 'quiz', focusN >= 2 ? 'wwe' : 'quiz', focusN >= 2 ? 'wwe' : 'schaetzen', 'glueck'][k % 6]);
  rest = shuffle(rest);
  rest.forEach(function (t, i) {
    var a = horizon * i / rest.length, b = horizon * (i + 1) / rest.length;
    var q = free(Math.floor(a + Math.random() * (b - a)), t);
    if (q >= 0) slots[q] = t;
  });
  /* JGA: in the city every minigame becomes a mission, in a bar about a third */
  if (r.jga) slots = slots.map(function (s) { return s === 'spiel' && (r.jga.mode === 'stadt' || Math.random() < 0.35) ? 'mission' : s; });
  return slots;
}
function pickAction(main, tr) {
  var r = R(), ratio = paceRatio(), th = themesOf(r.who);
  if (!r.plan) { r.plan = buildPlan(r, (r.planSteps || 20) + 4); r.planPos = 0; }
  if ((r.planPos || 0) >= r.plan.length) r.plan = r.plan.concat(buildPlan(r, 12));
  /* the personal part comes in along the curve, the plan holds the rest */
  var pk = personalNext(r, main);
  if (pk) return pk;
  var k = r.plan[r.planPos]; r.planPos += 1;
  if (k === 'frage' || k === 'gast') k = 'spiel';
  if (k === 'mission' && !(r.jga && missionAvailable(main, r))) k = 'spiel';
  if (k === 'partner' && S.used && S.used.partnerGame) k = 'spiel';
  if (k === 'menge' && freshCount(MENGE, 'menge') < 5) k = 'spiel';
  if (k === 'wwe' && (r.who.length < 2 || !freshCount(WWE, 'wwe', function (x) { return fitsTheme({ only: WWE_ONLY[x] }, th); }))) k = 'spiel';
  if (k === 'schaetzen' && !freshCount(ESTIMATES, 'est')) k = 'spiel';
  if (k === 'quiz' && !freshCount(QUIZ_MC, 'mc')) k = 'spiel';
  if (k === 'spiel') {
    if (ratio > 1.25 && Math.random() < 0.2) k = 'glueck';
    else if (!freshCount(GAMES, 'games', function (g) { return needsOk(g) && fitsTheme(g, th) && gameAllowed(g); })) k = freshCount(ESTIMATES, 'est') ? 'schaetzen' : freshCount(QUIZ_MC, 'mc') ? 'quiz' : 'spiel';
  }
  return k;
}
/* nothing repeats within one evening: games, challenges and questions are spent once played,
   no matter whether they came up while walking the Kranz or in free play */
var USE_KEY = { menge: function (x) { return x[0]; }, games: function (g) { return g.id; }, est: function (x) { return x.text; }, mc: function (x) { return x.text; }, wwe: function (x) { return x; }, partner: function (c) { return c.t; } };
function usedList(cat) { S.used = S.used || {}; return (S.used[cat] = S.used[cat] || []); }
function isUsed(cat, x) { return usedList(cat).indexOf(USE_KEY[cat](x)) >= 0; }
function markUsed(cat, x) { var u = usedList(cat), k = USE_KEY[cat](x), at = u.indexOf(k); if (at >= 0) u.splice(at, 1); u.push(k); }
function freshCount(list, cat, okFn) { return list.filter(function (x) { return (!okFn || okFn(x)) && !isUsed(cat, x); }).length; }
function unusedPick(list, usedKey) { return pickFrom(list, usedKey, null); }
/* the shuffled order of a whole list, rolled once per game (or once per evening for free play) */
function deckOf(cat, list) {
  var r = R(), inRun = r && !S.free, holder = inRun ? r : S;
  holder.decks = holder.decks || {}; holder.deckSig = holder.deckSig || {};
  var d = holder.decks[cat], keys = list.map(USE_KEY[cat]);
  var pinned = cat === 'games' ? keys.filter(function (k) { return pickOf(k) === 'muss'; }) : [], sig = pinned.join(',');
  if (!d || d.length !== keys.length || keys.some(function (k) { return d.indexOf(k) < 0; }) || (holder.deckSig[cat] || '') !== sig) {
    /* themed items (socks, boxes, broom, door handles) get a little head start */
    d = list.map(function (x) { return [USE_KEY[cat](x), Math.pow(Math.random(), 1 / (x && x.only ? 1.8 : 1))]; })
      .sort(function (a, b) { return b[1] - a[1]; }).map(function (x) { return x[0]; });
    /* games the master set as a must: spread over the first part of the game, in random order */
    if (pinned.length) {
      /* positions count only games that can come up at this party, about a quarter of the tasks are games */
      var rest = d.filter(function (k) { return pinned.indexOf(k) < 0; }), pins = shuffle(pinned).sort(function (x, y) { return (RISKY_GAMES.indexOf(y) >= 0) - (RISKY_GAMES.indexOf(x) >= 0); });
      /* risky musts come first, while everyone is still sober enough */
      var gameSlots = inRun && r.plan ? r.plan.filter(function (x) { return x === 'spiel'; }).length * 0.55 : (r && r.planSteps || 20) * 0.25;
      var span = inRun ? Math.max(pins.length, Math.round(gameSlots)) : pins.length;
      var th = themesOf(inRun ? r.who : null), byId = {}; list.forEach(function (g) { byId[g.id] = g; });
      var playable = function (k) { var g = byId[k]; return g && needsOk(g) && fitsTheme(g, th) && gameAllowed(g); };
      var pos = pins.map(function (x, j) { return Math.floor(span * (j + Math.random()) / pins.length); });
      var out = [], seen = 0, j = 0;
      rest.forEach(function (k) {
        while (j < pins.length && seen >= pos[j]) out.push(pins[j++]);
        out.push(k); if (playable(k)) seen++;
      });
      while (j < pins.length) out.push(pins[j++]);
      d = out;
    }
    holder.decks[cat] = d; holder.deckSig[cat] = sig;
    if (inRun && cat === 'games') r.gameQueue = [];
  }
  return d;
}
/* safety first: these games pause once a player is halfway to the maximum */
var RISKY_GAMES = ['treppenhuepfen', 'stufenbecher', 'hahnenkampf', 'sackhuepfen', 'limbo', 'ballonkampf', 'kerzenblind', 'nagel', 'laserparcours', 'klinkenblitz', 'schuhsalat'];
function isRisky(g) { return !!g && RISKY_GAMES.indexOf(g.id) >= 0; }
function tooTipsy(ids) { var e = E(); if (!e) return false; return (ids || []).some(function (id) { return isFocus(id) && drinksOf(id) >= e.max * 0.5; }); }
function safeFor(g, ids) { return !isRisky(g) || !tooTipsy(ids); }
/* the master's choice: a game can be out, normal or a must; kinds of tasks can be switched off */
/* the master no longer picks games or kinds: which games come up is the app's secret */
function pickOf(id) { return ''; }
function gameAllowed(g) { return pickOf(g.id) !== 'raus'; }
function kindOn(k) { return pickOf('k:' + k) !== 'raus'; }
function gameById(id) { return GAMES.filter(function (g) { return g.id === id; })[0]; }
/* the next games of a run are drawn ahead of time, so the app can say what to prepare */
function runGameCtx(r) { return { focus: r.who.slice(), together: r.together, variant: r.variant, themes: themesOf(r.who) }; }
function runGameOk(g, ctx) { return !!g && needsOk(g) && fitsTheme(g, ctx.themes) && gameAllowed(g) && safeFor(g, ctx.focus) && gameFormats(g, ctx).length > 0 && !isUsed('games', g); }
function fillQueue(r, n) {
  var ctx = runGameCtx(r);
  deckOf('games', GAMES);
  r.gameQueue = (r.gameQueue || []).filter(function (id) { return runGameOk(gameById(id), ctx); });
  if (r.gameQueue.length >= n) return r.gameQueue;
  var order = deckOf('games', GAMES).filter(function (id) { return r.gameQueue.indexOf(id) < 0; }).map(gameById).filter(function (g) { return runGameOk(g, ctx); });
  var last = r.gameQueue.length ? gameById(r.gameQueue[r.gameQueue.length - 1]).cat : (r.lastCats || []).slice(-1)[0];
  while (r.gameQueue.length < n && order.length) {
    var at = 0;
    for (var j = 0; j < Math.min(5, order.length); j++) if (order[j].cat !== last) { at = j; break; }
    var g = order.splice(at, 1)[0]; r.gameQueue.push(g.id); last = g.cat;
  }
  return r.gameQueue;
}
/* roughly how many tasks are still to come in this run */
function tasksLeft(r) {
  if (isTimed(r)) { var est = r.tracks.filter(function (t) { return !t.done; }).map(zeitEst); var rem = est.length ? Math.max.apply(null, est.map(function (e) { return e.remaining; })) : 0; return rem / Math.max(1, zeitInterval()); }
  return r.tracks.reduce(function (a, t) { return a + (t.done ? 0 : Math.max(0, t.total - t.pos - (r.variant === 'runden' ? 0 : 1)) / (r.variant === 'wuerfel' ? 3.5 : 1)); }, 0);
}
/* games the master set as a must and that did not come up yet */
function pinnedOpen(r) { var ctx = runGameCtx(r); return GAMES.filter(function (g) { return pickOf(g.id) === 'muss' && runGameOk(g, ctx); }); }
function pinnedUrgent(r) { var p = pinnedOpen(r); return p.length && tasksLeft(r) <= p.length + 1 ? p : []; }
function peekPartner(th) {
  th = th || curThemes();
  var at = {}; PARTNER.forEach(function (c, i) { at[c.t] = i; });
  var order = deckOf('partner', PARTNER).map(function (k) { return PARTNER[at[k]]; }).filter(function (c) { return c && needsOk(c) && fitsTheme(c, th) && !isUsed('partner', c); });
  return order[0] || null;
}
/* only the next minigame is told ahead, and only to the master: so things can be fetched in time.
   Near the end it stays secret until the Hellseher has guessed. */
function gameMat(g) { return g.mat || (g.needs || []).map(matLabel).join(', '); }
function nextGamePeek() {
  var r = R(); if (!r || r.finished || !r.plan || r.lastDone) return null;
  if (r.forceGame) { var fg = gameById(r.forceGame); return fg ? { id: fg.id, name: fg.name, mat: gameMat(fg), ahead: 1, last: true } : null; }
  if (r.jga && r.jga.mode === 'stadt') return null;
  if (hellPending(r) && nearEnd(r)) return { id: '', secret: true };
  var q = fillQueue(r, 3); if (!q.length) return null;
  var g = gameById(q[0]), k = r.plan.slice(r.planPos || 0).indexOf('spiel'), pers = r.pending ? 0 : personalNext(r, currentMain()) ? 1 : 0;
  return { id: g.id, name: g.name, mat: gameMat(g), ahead: (k < 0 ? 1 : k + 1) + pers };
}
function aheadText(n) { return n <= 1 ? 'Als Nächstes' : 'In etwa ' + n + ' Aufgaben'; }
function pickFrom(list, cat, okFn, preferFn) {
  var all = list.map(function (x, i) { return i; }).filter(function (i) { return !okFn || okFn(list[i]); });
  if (!all.length) return -1;
  var at = {}; list.forEach(function (x, i) { at[USE_KEY[cat](x)] = i; });
  var order = deckOf(cat, list).map(function (k) { return at[k]; }).filter(function (i) { return i != null && (!okFn || okFn(list[i])) && !isUsed(cat, list[i]); });
  var i;
  if (order.length) {
    i = order[0];
    if (preferFn) { for (var n = 0; n < Math.min(5, order.length); n++) if (preferFn(list[order[n]])) { i = order[n]; break; } }
  } else {
    /* everything was played already: take what was played longest ago */
    var u = usedList(cat);
    i = all.slice().sort(function (a, b) { return u.indexOf(USE_KEY[cat](list[a])) - u.indexOf(USE_KEY[cat](list[b])); })[0];
  }
  markUsed(cat, list[i]);
  return i;
}
/* material */
function matsOf() { var e = E(); return e ? e.mats : null; }
function hasMat(id) { var m = matsOf(); return !m || !!m[id]; }
function needsOk(x) { return !x || !x.needs || x.needs.every(hasMat); }
function missingOf(x) { return ((x && x.needs) || []).filter(function (id) { return !hasMat(id); }); }
function matLabel(id) { var m = MATERIALS.filter(function (x) { return x.id === id; })[0]; return m ? m.label : id; }
function playableCount() { var th = themesOf(null); return GAMES.filter(function (g) { return needsOk(g) && fitsTheme(g, th); }).length; }
function themedGames() { var th = themesOf(null); return GAMES.filter(function (g) { return fitsTheme(g, th); }); }
function matUnlocks() {
  /* which missing item unlocks the most games on its own */
  var res = {};
  themedGames().forEach(function (g) { var miss = missingOf(g); if (miss.length === 1) res[miss[0]] = (res[miss[0]] || 0) + 1; });
  return Object.keys(res).map(function (k) { return [k, res[k]]; }).sort(function (a, b) { return b[1] - a[1]; });
}
function gameFormats(g, ctx) {
  var f = [];
  if (g.solo) f.push('solo');
  /* against the other birthday person, or against a guest the birthday person picks */
  if (g.duell) f.push(ctx.focus.length >= 2 ? 'duell' : 'duellGast');
  if (g.duell && ctx.focus.length >= 2) f.push('duellGast');
  if (g.team && ctx.together === 'gemeinsam' && ctx.focus.length >= 2) f.push('team');
  return f;
}
function makeGameStep(main, ctx, gameId, format, noQueue) {
  var g = gameId ? GAMES.filter(function (x) { return x.id === gameId; })[0] : null;
  var th = ctx.themes || themesOf(null);
  var fits = function (c) { return needsOk(c) && fitsTheme(c, th) && gameAllowed(c) && safeFor(c, ctx.focus) && gameFormats(c, ctx).length > 0; };
  var r = R(), inRun = r && !S.free;
  var lastCats = inRun ? (r.lastCats || []) : (S.lastCatsFree || []);
  /* follow the shuffled order, but skip ahead a little if the category just came up */
  var wFn = function (c) { return lastCats.slice(-2).indexOf(c.cat) < 0; };
  /* in a run, take the game that was announced ahead of time */
  if (!g && inRun && !noQueue) {
    fillQueue(r, 3);
    /* the end is near and a must is still missing: it comes now */
    var urg = pinnedUrgent(r);
    if (urg.length) r.gameQueue = urg.map(function (x) { return x.id; }).concat(r.gameQueue.filter(function (id) { return !urg.some(function (x) { return x.id === id; }); }));
    while (!g && r.gameQueue.length) { var qg = gameById(r.gameQueue.shift()); if (qg && !isUsed('games', qg) && fits(qg)) { g = qg; markUsed('games', g); } }
  }
  if (!g) { var gi = pickFrom(GAMES, 'games', fits, wFn); g = gi >= 0 ? GAMES[gi] : null; }
  else if (!isUsed('games', g)) markUsed('games', g);
  if (!g) g = GAMES.filter(function (c) { return !c.needs.length && !c.only && gameFormats(c, ctx).length; })[0] || GAMES[0];
  if (!gameId) { lastCats = lastCats.concat([g.cat]).slice(-3); if (inRun) r.lastCats = lastCats; else S.lastCatsFree = lastCats; }
  if (inRun && !noQueue) fillQueue(r, 3);
  var formats = gameFormats(g, ctx);
  /* with two birthday people they mostly play each other; now and then one picks a guest */
  var wOf = function (k) { return k === 'duellGast' && formats.indexOf('duell') >= 0 ? 0.35 : k === 'team' ? 0.6 : 1; };
  var fmt = format && formats.indexOf(format) >= 0 ? format : (function () { var tot = formats.reduce(function (a, k) { return a + wOf(k); }, 0), x = Math.random() * tot; for (var i = 0; i < formats.length; i++) { x -= wOf(formats[i]); if (x <= 0) return formats[i]; } return formats[formats.length - 1]; })();
  var opp = null;
  if (fmt === 'duell') {
    var others = ctx.focus.filter(function (id) { return id !== main; });
    opp = pick(others);
  }
  return prepGameStep({ kind: 'spiel', game: g.id, format: fmt, main: main, opp: opp, team: fmt === 'team' ? ctx.focus.slice() : null, sid: uid('s') }, ctx);
}
function makeQuestionStep(main, kind, th) {
  th = th || curThemes();
  if (kind === 'frage') {
    var qs = availableQuestions(main);
    if (qs.length) {
      var q = pick(qs);
      return prepGuestStep({ kind: 'frage', qid: q.id, main: main, type: q.type, answerFocus: '', group: '' }, q);
    }
    kind = 'schaetzen';
  }
  if (kind === 'schaetzen') { var i = pickFrom(ESTIMATES, 'est', null); return { kind: 'schaetzen', idx: i, main: main, answerFocus: '', group: '' }; }
  if (kind === 'quiz') { var k = pickFrom(QUIZ_MC, 'mc', null); return { kind: 'quiz', idx: k, main: main, choice: null }; }
  if (kind === 'wwe') { var m = pickFrom(WWE, 'wwe', function (x) { return fitsTheme({ only: WWE_ONLY[x] }, th); }); return { kind: 'wwe', idx: m, main: main, votes: {} }; }
  return null;
}
/* Gegen die Menge: five questions drawn at random from the hundred */
function makeMengeStep(main, team) {
  var qs = []; for (var i = 0; i < 5; i++) { var k = pickFrom(MENGE, 'menge', function (x) { return qs.indexOf(MENGE.indexOf(x)) < 0; }); if (k >= 0) qs.push(k); }
  return { kind: 'menge', main: main, team: team, qs: qs, phase: 'vote', hands: qs.map(function () { return [0, 0]; }), handOpen: false, code: '', tally: null, guesses: qs.map(function () { return null; }), at: 0 };
}
function mengeVotes(P) {
  var t = P.hands.map(function (h) { return h.slice(); });
  if (P.code) (lsGet(LIVE_ANS + P.code) || []).forEach(function (a) { (a.v || []).forEach(function (o, k) { if (t[k] && (o === 0 || o === 1)) t[k][o] += 1; }); });
  return t;
}
function mengeLinkCount(P) { return P.code ? (lsGet(LIVE_ANS + P.code) || []).length : 0; }
/* a tie counts as right, whatever was guessed */
function mengeHit(P, k) { var t = P.tally[k]; if (t[0] === t[1]) return true; return P.guesses[k] === (t[0] > t[1] ? 0 : 1); }
function partnerPick(th) {
  th = th || curThemes();
  var i = pickFrom(PARTNER, 'partner', function (c) { return needsOk(c) && fitsTheme(c, th); });
  return i < 0 ? 0 : i;
}
function makePartnerStep(main, ctx) {
  S.used = S.used || {}; S.used.partnerGame = (S.used.partnerGame || 0) + 1;
  var ci = partnerPick(ctx.themes);
  var p = person(main);
  var teamA = { back: main, backName: p.name, front: p.partner || '', frontLabel: p.partner || ('Partner von ' + p.name) };
  var teamB;
  var other = ctx.focus.filter(function (id) { return id !== main; })[0];
  if (other) { var o = person(other); teamB = { back: other, backName: o.name, front: o.partner || '', frontLabel: o.partner || ('Partner von ' + o.name) }; }
  else teamB = { back: '', backName: '', front: '', frontLabel: '' };
  return { kind: 'partner', ch: ci, main: main, teams: [teamA, teamB], phase: 'setup', bestOf: 3, round: 1, wins: [0, 0], hist: [], starter: 0, bid: PARTNER[ci].b || 5, bidder: 0, achieved: 0, timerEnd: 0 };
}
function nextStep(forcedRoll) {
  var r = R();
  var inj = dueInjection();
  if (inj) return inj;
  /* role moments: a new role, the Ehrenrunde and the Hellseher before the last game */
  var ri = roleInjection(r);
  if (ri) return prepRoleStep(r, ri);
  /* the Handicap-Station: a moment between two tasks, a guest picks a handicap */
  var hi = hcInjection(r);
  if (hi) return prepHcStep(r, hi);
  /* JGA: someone from the crew gets a job of their role */
  var ci = crewInjection(r);
  if (ci) return prepCrewStep(r, ci);
  var tr = currentTrack(), main = currentMain();
  var ctx = { focus: r.together === 'gemeinsam' ? tr.ids.slice() : r.who.slice(), together: r.together, variant: r.variant, themes: themesOf(r.who) };
  if (r.together === 'gegeneinander') ctx.focus = r.who.slice();
  /* the last game was played: straight to the finale (time mode: only the final status check is left) */
  if (r.lastDone) return r.variant === 'zeit' ? { kind: 'check', last: true } : { kind: 'finale', track: tr.id, main: main, unitNo: isTimed(r) ? null : tr.total, roll: 0 };
  var roll = 0, target = tr.pos + 1;
  if (r.variant === 'wuerfel') { roll = forcedRoll || 1 + Math.floor(Math.random() * 6); target = Math.min(tr.total, tr.pos + roll); }
  /* the game the Hellseher had to guess, read out by the Urgestein */
  if (r.forceGame) {
    var fg = gameById(r.forceGame); r.forceGame = null;
    var last = makeGameStep(main, ctx, fg && safeFor(fg, ctx.focus) && gameFormats(fg, ctx).length ? fg.id : null);
    last.last = true; last.reader = pickRole(r, 'urgestein'); last.readerNew = !roleState(r).shown.urgestein; roleState(r).shown.urgestein = true;
    last.track = tr.id; last.unitNo = isTimed(r) ? null : Math.min(tr.total, target); last.roll = roll;
    r.lastAction = 'spiel'; r.kinds = (r.kinds || []).concat(['spiel']);
    return last;
  }
  if (r.variant === 'abend' && elapsedMin() >= r.planned) return { kind: 'finale', track: tr.id, main: main, unitNo: null, roll: 0 };
  /* Kranz: taking off the last unit is the finale itself; rounds: the last round is still played */
  if (!isTimed(r) && (r.variant === 'runden' ? target > tr.total : target >= tr.total)) return { kind: 'finale', track: tr.id, main: main, unitNo: tr.total, roll: roll };
  var kind = pickAction(main, tr), step;
  if (kind === 'spiel') step = makeGameStep(main, ctx);
  else if (kind === 'partner') step = makePartnerStep(main, ctx);
  else if (kind === 'gast') step = makeGuestGameStep(main, null, maxProgress(r));
  else if (kind === 'menge') step = makeMengeStep(main, r.together === 'gemeinsam' ? tr.ids.slice() : [main]);
  else if (kind === 'glueck') step = { kind: 'glueck', main: main, variantG: Math.random() < 0.5 ? 'frei' : 'verteilen' };
  else if (kind === 'mission') step = makeMissionStep(main, r);
  else step = makeQuestionStep(main, kind, ctx.themes);
  if (!step) step = makeGameStep(main, ctx);
  attachRoles(r, step);
  if (step.kind === 'gast') r.persUsed = (r.persUsed || 0) + (step.marks || []).length;
  if (step.kind === 'frage') r.persUsed = (r.persUsed || 0) + 1;
  step.track = tr.id; step.unitNo = isTimed(r) ? null : target; step.roll = roll;
  r.lastAction = step.kind;
  r.kinds = (r.kinds || []).concat([step.kind]);
  return step;
}

/* =========================================================
   Outcomes: who drinks how much
   ========================================================= */
/* fun stand-ins once someone reached the maximum: still a penalty, no alcohol */
var ALT_PENALTY = ['ein Gedicht über Socken aus dem Stegreif', 'ein Lied anstimmen, alle singen mit', 'jedem Gast ein Kompliment machen', '15 Sekunden Ententanz', 'einen Trinkspruch auf das Geburtstagskind halten', 'die nächste Runde Wasser für alle holen', 'eine Runde Applaus für sich selbst dirigieren', '30 Sekunden lang Roboter tanzen'];
function drinkRow(pid, why) {
  var s = stakeOutside(pid), p = person(pid);
  if (s.reason === 'limit') return { pid: pid, name: p.name, n: 0, water: true, note: 'Maximum erreicht, Wasser statt ' + U(), alt: 'Dafür: ' + pick(ALT_PENALTY) };
  if (s.n === 0) return { pid: pid, name: p.name, n: 0, water: true, note: s.reason === 'pause' ? pauseNote(pid) : s.reason === 'atem' ? 'Atempause, diesmal Wasser' : s.reason === 'voraus' ? 'Liegt über Plan, diesmal Wasser' : 'Glück gehabt, nur Wasser' };
  return { pid: pid, name: p.name, n: Math.min(1, s.n), note: (why || '') + (s.reason === 'vollgas' ? (why ? ', ' : '') + 'Vollgas' : ''), done: true };
}
function groupRow(n, label) { return { pid: '', name: label || 'Die Gruppe', n: 1, group: true, note: 'alle, die mitgespielt haben' }; }
/* one game, one result per person: at most one drink each, even if someone shows up twice */
function capRows(rows) {
  var best = {};
  rows.forEach(function (r, i) { if (r.n > 1) r.n = 1; if (r.pid && (best[r.pid] == null || rows[best[r.pid]].n < r.n)) best[r.pid] = i; });
  return rows.filter(function (r, i) { return !r.pid || best[r.pid] === i; });
}
/* guests are never counted: a name only says who drinks along. Only a birthday person goes into the counter. */
function nameRow(name, n) {
  name = String(name || '').trim();
  var f = name ? E().focus.filter(function (p) { return p.name.toLowerCase() === name.toLowerCase(); })[0] : null;
  if (f) { var row = drinkRow(f.id, ''); row.name = name; return row; }
  return { pid: '', name: name || 'Ein Gast', n: 1, group: true, note: '' };
}
function recordAttempt(pid, ok) { var r = R(); if (!r || !r.stats[pid]) return; r.stats[pid].att += 1; if (!ok) r.stats[pid].fail += 1; }

/* =========================================================
   Demo data
   ========================================================= */
function demoEvent() {
  S = fresh();
  var e = newEvent();
  e.anlass = 'socken';
  e.name = 'Kranz-Abend Jonas & Mia';
  var j = avDefault(); j.skin = '#C68A5E'; j.hair = 'wuschel'; j.hairColor = '#1E1611'; j.eyes = 'zwinker'; j.mouth = 'grinsen'; j.beard = 'dreitage'; j.hat = 'partyhut'; j.neck = 'sockenkranz'; j.outfit = 'trikot'; j.outfitColor = '#FF7A45'; j.bg = '#FFC940'; j.pat = 'konfetti';
  var m = avDefault(); m.skin = '#FBE0CB'; m.hair = 'dutt'; m.hairColor = '#C2552B'; m.eyes = 'gross'; m.mouth = 'lachen'; m.glasses = 'rund'; m.hat = 'schachteln'; m.neck = 'schachtelkranz'; m.outfit = 'ringel'; m.outfitColor = '#5B8CFF'; m.bg = '#48D9A6'; m.pat = 'punkte'; m.ex = { rouge: true, sommersprossen: true, ohrringe: true };
  e.focus = [
    { id: uid('f'), name: 'Jonas', nick: '', partner: 'Lea', anlass: 'sockenkranz', count: 25, av: j },
    { id: uid('f'), name: 'Mia', nick: 'Mimi', partner: 'Tom', anlass: 'schachtelkranz', count: 25, av: m }
  ];
  e.mats = {};
  MAT_PRESET_PARTY.concat(['teebeutel', 'socken', 'ball', 'zeitung', 'kekse', 'klammern', 'schnur', 'tischtennis']).forEach(function (id) { e.mats[id] = true; });
  S.event = e;
  S.collectCode = makeCode();
  var demoQ = [
    { author: 'Lea', type: 'schaetzen', forId: e.focus[0].id, text: 'Wie viele Socken besitzt Jonas wirklich?', unit: 'Paar', answer: 31 },
    { author: 'Max', type: 'auswahl', forId: e.focus[1].id, text: 'Wo hat Mia ihren ersten Kuss bekommen?', options: ['Im Freibad', 'Auf dem Schützenfest', 'Im Bus', 'Im Kino'], correct: 1 },
    { author: 'Sara', type: 'bereich', forId: '', text: 'Wie viele Minuten brauchen die beiden morgens im Bad, zusammen?', min: 0, max: 120, answer: 55, unit: 'Minuten' },
    { author: 'Tim', type: 'aufgabe', forId: e.focus[0].id, text: 'Jonas muss den Trinkspruch vom Abiball aufsagen.', note: 'Gilt als geschafft, wenn mindestens zwei Gäste bestätigen, dass er stimmt.' },
    { author: 'Nina', type: 'auswahl', forId: '', text: 'Welches Tier wollten beide als Kind unbedingt haben?', options: ['Pony', 'Hund', 'Hamster', 'Papagei'], correct: 0 },
    { author: 'Lea', type: 'steckbrief', forId: e.focus[0].id, text: 'Steckbrief', year: 2014, bday: '12.03.', meet: 'Im ersten Semester in der Statistik-Vorlesung' },
    { author: 'Max', type: 'steckbrief', forId: e.focus[0].id, text: 'Steckbrief', year: 2009, bday: '01.07.', meet: 'Beim Fußball im Verein' },
    { author: 'Sara', type: 'steckbrief', forId: e.focus[1].id, text: 'Steckbrief', year: 2017, bday: '23.11.', meet: 'Über eine WG-Anzeige' },
    { author: 'Tom', type: 'luege', forId: '', text: 'Zwei Wahrheiten, eine Lüge', options: ['Ich war schon zweimal in Australien', 'Ich habe einen Bruder, der Zwilling ist', 'Ich kann Einrad fahren'], correct: 1 },
    { author: 'Nina', type: 'wer', forId: e.focus[1].id, text: 'Wir sind beim Abiball zusammen in den Pool gefallen.' },
    { author: 'Lea', type: 'tipp', forId: '', text: 'Tipp: 55 Minuten', answer: 55 },
    { author: 'Max', type: 'tipp', forId: '', text: 'Tipp: 40 Minuten', answer: 40 },
    { author: 'Tom', type: 'steckbrief', forId: '', text: 'Steckbrief', year: 2012, bday: '05.09.', byear: 1994, meet: 'Auf der Abifahrt nach Prag' },
    { author: 'Nina', type: 'steckbrief', forId: e.focus[1].id, text: 'Steckbrief', year: 2019, bday: '17.01.', meet: 'Beim Yoga, beide zehn Minuten zu spät' },
    { author: 'Sara', type: 'luege', forId: '', text: 'Zwei Wahrheiten, eine Lüge', options: ['Ich habe mal in einer Band Bass gespielt', 'Ich bin noch nie geflogen', 'Ich kann mit den Ohren wackeln'], correct: 0 },
    { author: 'Max', type: 'luege', forId: '', text: 'Zwei Wahrheiten, eine Lüge', options: ['Ich hatte als Kind drei Meerschweinchen', 'Ich habe einen Marathon gelaufen', 'Ich esse keine Tomaten'], correct: 1 },
    { author: 'Tim', type: 'wer', forId: '', text: 'Ihr zwei habt beim Umzug das Sofa zwei Stunden lang durchs Treppenhaus gedreht.' },
    { author: 'Lea', type: 'worte', forId: e.focus[0].id, text: 'In zwei Worten', trait: 'hilfsbereit', interest: 'Hamburger SV' },
    { author: 'Max', type: 'worte', forId: e.focus[0].id, text: 'In zwei Worten', trait: 'Kumpeltyp', interest: 'Grillen' },
    { author: 'Tom', type: 'worte', forId: e.focus[0].id, text: 'In zwei Worten', trait: 'Ruhepol', interest: 'Gitarre' },
    { author: 'Sara', type: 'worte', forId: e.focus[1].id, text: 'In zwei Worten', trait: 'chaotisch', interest: 'Yoga' },
    { author: 'Nina', type: 'worte', forId: e.focus[1].id, text: 'In zwei Worten', trait: 'herzlich', interest: 'Harry Potter' },
    { author: 'Tim', type: 'worte', forId: e.focus[1].id, text: 'In zwei Worten', trait: 'Wirbelwind', interest: 'Backen' }
  ];
  /* what came in through the bonus cards */
  var J = e.focus[0].id, Mi = e.focus[1].id;
  demoQ = demoQ.concat([
    { author: 'Lea', type: 'portrait', forId: J, text: 'Porträt', draw: demoDoodle(3, 0), rar: 'leg' },
    { author: 'Max', type: 'portrait', forId: J, text: 'Porträt', draw: demoDoodle(7, 1), rar: 'epi' },
    { author: 'Tom', type: 'portrait', forId: J, text: 'Porträt', draw: demoDoodle(11, 2), rar: 'epi' },
    { author: 'Lea', type: 'wenn', forId: J, cat: 'tier', text: 'Faultier', rar: 'leg' },
    { author: 'Tim', type: 'wenn', forId: J, cat: 'tier', text: 'Bär', rar: 'sel' },
    { author: 'Max', type: 'wenn', forId: J, cat: 'getraenk', text: 'Weißbier', rar: 'epi' },
    { author: 'Sara', type: 'wenn', forId: J, cat: 'fahrzeug', text: 'Traktor', rar: 'epi' },
    { author: 'Nina', type: 'wenn', forId: J, cat: 'wetter', text: 'Sonnenschein', rar: 'sel' },
    { author: 'Tom', type: 'wenn', forId: Mi, cat: 'suess', text: 'Zuckerwatte', rar: 'epi' },
    { author: 'Lea', type: 'spruch', forId: J, text: 'Passt scho!', rar: 'leg' },
    { author: 'Max', type: 'spruch', forId: J, text: 'Das kriegen wir schon hin.', rar: 'epi' },
    { author: 'Tom', type: 'spruch', forId: J, text: 'Ich mach das gleich, versprochen.', rar: 'epi' },
    { author: 'Sara', type: 'spruch', forId: J, text: 'Läuft bei uns!', rar: 'sel' },
    { author: 'Lea', type: 'umfrage', forId: J, qk: 'dabei', text: 'Handy', rar: 'leg' },
    { author: 'Max', type: 'umfrage', forId: J, qk: 'dabei', text: 'Kaugummi', rar: 'epi' },
    { author: 'Sara', type: 'umfrage', forId: J, qk: 'dabei', text: 'Handy', rar: 'epi' },
    { author: 'Tom', type: 'umfrage', forId: J, qk: 'dabei', text: 'Sonnenbrille', rar: 'epi' },
    { author: 'Nina', type: 'umfrage', forId: J, qk: 'dabei', text: 'Kaugummis', rar: 'sel' },
    { author: 'Tim', type: 'umfrage', forId: J, qk: 'dabei', text: 'Ladekabel', rar: 'sel' },
    { author: 'Max', type: 'joker', forId: '', text: 'Nur gegen eine Umarmung', rar: 'jok' },
    { author: 'Sara', type: 'joker', forId: '', text: '', rar: 'jok' },
    { author: 'Lea', type: 'weiter', forId: '', text: '', rar: 'wei' },
    { author: 'Tom', type: 'regel', forId: '', text: '', rar: 'reg' },
    { author: 'Nina', type: 'portrait', forId: Mi, text: 'Porträt', draw: demoDoodle(19, 3), rar: 'epi', st: 'offen' },
    { author: 'Tim', type: 'spruch', forId: Mi, text: 'Wer hat Hunger?', rar: 'epi', st: 'offen' }
  ]);
  S.questions = demoQ.map(function (q, i) {
    q.id = uid('q'); q.t = Date.now() - (60 - i) * 3600000; q.status = q.st || (i < 3 || i >= 5 ? 'ok' : 'offen'); delete q.st; q.used = false;
    if (!q.options) q.options = []; if (q.correct === undefined) q.correct = 0; if (!q.unit) q.unit = ''; if (!q.note) q.note = '';
    return q;
  });
  save();
}
