/* apply: drop what is out, use the clear texts, no group or relay formats anymore */
(function () {
  for (var i = GAMES.length - 1; i >= 0; i--) {
    var g = GAMES[i], t = GAME_TEXT[g.id];
    if (GAMES_OUT.indexOf(g.id) >= 0 || !t) { GAMES.splice(i, 1); continue; }
    g.tx = { solo: t.s || null, duell: t.d || null, team: t.t || null };
    g.solo = t.s ? t.s.join(' ') : null; g.duell = t.d ? t.d.join(' ') : null; g.team = t.t ? t.t.join(' ') : null; g.gruppe = null;
    g.faq = t.f || [];
    if (GAME_MAT_FIX[g.id]) g.mat = GAME_MAT_FIX[g.id];
  }
})();

