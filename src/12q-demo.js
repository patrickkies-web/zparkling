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
