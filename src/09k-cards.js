/* =========================================================
   Bonus cards in the guest link. When every contribution is
   ready, a hidden button slides out from under "Abschicken".
   One tap: the button shakes, swells, and a booster pack opens
   with one card. The app picks the kind the guests sent least.
   Two cards per guest, the second only after the first is done.
   Now and then, instead, the Joker: it can free the birthday
   person from one drink, if its owner says yes.
   ========================================================= */
var GK_MAX = 2, GK_UMF_CAP = 8, GK_DRAW_SECS = 45, GK_JOKER_P = 0.14;
var GK_KINDS = ['portrait', 'wenn', 'spruch', 'umfrage'];
/* the timeline of the opening, in ms after the pack appears */
var GK_T = { charge: 700, tear: 3000, rise: 3120, flip: 3740, flash2: 4180, stamp: 4380, panel: 4820, focus: 5150 };
QTYPES.push(
  ['portrait', 'Porträt in ' + GK_DRAW_SECS + ' Sekunden', 'Bonuskarte: das Geburtstagskind, gemalt in ' + GK_DRAW_SECS + ' Sekunden.', 'karte'],
  ['wenn', 'Wenn … wäre', 'Bonuskarte: ein Wort, was das Geburtstagskind wäre.', 'karte'],
  ['spruch', 'Lieblingsspruch', 'Bonuskarte: der Spruch, den das Geburtstagskind ständig sagt.', 'karte'],
  ['umfrage', 'Top-Antworten', 'Bonuskarte: ein Wort auf eine Umfrage, wie in der Spielshow.', 'karte'],
  ['joker', 'Joker', 'Bonuskarte: befreit das Geburtstagskind einmal von einem Pinnchen, wenn der Gast es erlaubt.', 'karte']
);
GQ_STYLE.portrait = { c: '#C9A6FF', e: 'brush', stamp: 'Signiert' };
GQ_STYLE.wenn = { c: '#B6F07C', e: 'thought', stamp: 'Verraten' };
GQ_STYLE.spruch = { c: '#FFA9A0', e: 'quote', stamp: 'Zitiert' };
GQ_STYLE.umfrage = { c: '#6FD3FF', e: 'podium', stamp: 'Gezählt' };
GQ_STYLE.joker = { c: '#FF6FD8', e: 'joker', stamp: 'Joker' };
QK_SHORT.portrait = 'Porträt'; QK_SHORT.wenn = 'Wäre'; QK_SHORT.spruch = 'Spruch'; QK_SHORT.umfrage = 'Umfrage'; QK_SHORT.joker = 'Joker';
function isCardType(t) { return GK_KINDS.indexOf(t) >= 0 || t === 'joker'; }
/* the kinds a guest picks directly in the form (without the bonus cards) */
function formTypes() { return QTYPES.filter(function (t) { return t[3] !== 'karte'; }); }

/* rarity: the fewer of a kind came in so far, the rarer the card */
var GK_RAR = [
  { id: 'leg', name: 'Legendär', c: '#FFC940', c2: '#FF7A45', pts: 30 },
  { id: 'epi', name: 'Episch', c: '#B3A6FF', c2: '#FF7AB6', pts: 20 },
  { id: 'sel', name: 'Selten', c: '#6FE3C4', c2: '#5BB8FF', pts: 15 },
  { id: 'jok', name: 'Joker', c: '#FF6FD8', c2: '#6FE3FF', pts: 25 }
];
function gkRarity(n) { return n <= 0 ? GK_RAR[0] : n <= 3 ? GK_RAR[1] : GK_RAR[2]; }
function gkRar(id) { return GK_RAR.filter(function (x) { return x.id === id; })[0] || GK_RAR[2]; }

