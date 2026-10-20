/* OG-Bilder (1200x630) für die Ratgeber-Seiten: node ratgeber/og.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const path = require('path'), fs = require('fs');
const PUB = path.join(__dirname, '..', 'public');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'og.json'), 'utf8'));
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const pg of pages) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@800;900&family=Figtree:wght@600;700&display=swap"><style>
      body{margin:0;width:1200px;height:630px;background:#0C0A1A;font-family:Figtree,system-ui,sans-serif;color:#F4F1FF;overflow:hidden;position:relative}
      .glow{position:absolute;left:50%;top:60%;width:1400px;height:900px;transform:translate(-50%,-50%);background:radial-gradient(closest-side,${pg.color}55,${pg.color}18 45%,transparent 70%)}
      .dots{position:absolute;inset:0;background:radial-gradient(rgba(255,255,255,.07) 1.3px,transparent 1.7px) 0 0/14px 14px}
      .card{position:absolute;left:70px;top:70px;width:1060px;height:490px;border-radius:40px;background:${pg.color};color:#15122B;padding:150px 56px 48px;box-sizing:border-box;box-shadow:inset 0 -10px 0 rgba(0,0,0,.14),0 40px 80px rgba(0,0,0,.5);overflow:hidden}
      .card::before{content:'';position:absolute;inset:0;background:radial-gradient(rgba(21,18,43,.1) 1.4px,transparent 1.8px) 0 0/14px 14px}
      .k{position:relative;font:800 20px Unbounded;letter-spacing:.06em;text-transform:uppercase;opacity:.72}
      h1{position:relative;margin:14px 0 0;font:900 54px/1.06 Unbounded;letter-spacing:-.03em;max-width:900px}
      .brand{position:absolute;right:56px;bottom:44px;display:flex;align-items:center;gap:14px;font:800 30px Unbounded;letter-spacing:-.02em}
      svg.g{position:absolute;left:0;top:0;width:100%;height:auto}
    </style></head><body><div class="glow"></div><div class="dots"></div><div class="card">${pg.garland}<span class="k">${pg.kicker}</span><h1>${pg.h1}</h1><span class="brand"><svg viewBox="0 0 64 64" width="52" height="52"><rect width="64" height="64" rx="16" fill="#15122B"/><g transform="translate(6.5 6.3) scale(.95)"><path d="M8 2H28V31L35 38C39.5 42.5 38 50.5 31.5 51.5C28.5 52 25.5 51 23 48.5L11 36.5C9 34.5 8 32 8 29Z" fill="#FF7A45"/></g><path d="M48 5Q49.6 12.4 57 14Q49.6 15.6 48 23Q46.4 15.6 39 14Q46.4 12.4 48 5Z" fill="#FFC940" stroke="#15122B" stroke-width="2.2" stroke-linejoin="round"/></svg>zparkling</span></div></body></html>`;
    await p.setContent(html); await p.waitForTimeout(900);
    const out = pg.slug ? path.join(PUB, 'ratgeber', pg.slug, 'og.png') : path.join(PUB, 'ratgeber', 'og.png');
    await p.screenshot({ path: out }); console.log(out);
  }
  await b.close();
})();
