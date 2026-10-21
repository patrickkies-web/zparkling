/* =========================================================
   The landing page. Whoever opens the site without a party of
   their own gets this first: what zparkling is, how it runs, what
   guests see, every occasion, the brakes, the Game Pass. „Intro
   starten“ leads into the intro, the example evening is one tap
   away. Guest links never see it (they open the invitation).
   ========================================================= */
var LP_WORD = 'ZPARKLING';
var LP_COLS = ['#FF7A45', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#FF8FC4', '#48D9A6', '#FFFFFF', '#FF7A45'];
function lpLogo(size) {
  size = size || 34;
  return '<span class="lp-logo" style="width:' + size + 'px;height:' + size + 'px" aria-hidden="true">' + brandTile(size) + '</span>';
}
/* the name hangs on the line, one ribbon tag per letter */
function lpGarland() {
  var n = LP_WORD.length, out = '<svg class="lp-line" viewBox="0 0 900 250" role="img" aria-label="zparkling"><path d="M-10 26Q450 136 910 26" stroke="#F4F1FF" stroke-opacity=".55" stroke-width="3" fill="none"></path>';
  for (var k = 0; k < n; k++) {
    var x = 50 + k * 100, t = (x + 10) / 920, y = (1 - t) * (1 - t) * 26 + 2 * (1 - t) * t * 136 + t * t * 26;
    out += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"><g class="lp-drop" style="--i:' + k + '"><g class="lp-sk" style="--r:' + (k % 2 ? 4 : -5) + 'deg">' +
      '<g transform="scale(2.5) translate(-18 0)">' + garlandItem('band', k, LP_COLS[k]) +
      '<text x="18" y="24.5" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="900" font-size="14" fill="#15122B">' + LP_WORD[k] + '</text></g>' +
      '<rect x="-5" y="-11" width="10" height="24" rx="3" fill="' + (k % 2 ? '#15122B' : '#F4F1FF') + '" stroke="#15122B" stroke-width="2"></rect></g></g></g>';
  }
  return out + '</svg>';
}
function lpBtn(act, label, cls, ic) { return '<button type="button" class="lp-btn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '">' + (ic ? icon(ic, 18) : '') + label + '</button>'; }
function lpFace(name, size) { return '<span class="lp-face" style="width:' + size + 'px;height:' + size + 'px">' + avatarSVG(tourAvFor(name, 0)) + '</span>'; }
function lpOcc(t, i) { return occTicket(t, { act: 'lpTry', go: true, i: i, id: 'lo-' + t.id }); }
V.landing = function () {
  var top = '<header class="lp-top" data-tint="#0C0A1A"><span class="lp-brand">' + lpLogo(32) + '<b>zparkling</b></span><nav class="lp-nav" aria-label="Start">' +
    '<button type="button" class="lp-link" data-act="openDemoPick">Beispiel-Abend</button>' + lpBtn('lpIntro', 'Intro starten', 'sm', 'i-play') + '</nav></header>';
  var hero = '<section class="lp-hero">' + lpGarland() +
    '<h1 class="lp-h1">Euer Abend, gespielt statt geplant.</h1>' +
    '<p class="lp-lead">zparkling ist das Partyspiel für Sockenkranz, Treppe fegen, Geburtstag und JGA. Eure Gäste schicken vorab per Link ein paar Kleinigkeiten über die Hauptperson, und die App baut daraus Spiele, die es nur auf eurer Party gibt.</p>' +
    '<div class="lp-ctas">' + lpBtn('lpIntro', 'Intro starten', '', 'i-play') + lpBtn('openDemoPick', 'Beispiel-Abend ansehen', 'ghost') + '</div>' +
    '<p class="lp-note">Das Intro dauert gut eine Minute. Ausprobieren kostet nichts.</p></section>';
  var steps = '<section class="lp-sec"><h2 class="lp-h2">So läuft’s</h2><ol class="lp-steps">' +
    '<li class="lp-step" style="--c:#FF7A45;--rot:-1.2deg"><span class="lp-n">1</span><div class="lp-step-art lp-faces">' + lpFace('Jonas', 74) + lpFace('Mia', 74) + '</div>' +
    '<h3>Party anlegen</h3><p>Wer wird gefeiert und was ist der Anlass? Zwei Fragen, dann steht euer Abend.</p></li>' +
    '<li class="lp-step" style="--c:#FF8FC4;--rot:.9deg"><span class="lp-n">2</span><div class="lp-step-art">' + emb('letter', 70) + '<span class="lp-tag">Ich bin dabei!</span></div>' +
    '<h3>Gäste einladen</h3><p>Ein Link in die Gruppe. Jeder Gast bekommt eine Einladung und schickt in zwei Minuten Steckbrief, Lügen und Erinnerungen.</p></li>' +
    '<li class="lp-step" style="--c:#48D9A6;--rot:-.6deg"><span class="lp-n">3</span><div class="lp-step-art">' + emb('trophy', 70) + '<span class="lp-tag">Los geht’s!</span></div>' +
    '<h3>Feiern</h3><p>Am Abend tippt sich der Spielleiter durch. Welche der über 100 Spiele drankommen, bleibt bis dahin geheim.</p></li></ol></section>';
  var ls = qStyle('luege'), guests = '<section class="lp-sec lp-split"><div class="lp-copy"><h2 class="lp-h2">Für eure Gäste ist schon das Mitmachen ein Spiel.</h2>' +
    '<p class="lp-p">Statt eines Formulars kommt eine Einladung zum Aufklappen, mit Namen, Datum und Anlass. Für jeden Beitrag gibt es Punkte, Level und Sticker, und mit etwas Glück eine Bonuskarte.</p>' +
    '<p class="lp-p">Je mehr Gäste mitmachen, desto persönlicher wird der Abend. Als Spielleiter seht ihr genau, was schon da ist und was noch fehlt.</p></div>' +
    '<div class="lp-show" aria-hidden="true">' +
    '<div class="lp-hud"><span class="lp-hud-e">' + emb('balloon', 34) + '</span><span class="stack" style="gap:1px"><small>Level-Up!</small><b>Partygast</b></span><span class="lp-hud-p">30 P</span></div>' +
    '<div class="lp-card"><span class="lp-card-r">Selten</span><span class="lp-card-e">' + emb('palette', 64) + '</span><small>Porträt</small><b>Mal Mia!</b><span>Du hast 45 Sekunden. Schnell, ehrlich, mit Liebe.</span><i>+15 Punkte</i></div>' +
    '<div class="lp-chip" style="--tc:' + ls.c + '">' + emb(ls.e, 30) + '<span class="stack" style="gap:1px"><b>Zwei Wahrheiten, eine Lüge</b><span>Drei Sätze, einer ist gelogen</span></span></div>' +
    '</div></section>';
  var occ = '<section class="lp-sec"><h2 class="lp-h2">Für jeden Anlass</h2>' +
    '<p class="lp-p lp-narrow">Beim Sockenkranz wird abgenommen, bei der Treppe gefegt, beim JGA ganz ohne Kranz gespielt. Tippt einen Anlass an und seht euch den Beispiel-Abend dazu an. Wie die Bräuche genau funktionieren, steht im <a class="lp-a" href="/ratgeber/">Ratgeber</a>.</p>' +
    '<div class="lp-occs dp-list">' + EVENT_TYPES.map(lpOcc).join('') + '</div></section>';
  var fair = '<section class="lp-sec"><h2 class="lp-h2">Mit eingebauter Bremse</h2><div class="lp-fair">' +
    '<div><span class="lp-fair-e">' + emb('cheers', 44) + '</span><b>Höchstens ein Pinnchen pro Spiel</b><p>Pro Spiel und Person nie mehr als eins. Wer viel gewinnt, trinkt weniger.</p></div>' +
    '<div><span class="lp-fair-e">' + emb('watch', 44) + '</span><b>Die App achtet aufs Tempo</b><p>Wird der Abend zu schnell, tritt sie auf die Bremse.</p></div>' +
    '<div><span class="lp-fair-e">' + emb('shield', 44) + '</span><b>Niemand muss</b><p>Gäste machen freiwillig mit. Wer nur zuschauen will, schaut zu.</p></div>' +
    '</div><p class="lp-p lp-narrow lp-adult">Für Erwachsene. Ob Pinnchen oder Wasser, entscheidet der Spielleiter vor dem Abend; die App spielt beides gleich. Wer fährt, trinkt nichts. <a class="lp-a" href="/verantwortung/">Mehr zur Verantwortung</a></p></section>';
  var plans = PASS_PLANS.map(function (p) { return '<span class="lp-price"><b>' + esc(p.price) + '</b><span>' + esc(p.label) + '</span></span>'; }).join('');
  var pass = '<section class="lp-sec"><div class="lp-pass"><div class="lp-copy"><h2 class="lp-h2">Ausprobieren kostet nichts.</h2>' +
    '<p class="lp-p">Der Beispiel-Abend zeigt euch, wie alles funktioniert. Für eure eigene Party gibt es den Game Pass: einmal zahlen, kein Abo, alle Spiele und Gäste-Links bis zwei Tage nach dem Fest.</p>' +
    '<div class="lp-prices">' + plans + '</div></div>' +
    '<div class="lp-ctas lp-ctas-col">' + lpBtn('openDemoPick', 'Beispiel-Abend ansehen', 'ink') + lpBtn('go', 'Game Pass ansehen', 'ghost ink-ghost').replace('data-act="go"', 'data-act="go" data-to="pass"') + '</div></div></section>';
  var end = '<section class="lp-end"><h2 class="lp-h2">Bereit für eure Party?</h2><p class="lp-p">Das Intro zeigt in gut einer Minute, was zparkling aus eurem Abend macht.</p>' +
    '<div class="lp-ctas">' + lpBtn('lpIntro', 'Intro starten', '', 'i-play') + lpBtn('newEvent', 'Gleich eure Party anlegen', 'ghost') + '</div></section>' +
    '<footer class="lp-foot"><span class="lp-brand">' + lpLogo(24) + '<b>zparkling</b></span><span>Das Partyspiel für euren Abend · <a class="lp-a" href="/ratgeber/">Ratgeber zu Sockenkranz, Schachtelkranz, Treppe fegen</a></span><span class="lp-legal">Für Erwachsene · <a class="lp-a" href="/verantwortung/">Verantwortung</a> · <a class="lp-a" href="/nutzungsbedingungen/">Nutzungsbedingungen</a> · <a class="lp-a" href="/impressum/">Impressum</a> · <a class="lp-a" href="/datenschutz/">Datenschutz</a></span></footer>';
  return scr('', top + lpMarquee() + hero + steps + guests + occ + fair + pass + end, '', 'lp');
};
A.lpIntro = function () { A.openTour(); };
/* an occasion on the landing page: the example evening, switched to it */
A.lpTry = function (d) { A.openDemoPick({ from: 'landing', v: d.v }); };
