# -*- coding: utf-8 -*-
"""Baut die statischen Ratgeber-Seiten nach public/ratgeber/<slug>/index.html.
   python3 ratgeber/build.py   (aus dem Projektordner)
   Inhalt: ratgeber/pages.py. Design: ratgeber/ratgeber.css (wird kopiert)."""
import json, os, re, html, shutil, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'ratgeber'))
from pages import PAGES, SITE, AUTHOR, DATE
OUT = os.path.join(ROOT, 'public', 'ratgeber')
GAMES = json.load(open(os.path.join(ROOT, 'ratgeber', 'games.json')))

def esc(s): return html.escape(str(s), quote=True)
def slugify(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('ä','ae').replace('ö','oe').replace('ü','ue').replace('ß','ss')).strip('-')

LOGO = ('<svg viewBox="0 0 64 64" width="30" height="30" aria-hidden="true"><rect width="64" height="64" rx="16" fill="#FF7A45"/>'
        '<g transform="translate(6.5 6.3) scale(.95)"><path d="M8 2H28V31L35 38C39.5 42.5 38 50.5 31.5 51.5C28.5 52 25.5 51 23 48.5L11 36.5C9 34.5 8 32 8 29Z" fill="#15122B"/></g>'
        '<path d="M48 5Q49.6 12.4 57 14Q49.6 15.6 48 23Q46.4 15.6 39 14Q46.4 12.4 48 5Z" fill="#FFC940" stroke="#15122B" stroke-width="2.2" stroke-linejoin="round"/></svg>')
PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>'
CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>'

def garland(colors, shape='sock'):
    w = 360; n = len(colors); out = '<svg class="rg-garland" viewBox="0 0 360 70" preserveAspectRatio="xMidYMin meet" aria-hidden="true"><path d="M-4 10Q180 42 364 10" stroke="#F4F1FF" stroke-opacity=".55" stroke-width="2.5" fill="none"/>'
    for i, c in enumerate(colors):
        x = 34 + i * ((w - 68) / (n - 1)); t = (x + 4) / (w + 8); y = 10 + 64 * t * (1 - t)
        if shape == 'box': item = '<rect x="3" y="6" width="30" height="26" rx="4" fill="%s"/><rect x="15" y="6" width="6" height="26" fill="#15122B" fill-opacity=".22"/>' % c
        elif shape == 'flag': item = '<path d="M2 4H34L18 40Z" fill="%s"/>' % c
        else: item = '<path d="M8 2H28V31L35 38C39.5 42.5 38 50.5 31.5 51.5C28.5 52 25.5 51 23 48.5L11 36.5C9 34.5 8 32 8 29Z" fill="%s"/><rect x="8" y="2" width="20" height="7" fill="#15122B" fill-opacity=".22"/>' % c
        out += '<g transform="translate(%.1f %.1f) rotate(%d) translate(-11 3) scale(.62)">%s</g><rect x="%.1f" y="%.1f" width="5" height="10" rx="1.5" fill="%s"/>' % (x, y, 6 if i % 2 else -7, item, x - 2.5, y - 5, '#15122B' if i % 2 else '#FFFFFF')
    return out + '</svg>'

def game_card(gid, unit='Socke', units='Socken'):
    g = GAMES[gid]; txt = g['solo'].replace('{UN}', units).replace('{U}', unit)
    return ('<article class="rg-game"><div class="rg-game-top"><span class="rg-game-k">Minispiel</span><b>%s</b></div><p>%s</p>' % (esc(g['name']), esc(txt)) +
            ('<small>Material: %s</small>' % esc(g['mat']) if g['mat'] else '<small>Ohne Material</small>') + '</article>')

