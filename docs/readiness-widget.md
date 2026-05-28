# Readiness Widget

The readiness widget is the only interactive element on the page. It lives in the
`#status` section and lets a user type a score from 0 to 100 to see an onboarding
readiness message.

This document is the complete reference for the three exported helper functions in
`src/app.js` and for the DOM behavior that wires them to the page.

---

## Threshold table

| Clamped score | Message | CSS class |
| --- | --- | --- |
| 80–100 | `Ready for onboarding.` | `ready` |
| 50–79 | `Almost ready. Review the remaining setup.` | `warning` |
| 0–49 | `Needs attention before the first workflow.` | `warning` |

Scores are clamped and rounded before any threshold comparison (see
[`clampScore`](#clampscore) below).

---

## Helper functions

All three functions are exported from `src/app.js` and are importable in Node or a
browser:

```js
import { clampScore, readinessMessage, readinessClass } from './src/app.js';
```

### `clampScore(value)`

Normalizes any input into an integer in the range `[0, 100]`.

**Algorithm:**

1. Converts `value` to a number with `Number(value)`.
2. Returns `0` if the result is not finite (`NaN`, `Infinity`, `-Infinity`, or
   any non-numeric string).
3. Applies `Math.round`, then clamps: `Math.min(100, Math.max(0, Math.round(score)))`.

**Examples:**

| Input | Output | Reason |
| --- | --- | --- |
| `82` | `82` | In range, no change |
| `-5` | `0` | Negative → clamped to 0 |
| `128` | `100` | Exceeds maximum → clamped to 100 |
| `'42.4'` | `42` | Numeric string parsed, rounded down |
| `'42.5'` | `43` | Numeric string parsed, rounded up |
| `'not-a-score'` | `0` | Non-numeric → `NaN` → not finite → 0 |

---

### `readinessMessage(score)`

Returns the human-readable status string for a score.

Calls `clampScore(score)` internally, so raw, out-of-range, or non-numeric values
are safe to pass directly.

**Return values:**

| Condition | Return value |
| --- | --- |
| `clampScore(score) >= 80` | `'Ready for onboarding.'` |
| `clampScore(score) >= 50` | `'Almost ready. Review the remaining setup.'` |
| `clampScore(score) < 50` | `'Needs attention before the first workflow.'` |

**Examples:**

```js
readinessMessage(90)   // 'Ready for onboarding.'
readinessMessage(65)   // 'Almost ready. Review the remaining setup.'
readinessMessage(12)   // 'Needs attention before the first workflow.'
readinessMessage(150)  // 'Ready for onboarding.'   (clamped to 100)
readinessMessage(-10)  // 'Needs attention before the first workflow.'  (clamped to 0)
```

---

### `readinessClass(score)`

Returns the CSS class name to apply to the `#score-message` element.

| Condition | Return value |
| --- | --- |
| `clampScore(score) >= 80` | `'ready'` |
| `clampScore(score) < 80` | `'warning'` |

The boundary is strictly at 80. A score of 79 returns `'warning'`; a score of 80
returns `'ready'`.

**Examples:**

```js
readinessClass(80)  // 'ready'
readinessClass(79)  // 'warning'
readinessClass(50)  // 'warning'
```

---

## DOM behavior

`bindReadinessWidget()` is a private (non-exported) function that wires the three
helpers to the page. It is called automatically when the script loads in a browser.
The `typeof document !== 'undefined'` guard in `app.js` prevents it from running
in Node.js test environments.

### Elements queried

| Selector | Element | Role |
| --- | --- | --- |
| `#score-input` | `<input type="number" min="0" max="100" value="82">` | Score entry |
| `#score-button` | `<button type="button">Update</button>` | Trigger |
| `#score-message` | `<p class="score-message">` | Output display |

If any of the three elements is missing, `bindReadinessWidget` returns early and no
events are attached.

### Update sequence

Triggered by a **button click** or pressing **Enter** inside the input:

1. Reads `input.value` and passes it to `clampScore`.
2. Writes the clamped integer back to `input.value` (normalizes out-of-range or
   decimal entries visible in the UI).
3. Sets `message.textContent = readinessMessage(score)`.
4. Removes both `ready` and `warning` CSS classes from `message`.
5. Adds the class returned by `readinessClass(score)`.

The same `update()` callback fires **once immediately on page load**, so the widget
initializes from the HTML default value of `82` and displays
"Ready for onboarding." on the first paint — no user interaction required.

### CSS classes and colors

Defined in `src/styles.css`. The hex values are theme-adaptive — they resolve
to different colors in light and dark mode via CSS custom properties:

| Class | CSS custom property | Light mode | Dark mode | Visual |
| --- | --- | --- | --- | --- |
| `.score-message.ready` | `var(--accent-dark)` | `#095f4e` | `#7fe8ca` | Green — positive |
| `.score-message.warning` | `var(--warning)` | `#b56b19` | `#f0a85c` | Amber — attention needed |

---

## Changing thresholds

To adjust the scoring bands, edit the conditionals in `src/app.js`:

```js
// readinessMessage — controls text
export function readinessMessage(score) {
  const clamped = clampScore(score);
  if (clamped >= 80) return 'Ready for onboarding.';
  if (clamped >= 50) return 'Almost ready. Review the remaining setup.';
  return 'Needs attention before the first workflow.';
}

// readinessClass — controls color; boundary must match readinessMessage
export function readinessClass(score) {
  return clampScore(score) >= 80 ? 'ready' : 'warning';
}
```

Both functions share the concept of a "ready" threshold (currently `>= 80`). If
you raise or lower that value, update the numeric literal in **both** functions
and update the assertions in `src/app.test.mjs` to match the new expected behavior.
