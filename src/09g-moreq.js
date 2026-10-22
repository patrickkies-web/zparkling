/* =========================================================
   Three more things a guest can send, each a few seconds, each good
   for whole rounds that exist only at this party:
   - Entweder oder: three taps about the main person. The app counts
     what the guests think, and the main person guesses the majority.
   - Eine Zahl über dich: one question, one number, the same question
     for everyone. Who has the most, the order, the sum.
   - Geständnis: something the main person does not know yet about the
     guest. At the party: who confessed what?
   The form, the master's list and the rounds all hook in here.
   ========================================================= */
var GQ_MORE = { entweder: 1, zahl: 1, geheim: 1 };
QTYPES.splice(1, 0, ['entweder', 'Entweder oder', 'Drei schnelle Tipps über die Person, ein Fingertipp pro Frage. Daraus wird: Was denkt die Mehrheit?', 'kurz']);
QTYPES.splice(QTYPES.map(function (t) { return t[0]; }).indexOf('steckbrief') + 1, 0, ['zahl', 'Eine Zahl über dich', 'Eine Frage, eine Zahl. Mit den Zahlen aller Gäste baut die App Spiele.', 'ich']);
QTYPES.splice(QTYPES.map(function (t) { return t[0]; }).indexOf('wer') + 1, 0, ['geheim', 'Geständnis', 'Etwas, das die Person noch nicht über dich weiß. Im Spiel wird geraten, wer es gestanden hat.', 'ich']);
GQ_VERB.entweder = ['Du tippst', 'Entweder oder']; GQ_VERB.zahl = ['Du nennst', 'eine Zahl']; GQ_VERB.geheim = ['Du legst', 'ein Geständnis ab'];
QK_SHORT.entweder = 'Entweder oder'; QK_SHORT.zahl = 'Zahl'; QK_SHORT.geheim = 'Geständnis';
GQ_STYLE.entweder = { c: '#B6F07C', e: 'vote', stamp: 'Abgestimmt' };
GQ_STYLE.zahl = { c: '#5B8CFF', e: 'coin', stamp: 'Gezählt' };
GQ_STYLE.geheim = { c: '#D9A6FF', e: 'lock', stamp: 'Gebeichtet' };
GQ_REACT.add_entweder = ['Entweder oder? Das geht schnell. Und ich zähle mit!', 'Drei Fingertipps über mich. Sei ehrlich.'];
GQ_REACT.done_entweder = ['Notiert. Mal sehen, ob ich mich selbst kenne!', 'Interessant, was du so denkst…'];
GQ_REACT.add_zahl = ['Eine Zahl über dich? Jetzt wird gezählt.', 'Nur eine Zahl. Aber eine ehrliche!'];
GQ_REACT.done_zahl = ['Gezählt! Daraus bauen wir heute Abend was.', 'Notiert. Ob das die meisten sind?'];
GQ_REACT.add_geheim = ['Ein Geständnis?! Oh, jetzt wird’s spannend.', 'Du willst mir was beichten? Ich hör zu.'];
GQ_REACT.done_geheim = ['Versiegelt. Ich platze vor Neugier!', 'Das wusste ich wirklich nicht. Danke dafür!'];
GQ_MOOD.add_entweder = 'denken'; GQ_MOOD.done_entweder = 'cool'; GQ_MOOD.add_zahl = 'staunen'; GQ_MOOD.done_zahl = 'jubel'; GQ_MOOD.add_geheim = 'misstrauisch'; GQ_MOOD.done_geheim = 'staunen';
G_STICKERS.push(['beichte', 'lock', 'Beichtkind', function (s) { return !!s.t.geheim; }], ['zaehler', 'coin', 'Erbsenzähler', function (s) { return !!s.t.zahl; }]);

