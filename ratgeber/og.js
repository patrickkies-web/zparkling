/* OG-Bilder (1200x630) für die Ratgeber-Seiten: node ratgeber/og.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const PUB = path.join(__dirname, '..', 'public');
const FONT_U = fs.readFileSync(path.join(__dirname, 'fonts', 'Unbounded.ttf')).toString('base64'), FONT_F = fs.readFileSync(path.join(__dirname, 'fonts', 'Figtree.ttf')).toString('base64');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'og.json'), 'utf8'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const pg of pages) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face{font-family:Unbounded;font-weight:600 900;src:url('data:font/ttf;base64,${FONT_U}') format('truetype')}
      @font-face{font-family:Figtree;font-weight:400 800;src:url('data:font/ttf;base64,${FONT_F}') format('truetype')}
      body{margin:0;width:1200px;height:630px;background:#0C0A1A;font-family:Figtree,system-ui,sans-serif;color:#F4F1FF;overflow:hidden;position:relative}
      .glow{position:absolute;left:50%;top:60%;width:1400px;height:900px;transform:translate(-50%,-50%);background:radial-gradient(closest-side,${pg.color}55,${pg.color}18 45%,transparent 70%)}
      .dots{position:absolute;inset:0;background:radial-gradient(rgba(255,255,255,.07) 1.3px,transparent 1.7px) 0 0/14px 14px}
      .card{position:absolute;left:70px;top:70px;width:1060px;height:490px;border-radius:40px;background:${pg.color};color:#15122B;padding:150px 56px 48px;box-sizing:border-box;box-shadow:inset 0 -10px 0 rgba(0,0,0,.14),0 40px 80px rgba(0,0,0,.5);overflow:hidden}
      .card::before{content:'';position:absolute;inset:0;background:radial-gradient(rgba(21,18,43,.1) 1.4px,transparent 1.8px) 0 0/14px 14px}
      .k{position:relative;font:800 20px Unbounded;letter-spacing:.06em;text-transform:uppercase;opacity:.72}
      h1{position:relative;margin:14px 0 0;font:900 ${pg.h1.length > 58 ? 44 : 54}px/1.06 Unbounded;letter-spacing:-.03em;max-width:900px}
      .brand{position:absolute;right:56px;bottom:44px;display:flex;align-items:center;gap:14px;font:800 30px Unbounded;letter-spacing:-.02em}
      svg.g{position:absolute;left:0;top:0;width:100%;height:auto}
    </style></head><body><div class="glow"></div><div class="dots"></div><div class="card">${pg.garland}<span class="k">${pg.kicker}</span><h1>${pg.h1}</h1><span class="brand">${pg.brand}zparkling</span></div></body></html>`;
    await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const out = pg.slug ? path.join(PUB, 'ratgeber', pg.slug, 'og.png') : path.join(PUB, 'ratgeber', 'og.png');
    await p.screenshot({ path: out }); console.log(out);
  }
  await b.close();
})();
