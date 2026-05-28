import assert from 'node:assert/strict';
import { clampScore, readinessClass, readinessMessage, resolveInitialTheme, nextTheme, themeButtonLabel, themeButtonPressed } from './app.js';

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

// resolveInitialTheme — stored preference wins
assert.equal(resolveInitialTheme({ stored: 'dark', prefersDark: false }), 'dark');
assert.equal(resolveInitialTheme({ stored: 'light', prefersDark: true }), 'light');
// resolveInitialTheme — fallback to system preference
assert.equal(resolveInitialTheme({ stored: null, prefersDark: true }), 'dark');
assert.equal(resolveInitialTheme({ stored: null, prefersDark: false }), 'light');
// resolveInitialTheme — invalid stored value treated as absent
assert.equal(resolveInitialTheme({ stored: 'bogus', prefersDark: true }), 'dark');
// nextTheme
assert.equal(nextTheme('light'), 'dark');
assert.equal(nextTheme('dark'), 'light');
// themeButtonLabel
assert.equal(themeButtonLabel('light'), 'Switch to dark theme');
assert.equal(themeButtonLabel('dark'), 'Switch to light theme');
// themeButtonPressed
assert.equal(themeButtonPressed('dark'), 'true');
assert.equal(themeButtonPressed('light'), 'false');

console.log('All tests passed.');
