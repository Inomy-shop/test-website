import assert from 'node:assert/strict';
import { clampScore, readinessClass, readinessMessage, initThemeToggle } from './app.js';

// ─── Existing tests (UNCHANGED) ───
assert.equal(clampScore(82), 82);
assert.equal(clampScore(-5), 0);
assert.equal(clampScore(128), 100);
assert.equal(clampScore('42.4'), 42);
assert.equal(clampScore('not-a-score'), 0);

assert.equal(readinessMessage(90), 'Ready for onboarding.');
assert.equal(readinessMessage(65), 'Almost ready. Review the remaining setup.');
assert.equal(readinessMessage(12), 'Needs attention before the first workflow.');

assert.equal(readinessClass(80), 'ready');
assert.equal(readinessClass(79), 'warning');

// ─── DOM stubs for initThemeToggle tests ───
function makeFakeDoc(initialTheme) {
  const dataset = {};
  if (initialTheme !== undefined) dataset.theme = initialTheme;
  return { documentElement: { dataset } };
}

function makeFakeButton() {
  const listeners = [];
  return {
    _attrs: {},
    setAttribute(k, v) { this._attrs[k] = v; },
    getAttribute(k) { return this._attrs[k] ?? null; },
    addEventListener(type, fn) { listeners.push({ type, fn }); },
    removeEventListener(type, fn) {
      const i = listeners.findIndex(l => l.type === type && l.fn === fn);
      if (i >= 0) listeners.splice(i, 1);
    },
    click() { listeners.filter(l => l.type === 'click').forEach(l => l.fn({})); },
  };
}

function makeFakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: k => (k in data ? data[k] : null),
    setItem(k, v) { data[k] = String(v); },
    removeItem(k) { delete data[k]; },
    _dump() { return { ...data }; },
  };
}

function makeFakeMql(matches) {
  return { matches, addEventListener() {}, removeEventListener() {} };
}

// ─── T-004: clicking toggle switches theme class to dark ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const storage = makeFakeStorage();
  const mql = makeFakeMql(false);
  initThemeToggle({ doc, button: btn, storage, mql });
  btn.click();
  assert.equal(doc.documentElement.dataset.theme, 'dark');
}

// ─── T-005: clicking toggle writes theme to localStorage ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const storage = makeFakeStorage();
  const mql = makeFakeMql(false);
  initThemeToggle({ doc, button: btn, storage, mql });
  btn.click();
  assert.equal(storage._dump().theme, 'dark');
}

// ─── T-006: second click toggles back to light and updates storage ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const storage = makeFakeStorage();
  const mql = makeFakeMql(false);
  initThemeToggle({ doc, button: btn, storage, mql });
  btn.click();
  btn.click();
  assert.equal(doc.documentElement.dataset.theme, 'light');
  assert.equal(storage._dump().theme, 'light');
}

// ─── T-007: stale localStorage value is ignored; OS dark preference wins ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const storage = makeFakeStorage({ theme: 'midnight' });
  const mql = makeFakeMql(true);
  const handle = initThemeToggle({ doc, button: btn, storage, mql });
  assert.equal(handle.getTheme(), 'dark');
  assert.notEqual(doc.documentElement.dataset.theme, 'midnight');
}

// ─── T-008: stale localStorage value + light OS → light; no overwrite on init ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const storage = makeFakeStorage({ theme: '' });
  const mql = makeFakeMql(false);
  const handle = initThemeToggle({ doc, button: btn, storage, mql });
  assert.equal(handle.getTheme(), 'light');
  assert.equal(storage._dump().theme, '');
}

// ─── T-009: localStorage.getItem throws → no exception; falls back to OS preference ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const mql = makeFakeMql(true);
  const throwingStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('SecurityError'); },
  };
  let handle;
  assert.doesNotThrow(() => {
    handle = initThemeToggle({ doc, button: btn, storage: throwingStorage, mql });
  });
  assert.equal(handle.getTheme(), 'dark');
}

// ─── T-010: localStorage.setItem throws → click does not throw; dataset.theme still flips ───
{
  const doc = makeFakeDoc();
  const btn = makeFakeButton();
  const mql = makeFakeMql(false);
  const throwingStorage = {
    getItem: () => null,
    setItem() { throw new Error('SecurityError'); },
  };
  initThemeToggle({ doc, button: btn, storage: throwingStorage, mql });
  assert.doesNotThrow(() => btn.click());
  assert.equal(doc.documentElement.dataset.theme, 'dark');
}

// ─── T-011: null button → no throw; getTheme() returns OS preference ───
{
  const doc = makeFakeDoc();
  const mql = makeFakeMql(false);
  let handle;
  assert.doesNotThrow(() => {
    handle = initThemeToggle({ doc, button: null, storage: makeFakeStorage(), mql });
  });
  assert.equal(handle.getTheme(), 'light');
}

console.log('All tests passed.');