/* "Wenn … wäre": the category, how it is asked, and answers the app mixes in at the party */
var WENN_CATS = [
  ['tier', 'ein Tier', 'Welches Tier', 'z. B. Faultier', ['Faultier', 'Erdmännchen', 'Pinguin', 'Eichhörnchen', 'Flamingo', 'Dackel', 'Koala', 'Otter', 'Waschbär', 'Eule', 'Alpaka', 'Igel']],
  ['getraenk', 'ein Getränk', 'Welches Getränk', 'z. B. Espresso', ['Espresso', 'Aperol Spritz', 'Kakao', 'Radler', 'Gin Tonic', 'Apfelschorle', 'Kräutertee', 'Weißbier', 'Prosecco', 'Cola', 'Glühwein', 'Smoothie']],
  ['gericht', 'ein Gericht', 'Welches Gericht', 'z. B. Lasagne', ['Lasagne', 'Currywurst', 'Sushi', 'Pizza Hawaii', 'Käsespätzle', 'Döner', 'Pfannkuchen', 'Ramen', 'Schnitzel', 'Tiramisu', 'Pommes', 'Kartoffelsalat']],
  ['fahrzeug', 'ein Fahrzeug', 'Welches Fahrzeug', 'z. B. Bobbycar', ['Bobbycar', 'Traktor', 'Cabrio', 'Tandem', 'Vespa', 'Wohnmobil', 'Monstertruck', 'Lastenrad', 'Kreuzfahrtschiff', 'Rikscha', 'Schlitten', 'Feuerwehrauto']],
  ['wetter', 'ein Wetter', 'Welches Wetter', 'z. B. Gewitter', ['Sonnenschein', 'Gewitter', 'Nieselregen', 'Regenbogen', 'Schneegestöber', 'Nebel', 'Hitzewelle', 'Sturm', 'Frühlingsbrise', 'Hagel', 'Altweibersommer', 'Glatteis']],
  ['moebel', 'ein Möbelstück', 'Welches Möbelstück', 'z. B. Sitzsack', ['Sofa', 'Schaukelstuhl', 'Hängematte', 'Barhocker', 'Bücherregal', 'Wasserbett', 'Kommode', 'Sitzsack', 'Ohrensessel', 'Schreibtisch', 'Hochbett', 'Klappstuhl']],
  ['suess', 'eine Süßigkeit', 'Welche Süßigkeit', 'z. B. Lakritz', ['Gummibärchen', 'Lakritz', 'Schokokuss', 'Zuckerwatte', 'Brausepulver', 'Marzipan', 'Lolli', 'Kaugummi', 'Nougat', 'Karamell', 'Popcorn', 'Praline']],
  ['musik', 'ein Instrument', 'Welches Instrument', 'z. B. Triangel', ['Triangel', 'E-Gitarre', 'Tuba', 'Blockflöte', 'Schlagzeug', 'Harfe', 'Akkordeon', 'Ukulele', 'Dudelsack', 'Klavier', 'Saxofon', 'Trompete']],
  ['reise', 'ein Reiseziel', 'Welches Reiseziel', 'z. B. Island', ['Mallorca', 'Island', 'Paris', 'Las Vegas', 'Ostsee', 'Tokio', 'Alpen', 'New York', 'Bali', 'Amsterdam', 'Toskana', 'Sylt']],
  ['werkzeug', 'ein Werkzeug', 'Welches Werkzeug', 'z. B. Akkuschrauber', ['Hammer', 'Akkuschrauber', 'Kombizange', 'Wasserwaage', 'Taschenmesser', 'Kettensäge', 'Zollstock', 'Tesafilm', 'Pinsel', 'Lötkolben', 'Schraubenzieher', 'Heißklebepistole']],
  ['farbe', 'eine Farbe', 'Welche Farbe', 'z. B. Knallpink', ['Knallpink', 'Dunkelblau', 'Senfgelb', 'Mintgrün', 'Schwarz', 'Orange', 'Lila', 'Gold', 'Türkis', 'Weinrot', 'Beige', 'Neongrün']],
  ['gewuerz', 'ein Gewürz', 'Welches Gewürz', 'z. B. Chili', ['Chili', 'Zimt', 'Pfeffer', 'Knoblauch', 'Muskat', 'Curry', 'Vanille', 'Paprika', 'Oregano', 'Kardamom', 'Salz', 'Ingwer']]
];
function wennCat(id) { return WENN_CATS.filter(function (c) { return c[0] === id; })[0] || null; }
/* Top-Antworten: one question, everyone answers with one word, the most frequent land on the board */
var UMFRAGE = [
  ['dabei', 'Was hat {N} immer dabei?', 'z. B. Kaugummi'],
  ['geld', 'Wofür gibt {N} zu viel Geld aus?', 'z. B. Sneaker'],
  ['kuehl', 'Was findet man immer im Kühlschrank von {N}?', 'z. B. Senf'],
  ['palme', 'Was bringt {N} auf die Palme?', 'z. B. Stau'],
  ['sonntag', 'Was macht {N} am liebsten am Sonntag?', 'z. B. Ausschlafen'],
  ['insel', 'Was nimmt {N} mit auf die einsame Insel?', 'z. B. Hängematte'],
  ['job', 'Welchen Job hätte {N} in einem anderen Leben?', 'z. B. Koch'],
  ['essen', 'Was isst {N} am liebsten?', 'z. B. Lasagne'],
  ['app', 'Welche App öffnet {N} am häufigsten?', 'z. B. Instagram'],
  ['superkraft', 'Welche Superkraft hätte {N} gern?', 'z. B. Fliegen']
];
function umfrageQ(id) { return UMFRAGE.filter(function (q) { return q[0] === id; })[0] || null; }
function umfrageText(id, name) { var q = umfrageQ(id); return q ? q[1].replace(/\{N\}/g, name) : ''; }
/* one-word answers: the same word in other spelling counts as the same answer */
function wordKey(s) {
  var t = String(s || '').toLowerCase().trim().replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue');
  t = t.replace(/^(der|die|das|ein|eine|einen|sein|seine|ihr|ihre|mein|meine|dein|deine)\s+/, '').replace(/[^a-z0-9]+/g, '');
  if (t.length > 4) t = t.replace(/(en|n|s|e)$/, '');
  return t;
}
/* who a card is about: the person in focus with the fewest of this kind so far */
function gkName(forId) { return forId && isFocus(forId) ? person(forId).name : E() && E().focus.length ? focusNames() : 'das Geburtstagskind'; }
function gkSubs() { return guestSubmissions().concat(gForm().cards || []); }
function gkCounts() {
  var c = {}; GK_KINDS.forEach(function (k) { c[k] = 0; });
  gkSubs().forEach(function (q) { if (c[q.type] != null) c[q.type] += 1; });
  return c;
}
/* the Joker: rare, one per guest at most, only a few per party */
function gkJokerCap() { return Math.max(2, (E() ? E().focus.length : 1) + 1); }
function gkJokerOk() {
  if (gPass().joker || (gForm().cards || []).some(function (c) { return c.type === 'joker'; })) return false;
  return gkSubs().filter(function (q) { return q.type === 'joker'; }).length < gkJokerCap();
}
/* the app picks the kind the guests sent least, ties by chance */
function gkPickType() {
  if (gkJokerOk() && demoTypeOk('joker') && Math.random() < GK_JOKER_P) return { type: 'joker', n: -1 };
  var kinds = GK_KINDS.filter(demoTypeOk), c = gkCounts(), mn = Math.min.apply(null, kinds.map(function (k) { return c[k]; }));
  return { type: pick(kinds.filter(function (k) { return c[k] === mn; })), n: mn };
}
function gkForId(type) {
  var f = E() ? E().focus : [];
  if (!f.length) return '';
  if (f.length === 1) return f[0].id;
  var c = {}; f.forEach(function (p) { c[p.id] = 0; });
  gkSubs().forEach(function (q) { if (q.type === type && c[q.forId] != null) c[q.forId] += 1; });
  var mn = Math.min.apply(null, f.map(function (p) { return c[p.id]; }));
  return pick(f.filter(function (p) { return c[p.id] === mn; })).id;
}
/* "Wenn … wäre": spread over the categories, so the party round gets many */
function gkWennCat(forId) {
  var c = {}; WENN_CATS.forEach(function (x) { c[x[0]] = 0; });
  gkSubs().forEach(function (q) { if (q.type === 'wenn' && c[q.cat] != null && (q.forId || '') === (forId || '')) c[q.cat] += 1; });
  var mn = Math.min.apply(null, WENN_CATS.map(function (x) { return c[x[0]]; }));
  return pick(WENN_CATS.filter(function (x) { return c[x[0]] === mn; }));
}
/* Top-Antworten: everybody on the same question, until it has enough for the board */
function gkUmfragePick() {
  var ids = E() && E().focus.length ? E().focus.map(function (p) { return p.id; }) : [''], cnt = {}, best = -1, cands = [];
  gkSubs().forEach(function (q) { if (q.type === 'umfrage') { var k = (q.forId || '') + '|' + q.qk; cnt[k] = (cnt[k] || 0) + 1; } });
  ids.forEach(function (id) {
    UMFRAGE.forEach(function (q) {
      var n = cnt[id + '|' + q[0]] || 0;
      if (n >= GK_UMF_CAP) return;
      if (n > best) { best = n; cands = []; }
      if (n === best) cands.push({ forId: id, qk: q[0] });
    });
  });
  return cands.length ? pick(cands) : { forId: ids[0], qk: pick(UMFRAGE)[0] };
}
/* a card put back is used up too: two draws per guest, whatever happens to them */
function gkLeft() { var P = gPass(); return Math.max(0, GK_MAX - (P.cards || 0) - (P.burned || 0) - (gForm().cards || []).length); }
function gkCanDraw() { var G = gForm(); return UI.guestMode !== 'master' && !UI.gk && gkLeft() > 0 && G.items.length > 0 && G.items.every(gDone); }

/* ---------- drawings: strokes as numbers from 0 to 999, two base-36 digits each.
   New drawings are upright (3:4), marked with a leading "P" ---------- */
var GK_PENS = ['#15122B', '#FF5A2E', '#6B4DFF', '#E8368F'];
function gkTotalPts(strokes) { var n = 0; (strokes || []).forEach(function (s) { n += Math.max(0, (s.length - 1) / 2); }); return n; }
function gkEncode(strokes, upright) {
  return (upright ? 'P|' : '') + (strokes || []).filter(function (s) { return s.length >= 3; }).map(function (s) {
    var o = String(s[0] | 0);
    for (var i = 1; i + 1 < s.length; i += 2) o += ('0' + Math.max(0, Math.min(999, s[i] | 0)).toString(36)).slice(-2) + ('0' + Math.max(0, Math.min(999, s[i + 1] | 0)).toString(36)).slice(-2);
    return o;
  }).join('|');
}
function gkDecode(str) {
  return String(str || '').split('|').map(function (st) {
    var pen = parseInt(st.charAt(0), 10), pts = [];
    if (!(pen >= 0 && pen < GK_PENS.length)) pen = 0;
    for (var i = 1; i + 4 <= st.length; i += 4) {
      var x = parseInt(st.substr(i, 2), 36), y = parseInt(st.substr(i + 2, 2), 36);
      if (x >= 0 && x <= 999 && y >= 0 && y <= 999) pts.push(x, y);
    }
    return { pen: pen, pts: pts };
  }).filter(function (s) { return s.pts.length >= 2; });
}
function gkStrokes(str) { return gkDecode(str).map(function (s) { return [s.pen].concat(s.pts); }); }
/* the drawing as an SVG: everything in it is a number, so a guest cannot sneak anything in */
function gkUpright(str) { return /^P\|/.test(String(str || '')); }
function drawSvg(str, size, cls) {
  var up = gkUpright(str), sx = up ? 0.75 : 1, W = up ? 750 : 1000, X = function (v) { return Math.round(v * sx); };
  var paths = gkDecode(str).map(function (s) {
    var col = GK_PENS[s.pen];
    if (s.pts.length === 2) return '<circle cx="' + X(s.pts[0]) + '" cy="' + s.pts[1] + '" r="9" fill="' + col + '"/>';
    var d = 'M' + X(s.pts[0]) + ' ' + s.pts[1];
    for (var i = 2; i < s.pts.length; i += 2) d += 'L' + X(s.pts[i]) + ' ' + s.pts[i + 1];
    return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/>';
  }).join('');
  return '<svg class="gk-svg' + (up ? ' up' : '') + (cls ? ' ' + cls : '') + '" viewBox="0 0 ' + W + ' 1000" width="' + size + '" height="' + Math.round(size * 1000 / W) + '" role="img" aria-label="Gemaltes Porträt"><rect width="' + W + '" height="1000" rx="60" fill="#FFFDF6"/>' + paths + '</svg>';
}

