import assert from 'node:assert/strict';
import { clampScore, readinessClass, readinessMessage } from './app.js';

assert.equal(clampScore(82), 82);
assert.equal(clampScore(-5), 0);
assert.equal(clampScore(128), 100);
assert.equal(clampScore('42.4'), 42);
assert.equal(clampScore('not-a-score'), 0);

assert.equal(readinessMessage(90), 'Ready for onboarding.');
assert.equal(readinessMessage(65), 'Almost ready. Review the remaining setup.');
assert.equal(readinessMessage(12), 'Needs attention before the first workflow.');
assert.equal(readinessMessage(50), 'Right at the threshold. One more push to get ready.');
assert.equal(readinessMessage(49), 'Needs attention before the first workflow.');
assert.equal(readinessMessage(51), 'Almost ready. Review the remaining setup.');

assert.equal(readinessClass(80), 'ready');
assert.equal(readinessClass(79), 'warning');

console.log('All tests passed.');
