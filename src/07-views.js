/* =========================================================
   View helpers
   ========================================================= */
var UI = { screen: 'welcome', step: 1, draft: null, draftIsNew: false, draftFrom: 'setup', draftErr: '', avCat: 'form', avMood: '', confirm: null, setupErr: '', qFilter: 'offen', qDraft: null, qErr: '', qSent: '', guestFrom: 'questions', liveFrom: 'step', liveSent: false, liveName: '', liveVal: '', gameCat: 'Alle', gameId: null, gameFmt: '', gameWho: '', counterFrom: '', toast: '', cfgErr: '', guestMode: '' };

function icon(id, size) { size = size || 20; return '<svg class="ic" width="' + size + '" height="' + size + '" aria-hidden="true"><use href="#' + id + '"></use></svg>'; }
/* The brand mark: one ribbon, folded twice into a Z. Front orange, the fold shows
   the gold back, the folds throw a small shadow (logo canvas, „F · Band“). Pure
   polygons, no ids, so any number of copies can sit on one page. */
var BAND_PTS = { s1: '13,14 52,14 55.03,25 13,25', s2: '52,14 55.03,25 13,50 9.97,39', s3: '52,50 13,50 9.97,39 52,39', sh1a: '29.2,25 47.7,14 52,14 55.03,25', sh1b: '31.36,25 49.85,14 52,14 55.03,25', sh2a: '13,50 9.97,39 13.67,36.8 35.19,36.8', sh2b: '13,50 9.97,39 11.82,37.9 33.34,37.9' };
function bandMark(front, back, shadow) {
  front = front || '#FF7A45'; back = back || '#FFC940'; shadow = shadow || '#15122B';
  var P = BAND_PTS, poly = function (pts, fill, op) { return '<polygon points="' + pts + '" fill="' + fill + '"' + (op ? ' fill-opacity="' + op + '"' : '') + '></polygon>'; };
  return poly(P.s1, front) + poly(P.sh1a, shadow, '.1') + poly(P.sh1b, shadow, '.16') + poly(P.s2, back) + poly(P.sh2a, shadow, '.1') + poly(P.sh2b, shadow, '.16') + poly(P.s3, front) +
    '<line x1="52" y1="14" x2="55.03" y2="25" stroke="#FFFFFF" stroke-opacity=".45" stroke-width=".9"></line><line x1="13" y1="50" x2="9.97" y2="39" stroke="#FFFFFF" stroke-opacity=".35" stroke-width=".9"></line>';
}
/* the mark alone; w is the width in px (the Z is 47 by 38) */
function brandMark(w, front, back, shadow) { return '<svg viewBox="9 13 47 38" width="' + w + '" height="' + Math.round(w * 38 / 47) + '" aria-hidden="true">' + bandMark(front, back, shadow) + '</svg>'; }
/* the app icon: the mark on the night-blue tile; without a size the CSS sizes it */
function brandTile(size, bg, front, back) {
  return '<svg viewBox="0 0 64 64"' + (size ? ' width="' + size + '" height="' + size + '"' : '') + ' aria-hidden="true"><rect width="64" height="64" rx="16" fill="' + (bg || '#15122B') + '"></rect><rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#FFFFFF" stroke-opacity=".08" stroke-width="1.5"></rect><g transform="translate(32 32) scale(.84) translate(-32 -32)">' + bandMark(front, back) + '</g></svg>';
}
function sockIc(fill, w) { w = w || 13; return '<svg width="' + w + '" height="' + Math.round(w * 1.4) + '" viewBox="0 0 40 56" aria-hidden="true"><use href="#sk" fill="' + fill + '"></use></svg>'; }
function face(p, size, style, mood) {
  style = style || '';
  if (p && p.av) return '<span class="av" style="width:' + size + 'px;height:' + size + 'px;' + style + '">' + avatarSVG(p.av, { mood: mood }) + '</span>';
  return '<span class="ini" style="width:' + size + 'px;height:' + size + 'px;background:' + ((p && p.color) || '#F4F1FF') + ';font-size:' + Math.max(9, Math.round(size * 0.32)) + 'px;' + style + '">' + esc(initials(p ? p.name : '?')) + '</span>';
}
function groupFace(size) { return '<span class="ini" style="width:' + size + 'px;height:' + size + 'px;background:#F4F1FF">' + icon('i-users', Math.round(size * 0.5)) + '</span>'; }
/* navigation says where it goes: an arrow and a word, never a bare symbol */
var BACK_LABEL = { landing: 'Start', pass: 'Game Pass', home: 'Party', run: 'Übersicht', cards: 'Karten', questions: 'Fragen', games: 'Spiele', counter: 'Zähler', runSetup: 'Einrichten', crew: 'Gäste' };
function navBtn(attrs, ic, label, cls) { return '<button type="button" class="navbtn' + (cls ? ' ' + cls : '') + '" ' + attrs + '>' + icon(ic, 18) + '<span>' + esc(label) + '</span></button>'; }
function topbar(back, title, right) {
  return '<div class="topbar tb3">' +
    (back ? navBtn('data-act="go" data-to="' + back + '"', 'i-back', BACK_LABEL[back] || 'Zurück') : '<span></span>') +
    '<span class="topbar-title">' + (title || '') + '</span>' + (right || '<span></span>') + '</div>';
}
function tabbar(active) {
  var open = S.questions.filter(function (q) { return q.status === 'offen'; }).length;
  var tabs = [['home', 'Party', 'i-sparkle'], ['games', 'Spiele', 'i-pad'], ['questions', 'Fragen', 'i-bubble'], ['counter', U(), 'i-shot']];
  return '<nav class="tabbar" aria-label="Hauptnavigation"><button type="button" class="tb-brand" data-act="go" data-to="home" aria-label="zparkling, zur Party">' + lpLogo(30) + '<b>zparkling</b></button>' + tabs.map(function (t) {
    var badge = t[0] === 'questions' && open ? '<span class="badge-dot">' + open + '</span>' : '';
    return '<button type="button" class="tab' + (active === t[0] ? ' on' : '') + '" data-act="go" data-to="' + t[0] + '"' + (active === t[0] ? ' aria-current="page"' : '') + '><span style="position:relative">' + icon(t[2], 22) + badge + '</span>' + esc(t[1]) + '</button>';
  }).join('') + '<button type="button" class="tab tb-set" data-act="go" data-to="settings">' + icon('i-gear', 20) + 'Einstellungen</button></nav>';
}
function stepper(act, value, data, label) {
  return '<div class="stepper"><button type="button" class="iconbtn sm" data-act="' + act + '" data-d="-1"' + (data || '') + ' aria-label="' + (label || '') + ' weniger">' + icon('i-minus', 16) + '</button><span class="val num">' + value + '</span><button type="button" class="iconbtn sm" data-act="' + act + '" data-d="1"' + (data || '') + ' aria-label="' + (label || '') + ' mehr">' + icon('i-plus', 16) + '</button></div>';
}
function garlandShape() {
  if (!E()) return 'band';
  var t = evType(), f = E().focus, k = {};
  f.forEach(function (p) { k[p.anlass] = true; });
  if (t.fam === 'kranz') return k.sockenkranz && k.schachtelkranz ? 'mix' : k.schachtelkranz || (!f.length && t.id === 'schachtel') ? 'box' : 'sock';
  return 'flag';
}
function garlandItem(shape, i, fill) {
  if (shape === 'mix') shape = i % 2 ? 'box' : 'sock';
  if (shape === 'box') return '<rect x="3" y="6" width="30" height="26" rx="4" fill="' + fill + '"></rect><rect x="15" y="6" width="6" height="26" fill="#15122B" fill-opacity="0.22"></rect><rect x="3" y="13" width="30" height="5" fill="#15122B" fill-opacity="0.22"></rect>';
  if (shape === 'flag') return '<path d="M2 4H34L18 40Z" fill="' + fill + '"></path><path d="M2 4H34L32 9H4Z" fill="#15122B" fill-opacity="0.22"></path>';
  /* a piece of ribbon with a folded corner, the brand's own shape */
  if (shape === 'band') return '<path d="M3 6H27L33 12V32H3Z" fill="' + fill + '"></path><path d="M3 6H33V11H3Z" fill="#15122B" fill-opacity="0.16"></path><path d="M27 6L33 12H27Z" fill="#FFC940"></path>';
  return '<use href="#sk" fill="' + fill + '"></use><rect x="8" y="2" width="20" height="7" fill="#15122B" fill-opacity="0.22"></rect>';
}
/* progress overview in the shape of the real thing: what is still hanging, what is already off */
function kranzLine(t, fam) {
  var u = unitOf(t), n = Math.max(1, t.total), group = n > 30 ? Math.ceil(n / 30) : 1, slots = Math.ceil(n / group);
  var shape = u.ic === 'sock' ? 'sock' : u.ic === 'i-box' ? 'box' : u.unit === 'Station' ? 'mix' : 'flag';
  var W = 320, pad = 10, gap = slots > 1 ? (W - 2 * pad) / (slots - 1) : 0, sc = Math.min(0.62, Math.max(0.3, (gap || 40) / 24));
  var cols = ['#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#FF7A45'], frei = fam === 'frei';
  var out = '<svg class="kranzline" viewBox="0 -4 ' + W + ' 60" preserveAspectRatio="xMidYMin meet" role="img" aria-label="' + esc(u.units) + ': ' + t.pos + ' von ' + t.total + (frei ? ' geschafft' : ' abgenommen') + '"><path d="M0 6Q' + (W / 2) + ' 26 ' + W + ' 6" stroke="#5A5390" stroke-width="2" fill="none"></path>';
  for (var i = 0; i < slots; i++) {
    var x = slots > 1 ? pad + i * gap : W / 2, tt = x / W, y = 6 + 40 * tt * (1 - tt) - 1;
    var from = i * group, to = Math.min(n, (i + 1) * group);
    var done = to <= t.pos, now = !done && from <= t.pos && t.pos < to && !t.done;
    var fill = done ? (frei ? '#48D9A6' : 'none') : now ? '#FF7A45' : cols[i % cols.length];
    var item = done && !frei ? garlandItem(shape, i, '#3A3463') : garlandItem(shape, i, fill);
    out += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(2) + ') translate(-18 0)"' + (done && !frei ? ' opacity="0.45"' : frei && !done && !now ? ' opacity="0.5"' : '') + '><g' + (now ? ' class="now"' : '') + '>' + item + '</g></g>';
  }
  return out + '</svg>';
}
function garland(width, fills, shape) {
  shape = shape || garlandShape();
  var w = width, mid = w / 2, n = fills.length;
  var out = '<svg aria-hidden="true" width="' + w + '" height="96" viewBox="0 0 ' + w + ' 96" style="position:absolute;top:0;left:0"><path d="M-4 14Q' + mid + ' 46 ' + (w + 4) + ' 14" stroke="#15122B" stroke-width="2.5" fill="none"></path>';
  for (var i = 0; i < n; i++) {
    var x = 34 + i * ((w - 68) / (n - 1)), t = (x + 4) / (w + 8), y = 14 + 64 * t * (1 - t);
    out += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (i % 2 ? 6 : -7) + ') translate(-11 3) scale(0.62)">' + garlandItem(shape, i, fills[i]) + '</g>';
    out += '<rect x="' + (x - 2.5).toFixed(1) + '" y="' + (y - 5).toFixed(1) + '" width="5" height="10" rx="1.5" fill="' + (i % 2 ? '#15122B' : '#FFFFFF') + '"></rect>';
  }
  return out + '</svg>';
}
/* the example evening: a golden banner on every screen of the master, it leads to the Game Pass */
var DEMO_HIDE = ['pass', 'tour', 'welcome', 'guestForm', 'guestLive', 'landing', 'demoPick'];
function demoBanner() {
  if (!S || !S.demo || UI.guestMode === 'link' || DEMO_HIDE.indexOf(UI.screen) >= 0) return '';
  var bub = ''; for (var i = 0; i < 10; i++) bub += '<i style="--x:' + (6 + i * 9.5).toFixed(1) + '%;--d:' + ((i * 0.53) % 2.4).toFixed(2) + 's;--s:' + (3 + (i * 7) % 5) + 'px"></i>';
  return '<button type="button" class="demobar" data-tint="#F5B740" data-act="go" data-to="pass"><span class="db-fizz" aria-hidden="true">' + bub + '</span><span class="db-shine" aria-hidden="true"></span><span class="db-e" aria-hidden="true">' + emb('crown', 28) + '</span><span class="stack grow" style="gap:1px;min-width:0;text-align:left"><b>Beispiel-Abend</b><small>Zum Reinschnuppern</small></span><span class="db-cta">' + icon('i-star', 14) + 'Game Pass</span></button>';
}
/* on a laptop these pages use the full width, in two columns (dk); the rest stays a centered column */
var DESK_WIDE = ['home', 'games', 'questions', 'counter', 'run', 'cards'];
function scr(head, body, foot, cls) {
  var db = demoBanner(); if (db) head = db + (head || '');
  var dw = DESK_WIDE.indexOf(UI.screen) >= 0 ? ' dw' : '', tf = foot && foot.indexOf('class="tabbar"') >= 0 ? ' tabfoot' : '';
  return '<div class="scr' + (cls ? ' ' + cls : '') + dw + (tf ? ' tabscr' : '') + '">' + (head ? '<div class="head">' + head + '</div>' : '') + '<div class="body">' + body + '</div>' + (foot ? '<div class="foot' + tf + '">' + foot + '</div>' : '') + '</div>';
}
/* two columns on a laptop; on a phone the blocks simply follow each other, in the same order */
function dk(a, b, cls) { return '<div class="dk' + (cls ? ' ' + cls : '') + '"><div class="dk-a">' + a + '</div><div class="dk-b">' + b + '</div></div>'; }
function confirmBox(text, sub, okAct, okLabel) {
  return '<div class="confirm mt14"><p class="name">' + text + '</p>' + (sub ? '<p class="small mt6">' + sub + '</p>' : '') + '<div class="cta-row mt10"><button type="button" class="btn-dark" style="flex:1;height:48px" data-act="cancelConfirm">Abbrechen</button><button type="button" class="btn-dark" style="flex:1;height:48px;background:var(--danger);color:var(--ink)" data-act="' + okAct + '">' + okLabel + '</button></div></div>';
}
function qrHTML(code) {
  var N = 21, out = '', seed = 0;
  for (var c = 0; c < code.length; c++) seed += code.charCodeAt(c) * (c + 3);
  function finder(x, y, ox, oy) { var dx = x - ox, dy = y - oy; if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return null; if (dx === 0 || dy === 0 || dx === 6 || dy === 6) return true; return dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4; }
  function sep(x, y) { return (x <= 7 && y <= 7) || (x >= 13 && y <= 7) || (x <= 7 && y >= 13); }
  for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
    var f = finder(x, y, 0, 0); if (f === null) f = finder(x, y, 14, 0); if (f === null) f = finder(x, y, 0, 14);
    var on = f !== null ? f : sep(x, y) ? false : y === 6 ? x % 2 === 0 : x === 6 ? y % 2 === 0 : ((x * 7 + y * 13 + x * y * 3 + (x ^ y) + seed) % 5) < 2;
    out += '<span' + (on ? ' style="background:#15122B"' : '') + '></span>';
  }
  return '<div class="qr" aria-hidden="true">' + out + '<span style="position:absolute;left:66px;top:66px;width:36px;height:36px;box-sizing:border-box;border-radius:10px;background:#15122B;border:4px solid #F4F1FF;display:flex;align-items:center;justify-content:center">' + brandMark(20) + '</span></div>';
}
function shareBlock(link, waText, code, testAct, testLabel, title, sub) {
  title = title || 'Ein Link für alle'; testLabel = testLabel || 'Als Gast testen';
  return '<div class="qx-inv"><div class="qx-inv-top"><button type="button" class="qx-qr" data-act="qrBig" data-code="' + esc(code) + '" data-title="' + esc(title) + '" aria-label="QR-Code groß zeigen">' + qrHTML(code) + '<span class="qx-zoom" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>' +
    '<span class="stack grow" style="gap:6px;min-width:0"><b class="qx-inv-h">' + esc(title) + '</b><span class="qx-inv-s">' + esc(sub || 'QR-Code scannen lassen oder den Text in die Gruppe schicken.') + '</span></span></div>' +
    '<div class="qx-inv-btns"><button type="button" class="qx-b dark" data-act="copyText" data-text="' + esc(waText) + '">' + icon('i-bubble', 16) + '<span>Text für WhatsApp</span></button><button type="button" class="qx-b" data-act="copyText" data-text="' + esc(link) + '">' + icon('i-link', 16) + '<span>Link kopieren</span></button></div>' +
    '<div class="qx-perf" aria-hidden="true"></div><div class="qx-inv-foot"><button type="button" data-act="' + testAct + '">' + icon('i-user', 16) + esc(testLabel) + '</button><a href="' + esc(link) + '" target="_blank" rel="noopener">' + icon('i-arrow', 16) + 'In neuem Tab</a></div></div>' +
    '<p class="qx-note">Testmodus: Echte Links auf andere Handys brauchen später einen Server. Bis dahin klappt „' + esc(testLabel) + '“ oder ein neuer Tab im selben Browser.</p>';
}
function pilotBar(pid) {
  var b = budget(pid), M = b.M;
  var pctC = clamp(b.C / M * 100, 0, 100), pctT = clamp(b.Tp / M * 100, 0, 100);
  return '<div class="pilot-bar" role="img" aria-label="' + esc(person(pid).name) + ': ' + b.C + ' von maximal ' + M + ' ' + esc(U()) + ', Ziel etwa ' + Math.round(b.Tp) + '"><b style="width:' + pctC + '%;' + (b.C >= M ? 'background:var(--danger)' : b.C > b.Tp + 0.5 ? 'background:var(--sun)' : '') + '"></b><i style="left:' + pctT + '%"></i></div>';
}
function targetText(pid) {
  var b = budget(pid), tp = Math.round(b.Tp), lab = R() ? skillLabel(pid) : '';
  return 'Ziel ' + (tp !== b.T ? b.T + ' → ' + tp : b.T) + (lab ? ' (' + lab + ')' : '');
}
function toneBg(t) { return t === 'ok' ? 'var(--mint)' : t === 'fail' ? 'var(--orange)' : t === 'violet' ? 'var(--violet)' : t === 'sun' ? 'var(--sun)' : 'var(--surface-2)'; }

