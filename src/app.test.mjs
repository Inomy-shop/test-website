import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { clampScore, readinessClass, readinessMessage, getStoredTheme } from './app.js';

// ─── AC-7: original 10 assertions must still pass ────────────────────────────
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

// ─── AC-8: getStoredTheme() exported and returns null outside browser ─────────
assert.equal(getStoredTheme(), null);

// ─── File-content assertions (pure Node.js, no DOM needed) ───────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// AC-1: src/styles.css must contain html[data-theme='dark'] block that
//       redefines every :root custom property.
const css = readFileSync(join(root, 'src', 'styles.css'), 'utf8');

assert.ok(
  css.includes("html[data-theme='dark']"),
  "CSS must contain an html[data-theme='dark'] block",
);

const darkBlockStart = css.indexOf("html[data-theme='dark']");
const darkBlock = css.slice(darkBlockStart);

const rootTokens = [
  '--bg',
  '--surface',
  '--surface-muted',
  '--text',
  '--muted',
  '--border',
  '--accent',
  '--accent-dark',
  '--warning',
  '--shadow',
  '--on-accent',
  '--header-overlay',
];

for (const token of rootTokens) {
  assert.ok(
    darkBlock.includes(token),
    `html[data-theme='dark'] block must redefine ${token}`,
  );
}

// AC-2: index.html must contain <button id="theme-toggle"> inside <nav>
const html = readFileSync(join(root, 'index.html'), 'utf8');

assert.ok(
  html.includes('<button id="theme-toggle"'),
  'index.html must contain <button id="theme-toggle"',
);

const navStart = html.indexOf('<nav');
const navEnd = html.indexOf('</nav>', navStart);
assert.ok(
  navStart !== -1 && navEnd !== -1 &&
    html.slice(navStart, navEnd).includes('id="theme-toggle"'),
  'theme-toggle button must be inside a <nav> element',
);

// AC-6: synchronous inline <script> (no type="module") must appear in <head>
//       before first paint.
const headEnd = html.indexOf('</head>');
const headContent = html.slice(0, headEnd);

assert.ok(
  headContent.includes('<script>'),
  'index.html must contain an inline <script> (no type attribute) in <head> for flash prevention',
);
assert.ok(
  !headContent.includes('<script type="module"'),
  'The flash-prevention script in <head> must NOT have type="module"',
);

// AC-9: README.md must have a ## Dark Mode section covering the four required
//       topics: toggle location, keyboard accessibility, localStorage
//       persistence, and prefers-color-scheme default.
const readme = readFileSync(join(root, 'README.md'), 'utf8');

assert.ok(
  readme.includes('## Dark Mode'),
  'README must contain a ## Dark Mode section',
);
assert.ok(
  readme.includes('localStorage'),
  'README Dark Mode section must mention localStorage persistence',
);
assert.ok(
  readme.includes('prefers-color-scheme'),
  'README Dark Mode section must mention prefers-color-scheme',
);
assert.ok(
  readme.toLowerCase().includes('keyboard'),
  'README Dark Mode section must mention keyboard accessibility',
);

console.log('All tests passed.');
