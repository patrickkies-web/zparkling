/* Loads the built app into a Node vm with a tiny fake DOM, a fake clock and a seeded random.
   All top-level functions and vars of the app become properties of the returned context. */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

function appCode() {
  const html = fs.readFileSync(path.join(ROOT, 'build', 'app.html'), 'utf8');
  const a = html.indexOf('<script>') + 8, b = html.lastIndexOf('</script>');
  let js = html.slice(a, b).trim();
  /* strip the IIFE wrapper so declarations land on the context */
  js = js.replace(/^\(function\(\)\{\s*/, '').replace(/\}\)\(\);\s*$/, '');
  return js;
}

function seeded(seed) {
  let a = seed >>> 0;
  return function () { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function stubEl(id) {
  const e = {
    id: id || '', innerHTML: '', textContent: '', value: '', _attrs: {}, style: {}, dataset: {},
    setAttribute(k, v) { this._attrs[k] = String(v); }, getAttribute(k) { return this._attrs[k] == null ? null : this._attrs[k]; },
    querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, removeEventListener() {},
    insertAdjacentHTML(p, h) { this.innerHTML += h; }, appendChild() {}, remove() {}, contains() { return true; }, closest() { return null; },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 800, bottom: 800, right: 400 }; },
    focus() {}, blur() {}, scrollTo() {}, animate() { return {}; }, offsetWidth: 400, scrollTop: 0
  };
  return e;
}

function load(opts) {
  opts = opts || {};
  const store = new Map();
  const els = { app: stubEl('app'), wrap: stubEl('wrap'), device: stubEl('device') };
  const timers = [];
  const ctx = {
    console, AbortController, JSON, Math, Promise,
    __t: opts.t0 || Date.UTC(2026, 9, 17, 18, 0, 0),
    localStorage: {
      getItem: k => (store.has(k) ? store.get(k) : null), setItem: (k, v) => { store.set(k, String(v)); },
      removeItem: k => { store.delete(k); }, clear: () => store.clear()
    },
    document: {
      getElementById: id => els[id] || null, createElement: () => stubEl(), body: stubEl('body'), activeElement: null,
      querySelector: () => null, querySelectorAll: () => []
    },
    location: { hash: opts.hash || '' },
    navigator: {},
    setTimeout: (fn, ms) => { timers.push(fn); return timers.length; }, clearTimeout: () => {},
    setInterval: () => 0, clearInterval: () => {},
    requestAnimationFrame: fn => 0, getComputedStyle: () => ({ getPropertyValue: () => '' }),
    SpeechSynthesisUtterance: function () {}
  };
  ctx.window = ctx; ctx.globalThis = ctx;
  if (!opts.demo) ctx.DEMO_OFF = true; /* tests see the whole app; load({ demo: true }) for the limited example evening */
  ctx.addEventListener = () => {}; ctx.innerWidth = 400; ctx.innerHeight = 900;
  vm.createContext(ctx);
  /* fake clock and seeded random inside the context */
  vm.runInContext('(function(){var RD=Date;class FD extends RD{constructor(...a){if(a.length===0)super(globalThis.__t);else super(...a);}static now(){return globalThis.__t;}}globalThis.Date=FD;})();', ctx);
  ctx.Math = Object.create(Math); // own Math so we can seed it
  const rnd = seeded(opts.seed || 1);
  ctx.Math.random = rnd;
  if (opts.tour !== false) store.set('altesocke.tour', JSON.stringify({ done: 1, name: '', roll: 0 }));
  vm.runInContext(appCode(), ctx, { filename: 'app.js' });
  ctx.__store = store; ctx.__timers = timers;
  ctx.advance = function (min) { ctx.__t += Math.round(min * 60000); };
  ctx.flushTimers = function () { while (timers.length) { const f = timers.shift(); try { f(); } catch (e) { throw e; } } };
  return ctx;
}

module.exports = { load, appCode, seeded };
