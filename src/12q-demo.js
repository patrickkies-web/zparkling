/* =========================================================
   The example evening shows a lot, but not everything: all party
   types, the invitation and how guests take part, the animations.
   A few kinds of contributions, two kinds of bonus cards, three
   quick games and five stations of a run. The rest says: Game Pass.
   ========================================================= */
var DEMO_LIMITS = !(typeof window !== 'undefined' && window.DEMO_OFF);
var DEMO_GTYPES = ['worte', 'entweder', 'luege', 'wer'];
var DEMO_CARDS = ['wenn', 'portrait'];
var DEMO_FREE = ['spiel', 'wwe', 'schaetzen'];
var DEMO_STEPS = 5;
function demoOn() { return DEMO_LIMITS && !!(S && S.demo) && UI.guestMode !== 'link'; }
function demoTypeOk(t) {
  if (!demoOn()) return true;
  var q = QTYPES.filter(function (x) { return x[0] === t; })[0]; if (!q) return true;
  return q[3] === 'karte' ? DEMO_CARDS.indexOf(t) >= 0 : DEMO_GTYPES.indexOf(t) >= 0;
}
function demoFreeOk(v) { return !demoOn() || DEMO_FREE.indexOf(v) >= 0; }
function demoRunOver(r) { return demoOn() && !!r && !r.finished && (r.steps || 0) >= DEMO_STEPS; }
function demoHiddenTypes(kind) { return QTYPES.filter(function (t) { return (kind === 'karte') === (t[3] === 'karte') && !demoTypeOk(t[0]); }).length; }
/* a locked line: what else there is, without showing it */
function demoLockRow(text, act) { return '<button type="button" class="demolock mt10" data-act="' + (act || 'demoLocked') + '">' + icon('i-lock', 16) + '<span class="grow">' + esc(text) + '</span><span class="dl-pass">Game Pass</span></button>'; }
A.demoLocked = function () { setToast('Das gibt es mit dem Game Pass'); go('pass'); };
A.demoInfo = function () { setToast('Im Beispiel-Abend ist nur ein Teil offen. Alles gibt es mit dem Game Pass.'); };
/* on the example home: every party type to try, and what guests do */
function demoHomeHtml() {
  if (!demoOn()) return '';
  var t = evType();
  return '<div class="dm-guests mt14"><span class="dm-k">' + icon('i-star', 12) + 'Das Herzstück</span><h3>So machen eure Gäste mit</h3>' +
    '<div class="dm-steps">' + [['i-link', 'Einladung per Link', 'Ein Link in die Gruppe, jeder bekommt eine Einladung.'], ['i-pencil', 'Zwei Minuten Beiträge', 'Erinnerungen, Lügen, zwei Worte über euch.'], ['i-pad', 'Daraus werden Spiele', 'Die App baut eigene Runden, nur für euren Abend.']].map(function (x, i) { return '<div class="dm-step"><span class="dm-n">' + (i + 1) + '</span><span class="stack" style="gap:1px;min-width:0"><b>' + x[1] + '</b><span>' + x[2] + '</span></span></div>'; }).join('') + '</div>' +
    '<button type="button" class="dm-go" data-act="openGuestForm">' + icon('i-play', 16) + 'Einladung als Gast ansehen</button></div>' +
    '<button type="button" class="dm-switch mt14" data-act="openDemoPick" data-from="home" data-v="' + t.id + '"><span class="dm-sw-ic" style="background:' + t.bg + '">' + typeIcon(t) + '</span><span class="stack grow" style="gap:2px;min-width:0;text-align:left"><small>Gerade im Beispiel</small><b>' + esc(t.label) + '</b><span>Anderen Anlass ausprobieren</span></span>' + icon('i-next', 18) + '</button>';
}
/* ---------- the example evening starts with a choice: which occasion ----------
   One ticket per occasion, in its colour, the whole width. A tap opens the
   ticket: a short note and the start button, right there. */