/* ---------- Entweder oder: the pairs, three per guest, the same three until each has enough answers ---------- */
var ENT_PAIRS = [
  ['frueh', 'Frühaufsteher', 'Nachteule'], ['kaffee', 'Kaffee', 'Tee'], ['strand', 'Strand', 'Berge'], ['hund', 'Hund', 'Katze'],
  ['suess', 'Süß', 'Salzig'], ['plan', 'Alles geplant', 'Alles spontan'], ['tanz', 'Tanzfläche', 'Theke'], ['sommer', 'Sommer', 'Winter'],
  ['kochen', 'Kocht selbst', 'Bestellt lieber'], ['karaoke', 'Greift zum Mikro', 'Hält das Mikro fern'], ['kino', 'Kino', 'Serie auf dem Sofa'], ['ordnung', 'Ordnungsfan', 'Kreatives Chaos'],
  ['handy', 'Handy immer dabei', 'Handy oft vergessen'], ['sport', 'Sportskanone', 'Sofa-Profi'], ['pizza', 'Pizza', 'Pasta'], ['stadt', 'Stadt', 'Land'],
  ['zeit', 'Immer pünktlich', 'Immer fünf Minuten zu spät'], ['reise', 'Hotel mit Pool', 'Rucksack und Zelt'], ['bier', 'Bier', 'Wein'], ['dusche', 'Singt unter der Dusche', 'Schweigt unter der Dusche'],
  ['navi', 'Fragt nach dem Weg', 'Findet es allein'], ['feier', 'Große Party', 'Kleiner Kreis'], ['lotto', 'Lottogewinn: Weltreise', 'Lottogewinn: Haus'], ['fruehstueck', 'Frühstück ausgiebig', 'Frühstück im Gehen']
];
var ENT_NEED = 3;
/* pairs that are no longer asked; answers already given stay readable */
var ENT_OUT = [];
function entPair(id) { return ENT_PAIRS.filter(function (p) { return p[0] === id; })[0] || null; }
/* how many guests answered which pair about this person (the form counts what is not sent yet too) */
function entCounts(forId, pend) {
  var c = {};
  okGuest('entweder', pend).forEach(function (q) { if (!aboutMain(q, forId || '')) return; (q.ans || []).forEach(function (a) { c[a.k] = (c[a.k] || 0) + 1; }); });
  (gForm().items || []).forEach(function (it) { if (it.type === 'entweder' && (!forId || !it.forId || it.forId === forId)) Object.keys(it.ans || {}).forEach(function (k) { c[k] = (c[k] || 0) + 1; }); });
  return c;
}
/* the three pairs for a new card: the ones with the fewest answers so far, in a fixed order, so answers pile up on the same questions */
function entPick(forId) {
  var c = entCounts(forId, true), seed = strHash('ent:' + (S.collectCode || '') + ':' + (forId || ''));
  var order = ENT_PAIRS.filter(function (p) { return ENT_OUT.indexOf(p[0]) < 0; }).map(function (p, i) { return { id: p[0], n: c[p[0]] || 0, r: (i * 7919 + seed) % 97 }; });
  order.sort(function (a, b) { return (a.n >= ENT_NEED) - (b.n >= ENT_NEED) || b.n - a.n || a.r - b.r; });
  /* pairs still filling up first (most answers first, so they finish), then fresh ones */
  var open = order.filter(function (x) { return x.n < ENT_NEED; }), full = order.filter(function (x) { return x.n >= ENT_NEED; });
  var seq = open.concat(full).map(function (x) { return x.id; });
  return seq.slice(0, 3);
}

