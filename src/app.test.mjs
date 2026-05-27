import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  clampScore,
  readinessClass,
  readinessMessage,
  readStoredTheme,
  systemPreferredTheme,
  resolveInitialTheme,
  applyTheme,
} from './app.js';

// ── Existing readiness tests (T-THEME-009 — must remain unchanged) ───────────
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

// ── Theme helper tests ───────────────────────────────────────────────────────

// Fake Storage factory
function fakeStorage(map) {
  return { getItem: (k) => (Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null) };
}

// Storage that throws on any access (getItem and setItem)
function throwingStorage() {
  return {
    getItem() { throw new Error('QuotaExceededError'); },
    setItem() { throw new Error('QuotaExceededError'); },
  };
}

// T-THEME-001: stored "dark" is returned as-is
assert.equal(readStoredTheme(fakeStorage({ 'tw.theme': 'dark' })), 'dark');

// T-THEME-002: missing key returns null
assert.equal(readStoredTheme(fakeStorage({})), null);

// T-THEME-003: invalid value returns null
assert.equal(readStoredTheme(fakeStorage({ 'tw.theme': 'banana' })), null);

// T-THEME-004: storage throws → returns null without re-throwing
assert.equal(readStoredTheme(throwingStorage()), null);

// T-THEME-005: systemPreferredTheme returns "dark" when matches=true
assert.equal(systemPreferredTheme({ matches: true }), 'dark');

// T-THEME-006: systemPreferredTheme returns "light" when matches=false
assert.equal(systemPreferredTheme({ matches: false }), 'light');

// T-THEME-007: resolveInitialTheme — stored preference wins
assert.equal(resolveInitialTheme({ read: () => 'dark', system: () => 'light' }), 'dark');

// T-THEME-008: resolveInitialTheme — falls back to system when no stored pref
assert.equal(resolveInitialTheme({ read: () => null, system: () => 'dark' }), 'dark');

// ── AC-001: visible theme toggle appears in the header ────────────────────────
{
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  // AC-001-1: toggle element with correct id exists
  assert.ok(html.includes('id="theme-toggle"'), 'AC-001: index.html must contain id="theme-toggle"');

  // AC-001-2: toggle appears after <nav (i.e. inside the header, after the nav)
  assert.ok(
    html.indexOf('id="theme-toggle"') > html.indexOf('<nav'),
    'AC-001: theme-toggle must appear after <nav in index.html',
  );

  // AC-001-3: toggle has an aria-label attribute (accessible name)
  assert.ok(html.includes('aria-label'), 'AC-001: theme-toggle must have an aria-label attribute');

  // AC-001-4: toggle has an aria-pressed attribute (toggle semantics)
  assert.ok(html.includes('aria-pressed'), 'AC-001: theme-toggle must have an aria-pressed attribute');
}

// ── AC-002: clicking the toggle switches theme without page reload ─────────────
{
  const fakeDoc = { documentElement: { dataset: {} } };
  const trackingStorage = {
    calls: [],
    getItem: () => null,
    setItem(k, v) { this.calls.push([k, v]); },
  };

  // AC-002-1: applyTheme('dark') sets dataset.theme to 'dark'
  applyTheme('dark', fakeDoc, trackingStorage);
  assert.equal(
    fakeDoc.documentElement.dataset.theme,
    'dark',
    'AC-002: applyTheme("dark") must set documentElement.dataset.theme to "dark"',
  );

  // AC-002-2: applyTheme('light') sets dataset.theme to 'light'
  applyTheme('light', fakeDoc, trackingStorage);
  assert.equal(
    fakeDoc.documentElement.dataset.theme,
    'light',
    'AC-002: applyTheme("light") must set documentElement.dataset.theme to "light"',
  );

  // AC-002-3: applyTheme does not throw when storage throws (try/catch guard)
  assert.doesNotThrow(
    () => applyTheme('dark', fakeDoc, throwingStorage()),
    'AC-002: applyTheme must not re-throw when storage access throws',
  );
}

// ── AC-005: dark mode CSS token block exists in styles.css ───────────────────
{
  const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8');

  // AC-005-1: dark-mode selector block present
  assert.ok(css.includes('[data-theme="dark"]'), 'AC-005: styles.css must contain [data-theme="dark"] selector');

  // AC-005-2: --bg design token defined
  assert.ok(css.includes('--bg:'), 'AC-005: styles.css must define the --bg token');

  // AC-005-3: --text design token defined
  assert.ok(css.includes('--text:'), 'AC-005: styles.css must define the --text token');
}

// ── AC-006: toggle is keyboard-operable (native button + correct aria state) ─
{
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  // AC-006-1: native <button> with type="button" (focusable, Enter/Space activate)
  assert.ok(html.includes('type="button"'), 'AC-006: theme-toggle must be a native button with type="button"');

  // AC-006-2: initial aria-pressed="false" (correct starting state)
  assert.ok(
    html.includes('aria-pressed="false"'),
    'AC-006: theme-toggle must have aria-pressed="false" as its initial state',
  );
}

console.log('All tests passed.');
