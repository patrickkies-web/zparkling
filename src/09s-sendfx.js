/* =========================================================
   Abschicken, as a moment. The contributions fly into an envelope, the flap
   closes, the seal lands, the envelope takes off to the hosts. Then the
   Party-Pass prints out of its slot (gFinale) and the stamp lands on it.
   A tap skips ahead. Reduced motion: straight to the pass.
   ========================================================= */
function gSendFx(n, done) {
  var fin = false, end = function () { if (fin) return; fin = true; var o = document.getElementById('gsend'); if (o) o.remove(); done(); };
  try {
    if (pvReduced() || !app.insertAdjacentHTML || !Element.prototype.animate || document.getElementById('gsend')) return false;
    var a0 = app.getBoundingClientRect(), sc = gScale(), W = app.offsetWidth, H = app.offsetHeight;
    if (!a0.width || !W) return false;
    var cx = W / 2, cy = Math.max(170, Math.min(H * 0.4, 330)), e = E(), names = e && e.focus.length ? focusNames() : 'den Gastgebern';
    var cards = [].slice.call(app.querySelectorAll('.gcard, .gk-mini')).filter(function (c) { var r = c.getBoundingClientRect(); return r.width && r.bottom > a0.top - 60 && r.top < a0.bottom + 60; });
    app.insertAdjacentHTML('beforeend', '<div class="gsend" id="gsend" aria-hidden="true"><div class="gs-dim"></div><div class="gs-flyers"></div>' +
      '<div class="gs-env" style="left:' + Math.round(cx - 120) + 'px;top:' + Math.round(cy - 80) + 'px">' +
      '<svg class="wl-back" viewBox="0 0 240 160"><rect x="1.5" y="1.5" width="237" height="157" rx="14" fill="#F2D9B8" stroke="#15122B" stroke-width="3"></rect></svg>' +
      '<div class="gs-letter"><span>' + (n === 1 ? 'Beitrag' : 'Beiträge') + '</span><b>' + n + '</b></div>' +
      '<svg class="wl-front" viewBox="0 0 240 160"><path d="M1.5 44L120 80L238.5 44V145a13 13 0 0 1-13 13H14.5a13 13 0 0 1-13-13Z" fill="#FFF6E3" stroke="#15122B" stroke-width="3" stroke-linejoin="round"></path><path d="M1.5 156L100 92M238.5 156L140 92" stroke="#15122B" stroke-width="2.5" stroke-linecap="round" opacity=".35"></path></svg>' +
      '<svg class="gs-flap" viewBox="0 0 240 100"><path d="M3 3H237L128 84a12 12 0 0 1-16 0Z" fill="#FFE7C2" stroke="#15122B" stroke-width="3" stroke-linejoin="round"></path></svg>' +
      '<div class="gs-seal">' + sockIc('#15122B', 15) + '</div></div>' +
      '<p class="gs-txt" style="top:' + Math.round(cy + 104) + 'px">Unterwegs zu ' + esc(names) + ' …</p></div>');
    var ov = document.getElementById('gsend'); if (!ov) return false;
    var fl = ov.querySelector('.gs-flyers'), env = ov.querySelector('.gs-env'), flap = ov.querySelector('.gs-flap'), seal = ov.querySelector('.gs-seal'), txt = ov.querySelector('.gs-txt');
    var timers = [], at = function (ms, f) { timers.push(setTimeout(function () { if (!fin) f(); }, ms)); };
    ov.addEventListener('pointerdown', function () { timers.forEach(clearTimeout); end(); });
    /* every contribution on the screen flies into the envelope, one after the other */
    var step = cards.length > 6 ? 55 : 80, mx = cx, my = cy - 52;
    cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect(), x = (r.left - a0.left) / sc, y = (r.top - a0.top) / sc, w = r.width / sc, h = r.height / sc;
      var cl = c.cloneNode(true); cl.className += ' gs-fly'; cl.removeAttribute('id');
      cl.style.cssText = 'position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;margin:0;';
      fl.appendChild(cl);
      var dx = mx - (x + w / 2), dy = my - (y + h / 2), delay = 60 + i * step;
      try {
        cl.animate([{ transform: 'none', opacity: 1 }, { transform: 'translate(' + (dx * 0.35) + 'px,' + (dy * 0.35 - 34) + 'px) rotate(-4deg) scale(.72)', opacity: 1, offset: 0.45 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.06)', opacity: 0.1 }], { duration: 540, delay: delay, easing: 'cubic-bezier(.45,0,.55,1)', fill: 'forwards' });
      } catch (x) {}
      at(delay + 20, function () { c.style.visibility = 'hidden'; });
      at(delay + 500, function () { gVibe(8); });
    });
    var tFlap = 60 + Math.max(0, cards.length - 1) * step + 440, tSeal = tFlap + 330, tGo = tSeal + 420, tEnd = tGo + 470;
    var S = gkSndBegin();
    if (S) { try { gkSndWhoosh(S, S.t0 + 0.05, 0.45, 500, 2200, 0.06); gkSndThump(S, S.t0 + tSeal / 1000); gkSndWhoosh(S, S.t0 + tGo / 1000 + 0.1, 0.6, 180, 2600, 0.15); } catch (x) {} }
    at(tFlap, function () {
      try { flap.animate([{ transform: 'rotateX(180deg)' }, { transform: 'rotateX(0deg)' }], { duration: 380, easing: 'cubic-bezier(.4,0,.3,1)', fill: 'forwards' }); } catch (x) {}
      at(190, function () { flap.style.zIndex = '4'; });
    });
    at(tSeal, function () {
      try { seal.animate([{ transform: 'scale(0) rotate(-40deg)' }, { transform: 'scale(1.35) rotate(6deg)', offset: 0.6 }, { transform: 'scale(1) rotate(0)' }], { duration: 320, easing: 'cubic-bezier(.2,1.2,.4,1)', fill: 'forwards' }); } catch (x) {}
      gVibe([34]);
    });
    at(tGo, function () {
      env.classList.add('go'); ov.classList.add('out'); if (txt) txt.textContent = 'Und ab!';
      gVibe([20, 40, 24]);
    });
    at(tEnd, end);
    return true;
  } catch (x) { return false; }
}
/* the pass prints out of its slot: a ticking sound and buzz, then the stamp with a thud, then confetti */
function gPrintFx() {
  gVibe([10, 50, 10, 50, 10, 50, 10, 50, 10]);
  var S = gkSndBegin();
  if (S) { try { gkSndWhoosh(S, S.t0 + 0.05, 1.05, 420, 1300, 0.07); gkSndThump(S, S.t0 + 1.32); gkSndChord(S, S.t0 + 1.38, 'sel'); } catch (e) {} }
  setTimeout(function () { if (UI.qSent) { gVibe([70]); gConfetti(46); } }, 1300);
}
