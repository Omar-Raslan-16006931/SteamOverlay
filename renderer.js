const uahInput = document.getElementById('uahInput');
const sarInput = document.getElementById('sarInput');
const rateInput = document.getElementById('rateInput');
const lockBtn = document.getElementById('lockBtn');
const minBtn = document.getElementById('minBtn');
const closeBtn = document.getElementById('closeBtn');

function update() {
  const uah = parseFloat(uahInput.value || '0');
  const rate = parseFloat(rateInput.value || '0');
  sarInput.value = uah && rate ? (uah * rate).toFixed(2) : '';
}

uahInput.addEventListener('input', update);
rateInput.addEventListener('input', update);

lockBtn.addEventListener('click', async () => {
  const locked = await window.api.toggleLock();
  lockBtn.textContent = locked ? 'Unlock' : 'Lock';
});

minBtn.addEventListener('click', () => window.api.minimize());
closeBtn.addEventListener('click', () => window.api.close());

window.api.onLockChanged((locked) => {
  lockBtn.textContent = locked ? 'Unlock' : 'Lock';
});

window.addEventListener('DOMContentLoaded', async () => {
  lockBtn.textContent = (await window.api.getLock()) ? 'Unlock' : 'Lock';
  update();
});