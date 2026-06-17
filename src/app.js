// ── Theme support ────────────────────────────────────────────────────────────

export const THEME_STORAGE_KEY = 'tw.theme';

/**
 * Read the stored theme preference from localStorage.
 * Returns null if missing, invalid, or storage throws.
 * @param {Storage} [storage]
 * @returns {"light" | "dark" | null}
 */
export function readStoredTheme(storage) {
  try {
    const store = storage ?? window.localStorage;
    const val = store.getItem(THEME_STORAGE_KEY);
    if (val === 'light' || val === 'dark') return val;
    return null;
  } catch {
    return null;
  }
}

/**
 * Returns the OS/browser preferred color scheme.
 * @param {{ matches: boolean } | null} [mq]
 * @returns {"light" | "dark"}
 */
export function systemPreferredTheme(mq) {
  try {
    const media = mq ?? (typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null);
    return media && media.matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Resolve the theme to apply on first load.
 * Stored preference wins; falls back to system preference.
 * @param {{ read?: () => ("light"|"dark"|null), system?: () => ("light"|"dark") }} [deps]
 * @returns {"light" | "dark"}
 */
export function resolveInitialTheme(deps) {
  const read = deps?.read ?? readStoredTheme;
  const system = deps?.system ?? systemPreferredTheme;
  return read() ?? system();
}

/**
 * Apply a theme to the document and persist the choice.
 * @param {"light" | "dark"} theme
 * @param {Document} [doc]
 * @param {Storage} [storage]
 */
export function applyTheme(theme, doc, storage) {
  const d = doc ?? (typeof document !== 'undefined' ? document : null);
  if (d) d.documentElement.dataset.theme = theme;
  try {
    const store = storage ?? window.localStorage;
    store.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // persistence unavailable — theme still applied in-memory
  }
}

/**
 * Resolve and apply the initial theme. Returns the theme that was applied.
 * @returns {"light" | "dark"}
 */
export function initTheme() {
  const theme = resolveInitialTheme();
  applyTheme(theme);
  return theme;
}

/** Wire the #theme-toggle button. No-op if the button is absent. */
function bindThemeToggle() {
  const btn = document.querySelector('#theme-toggle');
  if (!btn) return;

  const update = (theme) => {
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    btn.textContent = theme === 'dark' ? '☀' : '🌙';
  };

  // Sync button state with whatever initTheme() already applied.
  const initial = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  update(initial);

  btn.addEventListener('click', () => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    update(next);
  });
}

// ── End theme support ────────────────────────────────────────────────────────

export function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function readinessMessage(score) {
  const clamped = clampScore(score);
  if (clamped >= 80) return 'Ready for onboarding.';
  if (clamped >= 50) return 'Almost ready. Review the remaining setup.';
  return 'Needs attention before the first workflow.';
}

export function readinessClass(score) {
  return clampScore(score) >= 80 ? 'ready' : 'warning';
}

function bindReadinessWidget() {
  const input = document.querySelector('#score-input');
  const button = document.querySelector('#score-button');
  const message = document.querySelector('#score-message');

  if (!(input instanceof HTMLInputElement) || !button || !message) return;

  const update = () => {
    const score = clampScore(input.value);
    input.value = String(score);
    message.textContent = readinessMessage(score);
    message.classList.remove('ready', 'warning');
    message.classList.add(readinessClass(score));
  };

  button.addEventListener('click', update);
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter') update();
  });

  update();
}

if (typeof document !== 'undefined') {
  initTheme();
  bindThemeToggle();
  bindReadinessWidget();
}
