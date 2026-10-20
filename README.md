# zparkling

Das Partyspiel für Geburtstag, Kranz und JGA. Die Gäste schicken vorab per Link ein paar Kleinigkeiten,
daraus baut die App die Spiele für den Abend. Läuft komplett im Browser, optimiert fürs Handy.

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `public/` | Die fertige Website. Diesen Ordner liefert Cloudflare Pages aus. |
| `functions/` | Läuft bei Cloudflare vor jeder Anfrage: leitet `zparkling.com` auf `www.zparkling.com` um und hält Suchmaschinen fern. |
| `src/` | Die Quellen: `head.html` (Stil, Icons), die Module `01-…` bis `13-…`, `tail.html`, `site-head.html` (Seitenrahmen der Website). |
| `harness/` | Prüfungen ohne Browser (`node harness/check33.js`, `node harness/sim.js`). |
| `test/` | Browser-Tests mit Playwright (`node test/site.js` prüft die Website wie ausgeliefert). |
| `assets/` | Quelle der App-Icons (`node assets/render-icons.js`). |

## Bauen

```bash
./build.sh
```

Erzeugt `public/index.html` (Website), `build/app.html` (dieselbe App als Fragment, z. B. für claude.ai)
und die Testseiten. Nach jeder Änderung in `src/` bauen und `public/index.html` mit committen.

## Online stellen (Cloudflare Pages)

Workers & Pages → Erstellen → Pages → Mit Git verbinden → `zparkling` wählen.

- Framework: keins
- Build-Befehl: `exit 0` (baut nichts, die Seite liegt fertig in `public/`)
- Ausgabeverzeichnis: `public`

Danach unter „Custom domains“ `www.zparkling.com` und `zparkling.com` hinzufügen. Cloudflare legt die DNS-Einträge selbst an,
`zparkling.com` leitet automatisch auf `www.zparkling.com` weiter. Jeder Push auf `main` geht automatisch online.

## Suchmaschinen

Die Seite ist noch nicht für Suchmaschinen freigegeben (`noindex`). Freigeben, wenn es losgehen soll:

- `public/_headers`: die `X-Robots-Tag`-Regel löschen
- `functions/_middleware.js`: `NOINDEX = false`
- `src/site-head.html`: die Zeile `<meta name="robots" …>` löschen, dann `./build.sh`