def render_blocks(blocks, unit, units):
    out = []
    for b in blocks:
        t = b[0]
        if t == 'p': out.append('<p>%s</p>' % b[1])
        elif t == 'h2': out.append('<h2 id="%s">%s</h2>' % (slugify(b[1]), esc(b[1])))
        elif t == 'h3': out.append('<h3>%s</h3>' % esc(b[1]))
        elif t == 'ul': out.append('<ul>' + ''.join('<li>%s</li>' % x for x in b[1]) + '</ul>')
        elif t == 'ol': out.append('<ol>' + ''.join('<li>%s</li>' % x for x in b[1]) + '</ol>')
        elif t == 'table':
            head, rows = b[1], b[2]
            out.append('<div class="rg-tw"><table><thead><tr>' + ''.join('<th>%s</th>' % esc(h) for h in head) + '</tr></thead><tbody>' + ''.join('<tr>' + ''.join('<td>%s</td>' % c for c in r) + '</tr>' for r in rows) + '</tbody></table></div>')
        elif t == 'games':
            out.append('<div class="rg-games">' + ''.join(game_card(g, unit, units) for g in b[1]) + '</div>')
        elif t == 'app':
            title, text, anlass = b[1], b[2], b[3]
            out.append('<aside class="rg-app"><div class="rg-app-in"><span class="rg-app-k">In der App</span><b>%s</b><p>%s</p><a class="rg-cta" href="%s/#beispiel-%s">%sBeispiel-Abend %s ansehen</a></div></aside>' % (esc(title), text, SITE, anlass, PLAY, esc(b[4])))
        elif t == 'note': out.append('<div class="rg-note">%s</div>' % b[1])
        elif t == 'quote': out.append('<blockquote class="rg-quote"><p>%s</p><footer>%s</footer></blockquote>' % (b[1], b[2]))
    return '\n'.join(out)

def faq_html(faq):
    return '<section class="rg-faq" id="haeufige-fragen"><h2>Häufige Fragen</h2>' + ''.join('<details%s><summary><h3>%s</h3></summary><div>%s</div></details>' % (' open' if i == 0 else '', esc(q), a) for i, (q, a) in enumerate(faq)) + '</section>'

def strip_tags(s): return re.sub(r'<[^>]+>', '', s)

def page_html(pg, all_pages):
    url = SITE + '/ratgeber/' + pg['slug'] + '/'
    og = SITE + '/ratgeber/' + pg['slug'] + '/og.png'
    others = [p for p in all_pages if p['slug'] != pg['slug']]
    related = ''.join('<a class="rg-rel" href="/ratgeber/%s/"><span class="rg-rel-ic" style="background:%s">%s</span><span><b>%s</b><small>%s</small></span>%s</a>' % (p['slug'], p['color'], LOGO if False else '', esc(p['short']), esc(p['teaser']), CHEV) for p in others)
    faq_ld = {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)}} for q, a in pg['faq']]}
    art_ld = {"@type": "Article", "headline": pg['h1'], "description": pg['description'], "inLanguage": "de", "datePublished": DATE, "dateModified": DATE,
              "author": {"@type": "Organization", "name": AUTHOR, "url": SITE + '/'}, "publisher": {"@type": "Organization", "name": "zparkling", "url": SITE + '/', "logo": {"@type": "ImageObject", "url": SITE + '/icon-512.png'}},
              "image": og, "mainEntityOfPage": url, "about": pg['about']}
    bc_ld = {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "zparkling", "item": SITE + '/'}, {"@type": "ListItem", "position": 2, "name": "Ratgeber", "item": SITE + '/ratgeber/'}, {"@type": "ListItem", "position": 3, "name": pg['short'], "item": url}]}
    ld = json.dumps({"@context": "https://schema.org", "@graph": [art_ld, faq_ld, bc_ld]}, ensure_ascii=False).replace('</', '<\\/')
    toc = ''.join('<a href="#%s">%s</a>' % (slugify(b[1]), esc(b[1])) for b in pg['blocks'] if b[0] == 'h2') + '<a href="#haeufige-fragen">Häufige Fragen</a>'
    body = render_blocks(pg['blocks'], pg.get('unit', 'Socke'), pg.get('units', 'Socken'))
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
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0C0A1A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Figtree:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/ratgeber/ratgeber.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="rg-top"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><nav class="rg-nav" aria-label="Ratgeber"><a href="/ratgeber/">Ratgeber</a><a class="rg-btn sm" href="/#beispiel-{pg['anlass']}">{PLAY}Beispiel-Abend</a></nav></header>
<main class="rg-main">
<nav class="rg-crumbs" aria-label="Pfad"><a href="/">zparkling</a><span>›</span><a href="/ratgeber/">Ratgeber</a><span>›</span><span aria-current="page">{esc(pg['short'])}</span></nav>
<section class="rg-hero" style="--c:{pg['color']}">{garland(pg['garland'], pg['shape'])}<span class="rg-kicker">{esc(pg['kicker'])}</span><h1>{esc(pg['h1'])}</h1><p class="rg-lead">{pg['lead']}</p><p class="rg-meta">{esc(AUTHOR)} · Stand {pg['date_label']}</p></section>
<nav class="rg-toc" aria-label="Inhalt"><span>Inhalt</span>{toc}</nav>
<article class="rg-article">
{body}
{faq_html(pg['faq'])}
<section class="rg-sources"><h2>Quellen</h2><ul>{sources}</ul></section>
</article>
<section class="rg-cta-box" style="--c:{pg['color']}"><div><span class="rg-app-k">zparkling</span><b>{esc(pg['cta_title'])}</b><p>{pg['cta_text']}</p></div><a class="rg-cta" href="/#beispiel-{pg['anlass']}">{PLAY}Beispiel-Abend ansehen</a></section>
<section class="rg-related"><h2>Weiterlesen</h2><div class="rg-rels">{related}</div></section>
</main>
<footer class="rg-foot"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><span>Das Partyspiel für euren Abend · <a href="/ratgeber/">Alle Ratgeber</a></span></footer>
</body>
</html>
'''

def index_html(all_pages):
    url = SITE + '/ratgeber/'
    cards = ''.join('<a class="rg-tile" href="/ratgeber/%s/" style="--c:%s"><span class="rg-tile-k">%s</span><b>%s</b><p>%s</p><span class="rg-tile-go">Lesen %s</span></a>' % (p['slug'], p['color'], esc(p['kicker']), esc(p['short']), esc(p['teaser']), CHEV) for p in all_pages)
    ld = json.dumps({"@context": "https://schema.org", "@type": "CollectionPage", "name": "Ratgeber: Bräuche zum 25. und 30. Geburtstag", "url": url, "inLanguage": "de", "publisher": {"@type": "Organization", "name": "zparkling", "url": SITE + '/'}}, ensure_ascii=False)
    return f'''<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Ratgeber: Sockenkranz, Schachtelkranz, Treppe fegen, Klinken putzen | zparkling</title>
