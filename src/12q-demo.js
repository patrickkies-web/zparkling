/* =========================================================
   The example evening shows a lot, but not everything: all party
   types, the invitation and how guests take part, the animations.
   A few kinds of contributions, two kinds of bonus cards, three
   quick games and five stations of a run. The rest says: Game Pass.
   ========================================================= */
var DEMO_LIMITS = !(typeof window !== 'undefined' && window.DEMO_OFF);
var DEMO_GTYPES = ['worte', 'luege', 'wer'];
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
  var cur = E().anlass;
  var types = EVENT_TYPES.map(function (t) { var on = t.id === cur; return '<button type="button" class="dm-type' + (on ? ' on' : '') + '" data-act="setEventAnlass" data-v="' + t.id + '" aria-pressed="' + on + '"><span class="tile-ic" style="width:34px;height:34px;border-radius:11px;background:' + t.bg + '">' + typeIcon(t) + '</span><span>' + esc(t.label) + '</span></button>'; }).join('');
  return '<div class="dm-guests mt14"><span class="dm-k">' + icon('i-star', 12) + 'Das Herzstück</span><h3>So machen eure Gäste mit</h3>' +
    '<div class="dm-steps">' + [['i-link', 'Einladung per Link', 'Ein Link in die Gruppe, jeder bekommt eine Einladung.'], ['i-pencil', 'Zwei Minuten Beiträge', 'Erinnerungen, Lügen, zwei Worte über euch.'], ['i-pad', 'Daraus werden Spiele', 'Die App baut eigene Runden, nur für euren Abend.']].map(function (x, i) { return '<div class="dm-step"><span class="dm-n">' + (i + 1) + '</span><span class="stack" style="gap:1px;min-width:0"><b>' + x[1] + '</b><span>' + x[2] + '</span></span></div>'; }).join('') + '</div>' +
    '<button type="button" class="dm-go" data-act="openGuestForm">' + icon('i-play', 16) + 'Einladung als Gast ansehen</button></div>' +
    '<span class="eyebrow mt22 block">Jeden Anlass ausprobieren</span><p class="small mt6">Tipp an, was gefeiert wird. Der Beispiel-Abend stellt sich sofort um.</p><div class="dm-types mt10">' + types + '</div>';
}
/* ---------- the example evening starts with a choice: which occasion ----------
   Cards like the bonus cards. A tap opens a short note under the row, one more tap starts. */
var DP_INFO = {
  socken: ['Mit 25 noch ledig? Am Kranz hängen 25 Socken, jede ist eine kleine Aufgabe.', ['Socke für Socke', 'Würfel möglich', 'Gäste-Runden']],
  schachtel: ['Die Variante mit Schachteln: 25 Stück am Kranz, eine nach der anderen kommt ab.', ['Schachtel für Schachtel', 'Allein oder zu zweit', 'Gäste-Runden']],
  treppe: ['Mit 30 noch ledig: Die Treppe wird gefegt, dazwischen gibt es Einlagen. Erst mit der Zahnbürste, mit Glück bald mit dem Besen.', ['Nach Zeit', 'Zubehör-Chancen', 'Einlagen']],
  klinke: ['Mit 30 noch ledig: Klinken putzen, dazwischen Einlagen. Erst mit dem Wattestäbchen, mit Glück bald mit dem Lappen.', ['Nach Zeit', 'Zubehör-Chancen', 'Einlagen']],
  geburtstag: ['Geburtstag ohne Kranz und Besen: Runde für Runde Spiele rund um das Geburtstagskind.', ['Runde für Runde', 'Würfel möglich', 'Gäste-Runden']],
  hochzeit: ['Für Polterabend und Hochzeit: Spiele über das Brautpaar, mit den Geschichten der Gäste.', ['Für das Paar', 'Paar-Duelle', 'Gäste-Runden']],
  jga: ['Der Junggesellenabschied: Missionen in der Stadt oder drinnen, die Truppe spielt mit.', ['Missionen', 'Mit der Truppe', 'Drinnen oder draußen']],
  party: ['Einfach ein Spielabend: Runden, Duelle und Gäste-Runden, ganz ohne Brauch.', ['Runde für Runde', 'Duelle', 'Gäste-Runden']]
};
A.openDemoPick = function (d) {
  var from = (d && d.from) || (UI.screen === 'demoPick' ? UI.dpFrom : UI.screen) || 'landing';
  UI.dpFrom = ['landing', 'pass', 'tour', 'home'].indexOf(from) >= 0 ? from : 'landing';
  UI.dpSel = d && d.v ? d.v : null; go('demoPick');
  if (UI.dpSel) setTimeout(dpScroll, 80);
};
function dpScroll() { var el = document.getElementById('dpdet'), b = app.querySelector('.body'); if (!el || !b || !el.getBoundingClientRect) return; var y = el.getBoundingClientRect().bottom - b.getBoundingClientRect().bottom; if (y > -12) try { b.scrollBy({ top: y + 24, behavior: 'smooth' }); } catch (e) { b.scrollTop += y + 24; } }
A.dpSel = function (d) { UI.dpSel = UI.dpSel === d.v ? null : d.v; render(); if (UI.dpSel) setTimeout(dpScroll, 40); };
A.dpStart = function () { var v = UI.dpSel || 'socken'; UI.homeIn = true; A.loadDemo(); A.setEventAnlass({ v: v }); };
function dpDetail(t) {
  var x = DP_INFO[t.id] || ['', []];
  return '<div class="dp-det" id="dpdet" style="--c:' + t.bg + '"><div class="dp-det-h"><span class="dp-det-ic">' + (t.ic === 'sock' ? sockIc('#15122B', 16) : icon(t.ic, 20)) + '</span><b>' + esc(t.label) + '</b></div><p>' + esc(x[0]) + '</p>' +
    '<div class="dp-chips">' + x[1].map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' +
    '<button type="button" class="cta dp-go" data-act="dpStart">' + icon('i-play', 18) + 'Diesen Abend ausprobieren</button></div>';
}
V.demoPick = function () {
  var sel = UI.dpSel, cards = '';
  EVENT_TYPES.forEach(function (t, i) {
    var on = sel === t.id;
    cards += '<button type="button" class="dp-card' + (on ? ' on' : '') + (sel && !on ? ' dim' : '') + '" data-act="dpSel" data-v="' + t.id + '" aria-expanded="' + on + '" style="--c:' + t.bg + ';--i:' + i + '"><span class="dp-in"><span class="dp-art"><span class="dp-ring"></span>' + (t.ic === 'sock' ? sockIc('#15122B', 28) : icon(t.ic, 34)) + '</span><b>' + esc(t.label) + '</b><small>' + esc(t.sub) + '</small></span></button>';
    if (on) cards += dpDetail(t);
  });
  var body = '<h1 class="h1 mt10">Welchen Abend wollt ihr ausprobieren?</h1><p class="lead mt8">Tippt einen Anlass an. Der Beispiel-Abend ist schon mit Gästen und ihren Beiträgen gefüllt, ihr könnt sofort losspielen.</p><div class="dp-grid mt18">' + cards + '</div>';
  return scr(topbar(UI.dpFrom || 'landing', 'Beispiel-Abend'), body, '', 'dpscr');
};
