/* =========================================================
   The website around the app.
   - The browser bar (Safari on the iPhone, Chrome on Android, Safari on
     the Mac) takes the colour of the top of the screen. The Game Pass is
     always gold.
   - The slot machine on the landing page: reels with every occasion,
     they spin and stop one after the other, like stairs, again and again.
   ========================================================= */
var TINT_BASE = '#0C0A1A', TINT_GOLD = '#F2B33D';
function tintNow() {
  if (typeof document === 'undefined' || !document.elementFromPoint || typeof window === 'undefined') return TINT_BASE;
  if (UI.screen === 'pass' || document.getElementById('pvov')) return TINT_GOLD;
  var W = window.innerWidth || 375, ys = [2, 26, 60], el, d, k;
  /* something at the top says which colour it is (the gold banner, a header) */
  for (k = 0; k < ys.length; k++) {
    el = document.elementFromPoint(W / 2, ys[k]);
    for (d = 0; el && d < 16; d++, el = el.parentElement) { var t = el.getAttribute && el.getAttribute('data-tint'); if (t) return t; }
  }
  /* otherwise the first solid background at the very top */
  el = document.elementFromPoint(W / 2, 2);
  for (d = 0; el && d < 16; d++, el = el.parentElement) {
    var m = /rgba?\(([^)]+)\)/.exec(getComputedStyle(el).backgroundColor || '');
    if (m) { var p = m[1].split(',').map(parseFloat); if (p.length < 4 || p[3] > 0.6) return 'rgb(' + Math.round(p[0]) + ',' + Math.round(p[1]) + ',' + Math.round(p[2]) + ')'; }
  }
  return TINT_BASE;
}
function tintApply() {
  try {
    var c = tintNow(); if (c === UI.tint) return; UI.tint = c;
    var m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement('meta'); m.setAttribute('name', 'theme-color'); document.head.appendChild(m); }
    m.setAttribute('content', c);
    document.documentElement.style.backgroundColor = c; document.body.style.backgroundColor = c;
  } catch (e) {}
}
function tintSoon() { clearTimeout(UI.tintT); UI.tintT = setTimeout(tintApply, 40); }
if (typeof window !== 'undefined' && window.requestAnimationFrame && typeof setInterval === 'function') {
  setInterval(tintApply, 900);
  try { window.addEventListener('resize', tintSoon); } catch (e) {}
}

/* ---------- the slot machine ---------- */
var SLOT_SHORT = { socken: 'Sockenkranz', schachtel: 'Schachtelkranz', treppe: 'Treppe fegen', klinke: 'Klinken putzen', geburtstag: 'Geburtstag', hochzeit: 'Polterabend', jga: 'JGA', party: 'Spielabend' };
var SLOT_REELS = 5, SLOT_COPIES = 4;
function slotSym(t) {
  return '<button type="button" class="lp-sym" data-act="lpTry" data-v="' + t.id + '" tabindex="-1"><span class="lp-sym-ic" style="background:' + t.bg + '">' + (t.ic === 'sock' ? sockIc('#15122B', 15) : icon(t.ic, 19)) + '</span>' +
    '<span class="lp-sym-t"><b class="lp-long">' + esc(t.label) + '</b><b class="lp-short">' + esc(SLOT_SHORT[t.id] || t.label) + '</b><small>' + esc(t.sub) + '</small></span></button>';
}
function lpSlot() {
  var strip = ''; for (var c = 0; c < SLOT_COPIES; c++) strip += EVENT_TYPES.map(slotSym).join('');
  var reels = '';
  for (var i = 0; i < SLOT_REELS; i++) reels += '<div class="lp-reel" data-r="' + i + '"><div class="lp-strip" style="transform:translateY(calc(var(--sh) * -' + (i % EVENT_TYPES.length) + '))">' + strip + '</div></div>';
  var bulbs = ''; for (var b = 0; b < 14; b++) bulbs += '<i></i>';
  return '<section class="lp-slot" id="lpslot" aria-label="Für jeden Anlass: ' + esc(EVENT_TYPES.map(function (t) { return t.label; }).join(', ')) + '">' +
    '<span class="lp-bulbs top" aria-hidden="true">' + bulbs + '</span><span class="lp-bulbs bot" aria-hidden="true">' + bulbs + '</span>' +
    '<span class="lp-slot-k"><b>Für jeden Anlass</b><small>Tippt einen an</small></span><div class="lp-reels">' + reels + '</div></section>';
}
/* one spin: every reel travels a little longer than the one before, so they stop like stairs */
function slotSpin() {
  var box = document.getElementById('lpslot'); if (!box) return false;
  var reels = box.querySelectorAll('.lp-reel'), n = EVENT_TYPES.length; if (!reels.length) return false;
  var h = reels[0].querySelector('.lp-sym'); h = h ? h.offsetHeight : 0; if (!h) return true;
  var vis = 0; for (var v = 0; v < reels.length; v++) if (reels[v].offsetWidth) vis++;
  UI.slotK = ((UI.slotK == null ? -vis : UI.slotK) + Math.max(1, vis)) % n;
  for (var i = 0; i < reels.length; i++) {
    var r = reels[i], st = r.querySelector('.lp-strip'), from = +(r.getAttribute('data-pos') || i % n), to = (UI.slotK + i) % n;
    var laps = 1 + Math.min(SLOT_COPIES - 2, Math.floor(i / 2)), end = laps * n + to, dur = 1.05 + i * 0.28;
    st.style.transition = 'none'; st.style.transform = 'translateY(' + (-from * h) + 'px)';
    void st.offsetHeight;
    st.style.transition = 'transform ' + dur.toFixed(2) + 's cubic-bezier(.16,.72,.26,1.04)';
    st.style.transform = 'translateY(' + (-end * h) + 'px)';
    r.setAttribute('data-pos', to); r.classList.add('spin');
    (function (r2, ms) { setTimeout(function () { r2.classList.remove('spin'); r2.classList.add('stop'); setTimeout(function () { r2.classList.remove('stop'); }, 420); }, ms); })(r, Math.round(dur * 1000) - 260);
  }
  return true;
}
/* the machine runs while the landing page is open; it rests when nothing moves on the screen */
function slotRun() {
  clearInterval(UI.slotT);
  if (typeof window === 'undefined' || !window.requestAnimationFrame) return;
  try { if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch (e) {}
  setTimeout(slotSpin, 350);
  UI.slotT = setInterval(function () { if (document.hidden) return; if (!slotSpin()) clearInterval(UI.slotT); }, 4600);
}
