/* =========================================================
   Avatar system (viewBox 0 0 120 120, head centre 60/56)
   ========================================================= */
var INK = '#1B1530';
var AV = {
  skins: ['#FBE0CB', '#F2C6A0', '#E0A77A', '#C68A5E', '#9A6440', '#6B4126'],
  shapes: [['rund', 'Rund'], ['oval', 'Oval'], ['eckig', 'Eckig'], ['breit', 'Breit']],
  hairs: [['kurz', 'Kurz'], ['seite', 'Scheitel'], ['wuschel', 'Wuschel'], ['locken', 'Locken'], ['afro', 'Afro'], ['lang', 'Lang'], ['bob', 'Bob'], ['zopf', 'Zopf'], ['dutt', 'Dutt'], ['iro', 'Iro'], ['glatze', 'Glatze']],
  hairColors: [['#1E1611', 'Schwarz'], ['#4A2E1C', 'Dunkel'], ['#8A5A32', 'Braun'], ['#D9A24A', 'Blond'], ['#EED89A', 'Hellblond'], ['#C2552B', 'Rot'], ['#B9B4CC', 'Grau'], ['#FF7AB6', 'Pink'], ['#5B8CFF', 'Blau'], ['#48D9A6', 'Mint']],
  eyes: [['punkte', 'Punkte'], ['gross', 'Groß'], ['muede', 'Müde'], ['zwinker', 'Zwinker'], ['sterne', 'Sterne'], ['herz', 'Herzen'], ['cool', 'Cool']],
  brows: [['normal', 'Normal'], ['buschig', 'Buschig'], ['hoch', 'Hoch'], ['boese', 'Böse'], ['duenn', 'Dünn']],
  mouths: [['laecheln', 'Lächeln'], ['grinsen', 'Grinsen'], ['lachen', 'Lachen'], ['zunge', 'Zunge'], ['schief', 'Schief'], ['oh', 'Oh'], ['frech', 'Frech']],
  beards: [['keiner', 'Ohne'], ['schnurr', 'Schnurrbart'], ['dreitage', 'Dreitage'], ['voll', 'Vollbart'], ['kinn', 'Kinnbart']],
  glasses: [['keine', 'Ohne'], ['rund', 'Rund'], ['eckig', 'Eckig'], ['sonne', 'Sonne'], ['herz', 'Herz'], ['party', 'Party']],
  hats: [['keiner', 'Ohne'], ['partyhut', 'Partyhut'], ['krone', 'Krone'], ['cap', 'Cap'], ['muetze', 'Mütze'], ['stirnband', 'Stirnband'], ['torte', 'Torte'], ['socke', 'Sockenhut'], ['schachteln', 'Schachteln'], ['sterne', 'Haarreif']],
  necks: [['keiner', 'Ohne'], ['sockenkranz', 'Sockenkranz'], ['schachtelkranz', 'Schachtelkranz'], ['fliege', 'Fliege'], ['kette', 'Kette']],
  outfits: [['tshirt', 'Shirt'], ['hemd', 'Hemd'], ['hoodie', 'Hoodie'], ['trikot', 'Trikot'], ['ringel', 'Ringel']],
  outfitColors: ['#9886FF', '#FF7A45', '#48D9A6', '#FFC940', '#2C2750', '#F4F1FF', '#FF7AB6', '#5B8CFF'],
  bgs: ['#48D9A6', '#FFC940', '#FF7A45', '#9886FF', '#FF7AB6', '#5B8CFF', '#F4F1FF', '#2C2750'],
  patterns: [['keins', 'Ohne'], ['punkte', 'Punkte'], ['streifen', 'Streifen'], ['konfetti', 'Konfetti'], ['strahlen', 'Strahlen']],
  extras: [['rouge', 'Rouge'], ['sommersprossen', 'Sommersprossen'], ['ohrringe', 'Ohrringe'], ['muttermal', 'Muttermal'], ['pflaster', 'Pflaster']]
};
var EAR_X = { rund: [34.5, 85.5], oval: [36.5, 83.5], eckig: [35.5, 84.5], breit: [32.5, 87.5] };

