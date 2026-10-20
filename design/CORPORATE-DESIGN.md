# zparkling · Corporate-Design-Linie

Stand: v41. Diese Linie beschreibt, wie zparkling aussieht, sich bewegt und spricht.
Sie ist aus den Bereichen abgeleitet, die sich schon „fertig“ anfühlen (Game Pass,
Einladungs-Container, Karte ziehen, Pass-Aktivierung) und gilt ab jetzt für jeden Screen.

## 1. Warum sich Game Pass, Einladung und Karte ziehen „wertvoll“ anfühlen

| Merkmal | Was dort passiert | Was fehlt, wo es „nur funktioniert“ |
|---|---|---|
| **Hero-Objekt** | Ein greifbares Ding steht im Mittelpunkt: das goldene Ticket, die Sammelkarte, die aufklappbare Einladung mit QR. | Listen und Zeilen ohne Mittelpunkt, der Blick weiß nicht, wo er hin soll. |
| **Tiefe und Glanz** | Gold auf Nachtblau, weiche Glow-Schatten, harte Knopfkanten, ein Shine, der einmal über das Objekt läuft. | Flache Karten in Surface-Grau, gleiche Helligkeit überall. |
| **Ein Moment** | Die Aktion hat eine Antwort: Strahlen beim Kartenziehen, der Pass „zischt“, Punkte zählen hoch. | Tipp → neuer Screen, ohne Übergang, ohne Bestätigung. |
| **Führung** | Der nächste Schritt steht da („Erst das Datum wählen“, „Karte einstecken · +25“). Eine Hauptaktion, alles andere leiser. | Mehrere gleich laute Knöpfe, Überschriften ohne Aufforderung. |
| **Exklusivität** | Seltenheit wird gezeigt (Silber, „Beliebt · Bester Wert“, „Karte 1 von 2“). | Alles gleichwertig, nichts ist besonders. |

Das Ziel: Jeder Screen bekommt diese fünf Dinge, in der Dosis, die ihm zusteht.
Ein Einstellungs-Screen braucht keinen Strahlenkranz, aber ein Hero-Objekt, eine Hauptaktion und eine Antwort auf jeden Tipp.

## 2. Markenkern

- **Satz:** Euer Abend, gespielt statt geplant.
- **Charakter:** warm, charmant statt peinlich, ein Augenzwinkern, nie Zwang.
- **Bild:** Nachthimmel mit Konfetti. Dunkle Bühne, bunte Objekte, Gold für das Wertvolle.
- **Metaphern:** Ticket (Game Pass), Sammelkarte (Bonuskarten, Rollen), Girlande (Fortschritt), Einladung (Gäste).

## 3. Farben

Bühne (dunkel):
- `--page #0C0A1A` Hintergrund der Seite, Browserleiste (außer Game Pass: Gold `#F2B33D`).
- `--ink #15122B` Tinte: Text und Knöpfe auf Farbflächen, Umrandung der Embleme.
- `--surface #211D3D`, `--surface-2 #2C2750` Werkzeug-Karten; `--line #312C58`, `--line-2 #3A3463`.
- `--text #F4F1FF`, `--white #FFFFFF`, `--muted #ABA4D4`.

Konfetti (Akzente) und ihre Bedeutung:
- `--orange #FF7A45` **die Hauptaktion** (eine pro Screen), Hero-Karte der Hauptperson.
- `--sun #FFC940` **Wert und Belohnung**: Game Pass, Punkte, Level-Up, Gewinner. Sparsam.
- `--mint #48D9A6` **geschafft, bereit, Gäste-Link**: Speichern-CTA im „Bereit“-Zustand, Haken, Fortschritt voll.
- `--violet #9886FF` **Erklärung, KI, Anleitung**, Zeit.
- `--pink #FF8FC4` **Gäste und Beiträge**.
- `#5B8CFF` Sky (Schätzen, Zahlen), `#FF9A73` Koralle (Rollen), `#6FE3FF`, `#B6F07C` nur im Intro.

Regeln:
1. Farbfläche trägt Tinte (`--ink`), dunkle Fläche trägt Weiß.
2. Gold nur, wenn etwas gewonnen oder gekauft wird. Nie als Deko auf Werkzeug-Screens.
3. Jede Kategorie (Fragen-Arten, Anlässe) hat ihre feste Farbe und ihr Emblem, überall gleich.

## 4. Typografie

- **Display:** Unbounded, 800/900, `letter-spacing -0.02em … -0.03em`. Für Überschriften, Zahlen, Kartentitel, Preise.
- **Body:** Figtree, 600 für Fließtext, 700 für Sub-Zeilen, 800 für Knöpfe und Namen.
- Skala: Hero-Titel 32 · H1 26 · H2 22 · Abschnitt 18 · Kartentitel 17 · Text 15 · Sub 13 · Eyebrow 11.5 (Versalien, `+0.04em`).
- Zahlen immer `.num` (Tabellenziffern) und Display-Schrift.

## 5. Form und Tiefe

Radien: Hero 32 · Karte/Panel 24–26 · Zeile 18–20 · Knopf 18–20 · Icon-Kachel 11–17 · Chip 999.

