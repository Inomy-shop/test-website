export function resolveInitialTheme({ stored, prefersDark }) {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(current) {
  return current === 'dark' ? 'light' : 'dark';
}

export function themeButtonLabel(current) {
  return current === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
}

export function themeButtonPressed(current) {
  return current === 'dark' ? 'true' : 'false';
}

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

function bindThemeToggle() {
  const toggle = document.querySelector('#theme-toggle');
  if (!toggle) return;

  let current = document.documentElement.dataset.theme || 'light';
  toggle.textContent = themeButtonLabel(current);
  toggle.setAttribute('aria-pressed', themeButtonPressed(current));

  toggle.addEventListener('click', () => {
    current = nextTheme(current);
    document.documentElement.dataset.theme = current;
    toggle.textContent = themeButtonLabel(current);
    toggle.setAttribute('aria-pressed', themeButtonPressed(current));
    try {
      localStorage.setItem('tw-theme', current);
    } catch {
      console.warn('theme persistence unavailable');
    }
  });
}

if (typeof document !== 'undefined') {
  bindReadinessWidget();
  bindThemeToggle();
}