function avDefault() {
  return { bg: '#48D9A6', pat: 'punkte', skin: '#F2C6A0', shape: 'rund', hair: 'kurz', hairColor: '#4A2E1C', eyes: 'gross', brows: 'normal', mouth: 'laecheln', beard: 'keiner', glasses: 'keine', hat: 'partyhut', neck: 'keiner', outfit: 'tshirt', outfitColor: '#9886FF', ex: { rouge: true }, num: '25' };
}
function avRandom(seedNum) {
  function p(a) { return a[Math.floor(Math.random() * a.length)]; }
  var c = avDefault();
  c.bg = p(AV.bgs); c.pat = p(AV.patterns)[0]; c.skin = p(AV.skins); c.shape = p(AV.shapes)[0];
  c.hair = p(AV.hairs)[0]; c.hairColor = p(AV.hairColors)[0]; c.eyes = p(['punkte', 'gross', 'gross', 'zwinker', 'muede', 'sterne', 'cool']);
  c.brows = p(AV.brows)[0]; c.mouth = p(['laecheln', 'grinsen', 'lachen', 'zunge', 'schief', 'frech']);
  c.beard = Math.random() < 0.35 ? p(AV.beards)[0] : 'keiner'; c.glasses = Math.random() < 0.4 ? p(AV.glasses)[0] : 'keine';
  c.hat = p(AV.hats)[0]; c.neck = p(AV.necks)[0]; c.outfit = p(AV.outfits)[0]; c.outfitColor = p(AV.outfitColors);
  c.ex = { rouge: Math.random() < 0.6, sommersprossen: Math.random() < 0.3, ohrringe: Math.random() < 0.25 };
  if (seedNum) c.num = String(seedNum);
  if (c.bg === c.outfitColor) c.outfitColor = c.bg === '#2C2750' ? '#FFC940' : '#2C2750';
  return c;
}
function avFix(c) {
  var d = avDefault();
  c = c || {};
  for (var k in d) if (c[k] === undefined) c[k] = d[k];
  if (!c.ex) c.ex = {};
  return c;
}

function avPattern(c) {
  var o = '', i, j;
  if (c.pat === 'punkte') {
    for (i = 0; i < 6; i++) for (j = 0; j < 6; j++) o += '<circle cx="' + (8 + i * 22 + (j % 2) * 11) + '" cy="' + (8 + j * 22) + '" r="2.4" fill="#fff" fill-opacity=".28"/>';
  } else if (c.pat === 'streifen') {
    o += '<g transform="rotate(35 60 60)">';
    for (i = 0; i < 10; i++) o += '<rect x="' + (-60 + i * 26) + '" y="-60" width="11" height="240" fill="#fff" fill-opacity=".2"/>';
    o += '</g>';
  } else if (c.pat === 'konfetti') {
    var bits = [[14, 18, 20, '#FFC940'], [98, 14, -30, '#FF7AB6'], [104, 46, 50, '#5B8CFF'], [12, 52, -15, '#FF7A45'], [22, 88, 40, '#48D9A6'], [100, 84, -50, '#FFC940'], [34, 8, 70, '#9886FF'], [82, 6, 10, '#48D9A6'], [8, 30, 60, '#FFFFFF'], [110, 28, -20, '#FFFFFF']];
    bits.forEach(function (b) { o += '<rect x="' + (b[0] - 3) + '" y="' + (b[1] - 1.5) + '" width="7" height="3.2" rx="1" fill="' + b[3] + '" transform="rotate(' + b[2] + ' ' + b[0] + ' ' + b[1] + ')"/>'; });
  } else if (c.pat === 'strahlen') {
    for (i = 0; i < 12; i += 2) {
      var a1 = i * Math.PI / 6, a2 = (i + 1) * Math.PI / 6;
      o += '<path d="M60 60 L' + (60 + 120 * Math.cos(a1)).toFixed(1) + ' ' + (60 + 120 * Math.sin(a1)).toFixed(1) + ' L' + (60 + 120 * Math.cos(a2)).toFixed(1) + ' ' + (60 + 120 * Math.sin(a2)).toFixed(1) + ' Z" fill="#fff" fill-opacity=".16"/>';
    }
  }
  return o;
}

