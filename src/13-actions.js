/* =========================================================
   Rendering core
   ========================================================= */
var app = document.getElementById('app');
var toastTimer = null;
function render() {
  if (UI.guestMode !== 'link') {
    if (UI.screen === 'welcome') UI.screen = 'landing';
    if (!E() && ['landing', 'setup', 'person', 'tour', 'pass'].indexOf(UI.screen) < 0) UI.screen = 'landing';
  }
  var body = app.querySelector('.body');
  var keep = body && app.getAttribute('data-screen') === UI.screen ? body.scrollTop : 0;
  var fn = V[UI.screen] || V.landing;
  app.innerHTML = fn() + (UI.qrBig ? qrBigHtml() : '') + (UI.toast ? '<div class="toast" role="status">' + esc(UI.toast) + '</div>' : '');
  app.setAttribute('data-screen', UI.screen);
  if (UI.screen !== 'guestForm' && app.classList) app.classList.remove('gglow');
  var nb = app.querySelector('.body');
  if (nb) nb.scrollTop = keep;
  if (UI.gk && UI.screen === 'guestForm') gkRestore();
  KB = null;
  tintSoon();
  if (UI.screen === 'landing' && UI.slotOn !== app.querySelector('#lpslot')) { UI.slotOn = app.querySelector('#lpslot'); slotRun(); }
}
function go(screen) { UI.confirm = null; UI.qrBig = null; UI.screen = screen; if (S && S.event) save(); render(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0; }
function commit() { save(); render(); }
function setToast(msg) {
  UI.toast = msg;
  var t = app.querySelector('.toast');
  if (t) t.textContent = msg; else app.insertAdjacentHTML('beforeend', '<div class="toast" role="status">' + esc(msg) + '</div>');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { UI.toast = ''; var el = app.querySelector('.toast'); if (el) el.remove(); }, 1900);
}
function stepNow() { return curStep(); }

/* =========================================================
   Actions
   ========================================================= */
var A = A || {};
A.go = function (d) { if (d.to === 'counter') UI.counterFrom = ''; go(d.to); };
A.askConfirm = function (d) { UI.confirm = d.v; render(); var c = app.querySelector('.confirm'); if (c && c.scrollIntoView) { try { c.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} } };
A.cancelConfirm = function () { UI.confirm = null; render(); };
A.copyText = function (d) {
  var txt = d.text;
  function ok() { setToast('Kopiert'); }
  function no() { setToast('Kopieren geht hier nicht, bitte Text markieren'); }
  try { navigator.clipboard.writeText(txt).then(ok, no); } catch (e) { no(); }
};

/* setup */
A.newEvent = function () { S = fresh(); S.event = newEvent(); MAT_PRESET_PARTY.forEach(function (id) { S.event.mats[id] = true; }); S.collectCode = makeCode(); UI.step = 1; UI.setupErr = ''; go('setup'); };
/* a name for the evening when none was given: Kranz-Abend Jonas & Mia */
function autoEventName() {
  var t = evType(), w = t.fam === 'kranz' ? 'Kranz-Abend' : t.id === 'klinke' ? 'Klinken-Abend' : t.fam === 'zeit' ? 'Treppen-Abend' : t.id === 'jga' ? 'JGA' : t.id === 'hochzeit' ? 'Polterabend' : t.id === 'geburtstag' ? 'Geburtstag' : 'Party';
  return w + ' ' + focusNames();
}
A.loadDemo = function () { demoEvent(); S.demo = true; save(); UI.confirm = null; go('home'); };
A.setupBack = function () { if (UI.step > 1) { UI.step -= 1; UI.setupErr = ''; render(); } else { S.event = null; go('welcome'); } };
A.setupNext = function () {
  if (UI.step === 2 && !E().focus.length) { UI.setupErr = 'Leg mindestens eine Person an, die gefeiert wird.'; render(); return; }
  if (UI.step >= 2 && !String(E().name || '').trim()) E().name = autoEventName();
  UI.setupErr = ''; UI.step = Math.min(3, (UI.step || 1) + 1); go('setup');
};
A.setupFinish = function () { if (!String(E().name || '').trim()) E().name = autoEventName(); UI.homeIn = true; go('home'); };
A.setTypeOpen = function () { UI.setTypeOpen = !UI.setTypeOpen; render(); };
A.setPilotOpen = function () { UI.setPilotOpen = !UI.setPilotOpen; render(); };
A.setEventAnlass = function (d) {
  if (UI.screen === 'settings') UI.setTypeOpen = false;
  var e = E(); if (e.anlass === d.v) { render(); return; }
  e.anlass = d.v;
  var t = evType();
  e.focus.forEach(function (p) { p.anlass = t.person; if (FA[t.person].kind === 'kranz') p.count = p.count || FA[t.person].count; if (p.av) avTheme(p.av, p.anlass); });
  if (!S.run || S.run.finished) S.runCfg = null;
  commit();
};
A.setUnit = function (d) { E().unit = d.v; commit(); };
A.setMax = function (d) { E().max = clamp(E().max + (+d.d), 2, 30); commit(); };
A.setJokers = function (d) { E().jokers = clamp(E().jokers + (+d.d), 0, 5); commit(); };

/* persons & avatars */
function avTheme(av, anlass) {
  var kranz = anlass === 'sockenkranz' ? 'sockenkranz' : anlass === 'schachtelkranz' ? 'schachtelkranz' : '';
  if (av.neck === 'sockenkranz' || av.neck === 'schachtelkranz') av.neck = kranz || pick(['keiner', 'fliege', 'kette']);
  if (av.hat === 'socke' || av.hat === 'schachteln') av.hat = kranz === 'sockenkranz' ? 'socke' : kranz === 'schachtelkranz' ? 'schachteln' : 'partyhut';
  return av;
}
A.addPerson = function (d) {
  if (E().focus.length >= 3) return;
  var an = evType().person;
  UI.draft = { id: null, name: '', nick: '', partner: '', anlass: an, count: FA[an].count, av: avTheme(avRandom(), an) };
  tourSeedDraft(UI.draft, an);
  UI.draftIsNew = true; UI.draftFrom = d.from || 'setup'; UI.draftErr = ''; UI.avCat = 'form'; UI.avMood = '';
  go('person');
};
A.editPerson = function (d) {
  UI.draft = clone(E().focus[+d.i]); UI.draft.av = avFix(UI.draft.av);
  UI.draftIsNew = false; UI.draftFrom = d.from || 'settings'; UI.draftErr = ''; UI.avCat = 'form'; UI.avMood = '';
  go('person');
};
A.draftAnlass = function (d) { UI.draft.anlass = d.v; UI.draft.count = FA[d.v].count; avTheme(UI.draft.av, d.v); render(); };
A.draftCount = function (d) { UI.draft.count = clamp(UI.draft.count + (+d.d), 5, 60); render(); };
A.avCat = function (d) { UI.avCat = d.v; render(); };
A.avMood = function (d) { UI.avMood = d.v; render(); };
A.avSet = function (d) {
  var av = UI.draft.av;
  if (d.k === 'ex') { av.ex = av.ex || {}; av.ex[d.v] = !av.ex[d.v]; }
  else av[d.k] = d.v;
  render();
};
A.avDice = function () { UI.draft.av = avTheme(avRandom(UI.draft.count), UI.draft.anlass); render(); };
A.savePerson = function () {
  var d = UI.draft;
  d.name = (d.name || '').trim(); d.nick = (d.nick || '').trim(); d.partner = (d.partner || '').trim();
  if (!d.name) { UI.draftErr = 'Gib einen Namen ein.'; render(); return; }
  d.av.num = String(d.count < 100 ? d.count : 25);
  if (UI.draftIsNew) { d.id = uid('f'); E().focus.push(d); }
  else E().focus = E().focus.map(function (f) { return f.id === d.id ? d : f; });
  if (S.runCfg && S.runCfg.who) S.runCfg.who[d.id] = S.runCfg.who[d.id] !== false;
  if (S.runCfg && S.runCfg.counts) S.runCfg.counts[d.id] = d.count;
  UI.setupErr = '';
  go(UI.draftFrom);
};
A.deletePerson = function () {
  var id = UI.draft.id;
  E().focus = E().focus.filter(function (f) { return f.id !== id; });
  if (S.runCfg && S.runCfg.who) delete S.runCfg.who[id];
  go(UI.draftFrom);
};
A.resetAll = function () { S = fresh(); lsDel(LIVE_KEY); lsDel(INBOX_Q); save(); UI.confirm = null; go('welcome'); };

