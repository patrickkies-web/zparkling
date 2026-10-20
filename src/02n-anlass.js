/* =========================================================
   Fifteen more tasks for every occasion, close to the custom and to
   the person: things to tell, to guess about the guests, to do with
   what lies around anyway. Same size as the rest: a minute, one
   result. No fitness, nobody from the group has to join in, guests
   only when the main person picks them or they want to.
   s = alone [how, when it counts], d = against someone [how, who wins],
   f = what people ask.
   ========================================================= */
(function () {
  var list = [], T = {};
  function G(id, name, cat, only, mat, needs, s, d, f) { list.push({ id: id, name: name, cat: cat, mat: mat || '', needs: needs || [], only: only, min: 1 }); T[id] = { s: s, d: d || undefined, f: f || [] }; }
  var O = function (q, a) { return [q, a]; };

  /* ---------- Sockenkranz ---------- */
  G('sockenjahre', '25 Socken, 25 Jahre', 'Kopf', ['socken'], '', [],
    ['Ein Gast nennt eine Zahl zwischen 1 und 25. Das ist ein Lebensjahr. Dazu in einem Satz erzählen, was damals los war. Fünf Zahlen, fünf Sätze.', 'Geschafft, wenn zu allen fünf Jahren ein Satz kommt, ohne länger als fünf Sekunden zu überlegen.'],
    ['Beide bekommen abwechselnd Zahlen zwischen 1 und 25 und erzählen zu jedem Jahr einen Satz.', 'Gewonnen hat, wer nicht als Erster ins Stocken gerät.'],
    [O('Das Jahr ist zu früh, um sich zu erinnern?', 'Dann darf es eine Geschichte sein, die die Eltern erzählt haben.')]);
  G('sockenrede', 'Verteidigungsrede', 'Kopf', ['socken'], '', [],
    ['30 Sekunden Rede: „Warum ich mit 25 keinen Ehering brauche, aber einen Sockenkranz.“ Ein Gast stoppt die Zeit.', 'Geschafft, wenn die 30 Sekunden voll sind und die Gäste am Ende klatschen.'],
    null,
    [O('Darf gelesen werden?', 'Nein, frei gesprochen. Stichworte im Kopf reichen.')]);
  G('sockenkegeln', 'Socken-Bowling', 'Geschick', ['socken'], 'Ersatz-Socken, 6 Becher', ['socken', 'becher'],
    ['Sechs Becher stehen als Kegel am Boden. Eine zusammengeknüllte Socke ist die Kugel, gerollt aus drei Metern. Drei Würfe.', 'Geschafft, wenn nach drei Würfen alle sechs Becher liegen.'],
    ['Beide rollen aus drei Metern je drei Socken gegen sechs Becher.', 'Gewonnen hat, wer mehr Becher umwirft.']);
  G('sockenjonglage', 'Socken jonglieren', 'Geschick', ['socken'], 'Ersatz-Socken', ['socken'],
    ['Zwei zusammengeknüllte Socken werden jongliert: abwechselnd hochwerfen und fangen, ohne dass eine fällt.', 'Geschafft, wenn es zehn Sekunden lang klappt.'],
    ['Beide jonglieren gleichzeitig zwei Socken.', 'Gewonnen hat, wer länger durchhält.'],
    [O('Nur eine Socke in der Luft zählt?', 'Es müssen immer beide in Bewegung sein, sonst zählt die Zeit nicht.')]);
  G('sockenfuehler', 'Was steckt in der Socke?', 'Kopf', ['socken'], 'Ersatz-Socken, Augenbinde', ['socken', 'augenbinde'],
    ['Die Gäste stecken fünf Gegenstände aus dem Raum in fünf Socken. Mit verbundenen Augen jede Socke abtasten und sagen, was drin ist.', 'Geschafft, wenn drei von fünf stimmen.'],
    ['Beide bekommen dieselben fünf Socken, nacheinander und blind.', 'Gewonnen hat, wer mehr Gegenstände erkennt.']);
  G('sockenzaehlen', 'Kranz-Schätzer', 'Kopf', ['socken'], '', [],
    ['Ohne zu zählen: Wie viele Socken hängen am ganzen Kranz? Eine Zahl sagen, dann zählen die Gäste nach.', 'Geschafft, wenn die Schätzung höchstens drei Socken daneben liegt.'],
    ['Beide schätzen die Socken am Kranz.', 'Gewonnen hat, wer näher dran liegt.']);
  G('sockenpost', 'Socken-Post', 'Kopf', ['socken'], 'Ersatz-Socken, Papier, Stifte', ['socken', 'papier', 'stifte'],
    ['Gäste, die wollen, schreiben einen Wunsch für das nächste Jahr auf einen Zettel und stecken ihn in eine Socke. Drei Socken ziehen, vorlesen und raten, von wem der Wunsch ist.', 'Geschafft, wenn zwei von drei richtig zugeordnet sind.'],
    null,
    [O('Nur zwei Gäste machen mit?', 'Dann reichen zwei Zettel, und beide müssen stimmen.')]);
  G('sockenstapel', 'Socken-Turm', 'Geschick', ['socken'], 'Ersatz-Socken', ['socken'],
    ['Zehn zusammengeknüllte Socken in 30 Sekunden übereinander stapeln. Der Turm muss danach fünf Sekunden stehen.', 'Geschafft, wenn der Turm nach 30 Sekunden steht und fünf Sekunden hält.'],
    ['Beide stapeln 30 Sekunden lang Socken.', 'Gewonnen hat der höhere Turm, der steht.']);
  G('sockenrutscher', 'Socken-Rutscher', 'Geschick', ['socken'], 'Klebeband', ['klebeband'],
    ['Eine Linie aus Klebeband auf dem glatten Boden. Mit drei Schritten Anlauf auf Socken rutschen und so nah wie möglich vor der Linie zum Stehen kommen. Drei Versuche.', 'Geschafft, wenn ein Fuß höchstens eine Handbreit vor der Linie steht und nichts über die Linie ragt.'],
    ['Beide rutschen je dreimal auf die Linie zu.', 'Gewonnen hat, wer dichter an der Linie steht, ohne drüber zu sein.'],
    [O('Kein glatter Boden?', 'Dann eine andere Aufgabe. Teppich rutscht nicht.')]);
  G('sockenmatch', 'Welche Socke ist das?', 'Kopf', ['socken'], '', [],
    ['Ein Gast sucht sich heimlich eine Socke am Kranz aus und beschreibt sie mit drei Wörtern, keine Farbe. In 60 Sekunden die Socke finden.', 'Geschafft, wenn die richtige Socke gefunden wird.'],
    ['Beide bekommen von einem Gast je drei Wörter zu einer Socke.', 'Gewonnen hat, wer seine Socke zuerst findet.']);
  G('sockengeschichte', 'Der Ursprung des Kranzes', 'Kopf', ['socken'], '', [],
    ['In 45 Sekunden erklären, wie der Sockenkranz-Brauch entstanden ist. Erfinden ist ausdrücklich erlaubt, es muss nur überzeugend klingen.', 'Geschafft, wenn die Gäste am Ende klatschen.'],
    ['Beide erzählen nacheinander ihre Version, je 45 Sekunden.', 'Gewonnen hat, wessen Geschichte lauteren Applaus bekommt.']);
  G('sockeneinhand', 'Socke mit einer Hand', 'Geschick', ['socken'], 'Ersatz-Socken', ['socken'],
    ['Eine Hand hinter den Rücken. Mit der anderen eine Socke anziehen, dann die zweite. 20 Sekunden.', 'Geschafft, wenn beide Socken nach 20 Sekunden ganz am Fuß sind.'],
    ['Beide ziehen einhändig zwei Socken an.', 'Gewonnen hat, wer zuerst fertig ist.']);
  G('sockenspender', 'Wessen Socke?', 'Kopf', ['socken'], '', [],
    ['Drei Gäste zeigen auf eine Socke am Kranz, die sie gespendet haben. Danach raten: Welche Socke stammt von wem?', 'Geschafft, wenn alle drei richtig zugeordnet sind.'],
    null,
    [O('Niemand weiß mehr, welche Socke von wem ist?', 'Dann suchen die drei Gäste eine Socke aus, die zu ihnen passt, und das Raten läuft genauso.')]);
  G('sockenkorken', 'Kronkorken in die Socke', 'Geschick', ['socken'], 'Ersatz-Socken, Kronkorken', ['socken', 'kronkorken'],
    ['Eine Socke in der einen Hand, 20 Kronkorken auf dem Tisch. Mit der anderen Hand in 30 Sekunden so viele Kronkorken wie möglich einzeln in die Socke stecken.', 'Geschafft ab 15 Kronkorken.'],
    ['Beide füllen 30 Sekunden lang je eine Socke mit Kronkorken, einzeln.', 'Gewonnen hat, wer mehr Kronkorken in der Socke hat.']);
  G('sockenwunsch', 'Eine Socke für jeden', 'Kopf', ['socken'], '', [],
    ['Für fünf Gäste je eine Socke vom Kranz aussuchen, die zu ihnen passt, und in einem Satz sagen, warum.', 'Geschafft, wenn fünf Gäste ihre Socke mit Nicken annehmen.'],
    null);

  /* ---------- Schachtelkranz ---------- */
  G('schachteljahre', '25 Schachteln, 25 Jahre', 'Kopf', ['schachtel'], '', [],
    ['Ein Gast nennt eine Zahl zwischen 1 und 25. Das ist ein Lebensjahr. Dazu in einem Satz erzählen, was damals los war. Fünf Zahlen, fünf Sätze.', 'Geschafft, wenn zu allen fünf Jahren ein Satz kommt, ohne länger als fünf Sekunden zu überlegen.'],
    ['Beide bekommen abwechselnd Zahlen zwischen 1 und 25 und erzählen zu jedem Jahr einen Satz.', 'Gewonnen hat, wer nicht als Erste ins Stocken gerät.'],
    [O('Das Jahr ist zu früh, um sich zu erinnern?', 'Dann darf es eine Geschichte sein, die die Eltern erzählt haben.')]);
  G('schachtelrede', 'Verteidigungsrede', 'Kopf', ['schachtel'], '', [],
    ['30 Sekunden Rede: „Warum alte Schachtel das schönste Kompliment ist, das man mit 25 bekommen kann.“ Ein Gast stoppt die Zeit.', 'Geschafft, wenn die 30 Sekunden voll sind und die Gäste am Ende klatschen.'],
    null,
    [O('Darf gelesen werden?', 'Nein, frei gesprochen. Stichworte im Kopf reichen.')]);
  G('schachtelpost', 'Schachtel-Post', 'Kopf', ['schachtel'], 'Leere Schachteln, Papier, Stifte', ['schachteln', 'papier', 'stifte'],
    ['Gäste, die wollen, schreiben eine Erinnerung an die alte Schachtel auf einen Zettel und legen ihn in eine Schachtel. Drei Schachteln öffnen, vorlesen und raten, von wem der Zettel ist.', 'Geschafft, wenn zwei von drei richtig zugeordnet sind.'],
    null,
    [O('Nur zwei Gäste machen mit?', 'Dann reichen zwei Zettel, und beide müssen stimmen.')]);
  G('schachtelgewicht', 'Schwer oder leicht?', 'Kopf', ['schachtel'], 'Leere Schachteln, Kleinkram zum Füllen', ['schachteln'],
    ['Die Gäste füllen heimlich zwei Schachteln, eine schwerer als die andere. Beide kurz anheben und sagen, welche schwerer ist. Drei Runden.', 'Geschafft, wenn zwei von drei Runden stimmen.'],
    ['Beide heben dieselben Schachteln nacheinander an und tippen. Drei Runden.', 'Gewonnen hat, wer öfter richtig liegt.']);
  G('schachtelstaffel', 'Schachtel-Transport', 'Geschick', ['schachtel'], 'Leere Schachteln', ['schachteln'],
    ['Fünf Schachteln auf einmal vom Tisch zu einem Stuhl am anderen Ende des Raums tragen, ohne dass eine fällt. Drei Versuche.', 'Geschafft, wenn alle fünf heil auf dem Stuhl liegen.'],
    ['Beide tragen je fünf Schachteln die gleiche Strecke.', 'Gewonnen hat, wer zuerst alle fünf abgelegt hat, ohne eine zu verlieren.']);
  G('schachtelpyramide', 'Pyramide mit links', 'Geschick', ['schachtel'], 'Leere Schachteln', ['schachteln'],
    ['Nur mit der schwächeren Hand sechs Schachteln in 30 Sekunden zu einer Pyramide bauen: drei, zwei, eins.', 'Geschafft, wenn die Pyramide nach 30 Sekunden steht.'],
    ['Beide bauen einhändig je eine Pyramide.', 'Gewonnen hat, wer zuerst fertig ist und wessen Pyramide steht.']);
  G('schachtelwurf', 'Schachtel-Frisbee', 'Geschick', ['schachtel'], 'Leere Schachteln, Wäschekorb', ['schachteln', 'waeschekorb'],
    ['Eine flache Schachtel wie eine Frisbee aus drei Metern in den Wäschekorb werfen. Drei Versuche.', 'Geschafft, wenn eine im Korb landet.'],
    ['Beide werfen aus drei Metern je drei Schachteln.', 'Gewonnen hat, wer öfter trifft.']);
  G('schachtelkritzel', 'Schachtel-Porträt', 'Party', ['schachtel'], 'Leere Schachteln, Stifte', ['schachteln', 'stifte'],
    ['In 30 Sekunden einen Gast auf eine Schachtel malen. Die Gäste raten, wer es ist.', 'Geschafft, wenn der Gast in 20 Sekunden erkannt wird.'],
    ['Beide malen denselben Gast auf je eine Schachtel.', 'Gewonnen hat, wessen Bild zuerst erkannt wird.']);
  G('schachtelzaehlen', 'Kranz-Schätzer', 'Kopf', ['schachtel'], '', [],
    ['Ohne zu zählen: Wie viele Schachteln hängen am ganzen Kranz? Eine Zahl sagen, dann zählen die Gäste nach.', 'Geschafft, wenn die Schätzung höchstens drei Schachteln daneben liegt.'],
    ['Beide schätzen die Schachteln am Kranz.', 'Gewonnen hat, wer näher dran liegt.']);
  G('schachtelgeschichte', 'Der Ursprung des Kranzes', 'Kopf', ['schachtel'], '', [],
    ['In 45 Sekunden erklären, wie der Schachtelkranz-Brauch entstanden ist. Erfinden ist ausdrücklich erlaubt, es muss nur überzeugend klingen.', 'Geschafft, wenn die Gäste am Ende klatschen.'],
    ['Beide erzählen nacheinander ihre Version, je 45 Sekunden.', 'Gewonnen hat, wessen Geschichte lauteren Applaus bekommt.']);
  G('schachtelspender', 'Wessen Schachtel?', 'Kopf', ['schachtel'], '', [],
    ['Drei Gäste zeigen auf eine Schachtel am Kranz, die sie gebastelt haben. Danach raten: Welche Schachtel stammt von wem?', 'Geschafft, wenn alle drei richtig zugeordnet sind.'],
    null,
    [O('Niemand weiß mehr, welche Schachtel von wem ist?', 'Dann suchen die drei Gäste eine Schachtel aus, die zu ihnen passt, und das Raten läuft genauso.')]);
  G('schachtelkopf', 'Schachtel auf dem Kopf', 'Geschick', ['schachtel'], 'Leere Schachteln', ['schachteln'],
    ['Eine Schachtel auf den Kopf legen und einmal um den Tisch gehen, ohne sie festzuhalten.', 'Geschafft, wenn die Schachtel die ganze Runde oben bleibt.'],
    ['Beide gehen gleichzeitig mit einer Schachtel auf dem Kopf um den Tisch.', 'Gewonnen hat, wer zuerst zurück ist, ohne dass die Schachtel fällt.']);
  G('schachtelhut', 'Der Schachtel-Hut', 'Party', ['schachtel'], 'Leere Schachteln, Klebeband', ['schachteln', 'klebeband'],
    ['In 60 Sekunden aus Schachteln und Klebeband einen Hut bauen und ihn aufsetzen. Er muss zehn Sekunden halten.', 'Geschafft, wenn der Hut nach 60 Sekunden sitzt und zehn Sekunden hält.'],
    ['Beide bauen je einen Hut.', 'Gewonnen hat, wessen Hut mehr Applaus bekommt.']);
  G('schachtelecho', 'Was klappert da?', 'Kopf', ['schachtel'], 'Leere Schachteln, Kleinkram', ['schachteln'],
    ['Ein Gast legt etwas Kleines in eine geschlossene Schachtel: Münze, Schlüssel, Kronkorken, Gummibärchen. Nur schütteln und hören. Drei Schachteln.', 'Geschafft, wenn zwei von drei erkannt werden.'],
    ['Beide hören nacheinander dieselben drei Schachteln ab.', 'Gewonnen hat, wer mehr erkennt.']);
  G('schachtelwunsch', 'Eine Schachtel für jeden', 'Kopf', ['schachtel'], '', [],
    ['Für fünf Gäste je eine Schachtel vom Kranz aussuchen, die zu ihnen passt, und in einem Satz sagen, warum.', 'Geschafft, wenn fünf Gäste ihre Schachtel mit Nicken annehmen.'],
    null);

  /* ---------- Treppe fegen ---------- */
  G('stufenjahre', '30 Stufen, 30 Jahre', 'Kopf', ['fegen'], '', [],
    ['Ein Gast nennt eine Zahl zwischen 1 und 30. Das ist ein Lebensjahr. Dazu in einem Satz erzählen, was damals los war. Fünf Zahlen, fünf Sätze.', 'Geschafft, wenn zu allen fünf Jahren ein Satz kommt, ohne länger als fünf Sekunden zu überlegen.'],
    ['Beide bekommen abwechselnd Zahlen zwischen 1 und 30 und erzählen zu jedem Jahr einen Satz.', 'Gewonnen hat, wer nicht als Erster ins Stocken gerät.']);
  G('stufenrede', 'Rede von der obersten Stufe', 'Kopf', ['fegen'], '', [],
    ['Von der obersten Stufe 30 Sekunden Rede: „Warum ich mit 30 die Treppe fege und stolz darauf bin.“ Ein Gast stoppt die Zeit.', 'Geschafft, wenn die 30 Sekunden voll sind und die Gäste klatschen.'],
    null,
    [O('Darf gelesen werden?', 'Nein, frei gesprochen. Stichworte im Kopf reichen.')]);
  G('korkenschaetzen', 'Kronkorken schätzen', 'Kopf', ['fegen'], 'Kronkorken', ['kronkorken'],
    ['Ein Gast streut eine Handvoll Kronkorken auf eine Stufe. Drei Sekunden hinsehen, dann schätzen, wie viele es sind. Danach wird gezählt.', 'Geschafft, wenn die Schätzung höchstens fünf daneben liegt.'],
    ['Beide schätzen dieselbe Stufe.', 'Gewonnen hat, wer näher dran liegt.']);
  G('besenkaraoke', 'Besen-Karaoke', 'Party', ['fegen'], 'Besen', ['besen'],
    ['Der Besen ist das Mikro. Ein Gast nennt ein Lied, davon den Refrain singen.', 'Geschafft, wenn mindestens drei Gäste mitsingen.'],
    ['Beide singen nacheinander den Refrain eines Liedes, das ein Gast nennt.', 'Gewonnen hat, wer mehr Gäste zum Mitsingen bringt.']);
  G('kehrblechgolf', 'Kehrblech-Golf', 'Geschick', ['fegen'], 'Kehrblech & Handfeger, Kronkorken', ['kehrblech', 'kronkorken'],
    ['Das Kehrblech liegt zwei Meter entfernt auf dem Boden. Mit dem Handfeger einen Kronkorken so anschieben, dass er auf dem Kehrblech liegen bleibt. Drei Versuche.', 'Geschafft, wenn einer auf dem Kehrblech bleibt.'],
    ['Beide schieben aus zwei Metern je drei Kronkorken Richtung Kehrblech.', 'Gewonnen hat, wer öfter trifft.']);
  G('stufenmemory', 'Stufen-Memory', 'Kopf', ['fegen'], '', [],
    ['Die Gäste legen auf fünf Stufen je einen Gegenstand. Zehn Sekunden hinsehen, dann umdrehen. Die Gäste tauschen zwei Gegenstände. Welche?', 'Geschafft, wenn beide getauschten Gegenstände genannt werden.'],
    ['Beide schauen zehn Sekunden, dann wird getauscht. Beide tippen gleichzeitig.', 'Gewonnen hat, wer beide Tauschstellen nennt. Beide richtig: Unentschieden, nochmal.']);
  G('korkenpyramide', 'Kronkorken-Pyramide', 'Geschick', ['fegen'], 'Kronkorken', ['kronkorken'],
    ['Zehn Kronkorken auf einer Stufe zu einer Pyramide legen: vier, drei, zwei, eins, jede Reihe auf der darunter. 30 Sekunden.', 'Geschafft, wenn die Pyramide nach 30 Sekunden steht.'],
    ['Beide bauen je eine Pyramide auf ihrer Stufe.', 'Gewonnen hat, wer zuerst fertig ist.']);
  G('fegeorakel', 'Fege-Orakel', 'Geschick', ['fegen'], 'Besen, Kehrblech & Handfeger, Kronkorken', ['besen', 'kehrblech', 'kronkorken'],
    ['Vorher ansagen, wie viele Kronkorken mit einem einzigen Schwung des Besens im Kehrblech landen. Dann fegen. Ein Gast hält das Kehrblech.', 'Geschafft, wenn die Zahl höchstens zwei daneben liegt.'],
    ['Beide sagen eine Zahl an und fegen je einmal.', 'Gewonnen hat, wer näher an der eigenen Ansage liegt.']);
  G('kehrblechcatch', 'Kehrblech-Catch', 'Geschick', ['fegen'], 'Kehrblech & Handfeger, Kronkorken', ['kehrblech', 'kronkorken'],
    ['Einen Kronkorken vom Kehrblech hochwerfen und mit dem Kehrblech wieder auffangen. Fünf Versuche.', 'Geschafft, wenn drei von fünf gefangen werden.'],
    ['Beide werfen und fangen je fünfmal.', 'Gewonnen hat, wer öfter fängt.']);
  G('stufengeschichte', 'Fünf Stufen, ein Leben', 'Kopf', ['fegen'], '', [],
    ['Auf jeder der untersten fünf Stufen stehen bleiben und einen Lebensabschnitt erzählen: Kindheit, Schule, erste Liebe, erster Job, heute. Ein Satz pro Stufe.', 'Geschafft, wenn alle fünf Stufen einen Satz bekommen.'],
    null);
  G('kussgruende', 'Fünf Gründe', 'Kopf', ['fegen'], '', [],
    ['Gefegt wird, bis jemand küsst. Fünf Gründe nennen, warum heute jemand kommen und genau dich küssen sollte, ohne selbst zu lachen.', 'Geschafft, wenn fünf Gründe gesagt sind und die Gäste klatschen.'],
    ['Beide nennen abwechselnd Gründe.', 'Gewonnen hat, wer nicht als Erster lacht oder stockt.']);
  G('korkenflip', 'Kronkorken-Flip', 'Geschick', ['fegen'], 'Kronkorken', ['kronkorken'],
    ['Drei Kronkorken auf den Handrücken legen, hochwerfen und mit derselben Hand fangen. Drei Versuche.', 'Geschafft, wenn einmal alle drei gefangen werden.'],
    ['Beide werfen je dreimal drei Kronkorken.', 'Gewonnen hat, wer insgesamt mehr fängt.']);
  G('zahnbuerstenbalance', 'Zahnbürste auf dem Finger', 'Geschick', ['fegen'], 'Alte Zahnbürste', ['zahnbuerste'],
    ['Die Zahnbürste senkrecht auf dem Zeigefinger balancieren.', 'Geschafft, wenn sie 15 Sekunden oben bleibt.'],
    ['Beide balancieren gleichzeitig.', 'Gewonnen hat, wer länger durchhält.']);
  G('korkenkette', 'Kronkorken-Kette', 'Geschick', ['fegen'], 'Besen, Kronkorken', ['besen', 'kronkorken'],
    ['15 Kronkorken liegen durcheinander. Nur mit dem Besenstiel in 30 Sekunden eine gerade Linie daraus schieben.', 'Geschafft, wenn nach 30 Sekunden alle 15 in einer Linie liegen, höchstens eine Handbreit Abstand.'],
    ['Beide schieben je 15 Kronkorken in eine Linie.', 'Gewonnen hat, wer zuerst fertig ist.']);
  G('kehrblechkipp', 'Kehrblech in den Eimer', 'Geschick', ['fegen'], 'Kehrblech & Handfeger, Eimer, Kronkorken', ['kehrblech', 'eimer', 'kronkorken'],
    ['Zehn Kronkorken auf dem Kehrblech, der Eimer steht einen Meter entfernt. Die Kronkorken mit einem Schwung in den Eimer kippen.', 'Geschafft, wenn mindestens fünf im Eimer landen.'],
    ['Beide kippen je zehn Kronkorken aus einem Meter.', 'Gewonnen hat, wer mehr im Eimer hat.']);

  /* ---------- Klinken putzen ---------- */
  G('klinkenjahre', '30 Klinken, 30 Jahre', 'Kopf', ['putzen'], '', [],
    ['Ein Gast nennt eine Zahl zwischen 1 und 30. Das ist ein Lebensjahr. Dazu in einem Satz erzählen, was damals los war. Fünf Zahlen, fünf Sätze.', 'Geschafft, wenn zu allen fünf Jahren ein Satz kommt, ohne länger als fünf Sekunden zu überlegen.'],
    ['Beide bekommen abwechselnd Zahlen zwischen 1 und 30 und erzählen zu jedem Jahr einen Satz.', 'Gewonnen hat, wer nicht als Erste ins Stocken gerät.']);
  G('klinkenrede', 'Rede an die Klinke', 'Kopf', ['putzen'], '', [],
    ['30 Sekunden Rede: „Warum ich mit 30 Klinken putze und es die beste Entscheidung meines Lebens ist.“ Ein Gast stoppt die Zeit.', 'Geschafft, wenn die 30 Sekunden voll sind und die Gäste klatschen.'],
    null,
    [O('Darf gelesen werden?', 'Nein, frei gesprochen. Stichworte im Kopf reichen.')]);
  G('klinkenmemory', 'Klinken-Memory', 'Kopf', ['putzen'], 'Klebezettel, Stifte', ['klebezettel', 'stifte'],
    ['Die Gäste kleben an fünf Klinken je einen Zettel mit einer Zahl. Zehn Sekunden zum Einprägen, dann vom Flur aus aufsagen: Welche Zahl hängt an welcher Tür?', 'Geschafft, wenn vier von fünf stimmen.'],
    ['Beide prägen sich dieselben fünf Klinken ein und sagen sie nacheinander auf.', 'Gewonnen hat, wer mehr richtig hat.']);
  G('lappenbalance', 'Lappen auf dem Kopf', 'Geschick', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['Den Lappen auf den Kopf legen und durch drei Türen gehen, jede Tür selbst öffnen und schließen, ohne den Lappen festzuhalten.', 'Geschafft, wenn der Lappen bis zur dritten Tür oben bleibt.'],
    ['Beide gehen mit dem Lappen auf dem Kopf dieselbe Strecke.', 'Gewonnen hat, wer zuerst durch die dritte Tür ist, ohne den Lappen zu verlieren.']);
  G('klinkenglanz', 'Welche Klinke glänzt?', 'Kopf', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['Zwei Klinken nebeneinander, eine wird 20 Sekunden lang poliert, die andere nicht. Drei Gäste, die wollen, tippen, welche geputzt wurde.', 'Geschafft, wenn mindestens zwei der drei richtig liegen.'],
    ['Beide polieren je eine Klinke, eine dritte bleibt unberührt. Die Gäste tippen, welche die unberührte ist.', 'Gewonnen hat, wessen Klinke als sauberer eingeschätzt wird.']);
  G('lappenkick', 'Lappen-Kick', 'Geschick', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['Den Lappen vom Fuß hochkicken und mit den Händen fangen. Fünf Versuche.', 'Geschafft, wenn drei von fünf gefangen werden.'],
    ['Beide kicken und fangen je fünfmal.', 'Gewonnen hat, wer öfter fängt.']);
  G('tuerenquiz', 'Türen-Quiz', 'Kopf', ['putzen'], 'Augenbinde oder Schal', ['augenbinde'],
    ['Mit verbundenen Augen wird man zu drei Türen im Haus geführt. Nur am Griff fühlen und sagen, welche Tür es ist: Küche, Bad, Flur, Schlafzimmer.', 'Geschafft, wenn zwei von drei stimmen.'],
    ['Beide werden blind zu denselben drei Türen geführt.', 'Gewonnen hat, wer mehr Türen erkennt.']);
  G('putzlied', 'Putz-Hit', 'Party', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['Der Lappen ist das Mikro. Den Refrain eines bekannten Liedes so umdichten, dass es ums Putzen geht, mindestens zwei Zeilen, und vorsingen.', 'Geschafft, wenn die Gäste das Original erkennen und klatschen.'],
    ['Beide dichten denselben Refrain um.', 'Gewonnen hat, wer lauteren Applaus bekommt.']);
  G('klinkenknigge', 'Klinken-Knigge', 'Kopf', ['putzen'], '', [],
    ['Fünf Türen nacheinander öffnen und beim Öffnen jedes Mal in einer anderen Sprache grüßen.', 'Geschafft, wenn fünf verschiedene Sprachen zusammenkommen.'],
    ['Beide öffnen abwechselnd Türen und grüßen in einer neuen Sprache.', 'Gewonnen hat, wem nicht als Erstem die Sprachen ausgehen.']);
  G('eimerhelm', 'Eimer-Helm', 'Geschick', ['putzen'], 'Eimer', ['eimer'],
    ['Den leeren Eimer umgedreht auf den Kopf setzen, Hände hinter den Rücken, und zehn Schritte gehen.', 'Geschafft, wenn der Eimer nach zehn Schritten noch sitzt.'],
    ['Beide gehen mit dem Eimer auf dem Kopf los.', 'Gewonnen hat, wer mehr Schritte schafft, bevor der Eimer fällt.']);
  G('lappentanz', 'Lappen-Choreo', 'Party', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['20 Sekunden Tanz mit dem Lappen in der Hand, die Gäste klatschen den Takt. Der Lappen muss die ganze Zeit in Bewegung bleiben.', 'Geschafft, wenn der Takt 20 Sekunden lang gehalten wird.'],
    ['Beide tanzen nacheinander 20 Sekunden.', 'Gewonnen hat, wer lauteren Applaus bekommt.']);
  G('klinkentipp', 'Klinken auf Zeit', 'Kopf', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['Vorher ansagen, wie viele Sekunden das Putzen von drei Klinken dauert. Dann putzen, ein Gast stoppt.', 'Geschafft, wenn die Ansage höchstens fünf Sekunden daneben liegt.'],
    ['Beide sagen ihre Zeit an und putzen je drei Klinken.', 'Gewonnen hat, wer näher an der eigenen Ansage liegt.']);
  G('kussliste', 'Fünf Gründe', 'Kopf', ['putzen'], '', [],
    ['Geputzt wird, bis jemand küsst. Fünf Gründe nennen, warum heute jemand kommen und genau dich küssen sollte, ohne selbst zu lachen.', 'Geschafft, wenn fünf Gründe gesagt sind und die Gäste klatschen.'],
    ['Beide nennen abwechselnd Gründe.', 'Gewonnen hat, wer nicht als Erste lacht oder stockt.']);
  G('lappenorigami', 'Lappen-Origami', 'Party', ['putzen'], 'Lappen oder Schwamm', ['lappen'],
    ['In 30 Sekunden aus dem Lappen ein Tier formen. Die Gäste raten, welches.', 'Geschafft, wenn das Tier in 20 Sekunden erkannt wird.'],
    ['Beide formen je ein Tier.', 'Gewonnen hat, wessen Tier zuerst erkannt wird.']);
  G('tuerenleben', 'Drei Türen', 'Kopf', ['putzen'], '', [],
    ['Drei Türen nennen, die im Leben wichtig waren, und zu jeder einen Satz: die erste eigene Wohnung, das Klassenzimmer, die Tür, hinter der jemand wartete.', 'Geschafft, wenn drei Türen einen Satz bekommen.'],
    null);

  /* ---------- Geburtstag ---------- */
  G('jahresrueckblick', 'Jahresrückblick', 'Kopf', ['geburtstag'], '', [],
    ['Das vergangene Lebensjahr in drei Sätzen: der Höhepunkt, der Tiefpunkt, die Lehre daraus.', 'Geschafft, wenn alle drei Sätze gesagt sind.'],
    ['Beide erzählen ihr Jahr in drei Sätzen.', 'Gewonnen hat, wer lauteren Applaus bekommt.']);
  G('dankesrede', 'Dankesrede ohne Danke', 'Kopf', ['geburtstag'], '', [],
    ['30 Sekunden Dankesrede an die Gäste, ohne die Wörter „danke“, „schön“ und „toll“. Die Gäste passen auf.', 'Geschafft, wenn keins der drei Wörter fällt.'],
    ['Beide halten nacheinander ihre Rede.', 'Gewonnen hat, wer länger ohne die drei Wörter auskommt.']);
  G('wunschzettel', 'Drei Wünsche', 'Kopf', ['geburtstag'], '', [],
    ['Drei Wünsche für das neue Lebensjahr laut aussprechen. Einer davon muss die Gäste betreffen, keiner darf Geld sein.', 'Geschafft, wenn drei Wünsche gesagt sind.'],
    null);
  G('geburtsjahr', 'Dein Geburtsjahr', 'Kopf', ['geburtstag'], '', [],
    ['Drei Dinge nennen, die im eigenen Geburtsjahr passiert sind: ein Ereignis, ein Lied, ein Film oder ein Sportsieg. Ein Gast prüft mit dem Handy.', 'Geschafft, wenn zwei von drei stimmen.'],
    ['Beide nennen je drei Dinge aus ihrem Geburtsjahr.', 'Gewonnen hat, wer mehr Treffer hat.']);
  G('kerzenzwei', 'Genau zwei', 'Geschick', ['geburtstag'], 'Teelichter, Feuerzeug', ['teelichter', 'feuerzeug'],
    ['Fünf Teelichter brennen in einer Reihe. Mit einem einzigen Pusten genau zwei auslöschen, nicht mehr, nicht weniger. Drei Versuche.', 'Geschafft, wenn es einmal genau zwei sind.'],
    ['Beide pusten je dreimal auf eine eigene Reihe.', 'Gewonnen hat, wer öfter genau zwei trifft.']);
  G('altersraten', 'Wie alt?', 'Kopf', ['geburtstag'], '', [],
    ['Drei Gäste, die wollen, melden sich. Das Alter jedes Gastes auf das Jahr genau schätzen.', 'Geschafft, wenn zwei von drei höchstens zwei Jahre daneben liegen.'],
    ['Beide schätzen dieselben drei Gäste.', 'Gewonnen hat, wer insgesamt näher dran liegt.']);
  G('tortenkunst', 'Die Wunschtorte', 'Party', ['geburtstag'], 'Servietten, Stifte', ['servietten', 'stifte'],
    ['In 30 Sekunden auf eine Serviette die Torte malen, die man sich heute gewünscht hätte, und sie in einem Satz vorstellen.', 'Geschafft, wenn die Gäste klatschen.'],
    ['Beide malen je eine Torte.', 'Gewonnen hat, wessen Torte mehr Applaus bekommt.']);
  G('liedfremd', 'Happy Birthday auf Fantasisch', 'Party', ['geburtstag'], '', [],
    ['Happy Birthday in einer erfundenen Sprache singen, die ganze Strophe, mit Gefühl.', 'Geschafft, wenn zwei Gäste bestätigen, dass die Melodie stimmt.'],
    ['Beide singen nacheinander in ihrer Fantasiesprache.', 'Gewonnen hat, wer lauteren Applaus bekommt.']);
  G('tageszahl', 'Dein Alter in Tagen', 'Kopf', ['geburtstag'], '', [],
    ['In 20 Sekunden schätzen, wie viele Tage man heute alt ist. Ein Gast rechnet nach: Jahre mal 365.', 'Geschafft, wenn die Schätzung höchstens 200 Tage daneben liegt.'],
    ['Beide schätzen ihr Alter in Tagen.', 'Gewonnen hat, wer näher dran liegt.']);
  G('jahrgangshit', 'Der Hit deines Jahrgangs', 'Kopf', ['geburtstag'], '', [],
    ['Ein Lied summen, das im eigenen Geburtsjahr ein Hit war. Die Gäste raten den Titel.', 'Geschafft, wenn ein Gast den Titel in 30 Sekunden nennt.'],
    ['Beide summen je einen Hit aus ihrem Geburtsjahr.', 'Gewonnen hat, wessen Lied zuerst erkannt wird.'],
    [O('Kein Hit bekannt?', 'Dann ein Lied aus dem Jahr des Schulabschlusses.')]);
  G('erstemale', 'Drei erste Male', 'Kopf', ['geburtstag'], '', [],
    ['Drei erste Male in je einem Satz: das erste Konzert, die erste Reise ohne Eltern, das erste Haustier.', 'Geschafft, wenn drei Sätze gesagt sind.'],
    null,
    [O('Eins davon gab es nie?', 'Dann ein anderes erstes Mal, zum Beispiel die erste eigene Wohnung.')]);
  G('monatsrechnen', 'Alter in Monaten', 'Kopf', ['geburtstag'], '', [],
    ['Das eigene Alter in Monaten ausrechnen, im Kopf, in zehn Sekunden. Ein Gast zählt die Sekunden.', 'Geschafft, wenn die Zahl nach zehn Sekunden stimmt.'],
    ['Beide rechnen gleichzeitig ihr Alter in Monaten.', 'Gewonnen hat, wer zuerst die richtige Zahl sagt.']);
  G('dankjahrzehnt', 'Ein Dank pro Jahrzehnt', 'Kopf', ['geburtstag'], '', [],
    ['Für jedes angefangene Lebensjahrzehnt einem Gast im Raum für etwas Konkretes danken. Jedes Mal ein anderer Gast.', 'Geschafft, wenn jedes Jahrzehnt seinen Dank bekommen hat.'],
    null);
  G('geschenkorakel', 'Geschenk-Orakel', 'Kopf', ['geburtstag'], '', [],
    ['Ein Gast, der will, beschreibt sein Geschenk in drei Hinweisen, ohne es zu nennen. Raten, was es ist.', 'Geschafft, wenn das Geschenk nach den drei Hinweisen erraten wird.'],
    null,
    [O('Kein Geschenk dabei?', 'Dann beschreibt der Gast etwas, das er gern geschenkt hätte.')]);
  G('vorsatzballon', 'Vorsatz im Ballon', 'Party', ['geburtstag'], 'Luftballons, Papier, Stifte', ['luftballons', 'papier', 'stifte'],
    ['Einen Vorsatz fürs neue Lebensjahr auf einen kleinen Zettel schreiben, in den Ballon stecken, aufblasen und zuknoten. Dann den Ballon durch Draufsetzen platzen lassen und den Vorsatz vorlesen.', 'Geschafft, wenn der Ballon platzt und der Vorsatz vorgelesen ist.'],
    ['Beide schreiben, blasen auf und setzen sich drauf.', 'Gewonnen hat, wessen Ballon zuerst platzt.']);

  /* ---------- Hochzeit & Polterabend ---------- */
  G('ringsuche', 'Der Ring unter den Bechern', 'Kopf', ['hochzeit'], 'Plastikbecher, Kronkorken', ['becher', 'kronkorken'],
    ['Unter einem von zehn umgedrehten Bechern liegt ein Kronkorken, der Ring. Die Gäste mischen. Zwei Becher dürfen aufgedeckt werden; der Partner darf nur mit Ja und Nein helfen.', 'Geschafft, wenn der Ring in zwei Versuchen gefunden wird.'],
    ['Beide suchen nacheinander unter je zehn Bechern.', 'Gewonnen hat, wer den Ring mit weniger Versuchen findet.']);
  G('geluebde', 'Gelübde aus drei Wörtern', 'Kopf', ['hochzeit'], '', [],
    ['Drei Gäste nennen je ein Wort. In 60 Sekunden daraus ein Ehegelübde formulieren, mindestens drei Sätze, alle drei Wörter müssen vorkommen.', 'Geschafft, wenn das Gelübde steht und der Partner nickt.'],
    ['Beide bekommen dieselben drei Wörter und formulieren je ein Gelübde.', 'Gewonnen hat, wessen Gelübde mehr Applaus bekommt.']);
  G('blindfuehren', 'Blind geführt', 'Geschick', ['hochzeit'], 'Augenbinde oder Schal', ['augenbinde'],
    ['Eine Person trägt die Augenbinde, die andere führt nur mit Worten einmal um den Tisch und zurück zum Stuhl, ohne Berühren.', 'Geschafft, wenn die blinde Person ohne Anstoßen auf dem Stuhl sitzt.'],
    ['Beide werden nacheinander von einem Gast geführt.', 'Gewonnen hat, wer schneller und ohne Anstoßen ankommt.']);
  G('korkenkehren', 'Scherben kehren', 'Geschick', ['hochzeit'], 'Besen, Kehrblech & Handfeger, Kronkorken', ['besen', 'kehrblech', 'kronkorken'],
    ['Die Gäste streuen 20 Kronkorken, das sind die Scherben. Eine Person fegt, die andere hält das Kehrblech, 30 Sekunden.', 'Geschafft, wenn nach 30 Sekunden mindestens 15 Kronkorken im Kehrblech liegen.'],
    ['Beide fegen nacheinander je 20 Kronkorken, ein Gast hält das Kehrblech.', 'Gewonnen hat, wer in 30 Sekunden mehr im Kehrblech hat.']);
  G('ersterdate', 'Das erste Date', 'Kopf', ['hochzeit'], 'Papier, Stifte', ['papier', 'stifte'],
    ['Beide schreiben getrennt auf: Ort des ersten Dates, Jahr, erstes gemeinsames Getränk. Dann vergleichen.', 'Geschafft, wenn zwei von drei Angaben übereinstimmen.'],
    null,
    [O('Nur eine Person im Mittelpunkt?', 'Dann schreibt sie, und der Partner antwortet aus dem Publikum.')]);
  G('zukunftsbrief', 'Brief an euch in zehn Jahren', 'Kopf', ['hochzeit'], '', [],
    ['Jeder sagt einen Satz an das Paar in zehn Jahren, laut und vor allen.', 'Geschafft, wenn beide Sätze gesagt sind und die Gäste klatschen.'],
    null);
  G('kriserede', 'Krise mit Happy End', 'Kopf', ['hochzeit'], '', [],
    ['30 Sekunden über die größte gemeinsame Panne erzählen: verpasster Flug, verbranntes Essen, verlaufener Städtetrip, und wie es gut ausging.', 'Geschafft, wenn die Geschichte ein Happy End hat und die Gäste klatschen.'],
    ['Beide erzählen dieselbe Panne aus ihrer Sicht, je 30 Sekunden.', 'Gewonnen hat, wessen Version mehr Applaus bekommt.']);
  G('schwiegerquiz', 'Schwieger-Quiz', 'Kopf', ['hochzeit'], '', [],
    ['Vornamen und Geburtsmonat der Schwiegereltern nennen, dazu den Beruf oder das Hobby von einem der beiden.', 'Geschafft, wenn der Partner alles bestätigt.'],
    ['Beide beantworten die Fragen zu ihren Schwiegereltern.', 'Gewonnen hat, wer mehr Treffer hat.']);
  G('ringfingermuenze', 'Münze auf dem Ringfinger', 'Geschick', ['hochzeit'], 'Münzen', ['muenzen'],
    ['Eine Münze auf den ausgestreckten Ringfinger legen und einmal um den Tisch gehen.', 'Geschafft, wenn die Münze die ganze Runde liegen bleibt.'],
    ['Beide gehen gleichzeitig los.', 'Gewonnen hat, wer zuerst zurück ist, ohne die Münze zu verlieren.']);
  G('ballonstrauss', 'Der Ballon-Strauß', 'Party', ['hochzeit'], 'Luftballons, Schnur oder Wolle', ['luftballons', 'schnur'],
    ['In 60 Sekunden drei Ballons aufblasen, zuknoten und mit Schnur zu einem Strauß binden. Dann den Strauß über die Schulter werfen.', 'Geschafft, wenn der Strauß nach 60 Sekunden hält und ein Gast ihn fängt.'],
    ['Beide binden je einen Strauß.', 'Gewonnen hat, wessen Strauß zuerst fertig ist und hält.']);
  G('redeabc', 'Rede von A bis G', 'Kopf', ['hochzeit'], '', [],
    ['Abwechselnd einen Satz über den anderen sagen. Der erste beginnt mit A, der nächste mit B, bis G.', 'Geschafft, wenn alle sieben Sätze stehen, ohne länger als fünf Sekunden Pause.'],
    ['Beide sagen abwechselnd Sätze über den jeweils anderen, von A an.', 'Gewonnen hat, wer nicht als Erster stockt.']);
  G('haenderaten', 'Welche Hand?', 'Kopf', ['hochzeit'], 'Augenbinde oder Schal', ['augenbinde'],
    ['Mit verbundenen Augen vier Hände nacheinander anfassen, drei von Gästen, die wollen, eine vom Partner. Welche ist es?', 'Geschafft, wenn die Hand des Partners erkannt wird.'],
    ['Beide suchen nacheinander die Hand des anderen unter vier Händen.', 'Gewonnen hat, wer sie erkennt; beide richtig: Unentschieden.']);
  G('gaestenamen', 'Alle Gäste', 'Kopf', ['hochzeit'], '', [],
    ['Gemeinsam in 30 Sekunden die Vornamen von 15 Gästen im Raum nennen, abwechselnd, keiner doppelt.', 'Geschafft, wenn 15 Namen zusammenkommen.'],
    ['Beide nennen abwechselnd Gästenamen, keiner doppelt.', 'Gewonnen hat, wem nicht als Erstem die Namen ausgehen.'],
    [O('Weniger als 15 Gäste da?', 'Dann alle Anwesenden, und jeder bekommt noch den Nachnamen dazu.')]);
  G('fuenfjahre', 'In fünf Jahren', 'Kopf', ['hochzeit'], 'Papier, Stifte', ['papier', 'stifte'],
    ['Beide schreiben getrennt drei Tipps auf: Wohnort in fünf Jahren, Zahl der Haustiere, Urlaubsziel. Dann vergleichen.', 'Geschafft, wenn zwei von drei übereinstimmen.'],
    null,
    [O('Nur eine Person im Mittelpunkt?', 'Dann schreibt sie, und der Partner antwortet aus dem Publikum.')]);
  G('stummeliebe', 'Stumme Liebeserklärung', 'Party', ['hochzeit'], '', [],
    ['Ohne ein Wort drei Dinge vorspielen, die man am anderen liebt. Der andere rät.', 'Geschafft, wenn zwei von drei erraten werden.'],
    ['Beide spielen nacheinander je drei Dinge vor, der andere rät.', 'Gewonnen hat, wessen Dinge öfter erraten werden.']);

  /* ---------- Junggesellenabschied ---------- */
  G('abschiedsrede', 'Abschied vom Single-Leben', 'Kopf', ['jga'], '', [],
    ['30 Sekunden Abschiedsrede an das Single-Leben, mit drei Dingen, die man nicht vermissen wird.', 'Geschafft, wenn drei Dinge genannt sind und die Gäste klatschen.'],
    null);
  G('partnerstimme', 'Drei typische Sätze', 'Kopf', ['jga'], '', [],
    ['Den Partner nachmachen: drei Sätze, die er oder sie ständig sagt, mit Stimme und Gesten.', 'Geschafft, wenn die Gäste bei mindestens zwei Sätzen lachen oder nicken.'],
    null);
  G('ehetipps', 'Rat der Gäste', 'Kopf', ['jga'], 'Klebezettel, Stifte', ['klebezettel', 'stifte'],
    ['Drei Gäste, die wollen, schreiben je einen Ehe-Tipp auf einen Zettel. Die Zettel werden vorgelesen; raten, welcher Tipp von wem ist.', 'Geschafft, wenn zwei von drei richtig zugeordnet sind.'],
    null);
  G('becherblind', 'Becher blind', 'Geschick', ['jga'], 'Plastikbecher, Augenbinde oder Schal', ['becher', 'augenbinde'],
    ['Mit verbundenen Augen in 20 Sekunden sechs Becher zu einer Pyramide stapeln.', 'Geschafft, wenn die Pyramide nach 20 Sekunden steht.'],
    ['Beide stapeln blind je sechs Becher.', 'Gewonnen hat, wer zuerst fertig ist und wessen Pyramide steht.']);
  G('antragspiel', 'Der Antrag, nachgespielt', 'Party', ['jga'], '', [],
    ['Den Heiratsantrag nachspielen, so wie er wirklich war, in 30 Sekunden. Ein Gast, der will, spielt den Partner.', 'Geschafft, wenn die Gäste klatschen und der Satz vom Antrag fällt.'],
    null,
    [O('Der Antrag kam vom anderen?', 'Dann wird gespielt, wie man ihn angenommen hat.')]);
  G('liebesabc', 'ABC der Liebe', 'Kopf', ['jga'], '', [],
    ['Von A bis J je ein Wort, das den Partner beschreibt. 30 Sekunden.', 'Geschafft, wenn alle zehn Buchstaben ein Wort haben.'],
    ['Beide bekommen abwechselnd Buchstaben und finden ein Wort für den Partner.', 'Gewonnen hat, wer nicht als Erster stockt.']);
  G('besentanz', 'Hochzeitstanz mit Besen', 'Party', ['jga'], 'Besen', ['besen'],
    ['Der Besen ist der Partner. 20 Sekunden den Hochzeitstanz üben, die Gäste summen die Musik.', 'Geschafft, wenn der Besen 20 Sekunden lang geführt wird und die Gäste klatschen.'],
    ['Beide tanzen nacheinander mit dem Besen.', 'Gewonnen hat, wer lauteren Applaus bekommt.']);
  G('serviettenlaufsteg', 'Laufsteg', 'Party', ['jga'], 'Servietten', ['servietten'],
    ['Aus Servietten in 30 Sekunden einen Schleier, eine Fliege oder einen Schleier-Hut basteln, dann einmal über den Laufsteg durch den Raum.', 'Geschafft, wenn das Teil den Laufsteg übersteht und die Gäste klatschen.'],
    ['Beide basteln und laufen nacheinander.', 'Gewonnen hat, wer mehr Applaus bekommt.']);
  G('nachrichtenwette', 'Nachrichten-Wette', 'Kopf', ['jga'], '', [],
    ['Schätzen, wie viele Nachrichten der Partner heute schon geschickt hat. Dann nachsehen.', 'Geschafft, wenn die Schätzung höchstens drei daneben liegt.'],
    null,
    [O('Kein Handy dabei?', 'Dann zählt die Schätzung eines Gastes, der mit dem Partner schreibt.')]);
  G('hochzeitsdaten', 'Die Eckdaten', 'Kopf', ['jga'], '', [],
    ['In zehn Sekunden aufsagen: Datum der Hochzeit, Ort der Trauung, Uhrzeit, Zahl der Gäste.', 'Geschafft, wenn alle vier stimmen. Ein Gast kennt die Antworten.'],
    null);
  G('tanzliedraten', 'Der Hochzeitstanz', 'Kopf', ['jga'], '', [],
    ['Das Lied für den Hochzeitstanz summen. Die Gäste raten den Titel.', 'Geschafft, wenn ein Gast den Titel in 30 Sekunden nennt.'],
    null,
    [O('Noch kein Lied?', 'Dann das Lied, das es werden soll.')]);
  G('erstestreffen', 'Das erste Treffen', 'Party', ['jga'], '', [],
    ['In 45 Sekunden das erste Treffen mit dem Partner nachspielen. Ein Gast, der will, spielt mit.', 'Geschafft, wenn die Szene erkennbar ist und die Gäste klatschen.'],
    null);
  G('versprechen', 'Drei Versprechen', 'Kopf', ['jga'], '', [],
    ['Drei Versprechen an die Freunde, die auch nach der Hochzeit gelten: der Stammtisch, der Jahresausflug, die eine Sache, die bleibt.', 'Geschafft, wenn die Gäste zu allen drei Ja sagen.'],
    null);
  G('filmhochzeit', 'Film mit Hochzeit', 'Party', ['jga'], '', [],
    ['Einen Film oder eine Serie mit einer Hochzeitsszene pantomimisch darstellen, kein Wort. Die Gäste raten.', 'Geschafft, wenn der Titel in 60 Sekunden fällt.'],
    ['Beide stellen nacheinander je einen Film dar.', 'Gewonnen hat, wessen Film schneller erraten wird.']);
  G('suessgeschichte', 'Die süßeste Geschichte', 'Kopf', ['jga'], 'Münzen', ['muenzen'],
    ['Münze werfen. Kopf: die süßeste Geschichte über den Partner erzählen. Zahl: die süßeste Geschichte über sich selbst. 30 Sekunden.', 'Geschafft, wenn die Geschichte erzählt ist und die Gäste klatschen.'],
    null);

  /* ---------- for every party ---------- */
  G('dreiworte', 'Drei Wörter, eine Geschichte', 'Kopf', null, '', [],
    ['Drei Gäste nennen je ein Wort. Daraus in 30 Sekunden eine Geschichte erzählen, in der alle drei Wörter vorkommen.', 'Geschafft, wenn alle drei Wörter drin sind und die Geschichte ein Ende hat.'],
    ['Beide bekommen dieselben drei Wörter und erzählen je eine Geschichte.', 'Gewonnen hat, wessen Geschichte mehr Applaus bekommt.']);
  G('komplimentblitz', 'Komplimente-Blitz', 'Kopf', null, '', [],
    ['Fünf Gästen in 30 Sekunden je ein ehrliches Kompliment machen, jedes ein anderes.', 'Geschafft, wenn fünf verschiedene Komplimente in 30 Sekunden gesagt sind.'],
    ['Beide machen abwechselnd Komplimente, keins doppelt.', 'Gewonnen hat, wem nicht als Erstem die Komplimente ausgehen.']);
  G('lebensmotto', 'Dein Motto', 'Kopf', null, '', [],
    ['Ein Lebensmotto aus höchstens fünf Wörtern erfinden und in einem Satz begründen.', 'Geschafft, wenn das Motto steht und die Gäste klatschen.'],
    ['Beide stellen ihr Motto vor.', 'Gewonnen hat, wessen Motto lauteren Applaus bekommt.']);
  G('gemeinsamkeit', 'Drei Gemeinsamkeiten', 'Kopf', null, '', [],
    ['Mit dem Gast, den man am wenigsten kennt, in 60 Sekunden drei Gemeinsamkeiten finden. Der Gast muss wollen.', 'Geschafft, wenn drei Gemeinsamkeiten gefunden sind, die beide bestätigen.'],
    null);
  G('stimmenorakel', 'Stimmen-Orakel', 'Kopf', null, 'Augenbinde oder Schal', ['augenbinde'],
    ['Augen verbinden. Drei Gäste, die wollen, sagen nacheinander „Prost“ mit verstellter Stimme. Wer war es?', 'Geschafft, wenn zwei von drei erkannt werden.'],
    ['Beide hören blind dieselben drei Stimmen.', 'Gewonnen hat, wer mehr erkennt.']);
  G('zehnjaehrig', 'Du mit zehn', 'Kopf', null, '', [],
    ['In 30 Sekunden erzählen, was das eigene Zehn-Jahre-Ich zu diesem Abend sagen würde.', 'Geschafft, wenn die 30 Sekunden voll sind und ein Satz direkt vom Zehnjährigen dabei ist.'],
    null);
  G('schlagzeile', 'Schlagzeile des Abends', 'Kopf', null, '', [],
    ['In 20 Sekunden eine Zeitungsschlagzeile über diesen Abend erfinden, höchstens acht Wörter.', 'Geschafft, wenn die Gäste klatschen.'],
    ['Beide erfinden je eine Schlagzeile.', 'Gewonnen hat, wessen Schlagzeile mehr Applaus bekommt.']);
  G('dankbar', 'Drei Dinge', 'Kopf', null, '', [],
    ['Drei Dinge nennen, für die man diese Woche dankbar war. Keins davon darf Geld sein.', 'Geschafft, wenn drei Dinge in 20 Sekunden gesagt sind.'],
    null);
  G('letztesfoto', 'Das letzte Foto', 'Party', null, '', [],
    ['Das letzte Foto auf dem Handy zeigen und in einem Satz erklären. Wer nicht will, nimmt ein Foto seiner Wahl.', 'Geschafft, wenn das Foto gezeigt und erklärt ist.'],
    ['Beide zeigen ihr letztes Foto.', 'Gewonnen hat, wessen Foto mehr Lacher bekommt.']);
  G('gegenstandsgeschichte', 'Die Geschichte des Gegenstands', 'Kopf', null, '', [],
    ['Ein Gast reicht einen Gegenstand aus seiner Tasche. 30 Sekunden dessen Lebensgeschichte erzählen, frei erfunden, in der Ich-Form.', 'Geschafft, wenn die 30 Sekunden ohne Stocken voll sind.'],
    ['Beide bekommen je einen Gegenstand und erzählen.', 'Gewonnen hat, wessen Geschichte mehr Applaus bekommt.']);
  G('zukunftsfoto', 'Das Foto in 20 Jahren', 'Kopf', null, '', [],
    ['Beschreiben, wie das Foto von einem selbst in 20 Jahren aussieht: wo, mit wem, was im Hintergrund.', 'Geschafft, wenn alle drei Dinge gesagt sind.'],
    null);
  G('werbespot', 'Werbespot', 'Party', null, '', [],
    ['20 Sekunden Werbespot für sich selbst als Mitbewohner, Reisebegleitung oder Kollegen, mit Slogan am Ende.', 'Geschafft, wenn der Slogan kommt und die Gäste klatschen.'],
    ['Beide drehen je einen Spot.', 'Gewonnen hat, wessen Spot mehr Applaus bekommt.']);
  G('raumblind', 'Der Raum mit geschlossenen Augen', 'Kopf', null, '', [],
    ['Augen zu. Fünf Dinge nennen, die gerade im Raum zu sehen sind, mit ihrer Farbe. Die Gäste prüfen.', 'Geschafft, wenn vier von fünf stimmen.'],
    ['Beide nennen mit geschlossenen Augen je fünf Dinge.', 'Gewonnen hat, wer mehr Treffer hat.']);
  G('fantasiesprache', 'Fantasiesprache', 'Party', null, '', [],
    ['Ein Gast flüstert einen von drei Sätzen: „Ich habe Hunger“, „Mir ist kalt“, „Ich liebe diese Party“. Den Satz in einer erfundenen Sprache sagen, mit Gesten. Die Gäste raten, welcher es war.', 'Geschafft, wenn der Satz erraten wird.'],
    ['Beide bekommen je einen Satz.', 'Gewonnen hat, wessen Satz schneller erraten wird.']);
  G('kuerzestfreund', 'Rede auf den Neuesten', 'Kopf', null, '', [],
    ['20 Sekunden Lobrede auf den Gast, den man am kürzesten kennt, mit mindestens einer Sache, die man an ihm bemerkt hat.', 'Geschafft, wenn der Gast am Ende lächelt oder klatscht.'],
    null);

  list.forEach(function (g) { if (!g.only) delete g.only; GAMES.push(g); });
  Object.keys(T).forEach(function (k) { GAME_TEXT[k] = T[k]; });
})();
