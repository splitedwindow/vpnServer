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

const loginScreen        = document.getElementById('loginScreen');
const subscriptionScreen = document.getElementById('subscriptionScreen');
const appScreen          = document.getElementById('app');
const inputUsername      = document.getElementById('inputUsername');
const inputPassword      = document.getElementById('inputPassword');
const loginBtn           = document.getElementById('loginBtn');
const loginError         = document.getElementById('loginError');
const browserLoginBtn    = document.getElementById('browserLoginBtn');
const trialBtn           = document.getElementById('trialBtn');
const premiumBtn         = document.getElementById('premiumBtn');
const subError           = document.getElementById('subError');
const subUsername        = document.getElementById('subUsername');
const logoutBtn          = document.getElementById('logoutBtn');

btnMin.addEventListener('click',   () => window.vpn.minimize());
btnClose.addEventListener('click', () => window.vpn.close());

let isConnected     = false;
let isBusy          = false;
let currentUsername = '';
let currentPassword = '';
let currentToken    = '';
let backendUrl      = 'http://94.231.178.180:3000';

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

function showScreen(name) {
  loginScreen.style.display        = 'none';
  subscriptionScreen.style.display = 'none';
  appScreen.style.display          = 'none';
  if (name === 'login') {
    loginScreen.style.display = 'flex';
  } else if (name === 'subscription') {
    subscriptionScreen.style.display = 'flex';
  } else if (name === 'app') {
    appScreen.style.display = 'flex';
    window.vpn.getStatus().then(({ status }) => {
      applyState(status === 'Connected' ? 'Connected' : 'Disconnected');
      addLog(status === 'Connected' ? 'VPN вже підключено' : 'Готово до підключення');
    });
  }
}

async function checkSubscription() {
  if (!currentToken) { showScreen('app'); return; }
  try {
    const res  = await fetch(
      `${backendUrl}/api/subscriptions/user/${encodeURIComponent(currentUsername)}/active`,
      { headers: { Authorization: `Bearer ${currentToken}` } }
    );
    const data = await res.json();
    if (data.success && data.data) {
      showScreen('app');
    } else {
      if (subUsername) subUsername.textContent = currentUsername;
      showScreen('subscription');
    }
  } catch (_) {
    showScreen('app');
  }
}

loginBtn.addEventListener('click', async () => {
  const username = inputUsername.value.trim();
  const password = inputPassword.value;
  if (!username || !password) { loginError.textContent = 'Введіть логін та пароль'; return; }

  loginError.textContent   = '';
  loginBtn.disabled        = true;
  loginBtn.textContent     = 'Вхід...';

  try {
    const res  = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!data.success) {
      loginError.textContent = data.error || 'Невірний логін або пароль';
      loginBtn.disabled = false; loginBtn.textContent = 'Увійти';
      return;
    }
    currentUsername = username;
    currentPassword = password;
    currentToken    = data.token;
    await window.auth.save({ username, password, token: data.token });
    await checkSubscription();
  } catch (_) {
    currentUsername = username;
    currentPassword = password;
    showScreen('app');
  }
  loginBtn.disabled = false;
  loginBtn.textContent = 'Увійти';
});

inputPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') loginBtn.click(); });

browserLoginBtn.addEventListener('click', () => window.auth.openBrowser());

window.auth.onSessionReceived(async ({ username, token }) => {
  currentUsername = username;
  currentToken    = token;
  await window.auth.save({ username, token });
  await checkSubscription();
});

trialBtn.addEventListener('click', async () => {
  trialBtn.disabled    = true;
  subError.textContent = '';
  try {
    const res  = await fetch(`${backendUrl}/api/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${currentToken}` },
      body: JSON.stringify({ username: currentUsername, plan: 'trial', duration_days: 14 }),
    });
    const data = await res.json();
    if (data.success) { showScreen('app'); }
    else { subError.textContent = data.error || 'Помилка активації'; }
  } catch (_) {
    subError.textContent = 'Не вдалося підключитися до сервера';
  }
  trialBtn.disabled = false;
});

premiumBtn.addEventListener('click', () => window.auth.openBrowser());

const vpnPassPrompt = document.getElementById('vpnPassPrompt');
const vpnPassInput  = document.getElementById('vpnPassInput');
const vpnPassBtn    = document.getElementById('vpnPassBtn');

async function doConnect() {
  if (isBusy) return;
  if (!currentPassword) {
    vpnPassPrompt.style.display = 'block';
    vpnPassInput.focus();
    return;
  }
  isBusy = true;
  addLog('Ініціалізація підключення...');
  const res = await window.vpn.connect(currentUsername, currentPassword);
  if (!res.success) { addLog(res.error, true); applyState('Disconnected'); }
  isBusy = false;
}

mainBtn.addEventListener('click', async () => {
  if (isBusy) return;
  if (!isConnected) {
    await doConnect();
  } else {
    isBusy = true;
    addLog('Відключення...');
    const res = await window.vpn.disconnect();
    if (!res.success) { addLog(res.error, true); applyState('Disconnected'); }
    isBusy = false;
  }
});

vpnPassBtn.addEventListener('click', async () => {
  const pwd = vpnPassInput.value;
  if (!pwd) return;
  currentPassword = pwd;
  await window.auth.save({ username: currentUsername, token: currentToken, password: currentPassword });
  vpnPassPrompt.style.display = 'none';
  vpnPassInput.value = '';
  await doConnect();
});

vpnPassInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') vpnPassBtn.click(); });

window.vpn.onState(({ state, message }) => {
  applyState(state, message);
  if (message) addLog(message);
});

logoutBtn.addEventListener('click', async () => {
  if (isConnected) await window.vpn.disconnect();
  await window.auth.clear();
  currentUsername = ''; currentPassword = ''; currentToken = '';
  inputUsername.value = ''; inputPassword.value = '';
  showScreen('login');
});

async function init() {
  backendUrl = await window.auth.getBackendUrl();

  try {
    const res = await fetch(`${backendUrl}/api/config/vpn`);
    const cfg = await res.json();
    if (cfg.success && cfg.data && cfg.data.server) {
      document.getElementById('serverLine').innerHTML =
        `${cfg.data.server} &nbsp;·&nbsp; L2TP/IPSec`;
    }
  } catch (_) {}

  const session = await window.auth.load();
  if (session && session.username) {
    currentUsername = session.username;
    currentPassword = session.password || '';
    currentToken    = session.token || '';
    await checkSubscription();
  } else {
    showScreen('login');
  }
}

init();

const updateBanner    = document.getElementById('updateBanner');
const updateBannerText = document.getElementById('updateBannerText');
const updateBannerBtn  = document.getElementById('updateBannerBtn');

window.updater.onStatus(({ event, version, percent }) => {
  if (event === 'available') {
    updateBannerText.textContent = `⬇ Завантаження оновлення v${version}…`;
    updateBanner.style.display = 'flex';
    updateBannerBtn.style.display = 'none';
  } else if (event === 'progress') {
    updateBannerText.textContent = `⬇ Завантаження оновлення… ${percent}%`;
  } else if (event === 'downloaded') {
    updateBannerText.textContent = `✓ Оновлення v${version} готове до встановлення`;
    updateBannerBtn.style.display = '';
    updateBanner.style.display = 'flex';
  }
});

updateBannerBtn.addEventListener('click', () => window.updater.installNow());
