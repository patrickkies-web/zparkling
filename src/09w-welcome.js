/* =========================================================
   The invitation. A guest who opens the link for the first time gets
   a letter: it drops in, the sock seal pops, the flap opens and the
   invitation slides out, with who is celebrated, when and what this is.
   One button, „Ich bin dabei!“, and the invitation opens like two doors,
   light comes through, and the form underneath is free.
   ========================================================= */
function gWelcomeNeeded() { return UI.guestMode !== 'master' && !UI.qSent && !gPass().welcomed; }
function gWelcomeDate() {
  try { var p = passGet(); if (p && p.event && !isNaN(dayStart(p.event))) return fmtDay(dayStart(p.event)); } catch (e) {}
  return '';
}
/* the letter that drops in, opens and lets the invitation out */
function gWelcomeIntro() {
  var pop = ''; for (var k = 0; k < 10; k++) pop += '<i style="--a:' + (k * 36 + 8) + 'deg;--c:' + ['#FFC940', '#FFFFFF', '#48D9A6', '#FF8FC4', '#9886FF'][k % 5] + '"></i>';
  return '<div class="wl-intro" aria-hidden="true"><div class="wl-env">' +
    '<svg class="wl-back" viewBox="0 0 240 160"><rect x="1.5" y="1.5" width="237" height="157" rx="14" fill="#F2D9B8" stroke="#15122B" stroke-width="3"></rect></svg>' +
    '<div class="wl-letter"><span class="wl-letter-k">Einladung</span><span class="wl-letter-l"></span><span class="wl-letter-l s"></span><span class="wl-letter-sk">' + brandMark(22) + '</span></div>' +
    '<svg class="wl-front" viewBox="0 0 240 160"><path d="M1.5 44L120 80L238.5 44V145a13 13 0 0 1-13 13H14.5a13 13 0 0 1-13-13Z" fill="#FFF6E3" stroke="#15122B" stroke-width="3" stroke-linejoin="round"></path><path d="M1.5 156L100 92M238.5 156L140 92" stroke="#15122B" stroke-width="2.5" stroke-linecap="round" opacity=".35"></path></svg>' +
    '<svg class="wl-flap" viewBox="0 0 240 100"><path d="M3 3H237L128 84a12 12 0 0 1-16 0Z" fill="#FFE7C2" stroke="#15122B" stroke-width="3" stroke-linejoin="round"></path></svg>' +
    '<div class="wl-seal">' + brandMark(20, '#15122B', '#FFFFFF') + '</div><div class="wl-pop">' + pop + '</div></div></div>';
}
function gWelcomeView() {
  var e = E(), f = e ? e.focus : [], names = f.length ? focusNames() : 'eure Gastgeber', date = gWelcomeDate();
  var faces = f.map(function (p, i) {
    var fa = faOf(p);
    return '<span class="wl-face" style="--i:' + i + '">' + face(p, f.length > 2 ? 64 : 84, '', 'jubel') + '<b>' + esc(p.name) + '</b><small>' + esc(fa.label) + '</small></span>';
  }).join('');
  var row = function (k, ic, bg, title, sub) { return '<div class="wl-row" style="--k:' + k + '"><span class="tile-ic" style="width:40px;height:40px;border-radius:13px;background:' + bg + '">' + ic + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>' + title + '</b><span>' + sub + '</span></span></div>'; };
  var info = (date ? row(0, icon('i-star', 20), 'var(--sun)', 'Am ' + esc(date), 'Merk dir den Tag, es wird gefeiert.') : '') +
    row(1, icon('i-pad', 20), 'var(--violet)', 'Ein Abend voller Spiele', 'Die App baut sie aus dem, was ihr Gäste schickt. Welche drankommen, bleibt geheim.') +
    row(2, icon('i-pencil', 20), 'var(--mint)', 'Deine Aufgabe: zwei Minuten', 'Ein paar Kleinigkeiten über ' + esc(names) + ' oder über dich. Alles freiwillig.') +
    row(3, icon('i-trophy', 20), 'var(--pink)', 'Punkte, Level und Sticker', 'Für jeden Beitrag gibt es Punkte, und am Ende vielleicht eine Bonuskarte.');
  var body = gWelcomeIntro() +
    '<div class="wl">' +
    '<div class="wl-card">' + garland(350, ['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#15122B']) +
    '<span class="wl-k">Du bist eingeladen!</span>' +
    (faces ? '<div class="wl-faces">' + faces + '</div>' : '') +
    '<h1 class="wl-t">' + (e && e.name ? esc(e.name) : f.length ? 'Der Abend von ' + esc(names) : 'Eine Party wartet auf dich') + '</h1>' +
    '<p class="wl-s">' + (e ? esc(evLabel()) : '') + '</p></div>' +
    '<div class="wl-info">' + info + '</div>' +
    '<div class="wl-crowd">' + gCrowd() + '</div>' +
    '</div>';
  var head = UI.guestMode === 'test' ? '<div class="testbanner">' + icon('i-user', 18) + '<span class="grow">Testansicht: So sieht der Link für Gäste aus.</span><button type="button" class="tag plain" data-act="go" data-to="' + UI.guestFrom + '" style="height:30px;color:var(--sun)">Zurück</button></div>' : '';
  var foot = '<button type="button" class="cta wl-go" data-act="gWelcome">' + icon('i-play', 18) + 'Ich bin dabei!</button><p class="small" style="text-align:center">Dauert etwa zwei Minuten</p>';
  return scr(head, body, foot, 'wlscr');
}
/* „Ich bin dabei!“: the invitation opens like two doors, the form is behind it */
A.gWelcome = function () {
  var old = app.querySelector('.scr'), html = old && old.outerHTML ? old.outerHTML : '', ob = old ? old.querySelector('.body') : null, st = ob ? ob.scrollTop : 0;
  var P = gPass(); P.welcomed = true; gPassSave();
  UI.gIn = true;
  gkAudioUnlock();
  gSay('hello');
  gRender();
  /* the doors are the old screen, cut in two; the form behind them stands still and comes forward (see .gscr.gin) */
  if (html && app.insertAdjacentHTML) {
    app.insertAdjacentHTML('beforeend', '<div class="wl-doors" aria-hidden="true"><div class="wl-door l">' + html + '</div><div class="wl-door r">' + html + '</div><div class="wl-light"></div></div>');
    var d = app.querySelector('.wl-doors');
    if (d && st) { var bs = d.querySelectorAll('.body'); for (var i = 0; i < bs.length; i++) bs[i].scrollTop = st; }
    setTimeout(function () { var x = app.querySelector('.wl-doors'); if (x) x.remove(); }, 1400);
  }
  gVibe([18, 40, 12]);
  /* the welcome (confetti, chord, a second buzz) waits until the doors are open */
  setTimeout(function () { if (UI.screen === 'guestForm') { gConfetti(40); gVibe([20, 40, 70]); } }, 980);
  var S2 = gkSndBegin(); if (S2) { try { gkSndWhoosh(S2, S2.t0 + 0.08, 0.9, 220, 1800, 0.1); gkSndChord(S2, S2.t0 + 0.98, 'epi'); } catch (e) {} }
};