/* questions */
function gReset() { UI.gForm = null; UI.gPassData = null; UI.gBubble = null; UI.gPts = null; UI.gHudFx = null; UI.gRare = null; UI.gFinal = null; UI.gLast = {}; UI.gGreeted = ''; gkClose(); UI.gk = null; UI.gDrawSeen = false; UI.gkBusy = false; UI.gkClosing = false; UI.gkFresh = false; UI.gkWaitBlur = false; clearTimeout(UI.gkRevealT); }
A.openGuestForm = function () { UI.guestMode = 'test'; UI.guestFrom = UI.screen; UI.qDraft = qDraftNew(''); gReset(); UI.qSent = ''; UI.qErr = ''; go('guestForm'); gAfter(); };
A.openMasterForm = function () { UI.guestMode = 'master'; UI.qDraft = qDraftNew('Spielleiter'); UI.qSent = ''; UI.qErr = ''; UI.mSaved = null; UI.gHudFx = null; go('guestForm'); gAfter(); };
A.qType = function (d) { UI.qDraft.type = d.v; UI.qErr = ''; if (d.v === 'luege' && UI.qDraft.correct > 2) UI.qDraft.correct = 0; render(); };
A.qFor = function (d) { UI.qDraft.forId = d.v; render(); };
A.qCorrect = function (d) { UI.qDraft.correct = +d.i; render(); };
function draftToQ(d, author, master) {
  author = String(author || '').trim();
  var text = String(d.text || '').trim();
  var err = '';
  var needsText = ['schaetzen', 'auswahl', 'bereich', 'aufgabe', 'wer'].indexOf(d.type) >= 0;
  if (!master && !author) err = 'Bitte gib deinen Namen an.';
  else if (needsText && !text) err = d.type === 'aufgabe' ? 'Beschreib die Aufgabe.' : d.type === 'wer' ? 'Schreib deine Erinnerung auf.' : 'Schreib deine Frage auf.';
  var q = { id: 'q' + Date.now() + Math.floor(Math.random() * 1000), t: Date.now(), author: author || 'Spielleiter', forId: d.forId || '', type: d.type, text: text, unit: String(d.unit || '').trim(), answer: '', options: [], correct: 0, min: '', max: '', note: String(d.note || '').trim(), status: master ? 'ok' : 'offen', used: false };
  if (!err && d.type === 'schaetzen') { if (d.answer === '' || isNaN(Number(d.answer))) err = 'Gib die richtige Lösung als Zahl an.'; else q.answer = Number(d.answer); }
  if (!err && d.type === 'bereich') {
    var mn = Number(d.min), mx = Number(d.max), an = Number(d.answer);
    if (d.min === '' || d.max === '' || isNaN(mn) || isNaN(mx) || mn >= mx) err = 'Der Bereich braucht ein kleineres „Von“ als „Bis“.';
    else if (d.answer === '' || isNaN(an) || an < mn || an > mx) err = 'Die Lösung muss im Bereich liegen.';
    else { q.min = mn; q.max = mx; q.answer = an; }
  }
  if (!err && d.type === 'auswahl') {
    var opts = [], corr = -1;
    d.options.forEach(function (o, i) { o = String(o || '').trim(); if (o) { if (i === d.correct) corr = opts.length; opts.push(o); } });
    if (opts.length < 2) err = 'Gib mindestens zwei Antworten an.';
    else if (corr < 0) err = 'Markier die richtige Antwort mit dem Kreis.';
    else { q.options = opts; q.correct = corr; }
  }
  if (!err && d.type === 'steckbrief') {
    var yr = String(d.year || '').trim(), bd = String(d.bday || '').trim(), mt = String(d.meet || '').trim(), by = String(d.byear || '').trim(), nowY = new Date().getFullYear();
    if (!yr && !bd && !mt) err = 'Füll mindestens eins der drei Felder aus.';
    else if (yr && (isNaN(Number(yr)) || Number(yr) < 1940 || Number(yr) > nowY)) err = 'Das Jahr muss zwischen 1940 und ' + nowY + ' liegen.';
    else if (bd && !parseBday(bd)) err = 'Den Geburtstag bitte als Tag.Monat, zum Beispiel 12.03.';
    else if (by && (isNaN(Number(by)) || Number(by) < 1920 || Number(by) > nowY)) err = 'Der Jahrgang muss zwischen 1920 und ' + nowY + ' liegen.';
    else { q.year = yr ? Number(yr) : ''; q.bday = bd ? parseBday(bd) : ''; q.meet = mt.slice(0, 160); q.byear = by ? Number(by) : ''; q.text = 'Steckbrief'; }
  }
  if (!err && d.type === 'luege') {
    var st = d.options.slice(0, 3).map(function (o) { return String(o || '').trim(); });
    if (st.some(function (x) { return !x; })) err = 'Schreib alle drei Sätze auf.';
    else if (!(d.correct >= 0 && d.correct <= 2)) err = 'Markier, welcher Satz gelogen ist.';
    else { q.options = st; q.correct = d.correct; q.text = 'Zwei Wahrheiten, eine Lüge'; }
  }
  if (!err && d.type === 'wer' && text.length < 8) err = 'Erzähl ein bisschen mehr, damit man raten kann.';
  if (!err && d.type === 'worte') {
    var tr = String(d.trait || '').trim().slice(0, 40), ir = String(d.interest || '').trim().slice(0, 40);
    if (!tr || !ir) err = 'Schreib ein Wort für die Person und eins für ein Interesse.';
    else if (E() && E().focus.length > 1 && !d.forId) err = 'Wähl aus, über wen die zwei Worte sind.';
    else { q.trait = tr; q.interest = ir; q.text = 'In zwei Worten'; }
  }
  if (!err && d.type === 'tipp') {
    var mins = Number(d.answer);
    if (d.answer === '' || isNaN(mins) || mins < 5 || mins > 600) err = 'Tipp eine Zahl zwischen 5 und 600 Minuten.';
    else { q.answer = Math.round(mins); q.text = 'Tipp: ' + Math.round(mins) + ' Minuten'; q.forId = ''; }
  }
  return { q: q, err: err };
}
A.qSubmit = function () {
  var res = draftToQ(UI.qDraft, 'Spielleiter', true);
  if (res.err) { UI.qErr = res.err; render(); return; }
  UI.qErr = ''; S.questions.push(res.q); save();
  UI.qSent = 'Spielleiter'; UI.qDraft = qDraftNew('Spielleiter');
  render();
};
/* guests: several contributions at once */
function scrollToEl(id) { var el = document.getElementById(id), b = app.querySelector('.body'); if (el && b && el.getBoundingClientRect) b.scrollTop += el.getBoundingClientRect().top - b.getBoundingClientRect().top - 12; }
A.gAdd = function (d) {
  if (!(UI.guestMode === 'master' ? mDemoOk(d.v) : demoTypeOk(d.v))) { A.demoInfo(); return; }
  var G = gForm(), t = d.v, n = gCount(t), mx = gMax(t);
  if (UI.guestMode === 'master') UI.mSaved = null;
  if (n >= mx) { setToast(t === 'tipp' ? 'Ein Tipp pro Person reicht' : t === 'steckbrief' ? (mx === 1 ? 'Ein Steckbrief reicht' : 'Ein Steckbrief pro Person im Fokus') : t === 'worte' ? (mx === 1 ? 'Zwei Worte reichen' : 'Zwei Worte pro Person im Fokus') : 'Mehr als ' + mx + ' auf einmal geht nicht'); return; }
  var it = qDraftNew(G.author); it.type = t; it.key = 'k' + Date.now().toString(36) + Math.floor(Math.random() * 1000);
  if (t === 'luege' || t === 'auswahl') it.correct = -1;
  if (t === 'bereich') { it.min = '0'; it.max = '100'; }
  if ((t === 'steckbrief' || t === 'worte') && E() && E().focus.length > 1) {
    var have = G.items.filter(function (x) { return x.type === t; });
    have.forEach(function (x, i) { if (!x.forId) x.forId = E().focus[i].id; });
    var free = E().focus.filter(function (p) { return !have.some(function (x) { return x.forId === p.id; }); })[0];
    it.forId = have.length && free ? free.id : t === 'worte' ? E().focus[0].id : '';
  }
  G.items.push(it); UI.qErr = '';
  UI.gBump = t; UI.gNew = it.key; UI.gFlyT = { t: t, i: G.items.length - 1 };
  gSay(gRareSet().indexOf(t) >= 0 && n === 0 ? 'rare' : 'add_' + gFam(t), it);
  gVibe(15);
  gRender();
  if (!UI.gTaught) { UI.gTaught = true; setToast('Deine Karte ist unten dazugekommen'); }
};
A.gSub = function (d) {
  var G = gForm();
  for (var i = G.items.length - 1; i >= 0; i--) if (G.items[i].type === d.v) { G.items.splice(i, 1); break; }
  UI.gBump = d.v; gSay('remove'); gRender();
};
A.gDel = function (d) { gForm().items.splice(+d.k, 1); gSay('remove'); gRender(); };
function gAfterClick(i) {
  var it = gForm().items[i]; if (!it) return;
  var was = it._done, now2 = gDone(it);
  if (now2 && !was) { UI.gJust = it.key; gSay(gDoneEvt(it), it, gVars(it)); gVibe([20, 40, 20]); }
  if (now2) it.err = '';
}
A.gCorrect = function (d) {
  var it = gForm().items[+d.k]; if (!it) return;
  it.correct = +d.i;
  if (it.type === 'luege') { UI.gLie = it.key; gSay('lie', it); } else { UI.gSpark = it.key; gSay('correct', it); }
  gVibe(12); gAfterClick(+d.k); gRender();
};
A.gMonth = function (d) {
  var it = gForm().items[+d.k]; if (!it) return;
  it.bm = String(it.bm) === String(d.v) ? '' : d.v; gBdaySync(it);
  gVibe(10); gAfterClick(+d.k); gRender();
  var mon = app.querySelector('#gi' + d.k + ' .gmon.on'); if (mon) gBurst(mon, GQ_STYLE.steckbrief.c, 8);
};
A.gFlip = function () { var t = app.querySelector('.gticket'); if (t) { t.classList.toggle('flipped'); gVibe(10); } };
A.gFor = function (d) { var it = gForm().items[+d.k]; if (it) { it.forId = d.v; gAfterClick(+d.k); gRender(); } };
A.gSubmit = function () {
  var G = gForm(), author = String(G.author || '').trim(), first = -1, out = [], cardsDone = G.cards || [];
  UI.qErr = '';
  if (UI.gk) return;
  if (!author) { UI.qErr = 'Bitte gib oben deinen Namen an.'; gSay('missing'); gRender(); scrollToEl('qAuthor'); var a = document.getElementById('qAuthor'); if (a) a.focus(); return; }
  if (!G.items.length && !cardsDone.length) { UI.qErr = 'Tipp oben an, was du beitragen willst.'; gSay('hello'); gRender(); return; }
  G.items.forEach(function (it, i) { var r = draftToQ(it, author, false), miss = gMissing(it); it.err = miss.length ? 'Fehlt noch: ' + miss.join(', ') : r.err; if (it.err) { if (first < 0) first = i; } else out.push(r.q); });
  if (first >= 0) {
    var bad = G.items.filter(function (x) { return x.err; }).length;
    UI.qErr = bad === 1 ? 'Bei einem Beitrag fehlt noch etwas, er ist rot markiert.' : 'Bei ' + bad + ' Beiträgen fehlt noch etwas, sie sind rot markiert.';
    UI.gShake = true; gSay('missing'); gVibe([40, 30, 40]);
    gRender(); scrollToEl('gi' + first); return;
  }
  var pts = gScore(), stickers = gStickers();
  cardsDone.forEach(function (c, i) { out.push(gkToQ(c, author, i)); });
  out.forEach(function (q, i) { q.id = q.id + 'x' + i; q.t = q.t + i; });
  if (UI.guestMode === 'link') { var inbox = lsGet(INBOX_Q) || []; lsSet(INBOX_Q, inbox.concat(out)); }
  else { S.questions = S.questions.concat(out); save(); }
  var names = {}; guestSubmissions().forEach(function (q) { names[String(q.author).toLowerCase()] = 1; });
  var pass = gPass(); pass.name = author; pass.bank = pts; pass.stickers = stickers; pass.sent = (pass.sent || 0) + out.length; pass.cards = (pass.cards || 0) + cardsDone.length; cardsDone.forEach(function (c) { if (gkSpecial(c.type)) pass[c.type] = true; }); gPassSave();
  var types = {}; out.forEach(function (q) { types[q.type] = (types[q.type] || 0) + 1; });
  UI.gFinal = { pts: pts, n: out.length, no: Object.keys(names).length, stickers: stickers, types: types };
  UI.qSent = author; UI.gSentN = out.length; UI.gForm = { author: author, items: [], cards: [] }; UI.gDrawSeen = false;
  gSay('sent'); UI.gFinFx = true; gVibe([30, 60, 30, 60, 120]);
  gRender(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0;
};
A.qAnother = function () { UI.qSent = ''; UI.gRare = null; UI.gPts = null; UI.gHudFx = null; UI.gFinal = null; gSay('name'); gRender(); };
A.qFilter = function (d) { UI.qFilter = d.v; UI.qOpen = null; render(); };
A.qSet = function (d, el) {
  var apply = function () { S.questions.forEach(function (q) { if (q.id === d.id) { q.status = d.v; } }); if (UI.qOpen === d.id) UI.qOpen = null; commit(); setToast(d.v === 'ok' ? 'Freigegeben' : d.v === 'nein' ? 'Abgelehnt' : 'Wieder bei „Neu“'); };
  var card = el && el.closest ? el.closest('.qx-card') : null;
  if (card) { if (card.classList.contains('qx-out')) return; card.classList.add('qx-out', d.v === 'ok' ? 'yes' : 'no'); setTimeout(apply, 380); return; }
  apply();
};
A.qAllShow = function () { UI.qAll = true; render(); };
A.qAllOk = function () { var n = 0; S.questions.forEach(function (q) { if (q.status === 'offen') { q.status = 'ok'; n++; } }); commit(); setToast(n === 1 ? '1 Beitrag freigegeben' : n + ' Beiträge freigegeben'); };
A.qOpen = function (d) { UI.qOpen = UI.qOpen === d.id ? null : d.id; render(); };
A.qKind = function (d) { UI.qKind = UI.qKind === d.v ? '' : d.v; UI.qOpen = null; render(); };
A.qrBig = function (d) { UI.qrBig = { code: d.code, title: d.title }; render(); };
A.qrClose = function () { UI.qrBig = null; render(); };

/* counter */
A.drinkPlus = function (d) { var bd = budOf(d.id); addDrink(d.id, 1, 'manuell'); commit(); setToast('+1 ' + U() + ' für ' + person(d.id).name + (bd ? ', ' + bd + ' trinkt mit' : '')); };
A.drinkMinus = function (d) { if (drinksOf(d.id) <= 0) return; addDrink(d.id, -1, 'manuell', 'Korrektur'); commit(); };
A.addCounterPerson = function () { var id = addPersonByName(UI.counterName); UI.counterName = ''; commit(); if (id) setToast(person(id).name + ' ist im Zähler'); var i = document.getElementById('cName'); if (i) i.focus(); };
A.undoDrink = function () { S.drinks.pop(); commit(); setToast('Letzter Eintrag gelöscht'); };
A.openCounter = function (d) { UI.counterFrom = d.from || ''; go('counter'); };

/* games */
A.peekToggle = function (d) { UI.peek = UI.peek === d.v ? '' : d.v; render(); };
A.matToggle = function (d) { var e = E(); e.mats = e.mats || {}; if (e.mats[d.v]) delete e.mats[d.v]; else e.mats[d.v] = true; commit(); };
A.matPreset = function (d) {
  var e = E(); e.mats = {};
  if (d.v === 'all') MATERIALS.forEach(function (m) { e.mats[m.id] = true; });
  if (d.v === 'party') MAT_PRESET_PARTY.forEach(function (id) { e.mats[id] = true; });
  commit(); setToast(playableCount() + ' Spiele spielbar');
};
A.openMaterial = function (d) { UI.matFrom = d.from || 'settings'; go('material'); };
function freeCtx() { var f = E().focus.map(function (p) { return p.id; }); return { focus: f, together: f.length >= 2 ? 'gemeinsam' : 'allein', variant: 'socke', themes: themesOf(null) }; }
function buildFree(kind, not) {
  var main = E().focus[0].id, ctx = freeCtx();
  if (kind === 'gast') {
    var ids = shuffle(E().focus.map(function (p) { return p.id; }));
    for (var i = 0; i < ids.length; i++) { var st = makeGuestGameStep(ids[i], not); if (st) return st; }
    return null;
  }
  if (kind === 'spiel') return makeGameStep(main, ctx);
  if (kind === 'mission') return makeMissionStep(main, null);
  if (kind === 'partner') return makePartnerStep(main, ctx);
  if (kind === 'menge') return makeMengeStep(main, E().focus.map(function (p) { return p.id; }));
  if (kind === 'wwe') return E().focus.length >= 2 ? makeQuestionStep(main, 'wwe', themesOf(null)) : null;
  if (kind === 'frage') {
    var qs = S.questions.filter(questionPlayable);
    if (!qs.length) return null;
    var q = pick(qs);
    return prepGuestStep({ kind: 'frage', qid: q.id, main: q.forId && isFocus(q.forId) ? q.forId : main, type: q.type, answerFocus: '', group: '' }, q);
  }
  return makeQuestionStep(main, kind, themesOf(null));
}
A.freeQuick = function (d) {
  if (!demoFreeOk(d.v)) { A.demoLocked(); return; }
  if (needPass('Zwischendurch-Spiele sind im Game Pass enthalten.')) return;
  var step = buildFree(d.v);
  if (!step) { setToast(d.v === 'mission' ? 'Gerade passt keine Mission, schau in die Packliste' : d.v === 'frage' ? 'Noch keine freigegebenen Fragen' : d.v === 'gast' ? 'Für eine Gäste-Runde fehlen noch Beiträge' : 'Dafür braucht ihr zwei Fokus-Personen'); if (d.v === 'frage' || d.v === 'gast') go('questions'); return; }
  S.free = { step: step, from: UI.screen === 'games' ? 'games' : 'home' };
  go('free');
};
A.freeCancel = function () { var from = S.free ? S.free.from : 'home'; S.free = null; go(from); };
A.freeOther = function () {
  var P = S.free.step, kind = P.kind, main = P.main;
  var step = kind === 'spiel' ? makeGameStep(main, freeCtx()) : kind === 'mission' ? makeMissionStep(main, null, { max: P.lvl, not: P.mid }) : buildFree(kind, P.gg);
  if (kind === 'gast' && !step) { setToast('Gerade ist keine andere Gäste-Runde bereit'); return; }
  if (step) { if (step.kind !== 'wwe' && step.kind !== 'partner' && step.kind !== 'mission' && isFocus(main) && kind !== 'frage' && kind !== 'gast') step.main = main; S.free.step = step; }
  commit();
};
A.freeMain = function (d) {
  var P = S.free.step; P.main = d.v;
  if (P.kind === 'spiel' && P.format === 'duell') { var o = E().focus.filter(function (p) { return p.id !== d.v; })[0]; P.opp = o ? o.id : null; }
  if (P.kind === 'spiel' && P.format === 'team') P.team = E().focus.map(function (p) { return p.id; });
  commit();
};

/* run setup */
/* the evening's settings can be made without a pass, only the start needs it */
A.openRun = function () { if (S.run && !S.run.finished) { go(S.run.pending ? 'step' : 'run'); return; } cfgDefaults(); UI.cfgErr = ''; UI.cfgStep = 1; go('runSetup'); };
/* the setup steps: forward only when the first step is complete */
function cfgGoStep(n) {
  n = Math.max(1, Math.min(3, n));
  var block = n > 1 ? cfgBlock() : '';
  if (block) { UI.cfgStep = 1; UI.cfgErr = block; render(); return; }
  UI.cfgErr = ''; UI.cfgStep = n; render();
  var b = app.querySelector('.body'); if (b) b.scrollTop = 0;
}
A.cfgNext = function () { cfgGoStep(cfgStepNow() + 1); };
A.cfgPrev = function () { cfgGoStep(cfgStepNow() - 1); };
A.cfgStep = function (d) { cfgGoStep(+d.v || 1); };
A.cfgVariant = function (d) {
  var c = cfgDefaults(); c.variant = d.v;
  if (d.v === 'zeit') {
    if (!c.acc.items.length) { var f = E().focus[0], job = f && faOf(f).job ? faOf(f).job : 'fegen'; c.acc.items = ACC_SUGGEST[job].slice(0, 4); c.acc.swaps = 6; }
    if (c.minutes > 90) c.minutes = 60;
  }
  if (d.v === 'abend' && c.minutes < 90) c.minutes = 120;
  if (d.v !== 'abend' && d.v !== 'zeit' && c.minutes > 150) c.minutes = 75;
  commit();
};
A.cfgWho = function (d) {
  var c = cfgDefaults(), on = !c.who[d.v];
  var count = E().focus.filter(function (p) { return c.who[p.id]; }).length;
  if (!on && count <= 1) { setToast('Mindestens eine Person muss mitmachen'); return; }
  c.who[d.v] = on; commit();
};
A.cfgTogether = function (d) { cfgDefaults().together = d.v; commit(); };
A.cfgMinutes = function (d) { var c = cfgDefaults(); c.minutes = clamp(c.minutes + 5 * (+d.d), 15, 240); commit(); };
A.cfgFields = function (d) { var c = cfgDefaults(); c.fields = clamp(c.fields + 5 * (+d.d), 15, 120); commit(); };
A.cfgRounds = function (d) { var c = cfgDefaults(); c.rounds = clamp(c.rounds + (+d.d), 5, 80); commit(); };
A.cfgMeters = function (d) { var c = cfgDefaults(); c.meters = clamp(c.meters + (+d.d), 3, 60); commit(); };
A.cfgShared = function (d) { var c = cfgDefaults(); c.shared = clamp(c.shared + (+d.d), 5, 80); commit(); };
A.cfgCount = function (d) { var c = cfgDefaults(); c.counts[d.id] = clamp((c.counts[d.id] || 25) + (+d.d), 5, 80); commit(); };
A.cfgAccAdd = function () {
  var c = cfgDefaults(), n = String(UI.accName || '').trim();
  if (!n) return;
  c.acc.items.push(n); UI.accName = '';
  if (c.acc.items.length >= 2 && !c.acc.swaps) c.acc.swaps = Math.round(c.acc.items.length * 1.5);
  commit();
  var i = document.getElementById('accName'); if (i) i.focus();
};
A.cfgAccDel = function (d) { var c = cfgDefaults(); c.acc.items.splice(+d.i, 1); if (c.acc.items.length < 2) c.acc.swaps = 0; commit(); };
A.cfgSwaps = function (d) { var c = cfgDefaults(); c.acc.swaps = clamp(c.acc.swaps + (+d.d), 0, 30); commit(); };
A.cfgLink = function () { var c = cfgDefaults(); c.link = !c.link; commit(); };
A.cfgBuddy = function () { var c = cfgDefaults(); c.buddy = c.buddy === false; commit(); };
A.startRun = function () { if (needPass('Das Spiel starten geht mit dem Game Pass.')) return;
  /* a Junggesellenabschied needs its crew: the master enters who is there */
  if (isJga() && crewList().length < 2) { UI.cfgErr = 'Tragt zuerst die Truppe ein, mindestens zwei Namen. Beim Junggesellenabschied spielt sie mit.'; UI.cfgStep = 1; render(); return; }
  if (!startRun()) { UI.cfgErr = 'Wähl mindestens eine Person aus.'; UI.cfgStep = 1; render(); return; } UI.confirm = null; UI.ckLog = false; commit(); go('run'); runKickoff(); };
/* jump to a part of a long page, below the sticky chips */
A.jump = function (d) {
  var b = app.querySelector('.body'), el = document.getElementById(d.v); if (!b || !el || !el.getBoundingClientRect) return;
  var sc = typeof gScale === 'function' ? gScale() : 1, bar = app.querySelector('.qx-jump');
  var top = (el.getBoundingClientRect().top - b.getBoundingClientRect().top) / sc + b.scrollTop - (bar ? bar.offsetHeight + 12 : 12);
  try { b.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); } catch (e) { b.scrollTop = Math.max(0, top); }
};
A.kickClose = kickClose;
/* a tile in the overview: show only that kind, down in the list */
A.qKindJump = function (d) { UI.qKind = d.v; UI.qFilter = 'ok'; render(); A.jump({ v: 'qs-alle' }); };
/* the big start button on the home screen */
A.heroGo = function () {
  if (S.run && !S.run.finished) { go(S.run.pending ? 'step' : 'run'); return; }
  if (!cfgSaved()) {
    setToast('Stell zuerst den Abend ein: wer spielt, Spielart, alles bereit?');
    gVibe([30, 50, 30]);
    var b = app.querySelector('.setbar');
    if (b && b.classList) { b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); if (b.scrollIntoView) { try { b.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } catch (e) {} } }
    return;
  }
  if (needPass('Das Spiel starten geht mit dem Game Pass.')) return;
  var block = cfgBlock(); if (block) { UI.cfgStep = 1; UI.cfgErr = block; go('runSetup'); return; }
  A.startRun();
};
/* the last setup step saves the evening, the start waits on the home screen */
A.cfgSave = function () {
  var block = cfgBlock(); if (block) { UI.cfgStep = 1; UI.cfgErr = block; render(); return; }
  var c = cfgDefaults(); c.saved = true; UI.cfgErr = ''; UI.heroFx = 'unlock';
  commit(); go('home'); setToast('Abend eingestellt. Der Start ist frei!');
};
A.ckLog = function () { UI.ckLog = !UI.ckLog; render(); };