/* =========================================================
   Welcome & setup
   ========================================================= */
var V = {};
V.welcome = function () {
  var ts = tourSaved(), j = ts.name ? tourAvFor(ts.name, ts.roll || 0) : avDefault(); j.hat = 'krone'; j.neck = 'sockenkranz'; j.mouth = 'lachen'; if (!ts.name) j.eyes = 'sterne'; j.bg = '#FFC940'; j.pat = 'strahlen';
  var body = '<div class="welcome-hero">' + garland(350, ['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#15122B'], 'mix') +
    '<span class="av live" style="width:132px;height:132px;position:absolute;right:20px;bottom:22px;border:5px solid var(--ink);box-sizing:border-box">' + avatarSVG(j) + '</span>' +
    '<div style="position:absolute;left:22px;bottom:22px;color:var(--ink)"><span style="font:900 40px/1 var(--display);letter-spacing:-0.03em">zparkling</span></div></div>' +
    '<h1 class="h1 mt22">Euer Abend, gespielt statt geplant.</h1>' +
    '<p class="lead mt10">Eure Gäste schicken per Link Steckbriefe, Lügen und Erinnerungen. Die App baut daraus euren ganz eigenen Abend und achtet darauf, dass es nicht ausartet.</p>';
  body += '<button type="button" class="tourcard plain mt18" data-act="openTour"><span class="tc-e" aria-hidden="true">' + emb('garland', 40) + '</span><span class="stack grow" style="gap:2px;text-align:left"><b>Was kann die App?</b><span>Das Intro in einer Minute</span></span>' + icon('i-play', 18) + '</button>';
  return scr('', body, '<button type="button" class="cta" data-act="newEvent">Neuen Abend anlegen</button><button type="button" class="btn-ghost" data-act="loadDemo">Mit Beispiel-Abend ausprobieren</button>', 'welcome');
};
/* nobody yet: the empty spot invites, like a seat with a name card */
function focusEmpty() {
  return '<button type="button" class="fx-empty" data-act="addPerson" data-from="setup"><span class="fx-empty-av" aria-hidden="true">' + icon('i-plus', 30) + '</span><span class="stack" style="gap:4px;align-items:center"><b>Wer wird gefeiert?</b><span>Name, Look und Tradition. Dauert eine Minute, und der Avatar zieht in die App ein.</span></span></button>';
}
function focusList(from) {
  var f = E().focus;
  var rows = f.map(function (p, i) {
    var fa = faOf(p);
    return '<div class="row' + (i < f.length - 1 || f.length < 3 ? ' line' : '') + '" style="min-height:76px;gap:14px">' + face(p, 56) +
      '<span class="stack grow gap6"><span class="name" style="font-size:16px">' + esc(p.name) + (p.nick ? ' <span class="sub">„' + esc(p.nick) + '“</span>' : '') + '</span>' + (fa.kind === 'frei' ? '' : '<span class="tag" style="color:var(--sun)">' + esc(fa.short || fa.label) + '</span>') + (p.partner ? '<span class="sub">Partner/in: ' + esc(p.partner) + '</span>' : '') + '</span>' +
      '<button type="button" class="iconbtn" data-act="editPerson" data-i="' + i + '" data-from="' + from + '" aria-label="' + esc(p.name) + ' bearbeiten">' + icon('i-pencil', 18) + '</button></div>';
  }).join('');
  if (f.length < 3) rows += '<button type="button" class="row plain" data-act="addPerson" data-from="' + from + '" style="min-height:72px;gap:14px"><span class="dash-ic">' + icon('i-plus', 22) + '</span><span class="stack grow" style="gap:2px"><span class="name">Person hinzufügen</span><span class="small">Noch ' + (3 - f.length) + ' ' + (3 - f.length === 1 ? 'Platz' : 'Plätze') + ' frei</span></span></button>';
  return '<div class="card padrows">' + rows + '</div>';
}
function themeIc(col, size) {
  var sh = garlandShape();
  if (sh === 'sock' || sh === 'mix') return sockIc(col, size);
  if (sh === 'box') return '<span style="color:' + col + ';display:flex">' + icon('i-box', Math.round(size * 1.3)) + '</span>';
  return '<span style="color:' + col + ';display:flex">' + icon(evFam() === 'zeit' ? 'i-broom' : 'i-star', Math.round(size * 1.3)) + '</span>';
}
function typeIcon(t, col) { return t.ic === 'sock' ? sockIc(col || '#15122B', 16) : icon(t.ic, 22); }
function typePicker() {
  var e = E();
  return '<div class="dp-list" role="group" aria-label="Was wird gefeiert?">' + EVENT_TYPES.map(function (t, i) { return occTicket(t, { sel: e.anlass === t.id, i: i, act: 'setEventAnlass', id: 'tp-' + t.id }); }).join('') + '</div>';
}
/* settings: only the chosen party type, the list opens on demand */
function typeCurrent() {
  var t = evType();
  return '<button type="button" class="opt row is-sel" data-act="setTypeOpen" aria-expanded="false" style="width:100%;min-height:58px;border-radius:18px;padding:7px 12px 7px 7px"><span class="tile-ic" style="width:40px;height:40px;border-radius:12px;background:' + t.bg + '">' + typeIcon(t) + '</span><span class="stack grow"><span style="font-size:15px;font-weight:800">' + esc(t.label) + '</span><span class="sub">' + esc(t.sub) + '</span></span><span class="linkbtn">Ändern</span></button>';
}
/* the legal pages of the website; from the app they open in a new tab */
function legalLinks(cls) {
  return '<p class="small legal-links' + (cls ? ' ' + cls : '') + '">' + [['/verantwortung/', 'Verantwortung & Alkohol'], ['/nutzungsbedingungen/', 'Nutzungsbedingungen'], ['/impressum/', 'Impressum'], ['/datenschutz/', 'Datenschutz']].map(function (l) { return '<a href="' + l[0] + '" target="_blank" rel="noopener">' + l[1] + '</a>'; }).join(' · ') + '</p>';
}
function rulesBlock() {
  var e = E();
  return alkChoiceHtml(e) + '<span class="eyebrow mt18 block">Einheit</span><div class="chips mt10" role="group" aria-label="Einheit">' + unitList().map(function (u) {
    var sel = e.unit === u;
    return '<button type="button" class="chip-btn sm' + (sel ? ' is-sel' : '') + '" data-act="setUnit" data-v="' + u + '" aria-pressed="' + sel + '">' + u + '</button>';
  }).join('') + '</div>' +
    '<div class="card pad mt14"><div class="row"><span class="stack grow"><span class="name">Maximum pro Person</span><span class="sub">Für den ganzen Abend, wird nie überschritten</span></span>' + stepper('setMax', e.max, '', 'Maximum') + '</div></div>' +
    '<div class="card pad mt10"><div class="row" style="justify-content:space-between;align-items:baseline"><span class="name">Ziel</span><span class="num" id="targetShow" style="font:800 16px var(--display);color:var(--mint)">' + e.target + ' % · etwa ' + Math.round(e.max * e.target / 100) + '</span></div>' +
    '<label class="sr" for="targetRange">Ziel in Prozent</label><input id="targetRange" class="range mt10" type="range" min="40" max="90" step="5" value="' + e.target + '" data-bind="event.target">' +
    '<p class="small mt8">Wer viel schafft, trinkt weniger. Wer oft verliert, nähert sich dem Maximum. Im Schnitt landet ihr hier.</p></div>' +
    '<div class="card pad mt10"><div class="row"><span class="tile-ic" style="width:34px;height:34px;border-radius:11px;background:var(--mint)">' + icon('i-drop', 18) + '</span><span class="stack grow"><span class="name">Wasser-Joker</span><span class="sub">pro Person, ersetzt einmal ' + esc(e.unit) + '</span></span>' + stepper('setJokers', e.jokers, '', 'Joker') + '</div></div>';
}
function lockCard(title, text) {
  return '<button type="button" class="lock plain" data-act="go" data-to="pass"><span class="lock-ic" aria-hidden="true">' + emb('lock', 32) + '</span><span class="stack grow" style="gap:3px;text-align:left;min-width:0"><b>' + esc(title) + '</b><span>' + esc(text) + '</span></span><span class="lock-cta">Game Pass</span></button>';
}
function collectShare() {
  if (!passActive()) return lockCard('Gäste-Link', 'Mit dem Game Pass verschickst du den Link an alle Gäste. Ausprobieren kannst du ihn schon jetzt über den Beispiel-Abend.');
  if (!S.collectCode) S.collectCode = makeCode();
  var link = APP_URL + '#gast-fragen';
  var wa = 'Hey! Für ' + (E().name || 'den Abend') + ' sammle ich Beiträge über ' + focusNames() + ': eine Frage, dein Steckbrief, zwei Wahrheiten und eine Lüge, eine Erinnerung oder ein Tipp. Im Link siehst du, was schon da ist und was noch fehlt. Dauert 2 Minuten: ' + link;
  return shareBlock(link, wa, S.collectCode, 'openGuestForm', '', 'Einladung für die Gruppe', 'Jeder schickt, worauf er Lust hat. Dauert zwei Minuten.');
}
/* first setup: only two questions, then a page that says what comes next */
V.setup = function () {
  var step = Math.min(3, UI.step || 1), e = E();
  if (step === 3) return setupDoneView();
  var dots = '<div class="dots" aria-hidden="true">' + [1, 2].map(function (i) { return '<span class="' + (i === step ? 'on' : '') + '"></span>'; }).join('') + '</div>';
  var head = '<div class="topbar tb3">' + navBtn('data-act="setupBack"', 'i-back', 'Zurück') + dots + '<span></span></div>';
  var body = '', foot = '';
  if (step === 1) {
    body = '<span class="eyebrow">Schritt 1 von 2</span><h1 class="h1 mt8">Was wird gefeiert?</h1><p class="lead mt8">Die Party-Art bestimmt Spielmodi, Texte und welche Spiele drankommen.</p>' +
      '<div class="mt18">' + typePicker() + '</div>' +
      '<label class="field mt22" for="evName">Name des Abends (freiwillig)<input id="evName" class="input" type="text" placeholder="z. B. Kranz-Abend Jonas & Mia" autocomplete="off" data-bind="event.name" value="' + esc(e.name) + '"></label>';
    foot = '<button type="button" class="cta" data-act="setupNext">Weiter' + icon('i-next', 18) + '</button>';
  } else {
    body = '<span class="eyebrow">Schritt 2 von 2</span><h1 class="h1 mt8">Wer wird gefeiert?</h1><p class="lead mt8">Eine bis drei Personen stehen im Fokus. Gäste musst du nicht eintragen.</p><div class="mt18">' + (e.focus.length ? focusList('setup') : focusEmpty()) + '</div>' + (UI.setupErr ? '<p class="err mt10">' + UI.setupErr + '</p>' : '');
    foot = e.focus.length ? '<button type="button" class="cta mint" data-act="setupNext">Fertig' + icon('i-check', 18) + '</button>' : '<button type="button" class="cta" data-act="addPerson" data-from="setup">' + icon('i-plus', 18) + 'Erste Person anlegen</button>';
  }
  return scr(head, body, foot);
};
/* the party exists: what to do next, released with a little light */
function setupDoneView() {
  var e = E(), f = e.focus, pass = passActive() && !(S && S.demo);
  var faces = f.map(function (p, i) { return '<span class="ob-face" style="--i:' + i + '">' + face(p, f.length > 2 ? 58 : 72, '', 'jubel') + '</span>'; }).join('');
  var step = function (k, done, ic, bg, title, sub) {
    return '<div class="ob-step' + (done ? ' done' : '') + '" style="--k:' + k + '"><span class="ob-n" style="background:' + (done ? 'var(--mint)' : bg) + '">' + (done ? icon('i-check', 18) : ic) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>' + title + '</b><span>' + sub + '</span></span></div>';
  };
  var body = '<div class="ob-done"><div class="ob-card">' + garland(350, ['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#15122B']) +
    '<span class="ob-badge" aria-hidden="true">' + icon('i-check', 30) + '</span>' +
    '<div class="ob-faces">' + faces + '</div>' +
    '<h1 class="ob-t">Eure Party steht!</h1><p class="ob-s">' + esc(e.name) + '</p></div>' +
    '<span class="eyebrow mt22 block ob-h">So geht’s weiter</span>' +
    '<div class="ob-steps mt10">' +
    step(0, true, '', '', 'Party angelegt', esc(evLabel()) + ' für ' + esc(focusNames())) +
    step(1, false, icon('i-link', 18), 'var(--pink)', 'Gäste einladen', 'Schick den Link in die Gruppe. Aus ihren Beiträgen baut die App eure Spiele.') +
    step(2, false, icon('i-gear', 18), 'var(--sun)', 'Den Abend einstellen', 'Wer spielt, welche Spielart, alles bereit? Danach ist der Start frei.') +
    step(3, pass, icon('i-star', 18), 'var(--orange)', pass ? 'Game Pass ist aktiv' : 'Game Pass holen', pass ? 'Gäste-Link und Spiel sind freigeschaltet.' : 'Damit sind Gäste-Link und Spiel freigeschaltet.') +
    step(4, false, icon('i-play', 18), 'var(--violet)', 'Am Abend: Start drücken', 'Die App führt euch durch die Party.') +
    '</div></div>';
  return scr('', body, '<button type="button" class="cta ob-go" data-act="setupFinish">Zur Party' + icon('i-next', 18) + '</button>', 'obscr');
}

