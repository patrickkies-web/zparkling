/* Measures the rhythm of simulated evenings: how often a minigame with material follows another one
   (without sharing its material), how the kinds alternate. node harness/rhythm.js [runs] */
'use strict';
const { load, seeded } = require('./run');
const { playRun, setupParty } = require('./sim');
const CONFIGS = [{ variant: 'stueck', together: 'gemeinsam' }, { variant: 'runden', together: 'gemeinsam' }, { variant: 'wuerfel', together: 'nacheinander' }];
const TASKS = ['spiel', 'mission', 'gast', 'frage', 'schaetzen', 'quiz', 'wwe', 'menge', 'partner', 'glueck'];
function bucketOf(c, P) {
  if (P.kind === 'spiel') { const g = c.gameById(P.game); return (g.needs || []).length || ['Geschick', 'Action', 'Reaktion', 'Kranz'].indexOf(g.cat) >= 0 ? 'tun' : g.cat === 'Party' ? 'zeigen' : 'reden'; }
  if (P.kind === 'mission') return 'tun';
  if (P.kind === 'wwe' || P.kind === 'partner') return 'miteinander';
  return 'denken';
}
function main() {
  const N = +(process.argv[2] || 40), seed0 = +(process.argv[3] || 1);
  let pairs = 0, clash = 0, matAfterMat = 0, matGames = 0, tasks = 0, runs3 = 0, maxRun = 0, matGap1 = 0, reuse = 0, byB = {};
  for (let k = 0; k < N; k++) {
    const seed = seed0 + k, rnd = seeded(seed * 31 + 5), c = load({ seed });
    const fam = k % 3 === 0 ? 'zeit' : k % 3 === 1 ? 'frei' : 'kranz';
    const anlass = fam === 'zeit' ? (rnd() < 0.5 ? 'treppe' : 'klinke') : fam === 'frei' ? ['geburtstag', 'hochzeit', 'jga', 'party'][Math.floor(rnd() * 4)] : (rnd() < 0.5 ? 'socken' : 'schachtel');
    const cfg = fam === 'zeit' ? { variant: 'zeit', together: 'gemeinsam' } : fam === 'frei' ? { variant: 'runden', together: 'gemeinsam' } : CONFIGS[Math.floor(rnd() * CONFIGS.length)];
    const seq = [], orig = c.nextStep;
    c.nextStep = function () { const s = orig.apply(this, arguments); if (s && TASKS.indexOf(s.kind) >= 0) seq.push(s); return s; };
    try { setupParty(c, anlass, rnd); playRun(c, cfg, rnd, { kinds: {}, runs: 0, drinks: 0, max: 0, people: 0, minutes: 0 }); } catch (e) { console.log('ERROR', seed, e.message); continue; }
    let run = 1, prevB = '', lastMat = null, lastMatAt = -9;
    seq.forEach((P, i) => {
      const b = bucketOf(c, P), mats = P.kind === 'spiel' ? (c.gameById(P.game).needs || []) : [];
      tasks++; byB[b] = (byB[b] || 0) + 1;
      if (i) { pairs++; if (b === prevB) { run++; } else { run = 1; } if (run === 3) runs3++; maxRun = Math.max(maxRun, run); }
      if (mats.length) {
        matGames++;
        if (lastMat) { const d = i - lastMatAt, share = mats.some(x => lastMat.indexOf(x) >= 0); if (d === 1) { matAfterMat++; if (!share) clash++; else reuse++; } else if (d === 2 && !share) matGap1++; }
        lastMat = mats; lastMatAt = i;
      }
      prevB = b;
    });
  }
  console.log('tasks', tasks, '| material games', matGames, '(' + (100 * matGames / tasks).toFixed(0) + '%)', '| material right after material', matAfterMat, 'of which new stuff', clash, 'same stuff', reuse, '| new stuff with one task between', matGap1);
  console.log('three of a kind in a row', runs3, '| longest run', maxRun, '| buckets', JSON.stringify(byB));
}
main();