/* ---------- the card's words ---------- */
function gkUnit() { try { return E() ? U() : 'Pinnchen'; } catch (e) { return 'Pinnchen'; } }
function gkKicker(k) { return { portrait: 'Porträt', wenn: 'Wenn … wäre', spruch: 'Lieblingsspruch', umfrage: 'Top-Antworten', joker: 'Joker' }[k.type]; }
function gkTitle(k) {
  var N = gkName(k.forId), c = wennCat(k.cat);
  if (k.type === 'portrait') return 'Mal ' + N + '!';
  if (k.type === 'wenn') return 'Wenn ' + N + ' ' + (c ? c[1] : 'ein Tier') + ' wäre …';
  if (k.type === 'spruch') return 'Was sagt ' + N + ' ständig?';
  if (k.type === 'joker') return 'Der Joker!';
  return umfrageText(k.qk, N);
}
function gkSub(k) {
  var N = gkName(k.forId), c = wennCat(k.cat);
  if (k.type === 'portrait') return 'Du hast ' + GK_DRAW_SECS + ' Sekunden. Schnell, ehrlich, mit Liebe.';
  if (k.type === 'wenn') return (c ? c[2] : 'Welches Tier') + ' wäre ' + N + '? Ein Wort reicht.';
  if (k.type === 'spruch') return 'Den einen Spruch, genau so, wie ' + N + ' ihn sagt.';
  if (k.type === 'joker') return 'Wer heute verliert, darf dich fragen, ob du ihn einlöst. Dann fällt ein ' + gkUnit() + ' weg. Du entscheidest.';
  return 'Ein Wort, das Erste, was dir einfällt. Die häufigsten Antworten landen auf der Tafel.';
}
function gkValid(k) {
  if (!k) return false;
  if (k.type === 'joker') return true;
  if (k.type === 'portrait') return k.phase !== 'ready' && gkTotalPts(k.strokes) >= 10;
  var t = String(k.text || '').trim();
  return k.type === 'spruch' ? t.length >= 3 : t.length >= 2;
}
function gkMaxLen(k) { return k.type === 'spruch' ? 90 : k.type === 'joker' ? 60 : 28; }

/* ---------- open, reveal, redeem ---------- */
A.gDraw = function () {
  if (UI.gk || UI.gkBusy || !gkCanDraw()) return;
  UI.gkBusy = true; UI.gkFresh = false;
  gkAudioUnlock(); gkSndCharge();
  /* the button charges where it is: it trembles, fills up with light, nothing jumps */
  var b = document.getElementById('gdraw'), w = document.getElementById('gdrawWrap');
  if (w) w.classList.remove('fresh');
  if (b) { b.classList.remove('tug', 'pop'); b.classList.add('charge'); }
  gVibe([8, 60, 10, 45, 12, 32, 14, 22, 16, 14, 30]);
  setTimeout(function () { UI.gkBusy = false; gkOpen(); }, 740);
};
function gkOpen() {
  if (UI.gk || !gkCanDraw()) return;
  var p = gkPickType(), rar = p.type === 'joker' ? gkRar('jok') : gkRarity(p.n);
  var k = { type: p.type, forId: '', rar: rar.id, pts: rar.pts, text: '', strokes: [], phase: 'ready', pen: 0, played: false, no: GK_MAX - gkLeft() + 1, key: 'c' + Date.now().toString(36) + Math.floor(Math.random() * 1000) };
  if (p.type === 'umfrage') { var u = gkUmfragePick(); k.forId = u.forId; k.qk = u.qk; }
  else if (p.type !== 'joker') k.forId = gkForId(p.type);
  if (p.type === 'wenn') k.cat = gkWennCat(k.forId)[0];
  UI.gk = k;
  var tok = UI.gkTok = (UI.gkTok || 0) + 1, live = function () { return UI.gkTok === tok && UI.gk === k; };
  gkMount(k);
  gkFxStart(k); gkSndOpening(k);
  setTimeout(function () { if (live()) gkVibeRamp(GK_T.tear - GK_T.charge - 120); }, GK_T.charge);
  setTimeout(function () { if (live()) gVibe(k.rar === 'leg' || k.rar === 'jok' ? [180, 40, 90] : [150]); }, GK_T.tear);
  setTimeout(function () { if (live()) gkRevealFx(k); }, GK_T.flash2);
  setTimeout(function () { if (live()) gVibe([50]); }, GK_T.stamp);
  setTimeout(function () { if (live()) gkFocus(); }, GK_T.focus);
}
/* the overlay goes on top of the page as it is, so nothing underneath moves.
   The little pack in the button becomes the big one: it flies out of the button to the middle. */
