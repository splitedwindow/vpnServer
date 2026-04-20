const btnMin   = document.getElementById('btnMin');
const btnClose = document.getElementById('btnClose');
const mainBtn  = document.getElementById('mainBtn');
const statusDot  = document.getElementById('statusDot');
const statusMain = document.getElementById('statusMain');
const statusSub  = document.getElementById('statusSub');
const shieldGlow = document.getElementById('shieldGlow');
const shieldFill = document.getElementById('shieldFill');
const iconLock   = document.getElementById('iconLock');
const iconCheck  = document.getElementById('iconCheck');
const logEl = document.getElementById('log');

btnMin.addEventListener('click',   () => window.vpn.minimize());
btnClose.addEventListener('click', () => window.vpn.close());

let isConnected = false;
let isBusy = false;

function addLog(msg, isErr) {
  const time = new Date().toLocaleTimeString();
  const row  = document.createElement('div');
  row.className = 'log-row';
  row.innerHTML = `<span class="log-time">${time}</span>`
    + `<span class="log-msg${isErr ? ' log-err' : ''}">${msg}</span>`;
  logEl.appendChild(row);
  logEl.scrollTop = logEl.scrollHeight;
}

function applyState(state, message) {
  statusDot.className  = 'status-indicator';
  shieldGlow.className = 'shield-glow';
  mainBtn.disabled     = false;

  if (state === 'Connected') {
    isConnected = true;
    statusDot.classList.add('connected');
    shieldGlow.classList.add('connected');
    shieldFill.setAttribute('fill', 'url(#gConn)');
    iconLock.setAttribute('opacity',  '0');
    iconCheck.setAttribute('opacity', '1');
    statusMain.textContent = 'Підключено';
    statusSub.textContent  = 'Ваш трафік захищено';
    mainBtn.textContent    = 'Відключитись';
    mainBtn.classList.add('connected');

  } else if (state === 'Connecting') {
    isConnected = false;
    statusDot.classList.add('connecting');
    shieldGlow.classList.add('connecting');
    shieldFill.setAttribute('fill', 'url(#gDisc)');
    iconLock.setAttribute('opacity',  '1');
    iconCheck.setAttribute('opacity', '0');
    statusMain.textContent = 'Підключення…';
    statusSub.textContent  = message || 'Зачекайте будь ласка';
    mainBtn.textContent    = 'Підключення…';
    mainBtn.disabled       = true;
    mainBtn.classList.remove('connected');

  } else if (state === 'Disconnecting') {
    statusDot.classList.add('connecting');
    statusMain.textContent = 'Відключення…';
    statusSub.textContent  = 'Зачекайте будь ласка';
    mainBtn.textContent    = 'Відключення…';
    mainBtn.disabled       = true;
    mainBtn.classList.remove('connected');

  } else {
    isConnected = false;
    shieldFill.setAttribute('fill', 'url(#gDisc)');
    iconLock.setAttribute('opacity',  '1');
    iconCheck.setAttribute('opacity', '0');
    statusMain.textContent = 'Відключено';
    statusSub.textContent  = 'Не підключено до VPN';
    mainBtn.textContent    = 'Підключитись';
    mainBtn.disabled       = false;
    mainBtn.classList.remove('connected');
  }
}

mainBtn.addEventListener('click', async () => {
  if (isBusy) return;
  isBusy = true;

  if (!isConnected) {
    addLog('Ініціалізація підключення...');
    const res = await window.vpn.connect();
    if (!res.success) {
      addLog(res.error, true);
      applyState('Disconnected');
    }
  } else {
    addLog('Відключення...');
    const res = await window.vpn.disconnect();
    if (res.success) {
      applyState('Disconnected', 'Відключено від VPN');
    } else {
      addLog(res.error, true);
      applyState('Disconnected');
    }
  }

  isBusy = false;
});

window.vpn.onState(({ state, message }) => {
  applyState(state, message);
  if (message) addLog(message);
});

window.vpn.getStatus().then(({ status }) => {
  if (status === 'Connected') {
    applyState('Connected');
    addLog('VPN вже підключено');
  } else {
    applyState('Disconnected');
    addLog('Готово до підключення');
  }
});
