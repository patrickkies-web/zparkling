/* Plays whole evenings like a (slightly chaotic) master would and checks the hard rules after every step.
   node harness/sim.js [runs] [seed] */
'use strict';
const { load, seeded } = require('./run');

function fail(msg, info) { const e = new Error(msg); e.info = info; throw e; }

/* resolve whatever card is open, the way a person would tap through it */
function resolveStep(c, P, rnd, opt) {
  const A = c.A, pickI = n => Math.floor(rnd() * n), coin = p => rnd() < (p == null ? 0.5 : p);
  const step = () => c.stepNow();
  switch (P.kind) {
    case 'spiel': {
      playSpiel(c, P, rnd);
      return;
    }
    case 'frage': case 'schaetzen': case 'quiz': case 'gast': {
      if (P.kind === 'gast' && P.mode === 'sort') { P.items.forEach((x, i) => A.ggSort({ i: String(i) })); if (coin(0.6)) { const o = step().pickOrder; o.reverse(); } A.stepResolve({ v: 'eval' }); return; }
      if (P.kind === 'gast' && P.mode === 'board') {
        if (!P.items.length || P.items.length > 6) fail('board size', { n: P.items.length });
        if (P.items.some((x, i) => i && x.n > P.items[i - 1].n)) fail('board not sorted by count');
        if (/\{[A-Za-z]+\}/.test(P.qtext) || /undefined/.test(P.text)) fail('board text broken', { t: P.text });
        let guard = 0;
        while (!c.gbClosed(step()) && guard++ < 20) {
          const S2 = step();
          if (coin(0.55)) { const i = S2.items.findIndex(x => !x.hit); A.gbHit({ i: String(i) }); }
          else A.gbMiss();
          if (coin(0.12)) break;
        }
        const S3 = step();
        if (S3.strikes > 3) fail('more than three strikes');
        if (S3.strikes >= 3) { const before = S3.items.filter(x => x.hit).length; const i = S3.items.findIndex(x => !x.hit); if (i >= 0) { A.gbHit({ i: String(i) }); if (step().items.filter(x => x.hit).length !== before) fail('hit after the board closed'); } }
        A.stepResolve({ v: 'eval' }); return;
      }
      if (P.kind === 'gast' && P.mode === 'judge') {
        if (P.items.some(x => !x.cue || x.cue === x.full)) fail('saying cue broken', { it: P.items });
        A.gjMark({ v: '1' }); if (step().hits.length) fail('marked before uncovering');
        for (let k = 0; k < P.items.length; k++) { A.gjOpen(); A.gjMark({ v: coin(0.65) ? '1' : '0' }); }
        A.stepResolve({ v: 'eval' }); return;
      }
      if (P.kind === 'gast' && P.mode === 'multi') {
        if (P.wenn) P.items.forEach(it => { const real = it.options[it.correct]; if (it.options.length !== 4 || it.correct < 0) fail('wenn options broken', { it }); if (it.options.filter(o => c.wordKey(o) === c.wordKey(real)).length !== 1) fail('wenn decoy equals the real answer', { it }); });
        if (P.gal) P.items.forEach(it => { if (!it.draw || it.correct < 0) fail('gallery item broken', { it }); }); P.items.forEach((it, k) => A.ggChoose({ k: String(k), i: String(coin(0.6) ? it.correct : pickI(it.options.length)) })); A.stepResolve({ v: 'eval' }); return; }
      if (P.kind === 'gast' && P.mode === 'leiter') {
        for (let k = 0; k < P.items.length; k++) {
          const it = step().items[step().at];
          if (it.type === 'auswahl') A.stepChoice({ i: String(coin(0.6) ? it.correct : pickI(it.options.length)) });
          else step().lv = String(coin(0.5) ? it.answer : Number(it.answer) * (1 + rnd()));
          A.ggLock(); A.ggNext();
        }
        A.stepResolve({ v: 'eval' }); return;
      }
      const q = c.questionOf(P);
      if (!q) fail('no question for ' + P.kind + '/' + P.mode);
      if (q.type === 'aufgabe') { A.stepResolve({ v: coin() ? 'ok' : 'fail' }); return; }
      if (q.type === 'auswahl') { A.stepChoice({ i: String(coin(0.5) ? q.correct : pickI(q.options.length)) }); A.stepResolve({ v: 'eval' }); return; }
      P.answerFocus = String(Math.round(Number(q.answer) * (0.6 + rnd() * 0.8)));
      if (coin(0.5)) P.group = String(Math.round(Number(q.answer) * (0.6 + rnd() * 0.8)));
      A.stepResolve({ v: 'eval' }); return;
    }
    case 'wwe': { const cands = c.wweCands(P); cands.forEach(id => { for (let k = pickI(4); k >= 0; k--) A.wweVote({ id, d: '1' }); }); A.stepResolve({ v: 'eval' }); return; }
    case 'partner': {
      A.partnerStart();
      let guard = 0;
      while (step().phase !== 'done' && guard++ < 30) {
        if (step().phase === 'between') A.partnerNext();
        if (coin(0.3)) A.partnerRaise();
        A.partnerShow(); A.partnerDone({ v: coin() ? 'ok' : 'fail' });
      }
      if (step().phase !== 'done') fail('partner never ends');
      return;
    }
    case 'menge': {
      P.hands = P.hands.map(() => [pickI(5), pickI(5) + (coin(0.2) ? 0 : 1)]);
      A.mengeClose();
      step().guesses = step().guesses.map(() => pickI(2));
      A.mengeReveal(); for (let k = 0; k < 4; k++) A.mengeNext();
      A.stepResolve({ v: 'eval' }); return;
    }
    case 'mission': {
      const holes = s => /\{[A-Za-z]+\}/.test(s);
      if (holes(P.text) || holes(P.title) || holes(P.win)) fail('mission with an open placeholder', { t: P.text });
      if (P.lvl > c.jgaMaxLvl(P.main)) fail('mission too wild for this person', { lvl: P.lvl, mut: c.jgaMut(P.main) });
      let Q = P;
      if (coin(0.1) && c.UI.screen === 'step') { A.runOther(); Q = step(); if (Q.kind !== 'mission' || Q.lvl > P.lvl) fail('another mission got wilder', { from: P.lvl, to: Q.lvl }); }
      const b = c.budget(Q.main), pause = c.needsPause(Q.main), atem = c.hcHas(Q.main, 'atem'), tausch = c.hcHas(Q.main, 'tausch');
      const v = rnd() < 0.5 ? 'ok' : rnd() < 0.5 ? 'fail' : 'refuse';
      A.stepResolve({ v });
      const res = step().result; if (!res) fail('mission without result');
      if (v === 'refuse') {
        const row = res.rows.find(x => x.pid === Q.main) || { n: 0 };
        const firm = b.C < b.M && !pause && !atem && !tausch && b.C < Math.min(b.M, Math.ceil(b.Tp) + 1);
        if (firm && row.n !== 1) fail('refusing did not cost a drink', { b, row });
        if ((b.C >= b.M || pause || atem || tausch) && row.n > 0) fail('refusing broke max, brake or a tempo card', { b, row });
      }
      if (v === 'ok' && res.rows.some(x => x.pid === Q.main && x.n > 0)) fail('mission done but a drink');
      return;
    }
    case 'crew': {
      if (/\{[A-Za-z]+\}/.test(P.text)) fail('crew job with an open placeholder', { t: P.text });
      if (!c.crewList().some(x => x.id === P.cid && x.role === P.role)) fail('crew job for someone without that role');
      A.stepResolve({ v: coin(0.7) ? 'ok' : 'fail' });
      return;
    }
    case 'glueck': A.stepResolve({ v: 'ok' }); return;
    case 'toast': A.stepResolve({ v: 'toast' }); return;
    case 'acc': A.stepResolve({ v: 'acc' }); return;
    case 'check': {
      const r = c.R(); c.UI.checkVals = {};
      r.tracks.forEach(t => { if (t.done) return; const est = c.zeitEst(t).p; c.UI.checkVals[t.id] = P.last || est > 0.95 ? 100 : Math.min(100, Math.round((est + (rnd() - 0.4) * 0.15) * 20) * 5); });
      A.stepResolve({ v: 'check' }); return;
    }
    case 'finale': A.stepResolve({ v: 'finale' }); return;
    case 'rolle': A.stepResolve({ v: 'rolle' }); return;
    case 'ehre': A.stepResolve({ v: 'ehre' }); return;
    case 'hellseher': A.stepChoice({ i: String(pickI(P.opts.length)) }); A.stepResolve({ v: 'eval' }); return;
    case 'roll': A.rollPick({ v: String(1 + pickI(6)) }); return;
    case 'handicap': {
      const pool = c.guestPool();
      const r0 = rnd();
      if (r0 < 0.4 && pool.length) A.hcGuest({ v: pool[pickI(pool.length)] });
      else if (r0 < 0.6 && pool.length >= 2) A.hcWheel();
      else if (r0 < 0.75) c.setBind('hc.guest', 'Onkel ' + pickI(9));
      c.render(); A.hcNext(); c.render();
      if (coin(0.15)) { A.hcBack(); c.render(); A.hcNext(); c.render(); }
      const cards = step().hc.cards; A.hcChoose({ v: cards[pickI(cards.length)] }); c.render();
      A.hcPicked(); c.render();
      A.stepResolve({ v: 'handicap' });
      return;
    }
    default:
      fail('unknown kind ' + P.kind);
  }
}