function gkMount(k) {
  var b = document.getElementById('gdraw'), src = b && b.querySelector ? b.querySelector('.gd-pack') : null;
  var r0 = src && src.getBoundingClientRect ? src.getBoundingClientRect() : null;
  if (document.getElementById('gkov') || !app.insertAdjacentHTML || !r0 || !r0.width) { gRender(); return; }
  app.insertAdjacentHTML('beforeend', gkOverlay());
  var ov = document.getElementById('gkov'); if (!ov) { gRender(); return; }
  var pk = ov.querySelector('.gk-pack'), st = ov.querySelector('.gk-stage');
  if (pk && st) {
    ov.classList.add('gk-pre');
    var rs = st.getBoundingClientRect();
    pk.style.setProperty('--px', Math.round(r0.left + r0.width / 2 - (rs.left + rs.width / 2)) + 'px');
    pk.style.setProperty('--py', Math.round(r0.top + r0.height / 2 - (rs.top + rs.height / 2)) + 'px');
    ov.classList.add('gk-from');
    void ov.offsetWidth;
    ov.classList.remove('gk-pre');
  }
  /* the button is spent: its pack is gone, the counter drops */
  b.classList.remove('charge'); b.classList.add('launched');
  var n = document.getElementById('gdrawN'); if (n) { n.textContent = Math.max(0, gkLeft() - 1) + '×'; n.classList.add('tick'); }
}
/* the haptic drum roll: slow taps that come faster and faster */
function gkVibeRamp(ms) {
  var p = [], t = 0, gap = 230;
  while (t < ms) { var on = Math.round(8 + (230 - gap) / 14); p.push(on, Math.round(gap)); t += on + gap; gap = Math.max(12, gap * 0.84); }
  gVibe(p);
}
function gkRevealFx(k) {
  if (k.fxDone) return;
  k.fxDone = true;
  gVibe(k.rar === 'leg' || k.rar === 'jok' ? [40, 40, 40, 40, 160] : [30, 40, 70]);
  if (k.rar !== 'sel') gkConfetti(k.rar === 'leg' || k.rar === 'jok' ? 70 : 40);
}
/* confetti inside the card overlay, so it falls in front of the card */
function gkConfetti(n) {
  var ov = document.getElementById('gkov'); if (!ov) return;
  var cols = ['#FFC940', '#FFFFFF', '#FF7A45', '#9886FF', '#48D9A6', '#FF8FC4'], fx = '';
  for (var k = 0; k < n; k++) fx += '<i style="left:' + (4 + Math.random() * 92).toFixed(0) + '%;background:' + cols[k % cols.length] + ';--dx:' + (Math.random() * 160 - 80).toFixed(0) + 'px;--rot:' + (Math.random() * 720 - 360).toFixed(0) + 'deg;animation-delay:' + (Math.random() * 0.35).toFixed(2) + 's"></i>';
  ov.insertAdjacentHTML('beforeend', '<div class="fx gk-conf" aria-hidden="true">' + fx + '</div>');
  setTimeout(function () { var x = ov.querySelector('.gk-conf'); if (x) x.remove(); }, 2200);
}
function gkFocus() { var i = document.getElementById('gkin'); if (i) { try { i.focus({ preventScroll: true }); } catch (e) { i.focus(); } } }
/* a tap during the opening jumps to the card; a tap on the card makes it wiggle */
A.gkSkip = function () {
  var ov = document.getElementById('gkov'), k = UI.gk; if (!ov || !k) return;
  if (ov.classList.contains('gk-play')) {
    UI.gkTok = (UI.gkTok || 0) + 1;
    ov.classList.remove('gk-play'); ov.classList.add('gk-static');
    var rm = ov.querySelectorAll('.gk-pack, .gk-flash, .gk-flare, .gk-ring, .gk-sparks, .gk-ribbon, .gk-vig'); for (var i = 0; i < rm.length; i++) rm[i].remove();
    gkFxSkip(); gkSndSkip(k);
    gkRevealFx(k); setTimeout(gkFocus, 60);
    return;
  }
  var c = ov.querySelector('.gk-card'); if (c) { c.classList.remove('wig'); void c.offsetWidth; c.classList.add('wig'); gVibe(12); }
};
function gkClose() { gkStopClock(); gkFxStop(); gkSndStop(); UI.gkTok = (UI.gkTok || 0) + 1; }
/* putting a card back uses up the draw: it is gone, the counter drops */
A.gkLater = function () {
  var k = UI.gk; if (!k || UI.gkClosing) return;
  gkClose();
  var P = gPass(); P.burned = (P.burned || 0) + 1; gPassSave();
  var finish = function () {
    UI.gkClosing = false; UI.gk = null;
    gSay(gkLeft() ? 'putback' : 'putback_last'); gRender();
    var n = document.getElementById('gdrawN'); if (n && n.classList) n.classList.add('tick');
  };
  var ov = document.getElementById('gkov');
  if (ov && ov.classList) { UI.gkClosing = true; ov.classList.remove('gk-play'); ov.classList.add('gk-static', 'gk-done'); setTimeout(finish, 460); }
  else finish();
};
A.gkDone = function () {
  var k = UI.gk; if (!k || !gkValid(k) || UI.gkClosing) return;
  gkClose();
  if (k.type === 'portrait') k.draw = gkEncode(k.strokes, true);
  var G = gForm(), card = { type: k.type, forId: k.forId, rar: k.rar, pts: k.pts, key: k.key };
  if (k.type === 'portrait') card.draw = k.draw;
  else card.text = String(k.text || '').trim().slice(0, gkMaxLen(k));
  if (k.cat) card.cat = k.cat;
  if (k.qk) card.qk = k.qk;
  var finish = function () {
    UI.gkClosing = false;
    G.cards = (G.cards || []).concat([card]);
    UI.gk = null; UI.gDrawSeen = false; UI.gkJust = card.key;
    gSay('done_' + card.type, null, { W: card.text || '' }); gVibe([20, 40, 20]);
    gRender();
    var m = document.getElementById('gkm-' + card.key); if (m) gScrollTo(m, 160);
  };
  var ov = document.getElementById('gkov');
  if (ov && ov.classList) { UI.gkClosing = true; ov.classList.remove('gk-play'); ov.classList.add('gk-static', 'gk-done'); setTimeout(finish, 460); }
  else finish();
};
A.gkPen = function (d) { var k = UI.gk; if (!k) return; k.pen = +d.v || 0; var b = app.querySelectorAll('.gk-pen'); for (var i = 0; i < b.length; i++) { var on = +b[i].getAttribute('data-v') === k.pen; b[i].classList.toggle('on', on); b[i].setAttribute('aria-pressed', on); } gVibe(8); };
A.gkStart = function () { var k = UI.gk; if (!k || k.type !== 'portrait') return; gkFxStop(); k.phase = 'draw'; k.strokes = []; k.t0 = Date.now(); gkStartClock(); gVibe(20); render(); };
A.gkRedo = function () { var k = UI.gk; if (!k || k.type !== 'portrait' || k.phase === 'ready') return; k.strokes = []; k.phase = 'draw'; k.t0 = Date.now(); gkStartClock(); render(); };
/* take back the last stroke */
A.gkUndo = function () { var k = UI.gk; if (!k || k.type !== 'portrait' || k.phase === 'ready' || !k.strokes.length) return; k.strokes.pop(); gkRestore(); gkPatchGo(); gVibe(8); };
function gkStartClock() { gkStopClock(); UI.gkClock = setInterval(gkTick, 100); }
function gkStopClock() { if (UI.gkClock) { clearInterval(UI.gkClock); UI.gkClock = null; } }
function gkSecsLeft(k) { return k.phase === 'draw' ? Math.max(0, GK_DRAW_SECS - (Date.now() - (k.t0 || Date.now())) / 1000) : k.phase === 'over' ? 0 : GK_DRAW_SECS; }
function gkTick() {
  var k = UI.gk; if (!k || k.type !== 'portrait' || k.phase !== 'draw') { gkStopClock(); return; }
  var left = gkSecsLeft(k);
  var el = document.getElementById('gkclock'); if (el) el.innerHTML = gkClockHtml(k);
  var pp = document.getElementById('gkpaper'); if (pp) pp.classList.toggle('hurry', left <= 8);
  if (left <= 0) { k.phase = 'over'; UI.gkDrawing = false; gkStopClock(); gVibe([120, 60, 120]); render(); }
}
function gkClockHtml(k) {
  var left = gkSecsLeft(k), C = 2 * Math.PI * 21;
  return '<svg viewBox="0 0 50 50" width="54" height="54" aria-hidden="true"><circle cx="25" cy="25" r="21" fill="#15122B" stroke="rgba(255,255,255,.18)" stroke-width="5"/><circle cx="25" cy="25" r="21" fill="none" stroke="' + (left <= 8 ? '#FF5A2E' : '#FFC940') + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - left / GK_DRAW_SECS)).toFixed(1) + '" transform="rotate(-90 25 25)"/></svg><b>' + Math.ceil(left) + '</b>';
}
/* drawing with finger or mouse: x and y each from 0 to 999 of the upright paper */
function gkPointer(e, t) {
  var k = UI.gk; if (!k || k.type !== 'portrait') return;
  var cv = document.getElementById('gkcv'); if (!cv) return;
  if (t === 'down') {
    if (e.target !== cv || k.phase !== 'draw') return;
    e.preventDefault(); UI.gkDrawing = true;
    try { cv.setPointerCapture(e.pointerId); } catch (x) {}
    k.strokes.push([k.pen]); gkAddPt(cv, e); return;
  }
  if (!UI.gkDrawing) return;
  if (t === 'move') { e.preventDefault(); var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : null; if (evs && evs.length) for (var i = 0; i < evs.length; i++) gkAddPt(cv, evs[i]); else gkAddPt(cv, e); return; }
  UI.gkDrawing = false; gkPatchGo();
}
function gkPaint(c, cv) { c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = 17 * cv.height / 1000; }
function gkAddPt(cv, e) {
  var k = UI.gk, r = cv.getBoundingClientRect(); if (!r.width) return;
  var x = Math.round((e.clientX - r.left) / r.width * 999), y = Math.round((e.clientY - r.top) / r.height * 999);
  x = Math.max(0, Math.min(999, x)); y = Math.max(0, Math.min(999, y));
  var s = k.strokes[k.strokes.length - 1], n = s.length;
  if (n >= 3) { var dx = x - s[n - 2], dy = y - s[n - 1]; if (dx * dx + dy * dy < 36) return; }
  if (gkTotalPts(k.strokes) > 3200) return;
  s.push(x, y);
  var c = cv.getContext && cv.getContext('2d'); if (!c) return;
  var fx = cv.width / 1000, fy = cv.height / 1000;
  gkPaint(c, cv); c.strokeStyle = c.fillStyle = GK_PENS[s[0]] || GK_PENS[0];
  if (n < 3) { c.beginPath(); c.arc(x * fx, y * fy, 9 * fy, 0, Math.PI * 2); c.fill(); }
  else { c.beginPath(); c.moveTo(s[n - 2] * fx, s[n - 1] * fy); c.lineTo(x * fx, y * fy); c.stroke(); }
  if (n === 1 || gkTotalPts(k.strokes) === 10) gkPatchGo();
}
/* after any render: paint the strokes again */
function gkRestore() {
  gkFxRebind();
  var k = UI.gk; if (!k || k.type !== 'portrait') return;
  var cv = document.getElementById('gkcv'); if (!cv || !cv.getContext) return;
  var c = cv.getContext('2d'); if (!c) return;
  var fx = cv.width / 1000, fy = cv.height / 1000;
  c.clearRect(0, 0, cv.width, cv.height); gkPaint(c, cv);
  (k.strokes || []).forEach(function (s) {
    c.strokeStyle = c.fillStyle = GK_PENS[s[0]] || GK_PENS[0];
    if (s.length === 3) { c.beginPath(); c.arc(s[1] * fx, s[2] * fy, 9 * fy, 0, Math.PI * 2); c.fill(); return; }
    c.beginPath(); c.moveTo(s[1] * fx, s[2] * fy); for (var i = 3; i + 1 < s.length; i += 2) c.lineTo(s[i] * fx, s[i + 1] * fy); c.stroke();
  });
}
function gkPatchGo() { var b = document.getElementById('gkgo'); if (b) { var ok = gkValid(UI.gk); b.disabled = !ok; b.classList.toggle('mint', ok); } }
/* the card tilts a little under the finger */
function gkTilt(e, out) {
  var ov = document.getElementById('gkov'); if (!ov || !ov.classList.contains('gk-static') || UI.gkDrawing) return;
  var t = ov.querySelector('.gk-tilt'), card = ov.querySelector('.gk-card'); if (!t || !card) return;
  if (out || !(e.target && e.target.closest && e.target.closest('.gk-card'))) { t.style.transform = ''; return; }
  var r = card.getBoundingClientRect(); if (!r.width) return;
  var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
  t.style.transform = 'rotateY(' + (px * 18).toFixed(1) + 'deg) rotateX(' + (-py * 14).toFixed(1) + 'deg)';
  card.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(0) + '%');
}

