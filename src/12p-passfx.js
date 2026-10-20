/* =========================================================
   The Game Pass reveal. Gold dust gathers and spins faster, a bang,
   the golden pass spins in and shimmers. Then it comes alive: it
   wiggles, grows wings, hops twice like a young bird full of energy
   and flies off in a happy loop, out of the screen, leaving glitter.
   A tap skips it. Sound follows the same switch as the bonus cards.
   ========================================================= */
var PV_T = { burst: 1900, title: 2550, alive: 3300, wings: 3420, hop: 3600, fly: 4500, gone: 6300, end: 6950 };
var PV_FLY = PV_T.gone - PV_T.fly;
function pvTimeVars() { var o = ''; Object.keys(PV_T).forEach(function (k) { o += '--p-' + k + ':' + (PV_T[k] / 1000) + 's;'; }); return o; }
function pvReduced() { try { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } }
function pvShort(t) { return new Date(t).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }); }
/* the flight: a curve through these points, with a loop in the middle. x and y in px from where the pass sits */
var PV_PATH = [[0, 0], [30, -10], [75, -45], [100, -110], [80, -175], [35, -185], [15, -135], [50, -95], [100, -135], [115, -240], [70, -360], [10, -500], [-30, -720]];
function pvCR(p0, p1, p2, p3, t) { var t2 = t * t, t3 = t2 * t; return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3); }
function pvSmooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
/* where the pass is at u (0..1 of the flight): position, turn, size */
function pvFlyPos(u) {
  u = clamp(u, 0, 1);
  var w = Math.pow(u, 1.3), n = PV_PATH.length - 1, f = w * n, i = Math.min(n - 1, Math.floor(f)), t = f - i;
  var P = function (k) { return PV_PATH[Math.max(0, Math.min(n, k))]; };
  var x = pvCR(P(i - 1)[0], P(i)[0], P(i + 1)[0], P(i + 2)[0], t), y = pvCR(P(i - 1)[1], P(i)[1], P(i + 1)[1], P(i + 2)[1], t);
  y += Math.sin(u * Math.PI * 14) * 4 * (1 - u);
  /* a little bank to the right, one full turn through the loop, then up and away */
  var rot = 18 * pvSmooth(0, 0.18, w) - 360 * pvSmooth(0.24, 0.66, w) - 10 * pvSmooth(0.7, 1, w);
  var sc = 1 - 0.38 * pvSmooth(0, 0.25, w) - 0.22 * pvSmooth(0.66, 1, w);
  return { x: x, y: y, rot: rot, sc: sc };
}
function pvFlightFrames() {
  var out = [];
  for (var k = 0; k <= 90; k++) { var p = pvFlyPos(k / 90); out.push({ offset: k / 90, transform: 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) rotate(' + p.rot.toFixed(1) + 'deg) scale(' + p.sc.toFixed(3) + ')' }); }
  return out;
}
function pvWing(side) {
  return '<span class="pv-w ' + side + '" aria-hidden="true"><span class="pv-wf"><svg viewBox="0 0 84 64"><defs><linearGradient id="pvwg" x1="1" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#FFC940"></stop><stop offset=".55" stop-color="#FFF3B8"></stop><stop offset="1" stop-color="#FFFFFF"></stop></linearGradient></defs>' +
    '<path d="M78 50C66 30 44 10 6 6C18 14 26 20 30 24C18 24 10 28 4 34C18 34 28 36 34 38C24 42 18 48 16 56C36 52 58 52 78 50Z" fill="url(#pvwg)" stroke="#8A5A00" stroke-width="2.6" stroke-linejoin="round"></path>' +
    '<path d="M70 46C56 34 40 24 22 16M66 48C52 42 40 38 24 34" fill="none" stroke="#C98A10" stroke-width="1.8" stroke-linecap="round"></path></svg></span></span>';
}
/* the golden card itself, also shown small on the pass page */
function pvCardHtml(o) {
  var e = E(), name = e ? (e.name || (e.focus.length ? focusNames() : '')) : '';
  return '<div class="pv-card"><span class="pv-holo" aria-hidden="true"></span><span class="pv-shine" aria-hidden="true"></span>' +
    '<div class="pv-top"><b class="pv-k">GAME PASS</b><span class="pv-logo" aria-hidden="true"><svg width="22" height="31" viewBox="0 0 40 56"><use href="#sk" fill="#4A2E00"></use></svg></span></div>' +
    '<span class="pv-chip" aria-hidden="true"><i></i><i></i></span><span class="pv-star" aria-hidden="true"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.3l7.1-.7z" fill="#FFF6C8" fill-opacity=".55" stroke="#8A5A00" stroke-opacity=".35" stroke-width="1"></path></svg></span>' +
    '<b class="pv-n">' + esc(name || 'Euer Abend') + '</b><span class="pv-d">Alles drin · gültig bis ' + esc(pvShort(o.w.end)) + '</span></div>';
}
function pvHtml(o) {
  var conf = '';
  return '<div class="pv' + (pvReduced() ? ' calm' : '') + '" id="pvov" data-act="pvSkip" role="dialog" aria-modal="true" aria-label="Game Pass ' + (o.early ? 'gesichert' : 'aktiv') + '" style="' + pvTimeVars() + '">' +
    '<div class="pv-bg"></div><div class="pv-raysw" aria-hidden="true"><div class="pv-rays"></div></div><div class="pv-orb" aria-hidden="true"></div>' +
    '<canvas class="pv-cv" id="pvfx" aria-hidden="true"></canvas><div class="pv-ring" aria-hidden="true"></div><div class="pv-ring r2" aria-hidden="true"></div>' +
    '<div class="pv-stage"><div class="pv-fly" id="pvfly"><div class="pv-sq"><div class="pv-in">' + pvWing('l') + pvWing('r') + pvCardHtml(o) +
    '</div></div></div></div>' +
    '<div class="pv-flash" aria-hidden="true"></div>' +
    '<div class="pv-txt"><b class="pv-h">' + (o.early ? 'Game Pass gesichert!' : 'Game Pass aktiv!') + '</b><span class="pv-s">' + (o.early ? 'Er startet am ' + esc(pvShort(o.w.start)) + ' und gilt bis ' + esc(pvShort(o.w.end)) + '.' : 'Alles freigeschaltet. Viel Spaß beim Feiern!') + '</span></div>' + conf +
    '</div>';
}
/* ---------- gold dust, the bang, glitter, the trail ---------- */
var PVFX = null;
function pvRng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
var PV_COLS = ['#FFD54A', '#FFF3B8', '#FFFFFF', '#FFB13D', '#FFE58A'];
function pvFxReset(F) { F.parts = []; F.t = 0; F.rnd = pvRng(11); F.burst = false; }
function pvFxStep(F, dt) {
  var t = F.t += dt, R = F.rnd, cx = F.W / 2, cy = F.H * 0.4, i, p;
  if (t > 250 && t < PV_T.burst) {
    var k = (t - 250) / (PV_T.burst - 250), n = 1 + Math.floor(k * 5 + R());
    for (i = 0; i < n; i++) { var a = R() * 6.2832, r = 130 + R() * 190; F.parts.push({ k: 'sp', a: a, r: r, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.8, w: 0.0016 + R() * 0.0022, life: 0, max: 1600, s: 0.9 + R() * 2, c: PV_COLS[Math.floor(R() * PV_COLS.length)] }); }
  }
  if (!F.burst && t >= PV_T.burst) {
    F.burst = true;
    F.parts = F.parts.filter(function (q) { return q.k !== 'sp'; });
    for (i = 0; i < 150; i++) { var an = R() * 6.2832, sp = 2 + R() * 10; F.parts.push({ k: 'b', x: cx, y: cy, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 1.5, life: 0, max: 900 + R() * 900, s: 1.2 + R() * 3, c: R() < 0.12 ? '#FF8FC4' : PV_COLS[Math.floor(R() * PV_COLS.length)] }); }
  }
  if (t > PV_T.burst + 250 && t < PV_T.end - 300 && R() < 0.3) F.parts.push({ k: 'tw', x: cx + (R() - 0.5) * F.W * 0.95, y: cy + (R() - 0.5) * F.H * 0.75, life: 0, max: 500 + R() * 500, s: 3 + R() * 5, c: R() < 0.5 ? '#FFFFFF' : '#FFE58A' });
  if (t >= PV_T.fly && t < PV_T.gone) {
    var fp = pvFlyPos((t - PV_T.fly) / PV_FLY);
    for (i = 0; i < 3; i++) F.parts.push({ k: 'tr', x: cx + fp.x + (R() - 0.5) * 70 * fp.sc, y: cy + fp.y + (R() - 0.5) * 34 * fp.sc, vx: (R() - 0.5) * 0.7, vy: 0.2 + R() * 0.6, life: 0, max: 700 + R() * 600, s: 1 + R() * 2.6, c: PV_COLS[Math.floor(R() * PV_COLS.length)] });
  }
  for (i = 0; i < F.parts.length; i++) {
    p = F.parts[i]; p.life += dt;
    if (p.k === 'sp') { var acc = 1 + (t - 250) / 380; p.a += p.w * dt * acc; p.r -= dt * 0.045 * acc * acc; p.x = cx + Math.cos(p.a) * p.r; p.y = cy + Math.sin(p.a) * p.r * 0.8; if (p.r < 10) p.life = p.max; }
    else if (p.k === 'b' || p.k === 'tr') { p.x += p.vx * dt / 16; p.y += p.vy * dt / 16; p.vx *= 0.985; p.vy = p.vy * 0.985 + (p.k === 'b' ? 0.07 : 0.015); }
  }
  F.parts = F.parts.filter(function (q) { return q.life < q.max; });
}
function pvFxDraw(F) {
  var c = F.ctx; if (!c) return;
  c.setTransform(F.dpr, 0, 0, F.dpr, 0, 0); c.clearRect(0, 0, F.W, F.H); c.globalCompositeOperation = 'lighter';
  F.parts.forEach(function (p) {
    var f = 1 - p.life / p.max, al = p.k === 'tw' ? Math.sin(Math.PI * p.life / p.max) : p.k === 'sp' ? Math.min(1, p.life / 220) : f;
    if (al <= 0) return;
    c.fillStyle = p.c;
    if (p.k === 'tw') {
      var s = p.s * (0.6 + 0.4 * al); c.globalAlpha = al;
      c.beginPath(); c.moveTo(p.x, p.y - s); c.lineTo(p.x + s * 0.18, p.y); c.lineTo(p.x, p.y + s); c.lineTo(p.x - s * 0.18, p.y); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(p.x - s, p.y); c.lineTo(p.x, p.y + s * 0.18); c.lineTo(p.x + s, p.y); c.lineTo(p.x, p.y - s * 0.18); c.closePath(); c.fill();
      return;
    }
    var r = p.s * (p.k === 'tr' ? 0.5 + f * 0.5 : 1);
    c.globalAlpha = al * 0.22; c.beginPath(); c.arc(p.x, p.y, r * 3.2, 0, 6.2832); c.fill();
    c.globalAlpha = al; c.beginPath(); c.arc(p.x, p.y, r, 0, 6.2832); c.fill();
  });
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}
function pvFxStart() {
  pvFxStop();
  var cv = document.getElementById('pvfx'), ov = document.getElementById('pvov');
  if (!cv || !cv.getContext || !ov) return;
  var W = ov.offsetWidth || 375, H = ov.offsetHeight || 812, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  var F = PVFX = { ctx: cv.getContext('2d'), W: W, H: H, dpr: dpr, raf: 0, last: 0, t0: Date.now(), frozen: false };
  pvFxReset(F);
  var loop = function () {
    if (PVFX !== F || F.frozen) return;
    var target = Date.now() - F.t0;
    while (F.t + 16 <= target) pvFxStep(F, 16);
    pvFxDraw(F);
    F.raf = requestAnimationFrame(loop);
  };
  F.raf = requestAnimationFrame(loop);
}
function pvFxStop() { if (PVFX) { try { cancelAnimationFrame(PVFX.raf); } catch (e) {} PVFX = null; } }
/* for tests: the dust exactly as it is at t ms */
function pvFxSeek(t) { var F = PVFX; if (!F) return; F.frozen = true; pvFxReset(F); while (F.t + 16 <= t) pvFxStep(F, 16); pvFxDraw(F); }
/* ---------- sound: a riser, the bang, a chord, then happy chirps ---------- */
function pvChirp(S, t, i) {
  var ac = S.ac, n = 2 + (i % 2), base = 2100 + (i % 3) * 260;
  for (var k = 0; k < n; k++) {
    var tt = t + k * 0.085, o = gkOsc(S, 'sine', base, tt, 0.1), g = ac.createGain();
    o.frequency.setValueAtTime(base, tt); o.frequency.exponentialRampToValueAtTime(base * 1.75 + k * 260, tt + 0.045); o.frequency.exponentialRampToValueAtTime(base * 1.2, tt + 0.085);
    gkEnv(g, tt, 0.05, 0.008, 0.075); o.connect(g); g.connect(S.out);
  }
}
function pvSound() {
  if (!gkAudioUnlock()) return;
  var S = gkSndBegin(); if (!S) return;
  try {
    var b = S.t0, s = function (ms) { return b + ms / 1000; };
    gkSndWhoosh(S, s(0), 0.6, 200, 900, 0.08);
    gkSndRiser(S, s(300), s(PV_T.burst));
    gkSndBoom(S, s(PV_T.burst), true);
    gkSndChord(S, s(PV_T.burst + 40), 'leg');
    gkSndThump(S, s(PV_T.title));
    [PV_T.alive + 60, PV_T.hop + 120, PV_T.hop + 520, PV_T.fly + 80, PV_T.fly + 500, PV_T.fly + 950, PV_T.fly + 1400].forEach(function (ms, i) { pvChirp(S, s(ms), i); });
    gkSndWhoosh(S, s(PV_T.fly), 1.1, 400, 3200, 0.1);
  } catch (e) {}
}
/* ---------- show it ---------- */
function pvShow(o) {
  if (!app.insertAdjacentHTML) return;
  pvClose(true);
  var tok = UI.pvTok = (UI.pvTok || 0) + 1, live = function () { return UI.pvTok === tok; }, calm = pvReduced();
  app.insertAdjacentHTML('beforeend', pvHtml(o));
  UI.pvOn = true;
  var ov = document.getElementById('pvov'); if (!ov) return;
  if (!calm) {
    pvFxStart(); pvSound();
    var fly = document.getElementById('pvfly');
    if (fly && fly.animate) { try { fly.animate(pvFlightFrames(), { duration: PV_FLY, delay: PV_T.fly, fill: 'both', easing: 'linear' }); } catch (e) {} }
    setTimeout(function () { if (live()) gkVibeRamp(PV_T.burst - 420); }, 300);
    setTimeout(function () { if (live()) gVibe([160, 40, 90]); }, PV_T.burst);
    setTimeout(function () { if (live()) gVibe([14, 60, 14]); }, PV_T.alive);
    setTimeout(function () { if (live()) gVibe([12]); }, PV_T.hop + 120);
    setTimeout(function () { if (live()) gVibe([16]); }, PV_T.hop + 520);
    setTimeout(function () { if (!live()) return; var x = document.getElementById('pvov'); if (x && x.classList) x.classList.add('fly'); gVibe([20, 40, 20, 40, 30]); }, PV_T.fly);
  }
  setTimeout(function () { if (live()) pvClose(); }, calm ? 2600 : PV_T.end);
}
function pvClose(now) {
  UI.pvTok = (UI.pvTok || 0) + 1; UI.pvOn = false;
  var ov = document.getElementById('pvov');
  if (!ov) { pvFxStop(); return; }
  if (now || !ov.classList) { pvFxStop(); gkSndStop(); if (ov.remove) ov.remove(); return; }
  ov.classList.add('out'); gkSndStop();
  setTimeout(function () { pvFxStop(); if (ov.parentNode) ov.remove(); }, 460);
}
A.pvSkip = function () { pvClose(); };
/* watch it again, from the pass page or the settings */
A.passReplay = function () { var i = passInfo(); if (!i) return; pvShow({ w: i.w, early: i.early }); };
/* test mode only: forget the pass, so it can be bought (and revealed) again */
A.passReset = function () { var p = passGet(); if (!p || !p.test) return; UI.passDate = p.event; UI.confirm = null; lsDel(PASS_KEY); render(); setToast('Test-Pass gelöscht, du kannst ihn neu holen'); };
