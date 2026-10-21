# -*- coding: utf-8 -*-
"""Die rechtlichen Seiten der Website: Verantwortung (Alkohol, Sicherheit), Nutzungsbedingungen,
   Impressum, Datenschutz, dazu das Alterslabel age-de.xml. python3 site/legal.py (aus dem Projektordner).
   Gleiche Linie wie die Ratgeber-Seiten (ratgeber.css). Platzhalter in eckigen Klammern füllt der Betreiber."""
import os, sys, html, json
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'ratgeber'))
from build import LOGO, FONTS, PLAY, SITE, esc
OUT = os.path.join(ROOT, 'public')
STAND = 'Oktober 2026'

# Der Betreiber: hier eintragen, dann python3 site/legal.py
BETREIBER = {
    'name': '[Vorname Nachname]',
    'strasse': '[Straße und Hausnummer]',
    'ort': '[PLZ Ort]',
    'land': 'Deutschland',
    'email': '[E-Mail-Adresse]',
    'telefon': '',          # freiwillig
    'ustid': '',            # nur, wenn vorhanden (Kleinunternehmer: leer lassen)
}
PLACEHOLDER = any(v.startswith('[') for v in BETREIBER.values() if v)

def page(slug, title, description, h1, lead, body, kicker='Rechtliches', age=0):
    url = SITE + '/' + slug + '/'
    links = ''.join('<a href="/%s/">%s</a>' % (s, t) for s, t in [('verantwortung', 'Verantwortung'), ('nutzungsbedingungen', 'Nutzungsbedingungen'), ('impressum', 'Impressum'), ('datenschutz', 'Datenschutz')] if s != slug)
    ld = json.dumps({"@context": "https://schema.org", "@type": "WebPage", "name": h1, "url": url, "inLanguage": "de", "isPartOf": {"@type": "WebSite", "name": "zparkling", "url": SITE + '/'}}, ensure_ascii=False)
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(description)}"><meta property="og:url" content="{url}"><meta property="og:locale" content="de_DE">
<meta name="age-de-meta-label" content="age={age} v=1.0 kind=sl protocol=all">
<meta name="theme-color" content="#0C0A1A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
{FONTS}
<link rel="stylesheet" href="/ratgeber/ratgeber.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="rg-top"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><nav class="rg-nav" aria-label="Seiten"><a href="/ratgeber/">Ratgeber</a><a class="rg-btn sm" href="/">{PLAY}Zur App</a></nav></header>
<main class="rg-main">
<nav class="rg-crumbs" aria-label="Pfad"><a href="/">zparkling</a><span>›</span><span aria-current="page">{esc(h1)}</span></nav>
<section class="rg-hero" style="--c:#C6CFDA;padding-top:28px"><span class="rg-kicker">{esc(kicker)}</span><h1>{esc(h1)}</h1><p class="rg-lead">{lead}</p><p class="rg-meta">Stand {STAND}</p></section>
<article class="rg-article rg-legal">
{body}
</article>
<section class="rg-related"><h2>Weitere Seiten</h2><p class="rg-all">{links}</p></section>
</main>
<footer class="rg-foot"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><span>Für Erwachsene · <a href="/verantwortung/">Verantwortung</a> · <a href="/nutzungsbedingungen/">Nutzungsbedingungen</a> · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span></footer>
</body>
</html>
'''

def h2(t): return '<h2 id="%s">%s</h2>' % (html.escape(t.lower().replace(' ', '-').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue').replace('ß', 'ss').replace('.', '').replace(',', '')), esc(t))
def p(t): return '<p>%s</p>' % t
def ul(items): return '<ul>' + ''.join('<li>%s</li>' % x for x in items) + '</ul>'
def ol(items): return '<ol>' + ''.join('<li>%s</li>' % x for x in items) + '</ol>'
def note(t): return '<div class="rg-note">%s</div>' % t

# ---------- Verantwortung ----------
verantwortung = '\n'.join([
    h2('Für Erwachsene'),
    p('zparkling richtet sich ausschließlich an volljährige Personen. Wer die App nutzt oder einen Abend damit leitet, bestätigt, dass er mindestens 18 Jahre alt ist. Alkohol an Kinder und Jugendliche abzugeben oder ihnen den Konsum zu gestatten, ist in Deutschland verboten (§ 9 Jugendschutzgesetz). Ein Abend mit zparkling ist deshalb nur mit erwachsenen Mitspielenden ein Abend mit Alkohol.'),
    h2('Die App schreibt niemandem vor, zu trinken'),
    p('zparkling ist ein Partyspiel mit Aufgaben, Quizrunden und Minispielen. Was bei einer verlorenen Aufgabe fällt, legt der Spielleiter vor dem Abend fest: ein Pinnchen, ein Schluck vom eigenen Getränk oder ein Glas Wasser. Der Modus <strong>Ohne Alkohol</strong> steht gleichberechtigt neben dem Modus mit Alkohol, alle Spiele funktionieren in beiden Modi gleich.'),
    ul(['Niemand muss trinken. Wer Nein sagt, hat recht, ohne Begründung und ohne Kommentar. Wasser zählt immer.',
        'Wer fährt, schwanger ist oder stillt, Medikamente nimmt, krank ist oder einfach nicht mag, spielt ohne Alkohol mit. Dafür gibt es den Wasser-Joker und die Einheit „Glas Wasser“.',
        'Gäste werden nie gezählt und nie zum Mitmachen gedrängt. Wer zuschauen will, schaut zu.']),
    h2('Was die App bremst'),
    p('Die Regeln der App sind so gebaut, dass ein Abend nicht in übermäßigen Konsum kippt. Sie sind feste Grenzen, keine Empfehlungen:'),
    ul(['<strong>Höchstens eine Einheit pro Spiel und Person.</strong> Nie zwei, egal wie das Spiel ausgeht.',
        '<strong>Ein Maximum für den ganzen Abend</strong>, das der Spielleiter vorab festlegt und das die App nie überschreitet. Darüber gibt es nur noch Wasser.',
        '<strong>Die Tempo-Bremse:</strong> Fällt zu viel in zu kurzer Zeit, setzt die App Wasser statt Alkohol ein oder lässt eine Aufgabe ohne Einsatz laufen.',
        '<strong>Keine Trinkwettbewerbe.</strong> Es gibt kein „Wer trinkt schneller“, kein „Wer trinkt mehr“ und keine Flatrate-Logik. Wer gewinnt, trinkt weniger.',
        '<strong>Wasser-Joker:</strong> Jede Hauptperson kann Einheiten durch Wasser ersetzen, ohne dass die App sie später nachholt.']),
    h2('Wer die Verantwortung trägt'),
    p('zparkling zählt mit und erinnert, mehr kann eine App nicht. Sie misst keinen Promillewert und kennt die Mitspielenden nicht. Die Verantwortung für den Abend liegt beim Gastgeber beziehungsweise Spielleiter und bei jeder Person für sich selbst. Vor einem Abend mit Alkohol bestätigt der Spielleiter in der App:'),
    ol(['Alle, die trinken, sind volljährig.',
        'Niemand muss trinken. Wasser oder Aussetzen ist immer in Ordnung.',
        'Wer fährt, schwanger ist, Medikamente nimmt oder nicht mag, spielt ohne Alkohol mit.',
        'Der Spielleiter achtet auf seine Gäste und beendet den Abend, wenn es jemandem nicht gut geht.']),
    h2('Fahren und Alkohol'),
    p('Wer nach der Party noch fährt, spielt ohne Alkohol, auch mit dem Rad und dem E-Scooter. In Deutschland gilt für Fahranfänger in der Probezeit und für alle unter 21 Jahren ein absolutes Alkoholverbot am Steuer (§ 24c StVG); für alle anderen liegt die Grenze bei 0,5 Promille, bei Ausfallerscheinungen schon darunter. Plant die Heimfahrt vor dem ersten Glas: Taxi, Bahn, ein nüchterner Fahrer.'),
    h2('Wenn es jemandem nicht gut geht'),
    p('Eine Alkoholvergiftung ist ein Notfall. Anzeichen sind Bewusstlosigkeit oder jemand, der nicht mehr richtig ansprechbar ist, Erbrechen im Halbschlaf, sehr langsame oder unregelmäßige Atmung, kalte, bläuliche Haut und Unterkühlung.'),
    ul(['<strong>Notruf 112</strong> wählen, ohne zu zögern. Niemand wird dafür zur Rechenschaft gezogen, dass er Hilfe geholt hat.',
        'Die Person nicht allein lassen, warm halten, bei Bewusstlosigkeit in die stabile Seitenlage bringen.',
        'Keine Hausmittel: Kaffee, kalte Dusche oder „Ausschlafen lassen“ helfen nicht und können gefährlich werden.']),
    h2('Hilfe und Information'),
    p('Wer sich fragt, ob der eigene Konsum noch in Ordnung ist, oder sich um jemanden sorgt, findet Informationen und Beratung bei der Bundeszentrale für gesundheitliche Aufklärung (<a href="https://www.kenn-dein-limit.de/" target="_blank" rel="noopener">kenn-dein-limit.de</a>) und der Deutschen Hauptstelle für Suchtfragen (<a href="https://www.dhs.de/" target="_blank" rel="noopener">dhs.de</a>). Beide nennen auch Beratungsstellen in der Nähe und Telefonnummern.'),
    h2('Fairness'),
    p('Aufgaben in zparkling sind charmant statt peinlich: nichts, was bloßstellt, nichts Verbotenes, keine Berührung ohne klares Ja, keine Fremden, die Nein gesagt haben, keine Minderjährigen. Wer eine Aufgabe nicht mag, tauscht sie oder lässt sie aus. Der Spielleiter entscheidet im Zweifel, und sein Wort gilt.'),
    note('<b>Kurz gesagt:</b> Erwachsene, freiwillig, mit Bremse. zparkling macht den Abend persönlich, nicht betrunken.'),
])

# ---------- Nutzungsbedingungen ----------
anbieter = '%s, %s, %s' % (BETREIBER['name'], BETREIBER['strasse'], BETREIBER['ort'])
nutzung = '\n'.join([
    h2('1. Geltungsbereich und Anbieter'),
    p('Diese Nutzungsbedingungen gelten für die Nutzung der Web-App zparkling unter %s und der dazugehörigen Seiten (zusammen „die App“). Anbieter ist %s (Kontakt siehe <a href="/impressum/">Impressum</a>, „wir“). Mit der Nutzung der App akzeptierst du diese Bedingungen. Verbraucherschutzrechte, die dir nach dem Gesetz zustehen, bleiben von diesen Bedingungen unberührt.' % (SITE.replace('https://', ''), esc(anbieter))),
    h2('2. Was die App ist'),
    p('zparkling ist eine Software, mit der Gastgeber einen Partyabend planen und leiten: Aufgaben, Quizrunden, Minispiele und Runden, die aus Beiträgen der Gäste entstehen. Der Beispiel-Abend ist kostenlos. Für die eigene Party gibt es den Game Pass, eine zeitlich befristete Freischaltung aller Funktionen (digitaler Inhalt, kein Abonnement). Umfang, Laufzeit und Preis werden vor dem Kauf angezeigt.'),
    h2('3. Nur für Erwachsene'),
    p('Die App darf nur von Personen genutzt werden, die mindestens 18 Jahre alt sind. Mit der Nutzung versicherst du, volljährig zu sein. Wer einen Abend leitet, stellt sicher, dass alkoholische Getränke nur an Volljährige ausgeschenkt werden und dass Minderjährige keinen Alkohol konsumieren (§ 9 Jugendschutzgesetz). Gäste-Links dürfen nicht an Minderjährige weitergegeben werden.'),
    h2('4. Alkohol und Eigenverantwortung'),
    p('Die App schreibt niemandem vor, Alkohol zu trinken. Ob bei einer verlorenen Aufgabe ein alkoholisches Getränk, ein Schluck vom eigenen Getränk oder Wasser fällt, entscheidet der Spielleiter; alle Spiele funktionieren ohne Alkohol. Die App zählt und bremst, misst aber keinen Promillewert und kennt die Mitspielenden nicht. Die Entscheidung über Alkoholkonsum und die Verantwortung dafür liegen allein bei den Mitspielenden und beim Spielleiter.'),
    p('Du verpflichtest dich, bei einem Abend mit Alkohol'),
    ul(['niemanden zum Trinken zu drängen und jedes Nein ohne Nachteil zu akzeptieren,',
        'Alkohol nur an Volljährige auszuschenken,',
        'Personen, die fahren, schwanger sind, stillen, Medikamente nehmen oder krank sind, ausschließlich ohne Alkohol mitspielen zu lassen,',
        'die Grenzen der App (eine Einheit pro Spiel, Maximum pro Abend, Tempo-Bremse) nicht zu umgehen und keine Trinkwettbewerbe zu veranstalten,',
        'auf deine Gäste zu achten und den Abend zu beenden, wenn es jemandem nicht gut geht; im Notfall den Notruf 112 zu wählen,',
        'die geltenden Gesetze einzuhalten, insbesondere das Jugendschutzgesetz und das Straßenverkehrsgesetz.']),
    p('Die Hinweise unter <a href="/verantwortung/">Verantwortung</a> sind Teil dieser Nutzungsbedingungen.'),
    h2('5. Inhalte der Nutzer'),
    p('Gastgeber und Gäste geben eigene Inhalte ein (Namen, Erinnerungen, Fragen, Zeichnungen). Dafür ist verantwortlich, wer sie eingibt. Unzulässig sind Inhalte, die beleidigen, bloßstellen, diskriminieren, Rechte Dritter verletzen oder gegen Gesetze verstoßen. Der Spielleiter sieht alle Beiträge vor dem Abend und gibt sie frei oder lehnt sie ab. Wir speichern diese Inhalte nicht auf unseren Servern (siehe <a href="/datenschutz/">Datenschutz</a>).'),
    h2('6. Game Pass: Vertrag, Preis, Laufzeit'),
    p('Der Game Pass wird in der App gekauft. Der Vertrag kommt zustande, wenn du den Kauf mit dem Button „Zahlungspflichtig kaufen“ abschließt und wir den Kauf bestätigen. Alle Preise sind Endpreise in Euro und enthalten die gesetzliche Umsatzsteuer, soweit sie anfällt. Der Pass gilt für die angezeigte Laufzeit und endet automatisch; es gibt keine Verlängerung ohne neuen Kauf und kein Abonnement. Der Spieltag kann einmal verschoben werden, solange die Laufzeit das hergibt.'),
    h2('7. Widerrufsrecht'),
    p('Als Verbraucher hast du beim Kauf des Game Pass ein gesetzliches Widerrufsrecht von vierzehn Tagen. Der Game Pass ist ein digitaler Inhalt, der sofort bereitgestellt wird. Das Widerrufsrecht erlischt deshalb, wenn du vor dem Kauf ausdrücklich zugestimmt hast, dass wir mit der Ausführung vor Ablauf der Widerrufsfrist beginnen, und bestätigt hast, dass du damit dein Widerrufsrecht verlierst (§ 356 Absatz 5 BGB). Ohne diese Zustimmung gilt:'),
    note('<b>Widerrufsbelehrung.</b> Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses. Um dein Widerrufsrecht auszuüben, musst du uns (%s, E-Mail %s) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest. <b>Folgen des Widerrufs:</b> Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Transaktion eingesetzt hast, es sei denn, mit dir wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden dir wegen dieser Rückzahlung Entgelte berechnet.' % (esc(anbieter), esc(BETREIBER['email']))),
    p('<b>Muster-Widerrufsformular</b> (wenn du den Vertrag widerrufen willst, kannst du dieses Formular ausfüllen und an uns zurücksenden): An %s, E-Mail %s. Hiermit widerrufe ich den von mir abgeschlossenen Vertrag über den Kauf des Game Pass, bestellt am [Datum], Name und Anschrift des Verbrauchers, Datum, Unterschrift (nur bei Mitteilung auf Papier).' % (esc(anbieter), esc(BETREIBER['email']))),
    h2('8. Daten im Browser, Verfügbarkeit, Änderungen'),
    p('Die App speichert den Abend, die Gäste-Beiträge und den Game Pass im Speicher deines Browsers, nicht auf unseren Servern. Wer den Browserspeicher löscht oder ein anderes Gerät nutzt, findet die Daten dort nicht wieder; für den Game Pass melde dich in diesem Fall mit dem Kaufbeleg bei uns. Wir bemühen uns um eine ständige Verfügbarkeit, können sie aber nicht garantieren; Wartung und Störungen sind möglich. Wir dürfen die App weiterentwickeln und Funktionen ändern, solange der Kern der gekauften Leistung erhalten bleibt.'),
    h2('9. Haftung'),
    p('Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie nach dem Produkthaftungsgesetz. Bei einfacher Fahrlässigkeit haften wir nur für die Verletzung wesentlicher Vertragspflichten (Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen darfst), und zwar begrenzt auf den vorhersehbaren, vertragstypischen Schaden. Im Übrigen ist die Haftung ausgeschlossen.'),
    p('Die App gibt Aufgaben vor, entscheidet aber nichts über den Konsum von Alkohol. Folgen eines Alkoholkonsums, den Mitspielende eigenverantwortlich entscheiden, sowie Folgen von Aufgaben, die entgegen diesen Bedingungen, den Hinweisen in der App oder dem gesunden Menschenverstand ausgeführt werden, liegen in der Verantwortung der Mitspielenden und des Spielleiters. Die gesetzliche Haftung nach Satz 1 des vorigen Absatzes bleibt unberührt.'),
    h2('10. Schlussbestimmungen'),
    p('Es gilt das Recht der Bundesrepublik Deutschland. Bei Verbrauchern gilt diese Rechtswahl nur, soweit dadurch keine zwingenden Verbraucherschutzvorschriften des Staates entzogen werden, in dem der Verbraucher seinen gewöhnlichen Aufenthalt hat. Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG). Sollte eine Bestimmung dieser Bedingungen unwirksam sein, bleibt der Rest wirksam.'),
])

# ---------- Impressum ----------
impressum = '\n'.join([
    h2('Angaben nach § 5 DDG'),
    p('%s<br>%s<br>%s<br>%s' % (esc(BETREIBER['name']), esc(BETREIBER['strasse']), esc(BETREIBER['ort']), esc(BETREIBER['land']))),
    h2('Kontakt'),
    p('E-Mail: <a href="mailto:%s">%s</a>%s' % (esc(BETREIBER['email']), esc(BETREIBER['email']), ('<br>Telefon: ' + esc(BETREIBER['telefon'])) if BETREIBER['telefon'] else '')),
    (h2('Umsatzsteuer') + p('Umsatzsteuer-Identifikationsnummer nach § 27a UStG: ' + esc(BETREIBER['ustid']))) if BETREIBER['ustid'] else '',
    h2('Verantwortlich für den Inhalt'),
    p('Verantwortlich im Sinne von § 18 Absatz 2 Medienstaatsvertrag: %s, Anschrift wie oben.' % esc(BETREIBER['name'])),
    h2('Jugendschutz'),
    p('zparkling richtet sich an Erwachsene. Die Seiten tragen ein Alterslabel (age-de.xml), das Jugendschutzprogramme auslesen können. Fragen zum Jugendschutz: <a href="mailto:%s">%s</a>.' % (esc(BETREIBER['email']), esc(BETREIBER['email']))),
    h2('Streitbeilegung'),
    p('Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).'),
    note('Dieses Impressum wird vor dem Start vervollständigt.') if PLACEHOLDER else '',
])

# ---------- Datenschutz ----------
datenschutz = '\n'.join([
    h2('Verantwortlicher'),
    p('Verantwortlich für die Datenverarbeitung auf dieser Website ist %s, E-Mail <a href="mailto:%s">%s</a>.' % (esc(anbieter), esc(BETREIBER['email']), esc(BETREIBER['email']))),
    h2('Das Wichtigste zuerst'),
    ul(['zparkling läuft vollständig in deinem Browser. Der Abend, die Personen, die Beiträge der Gäste, Zeichnungen und der Spielstand werden im Speicher deines Browsers (Local Storage) gespeichert und nicht an uns übertragen.',
        'Es gibt kein Nutzerkonto, keine Anmeldung und keine Cookies.',
        'Gäste-Links und Beiträge wandern als Text beziehungsweise Link von Gerät zu Gerät, zum Beispiel über eure Gruppe im Messenger; wir sehen sie nicht.',
        'Keine Analyse-Tools, keine Werbe-Tracker, keine eingebundenen Schriften oder Skripte von Dritten.']),
    h2('Hosting'),
    p('Die Website wird bei Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA (in der EU: Cloudflare Germany GmbH, Rosental 7, 80331 München) über den Dienst Cloudflare Pages ausgeliefert. Beim Aufruf einer Seite verarbeitet Cloudflare technisch notwendige Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Adresse, Browser- und Betriebssystemkennung, die verweisende Seite. Diese Daten dienen der Auslieferung, der Sicherheit (zum Beispiel Abwehr von Angriffen) und der Fehlersuche. Rechtsgrundlage ist unser berechtigtes Interesse an einem sicheren und stabilen Betrieb (Art. 6 Abs. 1 lit. f DSGVO). Mit Cloudflare besteht ein Auftragsverarbeitungsvertrag; eine Übermittlung in die USA stützt sich auf das EU-US Data Privacy Framework, dem Cloudflare angeschlossen ist, und auf Standardvertragsklauseln. Mehr dazu in der <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener">Datenschutzerklärung von Cloudflare</a>.'),
    h2('Speicherung im Browser'),
    p('Die App nutzt den Local Storage deines Browsers, um deinen Abend zwischen zwei Besuchen zu behalten: Party-Daten, Gäste-Beiträge, Einstellungen, Spielstand, Game Pass, dazu kleine Komfortwerte wie „Ton an oder aus“. Diese Daten verlassen dein Gerät nicht. Du löschst sie jederzeit in der App unter Einstellungen („Den ganzen Abend löschen“) oder in deinem Browser über „Website-Daten löschen“. Rechtsgrundlage für das Speichern ist § 25 Abs. 2 Nr. 2 TDDDG, weil es für die von dir gewünschte Funktion unbedingt erforderlich ist.'),
    h2('Gäste-Beiträge'),
    p('Wer über den Gäste-Link mitmacht, gibt Namen, Antworten, Erinnerungen und Zeichnungen ein. Diese Beiträge werden auf dem Gerät des Gastes erzeugt und über den Link beziehungsweise als Text an den Spielleiter übergeben, zum Beispiel über eure Messenger-Gruppe. Verantwortlich für den Umgang mit diesen Beiträgen ist der Spielleiter als Gastgeber der Party, nicht wir; wir erhalten sie nicht. Beiträge über andere Personen sollten freundlich sein und nichts enthalten, was diese Personen nicht öffentlich hören möchten.'),
    h2('Funktionen deines Geräts'),
    p('Vorlesen nutzt die Sprachausgabe deines Browsers oder Betriebssystems auf dem Gerät. „Link kopieren“ nutzt die Zwischenablage. Beides sendet keine Daten an uns.'),
    h2('Kauf des Game Pass'),
    p('Sobald der Game Pass bezahlt werden kann, wird die Zahlung über einen Zahlungsdienstleister abgewickelt; welche Daten dieser verarbeitet (zum Beispiel E-Mail-Adresse, Zahlungsdaten, Rechnungsadresse), beschreiben wir hier, bevor die Zahlung freigeschaltet wird. Bis dahin findet kein Kauf statt.'),
    h2('Kontakt per E-Mail'),
    p('Wenn du uns schreibst, verarbeiten wir deine Angaben zur Beantwortung der Anfrage (Art. 6 Abs. 1 lit. b oder f DSGVO) und löschen sie, sobald die Anfrage erledigt ist und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.'),
    h2('Deine Rechte'),
    p('Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (Art. 21 DSGVO). Du kannst dich bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der für deinen Wohnort zuständigen Landesbeauftragten für den Datenschutz.'),
    h2('Änderungen'),
    p('Wir passen diese Erklärung an, wenn sich die App oder die Rechtslage ändert. Es gilt die jeweils hier veröffentlichte Fassung.'),
])

PAGES = [
    ('verantwortung', 'Verantwortung: Alkohol, Sicherheit, Fairness | zparkling', 'Für Erwachsene, freiwillig, mit Bremse: was die App beim Thema Alkohol tut, wer die Verantwortung trägt und was im Notfall zu tun ist.', 'Verantwortung: Alkohol, Sicherheit und Fairness', 'zparkling ist ein Partyspiel für Erwachsene. Ob Alkohol im Spiel ist, entscheidet der Spielleiter, nicht die App. Niemand muss trinken, und die App bremst, wo es nötig ist. Hier steht, wie das funktioniert und wo die Verantwortung liegt.', verantwortung, 'Verantwortung', 16),
    ('nutzungsbedingungen', 'Nutzungsbedingungen | zparkling', 'Die Nutzungsbedingungen von zparkling: nur für Erwachsene, Alkohol in Eigenverantwortung, Game Pass, Widerruf, Haftung.', 'Nutzungsbedingungen', 'Kurz und ehrlich: wofür die App da ist, was wir von dir erwarten und was du von uns erwarten kannst.', nutzung, 'Rechtliches', 0),
    ('impressum', 'Impressum | zparkling', 'Anbieterkennzeichnung von zparkling nach § 5 DDG.', 'Impressum', 'Wer hinter zparkling steht und wie du uns erreichst.', impressum, 'Rechtliches', 0),
    ('datenschutz', 'Datenschutz | zparkling', 'Datenschutzerklärung von zparkling: alles bleibt im Browser, kein Konto, keine Cookies, Hosting bei Cloudflare.', 'Datenschutzerklärung', 'zparkling läuft in deinem Browser. Was wir trotzdem wissen und was wir nicht wissen, steht hier.', datenschutz, 'Rechtliches', 0),
]

AGE_XML = '''<?xml version="1.0" encoding="UTF-8"?>
<!-- Alterskennzeichnung nach § 5 Abs. 3 Nr. 2 JMStV für Jugendschutzprogramme. Vor dem Start mit dem
     JusProg-Label-Generator (jugendschutzprogramm.de) prüfen oder neu erzeugen und die Werte hier übernehmen. -->