/* a game card, with the challenge and the special screens */
function playSpiel(c, P, rnd) {
  const A = c.A, pickI = n => Math.floor(rnd() * n), coin = p => rnd() < (p == null ? 0.5 : p), step = () => c.stepNow();
  const g = c.gameOf(P);
  if (P.ch && P.ch.phase !== 'play') {
    const pool = c.guestPool(), r0 = rnd();
    if (!pool.length) fail('picking an opponent without a guest list');
    if (r0 < 0.55 && pool.length) A.chGuest({ v: pool[pickI(pool.length)] });
    else if (r0 < 0.75 && pool.length >= 2) A.chWheel();
    else if (r0 < 0.88) c.setBind('ch.guest', ['Tante Rosi', 'Kalle', 'Nachbar Uwe', 'Sabine'][pickI(4)]);
    c.render(); A.chGo(); c.render();
    if (coin(0.15)) { A.chBack(); c.render(); A.chGo(); c.render(); }
    c.render();
    if (!step().ch.stake) fail('challenge without stake');
  }
  if (P.ch && P.ch.phase === 'play' && coin(0.3)) { A.chStakeNext(); c.render(); }
  const sp = g.sp;
  if (sp === 'lippen') { if (coin()) A.lipShow(); if (coin(0.3)) A.lipNew(); if (coin(0.4)) { const pool = c.guestPool(); if (pool.length) A.lipEars({ v: pool[0] }); } c.render(); }
  if (sp === 'gedanken') {
    if (coin(0.12)) { A.spManual(); c.render(); A.stepResolve({ v: coin() ? 'ok' : 'fail' }); return; }
    const pool = c.guestPool(), foc = c.E().focus.filter(p => p.id !== P.main);
    if (foc.length && coin(0.3)) A.glPartner({ v: foc[0].name }); else if (pool.length) A.glPartner({ v: pool[pickI(pool.length)] });
    A.glGo(); c.render();
    let guard = 0;
    while (step().gl.phase !== 'done' && guard++ < 30) {
      const gl = step().gl;
      if (gl.phase === 'a') A.glA({ i: String(pickI(4)) });
      else if (gl.phase === 'pass') A.glPass();
      else if (gl.phase === 'b') A.glB({ i: String(coin(0.45) ? gl.a[gl.at] : pickI(4)) });
      else if (gl.phase === 'reveal') A.glNext();
      c.render();
    }
    if (step().gl.phase !== 'done') fail('gedankenleser does not end');
    A.stepResolve({ v: 'eval' }); return;
  }
  if (sp === 'ketchup') {
    if (coin(0.1)) { A.spManual(); c.render(); if (P.format === 'duell') A.stepResolve({ v: 'win', id: coin() ? P.main : P.opp }); else A.stepResolve({ v: coin() ? 'ok' : 'fail' }); return; }
    const pool = c.guestPool();
    if (pool.length) A.kcMate({ v: pool[pickI(pool.length)] });
    pool.slice(0, 3).forEach(n => { if (coin()) A.kcRival({ v: n }); });
    c.render(); A.kcReady(); c.render();
    for (let t = 0; t < 2; t++) {
      A.kcGo(); c.render();
      for (let k = pickI(9); k > 0; k--) { if (coin(0.8)) A.kcHit(); else A.kcSkip(); }
      if (coin(0.5)) { c.advance(1.6); c.render(); }
      A.kcStop(); c.render();
    }
    if (step().kc.phase !== 'done') fail('ketchup does not end');
    A.stepResolve({ v: 'eval' }); return;
  }
  if (sp === 'blitz') {
    let guard = 0;
    while (!c.bzDone(step()) && guard++ < 12 && coin(0.92)) {
      A.bzStart(); c.render();
      const side = P.format === 'solo' ? 0 : pickI(2);
      if (coin(0.25)) c.bzTap(side);
      else { c.flushTimers(); c.__t += 180 + pickI(400); c.bzTap(side); }
      c.render();
    }
    c.flushTimers();
  }
  if (sp === 'loeffel') {
    let guard = 0;
    while (!c.lrDone(step()) && guard++ < 12 && coin(0.92)) {
      A.lrStart(); c.render();
      if (coin(0.3)) A.lrFoul({ v: String(pickI(2)) });
      else { c.UI.lr.state = 'grab'; c.render(); A.lrPoint({ v: String(pickI(2)) }); }
      c.render();
    }
    c.flushTimers();
  }
  const Q = step();
  if (Q.format === 'duell') A.stepResolve({ v: 'win', id: coin() ? Q.main : Q.opp });
  else A.stepResolve({ v: coin(0.55) ? 'ok' : 'fail' });
}
/* things a master may do on a result card */
function onResult(c, P, rnd, stats) {
  const A = c.A, coin = p => rnd() < (p == null ? 0.5 : p);
  /* no loss drink while a breather or a penalty swap runs */
  P.result.rows.forEach(row => { if (row.pid && row.n > 0 && P.kind !== 'toast' && (c.hcHas(row.pid, 'atem') || c.hcHas(row.pid, 'tausch'))) fail('drink despite tempo card', { kind: P.kind }); });
  if (c.canRevanche(P) && coin(0.6)) {
    const pid = P.main;
    A.chRevanche();
    const Q = c.stepNow();
    if (!Q || Q.result || !Q.revanche || !c.R().rev[pid]) fail('revanche did not reset the card');
    stats.kinds.revanche = (stats.kinds.revanche || 0) + 1;
    c.render();
    playSpiel(c, Q, rnd);
    c.render();
    const Z = c.stepNow();
    if (!Z.result) fail('revanche without result');
    if (c.canRevanche(Z)) fail('second revanche possible');
    return Z;
  }
  const rel = c.hcReleaseHtml(P);
  if (rel && coin(0.7)) { const m = /data-i="(\d+)"/.exec(rel); A.hcRelease({ i: m[1] }); stats.kinds.hcRelease = (stats.kinds.hcRelease || 0) + 1; c.render(); }
  return P;
}
/* one game in free play, outside the Kranz */
function playFree(c, rnd, stats) {
  const A = c.A, kinds = ['spiel', 'spiel', 'spiel', 'wwe', 'schaetzen', 'quiz', 'menge', 'partner', 'gast'].concat(c.isJga() ? ['mission', 'mission', 'mission'] : []);
  const k = kinds[Math.floor(rnd() * kinds.length)];
  c.go('home');
  const before = c.S.drinks.length;
  A.freeQuick({ v: k });
  if (c.UI.screen !== 'free') return;
  const P = c.S.free.step;
  stats.kinds['free:' + P.kind] = (stats.kinds['free:' + P.kind] || 0) + 1;
  c.render();
  if (rnd() < 0.1) { A.freeOther(); c.render(); }
  const Q = c.S.free.step;
  resolveStep(c, Q, rnd);
  c.render();
  const Z = c.S.free && c.S.free.step;
  if (Z && Z.result) { c.render(); A.stepContinue(); }
  else if (c.S.free) A.freeCancel();
  const per = {};
  c.S.drinks.slice(before).forEach(d => { per[d.pid] = (per[d.pid] || 0) + d.n; if (!c.isFocus(d.pid)) fail('a guest was counted in free play'); });
  Object.keys(per).forEach(pid => { if (per[pid] > 1) fail('more than one drink in a free game', { kind: P.kind }); });
}
function playRun(c, cfg, rnd, stats) {
  const A = c.A;
  const coin = p => rnd() < (p == null ? 0.5 : p);
  c.A.openRun();
  const rc = c.cfgDefaults();
  rc.variant = cfg.variant; if (cfg.together) rc.together = cfg.together;
  if (cfg.minutes) rc.minutes = cfg.minutes;
  if (cfg.shared) rc.shared = cfg.shared;
  if (cfg.rounds) rc.rounds = cfg.rounds;
  if (cfg.fields) rc.fields = cfg.fields;
  if (cfg.meters) rc.meters = cfg.meters;
  if (cfg.dice) rc.dice = cfg.dice;
  if (cfg.who) c.E().focus.forEach(p => { rc.who[p.id] = cfg.who.indexOf(p.name) >= 0; });
  if (c.isJga()) rc.jgaMode = rnd() < 0.7 ? 'stadt' : 'drinnen';
  A.startRun();
  const r0 = c.R(); if (!r0) fail('run did not start');
  const M = c.E().max;
  let guard = 0, kinds = {};
  while (c.R() && !c.R().finished) {
    if (guard++ > 900) fail('run does not end', { pos: c.runPosText(c.R()), steps: c.R().steps });
    const r = c.R();
    if (!r.pending && coin(0.03)) { const live = (r.hc || []).map((h, i) => [h, i]).filter(x => c.hcLive(x[0])); if (live.length) { A.hcEnd({ i: String(live[0][1]) }); stats.kinds.hcEnd = (stats.kinds.hcEnd || 0) + 1; } }
    if (!r.pending && coin(0.01) && r.hist && r.hist.some(h => h.kind === 'task')) {
      const idx = []; r.hist.forEach((h, i) => { if (h.kind === 'task') idx.push(i); });
      A.openRewind(); c.render(); A.rewindPick({ i: String(idx[Math.floor(rnd() * idx.length)]) }); c.render(); A.rewindDo();
      stats.kinds.rewind = (stats.kinds.rewind || 0) + 1;
      continue;
    }
    if (!c.R().pending && coin(0.03)) { playFree(c, rnd, stats); c.go('run'); continue; }
    if (!c.R().pending) A.runNext();
    const P = c.R().pending;
    if (!P) fail('no pending after runNext');
    kinds[P.kind] = (kinds[P.kind] || 0) + 1;
    if (P.kind === 'mission') { kinds['lvl' + P.lvl + ':mut' + c.jgaMut(P.main)] = (kinds['lvl' + P.lvl + ':mut' + c.jgaMut(P.main)] || 0) + 1; if (!(c.R().kinds || []).slice(0, -1).some(k => k === 'mission') && P.lvl !== 1) fail('first mission not harmless'); }
    /* pickers and the wheel only know people who are there tonight */
    { const here = c.crewNames().concat(c.E().here || [], Object.keys(c.R().duel || {}).map(k => c.R().duel[k].name)).map(n => n.toLowerCase()); c.guestPool().forEach(n => { if (here.indexOf(n.toLowerCase()) < 0) fail('picker shows someone who is not there', { n }); }); }
    if (P.kind === 'spiel' && c.gameOf(P).sp) kinds['sp:' + c.gameOf(P).sp] = (kinds['sp:' + c.gameOf(P).sp] || 0) + 1;
    if (P.kind === 'gast') kinds['gg:' + P.gg] = (kinds['gg:' + P.gg] || 0) + 1;
    if (P.kind === 'spiel') kinds['fmt:' + P.format] = (kinds['fmt:' + P.format] || 0) + 1, kinds['g:' + P.game] = (kinds['g:' + P.game] || 0) + 1;
    /* render the open card, like the screen would */
    c.render();
    const before = c.S.drinks.length;
    if (opt(c, 'undo') && coin(0.03) && c.R().hist && c.R().hist.length) { A.runUndo(); continue; }
    resolveStep(c, P, rnd);
    c.render();
    let now = c.stepNow ? c.stepNow() : c.R().pending;
    if (now && now.result) {
      now = onResult(c, now, rnd, stats);
      now.result.rows.forEach((row, i) => { if (row.pid && row.n > 0 && coin(0.04) && c.jokersLeft(row.pid) > 0 && c.isFocus(row.pid)) A.stepJoker({ i: String(i) }); });
      /* now and then a guest gives a Joker */
      now.result.rows.forEach((row, i) => {
        const free = c.jokerFree();
        if (!free.length || !c.jokerRowOk(row) || !coin(0.25)) return;
        const pid = row.pid, cr = (c.S.jokerCredit || {})[pid] || 0, n = row.n, q = free[0];
        A.jkAsk({ i: String(i) }); A.jkUse({ i: String(i), id: q.id });
        if (row.n !== 0 || !row.freed || !q.used) fail('joker did not free the row', { row });
        if (((c.S.jokerCredit || {})[pid] || 0) !== cr + n) fail('joker credit wrong');
        stats.kinds.joker = (stats.kinds.joker || 0) + 1;
      });
      c.render();
      A.stepContinue();
    }
    /* per step: at most one drink per person */
    const added = c.S.drinks.slice(before), per = {};
    added.forEach(d => { per[d.pid] = (per[d.pid] || 0) + d.n; });
    Object.keys(per).forEach(pid => { if (per[pid] > 1) fail('more than one drink in one step', { pid, kind: P.kind }); });
    added.forEach(d => { if (!c.isFocus(d.pid)) fail('a guest was counted', d); });
    c.E().focus.forEach(p => { if (c.drinksOf(p.id) > M) fail('maximum exceeded', { who: p.name, n: c.drinksOf(p.id), M }); });
    /* the clock: tasks take a few minutes, small moments less */
    const small = ['toast', 'acc', 'rolle', 'ehre', 'hellseher', 'roll', 'handicap'].indexOf(P.kind) >= 0;
    c.advance(small ? 0.3 + rnd() * 0.5 : (cfg.pace || 2.6) * (0.6 + rnd() * 0.8));
    if (c.UI.screen === 'step' && c.R() && !c.R().pending) c.go('run');
  }
  /* tempo brake over the whole evening: never more than 2 in 4 minutes, at most 2 quick doubles */
  c.E().focus.forEach(p => {
    const ts = c.drinkTimes(p.id);
    for (let i = 0; i < ts.length; i++) { const n = ts.filter(t => t > ts[i] - c.HARD_MIN * 60000 && t <= ts[i]).length; if (n > c.HARD_MAX) fail('tempo brake broken', { who: p.name }); }
    if (c.doublesSoFar(ts) > c.DOUBLES_OK) fail('more than two quick doubles', { who: p.name, d: c.doublesSoFar(ts) });
  });
  const r = c.R();
  const st = r.roles || { who: {} };
  /* the closing credits render, duel roles make sense */
  c.go('finish'); c.render();
  c.duelRoles(r).forEach(x => { if (!r.duel || !Object.keys(r.duel).some(k => r.duel[k].name === x.name)) fail('duel role for unknown guest'); });
  Object.keys(r.duel || {}).forEach(k => { const d = r.duel[k]; if (d.n !== d.gw + d.fw) fail('duel stats broken'); });
  stats.kinds.duelGuests = (stats.kinds.duelGuests || 0) + Object.keys(r.duel || {}).length;
  (r.hc || []).forEach(h => { stats.kinds['hc:' + h.id] = (stats.kinds['hc:' + h.id] || 0) + 1; });
  if (Object.keys(st.who).length > c.ROLE_MAX) fail('too many roles');
  if (r.log.filter(l => /^Hellseher /.test(l.text)).length > 1) fail('hellseher twice');
  stats.runs++;
  c.E().focus.forEach(p => { if (r.who.indexOf(p.id) >= 0) { stats.drinks += c.drinksOf(p.id); stats.max += M; stats.people++; } });
  Object.keys(kinds).forEach(k => { stats.kinds[k] = (stats.kinds[k] || 0) + kinds[k]; });
  stats.minutes += c.elapsedMin();
  return r;
}
function opt(c, k) { return !c.__noUndo; }

