export function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function readinessMessage(score) {
  const clamped = clampScore(score);
  if (clamped >= 80) return 'Ready for onboarding.';
  if (clamped >= 51) return 'Almost ready. Review the remaining setup.';
  if (clamped === 50) return 'Right on the edge. Complete one more setup step to be ready.';
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
  bindReadinessWidget();
}