var DP_INFO = {
  socken: ['Mit 25 noch ledig? Dann hängt ein Kranz voller Socken. Socke für Socke kommt ab, und hinter jeder steckt eine kleine Aufgabe.', ['Socke für Socke', 'Würfel möglich', 'Gäste-Runden'], 'Zum 25. Geburtstag'],
  schachtel: ['Die Variante mit Schachteln: Eine nach der anderen kommt vom Kranz, und jede bringt ihr eigenes Spiel mit.', ['Schachtel für Schachtel', 'Allein oder zu zweit', 'Gäste-Runden'], 'Zum 25. Geburtstag'],
  treppe: ['Mit 30 noch ledig: Die Treppe wird gefegt, dazwischen gibt es Einlagen. Mit jeder gewonnenen Zubehör-Chance kommt das nächste Teil dran.', ['Nach Zeit', 'Zubehör-Chancen', 'Einlagen'], 'Zum 30. Geburtstag'],
  klinke: ['Mit 30 noch ledig: Klinken putzen, dazwischen Einlagen. Mit jeder gewonnenen Zubehör-Chance kommt das nächste Teil dran.', ['Nach Zeit', 'Zubehör-Chancen', 'Einlagen'], 'Zum 30. Geburtstag'],
  geburtstag: ['Geburtstag ohne Kranz und Besen: Runde für Runde Spiele rund um das Geburtstagskind.', ['Runde für Runde', 'Würfel möglich', 'Gäste-Runden'], 'Ohne Kranz und Besen'],
  hochzeit: ['Für Polterabend und Hochzeit: Spiele über das Brautpaar, mit den Geschichten der Gäste.', ['Für das Paar', 'Paar-Duelle', 'Gäste-Runden'], 'Für das Brautpaar'],
  jga: ['Der Junggesellenabschied: Missionen in der Stadt oder drinnen, die Truppe spielt mit.', ['Missionen', 'Mit der Truppe', 'Drinnen oder draußen'], 'Für Braut oder Bräutigam'],
  party: ['Einfach ein Spielabend: Runden, Duelle und Gäste-Runden, ganz ohne Brauch.', ['Runde für Runde', 'Duelle', 'Gäste-Runden'], 'Einfach ein Spielabend']
};
A.openDemoPick = function (d) {
  var from = (d && d.from) || (UI.screen === 'demoPick' ? UI.dpFrom : UI.screen) || 'landing';
  UI.dpFrom = ['landing', 'pass', 'tour', 'home'].indexOf(from) >= 0 ? from : 'landing';
  UI.dpSel = d && d.v ? d.v : null; go('demoPick');
  if (UI.dpSel) setTimeout(dpScroll, 80);
};
function dpScroll() { var el = UI.dpSel && document.getElementById('dp-' + UI.dpSel), b = app.querySelector('.body'); if (!el || !b || !el.getBoundingClientRect) return; var y = el.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom; if (y > -12) try { b.scrollBy({ top: y + 24, behavior: 'smooth' }); } catch (e) { b.scrollTop += y + 24; } }
A.dpSel = function (d) { UI.dpSel = UI.dpSel === d.v ? null : d.v; render(); if (UI.dpSel) setTimeout(dpScroll, 40); };
A.dpStart = function () { var v = UI.dpSel || 'socken'; UI.homeIn = true; A.loadDemo(); A.setEventAnlass({ v: v }); };
/* one occasion as a ticket in its colour: the top row is the button, the rest opens below it */
function occTicket(t, opt) {
  var x = DP_INFO[t.id] || ['', [], t.sub], on = !!opt.on;
  return '<div class="dp-tk' + (on ? ' on' : '') + (opt.dim ? ' dim' : '') + (opt.sel ? ' sel' : '') + '" id="' + (opt.id || 'dp-' + t.id) + '" style="--c:' + t.bg + ';--i:' + (opt.i || 0) + '">' +
    '<button type="button" class="dp-tk-top" data-act="' + opt.act + '" data-v="' + t.id + '"' + (opt.more ? ' aria-expanded="' + on + '"' : ' aria-pressed="' + !!opt.sel + '"') + '>' +
    '<span class="dp-tk-art" aria-hidden="true"><span class="dp-tk-ring"></span>' + (t.ic === 'sock' ? sockIc('#15122B', 30) : icon(t.ic, 36)) + '</span>' +
    '<span class="dp-tk-t"><small>' + esc(x[2] || t.sub) + '</small><b>' + esc(t.label).replace('Junggesellenabschied', 'Junggesellen\u00ADabschied') + '</b></span>' +
    '<span class="dp-tk-x' + (opt.go ? ' go' : '') + '">' + icon(opt.more ? 'i-plus' : opt.go ? 'i-next' : 'i-check', 18) + '</span></button>' + (opt.more || '') + '</div>';
}
function dpTicket(t, i, on, dim) {
  var x = DP_INFO[t.id] || ['', [], t.sub];
  var det = '<div class="dp-more"><div class="dp-more-in"><p>' + esc(x[0]) + '</p><div class="dp-chips">' + x[1].map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' +
    '<button type="button" class="dp-go" data-act="dpStart">' + icon('i-play', 18) + 'Diesen Abend ausprobieren</button></div></div>';
  return occTicket(t, { on: on, dim: dim, i: i, act: 'dpSel', more: det });
}
V.demoPick = function () {
  var sel = UI.dpSel, cards = EVENT_TYPES.map(function (t, i) { return dpTicket(t, i, sel === t.id, !!sel && sel !== t.id); }).join('');
  var body = '<h1 class="h1 mt10">Welchen Abend wollt ihr ausprobieren?</h1><p class="lead mt8">Der Beispiel-Abend ist schon mit Gästen und ihren Beiträgen gefüllt. Tippt einen Anlass an, dann könnt ihr sofort losspielen.</p><div class="dp-list mt18">' + cards + '</div><p class="small mt14" style="text-align:center">Im Beispiel fallen Pinnchen. Eure eigene Party spielt sich auf Wunsch ohne Alkohol, der Spielleiter entscheidet. Für Erwachsene.</p>';
  return scr(topbar(UI.dpFrom || 'landing', 'Beispiel-Abend'), body, '', 'dpscr');
};