function avHairBack(c) {
  var h = c.hair, f = c.hairColor;
  if (h === 'afro') return '<circle cx="60" cy="47" r="38" fill="' + f + '"/>';
  if (h === 'lang') return '<path d="M30 54 C28 32 42 20 60 20 C78 20 92 32 90 54 L92 96 C86 100 80 98 77 92 L77 62 L43 62 L43 92 C40 98 34 100 28 96 Z" fill="' + f + '"/>';
  if (h === 'bob') return '<path d="M30 60 C28 36 42 22 60 22 C78 22 92 36 90 60 L90 76 C88 80 84 80 82 76 L82 56 L38 56 L38 76 C36 80 32 80 30 76 Z" fill="' + f + '"/>';
  if (h === 'zopf') return '<path d="M80 34 C99 36 106 60 97 86 C94 73 90 60 83 50 Z" fill="' + f + '"/>';
  if (h === 'dutt') return '<circle cx="60" cy="23" r="11" fill="' + f + '"/>';
  return '';
}
function avHairFront(c) {
  var h = c.hair, f = c.hairColor;
  switch (h) {
    case 'kurz': return '<path d="M33 56 C31 36 44 25 61 25 C78 25 90 37 87 56 C84 45 74 38 60 38 C47 38 37 45 33 56 Z" fill="' + f + '"/>';
    case 'seite': return '<path d="M34 54 C33 35 45 24 61 24 C79 24 89 36 86 54 C83 44 76 40 70 40 C60 40 53 33 47 35 C41 37 37 45 34 54 Z" fill="' + f + '"/>';
    case 'wuschel': return '<path d="M32 56 L29 42 L37 43 L34 31 L45 34 L46 23 L55 30 L61 20 L67 30 L76 23 L77 34 L87 31 L84 43 L91 42 L88 56 C82 45 72 39 60 39 C48 39 38 45 32 56 Z" fill="' + f + '"/>';
    case 'locken': return '<g fill="' + f + '"><circle cx="36" cy="49" r="9"/><circle cx="39" cy="38" r="9"/><circle cx="48" cy="30" r="9"/><circle cx="60" cy="27" r="10"/><circle cx="72" cy="30" r="9"/><circle cx="81" cy="38" r="9"/><circle cx="84" cy="49" r="9"/><path d="M34 50 C34 36 46 28 60 28 C74 28 86 36 86 50 C80 44 70 40 60 40 C50 40 40 44 34 50 Z"/></g>';
    case 'afro': return '<path d="M35 49 C38 38 48 34 60 34 C72 34 82 38 85 49 C78 44 70 42 60 42 C50 42 42 44 35 49 Z" fill="' + f + '"/>';
    case 'lang': return '<path d="M34 54 C33 37 45 27 60 27 C75 27 87 37 86 54 C82 44 74 37 63 36 C56 42 44 48 34 54 Z" fill="' + f + '"/>';
    case 'bob': return '<path d="M35 51 C35 36 46 27 60 27 C74 27 85 36 85 51 C76 47 44 47 35 51 Z" fill="' + f + '"/>';
    case 'zopf': return '<path d="M33 55 C31 36 44 26 61 26 C78 26 90 37 87 55 C84 45 74 39 60 39 C47 39 37 45 33 55 Z" fill="' + f + '"/><circle cx="84" cy="38" r="3.2" fill="#FF7AB6"/>';
    case 'dutt': return '<path d="M34 54 C33 37 45 28 60 28 C75 28 87 37 86 54 C82 44 72 39 60 39 C48 39 38 44 34 54 Z" fill="' + f + '"/><rect x="52" y="30" width="16" height="4" rx="2" fill="#FF7AB6"/>';
    case 'iro': return '<path d="M35 52 C34 40 44 32 60 32 C76 32 86 40 85 52 C78 46 70 44 60 44 C50 44 42 46 35 52 Z" fill="' + f + '" fill-opacity=".3"/><path d="M53 43 L51 22 L57 27 L60 13 L64 26 L70 19 L68 43 Z" fill="' + f + '"/>';
    case 'glatze': return '<ellipse cx="51" cy="38" rx="7" ry="3.4" fill="#fff" fill-opacity=".35" transform="rotate(-20 51 38)"/>';
  }
  return '';
}
function avHead(c) {
  var s = c.skin;
  if (c.shape === 'oval') return '<ellipse cx="60" cy="56" rx="24" ry="28" fill="' + s + '"/>';
  if (c.shape === 'eckig') return '<rect x="35" y="30" width="50" height="54" rx="17" fill="' + s + '"/>';
  if (c.shape === 'breit') return '<ellipse cx="60" cy="57" rx="28" ry="25" fill="' + s + '"/>';
  return '<circle cx="60" cy="56" r="26" fill="' + s + '"/>';
}
function avOutfit(c) {
  var col = c.outfitColor, o = '';
  var body = '<path d="M14 122 C16 100 34 90 60 90 C86 90 104 100 106 122 Z" fill="' + col + '"/>';
  var light = ['#F4F1FF', '#FFC940', '#48D9A6'].indexOf(col) >= 0;
  if (c.outfit === 'hoodie') {
    o += '<path d="M33 98 C28 80 43 73 60 73 C77 73 92 80 87 98 Z" fill="' + col + '"/><path d="M33 98 C28 80 43 73 60 73 C77 73 92 80 87 98 Z" fill="#000" fill-opacity=".18"/>';
  }
  o += '<rect x="52" y="74" width="16" height="20" rx="4" fill="' + c.skin + '"/><rect x="52" y="74" width="16" height="7" fill="#000" fill-opacity=".12"/>';
  o += body;
  if (c.outfit === 'tshirt') o += '<path d="M50 90 Q60 100 70 90 Z" fill="' + c.skin + '"/><path d="M49 90 Q60 101 71 90" stroke="#000" stroke-opacity=".22" stroke-width="2.4" fill="none"/>';
  if (c.outfit === 'hemd') o += '<path d="M51 90 L60 101 L69 90 Z" fill="' + c.skin + '"/><path d="M49 88 L60 101 L54 107 L44 93 Z" fill="#fff"/><path d="M71 88 L60 101 L66 107 L76 93 Z" fill="#fff"/><circle cx="60" cy="109" r="1.7" fill="#000" fill-opacity=".35"/><circle cx="60" cy="117" r="1.7" fill="#000" fill-opacity=".35"/>';
  if (c.outfit === 'hoodie') o += '<path d="M49 90 Q60 99 71 90 Z" fill="' + c.skin + '"/><path d="M55 96 L54 112" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M65 96 L66 112" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
  if (c.outfit === 'trikot') o += '<path d="M52 90 L60 100 L68 90 Z" fill="' + c.skin + '"/><path d="M16 112 C18 102 26 96 34 93 L36 104 Z M104 112 C102 102 94 96 86 93 L84 104 Z" fill="#fff" fill-opacity=".45"/><text x="60" y="117" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="13" fill="' + (light ? INK : '#fff') + '">' + String(c.num || '25').slice(0, 2) + '</text>';
  if (c.outfit === 'ringel') o += '<path d="M50 90 Q60 99 70 90 Z" fill="' + c.skin + '"/><rect x="17" y="103" width="86" height="5" fill="#fff" fill-opacity=".55"/><rect x="15" y="113" width="90" height="5" fill="#fff" fill-opacity=".55"/>';
  return o;
}
function avNeck(c) {
  var n = c.neck, o = '';
  var pts = [[34.4, 102], [47.2, 107.2], [60, 109], [72.8, 107.2], [85.6, 102]];
  if (n === 'sockenkranz' || n === 'schachtelkranz') {
    o += '<path d="M28 98 Q60 120 92 98" stroke="#F4F1FF" stroke-width="2" fill="none"/>';
    var cols = ['#FF7A45', '#FFFFFF', '#48D9A6', '#FFC940', '#5B8CFF'];
    pts.forEach(function (p, i) {
      if (n === 'sockenkranz') o += '<g transform="translate(' + (p[0] - 4) + ' ' + (p[1] - 1) + ') rotate(' + (i % 2 ? 8 : -8) + ') scale(.24)"><path d="M8 2H28V31L35 38C39.5 42.5 38 50.5 31.5 51.5C28.5 52 25.5 51 23 48.5L11 36.5C9 34.5 8 32 8 29Z" fill="' + cols[i] + '" stroke="' + INK + '" stroke-width="3"/><rect x="8" y="2" width="20" height="8" fill="' + INK + '" fill-opacity=".25"/></g>';
      else o += '<g transform="rotate(' + (i % 2 ? 7 : -7) + ' ' + p[0] + ' ' + p[1] + ')"><rect x="' + (p[0] - 4.5) + '" y="' + p[1] + '" width="9" height="8" rx="1.2" fill="' + cols[i] + '" stroke="' + INK + '" stroke-width=".8"/><path d="M' + p[0] + ' ' + p[1] + ' V' + (p[1] + 8) + '" stroke="' + INK + '" stroke-opacity=".4" stroke-width="1"/></g>';
    });
  } else if (n === 'fliege') {
    o += '<path d="M60 94 L49 87 L49 101 Z" fill="#FF7AB6" stroke="' + INK + '" stroke-width="1.2"/><path d="M60 94 L71 87 L71 101 Z" fill="#FF7AB6" stroke="' + INK + '" stroke-width="1.2"/><circle cx="60" cy="94" r="3" fill="#E04F8F" stroke="' + INK + '" stroke-width="1.2"/>';
  } else if (n === 'kette') {
    o += '<path d="M46 90 Q60 106 74 90" stroke="#FFC940" stroke-width="2" fill="none" stroke-dasharray="2.5 1.5"/><circle cx="60" cy="99" r="4" fill="#FFC940" stroke="' + INK + '" stroke-width="1"/>';
  }
  return o;
}
function avEars(c) {
  var x = EAR_X[c.shape] || EAR_X.rund, o = '';
  o += '<circle cx="' + x[0] + '" cy="58" r="5.5" fill="' + c.skin + '"/><circle cx="' + x[1] + '" cy="58" r="5.5" fill="' + c.skin + '"/>';
  o += '<circle cx="' + x[0] + '" cy="58" r="2.4" fill="#000" fill-opacity=".1"/><circle cx="' + x[1] + '" cy="58" r="2.4" fill="#000" fill-opacity=".1"/>';
  if (c.ex && c.ex.ohrringe) o += '<circle cx="' + x[0] + '" cy="65" r="2.6" fill="none" stroke="#FFC940" stroke-width="1.8"/><circle cx="' + x[1] + '" cy="65" r="2.6" fill="none" stroke="#FFC940" stroke-width="1.8"/>';
  return o;
}
function avCheeks(c) {
  var o = '', ex = c.ex || {};
  if (ex.rouge) o += '<circle cx="44" cy="66" r="4.2" fill="#FF7A8A" fill-opacity=".38"/><circle cx="76" cy="66" r="4.2" fill="#FF7A8A" fill-opacity=".38"/>';
  if (ex.sommersprossen) [[43, 63], [46.5, 65.5], [41, 66.5], [74, 63], [77.5, 65.5], [79, 62.5]].forEach(function (p) { o += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".95" fill="#6E3C1E" fill-opacity=".55"/>'; });
  if (ex.muttermal) o += '<circle cx="71.5" cy="70.5" r="1.15" fill="' + INK + '" fill-opacity=".7"/>';
  if (ex.pflaster) o += '<g transform="rotate(-25 44 63)"><rect x="38.5" y="60.5" width="11" height="5" rx="2.2" fill="#F6C99A" stroke="#000" stroke-opacity=".2" stroke-width=".8"/><circle cx="42" cy="63" r=".5" fill="#000" fill-opacity=".3"/><circle cx="46" cy="63" r=".5" fill="#000" fill-opacity=".3"/></g>';
  return o;
}
function avBeard(c) {
  var f = c.hairColor;
  switch (c.beard) {
    case 'schnurr': return '<path d="M50 67 Q54 62.5 60 65.5 Q66 62.5 70 67 Q66 70 60 68 Q54 70 50 67 Z" fill="' + f + '"/>';
    case 'dreitage': return '<path d="M35 60 Q38 84 60 87 Q82 84 85 60 Q82 76 60 79 Q38 76 35 60 Z" fill="' + f + '" fill-opacity=".3"/>';
    case 'voll': return '<path d="M34 56 Q33 88 60 92 Q87 88 86 56 Q85 72 74 75 Q67 69.5 60 69.5 Q53 69.5 46 75 Q35 72 34 56 Z" fill="' + f + '"/><path d="M50 67 Q54 63 60 65.5 Q66 63 70 67 Q66 69.5 60 68 Q54 69.5 50 67 Z" fill="' + f + '"/>';
    case 'kinn': return '<path d="M54 78 Q60 91 66 78 Q60 81.5 54 78 Z" fill="' + f + '"/>';
  }
  return '';
}
function avMouth(k) {
  switch (k) {
    case 'grinsen': return '<path d="M50 68.5 Q60 81 70 68.5 Z" fill="' + INK + '"/><path d="M52.5 69 H67.5 Q66.5 71.8 60 72 Q53.5 71.8 52.5 69 Z" fill="#fff"/>';
    case 'lachen': return '<path d="M49 67.5 Q60 86 71 67.5 Z" fill="#5A1626"/><path d="M54 77 Q60 72.5 66 77 Q63 82 60 82 Q57 82 54 77 Z" fill="#FF7A8A"/><path d="M51 68 H69 Q68 70.5 60 70.7 Q52 70.5 51 68 Z" fill="#fff"/>';
    case 'zunge': return '<path d="M56.5 72.5 Q60 82 63.5 72.5 Z" fill="#FF7A8A" stroke="' + INK + '" stroke-width="1.3"/><path d="M52 70 Q60 76.5 68 70" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    case 'schief': return '<path d="M52 72.5 Q61 74.5 68.5 68" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    case 'oh': return '<ellipse cx="60" cy="72" rx="3.6" ry="4.4" fill="#5A1626"/>';
    case 'frech': return '<path d="M52 70 Q60 76.5 68 69" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/><rect x="61" y="72" width="3.4" height="3.4" rx=".8" fill="#fff" stroke="' + INK + '" stroke-width="1"/>';
    case 'mist': return '<path d="M52 75 Q60 67.5 68 75" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
  }
  return '<path d="M52 70 Q60 77.5 68 70" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
}
function avEye(k, x, side) {
  var y = 58;
  switch (k) {
    case 'gross': return '<ellipse cx="' + x + '" cy="' + y + '" rx="5.2" ry="6" fill="#fff"/><circle cx="' + (x + 0.5) + '" cy="' + (y + 0.8) + '" r="3.3" fill="' + INK + '"/><circle cx="' + (x + 1.6) + '" cy="' + (y - 0.8) + '" r="1.2" fill="#fff"/>';
    case 'muede': return '<ellipse cx="' + x + '" cy="' + y + '" rx="5" ry="4.6" fill="#fff"/><circle cx="' + x + '" cy="' + (y + 1.2) + '" r="2.7" fill="' + INK + '"/><path d="M' + (x - 5.6) + ' ' + (y + 0.4) + ' Q' + x + ' ' + (y - 7) + ' ' + (x + 5.6) + ' ' + (y + 0.4) + ' Z" fill="currentColor"/><path d="M' + (x - 5.6) + ' ' + (y + 0.4) + ' H' + (x + 5.6) + '" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/>';
    case 'zwinker': return side === 'r' ? '<path d="M' + (x - 5) + ' ' + (y + 1) + ' Q' + x + ' ' + (y - 4) + ' ' + (x + 5) + ' ' + (y + 1) + '" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' : avEye('gross', x, side);
    case 'sterne':
      var s = '', r1 = 5.6, r2 = 2.4;
      for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; s += (i ? 'L' : 'M') + (x + r * Math.cos(a)).toFixed(1) + ' ' + (y + r * Math.sin(a)).toFixed(1); }
      return '<path d="' + s + 'Z" fill="#FFC940" stroke="' + INK + '" stroke-width="1.1" stroke-linejoin="round"/>';
    case 'herz': return '<path d="M' + x + ' ' + (y + 4.5) + ' C' + (x - 7) + ' ' + (y - 0.5) + ' ' + (x - 4.5) + ' ' + (y - 6.5) + ' ' + x + ' ' + (y - 2.6) + ' C' + (x + 4.5) + ' ' + (y - 6.5) + ' ' + (x + 7) + ' ' + (y - 0.5) + ' ' + x + ' ' + (y + 4.5) + ' Z" fill="#FF4F7B" stroke="' + INK + '" stroke-width="1"/>';
    case 'cool': return '<path d="M' + (x - 5.5) + ' ' + y + ' H' + (x + 5.5) + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    case 'happy': return '<path d="M' + (x - 5) + ' ' + (y + 2) + ' Q' + x + ' ' + (y - 5) + ' ' + (x + 5) + ' ' + (y + 2) + '" stroke="' + INK + '" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
  }
  return '<circle cx="' + x + '" cy="' + y + '" r="3.3" fill="' + INK + '"/><circle cx="' + (x + 1) + '" cy="' + (y - 1) + '" r=".9" fill="#fff"/>';
}
function avBrows(k, color) {
  var w = 2.6, l = 'M44 48.5 Q50 45.5 56 47.5', r = 'M64 47.5 Q70 45.5 76 48.5';
  if (k === 'buschig') w = 4.6;
  if (k === 'duenn') w = 1.5;
  if (k === 'hoch') { l = 'M44 44.5 Q50 41 56 43.5'; r = 'M64 43.5 Q70 41 76 44.5'; }
  if (k === 'boese') { l = 'M44 45 L56 49'; r = 'M64 49 L76 45'; w = 3; }
  if (k === 'besorgt') { l = 'M44 49.5 L56 45'; r = 'M64 45 L76 49.5'; w = 2.8; }
  return '<path d="' + l + '" stroke="' + color + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/><path d="' + r + '" stroke="' + color + '" stroke-width="' + w + '" fill="none" stroke-linecap="round"/>';
}
function avGlasses(k) {
  switch (k) {
    case 'rund': return '<g fill="#fff" fill-opacity=".12" stroke="' + INK + '" stroke-width="2.2"><circle cx="50" cy="58" r="7.4"/><circle cx="70" cy="58" r="7.4"/></g><path d="M57.4 57 Q60 55 62.6 57" stroke="' + INK + '" stroke-width="2.2" fill="none"/>';
    case 'eckig': return '<g fill="#fff" fill-opacity=".12" stroke="' + INK + '" stroke-width="2.2"><rect x="41.5" y="52" width="17" height="12.5" rx="3"/><rect x="61.5" y="52" width="17" height="12.5" rx="3"/></g><path d="M58.5 57 H61.5" stroke="' + INK + '" stroke-width="2.2"/>';
    case 'sonne': return '<path d="M40.5 53 H58.5 V59 Q58.5 66 49.5 66 Q40.5 66 40.5 59 Z" fill="' + INK + '"/><path d="M61.5 53 H79.5 V59 Q79.5 66 70.5 66 Q61.5 66 61.5 59 Z" fill="' + INK + '"/><path d="M58.5 55.5 H61.5" stroke="' + INK + '" stroke-width="2.4"/><path d="M44 56 L48 56" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/><path d="M65 56 L69 56" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>';
    case 'herz': return '<path d="M50 66 C40 60 42 50 50 55 C58 50 60 60 50 66 Z" fill="#FF4F7B" fill-opacity=".85" stroke="' + INK + '" stroke-width="1.6"/><path d="M70 66 C60 60 62 50 70 55 C78 50 80 60 70 66 Z" fill="#FF4F7B" fill-opacity=".85" stroke="' + INK + '" stroke-width="1.6"/><path d="M57.5 57 H62.5" stroke="' + INK + '" stroke-width="1.8"/>';
    case 'party': return '<g fill="none" stroke="#FF7AB6" stroke-width="3.4"><rect x="40" y="51" width="18.5" height="14" rx="5"/><rect x="61.5" y="51" width="18.5" height="14" rx="5"/></g><path d="M58.5 57 H61.5" stroke="#FF7AB6" stroke-width="3"/><path d="M36 46 l1.5 3 3 .4 -2.2 2 .6 3 -2.9-1.5 -2.9 1.5 .6-3 -2.2-2 3-.4z" fill="#FFC940"/><path d="M84 46 l1.5 3 3 .4 -2.2 2 .6 3 -2.9-1.5 -2.9 1.5 .6-3 -2.2-2 3-.4z" fill="#FFC940"/>';
  }
  return '';
}
function avHat(k) {
  switch (k) {
    case 'partyhut': return '<g transform="rotate(-9 60 32)"><path d="M47 33 L60 3 L73 33 Z" fill="#9886FF" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/><circle cx="57" cy="23" r="1.8" fill="#FFC940"/><circle cx="64" cy="15" r="1.8" fill="#FF7AB6"/><circle cx="62" cy="28" r="1.8" fill="#48D9A6"/><circle cx="53" cy="29" r="1.6" fill="#fff"/><circle cx="60" cy="3" r="4.2" fill="#FFC940" stroke="' + INK + '" stroke-width="1"/></g>';
    case 'krone': return '<path d="M36 34 L40 14 L50 25 L60 10 L70 25 L80 14 L84 34 Z" fill="#FFC940" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/><circle cx="60" cy="26" r="2.8" fill="#FF4F7B"/><circle cx="46" cy="30" r="2" fill="#5B8CFF"/><circle cx="74" cy="30" r="2" fill="#48D9A6"/>';
    case 'cap': return '<path d="M33 44 C33 24 46 17 61 17 C76 17 88 24 87 44 Z" fill="#FF7A45"/><path d="M58 41 H101 Q100 48 91 48 H58 Z" fill="#D9592A"/><circle cx="61" cy="18" r="2.2" fill="#D9592A"/><path d="M61 18 V43" stroke="#000" stroke-opacity=".12" stroke-width="1.5"/>';
    case 'muetze': return '<path d="M31 46 C31 20 45 12 60 12 C75 12 89 20 89 46 Z" fill="#5B8CFF"/><rect x="29" y="38" width="62" height="10" rx="4" fill="#3F6FE0"/><circle cx="60" cy="10" r="6.5" fill="#F4F1FF"/>';
    case 'stirnband': return '<path d="M33 41 Q60 30 87 41 L87 47.5 Q60 36.5 33 47.5 Z" fill="#FF4F7B"/><path d="M84 41 l9 -5 -2 9 z" fill="#FF4F7B"/>';
    case 'torte': return '<rect x="44" y="18" width="32" height="15" rx="3" fill="#F4F1FF" stroke="' + INK + '" stroke-width="1"/><path d="M44 22 Q48 27 52 22 Q56 27 60 22 Q64 27 68 22 Q72 27 76 22 V20 Q76 18 74 18 H46 Q44 18 44 20 Z" fill="#FF7AB6"/><rect x="58" y="5" width="4" height="13" rx="1" fill="#5B8CFF"/><path d="M60 -1 Q64.5 4 60 6.5 Q55.5 4 60 -1 Z" fill="#FFC940"/>';
    case 'socke': return '<path d="M35 42 C33 22 46 12 61 12 C71 12 79 16 83 23 C91 17 102 20 102 29 C102 36 95 39 88 36 L86 42 Z" fill="#FF7A45" stroke="' + INK + '" stroke-width="1.3" stroke-linejoin="round"/><path d="M84 25 C90 21 98 23 99 29" stroke="#fff" stroke-opacity=".5" stroke-width="2" fill="none"/><rect x="32" y="36" width="56" height="10" rx="5" fill="#F4F1FF" stroke="' + INK + '" stroke-width="1.1"/><path d="M40 37 V45 M48 37 V45 M56 37 V45 M64 37 V45 M72 37 V45 M80 37 V45" stroke="' + INK + '" stroke-opacity=".18" stroke-width="2"/>';
    case 'schachteln': return '<rect x="38" y="25" width="15" height="11" rx="1.5" fill="#FFC940" stroke="' + INK + '" stroke-width="1.1"/><rect x="52.5" y="16" width="15" height="20" rx="1.5" fill="#FF7AB6" stroke="' + INK + '" stroke-width="1.1"/><rect x="67" y="25" width="15" height="11" rx="1.5" fill="#48D9A6" stroke="' + INK + '" stroke-width="1.1"/><path d="M60 16 V36 M45.5 25 V36 M74.5 25 V36" stroke="' + INK + '" stroke-opacity=".35" stroke-width="1.2"/>';
    case 'sterne': return '<path d="M34 41 Q60 27 86 41" stroke="#FFC940" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M47 34 L44 18 M73 34 L76 18" stroke="' + INK + '" stroke-width="1.4"/><path d="M44 10 l2.2 4.5 5 .7 -3.6 3.4 .9 4.9 -4.5-2.4 -4.5 2.4 .9-4.9 -3.6-3.4 5-.7z" fill="#FFC940" stroke="' + INK + '" stroke-width="1"/><path d="M76 10 l2.2 4.5 5 .7 -3.6 3.4 .9 4.9 -4.5-2.4 -4.5 2.4 .9-4.9 -3.6-3.4 5-.7z" fill="#FF7AB6" stroke="' + INK + '" stroke-width="1"/>';
  }
  return '';
}
function avMoodDecor(mood) {
  if (mood === 'jubel') return '<g><rect x="16" y="22" width="7" height="3" rx="1" fill="#FFC940" transform="rotate(30 19 23)"/><rect x="98" y="26" width="7" height="3" rx="1" fill="#FF7AB6" transform="rotate(-25 101 27)"/><rect x="22" y="70" width="6" height="3" rx="1" fill="#5B8CFF" transform="rotate(-40 25 71)"/><rect x="94" y="68" width="6" height="3" rx="1" fill="#48D9A6" transform="rotate(45 97 69)"/><circle cx="28" cy="40" r="2" fill="#fff"/><circle cx="92" cy="44" r="2" fill="#fff"/></g>';
  if (mood === 'mist') return '<path d="M84 34 Q88 41 84 44 Q80 41 84 34 Z" fill="#8FD3FF" stroke="' + INK + '" stroke-width="1"/>';
  return '';
}
/* main render: returns an <svg> string; opts.mood = 'jubel' | 'mist' */
function avatarSVG(c, opts) {
  c = avFix(c); opts = opts || {};
  var mood = opts.mood || '';
  var eyes = c.eyes, mouth = c.mouth, brows = c.brows;
  if (mood === 'jubel') { eyes = 'happy'; mouth = 'lachen'; brows = 'hoch'; }
  if (mood === 'mist') { eyes = c.eyes === 'sterne' || c.eyes === 'herz' ? 'punkte' : (c.eyes === 'gross' ? 'gross' : 'punkte'); mouth = 'mist'; brows = 'besorgt'; }
  if (mood === 'staunen') { eyes = 'gross'; mouth = 'oh'; brows = 'hoch'; }
  if (mood === 'misstrauisch') { eyes = 'zwinker'; mouth = 'schief'; brows = 'boese'; }
  if (mood === 'verliebt') { eyes = 'herz'; mouth = 'lachen'; brows = 'hoch'; }
  if (mood === 'cool') { eyes = 'cool'; mouth = 'grinsen'; }
  if (mood === 'denken') { eyes = 'punkte'; mouth = 'schief'; brows = 'hoch'; }
  var browColor = c.hair === 'glatze' ? '#4A2E1C' : c.hairColor;
  var vb = opts.vb || '0 0 120 120';
  var o = '<svg viewBox="' + vb + '" aria-hidden="true" focusable="false" style="color:' + c.skin + '">';
  o += '<rect x="-20" y="-20" width="160" height="160" fill="' + c.bg + '"/>' + avPattern(c);
  o += avHairBack(c) + avOutfit(c) + avNeck(c) + avEars(c) + avHead(c) + avCheeks(c) + avBeard(c);
  o += '<path d="M60 60 Q56.5 66 60.5 66.5" stroke="#000" stroke-opacity=".22" stroke-width="2" fill="none" stroke-linecap="round"/>';
  o += avMouth(mouth) + '<g class="av-eyes">' + avEye(eyes, 50, 'l') + avEye(eyes, 70, 'r') + '</g>' + avBrows(brows, browColor);
  o += avHairFront(c) + avGlasses(c.glasses) + avHat(c.hat) + avMoodDecor(mood);
  return o + '</svg>';
}
/* crops for option previews */
var AV_CROP = {
  form: '0 0 120 120', haare: '6 -6 108 108', haarfarbe: '6 -6 108 108', augen: '30 38 60 40', brauen: '30 34 60 40', mund: '36 54 48 34', bart: '26 46 68 54',
  brille: '28 38 64 40', hut: '14 -10 92 64', hals: '8 72 104 52', outfit: '8 70 104 52', extras: '24 40 72 48', bg: '0 0 120 120'
};

