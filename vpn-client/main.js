const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { execFile } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const VPN_NAME    = 'DiplomaVPN';
const VPN_PSK     = process.env.VPN_PSK    || 'RomVPN262006!';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

let _vpnServerCache = null;
async function getVpnServer() {
  if (_vpnServerCache) return _vpnServerCache;
  try {
    const res  = await fetch(`${BACKEND_URL}/api/config/vpn`);
    const data = await res.json();
    if (data.success && data.data && data.data.server) {
      _vpnServerCache = data.data.server;
      return _vpnServerCache;
    }
  } catch (_) {}
  return process.env.VPN_SERVER || '94.231.178.181';
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();

app.on('second-instance', (_event, argv) => {
  const url = argv.find(a => a.startsWith('diplomavpn://'));
  if (url) handleDeepLink(url);
  if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

app.setAsDefaultProtocolClient('diplomavpn');

function getSessionPath() {
  return path.join(app.getPath('userData'), 'session.json');
}
function loadSession() {
  try { return JSON.parse(fs.readFileSync(getSessionPath(), 'utf-8')); }
  catch (_) { return null; }
}
function saveSession(data) {
  try { fs.writeFileSync(getSessionPath(), JSON.stringify(data), 'utf-8'); }
  catch (_) {}
}
function clearSession() {
  try { fs.unlinkSync(getSessionPath()); } catch (_) {}
}
function handleDeepLink(url) {
  try {
    const u        = new URL(url);
    const username = u.searchParams.get('user');
    const password = u.searchParams.get('pass');
    const token    = u.searchParams.get('token');
    if (username && password) {
      saveSession({ username, password, token });
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('auth:session-received', { username, password, token });
      }
    }
  } catch (_) {}
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 380,
    height: 600,
    resizable: false,
    frame: false,
    backgroundColor: '#0d0d1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());

ipcMain.on('win:minimize', () => mainWindow && mainWindow.minimize());
ipcMain.on('win:close', () => mainWindow && mainWindow.close());

function sendState(state, message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('vpn:state', { state, message: message || '' });
  }
}

function runPS(script) {
  return new Promise((resolve, reject) => {
    const tmp = path.join(os.tmpdir(), `vpncmd_${Date.now()}.ps1`);
    fs.writeFileSync(tmp, script, 'utf-8');
    execFile(
      'powershell.exe',
      ['-ExecutionPolicy', 'Bypass', '-NonInteractive', '-File', tmp],
      { timeout: 45000 },
      (err, stdout, stderr) => {
        try { fs.unlinkSync(tmp); } catch (_) {}
        if (err) return reject(new Error((stderr || stdout || err.message).trim()));
        resolve(stdout.trim());
      }
    );
  });
}

function runRasDial(args) {
  return new Promise((resolve, reject) => {
    execFile('rasdial', args, { timeout: 45000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error((stdout || stderr || err.message).trim()));
      resolve(stdout.trim());
    });
  });
}

ipcMain.handle('vpn:connect', async (_event, { username, password } = {}) => {
  if (!username || !password) {
    return { success: false, error: 'Введіть логін та пароль' };
  }
  try {
    sendState('Connecting', 'Налаштування VPN профілю...');

    const vpnServer = await getVpnServer();
    await runPS(`
$conn = Get-VpnConnection -Name '${VPN_NAME}' -ErrorAction SilentlyContinue
if (-not $conn) {
  Add-VpnConnection \`
    -Name '${VPN_NAME}' \`
    -ServerAddress '${vpnServer}' \`
    -TunnelType L2tp \`
    -L2tpPsk '${VPN_PSK}' \`
    -AuthenticationMethod MSChapv2 \`
    -EncryptionLevel Optional \`
    -RememberCredential \`
    -Force
}
`);

    sendState('Connecting', 'Встановлення з\'єднання...');
    await runRasDial([VPN_NAME, username, password]);

    sendState('Connected', 'Підключено до VPN');
    return { success: true };
  } catch (err) {
    sendState('Disconnected', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('vpn:disconnect', async () => {
  try {
    sendState('Disconnecting', 'Відключення...');
    await runRasDial([VPN_NAME, '/disconnect']);
    sendState('Disconnected', 'Відключено від VPN');
    return { success: true };
  } catch (err) {
    sendState('Disconnected', 'Відключено');
    return { success: false, error: err.message };
  }
});

ipcMain.handle('auth:load',          ()      => loadSession());
ipcMain.handle('auth:save',          (_, d)  => { saveSession(d); return true; });
ipcMain.handle('auth:clear',         ()      => { clearSession(); return true; });
ipcMain.handle('auth:open-browser',  ()      => shell.openExternal(`${BACKEND_URL}/login`));
ipcMain.handle('config:backend-url', ()      => BACKEND_URL);

ipcMain.handle('vpn:status', async () => {
  try {
    const out = await runPS(`
$c = Get-VpnConnection -Name '${VPN_NAME}' -ErrorAction SilentlyContinue
if ($c) { Write-Output $c.ConnectionStatus } else { Write-Output 'Disconnected' }
`);
    return { status: out };
  } catch (_) {
    return { status: 'Disconnected' };
  }
});