<age-declaration>
  <ageblock-basic>
    <age-issuer>%s</age-issuer>
    <last-change>2026-10-21</last-change>
    <country>de</country>
    <label-version>1.0</label-version>
    <revisit-after>30</revisit-after>
  </ageblock-basic>
  <ageblock-labeltype>
    <xmlfile>true</xmlfile>
    <httpheader>false</httpheader>
    <htmlmeta>true</htmlmeta>
    <label-z>false</label-z>
    <default-age>18</default-age>
    <alternate>false</alternate>
  </ageblock-labeltype>
  <ageblock-labeltype-definition>
    <labeltype-xmlfile>
      <label class="default">
        <min-age>18</min-age>
        <default-age>18</default-age>
      </label>
      <label name="ratgeber">
        <unit>folder</unit>
        <scope>%s/ratgeber/</scope>
        <protocol>all</protocol>
        <age>16</age>
      </label>
      <label name="rechtliches">
        <unit>folder</unit>
        <scope>%s/verantwortung/</scope>
        <protocol>all</protocol>
        <age>16</age>
      </label>
      <label name="recht2">
        <unit>folder</unit>
        <scope>%s/nutzungsbedingungen/</scope>
        <protocol>all</protocol>
        <age>0</age>
      </label>
      <label name="recht3">
        <unit>folder</unit>
        <scope>%s/impressum/</scope>
        <protocol>all</protocol>
        <age>0</age>
      </label>
      <label name="recht4">
        <unit>folder</unit>
        <scope>%s/datenschutz/</scope>
        <protocol>all</protocol>
        <age>0</age>
      </label>
    </labeltype-xmlfile>
  </ageblock-labeltype-definition>
</age-declaration>
''' % ((BETREIBER['name'],) + (SITE,) * 5)

if __name__ == '__main__':
    for slug, title, desc, h1, lead, body, kicker, age in PAGES:
        d = os.path.join(OUT, slug); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page(slug, title, desc, h1, lead, body, kicker, age))
        print(slug, 'ok')
    open(os.path.join(OUT, 'age-de.xml'), 'w', encoding='utf-8').write(AGE_XML)
    open(os.path.join(OUT, 'age.xml'), 'w', encoding='utf-8').write(AGE_XML)
    print('age-de.xml ok', 'PLATZHALTER im Impressum' if PLACEHOLDER else '')
