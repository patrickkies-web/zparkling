const { load } = require('./run');
const c = load({ seed: 7 });
c.A.loadDemo();
console.log('screen', c.UI.screen, 'focus', c.E().focus.map(p => p.name).join(','), 'games', c.GAMES.length);
c.A.openRun(); c.A.startRun();
console.log('run', !!c.R(), c.R().variant, c.R().planSteps);
c.A.runNext();
console.log('pending', c.R().pending.kind, c.UI.screen);