/* ---------- Eine Zahl über dich: one question for everyone, the next when it has enough answers ---------- */
var ZAHL_QS = [
  { id: 'laender', all: 'Wie viele Länder haben die Gäste schon bereist?', q: 'Wie viele Länder hast du schon bereist?', unit: 'Länder', most: 'Wer von diesen Gästen hat die meisten Länder bereist?', sort: 'Zuerst, wer die meisten Länder bereist hat', sum: '{N} zusammen: Wie viele Länder haben sie bereist?', line: '{A}: {V} Länder' },
  { id: 'umzuege', all: 'Wie oft sind die Gäste in ihrem Leben umgezogen?', q: 'Wie oft bist du in deinem Leben schon umgezogen?', unit: 'Umzüge', most: 'Wer von diesen Gästen ist am öftesten umgezogen?', sort: 'Zuerst, wer am öftesten umgezogen ist', sum: '{N} zusammen: Wie oft sind sie umgezogen?', line: '{A}: {V} Umzüge' },
  { id: 'schuhe', all: 'Wie viele Paar Schuhe stehen bei den Gästen zu Hause?', q: 'Wie viele Paar Schuhe stehen bei dir zu Hause?', unit: 'Paar', most: 'Wer von diesen Gästen hat die meisten Paar Schuhe?', sort: 'Zuerst, wer die meisten Paar Schuhe hat', sum: '{N} zusammen: Wie viele Paar Schuhe sind das?', line: '{A}: {V} Paar' },
  { id: 'pflanzen', all: 'Wie viele Pflanzen leben bei den Gästen zu Hause?', q: 'Wie viele Pflanzen leben in deiner Wohnung?', unit: 'Pflanzen', most: 'Wer von diesen Gästen hat die meisten Pflanzen zu Hause?', sort: 'Zuerst, wer die meisten Pflanzen hat', sum: '{N} zusammen: Wie viele Pflanzen haben sie zu Hause?', line: '{A}: {V} Pflanzen' },
  { id: 'konzerte', all: 'Auf wie vielen Konzerten waren die Gäste schon?', q: 'Auf wie vielen Konzerten warst du schon?', unit: 'Konzerte', most: 'Wer von diesen Gästen war auf den meisten Konzerten?', sort: 'Zuerst, wer auf den meisten Konzerten war', sum: '{N} zusammen: Auf wie vielen Konzerten waren sie?', line: '{A}: {V} Konzerte' },
  { id: 'kaffee', all: 'Wie viel Kaffee trinken die Gäste an einem normalen Tag?', q: 'Wie viele Tassen Kaffee trinkst du an einem normalen Tag?', unit: 'Tassen', most: 'Wer von diesen Gästen trinkt am meisten Kaffee am Tag?', sort: 'Zuerst, wer am meisten Kaffee trinkt', sum: '{N} zusammen: Wie viele Tassen Kaffee am Tag?', line: '{A}: {V} Tassen' },
  { id: 'apps', all: 'Wie viele Apps haben die Gäste auf dem Handy?', q: 'Wie viele Apps sind auf deinem Handy?', unit: 'Apps', most: 'Wer von diesen Gästen hat die meisten Apps auf dem Handy?', sort: 'Zuerst, wer die meisten Apps hat', sum: '{N} zusammen: Wie viele Apps sind auf ihren Handys?', line: '{A}: {V} Apps' },
  { id: 'schlaf', all: 'Wie lange haben die Gäste letzte Nacht geschlafen?', q: 'Wie viele Stunden hast du letzte Nacht geschlafen?', unit: 'Stunden', most: 'Wer von diesen Gästen hat letzte Nacht am längsten geschlafen?', sort: 'Zuerst, wer am längsten geschlafen hat', sum: '{N} zusammen: Wie viele Stunden Schlaf letzte Nacht?', line: '{A}: {V} Stunden' },
  { id: 'cousins', all: 'Wie viele Cousins und Cousinen haben die Gäste?', q: 'Wie viele Cousins und Cousinen hast du?', unit: 'Cousins', most: 'Wer von diesen Gästen hat die meisten Cousins und Cousinen?', sort: 'Zuerst, wer die meisten Cousins und Cousinen hat', sum: '{N} zusammen: Wie viele Cousins und Cousinen sind das?', line: '{A}: {V} Cousins und Cousinen' },
  { id: 'fotos', all: 'Wie viele Fotos haben die Gäste auf dem Handy?', q: 'Wie viele Fotos sind auf deinem Handy, grob?', unit: 'Fotos', most: 'Wer von diesen Gästen hat die meisten Fotos auf dem Handy?', sort: 'Zuerst, wer die meisten Fotos hat', sum: '{N} zusammen: Wie viele Fotos sind auf ihren Handys?', line: '{A}: {V} Fotos' }
];
var ZAHL_NEED = 3;
function zahlQ(id) { return ZAHL_QS.filter(function (z) { return z.id === id; })[0] || null; }
function zahlCounts(pend) {
  var c = {};
  okGuest('zahl', pend).forEach(function (q) { c[q.qk] = (c[q.qk] || 0) + 1; });
  (gForm().items || []).forEach(function (it) { if (it.type === 'zahl' && it.qk) c[it.qk] = (c[it.qk] || 0) + 1; });
  return c;
}
/* the question for a new card: the one everybody answers until it has four answers, then the next */
function zahlPick() {
  var c = zahlCounts(true), seed = strHash('zahl:' + (S.collectCode || '')), order = ZAHL_QS.map(function (z, i) { return { id: z.id, n: c[z.id] || 0, r: (i * 7919 + seed) % 97 }; });
  var open = order.filter(function (x) { return x.n < ZAHL_NEED + 1; }).sort(function (a, b) { return b.n - a.n || a.r - b.r; });
  if (open.length) return open[0].id;
  order.sort(function (a, b) { return a.n - b.n || a.r - b.r; });
  return order[0].id;
}

