/* SIM_HOOKS module: stores the app state the first time each kind of screen is rendered */
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'test', 'dumps');
module.exports = function (c) {
  const orig = c.render;
  c.render = function () {
    const out = orig.apply(this, arguments);
    try {
      const sc = c.UI.screen; let st = null;
      try { st = c.stepNow ? c.stepNow() : null; } catch (e) {}
      let key = sc;
      if ((sc === 'step' || sc === 'free') && st) {
        key += '-' + st.kind;
        if (st.kind === 'spiel') { const g = c.gameOf(st); key += '-' + st.format + (g && g.sp ? '-' + g.sp : ''); }
        if (st.result) key += '-res';
      }
      const f = path.join(DIR, key.replace(/[^a-zA-Z0-9_.-]/g, '_') + '.json');
      if (!fs.existsSync(f)) {
        const ui = {}; Object.keys(c.UI).forEach(k => { const v = c.UI[k]; if (v == null || typeof v !== 'object' || Array.isArray(v)) { try { JSON.stringify(v); ui[k] = v; } catch (e) {} } });
        fs.writeFileSync(f, JSON.stringify({ t: c.__t, S: c.S, UI: ui }));
      }
    } catch (e) { /* never disturb the sim */ }
    return out;
  };
};
