# Test Website

A small static website for testing Allen onboarding executions. This repo is
safe to use as a disposable first-run target because it has a tiny codebase,
one interactive widget, and a fast test command.

## What This Repo Does

This repo renders a simple landing page for a fake "Test Website" product. The
page has four main parts:

- A header with navigation links.
- A hero section that explains the repo is an Allen onboarding target.
- A feature section with cards describing why the repo is easy to test.
- A readiness score widget where users type a number from `0` to `100` and get
  a status message.

The main interactive behaviors are the readiness widget and the dark theme toggle:

- Scores `80` and above show `Ready for onboarding.`
- Scores from `50` to `79` show `Almost ready. Review the remaining setup.`
- Scores below `50` show `Needs attention before the first workflow.`
- Invalid, negative, or very large scores are clamped into the `0` to `100`
  range.
- The `☾ / ☀` button in the header toggles between light and dark themes. The
  chosen theme is saved to `localStorage` and restored on the next visit. When
  no preference is stored, the site follows the operating system's
  `prefers-color-scheme` setting.

This makes the repo useful for testing small changes such as text updates,
layout edits, validation rules, theme changes, and test updates.

## Using This Repo In Allen Onboarding

Use this repo when you want to try Allen without giving it access to your own
application code. It is designed as a low-risk first execution target:

- The codebase is small and easy to understand.
- The behavior is simple enough for an agent to inspect quickly.
- The tests run fast with `npm test`.
- The repo is disposable, so workflow experiments are safe.

During Allen onboarding, connect this repository instead of a personal or
production repo. Then run the first bug-fix workflow with a small request, such
as:

```text
Change the readiness widget so a score of exactly 50 shows a custom message, and update the tests.
```

After Allen starts the workflow, it should inspect this repo, make a small code
or documentation change, run tests, and show the execution trace. This gives new
users a realistic onboarding flow without risking important code.

## What Is Inside

- `index.html`: the single-page website, including the theme-toggle button and
  the pre-paint inline script that restores the saved theme without flash.
- `src/styles.css`: responsive styling; light-mode tokens in `:root`, dark-mode
  overrides in `@media (prefers-color-scheme: dark)` and `[data-theme='dark']`.
- `src/app.js`: readiness score helper functions, widget behaviour, and the
  exported `initThemeToggle()` function that wires the toggle button.
- `src/app.test.mjs`: lightweight Node tests for the helper functions and for
  `initThemeToggle()` (click toggling, localStorage persistence, stale-value
  fallback, and private-browsing error handling).

## Easy Changes To Try

- Change the headline or supporting text in `index.html`.
- Add, remove, or rename feature cards in `index.html`.
- Adjust light-mode colors in the `:root` block of `src/styles.css`, or tweak
  the dark-mode palette in the `@media (prefers-color-scheme: dark)` and
  `[data-theme='dark']` blocks.
- Change readiness score thresholds in `src/app.js`.
- Add tests for any behavior change in `src/app.test.mjs`.

## Run

```bash
npm install
npm run start
```

## Test

```bash
npm test
```

## Easy Manual Checks

1. Open the site with `npm run start`.
2. Go to the readiness widget.
3. Enter a score below `80` and click `Update`.
4. Confirm the message changes to a warning state.
5. Enter `80` or higher and confirm it changes back to ready.
6. Click the `☾` button in the header; the page should switch to the dark
   palette.
7. Reload the page; the dark palette should still be active (saved to
   `localStorage`).
8. Click the `☀` button; the page returns to light mode.
9. Clear `localStorage` and reload; the page should follow the operating
   system's colour-scheme preference.

## Example Allen Test Prompts

Use one of these prompts when testing a first workflow:

```text
The readiness widget should show a clearer message when the score is exactly 50. Please update the behavior and tests.
```

```text
Add a fourth feature card that explains this repo is safe for onboarding tests. Keep the layout responsive.
```

```text
Improve the README with setup, test, and manual QA instructions for a new user.
```

```text
The score input should clamp decimal values consistently. Review the current behavior, update it if needed, and make sure tests cover it.
```

## Expected Test Result

Running `npm test` should print:

```text
All tests passed.
```
