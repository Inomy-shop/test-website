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

export function initThemeToggle(opts = {}) {
  // Resolve collaborators — all injectable for tests
  const doc = 'doc' in opts
    ? opts.doc
    : (typeof globalThis !== 'undefined' && globalThis.document ? globalThis.document : null);

  const mql = 'mql' in opts
    ? opts.mql
    : (typeof globalThis !== 'undefined' && typeof globalThis.matchMedia === 'function'
        ? globalThis.matchMedia('(prefers-color-scheme: dark)')
        : null);

  let storage;
  if ('storage' in opts) {
    storage = opts.storage;
  } else {
    try {
      storage = (typeof globalThis !== 'undefined' ? globalThis.localStorage : null) || null;
    } catch (_) {
      storage = null;
    }
  }

  const button = 'button' in opts
    ? opts.button
    : (doc ? doc.querySelector('#theme-toggle') : null);

  // Guard: no document available
  if (!doc) {
    return { destroy() {}, getTheme() { return 'light'; } };
  }

  function safeStorageGet() {
    try {
      const val = storage ? storage.getItem('theme') : null;
      return val === 'light' || val === 'dark' ? val : null;
    } catch (_) {
      return null;
    }
  }

  function osPreference() {
    try {
      return mql && mql.matches ? 'dark' : 'light';
    } catch (_) {
      return 'light';
    }
  }

  function getTheme() {
    const stored = safeStorageGet();
    return stored !== null ? stored : osPreference();
  }

  function setTheme(theme) {
    if (doc.documentElement) {
      doc.documentElement.dataset.theme = theme;
    }
    try {
      if (storage) storage.setItem('theme', theme);
    } catch (_) {}
    if (button) {
      button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  // Set initial aria-pressed state (do NOT call setTheme — no side effects on init)
  if (button) {
    button.setAttribute('aria-pressed', getTheme() === 'dark' ? 'true' : 'false');
  }

  function handleClick() {
    const current = getTheme();
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  if (button) {
    button.addEventListener('click', handleClick);
  }

  return {
    destroy() {
      if (button) button.removeEventListener('click', handleClick);
    },
    getTheme,
  };
}

if (typeof document !== 'undefined') {
  bindReadinessWidget();
  initThemeToggle();
}