/* run */
A.runNext = function () {
  var r = R();
  if (r.pending) { go('step'); return; }
  if (demoRunOver(r)) { A.demoLocked(); return; }
  snapshot('task');
  if (r.variant === 'wuerfel' && r.dice === 'echt' && !dueInjection() && !roleInjection(r) && !hcInjection(r) && !crewInjection(r) && !r.lastDone) { r.pending = { kind: 'roll', main: currentMain(), track: currentTrack().id }; r.hist[r.hist.length - 1].meta.next = 'Würfeln'; commit(); go('step'); return; }
  r.pending = nextStep();
  r.hist[r.hist.length - 1].meta.next = pendingLabel(r.pending);
  UI.checkVals = {};
  budCheck(r); ruleSweep(); accOffer(r);
  commit(); go('step');
};
A.rollPick = function (d) {
  var r = R(); if (!r || !r.pending || r.pending.kind !== 'roll') return;
  var n = +d.v || 1 + Math.floor(Math.random() * 6);
  r.pending = nextStep(n);
  var h = r.hist[r.hist.length - 1]; if (h) h.meta.next = pendingLabel(r.pending);
  commit(); go('step');
};
A.cfgDice = function (d) { cfgDefaults().dice = d.v; commit(); };
A.runUndo = function () { if (undo()) { UI.timer = null; commit(); go(R().finished ? 'finish' : R().pending ? 'step' : 'run'); setToast('Rückgängig gemacht'); } };
A.openRewind = function () { UI.rewindSel = null; go('rewind'); };
A.rewindPick = function (d) { UI.rewindSel = +d.i; render(); };
A.rewindCancel = function () { UI.rewindSel = null; render(); };
A.rewindDo = function () {
  var info = rewindInfo(UI.rewindSel);
  if (!info || !restoreSnap(UI.rewindSel)) return;
  UI.rewindSel = null; UI.timer = null;
  logRun('info', 'Zurückgespult: ' + info.tasks + (info.tasks === 1 ? ' Aufgabe' : ' Aufgaben') + ' und ' + info.drinks + ' ' + U() + ' zurückgenommen');
  commit(); go(R().pending ? 'step' : 'run');
  setToast('Zurückgespult');
};
A.runCheck = function () { var r = R(); if (r.pending) { go('step'); return; } snapshot('task'); r.pending = { kind: 'check' }; r.hist[r.hist.length - 1].meta.next = 'Status-Check'; UI.checkVals = {}; commit(); go('step'); };
A.runOther = function () {
  var r = R(), P = r && r.pending;
  if (!P || P.result || ['spiel', 'schaetzen', 'quiz', 'wwe', 'frage', 'gast', 'mission'].indexOf(P.kind) < 0) return;
  var tr = trackById(P.track) || currentTrack();
  var ctx = { focus: r.together === 'gemeinsam' ? tr.ids.slice() : r.who.slice(), together: r.together, variant: r.variant, themes: themesOf(r.who) };
  /* another mission is never a wilder one */
  var step = P.kind === 'mission' ? makeMissionStep(P.main, r, { max: P.lvl, not: P.mid }) : P.kind === 'spiel' ? makeGameStep(P.main, ctx, null, null, true) : P.kind === 'gast' ? (makeGuestGameStep(P.main, P.gg, maxProgress(r)) || makeGameStep(P.main, ctx, null, null, true)) : makeQuestionStep(P.main, P.kind, ctx.themes);
  if (!step) return;
  step.track = P.track; step.unitNo = P.unitNo; step.roll = P.roll;
  if (P.last) { step.last = true; step.reader = P.reader; }
  if (P.host && step.kind === 'frage') step.host = P.host;
  r.pending = step; accOffer(r); UI.checkVals = {}; UI.timer = null; commit(); setToast('Andere Aufgabe gezogen');
};
/* the Schweizer Taschenmesser may swap one task, once */
A.roleSwap = function () {
  var r = R(), P = r && r.pending;
  if (!P || P.result || !P.swapBy || roleState(r).used.messer) return;
  var by = P.swapBy; roleState(r).used.messer = true;
  A.runOther();
  if (r.pending && r.pending !== P) { r.pending.swappedBy = by; commit(); setToast(by + ' hat getauscht'); }
};
A.runShift = function () { R().shift += 5 * 60000; commit(); setToast('5 Minuten vorgespult (Test)'); };
A.endRun = function () { var r = R(); snapshot('action'); r.pending = null; r.finished = true; logRun('finale', 'Spiel beendet'); commit(); go('finish'); };
A.finishRun = function () { S.run = null; go('home'); };