/* =========================================================
   Material
   ========================================================= */
function matPicker() {
  var m = E().mats || {}, n = playableCount(), tot = themedGames().length;
  var pct = Math.round(n / tot * 100);
  var presets = [['party', 'Typische Party'], ['all', 'Alles da'], ['none', 'Nichts']];
  var top = '<div class="card pad"><div class="row" style="justify-content:space-between;align-items:baseline"><span class="name">Spielbar</span><span class="num" style="font:800 22px var(--display);color:var(--mint)">' + n + '<span style="font:700 13px var(--body);color:var(--muted)"> von ' + tot + ' Spielen</span></span></div>' +
    '<div class="prog mt10"><b style="width:' + pct + '%"></b></div>' +
    '<div class="chips mt14" role="group" aria-label="Schnellauswahl">' + presets.map(function (x) { return '<button type="button" class="chip-btn sm" data-act="matPreset" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>';
  var unl = matUnlocks().slice(0, 4);
  var tip = unl.length ? '<div class="card pad mt10"><span class="eyebrow block">Lohnt sich noch</span><p class="small mt6">Damit kommen sofort weitere Spiele dazu.</p><div class="chips mt10">' + unl.map(function (u) { return '<button type="button" class="chip-btn sm" data-act="matToggle" data-v="' + u[0] + '">' + icon('i-plus', 13) + esc(matLabel(u[0])) + '<span style="color:var(--mint)">+' + u[1] + '</span></button>'; }).join('') + '</div></div>' : '';
  var groups = MAT_GROUPS.map(function (g) {
    var items = MATERIALS.filter(function (x) { return x.g === g[0]; });
    var have = items.filter(function (x) { return m[x.id]; }).length;
    return '<span class="eyebrow mt18 block">' + esc(g[1]) + ' · ' + have + '/' + items.length + '</span><div class="chips mt10">' + items.map(function (x) {
      var on = !!m[x.id];
      return '<button type="button" class="chip-btn sm mat-chip' + (on ? ' is-sel' : '') + '" data-act="matToggle" data-v="' + x.id + '" aria-pressed="' + on + '">' + (on ? icon('i-check', 13) : '') + esc(x.label) + '</button>';
    }).join('') + '</div>';
  }).join('');
  return top + tip + groups + '<p class="small mt18">Tisch, Gläser, Wasser und ein Handy für Musik setzt die App voraus.</p>';
}
function matSummary() {
  var m = E().mats || {}, k = Object.keys(m).filter(function (x) { return m[x]; }).length;
  return k + (k === 1 ? ' Teil' : ' Teile') + ' · ' + playableCount() + ' von ' + themedGames().length + ' Spielen spielbar';
}
V.material = function () {
  var back = UI.matFrom || 'settings';
  var body = '<p class="lead">Tipp an, was da ist. Spiele, für die etwas fehlt, kommen im Spiel nicht dran.</p><div class="mt14">' + matPicker() + '</div>';
  return scr(topbar(back, 'Material & Zubehör'), body, '<button type="button" class="cta" data-act="go" data-to="' + back + '">Fertig</button>');
};

/* =========================================================
   Avatar editor
   ========================================================= */
var AV_CATS = [['form', 'Gesicht'], ['haare', 'Frisur'], ['haarfarbe', 'Haarfarbe'], ['augen', 'Augen'], ['brauen', 'Brauen'], ['mund', 'Mund'], ['bart', 'Bart'], ['brille', 'Brille'], ['hut', 'Kopf'], ['hals', 'Hals'], ['outfit', 'Outfit'], ['extras', 'Extras'], ['bg', 'Hintergrund']];
function avOption(cat, key, value, label, aria) {
  var d = UI.draft.av, sel;
  var prev = clone(d);
  if (key === 'ex') { prev.ex = clone(d.ex) || {}; prev.ex[value] = !prev.ex[value]; sel = !!(d.ex && d.ex[value]); prev.ex[value] = true; }
  else { prev[key] = value; sel = d[key] === value; }
  return '<button type="button" class="opt av-opt' + (sel ? ' is-sel' : '') + '" data-act="avSet" data-k="' + key + '" data-v="' + esc(value) + '" aria-pressed="' + sel + '" aria-label="' + esc(aria || label) + '"><span class="av" style="width:58px;height:58px;border-radius:16px">' + avatarSVG(prev, { vb: AV_CROP[cat] }) + '</span>' + (label ? '<span class="t">' + esc(label) + '</span>' : '') + '</button>';
}
function avSwatch(key, color, label) {
  var sel = UI.draft.av[key] === color;
  return '<button type="button" class="swatch' + (sel ? ' is-sel' : '') + '" data-act="avSet" data-k="' + key + '" data-v="' + color + '" style="background:' + color + '" aria-pressed="' + sel + '" aria-label="' + esc(label) + '"></button>';
}
function avOptions(cat) {
  var o = '';
  function grid(items) { return '<div class="av-opts">' + items.join('') + '</div>'; }
  function sw(items) { return '<div class="swatches">' + items.join('') + '</div>'; }
  if (cat === 'form') {
    o += '<span class="eyebrow block">Kopfform</span>' + grid(AV.shapes.map(function (s) { return avOption('form', 'shape', s[0], s[1]); }));
    o += '<span class="eyebrow block mt14">Hautton</span>' + sw(AV.skins.map(function (s, i) { return avSwatch('skin', s, 'Hautton ' + (i + 1)); }));
  }
  if (cat === 'haare') o += grid(AV.hairs.map(function (h) { return avOption('haare', 'hair', h[0], h[1]); }));
  if (cat === 'haarfarbe') o += sw(AV.hairColors.map(function (h) { return avSwatch('hairColor', h[0], h[1]); }));
  if (cat === 'augen') o += grid(AV.eyes.map(function (h) { return avOption('augen', 'eyes', h[0], h[1]); }));
  if (cat === 'brauen') o += grid(AV.brows.map(function (h) { return avOption('brauen', 'brows', h[0], h[1]); }));
  if (cat === 'mund') o += grid(AV.mouths.map(function (h) { return avOption('mund', 'mouth', h[0], h[1]); }));
  if (cat === 'bart') o += grid(AV.beards.map(function (h) { return avOption('bart', 'beard', h[0], h[1]); }));
  if (cat === 'brille') o += grid(AV.glasses.map(function (h) { return avOption('brille', 'glasses', h[0], h[1]); }));
  if (cat === 'hut') o += grid(AV.hats.map(function (h) { return avOption('hut', 'hat', h[0], h[1]); }));
  if (cat === 'hals') o += grid(AV.necks.map(function (h) { return avOption('hals', 'neck', h[0], h[1]); }));
  if (cat === 'outfit') {
    o += grid(AV.outfits.map(function (h) { return avOption('outfit', 'outfit', h[0], h[1]); }));
    o += '<span class="eyebrow block mt14">Farbe</span>' + sw(AV.outfitColors.map(function (c, i) { return avSwatch('outfitColor', c, 'Outfitfarbe ' + (i + 1)); }));
  }
  if (cat === 'extras') o += '<p class="small" style="margin-bottom:10px">Mehrere gleichzeitig möglich.</p>' + grid(AV.extras.map(function (h) { return avOption('extras', 'ex', h[0], h[1]); }));
  if (cat === 'bg') {
    o += sw(AV.bgs.map(function (c, i) { return avSwatch('bg', c, 'Hintergrund ' + (i + 1)); }));
    o += '<span class="eyebrow block mt14">Muster</span>' + grid(AV.patterns.map(function (h) { return avOption('bg', 'pat', h[0], h[1]); }));
  }
  return o;
}
V.person = function () {
  var d = UI.draft, fa = FA[d.anlass];
  var right = UI.draftIsNew ? '<span class="spacer44"></span>' : '<button type="button" class="iconbtn" data-act="askConfirm" data-v="deletePerson" aria-label="Person entfernen" style="color:var(--danger)">' + icon('i-trash', 18) + '</button>';
  var moods = [['', 'Normal'], ['jubel', 'Jubel'], ['mist', 'Mist']];
  var body = (UI.confirm === 'deletePerson' ? confirmBox(esc(d.name || 'Diese Person') + ' entfernen?', '', 'deletePerson', 'Entfernen') : '') +
    '<div class="av-stage" style="background:' + d.av.bg + '">' +
    '<span class="av live" role="img" aria-label="Vorschau des Avatars" style="width:164px;height:164px;box-shadow:0 0 0 6px var(--ink)">' + avatarSVG(d.av, { mood: UI.avMood }) + '</span>' +
    '<div class="seg mood-seg" role="group" aria-label="Stimmung testen">' + moods.map(function (m) { var s = UI.avMood === m[0]; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="avMood" data-v="' + m[0] + '" aria-pressed="' + s + '">' + m[1] + '</button>'; }).join('') + '</div>' +
    '<button type="button" class="dice-btn" data-act="avDice" aria-label="Zufälliger Avatar">' + icon('i-dice', 24) + '</button></div>' +
    '<div class="mt14" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px">' +
    '<label class="field" for="pName">Name<input id="pName" class="input" type="text" autocomplete="off" data-bind="draft.name" value="' + esc(d.name) + '" placeholder="z. B. Jonas"></label>' +
    '<label class="field" for="pNick">Spitzname<input id="pNick" class="input" type="text" autocomplete="off" data-bind="draft.nick" value="' + esc(d.nick) + '" placeholder="optional"></label></div>' +
    (UI.draftErr ? '<p class="err mt8">' + UI.draftErr + '</p>' : '') +
    '<span class="eyebrow mt18 block">Avatar gestalten</span>' +
    '<div class="av-cats mt10" role="tablist" aria-label="Avatar-Teile">' + AV_CATS.map(function (c) { var s = UI.avCat === c[0]; return '<button type="button" role="tab" aria-selected="' + s + '" class="' + (s ? 'on' : '') + '" data-act="avCat" data-v="' + c[0] + '">' + c[1] + '</button>'; }).join('') + '</div>' +
    '<div class="mt14">' + avOptions(UI.avCat) + '</div>' +
    (isJga() ? '<label class="field mt22" for="pPartner">Wen heiratet ' + esc(d.name || 'die Person') + '?<input id="pPartner" class="input" type="text" autocomplete="off" data-bind="draft.partner" value="' + esc(d.partner || '') + '" placeholder="Vorname, kommt in Missionen vor"></label>' +
      '<span class="eyebrow mt18 block">Wie mutig ist ' + esc(d.name || 'die Person') + '?</span><div class="stack gap8 mt10" role="group" aria-label="Mut">' + [1, 2, 3].map(function (k) { var s = (+d.mut || 2) === k; return '<button type="button" class="opt row' + (s ? ' is-sel' : '') + '" data-act="draftMut" data-v="' + k + '" aria-pressed="' + s + '" style="min-height:58px;border-radius:18px;padding:8px 12px 8px 10px;gap:12px">' + heatHtml(k, 18) + '<span class="stack grow" style="gap:2px"><span style="font-size:15px;font-weight:800">' + esc(JGA_MUT[k].name) + '</span><span class="sub">' + esc(JGA_MUT[k].sub) + '</span></span><span class="check">' + icon('i-check', 14) + '</span></button>'; }).join('') + '</div>'
      : '<label class="field mt22" for="pPartner">Partner oder Partnerin<input id="pPartner" class="input" type="text" autocomplete="off" data-bind="draft.partner" value="' + esc(d.partner || '') + '" placeholder="optional, für „Mein Partner kann“"></label>') +
    (evFam() === 'frei' ? '' : '<span class="eyebrow mt18 block">Tradition für diese Person</span><div class="chips mt10" role="group" aria-label="Tradition">' + FAM_PERSON[evFam()].map(function (k) { var sel = d.anlass === k; return '<button type="button" class="chip-btn sm' + (sel ? ' is-sel' : '') + '" data-act="draftAnlass" data-v="' + k + '" aria-pressed="' + sel + '">' + esc(FA[k].label) + '</button>'; }).join('') + '</div>' +
      (fa.kind === 'zeit' ? '<p class="small mt10">' + esc(fa.short || fa.label) + ' läuft als Event nach Zeit. Dauer und Zubehör stellst du beim Start ein.</p>'
        : '<div class="card pad mt14"><div class="row"><span class="stack grow"><span class="name">' + fa.units + ' am Kranz</span><span class="sub">Standard für Kranz abgehen</span></span>' + stepper('draftCount', d.count, '', fa.units) + '</div></div>'));
  return scr(topbar(UI.draftFrom, UI.draftIsNew ? 'Neue Person' : 'Person bearbeiten', right), body, '<button type="button" class="cta" data-act="savePerson">Speichern</button>');
};

/* =========================================================
   Home
   ========================================================= */
/* the date of the party (from the Game Pass), as a headline */
function homeWhen() {
  var today = dayStart(isoDay(Date.now())), p = null;
  try { p = passGet(); } catch (e) {}
  var ev = p && p.event && !(S && S.demo) ? dayStart(p.event) : NaN;
  if (isNaN(ev)) return { date: new Date().toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }), big: 'Heute Abend' };
  var d = Math.round((ev - today) / DAY), date = 'Fest am ' + new Date(ev).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
  return { date: date, big: d === 0 ? 'Heute wird gefeiert!' : d === 1 ? 'Morgen ist es so weit' : d > 1 ? 'Noch ' + d + ' Tage' : 'Heute Abend' };
}
function homeGuestN() { return S.questions.filter(function (q) { return q.status === 'ok' && isGuestAuthor(q.author); }).length; }
/* is the evening set up? who plays, the kind of game, everything checked once */
function cfgSaved() { var c = S.runCfg; return !!(c && c.saved && c.fam === evFam() && E() && E().focus.some(function (p) { return c.who && c.who[p.id]; })); }
function homeSetBar(ready) {
  if (!ready) return '<button type="button" class="setbar todo mt14" data-act="openRun"><span class="sb-e" aria-hidden="true">' + emb('dice', 34) + '</span><span class="stack grow" style="gap:2px;min-width:0;text-align:left"><b>Erst den Abend einstellen</b><span>Wer spielt, welche Spielart, alles bereit? Drei kurze Fragen, dann ist der Start frei.</span></span>' + icon('i-next', 20) + '</button>';
  var c = cfgDefaults(), who = cfgWho(), v = variantInfo(c.variant, c.fam);
  return '<button type="button" class="setbar done mt14" data-act="openRun"><span class="sb-ok" aria-hidden="true">' + icon('i-check', 18) + '</span><span class="stack grow" style="gap:2px;min-width:0;text-align:left"><b>Abend eingestellt</b><span>' + esc(joinNames(who.map(function (id) { return person(id).name; }))) + ' · ' + esc(v.label) + ' · ' + esc(cfgLenText(c, who, cfgTogether())) + ' · ca. ' + c.minutes + ' Min</span></span><span class="linkbtn">Ändern</span></button>';
}
function runLabel() {
  var f = E().focus, fam = evFam(), putzen = f.length && f.every(function (p) { return p.anlass === 'klinke'; });
  if (S.run && !S.run.finished) { var rf = S.run.fam || 'kranz'; return rf === 'zeit' ? (putzen ? 'Weiter beim Putzen' : 'Weiter beim Fegen') : rf === 'frei' ? 'Weiter im Spielabend' : 'Weiter am Kranz'; }
  if (fam === 'zeit') return putzen ? 'Klinken putzen starten' : 'Fegen starten';
  if (fam === 'frei') return 'Spielabend starten';
  return 'Kranz abgehen';
}
/* the heart of the app on the home screen: what the guests sent and what it turns into */
/* the way to everything about the guests, as a section of the home page (no bar at the bottom) */
function homeQSection() {
  var open = S.questions.filter(function (q) { return q.status === 'offen'; }).length, ok = S.questions.filter(questionPlayable).length;
  var cards = 0; if (typeof PC_KINDS !== 'undefined') PC_KINDS.forEach(function (t) { cards += pcFree(t).length; });
  var row = function (act, extra, bg, ic, title, sub, badge) { return '<button type="button" class="hm-row" data-act="' + act + '"' + extra + '><span class="hm-ic" style="background:' + bg + '">' + ic + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>' + title + '</b><small>' + sub + '</small></span>' + (badge ? '<span class="hm-badge">' + badge + '</span>' : '') + icon('i-next', 16) + '</button>'; };
  return '<h3 class="sec" id="hm-fragen">Fragen und Beiträge</h3><div class="hm-list mt10">' +
    row('homeJump', ' data-v="questions" data-j="qs-neu"', 'var(--orange)', icon('i-bubble', 20), 'Neu eingegangen', open ? (open === 1 ? 'Ein Beitrag wartet auf deine Freigabe' : open + ' Beiträge warten auf deine Freigabe') : 'Alles geprüft, ' + ok + ' freigegeben', open || '') +
    row('homeJump', ' data-v="questions" data-j="qs-link"', 'var(--mint)', icon('i-link', 20), 'Gäste einladen', 'Link, QR-Code und Text für die Gruppe') +
    row('openMasterForm', '', 'var(--sun)', icon('i-pencil', 20), 'Selbst Fragen eintragen', 'Geführt, mit eigenen Leveln') +
    row('openCards', ' data-from="home"', 'linear-gradient(120deg,#FDFEFF,#C6CFDA 45%,#8C98A8)', icon('i-star', 20), 'Karten für die Party', cards ? cards + ' im Umlauf: Joker, Weiterleiten, Regel' : 'Joker, Weiterleiten und Regel-Karte') +
    row('homeJump', ' data-v="questions" data-j="qs-alle"', 'var(--violet)', icon('i-users', 20), 'Alle Beiträge und Runden', 'Was die App daraus baut') + '</div>';
}
function homeGuestCard() {
  var e = E(), n = S.questions.filter(function (q) { return q.status === 'ok' && isGuestAuthor(q.author); }).length;
  var inv = roundInventory('', e.focus.map(function (p) { return p.id; })), rounds = 0;
  Object.keys(inv).forEach(function (k) { rounds += inv[k].rounds; });
  var guests = roleGuests(R() || { who: e.focus.map(function (p) { return p.id; }) }).length;
  return '<button type="button" class="guestcard plain mt14" data-act="go" data-to="questions"><span class="gc-e" aria-hidden="true">' + roleIcon('plauder', 38) + '</span><span class="stack grow" style="gap:3px;text-align:left;min-width:0"><b>' + (n ? 'Eure Gäste bauen mit' : 'Lasst die Gäste mitbauen') + '</b><span>' +
    (n ? n + (n === 1 ? ' Beitrag' : ' Beiträge') + ' von ' + guests + (guests === 1 ? ' Gast' : ' Gästen') + (rounds ? ', reicht für bis zu ' + rounds + (rounds === 1 ? ' Gäste-Runde' : ' Gäste-Runden') : '') + '.' : 'Schick den Gäste-Link in die Gruppe. Aus jedem Beitrag wird ein Stück eures Abends.') + '</span></span><span class="gc-cta">' + (n ? 'Ansehen' : 'Link teilen') + '</span></button>';
}
V.home = function () {
  var e = E();
  var big = e.focus.length > 2 ? 64 : 82;
  var faces = e.focus.map(function (f, i) { return face(f, big, 'border:5px solid var(--accent);box-sizing:border-box;' + (i ? 'margin-left:-18px;' : ''), ''); }).join('');
  var when = homeWhen(), running = S.run && !S.run.finished, ready = cfgSaved(), fx = UI.heroFx; UI.heroFx = '';
  var openQ = S.questions.filter(function (q) { return q.status === 'offen'; }).length;
  var okQ = S.questions.filter(questionPlayable).length;
  var drinksTotal = S.drinks.reduce(function (a, d) { return a + d.n; }, 0);
  var body = '<div class="hero">' + garland(350, ['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#15122B']) +
    '<div class="hero-faces live-wrap" aria-hidden="true">' + faces + '</div>' +
    '<h2>' + esc(focusNames() || 'Euer Abend') + '</h2><p>' + (running ? esc(runPosText(S.run)) : esc(evLabel()) + (e.name ? ' · ' + esc(e.name) : '')) + '</p>' +
    /* the start: locked until the evening is set up, then it begs to be pressed */
    '<button type="button" class="play' + (running ? '' : ready ? ' ready' + (fx === 'unlock' ? ' unlocked' : '') : ' locked') + '" data-act="heroGo"' + (!running && !ready ? ' aria-label="' + esc(runLabel()) + ', erst den Abend einstellen"' : '') + '><span>' + icon(!running && !ready ? 'i-lock' : 'i-play', 18) + '</span>' + runLabel() + (ready && !running ? '<i class="play-glint" aria-hidden="true"></i>' : '') + '</button>' +
    (running ? '' : '<button type="button" class="hero-hint plain" data-act="go" data-to="questions">' + icon('i-users', 16) + '<span class="grow">' + (homeGuestN() ? 'Mehr Gäste, mehr Spiele: ladet noch mehr ein.' : 'Ladet eure Gäste ein, sie bauen die Spiele mit.') + '</span><b>Einladen</b></button>') + '</div>' +
    (running ? '' : homeSetBar(ready)) +
    homeGuestCard() + '\u0001' + demoHomeHtml() + homeQSection() +
    factCard('home') + '\u0002' +
    '<h3 class="sec" id="hm-spiele">Spiele</h3><p class="small mt6">Zwischendurch spielen, auch ohne Kranz. Welche Spiele im Abend drankommen, bleibt geheim.</p><div class="games mt10">' +
    '<button type="button" class="gtile" data-act="freeQuick" data-v="wwe" style="background:var(--sun)"' + (e.focus.length < 2 ? ' disabled' : '') + '><svg class="art" aria-hidden="true" width="86" height="70" style="top:12px;right:8px"><use href="#i-bubbles"></use></svg><b>Wer würde eher?</b><small>' + (e.focus.length < 2 ? 'Ab zwei Fokus-Personen' : 'Gruppe stimmt per Link ab') + '</small></button>' +
    '<button type="button" class="gtile" data-act="freeQuick" data-v="schaetzen" style="background:var(--violet)"><span class="art" aria-hidden="true" style="top:10px;right:14px;font:900 64px/1 var(--display)">≈</span><b>Schätzen gegen die Gruppe</b><small>Schieberegler per Link</small></button>' +
    '<button type="button" class="gtile' + (demoFreeOk('partner') ? '' : ' dlk') + '" data-act="freeQuick" data-v="partner" style="background:var(--mint)">' + (demoFreeOk('partner') ? '' : '<span class="dl-badge">' + icon('i-lock', 14) + '</span>') + '<span class="art" aria-hidden="true" style="top:14px;right:14px">' + icon('i-users', 50) + '</span><b>Mein Partner kann</b><small>' + (S.used && S.used.partnerGame ? 'Heute schon gespielt' : 'Mehrere Runden, ein Sieger') + '</small></button>' +
    '<button type="button" class="gtile" data-act="freeQuick" data-v="spiel" style="background:#FF9A73"><span class="art" aria-hidden="true" style="top:14px;right:14px">' + icon('i-dice', 50) + '</span><b>Zufalls-Minispiel</b><small>' + playableCount() + ' spielbar mit eurem Material</small></button></div>';
  var right = '<button type="button" class="iconbtn" data-act="go" data-to="settings" aria-label="Einstellungen" style="width:48px;height:48px;border-radius:16px">' + icon('i-gear', 22) + '</button>';
  var head = '<div class="row" style="justify-content:space-between;align-items:flex-start"><div class="stack gap6" style="min-width:0"><span class="eyebrow inline-ic">' + icon('i-star', 14) + 'Du bist Spielleiter · ' + esc(when.date) + '</span><h1 class="h-big">' + esc(when.big) + '</h1></div><div class="row gap8"><button type="button" class="iconbtn" data-act="openTour" aria-label="Was kann die App?" style="width:48px;height:48px;border-radius:16px">' + icon('i-sparkle', 22) + '</button>' + right + '</div></div>';
  var cut1 = body.indexOf('\u0001'), cut2 = body.indexOf('\u0002');
  body = dk(body.slice(0, cut1), body.slice(cut1 + 1, cut2), 'dk-home') + body.slice(cut2 + 1);
  body = passStatusHtml(true) + body;
  var hin = UI.homeIn; UI.homeIn = false;
  body += '<button type="button" class="hm-row mt10" data-act="go" data-to="games"><span class="hm-ic" style="background:var(--violet)">' + icon('i-pad', 20) + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>Alle Spiele und euer Material</b><small>Was im Haus ist, entscheidet, was drankommt</small></span>' + icon('i-next', 16) + '</button>';
  return scr(head, body, '', hin ? 'hin' : '');
};

/* =========================================================
   Settings
   ========================================================= */
V.settings = function () {
  var e = E();
  var body = '<span class="eyebrow">Abend</span>' +
    '<label class="field mt10" for="setName">Name des Abends<input id="setName" class="input" type="text" autocomplete="off" data-bind="event.name" value="' + esc(e.name) + '"></label>' +
    '<span class="eyebrow mt22 block">Party-Art</span><div class="mt10">' + (UI.setTypeOpen ? typePicker() + '<button type="button" class="linkbtn mt6" data-act="setTypeOpen">Liste schließen</button>' : typeCurrent()) + '</div>' + (S.run && !S.run.finished ? '<p class="small mt8">Ein laufendes Spiel behält seine Art bis zum Ende.</p>' : '') +
    '<span class="eyebrow mt22 block">Im Fokus</span><div class="mt10">' + focusList('settings') + '</div>' +
    '<span class="eyebrow mt22 block">Material & Zubehör</span><button type="button" class="card pad row plain mt10" data-act="openMaterial" data-from="settings" style="width:100%"><span class="tile-ic" style="width:44px;height:44px;border-radius:14px;background:var(--sun)">' + icon('i-box', 22) + '</span><span class="stack grow" style="text-align:left;gap:2px"><span class="name">Was habt ihr da?</span><span class="sub">' + esc(matSummary()) + '</span></span>' + icon('i-next', 18) + '</button>' +
    '\u0001<span class="eyebrow mt22 block">' + esc(U()) + '-Regeln</span>' + rulesBlock() +
    '<button type="button" class="set-fold mt22" data-act="setPilotOpen" aria-expanded="' + !!UI.setPilotOpen + '"><span class="stack grow" style="gap:2px;text-align:left"><b>So rechnet der Pinnchen-Pilot</b><span class="sub">' + (UI.setPilotOpen ? 'Zuklappen' : 'Ziel, Maximum, Joker und Tempo, kurz erklärt') + '</span></span>' + icon('i-next', 18) + '</button>' +
    (!UI.setPilotOpen ? '' : '<div class="card pad mt10 stack gap10 small" style="color:var(--text)">' +
    '<p>Für jede Fokus-Person gibt es ein Maximum für den ganzen Abend und ein Ziel (' + e.target + ' % davon). Alles zählt zusammen: Kranz, freie Spiele und Einträge im Zähler. Das Maximum wird nie überschritten.</p>' +
    '<p>Ein Wasser-Joker senkt das Ziel um das, was er ersetzt. Der Pilot holt das ' + esc(e.unit) + ' also nicht später wieder rein.</p>' +
    '<p>Etwa ein Drittel des Ziels kommt über Anstoß-Momente, die sich gleichmäßig über das Spiel verteilen. Den Rest teilt der Pilot auf verlorene Aufgaben auf: Er schaut, wie viele Aufgaben noch kommen und was schon getrunken wurde.</p>' +
    '<p>Pro Spiel trinkt jede Person höchstens 1 ' + esc(e.unit) + ', nie zwei. Der Pilot entscheidet nur, ob eine Niederlage 1 ' + esc(e.unit) + ' kostet oder ob es diesmal bei Wasser bleibt.</p>' +
    '<p>Wer stark spielt, darf unter dem Ziel bleiben: Das persönliche Ziel sinkt bis auf 60 %. Wer oft verliert, landet etwas höher, aber nie über dem Maximum. Über einen ganzen Abend gemittelt landet ihr so bei etwa ' + e.target + ' %.</p>' +
    '<p>Am Ende des Spiels gibt es ein Abschluss-' + esc(e.unit) + ' nur für alle, die noch deutlich unter ihrem persönlichen Ziel liegen.</p>' +
    '<p>Liegt jemand über Plan, gibt es Wasser statt ' + esc(e.unit) + '. Ist das Spiel zu langsam, geht es trotz Fehlversuch weiter oder es gibt Bonus-Schritte. Ist es zu schnell oder liegt jemand deutlich unter Plan, geht es zur Strafe auch mal zurück.</p>' +
    '<p>Eine große Gäste-Runde ab fünf Fragen bringt zwei Schritte weiter, wenn das Tempo es zulässt und niemand unter seinem Plan liegt.</p>' +
    '<p>Was du im Zähler einträgst, fließt sofort mit ein. Gezählt wird nur bei den Geburtstagskindern, nie bei den Gästen.</p>' +
    '<p>Bei einer Herausforderung trinkt der Gast nie. Verliert er, löst er seinen Wetteinsatz ein. Die Revanche-Karte wiederholt eine verlorene Herausforderung, gewertet wird nur das zweite Ergebnis, also höchstens 1 ' + esc(e.unit) + '.</p>' +
    '<p>Die Handicap-Station kostet nie etwas. Atempause heißt Wasser bei Niederlagen, Vollgas heißt kein Glück mit Wasser (höchstens eins über dem persönlichen Ziel), Strafe statt ' + esc(e.unit) + ' wird wie ein Joker verbucht. Maximum und Tempo-Bremse gelten immer.</p></div>') +
    passSettingsHtml() +
    '<button type="button" class="tourcard plain mt14" data-act="openTour"><span class="tc-e" aria-hidden="true">' + emb('garland', 40) + '</span><span class="stack grow" style="gap:2px;text-align:left"><b>Was kann die App?</b><span>Das Intro noch einmal ansehen</span></span>' + icon('i-play', 18) + '</button>' +
    '<span class="eyebrow mt22 block">Verantwortung</span><p class="small mt6">zparkling ist ein Spiel für Erwachsene. Ob Alkohol im Spiel ist, entscheidet der Spielleiter; niemand muss trinken, Wasser oder Aussetzen ist immer okay. Wer fährt, schwanger ist oder Medikamente nimmt, spielt ohne. Bei Bewusstlosigkeit: Notruf 112.</p>' + legalLinks('mt8') +
    '<span class="eyebrow mt22 block">Daten</span><p class="small mt6">Alles bleibt nur in diesem Browser gespeichert.</p>' +
    (S.demo ? '<button type="button" class="btn-ghost mt10" data-act="openDemoPick" data-from="home">Anderen Beispiel-Abend laden</button>' : UI.confirm === 'loadDemo' ? confirmBox('Den Beispiel-Abend laden?', 'Dein eigener Abend wird dabei ersetzt. Lieber erst die Party zu Ende feiern.', 'loadDemo', 'Laden') : '<button type="button" class="btn-ghost mt10" data-act="askConfirm" data-v="loadDemo">Beispiel-Abend laden</button>') +
    (UI.confirm === 'resetAll' ? confirmBox('Den ganzen Abend löschen?', 'Personen, Fragen, Zähler und der Spielstand gehen verloren.', 'resetAll', 'Löschen') : '<button type="button" class="btn-ghost danger mt10" data-act="askConfirm" data-v="resetAll">Abend löschen und neu anfangen</button>');
  var cut = body.indexOf('\u0001');
  body = dk(body.slice(0, cut), body.slice(cut + 1), 'dk-set');
  return scr(topbar('home', 'Einstellungen'), body, '', 'dw');
};

/* =========================================================
   Counter
   ========================================================= */
V.counter = function () {
  var e = E(), since = S.run && !S.run.finished ? S.run.t0 : 0;
  var focusCards = e.focus.map(function (p) {
    var b = budget(p.id), all = drinksOf(p.id);
    return '<div class="card pad"><div class="row">' + face(p, 52) + '<span class="stack grow gap6"><span class="name">' + esc(p.name) + '</span>' +
      '<span class="sub">' + 'Heute: ' + b.C + ' von max. ' + b.M + ' · ' + targetText(p.id) + ' · ' + jokersLeft(p.id) + ' Joker</span>' + pilotBar(p.id) + '</span></div>' +
      '<div class="cta-row mt10"><button type="button" class="btn-dark" style="height:48px;width:56px;flex:0 0 56px;padding:0" data-act="drinkMinus" data-id="' + p.id + '" aria-label="Eins weniger für ' + esc(p.name) + '">' + icon('i-minus', 18) + '</button><button type="button" class="cta" style="height:48px;font-size:15px" data-act="drinkPlus" data-id="' + p.id + '">' + icon('i-plus', 18) + '1 ' + esc(e.unit) + ' für ' + esc(p.name) + '</button></div></div>';
  }).join('<div class="mt10"></div>');
  var log = S.drinks.filter(function (d) { return isFocus(d.pid); }).slice(-8).reverse().map(function (d) {
    var p = person(d.pid), tm = new Date(d.t).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    return '<div class="logrow"><span class="num sub" style="width:42px">' + tm + '</span><span class="grow" style="font-size:13px;font-weight:700">' + esc(p.name) + ' · ' + (d.n > 0 ? '+' : '') + d.n + ' ' + esc(e.unit) + (d.note ? ' <span class="sub">' + esc(d.note) + '</span>' : '') + '</span><span class="sub">' + (d.src === 'spiel' ? 'Spiel' : 'Hand') + '</span></div>';
  }).join('') || '<p class="small" style="padding:12px 0">Noch nichts eingetragen.</p>';
  var body = '<p class="small">Gezählt wird nur bei den Geburtstagskindern, damit der Pilot weiterrechnen kann. Was die Gäste trinken, ist ihre Sache.</p>' +
    dk('<span class="eyebrow mt18 block">Im Fokus</span><div class="mt10">' + focusCards + '</div>',
    '<span class="eyebrow mt22 block">Zuletzt</span><div class="card padrows mt10">' + log + '</div>' +
    (S.drinks.length ? '<button type="button" class="btn-ghost mt10" data-act="undoDrink">' + icon('i-undo', 18) + 'Letzten Eintrag löschen</button>' : ''));
  var head = topbar(UI.counterFrom || (S.run && !S.run.finished ? 'run' : 'home'), esc(e.unit) + '-Zähler');
  return scr(head, body, '');
};

/* =========================================================
   Questions (collect + review)
   ========================================================= */
var QTYPES = [
  ['worte', 'In zwei Worten', 'Ein Wort, das die Person beschreibt, und ein Interesse von ihr. Daraus werden eigene Fragen, Sätze und Sprüche.', 'kurz'],
  ['steckbrief', 'Steckbrief', 'Geburtstag, seit wann ihr euch kennt, wie ihr euch kennengelernt habt. Daraus macht die App Fragen über dich.', 'ich'],
  ['luege', 'Zwei Wahrheiten, eine Lüge', 'Drei Sätze über dich, einer ist gelogen. Im Spiel muss die Lüge gefunden werden.', 'ich'],
  ['wer', 'Wer hat’s geschrieben?', 'Eine Erinnerung an das Geburtstagskind. Im Spiel wird geraten, von welchem Gast sie ist.', 'ich'],
  ['tipp', 'Tippspiel', 'Tipp, wie lange das Spiel dauert. Wer am nächsten dran ist, wird am Ende gefeiert.', 'ich'],
  ['schaetzen', 'Schätzfrage', 'Eine Zahl, wer näher dran ist, gewinnt', 'frage'],
  ['auswahl', 'Auswahl', '2 bis 4 Antworten, eine ist richtig', 'frage'],
  ['bereich', 'Bereich', 'Schieberegler von bis, mit Lösung', 'frage'],
  ['aufgabe', 'Aufgabe', 'Etwas tun, mit eigener Bewertungsregel', 'frage']
];
function runNameText() { var f = evFam(); return f === 'zeit' ? (E().focus.every(function (p) { return p.anlass === 'klinke'; }) ? 'das Klinkenputzen' : 'das Treppefegen') : f === 'frei' ? 'der Spielabend' : 'das Kranz-Abgehen'; }
function qTypeLabel(t) { var x = QTYPES.filter(function (q) { return q[0] === t; })[0]; return x ? x[1] : t; }
function qDetails(q) {
  if (q.type === 'schaetzen') return 'Lösung: ' + fmtNum(q.answer) + ' ' + esc(q.unit || '');
  if (q.type === 'bereich') return 'Von ' + fmtNum(q.min) + ' bis ' + fmtNum(q.max) + ' · Lösung: ' + fmtNum(q.answer) + ' ' + esc(q.unit || '');
  if (q.type === 'auswahl') return q.options.map(function (o, i) { return (i === q.correct ? '✓ ' : '') + esc(o); }).join(' · ');
  if (q.type === 'aufgabe') return 'Bewertung: ' + esc(q.note || 'Spielleiter entscheidet');
  if (q.type === 'steckbrief') return [q.year ? 'Kennt sich seit ' + q.year : '', q.bday ? 'Geburtstag ' + esc(fmtBday(q.bday)) : '', q.byear ? 'Jahrgang ' + q.byear : '', q.meet ? 'Kennengelernt: ' + esc(q.meet) : ''].filter(Boolean).join(' · ');
  if (q.type === 'luege') return q.options.map(function (o, i) { return (i === q.correct ? '✗ ' : '') + esc(o); }).join(' · ') + ' (✗ = gelogen)';
  if (q.type === 'wer') return 'Im Spiel wird geraten, von wem das ist.';
  if (q.type === 'tipp') return 'Wird am Ende aufgelöst.';
  if (q.type === 'portrait') return 'Ein Porträt, gemalt gegen die Uhr.';
  if (q.type === 'wenn') { var wc = wennCat(q.cat); return (wc ? 'Wenn … ' + wc[1] + ' wäre: ' : '') + esc(q.text); }
  if (q.type === 'spruch') return '„' + esc(q.text) + '“';
  if (q.type === 'umfrage') return esc(umfrageText(q.qk, qAboutName(q))) + ' ' + esc(q.text);
  if (q.type === 'joker') return 'Joker' + (q.text ? ', Bedingung: ' + esc(q.text) : '');
  if (q.type === 'weiter') return 'Weiterleiten-Karte';
  if (q.type === 'regel') return 'Regel-Karte';
  if (GQ_MORE[q.type]) return qDetailsMore(q);
  return '';
}
function qAboutName(q) { return q.forId && isFocus(q.forId) ? person(q.forId).name : E() && E().focus.length ? focusNames() : 'das Geburtstagskind'; }
var INV_LABEL = { luege: 'Lügen', wer: 'Erinnerungen', meet: 'Kennenlern-Geschichten', frage: 'Fragen zum Schätzen und Raten', jahr: 'Steckbrief-Jahre', bday: 'Geburtstage', portrait: 'Porträts', wenn: '„Wenn … wäre“-Antworten', spruch: 'Lieblingssprüche', umfrage: 'Antworten für die Top-Antworten-Tafel' };
/* ---------- guest contributions, the master's view ---------- */
var QK_SHORT = { worte: 'Zwei Worte', steckbrief: 'Steckbrief', luege: 'Lüge', wer: 'Erinnerung', tipp: 'Tipp', schaetzen: 'Schätzen', auswahl: 'Auswahl', bereich: 'Bereich', aufgabe: 'Aufgabe' };
var FAM_IC = { luege: 'mask', wer: 'letter', meet: 'book', frage: 'jar', jahr: 'idcard', bday: 'cake', portrait: 'brush', wenn: 'thought', spruch: 'quote', umfrage: 'podium' };
/* guests have no avatar of their own: a look drawn from their name, always the same */
function guestFace(name, size, style, mood) {
  var c = withSeed(strHash('g:' + String(name || '').toLowerCase()), function () { return avRandom(); });
  c.neck = 'keiner'; c.pat = 'keins';
  return '<span class="t-face" style="width:' + size + 'px;height:' + size + 'px;' + (style || '') + '">' + avatarSVG(c, mood ? { mood: mood } : undefined) + '</span>';
}
function qStyle(t) { return GQ_STYLE[t] || { c: '#FFC940', e: 'pen' }; }
function qForText(q) { return q.forId && isFocus(q.forId) ? 'über ' + person(q.forId).name : E().focus.length > 1 ? 'über alle' : ''; }
function qHeadline(q) {
  if (q.type === 'steckbrief') return 'Steckbrief von ' + q.author;
  if (q.type === 'luege') return 'Drei Sätze von ' + q.author + ', einer ist gelogen';
  if (q.type === 'tipp') return 'Tippt auf ' + fmtNum(q.answer) + ' Minuten';
  if (q.type === 'wer') return '„' + q.text + '“';
  if (q.type === 'worte') return [q.trait, q.interest].filter(Boolean).join(' und ');
  if (q.type === 'portrait') return 'Porträt von ' + qAboutName(q);
  if (q.type === 'spruch') return '„' + q.text + '“';
  if (q.type === 'wenn') { var wc = wennCat(q.cat); return (wc ? 'Wäre ' + wc[1] + ': ' : '') + q.text; }
  if (q.type === 'umfrage') return 'Umfrage: ' + q.text;
  if (q.type === 'joker') return 'Joker von ' + q.author;
  if (q.type === 'weiter') return 'Weiterleiten-Karte von ' + q.author;
  if (q.type === 'regel') return 'Regel-Karte von ' + q.author;
  return q.text;
}
function qPills(q) {
  var P = function (t, cls) { return '<span class="qx-pill' + (cls ? ' ' + cls : '') + '">' + t + '</span>'; };
  var wrap = function (s) { return s ? '<div class="qx-pills">' + s + '</div>' : ''; };
  if (q.type === 'schaetzen') return wrap(P(icon('i-check', 13) + 'Lösung: ' + esc(fmtNum(q.answer) + ' ' + (q.unit || '')), 'ok'));
  if (q.type === 'bereich') return wrap(P(esc('Von ' + fmtNum(q.min) + ' bis ' + fmtNum(q.max) + ' ' + (q.unit || ''))) + P(icon('i-check', 13) + 'Lösung: ' + esc(fmtNum(q.answer)), 'ok'));
  if (q.type === 'auswahl') return wrap(q.options.map(function (o, i) { return [o, i]; }).filter(function (x) { return String(x[0] || '').trim(); }).map(function (x) { return x[1] === q.correct ? P(icon('i-check', 13) + esc(x[0]), 'ok') : P(esc(x[0])); }).join(''));
  if (q.type === 'aufgabe') return '<p class="qx-sub">So wird gewertet: ' + esc(q.note || 'Der Spielleiter entscheidet') + '</p>';
  if (q.type === 'steckbrief') return wrap([q.year ? P('Kennt sich seit ' + esc(q.year)) : '', q.bday ? P('Geburtstag ' + esc(fmtBday(q.bday))) : '', q.byear ? P('Jahrgang ' + esc(q.byear)) : ''].join('')) + (q.meet ? '<p class="qx-quote">„' + esc(q.meet) + '“</p>' : '');
  if (q.type === 'luege') return '<div class="qx-lines">' + q.options.map(function (o, i) { return '<span' + (i === q.correct ? ' class="lie"' : '') + '>' + esc(o) + (i === q.correct ? '<i>gelogen</i>' : '') + '</span>'; }).join('') + '</div>';
  if (q.type === 'wer') return wrap(P('Im Spiel wird geraten, von wem das ist'));
  if (q.type === 'tipp') return wrap(P('Wird am Ende aufgelöst'));
  if (q.type === 'worte') return wrap((q.trait ? P('Ist: ' + esc(q.trait)) : '') + (q.interest ? P('Mag: ' + esc(q.interest), 'ok') : ''));
  if (q.type === 'portrait') return '<div class="qx-draw">' + drawSvg(q.draw, 132) + '</div>';
  if (q.type === 'wenn') { var wc = wennCat(q.cat); return wrap(P('Wenn ' + esc(qAboutName(q)) + ' ' + esc(wc ? wc[1] : '…') + ' wäre')); }
  if (q.type === 'spruch') return wrap(P('Sagt ' + esc(qAboutName(q)) + ' angeblich ständig'));
  if (q.type === 'umfrage') return wrap(P('Auf die Umfrage: ' + esc(umfrageText(q.qk, qAboutName(q)))));
  if (q.type === 'joker') return wrap(P(q.text ? 'Bedingung: ' + esc(q.text) : 'Ohne Bedingung') + P('Befreit einmal von einem ' + esc(U()), 'ok'));
  if (q.type === 'weiter') return wrap(P('Gibt den Trinkbuddy-Job einmal weiter', 'ok'));
  if (q.type === 'regel') return wrap(P('Eine Regel für fünf Minuten', 'ok') + P('Bruch kostet ein ' + esc(U())));
  return '';
}
function qCard(q, i) {
  var st = qStyle(q.type), ft = qForText(q);
  return '<div class="qx-card" style="--tc:' + st.c + ';--i:' + i + '"><div class="qx-ct"><span class="qx-ic">' + emb(st.e, 26) + '</span><span class="stack grow" style="gap:3px;min-width:0"><b>' + esc(qTypeLabel(q.type)) + '</b><small>' + (isGuestAuthor(q.author) ? guestFace(q.author, 20) : '') + 'von ' + esc(q.author) + (ft ? ', ' + esc(ft) : '') + '</small></span></div>' +
    '<div class="qx-cb"><p class="qx-q">' + esc(qHeadline(q)) + '</p>' + qPills(q) +
    '<div class="qx-acts"><button type="button" class="qx-no" data-act="qSet" data-id="' + q.id + '" data-v="nein">' + icon('i-close', 16) + 'Ablehnen</button><button type="button" class="qx-yes" data-act="qSet" data-id="' + q.id + '" data-v="ok">' + icon('i-check', 18) + 'Freigeben</button></div></div></div>';
}
function qRow(q) {
  var st = qStyle(q.type), open = UI.qOpen === q.id, ft = qForText(q);
  var mini = function (v, label, ic) { return '<button type="button" class="qx-mini" data-act="qSet" data-id="' + q.id + '" data-v="' + v + '">' + icon(ic, 14) + label + '</button>'; };
  var acts = q.status === 'ok' ? mini('offen', 'Zurück zu „Neu“', 'i-undo') + mini('nein', 'Ablehnen', 'i-close') : mini('ok', 'Doch freigeben', 'i-check') + mini('offen', 'Zurück zu „Neu“', 'i-undo');
  return '<div class="qx-item' + (open ? ' open' : '') + '" style="--tc:' + st.c + '"><button type="button" class="qx-row" data-act="qOpen" data-id="' + q.id + '" aria-expanded="' + open + '"><span class="qx-row-ic">' + emb(st.e, 24) + '</span><span class="stack grow" style="gap:2px;min-width:0"><span class="qx-row-t">' + esc(qHeadline(q)) + '</span><span class="qx-row-s">von ' + esc(q.author) + (ft ? ', ' + esc(ft) : '') + '</span></span>' + (q.used ? '<span class="qx-used">gespielt</span>' : '') + icon('i-next', 16) + '</button>' +
    (open ? '<div class="qx-exp">' + qPills(q) + '<div class="qx-acts2">' + acts + '</div></div>' : '') + '</div>';
}
/* which rounds the app can build: progress per kind, the games themselves stay a secret */
function qRounds() {
  var inv = roundInventory('', E().focus.map(function (p) { return p.id; })), stat = ggStatus(false), total = 0;
  var rows = ROUND_FAMS.concat(ONCE_FAMS).map(function (f) {
    var x = inv[f], once = ONCE_FAMS.indexOf(f) >= 0, st = stat.filter(function (s) { return s.g.fam === f; });
    var miss = st.length ? Math.min.apply(null, st.map(function (s) { return s.miss; })) : 0;
    var need = st.length ? Math.min.apply(null, st.map(function (s) { return s.g.need; })) : 3;
    var used = once && !x.rounds && ggFamUsed(f), show = x.show != null ? x.show : x.have;
    var have = once ? (x.rounds || used ? need : Math.max(0, need - miss)) : show;
    var slots = once ? need : Math.min(9, Math.max(need, Math.ceil(Math.max(1, show) / need) * need));
    total += x.rounds;
    var unit = f === 'umfrage' ? [' Antwort', ' Antworten'] : f === 'wenn' ? [' Kategorie', ' Kategorien'] : [' Beitrag', ' Beiträge'];
    var sub = x.rounds ? (once ? 'Bereit für eine Runde' : f === 'umfrage' ? (x.rounds === 1 ? 'Eine Tafel ist voll genug' : x.rounds + ' Tafeln sind voll genug') : show + (show === 1 ? unit[0] : unit[1]) + ', reicht für ' + (x.rounds === 1 ? 'eine Runde' : 'bis zu ' + x.rounds + ' Runden'))
      : used ? 'Heute schon dran gewesen' : once ? (miss ? ggNeedText(f, miss) : 'Noch nichts da') : show ? ggNeedText(f, Math.max(1, need - show)) : CARD_FAMS.indexOf(f) >= 0 ? 'Kommt über die Bonuskarten der Gäste' : 'Noch nichts da';
    var seg = ''; for (var k = 0; k < slots; k++) seg += '<i' + (k < Math.min(have, slots) ? ' class="on"' : '') + '></i>';
    return '<div class="qx-fam' + (x.rounds ? ' ready' : used ? ' used' : '') + '"><span class="qx-fam-ic">' + emb(FAM_IC[f], 28) + '</span><span class="stack grow" style="min-width:0;gap:1px"><b>' + esc(INV_LABEL[f]) + '</b><span class="qx-seg" aria-hidden="true">' + seg + '</span><small>' + esc(sub) + '</small></span>' +
      (x.rounds ? '<span class="qx-fam-n">' + (x.rounds === 1 ? '1 Runde' : x.rounds + ' Runden') + '</span>' : '') + '</div>';
  }).join('');
  return { html: rows, total: total };
}
/* what came in so far, per kind, and how far to the next level of the party: makes you want to invite more */
var Q_MILES = [[10, 'Warm-up'], [25, 'Gute Party'], [50, 'Großes Fest'], [80, 'Legendär'], [120, 'Kult']];
function qCollectOverview() {
  var subs = guestSubmissions().filter(function (q) { return !q.ai; }), n = subs.length, names = {};
  subs.forEach(function (q) { names[String(q.author).toLowerCase()] = 1; });
  var g = Object.keys(names).length, per = g ? n / g : 4;
  var mi = Q_MILES.filter(function (m) { return n >= m[0]; }).length, cur = Q_MILES[mi - 1], nx = Q_MILES[mi];
  var from = cur ? cur[0] : 0, pct = nx ? Math.round((n - from) / (nx[0] - from) * 100) : 100;
  var need = nx ? nx[0] - n : 0, more = Math.max(1, Math.ceil(need / Math.max(1, per)));
  var cnt = {}; QTYPES.forEach(function (t) { cnt[t[0]] = 0; }); subs.forEach(function (q) { if (cnt[q.type] != null) cnt[q.type]++; });
  var tiles = QTYPES.filter(function (t) { return demoTypeOk(t[0]); }).map(function (t) {
    var c = cnt[t[0]], st = qStyle(t[0]);
    return '<button type="button" class="qo-t' + (c ? '' : ' zero') + '" style="--tc:' + st.c + '" data-act="qKindJump" data-v="' + t[0] + '">' + emb(st.e, 24) + '<b class="num">' + c + '</b><small>' + esc(t[0] === 'worte' ? 'Worte' : (QK_SHORT[t[0]] || t[1])) + '</small>' + (c ? '' : '<i>fehlt</i>') + '</button>';
  }).join('');
  var hidden = demoHiddenTypes('') + demoHiddenTypes('karte');
  var steps = Q_MILES.map(function (m, k) { return '<span class="qo-mile' + (n >= m[0] ? ' on' : '') + (k === mi ? ' next' : '') + '"><i></i><small>' + esc(m[1]) + '</small></span>'; }).join('');
  return '<div class="qo mt14"><div class="qo-top"><span class="qo-n num">' + n + '</span><span class="stack grow" style="gap:2px;min-width:0"><b>' + (n === 1 ? 'Beitrag eingegangen' : 'Beiträge eingegangen') + '</b><span>' + (cur ? 'Stufe: ' + esc(cur[1]) : 'Noch keine Stufe') + (g ? ' · von ' + g + (g === 1 ? ' Gast' : ' Gästen') : '') + '</span></span>' + (cur ? '<span class="qo-badge">' + emb('trophy', 26) + '</span>' : '') + '</div>' +
    '<div class="qo-bar" role="img" aria-label="' + n + ' Beiträge, ' + (nx ? 'noch ' + need + ' bis ' + nx[1] : 'höchste Stufe') + '"><b style="width:' + pct + '%"></b></div>' +
    '<p class="qo-next">' + (nx ? 'Noch <b>' + need + '</b> bis „' + esc(nx[1]) + '“. Das schaffen ' + (g ? 'etwa ' : 'schon ') + more + (more === 1 ? ' weiterer Gast' : ' weitere Gäste') + '.' : 'Höchste Stufe erreicht. Was für eine Party!') + '</p>' +
    '<div class="qo-miles">' + steps + '</div>' +
    '<div class="qo-grid mt14">' + tiles + (hidden ? '<button type="button" class="qo-t lock" data-act="demoLocked">' + icon('i-lock', 20) + '<b class="num">+' + hidden + '</b><small>Game Pass</small></button>' : '') + '</div>' +
    '<button type="button" class="qo-cta mt14" data-act="jump" data-v="qs-link">' + icon('i-users', 18) + 'Mehr Gäste einladen</button></div>';
}
function qHero(rounds) {
  var subs = S.questions.filter(function (q) { return q.status !== 'nein' && isGuestAuthor(q.author); }), names = [];
  subs.forEach(function (q) { if (names.indexOf(q.author) < 0) names.push(q.author); });
  var open = S.questions.filter(function (q) { return q.status === 'offen'; }).length;
  var faces = names.slice(0, 4).map(function (n, i) { return guestFace(n, 46, i ? 'margin-left:-15px' : ''); }).join('') + (names.length > 4 ? '<span class="qx-more">+' + (names.length - 4) + '</span>' : '');
  var st = [];
  if (subs.length) st = [[subs.length, subs.length === 1 ? 'Beitrag' : 'Beiträge', ''], [names.length, names.length === 1 ? 'Gast' : 'Gäste', ''], [rounds, rounds === 1 ? 'Gäste-Runde möglich' : 'Gäste-Runden möglich', 'mint']];
  if (open) st.push([open, open === 1 ? 'wartet auf dich' : 'warten auf dich', 'sun']);
  return '<div class="qx-hero' + (faces ? '' : ' still') + '"><div class="qx-faces" aria-hidden="true">' + (faces || '<span class="qx-hero-e">' + emb('letter', 50) + '</span>') + '</div>' +
    '<h2>' + (subs.length ? 'Eure Gäste bauen mit.' : 'Noch ist es still.') + '</h2>' +
    '<p>' + (subs.length ? 'Aus jedem Beitrag wird ein Stück eures Abends. Du prüfst kurz, was reinkommt, den Rest plant die App.' : 'Schick den Link in die Gruppe. Hier landet alles, was eure Gäste schicken, und du gibst es mit einem Tipp frei.') + '</p>' +
    (st.length ? '<div class="qx-stk">' + st.map(function (x, i) { return '<span class="qx-st ' + x[2] + '" style="--i:' + i + ';--r:' + [-3, 2, -2, 3][i] + 'deg"><b>' + esc(String(x[0])) + '</b>' + esc(x[1]) + '</span>'; }).join('') + '</div>' : '') + '</div>';
}
/* a part of the guests' page: its own frame, a coloured head with emblem, title, count, a line what it is */
function qPanel(id, color, em, title, lead, count, inner, headExtra) {
  return '<section class="qp mt18" id="' + id + '" style="--pc:' + color + '"><header class="qp-h"><span class="qp-e">' + emb(em, 28) + '</span><span class="stack grow" style="gap:3px;min-width:0"><b>' + title + (count != null && count !== '' ? '<span class="qp-n">' + count + '</span>' : '') + '</b>' + (lead ? '<small>' + lead + '</small>' : '') + '</span>' + (headExtra || '') + '</header><div class="qp-b">' + inner + '</div></section>';
}
V.questions = function () {
  var enter = app.getAttribute('data-screen') !== 'questions';
  var open = S.questions.filter(function (q) { return q.status === 'offen' && !q.ai; }).sort(function (a, b) { return b.t - a.t; });
  var f = UI.qFilter === 'nein' ? 'nein' : 'ok', kind = UI.qKind || '';
  var cnt = { ok: 0, nein: 0 }, tc = {};
  QTYPES.forEach(function (t) { tc[t[0]] = 0; });
  S.questions.forEach(function (q) { if (q.ai) return; if (cnt[q.status] != null) cnt[q.status] += 1; if (q.status === f && tc[q.type] != null) tc[q.type] += 1; });
  var list = S.questions.filter(function (q) { return !q.ai && q.status === f && (!kind || q.type === kind); }).sort(function (a, b) { return b.t - a.t; });
  var more = list.length > 6 && !kind && !UI.qAll;
  var rd = qRounds();
  var aufg = S.questions.filter(function (q) { return q.type === 'aufgabe' && questionPlayable(q); }).length;
  var filt = '<div class="qp-filter" role="group" aria-label="Nach Art filtern"><button type="button" class="qp-f' + (kind ? '' : ' on') + '"' + (kind ? ' data-act="qKind" data-v="' + kind + '"' : '') + '>Alle</button>' + QTYPES.filter(function (t) { return demoTypeOk(t[0]) && tc[t[0]]; }).map(function (t) { var s2 = kind === t[0], st = qStyle(t[0]); return '<button type="button" class="qp-f' + (s2 ? ' on' : '') + '" style="--tc:' + st.c + '" data-act="qKind" data-v="' + t[0] + '" aria-pressed="' + s2 + '">' + emb(st.e, 18) + esc(QK_SHORT[t[0]] || t[1]) + '<i>' + tc[t[0]] + '</i></button>'; }).join('') + '</div>';
  var seg = '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr));height:44px" role="group" aria-label="Freigegeben oder abgelehnt">' + [['ok', 'Freigegeben'], ['nein', 'Abgelehnt']].map(function (x) { var s2 = f === x[0]; return '<button type="button" class="' + (s2 ? 'is-sel' : '') + '" data-act="qFilter" data-v="' + x[0] + '" aria-pressed="' + s2 + '">' + x[1] + ' ' + cnt[x[0]] + '</button>'; }).join('') + '</div>';
  var allList = list.length ? '<div class="qx-list">' + (more ? list.slice(0, 6) : list).map(qRow).join('') + '</div>' + (more ? '<button type="button" class="qx-clear" data-act="qAllShow">' + icon('i-next', 14) + 'Alle ' + list.length + ' zeigen</button>' : '') : '<div class="qx-empty">' + emb('jar', 34) + '<span>' + (f === 'nein' ? 'Nichts abgelehnt.' : 'Hier ist noch nichts freigegeben.') + '</span></div>';
  var body = '<div class="qx' + (enter ? ' enter' : '') + '">' + dk(qHero(rd.total) + qCollectOverview(),
    '<div class="mt14" id="qs-link">' + collectShare() + collectCloseHtml() + '</div>') + '\u0001' +
    qPanel('qs-neu', '#FF7A45', 'letter', 'Neu eingegangen', open.length ? 'Kurz prüfen und freigeben. Abgelehntes kommt nicht ins Spiel.' : 'Alles geprüft. Neue Beiträge landen hier.', open.length,
      (open.length >= 2 ? '<button type="button" class="qp-allok" data-act="qAllOk">' + icon('i-check', 16) + 'Alle ' + open.length + ' freigeben</button>' : '') + (open.length ? open.map(qCard).join('') : '<div class="qx-empty">' + emb('letter', 34) + '<span>Alles geprüft. Du gibst neue Beiträge hier mit einem Tipp frei.</span></div>')) +
    '\u0002' + aiSection() + pcSection() +
    qPanel('qs-runden', '#48D9A6', 'dice', 'Daraus baut die App Runden', 'Welche Runde wann kommt, bleibt eine Überraschung. Je mehr die Gäste schicken, desto mehr davon.' + (aufg ? ' Dazu ' + aufg + (aufg === 1 ? ' Aufgabe, die einzeln kommt.' : ' Aufgaben, die einzeln kommen.') : ''), rd.total, '<div class="qx-rounds">' + rd.html + '</div>') + '\u0003' +
    qPanel('qs-alle', '#9886FF', 'jar', 'Alle Beiträge', 'Verwalten, was schon da ist. Ein Tipp auf einen Beitrag zeigt alles.', cnt.ok, seg + filt + allList) +
    '<button type="button" class="qx-own mt14" data-act="openMasterForm"><span class="qx-own-ic">' + emb('pen', 30) + '</span><span class="stack grow" style="gap:2px;text-align:left"><b>Selbst Fragen eintragen</b><small>Geführt, mit eigenen Leveln. Sofort freigegeben.</small></span>' + icon('i-next', 16) + '</button>' +
    factCard('questions') + '</div>';
  var c1 = body.indexOf('\u0001'), c2 = body.indexOf('\u0002'), c3 = body.indexOf('\u0003');
  body = body.slice(0, c1) + dk(body.slice(c1 + 1, c2), body.slice(c2 + 1, c3)) + body.slice(c3 + 1);
  return scr(topbar('home', 'Beiträge der Gäste'), body, '');
};
/* the QR code, big enough to scan from the master's phone */
function qrBigHtml() {
  var b = UI.qrBig; if (!b) return '';
  return '<div class="qx-qrbig" role="dialog" aria-label="QR-Code"><div class="qx-qrbig-c">' + qrHTML(b.code || 'x') + '<b>' + esc(b.title || 'Ein Link für alle') + '</b><span>Handy hinhalten, scannen, mitmachen.</span><button type="button" class="qx-b dark" data-act="qrClose">Schließen</button></div></div>';
}

/* guest question form (in-app test, link mode, or master) */
function qDraftNew(author) { return { author: author || '', forId: '', type: author === 'Spielleiter' ? 'schaetzen' : 'steckbrief', text: '', unit: '', answer: '', options: ['', '', '', ''], correct: 0, min: '0', max: '100', note: '', year: '', bday: '', meet: '', byear: '', trait: '', interest: '' }; }
function guestHeader(sub) {
  var e = E();
  return '<div class="row" style="justify-content:space-between"><div class="row" style="gap:10px"><span class="tile-ic" style="width:36px;height:36px;border-radius:12px;overflow:hidden">' + brandTile(36) + '</span><span style="font:800 16px var(--display);color:var(--white)">zparkling</span></div><span class="sub" style="font-weight:700">' + esc(sub || '') + '</span></div>';
}
/* the fields of one contribution. bp = bind prefix, k = item index in the guest list ('' for the master form) */
function draftFields(d, bp, k) {
  var e = E(), sfx = k === '' ? '' : '_' + k, dk = k === '' ? '' : ' data-k="' + k + '"';
  var actC = k === '' ? 'qCorrect' : 'gCorrect', actF = k === '' ? 'qFor' : 'gFor';
  var who = e ? e.focus : [], whoName = e && e.focus.length ? (d.forId && isFocus(d.forId) ? person(d.forId).name : focusNames()) : 'das Geburtstagskind';
  var isQ = ['schaetzen', 'auswahl', 'bereich', 'aufgabe'].indexOf(d.type) >= 0;
  var extra = '';
  if (d.type === 'schaetzen') extra = '<div class="grid2 mt14"><label class="field" for="qAns' + sfx + '">Lösung<input id="qAns' + sfx + '" class="input" type="number" inputmode="decimal" data-bind="' + bp + '.answer" value="' + esc(d.answer) + '" placeholder="z. B. 31"></label><label class="field" for="qUnit' + sfx + '">Einheit<input id="qUnit' + sfx + '" class="input" type="text" data-bind="' + bp + '.unit" value="' + esc(d.unit) + '" placeholder="z. B. Paar"></label></div>';
  if (d.type === 'bereich') extra = '<div class="grid3 mt14"><label class="field" for="qMin' + sfx + '">Von<input id="qMin' + sfx + '" class="input" type="number" data-bind="' + bp + '.min" value="' + esc(d.min) + '"></label><label class="field" for="qMax' + sfx + '">Bis<input id="qMax' + sfx + '" class="input" type="number" data-bind="' + bp + '.max" value="' + esc(d.max) + '"></label><label class="field" for="qAnsB' + sfx + '">Lösung<input id="qAnsB' + sfx + '" class="input" type="number" data-bind="' + bp + '.answer" value="' + esc(d.answer) + '"></label></div><label class="field mt10" for="qUnitB' + sfx + '">Einheit<input id="qUnitB' + sfx + '" class="input" type="text" data-bind="' + bp + '.unit" value="' + esc(d.unit) + '" placeholder="optional"></label>';
  var optRows = function (n, label, ph) {
    return d.options.slice(0, n).map(function (o, i) {
      var s = d.correct === i;
      return '<div class="row gap8"><button type="button" class="radio' + (s ? ' is-sel' : '') + '" data-act="' + actC + '"' + dk + ' data-i="' + i + '" aria-pressed="' + s + '" aria-label="' + esc(label(i)) + '">' + (s ? icon('i-check', 14) : '') + '</button><label class="grow" for="qOpt' + sfx + '_' + i + '"><span class="sr">' + esc(ph(i)) + '</span><input id="qOpt' + sfx + '_' + i + '" class="input" type="text" data-bind="' + bp + '.opt.' + i + '" value="' + esc(o) + '" placeholder="' + esc(ph(i)) + '"></label></div>';
    }).join('');
  };
  if (d.type === 'auswahl') extra = '<span class="eyebrow mt14 block">Antworten, Kreis antippen für die richtige</span><div class="stack gap8 mt10">' + optRows(4, function (i) { return 'Antwort ' + (i + 1) + ' ist richtig'; }, function (i) { return 'Antwort ' + (i + 1) + (i > 1 ? ' (optional)' : ''); }) + '</div>';
  if (d.type === 'aufgabe') extra = '<label class="field mt14" for="qNote' + sfx + '">So wird gewertet<textarea id="qNote' + sfx + '" class="input area" data-bind="' + bp + '.note" placeholder="z. B. Geschafft, wenn zwei Gäste es bestätigen">' + esc(d.note) + '</textarea></label>';
  if (d.type === 'steckbrief') extra = '<label class="field mt14" for="qYear' + sfx + '">Seit welchem Jahr kennst du ' + esc(whoName) + '?<input id="qYear' + sfx + '" class="input" type="number" inputmode="numeric" data-bind="' + bp + '.year" value="' + esc(d.year) + '" placeholder="z. B. 2014"></label>' +
    '<label class="field mt10" for="qBday' + sfx + '">Dein Geburtstag<input id="qBday' + sfx + '" class="input" type="text" inputmode="decimal" data-bind="' + bp + '.bday" value="' + esc(d.bday) + '" placeholder="Tag.Monat, z. B. 12.03."></label>' +
    '<label class="field mt10" for="qByear' + sfx + '">Dein Jahrgang (freiwillig)<input id="qByear' + sfx + '" class="input" type="number" inputmode="numeric" data-bind="' + bp + '.byear" value="' + esc(d.byear || '') + '" placeholder="z. B. 1994"></label>' +
    '<label class="field mt10" for="qMeet' + sfx + '">Wie habt ihr euch kennengelernt?<textarea id="qMeet' + sfx + '" class="input area" data-bind="' + bp + '.meet" placeholder="z. B. Im ersten Semester in der Statistik-Vorlesung">' + esc(d.meet) + '</textarea></label>' +
    '<p class="small mt8">Mindestens eins davon. Daraus werden Fragen wie „Seit welchem Jahr kennt ' + esc(d.author || 'Lea') + ' ' + esc(whoName) + '?“ oder „Wann hat ' + esc(d.author || 'Lea') + ' Geburtstag?“.</p>';
  if (d.type === 'luege') extra = '<span class="eyebrow mt14 block">Drei Sätze über dich, Kreis an die Lüge</span><div class="stack gap8 mt10">' + optRows(3, function (i) { return 'Satz ' + (i + 1) + ' ist gelogen'; }, function (i) { return ['z. B. Ich war schon mal in Australien', 'z. B. Ich kann jonglieren', 'z. B. Ich habe einen Hamster'][i]; }) + '</div>';
  if (d.type === 'tipp') extra = '<label class="field mt14" for="qTipp' + sfx + '">Wie viele Minuten dauert ' + esc(runNameText()) + '?<input id="qTipp' + sfx + '" class="input big" type="number" inputmode="numeric" data-bind="' + bp + '.answer" value="' + esc(d.answer) + '" placeholder="Minuten"></label><p class="small mt8">Am Ende zeigt die App, wer am nächsten dran war.</p>';
  var textField = isQ ? '<label class="field mt14" for="qText' + sfx + '">' + (d.type === 'aufgabe' ? 'Aufgabe' : 'Frage') + '<textarea id="qText' + sfx + '" class="input area" data-bind="' + bp + '.text" placeholder="' + (d.type === 'aufgabe' ? 'Was muss die Person tun?' : 'Was willst du wissen?') + '">' + esc(d.text) + '</textarea></label>' :
    d.type === 'wer' ? '<label class="field mt14" for="qText' + sfx + '">Deine Erinnerung an ' + esc(whoName) + '<textarea id="qText' + sfx + '" class="input area" data-bind="' + bp + '.text" placeholder="z. B. Wir sind beim Abiball zusammen in den Pool gefallen.">' + esc(d.text) + '</textarea></label><p class="small mt8">Im Spiel muss geraten werden, von wem das ist. Bis zur Auflösung bleibt dein Name geheim.</p>' : '';
  var showFor = d.type !== 'tipp' && (k === '' || who.length > 1);
  var forBlock = showFor ? '<span class="eyebrow mt14 block">Über wen?</span><div class="chips mt10" role="group" aria-label="Über wen">' +
    '<button type="button" class="chip-btn sm' + (!d.forId ? ' is-sel' : '') + '" data-act="' + actF + '"' + dk + ' data-v="" aria-pressed="' + !d.forId + '">' + (who.length > 1 ? 'Alle' : esc(whoName)) + '</button>' +
    (who.length > 1 ? who.map(function (p) { var s = d.forId === p.id; return '<button type="button" class="chip-btn sm' + (s ? ' is-sel' : '') + '" data-act="' + actF + '"' + dk + ' data-v="' + p.id + '" aria-pressed="' + s + '">' + esc(p.name) + '</button>'; }).join('') : '') + '</div>' : '';
  return forBlock + textField + extra;
}
V.guestForm = function () { return UI.guestMode === 'master' ? masterStudio() : S && S.collectClosed ? gClosedView() : guestMultiForm(); };
function guestHead() {
  var banner = UI.guestMode === 'test' ? '<div class="testbanner">' + icon('i-user', 18) + '<span class="grow">Testansicht: So sieht der Link für Gäste aus.</span><button type="button" class="tag plain" data-act="go" data-to="' + UI.guestFrom + '" style="height:30px;color:var(--sun)">Zurück</button></div>' : '';
  return banner + '<div class="' + (banner ? 'mt14' : '') + '">' + guestHeader('Mitmachen') + '</div>';
}
function masterForm() {
  var d = UI.qDraft || (UI.qDraft = qDraftNew('Spielleiter'));
  var head = topbar('questions', 'Eigene Frage');
  if (UI.qSent) {
    var body0 = '<div class="qx-hero" style="background-color:#48D9A6"><div class="qx-faces" aria-hidden="true"><span class="qx-hero-e">' + emb('pen', 46) + '</span></div><h2>Gespeichert und freigegeben.</h2><p>Deine Frage kann ab jetzt im Spiel drankommen.</p></div>';
    return scr(head, body0, '<button type="button" class="cta" data-act="qAnother">Noch eine Frage</button><button type="button" class="btn-ghost" data-act="go" data-to="questions">Fertig</button>');
  }
  var typeBtn = function (t) {
    var s = d.type === t[0];
    var st = qStyle(t[0]);
    return '<button type="button" class="opt row' + (s ? ' is-sel' : '') + '" data-act="qType" data-v="' + t[0] + '" aria-pressed="' + s + '" style="min-height:62px;border-radius:18px;padding:8px 12px 8px 8px;gap:12px"><span class="qx-row-ic" style="background:' + st.c + ';width:44px;height:44px;border-radius:14px">' + emb(st.e, 28) + '</span><span class="stack grow"><span style="font-size:15px;font-weight:800">' + t[1] + '</span><span class="sub">' + t[2] + '</span></span><span class="check">' + icon('i-check', 14) + '</span></button>';
  };
  var body = '<h1 class="h1">Eigene Frage</h1><p class="lead mt8">Landet direkt bei den freigegebenen Fragen.</p>' +
    '<span class="eyebrow mt18 block">Art</span><div class="stack gap8 mt10" role="group" aria-label="Art">' + QTYPES.filter(function (t) { return t[3] === 'frage'; }).map(typeBtn).join('') + '</div>' +
    draftFields(d, 'q', '') + (UI.qErr ? '<p class="err mt10">' + UI.qErr + '</p>' : '');
  return scr(head, body, '<button type="button" class="cta" data-act="qSubmit">Frage speichern</button>');
}
/* guests: tap a kind once per contribution, the fields appear below */
var GQ_VERB = { worte: ['Du schickst', 'In zwei Worten'], steckbrief: ['Du füllst', 'Steckbrief aus'], luege: ['Du schickst', 'Zwei Wahrheiten, eine Lüge'], wer: ['Du schreibst', 'Erinnerung'], tipp: ['Du gibst', 'Tipp ab'], schaetzen: ['Du stellst', 'Schätzfrage'], auswahl: ['Du stellst', 'Auswahl-Frage'], bereich: ['Du stellst', 'Bereich-Frage'], aufgabe: ['Du stellst', 'Aufgabe'] };
/* the master keeps his own form, so a test as guest and his own entries never mix */
function gForm() { if (UI.guestMode === 'master') return UI.mForm || (UI.mForm = { author: 'Spielleiter', items: [], cards: [] }); return UI.gForm || (UI.gForm = { author: '', items: [] }); }
function gCount(t) { return gForm().items.filter(function (x) { return x.type === t; }).length; }
function gMax(t) { if (UI.guestMode === 'master') return t === 'worte' ? Math.max(1, E() ? E().focus.length : 1) * 3 : 20; return t === 'tipp' || t === 'zahl' ? 1 : t === 'steckbrief' || t === 'worte' || t === 'entweder' ? Math.max(1, E() ? E().focus.length : 1) : t === 'geheim' ? 2 : 5; }

/* =========================================================
   Games catalog
   ========================================================= */
var FMT_LABEL = { solo: 'Solo', duell: 'Duell', duellGast: 'Herausforderung', gruppe: 'Herausforderung', team: 'Zu zweit' };
/* which minigames exist stays the app's secret: no catalog, no picking. The master only says what is at hand. */
V.games = function () {
  var f2 = E().focus.length >= 2, kr = evFam() === 'kranz', ggN = ggStatus(false).filter(function (x) { return x.ready; }).length;
  var used = S.used && S.used.partnerGame;
  var tile = function (v, bg, art, title, sub, dis) { var lk = !demoFreeOk(v); return '<button type="button" class="gtile gm-t' + (lk ? ' dlk' : '') + '" data-act="freeQuick" data-v="' + v + '" style="background:' + bg + '"' + (dis ? ' disabled' : '') + '>' + art + (lk ? '<span class="dl-badge" aria-label="Mit dem Game Pass">' + icon('i-lock', 14) + '</span>' : '') + '<b>' + title + '</b><small>' + (lk ? 'Mit dem Game Pass' : sub) + '</small></button>'; };
  var big = function (ch, top, right, size) { return '<span class="art" aria-hidden="true" style="top:' + top + 'px;right:' + right + 'px;font:900 ' + size + 'px/1 var(--display)">' + ch + '</span>'; };
  var ic = function (id, n) { return '<span class="art" aria-hidden="true" style="top:14px;right:14px">' + icon(id, n || 46) + '</span>'; };
  var tiles = tile('spiel', 'var(--orange)', ic('i-box'), 'Überraschungs-Spiel', 'Die App zieht eins') +
    tile('wwe', 'var(--sun)', '<svg class="art" aria-hidden="true" width="80" height="64" style="top:12px;right:8px"><use href="#i-bubbles"></use></svg>', 'Wer würde eher?', f2 ? 'Gruppe stimmt ab' : 'Ab zwei Fokus-Personen', !f2) +
    tile('schaetzen', 'var(--violet)', big('≈', 10, 14, 60), 'Schätzen gegen die Gruppe', 'Wer liegt näher dran?') +
    tile('quiz', '#FF9A73', big('?', 8, 18, 64), 'Quiz-Frage', 'Allgemeinwissen') +
    tile('menge', 'var(--mint)', ic('i-users'), 'Gegen die Menge', 'Ihr ratet die Mehrheit') +
    tile('partner', 'var(--pink)', ic('i-trophy'), 'Mein Partner kann …', used ? 'Heute schon gespielt' : 'Paar-Duell, Best of 3') +
    tile('gast', '#6FE3FF', ic('i-bubble'), 'Eine Gäste-Runde', ggN ? 'Aus den Beiträgen der Gäste' : 'Noch zu wenig Beiträge') +
    (isJga() ? tile('mission', 'var(--sun)', '<span class="art" aria-hidden="true" style="top:10px;right:10px">' + emb('target', 52) + '</span>', 'Eine Mission', 'Mit Leuten auf der Straße') : '');
  var body = '<div class="gm-secret">' + icon('i-eye-off', 18) + '<span>Welche Spiele ' + (kr ? 'im Kranz' : 'im Spielabend') + ' drankommen, bleibt geheim. Die App wählt passend zu eurem Material.</span></div>' +
    '<button type="button" class="card pad row plain mt14" data-act="openMaterial" data-from="games" style="width:100%"><span class="tile-ic" style="width:44px;height:44px;border-radius:14px;background:var(--sun)">' + icon('i-box', 22) + '</span><span class="stack grow" style="text-align:left;gap:2px"><span class="name">Euer Material</span><span class="sub">' + esc(matSummary()) + '</span></span><span class="linkbtn">Ändern</span></button>' +
    '<span class="eyebrow mt22 block">Zwischendurch spielen</span><p class="small mt6">Antippen und los. Was ihr hier spielt, ist für den Abend verbraucht und kommt ' + (kr ? 'im Kranz' : 'später') + ' nicht noch einmal.</p>' +
    '<div class="games mt14">' + tiles + '</div>' + factCard('games');
  return scr(topbar('home', 'Spiele'), body, '');
};
/* =========================================================
   Run setup
   ========================================================= */
function variantInfo(k, fam) {
  fam = fam || evFam();
  if (k === 'socke') {
    var f = E().focus, k2 = {}; f.forEach(function (p) { k2[p.anlass] = true; });
    var u = k2.sockenkranz && k2.schachtelkranz ? ['Stück', 'Jede Socke und jede Schachtel'] : k2.schachtelkranz ? ['Schachtel', 'Jede Schachtel'] : ['Socke', 'Jede Socke'];
    return { label: u[0] + ' für ' + u[0], sub: u[1] + ' eine Aufgabe', icon: k2.schachtelkranz && !k2.sockenkranz ? 'i-box' : 'sock', bg: 'var(--orange)' };
  }
  if (k === 'meter') return { label: 'Meter für Meter', sub: 'Jeder Meter eine Aufgabe, für lange Kränze', icon: 'i-ruler', bg: 'var(--mint)' };
  if (k === 'wuerfel') return fam === 'frei' ? { label: 'Würfeln', sub: 'Wie ein Brettspiel: Wer zuerst im Ziel ist', icon: 'i-dice', bg: 'var(--sun)' } : { label: 'Würfeln', sub: 'Gewürfelt wird, wie weit es am Kranz geht', icon: 'i-dice', bg: 'var(--sun)' };
  if (k === 'runden') return { label: 'Runde für Runde', sub: 'Eine feste Zahl an Runden, jede mit Aufgabe', icon: 'i-flag', bg: 'var(--orange)' };
  if (k === 'abend') return { label: 'Spielabend nach Zeit', sub: 'Einlagen in regelmäßigen Abständen', icon: 'i-clock', bg: 'var(--violet)' };
  return { label: 'Event nach Zeit', sub: 'Fegen oder Putzen, mit Einlagen und Zubehör', icon: 'i-clock', bg: 'var(--violet)' };
}
/* V.runSetup lives in 07r-run.js */

/* =========================================================
   Run overview
   ========================================================= */
function paceText() {
  var r = R(), ratio = paceRatio(), el = Math.round(elapsedMin());
  var proj = Math.round(r.planned * ratio);
  var label = ratio > 1.15 ? 'etwas langsam' : ratio < 0.85 ? 'flott unterwegs' : 'passt';
  return { label: label, text: 'Läuft seit ' + el + ' Min · Prognose ' + proj + ' von ' + r.planned + ' Min', tone: ratio > 1.15 ? 'var(--sun)' : ratio < 0.85 ? 'var(--violet-text)' : 'var(--mint)' };
}
function injectionLabel(inj) {
  if (!inj) return '';
  if (inj.kind === 'toast') return 'Anstoßen ist fällig';
  if (inj.kind === 'acc') return 'Zubehör-Wechsel ist fällig';
  if (inj.kind === 'check') return 'Status-Check ist fällig';
  if (inj.kind === 'handicap') return 'Die Handicap-Station ist dran';
  if (inj.kind === 'crew') return 'Ein Truppen-Auftrag ist dran';
  return roleLabel(inj);
}
/* V.run, the cockpit, lives in 07r-run.js */
/* the next minigame, covered like a password: tap to look, tap again to hide */
function peekCard() {
  var x = nextGamePeek(); if (!x) return '';
  if (x.secret) return '<div class="peek mt18"><span class="tile-ic" style="width:40px;height:40px;border-radius:12px;background:var(--surface-2)">' + roleIcon('hellseher', 30) + '</span><span class="stack grow" style="gap:2px;min-width:0"><span class="peek-l">Das letzte Spiel</span><span class="peek-n">Bleibt geheim</span><span class="sub">Erst tippt der Hellseher, dann wird es verraten.</span></span></div>';
  var open = UI.peek === x.id;
  return '<button type="button" class="peek plain mt18' + (open ? ' open' : '') + '" data-act="peekToggle" data-v="' + x.id + '" aria-pressed="' + open + '" aria-label="' + (open ? 'Nächstes Spiel verstecken' : 'Nächstes Spiel aufdecken') + '">' +
    '<span class="tile-ic" style="width:40px;height:40px;border-radius:12px;background:var(--sun)">' + icon('i-box', 20) + '</span>' +
    '<span class="stack grow" style="gap:2px;min-width:0;text-align:left"><span class="peek-l">' + (x.last ? 'Das letzte Spiel' : x.ahead <= 1 ? 'Nächstes Minispiel' : 'Nächstes Minispiel, in etwa ' + x.ahead + ' Aufgaben') + '</span>' +
    '<span class="peek-n">' + (open ? esc(x.name) : '<span class="peek-dots" aria-hidden="true">●●●●●●●</span>') + '</span>' +
    '<span class="sub">' + (open ? (x.mat ? 'Bereitlegen: ' + esc(x.mat) : 'Ohne Material') : (x.mat ? 'Braucht Material. ' : '') + 'Antippen zum Aufdecken') + '</span></span>' +
    '<span class="peek-eye">' + icon(open ? 'i-eye-off' : 'i-eye', 20) + '</span></button>';
}
V.finish = function () {
  var r = R(), e = E();
  var rows = r.who.map(function (id, i) {
    var p = person(id), b = budget(id);
    return '<div class="row' + (i < r.who.length - 1 ? ' line' : '') + '" style="min-height:70px">' + face(p, 48, '', 'jubel') + '<span class="stack grow gap6"><span class="name">' + esc(p.name) + '</span><span class="sub">' + drinksOf(id, r.t0) + ' ' + esc(e.unit) + ' in diesem Spiel · heute ' + b.C + ' · ' + esc(targetText(id)) + ' · max ' + b.M + '</span>' + pilotBar(id) + '</span></div>';
  }).join('');
  var body = '<div class="bigcard stack" style="background:var(--mint);min-height:230px;justify-content:flex-end">' + garland(350, ['#15122B', '#FFFFFF', '#FF7A45', '#9886FF', '#FFC940', '#15122B']) +
    '<span class="badge">Geschafft</span><h2 class="mt10" style="font-size:26px">' + (r.variant === 'zeit' ? 'Fertig! Alles sauber.' : (r.fam || 'kranz') === 'frei' ? 'Was für ein Abend!' : 'Der Kranz ist Geschichte.') + '</h2><p style="position:relative;font-weight:700;margin-top:6px">Dauer: ' + Math.round(elapsedMin()) + (Math.round(elapsedMin()) === 1 ? ' Minute' : ' Minuten') + '</p></div>' +
    '<div class="card padrows mt14">' + rows + '</div>' + (r.variant === 'zeit' ? finaleRoleHtml(r) : '') + jgaAbspannHtml(r) + abspannHtml(r) + tipResult(Math.round(elapsedMin()));
  return scr(topbar(null, 'Geschafft'), body, '<button type="button" class="cta" data-act="finishRun">Zurück zur Party</button>' + (r.hist && r.hist.length ? '<button type="button" class="btn-ghost" data-act="openRewind">' + icon('i-undo', 18) + 'Doch nicht fertig? Zurückspulen</button>' : ''));
};
function tipResult(mins) {
  var tips = tipsList().map(function (q) { return { name: q.author, t: Number(q.answer), d: Math.abs(Number(q.answer) - mins) }; }).sort(function (a, b) { return a.d - b.d; });
  if (!tips.length) return '';
  var best = tips[0].d;
  return '<span class="eyebrow mt22 block">Tippspiel</span><div class="card padrows mt10">' + tips.map(function (x, i) {
    var win = x.d === best;
    return '<div class="res"><span class="tile-ic" style="width:34px;height:34px;border-radius:11px;background:' + (win ? 'var(--sun)' : 'var(--surface-2)') + ';color:' + (win ? 'var(--ink)' : 'var(--white)') + ';font:800 13px var(--display)">' + (i + 1) + '</span><span class="grow" style="font-size:14px;font-weight:700">' + esc(x.name) + ' <span class="sub">tippte ' + x.t + ' Min, ' + (x.d === 0 ? 'genau richtig' : x.d + ' daneben') + '</span></span>' + (win ? '<span class="tag" style="background:var(--sun);color:var(--ink)">' + icon('i-trophy', 13) + 'Tippkönig</span>' : '') + '</div>';
  }).join('') + '</div><p class="small mt8">Gedauert hat es ' + mins + ' Minuten. Wer am nächsten dran war, darf den Abschluss-Trinkspruch halten.</p>';
}
V.rewind = function () {
  var r = R();
  if (!r) return V.home();
  var idx = []; (r.hist || []).forEach(function (h, i) { if (h.kind === 'task') idx.push(i); });
  idx.reverse();
  var sel = UI.rewindSel;
  var rows = idx.map(function (i, n) {
    var h = r.hist[i], info = rewindInfo(i);
    var tm = new Date(h.t).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    var on = sel === i;
    return '<button type="button" class="opt row' + (on ? ' is-sel' : '') + '" data-act="rewindPick" data-i="' + i + '" aria-pressed="' + on + '" style="width:100%;border-radius:18px;padding:10px 12px;min-height:64px">' +
      '<span class="tile-ic" style="width:38px;height:38px;border-radius:12px;background:' + (n === 0 ? 'var(--mint)' : 'var(--surface-2)') + ';color:' + (n === 0 ? 'var(--ink)' : 'var(--white)') + ';font:800 14px var(--display)">' + (h.meta.no || h.meta.steps + 1) + '</span>' +
      '<span class="stack grow" style="gap:2px;text-align:left"><span style="font-size:15px;font-weight:800">Vor: ' + esc(h.meta.next || 'Aufgabe ' + (h.meta.steps + 1)) + ' <span class="sub">· ' + tm + '</span></span><span class="sub">' + esc(h.meta.pos) + '</span>' +
      '<span class="sub" style="color:var(--violet-text)">Danach: ' + info.tasks + (info.tasks === 1 ? ' Aufgabe' : ' Aufgaben') + ', ' + info.drinks + ' ' + esc(U()) + ' aus Spielen</span></span><span class="check">' + icon('i-check', 14) + '</span></button>';
  }).join('<div class="mt8"></div>');
  var info = sel != null ? rewindInfo(sel) : null;
  var who = info ? Object.keys(info.per).map(function (id) { return person(id).name + ' ' + info.per[id]; }).join(', ') : '';
  var body = '<p class="lead">Tipp den Stand an, zu dem du zurück willst. Alles danach wird zurückgerechnet: Fortschritt, ' + esc(U()) + ' aus Spielen, Joker, gespielte Spiele und Fragen.</p>' +
    '<p class="small mt8">Was du im Zähler von Hand eingetragen hast, bleibt stehen.</p>' +
    '<div class="mt14">' + (rows || '<div class="empty">Noch nichts zum Zurückspulen.</div>') + '</div>';
  var foot = info ? '<div class="confirm"><p class="name">Zurück zum Stand vor „' + esc(info.snap.meta.next || 'Aufgabe ' + (info.snap.meta.steps + 1)) + '“?</p><p class="small mt6" style="color:var(--text)">' + info.tasks + (info.tasks === 1 ? ' Aufgabe wird' : ' Aufgaben werden') + ' gelöscht' + (info.drinks ? ' und ' + info.drinks + ' ' + esc(U()) + ' zurückgenommen (' + esc(who) + ')' : '') + '.</p></div>' +
    '<div class="cta-row"><button type="button" class="btn-dark" style="flex:1" data-act="rewindCancel">Abbrechen</button><button type="button" class="cta" style="flex:1.4" data-act="rewindDo">' + icon('i-undo', 18) + 'Zurückspulen</button></div>' : '';
  return scr(topbar(r.finished ? 'finish' : 'run', 'Zurückspulen'), body, foot);
};

