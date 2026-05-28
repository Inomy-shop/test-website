# Getting Started

This guide walks you through cloning, installing, running, testing, and manually
verifying the Test Website.

## Prerequisites

- **Node.js 18 or later** — the test runner uses native ESM (`type: "module"` in
  `package.json`) and `node:assert/strict`.
- **npm** — bundled with Node.js.

No backend, database, or cloud account is required.

## Install

```bash
git clone <repo-url>
cd test-website
npm install
```

`npm install` fetches the single dev dependency: **Vite 6**.

## Run the dev server

```bash
npm run start
```

Vite binds to `0.0.0.0` (reachable on your local network) and serves the site at
`http://localhost:5173` by default. Open that URL in a browser to see the landing
page.

## Run tests

```bash
npm test
```

This executes `node src/app.test.mjs` directly — no test framework, no browser,
and no jsdom required. A passing run prints:

```text
All tests passed.
```

## Build for production

```bash
npm run build
```

Vite bundles and minifies the site into `dist/`. Expected output:

```
dist/index.html            ~4 kB   (gzip ~1.3 kB)
dist/assets/index-*.css    ~4 kB   (gzip ~1.4 kB)
dist/assets/index-*.js     ~1.5 kB (gzip ~0.75 kB)
```

The `dist/` folder is listed in `.gitignore` and is not committed to the
repository.

## Manual functional check

1. Start the dev server (`npm run start`).
2. Open `http://localhost:5173` in a browser.
3. Scroll to the **Status** section or click **Check status** in the header nav.
4. The readiness widget loads with a default score of **82** and shows:
   > Ready for onboarding.
5. Type **60** in the score input and click **Update**.  
   The message changes to:
   > Almost ready. Review the remaining setup.  
   The text turns amber.
6. Type **30** and click **Update**.  
   The message changes to:
   > Needs attention before the first workflow.
7. Type **80** and press **Enter** (no click required).  
   The message returns to:
   > Ready for onboarding.  
   The text turns dark green.
8. Type **150** and click **Update**.  
   The input value is clamped to **100** and the message stays "Ready for
   onboarding." — confirming that out-of-range values are normalized.

## Next steps

- [Readiness widget reference](./readiness-widget.md) — full API, threshold table,
  and DOM behavior.
- [Development guide](./development.md) — how to make common edits and validate
  them.
- [Architecture](./architecture.md) — project structure and runtime flow.