const CONFIGS = [
  { variant: 'socke', together: 'gemeinsam', shared: 25 },
  { variant: 'socke', together: 'gegeneinander' },
  { variant: 'socke', together: 'gemeinsam', shared: 12, who: ['Jonas'] },
  { variant: 'meter', together: 'gemeinsam', meters: 10 },
  { variant: 'wuerfel', together: 'gemeinsam', dice: 'app' },
  { variant: 'wuerfel', together: 'gegeneinander', dice: 'echt' },
  { variant: 'socke', together: 'gemeinsam', shared: 40, minutes: 120 }
];
const FREI = [{ variant: 'runden', rounds: 12 }, { variant: 'wuerfel', fields: 30 }, { variant: 'abend', minutes: 90 }];
const ZEIT = [{ variant: 'zeit', minutes: 60 }, { variant: 'zeit', minutes: 45, together: 'gegeneinander' }];

function setupParty(c, anlass, rnd) {
  c.A.loadDemo();
  const e = c.E();
  if (anlass && anlass !== 'socken') { c.A.setEventAnlass({ v: anlass }); }
  /* random material, sometimes everything */
  if (rnd() < 0.3) c.A.matPreset({ v: 'all' }); else if (rnd() < 0.3) c.A.matPreset({ v: 'party' });
  e.max = 6 + Math.floor(rnd() * 8);
  e.target = 50 + Math.floor(rnd() * 8) * 5;
  /* sometimes only one birthday person */
  if (rnd() < 0.25) e.focus = e.focus.slice(0, 1);
  /* sometimes the guests sent nothing */
  if (rnd() < 0.15) c.S.questions = [];
  /* who is there tonight: a JGA always has its crew, other parties sometimes a list */
  const names = ['Kalle', 'Sabine', 'Tante Rosi', 'Nachbar Uwe', 'Lea', 'Max', 'Jule', 'Ben', 'Ole'];
  if (c.isJga() || rnd() < 0.3) {
    const n = c.isJga() ? 2 + Math.floor(rnd() * 7) : Math.floor(rnd() * 5);
    for (let k = 0; k < n; k++) { c.UI.crewName = names[k]; c.A.crewAdd(); }
    if (c.isJga()) { if (rnd() < 0.7) c.A.crewDeal(); else c.crewList().forEach((x, i) => { if (rnd() < 0.5) c.A.crewRole({ id: x.id, v: c.JGA_ROLES[(i * 3) % c.JGA_ROLES.length].id }); }); }
  }
  if (c.isJga()) {
    e.focus.forEach(p => { p.mut = 1 + Math.floor(rnd() * 3); if (rnd() < 0.2) p.partner = ''; });
    c.JGA_PACK.forEach(p => { if (rnd() < 0.5) c.A.packToggle({ v: p[0] }); });
  }
}