/* step resolution */
function moveText(mv, tr) {
  var u = unitOf(tr);
  if (mv.kind === 'zurueck') return '1 ' + u.unit + ' zurück';
  if (mv.kind === 'bonus') return 'Bonus: ' + mv.delta + ' ' + (mv.delta === 1 ? u.unit : u.units) + ' weiter';
  return mv.delta === 1 ? 'Weiter ' + unitArt(u.unit).naechst + ' ' + u.unit : mv.delta + ' ' + u.units + ' weiter';
}
function finishResolution(P, ok, rows, title, tone, text, lines) {
  var free = UI.screen === 'free', r = R(), move = null;
  notePresentFromStep(P);
  if (!free && r && ['spiel', 'frage', 'schaetzen', 'quiz', 'wwe', 'glueck', 'partner', 'gast', 'menge', 'mission'].indexOf(P.kind) >= 0) {
    if (isTimed(r)) r.zeit.lastInt = now();
    else move = decideMove(P.main, ok !== false, trackById(P.track), P.roll);
    if (move && P.last && move.kind === 'zurueck') move = { delta: 1, kind: 'vor', why: 'Beim letzten Spiel geht es nicht mehr zurück.' };
    /* a big round done well counts twice, if it does not make the evening too short or leave someone behind on the Pilot's plan */
    var bt = trackById(P.track);
    if (move && P.big && ok !== false && move.kind !== 'zurueck' && move.delta < 2 && !P.roll && bt && bt.total - bt.pos > 3 && paceRatio() >= 0.95 && behindCurve(P.main) <= 0.5) move = { delta: 2, kind: 'bonus', why: 'Große Runde geschafft, sie zählt doppelt.' };
    /* the Hellseher still has to come: a bonus must not jump straight past the last game */
    var mt = trackById(P.track);
    if (move && move.delta > 0 && !P.last && !isTimed(r) && hellPending(r) && r.tracks.filter(function (t) { return !t.done; }).length === 1) {
      var room = mt.total - mt.pos - 1;
      if (room >= 1 && move.delta > room) move = { delta: room, kind: 'vor', why: '' };
    }
  }
  rows = capRows(rows || []);
  /* Strafe statt Pinnchen (Handicap-Station): a lost drink becomes a penalty, booked like a water joker so the Pilot does not catch up */
  if (P.kind !== 'toast') rows.forEach(function (rw) {
    if (rw.pid && rw.n > 0 && !rw.group && hcHas(rw.pid, 'tausch')) {
      rw.n = 0; rw.water = true; rw.done = false; rw.swap = true; rw.note = 'Strafe statt ' + U(); rw.alt = 'Dafür: ' + pick(ALT_PENALTY);
      S.jokerCredit = S.jokerCredit || {}; S.jokerCredit[rw.pid] = (S.jokerCredit[rw.pid] || 0) + 1;
    }
  });
  P.result = { title: title, tone: tone, text: text || '', rows: rows, lines: lines || [], move: move, moveText: move ? moveText(move, trackById(P.track)) : '', stamp: Date.now() };
  UI.jkAsk = -1;
  try { if (navigator.vibrate) navigator.vibrate(tone === 'fail' ? [60, 40, 60] : 30); } catch (e) {}
  commit();
  var b = app.querySelector('.body'); if (b) b.scrollTop = 0;
}
A.stepChoice = function (d) { stepNow().choice = +d.i; commit(); };
/* rule questions open and close; the announcement can be read out by the phone */
A.faqToggle = function (d) { UI.faqOpen = UI.faqOpen || {}; UI.faqOpen[d.v] = !UI.faqOpen[d.v]; render(); };
A.speak = function (d, el) {
  var card = el && el.closest ? el.closest('.ansage') : null, t = d && d.t ? { textContent: d.t } : card ? card.querySelector('.ansage-t') : null;
  if (!t) return;
  try {
    var ss = window.speechSynthesis;
    if (!ss) { setToast('Vorlesen geht auf diesem Gerät nicht'); return; }
    if (ss.speaking) { ss.cancel(); return; }
    var u = new SpeechSynthesisUtterance(t.textContent); u.lang = 'de-DE'; u.rate = 1.02; u.pitch = 1.05;
    var v = (ss.getVoices() || []).filter(function (x) { return /^de/i.test(x.lang); })[0]; if (v) u.voice = v;
    ss.speak(u);
  } catch (e) { setToast('Vorlesen geht auf diesem Gerät nicht'); }
};
A.ggSort = function (d) { var P = stepNow(); P.pickOrder = P.pickOrder || []; if (P.pickOrder.indexOf(+d.i) < 0) P.pickOrder.push(+d.i); commit(); };
A.ggSortDel = function (d) { var P = stepNow(); P.pickOrder = (P.pickOrder || []).filter(function (i) { return i !== +d.i; }); commit(); };
/* Millionenfrage-Runde: lock in one answer, then the next question */
A.ggLock = function () {
  var P = stepNow(); if (!P || P.mode !== 'leiter' || P.revealed || P.hits.length > P.at) return;
  var it = P.items[P.at], v;
  if (it.type === 'auswahl') { if (P.choice == null) return; v = P.choice; }
  else if (it.type === 'bereich') v = P.lv === '' ? Math.round((Number(it.min) + Number(it.max)) / 2) : Number(P.lv);
  else { v = Number(String(P.lv).replace(',', '.')); if (String(P.lv).trim() === '' || isNaN(v)) { setToast('Trag zuerst den Tipp ein'); return; } }
  var hit = leiterHit(it, v);
  P.given[P.at] = v; P.hits[P.at] = hit; P.revealed = true;
  if (UI.screen !== 'free') noteGuestResult(it.author, hit, false);
  try { if (navigator.vibrate) navigator.vibrate(hit ? 30 : [60, 40, 60]); } catch (e) {}
  commit();
};
/* Top-Antworten board: a line found, or a miss (three misses close the board) */
function gbClosed(P) { return P.strikes >= 3 || P.items.every(function (x) { return x.hit; }); }
A.gbHit = function (d) {
  var P = stepNow(); if (!P || P.mode !== 'board' || P.result || gbClosed(P)) return;
  var it = P.items[+d.i]; if (!it || it.hit) return;
  it.hit = true; UI.gbJust = +d.i;
  try { if (navigator.vibrate) navigator.vibrate(gbClosed(P) ? [30, 40, 30, 40, 80] : 30); } catch (e) {}
  commit();
};
A.gbMiss = function () {
  var P = stepNow(); if (!P || P.mode !== 'board' || P.result || gbClosed(P)) return;
  P.strikes = Math.min(3, (P.strikes || 0) + 1); UI.gbX = Date.now();
  try { if (navigator.vibrate) navigator.vibrate([90, 50, 90]); } catch (e) {}
  commit();
};
A.gbSpy = function () { UI.gbSpy = !UI.gbSpy; render(); };
/* Sprüche-Klopfer: uncover, then mark it */
A.gjOpen = function () { var P = stepNow(); if (!P || P.mode !== 'judge' || P.result || P.hits.length >= P.items.length) return; P.open = true; commit(); };
A.gjMark = function (d) {
  var P = stepNow(); if (!P || P.mode !== 'judge' || P.result || !P.open || P.hits.length > P.at) return;
  var hit = d.v === '1', it = P.items[P.at];
  P.hits[P.at] = hit; P.open = false; P.at = Math.min(P.items.length, P.at + 1);
  if (UI.screen !== 'free' && it) noteGuestResult(it.by, hit, false);
  try { if (navigator.vibrate) navigator.vibrate(hit ? 30 : [60, 40, 60]); } catch (e) {}
  commit();
};
A.ggNext = function () { var P = stepNow(); if (!P || P.mode !== 'leiter' || !P.revealed) return; P.at = Math.min(P.items.length, P.at + 1); P.revealed = false; P.choice = null; P.lv = ''; commit(); };
/* Gegen die Menge: guests vote by link or by show of hands, then the birthday people guess the majority */
A.mengeLink = function () {
  if (needPass('Abstimmen per Link geht mit dem Game Pass.')) return;
  var P = stepNow(); if (!P || P.kind !== 'menge' || P.phase !== 'vote') return;
  var L = { kind: 'menge', text: 'Gegen die Menge', items: P.qs.map(function (i) { return { t: MENGE[i][0], o: [MENGE[i][1], MENGE[i][2]] }; }), code: makeCode(), open: true, t: Date.now() };
  S.live = L; lsSet(LIVE_KEY, L); lsDel(LIVE_ANS + L.code); P.code = L.code; UI.liveFrom = UI.screen;
  commit();
};
A.mengeHands = function () { var P = stepNow(); P.handOpen = !P.handOpen; commit(); };
A.mengeHand = function (d) { var P = stepNow(); var h = P.hands[+d.k]; h[+d.o] = Math.max(0, h[+d.o] + (+d.d)); commit(); };
A.mengeClose = function () {
  var P = stepNow(); if (!P || P.phase !== 'vote') return;
  var t = mengeVotes(P);
  if (!t.some(function (x) { return x[0] + x[1] > 0; })) { setToast('Noch keine Stimmen da'); return; }
  P.tally = t; P.phase = 'guess';
  if (S.live && S.live.code === P.code) { S.live.open = false; lsSet(LIVE_KEY, S.live); }
  commit(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0;
};
A.mengeGuess = function (d) { var P = stepNow(); if (P.phase !== 'guess') return; P.guesses[+d.k] = +d.o; commit(); };
A.mengeReveal = function () { var P = stepNow(); if (P.phase !== 'guess' || P.guesses.some(function (g) { return g == null; })) return; P.phase = 'reveal'; P.at = 0; commit(); var b = app.querySelector('.body'); if (b) b.scrollTop = 0; };
A.mengeNext = function () { var P = stepNow(); if (P.phase !== 'reveal') return; P.at = Math.min(P.qs.length - 1, P.at + 1); commit(); };
A.ggChoose = function (d) { var P = stepNow(); P.choices[+d.k] = P.choices[+d.k] === +d.i ? null : +d.i; commit(); };
A.wweVote = function (d) { var P = stepNow(); P.votes = P.votes || {}; P.votes[d.id] = Math.max(0, (P.votes[d.id] || 0) + (+d.d)); commit(); };
A.stepResolve = function (d) {
  var free = UI.screen === 'free', P = stepNow(), r = R();
  if (!P || P.result) return;
  if (!free && r) snapshot('action');
  UI.timer = null;
  var rows = [], ok = null, title = '', tone = 'info', text = '', main = P.main, lines = null, winIds = null;
  if (P.kind === 'handicap') {
    if (!P.hc || !P.hc.choice || free || !r) return;
    notePresentFromStep(P); hcApply(r, P); r.pending = null; commit(); go('run'); return;
  }
  /* JGA: a mission out in the city, or a job for someone from the crew */
  if (P.kind === 'mission') {
    if (['ok', 'fail', 'refuse'].indexOf(d.v) < 0) return;
    ok = d.v === 'ok';
    if (d.v === 'fail') rows.push(drinkRow(main, 'Mission nicht geschafft'));
    if (d.v === 'refuse') rows.push(refuseRow(main));
    if (!free) { recordAttempt(main, ok); noteMission(r, P, d.v); }
    title = ok ? 'Mission erfüllt!' : d.v === 'refuse' ? 'Verweigert!' : 'Mission gescheitert';
    tone = ok ? 'ok' : 'fail'; text = P.title;
    P.winIds = ok ? [main] : [];
    finishResolution(P, ok, rows, title, tone, text, null);
    return;
  }
  if (P.kind === 'crew') {
    if (d.v !== 'ok' && d.v !== 'fail') return;
    ok = d.v === 'ok';
    if (!ok) rows.push({ pid: '', name: P.name, n: 1, group: true, note: 'gekniffen, bei der Truppe wird nicht gezählt' });
    logRun('info', 'Truppen-Auftrag: ' + P.name + (ok ? ' hat geliefert' : ' hat gekniffen'));
    P.winIds = [];
    finishResolution(P, ok, rows, ok ? P.name + ' hat geliefert!' : P.name + ' hat gekniffen', ok ? 'ok' : 'fail', '', null);
    return;
  }
  if (P.kind === 'rolle' || P.kind === 'ehre') {
    logRun('info', P.kind === 'rolle' ? 'Neue Rolle: ' + P.name + ' ist ' + ROLE_DEFS[P.role].name : 'Ehrenrunde: ' + P.items.map(function (it) { return it.name + ' (' + ROLE_DEFS[it.role].name + ')'; }).join(', '));
    r.pending = null; commit(); go('run'); return;
  }
  if (P.kind === 'hellseher') {
    if (P.choice == null) return;
    var hit = P.choice === P.correct, gName = gameById(P.game).name, guess = gameById(P.opts[P.choice]).name;
    r.forceGame = P.game;
    title = hit ? 'Volltreffer, die Kugel lügt nie!' : 'Daneben!';
    text = hit ? P.name + ' hat es kommen sehen: Das letzte Spiel ist ' + gName + '.' : P.name + ' sah ' + guess + ', das letzte Spiel ist aber ' + gName + '. Den ganzen Abend hellgesehen, nur das Letzte nicht. Das zählt nicht: ' + P.name + ' muss nicht trinken.';
    if (hit) rows.push({ pid: '', name: P.name, n: 1, group: true, note: 'auf die Kugel' });
    logRun('info', 'Hellseher ' + P.name + (hit ? ' hat das letzte Spiel vorhergesehen' : ' lag beim letzten Spiel daneben'));
    finishResolution(P, true, rows, title, hit ? 'sun' : 'info', text, null);
    return;
  }
  if (P.kind === 'menge') {
    if (P.phase !== 'reveal' || P.at < P.qs.length - 1) return;
    var hitsN = P.qs.filter(function (q, k) { return mengeHit(P, k); }).length;
    ok = hitsN >= 3; tone = ok ? 'ok' : 'fail';
    title = ok ? hitsN + ' von ' + P.qs.length + ' getroffen, die Menge ist durchschaut!' : 'Nur ' + hitsN + ' von ' + P.qs.length + ', die Menge war unberechenbar';
    lines = P.qs.map(function (i, k) { var t = P.tally[k], q = MENGE[i]; return { ok: mengeHit(P, k), t: q[0] + ' ' + q[1] + ' ' + t[0] + ', ' + q[2] + ' ' + t[1] + (t[0] === t[1] ? ' (Gleichstand)' : '') }; });
    if (ok) rows.push(groupRow(1, 'Die Menge')); else P.team.forEach(function (id) { rows.push(drinkRow(id, 'gegen die Menge verloren')); });
    P.team.forEach(function (id) { recordAttempt(id, ok); });
  } else if (P.kind === 'spiel') {
    var f = P.format, sres = resolveSpecial(P, d);
    if (sres === false) return;
    if (sres) {
      ok = sres.ok; rows = sres.rows; title = sres.title; tone = sres.tone; text = sres.text; lines = sres.lines && sres.lines.length ? sres.lines : null; winIds = sres.win;
    } else if (f === 'duell') {
      var winner = d.id, loser = winner === main ? P.opp : main;
      if (winner !== main && winner !== P.opp) return;
      ok = winner === main;
      rows.push(drinkRow(loser, 'Duell verloren'));
      recordAttempt(main, ok); recordAttempt(P.opp, !ok);
      title = person(winner).name + ' gewinnt das Duell'; tone = 'sun'; winIds = [winner];
    } else {
      ok = d.v === 'ok';
      if (d.v !== 'ok' && d.v !== 'fail') return;
      if (f === 'solo') { if (!ok) rows.push(drinkRow(main, 'nicht geschafft')); title = ok ? 'Geschafft!' : 'Nicht geschafft'; }
      /* a challenge: the birthday person may drink (Pilot), the guest never does, a lost guest pays the stake */
      if (f === 'duellGast') { var gn = chGuest(P); if (ok) rows.push(stakeRow(P)); else rows.push(drinkRow(main, 'Herausforderung verloren')); title = ok ? person(main).name + ' gewinnt' + (gn ? ' gegen ' + accGuest(gn) : '') : (gn || 'Der Gast') + ' gewinnt'; if (!free) noteDuel(gn, ok); }
      if (f === 'gruppe') { if (ok) rows.push(groupRow(1)); else rows.push(drinkRow(main, 'gegen die Gruppe verloren')); title = ok ? person(main).name + ' schlägt die Gruppe' : 'Die Gruppe gewinnt'; }
      if (f === 'team') { if (!ok) P.team.forEach(function (id) { rows.push(drinkRow(id, 'zusammen nicht geschafft')); }); title = ok ? 'Zusammen geschafft!' : 'Zusammen nicht geschafft'; }
      if (f === 'team') P.team.forEach(function (id) { recordAttempt(id, ok); }); else recordAttempt(main, ok);
      tone = ok ? 'ok' : 'fail'; winIds = ok ? (f === 'team' ? P.team.slice() : [main]) : [];
    }
  } else if (P.kind === 'gast' && (P.mode === 'sort' || P.mode === 'multi' || P.mode === 'leiter' || P.mode === 'board' || P.mode === 'judge')) {
    if (P.mode === 'board') {
      var hb = P.items.filter(function (x) { return x.hit; }).length, nb = P.items.length;
      ok = hb >= P.need; title = hb === nb ? 'Alle Antworten gefunden!' : ok ? hb + ' von ' + nb + ' gefunden, das reicht!' : 'Nur ' + hb + ' von ' + nb + ', nötig waren ' + P.need;
      text = P.qtext;
      lines = P.items.map(function (x) { return { ok: x.hit, t: x.label + ': ' + x.n + (x.n === 1 ? ' Gast' : ' Gäste') + ' (' + joinNames(x.by) + ')' }; });
      if (!free) P.items.forEach(function (x) { x.by.forEach(function (a) { noteGuestResult(a, x.hit, false); }); });
    } else if (P.mode === 'judge') {
      if (P.hits.length < P.items.length) return;
      var hj = P.hits.filter(Boolean).length, nj = P.items.length;
      ok = hj >= P.need; title = hj === nj ? 'Jeder Spruch sitzt!' : ok ? hj + ' von ' + nj + ' Sprüchen sitzen, das reicht!' : 'Nur ' + hj + ' von ' + nj + ', nötig waren ' + P.need;
      lines = P.items.map(function (x, i) { return { ok: P.hits[i], t: '„' + x.full + '“, von ' + x.by }; });
    } else if (P.mode === 'leiter') {
      if (P.hits.length < P.items.length) return;
      var hitsL = P.hits.filter(Boolean).length;
      ok = hitsL >= P.need; title = hitsL === P.items.length ? 'Alles richtig, Millionär!' : ok ? hitsL + ' von ' + P.items.length + ' richtig, das reicht!' : 'Nur ' + hitsL + ' von ' + P.items.length + ', nötig waren ' + P.need;
      lines = P.items.map(function (it, i) { return { ok: P.hits[i], t: it.text + ' · ' + (it.type === 'auswahl' ? it.options[it.correct] : fmtNum(Number(it.answer)) + (it.unit ? ' ' + it.unit : '')) }; });
    } else if (P.mode === 'sort') {
      if ((P.pickOrder || []).length < P.items.length) return;
      var inv = ggInversions(P.pickOrder, P.items);
      ok = inv <= 1; title = inv === 0 ? 'Perfekt sortiert!' : ok ? 'Fast perfekt, ein Paar vertauscht' : 'Durcheinander geraten';
      text = person(main).name + ': ' + P.pickOrder.map(function (i) { return P.items[i].label; }).join(', ');
      lines = P.lines;
    } else {
      if (P.choices.some(function (c) { return c == null; })) return;
      var wrong = 0;
      lines = P.items.map(function (it, k) { var hit = P.choices[k] === it.correct; if (!hit) wrong++; if (!free && it.by) noteGuestResult(it.by, hit, !!P.long); return { ok: hit, t: it.line || (P.long ? it.prompt.replace(/:$/, '') + ' hat gelogen: ' + it.reveal : it.prompt + ': ' + it.reveal) }; });
      var nIt = P.items.length, hitsM = nIt - wrong, needM = P.need || needOf(nIt);
      ok = hitsM >= needM; title = wrong === 0 ? 'Alles richtig!' : ok ? hitsM + ' von ' + nIt + ' richtig, das reicht!' : 'Nur ' + hitsM + ' von ' + nIt + ', nötig waren ' + needM;
    }
    if (ok) { var wr = ggWinRow(P); if (wr) rows.push(wr); }
    else rows.push(drinkRow(main, 'Gäste-Runde verloren'));
    markGuestGame(P);
    recordAttempt(main, ok); tone = ok ? 'ok' : 'fail';
  } else if (P.kind === 'frage' || P.kind === 'schaetzen' || P.kind === 'quiz' || P.kind === 'gast') {
    var q = questionOf(P);
    if (q.type === 'aufgabe') { ok = d.v === 'ok'; title = ok ? 'Geschafft!' : 'Nicht geschafft'; if (!ok) rows.push(drinkRow(main, 'Aufgabe nicht geschafft')); }
    else if (q.type === 'auswahl') {
      if (P.choice == null) return;
      ok = P.choice === q.correct; title = ok ? 'Richtig!' : 'Leider falsch'; text = 'Richtig ist: ' + q.options[q.correct];
      if (!ok) rows.push(drinkRow(main, 'falsch geraten'));
    } else {
      var truth = Number(q.answer);
      var fa = P.answerFocus === '' || P.answerFocus == null ? (q.type === 'bereich' ? Math.round((Number(q.min) + Number(q.max)) / 2) : NaN) : Number(P.answerFocus);
      if (isNaN(fa)) { setToast('Trag zuerst den Tipp ein'); return; }
      var ga = P.group === '' || P.group == null ? NaN : Number(P.group);
      var df = Math.abs(fa - truth);
      text = 'Lösung: ' + fmtNum(truth) + ' ' + (q.unit || '') + ' · ' + person(main).name + ': ' + fmtNum(fa) + (isNaN(ga) ? '' : ' · Gruppe: ' + fmtNum(ga));
      if (!isNaN(ga)) {
        var dg = Math.abs(ga - truth);
        if (df === dg) { ok = true; title = 'Gleichstand!'; }
        else if (df < dg) { ok = true; title = person(main).name + ' liegt näher dran'; rows.push(groupRow(1)); }
        else { ok = false; title = 'Die Gruppe liegt näher dran'; rows.push(drinkRow(main, 'Schätzduell verloren')); }
      } else {
        var tol = estTol(q, truth);
        ok = df <= tol; title = ok ? 'Gut geschätzt!' : 'Zu weit daneben';
        if (!ok) rows.push(drinkRow(main, 'zu weit weg'));
      }
    }
    if (P.kind === 'frage') {
      var src = S.questions.filter(function (x) { return x.id === P.qid; })[0];
      if (!free && src) noteGuestResult(src.author, ok !== false, src.type === 'luege');
      markGuestUsed(P);
    }
    if (P.kind === 'gast') {
      if (ok && !rows.some(function (x) { return x.group; })) { var wr2 = ggWinRow(P); if (wr2) rows.push(wr2); }
      markGuestGame(P); lines = P.lines;
    }
    recordAttempt(main, ok); tone = ok ? 'ok' : 'fail';
  } else if (P.kind === 'wwe') {
    var cands = wweCands(P), max = -1, top = [];
    cands.forEach(function (id) { var v = (P.votes || {})[id] || 0; if (v > max) { max = v; top = [id]; } else if (v === max) top.push(id); });
    if (max <= 0) return;
    var lo = pick(top);
    rows.push(drinkRow(lo, 'meiste Stimmen'));
    title = person(lo).name + ' würde eher'; tone = 'sun'; ok = true;
  } else if (P.kind === 'glueck') {
    ok = true; tone = 'ok'; title = P.variantG === 'frei' ? 'Glück gehabt!' : 'Verteilt!';
    if (P.variantG === 'verteilen') rows.push(P.giveTo ? nameRow(P.giveTo, 1) : { pid: '', name: 'Ein Gast eurer Wahl', n: 1, group: true, note: '' });
  } else if (P.kind === 'toast') {
    P.ids.forEach(function (id) {
      var b = budget(id);
      rows.push(b.C >= b.M ? { pid: id, name: person(id).name, n: 0, water: true, note: 'Limit erreicht, Wasser' } : needsPause(id) ? { pid: id, name: person(id).name, n: 0, water: true, note: pauseNote(id).replace('diesmal Wasser', 'mit Wasser anstoßen') } : { pid: id, name: person(id).name, n: 1, done: true, note: 'Anstoßen' });
      r.toasts[id].done += 1;
    });
    rows.push(groupRow(1, 'Alle Gäste, die mögen'));
    logRun('toast', 'Anstoßen mit ' + focusNames(P.ids));
    title = 'Prost!'; tone = 'sun';
  } else if (P.kind === 'acc') {
    var tr = trackById(P.track); tr.accDone += 1; tr.accIdx += 1;
    logRun('acc', focusNames(tr.ids) + ': jetzt mit ' + r.acc.items[tr.accIdx % r.acc.items.length]);
    r.pending = null; commit(); go('run'); return;
  } else if (P.kind === 'check') {
    r.tracks.forEach(function (t) {
      if (t.done) return;
      var v = UI.checkVals && UI.checkVals[t.id] != null ? UI.checkVals[t.id] : Math.round(zeitEst(t).p * 100);
      t.checks.push({ t: now(), p: v / 100 });
      if (v >= 100) { t.ids.forEach(function (id) { var cr = closingRow(id); if (cr.n) addDrink(id, cr.n, 'spiel', 'Abschluss'); }); t.done = true; logRun('finale', focusNames(t.ids) + ' ' + (t.ids.length > 1 ? 'sind' : 'ist') + ' fertig!'); }
      else logRun('check', 'Status ' + focusNames(t.ids) + ': ' + v + ' %');
    });
    r.zeit.lastCheck = now(); r.pending = null; UI.checkVals = {};
    if (allDone()) { r.finished = true; commit(); go('finish'); return; }
    commit(); go('run'); return;
  } else if (P.kind === 'finale') {
    var t2 = trackById(P.track), fin = r.variant === 'abend' ? r.tracks.filter(function (t) { return !t.done; }) : [t2];
    fin.forEach(function (t) {
      t.pos = t.total; t.done = true;
      t.ids.forEach(function (id) { var cr = closingRow(id); if (cr.n) addDrink(id, cr.n, 'spiel', 'Abschluss'); });
    });
    var many = t2.ids.length > 1 || fin.length > 1, who = r.variant === 'abend' ? focusNames(r.who) : focusNames(t2.ids);
    logRun('finale', r.variant === 'abend' ? 'Zeit ist um, der Spielabend ist geschafft!' : who + ' ' + (many ? 'haben' : 'hat') + (r.fam === 'frei' ? ' das Ziel erreicht!' : ' den Kranz geschafft!'));
    r.pending = null;
    if (allDone()) { if (r.roles && r.roles.who.naechster) r.roles.shown.naechster = true; r.finished = true; commit(); go('finish'); return; }
    advanceTurn(); commit(); go('run'); return;
  }
  /* who won this task: may drop a handicap */
  P.winIds = winIds || (ok && ['wwe', 'glueck', 'toast'].indexOf(P.kind) < 0 ? (P.kind === 'menge' && P.team ? P.team.slice() : [main]) : []);
  finishResolution(P, ok, rows, title, tone, text, lines);
};
A.stepJoker = function (d) {
  var P = stepNow(), row = P.result.rows[+d.i];
  if (!row || !row.pid || jokersLeft(row.pid) <= 0) return;
  S.jokers[row.pid] = (S.jokers[row.pid] || 0) + 1;
  S.jokerCredit = S.jokerCredit || {}; S.jokerCredit[row.pid] = (S.jokerCredit[row.pid] || 0) + row.n;
  row.n = 0; row.water = true; row.done = false; row.note = 'Wasser-Joker eingesetzt';
  commit();
};
A.drinkToggle = function (d) { var row = stepNow().result.rows[+d.i]; row.done = !row.done; commit(); };
function stepLabel(P) {
  var r = R(), base = P.kind === 'mission' ? 'Mission: ' + P.title : P.kind === 'crew' ? 'Truppen-Auftrag' : P.kind === 'menge' ? 'Gegen die Menge' : P.kind === 'spiel' ? gameOf(P).name : P.kind === 'wwe' ? 'Wer würde eher' : P.kind === 'partner' ? 'Mein Partner kann' : P.kind === 'glueck' ? 'Glücks-Moment' : P.kind === 'toast' ? 'Anstoßen' : P.kind === 'gast' ? P.name : 'Frage';
  if (r && UI.screen === 'step' && P.unitNo && !isTimed(r)) return unitOf(trackById(P.track)).unit + ' ' + P.unitNo + ' · ' + base;
  return base;
}
A.stepContinue = function () {
  var free = UI.screen === 'free', P = stepNow();
  if (!P || !P.result) return;
  (P.result.rows || []).forEach(function (rw) { if (rw.pid && rw.n > 0 && rw.done) addDrink(rw.pid, rw.n, 'spiel', stepLabel(P)); });
  if (free) { var from = S.free.from || 'home'; S.free = null; S.games = (S.games || 0) + 1; commit(); go(from); return; }
  var r = R(), tr = trackById(P.track);
  if (P.kind === 'toast' || P.kind === 'hellseher' || P.kind === 'crew') { r.pending = null; commit(); go('run'); return; }
  if (P.last) r.lastDone = true;
  var mainName = person(P.main).name;
  if (isTimed(r)) {
    r.steps += 1;
    logRun(P.result.tone === 'fail' ? 'fail' : 'ok', mainName + ': ' + stepLabel(P) + ' · ' + P.result.title);
    r.pending = null; advanceTurn(); commit(); go('run'); return;
  }
  var mv = P.result.move;
  if (mv) {
    if (mv.kind === 'zurueck') { tr.pos = Math.max(0, tr.pos - 1); r.backs += 1; }
    else tr.pos = Math.min(tr.total, tr.pos + mv.delta);
    r.lastMove = mv.kind;
  }
  r.steps += 1;
  logRun(mv && mv.kind === 'zurueck' ? 'zurueck' : mv && mv.kind === 'bonus' ? 'bonus' : (P.result.tone === 'fail' ? 'fail' : 'ok'), stepLabel(P) + ' · ' + (P.result.title.indexOf(mainName) === 0 ? '' : mainName + ': ') + P.result.title + (mv ? ' · ' + P.result.moveText : ''));
  r.pending = null;
  if (tr.pos >= tr.total && !tr.done) { r.pending = { kind: 'finale', track: tr.id, main: tr.ids[0] }; commit(); go('step'); return; }
  advanceTurn(); commit(); go('run');
};

/* partner bidding: several rounds, one winner */
A.partnerOther = function () { var P = stepNow(); P.ch = partnerPick(); P.bid = PARTNER[P.ch].b || 5; P.floor = 1; P.timerEnd = 0; P.achieved = 0; if (P.phase === 'show') P.phase = 'bid'; commit(); };
A.partnerRounds = function (d) { var P = stepNow(); P.bestOf = +d.v; commit(); };
A.partnerStart = function () {
  var P = stepNow();
  if (!P.teams[1].back && !String(P.teams[1].backName || '').trim()) P.teams[1].backName = 'Gäste-Team';
  P.teams.forEach(function (t, i) { if (!String(t.frontLabel || '').trim() && t.back) t.frontLabel = 'Team ' + (i + 1) + ' vorne'; });
  P.phase = 'bid'; P.round = 1; P.wins = [0, 0]; P.hist = []; P.starter = 0; P.bidder = 0; P.bid = PARTNER[P.ch].b || 5; P.floor = 1; commit();
};
A.partnerNext = function () { var P = stepNow(); P.phase = 'bid'; P.bidder = P.starter; P.achieved = 0; P.timerEnd = 0; P.floor = 1; commit(); };
A.partnerBid = function (d) { var P = stepNow(); P.bid = Math.max(P.floor || 1, P.bid + (+d.d)); commit(); };
A.partnerRaise = function () { var P = stepNow(); P.floor = P.bid + 1; P.bidder = 1 - P.bidder; P.bid = P.floor; commit(); };
A.partnerShow = function () { var P = stepNow(); P.phase = 'show'; P.achieved = 0; P.timerEnd = 0; commit(); };
A.partnerTimer = function () { var P = stepNow(); P.timerEnd = Date.now() + PARTNER[P.ch].s * 1000; commit(); };
A.partnerAch = function (d) { var P = stepNow(); P.achieved = Math.max(0, P.achieved + (+d.d)); commit(); };
A.partnerDone = function (d) {
  var P = stepNow(), r = R(), free = UI.screen === 'free';
  if (!free && r) snapshot('action');
  var success = d.v === 'ok';
  var winner = success ? P.bidder : 1 - P.bidder;
  P.wins[winner] += 1;
  P.hist.push({ ch: P.ch, bid: P.bid, bidder: P.bidder, ok: success, winner: winner, ach: P.achieved });
  var need = Math.floor(P.bestOf / 2) + 1;
  if (P.wins[winner] < need) {
    P.round += 1; P.starter = 1 - P.starter; P.ch = partnerPick(); P.bid = PARTNER[P.ch].b || 5;
    P.bidder = P.starter; P.achieved = 0; P.timerEnd = 0; P.phase = 'between';
    commit(); return;
  }
  var loseIdx = 1 - winner;
  var lt = P.teams[loseIdx], rows = [];
  if (lt.back && isFocus(lt.back)) {
    rows.push(drinkRow(lt.back, 'Paar-Duell verloren'));
    if (lt.frontLabel && !/ vorne$/.test(lt.frontLabel) && !/^Partner von /.test(lt.frontLabel)) rows.push(nameRow(lt.frontLabel, 1));
    else rows.push({ pid: '', name: lt.frontLabel || 'Die vorne', n: 1, group: true, note: '' });
  } else rows.push({ pid: '', name: partnerTeam(P, loseIdx), n: 1, group: true, note: '' });
  var ok = loseIdx !== 0;
  recordAttempt(P.main, ok);
  if (P.teams[1].back && isFocus(P.teams[1].back)) recordAttempt(P.teams[1].back, loseIdx !== 1);
  var title = partnerTeam(P, winner) + ' ' + plv(partnerTeam(P, winner), 'gewinnt', 'gewinnen') + ' ' + P.wins[winner] + ':' + P.wins[loseIdx];
  var text = P.hist.map(function (h, i) { return 'Runde ' + (i + 1) + ': ' + partnerTeam(P, h.winner); }).join(' · ');
  P.phase = 'done';
  P.winIds = ok ? [P.main] : (P.teams[1].back && isFocus(P.teams[1].back) ? [P.teams[1].back] : []);
  finishResolution(P, ok, rows, title, ok ? 'ok' : 'fail', text);
};

/* live link */
A.liveOpen = function () {
  if (needPass('Die Gruppe per Link fragen geht mit dem Game Pass.')) return;
  var P = stepNow(), L;
  if (P.kind === 'wwe') {
    L = { kind: 'wwe', text: 'Wer würde eher ' + WWE[P.idx].replace(/^…\s*/, ''), cands: wweCands(P).map(function (id) { return { id: id, name: person(id).name }; }) };
  } else {
    var q = questionOf(P);
    L = { kind: q.type, text: q.text, unit: q.unit || '', min: q.min, max: q.max, options: q.options || [] };
    if (q.type === 'schaetzen') {
      var a = Math.abs(Number(q.answer)) || 100, m = a * (2.2 + Math.random() * 1.6), mag = Math.pow(10, Math.floor(Math.log(m) / Math.LN10));
      L.sMax = Math.ceil(m / mag) * mag; L.sStep = Math.max(Math.pow(10, Math.floor(Math.log(L.sMax) / Math.LN10) - 2), 0.01);
    }
  }
  L.code = makeCode(); L.open = true; L.t = Date.now();
  S.live = L; lsSet(LIVE_KEY, L); lsDel(LIVE_ANS + L.code);
  UI.liveFrom = UI.screen;
  go('live');
};
A.openGuestLive = function () { UI.guestMode = 'test'; UI.liveSent = false; UI.liveVal = ''; UI.liveName = ''; go('guestLive'); };
A.liveChoose = function (d) { UI.liveVal = String(d.v); render(); };
A.liveSubmit = function () {
  var L = UI.guestMode === 'link' ? lsGet(LIVE_KEY) : S.live;
  if (!L || !L.open) return;
  var v = UI.liveVal;
  if (L.kind === 'menge') {
    var mv = UI.mengeVals || [];
    if (L.items.some(function (x, k) { return mv[k] !== 0 && mv[k] !== 1; })) { setToast('Bitte bei jeder Frage etwas wählen'); return; }
    var arrM = lsGet(LIVE_ANS + L.code) || [];
    arrM.push({ n: String(UI.liveName || '').trim(), v: mv.slice(), t: Date.now() });
    lsSet(LIVE_ANS + L.code, arrM);
    UI.liveSent = true; render(); return;
  }
  if (L.kind === 'bereich' && v === '') v = String(Math.round((Number(L.min) + Number(L.max)) / 2));
  if (v === '' || ((L.kind === 'schaetzen') && isNaN(Number(v)))) { setToast('Bitte erst antworten'); return; }
  var arr = lsGet(LIVE_ANS + L.code) || [];
  arr.push({ n: String(UI.liveName || '').trim(), v: v, t: Date.now() });
  lsSet(LIVE_ANS + L.code, arr);
  UI.liveSent = true; render();
};
A.liveNext = function () { UI.liveSent = false; UI.liveVal = ''; UI.liveName = ''; UI.mengeVals = []; render(); };
A.liveMenge = function (d) { UI.mengeVals = UI.mengeVals || []; UI.mengeVals[+d.k] = +d.o; render(); };
A.liveApply = function () {
  var P = curStep(), L = S.live, ans = liveAnswers();
  if (!P || !L) { go(UI.liveFrom); return; }
  if (L.kind === 'schaetzen' || L.kind === 'bereich') {
    var med = median(ans.map(function (a) { return Number(a.v); }));
    if (med != null) { P.group = String(Math.round(med * 100) / 100); P.groupFrom = 'Per Link: ' + ans.length + ' Tipps, Mitte bei ' + fmtNum(med); }
  } else if (L.kind === 'auswahl') {
    var q = questionOf(P), right = ans.filter(function (a) { return Number(a.v) === q.correct; }).length;
    P.groupFrom = 'Per Link: ' + right + ' von ' + ans.length + ' Gästen hätten richtig gelegen';
  } else if (L.kind === 'wwe') {
    P.votes = P.votes || {};
    ans.forEach(function (a) { P.votes[a.v] = (P.votes[a.v] || 0) + 1; });
    P.groupFrom = 'Per Link: ' + ans.length + ' Stimmen dazugezählt';
  }
  S.live.open = false; lsSet(LIVE_KEY, S.live);
  go(UI.liveFrom);
};

/* =========================================================
   Events
   ========================================================= */
app.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]');
  if (!el || !app.contains(el) || el.disabled) return;
  var fn = A[el.getAttribute('data-act')];
  if (!fn) return;
  e.preventDefault();
  fn(el.dataset, el);
});
function showText(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }
function setBind(b, v) {
  if (b === 'rule.text') { if (UI.ruleDraft) { UI.ruleDraft.text = String(v).slice(0, 80); var rg = document.getElementById('ruleGo'); if (rg) rg.disabled = UI.ruleDraft.text.trim().length < 2; } return; }
  if (b === 'bud.txt') { UI.budTxt = String(v).slice(0, 24); return; }
  if (b === 'tour.name') { UI.tourName = v; tourPatch(); return; }
  if (b === 'pass.date') { UI.passDate = v; dateTyped('passDate'); return; }
  if (b === 'pass.move') { UI.passMoveDate = v; dateTyped('passMove'); return; }
  var parts = b.split('.');
  if (b === 'event.name') { E().name = v; save(); return; }
  if (b === 'event.target') { E().target = Number(v); save(); showText('targetShow', v + ' % · etwa ' + Math.round(E().max * Number(v) / 100)); return; }
  if (parts[0] === 'draft') { UI.draft[parts[1]] = v; return; }
  if (b === 'liveVal') {
    UI.liveVal = v; var Lv = UI.guestMode === 'link' ? lsGet(LIVE_KEY) : S.live;
    var rg = document.getElementById('lvr'); if (rg && v !== '') rg.value = v;
    showText('lvShow', v === '' ? '–' : fmtNum(v) + ' ' + ((Lv && Lv.unit) || '')); return;
  }
  if (b === 'counterName' || b === 'accName' || b === 'liveName' || b === 'crewName') { UI[b] = v; return; }
  if (b === 'liveValRange') { UI.liveVal = v; var L = UI.guestMode === 'link' ? lsGet(LIVE_KEY) : S.live; var nf = document.getElementById('lv'); if (nf) nf.value = v; showText('lvShow', fmtNum(v) + ' ' + ((L && L.unit) || '')); return; }
  if (parts[0] === 'q') { if (parts[1] === 'opt') UI.qDraft.options[+parts[2]] = v; else UI.qDraft[parts[1]] = v; return; }
  if (parts[0] === 'gk') { if (UI.gk) { UI.gk.text = String(v).slice(0, gkMaxLen(UI.gk)); gkPatchGo(); } return; }
  if (parts[0] === 'g') {
    var G = gForm();
    if (parts[1] === 'author') {
      G.author = v; G.items.forEach(function (x) { x.author = v; });
      clearTimeout(UI.gNameT);
      UI.gNameT = setTimeout(function () {
        var nm = String(G.author || '').trim();
        if (nm.length >= 2 && UI.gGreeted !== nm) { UI.gGreeted = nm; gSay('name'); gStagePatch(); }
        gPassFx();
        for (var k = 0; k < G.items.length; k++) gPatch('gprev' + k, gPreview(G.items[k]));
      }, 450);
      return;
    }
    var it = G.items[+parts[1]]; if (!it) return;
    /* numbers: comma or point, both fine */
    if (['answer', 'min', 'max', 'year', 'byear'].indexOf(parts[2]) >= 0) v = String(v).replace(',', '.').replace(/\s+/g, '');
    if (parts[2] === 'opt') it.options[+parts[3]] = v;
    else if (parts[2] === 'bd') { it.bd = String(v).replace(/\D/g, '').slice(0, 2); gBdaySync(it); }
    else it[parts[2]] = v;
    gLive(+parts[1]);
    return;
  }
  if (parts[0] === 'step') {
    var P = curStep(); if (!P) return;
    if (parts[1] === 'lvLive') { P.lv = v; var it = P.items && P.items[P.at]; showText('lvShow', fmtNum(Number(v)) + ' ' + ((it && it.unit) || '')); }
    else if (parts[1] === 'answerFocusLive') { P.answerFocus = v; var q = questionOf(P); showText('frShow', fmtNum(v) + ' ' + ((q && q.unit) || '')); }
    else P[parts[1]] = v;
    save(); return;
  }
  if (parts[0] === 'check') { UI.checkVals = UI.checkVals || {}; UI.checkVals[parts[1]] = Number(v); showText('ckShow' + parts[1], v + ' %'); return; }
  /* typed names in the pickers: challenge, station, mind reader, ketchup, lip reading */
  if (['ch', 'hc', 'gl', 'kc', 'lip'].indexOf(parts[0]) >= 0) { var Pn = curStep(); if (Pn && Pn[parts[0]]) { Pn[parts[0]][parts[1]] = String(v).slice(0, 24); Pn[parts[0]].typed = !!String(v).trim(); save(); } return; }
  if (parts[0] === 'partner') { var P2 = curStep(); if (P2) { P2.teams[+parts[1]][parts[2]] = v; save(); } return; }
}
/* a date picked: the buy button follows at once, the rest of the page when the field is left */
function dateTyped(id) {
  UI.dateDirty = id;
  var bb = id === 'passDate' && app.querySelector ? app.querySelector('.p-buy') : null;
  if (bb) {
    var date = UI.passDate, plan = UI.passPlan || (date && dayStart(date) - dayStart(isoDay(Date.now())) > 14 * DAY ? 30 : 14);
    var pl = PASS_PLANS.filter(function (x) { return x.days === plan; })[0] || PASS_PLANS[0];
    bb.disabled = !date;
    bb.innerHTML = icon('i-star', 18) + (date ? esc(pl.label) + ' holen · ' + esc(pl.price) : 'Erst das Datum wählen') + '<i class="p-buy-shine" aria-hidden="true"></i>';
  }
}
app.addEventListener('focusout', function (e) {
  var t = e.target; if (!t || t.type !== 'date' || UI.dateDirty !== t.id) return;
  setTimeout(function () { var el = document.getElementById(UI.dateDirty || ''); if (UI.dateDirty && document.activeElement !== el) { UI.dateDirty = null; render(); } }, 320);
});
app.addEventListener('input', function (e) {
  var el = e.target, b = el.getAttribute && el.getAttribute('data-bind');
  if (b) setBind(b, el.value);
});
app.addEventListener('change', function (e) {
  var el = e.target, b = el.getAttribute && el.getAttribute('data-bind');
  if (b && el.type === 'range' && b !== 'liveValRange' && b.indexOf('check.') !== 0 && b !== 'step.answerFocusLive') render();
});
app.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  if (UI.gk && e.target && e.target.getAttribute && e.target.getAttribute('data-bind') === 'gk.text') { e.preventDefault(); if (gkValid(UI.gk)) A.gkDone(); else gShakeEl(e.target); return; }
  if (UI.screen === 'guestForm' && e.target && e.target.getAttribute && /^g\./.test(e.target.getAttribute('data-bind') || '')) { gEnter(e.target, e); return; }
  if (e.target.id === 'tName') { e.preventDefault(); e.target.blur(); A.tourNext(); return; }
  if (e.target.id === 'cName') { e.preventDefault(); A.addCounterPerson(); }
  if (e.target.id === 'accName') { e.preventDefault(); A.cfgAccAdd(); }
  if (e.target.id === 'crewName') { e.preventDefault(); A.crewAdd(); }
});
/* while typing in a card, everything else steps back into a soft blur */
app.addEventListener('focusin', function (e) {
  if (UI.screen !== 'guestForm') return;
  var card = e.target.closest && e.target.closest('.gcard'), b = app.querySelector('.body'); if (!b) return;
  var olds = app.querySelectorAll('.gcard.is-focus'); for (var k = 0; k < olds.length; k++) if (olds[k] !== card) olds[k].classList.remove('is-focus');
  if (card) { card.classList.add('is-focus'); b.classList.add('gfocusing'); } else b.classList.remove('gfocusing');
  /* the whole screen edge glows in the colour of the category */
  var tc = card && window.getComputedStyle ? String(getComputedStyle(card).getPropertyValue('--tc') || '').trim() : '';
  if (tc) { app.style.setProperty('--gglow', tc); app.classList.add('gglow'); } else app.classList.remove('gglow');
});
app.addEventListener('focusout', function () {
  if (UI.screen !== 'guestForm') return;
  gkFieldLeft();
  /* the field is left: now the points, levels and stickers may show */
  setTimeout(function () { if (UI.screen === 'guestForm') gPassFx(true); }, 0);
  setTimeout(function () {
    var a = document.activeElement, b = app.querySelector('.body');
    if (a && a.closest && a.closest('.gcard')) return;
    app.classList.remove('gglow');
    if (b) b.classList.remove('gfocusing');
    var olds = app.querySelectorAll('.gcard.is-focus'); for (var k = 0; k < olds.length; k++) olds[k].classList.remove('is-focus');
  }, 80);
});
/* =========================================================
   Keyboard bar: on phones a big Weiter/Fertig button sits right
   above the keyboard, where the thumb is. The iPhone number pad
   has no return key, there was only the small "Fertig" up top.
   ========================================================= */
