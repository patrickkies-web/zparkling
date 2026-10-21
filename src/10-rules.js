/* =========================================================
   Rule questions: the explanation itself is on the card (GAME_TEXT),
   these only answer the rare cases. {N} is the person who plays.
   ========================================================= */
/* answers that fit every game of a format */
var FORMAT_FAQ = {
  solo: [['Gibt es einen zweiten Versuch?', 'Nur wenn es auf der Karte steht. Wird gestört, gibt es einen neuen.']],
  duell: [['Was gilt bei Gleichstand?', 'Stechen: eine Runde mehr.'], ['Wer fängt an?', 'Wer zuletzt Geburtstag hatte.']],
  duellGast: [['Wer tritt an?', 'Wen {N} sich aus der Menge aussucht. Wer nicht mag, darf freundlich ablehnen, dann fragt {N} jemand anderen.'], ['Muss der Gast trinken?', 'Nein. Verliert der Gast, löst er seinen Wetteinsatz ein.'], ['Was ist die Revanche-Karte?', 'Einmal pro Abend darf {N} eine verlorene Herausforderung gegen denselben Gast wiederholen. Es zählt das zweite Ergebnis.'], ['Was gilt bei Gleichstand?', 'Stechen: eine Runde mehr.']],
  team: [['Dürfen die Gäste helfen?', 'Nein, ihr zwei seid allein dran.']]
};
var ALWAYS_FAQ = ['Wer entscheidet bei Streit?', 'Der Spielleiter. Sein Wort gilt.'];
var NOBODY_FAQ = ['Muss ich trinken?', 'Nein, niemand muss. Wasser oder Aussetzen ist immer okay, ohne Kommentar. Wer fährt, trinkt nichts.'];
/* everything that is not a minigame */
var KIND_RULES = {
  menge: { a: 'Gegen die Menge! Die Gäste stimmen über fünf Fragen ab. Danach wird geraten: Was hat die Mehrheit gewählt? Drei Treffer, und die Runde ist geschafft.', f: [['Wer stimmt ab?', 'Alle Gäste, per Link oder per Handzeichen. Die Geburtstagskinder nicht.'], ['Dürfen die Geburtstagskinder zuschauen?', 'Beim Handzeichen nicht: Augen zu oder kurz raus. Per Link bleibt die Verteilung bis zur Auflösung geheim.'], ['Wie lange wird abgestimmt?', 'Bis der Spielleiter die Abstimmung beendet.'], ['Was ist bei Gleichstand?', 'Dann zählt jede Antwort als richtig.'], ['Raten beide gemeinsam?', 'Ja, sie einigen sich bei jeder Frage auf eine Antwort.']] },
  schaetzen: { a: 'Schätzfrage! {N} tippt eine Zahl, die Gruppe hält dagegen. Wer näher dran ist, gewinnt.', f: [['Die Gruppe gibt keinen Tipp ab?', 'Dann muss {N} nah genug dran sein, das steht unter der Frage.'], ['Beide gleich weit weg?', 'Gleichstand, niemand trinkt.'], ['Darf gegoogelt werden?', 'Nein, Handys weg.'], ['Wie findet die Gruppe ihren Tipp?', 'Sie einigt sich auf eine Zahl. Klappt das nicht, gilt die Mitte.']] },
  quiz: { a: 'Quiz-Frage! Vier Antworten, eine stimmt. {N} hat genau einen Versuch.', f: [['Darf die Gruppe helfen?', 'Nein, kein Vorsagen.'], ['Wie viel Bedenkzeit?', '30 Sekunden.'], ['Die Antwort ist umstritten?', 'Die Lösung der App gilt.']] },
  wwe: { a: 'Wer würde eher? Alle zeigen auf drei gleichzeitig auf eine Person. Die meisten Stimmen trinken.', f: [['Darf man sich selbst wählen?', 'Ja.'], ['Gleichstand?', 'Die App lost unter den Meistgewählten aus.'], ['Muss jeder abstimmen?', 'Ja, Enthaltung gibt es nicht.']] },
  frage: { a: 'Eine Frage von den Gästen! {N} antwortet, die Gäste wissen es besser.', f: [['Darf der Fragensteller helfen?', 'Nein, Pokerface bis zur Auflösung.'], ['Die hinterlegte Lösung ist falsch?', 'Der Fragensteller hat das letzte Wort.']] },
  frage_aufgabe: { a: 'Eine Aufgabe von den Gästen! Was zu tun ist und wie gewertet wird, steht auf der Karte.', f: [['Wer entscheidet, ob es geschafft ist?', 'Wie unter „So wird gewertet“, sonst der Spielleiter.'], ['Darf ich ablehnen?', 'Ja, das zählt als nicht geschafft.']] },
  frage_luege: { a: 'Zwei Wahrheiten, eine Lüge! Drei Sätze, einer ist erfunden. {N} findet ihn.', f: [['Darf ich den Gast etwas fragen?', 'Eine Frage pro Satz, er darf dabei lügen.'], ['Wann wird aufgelöst?', 'Gleich nach der Antwort, der Gast erzählt die wahre Geschichte.']] },
  frage_wer: { a: 'Wer hat’s geschrieben? Eine Erinnerung, mehrere Namen. {N} rät, von wem sie ist.', f: [['Darf der Autor sich verraten?', 'Nein, alle Gäste machen Pokerface.'], ['Darf ich nachfragen?', 'Nein, nur die Erinnerung zählt.']] },
  frage_steckbrief: { a: 'Steckbrief-Frage! Die Gäste haben verraten, was {N} eigentlich wissen sollte.', f: [['Stimmt die Angabe?', 'Der Gast hat sie selbst eingetragen, sie gilt.'], ['Wie genau bei Jahreszahlen?', 'Ein Jahr Spielraum.']] },
  partner: { a: 'Mein Partner kann! Zwei Teams bieten, wie viel ihr Partner schafft. Wer am höchsten bietet, muss liefern.', f: [['Wer muss das Gebot schaffen?', 'Das Team mit dem höchsten Gebot.'], ['Wie läuft das Bieten?', 'Abwechselnd höher bieten oder „Zeig mal!“ sagen.'], ['Genau das Gebot geschafft?', 'Reicht, gewonnen.'], ['Wer zählt?', 'Ein neutraler Gast zählt laut mit.']] },
  glueck: { a: 'Glücks-Moment! Durchatmen, diesmal entscheidet das Glück.', f: [['An wen darf ich verteilen?', 'An einen Gast deiner Wahl.'], ['Kann ich das ablehnen?', 'Nein, Glück nimmt man an.']] },
  toast: { a: 'Anstoßen! Alle Gläser hoch, auf {N}!', f: [['Muss ich etwas Bestimmtes trinken?', 'Nein, Wasser zählt auch.'], ['Wer hält den Trinkspruch?', 'Wer möchte, sonst der Spielleiter.']] },
  handicap: { a: 'Handicap-Station! {N} bestimmt einen Gast, der Gast sucht aus drei Karten ein Handicap aus. Es läuft eine Weile und verschwindet dann von selbst.', f: [['Kostet ein Handicap etwas?', 'Nein, getrunken wird deswegen nichts. Es macht nur alles ein bisschen schwerer.'], ['Wie wird man es früher los?', 'Mit einem Sieg in einem späteren Spiel.'], ['Und Atempause, Vollgas, Strafe statt Pinnchen?', 'Die ändern nur, wie der Pilot Niederlagen wertet. Maximum und Tempo-Bremse gelten immer.']] }
};
var GG_RULES = {
  laengste: { a: 'Wer kennt am längsten? Aus den Steckbriefen der Gäste. {N} tippt auf einen Namen.', f: [['Woher stammen die Jahre?', 'Aus den Steckbriefen, die die Gäste ausgefüllt haben.']] },
  zeitstrahl: { a: 'Freundschafts-Zeitstrahl! {N} bringt die Gäste in die richtige Reihenfolge. Ein vertauschtes Nachbarpaar ist erlaubt.', f: [['Was heißt Nachbarpaar?', 'Zwei Namen direkt nebeneinander, die getauscht sind.']] },
  jahre: { a: 'Jahre voller Freundschaft! Alle Jahre zusammengerechnet. {N} schätzt die Summe.', f: [['Wie genau muss es sein?', 'Das steht unter der Frage, ungefähr 15 Prozent.']] },
  naechster: { a: 'Geburtstags-Frage! Aus den Steckbriefen der Gäste. {N} tippt auf einen Namen.', f: [['Ab wann wird gezählt?', 'Ab heute.']] },
  kalender: { a: 'Geburtstags-Kalender! {N} sortiert die Gäste vom Januar bis zum Dezember. Ein vertauschtes Nachbarpaar ist erlaubt.', f: [['Was heißt Nachbarpaar?', 'Zwei Namen direkt nebeneinander, die getauscht sind.']] },
  kennen: { a: 'Wie war das nochmal? {K} Kennenlern-Geschichten, {N} ordnet jede dem richtigen Gast zu. Mindestens {M} müssen stimmen.', f: [['Darf ein Name zweimal vorkommen?', 'Ja, ein Gast kann auch zwei Geschichten geschrieben haben.'], ['Sind auch falsche Namen dabei?', 'Ja, ein paar Gäste stehen nur zur Ablenkung in der Liste.']] },
  luegen: { a: 'Lügen-Runde! {K} Lügen von den Gästen. {N} muss mindestens {M} davon entlarven.', f: [['Dürfen die Gäste schauspielern?', 'Ja, Pokerface ist erwünscht.'], ['Darf ein Gast zweimal drankommen?', 'Ja, wenn er mehrere Lügen geschickt hat.']] },
  erinnerungen: { a: 'Erinnerungs-Memory! {K} Erinnerungen an {N}, jede gehört zu einem Gast. Mindestens {M} müssen stimmen.', f: [['Dürfen die Autoren sich verraten?', 'Nein, alle schweigen bis zur Auflösung.'], ['Sind auch falsche Namen dabei?', 'Ja, ein paar Gäste stehen nur zur Ablenkung in der Liste.']] },
  galerie: { a: 'Porträt-Galerie! {K} Bilder von {N}, jedes gegen die Uhr gemalt. {N} tippt, wer welches gemalt hat. Mindestens {M} müssen stimmen.', f: [['Darf der Künstler sich verraten?', 'Nein, Pokerface bis zur Auflösung.'], ['Sind auch falsche Namen dabei?', 'Ja, ein paar Gäste stehen nur zur Ablenkung in der Liste.']] },
  waere: { a: 'Wenn {N} … wäre! Zu jeder Frage gibt es eine echte Antwort der Gäste und drei, die sich die App ausgedacht hat. {N} findet die echte. Mindestens {M} von {K} müssen stimmen.', f: [['Woher kommen die falschen Antworten?', 'Die hat die App dazugemischt.'], ['Was, wenn mehrere Gäste etwas gesagt haben?', 'Dann steht die häufigste Antwort zur Wahl, die anderen kommen bei der Auflösung.']] },
  sprueche: { a: 'Sprüche-Klopfer! {K} Sprüche, die {N} angeblich ständig sagt. Die App zeigt nur den Anfang, {N} ergänzt. Mindestens {M} müssen sitzen.', f: [['Muss es wortwörtlich sein?', 'Nein, sinngemäß reicht. Der Spielleiter entscheidet.'], ['Wer hat die Sprüche geschickt?', 'Das verrät die App nach jedem Spruch.']] },
  umfrage: { a: 'Top-Antworten! Wir haben die Gäste gefragt. {N} nennt Antworten, die auf der Tafel stehen könnten. Mindestens {M} von {K} finden, bevor drei Fehlversuche voll sind.', f: [['Zählt auch ein ähnliches Wort?', 'Ja, wenn es dasselbe meint. Der Spielleiter entscheidet.'], ['Was ist ein Fehlversuch?', 'Eine Antwort, die nicht auf der Tafel steht. Beim dritten ist die Tafel zu.'], ['Darf die Gruppe helfen?', 'Nein, die Gäste schweigen, sie kennen die Tafel ja.']] },
  millionen: { a: 'Die Millionenfrage-Runde! {K} Fragen der Gäste, eine nach der anderen. {N} braucht mindestens {M} richtige.', f: [['Gibt es Joker?', 'Nein. Aber der Moderator darf die Spannung so lange halten, wie er will.'], ['Wie genau müssen Schätzungen sein?', 'Ungefähr 15 Prozent daneben zählt noch, bei Jahreszahlen zwei Jahre.'], ['Darf die Gruppe helfen?', 'Nein, hier ist {N} allein gefragt.']] }
};
var GG_FAQ = [['Was passiert, wenn es klappt?', 'Es geht weiter, und die beteiligten Gäste stoßen an, wenn sie mögen.'], ['Was passiert, wenn es nicht klappt?', 'Es gibt ein Strafkännchen, wie bei jedem Spiel höchstens eins.'], ['Zählt eine große Runde doppelt?', 'Manchmal. Ab fünf Fragen kann eine geschaffte Runde zwei Schritte weit bringen, wenn Tempo und Pilot es zulassen.'], ['Darf die Gruppe helfen?', 'Nein, die Gäste schweigen bis zur Auflösung.']];