Tiefe (vier Stufen, mehr gibt es nicht):
1. **Werkzeug-Karte:** `background var(--surface)`, `inset 0 0 0 1.5px var(--line)`. Ruhig.
2. **Farbfläche (Einladung):** Vollton mit `inset 0 -6px 0 rgba(0,0,0,.14)` als Knopfkante.
3. **Schwebendes Objekt:** `0 18px 40px rgba(0,0,0,.35)` plus Glow `0 0 0 3px <Farbe>` oder `0 0 22px <Farbe 45 %>`.
4. **Knopf:** harte Kante `0 5px 0 rgba(0,0,0,.3)`, beim Drücken `translateY(3px)` und `0 2px 0`.

Muster: Punktraster `radial-gradient(rgba(…,.1) 1.2px, transparent 1.6px) 0 0 / 12px 12px` auf Farbflächen und Tickets.

## 6. Bewegung

- **Eintritt:** `cubic-bezier(.2,1.2,.4,1)` (Feder), 350–500 ms, Stagger 45 ms pro Element. Von unten (16 px) mit leichtem Scale (.97).
- **Übergang zwischen Screens:** der neue Inhalt kommt als Ganzes, kein Folien-Fade.
- **Momente** (nur bei Belohnung oder Erfolg): Strahlen, Shine, Konfetti, Pop (`.45s cubic-bezier(.2,1.6,.4,1)`), Haptik `[20,40,20]`.
- **Dauerbewegung** nur für Laufband, Timer, Lampen, Fortschritt. Immer dezent, immer `prefers-reduced-motion` respektieren.
- **Antwort auf Tipp:** jeder Knopf hat `:active` (Scale .97 oder Kante), jede Änderung einen Toast oder einen sichtbaren Zustand.

## 7. Komponenten

- **Topbar:** Zurück-Pill links (mit Ziel-Namen), Titel mittig. Kein Screen ohne Weg zurück.
- **Hero-Karte:** Farbfläche, Girlande, Avatar(e), Titel, eine Hauptaktion.
- **Panel (`.qp`):** farbiges Emblem, Titel mit Zähler, Lead, Inhalt. Abschnitte sind Panels, keine losen Überschriften.
- **Zeile (`.hm-row`, `.row`):** Icon-Kachel, Titel, Sub, Chevron. Für Navigation, nie für Daten ohne Ziel.
- **CTA:** `.cta` Orange = Hauptaktion; `.cta.mint` = fertig/speichern, wenn alles bereit ist; `.btn-ghost` = zweite Wahl; `.btn-dark` = zurück/neutral. Der Knopf sagt, was passiert („Diesen Abend ausprobieren“, „Karte einstecken · +25“).
- **Ticket (`.dp-tk`):** Anlass-Auswahl, aufklappbar, Farbfläche mit Tinte.
- **Chip:** Auswahl in einer Gruppe, `is-sel` in Orange.
- **Stepper, Switch, Range:** immer mit Name und Sub, nie nackt.
- **Lock-Karte:** erklärt, was es mit dem Game Pass gibt; nie nur ein Schloss.
- **Leerzustand:** Emblem, ein Satz, eine Aktion. Nie nur „Noch nichts da“.
- **Toast:** kurz, unten, eine Zeile.
- **Fact-Card „Wusstest du?“:** eine pro Screen, am Ende.

Embleme (`EMB_ART`, 48×48, Tinte-Umrandung 2.5, flächig bunt) für Bedeutungsträger; Sprite-Icons (24, Strich 2) für UI.
Avatare (`avatarSVG`) überall in derselben Form (Kreis, Tinte-Rand auf Farbflächen).

## 8. Tonalität

- Du/ihr. Kurz. Ein Augenzwinkern, aber kein Witz auf Kosten von jemandem.
- Knöpfe benennen das Ergebnis. Überschriften sind Aufforderungen oder Versprechen („Alles bereit?“, „Euer Abend kann kommen.“).
- Fehler sind konkret und freundlich („Fehlt noch: Antwort“), nie rot ohne Hinweis.
- Keine Prozentzahlen in Erklärtexten, keine Tastatur-Emojis.
- Nie Zwang: „freiwillig“, „Niemand muss“, Gäste werden nie gezählt oder gezwungen.

## 9. Die acht Regeln für jeden Screen

1. **Ein Hero.** Etwas, das man ansehen will, oben.
2. **Eine Hauptaktion.** Orange. Alles andere leiser.
3. **Jeder Tipp bekommt eine Antwort.** Kante, Toast, Pop, Haptik.
4. **Belohnung ist ein Moment.** Strahlen und Shine nur, wenn etwas gewonnen wurde.
5. **Führung statt Menü.** Der nächste Schritt steht auf dem Screen.
6. **Farbfläche lädt ein, dunkle Karte arbeitet.** Nicht mischen.
7. **Gold ist selten.**
8. **Die Kleinigkeiten:** Leerzustand, Tastatur, Fokus-Ring, Browserleiste, Zurück-Weg, Ladezeit.
