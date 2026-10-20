# -*- coding: utf-8 -*-
# Macht aus den PNG-Screenshots (node ratgeber/shots.js) WebP-Bilder für die Ratgeber-Seiten.
import glob, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'shots-png'); OUT = os.path.join(HERE, '..', 'public', 'ratgeber', 'img')
os.makedirs(OUT, exist_ok=True)
for f in sorted(glob.glob(os.path.join(SRC, '*.png'))):
    im = Image.open(f); name = os.path.basename(f)[:-4] + '.webp'
    im.save(os.path.join(OUT, name), 'WEBP', quality=82, method=6); print(name, im.size)
