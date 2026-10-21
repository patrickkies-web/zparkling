#!/bin/bash
# Builds zparkling from the modules in src/ (files are joined in name order).
#   public/index.html                 the website; Cloudflare Pages serves the public/ folder
#   build/app.html                    the same app as a page fragment (claude.ai artifact, test harness)
#   test/page.html, test/debug.html   pages for the browser tests (debug: eval hook, example evening unlocked)
set -e
cd "$(dirname "$0")"
mkdir -p build
APP=build/app.html
{ cat src/head.html; for f in $(LC_ALL=C ls src/[0-9][0-9]*.js); do cat "$f"; done; cat src/tail.html; } > $APP
# syntax check of the script
node -e '
const fs=require("fs");const h=fs.readFileSync("'$APP'","utf8");
const a=h.indexOf("<script>")+8,b=h.lastIndexOf("</script>");
try{new Function(h.slice(a,b));console.log("SYNTAX_OK")}catch(e){console.log("SYNTAX_ERR",e.message);process.exit(1)}'
# the website: its own page frame (title, icons, ZP_SITE), the fragment's title line goes
# the website: the fonts come from /fonts (variable WOFF2, OFL) instead of Google Fonts; the artifact keeps the Google link
FONTS='<link rel="preload" href="/fonts/figtree.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/unbounded.woff2" as="font" type="font/woff2" crossorigin><style>@font-face{font-family:"Unbounded";font-style:normal;font-weight:200 900;font-display:swap;src:url(/fonts/unbounded.woff2) format("woff2")}@font-face{font-family:"Figtree";font-style:normal;font-weight:300 900;font-display:swap;src:url(/fonts/figtree.woff2) format("woff2")}</style>'
{ cat src/site-head.html; sed -e '1{/^<title>/d}' -e "s#^<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/[^>]*>\$#$FONTS#" $APP; } > public/index.html
grep -q 'fonts.googleapis' public/index.html && { echo "font substitution failed"; exit 1; }
# the landing page as static HTML inside the app root (crawlers, first paint)
node harness/prerender.js
# test page with the same frame claude.ai adds
{ cat src/wrapper.html; cat $APP; } > test/page.html
python3 - <<'PY'
s = open('test/page.html').read()
i = s.rindex('})();')
d = s[:i] + 'window.__ev = function (code) { return eval(code); };\n' + s[i:]
# browser tests see the whole app; a test sets DEMO_LIMITS = true for the limited example evening
d = d.replace('<script>', '<script>window.DEMO_OFF = true;', 1)
open('test/debug.html', 'w').write(d)
PY
echo "public/index.html $(wc -c < public/index.html) bytes"
