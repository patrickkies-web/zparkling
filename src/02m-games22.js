/* =========================================================
   v22: household games, reaction games on the phone and games
   with a partner from the guests. sp = the game has its own
   little screen in the app (timer, word caller, reaction pad).
   ========================================================= */
[
  { id: 'ketchup', label: 'Ketchup (Quetschflasche)', g: 'kueche' },
  { id: 'kuechenwaage', label: 'Küchenwaage', g: 'kueche' },
  { id: 'ofenhandschuh', label: 'Ofenhandschuhe', g: 'kueche' },
  { id: 'pfanne', label: 'Pfanne', g: 'kueche' },
  { id: 'eierkarton', label: 'Leerer Eierkarton', g: 'kueche' },
  { id: 'topf', label: 'Kochtopf', g: 'kueche' },
  { id: 'plastikflasche', label: 'Plastikflasche (0,5 l)', g: 'tisch' },
  { id: 'stoffbeutel', label: 'Stoffbeutel oder Kissenbezug', g: 'haushalt' }
].forEach(function (m) { if (!MATERIALS.some(function (x) { return x.id === m.id; })) MATERIALS.push(m); });
['pfanne', 'topf', 'plastikflasche'].forEach(function (id) { if (MAT_PRESET_PARTY.indexOf(id) < 0) MAT_PRESET_PARTY.push(id); });

[
  { id: 'daumenblitz', name: 'Daumen-Blitz', cat: 'Reaktion', mat: '', needs: [], min: 2, sp: 'blitz' },
  { id: 'loeffelreflex', name: 'Löffel-Reflex', cat: 'Reaktion', mat: 'Ein Löffel', needs: ['loeffel'], min: 2, sp: 'loeffel' },
  { id: 'lippenlesen', name: 'Lippenlesen', cat: 'Kopf', mat: '', needs: [], min: 3, sp: 'lippen' },
  { id: 'gedankenleser', name: 'Gedankenleser', cat: 'Kopf', mat: '', needs: [], min: 2, sp: 'gedanken' },
  { id: 'ketchup', name: 'Ketchup-Montagsmaler', cat: 'Party', mat: 'Ketchup, zwei Teller', needs: ['ketchup'], min: 4, sp: 'ketchup' },
  { id: 'zwiebel', name: 'Zwiebel-Look', cat: 'Party', mat: '', needs: [], min: 3 },
  { id: 'ofenhandschuh', name: 'Ofenhandschuh-Challenge', cat: 'Geschick', mat: 'Ofenhandschuhe', needs: ['ofenhandschuh'], min: 2 },
  { id: 'kuechenwaage', name: 'Küchenwaagen-Duell', cat: 'Kopf', mat: 'Küchenwaage, Schale, etwas zum Abfüllen (Nudeln, Gummibärchen, Kronkorken)', needs: ['kuechenwaage'], min: 1 },
  { id: 'flaschenflip', name: 'Flaschen-Flip', cat: 'Geschick', mat: 'Plastikflasche, ein Drittel mit Wasser', needs: ['plastikflasche'], min: 1 },
  { id: 'pfannenprofi', name: 'Pfannen-Profi', cat: 'Geschick', mat: 'Pfanne, Bierdeckel', needs: ['pfanne', 'bierdeckel'], min: 1 },
  { id: 'eierkarton', name: 'Eierkarton-Bingo', cat: 'Geschick', mat: 'Leerer Eierkarton, Tischtennisbälle', needs: ['eierkarton', 'tischtennis'], min: 1 },
  { id: 'topfecho', name: 'Topf-Echo', cat: 'Kopf', mat: 'Kochtopf, Löffel, Gabel, Deckel und was die Küche hergibt', needs: ['topf', 'loeffel'], min: 2 },
  { id: 'tastbeutel', name: 'Tastbeutel', cat: 'Kopf', mat: 'Stoffbeutel oder Kissenbezug, Kleinkram aus dem Haus', needs: ['stoffbeutel'], min: 2 }
].forEach(function (g) { if (!GAMES.some(function (x) { return x.id === g.id; })) GAMES.push(g); });