/* ---------- the hidden button ----------
   It waits until the last field is left (keyboard gone), then a corner peeks out
   from under "Abschicken", gets tugged a few times and finally shoots out. */
function gkPackMini() {
  return '<svg viewBox="0 0 40 48" width="34" height="41" aria-hidden="true"><defs><linearGradient id="gdpk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF0A8"/><stop offset=".45" stop-color="#FFC940"/><stop offset="1" stop-color="#FF7A45"/></linearGradient></defs><rect x="4" y="3" width="32" height="42" rx="4" fill="url(#gdpk)" stroke="#15122B" stroke-width="2.6"/><path d="M5 9.5h30M5 38.5h30" stroke="#15122B" stroke-width="2" stroke-dasharray="2.2 2.2"/><path d="M20 15.5l2.5 5.3 5.8.6-4.3 3.9 1.2 5.7-5.2-3-5.2 3 1.2-5.7-4.3-3.9 5.8-.6z" fill="#FFFFFF" stroke="#15122B" stroke-width="1.8" stroke-linejoin="round"/></svg>';
}
function gkBtnHtml() {
  var on = gkCanDraw(), left = gkLeft();
  if (!left) return '';
  var shown = on && UI.gDrawSeen;
  return '<div class="gdraw-wrap' + (shown ? ' on' : '') + (shown && UI.gkFresh ? ' fresh' : '') + '" id="gdrawWrap"><span class="gd-new" aria-hidden="true">Psst!</span><button type="button" class="gdraw' + (shown ? ' on' : '') + '" id="gdraw" data-act="gDraw"' + (shown ? '' : ' tabindex="-1" aria-hidden="true"') + ' aria-label="Bonuskarte ziehen, noch ' + left + '"><span class="gd-pack">' + gkPackMini() + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>Karte ziehen</b><small id="gdrawSub">' + (left === 1 ? 'Deine letzte Bonuskarte' : 'Bonuskarte mit Extra-Punkten') + '</small></span><span class="gd-n" id="gdrawN">' + left + '×</span><i class="gd-glint" aria-hidden="true"></i></button></div>';
}
function gkTyping() { var a = document.activeElement; return !!(a && a.tagName && /^(INPUT|TEXTAREA)$/.test(a.tagName) && app.contains(a)); }
/* called on every change and after every render */
function gkBtnPatch() {
  var w = document.getElementById('gdrawWrap'), b = document.getElementById('gdraw'); if (!w || !b) return;
  var on = gkCanDraw(), shown = b.classList.contains('on') || b.classList.contains('tug');
  if (!on) {
    clearTimeout(UI.gkRevealT); UI.gkWaitBlur = false;
    if (shown) { b.classList.remove('on', 'tug'); w.classList.remove('on', 'gd-peek', 'fresh'); b.setAttribute('aria-hidden', 'true'); b.setAttribute('tabindex', '-1'); }
    return;
  }
  if (shown) return;
  if (UI.gDrawSeen) { b.classList.add('on'); w.classList.add('on'); b.removeAttribute('aria-hidden'); b.removeAttribute('tabindex'); return; }
  gkRevealSoon();
}
function gkRevealSoon(delay) {
  clearTimeout(UI.gkRevealT);
  var wait = Math.max(delay == null ? 450 : delay, (UI.gkHoldUntil || 0) - Date.now());
  UI.gkRevealT = setTimeout(function () {
    if (!gkCanDraw() || UI.gDrawSeen) return;
    /* still typing: it comes the moment the field is left */
    if (gkTyping()) { UI.gkWaitBlur = true; return; }
    var hold = (UI.gkHoldUntil || 0) - Date.now(); if (hold > 0) { gkRevealSoon(hold + 40); return; }
    gkReveal();
  }, wait);
}
/* the field was left: give the keyboard a moment to slide away */
function gkFieldLeft() { if (!UI.gkWaitBlur) return; setTimeout(function () { if (gkTyping()) return; UI.gkWaitBlur = false; gkRevealSoon(480); }, 90); }
function gkReveal() {
  var w = document.getElementById('gdrawWrap'), b = document.getElementById('gdraw'); if (!w || !b || !gkCanDraw()) return;
  UI.gDrawSeen = true; UI.gkFresh = true; UI.gkTugAt = Date.now();
  b.classList.remove('on'); void b.offsetWidth;
  w.classList.add('gd-peek'); b.classList.add('tug'); b.removeAttribute('aria-hidden'); b.removeAttribute('tabindex');
  gVibe([6, 110, 7, 90, 8, 70, 10, 40]);
  setTimeout(function () { if (b.isConnected === false) return; w.classList.add('on'); gVibe([24, 30, 40]); gBurst(b, '#FFC940', 18); }, 820);
  setTimeout(function () { b.classList.remove('tug'); b.classList.add('on'); w.classList.remove('gd-peek'); w.classList.add('fresh'); }, 1320);
}
/* a level-up is on screen: the button waits until it is gone */
function gkHoldBtn() {
  UI.gkHoldUntil = Date.now() + 1950;
  var b = document.getElementById('gdraw'), w = document.getElementById('gdrawWrap');
  if (b && b.classList.contains('tug') && Date.now() - (UI.gkTugAt || 0) < 700) {
    b.classList.remove('tug', 'on'); if (w) w.classList.remove('gd-peek', 'on', 'fresh'); UI.gDrawSeen = false;
  }
  if (!UI.gDrawSeen && gkCanDraw()) gkRevealSoon(1980);
}