/* ---------- the form ---------- */
function gAddMore(it, t) {
  if (t === 'entweder') { it.pairs = entPick(it.forId || ''); it.ans = {}; }
  if (t === 'zahl') { it.qk = zahlPick(); it.answer = ''; }
}
function gMissingMore(it, m) {
  if (it.type === 'entweder') { var open = (it.pairs || []).filter(function (k) { return !(it.ans && (it.ans[k] === 0 || it.ans[k] === 1)); }).length; if (open) m.push(open === 1 ? 'noch ein Fingertipp' : 'noch ' + open + ' Fingertipps'); if (E() && E().focus.length > 1 && !it.forId) m.push('über wen'); }
  if (it.type === 'zahl') { var v = Number(String(it.answer || '').replace(',', '.')); if (it.answer === '' || it.answer == null || isNaN(v) || v < 0 || v > 99999) m.push('eine Zahl'); }
  if (it.type === 'geheim') { var t = String(it.text || '').trim(); if (t.length < 8) m.push(t ? 'noch ' + (8 - t.length) + ' Zeichen' : 'dein Geständnis'); }
}
function draftMore(d, q) {
  if (d.type === 'entweder') {
    var ans = (d.pairs || []).map(function (k) { return { k: k, v: d.ans && d.ans[k] === 1 ? 1 : 0, ok: !!(d.ans && (d.ans[k] === 0 || d.ans[k] === 1)) }; });
    if (!ans.length || ans.some(function (a) { return !a.ok || !entPair(a.k); })) return 'Tipp bei allen drei Fragen eine Seite an.';
    if (E() && E().focus.length > 1 && !d.forId) return 'Wähl aus, über wen die Tipps sind.';
    q.ans = ans.map(function (a) { return { k: a.k, v: a.v }; }); q.text = 'Entweder oder'; return '';
  }
  if (d.type === 'zahl') {
    var z = zahlQ(d.qk), v = Number(String(d.answer == null ? '' : d.answer).replace(',', '.'));
    if (!z) return 'Die Frage fehlt, tipp die Zahl noch mal an.';
    if (d.answer === '' || isNaN(v) || v < 0 || v > 99999) return 'Gib eine Zahl an.';
    q.qk = z.id; q.answer = Math.round(v); q.unit = z.unit; q.text = z.q; q.forId = ''; return '';
  }
  if (d.type === 'geheim') {
    var t = String(d.text || '').trim();
    if (t.length < 8) return 'Erzähl ein bisschen mehr, damit man raten kann.';
    q.text = t.slice(0, 160); return '';
  }
  return '';
}
function gFieldsMore(it, i, b, s, W) {
  if (it.type === 'entweder') {
    var pairs = (it.pairs || []).map(entPair).filter(Boolean);
    if (!pairs.length) { it.pairs = entPick(it.forId || ''); pairs = it.pairs.map(entPair).filter(Boolean); }
    return '<p class="small mt10">Drei Fragen über ' + esc(W) + '. Einfach tippen, was eher passt.</p><div class="stack gap8 mt10">' + pairs.map(function (p) {
      var v = it.ans && (it.ans[p[0]] === 0 || it.ans[p[0]] === 1) ? it.ans[p[0]] : -1;
      return '<div class="gent" role="group" aria-label="' + esc(p[1] + ' oder ' + p[2]) + '">' + [1, 2].map(function (j) {
        var on = v === j - 1;
        return '<button type="button" class="gent-b' + (on ? ' on' : v >= 0 ? ' off' : '') + '" data-act="gPair" data-k="' + i + '" data-p="' + p[0] + '" data-v="' + (j - 1) + '" aria-pressed="' + on + '">' + esc(p[j]) + '</button>';
      }).join('<span class="gent-or" aria-hidden="true">oder</span>') + '</div>';
    }).join('') + '</div>';
  }
  if (it.type === 'zahl') {
    var z = zahlQ(it.qk) || ZAHL_QS[0]; if (!it.qk) it.qk = z.id;
    return gField(esc(z.q), 'qZahl' + s, b + 'answer', it.answer == null ? '' : it.answer, z.unit, 'big') + '<p class="small mt8">Grob reicht. Alle Gäste bekommen dieselbe Frage, aus den Antworten wird ein Spiel.</p>';
  }
  if (it.type === 'geheim') {
    return '<label class="field mt10 gveilbox" for="qGeh' + s + '">Etwas, das ' + esc(W) + ' noch nicht über dich weiß<textarea id="qGeh' + s + '" class="input area gletter" data-bind="' + b + 'text" enterkeyhint="done" placeholder="z. B. Ich habe heimlich alle Folgen deiner Lieblingsserie geschaut.">' + esc(it.text || '') + '</textarea><span class="gveil" aria-hidden="true">' + emb('lock', 20) + 'Versiegelt, antippen zum Lesen</span></label>' +
      '<p class="small mt8">Nichts Schlimmes, nur Überraschendes. Im Spiel rät ' + esc(W) + ', von wem das Geständnis ist.</p>';
  }
  return '';
}
function gLiveMore(it) {
  if (it.type === 'entweder') {
    var picks = (it.pairs || []).map(function (k) { var p = entPair(k); return p && it.ans && (it.ans[k] === 0 || it.ans[k] === 1) ? p[it.ans[k] + 1] : ''; }).filter(Boolean);
    return picks.length ? '<div class="gwords">' + picks.map(function (w) { return '<span class="gwd tr">' + esc(w) + '</span>'; }).join('') + '</div>' : '';
  }
  if (it.type === 'zahl') {
    var z = zahlQ(it.qk), a = gNum(it.answer), str = a ? fmtNum(Math.round(Number(String(it.answer).replace(',', '.')))) : '?', prev = it._num || '';
    var digits = str.split('').map(function (ch, k) { return '<span class="gd' + (ch !== prev[k] ? ' roll' : '') + '">' + esc(ch) + '</span>'; }).join('');
    it._num = str;
    return '<div class="gnum' + (a ? ' on' : '') + '"><b>' + digits + '</b>' + (z ? '<span>' + esc(z.unit) + '</span>' : '') + '</div><span class="sub">' + (a ? 'Deine Zahl steht. Ob sie die höchste ist?' : 'Hier erscheint deine Zahl') + '</span>';
  }
  if (it.type === 'geheim') {
    var len = String(it.text || '').trim().length;
    return len >= 8 ? '<span class="gseal"><span class="e" aria-hidden="true">' + emb('lock', 24) + '</span>Versiegelt: Dein Name bleibt bis zur Auflösung geheim</span>' : '<span class="gpill"><span class="e" aria-hidden="true">' + emb('pen', 18) + '</span>' + (len ? 'Noch ' + (8 - len) + ' Zeichen, dann wird versiegelt' : 'Schreib, dann wird versiegelt') + '</span>';
  }
  return '';
}
function gPreviewMore(it, A, W, t) {
  if (it.type === 'entweder') return ['Was sagt die Mehrheit über ' + W + '? ' + W + ' rät, was die Gäste getippt haben.'];
  if (it.type === 'zahl') { var z = zahlQ(it.qk); return [z ? z.most : 'Wer hat am meisten? Und alle zusammen?', 'Und: Wie viel ist es bei allen Gästen zusammen?']; }
  if (it.type === 'geheim') return ['Wer hat das gestanden?' + (t ? ' „' + t + '“' : '')];
  return [];
}
A.gPair = function (d) {
  var it = gForm().items[+d.k]; if (!it || it.type !== 'entweder') return;
  it.ans = it.ans || {}; it.ans[d.p] = +d.v;
  gVibe(10); gAfterClick(+d.k); gRender();
};
function qDetailsMore(q) {
  if (q.type === 'entweder') return (q.ans || []).map(function (a) { var p = entPair(a.k); return p ? esc(p[a.v === 1 ? 2 : 1]) : ''; }).filter(Boolean).join(' · ');
  if (q.type === 'zahl') { var z = zahlQ(q.qk); return (z ? esc(z.q) + ' ' : '') + 'Antwort: ' + fmtNum(q.answer) + ' ' + esc(q.unit || ''); }
  if (q.type === 'geheim') return 'Im Spiel wird geraten, wer das gestanden hat.';
  return '';
}

