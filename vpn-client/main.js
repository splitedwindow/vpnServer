console.log('DEBUG process.type:', process.type, '| electron ver:', process.versions && process.versions.electron);
const _e = require('electron');
console.log('DEBUG typeof electron:', typeof _e, '| is object:', typeof _e === 'object');
const { app, BrowserWindow, ipcMain } = _e;
const { execFile } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const VPN_NAME = 'DiplomaVPN';
const VPN_SERVER = '94.231.178.181';
const VPN_PSK = 'RomVPN262006!';
const VPN_USER = 'john';
const VPN_PASS = 'john123';

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

ipcMain.handle('vpn:connect', async () => {
  try {
    sendState('Connecting', 'Setting up VPN profile...');

    await runPS(`
$conn = Get-VpnConnection -Name '${VPN_NAME}' -ErrorAction SilentlyContinue
if (-not $conn) {
  Add-VpnConnection \`
    -Name '${VPN_NAME}' \`
    -ServerAddress '${VPN_SERVER}' \`
    -TunnelType L2tp \`
    -L2tpPsk '${VPN_PSK}' \`
    -AuthenticationMethod MSChapv2 \`
    -EncryptionLevel Optional \`
    -RememberCredential \`
    -Force
}
`);

    sendState('Connecting', 'Establishing connection...');
    await runRasDial([VPN_NAME, VPN_USER, VPN_PASS]);

    sendState('Connected', 'Connected to VPN');
    return { success: true };
  } catch (err) {
    sendState('Disconnected', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('vpn:disconnect', async () => {
  try {
    sendState('Disconnecting', 'Disconnecting...');
    await runRasDial([VPN_NAME, '/disconnect']);
    sendState('Disconnected', 'Disconnected from VPN');
    return { success: true };
  } catch (err) {
    sendState('Disconnected', 'Disconnected');
    return { success: false, error: err.message };
  }
});

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