/* ---------- the overlay ---------- */
function gkPackHtml() {
  var cracks = ['M98 56L90 80L104 104L92 130L101 150', 'M40 56L52 76L38 98L50 118', 'M160 56L148 82L165 104L150 128L162 146', 'M101 150L80 172L96 196L84 220', 'M150 128L176 140L192 134', 'M50 118L24 126L4 120', 'M101 150L120 170L112 196L128 222L120 252', 'M84 220L60 236L66 264'];
  var leaks = ''; for (var i = 0; i < 9; i++) leaks += '<i style="--a:' + (i * 40 + 12) + 'deg;--i:' + i + '"></i>';
  return '<div class="gk-pack" aria-hidden="true"><div class="gk-leaks">' + leaks + '</div><div class="gk-pack-sh"><div class="gk-pack-top"><i class="gk-crimp"></i><span class="gk-perf"></span></div><div class="gk-pack-body"><i class="gk-crimp b"></i><span class="gk-pack-shine"></span>' +
    '<span class="gk-pack-logo"><svg width="46" height="64" viewBox="0 0 40 56"><use href="#sk" fill="#15122B"></use></svg></span><b class="gk-pack-t">Bonus</b><span class="gk-pack-s">zparkling · 1 Karte</span><span class="gk-pack-st"><i></i><i></i><i></i></span></div>' +
    '<svg class="gk-cracks" viewBox="0 0 196 286" width="196" height="286">' + cracks.map(function (d, i) { return '<path d="' + d + '" pathLength="100" style="--i:' + i + '"/>'; }).join('') + '</svg></div></div>';
}
function gkCardHtml(k, rar, st) {
  var t = gkTitle(k);
  return '<div class="gk-card"><div class="gk-tilt"><div class="gk-inner">' +
    '<div class="gk-face gk-back"><span class="gk-back-sk"><svg width="92" height="128" viewBox="0 0 40 56"><use href="#sk" fill="currentColor"></use></svg></span><b>zparkling</b><small>Bonuskarte</small></div>' +
    '<div class="gk-face gk-front"><div class="gk-fin">' +
    '<div class="gk-top"><span class="gk-rar">' + esc(rar.name) + '</span><span class="gk-no">Karte ' + k.no + ' von ' + GK_MAX + '</span></div>' +
    '<div class="gk-art"><span class="gk-art-ring"></span><span class="gk-art-c">' + emb(st.e, 92) + '</span></div>' +
    '<div class="gk-txt"><small>' + esc(gkKicker(k)) + '</small><b' + (t.length > 34 ? ' class="long"' : '') + '>' + esc(t) + '</b><span>' + esc(gkSub(k)) + '</span></div>' +
    '<div class="gk-foot"><span>+' + k.pts + ' Punkte</span><span>' + esc(k.type === 'joker' ? 'Für ' + gkName('') : gkName(k.forId)) + '</span></div></div>' +
    '<span class="gk-holo" aria-hidden="true"></span><span class="gk-stamp" aria-hidden="true">' + esc(rar.name) + '</span></div>' +
    '</div></div></div>';
}
function gkPanelHtml(k) {
  var more = demoOn() ? '<p class="gk-hint gk-more">' + icon('i-lock', 13) + 'Es gibt noch mehr Karten. Die siehst du mit dem Game Pass.</p>' : '';
  var ok = gkValid(k), later = '<button type="button" class="gk-later" data-act="gkLater">Zurücklegen</button>';
  later += more;
  var go = function (label) { return '<button type="button" class="cta gk-go' + (ok ? ' mint' : '') + '" id="gkgo" data-act="gkDone"' + (ok ? '' : ' disabled') + '>' + label + '</button>'; };
  if (k.type === 'portrait') {
    if (k.phase === 'ready') return '<button type="button" class="cta" data-act="gkStart">' + icon('i-play', 18) + 'Los, ' + GK_DRAW_SECS + ' Sekunden!</button><p class="gk-hint">Die Uhr startet erst mit dem Tippen. Mal einfach drauflos.</p>' + later;
    var pens = GK_PENS.map(function (c, i) { var on = (k.pen || 0) === i; return '<button type="button" class="gk-pen' + (on ? ' on' : '') + '" data-act="gkPen" data-v="' + i + '" aria-pressed="' + on + '" aria-label="Farbe ' + (i + 1) + '" style="--pc:' + c + '"></button>'; }).join('');
    return '<div class="gk-dhead"><span class="gk-dhead-e">' + emb('brush', 30) + '</span><span class="stack grow" style="gap:1px;min-width:0"><b>' + esc(gkTitle(k)) + '</b><small>' + (k.phase === 'over' ? 'Fertig gemalt. Einlösen oder nochmal?' : 'Mal los, die Uhr läuft!') + '</small></span><span class="gk-clock" id="gkclock">' + gkClockHtml(k) + '</span></div>' +
      '<div class="gk-paper' + (k.phase === 'over' ? ' over' : '') + '" id="gkpaper"><canvas id="gkcv" width="720" height="960" aria-label="Zeichenfläche für das Porträt"></canvas>' + (k.phase === 'over' ? '<span class="gk-over">Zeit um!</span>' : '') + '</div>' +
      '<div class="gk-tools"><div class="gk-pens" role="group" aria-label="Stiftfarbe">' + pens + '</div><button type="button" class="gk-undo" data-act="gkUndo" aria-label="Letzten Strich zurücknehmen">' + icon('i-undo', 18) + '</button></div>' +
      '<div class="cta-row"><button type="button" class="btn-dark" data-act="gkRedo">Neu anfangen</button>' + go('Einlösen · +' + k.pts) + '</div>' + later;
  }
  if (k.type === 'joker') {
    return '<label class="field" for="gkin">Deine Bedingung (freiwillig)<input id="gkin" class="input gk-in jk" type="text" maxlength="60" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" data-bind="gk.text" value="' + esc(k.text) + '" placeholder="z. B. Nur gegen eine Umarmung"></label>' +
      '<p class="gk-hint">Der Spielleiter sieht, dass du den Joker hast. Wer verliert, fragt dich, ob du ihn einlöst. Sagst du ja, fällt ein ' + esc(gkUnit()) + ' weg.</p>' + go('Joker einstecken · +' + k.pts) + later;
  }
  var long = k.type === 'spruch', c = wennCat(k.cat), uq = umfrageQ(k.qk);
  var ph = k.type === 'wenn' ? (c ? c[3] : '') : k.type === 'umfrage' ? (uq ? uq[2] : '') : 'z. B. Das kriegen wir schon hin!';
  var label = k.type === 'wenn' ? (c ? c[2] : 'Dein Wort') + '?' : k.type === 'umfrage' ? 'Deine Antwort, ein Wort' : 'Der Spruch';
  var inp = long ? '<textarea id="gkin" class="input area gk-in" maxlength="90" data-bind="gk.text" enterkeyhint="done" placeholder="' + esc(ph) + '">' + esc(k.text) + '</textarea>'
    : '<input id="gkin" class="input big gk-in" type="text" maxlength="28" autocomplete="off" autocapitalize="sentences" enterkeyhint="done" data-bind="gk.text" value="' + esc(k.text) + '" placeholder="' + esc(ph) + '">';
  return '<label class="field" for="gkin">' + esc(label) + inp + '</label>' + go('Karte einlösen · +' + k.pts) + later;
}
function gkTimeVars() { var o = ''; Object.keys(GK_T).forEach(function (n) { o += '--t-' + n + ':' + (GK_T[n] / 1000) + 's;'; }); return o; }
function gkOverlay() {
  var k = UI.gk; if (!k) return '';
  var rar = gkRar(k.rar), st = GQ_STYLE[k.type], play = !k.played, fx = '';
  k.played = true;
  if (play) {
    var sp = '';
    for (var i = 0; i < 24; i++) {
      var a = i / 24 * Math.PI * 2 + Math.random() * 0.25, d = 140 + Math.random() * 150;
      sp += '<i' + (i % 3 === 0 ? ' class="st"' : '') + ' style="--x:' + (Math.cos(a) * d).toFixed(0) + 'px;--y:' + (Math.sin(a) * d).toFixed(0) + 'px;--d:' + (Math.random() * 0.14).toFixed(2) + 's;--r:' + (Math.random() * 360).toFixed(0) + 'deg"></i>';
    }
    var word = (rar.name + ' ★ ').repeat(6);
    fx = '<div class="gk-flare" aria-hidden="true"></div><div class="gk-ring" aria-hidden="true"></div><div class="gk-ring r2" aria-hidden="true"></div><div class="gk-ring r3" aria-hidden="true"></div><div class="gk-sparks" aria-hidden="true">' + sp + '</div>' +
      '<div class="gk-ribbon" aria-hidden="true"><b>' + esc(word) + '</b></div>';
  }
  var draw = k.type === 'portrait' && k.phase !== 'ready', snd = gkSoundOn();
  return '<div class="gk-ov r-' + rar.id + ' ' + (play ? 'gk-play' : 'gk-static') + (draw ? ' gk-drawmode' : '') + '" id="gkov" role="dialog" aria-modal="true" aria-label="Bonuskarte: ' + esc(gkTitle(k)) + '" style="--rc:' + rar.c + ';--rc2:' + rar.c2 + ';--tc:' + st.c + ';' + gkTimeVars() + '">' +
    '<div class="gk-bg"></div>' + (play ? '<div class="gk-vig" aria-hidden="true"></div>' : '') + '<canvas class="gk-cv" id="gkfx" aria-hidden="true"></canvas>' +
    (play ? '<div class="gk-flash" aria-hidden="true"></div><div class="gk-flash f2" aria-hidden="true"></div>' : '') +
    '<div class="gk-scroll"><div class="gk-col"><div class="gk-stage" data-act="gkSkip"><div class="gk-raysw" aria-hidden="true"><div class="gk-rays"></div></div><div class="gk-glow" aria-hidden="true"></div>' + fx + (play ? gkPackHtml() : '') + gkCardHtml(k, rar, st) + '</div>' +
    '<div class="gk-panel">' + gkPanelHtml(k) + '</div></div></div>' +
    '<button type="button" class="gk-mute' + (snd ? '' : ' off') + '" data-act="gkMute" aria-pressed="' + !snd + '" aria-label="' + (snd ? 'Ton ausschalten' : 'Ton einschalten') + '">' + gkSpeaker(snd) + '</button></div>';
}
function gkSpeaker(on) {
  return '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>' + (on ? '<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>' : '<path d="M17 9l5 6M22 9l-5 6"/>') + '</svg>';
}

