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

/**
 * Pure helper – determines the initial theme without touching the DOM.
 * @param {string|null} savedValue  – value from localStorage (or null/undefined if absent)
 * @param {boolean}     prefersDark – true when the OS prefers a dark color scheme
 * @returns {'light'|'dark'}
 */
export function getInitialTheme(savedValue, prefersDark) {
  if (savedValue === 'dark' || savedValue === 'light') return savedValue;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const btn = document.querySelector('#theme-toggle');
  if (!btn) return;
  const isDark = theme === 'dark';
  btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

function bindThemeToggle() {
  const btn = document.querySelector('#theme-toggle');
  if (!btn) return;

  const savedValue = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(getInitialTheme(savedValue, prefersDark));

  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
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
  bindThemeToggle();
  bindReadinessWidget();
}