function main() {
  const N = +(process.argv[2] || 60), seed0 = +(process.argv[3] || 1);
  const stats = { runs: 0, drinks: 0, max: 0, people: 0, kinds: {}, minutes: 0 };
  let errors = 0;
  for (let k = 0; k < N; k++) {
    const seed = seed0 + k, rnd = seeded(seed * 31 + 5);
    const c = load({ seed });
    if (process.env.SIM_HOOKS) require(process.env.SIM_HOOKS)(c);
    const fam = process.env.SIM_JGA ? 'frei' : k % 3 === 0 ? 'zeit' : k % 3 === 1 ? 'frei' : 'kranz';
    const anlass = fam === 'zeit' ? (rnd() < 0.5 ? 'treppe' : 'klinke') : fam === 'frei' ? (process.env.SIM_JGA ? 'jga' : ['geburtstag', 'hochzeit', 'jga', 'party'][Math.floor(rnd() * 4)]) : (rnd() < 0.5 ? 'socken' : 'schachtel');
    const list = fam === 'zeit' ? ZEIT : fam === 'frei' ? FREI : CONFIGS;
    const cfg = list[Math.floor(rnd() * list.length)];
    try {
      setupParty(c, anlass, rnd);
      for (let f = Math.floor(rnd() * 3); f > 0; f--) playFree(c, rnd, stats);
      playRun(c, cfg, rnd, stats);
    } catch (e) {
      errors++;
      console.log('ERROR seed', seed, anlass, JSON.stringify(cfg), '->', e.message, e.info ? JSON.stringify(e.info) : '');
      if (errors < 3 && !e.info) console.log(e.stack.split('\n').slice(0, 6).join('\n'));
    }
  }
  console.log('runs', stats.runs, 'errors', errors, '| avg share of max', (stats.drinks / Math.max(1, stats.max)).toFixed(2), '| avg minutes', (stats.minutes / Math.max(1, stats.runs)).toFixed(0));
  const ks = Object.keys(stats.kinds).filter(k => !/^g:/.test(k)).sort().map(k => k + ' ' + stats.kinds[k]).join(', ');
  console.log('kinds:', ks);
  if (process.env.SIM_GAMES) console.log('games:', Object.keys(stats.kinds).filter(k => /^g:/.test(k)).length);
  if (errors) process.exitCode = 1;
}
if (require.main === module) main();
module.exports = { playRun, resolveStep, setupParty };
