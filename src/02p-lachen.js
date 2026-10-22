/* =========================================================
   v42: Spiele, über die der Raum lacht.
   Jedes Spiel wurde gegen eine Frage geprüft: Lacht der Raum? Der Spaß
   kommt aus der Situation (Körperkomik, Chaos, Zeitdruck, knappe Duelle),
   nie aus der Pflicht, auf Kommando witzig zu sein. Raus sind Witze,
   Reden, Gedichte, Reime, Schulwissen, Kindergeburtstag, Sportunterricht
   und Spiele, bei denen 20 Leute einer Person beim Zählen zusehen.
   Gegeneinander schlägt allein: viele Spiele sind jetzt Duelle.
   OUT: was rausfällt. TEXT: neue Texte (s, d, t, f wie in GAME_TEXT;
   ein fehlendes s heißt: kein Solo mehr). FIX: neuer Name, Material,
   Mindestzahl. NEW: neue Spiele. JGA: Missionen, gleiche ids.
   ========================================================= */
(function () {
  var OUT = [
    'kk-schnipp', 'blindpaare', 'muenze', 'pingpong', 'eierlauf', 'klammern', 'strohhalm', 'daumen',
    'deckel', 'flamingo', 'sockenball', 'lineal', 'wasserlauf', 'ringwurf', 'teelichter', 'kimspiel',
    'witz', 'kkturm', 'kehrwurf', 'rede', 'reime', 'imitieren', 'spaghettiturm', 'schokosaugen',
    'chipsturm', 'flaschenkegeln', 'aluskulptur', 'papierflieger', 'ballonkopf', 'zollstock', 'buegelmuenze', 'sackhuepfen',
    'kickups', 'wuerfelturm', 'kartenhaus', 'kartenwurf', 'muenzfussball', 'korkentauchen', 'serviette', 'zeitlupe',
    'wortkette', 'freeze', 'fegeslalom', 'kehrblechlauf', 'schachtelturm', 'schachtelraten', 'schachtelblind', 'stufenschaetzen',
    'klinkenzaehlen', 'papierschlange', 'zahlenmerken', 'filmsymbole', 'kkgolf', 'rueckenmalen', 'spiegel', 'geraeusche',
    'muenzstapel', 'jaichwill', 'liebesgedicht', 'kerzenblind', 'jahrgang', 'waescheleine', 'stufenbecher', 'spiegelputzen',
    'topfecho', 'sockenjahre', 'sockenrede', 'sockenjonglage', 'sockenfuehler', 'sockenzaehlen', 'sockenstapel', 'sockenmatch',
    'sockengeschichte', 'sockenspender', 'sockenkorken', 'sockenwunsch', 'schachteljahre', 'schachtelrede', 'schachtelgewicht', 'schachtelpyramide',
    'schachtelzaehlen', 'schachtelgeschichte', 'schachtelspender', 'schachtelkopf', 'schachtelecho', 'schachtelwunsch', 'stufenjahre', 'stufenrede',
    'korkenschaetzen', 'stufenmemory', 'korkenpyramide', 'stufengeschichte', 'kussgruende', 'zahnbuerstenbalance', 'korkenkette', 'kehrblechkipp',
    'klinkenjahre', 'klinkenrede', 'klinkenmemory', 'klinkenglanz', 'lappenkick', 'tuerenquiz', 'putzlied', 'klinkenknigge',
    'lappentanz', 'klinkentipp', 'kussliste', 'lappenorigami', 'tuerenleben', 'jahresrueckblick', 'dankesrede', 'wunschzettel',
    'geburtsjahr', 'altersraten', 'tortenkunst', 'liedfremd', 'tageszahl', 'jahrgangshit', 'monatsrechnen', 'dankjahrzehnt',
    'vorsatzballon', 'geluebde', 'zukunftsbrief', 'kriserede', 'ringfingermuenze', 'redeabc', 'gaestenamen', 'fuenfjahre',
    'abschiedsrede', 'ehetipps', 'antragspiel', 'liebesabc', 'besentanz', 'serviettenlaufsteg', 'hochzeitsdaten', 'tanzliedraten',
    'erstestreffen', 'versprechen', 'filmhochzeit', 'suessgeschichte', 'dreiworte', 'komplimentblitz', 'lebensmotto', 'gemeinsamkeit',
    'zehnjaehrig', 'schlagzeile', 'dankbar', 'gegenstandsgeschichte', 'zukunftsfoto', 'werbespot', 'raumblind', 'fantasiesprache',
    'kuerzestfreund'
  ];
  OUT.forEach(function (id) { if (GAMES_OUT.indexOf(id) < 0) GAMES_OUT.push(id); });

  var FIX = {
    zungenbrecher: { name: 'Korken-Zungenbrecher', mat: 'Korken', needs: ['korken'] },
    pyramide: { name: 'Blinde Baustelle', mat: 'Plastikbecher, Augenbinde', needs: ['becher', 'augenbinde'] },
    alphabet: { name: 'Verkehrskontrolle', mat: 'Klebeband', needs: ['klebeband'] },
    summen: { name: 'Gurgel-Hits', mat: 'Becher mit Wasser', needs: ['becher'] },
    schnick: { name: 'Ganzkörper-Schnick', min: 2 },
    aufzaehlen: { name: 'Drei Sekunden' },
    starren: { name: 'Nicht prusten', mat: 'Becher mit Wasser', needs: ['becher'] },
    blindmalen: { name: 'Blind-Porträt', mat: 'Papier, Stifte, Augenbinde', needs: ['papier', 'stifte', 'augenbinde'] },
    ballonblasen: { name: 'Ballon-Rakete' },
    mehlschneiden: { mat: 'Mehl, Gummibärchen, Tasse, Teller, Messer', needs: ['mehl', 'gummibaerchen'] },
    wuerfelglueck: { name: 'Lügen-Würfel', mat: '2 Würfel, eine Tasse', needs: ['wuerfel'], min: 2 },
    hulahoop: { name: 'Hula-Hoop zu zweit' },
    laserparcours: { mat: 'Klopapier', needs: ['klopapier'] },
    seiltanz: { name: 'Polizeikontrolle' },
    stadtland: { name: 'Stadt, Land, Bier', needs: [] },
    koffer: { name: 'Kater-Koffer' },
    gefuehlsminute: { name: 'Gefühlte 30 Sekunden', min: 2 },
    klinkenblitz: { name: 'Lebende Klinken' },
    staendchen: { name: 'Gurgel-Ständchen', mat: 'Becher mit Wasser', needs: ['becher'] },
    schachtelkegeln: { name: 'Rückwärts-Kegeln' },
    daumenblitz: { min: 2 },
    kuechenwaage: { name: 'Ab auf die Waage', mat: 'Küchenwaage', needs: ['kuechenwaage'], min: 2 },
    tastbeutel: { name: 'Wühltisch', mat: 'Stoffbeutel oder Kissenbezug, Kleinkram aus den Taschen der Gäste', needs: ['stoffbeutel'] },
    sockenkegeln: { name: 'Bowling durch die Beine' },
    sockenpost: { name: 'Dating-Tipps in der Socke' },
    schachtelpost: { name: 'Dating-Tipps in der Schachtel' },
    schachtelstaffel: { name: 'Schachtel-Pinguin' },
    besenkaraoke: { mat: 'Besen, ein Handy mit Musik', needs: ['besen'] },
    kehrblechgolf: { name: 'Kehrblech-Boule' },
    fegeorakel: { name: 'Kronkorken-Regen', mat: 'Besen, Kronkorken', needs: ['besen', 'kronkorken'] },
    kehrblechcatch: { name: 'Kehrblech-Tennis', mat: 'Kehrblech & Handfeger, Tischtennisbälle', needs: ['kehrblech', 'tischtennis'] },
    korkenflip: { name: 'Ellbogen-Fang' },
    lappenbalance: { name: 'Schwamm-Rennen' },
    eimerhelm: { name: 'Eimer-Ritter', mat: 'Eimer, Lappen oder Schwamm', needs: ['eimer', 'lappen'], min: 2 },
    kerzenzwei: { name: 'Die letzte Kerze' },
    erstemale: { name: 'Wie alt warst du da?' },
    geschenkorakel: { name: 'Geschenk schütteln' },
    ringsuche: { name: 'Der Ring am Halm', mat: 'Strohhalme, Gummiringe', needs: ['strohhalme', 'gummiringe'] },
    blindfuehren: { name: 'Folge meiner Stimme' },
    stummeliebe: { name: 'Stumme Macken' },
    partnerstimme: { name: 'Kontrollanruf' },
    becherblind: { min: 2 },
    nachrichtenwette: { name: 'Der Anruf' },
    stimmenorakel: { name: 'Wer hat mein Bier?' },
    letztesfoto: { name: 'Foto-Roulette', min: 2 }
  };
  GAMES.forEach(function (g) { var x = FIX[g.id]; if (x) Object.keys(x).forEach(function (k) { g[k] = x[k]; }); });

  var NEW = [
    { id: 'pendelkegeln', name: 'Pendel-Kegeln', cat: 'Action', mat: 'Ersatz-Socken, Äpfel, leere Flaschen', needs: ['socken', 'aepfel', 'flaschen'], min: 2 },
    { id: 'sockenklauen', name: 'Socken klauen', cat: 'Duell', mat: '', needs: [], min: 2 },
    { id: 'zeitungsfechten', name: 'Zeitungs-Fechten', cat: 'Duell', mat: 'Zeitungen', needs: ['zeitung'], min: 2 },
    { id: 'rotehaende', name: 'Rote Hände', cat: 'Reaktion', mat: '', needs: [], min: 2 },
    { id: 'gummigrimasse', name: 'Gummi-Grimasse', cat: 'Party', mat: 'Gummiringe', needs: ['gummiringe'], min: 2 },
    { id: 'sockenschlacht', name: 'Socken-Schlacht', cat: 'Action', mat: 'Ersatz-Socken', needs: ['socken'], min: 2, only: ['socken'] },
    { id: 'schachtelskates', name: 'Schachtel-Skates', cat: 'Action', mat: 'Leere Schachteln', needs: ['schachteln'], min: 2, only: ['schachtel'] },
    { id: 'schachtelmauer', name: 'Mauer-Duell', cat: 'Geschick', mat: 'Leere Schachteln, Zeitungen', needs: ['schachteln', 'zeitung'], min: 2, only: ['schachtel'] },
    { id: 'besentauziehen', name: 'Besen-Tauziehen', cat: 'Fegen', mat: 'Besen, Klebeband', needs: ['besen', 'klebeband'], min: 2, only: ['fegen'] },
    { id: 'schwammstaffel', name: 'Schwamm-Staffel', cat: 'Action', mat: 'Eimer, Lappen oder Schwamm, Plastikbecher', needs: ['eimer', 'lappen', 'becher'], min: 2, only: ['putzen'] },
    { id: 'geschenkhandschuh', name: 'Geschenk mit Ofenhandschuhen', cat: 'Geschick', mat: 'Ofenhandschuhe, Zeitungen, Schnur oder Wolle', needs: ['ofenhandschuh', 'zeitung', 'schnur'], min: 2, only: ['geburtstag'] }
  ];
  NEW.forEach(function (g) { if (!GAMES.some(function (x) { return x.id === g.id; })) GAMES.push(g); });

  var TEXT = {
    nagel: {
      d: ['Der Spielleiter klopft zwei Nägel gleich tief in den Holzklotz. Abwechselnd je ein Schlag auf den eigenen Nagel, aber nur mit der schmalen Seite des Hammers.', 'Gewonnen hat, wer seinen Nagel zuerst komplett versenkt.'],
      f: [['Der Nagel ist krumm, was nun?', 'Weiterschlagen. Einen neuen Nagel gibt es nicht.'], ['Daneben gehauen?', 'Pech, der Schlag ist weg.']]
    },
    zungenbrecher: {
      d: ['Beide nehmen einen Korken quer zwischen die Zähne. Abwechselnd „Blaukraut bleibt Blaukraut, Brautkleid bleibt Brautkleid“ sagen, erst einmal, dann zweimal hintereinander, dann dreimal und so weiter.', 'Gewonnen hat, wer sich nicht als Erster verhaspelt.'],
      f: [['Was zählt als Verhaspeln?', 'Ein falsches oder fehlendes Wort. Nuscheln wegen des Korkens zählt nicht, im Zweifel entscheiden die Gäste.'], ['Andere Sätze?', '„Der Cottbuser Postkutscher putzt den Cottbuser Postkutschkasten“ oder „Zwischen zwei Zwetschgenzweigen zwitschern zwei Schwalben“.']]
    },
    pyramide: {
      d: ['Beide bekommen die Augen verbunden, sechs Becher und einen Gast als Ansager, den sie sich selbst aussuchen. Blind eine Pyramide bauen (3, 2, 1). Die Ansager helfen nur mit Worten, beide reden gleichzeitig.', 'Gewonnen hat, wessen Pyramide zuerst steht.'],
      t: ['Einer von euch bekommt die Augen verbunden und baut aus sechs Bechern eine Pyramide (3, 2, 1). Der andere sagt nur mit Worten an.', 'Geschafft, wenn die Pyramide nach 45 Sekunden steht.'],
      f: [['Darf der Ansager anfassen?', 'Nein, weder die Becher noch die Hand des Bauenden.'], ['Die Pyramide fällt um?', 'Weiterbauen, die Zeit läuft.']]
    },
    alphabet: {
      s: ['Eine Linie aus Klebeband auf dem Boden, die Gäste sind die Polizei. Auf der Linie gehen, Ferse an Fußspitze, und dabei das Alphabet rückwärts aufsagen, ab Z. Am Ende der Linie umdrehen und weiter.', 'Geschafft, wenn es bis zum M klappt, ohne Fehltritt und ohne Verhaspeln.'],
      d: ['Eine Linie aus Klebeband auf dem Boden, die Gäste sind die Polizei. Nacheinander auf der Linie gehen, Ferse an Fußspitze, und dabei das Alphabet rückwärts aufsagen, ab Z. Wer danebentritt oder einen Buchstaben falsch sagt, ist raus.', 'Gewonnen hat, wer im Alphabet weiter kommt.'],
      f: [['Wie lang ist die Linie?', 'Drei, vier Meter. Am Ende umdrehen und zurück.'], ['Beide kommen bis A?', 'Noch eine Runde, diesmal mit geschlossenen Augen.']]
    },
    ballon: {
      d: ['Beide klemmen sich einen Ballon zwischen die Knie und starten am selben Punkt, aber in entgegengesetzte Richtungen einmal um den Tisch. Hände weg, unterwegs müssen sie aneinander vorbei.', 'Gewonnen hat, wer zuerst wieder am Start ist.'],
      t: ['Ihr stellt euch Rücken an Rücken und klemmt einen Ballon dazwischen. So geht ihr zusammen einmal um den Tisch, ohne Hände.', 'Geschafft, wenn der Ballon nicht runterfällt.'],
      f: [['Der Ballon fällt?', 'An der Stelle wieder einklemmen und weiter.']]
    },
    pantomime: {
      d: ['Beide bekommen vom Spielleiter denselben Begriff zugeflüstert und stellen ihn gleichzeitig dar, ohne Worte und ohne Geräusche. Die Gäste sind in zwei Hälften geteilt, jeder spielt für seine. Drei Begriffe.', 'Gewonnen hat, wessen Hälfte öfter zuerst richtig ruft.'],
      t: ['Einer von euch stellt dar, der andere rät. Die Begriffe flüstert der Spielleiter, ohne Worte und ohne Geräusche.', 'Geschafft, wenn ihr in 60 Sekunden 4 Begriffe schafft.'],
      f: [['Darf man Buchstaben in die Luft malen?', 'Nein, nur Gesten.'], ['Welche Begriffe?', 'Lieber Situationen als Dinge: Ikea-Schrank aufbauen, rückwärts einparken mit Publikum, Kater am Sonntagmorgen, Wespe am Grill, Handy fällt ins Klo, barfuß auf Lego treten.']]
    },
    summen: {
      d: ['Abwechselnd nimmt jeder einen Schluck Wasser, legt den Kopf in den Nacken und gurgelt einen Song, den ihm der Spielleiter zuflüstert. Die Gäste haben 20 Sekunden zum Raten. Je drei Songs.', 'Gewonnen hat, wessen Songs öfter erraten werden.'],
      t: ['Einer von euch gurgelt Songs, die der Spielleiter zuflüstert, der andere rät. Nach jedem Song einen neuen Schluck.', 'Geschafft, wenn ihr in 60 Sekunden 3 Songs schafft.'],
      f: [['Welche Songs?', 'Was jeder mitgrölen kann: Atemlos, Macarena, Country Roads, Major Tom, We Will Rock You, Highway to Hell, Wannabe, Ein Stern.'], ['Und wenn man lachen muss?', 'Erst runterschlucken, dann lachen.']]
    },
    schnick: {
      d: ['Beide stehen Rücken an Rücken. Die Gäste zählen laut bis drei, dann springen beide herum und zeigen mit dem ganzen Körper: Stein heißt in die Hocke, Schere heißt Ausfallschritt mit gekreuzten Armen, Papier heißt Arme und Beine weit auseinander.', 'Gewonnen hat, wer zuerst drei Runden holt.'],
      f: [['Halbe Sachen?', 'Es zählt nur, was die Gäste eindeutig erkennen. Sonst wird die Runde wiederholt.']]
    },
    aufzaehlen: {
      d: ['Abwechselnd nennt jeder einen Begriff aus einer Kategorie, die der Spielleiter vorgibt, zum Beispiel Biermarken, Ikea-Möbel oder Wörter fürs Betrunkensein. Die Gäste zählen dabei laut drei Sekunden runter.', 'Gewonnen hat, wer nicht als Erster stockt oder etwas doppelt sagt.'],
      f: [['Wer prüft, ob ein Begriff zählt?', 'Die Gäste, per Zuruf. Erfundene Ikea-Möbel fliegen auf, sobald es einer merkt.'], ['Weitere Kategorien?', 'Schnapssorten, Schlagerstars, Kosenamen, Körperteile, Pizzabeläge, Dinge in einer Handtasche.']]
    },
    becherflip: {
      d: ['Beide stehen nebeneinander an der Tischkante, jeder hat drei leere Becher, Öffnung nach oben. Den ersten halb über die Kante schieben und von unten anschnippen, sodass er sich dreht und mit der Öffnung nach unten landet. Erst wenn er richtig liegt, kommt der nächste dran.', 'Gewonnen hat, wer zuerst alle drei Becher umgedreht hat.'],
      f: [['Der Becher fällt runter?', 'Aufheben, wieder an die Kante und neu schnippen.']]
    },
    starren: {
      s: ['Einen Schluck Wasser in den Mund nehmen und die Gäste anschauen. Die Gäste haben 30 Sekunden für Grimassen, Geräusche und Sprüche, nur Anfassen ist verboten.', 'Geschafft, wenn das Wasser nach 30 Sekunden noch im Mund ist.'],
      d: ['Beide nehmen einen Schluck Wasser in den Mund und stellen sich nebeneinander vor die Gäste. Die Gäste dürfen alles tun, um sie zum Lachen zu bringen, nur nicht anfassen.', 'Gewonnen hat, wer das Wasser länger im Mund behält.'],
      f: [['Runtergeschluckt?', 'Zählt wie gelacht.'], ['Beide halten durch?', 'Nach 60 Sekunden entscheiden die Gäste per Zuruf, wer mehr gegrinst hat.'], ['Wohin mit dem Wasser, wenn es raus will?', 'In den eigenen Becher. Nicht auf die Gäste zielen.']]
    },
    curling: {
      d: ['Beide schnippen abwechselnd je drei Kronkorken vom selben Tischende Richtung andere Kante. Er soll so nah wie möglich an der Kante liegen bleiben. Fremde Kronkorken darf man wegschießen, gern auch über die Kante.', 'Gewonnen hat, wessen Kronkorken am Ende am nächsten an der Kante liegt. Runtergefallene zählen nicht.'],
      f: [['Wie unterscheidet man die Kronkorken?', 'Verschiedene Biermarken nehmen, oder einer legt seine mit der Unterseite nach oben.']]
    },
    blindabhaengen: {
      d: ['Beide bekommen die Augen verbunden, werden dreimal gedreht und stehen drei Schritte vom Kranz entfernt. Den Kranz finden, {UN} ertasten und abnehmen. Die Gäste dürfen Richtungen zurufen, auch falsche.', 'Gewonnen hat, wer zuerst 3 {UN} in der Hand hält.'],
      f: [['Und wenn der Kranz runterfällt?', 'Ein Gast hält ihn fest. Was abgerissen ist, zählt trotzdem.']]
    },
    erklaeren: {
      d: ['Abwechselnd 60 Sekunden: Einer umschreibt Begriffe vom Spielleiter, die Gäste raten. Der andere hört mit und ruft „Foul“, sobald das Wort oder ein Teil davon fällt.', 'Gewonnen hat, wer mehr Begriffe erraten lässt.'],
      t: ['Einer von euch erklärt, der andere rät. Die Begriffe flüstert der Spielleiter, das Wort selbst und Teile davon sind tabu.', 'Geschafft, wenn ihr in 60 Sekunden 5 Begriffe schafft.'],
      f: [['Welche Begriffe?', 'Was jeder kennt und keiner gern erklärt: Kater, Fremdschämen, Ballermann, Bierbauch, Schwiegermutter, Bausparvertrag, Mittagsschlaf, Karaoke, Elternabend, Pfandautomat.'], ['Foul, und jetzt?', 'Der Begriff ist weg, weiter mit dem nächsten.']]
    },
    blindmalen: {
      d: ['Beide sitzen sich gegenüber, schauen sich kurz an und bekommen dann die Augen verbunden. Jeder malt den anderen, der Spielleiter sagt nacheinander an: Kopf, Augen, Nase, Mund, Ohren, Frisur. Danach hält jeder sein Bild neben das Gesicht des anderen.', 'Gewonnen hat, wessen Porträt die Gäste per Applaus für ähnlicher halten.']
    },
    ballonblasen: {
      d: ['Beide stehen an derselben Linie, blasen einen Ballon so groß wie möglich auf und halten ihn zu, ohne Knoten. Auf „los“ lassen beide gleichzeitig los. Drei Runden.', 'Gewonnen hat, wessen Ballon in zwei von drei Runden weiter von der Linie entfernt landet.'],
      f: [['Er fliegt nach hinten?', 'Egal, gemessen wird die Entfernung zur Linie in jede Richtung.']]
    },
    selfie: {
      s: ['Drei Gäste schnappen und jedem eine {U} vom Kranz auf den Kopf legen. Dann ein Selfie mit allen vier Köpfen.', 'Geschafft, wenn das Foto nach 30 Sekunden im Kasten ist und auf jedem Kopf eine {U} liegt.'],
      d: ['Beide schnappen sich gleichzeitig drei Gäste und legen jedem eine {U} vom Kranz auf den Kopf. Dann ein Selfie mit allen vier Köpfen.', 'Gewonnen hat, wer dem Spielleiter zuerst ein Foto zeigt, auf dem jeder Kopf eine {U} trägt.'],
      f: [['Ein Gast ist schon vergeben?', 'Wer zuerst zugreift, hat ihn.']]
    },
    janein: {
      s: ['60 Sekunden lang Fragen beantworten, die die Gäste zurufen. Dabei nie „ja“ oder „nein“ sagen, auch nicht nicken oder den Kopf schütteln. Fangfragen sind ausdrücklich erwünscht.', 'Geschafft, wenn die ganze Minute ohne Ja und Nein klappt.'],
      d: ['Beide stehen nebeneinander vor den Gästen. Die Gäste feuern Fragen auf beide ab, schnell und gern hinterhältig. Nie „ja“ oder „nein“ sagen, nicht nicken, nicht den Kopf schütteln.', 'Gewonnen hat, wer nicht als Erster patzt.'],
      f: [['Was sind gute Fangfragen?', 'Schnell hintereinander: „Bist du sicher?“, „Hast du gerade ja gesagt?“, „Ist das dein Glas?“, „Echt jetzt?“']]
    },
    besenbalance: {
      d: ['Beide stellen einen Besen mit dem Stiel auf die flache Hand, Borsten nach oben. Alle zehn Sekunden ruft der Spielleiter eine Zusatzaufgabe: auf ein Bein, in die Hocke, einmal im Kreis drehen, Hand wechseln.', 'Gewonnen hat, wessen Besen länger oben bleibt.'],
      f: [['Es gibt nur einen Besen?', 'Dann nacheinander, der Spielleiter stoppt die Zeit.'], ['Darf man hinterherlaufen?', 'Ja, solange der Besen nicht den Boden berührt.']]
    },
    pennefaedeln: {
      s: ['Eine rohe Spaghetti zwischen die Zähne nehmen, Hände auf den Rücken. Drei Gäste halten in jeder Hand eine Penne hoch, mal hoch, mal tief, und lassen los, sobald sie aufgespießt ist.', 'Geschafft, wenn nach 45 Sekunden mindestens vier Penne auf der Spaghetti stecken.'],
      d: ['Beide nehmen eine rohe Spaghetti zwischen die Zähne, Hände auf den Rücken. Drei Gäste halten in jeder Hand eine Penne hoch und lassen los, sobald sie aufgespießt ist. Jeder darf jede Penne nehmen.', 'Gewonnen hat, wer zuerst drei Penne auf seiner Spaghetti hat.'],
      t: ['Ihr nehmt beide eine rohe Spaghetti zwischen die Zähne, Hände auf den Rücken. Ein Gast hält eine Penne hoch, einer von euch fädelt sie auf und lässt sie ohne Hände auf die Spaghetti des anderen rutschen.', 'Geschafft, wenn in 60 Sekunden drei Penne beim anderen angekommen sind.'],
      f: [['Und wenn die Spaghetti bricht?', 'Mit dem Rest weitermachen. Heruntergefallene Penne hält der Gast wieder hoch.']]
    },
    mehlschneiden: {
      s: ['Mehl fest in eine Tasse drücken, auf einen Teller stürzen und ein Gummibärchen obendrauf setzen. Dann vier Stücke vom Mehlberg abschneiden, jedes mindestens fingerbreit. Fällt das Gummibärchen, wird es mit dem Mund aus dem Mehl geholt.', 'Geschafft, wenn das Gummibärchen oben bleibt.'],
      d: ['Mehl fest in eine Tasse drücken, auf einen Teller stürzen, ein Gummibärchen obendrauf. Abwechselnd schneidet jeder ein Stück ab, mindestens fingerbreit. Wer das Gummibärchen zum Fallen bringt, holt es mit dem Mund aus dem Mehl.', 'Gewonnen hat, wer das Gummibärchen nicht zum Fallen bringt.'],
      f: [['Wie hält der Berg?', 'Das Mehl richtig fest in die Tasse drücken und mit einem Ruck stürzen.'], ['Was zählt als Stück?', 'Mindestens fingerbreit. Krümel zählen nicht.']]
    },
    loeffelnase: {
      s: ['Einen Löffel anhauchen und mit der Wölbung an die Nase hängen, Hände weg. Die Gäste dürfen alles tun, um zum Lachen zu bringen, nur nicht anfassen.', 'Geschafft, wenn der Löffel 20 Sekunden hängen bleibt.'],
      d: ['Beide hängen sich einen angehauchten Löffel an die Nase und schauen sich aus einem halben Meter in die Augen. Grimassen und Sprüche sind erlaubt, Anfassen nicht.', 'Gewonnen hat, wessen Löffel länger hängt.'],
      f: [['Der Löffel hält gar nicht?', 'Nase kurz trocken wischen und den Löffel anhauchen. Die Zeit läuft erst, wenn er hängt.']]
    },
    apfelschnur: {
      s: ['Ein Gast hält einen Apfel an der Schnur vor das Gesicht. Hände auf den Rücken und hineinbeißen.', 'Geschafft, wenn in 30 Sekunden ein Stück abgebissen ist.'],
      d: ['Ein Gast hält einen Apfel an der Schnur zwischen beide Gesichter. Beide nehmen die Hände auf den Rücken und beißen gleichzeitig zu.', 'Gewonnen hat, wer zuerst ein Stück abgebissen hat.'],
      t: ['Ein Gast hält einen Apfel an der Schnur zwischen eure Gesichter. Hände auf den Rücken, und ihr beißt gleichzeitig zu.', 'Geschafft, wenn in 45 Sekunden jeder von euch ein Stück abgebissen hat.'],
      f: [['Wie kommt der Apfel an die Schnur?', 'Am Stiel festknoten. Ohne Stiel einen Zahnstocher quer durchstecken und die Schnur daran binden.']]
    },
    stirnzettel: {
      s: ['Der Spielleiter klebt einen Zettel auf die Stirn, darauf eine Figur oder ein Promi, gern etwas Albernes wie Pumuckl, der Weihnachtsmann oder Shrek. Mit Ja-Nein-Fragen herausfinden, wer man ist.', 'Geschafft, wenn der Name in 60 Sekunden fällt.'],
      d: ['Beide bekommen vom Spielleiter einen Zettel auf die Stirn, gern etwas Albernes wie Pumuckl, der Weihnachtsmann oder Shrek. Abwechselnd stellt jeder eine Ja-Nein-Frage.', 'Gewonnen hat, wer zuerst richtig rät.'],
      f: [['Wer antwortet?', 'Alle, die zuschauen.']]
    },
    ballonsitzen: {
      s: ['Drei aufgeblasene Ballons liegen bereit. Einen nach dem anderen auf einen Stuhl legen und durch Draufsetzen platzen lassen.', 'Geschafft, wenn nach 30 Sekunden alle drei geplatzt sind.'],
      d: ['Für beide stehen ein Stuhl und drei aufgeblasene Ballons bereit. Gleichzeitig einen nach dem anderen durch Draufsetzen platzen lassen.', 'Gewonnen hat, wer zuerst alle drei zum Platzen gebracht hat.'],
      f: [['Wie prall aufblasen?', 'Normal. Zu pralle platzen sofort, halb volle gar nicht.']]
    },
    sockenturbo: {
      s: ['Auf einem Bein stehen und Socken übereinander über den freien Fuß ziehen, ohne sich festzuhalten. Berührt der Fuß den Boden, muss die oberste Socke wieder runter.', 'Geschafft, wenn nach 30 Sekunden 5 Socken drüber sind.'],
      d: ['Beide stehen auf einem Bein und ziehen gleichzeitig Socken übereinander über den freien Fuß, ohne sich festzuhalten. Berührt der Fuß den Boden, muss die oberste Socke wieder runter.', 'Gewonnen hat, wer nach 30 Sekunden mehr Socken am Fuß hat.']
    },
    pingpuste: {
      d: ['Beide knien an gegenüberliegenden Tischkanten, das Kinn auf der Tischplatte, der Tischtennisball liegt in der Mitte. Auf los pustet jeder ihn Richtung Gegner.', 'Gewonnen hat, wer den Ball zuerst zweimal über die Kante des anderen pustet.'],
      f: [['Und wenn er seitlich runterfällt?', 'Zählt nicht. Zurück in die Mitte und weiter.']]
    },
    wuerfelglueck: {
      d: ['Abwechselnd zwei Würfel in einer Tasse schütteln, die Tasse umgedreht auf den Tisch stellen, heimlich drunterschauen und eine Augensumme ansagen, die höher ist als die letzte. Lügen ist erlaubt, die Gäste dürfen mitgucken. Der andere glaubt es und würfelt weiter, oder er deckt auf.', 'Gewonnen hat beim Aufdecken der Ansager, wenn mindestens so viele Augen liegen wie angesagt, sonst der Zweifler.'],
      f: [['Was macht, wer glaubt?', 'Er nimmt die Tasse, würfelt neu, schaut heimlich und muss mehr ansagen als zuvor.'], ['Was, wenn jemand 12 ansagt?', 'Dann muss der andere aufdecken.']]
    },
    hulahoop: {
      s: ['Mit einem Gast nach Wahl in den Reifen steigen, nebeneinander, Hüfte an Hüfte, und ihn zusammen kreisen lassen. Drei Versuche, die Gäste zählen laut die Runden mit.', 'Geschafft, wenn der Reifen einmal drei Runden oben bleibt.'],
      d: ['Beide holen sich je einen Gast in den Reifen, nebeneinander, Hüfte an Hüfte. Die Paare sind nacheinander dran, je drei Versuche, die Gäste zählen laut mit.', 'Gewonnen hat das Paar mit den meisten Runden am Stück.'],
      t: ['Ihr steigt zusammen in den Reifen, nebeneinander, Hüfte an Hüfte, und lasst ihn gemeinsam kreisen. Drei Versuche, die Gäste zählen laut mit.', 'Geschafft, wenn der Reifen einmal drei Runden oben bleibt.']
    },
    laserparcours: {
      s: ['Ein paar Gäste spannen Klopapierbahnen kreuz und quer, hoch, tief und schräg, und halten die Enden fest. Von einer Seite auf die andere hindurchsteigen, ohne eine Bahn zu zerreißen.', 'Geschafft, wenn höchstens eine Bahn reißt.'],
      d: ['Ein paar Gäste spannen Klopapierbahnen kreuz und quer und halten die Enden fest. Beide steigen nacheinander hindurch, gerissene Bahnen werden dazwischen ersetzt.', 'Gewonnen hat, wer weniger Bahnen zerreißt, bei Gleichstand der Schnellere.'],
      f: [['Wie viele Bahnen?', 'Vier bis sechs, jede etwa zwei Meter lang.']]
    },
    seiltanz: {
      s: ['Fünfmal um die eigene Achse drehen, dann Ferse an Zehe eine 3 Meter lange Linie aus Klebeband entlanggehen. Am Ende mit geschlossenen Augen den Zeigefinger auf die Nasenspitze führen.', 'Geschafft, wenn höchstens ein Schritt neben die Linie geht und der Finger die Nase trifft.'],
      d: ['Zwei Linien aus Klebeband nebeneinander, je 3 Meter. Beide drehen sich fünfmal um die eigene Achse und gehen dann gleichzeitig Ferse an Zehe ihre Linie entlang. Wer danebentritt, muss zurück an den Anfang.', 'Gewonnen hat, wer zuerst am Ende seiner Linie ist.'],
      f: [['Und wenn jemand kippt?', 'Zwei Gäste stehen links und rechts als Leitplanke und fangen auf.']]
    },
    montagsmaler: {
      s: ['Der Spielleiter flüstert einen Begriff aus dem echten Leben, zum Beispiel Kater, Dönerbude, Bierbauch oder Schwiegermutter. Ihn zeichnen, ohne Worte, Zahlen oder Buchstaben. Alle anderen raten.', 'Geschafft, wenn der Begriff in 60 Sekunden erraten wird.'],
      d: ['Der Spielleiter flüstert beiden denselben Begriff, zum Beispiel Kater, Dönerbude oder Schwiegermutter. Die Gäste teilen sich in zwei Hälften, jeder zeichnet und zeigt sein Blatt nur seiner Hälfte. Keine Worte, Zahlen oder Buchstaben.', 'Gewonnen hat, wessen Hälfte den Begriff zuerst ruft.'],
      f: [['Mehr Ideen für Begriffe?', 'Pfandautomat, Taxi nach Hause, Schnarchen, Ballermann, Selfie, Mutti-Zettel.']]
    },
    stadtland: {
      s: ['Der Spielleiter nennt einen Buchstaben. Dazu laut eine Biermarke, ein Körperteil, eine Frucht, einen Kosenamen und einen Grund zum Schlussmachen rufen. Die Gäste entscheiden, was gilt.', 'Geschafft, wenn nach 30 Sekunden mindestens vier gelten.'],
      d: ['Der Spielleiter nennt einen Buchstaben und eine Kategorie: Biermarke, Körperteil, Frucht, Kosename oder Grund zum Schlussmachen. Wer zuerst etwas Passendes ruft, holt den Punkt. Die Gäste entscheiden, was gilt.', 'Gewonnen hat, wer zuerst drei Punkte hat.'],
      f: [['Welche Buchstaben?', 'Alle außer C, Q, X und Y.'], ['Zählt eine erfundene Biermarke?', 'Nur, wenn die Gäste sie glauben.'], ['Mehr Kategorien?', 'Schlagerstar, Cocktail, etwas aus dem Kühlschrank, Ausrede fürs Zuspätkommen.']]
    },
    koffer: {
      d: ['„Ich packe meinen Kater-Koffer und nehme mit …“ Was dazukommt, ruft jedes Mal ein Gast herein, zum Beispiel Rollmops, Sonnenbrille oder eine Ausrede für den Chef. Abwechselnd alles Bisherige in der richtigen Reihenfolge aufsagen und das Neue anhängen.', 'Gewonnen hat, wer sich nicht als Erster vertut oder länger als 5 Sekunden hängt.'],
      f: [['Wer denkt sich die Sachen aus?', 'Die Gäste, jedes Mal ein anderer. Je seltsamer, desto besser.']]
    },
    gefuehlsminute: {
      d: ['Augen zu, der Spielleiter startet die Stoppuhr. Beide rufen „Stopp“, sobald nach Gefühl 30 Sekunden um sind. Die Gäste zählen dabei laut und absichtlich falsch durcheinander.', 'Gewonnen hat, wer näher an 30 Sekunden liegt.'],
      f: [['Darf ich das „Stopp“ des anderen hören?', 'Ja. Wer sich davon verunsichern lässt, hat Pech.']]
    },
    besenhockey: {
      d: ['Ein Tischtennisball liegt in der Mitte, die Tore aus je zwei Schuhen stehen 4 Meter auseinander. Auf „los“ spielen beide mit dem Besen gegeneinander, die Hände bleiben am Stiel.', 'Gewonnen hat, wer zuerst zwei Tore fegt.']
    },
    zahnbuerstensprint: {
      d: ['Beide knien an der Startlinie und schieben gleichzeitig mit einer Zahnbürste je drei Kronkorken 2 Meter weit über eine Ziellinie. Nur die Borsten dürfen die Kronkorken berühren.', 'Gewonnen hat, wer zuerst alle drei über der Linie hat.']
    },
    lappenwurf: {
      s: ['Ein Gast deiner Wahl hält den Eimer und darf sich strecken und hechten, aber nicht vom Fleck gehen. Aus 3 Metern fünfmal den nassen Lappen werfen.', 'Geschafft, wenn er mindestens zweimal im Eimer landet.'],
      d: ['Jeder sucht sich einen Gast als Eimerhalter, der sich strecken, aber nicht vom Fleck gehen darf. Abwechselnd aus 3 Metern den nassen Lappen werfen, je fünf Würfe.', 'Gewonnen hat, wer öfter im Eimer landet.']
    },
    klinkenpolitur: {
      s: ['Augen verbinden, Lappen in die Hand. Drei Türklinken finden und polieren. Die Gäste rufen nur „warm“ oder „kalt“.', 'Geschafft, wenn alle drei in 60 Sekunden poliert sind.'],
      d: ['Beide gleichzeitig mit verbundenen Augen und Lappen. Jeder hat einen Gast als Lotsen, der nur „warm“ und „kalt“ rufen darf, alle anderen bleiben still.', 'Gewonnen hat, wer zuerst zwei verschiedene Türklinken poliert hat.']
    },
    klinkenblitz: {
      s: ['Drei Gäste nach Wahl verteilen sich im Raum und strecken eine Faust aus, das sind die Klinken. Jede mit dem Lappen polieren, bis der Gast „klack“ sagt. Die Klinken dürfen langsam davongehen.', 'Geschafft, wenn nach 30 Sekunden alle drei geklackt haben.'],
      d: ['Drei Gäste verteilen sich im Raum und strecken eine Faust aus, das sind die Klinken. Beide polieren gleichzeitig mit dem Lappen, und jede Klinke sagt nur einmal „klack“, und zwar zu dem, der sie blank bekommt. Die Klinken dürfen langsam davongehen.', 'Gewonnen hat, wer mehr Klinken zum Klacken bringt.'],
      f: [['Wann sagt die Klinke „klack“?', 'Wenn sie sich blank fühlt, spätestens nach fünf Sekunden Polieren.'], ['Darf die Klinke weglaufen?', 'Gehen ja, rennen nein.']]
    },
    blindfuettern: {
      s: ['Ein Gast deiner Wahl bekommt die Augen verbunden und füttert dich mit Gummibärchen. Hände hinter den Rücken, gelotst wird nur mit Worten.', 'Geschafft, wenn in 30 Sekunden 5 Gummibärchen gegessen sind.'],
      d: ['Beide werden gleichzeitig von je einem Gast ihrer Wahl mit verbundenen Augen gefüttert. Hände hinter den Rücken, gelotst wird nur mit Worten.', 'Gewonnen hat, wer zuerst 5 Gummibärchen gegessen hat.'],
      t: ['Einer von euch bekommt die Augen verbunden und füttert den anderen. Der hält die Hände hinter dem Rücken und lotst nur mit Worten.', 'Geschafft, wenn in 30 Sekunden 6 Gummibärchen gegessen sind.']
    },
    schuhspiel: {
      t: ['Ihr sitzt Rücken an Rücken, jeder hält einen eigenen Schuh und einen des anderen. Der Spielleiter stellt sechs Fragen wie „Wer braucht morgens länger im Bad?“, „Wer hat zuerst ‚Ich liebe dich‘ gesagt?“ oder „Wer gewinnt jeden Streit?“. Ihr hebt den Schuh der Person, die gemeint ist.', 'Geschafft, wenn ihr bei mindestens 4 Fragen dieselbe Person meint.']
    },
    kennstdu: {
      s: ['Der Spielleiter stellt drei Fragen über deinen Schatz, etwa: Was bestellt er oder sie beim Döner, welche Serie läuft heimlich, wie lange dauert es morgens im Bad? Der Schatz bestätigt, beim JGA per Anruf auf Lautsprecher.', 'Geschafft, wenn mindestens 2 Antworten stimmen.'],
      f: [['Und wenn beim JGA keiner rangeht?', 'Dann entscheiden die Gäste, die das Paar am besten kennen.']]
    },
    staendchen: {
      s: ['Einen Schluck Wasser in den Mund nehmen, Kopf in den Nacken und „Happy Birthday“ gurgeln, eine ganze Strophe. Die Gäste dürfen Grimassen schneiden, aber nicht anfassen.', 'Geschafft, wenn die Strophe erkennbar durchkommt, ohne zu schlucken oder zu prusten.'],
      d: ['Beide nehmen einen Schluck Wasser in den Mund und gurgeln nebeneinander gleichzeitig „Happy Birthday“, Strophe für Strophe. Die Gäste dürfen Grimassen schneiden, aber nicht anfassen.', 'Gewonnen hat, wer länger gurgelt, ohne zu schlucken oder zu prusten.'],
      f: [['Ist Schlucken erlaubt?', 'Nein. Wer schluckt, hat verloren.']]
    },
    schachtelkegeln: {
      s: ['Sechs Schachteln zu einer Pyramide stapeln. Mit dem Rücken zur Pyramide aus 4 Metern den Ball durch die eigenen Beine rollen, zwei Würfe.', 'Geschafft, wenn danach mindestens vier Schachteln liegen.'],
      d: ['Jeder hat eine Pyramide aus sechs Schachteln. Mit dem Rücken zur Pyramide aus 4 Metern den Ball durch die eigenen Beine rollen, je zwei Würfe.', 'Gewonnen hat, wer mehr Schachteln umwirft.']
    },
    daumenblitz: {
      d: ['Das Handy liegt zwischen euch, jeder hat die Hälfte mit seinem Namen. Der Spielleiter tippt in der Mitte auf „Runde starten“. Sobald die Fläche grün wird, auf die eigene Hälfte drücken, wer vorher drückt, verliert die Runde.', 'Gewonnen hat, wer zuerst zwei Runden holt.'],
      f: [['Gegen wen spiele ich?', 'Gegen die andere Hauptperson oder einen Gast. Mit Gästeliste sucht ihr ihn aus oder lasst das Rad entscheiden.'], ['Was zählt als zu früh?', 'Jeder Druck, bevor die Fläche grün ist.'], ['Beide fast gleichzeitig?', 'Das Handy entscheidet auf die Millisekunde.']]
    },
    lippenlesen: {
      s: ['Ein Gast deiner Wahl hält dir die Ohren zu. Ein anderer Gast spricht den Satz aus der App lautlos, aber deutlich vor. Jeden Rateversuch laut aussprechen, auch die schiefen.', 'Geschafft, wenn der Satz in 90 Sekunden im Kern erraten ist.'],
      t: ['Gäste eurer Wahl halten euch beiden die Ohren zu. Ein Gast spricht den Satz aus der App lautlos vor, ihr ratet laut und gemeinsam.', 'Geschafft, wenn ihr den Satz in 90 Sekunden im Kern erratet.'],
      f: [['Was heißt im Kern?', 'Die wichtigen Wörter stimmen. Kleinkram wie „der“ oder „und“ ist egal.'], ['Darf der Sprecher wiederholen?', 'So oft er will, aber ohne Ton.']]
    },
    gedankenleser: {
      s: ['Such dir jemanden aus, der deine Gedanken lesen kann. Die App zeigt eine Kategorie mit vier Begriffen: Du tippst heimlich einen an, dann tippt dein Partner, ohne deinen zu sehen. Vor dem Aufdecken rufen die Gäste ihren Tipp.', 'Geschafft, wenn ihr in mindestens drei von fünf Runden dasselbe wählt.'],
      f: [['Darf man sich absprechen?', 'Nein, kein Wort, kein Zwinkern.'], ['Wer hält das Handy?', 'Erst du, dann gibst du es verdeckt weiter.'], ['Wen nimmt man am besten?', 'Den, der behauptet, dich am besten zu kennen. Jetzt muss er es beweisen.']]
    },
    ketchup: {
      d: ['Zwei Zweierteams. Einer malt mit Ketchup auf einen Teller, der andere rät, weggewischt wird mit dem Finger. Die App zeigt dem Maler die Begriffe, jedes Team hat 90 Sekunden.', 'Gewonnen hat das Team mit mehr erratenen Begriffen.'],
      f: [['Darf man Buchstaben malen?', 'Nein, nur Bilder.'], ['Ein Begriff ist zu schwer?', 'Überspringen geht, kostet aber Zeit.'], ['Was gilt bei Gleichstand?', 'Dann ist niemand dran.']]
    },
    kuechenwaage: {
      d: ['Drei Gäste legen je ein Ding auf den Tisch, zum Beispiel einen Schuh, einen Schlüsselbund und eine Handtasche. Beide nennen nacheinander ihren Tipp in Gramm, dann kommt das Ding auf die Küchenwaage.', 'Gewonnen hat, wer öfter näher dran liegt.'],
      f: [['Darf man die Dinge anheben?', 'Ja, einmal kurz.'], ['Darf der Zweite einfach ein Gramm mehr sagen?', 'Ja. Frech, aber erlaubt.']]
    },
    pfannenprofi: {
      s: ['Einen Bierdeckel in die Pfanne legen, wie einen Pfannkuchen hochwerfen und wieder auffangen. Nach jedem Treffer kommt ein Deckel dazu. Fünf Würfe.', 'Geschafft, wenn drei Deckel auf einmal in der Pfanne landen.'],
      d: ['Abwechselnd wirft jeder Bierdeckel aus der Pfanne hoch und fängt sie wieder auf. Wer trifft, nimmt beim nächsten Wurf einen Deckel mehr. Je fünf Würfe.', 'Gewonnen hat, wer die meisten Deckel auf einmal gefangen hat.'],
      f: [['Müssen sich die Deckel drehen?', 'Nein, auffangen reicht. Wer dabei wendet, bekommt Applaus.'], ['Einer fällt daneben?', 'Dann zählt der Wurf nicht, und es bleibt bei gleich vielen Deckeln.'], ['Was gilt bei Gleichstand?', 'Ein Wurf mehr für beide.']]
    },
    tastbeutel: {
      d: ['Ein Gast füllt einen Kissenbezug mit zehn Dingen aus den Taschen der Gäste, zum Beispiel Schlüssel, Lippenpflege, Feuerzeug. Beide stecken je eine Hand hinein, der Gast ruft ein Ding, und wer es zuerst herauszieht, bekommt den Punkt. Fünf Runden.', 'Gewonnen hat, wer mehr Punkte holt.'],
      f: [['Darf man hineinschauen?', 'Nein, der Beutel bleibt oben zu, nur die Hände sind drin.'], ['Darf man die andere Hand wegschieben?', 'Schieben ja, festhalten nein.']]
    },
    sockenkegeln: {
      s: ['Sechs Becher stehen drei Meter entfernt als Kegel am Boden. Mit dem Rücken zu ihnen hinstellen, vorbeugen und zusammengeknüllte Socken durch die Beine nach hinten werfen. Drei Würfe.', 'Geschafft, wenn danach mindestens vier Becher liegen.'],
      d: ['Sechs Becher stehen drei Meter entfernt als Kegel. Nacheinander stellen sich beide mit dem Rücken dazu und werfen drei Socken durch die Beine nach hinten, danach werden die Becher neu aufgestellt.', 'Gewonnen hat, wer mehr Becher umwirft.'],
      f: [['Darf man zielen?', 'Ja, aber nur kopfüber durch die Beine schauen.']]
    },
    sockenpost: {
      s: ['Fünf Gäste schreiben heimlich einen Dating-Tipp für dich auf einen Zettel und stecken ihn in eine Socke. Drei Socken ziehen, laut vorlesen und raten, von wem der Tipp ist.', 'Geschafft, wenn zwei von drei richtig zugeordnet sind.'],
      f: [['Was ist ein guter Tipp?', 'Frech und ehrlich, zum Beispiel: Profilbild ohne Bierglas. Gemeines bleibt in der Tasche.'], ['Nur zwei Gäste machen mit?', 'Dann reichen zwei Zettel, und beide müssen stimmen.']]
    },
    schachtelpost: {
      s: ['Fünf Gäste schreiben heimlich einen Dating-Tipp für dich auf einen Zettel und legen ihn in eine Schachtel. Drei Schachteln öffnen, laut vorlesen und raten, von wem der Tipp ist.', 'Geschafft, wenn zwei von drei richtig zugeordnet sind.'],
      f: [['Was ist ein guter Tipp?', 'Frech und ehrlich, zum Beispiel: Profilbild ohne Hund, sonst schreiben alle nur dem Hund. Gemeines bleibt in der Tasche.'], ['Nur zwei Gäste machen mit?', 'Dann reichen zwei Zettel, und beide müssen stimmen.']]
    },
    schachtelstaffel: {
      s: ['Ein Gast klemmt dir fünf Schachteln ein: eine unters Kinn, je eine unter die Arme, eine zwischen die Knie, eine auf den Kopf. Dann ohne Hände einmal um den Tisch watscheln.', 'Geschafft, wenn mindestens vier Schachteln mit zurückkommen.'],
      d: ['Ein Gast klemmt beiden je fünf Schachteln ein: unters Kinn, unter die Arme, zwischen die Knie, auf den Kopf. Dann watscheln beide gleichzeitig ohne Hände um den Tisch. Was fällt, bleibt liegen.', 'Gewonnen hat, wer mit mehr Schachteln zurückkommt, bei Gleichstand, wer zuerst da ist.'],
      f: [['Wie groß sollen die Schachteln sein?', 'Klein genug für unters Kinn: Tee, Zahnpasta, Streichhölzer.']]
    },
    schachtelkritzel: {
      s: ['Der Spielleiter flüstert dir einen Gast zu. In 30 Sekunden diesen Gast mit der schwächeren Hand auf eine Schachtel malen, dann raten alle, wer es ist.', 'Geschafft, wenn der Gast in 20 Sekunden erkannt wird.'],
      d: ['Der Spielleiter flüstert beiden je einen anderen Gast zu. Beide malen ihren Gast in 30 Sekunden mit der schwächeren Hand auf eine Schachtel und halten sie gleichzeitig hoch.', 'Gewonnen hat, wessen Gast zuerst erraten wird.'],
      f: [['Darf man Buchstaben malen?', 'Nein. Brille, Bart, Frisur, Lieblingsglas: alles erlaubt, nur keine Buchstaben.']]
    },
    schachtelhut: {
      s: ['In 60 Sekunden aus Schachteln und Klebeband einen Hut bauen und aufsetzen. Er bleibt bis zum nächsten Spiel auf dem Kopf.', 'Geschafft, wenn der Hut zehn Sekunden hält, ohne dass du ihn festhältst.'],
      d: ['Beide bauen in 60 Sekunden aus Schachteln und Klebeband je einen Hut und setzen ihn auf. Beide Hüte bleiben bis zum nächsten Spiel auf dem Kopf.', 'Gewonnen hat, wessen Hut höher ist und zehn Sekunden ohne Festhalten hält.'],
      f: [['Darf Klebeband an die Haare?', 'Nein, nur an die Schachteln. Halten muss der Hut von allein.']]
    },
    besenkaraoke: {
      s: ['Ein Gast spielt am Handy einen Partyhit, den alle kennen, und dreht mitten im Lied den Ton weg. Du singst ins Besen-Mikro weiter, bis der Ton nach etwa zehn Sekunden zurückkommt. Die Gäste singen nicht mit.', 'Geschafft, wenn du dann noch an derselben Stelle bist wie das Lied.'],
      d: ['Abwechselnd, jeder mit eigenem Lied: Ein Gast spielt am Handy einen Partyhit und dreht mitten im Lied den Ton weg. Wer dran ist, singt ins Besen-Mikro weiter, bis der Ton nach etwa zehn Sekunden zurückkommt.', 'Gewonnen hat, wer beim Wiedereinsetzen näher an der richtigen Stelle ist; das entscheiden die Gäste.'],
      f: [['Welche Lieder?', 'Was jeder mitgrölen kann: Atemlos, Country Roads, Ein Stern.'], ['Zählt schiefes Singen?', 'Nein, nur die Stelle im Lied.']]
    },
    kehrblechgolf: {
      s: ['Das Kehrblech liegt zwei Meter entfernt flach auf dem Boden. Mit dem Handfeger drei Kronkorken nacheinander so anschieben, dass sie darauf liegen bleiben.', 'Geschafft, wenn am Ende mindestens einer auf dem Kehrblech liegt.'],
      d: ['Das Kehrblech liegt zwei Meter entfernt. Abwechselnd schieben beide je drei Kronkorken mit dem Handfeger darauf zu. Die Kronkorken des anderen wegzuschießen ist ausdrücklich erlaubt.', 'Gewonnen hat, wer am Ende mehr Kronkorken auf dem Kehrblech hat.'],
      f: [['Wie unterscheidet man die Kronkorken?', 'Jeder nimmt eine andere Biermarke.']]
    },
    fegeorakel: {
      s: ['30 Sekunden lang die unterste Stufe sauber fegen. Die Gäste werfen in der Zeit Kronkorken nach, aber nur auf die Stufe.', 'Geschafft, wenn danach höchstens fünf Kronkorken auf der Stufe liegen.'],
      d: ['Die unterste Stufe wird in zwei Hälften geteilt, jeder fegt seine. 30 Sekunden lang werfen die Gäste Kronkorken nach, auf welche Hälfte sie wollen.', 'Gewonnen hat, wer danach weniger Kronkorken auf seiner Hälfte hat.'],
      f: [['Nur ein Besen da?', 'Dann fegt der andere mit dem Handfeger. Wer was bekommt, entscheidet eine Münze.'], ['Dürfen die Gäste parteiisch werfen?', 'Ja. Genau darum geht es.']]
    },
    kehrblechcatch: {
      s: ['Einen Tischtennisball mit dem Kehrblech immer wieder hochtippen, ohne dass er den Boden berührt.', 'Geschafft, wenn er zehnmal in Folge hochgetippt wird.'],
      d: ['Beide stehen zwei Meter auseinander und spielen sich mit dem Kehrblech als Schläger einen Tischtennisball zu, ohne Tisch und ohne Aufsetzer. Wer den Ball fallen lässt oder unerreichbar wegschlägt, verliert den Ballwechsel.', 'Gewonnen hat, wer zuerst drei Ballwechsel holt.'],
      f: [['Nur ein Kehrblech da?', 'Dann spielt der andere mit einer Pfanne.']]
    },
    korkenflip: {
      s: ['Die Hand an die Schulter legen, der Ellbogen zeigt nach vorne. Kronkorken auf den Unterarm kurz vor dem Ellbogen legen, den Arm blitzschnell nach unten reißen und alle mit derselben Hand fangen. Start mit drei, nach jedem Treffer zwei mehr.', 'Geschafft, wenn mit höchstens drei Fehlversuchen sieben auf einmal gefangen werden.'],
      d: ['Abwechselnd Kronkorken vom Ellbogen fangen, beide starten mit drei. Nach jeder Runde kommt einer dazu.', 'Gewonnen hat, wer nicht als Erster einen Kronkorken fallen lässt.'],
      f: [['Darf die andere Hand helfen?', 'Nein, es fängt nur die Hand, deren Arm geworfen hat.']]
    },
    lappenbalance: {
      s: ['Einen nassen Schwamm auf den Kopf legen und nicht festhalten. Zur Tür, raus, die Klinke von außen putzen, wieder rein, die Klinke von innen putzen, zurück zum Start. Fällt der Schwamm, geht es am Start neu los.', 'Geschafft, wenn es in 45 Sekunden klappt.'],
      d: ['Beide legen einen nassen Schwamm auf den Kopf und starten gleichzeitig durch dieselbe Tür: raus, Klinke von außen putzen, wieder rein, Klinke von innen putzen, zurück zum Start. Wem der Schwamm fällt, der fängt am Start neu an.', 'Gewonnen hat, wer zuerst wieder am Start ist.'],
      f: [['Wie nass?', 'So nass, dass er tropft. Ein Handtuch für danach bereitlegen.'], ['Kein zweiter Schwamm?', 'Ein nasser Lappen geht genauso.']]
    },
    eimerhelm: {
      d: ['Beide stülpen sich einen Eimer über den Kopf und halten einen nassen Lappen in der Hand. Die Gäste bilden einen engen Kreis und schieben sanft zurück, wer an den Rand kommt. Gehen, nicht rennen.', 'Gewonnen hat, wer den anderen zuerst mit dem Lappen berührt.'],
      f: [['Nur ein Eimer da?', 'Dann trägt der andere eine Augenbinde.'], ['Darf man unter dem Eimer durchlinsen?', 'Nein. Wer erwischt wird, hat verloren.']]
    },
    kerzenzwei: {
      s: ['Fünf Teelichter brennen in einer Reihe. Mit einem einzigen Pusten genau zwei auslöschen, nicht mehr und nicht weniger. Drei Versuche.', 'Geschafft, wenn es einmal genau zwei sind.'],
      d: ['Neun Teelichter brennen in einer Reihe. Abwechselnd pustet jeder einmal, dabei müssen eins oder zwei ausgehen. Wer drei oder mehr auf einmal erwischt, hat sofort verloren.', 'Gewonnen hat, wer nicht das letzte Teelicht auspusten muss.'],
      f: [['Geht beim Pusten keins aus?', 'Dann gleich noch einmal pusten.'], ['Darf man von der Seite pusten?', 'Ja, von wo man will. Nur anfassen ist verboten.']]
    },
    erstemale: {
      s: ['Drei Gäste, die wollen, nennen je ein erstes Mal der Hauptperson, ohne das Alter zu verraten: der erste Kater, die erste Dauerwelle, der erste Blechschaden. Die Hauptperson sagt, wie alt sie damals war, dann löst der Erzähler auf.', 'Geschafft, wenn zwei von drei auf ein Jahr genau stimmen.'],
      d: ['Ein Gast nennt ein erstes Mal der Hauptperson. Beide rufen auf drei gleichzeitig, wie alt sie damals war, dann löst der Erzähler auf. Drei Runden.', 'Gewonnen hat, wer öfter näher dran liegt.'],
      f: [['Den Gästen fällt nichts ein?', 'Erster Kater, erste Fahrstunde, erster Liebesbrief, erste Zigarette hinterm Schuppen, erstes Mal Hausarrest.'], ['Der Erzähler weiß es selbst nicht genau?', 'Dann gilt, was er sagt. Widerspruch aus dem Publikum ist erwünscht.']]
    },
    geschenkorakel: {
      s: ['Ein Gast reicht sein noch verpacktes Geschenk. Schütteln, wiegen, horchen, aber nicht auspacken, dann drei Tipps abgeben. Der Gast antwortet nur mit „warm“ oder „kalt“.', 'Geschafft, wenn das Geschenk vor dem Auspacken erraten ist.'],
      d: ['Ein Gast, der nicht mitspielt, reicht sein noch verpacktes Geschenk. Beide dürfen schütteln, aber nicht öffnen, und raten abwechselnd. Der Schenkende sagt nur „warm“ oder „kalt“.', 'Gewonnen hat, wer es zuerst errät.'],
      f: [['Alles schon ausgepackt?', 'Dann wickelt ein Gast heimlich etwas aus der Küche in Alufolie.']]
    },
    ringsuche: {
      d: ['Beide stellen sich mit je zwei Gästen ihrer Wahl in eine Reihe, alle mit einem Strohhalm im Mund. Ein Gummiring, der Ehering, wandert ohne Hände von Halm zu Halm bis ans Ende. Fällt er, geht er zurück an den Anfang.', 'Gewonnen hat, wessen Reihe den Ring zuerst ans Ende bringt.'],
      t: ['Jeder von euch nimmt einen Strohhalm in den Mund. Ein Gummiring ist der Ehering und wandert ohne Hände von Halm zu Halm, hin und zurück. Fällt er, beginnt das Zählen von vorn.', 'Geschafft, wenn der Ring in 60 Sekunden sechsmal den Halm wechselt.'],
      f: [['Darf man mit der Hand nachhelfen?', 'Nein. Fällt der Ring, wird er neu auf den ersten Halm gelegt.']]
    },
    blindfuehren: {
      d: ['Beide tragen eine Augenbinde und starten in gegenüberliegenden Ecken. Je ein Gast ihrer Wahl lotst sie nur mit der Stimme zum selben Stuhl, alle anderen rufen falsche Kommandos dazwischen. Gehen, nicht rennen.', 'Gewonnen hat, wer zuerst auf dem Stuhl sitzt.'],
      t: ['Einer von euch trägt die Augenbinde, der andere lotst nur mit der Stimme einmal um den Tisch und zurück auf den Stuhl. Alle Gäste rufen gleichzeitig falsche Kommandos dazwischen.', 'Geschafft, wenn die blinde Person in 60 Sekunden sitzt, ohne etwas umzuwerfen.'],
      f: [['Was dürfen die Gäste rufen?', 'Alles, nur nicht anfassen. Am gemeinsten ist es, die Stimme des Lotsen nachzumachen.']]
    },
    korkenkehren: {
      d: ['Abwechselnd kehrt jeder 20 Kronkorken mit Handfeger und Kehrblech auf, 30 Sekunden lang. Der andere darf in der Zeit fünf weitere einzeln nachwerfen.', 'Gewonnen hat, bei wem nach 30 Sekunden weniger Kronkorken auf dem Boden liegen.'],
      t: ['Ihr kehrt 20 Kronkorken zusammen, einer mit dem Besen, der andere hält das Kehrblech. Ein Gast eurer Wahl darf in den ersten 30 Sekunden fünf weitere einzeln nachwerfen.', 'Geschafft, wenn nach 45 Sekunden kein Kronkorken mehr auf dem Boden liegt.'],
      f: [['Wo dürfen die Nachwürfe landen?', 'Nur auf dem Boden, nicht im Kehrblech und nicht auf der Person.']]
    },
    ersterdate: {
      s: ['Drei Fragen zum ersten Date verdeckt beantworten: Wer hat sich zuerst gemeldet? Wer hat bezahlt? Was hatte der andere an? Dann sagt der Partner seine Antworten laut, und der Zettel wird umgedreht.', 'Geschafft, wenn mindestens zwei Antworten übereinstimmen.'],
      t: ['Ihr beantwortet beide verdeckt dieselben drei Fragen: Wer hat sich zuerst gemeldet? Wer hat bezahlt? Was hatte der andere an? Bei jeder Frage dreht ihr die Zettel gleichzeitig um.', 'Geschafft, wenn mindestens zwei Antworten übereinstimmen.'],
      f: [['Wer entscheidet, ob es übereinstimmt?', 'Die Gäste, per Zuruf.']]
    },
    schwiegerquiz: {
      s: ['Drei Fragen über die Schwiegereltern: Wann hat die Schwiegermutter Geburtstag? Was trinkt der Schwiegervater am liebsten? Wo haben sich die beiden kennengelernt? Die Schwiegereltern sagen, ob es stimmt.', 'Geschafft, wenn zwei von drei Antworten stimmen.'],
      d: ['Abwechselnd beantwortet jeder dieselben drei Fragen über die eigenen Schwiegereltern: Geburtstag der Schwiegermutter, Lieblingsgetränk des Schwiegervaters, wo die beiden sich kennengelernt haben. Die Schwiegereltern sagen, ob es stimmt.', 'Gewonnen hat, wer mehr richtig hat; bei Gleichstand entscheidet die Schuhgröße des Schwiegervaters.'],
      f: [['Die Schwiegereltern sind nicht da?', 'Dann anrufen, auf Lautsprecher.'], ['Gegen einen Gast?', 'Dann beantwortet der Gast die Fragen über dieselben Schwiegereltern. Wer mehr weiß, gewinnt.']]
    },
    ballonstrauss: {
      d: ['Beide blasen gleichzeitig drei Ballons auf, knoten sie zu und binden sie mit Schnur zu einem Strauß. Wer fertig ist, wirft ihn rückwärts über die Schulter zu den Gästen.', 'Gewonnen hat, wessen Strauß zuerst gefangen wird, ohne auseinanderzufallen.'],
      t: ['Einer von euch bläst drei Ballons auf, der andere knotet und bindet sie mit Schnur zu einem Strauß. Dann wirft einer ihn rückwärts über die Schulter zu den Gästen.', 'Geschafft, wenn der Strauß in 60 Sekunden fertig ist und ganz bei einem Gast ankommt.']
    },
    haenderaten: {
      s: ['Augen verbinden. Der Partner und vier Gäste, die wollen, halten nacheinander eine Hand hin, die Reihenfolge bestimmt der Spielleiter. Jede Hand zehn Sekunden ertasten, danach einmal tippen.', 'Geschafft, wenn der Tipp die Hand des Partners ist.'],
      f: [['Darf der Partner den Ring abnehmen?', 'Ja. Und ein Gast darf ihn anziehen.']]
    },
    stummeliebe: {
      s: ['Ohne ein Wort drei Macken des Partners vorspielen, zum Beispiel Schnarchen, Einparken oder die Socken, die immer irgendwo liegen. Der Partner rät, welche gemeint ist.', 'Geschafft, wenn der Partner in 60 Sekunden zwei der drei Macken erkennt.'],
      t: ['Abwechselnd spielt einer von euch ohne Worte eine Macke des anderen vor, der andere rät. Drei Macken pro Person.', 'Geschafft, wenn in 90 Sekunden mindestens vier Macken erkannt sind.'],
      f: [['Der andere will seine Macke nicht erkennen?', 'Dann entscheiden die Gäste, ob sie gemeint war.']]
    },
    partnerstimme: {
      s: ['Der Spielleiter gibt eine Frage an den Partner vor, zum Beispiel: Was rettest du zuerst, wenn die Wohnung brennt? Was bestellst du beim Italiener? Die Antwort vorher verdeckt aufschreiben, dann den Partner auf Lautsprecher anrufen und fragen.', 'Geschafft, wenn der Partner sinngemäß dasselbe sagt.'],
      d: ['Beide schreiben verdeckt auf, was der Partner auf die Frage des Spielleiters antworten wird. Dann wird der Partner auf Lautsprecher angerufen und gefragt.', 'Gewonnen hat, wer näher dran ist; die Gäste entscheiden.'],
      f: [['Der Partner geht nicht ran?', 'Dann entscheidet ein Gast, der den Partner gut kennt, was er gesagt hätte.']]
    },
    becherblind: {
      d: ['Beide stapeln gleichzeitig mit verbundenen Augen sechs Becher zu einer Pyramide, unten drei, dann zwei, oben einer. Jeder sucht sich einen Gast als Lotsen, der nur reden darf, nicht anfassen.', 'Gewonnen hat, wessen Pyramide zuerst steht.'],
      f: [['Die Pyramide fällt um?', 'Weiterbauen, die Zeit läuft.']]
    },
    nachrichtenwette: {
      s: ['Jemanden anrufen, der nichts ahnt, am besten den Partner, auf Lautsprecher. Der Spielleiter flüstert ein Wort, zum Beispiel Kartoffelsalat, Bausparvertrag oder Zahnseide. Den Angerufenen dazu bringen, das Wort zu sagen, ohne es selbst zu sagen.', 'Geschafft, wenn das Wort in 60 Sekunden fällt.'],
      d: ['Beide rufen nacheinander jemanden an, der nichts ahnt, auf Lautsprecher: den Partner, die Mutter oder den besten Freund. Jeder bekommt vom Spielleiter ein eigenes Wort und muss den Angerufenen dazu bringen, es zu sagen.', 'Gewonnen hat, wer sein Wort schneller hört.'],
      f: [['Keiner geht ran?', 'Dann die nächste Nummer. Die Zeit läuft erst, wenn jemand rangeht.'], ['Was ist erlaubt?', 'Alles außer dem Wort selbst und Teilen davon.']]
    },
    stimmenorakel: {
      s: ['Augen verbinden. Drei Gäste, die wollen, sagen nacheinander mit verstellter Stimme: „Ich hab dein Bier ausgetrunken.“ Nach jeder Stimme tippen, wer es war.', 'Geschafft, wenn zwei von drei erkannt werden.'],
      d: ['Beide hören mit verbundenen Augen dieselben drei Stimmen und flüstern nach jeder ihren Tipp dem Spielleiter.', 'Gewonnen hat, wer mehr Stimmen erkennt; bei Gleichstand kommt eine vierte.']
    },
    letztesfoto: {
      d: ['Beide öffnen ihre Fotogalerie, der Gegner nennt eine Zahl zwischen 10 und 50. So viele Fotos zurückzählen, das Bild herumzeigen und in einem Satz sagen, was da los war. Einmal neu ziehen ist erlaubt.', 'Gewonnen hat, wessen Foto den größeren Lacher holt; im Zweifel entscheidet der Applaus.']
    },
    pendelkegeln: {
      s: ['Einen Apfel in eine lange Socke stecken und die Socke hinten in den Hosenbund klemmen, sodass der Apfel zwischen den Beinen baumelt. Nur mit Hüftschwung fünf leere Flaschen auf dem Boden umstoßen, Hände hinter den Rücken.', 'Geschafft, wenn nach 60 Sekunden alle fünf liegen.'],
      d: ['Beide klemmen sich eine Socke mit Apfel hinten in den Hosenbund, der Apfel baumelt zwischen den Beinen. Jeder hat fünf leere Flaschen vor sich und stößt sie nur mit Hüftschwung um, Hände hinter den Rücken.', 'Gewonnen hat, wer zuerst alle fünf umgestoßen hat.'],
      f: [['Darf man in die Knie gehen?', 'Ja, alles außer Händen und Füßen ist erlaubt.'], ['Die Socke rutscht raus?', 'Wieder reinklemmen, die Zeit läuft weiter.']]
    },
    sockenklauen: {
      d: ['Beide ziehen die Schuhe aus und knien sich auf einen Teppich oder eine Decke, Socken an. Auf „los“ versucht jeder, dem anderen beide Socken auszuziehen und die eigenen zu behalten. Aufstehen ist verboten.', 'Gewonnen hat, wer zuerst beide Socken des anderen in der Hand hat.'],
      f: [['Was ist erlaubt?', 'Ziehen, Wegrollen, Füße unter den Hintern klemmen. Kein Kratzen, kein Kitzeln an den Rippen.'], ['Barfuß gekommen?', 'Dann leiht der Spielleiter zwei Socken aus dem Kranz oder vom nächsten Gast.']]
    },
    zeitungsfechten: {
      d: ['Jeder rollt eine Zeitung zu einem Degen. Die freie Hand bleibt auf dem Rücken, die Füße bleiben auf einer Linie, vor und zurück ist erlaubt. Getroffen werden darf nur unterhalb der Hüfte.', 'Gewonnen hat, wer zuerst drei Treffer setzt.'],
      f: [['Wer zählt die Treffer?', 'Die Gäste rufen laut mit. Im Zweifel zählt der Treffer, den mehr gesehen haben.'], ['Gleichzeitig getroffen?', 'Zählt für keinen.']]
    },
    rotehaende: {
      d: ['Einer legt seine Hände mit den Handflächen nach unten auf die offenen Handflächen des anderen. Der untere versucht, blitzschnell auf die Handrücken des oberen zu schlagen, der obere zieht weg. Bei einem Treffer bleibt der untere dran, bei einem Fehlschlag wird getauscht.', 'Gewonnen hat, wer zuerst fünf Treffer landet.'],
      f: [['Und wenn der Obere zuckt, ohne dass geschlagen wird?', 'Zuckt er zweimal hintereinander, bekommt der Untere einen Treffer geschenkt.'], ['Wie fest?', 'Ein Klaps, kein Schlag. Der Raum hört es trotzdem.']]
    },
    gummigrimasse: {
      s: ['Einen Gummiring so über den Kopf ziehen, dass er quer über Nase und Oberlippe sitzt. Ohne Hände, nur mit Grimassen, bis unter das Kinn schieben.', 'Geschafft, wenn er nach 45 Sekunden unter dem Kinn ist.'],
      d: ['Beide ziehen sich einen Gummiring über den Kopf, sodass er quer über Nase und Oberlippe sitzt. Ohne Hände, nur mit Grimassen, gleichzeitig bis unter das Kinn schieben.', 'Gewonnen hat, wessen Gummi zuerst unter dem Kinn ist.'],
      f: [['Welche Gummis?', 'Große Haushaltsgummis oder Haargummis ohne Metall. Brille vorher ab.'], ['Darf man die Schultern benutzen?', 'Nein, nur das Gesicht.']]
    },
    sockenschlacht: {
      d: ['Ein Tisch oder Sofa ist die Grenze, jeder hat seine Seite und zehn zusammengeknüllte Socken. 30 Sekunden lang wirft jeder die Socken, die bei ihm landen, so schnell wie möglich zurück.', 'Gewonnen hat, wer nach 30 Sekunden weniger Socken auf seiner Seite hat.'],
      f: [['Darf man Socken fangen?', 'Ja, und sofort zurückwerfen.'], ['Wer zählt?', 'Die Gäste, laut und gemeinsam.']]
    },
    schachtelskates: {
      d: ['Beide stecken die Füße in zwei leere Schachteln und schlurfen damit einmal um den Tisch, gleichzeitig in entgegengesetzte Richtungen. Wer eine Schachtel verliert, schlüpft an der Stelle wieder hinein.', 'Gewonnen hat, wer zuerst wieder am Start ist.'],
      f: [['Und unterwegs?', 'Aneinander vorbei müsst ihr beide. Schubsen ist verboten, Ausweichen nicht.']]
    },
    schachtelmauer: {
      d: ['Jeder baut in 30 Sekunden aus sechs Schachteln eine Mauer vor sich. Dann knüllt jeder drei Zeitungsbälle und wirft abwechselnd aus 3 Metern auf die Mauer des anderen.', 'Gewonnen hat, wessen Mauer danach mehr stehende Schachteln hat.'],
      f: [['Muss die Mauer gerade sein?', 'Nein, nur stehen. Wer schlau baut, baut breit.']]
    },
    besentauziehen: {
      d: ['Ein Streifen Klebeband auf dem Boden ist die Mitte. Beide halten denselben Besen, jeder an einem Ende, und stehen auf einem Bein. Auf „los“ zieht jeder den anderen über die Linie.', 'Gewonnen hat, wer zuerst zwei Runden holt. Wer das zweite Bein absetzt, verliert die Runde.'],
      f: [['Darf man loslassen?', 'Ja, aber wer loslässt, verliert die Runde.']]
    },
    schwammstaffel: {
      d: ['Neben der Haustür steht ein Eimer Wasser, 3 Meter weiter für jeden ein leerer Becher. Beide tauchen ihren Schwamm ein, laufen zum Becher und drücken ihn darüber aus, dann zurück zum Eimer.', 'Gewonnen hat, wessen Becher zuerst voll ist.'],
      f: [['Drinnen oder draußen?', 'Draußen. Wer drinnen spielt, wischt hinterher.'], ['Darf man den Becher näher holen?', 'Nein, der Becher bleibt stehen.']]
    },
    geschenkhandschuh: {
      d: ['Beide ziehen Ofenhandschuhe an und packen einen Schuh, den ein Gast hinstellt, in Zeitungspapier ein. Zum Schluss kommt eine Schleife aus Schnur drum.', 'Gewonnen hat, wessen Geschenk zuerst fertig ist und die Schleife hält, wenn die Hauptperson es hochhebt.'],
      f: [['Muss es schön sein?', 'Nein, nur zu. Kein Stück Schuh darf rausschauen.']]
    }
  };
  Object.keys(TEXT).forEach(function (k) { GAME_TEXT[k] = TEXT[k]; });

  /* JGA: Missionen, die wie Pflicht klingen, fliegen raus; die ids der übrigen bleiben, damit laufende Abende weiterpassen */
  var JGA_OUT = [
    'j2', 'j6', 'j14', 'j18', 'j19', 'j22', 'j23', 'j29', 'j30', 'j32', 'j34', 'j35',
    'j37', 'j38', 'j44', 'j47', 'j48', 'j51', 'j52', 'j53', 'j54', 'j58', 'j64', 'j67',
    'j71', 'j76', 'j80', 'j81', 'j84', 'j86', 'j90', 'j93', 'j94', 'j95', 'j99', 'j100',
    'j102', 'j104', 'j105', 'j106', 'j107', 'j108', 'j112', 'j113', 'j116', 'j118', 'j119', 'j121',
    'j122', 'j123', 'j124', 'j127', 'j128', 'j131', 'j132', 'j134', 'j138', 'j140', 'j141', 'j142',
    'j143', 'j144', 'j145'
  ];
  var JGA_FIX = {
    j1: { title: 'Zeitreise', t: '{N} fragt drei Fremde ganz ernst, welches Jahr wir haben, und bedankt sich erleichtert: „Dann bin ich ja noch nicht verheiratet.“', win: 'Geschafft, wenn {N} bei allen dreien ernst bleibt.', dat: '' },
    j3: { t: '{N} lässt sich von jemandem aus der Gegend das liebste Dialektwort beibringen und hängt es bis zur nächsten Mission an jeden Satz.', win: 'Geschafft, wenn die Truppe {N} bis dahin höchstens zweimal ohne das Wort erwischt.', dat: '' },
    j4: { title: 'Fotoshooting', t: '{N} bittet einen Fremden, die Truppe zu fotografieren, und zwar wie ein strenger Modefotograf: Er sagt, wer wo steht und wie alle gucken. Die Truppe macht alles mit.', win: 'Geschafft nach drei Kommandos und einem Foto.', dat: '' },
    j5: { t: 'Die Truppe sucht am Kiosk das seltsamste Getränk ohne Alkohol aus. {N} trinkt einen großen Schluck und muss dabei ein Pokerface halten.', win: 'Geschafft, wenn die Truppe kein Zucken sieht.', dat: '' },
    j7: { title: 'Satz für die Hochzeit', t: 'Ein Fremder schreibt {N} einen Satz auf, je seltsamer, desto besser. {N} verspricht per Handschlag, ihn auf der Hochzeit wortwörtlich in eine Rede oder einen Trinkspruch einzubauen.', win: 'Geschafft, wenn der Satz notiert ist. Die Truppe prüft auf der Hochzeit nach.', dat: '' },
    j8: { title: 'Wer zuerst lacht', t: '{N} fordert einen Fremden zum Anstarren heraus: Wer zuerst lacht oder wegschaut, verliert. Die Truppe darf {N} ablenken, aber nicht anfassen.', win: 'Geschafft, wenn {N} gewinnt.', dat: '' },
    j10: { title: 'Bier-Sommelier', t: 'Die Truppe stellt {N} drei verschiedene Biere hin, eins davon ist {Ns} Lieblingsbier. {N} probiert mit geschlossenen Augen und zeigt auf das Lieblingsbier. Alkoholfrei geht genauso.', win: 'Geschafft, wenn {N} richtig liegt.', dat: '' },
    j11: { t: '{N} fragt ein Paar, ob {N} raten darf, wo die beiden sich kennengelernt haben: Arbeit, Party, Schule, Internet oder Urlaub. Drei Versuche, dann erzählt das Paar.', win: 'Geschafft, wenn {N} es in drei Versuchen errät.', dat: '' },
    j12: { t: '{N} kauft eine Postkarte. Drei Fremde schreiben {P} einen Gruß drauf, als wären sie alte Freunde, mit einer erfundenen gemeinsamen Erinnerung. Die Karte geht per Post an {P}.', dat: 'P' },
    j13: { title: 'Aufstellung', t: '{N} bittet einen Fremden, die Truppe nach Gefühl in eine Reihe zu stellen: vorne, wer am meisten verträgt, hinten, wer als Erstes nach Hause geht.', win: 'Geschafft, wenn die Reihe steht und ein Foto gemacht ist.', dat: '' },
    j20: { title: 'Erster Eindruck', t: 'Ein Fremder schätzt nach einem Blick drei Dinge über {N}: Alter, Beruf und wie lange {N} schon mit {P} zusammen ist.', win: 'Geschafft bei mindestens einem Treffer.', dat: 'P' },
    j21: { t: '{N} trägt zehn Minuten lang Sonnenbrille und spielt den Star. Die Truppe läuft als Fans und Fotografen hinterher, ruft {Ns} Namen und bittet um Autogramme.', win: 'Geschafft, wenn ein Fremder fragt, wer das ist, oder selbst ein Foto macht.', dat: '' },
    j24: { t: '{N} geht mit zwei Euro in den nächsten Laden und lässt sich vom Personal ein Hochzeitsgeschenk empfehlen. Was empfohlen wird, wird gekauft und steht am Hochzeitstag auf dem Gabentisch.', dat: '' },
    j25: { title: 'Weg zum Strand', t: '{N} fragt einen Passanten ganz ernst nach dem Weg zu etwas, das es hier sicher nicht gibt: zum Strand, zum Skilift oder zur Fähre nach Mallorca.', win: 'Geschafft, wenn {N} ernst bleibt, bis die Antwort fertig ist.', dat: '' },
    j31: { t: '{N} fordert einen Fremden zu Schere, Stein, Papier heraus, bester aus drei. Die Truppe feuert an wie beim Boxkampf und zählt jede Runde laut an.', win: 'Geschafft, wenn {N} gewinnt.', dat: '' },
    j33: { title: 'Ballon-Rennen', t: '{N} und ein Fremder blasen auf Kommando der Truppe je einen Luftballon so groß wie einen Kopf auf und knoten ihn zu.', win: 'Geschafft, wenn {Ns} Ballon zuerst zugeknotet ist.', dat: '' },
    j36: { title: 'Wer von euch?', t: '{N} findet ein Paar, das schon lange zusammen ist, und stellt drei Fragen: Wer schnarcht? Wer hat zuerst „Ich liebe dich“ gesagt? Wer hat meistens recht? Beide zeigen gleichzeitig.', win: 'Geschafft, wenn die beiden sich mindestens einmal uneinig sind.', dat: '' },
    j39: { title: 'Höher oder tiefer', t: 'Ein Fremder mischt und deckt eine Karte auf. {N} sagt vor jeder neuen Karte, ob sie höher oder tiefer ist. Die Truppe darf reinrufen, {N} entscheidet.', win: 'Geschafft bei vier richtigen Tipps in Folge, drei Anläufe.', dat: '' },
    j41: { t: 'Die Truppe stellt {N} drei Fragen über {P}, zum Beispiel Schuhgröße, Lieblingspizza oder der peinlichste Song auf der Playlist. Dann ruft {N} {P} auf Lautsprecher an und prüft nach.', win: 'Geschafft bei zwei von drei Treffern. Geht {P} nicht ran, entscheidet die Truppe.', dat: 'P' },
    j42: { title: 'Bierdeckel-Flip', t: 'Bierdeckel über die Tischkante legen, von unten hochschnippen und in der Luft fangen. {N} tritt gegen jemanden aus der Truppe an: Start mit einem Deckel, jede Runde einer mehr.', win: 'Geschafft, wenn {N} mehr Deckel fängt als der Gegner.', dat: '' },
    j43: { title: 'Fotoalbum', t: 'Jeder aus der Truppe sucht auf dem Handy das älteste Foto, auf dem {N} zu sehen ist. {N} schätzt bei jedem Foto das Jahr.', win: 'Geschafft, wenn {N} bei mindestens der Hälfte auf zwei Jahre genau liegt.', dat: '' },
    j45: { t: '{N} stellt die Truppe in eine Reihe, vom ältesten Freund bis zum neuesten, ohne zu fragen. Danach nennt jeder das Jahr, seit dem er {N} kennt.', win: 'Geschafft, wenn höchstens zwei falsch stehen.', dat: '' },
    j50: { title: 'Kategorien-Duell', t: 'Die Truppe ruft eine Kategorie: Biermarken, Schnäpse, Schlagersänger oder Pommes-Soßen. {N} und jemand aus der Truppe nennen abwechselnd eins, ohne Pause und ohne Wiederholung.', win: 'Geschafft, wenn der andere zuerst hängt.', dat: '' },
    j59: { title: 'Dritte Person', t: '{N} bestellt die nächste Runde in der dritten Person: „{N} hätte gern noch eine Runde.“ Bis zur nächsten Mission redet {N} so weiter, auch mit Fremden.', win: 'Geschafft, wenn die Truppe {N} bis dahin bei keinem einzigen Ich erwischt.', dat: '' },
    j61: { t: '{N} lässt sich von einem Fremden einen neuen Vornamen und einen Beruf geben und stellt sich bis zur nächsten Mission jedem so vor, etwa: „Hallo, ich bin Detlef, Pilzberater.“', dat: '' },
    j63: { t: '{N} fragt in einem Laden ganz ernst nach etwas, das es nicht gibt, zum Beispiel Schnürsenkel für Flipflops oder Ersatzsand für eine Sanduhr.', dat: '' },
    j68: { t: 'Ein Fremder schreibt auf einen Klebezettel einen Satz, den {N} niemals zu {P} sagen würde, etwa „Deine Mutter hat recht“. {N} trägt ihn bis zur nächsten Mission auf dem Rücken, ohne ihn zu lesen.', win: 'Geschafft, wenn der Zettel so lange hält. Erst dann darf {N} lesen.', dat: 'P' },
    j69: { title: 'Letzte Chance', t: '{N} hält drei Minuten lang ein Schild hoch: „Ich heirate. Letzte Chance, es mir auszureden.“', win: 'Geschafft, wenn drei Fremde stehen bleiben, egal ob sie zu- oder abraten.', dat: '' },
    j70: { title: 'Gedenktafel', t: '{N} schreibt mit Straßenkreide eine erfundene Gedenktafel auf den Boden, nach Nachfrage zum Beispiel vor einer Kneipe: „Hier sah {N} {P} zum ersten Mal.“ Dann wartet die Truppe unauffällig.', win: 'Geschafft, wenn ein Fremder stehen bleibt und liest.', dat: 'P' },
    j72: { title: 'Zweite Meinung', t: '{N} zeigt drei Fremden ein Foto von {P} und bittet ganz ernst um eine zweite Meinung: Soll {N} das wirklich machen?', win: 'Geschafft, wenn alle drei abgestimmt haben.', dat: 'P' },
    j74: { title: 'Statuen-Duell', t: '{N} und ein Gegner, den {N} aus der Truppe aussucht, frieren an einer belebten Stelle als Statuen ein, in einer Pose, die die Truppe vorgibt, etwa „Tourist ruft ein Taxi“. Die Truppe legt ihnen nach und nach Dinge auf die ausgestreckte Hand: Bierdeckel, Kronkorken, eine leere Flasche.', win: 'Geschafft, wenn {N} länger stillhält als der Gegner.', dat: '' },
    j75: { title: 'Schlimmster JGA', t: '{N} fragt jemanden vom Personal, was der schlimmste Junggesellenabschied war, den es hier je gab. Die Truppe hört mit.', win: 'Geschafft, wenn eine echte Geschichte kommt. Die Truppe schwört feierlich, sie nicht nachzumachen.', dat: '' },
    j77: { title: 'Falsches Brautpaar', t: 'Die Truppe stellt sich mit Seifenblasen am Weg auf. Kommt ein Paar vorbei, jubelt sie ihm zu, als käme es gerade vom Standesamt, und {N} gratuliert als Erster.', win: 'Geschafft, wenn das Paar mitspielt und winkt oder sich verbeugt.', dat: '' },
    j78: { title: 'Tausch-Duell', t: '{N} und ein Gegner aus der Truppe bekommen je einen Bierdeckel und 15 Minuten. Jeder tauscht ihn bei Fremden gegen etwas anderes und das Getauschte noch zweimal weiter.', win: 'Geschafft, wenn die Truppe {Ns} drittes Tauschstück besser findet.', dat: '' },
    j79: { t: 'Ein Fremder denkt sich einen Kosenamen für {P} aus. {N} ruft {P} auf Lautsprecher an und spricht {P} im ganzen Gespräch nur so an, ohne etwas zu erklären.', win: 'Geschafft, wenn {N} eine Minute durchhält, ohne zu lachen oder aufzuklären.', dat: 'P' },
    j87: { title: 'Selfie-Duell', t: '{N} und ein Gegner aus der Truppe haben fünf Minuten. Jeder versucht, so viele Fremde wie möglich auf ein einziges Selfie zu bekommen.', win: 'Geschafft, wenn auf {Ns} Selfie mehr Fremde sind.', dat: '' },
    j88: { t: '{N} wünscht sich bei Straßenmusikern einen Schlager, den sie bestimmt nicht im Programm haben, etwa „Atemlos“, und tanzt dazu. Ein paar Münzen gehören sich. Sind keine Musiker da, summt die Truppe.', win: 'Geschafft, wenn die Musiker es versuchen und {N} eine Strophe durchtanzt.', dat: '' },
    j89: { title: 'Königlicher Befehl', t: '{N} krönt einen Fremden mit der Krone feierlich zur Majestät des Abends. Als erste Amtshandlung gibt die Majestät {N} einen Befehl, harmlos und legal.', win: 'Geschafft, wenn {N} den Befehl ausgeführt hat und die Majestät zufrieden ist.', dat: '' },
    j91: { title: 'Trauung mit Laterne', t: 'Ein Fremder spielt den Standesbeamten und traut {N} mit einer Laterne, einer Statue oder einem Mülleimer. Die Truppe spielt die Gäste und macht Seifenblasen.', win: 'Geschafft, wenn der Fremde die Frage aller Fragen stellt und {N} laut ja sagt.', dat: '' },
    j92: { title: 'Bierdeckel-Duell', t: '{N} fordert jemanden an der Theke zum Bierdeckel-Flippen heraus: Bierdeckel über die Tischkante legen, von unten hochschnippen und in der Luft fangen. Erst einer, dann zwei, dann drei gestapelt.', win: 'Geschafft, wenn {N} mehr Bierdeckel fängt als der Fremde.', dat: '' },
    j97: { title: 'Summ-Duell', t: '{N} und ein Gegner aus der Truppe summen abwechselnd einen Song, den ihnen jemand ins Ohr flüstert, am liebsten einen, der sich schlecht summen lässt. Je drei Songs, die Truppe rät.', win: 'Geschafft, wenn die Truppe mehr von {Ns} Songs errät.', dat: '' },
    j98: { title: 'Blindes Navi', t: '{N} schließt die Augen und muss eine Laterne abseits der Straße finden, etwa 15 Meter entfernt. Nur ein Navi, das {N} vorher aus der Truppe aussucht, sagt die Wahrheit, alle anderen rufen falsche Richtungen dazwischen. Einer geht sichernd daneben.', win: 'Geschafft, wenn {N} die Laterne in zwei Minuten berührt.', dat: '' },
    j101: { t: '{N} und ein Gegner aus der Truppe stehen sich gegenüber und schauen sich in die Augen. Alle anderen versuchen, die beiden zum Lachen zu bringen, ohne sie zu berühren.', win: 'Geschafft, wenn der Gegner zuerst lacht.', dat: '' },
    j103: { title: 'Telefonjoker', t: '{N} ruft auf Lautsprecher die Mutter, den Vater oder {P} an. Die Truppe flüstert vorher ein Wort, etwa „Kartoffelsalat“ oder „Zahnseide“. {N} muss den Angerufenen dazu bringen, es zu sagen, ohne es selbst zu sagen.', win: 'Geschafft, wenn das Wort innerhalb von 60 Sekunden fällt.', dat: 'P' },
    j109: { title: 'High-Five-Duell', t: '{N} und ein Gegner aus der Truppe haben drei Minuten. Beide sammeln High Fives von Fremden und rufen bei jedem „{N} heiratet!“.', win: 'Geschafft, wenn {N} mehr High Fives hat.', dat: '' },
    j114: { title: 'Tanz zum Mitmachen', t: '{N} spielt an einer belebten Stelle „Macarena“, „YMCA“ oder den Ententanz vom Handy ab und tanzt die Bewegungen groß vor. Die Truppe tanzt in der zweiten Reihe.', win: 'Geschafft, wenn mindestens ein Fremder mittanzt.', dat: '' },
    j117: { title: 'Klopapier-Brautmode', t: 'Die Truppe teilt sich in zwei Teams. Eins wickelt {N}, eins einen Gegner, den {N} aussucht, in zwei Minuten in ein Hochzeitsoutfit aus Klopapier. Dann stellen sich beide an den Weg.', win: 'Geschafft, wenn ein Fremder {Ns} Outfit schöner findet. Danach kommt alles in den Mülleimer.', dat: '' },
    j125: { title: 'Leih-Outfit-Duell', t: '{N} und ein Gegner aus der Truppe haben zehn Minuten. Jeder leiht sich von Fremden drei Teile, etwa Hut, Jacke oder Brille, und posiert damit fürs Foto. Danach geht alles mit Dank zurück.', win: 'Geschafft, wenn die Truppe {Ns} Outfit verrückter findet.', dat: '' },
    j130: { t: '{N} trägt 15 Minuten lang ein Schild auf dem Rücken: „Sprich mich an, ich heirate!“ Wer {N} anspricht, bekommt ein Autogramm auf einem Bierdeckel.', win: 'Geschafft, wenn mindestens drei Leute {N} angesprochen haben.', dat: '' },
    j135: { title: 'Jugendsünde', t: 'Die Truppe wählt den peinlichsten Song aus {Ns} Jugend. {N} fragt in der Bar, ob er kurz laufen darf, und singt den Refrain mit einer Flasche als Mikro. Läuft er nicht, macht die Truppe den Beat.', win: 'Geschafft, wenn der Refrain komplett ist.', dat: '' },
    j137: { title: 'Der Star kommt', t: '{N} setzt die Sonnenbrille auf, die Truppe spielt Bodyguards und Fans. Sie bahnen {N} 50 Meter den Weg, rufen „Keine Fotos bitte“ und kreischen.', win: 'Geschafft, wenn ein Fremder fragt, wer das ist, oder ein Foto macht.', dat: '' },
    j139: { title: 'Actionfilm-Zeitlupe', t: 'Die Truppe läuft 20 Meter in Zeitlupe, wie Helden im Actionfilm, hinter denen gerade etwas explodiert ist. {N} geht vorneweg, einer macht das Explosionsgeräusch.', win: 'Geschafft, wenn niemand aus der Zeitlupe fällt und sich keiner umdreht.', dat: '' }
  };
  for (var i = JGA_TASKS.length - 1; i >= 0; i--) {
    var m = JGA_TASKS[i];
    if (JGA_OUT.indexOf(m.id) >= 0) { JGA_TASKS.splice(i, 1); continue; }
    var x = JGA_FIX[m.id]; if (x) Object.keys(x).forEach(function (k) { m[k] = x[k]; });
  }
  var JGA_NEW = [
    { lvl: 3, title: 'Durchsage', t: '{N} stellt sich in der Bahn, im Bus oder in der Kneipe hin und macht eine Durchsage wie ein Zugbegleiter: „Meine Damen und Herren, in Kürze erreichen wir den Hafen der Ehe. Ausstieg in Fahrtrichtung links.“', win: 'Geschafft, wenn die Durchsage laut und ohne Lachen durchkommt. Die Truppe entscheidet.', bar: true, who: 'solo' },
    { lvl: 2, title: 'Polonaise', t: '{N} startet mitten auf der Straße oder in der Kneipe eine Polonaise und bringt Fremde dazu, sich hinten anzuhängen.', win: 'Geschafft, wenn drei Fremde mitlaufen.', bar: true, who: 'fremd' },
    { lvl: 3, title: 'Siegerehrung', t: '{N} bittet einen Fremden, die Truppe zur besten Junggesellen-Truppe der Stadt zu küren, mit Rede in einem Satz und Bierdeckel als Medaille für {N}.', win: 'Geschafft, wenn die Medaille verliehen ist und es ein Foto gibt.', bar: true, who: 'fremd' }
  ];
  JGA_NEW.forEach(function (m, i) { JGA_TASKS.push({ id: 'j' + (JGA_RAW.length + i + 1), lvl: m.lvl, title: m.title, t: m.t, win: m.win, take: [], buy: '', dat: '', s: 0, bar: !!m.bar, who: m.who }); });
})();