/* redeemed cards in the list of contributions */
function gkMiniHtml() {
  var cards = gForm().cards || []; if (!cards.length) return '';
  var just = UI.gkJust;
  return '<span class="eyebrow mt22 block">Deine Bonuskarten · ' + cards.length + ' von ' + GK_MAX + '</span>' + cards.map(function (c) {
    var rar = gkRar(c.rar), st = GQ_STYLE[c.type], N = gkName(c.forId), wc = wennCat(c.cat);
    var line = c.type === 'joker' ? (c.text ? 'Dein Joker. Bedingung: ' + c.text : 'Dein Joker, ohne Bedingung') : c.type === 'portrait' ? 'Porträt von ' + N : c.type === 'wenn' ? 'Wenn ' + N + ' ' + (wc ? wc[1] : '') + ' wäre: ' + c.text : c.type === 'spruch' ? '„' + c.text + '“' : umfrageText(c.qk, N) + ' ' + c.text;
    return '<div class="gk-mini r-' + rar.id + (just === c.key ? ' just' : '') + '" id="gkm-' + c.key + '" style="--rc:' + rar.c + ';--rc2:' + rar.c2 + ';--tc:' + st.c + '"><span class="gk-mini-art">' + (c.type === 'portrait' ? drawSvg(c.draw, 50) : emb(st.e, 34)) + '</span><span class="stack grow" style="gap:2px;min-width:0"><small>Bonuskarte · ' + esc(rar.name) + '</small><b>' + esc(qTypeLabel(c.type)) + '</b><span class="gk-mini-t">' + esc(line) + '</span></span><span class="gk-mini-p">+' + c.pts + '</span></div>';
  }).join('');
}
/* what a redeemed card becomes for the master */
function gkToQ(c, author, i) {
  var q = { id: 'q' + Date.now() + Math.floor(Math.random() * 1000) + 'k' + i, t: Date.now() + 50 + i, author: author, forId: c.forId || '', type: c.type, text: c.type === 'portrait' ? 'Porträt' : c.text || '', unit: '', answer: '', options: [], correct: 0, min: '', max: '', note: '', status: 'offen', used: false, rar: c.rar };
  if (c.type === 'portrait') q.draw = c.draw;
  if (c.cat) q.cat = c.cat;
  if (c.qk) q.qk = c.qk;
  return q;
}
GQ_REACT.done_portrait = ['Bin ich das? Ich bin geschmeichelt… glaub ich.', 'Ein echtes Kunstwerk! Das kommt an die Wand.'];
GQ_REACT.done_wenn = ['{W}? Darüber muss ich erst mal nachdenken…', 'Ha, {W}! Das hätte ich jetzt nicht gedacht.'];
GQ_REACT.done_spruch = ['Sag ich das wirklich so oft?!', 'Erwischt. Das sag ich echt ständig.'];
GQ_REACT.done_umfrage = ['Mal sehen, ob ich das heute Abend errate!', 'Notiert für die Tafel. Ich bin gespannt!'];
GQ_REACT.done_joker = ['Du hast meinen Joker? Dann bin ich heute ganz besonders nett zu dir.', 'Ein Joker! Bitte sei gnädig mit mir…'];
GQ_MOOD.done_joker = 'verliebt';
GQ_REACT.putback = ['Zurückgelegt. Die ist weg, eine Karte hast du noch.', 'Okay, die nicht. Eine letzte Karte wartet noch.'];
GQ_REACT.putback_last = ['Zurückgelegt. Das war deine letzte Karte.', 'Schade drum! Mehr Karten gibt es nicht.'];
GQ_MOOD.putback = 'denken'; GQ_MOOD.putback_last = 'mist';
GQ_MOOD.done_portrait = 'staunen'; GQ_MOOD.done_wenn = 'denken'; GQ_MOOD.done_spruch = 'mist'; GQ_MOOD.done_umfrage = 'cool';
G_STICKERS.push(['karte', 'cards', 'Kartenzieher', function (s) { return s.cards >= 1; }], ['legende', 'starburst', 'Legendärer Zug', function (s) { return s.leg; }], ['joker', 'joker', 'Jokerträger', function (s) { return s.joker; }]);

