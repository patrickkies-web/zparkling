# -*- coding: utf-8 -*-
# Schreibt ratgeber/og.json (Eingabe für node ratgeber/og.js) aus den Seiten.
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import PAGES, garland
out = [{'slug': p['slug'], 'color': p['color'], 'kicker': p['kicker'], 'h1': p['h1'], 'garland': garland(p['garland'], p['shape']).replace('class="rg-garland"', 'class="g"')} for p in PAGES]
out.append({'slug': '', 'color': '#FF7A45', 'kicker': 'Ratgeber', 'h1': 'Bräuche, Aufgaben und Spiele für euren Abend', 'garland': garland(['#15122B', '#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#FF8FC4', '#15122B']).replace('class="rg-garland"', 'class="g"')})
json.dump(out, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'og.json'), 'w'), ensure_ascii=False)
print(len(out), 'Einträge')