/* the rules for a step: announcement plus questions */
function rulesFor(P) {
  if (!P) return null;
  var g, r, fmt, faq = [];
  if (P.kind === 'spiel') {
    g = gameOf(P); fmt = P.format; if (!g) return null;
    var tx = gameTx(g, fmt);
    faq = (g.faq || []).slice();
    (FORMAT_FAQ[fmt] || []).forEach(function (x) { if (!faq.some(function (y) { return y[0] === x[0]; })) faq.push(x); });
    return { a: g.name + '! ' + (tx ? tx.join(' ') : ''), f: faq.concat([NOBODY_FAQ, ALWAYS_FAQ]) };
  }
  if (P.kind === 'gast') {
    r = GG_RULES[P.gg]; if (!r) return null;
    var K = P.items ? P.items.length : 0, M = P.need || 0, fill = function (t) { return t.replace(/\{K\}/g, K).replace(/\{M\}/g, M); };
    var own = r.f.map(function (x) { return [fill(x[0]), fill(x[1])]; });
    return { a: fill(r.a), f: own.concat(GG_FAQ.filter(function (x) { return !own.some(function (y) { return y[0] === x[0]; }); }), [NOBODY_FAQ, ALWAYS_FAQ]) };
  }
  if (P.kind === 'frage') {
    var q = S.questions.filter(function (x) { return x.id === P.qid; })[0], key = 'frage';
    if (q && q.type === 'aufgabe') key = 'frage_aufgabe';
    if (q && (q.type === 'luege' || q.type === 'wer' || q.type === 'steckbrief')) key = 'frage_' + q.type;
    if (q && (q.type === 'schaetzen' || q.type === 'bereich')) { r = KIND_RULES.schaetzen; return { a: 'Schätzfrage von den Gästen! {N} tippt, die Gruppe hält dagegen. Wer näher dran ist, gewinnt.', f: r.f.concat(KIND_RULES.frage.f.slice(1), [NOBODY_FAQ, ALWAYS_FAQ]) }; }
    r = KIND_RULES[key]; return { a: r.a, f: r.f.concat([NOBODY_FAQ, ALWAYS_FAQ]) };
  }
  /* a mission inside the crew or for the person alone gets its own announcement */
  if (P.kind === 'mission' && P.who && P.who !== 'fremd') {
    r = KIND_RULES.mission;
    var ma = P.who === 'truppe' ? 'Mission! Diesmal in der Truppe: {N} hat einen Auftrag, die Truppe spielt mit. Wer verweigert, trinkt.' : 'Mission! {N} allein, die Truppe ist Publikum und Jury. Wer verweigert, trinkt.';
    return { a: ma, f: r.f.slice(1).concat([NOBODY_FAQ, ALWAYS_FAQ]) };
  }
  r = KIND_RULES[P.kind];
  return r ? { a: r.a, f: r.f.concat([NOBODY_FAQ, ALWAYS_FAQ]) } : null;
}
function rulesText(s, P) { var pid = P && (P.main || (P.ids && P.ids[0])); var t = unitText(s, pid); var n = P && P.kind === 'toast' && P.ids ? focusNames(P.ids) : pid ? person(pid).name : ''; return t.replace(/\{N\}/g, n || 'du'); }
/* the announcement card: read it out, or let the phone read it */
function ansageHtml(P) {
  var r = rulesFor(P); if (!r) return '';
  var txt = rulesText(r.a, P);
  return '<div class="ansage mt14"><div class="row" style="justify-content:space-between;gap:10px"><span class="ansage-l">' + icon('i-bubble', 14) + 'Zum Vorlesen</span><button type="button" class="ansage-play" data-act="speak" aria-label="Ansage vorlesen lassen">' + icon('i-play', 14) + 'Vorlesen</button></div><p class="ansage-t">' + esc(txt) + '</p></div>';
}
/* the questions that usually come up, already answered: tap a question for the answer */
function faqHtml(P, key) {
  var r = rulesFor(P); if (!r || !r.f.length) return '';
  UI.faqOpen = UI.faqOpen || {};
  return '<span class="eyebrow mt22 block">Falls jemand fragt</span><div class="faq mt10">' + r.f.map(function (x, i) {
    var id = key + ':' + i, open = !!UI.faqOpen[id];
    return '<div class="faq-i' + (open ? ' open' : '') + '"><button type="button" class="faq-q" data-act="faqToggle" data-v="' + esc(id) + '" aria-expanded="' + open + '"><span class="grow">' + esc(rulesText(x[0], P)) + '</span>' + icon('i-plus', 16) + '</button>' + (open ? '<p class="faq-a">' + esc(rulesText(x[1], P)) + '</p>' : '') + '</div>';
  }).join('') + '</div>';
}
function rulesKey(P) { return P.kind + ':' + (P.game || P.gg || P.qid || P.idx || P.mid || P.cid || '') + ':' + (P.format || ''); }

