const { load } = require('./run');
const c = load({ seed: 3 }); c.A.loadDemo();
c.A.openGuestForm(); c.UI.gForm.author = 'Paula';
c.A.gAdd({ v: 'worte' }); const it = c.gForm().items[0]; it.forId = c.E().focus[0].id; it.trait = 'herzlich'; it.interest = 'Kochen';
c.gRender();
c.A.gDraw(); c.flushTimers();
const k = c.UI.gk; console.log('type', k.type, k.phase);
c.setBind('gk.text', 'Faultier'); console.log('text', k.text, 'valid', c.gkValid(k), 'closing', c.UI.gkClosing);
try { c.A.gkDone(); } catch (e) { console.log('ERR', e.stack.split('\n').slice(0, 5).join('\n')); }
console.log('gk', !!c.UI.gk, 'cards', c.gForm().cards);
try { console.log(c.V.guestForm().length); } catch (e) { console.log('ERR2', e.stack.split('\n').slice(0, 5).join('\n')); }
const p = c.gkPickType; c.gkPickType = () => ({ type: 'wenn', n: 0 }); c.UI.gk = null; c.gkOpen(); c.gkPickType = p;
const h1 = c.V.guestForm().replace(/data-[a-z]+="[^"]*"|--[a-z0-9]+:[^;"]*/g, '');
const m = h1.match(/.{60}(\{[A-Za-z]+\}|undefined|NaN|null).{40}/g); console.log(m && m.slice(0, 5));
