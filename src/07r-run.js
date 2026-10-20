/* =========================================================
   Run setup in three short steps, the kick-off cheer and the
   cockpit while the game runs
   ========================================================= */
var CFG_STEPS = ['Wer spielt', 'Spielart', 'Bereit?'];
function cfgStepNow() { return Math.max(1, Math.min(3, +UI.cfgStep || 1)); }
function cfgStepBar(n) {
  return '<nav class="wz" aria-label="Schritte">' + CFG_STEPS.map(function (l, i) {
    var k = i + 1, st = k < n ? ' done' : k === n ? ' now' : '';
    return (i ? '<i class="wz-line' + (k <= n ? ' on' : '') + '" aria-hidden="true"></i>' : '') +
      '<button type="button" class="wz-s' + st + '" data-act="cfgStep" data-v="' + k + '"' + (k === n ? ' aria-current="step"' : '') + '><span class="wz-n">' + (k < n ? icon('i-check', 14) : k) + '</span><span class="wz-l">' + l + '</span></button>';
  }).join('') + '</nav>';
}
/* what keeps the master on the first step */
function cfgBlock() {
  if (!cfgWho().length) return 'Tipp mindestens eine Person an.';
  if (isJga() && crewList().length < 2) return 'Tragt zuerst die Truppe ein, mindestens zwei Namen. Beim Junggesellenabschied spielt sie mit.';
  return '';
}
function cfgSharedUnits(who) {
  var k = {}; who.forEach(function (id) { k[person(id).anlass] = true; });
  return k.sockenkranz && k.schachtelkranz ? 'Stationen' : k.schachtelkranz ? 'Schachteln' : 'Socken';
}
function cfgLenText(c, who, tog) {
  if (c.variant === 'zeit' || c.variant === 'abend') return c.minutes + ' Minuten';
  if (c.fam === 'frei') return (c.variant === 'wuerfel' ? c.fields + ' Felder bis zum Ziel' : c.rounds + ' Runden') + (tog === 'gegeneinander' ? ' pro Person' : '');
  if (c.variant === 'meter') return c.meters + ' Meter Kranz' + (tog === 'gegeneinander' ? ' pro Person' : '');
  if (tog === 'gemeinsam') return c.shared + ' ' + cfgSharedUnits(who) + ' am gemeinsamen Kranz';
  return who.map(function (id) { var p = person(id); return p.name + ' ' + c.counts[id] + ' ' + faOf(p).units; }).join(' · ');
}
function cfgVariantBtn(k, c) {
  var v = variantInfo(k, c.fam), sel = c.variant === k;
  var ic = v.icon === 'sock' ? sockIc('#15122B', 17) : icon(v.icon, 24);
  return '<button type="button" class="opt row' + (sel ? ' is-sel' : '') + '" data-act="cfgVariant" data-v="' + k + '" aria-pressed="' + sel + '" style="min-height:62px;border-radius:20px;padding:8px 12px 8px 8px"><span class="tile-ic" style="width:42px;height:42px;border-radius:13px;background:' + v.bg + '">' + ic + '</span><span class="stack grow"><span style="font-size:15px;font-weight:800">' + v.label + '</span><span class="sub">' + v.sub + '</span></span><span class="check">' + icon('i-check', 14) + '</span></button>';
}
function cfgAccBlock(c) {
  var acc = c.acc.items.map(function (it, i) { return '<span class="person-chip" style="padding-left:12px">' + esc(it) + '<button type="button" class="x" data-act="cfgAccDel" data-i="' + i + '" aria-label="' + esc(it) + ' entfernen">' + icon('i-close', 14) + '</button></span>'; }).join('');
  return '<span class="eyebrow mt22 block">Zubehör-Wechsel' + (c.variant === 'zeit' ? '' : ' (optional)') + '</span>' +
    '<p class="small mt6">' + (c.variant === 'zeit' ? 'Trag ein, womit gefegt oder geputzt wird. Die App wechselt gleichmäßig durch, auch öfter als es Teile gibt.' : 'Zum Beispiel wechselnde Hilfsmittel beim Abhängen. Leer lassen, wenn ihr keins braucht.') + '</p>' +
    '<div class="chips mt10">' + (acc || '<span class="small">Noch nichts eingetragen.</span>') + '</div>' +
    '<div class="row gap8 mt10"><label class="grow" for="accName"><span class="sr">Zubehör</span><input id="accName" class="input" type="text" placeholder="z. B. Zahnbürste" data-bind="accName" value="' + esc(UI.accName || '') + '"></label><button type="button" class="iconbtn" data-act="cfgAccAdd" aria-label="Zubehör hinzufügen" style="width:48px;height:48px;background:var(--accent);color:var(--ink)">' + icon('i-plus', 20) + '</button></div>' +
    (c.acc.items.length >= 2 ? '<div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">Wechsel insgesamt</span><span class="sub">gleichmäßig verteilt</span></span>' + stepper('cfgSwaps', c.acc.swaps, '', 'Wechsel') + '</div></div>' : '');
}
/* step 1: who plays and how */
function cfgStep1(c) {
  var e = E(), who = cfgWho(), fam = c.fam;
  var people = e.focus.map(function (p) {
    var on = !!c.who[p.id];
    return '<button type="button" class="wz-p' + (on ? ' is-sel' : '') + '" data-act="cfgWho" data-v="' + p.id + '" aria-pressed="' + on + '">' + face(p, 58, '', on ? 'jubel' : '') + '<b>' + esc(p.name) + '</b><span class="wz-pc" aria-hidden="true">' + icon('i-check', 13) + '</span></button>';
  }).join('');
  var tog = '';
  if (who.length >= 2) {
    tog = '<span class="eyebrow mt22 block">Zusammen oder gegeneinander?</span><div class="seg mt10" style="grid-template-columns:repeat(2,minmax(0,1fr));height:48px" role="group" aria-label="Zusammen oder gegeneinander">' +
      [['gemeinsam', 'Gemeinsam'], ['gegeneinander', 'Gegeneinander']].map(function (x) { var s = c.together === x[0]; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="cfgTogether" data-v="' + x[0] + '" aria-pressed="' + s + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      '<p class="small mt8">' + (c.together === 'gemeinsam' ? (fam === 'kranz' ? 'Alle gehen zusammen denselben Kranz ab und wechseln sich bei den Aufgaben ab.' : fam === 'zeit' ? 'Alle arbeiten zusammen und wechseln sich bei den Einlagen ab.' : 'Alle spielen zusammen und wechseln sich bei den Aufgaben ab.') : (fam === 'kranz' ? 'Jede Person hat ihren eigenen Kranz. Es gibt Duelle gegeneinander.' : fam === 'zeit' ? 'Jede Person hat ihren eigenen Teil. Es gibt Duelle gegeneinander.' : 'Jede Person spielt für sich. Es gibt Duelle gegeneinander.')) + '</p>';
  }
  return '<h1 class="h1 mt18">Wer spielt mit?</h1><p class="small mt6">' + (e.focus.length > 1 ? 'Antippen, wer heute dabei ist.' : 'Heute im Mittelpunkt.') + '</p>' +
    '<div class="wz-people mt14">' + people + '</div>' + tog + (isJga() ? crewSetupHtml(c) : '');
}
/* step 2: the kind of game and how long */
function cfgStep2(c) {
  var fam = c.fam, who = cfgWho(), tog = cfgTogether(), timed = c.variant === 'zeit' || c.variant === 'abend';
  var vs = variantsFor(fam);
  var head = '<h1 class="h1 mt18">' + (fam === 'zeit' ? 'Wie lange dauert das Event?' : fam === 'frei' ? 'Wie spielt ihr heute?' : 'Wie geht ihr den Kranz ab?') + '</h1>';
  var vopts = vs.length > 1 ? '<div class="stack gap8 mt14" role="group" aria-label="Spielart">' + vs.map(function (k) { return cfgVariantBtn(k, c); }).join('') + '</div>' : '';
  var dice = c.variant === 'wuerfel' ? '<span class="eyebrow mt18 block">Gewürfelt wird</span><div class="seg mt10" style="grid-template-columns:repeat(2,minmax(0,1fr));height:48px" role="group" aria-label="Würfel">' +
    [['app', 'In der App'], ['echt', 'Mit echtem Würfel']].map(function (x) { var s = c.dice === x[0]; return '<button type="button" class="' + (s ? 'is-sel' : '') + '" data-act="cfgDice" data-v="' + x[0] + '" aria-pressed="' + s + '">' + x[1] + '</button>'; }).join('') + '</div>' +
    '<p class="small mt8">' + (c.dice === 'echt' ? 'Vor jeder Aufgabe tippst du die gewürfelte Zahl ein.' : 'Die App würfelt und zeigt die Zahl vor jeder Aufgabe.') + '</p>' : '';
  var len = '';
  if (timed) {
    len = '<div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">Geplante Dauer</span><span class="sub">' + (c.variant === 'zeit' ? 'Nur eine Schätzung, du korrigierst unterwegs' : 'Danach ist der Spielabend geschafft') + '</span></span>' + stepper('cfgMinutes', c.minutes + ' Min', '', 'Dauer') + '</div></div>';
  } else if (fam === 'frei') {
    len = '<div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">' + (c.variant === 'wuerfel' ? 'Felder bis zum Ziel' : 'Runden') + '</span><span class="sub">' + (tog === 'gegeneinander' ? 'pro Person' : 'gesamt') + '</span></span>' + (c.variant === 'wuerfel' ? stepper('cfgFields', c.fields, '', 'Felder') : stepper('cfgRounds', c.rounds, '', 'Runden')) + '</div></div>';
  } else if (c.variant === 'meter') {
    len = '<div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">Kranzlänge</span><span class="sub">' + (tog === 'gegeneinander' ? 'pro Person' : 'gesamt') + '</span></span>' + stepper('cfgMeters', c.meters + ' m', '', 'Länge') + '</div></div>';
  } else if (tog === 'gemeinsam') {
    var su = cfgSharedUnits(who);
    len = '<div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">' + su + ' am gemeinsamen Kranz</span></span>' + stepper('cfgShared', c.shared, '', su) + '</div></div>';
  } else {
    len = who.map(function (id) { var p = person(id); return '<div class="card pad mt10"><div class="row">' + face(p, 34) + '<span class="stack grow"><span class="name">' + esc(p.name) + '</span><span class="sub">' + faOf(p).units + ' am Kranz</span></span>' + stepper('cfgCount', c.counts[id], ' data-id="' + id + '"', faOf(p).units) + '</div></div>'; }).join('');
  }
  var dur = !timed ? '<div class="card pad mt10"><div class="row"><span class="stack grow"><span class="name">Wie lange ungefähr?</span><span class="sub">Der Pilot passt das Tempo daran an</span></span>' + stepper('cfgMinutes', c.minutes + ' Min', '', 'Dauer') + '</div></div>' : '';
  return head + (vs.length > 1 ? '<p class="small mt6">Die Spiele selbst sucht die App aus und verrät sie erst, wenn es so weit ist.</p>' : '') + vopts + dice +
    '<span class="eyebrow mt22 block">' + (timed ? 'Dauer' : 'Länge') + '</span>' + len + dur + (fam === 'zeit' ? accCountBlock(c) : '');
}
/* step 3: the plan at a glance, the extras, then go */
function cfgStep3(c) {
  var e = E(), who = cfgWho(), tog = cfgTogether(), fam = c.fam, timed = c.variant === 'zeit' || c.variant === 'abend', v = variantInfo(c.variant, fam);
  var steps = cfgSteps(), perPerson = steps / Math.max(1, who.length), shortPlan = false;
  var row = function (step, ic, title, sub) { return '<button type="button" class="wz-sum" data-act="cfgStep" data-v="' + step + '">' + ic + '<span class="stack grow" style="gap:2px;min-width:0;text-align:left"><b>' + title + '</b><span class="sub">' + sub + '</span></span><span class="wz-edit">Ändern</span></button>'; };
  var faces = '<span class="stackav wz-sum-ic">' + who.map(function (id) { return face(person(id), 36); }).join('') + '</span>';
  var vic = '<span class="tile-ic wz-sum-ic" style="width:40px;height:40px;border-radius:13px;background:' + v.bg + '">' + (v.icon === 'sock' ? sockIc('#15122B', 16) : icon(v.icon, 22)) + '</span>';
  var cic = '<span class="tile-ic wz-sum-ic" style="width:40px;height:40px;border-radius:13px;background:var(--violet)">' + icon('i-clock', 22) + '</span>';
  var mic = '<span class="tile-ic wz-sum-ic" style="width:40px;height:40px;border-radius:13px;background:var(--mint)">' + icon('i-box', 22) + '</span>';
  var sum = '<div class="wz-plan mt14">' +
    row(1, faces, esc(joinNames(who.map(function (id) { return person(id).name; }))), who.length < 2 ? 'Allein im Mittelpunkt' : tog === 'gemeinsam' ? 'Gemeinsam, im Wechsel' : 'Gegeneinander, mit Duellen') +
    row(2, vic, esc(v.label), esc(cfgLenText(c, who, tog)) + (c.variant === 'wuerfel' ? (c.dice === 'echt' ? ', echter Würfel' : ', Würfel in der App') : '')) +
    row(2, cic, 'Etwa ' + c.minutes + ' Minuten', 'Etwa ' + steps + ' ' + (timed ? 'Einlagen' : 'Aufgaben')) +
    '<button type="button" class="wz-sum" data-act="openMaterial" data-from="runSetup">' + mic + '<span class="stack grow" style="gap:2px;min-width:0;text-align:left"><b>Material</b><span class="sub">' + esc(matSummary()) + '</span></span><span class="wz-edit">Ändern</span></button></div>';
  var plan = who.map(function (id) {
    var M = e.max, T = Math.round(M * e.target / 100), est = planEstimate(id, perPerson); if (est < T) shortPlan = true;
    return '<div class="row" style="min-height:44px">' + face(person(id), 30) + '<span class="grow name" style="font-size:14px">' + esc(person(id).name) + '</span><span class="sub num">Ziel ~' + T + (est < T ? ', eher ~' + est : '') + ' · max ' + M + ' ' + esc(e.unit) + '</span></div>';
  }).join('') +
    (shortPlan ? '<p class="small" style="padding:4px 0 10px">Pro Spiel fällt höchstens 1 ' + esc(e.unit) + '. Bei so wenigen Aufgaben wird das Ziel deshalb nicht ganz erreicht. Mehr ' + (fam === 'frei' ? (c.variant === 'wuerfel' ? 'Felder' : 'Runden') : fam === 'kranz' ? (c.variant === 'meter' ? 'Meter' : 'Stationen am Kranz') : 'Spielzeit') + ' oder ein kleineres Maximum helfen.</p>' : '');
  var link = '<label class="row mt14 card pad" style="cursor:pointer"><span class="stack grow"><span class="name">Gäste per Link einbinden</span><span class="sub">Bei Schätz- und Abstimmfragen</span></span><button type="button" class="switch" role="switch" aria-checked="' + !!c.link + '" data-act="cfgLink" aria-label="Gäste per Link einbinden"><span></span></button></label>';
  var buddy = '<label class="row mt10 card pad" style="cursor:pointer"><span class="stack grow"><span class="name">Trinkbuddys</span><span class="sub">Jede Hauptperson wählt jemanden, der mittrinkt. Ab dem ersten gemeinsamen ' + esc(E().unit) + ' hält die Verbindung 1 bis 3 Spiele, das entscheidet die App. Dann wird neu gewählt.</span></span><button type="button" class="switch" role="switch" aria-checked="' + (c.buddy !== false) + '" data-act="cfgBuddy" aria-label="Trinkbuddys"><span></span></button></label>';
  return '<h1 class="h1 mt18">Alles bereit?</h1><p class="small mt6">Tipp eine Zeile an, um sie zu ändern.</p>' + sum +
    '<span class="eyebrow mt22 block">Plan des Piloten</span><div class="card padrows mt10">' + plan + '<div class="row" style="min-height:44px;border-top:1px solid var(--line)"><span class="grow small">So viel ' + esc(e.unit) + ' ist für heute eingeplant</span><button type="button" class="linkbtn" data-act="go" data-to="settings">Regeln</button></div></div>' +
    '<span class="eyebrow mt22 block">Extras, wenn ihr wollt</span>' + (isJga() ? '' : crewSetupHtml(c)) + link + buddy +
    factCard('runSetup');
}
V.runSetup = function () {
  var c = cfgDefaults(), fam = c.fam, n = cfgStepNow(), running = S.run && !S.run.finished;
  var body = cfgStepBar(n) + (n === 1 ? cfgStep1(c) : n === 2 ? cfgStep2(c) : cfgStep3(c)) + (UI.cfgErr ? '<p class="err mt14">' + UI.cfgErr + '</p>' : '');
  var back = n > 1 ? '<button type="button" class="btn-dark wz-back" data-act="cfgPrev">' + icon('i-back', 18) + 'Zurück</button>' : '';
  var fwd;
  if (n < 3) fwd = '<button type="button" class="cta" data-act="cfgNext"' + (cfgWho().length ? '' : ' disabled') + '>Weiter' + icon('i-next', 18) + '</button>';
  else if (running) fwd = '<button type="button" class="cta" data-act="go" data-to="run">Zum laufenden Spiel</button>';
  else fwd = '<button type="button" class="cta mint wz-go" data-act="cfgSave"' + (cfgWho().length ? '' : ' disabled') + '>' + icon('i-check', 18) + 'Abend speichern</button>';
  var foot = '<div class="cta-row">' + back + fwd + '</div>' + (n === 3 && running ? '<button type="button" class="btn-ghost" data-act="startRun">Neu starten</button>' : '');
  return scr(topbar('home', 'Abend einstellen'), body, foot);
};

/* ---------- the kick-off: a short cheer, then the cockpit ---------- */
function runKickoff() {
  var r = R(); if (!r || !app.insertAdjacentHTML) return;
  var old = app.querySelector('.kick'); if (old) old.remove();
  var fam = r.fam || 'kranz', main = person(currentMain());
  var sub = isTimed(r) ? (r.variant === 'abend' ? 'Der Spielabend läuft' : 'Die Uhr läuft') : main.name + ' fängt an';
  var faces = r.who.map(function (id, i) { return '<span class="kick-f" style="--i:' + i + '">' + face(person(id), r.who.length > 2 ? 60 : 84, '', 'jubel') + '</span>'; }).join('');
  var cols = ['#FF7A45', '#48D9A6', '#9886FF', '#FFC940', '#FFFFFF', '#FF8FC4'], conf = '';
  for (var k = 0; k < 54; k++) conf += '<i style="left:' + (2 + Math.random() * 96).toFixed(0) + '%;background:' + cols[k % cols.length] + ';--dx:' + (Math.random() * 160 - 80).toFixed(0) + 'px;--rot:' + (Math.random() * 900 - 450).toFixed(0) + 'deg;animation-delay:' + (0.12 + Math.random() * 0.3).toFixed(2) + 's"></i>';
  UI.kickOn = true;
  app.insertAdjacentHTML('beforeend', '<div class="kick" data-act="kickClose" role="status" aria-live="polite"><div class="kick-rays" aria-hidden="true"></div>' +
    '<div class="kick-c"><div class="kick-faces">' + faces + '</div><b class="kick-t">Los geht’s!</b><span class="kick-s">' + esc((fam === 'kranz' ? 'Der Kranz ist eröffnet. ' : '') + sub) + '</span></div>' +
    '<div class="kick-conf" aria-hidden="true">' + conf + '</div></div>');
  gVibe([30, 50, 30, 50, 140]);
  if (gkAudioUnlock()) { var Sn = gkSndBegin(); if (Sn) { try { gkSndWhoosh(Sn, Sn.t0, 0.35, 400, 2600, 0.1); gkSndThump(Sn, Sn.t0 + 0.2); gkSndChord(Sn, Sn.t0 + 0.22, 'epi'); } catch (e) {} } }
  clearTimeout(UI.kickT); UI.kickT = setTimeout(kickClose, 1550);
}
function kickClose() {
  clearTimeout(UI.kickT); UI.kickOn = false;
  var k = app.querySelector('.kick'); if (!k || !k.classList) { if (k && k.remove) k.remove(); return; }
  k.classList.add('out'); setTimeout(function () { if (k.parentNode) k.remove(); }, 380);
}

/* ---------- the cockpit ---------- */
function ckAgo(t) { var m = Math.round((now() - t) / 60000); return m < 1 ? 'gerade eben' : 'vor ' + m + ' Min'; }
var CK_OFF = { sock: [-23, -27], box: [-18, -19], flag: [-18, -22] };
/* the progress as a ring: the wreath itself, one piece per station, the arc inside */
function ckRing(r, tr) {
  var zeit = isTimed(r), fam = r.fam || 'kranz', u = unitOf(tr), p = clamp(trackProgress(tr), 0, 1);
  var seen = UI.ckSeen && UI.ckSeen[tr.id], p0 = seen ? seen.p : p, pos0 = seen ? seen.pos : tr.pos;
  var arcCls = 'ck-arc' + (p0 !== p ? ' go' : '') + (p === 0 && p0 === 0 ? ' zero' : '');
  var out = '<svg class="ck-svg" viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="ckg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFC940"></stop><stop offset="1" stop-color="#FF7A45"></stop></linearGradient></defs>' +
    '<circle class="ck-track" cx="110" cy="110" r="68"></circle><circle class="' + arcCls + '" cx="110" cy="110" r="68" pathLength="100" transform="rotate(-90 110 110)" style="--o0:' + (100 - p0 * 100).toFixed(1) + ';--o1:' + (100 - p * 100).toFixed(1) + '"></circle>';
  if (zeit) {
    for (var k = 0; k < 24; k++) {
      var a = (-90 + k * 15) * Math.PI / 180, r1 = k % 6 === 0 ? 85 : 90, on = k / 24 < p;
      out += '<line x1="' + (110 + r1 * Math.cos(a)).toFixed(1) + '" y1="' + (110 + r1 * Math.sin(a)).toFixed(1) + '" x2="' + (110 + 98 * Math.cos(a)).toFixed(1) + '" y2="' + (110 + 98 * Math.sin(a)).toFixed(1) + '" stroke="' + (on ? '#FFC940' : '#3A3463') + '" stroke-width="' + (k % 6 === 0 ? 4 : 3) + '" stroke-linecap="round"></line>';
    }
    return out + '</svg>';
  }
  var n = Math.max(1, tr.total), group = n > 30 ? Math.ceil(n / 30) : 1, slots = Math.ceil(n / group);
  var shape = u.ic === 'sock' ? 'sock' : u.ic === 'i-box' ? 'box' : u.unit === 'Station' ? 'mix' : 'flag';
  var RR = 94, arc = 2 * Math.PI * RR / slots, sc = Math.min(0.6, Math.max(0.28, arc * 0.8 / 36));
  var cols = ['#FFFFFF', '#48D9A6', '#9886FF', '#FFC940', '#FF8FC4'], frei = fam === 'frei', jn = 0;
  out += '<circle cx="110" cy="110" r="' + (RR - 8) + '" fill="none" stroke="#3A3463" stroke-width="2" stroke-dasharray="2 5"></circle>';
  for (var i = 0; i < slots; i++) {
    var ang = (-90 + i * 360 / slots) * Math.PI / 180, x = 110 + RR * Math.cos(ang), y = 110 + RR * Math.sin(ang);
    var from = i * group, to = Math.min(n, (i + 1) * group);
    var done = to <= tr.pos, now2 = !done && from <= tr.pos && tr.pos < to && !tr.done, just = done && to > pos0;
    var fill = done ? (frei ? '#48D9A6' : '#3A3463') : now2 ? '#FF7A45' : cols[i % cols.length];
    var sh = shape === 'mix' ? (i % 2 ? 'box' : 'sock') : shape, off = CK_OFF[sh];
    var cls = 'ck-it' + (now2 ? ' now' : '') + (just ? ' just' : '') + (done && !frei ? ' off' : '') + (!done && !now2 && frei ? ' dim' : '');
    out += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') scale(' + sc.toFixed(2) + ')"><g class="' + cls + '"' + (just ? ' style="--d:' + (0.25 + 0.09 * jn++).toFixed(2) + 's"' : '') + '><g transform="translate(' + off[0] + ' ' + off[1] + ')">' + garlandItem(sh, i, fill) + '</g></g></g>';
  }
  return out + '</svg>';
}
function ckCenter(r, tr) {
  var u = unitOf(tr), fam = r.fam || 'kranz';
  if (isTimed(r)) {
    var est = zeitEst(tr), tot = Math.round(r.variant === 'abend' ? r.planned : est.total);
    return '<b class="ck-big num">' + Math.round(est.elapsed) + '</b><span class="ck-of">von ' + (r.variant === 'abend' ? '' : 'ca. ') + tot + ' Min</span><small class="ck-lbl">' + (tr.done ? 'Geschafft!' : 'Minuten') + '</small>';
  }
  var verb = fam === 'kranz' && r.variant !== 'meter' ? 'abgenommen' : r.variant === 'runden' ? 'gespielt' : 'geschafft';
  return '<b class="ck-big num">' + tr.pos + '</b><span class="ck-of">von ' + tr.total + '</span><small class="ck-lbl">' + (tr.done ? 'Geschafft!' : esc(u.units) + ' ' + verb) + '</small>';
}
function ckTile(cap, val, sub, dot) { return '<div class="ck-tile"><span class="ck-tc">' + cap + '</span><b class="num">' + (dot ? '<i class="dotlive" style="background:' + dot + '"></i>' : '') + val + '</b><small>' + sub + '</small></div>'; }
function ckTool(act, extra, ic, label, cls) { return '<button type="button" class="ck-tool' + (cls ? ' ' + cls : '') + '" data-act="' + act + '"' + (extra || '') + '><span class="ck-ti">' + icon(ic, 18) + '</span><span class="grow">' + label + '</span></button>'; }
V.run = function () {
  var r = R(), e = E();
  if (!r) return V.runSetup();
  var tr = currentTrack(), main = currentMain(), mp = person(main), u = unitOf(tr);
  var inj = r.pending ? null : (dueInjection() || roleInjection(r) || hcInjection(r) || crewInjection(r));
  var pace = paceText(), zeit = isTimed(r), fam = r.fam || 'kranz';
  var dueInt = zeit && (now() - r.zeit.lastInt) / 60000 >= zeitInterval();
  var heroSub = r.variant === 'abend' ? 'Noch ca. ' + Math.round(zeitEst(tr).remaining) + ' Minuten' : zeit ? (u.jobVerb ? esc(joinNames(r.who.map(function (id) { return person(id).name; }))) + ' ' + (r.who.length > 1 ? (u.job === 'putzen' ? 'putzen' : 'fegen') : u.jobVerb) + ' nebenbei' : '') :
    fam === 'frei' ? (r.variant === 'wuerfel' ? 'Als Nächstes wird gewürfelt' : 'Als Nächstes: Runde ' + Math.min(tr.total, tr.pos + 1)) :
    (r.variant === 'wuerfel' ? 'Würfeln und am echten Kranz weitergehen' : 'Als Nächstes: ' + u.unit + ' ' + Math.min(tr.total, tr.pos + 1) + ' am Kranz');
  var mode = variantInfo(r.variant, fam).label + (r.together === 'gegeneinander' ? ' · gegeneinander' : r.who.length > 1 ? ' · gemeinsam' : '');
  var turn = zeit ? (r.variant === 'abend' ? 'Spielabend läuft' : 'Event läuft') : mp.name + ' ist dran';
  var cockpit = '<div class="ck"><div class="ck-mode"><i class="ck-live"></i>' + esc(mode) + '</div>' +
    '<div class="ck-ring">' + ckRing(r, tr) + '<div class="ck-c">' + ckCenter(r, tr) + '</div></div>' +
    '<div class="ck-turn">' + face(mp, 46, '', 'jubel') + '<span class="stack" style="gap:2px;min-width:0"><b>' + esc(turn) + '</b><span>' + heroSub + '</span></span></div></div>';
  var proj = Math.round(r.planned * paceRatio()), el = Math.round(elapsedMin());
  var tiles = '<div class="ck-tiles mt10">' + ckTile('Zeit', el + ' Min', 'von ' + r.planned + ' geplant') + ckTile('Tempo', esc(pace.label), 'Prognose ' + proj + ' Min', pace.tone) + ckTile('Gespielt', r.steps || 0, zeit ? 'Einlagen' : 'Aufgaben') + '</div>';
  /* each against each: who is ahead */
  var race = '';
  if (r.tracks.length > 1) {
    race = '<span class="eyebrow mt18 block">Das Rennen</span><div class="card padrows mt10">' + r.tracks.map(function (t) {
      var p = trackProgress(t), isTurn = t === tr && !t.done;
      var lead = r.tracks.every(function (o) { return o === t || trackProgress(o) < p; }) && p > 0;
      var badge = t.done ? '<span class="done-badge">Fertig</span>' : lead ? '<span class="done-badge" style="background:var(--sun)">Vorne</span>' : isTurn ? '<span class="ck-dran">dran</span>' : '';
      return '<div class="ck-race' + (isTurn ? ' on' : '') + '"><span class="stackav">' + t.ids.map(function (id) { return face(person(id), 34); }).join('') + '</span><span class="stack grow" style="gap:6px;min-width:0"><span class="row" style="gap:8px"><b class="name" style="font-size:14px">' + esc(joinNames(t.ids.map(function (id) { return person(id).name; }))) + '</b>' + badge + '</span><span class="prog"><b style="width:' + Math.round(p * 100) + '%"></b></span></span><span class="ck-rn num">' + (zeit ? Math.round(zeitEst(t).remaining) + '<small> Min</small>' : t.pos + '<small>/' + t.total + '</small>') + '</span></div>';
    }).join('') + '</div>';
  }
  var pilot = '<span class="eyebrow mt18 block">Pinnchen-Pilot</span><div class="card pad mt10 stack gap14">' + r.who.map(function (id) {
    var b = budget(id), p = person(id), sk = skillLabel(id);
    return '<div class="ck-pp"><div class="row gap10">' + face(p, 38) + '<span class="stack grow" style="gap:1px;min-width:0"><b class="ck-ppn">' + esc(p.name) + (id === main && !zeit && r.who.length > 1 ? '<span class="ck-dran">dran</span>' : '') + '</b><span class="sub">max ' + b.M + ' · ' + jokersLeft(id) + ' Wasser-Joker' + (sk ? ' · ' + esc(sk) : '') + '</span></span><span class="ck-ppv num"><b>' + b.C + '</b><small> von ~' + Math.round(b.Tp) + '</small></span></div><div class="mt10">' + pilotBar(id) + '</div></div>';
  }).join('') + '</div>';
  var logIc = { start: ['var(--mint)', 'i-play'], ok: ['var(--mint)', 'i-check'], fail: ['var(--orange)', 'i-close'], zurueck: ['var(--orange)', 'i-undo'], bonus: ['var(--sun)', 'i-arrow'], toast: ['var(--sun)', 'i-cup'], acc: ['var(--violet)', 'i-broom'], check: ['var(--violet)', 'i-clock'], finale: ['var(--accent)', 'i-flag'], info: ['var(--surface-2)', 'i-star'] };
  var logs = r.log.slice(0, UI.ckLog ? 8 : 1).map(function (l) {
    var ic = logIc[l.kind] || logIc.info;
    return '<div class="logrow"><span class="tile-ic" style="width:30px;height:30px;border-radius:10px;background:' + ic[0] + '">' + icon(ic[1], 14) + '</span><span class="grow" style="font-size:13px;font-weight:700;line-height:1.35">' + esc(l.text) + '</span><span class="sub" style="white-space:nowrap">' + ckAgo(l.t) + '</span></div>';
  }).join('');
  var hist = '<div class="row mt18" style="justify-content:space-between;align-items:center"><span class="eyebrow">Zuletzt</span>' + (r.log.length > 1 ? '<button type="button" class="linkbtn" data-act="ckLog" aria-expanded="' + !!UI.ckLog + '">' + (UI.ckLog ? 'Weniger' : 'Ganzer Verlauf') + '</button>' : '') + '</div><div class="card padrows mt10">' + logs + '</div>';
  var extras = hcRunCard(r) + rolesCard(r) + jokerRunCard() +
    (tipsList().length ? '<div class="card pad mt10 row" style="padding:10px 14px"><span class="tile-ic" style="width:32px;height:32px;border-radius:10px;background:var(--sun)">' + icon('i-clock', 16) + '</span><span class="grow small" style="color:var(--text)"><b>Tippspiel:</b> ' + tipsList().length + (tipsList().length === 1 ? ' Tipp' : ' Tipps') + ' zur Dauer, wird am Ende aufgelöst.</span></div>' : '');
  var tools = '<span class="eyebrow mt18 block">Werkzeuge</span><div class="ck-tools mt10">' +
    ckTool('openCounter', ' data-from="run"', 'i-shot', esc(e.unit) + ' eintragen') +
    (r.hist && r.hist.some(function (h) { return h.kind === 'task'; }) ? ckTool('openRewind', '', 'i-undo', 'Zurückspulen') : '') +
    ckTool('openCrew', ' data-from="run"', 'i-users', r.jga ? 'Die Truppe' : 'Gäste vor Ort') +
    (zeit && r.variant === 'zeit' ? ckTool('runCheck', '', 'i-clock', 'Status-Check') : '') +
    ckTool('openCards', ' data-from="run"', 'i-star', 'Karten') +
    ckTool('runShift', '', 'i-plus', '+5 Min (Test)') +
    ckTool('askConfirm', ' data-v="endRun"', 'i-flag', 'Spiel beenden', 'end') + '</div>' +
    (UI.confirm === 'endRun' ? confirmBox('Spiel jetzt beenden?', 'Der Stand bleibt im Zähler erhalten.', 'endRun', 'Beenden') : '');
  var primary, demoEnd = !r.pending && demoRunOver(r);
  if (r.pending) primary = '<button type="button" class="cta" data-act="go" data-to="step">Offene Karte ansehen</button>';
  else if (demoEnd) primary = '<button type="button" class="cta p-buy" data-act="demoLocked">' + icon('i-star', 18) + 'Mit dem Game Pass weiterspielen<i class="p-buy-shine" aria-hidden="true"></i></button>';
  else if (inj) primary = '<button type="button" class="cta" data-act="runNext">' + icon('i-star', 20) + esc(injectionLabel(inj)) + '</button>';
  else if (r.lastDone) primary = '<button type="button" class="cta" data-act="runNext">' + icon('i-flag', 20) + (r.variant === 'zeit' ? 'Endspurt: fertig machen' : 'Zum Finale') + '</button>';
  else if (r.forceGame && !(r.variant === 'wuerfel' && r.dice === 'echt')) primary = '<button type="button" class="cta" data-act="runNext">' + icon('i-star', 20) + 'Das letzte Spiel</button>';
  else if (r.variant === 'abend' && elapsedMin() >= r.planned) primary = '<button type="button" class="cta" data-act="runNext">' + icon('i-flag', 20) + 'Zeit ist um: zum Abschluss</button>';
  else if (zeit) primary = '<button type="button" class="cta' + (dueInt ? '' : ' mint') + '" data-act="runNext">' + icon('i-sparkle', 20) + (dueInt ? 'Nächste Einlage, jetzt fällig' : 'Nächste Einlage') + '</button>';
  else if (r.variant === 'wuerfel') primary = '<button type="button" class="cta" data-act="runNext">' + icon('i-dice', 22) + (r.dice === 'echt' ? 'Gewürfelte Zahl eintragen' : 'Würfeln') + '</button>';
  else primary = '<button type="button" class="cta" data-act="runNext">' + (u.ic === 'sock' ? sockIc('currentColor', 15) : icon(u.ic || 'i-flag', 20)) + esc(u.unit) + ' ' + Math.min(tr.total, tr.pos + 1) + (fam === 'frei' ? ' starten' : ' aufdecken') + '</button>';
  var demoCard = demoEnd ? '<div class="dm-end mt14">' + emb('crown', 40) + '<span class="stack grow" style="gap:3px;min-width:0"><b>Das war der Beispiel-Abend</b><span>' + DEMO_STEPS + ' Stationen zum Reinschnuppern. Mit dem Game Pass spielt ihr den ganzen Abend, mit allen Spielen und Gäste-Runden.</span></span></div>' : '';
  ruleSweep();
  var body = dk(cockpit + demoCard + tiles + race, (demoEnd ? '' : peekCard()) + partyRunHtml(r) + pilot + extras + hist + tools, 'dk-run');
  var head = '<div class="topbar tb3">' + navBtn('data-act="go" data-to="home" aria-label="Zur Party, das Spiel bleibt gespeichert"', 'i-back', 'Party') + '<span class="live"><i></i>Läuft</span>' +
    navBtn('data-act="runUndo" aria-label="Letzten Schritt rückgängig machen"' + (r.hist && r.hist.length ? '' : ' disabled'), 'i-undo', 'Rückgängig') + '</div>';
  /* remember what was shown once it had time to play, so the next visit animates only what changed */
  var shown = r.tracks.map(function (t) { return [t.id, clamp(trackProgress(t), 0, 1), t.pos]; });
  if (!UI.ckSeen) { UI.ckSeen = {}; shown.forEach(function (x) { UI.ckSeen[x[0]] = { p: x[1], pos: x[2] }; }); }
  clearTimeout(UI.ckSeenT);
  UI.ckSeenT = setTimeout(function () { shown.forEach(function (x) { UI.ckSeen[x[0]] = { p: x[1], pos: x[2] }; }); }, 1500);
  return scr(head, body, '<div class="cta-row">' + primary + '</div>' + (inj && !r.pending ? '<p class="small" style="text-align:center">' + esc(injectionLabel(inj)) + '. Danach geht es normal weiter.</p>' : ''));
};
