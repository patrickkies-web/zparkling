/* renders the home-screen icons from assets/icon-full.svg: node assets/render-icons.js */
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/opt/npm-tools/node_modules/playwright'); } })();
const fs = require('fs'), path = require('path');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, 'icon-full.svg'), 'utf8');
  const b = await chromium.launch(); const p = await b.newPage();
  for (const [name, px] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
    await p.setViewportSize({ width: px, height: px });
    await p.setContent('<html><body style="margin:0">' + svg.replace('<svg ', '<svg width="' + px + '" height="' + px + '" ') + '</body></html>');
    await p.screenshot({ path: path.join(__dirname, '..', 'public', name), clip: { x: 0, y: 0, width: px, height: px } });
  }
  await b.close(); console.log('icons ok');
})();