var KB = null;
function kbField(el) { return !!(el && el.tagName && app.contains(el) && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && ['text', 'number', 'search', 'tel', 'email', 'url', ''].indexOf(el.type || '') >= 0))); }
function kbTouch() { try { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) { return false; } }
/* the field the button leads to: the next one in the same card, or none */
function kbNext(el) {
  var scope = el.closest && (el.closest('.gcard') || el.closest('.grid2') || el.closest('.grid3'));
  if (!scope) return null;
  var f = Array.prototype.slice.call(scope.querySelectorAll('input[data-bind], textarea[data-bind]')).filter(function (x) { return x.type !== 'range'; }), i = f.indexOf(el);
  return i >= 0 ? f[i + 1] || null : null;
}
function kbLabel(el) {
  var l = el.closest && el.closest('label'), t = '';
  if (l) for (var i = 0; i < l.childNodes.length; i++) { var n = l.childNodes[i]; if (n.nodeType === 3 && n.textContent.trim()) { t = n.textContent; break; } }
  return String(t || el.getAttribute('placeholder') || '').trim();
}
function kbShow(el) {
  if (!kbTouch()) return;
  var bar = document.getElementById('kbbar');
  if (!bar) {
    app.insertAdjacentHTML('beforeend', '<div class="kbbar" id="kbbar"><span class="kb-l" id="kbl"></span><button type="button" class="kb-go" id="kbgo" tabindex="-1"></button></div>');
    bar = document.getElementById('kbbar');
    var go = document.getElementById('kbgo'), act = function (e) { e.preventDefault(); kbGo(); };
    go.addEventListener('touchstart', act, { passive: false }); go.addEventListener('mousedown', act);
  }
  var next = kbNext(el), go2 = document.getElementById('kbgo');
  document.getElementById('kbl').textContent = kbLabel(el);
  go2.innerHTML = next ? 'Weiter' + icon('i-next', 16) : icon('i-check', 16) + 'Fertig';
  go2.classList.toggle('done', !next);
  KB = { el: el }; bar.classList.add('on'); kbPlace();
}
function kbHide() { var bar = document.getElementById('kbbar'); if (bar) bar.classList.remove('on'); KB = null; }
function kbPlace() {
  var bar = document.getElementById('kbbar'); if (!bar || !KB) return;
  var vv = window.visualViewport, h = bar.offsetHeight || 56, top = vv ? vv.offsetTop + vv.height - h : window.innerHeight - h;
  bar.style.transform = 'translateY(' + Math.round(top) + 'px)';
}
/* the button does what the return key would do; without one, it closes the keyboard */
function kbGo() {
  var el = KB && KB.el; if (!el || document.activeElement !== el) { kbHide(); return; }
  var ev = null; try { ev = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }); } catch (e) {}
  if (ev) el.dispatchEvent(ev);
  setTimeout(function () { if (document.activeElement === el) el.blur(); }, 40);
}
app.addEventListener('focusin', function (e) { if (kbField(e.target)) kbShow(e.target); });
app.addEventListener('focusout', function () { setTimeout(function () { if (!kbField(document.activeElement)) kbHide(); }, 120); });
if (window.visualViewport && window.visualViewport.addEventListener) { window.visualViewport.addEventListener('resize', kbPlace); window.visualViewport.addEventListener('scroll', kbPlace); }
/* the reaction pad reacts on touch down, not on release */
app.addEventListener('pointerdown', function (e) {
  var el = e.target && e.target.closest && e.target.closest('[data-bz]');
  if (!el || !app.contains(el)) return;
  e.preventDefault(); bzTap(+el.getAttribute('data-bz'));
});
/* the bonus card: drawing on the canvas, tilting the card */
app.addEventListener('pointerdown', function (e) { if (UI.gk) gkPointer(e, 'down'); });
app.addEventListener('pointermove', function (e) { if (!UI.gk) return; if (UI.gkDrawing) gkPointer(e, 'move'); else gkTilt(e); });
app.addEventListener('pointerup', function (e) { if (UI.gk) { gkPointer(e, 'up'); gkTilt(e, true); } });
app.addEventListener('pointercancel', function (e) { if (UI.gk) gkPointer(e, 'up'); });
app.addEventListener('pointerleave', function (e) { if (UI.gk) gkTilt(e, true); });
window.addEventListener('storage', function (e) {
  if (UI.guestMode === 'link') {
    if (e.key === LIVE_KEY || e.key === KEY) { var d = load(); if (d) S = d; if (UI.screen === 'guestLive' && e.key === LIVE_KEY) { UI.liveSent = false; UI.liveVal = ''; UI.mengeVals = []; } render(); }
    return;
  }
  if (e.key === INBOX_Q && e.newValue) { if (mergeInbox()) { if (UI.screen === 'questions' || UI.screen === 'home') render(); setToast('Neue Frage eingegangen'); } }
  if (e.key && e.key.indexOf(LIVE_ANS) === 0 && (UI.screen === 'live' || UI.screen === 'step' || UI.screen === 'free')) render();
});
A.timerStart = function (d) { UI.timer = { key: d.k, end: Date.now() + (+d.s) * 1000, buzzed: false }; render(); };
setInterval(function () {
  if (!S || !S.event) return;
  hcTick(); spTick();
  if (UI.timer && (UI.screen === 'step' || UI.screen === 'free') && UI.timer.end > Date.now() - 1500) {
    if (!UI.timer.buzzed && UI.timer.end <= Date.now()) { UI.timer.buzzed = true; try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {} }
    render();
  }
  var P = UI.screen === 'step' && R() ? R().pending : UI.screen === 'free' && S.free ? S.free.step : null;
  if (P && P.kind === 'partner' && P.phase === 'show' && P.timerEnd && P.timerEnd > Date.now() - 1500) render();
  if (UI.screen === 'run' && R() && isTimed(R()) && !UI.kickOn && new Date().getSeconds() % 15 === 0) render();
}, 1000);

