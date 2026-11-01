import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const script = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function runSite(withMenu) {
  const listeners = new Map();
  const button = {
    attributes: { 'aria-expanded': 'false' },
    getAttribute(name) { return this.attributes[name]; },
    setAttribute(name, value) { this.attributes[name] = value; },
    addEventListener(name, fn) { listeners.set('button:' + name, fn); },
    focus() {},
  };
  const nav = {
    classList: { add() {}, remove() {}, toggle() {} },
    querySelectorAll() { return []; },
  };
  const year = { textContent: '' };
  const document = {
    querySelector(selector) {
      if (selector === '.menu-toggle') return withMenu ? button : null;
      if (selector === '.site-header nav') return withMenu ? nav : null;
      if (selector === '#year') return year;
      return null;
    },
    addEventListener(name, fn) { listeners.set('document:' + name, fn); },
  };
  runInNewContext(script, { document, Date, window: {} });
  return { year, button, listeners };
}

test('site initializes without mobile navigation', () => {
  assert.equal(runSite(false).year.textContent, new Date().getFullYear());
});

test('mobile navigation toggles aria-expanded when available', () => {
  const { button, listeners } = runSite(true);
  listeners.get('button:click')();
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  listeners.get('button:click')();
  assert.equal(button.getAttribute('aria-expanded'), 'false');
});
