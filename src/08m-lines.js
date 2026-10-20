/* =========================================================
   Personal lines: sentences for Lippenlesen, counter lines for
   a challenge, stakes, mind-reading categories and things to draw.
   Best first: what the AI wrote for this very person, then lines
   built from what the guests sent (their two words, the years),
   then the general catalog. The more the guests send, the more
   personal it gets, without anyone pressing a button.
   ========================================================= */
var LIP_LINES = [
  'Heute wird bis zum Morgen getanzt', 'Wer hat die Chips versteckt?', 'Ich hätte gern noch ein Stück Torte',
  'Meine Socken sind heute zwei verschiedene', 'Das Buffet ist eröffnet', 'Alle hoch die Gläser',
  'Wo ist eigentlich mein Handy?', 'Morgen fangen wir mit Sport an', 'Ich habe einen Bärenhunger',
  'Die Musik ist viel zu leise', 'Wer will noch ein Stück Pizza?', 'Ich kann nicht tanzen, aber ich tu es trotzdem',
  'Mein Lieblingstier ist ein Pinguin', 'Heute bleibe ich bis zum Schluss', 'Das war die beste Party des Jahres',
  'Bitte keine Fotos von mir beim Tanzen', 'Der Kühlschrank ist schon wieder leer', 'Wir fahren nächstes Jahr ans Meer',
  'Ich hätte gern einen Hund mit Hut', 'Wer hat meinen Platz geklaut?', 'Jetzt kommt mein Lieblingslied',
  'Wir sind die lauteste Party der Straße', 'Die Nachbarn feiern einfach mit', 'Ich trinke heute nur noch Wasser',
  'Karaoke ist eine Kunstform', 'Socken in Sandalen sind modern', 'Ein Pinguin geht in eine Bar',
  'Mein Opa tanzt besser als ich', 'Bananen sind krumm und lecker', 'Wo ist die Fernbedienung?',
  'Heute Nacht schläft hier keiner', 'Ich möchte ein Pony zum Geburtstag', 'Gurkensalat schmeckt nach Sommer'
];
var KONTER_LINES = [
  'Heute ist dein Ehrentag, nicht dein Glückstag!', 'Ich hab schon Größere als dich besiegt!', 'Pack schon mal dein {U} aus!',
  'Das wird kurz und schmerzlos!', 'Ich lass dich gewinnen. Nicht.', 'Du hast keine Chance, aber nutze sie!',
  'Ich trainiere seit Wochen für genau diesen Moment!', 'Geburtstag schützt vor Niederlage nicht!',
  'Mach dich bereit für die Revanche, die du nie bekommst!', 'Ich bin heute in Topform, du nur ein Jahr älter!',
  'Du forderst mich heraus? Mutig!', 'Ich nehm’s locker, mit links!'
];
var STAKES = [
  '{G} singt {N} ein Ständchen.', '{G} hält eine 30-Sekunden-Lobrede auf {N}.', '{G} holt {N} das nächste Getränk.',
  '{G} macht 15 Sekunden den Ententanz.', '{G} darf bis zur nächsten Aufgabe nur flüstern.', '{G} macht {N} ein ehrliches Kompliment.',
  '{G} macht {N} 20 Sekunden lang nach.', '{G} verbeugt sich vor {N} und sagt: „Du bist unschlagbar.“',
  '{G} tanzt mit {N} eine Runde Walzer.', '{G} ist bis zur nächsten Aufgabe der Butler von {N}.',
  '{G} erzählt die lustigste Geschichte mit {N}.', '{G} trägt bis zur nächsten Aufgabe eine Socke als Handschuh.',
  '{G} ruft dreimal laut: „Hoch lebe {N}!“', '{G} spielt 20 Sekunden Luftgitarre für {N}.'
];
var MIND_CATS = [
  ['Urlaub', ['Strand', 'Berge', 'Großstadt', 'Camping']], ['Frühstück', ['Brötchen', 'Müsli', 'Rührei', 'Pfannkuchen']],
  ['Haustier', ['Hund', 'Katze', 'Hamster', 'Goldfisch']], ['Farbe', ['Rot', 'Blau', 'Grün', 'Gelb']],
  ['Jahreszeit', ['Frühling', 'Sommer', 'Herbst', 'Winter']], ['Musik', ['Schlager', 'Rock', 'Hip-Hop', 'Pop']],
  ['Pizza', ['Salami', 'Margherita', 'Hawaii', 'Funghi']], ['Sport', ['Fußball', 'Tennis', 'Schwimmen', 'Skifahren']],
  ['Superkraft', ['Fliegen', 'Unsichtbar sein', 'Gedanken lesen', 'Zeitreisen']], ['Naschen', ['Schokolade', 'Gummibärchen', 'Chips', 'Eis']],
  ['Film', ['Komödie', 'Horror', 'Liebesfilm', 'Action']], ['Zahl', ['3', '7', '13', '42']],
  ['Abenteuer', ['Fallschirm', 'Tauchen', 'Safari', 'Achterbahn']], ['Obst', ['Apfel', 'Banane', 'Erdbeere', 'Mango']],
  ['Wochentag', ['Montag', 'Mittwoch', 'Freitag', 'Sonntag']], ['Brettspiel', ['Monopoly', 'Uno', 'Mensch ärgere dich nicht', 'Schach']],
  ['Märchen', ['Rotkäppchen', 'Aschenputtel', 'Hänsel und Gretel', 'Rapunzel']], ['Am Morgen', ['Kaffee', 'Tee', 'Kakao', 'Saft']],
  ['Unterwegs', ['Fahrrad', 'Auto', 'Zug', 'Roller']], ['Wohnen', ['Großstadt', 'Dorf', 'Insel', 'Berghütte']],
  ['Im Zoo', ['Löwe', 'Giraffe', 'Pinguin', 'Affe']], ['Essen gehen', ['Italienisch', 'Asiatisch', 'Mexikanisch', 'Deutsch']],
  ['Element', ['Feuer', 'Wasser', 'Erde', 'Luft']], ['Instrument', ['Gitarre', 'Klavier', 'Schlagzeug', 'Geige']],
  ['Traumberuf als Kind', ['Astronaut', 'Feuerwehr', 'Tierarzt', 'Pilot']], ['Wetter', ['Sonne', 'Regen', 'Schnee', 'Gewitter']],
  ['Party-Snack', ['Nachos', 'Salzstangen', 'Würstchen', 'Obstspieß']], ['Tanz', ['Walzer', 'Disco-Fox', 'Macarena', 'Robot']]
];
var DRAW_TERMS = ['Haus', 'Sonne', 'Baum', 'Auto', 'Katze', 'Fisch', 'Herz', 'Stern', 'Brille', 'Regenschirm', 'Schneemann', 'Banane', 'Eis', 'Pizza', 'Blume',
  'Mond', 'Wolke', 'Boot', 'Fahrrad', 'Hut', 'Schlüssel', 'Kerze', 'Torte', 'Luftballon', 'Socke', 'Geschenk', 'Uhr', 'Glocke', 'Tannenbaum', 'Pilz',
  'Apfel', 'Kirsche', 'Schnecke', 'Spinne', 'Maus', 'Hund', 'Schwein', 'Ente', 'Vogel', 'Schmetterling', 'Biene', 'Igel', 'Schildkröte', 'Krone', 'Pfeil',
  'Zelt', 'Leiter', 'Brücke', 'Berg', 'Insel', 'Palme', 'Regenbogen', 'Blitz', 'Feuer', 'Rakete', 'Ufo', 'Roboter', 'Geist', 'Lampe', 'Glühbirne',
  'Stuhl', 'Tisch', 'Bett', 'Tür', 'Fenster', 'Treppe', 'Zug', 'Flugzeug', 'Ampel', 'Anker', 'Gitarre', 'Trommel', 'Fußball', 'Pokal', 'Brezel',
  'Wurst', 'Ei', 'Karotte', 'Zitrone', 'Kaktus', 'Würfel', 'Auge', 'Hand', 'Fuß', 'Ohr', 'Mund', 'Zahn', 'Knochen', 'Kamm', 'Zahnbürste', 'Löffel', 'Gabel',
  'Tasse', 'Flasche', 'Teller', 'Topf', 'Handy', 'Brief', 'Buch', 'Schere', 'Smiley', 'Krawatte', 'Schuh', 'Hose', 'Handschuh', 'Schal', 'Mütze',
  'Sonnenschirm', 'Welle', 'Wal', 'Hai', 'Krake', 'Burg', 'Drache', 'Krokodil', 'Elefant', 'Giraffe', 'Hase', 'Kuh', 'Pferd', 'Frosch', 'Eule', 'Pinguin'];
