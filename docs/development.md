# Development Guide

This guide covers common editing tasks, validation commands, and troubleshooting
for the Test Website.

## Prerequisites

See [Getting Started](./getting-started.md) for Node.js version requirements and
the initial `npm install` step.

---

## Common edits

### Change page text or layout

Edit `index.html`. The file is plain HTML — Vite hot-reloads the browser tab
automatically during `npm run start`, so no manual refresh is needed.

Key sections and their anchor IDs:

| Section | Anchor | What to edit |
| --- | --- | --- |
| Hero headline and body | `#home` | `.hero-copy` — `<h1>` and `<p>` |
| Feature cards | `#features` | `.feature-grid` — each `<article class="feature-card">` |
| Readiness widget label | `#status` | `<label for="score-input">` |
| Contact blurb | `#contact` | `<h2>` and `<p>` |
| Footer text | `<footer>` | Both `<span>` elements |

### Add or remove a feature card

Feature cards live inside `.feature-grid` in `index.html`. Each card follows this
pattern:

```html
<article class="feature-card">
  <h3>Card title</h3>
  <p>Card description text.</p>
</article>
```

The grid uses `grid-template-columns: repeat(3, minmax(0, 1fr))` in
`src/styles.css`. Adding a fourth card wraps it into a new row; the layout stays
responsive — below 760 px the grid collapses to a single column automatically.

### Adjust colors or spacing

All design tokens are CSS custom properties at the top of `src/styles.css`:

```css
:root {
  --bg: #f7f8f5;
  --surface: #ffffff;
  --surface-muted: #eef3ef;
  --text: #1d2520;
  --muted: #627066;
  --border: #d8e0da;
  --accent: #0e7c66;
  --accent-dark: #095f4e;
  --warning: #b56b19;
}
```

Changing a token updates every component that references it. The header, footer,
buttons, input, and readiness-message colors all derive from these properties.

### Change readiness score thresholds

Edit `src/app.js`. The thresholds appear in two functions — both must be updated
consistently. See [Readiness Widget → Changing thresholds](./readiness-widget.md#changing-thresholds)
for the exact lines and a copy-pasteable example.

After any threshold change, run the tests immediately and update failing assertions.

---

## Validation commands

Run these from the repo root after any change.

### Tests

```bash
npm test
```

Runs `node src/app.test.mjs`. All assertions use `node:assert/strict`. A passing
run prints:

```text
All tests passed.
```

A failing assertion prints an `AssertionError` with the actual and expected values,
then exits with a non-zero code.

### Production build

```bash
npm run build
```

Vite bundles the site into `dist/`. This validates that all `import` paths resolve,
the CSS is syntactically valid, and the JavaScript can be processed. Check for
warnings in the terminal output — Vite reports unresolved modules as errors.

### Dev server

```bash
npm run start
```

Starts the Vite dev server on `http://localhost:5173`. Import errors and syntax
errors are reported both in the terminal and in the browser console.

---

## Writing and updating tests

Tests live in `src/app.test.mjs`. The file imports the three exported helpers and
makes synchronous assertions using `node:assert/strict`:

```js
import assert from 'node:assert/strict';
import { clampScore, readinessClass, readinessMessage } from './app.js';

assert.equal(clampScore(82), 82);
// … more assertions …

console.log('All tests passed.');
```

To add a test, insert an `assert.equal` (or `assert.throws` for error cases)
**before** the final `console.log` line. There is no runner — every assertion must
pass for the script to complete without error.

The private `bindReadinessWidget` function is not covered by the test suite because
it requires a browser DOM. Exercise DOM behavior manually using the steps in
[Getting Started → Manual functional check](./getting-started.md#manual-functional-check).

---

## Troubleshooting

### `npm test` fails with `Cannot find module`

Node cannot locate `./app.js` in `src/`. Check that `src/app.js` exists and the
path in the import statement at the top of `src/app.test.mjs` matches. Also make
sure `npm install` has been run at least once.

### `npm run build` fails with a module resolution error

Verify that any new `import` added to `src/app.js` or `index.html` points to a
real file or an installed npm package. Vite treats unresolved imports as build
errors.

### The dev server shows a blank page

Open the browser console. A JavaScript syntax error in `src/app.js` will prevent
the ES module from loading. Fix the error and save — Vite hot-reloads immediately.

### The score input shows an unexpected value after clicking Update

`clampScore` rounds decimals using `Math.round` and clamps out-of-range values to
0 or 100. The clamped integer is written back to `input.value` on every update.
This is expected behavior — see [clampScore](./readiness-widget.md#clampscore) for
the full normalization table.

### Tests pass but the behavior in the browser looks wrong

Make sure the test assertions cover the exact boundary condition you changed. The
Node tests call the helper functions directly with specific inputs; they do not
exercise the DOM wiring. Add an assertion for the specific input value that is
misbehaving, then run `npm test` again.
