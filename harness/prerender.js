/* Writes the landing page as static HTML into public/index.html: the text is in the
   source for crawlers and paints before the script is parsed. The app keeps that DOM
   on its first render (see render()). node harness/prerender.js */
'use strict';
const fs = require('fs'), path = require('path');
const { load } = require('./run');
const file = path.join(__dirname, '..', 'public', 'index.html');
const c = load({});
c.UI.screen = 'landing';
const html = c.V.landing();
let page = fs.readFileSync(file, 'utf8');
const mark = '<div id="app"></div>';
if (page.indexOf(mark) < 0) { console.error('prerender: app root not found'); process.exit(1); }
page = page.replace(mark, '<div id="app" data-prerender="landing" data-screen="landing">' + html + '</div>');
fs.writeFileSync(file, page);
console.log('prerender: landing, ' + html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length + ' words of static text');
