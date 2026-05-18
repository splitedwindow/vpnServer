const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vpn', {
  connect: (username, password) => ipcRenderer.invoke('vpn:connect', { username, password }),
  disconnect: () => ipcRenderer.invoke('vpn:disconnect'),
  getStatus: () => ipcRenderer.invoke('vpn:status'),
  onState: (cb) => ipcRenderer.on('vpn:state', (_, data) => cb(data)),
  minimize: () => ipcRenderer.send('win:minimize'),
  close: () => ipcRenderer.send('win:close'),
});

contextBridge.exposeInMainWorld('updater', {
  onStatus:   (cb) => ipcRenderer.on('updater:status', (_, d) => cb(d)),
  installNow: ()   => ipcRenderer.send('updater:install-now'),
});

contextBridge.exposeInMainWorld('auth', {
  load:              ()      => ipcRenderer.invoke('auth:load'),
  save:              (data)  => ipcRenderer.invoke('auth:save', data),
  clear:             ()      => ipcRenderer.invoke('auth:clear'),
  openBrowser:       ()      => ipcRenderer.invoke('auth:open-browser'),
  getBackendUrl:     ()      => ipcRenderer.invoke('config:backend-url'),
  onSessionReceived: (cb)    => ipcRenderer.on('auth:session-received', (_, d) => cb(d)),
});
