const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let win;
let locked = false;

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 430,
    height: 400,
    minWidth: 360,
    minHeight: 320,
    frame: false,
    transparent: true,
    resizable: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile('index.html');

  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (!win) return;
    if (win.isVisible()) win.hide();
    else {
      win.show();
      win.focus();
    }
  });

  globalShortcut.register('CommandOrControl+Shift+L', () => {
    locked = !locked;
    if (win) {
      win.setIgnoreMouseEvents(locked, { forward: true });
      win.webContents.send('lock-changed', locked);
    }
  });
});

ipcMain.handle('toggle-lock', () => {
  locked = !locked;
  if (win) {
    win.setIgnoreMouseEvents(locked, { forward: true });
    win.webContents.send('lock-changed', locked);
  }
  return locked;
});

ipcMain.handle('get-lock', () => locked);
ipcMain.handle('close-app', () => app.quit());
ipcMain.handle('minimize-app', () => win.minimize());

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});