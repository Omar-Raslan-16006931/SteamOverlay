const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  listSources:       ()     => ipcRenderer.invoke('list-sources'),
  selectSource:      (id)   => ipcRenderer.invoke('select-source', id),
  stopScan:          ()     => ipcRenderer.invoke('stop-scan'),
  setTargetCurrency: (code) => ipcRenderer.invoke('set-target-currency', code),
  setFromCurrency:   (code) => ipcRenderer.invoke('set-from-currency', code),
  toggleLock:        ()     => ipcRenderer.invoke('toggle-lock'),
  getLock:           ()     => ipcRenderer.invoke('get-lock'),
  minimize:          ()     => ipcRenderer.invoke('minimize-app'),
  close:             ()     => ipcRenderer.invoke('close-app'),
  onLock:          (cb) => ipcRenderer.on('lock-changed',   (_, v) => cb(v)),
  onScanState:     (cb) => ipcRenderer.on('scan-state',     (_, v) => cb(v)),
  onOverlayUpdate: (cb) => ipcRenderer.on('overlay-update', (_, v) => cb(v))
});