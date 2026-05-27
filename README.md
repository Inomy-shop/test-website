# Test Website

A small static website for testing Allen onboarding executions. This repo is
safe to use as a disposable first-run target because it has a tiny codebase,
one interactive widget, and a fast test command.

## What This Repo Does

This repo renders a simple landing page for a fake "Test Website" product. The
page has four main parts:

- A header with navigation links and a light/dark theme toggle button.
- A hero section that explains the repo is an Allen onboarding target.
- A feature section with cards describing why the repo is easy to test.
- A readiness score widget where users type a number from `0` to `100` and get
  a status message.

The only real behavior is the readiness widget:

- Scores `80` and above show `Ready for onboarding.`
- Scores from `50` to `79` show `Almost ready. Review the remaining setup.`
- Scores below `50` show `Needs attention before the first workflow.`
- Invalid, negative, or very large scores are clamped into the `0` to `100`
  range.

This makes the repo useful for testing small changes such as text updates,
layout edits, validation rules, and test updates.

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

- `index.html`: the single-page website, including the `#theme-toggle` button in
  the header.
- `src/styles.css`: responsive styling for the page. Defines CSS custom
  properties (design tokens) for the light theme in `:root` and overrides them
  for dark mode in the `[data-theme="dark"]` block.
- `src/app.js`: readiness score helper functions and widget behavior, plus theme
  management — reading and writing the `tw.theme` localStorage key, detecting
  the OS color-scheme preference, and wiring the header toggle button.
- `src/app.test.mjs`: lightweight Node tests for the helper functions, covering
  both the readiness widget and all theme helper functions.

## Easy Changes To Try

- Change the headline or supporting text in `index.html`.
- Add, remove, or rename feature cards in `index.html`.
- Adjust colors, spacing, or responsive layout in `src/styles.css`.
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
6. Click the 🌙 toggle button in the header and confirm the page switches to the
   dark theme without reloading.
7. Reload the page and confirm the dark theme is still applied (preference is
   persisted in `localStorage`).
8. Clear `localStorage` (`localStorage.clear()` in the browser console), reload,
   and confirm the site follows the OS color-scheme preference.

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

```text
The theme toggle label changes between "Switch to dark theme" and "Switch to light theme" depending on the current mode. Review the toggle behavior, update the label text if needed, and add tests.
```

## Expected Test Result

Running `npm test` should print:

```text
All tests passed.
```