(function () {
  var T = {
    daumenblitz: {
      d: ['Das Handy liegt flach zwischen euch, jeder legt einen Daumen auf seine Hälfte. Die Fläche wird erst dunkel, dann grün. Erst bei Grün draufdrücken, wer vorher drückt, verliert die Runde.', 'Gewonnen hat, wer zuerst zwei Runden holt.'],
      f: [['Gegen wen spiele ich?', 'Gegen die andere Hauptperson oder einen Gast. Mit Gästeliste sucht ihr ihn aus oder lasst das Rad entscheiden.'], ['Was zählt als zu früh?', 'Jeder Druck, bevor die Fläche grün ist.'], ['Beide fast gleichzeitig?', 'Das Handy entscheidet auf die Millisekunde.']]
    },
    loeffelreflex: {
      d: ['Ein Löffel liegt zwischen euch, beide Hände flach auf dem Tisch. Die App ruft Wörter. Nur beim Wort „Löffel“ zugreifen. Wer bei einem anderen Wort greift, verliert die Runde.', 'Gewonnen hat, wer zuerst zwei Runden holt.'],
      f: [['Zählt Antippen schon?', 'Nein, der Löffel muss in der Hand sein.'], ['Und bei „Löffelbiskuit“?', 'Falsches Wort. Wer da greift, verliert die Runde.']]
    },
    lippenlesen: {
      s: ['Ein Gast deiner Wahl hält dir die Ohren zu. Ein anderer Gast spricht den Satz aus der App ohne Ton, aber deutlich vor. Du liest ihn von den Lippen ab.', 'Geschafft, wenn der Satz in 90 Sekunden im Kern erraten ist.'],
      t: ['Gäste eurer Wahl halten euch beiden die Ohren zu. Ein Gast spricht den Satz aus der App ohne Ton vor, ihr ratet gemeinsam.', 'Geschafft, wenn ihr den Satz in 90 Sekunden im Kern erratet.'],
      f: [['Was heißt im Kern?', 'Die wichtigen Wörter stimmen. Kleinkram wie „der“ oder „und“ ist egal.'], ['Darf der Sprecher wiederholen?', 'So oft er will, aber ohne Ton.']]
    },
    gedankenleser: {
      s: ['Such dir jemanden aus, der deine Gedanken lesen kann. Die App zeigt eine Kategorie mit vier Begriffen. Du tippst heimlich einen an, dann tippt dein Partner, ohne deinen zu sehen. Fünf Runden.', 'Geschafft, wenn ihr in mindestens drei Runden dasselbe wählt. Sonst trinkt ihr beide.'],
      f: [['Darf man sich absprechen?', 'Nein, kein Wort, kein Zwinkern.'], ['Wer hält das Handy?', 'Erst du, dann gibst du es verdeckt weiter.']]
    },
    ketchup: {
      d: ['Zwei Zweierteams. Einer malt mit Ketchup auf einen Teller, der andere rät. Die App zeigt dem Maler die Begriffe. Jedes Team hat 90 Sekunden.', 'Gewonnen hat das Team mit mehr erratenen Begriffen. Das andere Team trinkt.'],
      f: [['Darf man Buchstaben malen?', 'Nein, nur Bilder.'], ['Ein Begriff ist zu schwer?', 'Überspringen geht, kostet aber Zeit.'], ['Was gilt bei Gleichstand?', 'Dann trinkt niemand.']]
    },
    zwiebel: {
      s: ['Leih dir Kleidungsstücke von den Gästen und zieh sie übereinander an: Jacke, Schal, Mütze, alles zählt. Die Gäste dürfen helfen.', 'Geschafft, wenn nach 60 Sekunden fünf geliehene Teile sitzen.'],
      d: ['Beide leihen sich gleichzeitig Kleidungsstücke von den Gästen und ziehen sie übereinander an.', 'Gewonnen hat, wer nach 60 Sekunden mehr geliehene Teile trägt.'],
      f: [['Zählen Schmuck und Brillen?', 'Ja, alles, was man tragen kann.'], ['Muss es richtig angezogen sein?', 'Es muss halten, ohne dass man es festhält.']]
    },
    ofenhandschuh: {
      s: ['Ofenhandschuhe an beide Hände. Damit einem Gast den Schuh aufschnüren und wieder zu einer Schleife binden.', 'Geschafft, wenn nach 60 Sekunden eine Schleife hält.'],
      d: ['Beide ziehen Ofenhandschuhe an und schnüren gleichzeitig je einem Gast den Schuh auf und wieder zu.', 'Gewonnen hat, wer zuerst eine Schleife fertig hat, die hält.'],
      f: [['Keiner hat Schnürsenkel?', 'Dann eine Schleife mit einem Geschirrtuch um ein Stuhlbein binden.']]
    },
    kuechenwaage: {
      s: ['Nach Gefühl eine Schale füllen, bis du glaubst: genau 100 Gramm. Dann ab auf die Waage.', 'Geschafft, wenn es höchstens 10 Gramm daneben ist.'],
      d: ['Beide füllen nach Gefühl eine Schale, bis sie glauben: genau 100 Gramm. Dann wird gewogen.', 'Gewonnen hat, wer näher an 100 Gramm liegt.'],
      f: [['Darf man die Waage vorher anschauen?', 'Nein, sie bleibt aus, bis gewogen wird.']]
    },
    flaschenflip: {
      s: ['Eine Plastikflasche, ein Drittel mit Wasser, am Hals halten und so werfen, dass sie sich einmal dreht und stehend landet. Fünf Versuche.', 'Geschafft, wenn sie einmal stehen bleibt.'],
      d: ['Abwechselnd wirft jeder die Plastikflasche, ein Drittel mit Wasser, so dass sie sich dreht und stehend landet.', 'Gewonnen hat, wer zuerst zweimal einen Stand schafft.'],
      f: [['Zählt es auf dem Deckel?', 'Ja, auch ein Kopfstand zählt.']]
    },
    pfannenprofi: {
      s: ['Einen Bierdeckel in die Pfanne legen, wie einen Pfannkuchen hochwerfen und mit der Pfanne wieder auffangen.', 'Geschafft, wenn das dreimal hintereinander klappt.'],
      d: ['Abwechselnd wirft jeder den Bierdeckel aus der Pfanne hoch und fängt ihn wie einen Pfannkuchen wieder auf.', 'Gewonnen hat, wer nicht als Erster daneben fängt.'],
      f: [['Muss er sich drehen?', 'Ja, einmal umdrehen in der Luft, sonst zählt es nicht.']]
    },
    eierkarton: {
      s: ['Ein offener Eierkarton liegt einen Meter entfernt. Fünf Tischtennisbälle mit einmal Aufprallen auf dem Tisch hineinwerfen.', 'Geschafft, wenn zwei Bälle in den Fächern liegen bleiben.'],
      d: ['Ein offener Eierkarton liegt zwischen euch. Abwechselnd je fünf Tischtennisbälle mit einmal Aufprallen hineinwerfen.', 'Gewonnen hat, wer mehr Bälle in den Fächern hat.']
    },
    topfecho: {
      s: ['Augen zu. Ein Gast schlägt nacheinander mit vier Dingen aus der Küche gegen einen Topf, zum Beispiel Löffel, Gabel, Deckel und Schneebesen.', 'Geschafft, wenn drei von vier am Klang erkannt werden.'],
      d: ['Beide schließen die Augen. Ein Gast schlägt mit Dingen aus der Küche gegen einen Topf. Wer zuerst richtig ruft, bekommt den Punkt. Fünf Runden.', 'Gewonnen hat, wer mehr Punkte holt.']
    },
    tastbeutel: {
      s: ['Ein Gast steckt heimlich sechs Dinge aus dem Haus in einen Beutel. Nur mit der Hand hineingreifen, nicht hineinschauen.', 'Geschafft, wenn in 60 Sekunden fünf Dinge richtig ertastet sind.'],
      d: ['Ein Gast füllt zwei Beutel mit je fünf Dingen aus dem Haus. Beide tasten gleichzeitig, ohne hineinzuschauen, und rufen ihre Dinge laut.', 'Gewonnen hat, wer nach 60 Sekunden mehr richtig ertastet hat.']
    }
  };
  Object.keys(T).forEach(function (k) { GAME_TEXT[k] = T[k]; });
})();