/* ---------- the rounds ---------- */
GG_POOL.entweder = function (main, pend) { return okGuest('entweder', pend).filter(function (q) { return aboutMain(q, main) && (q.ans || []).some(function (a) { return (q.usedPairs || []).indexOf(a.k) < 0; }); }); };
GG_POOL.zahl = function (main, pend) { return okGuest('zahl', pend).filter(function (q) { return !q.used && zahlQ(q.qk) && gNum(q.answer); }); };
GG_POOL.geheim = function (main, pend) { return okGuest('geheim', pend).filter(function (q) { return !q.used && aboutMain(q, main) && String(q.text || '').trim().length >= 8; }); };
GG_NEED.entweder = ['Entweder-oder-Antwort', 'Entweder-oder-Antworten']; GG_NEED.zahl = ['Zahl über dich', 'Zahlen von Gästen']; GG_NEED.geheim = ['Geständnis', 'Geständnisse'];
GG_FEM.push('entweder', 'zahl');
/* the pairs with enough answers, counted over the unused answers of all guests */
function entTally(pool) {
  var t = {};
  pool.forEach(function (q) { (q.ans || []).forEach(function (a) { if ((q.usedPairs || []).indexOf(a.k) >= 0 || !entPair(a.k)) return; var x = t[a.k] = t[a.k] || { k: a.k, n: 0, v: [0, 0], by: [[], []] }; x.n++; x.v[a.v === 1 ? 1 : 0]++; x.by[a.v === 1 ? 1 : 0].push(q.author); }); });
  return Object.keys(t).map(function (k) { return t[k]; }).filter(function (x) { return x.n >= ENT_NEED && x.v[0] !== x.v[1]; });
}
var byQkZ = function (q) { return q.qk; };
function zahlBest(pool, val) {
  var g = groupsBy(pool, byQkZ), best = 0;
  Object.keys(g).forEach(function (k) { best = Math.max(best, Object.keys(groupsBy(g[k], val)).length); });
  return best;
}
var byAnsZ = function (q) { return String(q.answer); };
GG.push(
  { id: 'mehrheit', fam: 'entweder', name: 'Was denkt die Mehrheit?', need: 3, val: byId, have: function (pool) { return entTally(pool).length; }, about: 'Entweder-oder-Antworten', w: 1.3, round: true, cap: 6 },
  { id: 'meiste', fam: 'zahl', name: 'Wer hat am meisten?', need: 3, val: byAnsZ, have: function (pool) { return zahlBest(pool, byAnsZ); }, about: 'Zahlen der Gäste', w: 1.1 },
  { id: 'zahlenstrahl', fam: 'zahl', name: 'Der Zahlenstrahl', need: 4, val: byAnsZ, have: function (pool) { return zahlBest(pool, byAnsZ); }, about: 'Zahlen der Gäste', w: 1.6 },
  { id: 'summe', fam: 'zahl', name: 'Alles zusammen', need: 3, val: byAuthor, have: function (pool) { return zahlBest(pool, byAuthor); }, about: 'Zahlen der Gäste', w: 1.0 },
  { id: 'gestaendnisse', fam: 'geheim', name: 'Geständnisse', need: 3, val: byId, about: 'Geständnissen', w: 2.6, round: true, cap: 5 }
);
ROUND_FAMS.push('entweder', 'zahl', 'geheim');
/* builds the step for the rounds above; false if the round is not one of ours */
function ggExtra(g, P, c) {
  var pool = c.pool, k = c.k, mn = c.mn, take = c.take, authors = c.authors, main = c.main;
  if (g.id === 'mehrheit') {
    var tally = shuffle(entTally(pool)).sort(function (a, b) { return b.n - a.n; }).slice(0, Math.max(g.need, Math.min(g.cap, k || 4)));
    P.mode = 'multi';
    P.text = 'Die Gäste haben über ' + mn + ' abgestimmt: entweder oder. Was sagt die Mehrheit?';
    P.items = tally.map(function (x) { var p = entPair(x.k), maj = x.v[1] > x.v[0] ? 1 : 0; return { prompt: p[1] + ' oder ' + p[2] + '?', options: [p[1], p[2]], correct: maj, reveal: x.v[maj] + ' von ' + x.n + ' sagen ' + p[maj + 1], by: x.by[maj][0] || '', line: p[maj + 1] + ': ' + x.v[maj] + ' von ' + x.n + ' Gästen' }; });
    P.choices = P.items.map(function () { return null; });
    P.entPairs = tally.map(function (x) { return x.k; });
    var all = []; pool.forEach(function (q) { if ((q.ans || []).some(function (a) { return P.entPairs.indexOf(a.k) >= 0; })) all.push(q); });
    P.win = { names: authors(all), note: 'haben ' + mn + ' eingeschätzt' };
    /* the answers of these pairs are spent, the guests' records stay for other pairs */
    all.forEach(function (q) { P.marks.push({ qid: q.id, sub: 'ent:' + P.entPairs.join(',') }); if (isGuestAuthor(q.author) && P.credit.indexOf(q.author) < 0) P.credit.push(q.author); });
    return true;
  }
  if (g.id === 'meiste' || g.id === 'zahlenstrahl' || g.id === 'summe') {
    var gq = groupsBy(pool, byQkZ), val = g.id === 'summe' ? byAuthor : byAnsZ, bestK = null, bestN = 0;
    Object.keys(gq).forEach(function (key) { var n = Object.keys(groupsBy(gq[key], val)).length; if (n > bestN) { bestN = n; bestK = key; } });
    var z = zahlQ(bestK), list = latestBy(gq[bestK] || []), num = function (q) { return Math.round(Number(q.answer)); }, lineOf = function (q) { return z.line.replace('{A}', q.author).replace('{V}', fmtNum(num(q))); };
    if (!z || !list.length) return true;
    if (g.id === 'meiste') {
      var reps = distinctPick(list, byAnsZ, 4).sort(function (a, b) { return num(b) - num(a); }), least = Math.random() < 0.3, right = least ? reps[reps.length - 1] : reps[0];
      P.mode = 'auswahl';
      P.text = least ? z.most.replace('die meisten', 'die wenigsten').replace('am öftesten', 'am seltensten').replace('am meisten', 'am wenigsten').replace('am längsten', 'am kürzesten').replace('auf den meisten', 'auf den wenigsten') : z.most;
      P.opts = shuffle(reps.map(function (q) { return q.author; })); P.correct = P.opts.indexOf(right.author);
      P.lines = reps.map(function (q) { return { ok: q === right, t: lineOf(q) }; });
      P.win = { single: true, name: right.author, note: least ? 'die kleine Zahl stößt mit an' : 'auf die große Zahl' };
      take(reps, '');
    } else if (g.id === 'zahlenstrahl') {
      var rz = distinctPick(list, byAnsZ, Object.keys(groupsBy(list, byAnsZ)).length >= 6 ? 5 : 4);
      P.mode = 'sort';
      P.text = z.all + ' Bring sie in die richtige Reihenfolge.';
      P.sortLabel = z.sort;
      P.items = rz.map(function (q) { return { label: q.author, rank: -num(q) }; });
      P.pickOrder = [];
      P.lines = rz.slice().sort(function (a, b) { return num(b) - num(a); }).map(function (q, i) { return { t: (i + 1) + '. ' + lineOf(q) }; });
      P.win = { names: authors(rz), note: 'stehen auf dem Zahlenstrahl' };
      take(rz, '');
    } else {
      var rj = spreadPick(list, Math.min(6, list.length)), sum = 0;
      rj.forEach(function (q) { sum += num(q); });
      P.mode = 'schaetzen';
      P.text = z.sum.replace('{N}', joinNames(rj.map(function (q) { return q.author; })));
      P.answer = sum; P.unit = z.unit; P.tol = Math.max(2, Math.round(sum * 0.15));
      P.lines = rj.map(function (q) { return { t: lineOf(q) }; });
      P.win = { names: authors(rj), note: 'stoßen auf ' + fmtNum(sum) + ' ' + z.unit + ' an' };
      take(rj, '');
    }
    return true;
  }
  if (g.id === 'gestaendnisse') {
    var rg = spreadPick(pool, k), names = authors(rg);
    shuffle(knownGuests()).forEach(function (n) { if (names.length < 4 && names.map(function (x) { return x.toLowerCase(); }).indexOf(n.toLowerCase()) < 0) names.push(n); });
    names = shuffle(names);
    P.mode = 'multi';
    P.text = 'Die Gäste haben ' + mn + ' etwas gestanden, das ' + mn + ' noch nicht wusste. Von wem ist welches Geständnis?';
    P.items = rg.map(function (q) { return { prompt: '„' + q.text + '“', options: names, correct: names.indexOf(q.author), reveal: q.author, by: q.author }; });
    P.choices = P.items.map(function () { return null; });
    P.win = { names: authors(rg), note: 'haben gebeichtet' };
    take(rg, '');
    return true;
  }
  return false;
}
/* a played Mehrheits-Runde spends only the pairs it showed */
function markEntUsed(q, sub) {
  var ks = sub.slice(4).split(',').filter(Boolean);
  q.usedPairs = (q.usedPairs || []).concat(ks.filter(function (x) { return (q.usedPairs || []).indexOf(x) < 0; }));
  if ((q.ans || []).every(function (a) { return q.usedPairs.indexOf(a.k) >= 0; })) q.used = true;
}
