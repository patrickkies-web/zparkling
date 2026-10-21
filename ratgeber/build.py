# -*- coding: utf-8 -*-
"""Baut die statischen Ratgeber-Seiten nach public/ratgeber/<slug>/index.html.
   python3 ratgeber/build.py   (aus dem Projektordner)
   Inhalt: ratgeber/pages.py. Design: ratgeber/ratgeber.css (wird kopiert)."""
import json, os, re, html, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'ratgeber'))
from pages import PAGES, SITE, AUTHOR, DATE
from pages_b import PAGES_B
PAGES = PAGES + PAGES_B
OUT = os.path.join(ROOT, 'public', 'ratgeber')
GAMES = json.load(open(os.path.join(ROOT, 'ratgeber', 'games.json')))

def esc(s): return html.escape(str(s), quote=True)
def slugify(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss')).strip('-')

# Das Zeichen: ein Band, zweimal gefaltet, ein Z (Vorderseite Orange, Rückseite Gold), wie in der App (bandMark in src/07-views.js)
BAND = {'s1': '13,14 52,14 55.03,25 13,25', 's2': '52,14 55.03,25 13,50 9.97,39', 's3': '52,50 13,50 9.97,39 52,39', 'sh1a': '29.2,25 47.7,14 52,14 55.03,25', 'sh1b': '31.36,25 49.85,14 52,14 55.03,25', 'sh2a': '13,50 9.97,39 13.67,36.8 35.19,36.8', 'sh2b': '13,50 9.97,39 11.82,37.9 33.34,37.9'}
def band_mark(front='#FF7A45', back='#FFC940', shadow='#15122B'):
    poly = lambda pts, fill, op=None: '<polygon points="%s" fill="%s"%s/>' % (pts, fill, (' fill-opacity="%s"' % op) if op else '')
    return (poly(BAND['s1'], front) + poly(BAND['sh1a'], shadow, '.1') + poly(BAND['sh1b'], shadow, '.16') + poly(BAND['s2'], back) + poly(BAND['sh2a'], shadow, '.1') + poly(BAND['sh2b'], shadow, '.16') + poly(BAND['s3'], front) +
            '<line x1="52" y1="14" x2="55.03" y2="25" stroke="#FFFFFF" stroke-opacity=".45" stroke-width=".9"/><line x1="13" y1="50" x2="9.97" y2="39" stroke="#FFFFFF" stroke-opacity=".35" stroke-width=".9"/>')
def brand_tile(size, bg='#15122B'):
    return ('<svg viewBox="0 0 64 64" width="%s" height="%s" aria-hidden="true"><rect width="64" height="64" rx="16" fill="%s"/><rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke="#FFFFFF" stroke-opacity=".08" stroke-width="1.5"/><g transform="translate(32 32) scale(.84) translate(-32 -32)">%s</g></svg>' % (size, size, bg, band_mark()))
LOGO = brand_tile(30, '#211D3D')
FONTS = ('<link rel="preload" href="/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/unbounded.woff2" as="font" type="font/woff2" crossorigin>')
PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>'
CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'

# Themen-Cluster: die Übersicht ist die Pillar-Seite, jede Seite verlinkt ihre Geschwister (nicht alle anderen)
CLUSTERS = [
    ('kranz', 'Kränze zum 25.', 'Sockenkranz und Schachtelkranz: Brauch, Aufgaben, Sprüche und was man basteln muss.', ['sockenkranz-aufgaben', 'sockenkranz-selber-machen', 'welcher-kranz-zum-25-geburtstag', 'schachtelkranz-ideen', 'alte-socke-sprueche-25-geburtstag']),
    ('dreissig', 'Bräuche zum 30.', 'Treppe fegen, Klinken putzen und was Unverheiratete zum 30. erwartet.', ['treppe-fegen-30-geburtstag', 'klinken-putzen-30-geburtstag', '30-geburtstag-unverheiratet']),
    ('hochzeit', 'JGA und Polterabend', 'Spiele für den Junggesellenabschied und den Polterabend, die niemanden bloßstellen.', ['jga-spiele-nicht-peinlich', 'polterabend-spiele-brautpaar']),
    ('spiele', 'Spiele und Fragen', 'Partyspiele, Schätzfragen, Wer-würde-eher und Zwei Wahrheiten, eine Lüge, mit Regeln und Beispielen.', ['spiele-fuer-das-geburtstagskind', 'partyspiele-erwachsene-ohne-material', 'wer-wuerde-eher-fragen', 'schaetzfragen-mit-antworten', 'zwei-wahrheiten-eine-luege-beispiele']),
]
CLUSTER_OF = {slug: c[0] for c in CLUSTERS for slug in c[3]}
# Wörter im Fließtext, die auf die passende Seite verlinken (erste Fundstelle, höchstens drei Links pro Seite)
LINK_WORDS = {
    'sockenkranz-aufgaben': ['Sockenkranz-Aufgaben', 'Aufgaben am Sockenkranz', 'Sockenkranz'],
    'sockenkranz-selber-machen': ['Sockenkranz selber machen', 'Sockenkranz basteln', 'Kranz basteln'],
    'welcher-kranz-zum-25-geburtstag': ['welcher Kranz', 'Welcher Kranz', 'Kranz zum 25.'],
    'schachtelkranz-ideen': ['Schachtelkranz'],
    'alte-socke-sprueche-25-geburtstag': ['Alte Socke', 'alte Socke'],
    'treppe-fegen-30-geburtstag': ['Treppe fegen', 'Treppenfegen', 'fegt die Treppe'],
    'klinken-putzen-30-geburtstag': ['Klinken putzen', 'Klinkenputzen', 'putzt Klinken', 'putzen Klinken'],
    '30-geburtstag-unverheiratet': ['unverheiratet zum 30.', '30. Geburtstag unverheiratet', 'Unverheiratete zum 30.'],
    'jga-spiele-nicht-peinlich': ['JGA-Spiele', 'Junggesellenabschied', 'JGA'],
    'polterabend-spiele-brautpaar': ['Polterabend'],
    'spiele-fuer-das-geburtstagskind': ['Spiele für das Geburtstagskind', 'Geburtstagsspiele'],
    'partyspiele-erwachsene-ohne-material': ['Partyspiele ohne Material', 'Partyspiele für Erwachsene', 'ohne Material'],
    'wer-wuerde-eher-fragen': ['Wer-würde-eher-Fragen', 'Wer würde eher', 'Wer-würde-eher'],
    'schaetzfragen-mit-antworten': ['Schätzfragen', 'Schätzfrage'],
    'zwei-wahrheiten-eine-luege-beispiele': ['Zwei Wahrheiten, eine Lüge', 'Zwei Wahrheiten und eine Lüge', 'zwei Wahrheiten und eine Lüge', 'zwei Wahrheiten mit einer Lüge'],
}
def autolink(text, self_slug, used, limit=3):
    """verlinkt im Text die erste Nennung eines anderen Ratgeber-Themas; nur außerhalb von Tags"""
    for slug, phrases in LINK_WORDS.items():
        if slug == self_slug or slug in used or len(used) >= limit: continue
        for ph in phrases:
            m = re.search(r'(?<![\w"/-])' + re.escape(ph) + r'(?![\w-])(?![^<]*>)', text)
            if m and not re.search(r'<a [^>]*>[^<]*' + re.escape(ph), text):
                text = text[:m.start()] + '<a href="/ratgeber/%s/">%s</a>' % (slug, m.group(0)) + text[m.end():]
                used.add(slug); break
    return text
def reading_minutes(words): return max(2, int(round(words / 200.0)))

def garland(colors, shape='band'):
    w = 360; n = len(colors); out = '<svg class="rg-garland" viewBox="0 0 360 70" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><path d="M-4 10Q180 42 364 10" stroke="#F4F1FF" stroke-opacity=".55" stroke-width="2.5" fill="none"/>'
    for i, c in enumerate(colors):
        x = 34 + i * ((w - 68) / (n - 1)); t = (x + 4) / (w + 8); y = 10 + 64 * t * (1 - t)
        if shape == 'box': item = '<rect x="3" y="6" width="30" height="26" rx="4" fill="%s"/><rect x="15" y="6" width="6" height="26" fill="#15122B" fill-opacity=".22"/>' % c
        elif shape == 'flag': item = '<path d="M2 4H34L18 40Z" fill="%s"/>' % c
        elif shape == 'band': item = '<path d="M3 6H27L33 12V32H3Z" fill="%s"/><path d="M3 6H33V11H3Z" fill="#15122B" fill-opacity=".16"/><path d="M27 6L33 12H27Z" fill="#FFC940"/>' % c
        else: item = '<path d="M8 2H28V31L35 38C39.5 42.5 38 50.5 31.5 51.5C28.5 52 25.5 51 23 48.5L11 36.5C9 34.5 8 32 8 29Z" fill="%s"/><rect x="8" y="2" width="20" height="7" fill="#15122B" fill-opacity=".22"/>' % c
        out += '<g transform="translate(%.1f %.1f) rotate(%d) translate(-11 3) scale(.62)">%s</g><rect x="%.1f" y="%.1f" width="5" height="10" rx="1.5" fill="%s"/>' % (x, y, 6 if i % 2 else -7, item, x - 2.5, y - 5, '#15122B' if i % 2 else '#FFFFFF')
    return out + '</svg>'

def game_card(gid, unit='Socke', units='Socken'):
    g = GAMES[gid]; txt = g['solo'].replace('{UN}', units).replace('{U}', unit)
    return ('<article class="rg-game"><div class="rg-game-top"><span class="rg-game-k">%s</span><b>%s</b></div><p>%s</p>' % (esc(g.get('k', 'Minispiel')), esc(g['name']), esc(txt)) +
            ('<small>Material: %s</small>' % esc(g['mat']) if g['mat'] else '<small>Ohne Material</small>') + '</article>')

def render_blocks(blocks, unit, units, self_slug=None, used=None):
    out = []; used = set() if used is None else used; L = (lambda x: autolink(x, self_slug, used)) if self_slug else (lambda x: x)
    for b in blocks:
        t = b[0]
        if t == 'p': out.append('<p>%s</p>' % L(b[1]))
        elif t == 'h2': out.append('<h2 id="%s">%s</h2>' % (slugify(b[1]), esc(b[1])))
        elif t == 'h3': out.append('<h3>%s</h3>' % esc(b[1]))
        elif t == 'ul': out.append('<ul>' + ''.join('<li>%s</li>' % L(x) for x in b[1]) + '</ul>')
        elif t == 'ol': out.append('<ol>' + ''.join('<li>%s</li>' % L(x) for x in b[1]) + '</ol>')
        elif t == 'table':
            head, rows = b[1], b[2]
            out.append('<div class="rg-tw"><table><thead><tr>' + ''.join('<th>%s</th>' % esc(h) for h in head) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>%s</td>' % L(c) for c in r) + '</tr>' for r in rows) + '</tbody></table></div>')
        elif t == 'games':
            out.append('<div class="rg-games">' + ''.join(game_card(g, unit, units) for g in b[1]) + '</div>')
        elif t == 'app':
            title, text, anlass = b[1], b[2], b[3]
            out.append('<aside class="rg-app"><div class="rg-app-in"><span class="rg-app-k">In der App</span><b>%s</b><p>%s</p><a class="rg-cta" href="%s/#beispiel-%s">%sBeispiel-Abend %s ansehen</a></div></aside>' % (esc(title), text, SITE, anlass, PLAY, esc(b[4])))
        elif t == 'shots':
            # Screenshots aus der App: (datei, alt, bildunterschrift), 390x844 Punkte, Datei 780x1688 WebP
            out.append('<div class="rg-shots" role="group" aria-label="Screenshots aus der App">' + ''.join(
                '<figure class="rg-shot"><div class="rg-phone"><img src="/ratgeber/img/%s.webp" width="390" height="844" alt="%s" loading="lazy" decoding="async"></div><figcaption>%s</figcaption></figure>' % (f, esc(alt), cap) for f, alt, cap in b[1]) + '</div>')
        elif t == 'note': out.append('<div class="rg-note">%s</div>' % b[1])
        elif t == 'quote': out.append('<blockquote class="rg-quote"><p>%s</p><footer>%s</footer></blockquote>' % (b[1], b[2]))
    return '\n'.join(out)

def faq_html(faq, self_slug=None, used=None):
    L = (lambda x: autolink(x, self_slug, used)) if self_slug else (lambda x: x)
    return '<section class="rg-faq" id="haeufige-fragen"><h2>Häufige Fragen</h2>' + ''.join('<details%s><summary><h3>%s</h3></summary><div>%s</div></details>' % (' open' if i == 0 else '', esc(q), L(a)) for i, (q, a) in enumerate(faq)) + '</section>'

def strip_tags(s): return re.sub(r'<[^>]+>', '', s)

def page_html(pg, all_pages):
    url = SITE + '/ratgeber/' + pg['slug'] + '/'
    og = SITE + '/ratgeber/' + pg['slug'] + '/og.png'
    cl = CLUSTER_OF.get(pg['slug']); sibs = [p for p in all_pages if p['slug'] != pg['slug'] and CLUSTER_OF.get(p['slug']) == cl]
    same_anlass = [p for p in all_pages if p['slug'] != pg['slug'] and p not in sibs and p.get('anlass') == pg.get('anlass')]
    others = (sibs + same_anlass + [p for p in all_pages if p['slug'] != pg['slug'] and p not in sibs and p not in same_anlass])[:4]
    related = ''.join('<a class="rg-rel" href="/ratgeber/%s/"><span class="rg-rel-ic" style="background:%s">%s</span><span><b>%s</b><small>%s</small></span>%s</a>' % (p['slug'], p['color'], LOGO if False else '', esc(p['short']), esc(p['teaser']), CHEV) for p in others)
    faq_ld = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in pg['faq']]}
    art_ld = {"@type": "Article", "headline": pg['h1'], "description": pg['description'], "inLanguage": "de", "datePublished": DATE, "dateModified": DATE,
              "author": {"@type": "Organization", "name": AUTHOR, "url": SITE + '/'}, "publisher": {"@type": "Organization", "name": "zparkling", "url": SITE + '/', "logo": {"@type": "ImageObject", "url": SITE + '/icon-512.png'}},
              "image": [og] + [SITE + '/ratgeber/img/%s.webp' % f for b in pg['blocks'] if b[0] == 'shots' for f, _, _ in b[1]], "mainEntityOfPage": url, "about": pg['about']}
    bc_ld = {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "zparkling", "item": SITE + '/'}, {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": SITE + '/ratgeber/'}, {"@type": "ListItem", "position": 3, "name": pg['short'], "item": url}]}
    ld = json.dumps({"@context": "https://schema.org", "@graph": [art_ld, faq_ld, bc_ld]}, ensure_ascii=False).replace('</', '<\\/')
    toc = ''.join('<a href="#%s">%s</a>' % (slugify(b[1]), esc(b[1])) for b in pg['blocks'] if b[0] == 'h2') + '<a href="#haeufige-fragen">Häufige Fragen</a>'
    used = set(); body = render_blocks(pg['blocks'], pg.get('unit', 'Socke'), pg.get('units', 'Socken'), pg['slug'], used); faq = faq_html(pg['faq'], pg['slug'], used)
    mins = reading_minutes(len(strip_tags(body + ' '.join(a for _, a in pg['faq']) + pg['lead']).split()))
    sources = ''.join('<li><a href="%s" rel="nofollow noopener" target="_blank">%s</a>%s</li>' % (esc(u), esc(t), (' – ' + esc(n)) if n else '') for t, u, n in pg['sources'])
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(pg['title'])}</title>
<meta name="description" content="{esc(pg['description'])}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:title" content="{esc(pg['title'])}">
<meta property="og:description" content="{esc(pg['description'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="de_DE">
<meta property="article:published_time" content="{DATE}">
<meta property="article:modified_time" content="{DATE}">
<meta property="article:section" content="Ratgeber">
<meta name="author" content="{esc(AUTHOR)}">
<meta name="age-de-meta-label" content="age=16 v=1.0 kind=sl protocol=all">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0C0A1A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
{FONTS}
<link rel="stylesheet" href="/ratgeber/ratgeber.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="rg-top"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><nav class="rg-nav" aria-label="Ratgeber"><a href="/ratgeber/">Ratgeber</a><a class="rg-btn sm" href="/#beispiel-{pg['anlass']}">{PLAY}Beispiel-Abend</a></nav></header>
<main class="rg-main">
<nav class="rg-crumbs" aria-label="Pfad"><a href="/">zparkling</a><span>›</span><a href="/ratgeber/">Ratgeber</a><span>›</span><span aria-current="page">{esc(pg['short'])}</span></nav>
<section class="rg-hero" style="--c:{pg['color']}">{garland(pg['garland'], pg['shape'])}<span class="rg-kicker">{esc(pg['kicker'])}</span><h1>{esc(pg['h1'])}</h1><p class="rg-lead">{pg['lead']}</p><p class="rg-meta">{esc(AUTHOR)} · Stand {pg['date_label']} · {mins} Min. Lesezeit</p></section>
<nav class="rg-toc" aria-label="Inhalt"><span>Inhalt</span>{toc}</nav>
<article class="rg-article">
{body}
{faq}
<section class="rg-sources"><h2>Quellen</h2><ul>{sources}</ul></section>
</article>
<section class="rg-cta-box" style="--c:{pg['color']}"><div><span class="rg-app-k">zparkling</span><b>{esc(pg['cta_title'])}</b><p>{pg['cta_text']}</p></div><a class="rg-cta" href="/#beispiel-{pg['anlass']}">{PLAY}Beispiel-Abend ansehen</a></section>
<section class="rg-related"><h2>Weiterlesen</h2><div class="rg-rels">{related}</div><p class="rg-all"><a href="/ratgeber/">Alle Ratgeber ansehen {CHEV}</a></p></section>
</main>
<footer class="rg-foot"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><span>Das Partyspiel für euren Abend · <a href="/ratgeber/">Alle Ratgeber</a> · <a href="/verantwortung/">Verantwortung</a> · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span></footer>
</body>
</html>
'''

def index_html(all_pages):
    url = SITE + '/ratgeber/'
    by = {p['slug']: p for p in all_pages}
    def tile(p): return '<a class="rg-tile" href="/ratgeber/%s/" style="--c:%s"><span class="rg-tile-k">%s</span><b>%s</b><p>%s</p><span class="rg-tile-go">Lesen %s</span></a>' % (p['slug'], p['color'], esc(p['kicker']), esc(p['short']), esc(p['teaser']), CHEV)
    sections = ''.join('<section class="rg-cluster" id="%s"><h2>%s</h2><p>%s</p><div class="rg-tiles">%s</div></section>' % (cid, esc(name), esc(text), ''.join(tile(by[sl]) for sl in slugs if sl in by)) for cid, name, text, slugs in CLUSTERS)
    rest = [p for p in all_pages if p['slug'] not in CLUSTER_OF]
    if rest: sections += '<section class="rg-cluster"><h2>Weitere Ratgeber</h2><div class="rg-tiles">%s</div></section>' % ''.join(tile(p) for p in rest)
    toc = ''.join('<a href="#%s">%s</a>' % (cid, esc(name)) for cid, name, _, _ in CLUSTERS)
    ld = json.dumps({"@context": "https://schema.org", "@graph": [
        {"@type": "WebSite", "@id": SITE + '/#website', "name": "zparkling", "url": SITE + '/', "inLanguage": "de", "publisher": {"@id": SITE + '/#org'}},
        {"@type": "Organization", "@id": SITE + '/#org', "name": "zparkling", "url": SITE + '/', "logo": {"@type": "ImageObject", "url": SITE + '/icon-512.png'}},
        {"@type": "CollectionPage", "name": "Ratgeber: Bräuche, Partyspiele und Aufgaben", "url": url, "inLanguage": "de", "isPartOf": {"@id": SITE + '/#website'},
         "hasPart": [{"@type": "Article", "headline": p['h1'], "url": SITE + '/ratgeber/' + p['slug'] + '/'} for p in all_pages]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "zparkling", "item": SITE + '/'}, {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": url}]}]}, ensure_ascii=False).replace('</', '<\\/')
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Ratgeber: Bräuche, Partyspiele und Aufgaben | zparkling</title>
<meta name="description" content="Sockenkranz, Schachtelkranz, Treppe fegen, Klinken putzen, JGA und Polterabend erklärt, dazu Partyspiele, Schätzfragen und Wer-würde-eher-Fragen mit Regeln.">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="Ratgeber: Bräuche, Partyspiele und Aufgaben"><meta property="og:description" content="Sockenkranz, Schachtelkranz, Treppe fegen und Klinken putzen: Aufgaben, Fragen, Regeln und Spiele."><meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}/ratgeber/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="de_DE">
<meta name="twitter:card" content="summary_large_image">
<meta name="age-de-meta-label" content="age=16 v=1.0 kind=sl protocol=all">
<meta name="theme-color" content="#0C0A1A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
{FONTS}
<link rel="stylesheet" href="/ratgeber/ratgeber.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="rg-top"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><nav class="rg-nav" aria-label="Ratgeber"><a class="rg-btn sm" href="/">{PLAY}Zur App</a></nav></header>
<main class="rg-main">
<section class="rg-hero" style="--c:#FF7A45">{garland(['#15122B','#FFFFFF','#48D9A6','#9886FF','#FFC940','#FF8FC4','#15122B'])}<span class="rg-kicker">Ratgeber</span><h1>Bräuche, Aufgaben und Spiele für euren Abend</h1><p class="rg-lead">Sockenkranz, Schachtelkranz, Treppe fegen, Klinken putzen, JGA und Polterabend: Was dahintersteckt, wie der Abend abläuft, welche Aufgaben und Fragen sich bewährt haben. Dazu Partyspiele, Schätzfragen und Wer-würde-eher-Fragen, die niemanden bloßstellen.</p><p class="rg-meta">{len(all_pages)} Ratgeber · {esc(AUTHOR)}</p></section>
<nav class="rg-toc" aria-label="Themen"><span>Themen</span>{toc}</nav>
{sections}
<section class="rg-cta-box" style="--c:#FFC940"><div><span class="rg-app-k">zparkling</span><b>Die App, die den Abend spielt</b><p>Eure Gäste schicken vorab per Link, was sie über das Geburtstagskind wissen. Daraus baut zparkling über 140 Minispiele und Gäste-Runden, die es nur auf eurer Party gibt. Pro Spiel fällt höchstens ein Pinnchen, Gäste werden nie gezwungen.</p></div><a class="rg-cta" href="/">{PLAY}App ansehen</a></section>
</main>
<footer class="rg-foot"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><span>Das Partyspiel für euren Abend · Für Erwachsene · <a href="/verantwortung/">Verantwortung</a> · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">Datenschutz</a></span></footer>
</body>
</html>
'''

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    shutil.copy(os.path.join(ROOT, 'ratgeber', 'ratgeber.css'), os.path.join(OUT, 'ratgeber.css'))
    for pg in PAGES:
        d = os.path.join(OUT, pg['slug']); os.makedirs(d, exist_ok=True)
        open(os.path.join(d, 'index.html'), 'w').write(page_html(pg, PAGES))
        words = len(strip_tags(render_blocks(pg['blocks'], pg.get('unit', 'Socke'), pg.get('units', 'Socken')) + ' '.join(a for _, a in pg['faq']) + pg['lead']).split())
        print(pg['slug'], words, 'Wörter', len(pg['title']), 'Title-Zeichen', len(pg['description']), 'Description-Zeichen')
    open(os.path.join(OUT, 'index.html'), 'w').write(index_html(PAGES))
    # sitemap and robots
    urls = [SITE + '/', SITE + '/ratgeber/'] + [SITE + '/ratgeber/' + p['slug'] + '/' for p in PAGES] + [SITE + '/' + x + '/' for x in ['verantwortung', 'nutzungsbedingungen', 'impressum', 'datenschutz']]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join('  <url><loc>%s</loc><lastmod>%s</lastmod></url>\n' % (u, DATE) for u in urls) + '</urlset>\n'
    open(os.path.join(ROOT, 'public', 'sitemap.xml'), 'w').write(sm)
    open(os.path.join(ROOT, 'public', 'robots.txt'), 'w').write('''# zparkling: Such-Crawler willkommen, Trainings-Crawler nicht.
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: *
Allow: /
Sitemap: %s/sitemap.xml
''' % SITE)
    print('ok')