/* =========================================================
   Device frame
   ========================================================= */
var wrap = document.getElementById('wrap'), device = document.getElementById('device');
/* a website on every device: the app always fills the window (no phone frame);
   on wide screens the content stands in a centered column (--gx in the style) */
function fit() {
  document.body.classList.add('full');
  document.body.classList.toggle('wide', window.innerWidth > 640);
  document.body.classList.toggle('desk', window.innerWidth >= 1000);
}
window.addEventListener('resize', fit);

/* =========================================================
   Boot
   ========================================================= */
S = load() || fresh();
try { localStorage.removeItem('altesocke.history'); } catch (e) {}
/* v21 kept the guest party pass under the Game Pass key: move it where it belongs */
(function () { var p = lsGet(PASS_KEY); if (p && typeof p.bank === 'number' && !p.days) { if (!lsGet(GPASS_KEY)) lsSet(GPASS_KEY, p); lsDel(PASS_KEY); } })();
(function migrate() {
  var e = S.event; if (!e) return;
  if (!EVENT_TYPES.some(function (t) { return t.id === e.anlass; })) {
    var map = { kranz: 'socken', g25: 'socken', g30: 'treppe', hochzeit: 'hochzeit', jga: 'jga', eigen: 'party' };
    var t = map[e.anlass] || 'socken';
    if (t === 'socken' && e.focus.length && e.focus.every(function (p) { return p.anlass === 'schachtelkranz'; })) t = 'schachtel';
    if (t === 'socken' && e.focus.length && e.focus.every(function (p) { return FA[p.anlass] && FA[p.anlass].kind === 'zeit'; })) t = e.focus.every(function (p) { return p.anlass === 'klinke'; }) ? 'klinke' : 'treppe';
    if (t === 'treppe' && e.focus.length && e.focus.every(function (p) { return p.anlass === 'klinke'; })) t = 'klinke';
    e.anlass = t;
  }
  var fam = evFam();
  e.focus.forEach(function (p) { if (FAM_PERSON[fam].indexOf(p.anlass) < 0) p.anlass = evType().person; });
  if (S.runCfg && S.runCfg.fam !== fam) S.runCfg = null;
  if (S.run && !S.run.fam) S.run.fam = 'kranz';
})();
if (S.event && !S.event.mats) { S.event.mats = {}; MATERIALS.forEach(function (m) { S.event.mats[m.id] = true; }); }
var hash = (location.hash || '').replace('#', '');
if (hash === 'gast-fragen') { UI.guestMode = 'link'; UI.screen = 'guestForm'; UI.qDraft = qDraftNew(''); gReset(); }
else if (hash === 'gast-live') { UI.guestMode = 'link'; UI.screen = 'guestLive'; }
else {
  mergeInbox();
  UI.screen = S.event ? 'home' : 'landing';
}
fit();
render();
if (UI.screen === 'guestForm') gAfter();

})();