/* ---------- emblems ---------- */
EMB_ART.brush = '<path d="M7 41c5 2.5 13 .5 15.5-6" fill="none" stroke="#FF7A45" stroke-width="5" stroke-linecap="round"/><path d="M41 6L25 23" stroke="#1B1530" stroke-width="8.5" stroke-linecap="round"/><path d="M41 6L25 23" stroke="#FFC940" stroke-width="4" stroke-linecap="round"/><path d="M21 20.5l6.5 6.5-3.2 3.2-6.5-6.5z" fill="#F4F1FF" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M17.6 24.2l6.2 6.2c-1.8 5.4-6.9 8.6-13.3 7.6-.5-6.3 2-11.6 7.1-13.8z" fill="#9886FF" stroke="#1B1530" stroke-width="2.3" stroke-linejoin="round"/>';
EMB_ART.quote = '<path d="M9 8h30a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H23l-9 8v-8H9a5 5 0 0 1-5-5V13a5 5 0 0 1 5-5z" fill="#FFA9A0" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="17.5" cy="19" r="3.8" fill="#1B1530"/><path d="M21.2 19c0 4.2-2.1 6.6-5.3 7.6" stroke="#1B1530" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="29.5" cy="19" r="3.8" fill="#1B1530"/><path d="M33.2 19c0 4.2-2.1 6.6-5.3 7.6" stroke="#1B1530" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
EMB_ART.podium = '<rect x="17" y="17" width="14" height="25" fill="#FFC940" stroke="#1B1530" stroke-width="2.4"/><rect x="5" y="25" width="12" height="17" fill="#6FD3FF" stroke="#1B1530" stroke-width="2.4"/><rect x="31" y="30" width="12" height="12" fill="#FF8FC4" stroke="#1B1530" stroke-width="2.4"/><path d="M22.5 24.5l2-1.6V33" fill="none" stroke="#1B1530" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 42h42" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/><path d="M24 3.5l2 4 4.4.6-3.2 3 .8 4.3-4-2.1-4 2.1.8-4.3-3.2-3 4.4-.6z" fill="#FFFFFF" stroke="#1B1530" stroke-width="1.7" stroke-linejoin="round"/>';
EMB_ART.thought = '<path d="M14.5 31.5a8 8 0 0 1-1.4-15.9A10.5 10.5 0 0 1 32.6 12a8.2 8.2 0 0 1 4.9 14.9 7 7 0 0 1-7 4.6z" fill="#B6F07C" stroke="#1B1530" stroke-width="2.5" stroke-linejoin="round"/><circle cx="13" cy="38" r="3.2" fill="#B6F07C" stroke="#1B1530" stroke-width="2.2"/><circle cx="7.5" cy="43.5" r="2" fill="#B6F07C" stroke="#1B1530" stroke-width="2"/><path d="M20.6 17.8a3.6 3.6 0 1 1 5.1 3.3c-1.3.6-2 1.4-2 2.9" fill="none" stroke="#1B1530" stroke-width="2.6" stroke-linecap="round"/><circle cx="23.7" cy="27.6" r="1.7" fill="#1B1530"/>';
EMB_ART.cards = '<rect x="8" y="9" width="20" height="29" rx="3.5" fill="#9886FF" stroke="#1B1530" stroke-width="2.4" transform="rotate(-14 18 23.5)"/><rect x="19" y="9" width="20" height="29" rx="3.5" fill="#FFC940" stroke="#1B1530" stroke-width="2.4" transform="rotate(10 29 23.5)"/><path d="M29 17l1.7 3.4 3.7.5-2.7 2.6.7 3.7-3.4-1.8-3.4 1.8.7-3.7-2.7-2.6 3.7-.5z" fill="#FFFFFF" stroke="#1B1530" stroke-width="1.5" stroke-linejoin="round" transform="rotate(10 29 23.5)"/>';
EMB_ART.starburst = '<path d="M24 3l4.6 8.6 9.4-2.8-2.8 9.4L44 24l-8.8 4.8 2.8 9.4-9.4-2.8L24 44l-4.6-8.6-9.4 2.8 2.8-9.4L4 24l8.8-4.8L10 9.8l9.4 2.8z" fill="#FFC940" stroke="#1B1530" stroke-width="2.4" stroke-linejoin="round"/><circle cx="24" cy="24" r="7" fill="#FF7A45" stroke="#1B1530" stroke-width="2.2"/><circle cx="21.8" cy="21.8" r="1.8" fill="#FFFFFF"/>';

EMB_ART.joker = '<rect x="9" y="5" width="30" height="38" rx="5" fill="#FFFFFF" stroke="#1B1530" stroke-width="2.5"/><path d="M16.5 31c-.8-6.5-3.2-10.4-7.3-12.3 5-.9 8.9 2.5 10.9 7.3.1-7.2 1.8-12.2 3.9-15.2 2.1 3 3.8 8 3.9 15.2 2-4.8 5.9-8.2 10.9-7.3-4.1 1.9-6.5 5.8-7.3 12.3z" fill="#FF6FD8" stroke="#1B1530" stroke-width="2.2" stroke-linejoin="round"/><path d="M24 11v16" stroke="#6FE3FF" stroke-width="3"/><rect x="15" y="30" width="18" height="6" rx="2" fill="#FFC940" stroke="#1B1530" stroke-width="2.2"/><circle cx="9.5" cy="18.5" r="2.6" fill="#FFC940" stroke="#1B1530" stroke-width="1.7"/><circle cx="24" cy="10.5" r="2.6" fill="#FFC940" stroke="#1B1530" stroke-width="1.7"/><circle cx="38.5" cy="18.5" r="2.6" fill="#FFC940" stroke="#1B1530" stroke-width="1.7"/>';

/* a hand-drawn looking face for the demo evening: head, hair, eyes, smile and one extra */
function demoDoodle(seed, style) {
  var a = seed * 9301 + 49297, rnd = function () { a = (a * 9301 + 49297) % 233280; return a / 233280; };
  var j = function (v, d) { return Math.round(v + (rnd() - 0.5) * 2 * d); }, strokes = [];
  var head = [0], cx = j(500, 20), cy = j(540, 20), rx = j(250, 25), ry = j(290, 25);
  for (var i = 0; i <= 30; i++) { var t = i / 30 * Math.PI * 2 + 0.3; head.push(j(cx + Math.cos(t) * rx, 9), j(cy + Math.sin(t) * ry, 9)); }
  strokes.push(head);
  var hair = [style === 3 ? 1 : 0], top = cy - ry + 30;
  for (var h = 0; h <= 10; h++) hair.push(j(cx - rx + 40 + h * (rx * 2 - 80) / 10, 6), h % 2 ? j(top - 70, 15) : j(top + 10, 8));
  strokes.push(hair);
  strokes.push([0, j(cx - 95, 8), j(cy - 40, 8), j(cx - 90, 6), j(cy - 32, 6)], [0, j(cx + 95, 8), j(cy - 40, 8), j(cx + 100, 6), j(cy - 32, 6)]);
  var sm = [1]; for (var m = 0; m <= 8; m++) { var u = m / 8; sm.push(j(cx - 120 + u * 240, 5), j(cy + 90 + Math.sin(u * Math.PI) * 70, 5)); }
  strokes.push(sm);
  if (style === 0) strokes.push([1, cx - 110, top - 30, cx, top - 250, cx + 110, top - 30]);
  if (style === 1) { var g1 = [2], g2 = [2]; for (var k = 0; k <= 16; k++) { var w = k / 16 * Math.PI * 2; g1.push(Math.round(cx - 95 + Math.cos(w) * 62), Math.round(cy - 36 + Math.sin(w) * 50)); g2.push(Math.round(cx + 95 + Math.cos(w) * 62), Math.round(cy - 36 + Math.sin(w) * 50)); } strokes.push(g1, g2, [2, cx - 33, cy - 40, cx + 33, cy - 40]); }
  if (style === 2) { var b = [3]; for (var z = 0; z <= 12; z++) b.push(j(cx - 200 + z * 400 / 12, 5), z % 2 ? cy + ry - 10 : cy + ry + 60); strokes.push(b); }
  if (style === 3) { var bun = [1]; for (var q = 0; q <= 14; q++) { var w2 = q / 14 * Math.PI * 2; bun.push(Math.round(cx + Math.cos(w2) * 70), Math.round(top - 120 + Math.sin(w2) * 60)); } strokes.push(bun); }
  strokes.forEach(function (s) { for (var i2 = 1; i2 < s.length; i2++) s[i2] = Math.max(0, Math.min(999, s[i2])); });
  return gkEncode(strokes);
}
