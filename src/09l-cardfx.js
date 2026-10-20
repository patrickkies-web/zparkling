/* =========================================================
   The pack opening, the part CSS cannot do alone:
   a swarm of sparks that starts small and slow and gets faster
   and faster, the pack trembling harder and harder, the burst
   when it tears, glitter around the card. And the sound to it.
   ========================================================= */
var GKFX = null;
function gkFxNow() { return GKFX ? (UI.gkFxT != null ? UI.gkFxT : (Date.now() - GKFX.t0)) : 0; }
/* the pack trembles: tiny and slow at first, then faster and wider, a short freeze before it tears */
function gkShakeFrames(rar) {
  var fr = [], N = 260, dur = (GK_T.tear - GK_T.charge) / 1000, ph = 0, big = rar === 'leg' || rar === 'jok' ? 1.25 : 1;
  for (var i = 0; i <= N; i++) {
    var p = i / N, f = 2.5 + 23 * p * p;
    ph += f * (dur / N) * Math.PI * 2;
    var amp = (0.35 + 8.5 * Math.pow(p, 2.3)) * big, s = 1 + 0.11 * Math.pow(p, 1.7);
    var x = Math.sin(ph) * amp, y = Math.cos(ph * 1.31) * amp * 0.55, r = Math.sin(ph * 0.87) * amp * 0.42;
    if (p > 0.95) { var q = (p - 0.95) / 0.05; x *= 0.12; y *= 0.12; r *= 0.12; s = 1.11 - 0.07 * q; }
    fr.push({ offset: p, transform: 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px) rotate(' + r.toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')' });
  }
  return fr;
}
function gkFxStart(k) {
  gkFxStop();
  var ov = document.getElementById('gkov'), cv = document.getElementById('gkfx');
  if (!ov || !cv || !cv.getContext || !ov.querySelector) return;
  var c = cv.getContext('2d'); if (!c) return;
  var rar = gkRar(k.rar);
  GKFX = { k: k, ov: ov, cv: cv, ctx: c, t0: Date.now(), last: 0, sw: [], mo: [], bu: [], am: [], acc: 0, burst: false, burst2: false, raf: 0, col: rar.c, col2: rar.c2, big: k.rar === 'leg' || k.rar === 'jok', sel: k.rar === 'sel' };
  gkFxSize();
  var sh = ov.querySelector('.gk-pack-sh');
  if (sh && sh.animate) { try { GKFX.shake = sh.animate(gkShakeFrames(k.rar), { duration: GK_T.tear - GK_T.charge, delay: GK_T.charge, fill: 'both', easing: 'linear' }); } catch (e) {} }
  var loop = function () { if (!GKFX) return; gkFxFrame(); if (GKFX && gkFxNow() < 24000) { try { GKFX.raf = requestAnimationFrame(loop); } catch (e) {} } };
  try { GKFX.raf = requestAnimationFrame(loop); } catch (e) {}
}
function gkFxSize() {
  var F = GKFX; if (!F) return;
  var W = F.ov.offsetWidth || 400, H = F.ov.offsetHeight || 860, dpr = Math.min(2, window.devicePixelRatio || 1);
  if (F.cv.width !== Math.round(W * dpr)) { F.cv.width = Math.round(W * dpr); F.cv.height = Math.round(H * dpr); }
  F.W = W; F.H = H; F.dpr = dpr;
  var st = F.ov.querySelector('.gk-stage'), sc = gScale();
  if (st && st.getBoundingClientRect) { var o = F.ov.getBoundingClientRect(), r = st.getBoundingClientRect(); F.cx = (r.left + r.width / 2 - o.left) / sc; F.cy = (r.top + r.height / 2 - o.top) / sc; }
  else { F.cx = W / 2; F.cy = H * 0.4; }
}
function gkFxStop() { if (GKFX) { try { cancelAnimationFrame(GKFX.raf); } catch (e) {} GKFX = null; } }
/* a re-render replaced the overlay: keep drawing on the new canvas */
function gkFxRebind() {
  if (!GKFX) return;
  var ov = document.getElementById('gkov'), cv = document.getElementById('gkfx');
  if (!ov || !cv || !cv.getContext || (UI.gk && UI.gk.type === 'portrait' && UI.gk.phase !== 'ready')) { gkFxStop(); return; }
  if (cv === GKFX.cv) return;
  GKFX.ov = ov; GKFX.cv = cv; GKFX.ctx = cv.getContext('2d'); GKFX.cv.width = 0; gkFxSize();
}
/* a tap skips the opening: straight to the glitter, with one last burst around the card */
function gkFxSkip() { if (!GKFX) return; GKFX.sw = []; GKFX.mo = []; GKFX.burst = true; GKFX.t0 = Date.now() - GK_T.flash2 + 20; GKFX.last = GK_T.flash2 - 20; GKFX.burst2 = false; }
/* for frozen frames in tests: replay the simulation up to t */
function gkFxSeek(t) {
  var F = GKFX; if (!F) return;
  F.sw = []; F.mo = []; F.bu = []; F.am = []; F.burst = false; F.burst2 = false; F.last = 0; F.acc = 0;
  UI.gkFxT = null;
  for (var x = 16; x <= t; x += 16) gkFxStep(x);
  gkFxStep(t); UI.gkFxT = t; gkFxPaint();
}
function gkFxFrame() { var t = gkFxNow(); gkFxStep(t); gkFxPaint(); }
function gkRand(a, b) { return a + Math.random() * (b - a); }
function gkFxStep(t) {
  var F = GKFX; if (!F) return;
  var dt = Math.min(0.05, Math.max(0, (t - F.last) / 1000)); F.last = t;
  if (!dt) return;
  var T = GK_T, cx = F.cx, cy = F.cy;
  /* the swarm: from a few slow sparks to a whirl, all pulled into the pack */
  if (t > 250 && t < T.tear - 120) {
    var p = Math.min(1, Math.max(0, (t - 250) / (T.tear - 370)));
    var rate = (F.sel ? 22 : 30) + (F.big ? 520 : 400) * p * p;
    F.acc += rate * dt;
    while (F.acc >= 1) {
      F.acc -= 1;
      F.sw.push({ a: Math.random() * Math.PI * 2, r: gkRand(150, 320), w: (0.5 + 9 * p * p) * gkRand(0.75, 1.3), v: (18 + 460 * p * p) * gkRand(0.7, 1.35), s: gkRand(0.8, 2.2) + p * 1.2, c: Math.random() < 0.62 ? F.col : '#FFFFFF', life: 0, px: null, py: null });
    }
    /* crawling sparks on the pack itself */
    if (p > 0.15) { var m = Math.round((2 + 26 * p * p) * dt * 30); for (var j = 0; j < m; j++) F.mo.push({ x: cx + gkRand(-92, 92), y: cy + gkRand(-135, 135), life: 0, max: gkRand(0.08, 0.22), s: gkRand(0.8, 2) }); }
  }
  F.sw = F.sw.filter(function (q) {
    q.px = cx + Math.cos(q.a) * q.r; q.py = cy + Math.sin(q.a) * q.r * 0.82;
    q.a += q.w * dt; q.r -= q.v * dt * (1 + (320 - q.r) / 260); q.life += dt;
    q.x = cx + Math.cos(q.a) * q.r; q.y = cy + Math.sin(q.a) * q.r * 0.82;
    return q.r > 26 && t < T.tear;
  });
  F.mo = F.mo.filter(function (q) { q.life += dt; return q.life < q.max && t < T.tear; });
  /* the burst */
  if (t >= T.tear && !F.burst) {
    F.burst = true;
    var n = F.big ? 300 : F.sel ? 150 : 220;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, sp = 260 + Math.pow(Math.random(), 0.6) * (F.big ? 1300 : 1050);
      F.bu.push({ x: cx + gkRand(-20, 20), y: cy + gkRand(-30, 30), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 120, life: 0, max: gkRand(0.6, 1.6), s: gkRand(1.2, 3.2), c: [F.col, F.col2, '#FFFFFF'][i % 3] });
    }
    F.sw = []; F.mo = [];
  }
  /* the card lands: sparks fly off its edges */
  if (t >= T.flash2 && !F.burst2) {
    F.burst2 = true;
    for (var b = 0; b < (F.big ? 64 : 44); b++) {
      var side = Math.floor(Math.random() * 4), ex = side < 2 ? gkRand(-126, 126) : side === 2 ? -126 : 126, ey = side >= 2 ? gkRand(-178, 178) : side === 0 ? -178 : 178;
      var len = Math.sqrt(ex * ex + ey * ey) || 1, v2 = gkRand(200, 620);
      F.bu.push({ x: cx + ex * 1.04, y: cy + ey * 1.04, vx: ex / len * v2, vy: ey / len * v2, life: 0, max: gkRand(0.5, 1.1), s: gkRand(1, 2.4), c: Math.random() < 0.5 ? F.col : '#FFFFFF', star: true });
    }
  }
  F.bu = F.bu.filter(function (q) {
    q.px = q.x; q.py = q.y;
    var drag = Math.pow(0.12, dt); q.vx *= drag; q.vy = q.vy * drag + 340 * dt;
    q.x += q.vx * dt; q.y += q.vy * dt; q.life += dt;
    return q.life < q.max;
  });
  /* glitter around the card, gently rising */
  if (t >= T.flash2 + 300 && t < 22000) {
    F.acc2 = (F.acc2 || 0) + (F.big ? 16 : 10) * dt;
    while (F.acc2 >= 1) { F.acc2 -= 1; var ga = Math.random() * Math.PI * 2, gr = gkRand(140, 210); F.am.push({ x: cx + Math.cos(ga) * gr, y: cy + Math.sin(ga) * gr * 1.25, vy: -gkRand(14, 40), life: 0, max: gkRand(1.2, 2.4), s: gkRand(1.4, 3.4), c: Math.random() < 0.5 ? F.col : '#FFFFFF', ph: Math.random() * 6 }); }
  }
  F.am = F.am.filter(function (q) { q.y += q.vy * dt; q.life += dt; return q.life < q.max; });
}
function gkStar(c, x, y, s) { c.beginPath(); c.moveTo(x - s * 2.6, y); c.lineTo(x + s * 2.6, y); c.moveTo(x, y - s * 2.6); c.lineTo(x, y + s * 2.6); c.stroke(); c.beginPath(); c.arc(x, y, s * 0.7, 0, Math.PI * 2); c.fill(); }
function gkFxPaint() {
  var F = GKFX; if (!F || !F.ctx) return;
  var c = F.ctx, t = gkFxNow();
  c.setTransform(F.dpr, 0, 0, F.dpr, 0, 0);
  c.clearRect(0, 0, F.W, F.H);
  c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  F.sw.forEach(function (q) {
    var al = Math.min(1, q.life * 4) * 0.95;
    c.globalAlpha = al; c.strokeStyle = q.c; c.lineWidth = q.s;
    c.beginPath(); c.moveTo(q.px, q.py); c.lineTo(q.x, q.y); c.stroke();
  });
  F.mo.forEach(function (q) { c.globalAlpha = 1 - q.life / q.max; c.fillStyle = '#FFFFFF'; c.fillRect(q.x + gkRand(-2, 2), q.y + gkRand(-2, 2), q.s, q.s); });
  F.bu.forEach(function (q) {
    var al = Math.max(0, 1 - q.life / q.max);
    c.globalAlpha = al; c.strokeStyle = c.fillStyle = q.c;
    if (q.star) { c.lineWidth = q.s * 0.6; gkStar(c, q.x, q.y, q.s * al); return; }
    c.lineWidth = q.s; c.beginPath(); c.moveTo(q.x - q.vx * 0.022, q.y - q.vy * 0.022); c.lineTo(q.x, q.y); c.stroke();
  });
  F.am.forEach(function (q) {
    var tw = 0.5 + 0.5 * Math.sin(q.ph + q.life * 9), al = Math.sin(Math.PI * q.life / q.max) * tw;
    c.globalAlpha = al; c.strokeStyle = c.fillStyle = q.c; c.lineWidth = 1;
    gkStar(c, q.x, q.y, q.s * 0.7);
  });
  c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
}

