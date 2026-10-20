const { load } = require('./run');
const c = load({ seed: 6 }); c.A.loadDemo();
c.A.openGuestForm(); c.UI.gForm.author = 'P';
c.S.questions = c.S.questions.filter(q => q.type !== 'umfrage');
const id = c.E().focus[1].id;
for (let i = 0; i < 8; i++) c.S.questions.push({ id: 'uq' + i, t: 1, author: 'G' + i, forId: id, type: 'umfrage', qk: 'geld', text: 'X' + i, status: 'ok', used: false, options: [], correct: 0 });
console.log(c.guestSubmissions().filter(q => q.type === 'umfrage').length, JSON.stringify(c.gkUmfragePick()), id);
