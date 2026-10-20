const { load } = require('./run');
const c = load({ seed: 3 });
let bad = 0;
for (const nm of ['', 'Tom', 'tom ', 'Mia', 'Jonas', 'Lea', 'Ben', 'Sara', 'Kim', 'Tante Rosi']) {
  c.UI.tourName = nm;
  for (const f of ['artName', 'artStage', 'artLink', 'artGames', 'artModes', 'artDials', 'artRoles', 'artTicket']) {
    try { const h = c[f](); if (/undefined|NaN/.test(h)) { bad++; console.log('suspicious', nm, f); } } catch (e) { bad++; console.log('ERR', JSON.stringify(nm), f, e.message); }
  }
  for (let at = 0; at < 12; at++) { c.UI.tourAt = at; try { c.V.tour(); } catch (e) { bad++; console.log('ERR view', nm, at, e.message); } }
}
console.log(bad ? bad + ' problems' : 'TOUR OK for all names');