/* ---------- sound: synthesized, nothing to download ---------- */
var GK_SOUND_KEY = 'altesocke.sound', GKS = null;
function gkSoundOn() { try { return localStorage.getItem(GK_SOUND_KEY) !== 'aus'; } catch (e) { return true; } }
A.gkMute = function () {
  var on = !gkSoundOn();
  try { localStorage.setItem(GK_SOUND_KEY, on ? 'an' : 'aus'); } catch (e) {}
  if (!on) gkSndStop(); else gkAudioUnlock();
  var b = app.querySelector('.gk-mute'); if (b) { b.classList.toggle('off', !on); b.setAttribute('aria-pressed', String(!on)); b.setAttribute('aria-label', on ? 'Ton ausschalten' : 'Ton einschalten'); b.innerHTML = gkSpeaker(on); }
  gVibe(10);
};
/* audio may only start from a tap: called right in the tap on "Karte ziehen" */
function gkAudioUnlock() {
  if (!gkSoundOn()) return null;
  try {
    if (!UI.gkAC) { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; UI.gkAC = new AC(); }
    if (UI.gkAC.state === 'suspended' && UI.gkAC.resume) UI.gkAC.resume();
    return UI.gkAC;
  } catch (e) { return null; }
}
function gkNoise(ac) {
  if (!UI.gkNoiseBuf) { var n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; UI.gkNoiseBuf = b; }
  var s = ac.createBufferSource(); s.buffer = UI.gkNoiseBuf; s.loop = true; return s;
}
function gkSndBegin() {
  gkSndStop();
  if (!gkSoundOn() || !UI.gkAC) return null;
  try {
    var ac = UI.gkAC, comp = ac.createDynamicsCompressor(), out = ac.createGain();
    comp.threshold.value = -16; comp.ratio.value = 6; comp.connect(ac.destination);
    out.gain.value = 0.8; out.connect(comp);
    GKS = { ac: ac, out: out, comp: comp, nodes: [], t0: ac.currentTime + 0.02 };
    return GKS;
  } catch (e) { return null; }
}
function gkSndStop() {
  var S = GKS; if (!S) return; GKS = null;
  try {
    var t = S.ac.currentTime;
    S.out.gain.cancelScheduledValues(t); S.out.gain.setValueAtTime(S.out.gain.value, t); S.out.gain.linearRampToValueAtTime(0, t + 0.08);
    S.nodes.forEach(function (n) { try { n.stop(t + 0.1); } catch (e) {} });
    setTimeout(function () { try { S.comp.disconnect(); } catch (e) {} }, 300);
  } catch (e) {}
}
function gkEnv(g, t, peak, a, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function gkOsc(S, type, f, t, dur) { var o = S.ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t); o.start(t); o.stop(t + dur); S.nodes.push(o); return o; }
function gkNoiseAt(S, t, dur) { var n = gkNoise(S.ac); n.start(t); n.stop(t + dur); S.nodes.push(n); return n; }
/* the button charging: a short rising buzz */
function gkSndCharge() {
  var ac = gkAudioUnlock(); if (!ac) return;
  try {
    var t = ac.currentTime + 0.01, o = ac.createOscillator(), g = ac.createGain(), lfo = ac.createOscillator(), lg = ac.createGain(), out = ac.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(720, t + 0.7);
    lfo.type = 'square'; lfo.frequency.setValueAtTime(8, t); lfo.frequency.exponentialRampToValueAtTime(30, t + 0.7); lg.gain.value = 0.5; g.gain.value = 0.5;
    lfo.connect(lg); lg.connect(g.gain); o.connect(g); g.connect(out); out.connect(ac.destination);
    out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(0.09, t + 0.6); out.gain.exponentialRampToValueAtTime(0.0001, t + 0.74);
    o.start(t); o.stop(t + 0.76); lfo.start(t); lfo.stop(t + 0.76);
  } catch (e) {}
}
/* the whole opening, scheduled to the timeline */
function gkSndOpening(k) {
  var S = gkSndBegin(); if (!S) return;
  try {
    var b = S.t0, s = function (ms) { return b + ms / 1000; }, big = k.rar === 'leg' || k.rar === 'jok';
    gkSndWhoosh(S, s(40), 0.5, 300, 1600, 0.12);
    gkSndRiser(S, s(GK_T.charge), s(GK_T.tear));
    gkSndBoom(S, s(GK_T.tear), big);
    gkSndWhoosh(S, s(GK_T.rise), 0.45, 500, 2800, 0.16);
    gkSndChord(S, s(GK_T.flash2), k.rar);
    gkSndThump(S, s(GK_T.stamp));
  } catch (e) {}
}
function gkSndSkip(k) { gkSndStop(); var S = gkSndBegin(); if (!S) return; try { gkSndChord(S, S.t0, k.rar); gkSndThump(S, S.t0 + 0.12); } catch (e) {} }
function gkSndWhoosh(S, t, dur, f1, f2, peak) {
  var ac = S.ac, n = gkNoiseAt(S, t, dur + 0.05), bp = ac.createBiquadFilter(), g = ac.createGain();
  bp.type = 'bandpass'; bp.Q.value = 1.4; bp.frequency.setValueAtTime(f1, t); bp.frequency.exponentialRampToValueAtTime(f2, t + dur);
  gkEnv(g, t, peak, dur * 0.45, dur * 0.55); n.connect(bp); bp.connect(g); g.connect(S.out);
}
/* rising noise and a buzzing tone whose pulse gets faster, cut off just before the tear */
function gkSndRiser(S, t1, t2) {
  var ac = S.ac, end = t2 - 0.13, cut = t2 - 0.08;
  var n = gkNoiseAt(S, t1, t2 - t1), bp = ac.createBiquadFilter(), g1 = ac.createGain();
  bp.type = 'bandpass'; bp.Q.value = 1.1; bp.frequency.setValueAtTime(220, t1); bp.frequency.exponentialRampToValueAtTime(5200, end);
  g1.gain.setValueAtTime(0.0001, t1); g1.gain.exponentialRampToValueAtTime(0.3, end); g1.gain.exponentialRampToValueAtTime(0.0001, cut);
  n.connect(bp); bp.connect(g1); g1.connect(S.out);
  var o = gkOsc(S, 'sawtooth', 62, t1, t2 - t1), o2 = gkOsc(S, 'square', 93, t1, t2 - t1), lfo = gkOsc(S, 'square', 2.5, t1, t2 - t1);
  o.frequency.exponentialRampToValueAtTime(560, end); o2.frequency.exponentialRampToValueAtTime(840, end); lfo.frequency.exponentialRampToValueAtTime(26, end);
  var lp = ac.createBiquadFilter(), trem = ac.createGain(), lg = ac.createGain(), g2 = ac.createGain(), g2b = ac.createGain();
  lp.type = 'lowpass'; lp.Q.value = 7; lp.frequency.setValueAtTime(240, t1); lp.frequency.exponentialRampToValueAtTime(4200, end);
  trem.gain.value = 0.5; lg.gain.value = 0.5; g2b.gain.value = 0.3;
  g2.gain.setValueAtTime(0.0001, t1); g2.gain.exponentialRampToValueAtTime(0.2, end); g2.gain.exponentialRampToValueAtTime(0.0001, cut);
  lfo.connect(lg); lg.connect(trem.gain); o.connect(lp); o2.connect(g2b); g2b.connect(lp); lp.connect(trem); trem.connect(g2); g2.connect(S.out);
}
function gkSndBoom(S, t, big) {
  var ac = S.ac, o = gkOsc(S, 'sine', 150, t, 1.5), g = ac.createGain();
  o.frequency.exponentialRampToValueAtTime(32, t + 0.6); gkEnv(g, t, 1, 0.012, big ? 1.3 : 0.9); o.connect(g); g.connect(S.out);
  var n = gkNoiseAt(S, t, 1.3), lp = ac.createBiquadFilter(), gn = ac.createGain();
  lp.type = 'lowpass'; lp.frequency.setValueAtTime(7500, t); lp.frequency.exponentialRampToValueAtTime(180, t + 0.95);
  gkEnv(gn, t, 0.6, 0.008, 1.1); n.connect(lp); lp.connect(gn); gn.connect(S.out);
  var n2 = gkNoiseAt(S, t, 0.2), hp = ac.createBiquadFilter(), g3 = ac.createGain();
  hp.type = 'highpass'; hp.frequency.value = 2800; gkEnv(g3, t, 0.5, 0.004, 0.14); n2.connect(hp); hp.connect(g3); g3.connect(S.out);
  if (big) { var sub = gkOsc(S, 'sine', 55, t, 1.8), gs = ac.createGain(); gkEnv(gs, t, 0.35, 0.05, 1.6); sub.connect(gs); gs.connect(S.out); }
}
function gkSndThump(S, t) {
  var ac = S.ac, o = gkOsc(S, 'sine', 125, t, 0.4), g = ac.createGain();
  o.frequency.exponentialRampToValueAtTime(55, t + 0.18); gkEnv(g, t, 0.7, 0.006, 0.3); o.connect(g); g.connect(S.out);
  var n = gkNoiseAt(S, t, 0.15), lp = ac.createBiquadFilter(), gn = ac.createGain();
  lp.type = 'lowpass'; lp.frequency.value = 1100; gkEnv(gn, t, 0.25, 0.004, 0.11); n.connect(lp); lp.connect(gn); gn.connect(S.out);
}
/* the reveal: a bright chord, for the big ones with a choir-like pad and sparkling pings */
var GK_CHORDS = { leg: [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98], jok: [392, 493.88, 587.33, 783.99, 987.77, 1174.66], epi: [587.33, 739.99, 880, 1174.66, 1479.98], sel: [659.25, 830.61, 987.77, 1318.51] };
function gkSndChord(S, t, rar) {
  var ac = S.ac, notes = GK_CHORDS[rar] || GK_CHORDS.sel, big = rar === 'leg' || rar === 'jok';
  notes.forEach(function (f, i) {
    var tt = t + i * 0.055;
    [-7, 7].forEach(function (det) { var o = gkOsc(S, i % 2 ? 'triangle' : 'sine', f, tt, 2.6), g = ac.createGain(); o.detune.value = det; gkEnv(g, tt, 0.085, 0.012, big ? 2.4 : 1.6); o.connect(g); g.connect(S.out); });
  });
  if (big) {
    [261.63, 392, 659.25].forEach(function (f) {
      var lp = ac.createBiquadFilter(), g = ac.createGain(); lp.type = 'lowpass'; lp.frequency.value = 1700;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.35); g.gain.setValueAtTime(0.05, t + 1.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.3);
      [-9, 9].forEach(function (det) { var o = gkOsc(S, 'sawtooth', f, t, 3.4); o.detune.value = det; o.connect(lp); });
      lp.connect(g); g.connect(S.out);
    });
  }
  for (var k = 0; k < (big ? 14 : 8); k++) { var tp = t + 0.12 + Math.random() * 1.4, o2 = gkOsc(S, 'sine', 1800 + Math.random() * 3200, tp, 0.35), g2 = ac.createGain(); gkEnv(g2, tp, 0.045, 0.004, 0.28); o2.connect(g2); g2.connect(S.out); }
}
