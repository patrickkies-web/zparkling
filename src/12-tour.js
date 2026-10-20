/* =========================================================
   The intro: a short show about the party that is coming.
   It starts with the name of the person who is celebrated and
   builds every scene around it. Ends at the Game Pass.
   Plus small "Wusstest du?" facts.
   ========================================================= */
var A = A || {};
var TOUR_KEY = 'altesocke.tour', PASS_KEY = 'altesocke.pass';
/* prices are placeholders until the shop runs over the server */
var PASS_PLANS = [
  { days: 14, label: '14-Tage-Pass', price: '9,99 €', sub: 'Reicht für die meisten Feste: zwei Wochen Vorbereitung.' },
  { days: 30, label: '30-Tage-Pass', price: '12,99 €', sub: 'Für alle, die früh planen. Kleiner Aufpreis, doppelt so viel Zeit.' }
];

/* ---------- helpers: seeded looks, the name ---------- */
function seedRand(seed) {
  var a = seed >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function withSeed(seed, fn) { var keep = Math.random; Math.random = seedRand(seed); try { return fn(); } finally { Math.random = keep; } }
function strHash(s) { var h = 2166136261; s = String(s || ''); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function tourSaved() { var t = lsGet(TOUR_KEY); return t && typeof t === 'object' ? t : {}; }
function tourSeen() { var t = lsGet(TOUR_KEY); return t === 1 || t === '1' || !!(t && t.done); }
function tourName() { var n = UI.tourName != null ? UI.tourName : tourSaved().name; return String(n || '').replace(/\s+/g, ' ').replace(/^\s+/, '').slice(0, 14).trim(); }
function tourRollNow() { return UI.tourRoll != null ? UI.tourRoll : (tourSaved().roll || 0); }
function possessive(n) { return /(s|ß|x|z|ce)$/i.test(n) ? n + '’' : n + 's'; }
/* text with the name, or a fallback without it */
function tn(withName, without) { var n = tourName(); return n ? withName.replace(/\{Ns\}/g, possessive(n)).replace(/\{N\}/g, n) : without; }
function tourAvFor(name, roll) {
  var c = withSeed(strHash(String(name || '').toLowerCase() || 'alte socke') + (roll || 0) * 7919, function () { return avRandom(); });
  c.hat = 'krone'; c.neck = 'sockenkranz'; c.mouth = 'lachen'; c.bg = '#F4F1FF'; c.pat = 'konfetti';
  if (c.outfitColor === '#F4F1FF') c.outfitColor = '#9886FF';
  return c;
}
function tourAv() { return tourAvFor(tourName(), tourRollNow()); }
function tourStore(done) { var t = tourSaved(); lsSet(TOUR_KEY, { done: done || t.done || 0, name: tourName(), roll: tourRollNow() }); }

/* a small cast of guests, always drawn the same */
var TOUR_CAST = [['Tom', 11, 'partyhut'], ['Mia', 23, 'keiner'], ['Jonas', 37, 'cap'], ['Lea', 41, 'sterne'], ['Ben', 58, 'muetze'], ['Sara', 64, 'keiner']];
/* the intro always needs six guests: if the birthday person shares a name with one of them, a stand-in steps up */
var TOUR_SPARE = ['Kim', 72, 'cap'];
function tourCast() { var n = String(tourName() || '').trim().toLowerCase(); var c = TOUR_CAST.filter(function (g) { return g[0].toLowerCase() !== n; }); if (c.length < TOUR_CAST.length) c.push(TOUR_SPARE); return c; }
function castAv(g) { var c = withSeed(g[1] * 9973, function () { return avRandom(); }); c.hat = g[2]; c.neck = 'keiner'; c.pat = 'keins'; return c; }
function castFace(g, size, style) { return '<span class="t-face" style="width:' + size + 'px;height:' + size + 'px;' + (style || '') + '">' + avatarSVG(castAv(g)) + '</span>'; }

/* the name, one letter per sock on a line */
var SOCK_COLS = [['#15122B', '#FFFFFF'], ['#FFFFFF', '#15122B'], ['#FF7A45', '#15122B'], ['#9886FF', '#15122B'], ['#48D9A6', '#15122B'], ['#5B8CFF', '#FFFFFF'], ['#FF8FC4', '#15122B']];
function nameLine(name, W, fresh) {
  var chars = Array.from(String(name || '').toUpperCase()), ghost = !chars.length;
  if (ghost) chars = ['', '', '', '', ''];
  var n = chars.length, gap = Math.min(46, (W - 30) / n), sw = Math.min(40, gap * 0.95), sag = 22, H = sag + 24;
  var x0 = W / 2 - gap * (n - 1) / 2;
  var yAt = function (x) { var t = Math.max(0, Math.min(1, x / W)); return 10 + 4 * sag * t * (1 - t); };
  var o = '<svg class="t-rope" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true"><path d="M-6 9Q' + (W / 2) + ' ' + (10 + 2 * sag) + ' ' + (W + 6) + ' 9" fill="none" stroke="#F4F1FF" stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round"/></svg>';
  for (var i = 0; i < n; i++) {
    var ch = chars[i]; if (ch === ' ') continue;
    var x = x0 + i * gap, col = SOCK_COLS[i % SOCK_COLS.length], rot = [-6, 5, -3, 7, -5, 4, -7, 3][i % 8];
    o += '<span class="t-sock' + (ghost ? ' ghost' : '') + (fresh && i === n - 1 ? ' new' : '') + '" style="left:' + (x - sw * 0.45).toFixed(1) + 'px;top:' + (yAt(x) - 4).toFixed(1) + 'px;width:' + sw.toFixed(1) + 'px;--r:' + rot + 'deg;--i:' + i + '">' +
      '<svg viewBox="0 0 40 56" aria-hidden="true"><use href="#sk" fill="' + col[0] + '" stroke="#15122B" stroke-width="2.4"/><rect x="9.2" y="4" width="17.6" height="5" fill="' + col[1] + '" opacity=".85"/><rect x="15" y="-4" width="6" height="12" rx="1.6" fill="#E7B36A" stroke="#15122B" stroke-width="1.8"/></svg>' +
      (ch ? '<b style="color:' + col[1] + ';font-size:' + Math.round(sw * 0.52) + 'px">' + esc(ch) + '</b>' : '') + '</span>';
  }
  return o;
}
/* drawn confetti: socks, stars, ribbons, scraps */
function confetti(k, seed) {
  var r = seedRand(seed * 101 + 7), cols = ['#FFFFFF', '#15122B', '#FFC940', '#48D9A6', '#9886FF', '#FF8FC4', '#5B8CFF', '#FF7A45'], o = '<div class="t-conf" aria-hidden="true">';
  for (var i = 0; i < k; i++) {
    var c = cols[Math.floor(r() * cols.length)], kind = i % 4;
    var shape = kind === 0 ? '<svg viewBox="0 0 40 56" width="15" height="21"><use href="#sk" fill="' + c + '" stroke="#15122B" stroke-width="3.5"/></svg>'
      : kind === 1 ? '<svg viewBox="0 0 20 20" width="15" height="15"><path d="M10 1l2.6 6 6.4.6-4.8 4.3 1.4 6.3L10 15l-5.6 3.2 1.4-6.3L1 7.6l6.4-.6z" fill="' + c + '" stroke="#15122B" stroke-width="1.6" stroke-linejoin="round"/></svg>'
      : kind === 2 ? '<svg viewBox="0 0 26 12" width="24" height="11"><path d="M2 6c3-5 5 5 8 0s5 5 8 0 4 4 6 2" fill="none" stroke="' + (c === '#15122B' ? '#FFFFFF' : c) + '" stroke-width="3.2" stroke-linecap="round"/></svg>'
      : '<i style="background:' + c + '"></i>';
    o += '<span style="left:' + Math.round(r() * 96) + '%;--d:' + (r() * 3.2).toFixed(2) + 's;--du:' + (3.2 + r() * 2.4).toFixed(2) + 's;--s:' + (0.75 + r() * 0.55).toFixed(2) + ';--rot:' + Math.round(r() * 300 + 120) + 'deg;--x:' + Math.round(r() * 60 - 30) + 'px">' + shape + '</span>';
  }
  return o + '</div>';
}
/* headline: words rise one after the other */
function kin(text) {
  var k = 0;
  return String(text).split('\n').map(function (line) { return line.split(' ').map(function (w) { return '<span class="kw"><span style="--i:' + (k++) + '">' + esc(w) + '</span></span>'; }).join(' '); }).join('<br>');
}

/* ---------- the scenes ---------- */
var TOUR = [
  { id: 'name', c: '#FFC940', d: 0 },
  { id: 'modes', c: '#9886FF', d: 9000 },
  { id: 'link', c: '#48D9A6', d: 10000 },
  { id: 'games', c: '#FF8FC4', d: 10000 },
  { id: 'dials', c: '#7FA8FF', d: 9000 },
  { id: 'ready', c: '#6FE3FF', d: 9500 },
  { id: 'easy', c: '#B6F07C', d: 9500 },
  { id: 'cards', c: '#E2D6FF', d: 9500 },
  { id: 'roles', c: '#FF9A73', d: 8500 },
  { id: 'ticket', c: '#FFC940', d: 0, dark: true }
];
var TOUR_TX = {
  name: function () { return { h: 'Für wen steigt die Party?', t: 'Gib einen Namen ein und schau zu, was daraus wird.' }; },
  modes: function () { return { h: 'Für jeden Anlass gemacht.', t: 'Sockenkranz, Schachtelkranz, Treppe fegen, Klinken putzen, Geburtstag, Polterabend, JGA oder einfach ein Spielabend. Die App kennt die Bräuche und baut den Abend passend dazu.' }; },
  link: function () { return { h: 'Schritt 1: Die Gäste machen mit.', t: tn('Ein Link in die Gruppe genügt. Jeder bekommt eine Einladung und schickt in zwei Minuten, was er über {N} weiß: Erinnerungen, Lügen, Fragen. Mit Punkten, Leveln und Bonuskarten. Freiwillig.', 'Ein Link in die Gruppe genügt. Jeder bekommt eine Einladung und schickt in zwei Minuten, was er über die Hauptperson weiß: Erinnerungen, Lügen, Fragen. Mit Punkten, Leveln und Bonuskarten. Freiwillig.') }; },
  games: function () { return { h: tn('Schritt 2: Ein Abend, der nur zu {N} passt.', 'Schritt 2: Ein Abend, der nur zu euch passt.'), t: tn('Aus den Beiträgen baut die App eigene Runden: Wer kennt {N} am längsten, welche Geschichte ist gelogen, von wem stammt die Erinnerung. Genau das macht den Abend aus.', 'Aus den Beiträgen baut die App eigene Runden: Wer kennt die Hauptperson am längsten, welche Geschichte ist gelogen, von wem stammt die Erinnerung. Genau das macht den Abend aus.') }; },
  dials: function () { return { h: 'Du stellst ein, die App plant.', t: 'Wer spielt, wie lange, wie wild, mit welchem Material, eigene Fragen, Trinkbuddys an oder aus: Als Spielleiter passt du alles an. Den Rest übernimmt die App.' }; },
  ready: function () { return { h: 'Auf alles vorbereitet.', t: 'Gleichstand, Streit, keiner will anfangen? Zu jedem Spiel steht die Antwort schon bereit. Passt ein Spiel nicht, ziehst du ein anderes. Ein Tipp daneben, dann machst du ihn rückgängig.' }; },
  easy: function () { return { h: 'Entspannt feiern. Ohne Zwang.', t: 'Du gibst die Verantwortung ab und feierst mit. Nichts ist Pflicht: Spiele lassen sich überspringen, Gäste machen freiwillig mit, und jede Aufgabe sorgt für ein Schmunzeln, ohne jemanden bloßzustellen.' }; },
  cards: function () { return { h: 'Handys weg, Karten raus.', t: 'Gespielt wird miteinander, nicht am Bildschirm. Nur der Spielleiter tippt. Wer beim Gäste-Link mitgemacht hat, bekommt seine Karte auf Papier: den Joker, Weiterleiten in Silber oder die Regel-Karte.' }; },
  roles: function () { return { h: 'Wer mitmacht, bekommt seinen Auftritt.', t: tn('Wer {N} am längsten kennt, wird zum Urgestein. Wer das letzte Spiel errät, zum Hellseher. Kleine Rollen, charmant statt peinlich.', 'Wer die Hauptperson am längsten kennt, wird zum Urgestein. Wer das letzte Spiel errät, zum Hellseher. Kleine Rollen, charmant statt peinlich.') }; },
  ticket: function () { return { h: tn('{Ns} Party\nkann kommen.', 'Eure Party\nkann kommen.'), t: 'Mit dem Game Pass ist alles drin, vom ersten Gäste-Link bis zwei Tage nach dem Fest.' }; }
};

function artName() {
  var n = tourName(), v = UI.tourName != null ? UI.tourName : (tourSaved().name || '');
  return '<div class="t-namebox"><div class="t-line" id="tLine">' + nameLine(n, 330, false) + '</div>' +
    '<label class="t-field" for="tName"><span class="sr">Name der Hauptperson</span><input id="tName" class="t-input" type="text" maxlength="14" autocomplete="off" autocapitalize="words" enterkeyhint="next" spellcheck="false" placeholder="Name eingeben" data-bind="tour.name" value="' + esc(v) + '"></label>' +
    '<div class="t-me"><span class="t-meav" id="tMe">' + avatarSVG(tourAv()) + '</span><button type="button" class="t-roll" data-act="tourRoll" aria-label="Anderer Look">' + icon('i-shuffle', 20) + '</button><span class="t-small" id="tMeT">' + esc(tourMeText()) + '</span></div></div>';
}
function tourMeText() { return tn('So zieht {N} in die App ein. Den Look kannst du jederzeit ändern.', 'Jede Hauptperson bekommt ihren eigenen Avatar. Den Look änderst du jederzeit.'); }
function artStage() {
  var tags = [tn('{Ns} Insider', 'Eure Insider'), tn('{Ns} Leute', 'Eure Leute'), tn('{Ns} Geschichten', 'Eure Geschichten')];
  return '<div class="t-stagebox"><span class="t-beam" aria-hidden="true"></span><div class="t-line sm">' + nameLine(tourName() || 'Party', 320, false) + '</div>' +
    '<span class="t-floor" aria-hidden="true"></span><span class="t-hero">' + avatarSVG(tourAv(), { mood: 'jubel' }) + '</span>' +
    tags.map(function (t, i) { return '<span class="t-tagx" style="--i:' + i + ';' + ['left:0;top:112px;--rot:-7deg', 'right:0;top:176px;--rot:6deg', 'left:18px;top:250px;--rot:-3deg'][i] + '">' + esc(t) + '</span>'; }).join('') + confetti(16, 1) + '</div>';
}
function artLink() {
  var g = tourCast();
  var msgs = [
    [g[0], 'Erinnerung', '#FF8FC4', tn('Die Nacht im Freibad mit {N}? Schon aufgeschrieben.', 'Die Nacht im Freibad? Schon aufgeschrieben.')],
    [g[1], 'Zwei Wahrheiten, eine Lüge', '#FFC940', 'Meine Lüge errät garantiert keiner.'],
    [g[2], 'Millionenfrage', '#9886FF', tn('Hab eine Frage über {N} drin, die wird hart.', 'Hab eine Frage drin, die wird hart.')],
    [g[3], 'Steckbrief', '#48D9A6', tn('Kenne {N} seit der fünften Klasse!', 'Kenne sie seit der fünften Klasse!')]
  ];
  var t0 = 0.5, chat = '<div class="t-msg out" style="--t:' + t0 + 's"><div class="t-ob"><div class="t-lc"><span class="t-lc-art">' + sockIc('#FF7A45', 11) + sockIc('#FFFFFF', 11) + sockIc('#48D9A6', 11) + '<b>zparkling</b></span><b class="t-lc-h">' + esc(tn('Was weißt du über {N}?', 'Was weißt du über unsere Hauptperson?')) + '</b><small>Beiträge für die Party sammeln</small></div><span class="t-tx">Macht mal mit, dauert zwei Minuten!</span></div></div>';
  msgs.forEach(function (m, i) {
    var t = 1.5 + i * 1.55;
    chat += '<div class="t-typing" style="--t:' + t + 's">' + castFace(m[0], 22) + '<span><i></i><i></i><i></i></span></div>' +
      '<div class="t-msg in" style="--t:' + (t + 0.85).toFixed(2) + 's">' + castFace(m[0], 26) + '<span class="t-bub"><span class="t-who">' + esc(m[0][0]) + '<i style="background:' + m[2] + '">' + esc(m[1]) + '</i></span>' + esc(m[3]) + '</span></div>';
  });
  return '<div class="t-phone"><div class="t-ph-top"><span class="t-ph-grp">' + castFace(g[4], 30) + '</span><span class="stack" style="gap:1px;min-width:0"><b>Party-Crew</b><small>' + esc(g[0][0] + ', ' + g[1][0] + ', ' + g[2][0] + ' und 11 weitere') + '</small></span></div><div class="t-chat">' + chat + '</div></div>';
}
function artGames() {
  var g = tourCast(), by = function (a) { return '<span class="t-by">' + a.map(function (x, k) { return castFace(x, 24, k ? 'margin-left:-8px' : ''); }).join('') + '<small>aus den Beiträgen von ' + esc(a.map(function (x) { return x[0]; }).slice(0, -1).join(', ') + ' und ' + a[a.length - 1][0]) + '</small></span>'; };
  var cards = [
    { c: '#FFC940', t: tn('Wer kennt {N} am längsten?', 'Wer kennt die Hauptperson am längsten?'), v: '<div class="t-gv-time">' + [[g[0], '2004'], [g[1], '2011'], [g[3], '2019']].map(function (x, k) { return '<span style="--k:' + k + '">' + castFace(x[0], 30) + '<b>' + x[1] + '</b></span>'; }).join('') + '</div>', by: [g[0], g[1], g[3]] },
    { c: '#5B8CFF', t: 'Die Millionenfrage von ' + g[2][0], v: '<div class="t-gv-abc">' + ['A', 'B', 'C', 'D'].map(function (x, k) { return '<span' + (k === 2 ? ' class="on"' : '') + '><b>' + x + '</b><i></i></span>'; }).join('') + '</div>', by: [g[2], g[4]] },
    { c: '#9886FF', t: 'Von wem stammt diese Erinnerung?', v: '<div class="t-gv-q"><p>„Die Nacht im Freibad …“</p><span>' + [g[0], g[1], g[2]].map(function (x) { return castFace(x, 30); }).join('') + '<b>?</b></span></div>', by: [g[0], g[1], g[2]] },
    { c: '#48D9A6', t: tn('Welche Geschichte über {N} ist gelogen?', 'Welche Geschichte ist gelogen?'), v: '<div class="t-gv-lie"><span></span><span class="lie"><i>gelogen</i></span><span></span></div>', by: [g[1], g[3], g[5]] }
  ];
  return '<div class="t-deck">' + cards.map(function (c, i) {
    return '<div class="t-gc" style="--c:' + c.c + ';--i:' + i + ';--dl:' + [0, -6, -4, -2][i] + 's"><span class="t-gc-k">' + icon('i-users', 15) + 'Gäste-Runde</span><b class="t-gc-t">' + esc(c.t) + '</b>' + c.v + by(c.by) + '</div>';
  }).join('') + '</div>';
}
var REEL_A = [['sock', 'Sockenkranz'], ['i-broom', 'Treppe fegen'], ['i-dice', 'Spielabend'], ['i-trophy', 'Hochzeit'], ['i-sparkle', 'Klinken putzen'], ['i-box', 'Schachtelkranz'], ['i-cup', 'Junggesellenabschied'], ['i-star', 'Geburtstag']];
var REEL_B = [['sock', 'Stück für Stück'], ['i-clock', 'Nach Zeit'], ['i-dice', 'Würfeln'], ['i-flag', 'Runde für Runde'], ['i-ruler', 'Meter für Meter']];
var REEL_C = [['i-users', 'Gemeinsam'], ['i-flag', 'Gegeneinander'], ['i-users', 'Gemeinsam'], ['i-flag', 'Gegeneinander']];
function reelStrip(list, stops) {
  /* stops: indexes into list, the first one again at the end; three blur items between two stops */
  var out = [], k = 0;
  stops.forEach(function (s, i) { out.push(list[s]); if (i < stops.length - 1) for (var f = 0; f < 3; f++) { k++; out.push(list[(s + f + 1 + k) % list.length]); } });
  return out.map(function (x) { return '<span class="t-ri">' + (x[0] === 'sock' ? sockIc('#15122B', 14) : icon(x[0], 20)) + '<b>' + esc(x[1]) + '</b></span>'; }).join('');
}
function artModes() {
  var rows = [['Anlass', reelStrip(REEL_A, [0, 1, 2, 3, 0])], ['Spielart', reelStrip(REEL_B, [0, 1, 2, 3, 0])], ['Wie', reelStrip(REEL_C, [0, 1, 1, 0, 0])]];
  return '<div class="t-slot"><div class="t-sl-top"><span class="t-bulbs" aria-hidden="true">' + new Array(9).join('<i></i>') + '</span><b>Euer Abend</b></div>' +
    rows.map(function (r, i) { return '<span class="t-sl-l">' + r[0] + '</span><div class="t-win"><div class="t-strip" style="--k:' + i + '">' + r[1] + '</div></div>'; }).join('') +
    '<span class="t-lever" aria-hidden="true"><i></i></span></div>';
}
function artDials() {
  var hand = '<svg class="t-hand" viewBox="0 0 44 56" width="40" height="51" aria-hidden="true"><path d="M12.5 2c2.5 0 4.5 2 4.5 4.5V22h1.5c.3-2 2-3.5 4-3.5s3.7 1.5 4 3.5h.5c.6-1.7 2.2-3 4-3s3.5 1.3 4 3c.7-1 1.9-1.7 3.2-1.7 2.2 0 4 1.8 4 4V38c0 8-6 14-14 14h-4c-6 0-10.5-3-13.5-8L3 33c-1.2-2-.6-4.6 1.4-5.8 1.9-1.1 4.3-.6 5.6 1.1L8 30V6.5C8 4 10 2 12.5 2z" fill="#FFFFFF" stroke="#15122B" stroke-width="2.6" stroke-linejoin="round"/><path d="M17 22v8M25.5 22v8M33.5 23v7" stroke="#15122B" stroke-width="2" stroke-linecap="round"/></svg>';
  return '<div class="t-panel">' +
    '<span class="t-pl" style="top:12px">Dauer</span><span class="t-pv" style="top:10px"><b class="a">90 Min</b><b class="b">150 Min</b></span>' +
    '<span class="t-track"><i class="t-fill"></i><i class="t-thumb"></i></span>' +
    '<span class="t-pl" style="top:88px">Maximum pro Person</span><span class="t-step"><i>–</i><b><em class="a">8</em><em class="b">9</em></b><i class="t-plus">+</i></span>' +
    '<span class="t-pl" style="top:136px">Gäste per Link</span><span class="t-sw"><i></i></span>' +
    '<span class="t-seg"><i class="t-seg-hl"></i><b>Gemeinsam</b><b>Gegeneinander</b></span>' +
    '<span class="t-pl" style="top:228px">Material im Haus</span><span class="t-chip on" style="left:16px;width:70px">Würfel</span><span class="t-chip c2" style="left:94px;width:106px">Kartenspiel</span><span class="t-chip c3" style="left:208px;width:76px">Ballons</span>' +
    [[96, 44, 0.75], [262, 147, 2.6], [262, 98, 3.4], [213, 197, 4.5], [147, 265, 5.3], [246, 265, 6.0]].map(function (p) { return '<i class="t-tap" style="left:' + p[0] + 'px;top:' + p[1] + 'px;animation-delay:' + p[2] + 's"></i>'; }).join('') +
    hand + '</div>';
}
function artRoles() {
  var g = tourCast();
  var cards = [
    ['frischling', g[3], '#48D9A6', tn('kennt {N} am kürzesten', 'kennt die Hauptperson am kürzesten')],
    ['millionen', g[2], '#5B8CFF', 'stellt die Millionenfrage'],
    ['hellseher', g[1], '#9886FF', 'tippt das letzte Spiel'],
    ['urgestein', g[0], '#FFC940', tn('kennt {N} seit 2004', 'kennt die Hauptperson am längsten')]
  ];
  cards.reverse();
  var pos = ['left:0;top:0;--rot:-5deg', 'right:0;top:22px;--rot:4deg', 'left:6px;top:172px;--rot:3deg', 'right:4px;top:192px;--rot:-4deg'];
  return '<div class="t-board">' + cards.map(function (c, i) {
    return '<div class="t-rc" style="--i:' + i + ';--c:' + c[2] + ';' + pos[i] + '"><span class="t-rc-top"><span class="t-rc-e">' + roleIcon(c[0], 40) + '</span><b>' + esc(ROLE_DEFS[c[0]].name) + '</b></span><span class="t-rc-who">' + castFace(c[1], 24) + '<span><b>' + esc(c[1][0]) + '</b> ' + esc(c[3]) + '</span></span></div>';
  }).join('') + '</div>';
}
function artTicket() {
  return '<div class="t-final">' + confetti(24, 3) + '<div class="t-tix"><div class="t-tix-main"><span class="t-tix-av">' + avatarSVG(tourAv(), { mood: 'jubel' }) + '</span><span class="stack" style="gap:3px;min-width:0"><small>Game Pass für</small><b>' + esc(tn('{Ns} Party', 'Eure Party')) + '</b><span class="t-tix-l">Gäste-Links, alle Spielarten, über 140 Spiele</span></span></div><div class="t-tix-stub"><span>Für alle Gäste</span><i class="t-bars"></i></div><i class="t-shine"></i></div></div>';
}
/* prepared for everything: the answers are there, another game, undo */
function artReady() {
  var g = tourCast();
  var q = [['Was gilt bei Gleichstand?', 'Noch ein Versuch für beide. Wer trifft, gewinnt.'], ['Wer fängt an?', 'Wer zuletzt Geburtstag hatte.'], ['Wer entscheidet bei Streit?', 'Der Spielleiter, und das Geburtstagskind darf protestieren.']];
  return '<div class="t-ready"><div class="t-rd-card"><span class="t-rd-k">Duell</span><span class="t-rd-names"><b class="a">Kronkorken-Schnippen</b><b class="b">Löffel-Balance</b></span><span class="t-rd-vs">' + castFace(g[0], 30) + '<i>vs</i>' + castFace(g[1], 30) + '</span></div>' +
    q.map(function (x, k) { return '<div class="t-rd-q' + (k ? '' : ' open') + '" style="--k:' + k + '"><span>' + esc(x[0]) + '</span><i>' + (k ? '+' : '–') + '</i>' + (k ? '' : '<p>' + esc(x[1]) + '</p>') + '</div>'; }).join('') +
    '<div class="t-rd-btns"><span class="t-rd-b one">' + icon('i-shuffle', 15) + 'Anderes Spiel</span><span class="t-rd-b two">' + icon('i-undo', 15) + 'Rückgängig</span></div>' +
    '<i class="t-tap" style="left:78px;top:262px;animation-delay:3.6s"></i><i class="t-tap" style="left:222px;top:262px;animation-delay:6.4s"></i></div>';
}
/* relaxed, no compulsion */
function artEasy() {
  var p = [['i-next', 'Überspringen? Jederzeit.', '#FFFFFF'], ['i-users', 'Gäste müssen nichts', '#FFC940'], ['i-star', 'Lustig, nie peinlich', '#FF8FC4'], ['i-clock', 'Mit Tempobremse', '#9886FF']];
  return '<div class="t-easy"><span class="t-ez-av">' + avatarSVG(tourAv(), { mood: 'jubel' }) + '</span>' +
    p.map(function (x, k) { return '<span class="t-pr" style="--k:' + k + ';--c:' + x[2] + ';--rot:' + [-5, 4, -3, 5][k] + 'deg">' + icon(x[0], 16) + esc(x[1]) + '</span>'; }).join('') + '</div>';
}
/* paper instead of screens: the cards in the hand */
function artCards() {
  var g = tourCast(), kinds = [['joker', g[0][0]], ['weiter', g[1][0]], ['regel', g[2][0]]];
  var card = function (t, name) { return '<div class="pc pc-' + t + '"><div class="pc-in"><div class="pc-top"><span class="pc-chip">' + (t === 'weiter' ? 'Silber' : t === 'regel' ? 'Regel' : 'Joker') + '</span></div><div class="pc-art"><span class="pc-ring"></span>' + emb(GQ_STYLE[t].e, 60) + '</div><span class="pc-k">Bonuskarte</span><b class="pc-t">' + esc(pcTitle(t)) + '</b><div class="pc-for"><span>Für</span><b>' + esc(name) + '</b></div></div></div>'; };
  return '<div class="t-cards"><span class="t-phone-down" aria-hidden="true"><i></i><b>Handy-Pause</b></span>' +
    kinds.map(function (k, i) { return '<span class="t-card" style="--k:' + i + '">' + card(k[0], k[1]) + '</span>'; }).join('') + '</div>';
}
var TOUR_ART = { name: artName, stage: artStage, link: artLink, games: artGames, modes: artModes, dials: artDials, ready: artReady, easy: artEasy, cards: artCards, roles: artRoles, ticket: artTicket };

/* the ambient stage: a spotlight in the colour of the scene, sparks that rise slowly */
function tourStars() {
  var r = seedRand(77), o = '<span class="t-stars" aria-hidden="true">';
  for (var i = 0; i < 14; i++) o += '<i style="left:' + Math.round(r() * 100) + '%;--d:' + (-r() * 14).toFixed(1) + 's;--du:' + (10 + r() * 9).toFixed(1) + 's;--s:' + (0.5 + r() * 0.9).toFixed(2) + ';--o:' + (0.35 + r() * 0.5).toFixed(2) + '"></i>';
  return o + '</span>';
}
V.tour = function () {
  var i = Math.max(0, Math.min(TOUR.length - 1, UI.tourAt || 0)), s = TOUR[i], last = i === TOUR.length - 1, tx = TOUR_TX[s.id]();
  clearTimeout(UI.tourT);
  if (s.d && !UI.tourPause) UI.tourT = setTimeout(function () { if (UI.screen === 'tour' && (UI.tourAt || 0) === i) A.tourNext(); }, s.d);
  var prog = '<div class="t-prog" aria-hidden="true">' + TOUR.map(function (x, k) { return '<span class="' + (k < i ? 'done' : k === i ? 'now' : '') + '"><i style="animation-duration:' + (x.d || 1) + 'ms"></i></span>'; }).join('') + '</div>';
  var hs = tx.h.length > 36 ? 26 : tx.h.length > 24 ? 29 : 33;
  var from = UI.tourFrom && UI.tourFrom !== s.c ? UI.tourFrom : '';
  var bg = '<div class="t-bg" aria-hidden="true">' + (from ? '<span class="t-glow old" style="--tc:' + from + '"></span>' : '') + '<span class="t-glow"></span><span class="t-dots"></span>' + tourStars() + '</div>';
  var body = '<div class="t-wrap">' + bg + prog +
    '<div class="t-top"><span class="t-brand">' + sockIc('#FFFFFF', 12) + 'zparkling</span><button type="button" class="t-skip" data-act="tourSkip">' + (last ? 'Schließen' : 'Überspringen') + '</button></div>' +
    '<div class="t-stage' + (from ? ' tin' + (UI.tourDir < 0 ? ' back' : '') : '') + '" aria-live="polite"><h1 class="t-h" style="font-size:' + hs + 'px">' + kin(tx.h) + '</h1>' + (tx.t ? '<p class="t-p">' + esc(tx.t) + '</p>' : '') + '<div class="t-art"><div class="t-art-in">' + TOUR_ART[s.id]() + '</div></div></div>' +
    (last || s.id === 'name' ? '' : '<button type="button" class="t-zone l" data-act="tourPrev" aria-label="Zurück"></button><button type="button" class="t-zone r" data-act="tourNext" aria-label="Weiter"></button>') + '</div>';
  var foot = last
    ? '<button type="button" class="cta t-cta-sun" data-act="tourPass">' + icon('i-star', 18) + 'Game Pass ansehen</button><button type="button" class="btn-ghost t-ghost" data-act="tourDemo">Erst mal den Beispiel-Abend ausprobieren</button>'
    : '<div class="cta-row">' + (i ? '<button type="button" class="t-back" data-act="tourPrev" aria-label="Zurück">' + icon('i-back', 20) + '</button>' : '') +
      '<button type="button" class="t-next" id="tNext" data-act="tourNext"><span id="tNextL">' + (s.id === 'name' ? (tourName() ? 'Weiter' : 'Ohne Namen weiter') : i === TOUR.length - 2 ? 'Zum Game Pass' : 'Weiter') + '</span>' + icon('i-next', 18) + '</button></div>';
  var html = scr('', body, foot, 'tourscr ts-' + s.id + (s.dark ? ' dark' : ''));
  html = html.replace('<div class="scr', '<div style="--tc:' + s.c + '" class="scr');
  UI.tourFrom = '';
  return html;
};
/* on a laptop the picture leans with the mouse, a little, like a card in the hand */
if (typeof window !== 'undefined' && window.matchMedia) {
  try {
    if (window.matchMedia('(hover: hover)').matches) app.addEventListener('pointermove', function (e) {
      if (UI.screen !== 'tour') return;
      var art = app.querySelector('.t-art'); if (!art) return;
      var r = art.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      if (x < -0.7 || x > 0.7 || y < -0.7 || y > 0.7) { art.style.removeProperty('--rx'); art.style.removeProperty('--ry'); return; }
      art.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg'); art.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });
  } catch (e) {}
}
/* while typing the name, only the line, the avatar and the button change */
function tourPatch() {
  var n = tourName(), line = document.getElementById('tLine'), me = document.getElementById('tMe'), mt = document.getElementById('tMeT'), nl = document.getElementById('tNextL');
  var grew = n.length > (UI.tourLen || 0); UI.tourLen = n.length;
  if (line) { line.classList.add('still'); line.innerHTML = nameLine(n, 330, grew); }
  if (me) { me.innerHTML = avatarSVG(tourAv()); me.classList.remove('pop'); void me.offsetWidth; me.classList.add('pop'); }
  if (mt) mt.textContent = tourMeText();
  if (nl) nl.textContent = n ? 'Weiter' : 'Ohne Namen weiter';
}
A.tourNext = function () {
  var i = UI.tourAt || 0; if (i >= TOUR.length - 1) return;
  if (TOUR[i].id === 'name') tourStore();
  UI.tourFrom = TOUR[i].c; UI.tourDir = 1; UI.tourAt = i + 1; render();
};
A.tourPrev = function () {
  var i = UI.tourAt || 0; if (i <= 0) return;
  UI.tourFrom = TOUR[i].c; UI.tourDir = -1; UI.tourAt = i - 1; render();
};
A.tourRoll = function () { UI.tourRoll = tourRollNow() + 1; tourPatch(); };
A.tourSkip = function () { clearTimeout(UI.tourT); tourStore(1); go(E() ? 'home' : 'pass'); };
A.tourPass = function () { clearTimeout(UI.tourT); tourStore(1); go('pass'); };
A.tourDemo = function () { clearTimeout(UI.tourT); tourStore(1); A.openDemoPick({ from: UI.screen === 'tour' ? 'landing' : UI.screen }); };
A.openTour = function () { UI.tourAt = 0; UI.tourFrom = ''; UI.tourName = null; UI.tourLen = tourName().length; go('tour'); };
/* the name from the intro becomes the first person */
function tourSeedDraft(draft, an) {
  var t = tourSaved();
  if (!t.name || E().focus.length) return;
  draft.name = t.name;
  draft.av = avTheme(tourAvFor(t.name, t.roll || 0), an);
}

/* ---------- the Game Pass ---------- */
function dayStart(iso) { var p = String(iso || '').split('-'); return p.length === 3 ? new Date(+p[0], +p[1] - 1, +p[2]).getTime() : NaN; }
function isoDay(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function fmtDay(t) { return new Date(t).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'long' }); }
var DAY = 86400000;
/* valid from (date of the party minus the pass days) until the end of the second day after it */
function passWindow(days, iso) { var ev = dayStart(iso); return isNaN(ev) ? null : { start: ev - days * DAY, end: ev + 3 * DAY - 1, ev: ev }; }
function passGet() { return lsGet(PASS_KEY); }
function passInfo() {
  var p = passGet(); if (!p) return null;
  var w = passWindow(p.days, p.event); if (!w) return null;
  var t = Date.now();
  return { p: p, w: w, active: t >= w.start && t <= w.end, early: t < w.start, over: t > w.end, toEvent: Math.ceil((w.ev - dayStart(isoDay(t))) / DAY) };
}
function passActive() { if (S && S.demo) return true; var i = passInfo(); return !!(i && i.active); }
/* the gate: without an active pass, explain and show the offer */
function needPass(why) {
  if (passActive()) return false;
  UI.passWhy = why || ''; go('pass');
  return true;
}
function passStatusHtml(compact) {
  /* the example evening has its own golden banner on every screen */
  if (S && S.demo) return '';
  var i = passInfo();
  if (!i || i.over) return '<div class="passbar off">' + icon('i-star', 16) + '<span class="grow"><b>' + (i ? 'Game Pass abgelaufen.' : 'Noch kein Game Pass.') + '</b> Gäste-Link und Spiel sind gesperrt.</span><button type="button" class="tag plain" data-act="go" data-to="pass" style="height:30px;background:var(--accent);color:var(--ink)">Holen</button></div>';
  if (i.early) return '<div class="passbar wait">' + icon('i-clock', 16) + '<span class="grow"><b>Game Pass startet am ' + esc(fmtDay(i.w.start)) + '.</b></span></div>';
  if (compact) return '<div class="passbar on">' + icon('i-check', 16) + '<span class="grow"><b>Game Pass aktiv.</b> ' + (i.toEvent > 0 ? 'Noch ' + i.toEvent + (i.toEvent === 1 ? ' Tag' : ' Tage') + ' bis zum Fest.' : i.toEvent === 0 ? 'Heute ist der große Tag!' : 'Gilt noch bis ' + esc(fmtDay(i.w.end)) + '.') + '</span></div>';
  return '';
}
/* the pass page should make you want it: your party on a golden ticket, a pass that fizzes, everything inside in big */
function passTicketHtml() {
  var e = E(), f = e && e.focus.length ? e.focus : [];
  var av = f.length && f[0].av ? avatarSVG(f[0].av, { mood: 'jubel' }) : avatarSVG(tourAv(), { mood: 'jubel' });
  var title = e && e.name ? e.name : tn('{Ns} Party', 'Eure Party');
  return '<div class="t-final p-final">' + confetti(22, 5) + '<div class="t-tix"><div class="t-tix-main"><span class="t-tix-av">' + av + '</span><span class="stack" style="gap:3px;min-width:0"><small>Game Pass für</small><b>' + esc(title) + '</b><span class="t-tix-l">Gäste-Links, alle Spielarten, über 140 Spiele</span></span></div><div class="t-tix-stub"><span>Für alle Gäste</span><i class="t-bars"></i></div><i class="t-shine"></i></div></div>';
}
function passHeadline() {
  var e = E(), f = e && e.focus.length ? e.focus : [];
  if (f.length === 1) return possessive(f[0].name) + ' Party kann kommen.';
  if (f.length > 1) return 'Eure Party kann kommen.';
  return tn('{Ns} Party kann kommen.', 'Eure Party kann kommen.');
}
function passFizz(n) { var o = ''; for (var i = 0; i < n; i++) o += '<i style="--x:' + (4 + (i * 37) % 92) + '%;--d:' + ((i * 0.41) % 2.6).toFixed(2) + 's;--s:' + (4 + (i * 5) % 6) + 'px;--w:' + ((i % 3) - 1) * 6 + 'px"></i>'; return o; }
function passPlanCard(pl, plan, date, rec) {
  var sel = plan === pl.days, w = date ? passWindow(pl.days, date) : null, t = Date.now(), hot = pl.days === 30;
  var when = w ? (t > w.end ? 'Das Datum liegt in der Vergangenheit.' : t < w.start ? 'Startet am ' + fmtDay(w.start) + ', gilt bis ' + fmtDay(w.end) + '.' : 'Sofort aktiv, gilt bis ' + fmtDay(w.end) + '.') : 'Wähl oben das Datum, dann siehst du den Zeitraum.';
  var cents = Math.round(parseFloat(String(pl.price).replace(',', '.')) / pl.days * 100);
  return '<button type="button" class="p-plan' + (sel ? ' is-sel' : '') + (hot ? ' hot' : '') + '" data-act="passPlan" data-v="' + pl.days + '" aria-pressed="' + sel + '">' +
    (hot ? '<span class="pp-fizz" aria-hidden="true">' + passFizz(14) + '</span><span class="pp-rod" aria-hidden="true"><i class="pp-line"></i><span class="pp-bait"><b>GAME PASS</b><i></i></span></span>' : '') +
    '<span class="stack grow" style="gap:3px;text-align:left;position:relative;min-width:0">' + (hot ? '<span class="p-hot">' + icon('i-star', 11) + 'Beliebt · Bester Wert</span>' : rec ? '<span class="p-rec">Passt für euer Datum</span>' : '') + '<b>' + esc(pl.label) + '</b><small>' + esc(pl.sub) + '</small><small class="p-when">' + esc(when) + '</small></span>' +
    '<span class="stack" style="align-items:flex-end;gap:2px;position:relative;flex:0 0 auto"><span class="p-price">' + esc(pl.price) + '</span><small class="p-day">nur ' + cents + ' Cent pro Tag</small></span></button>';
}
var PASS_PERKS = [
  ['chain', 'Gäste-Link für alle', 'Steckbriefe, Lügen, Erinnerungen, Fragen, Tipps'],
  ['letter', 'Gäste-Runden', 'Lügen-Runde, Erinnerungs-Memory, Millionenfrage'],
  ['vote', 'Gegen die Menge', 'Alle stimmen per Link ab'],
  ['joker', 'Bonuskarten & Joker', 'Gäste ziehen Karten, ein Joker erlässt ein Pinnchen'],
  ['urgestein', 'Rollen & Abspann', 'Urgestein, Hellseher, der Abend in Zahlen'],
  ['liebling', 'Herausforderungen', 'Mit Wetteinsatz, Revanche und Handicap-Station'],
  ['shield', 'Pinnchen-Pilot', 'Maximum, Wasser-Joker, Tempo-Bremse'],
  ['loop', 'So oft ihr wollt', 'Beliebig viele Runden im ganzen Zeitraum']
];
function passPerksHtml() {
  return '<div class="pf-head mt22"><span class="pf-k">' + icon('i-star', 12) + 'Alles drin' + icon('i-star', 12) + '</span><h2 class="pf-h">Ein Pass.<br>Der ganze Abend.</h2></div>' +
    '<div class="pf-big mt14"><span class="pf-num">140+</span><span class="stack" style="gap:2px;min-width:0"><b>geheime Minispiele</b><span>passend zu eurem Material, verraten erst im Moment</span></span><span class="pf-big-e" aria-hidden="true">' + emb('dice', 46) + '</span><i class="pf-shine" aria-hidden="true"></i></div>' +
    '<div class="pf-grid mt10">' + PASS_PERKS.map(function (x, i) { return '<div class="pf-t" style="--i:' + i + '"><span class="pf-e" aria-hidden="true">' + emb(x[0], 30) + '</span><b>' + esc(x[1]) + '</b><span>' + esc(x[2]) + '</span><i class="pf-shine" aria-hidden="true"></i></div>'; }).join('') + '</div>';
}
V.pass = function () {
  var info = passInfo(), active = info && info.active && !(S && S.demo);
  var date = UI.passDate || (info && !info.over ? info.p.event : '');
  var plan = UI.passPlan || (date && dayStart(date) - dayStart(isoDay(Date.now())) > 14 * DAY ? 30 : 14);
  var today = isoDay(Date.now());
  var body = '<div class="p-top"><h1 class="p-h">' + esc(passHeadline()) + '</h1><p class="p-sub">Mit dem Game Pass ist alles drin, vom ersten Gäste-Link bis zwei Tage nach dem Fest.</p></div>' +
    (active ? '' : passTicketHtml() + '<div class="p-trust">' + [['i-check', 'Kein Abo'], ['i-star', 'Einmal zahlen'], ['i-sparkle', 'Sofort freigeschaltet']].map(function (x) { return '<span>' + icon(x[0], 13) + x[1] + '</span>'; }).join('') + '</div>');
  if (UI.passWhy) body += '<div class="testbanner mt14">' + icon('i-star', 18) + '<span class="grow">' + esc(UI.passWhy) + '</span></div>';
  if (active) {
    body += '<button type="button" class="pv-mini" data-act="passReplay" aria-label="Den Game Pass nochmal fliegen lassen">' + pvCardHtml({ w: info.w }) + '</button>' +
      '<button type="button" class="btn-dark mt14" style="width:100%" data-act="passReplay">' + icon('i-sparkle', 18) + 'Nochmal fliegen lassen</button>' +
      '<div class="card pad mt14 stack gap8"><span class="eyebrow">Dein Pass</span><span class="name" style="font-size:18px">' + esc(info.p.days) + '-Tage-Pass ist aktiv</span><span class="sub">Fest am ' + esc(fmtDay(info.w.ev)) + ' · gültig bis ' + esc(fmtDay(info.w.end)) + '</span>' +
      '<span class="small">' + (info.p.changes ? 'Das Datum wurde schon einmal verschoben.' : 'Das Datum kannst du einmal in den Einstellungen verschieben.') + '</span></div>' +
      (info.p.test ? (UI.confirm === 'passReset' ? confirmBox('Test-Pass löschen?', 'Danach ist der Pass weg und du holst ihn neu, wie beim ersten Mal. Es wird nichts abgebucht.', 'passReset', 'Löschen') : '<button type="button" class="linkbtn mt10" data-act="askConfirm" data-v="passReset">Testmodus: Pass löschen und neu holen</button>') : '');
  } else {
    var recDays = date ? (dayStart(date) - dayStart(isoDay(Date.now())) > 14 * DAY ? 30 : 14) : 0;
    body += '<span class="eyebrow mt22 block">Wann wird gefeiert?</span><label class="field mt10" for="passDate"><span class="sr">Datum des Fests</span><input id="passDate" class="input" type="date" min="' + today + '" data-bind="pass.date" value="' + esc(date) + '"></label>' +
      '<span class="eyebrow mt22 block">Wähl deinen Pass</span><div class="stack gap14 p-plans">' + PASS_PLANS.slice().sort(function (a, b) { return b.days - a.days; }).map(function (pl) { return passPlanCard(pl, plan, date, recDays === pl.days); }).join('') + '</div>';
  }
  body += passPerksHtml() +
    '<p class="small mt14">Gültig ab ' + (plan || 14) + ' Tagen vor dem Fest bis zwei Tage danach. Das Datum lässt sich einmal verschieben.</p>' +
    '<p class="small mt6"><b style="color:var(--sun)">Testmodus:</b> Es wird nichts abgebucht, die Preise sind Platzhalter. Bezahlt wird später per PayPal oder Karte.</p>';
  var pl = PASS_PLANS.filter(function (x) { return x.days === plan; })[0] || PASS_PLANS[0];
  var foot = active ? '<button type="button" class="cta" data-act="go" data-to="' + (E() ? 'home' : 'welcome') + '">Weiter</button>'
    : '<button type="button" class="cta p-buy" data-act="passBuy"' + (date ? '' : ' disabled') + '>' + icon('i-star', 18) + (date ? esc(pl.label) + ' holen · ' + esc(pl.price) : 'Erst das Datum wählen') + '<i class="p-buy-shine" aria-hidden="true"></i></button>' +
      '<button type="button" class="btn-ghost" data-act="' + (S && S.demo ? 'go" data-to="home' : 'tourDemo') + '">' + (S && S.demo ? 'Zurück zum Beispiel-Abend' : 'Erst mal den Beispiel-Abend ausprobieren') + '</button>';
  return scr(topbar(E() ? 'home' : 'welcome', 'Game Pass'), body, foot, 'pscr');
};
A.passPlan = function (d) { UI.passPlan = +d.v; render(); };
A.passBuy = function () {
  var date = UI.passDate || (passInfo() && passInfo().p.event);
  if (!date || isNaN(dayStart(date))) { setToast('Wähl zuerst das Datum'); return; }
  var plan = UI.passPlan || (dayStart(date) - dayStart(isoDay(Date.now())) > 14 * DAY ? 30 : 14);
  var w = passWindow(plan, date);
  if (Date.now() > w.end) { setToast('Das Datum liegt in der Vergangenheit'); return; }
  lsSet(PASS_KEY, { days: plan, event: date, bought: Date.now(), changes: 0, test: true });
  tourStore(1);
  UI.passWhy = '';
  if (S && S.demo) { S = fresh(); }
  /* the page underneath goes on, the golden pass flies over it */
  if (E()) go('home'); else A.newEvent();
  pvShow({ w: w, early: Date.now() < w.start });
};
/* the date can be moved once */
A.passMove = function () {
  var p = passGet(); if (!p) return;
  if (p.changes) { setToast('Das Datum wurde schon einmal verschoben'); return; }
  var d = UI.passMoveDate;
  if (!d || isNaN(dayStart(d)) || dayStart(d) < dayStart(isoDay(Date.now()))) { setToast('Bitte ein Datum ab heute wählen'); return; }
  if (d === p.event) { setToast('Das ist schon das Datum'); return; }
  p.event = d; p.changes = 1; lsSet(PASS_KEY, p); UI.passMoveDate = ''; UI.confirm = null;
  setToast('Neues Datum: ' + fmtDay(dayStart(d))); render();
};
function passSettingsHtml() {
  if (S && S.demo) return '';
  var i = passInfo();
  if (!i) return '<span class="eyebrow mt22 block">Game Pass</span><button type="button" class="card pad row plain mt10" data-act="go" data-to="pass" style="width:100%"><span class="tile-ic" style="width:40px;height:40px;border-radius:12px;background:var(--accent)">' + icon('i-star', 20) + '</span><span class="stack grow" style="text-align:left;gap:2px"><span class="name">Noch kein Game Pass</span><span class="sub">Gäste-Link und Spiel freischalten</span></span><span class="linkbtn">Ansehen</span></button>';
  var can = !i.p.changes && !i.over;
  return '<span class="eyebrow mt22 block">Game Pass</span><div class="card pad mt10 stack gap8"><span class="name">' + esc(i.p.days) + '-Tage-Pass' + (i.active ? ' · aktiv' : i.early ? ' · startet bald' : ' · abgelaufen') + '</span><span class="sub">Fest am ' + esc(fmtDay(i.w.ev)) + ' · gültig vom ' + esc(fmtDay(i.w.start)) + ' bis ' + esc(fmtDay(i.w.end)) + '</span>' +
    (!i.over ? '<button type="button" class="btn-ghost mt6" data-act="passReplay">' + icon('i-sparkle', 18) + 'Game Pass nochmal fliegen lassen</button>' : '') +
    (can ? '<label class="field mt6" for="passMove">Datum einmal verschieben<input id="passMove" class="input" type="date" min="' + isoDay(Date.now()) + '" data-bind="pass.move" value="' + esc(UI.passMoveDate || i.p.event) + '"></label>' +
      (UI.confirm === 'passMove' ? confirmBox('Datum wirklich verschieben?', 'Das geht nur ein einziges Mal.', 'passMove', 'Verschieben') : '<button type="button" class="btn-ghost mt6" data-act="askConfirm" data-v="passMove"' + (UI.passMoveDate && UI.passMoveDate !== i.p.event ? '' : ' disabled') + '>Neues Datum übernehmen</button>')
      : '<span class="small">' + (i.p.changes ? 'Das Datum wurde schon einmal verschoben.' : 'Der Pass ist abgelaufen.') + '</span>' + (i.over ? '<button type="button" class="btn-ghost mt6" data-act="go" data-to="pass">Neuen Pass holen</button>' : '')) + '</div>';
}

/* ---------- "Wusstest du?" ---------- */
var FACTS = {
  home: [
    'Je mehr eure Gäste per Link schicken, desto persönlicher wird der Abend. Viele Runden baut die App direkt aus ihren Beiträgen.',
    'Gäste spielen nur mit, wenn das Geburtstagskind sie sich aussucht. Alle anderen dürfen gemütlich zuschauen.',
    'Gezählt wird nur bei den Geburtstagskindern. Was die Gäste trinken, ist ihre Sache.',
    'Gegen die Menge kommt einmal pro Abend: Alle stimmen ab, die Geburtstagskinder raten die Mehrheit.',
    'Am Ende gibt es „Der Abend in Zahlen“ zum Vorlesen, samt aller Rollen des Abends.',
    'Welches Minispiel als Nächstes kommt, siehst nur du, verdeckt wie ein Passwort.',
    'Bei einer Herausforderung sucht sich das Geburtstagskind einen Gast aus, per Gesicht oder Glücksrad. Verliert der Gast, löst er einen Wetteinsatz ein. Gäste trinken dabei nie.',
    'Einmal pro Abend gibt es die Revanche-Karte: eine verlorene Herausforderung nochmal, es zählt das zweite Ergebnis.'
  ],
  runSetup: [
    'Stück für Stück, Würfeln oder nach Zeit: Die Spielart wählt ihr für jeden Durchgang neu.',
    'Das Maximum pro Person wird nie überschritten. Wer viel gewinnt, trinkt weniger.',
    'Mit einem echten Würfel tippst du einfach die gewürfelte Zahl ein.',
    'Eine große Gäste-Runde ab fünf Fragen kann zwei Schritte weit bringen, wenn das Tempo passt.',
    'Unterwegs wartet die Handicap-Station: Ein Gast sucht ein Handicap aus, das nach ein paar Minuten von selbst verschwindet. Ein Sieg löst es früher.'
  ],
  questions: [
    AI_HOST ? 'Aus den zwei Worten der Gäste baut die KI auf Knopfdruck 20 Fragen, die es nur bei eurer Hauptperson gibt. Sie kommen bevorzugt in den Fragerunden.' : null,
    'Im Gäste-Link sehen alle, was schon oft kam und was noch fehlt. So wird es bunt gemischt.',
    'Aus drei Lügen wird eine Lügen-Runde, aus drei Erinnerungen ein Erinnerungs-Memory.',
    'Der Jahrgang im Steckbrief bleibt geheim. Er entscheidet nur bei Gleichstand, wer eine Rolle bekommt.',
    'Aus den Worten der Gäste werden auch Sätze fürs Lippenlesen und Konter-Sprüche für Herausforderungen. Je mehr Worte, desto persönlicher.',
    'Nicht jede Runde kommt jedes Mal. Die App entscheidet selbst, das hält es spannend.'
  ],
  games: [
    'Ihr sagt nur, was im Haus ist. Fehlt etwas, kommt das Spiel einfach nicht dran.',
    'Keine Fitness-Einlagen für Gäste: Wer mitspielt, wird vom Geburtstagskind ausgesucht.',
    'Spiele mit Sturzgefahr pausieren automatisch, sobald jemand die Hälfte seines Maximums erreicht hat.',
    'Jede Spielkarte erklärt sich selbst: So geht’s, wann es geschafft ist, und auf Wunsch liest das Handy vor.',
    'Manche Spiele laufen direkt im Handy: Daumen-Blitz misst die Reaktion, beim Löffel-Reflex ruft die App die Wörter.'
  ]
};
function factCard(ctx) {
  var list = (FACTS[ctx] || []).filter(Boolean); if (!list.length) return '';
  UI.factI = UI.factI || {};
  if (UI.factI[ctx] == null) UI.factI[ctx] = Math.floor(Math.random() * list.length);
  var t = list[UI.factI[ctx] % list.length];
  return '<div class="fact mt14"><span class="fact-e" aria-hidden="true">' + emb('bulb', 26) + '</span><span class="stack grow" style="gap:2px;min-width:0"><span class="fact-l">Wusstest du?</span><span class="fact-t">' + esc(t) + '</span></span><button type="button" class="fact-n" data-act="factNext" data-v="' + ctx + '" aria-label="Nächster Tipp">' + icon('i-next', 16) + '</button></div>';
}
A.factNext = function (d) { UI.factI = UI.factI || {}; UI.factI[d.v] = (UI.factI[d.v] || 0) + 1; render(); };

