/* =========================================================
   The website around the app.
   - The browser bar (Safari on the iPhone, Chrome on Android, Safari on
     the Mac) takes the colour of the top of the screen. The Game Pass is
     always gold.
   - The occasions on the landing page: two rows of cards that drift
     across the screen from left to right, endlessly.
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
    /* only the bar takes the colour. The page itself stays dark: with the keyboard open, the strip between the
       field and the keyboard shows the page background, and that must never be gold. */
    document.documentElement.style.backgroundColor = ''; document.body.style.backgroundColor = '';
  } catch (e) {}
}
function tintSoon() { clearTimeout(UI.tintT); UI.tintT = setTimeout(tintApply, 40); }
if (typeof window !== 'undefined' && window.requestAnimationFrame && typeof setInterval === 'function') {
  setInterval(tintApply, 900);
  try { window.addEventListener('resize', tintSoon); } catch (e) {}
}

/* ---------- the occasions run across the landing page ----------
   Two rows of occasion cards drift from left to right, endlessly, one a
   little slower than the other. Every card opens the example evening for
   that occasion. Pure CSS, so it costs nothing and never stutters. */
var MQ_SHORT = { socken: 'Sockenkranz', schachtel: 'Schachtelkranz', treppe: 'Treppe fegen', klinke: 'Klinken putzen', geburtstag: 'Geburtstag', hochzeit: 'Hochzeit & Polterabend', jga: 'Junggesellenabschied', party: 'Spielabend' };
function mqCard(t, k) {
  return '<button type="button" class="lp-mc" data-act="lpTry" data-v="' + t.id + '" style="--c:' + t.bg + ';--k:' + k + '" tabindex="-1"><span class="lp-mc-ic">' + (t.ic === 'sock' ? sockIc('#15122B', 16) : icon(t.ic, 20)) + '</span>' +
    '<span class="lp-mc-t"><b>' + esc(MQ_SHORT[t.id] || t.label) + '</b><small>' + esc(t.sub) + '</small></span></button>';
}
function mqRow(list, cls, dur) {
  var one = list.map(mqCard).join('');
  return '<div class="lp-mq-row ' + cls + '" style="--dur:' + dur + 's"><div class="lp-mq-track">' + one + one + one + '</div></div>';
}
function lpMarquee() {
  var a = EVENT_TYPES.slice(), b = EVENT_TYPES.slice(3).concat(EVENT_TYPES.slice(0, 3)).reverse();
  return '<section class="lp-mq" aria-label="Für jeden Anlass: ' + esc(EVENT_TYPES.map(function (t) { return t.label; }).join(', ')) + '">' +
    mqRow(a, 'a', 44) + mqRow(b, 'b', 58) + '</section>';
}
