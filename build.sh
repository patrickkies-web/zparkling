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
{ cat src/site-head.html; sed '1{/^<title>/d}' $APP; } > public/index.html
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
