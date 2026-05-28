# Architecture

This document describes the project structure, the runtime flow from page load to
user interaction, and the testing approach.

---

## Project structure

```
test-website/
├── index.html          # Single-page site; all sections and the widget live here
├── package.json        # Project metadata, npm scripts, Vite dev dependency
├── .gitignore          # Ignores node_modules/ and dist/
├── src/
│   ├── app.js          # Exported helper functions + private DOM-binding function
│   ├── app.test.mjs    # Node.js assertion tests (no browser or framework needed)
│   └── styles.css      # All styles; CSS custom properties used as design tokens
└── dist/               # Build output (gitignored; produced by `npm run build`)
```

There is no backend, router, or component framework. The entire site is one HTML
file wired to one CSS file and one JavaScript ES module.

---

## Runtime flow

### Page load

1. The browser fetches `index.html`.
2. `<link rel="stylesheet" href="/src/styles.css">` loads all styles synchronously.
3. `<script type="module" src="/src/app.js">` loads the script as an ES module.
4. `app.js` executes. The `typeof document !== 'undefined'` guard is `true` in a
   browser, so `bindReadinessWidget()` is called immediately.
5. `bindReadinessWidget` queries three elements:
   - `#score-input` (the number input, HTML default value `82`)
   - `#score-button` (the Update button)
   - `#score-message` (the status paragraph)
6. Event listeners are attached: `click` on the button, `keydown` on the input
   (fires `update()` when the pressed key is `Enter`).
7. `update()` fires **once immediately** on bind — the widget initializes with the
   score `82` and displays "Ready for onboarding." before any user action.

### User interaction

When the user enters a score and clicks **Update** (or presses **Enter**):

```
input.value
    │
    ▼
clampScore()  ──→  integer in [0, 100]
    │                       │
    │            ┌──────────┼───────────────┐
    │            ▼          ▼               ▼
    │      input.value  message.textContent  message.class
    │      (normalized) readinessMessage()   readinessClass()
    │
    └── all three side-effects run synchronously in the same update() call
```

### Build

`npm run build` runs Vite in production mode:

1. Vite bundles `src/app.js` as an ES module entry point.
2. `src/styles.css` is processed and emitted as a hashed asset file.
3. Asset references in `index.html` are rewritten to point to the hashed filenames.
4. Output lands in `dist/` — approximately 4 kB HTML, 4 kB CSS, 1.5 kB JS before
   gzip.

---

## Module design

`src/app.js` is split into two layers:

| Layer | Functions | Exported | Testable without a browser |
| --- | --- | --- | --- |
| Pure helpers | `clampScore`, `readinessMessage`, `readinessClass` | Yes | Yes |
| DOM binding | `bindReadinessWidget` | No | No — requires `document` |

The `typeof document !== 'undefined'` guard at the bottom of the file is the only
environment branch. When the file is imported by Node for tests, the guard is
`false` and `bindReadinessWidget` is never called, so no DOM errors occur.

Keeping the business logic (thresholds, clamping, message strings) in pure functions
that never touch the DOM means:

- The test suite runs directly in Node without a browser or jsdom.
- Changing thresholds only requires editing the helper functions and their tests,
  not the DOM-binding code.

---

## Testing approach

`src/app.test.mjs` uses only Node's built-in `node:assert/strict` — no test
framework, no browser, no DOM simulation.

**Coverage by function:**

| Function | Cases tested |
| --- | --- |
| `clampScore` | In-range integer (`82`), negative (`-5`), above-max (`128`), decimal string (`'42.4'`), non-numeric string (`'not-a-score'`) |
| `readinessMessage` | One score per band: `90` (ready), `65` (almost), `12` (needs attention) |
| `readinessClass` | Boundary values: `80` → `'ready'`, `79` → `'warning'` |

**What is intentionally not tested:**

- `bindReadinessWidget` — private function, requires a live browser DOM.
- CSS rendering — verified manually or by visual inspection.
- HTML structure — static, no templating engine.

The test file ends with `console.log('All tests passed.')` rather than a
framework-managed reporter. Because every `assert.equal` throws synchronously on
failure, the log line only prints when all assertions pass.

---

## Dependency rationale

| Package | Version | Role | Type |
| --- | --- | --- | --- |
| `vite` | `^6.0.0` | Dev server and production bundler | `devDependency` |

There are no runtime npm dependencies. The production output (`dist/`) is pure
HTML, CSS, and a small ES module — no framework or polyfill bundle is included.
Vite is used exclusively during development (`npm run start`) and for producing the
production build (`npm run build`).