var SPOON_DECOYS = ['Löwe', 'Löcher', 'Lüfter', 'Läufer', 'Locke', 'Löffelbiskuit', 'Kochlöffel', 'Lockenwickler', 'Lolli', 'Lift', 'Löwenzahn',
  'Lötkolben', 'Lümmel', 'Lösung', 'Löwin', 'Leopard', 'Lasso', 'Lakritz', 'Lappen', 'Laterne', 'Gabel', 'Messer', 'Teller', 'Pfeffer', 'Löffelente'];

/* what the guests told about one person: their two words and the years they know each other */
function guestFacts(pid) {
  var w = aiWords(pid), years = [];
  S.questions.forEach(function (q) { if (q.type === 'steckbrief' && q.status === 'ok' && q.year && isGuestAuthor(q.author) && (!q.forId || q.forId === pid)) years.push({ by: q.author, year: q.year }); });
  return { traits: w.traits, interests: w.interests, years: years };
}
function lineFill(s, pid, extra) {
  var p = person(pid);
  return String(s).replace(/\{N\}/g, p.name).replace(/\{U\}/g, U()).replace(/\{G\}/g, (extra && extra.G) || 'Der Gast').replace(/\{I\}/g, (extra && extra.I) || '').replace(/\{T\}/g, (extra && extra.T) || '').replace(/\{B\}/g, (extra && extra.B) || '').replace(/\{Y\}/g, (extra && extra.Y) || '');
}
/* candidates in the order of how personal they are */
function personalLines(pid, kind) {
  var f = guestFacts(pid), out = [], ai = (S.ai && S.ai[pid]) || {};
  var add = function (t) { t = String(t || '').replace(/\s+/g, ' ').trim(); if (t && out.indexOf(t) < 0) out.push(t); };
  if (kind === 'lippen') {
    (ai.lines || []).forEach(add);
    /* the sayings the guests sent in, once their own round is through or will not come */
    var sp = S.questions.filter(function (q) { return q.type === 'spruch' && q.status === 'ok' && (!q.forId || !isFocus(q.forId) || q.forId === pid); });
    var spOpen = sp.filter(function (q) { return !q.used; }).length;
    sp.forEach(function (q) { if ((q.used || spOpen < 3) && String(q.text).length <= 60) add(q.text); });
    f.interests.forEach(function (x) { add(lineFill(pick(['{N} liebt {I} über alles', 'Ohne {I} geht bei {N} nichts', '{N} träumt nachts von {I}', 'Heute reden wir nur über {I}']), pid, { I: x.w })); });
    f.traits.forEach(function (x) { add(lineFill('Ein Wort für {N}: {T}', pid, { T: x.w })); });
    f.years.forEach(function (x) { add(lineFill('{B} kennt {N} seit {Y}', pid, { B: x.by, Y: String(x.year) })); });
    shuffle(LIP_LINES).forEach(add);
  } else if (kind === 'konter') {
    (ai.konter || []).forEach(add);
    f.interests.forEach(function (x) { add(lineFill(pick(['Nicht mal {I} kann dich jetzt retten, {N}!', 'Geh lieber zurück zu {I}, {N}!']), pid, { I: x.w })); });
    f.traits.forEach(function (x) { add(lineFill('„{T}“? Heute nicht, {N}!', pid, { T: x.w })); });
    shuffle(KONTER_LINES).forEach(function (t) { add(lineFill(t, pid)); });
  }
  return out;
}
/* the next unused line; when everything was used, start over */
function drawLine(pid, kind, not) {
  S.used = S.used || {};
  var used = S.used['line:' + kind] = S.used['line:' + kind] || [];
  var all = personalLines(pid, kind), fresh = all.filter(function (t) { return used.indexOf(t) < 0 && t !== not; });
  var t = fresh[0] || all.filter(function (x) { return x !== not; })[0] || all[0] || '';
  if (t && used.indexOf(t) < 0) used.push(t);
  return t;
}
/* three stakes for the guest to choose from */
function drawStakes(pid, guest) {
  return shuffle(STAKES).slice(0, 3).map(function (s) { return lineFill(s, pid, { G: guest || 'Der Gast' }); });
}
/* five categories for the mind reader, one of them built from the guests' words when there are enough */
function drawMindCats(pid) {
  var f = guestFacts(pid), ints = [], cats = shuffle(MIND_CATS).slice(0, 5).map(function (c) { return { cat: c[0], terms: shuffle(c[1]) }; });
  f.interests.forEach(function (x) { var w = String(x.w).trim(); if (w && ints.map(function (y) { return y.toLowerCase(); }).indexOf(w.toLowerCase()) < 0) ints.push(w.slice(0, 26)); });
  if (ints.length >= 3) {
    var fill = ['Pizza', 'Urlaub', 'Musik', 'Freunde'].filter(function (x) { return ints.indexOf(x) < 0; });
    cats[Math.floor(Math.random() * 5)] = { cat: 'Was liebt ' + person(pid).name + ' am meisten?', terms: shuffle(ints.slice(0, 4).concat(fill).slice(0, 4)), own: true };
  }
  return cats;
}
function drawTerms(n) { return shuffle(DRAW_TERMS).slice(0, n); }
/* terms the master whispers (Pantomime, Begriffe erklären, Montagsmaler): one or two from what the guests say this person loves */
var TERM_GAMES = { pantomime: 3, erklaeren: 5, montagsmaler: 2, rueckenmalen: 3 };
function drawTermsFor(pid, n) {
  var own = [], f = guestFacts(pid);
  f.interests.forEach(function (x) { var w = String(x.w).trim().slice(0, 28); if (w && own.map(function (y) { return y.toLowerCase(); }).indexOf(w.toLowerCase()) < 0) own.push(w); });
  own = shuffle(own).slice(0, n > 2 ? 2 : 1);
  return { list: shuffle(own.concat(drawTerms(n + 2).filter(function (t) { return own.indexOf(t) < 0; })).slice(0, n)), own: own };
}