<meta name="description" content="Die Bräuche zum 25. und 30. Geburtstag erklärt: Sockenkranz, Schachtelkranz, Treppe fegen und Klinken putzen, mit Aufgaben, Fragen, Regeln und Spielen.">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website"><meta property="og:title" content="Ratgeber: Bräuche zum 25. und 30. Geburtstag"><meta property="og:description" content="Sockenkranz, Schachtelkranz, Treppe fegen und Klinken putzen: Aufgaben, Fragen, Regeln und Spiele."><meta property="og:url" content="{url}"><meta property="og:image" content="{SITE}/ratgeber/og.png"><meta property="og:locale" content="de_DE">
<meta name="theme-color" content="#0C0A1A">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@600;800;900&family=Figtree:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="/ratgeber/ratgeber.css">
<script type="application/ld+json">{ld}</script>
</head>
<body>
<header class="rg-top"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><nav class="rg-nav" aria-label="Ratgeber"><a class="rg-btn sm" href="/">{PLAY}Zur App</a></nav></header>
<main class="rg-main">
<section class="rg-hero" style="--c:#FF7A45">{garland(['#15122B','#FFFFFF','#48D9A6','#9886FF','#FFC940','#FF8FC4','#15122B'])}<span class="rg-kicker">Ratgeber</span><h1>Bräuche zum 25. und 30. Geburtstag, erklärt von zparkling</h1><p class="rg-lead">Sockenkranz, Schachtelkranz, Treppe fegen und Klinken putzen: Was dahintersteckt, wie der Abend abläuft, welche Aufgaben und Fragen sich bewährt haben und wie ihr daraus eine Party macht, die niemanden bloßstellt.</p></section>
<div class="rg-tiles">{cards}</div>
<section class="rg-cta-box" style="--c:#FFC940"><div><span class="rg-app-k">zparkling</span><b>Die App, die den Abend spielt</b><p>Eure Gäste schicken vorab per Link, was sie über das Geburtstagskind wissen. Daraus baut zparkling über 140 Minispiele und Gäste-Runden, die es nur auf eurer Party gibt. Pro Spiel fällt höchstens ein Pinnchen, Gäste werden nie gezwungen.</p></div><a class="rg-cta" href="/">{PLAY}App ansehen</a></section>
</main>
<footer class="rg-foot"><a class="rg-brand" href="/">{LOGO}<b>zparkling</b></a><span>Das Partyspiel für euren Abend</span></footer>
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
    urls = [SITE + '/', SITE + '/ratgeber/'] + [SITE + '/ratgeber/' + p['slug'] + '/' for p in PAGES]
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
