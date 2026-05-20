const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  toggleLock: () => ipcRenderer.invoke('toggle-lock'),
  getLock: () => ipcRenderer.invoke('get-lock'),
  close: () => ipcRenderer.invoke('close-app'),
  minimize: () => ipcRenderer.invoke('minimize-app'),
  onLock: (cb) => ipcRenderer.on('lock-changed', (_, value) => cb(value))
});