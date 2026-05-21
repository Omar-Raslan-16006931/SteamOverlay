const {
  app, BrowserWindow, ipcMain,
  desktopCapturer, globalShortcut, screen
} = require('electron');
const path = require('path');
const { Worker } = require('worker_threads');

let controllerWin = null, overlayWin = null, locked = false;
let scanTimer = null, activeSource = null;
let fromCurrency = 'UAH', toCurrency = 'SAR';
let ratesCache = {}, ocrWorker = null, workerBusy = false;

async function loadRates(base) {
  try {
    const r = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const d = await r.json();
    if (d?.result === 'success' && d.rates) ratesCache = d.rates;
  } catch {}
}

function convertAmount(amount, from, to) {
  if (from === to) return amount;
  if (!ratesCache[from] || !ratesCache[to]) return null;
  return (amount / ratesCache[from]) * ratesCache[to];
}

function createController() {
  controllerWin = new BrowserWindow({
    width: 420, height: 480, minWidth: 360, minHeight: 440,
    frame: false, transparent: true, resizable: true,
    alwaysOnTop: true, hasShadow: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false }
  });
  controllerWin.setAlwaysOnTop(true, 'screen-saver');
  controllerWin.loadFile('index.html');
}

function createOverlay() {
  const { x, y, width, height } = screen.getPrimaryDisplay().bounds;
  overlayWin = new BrowserWindow({
    x, y, width, height,
    frame: false, transparent: true, resizable: false, movable: false,
    alwaysOnTop: true, focusable: false, skipTaskbar: true, hasShadow: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, zoomFactor: 1.0 }
  });
  overlayWin.setIgnoreMouseEvents(true, { forward: true });
  overlayWin.setAlwaysOnTop(true, 'screen-saver');
  overlayWin.webContents.setZoomFactor(1.0);
  overlayWin.loadFile('overlay.html');
}

function spawnOcrWorker() {
  if (ocrWorker) return;
  ocrWorker = new Worker(path.join(__dirname, 'ocr-worker.js'));
  ocrWorker.on('message', ({ items, error }) => {
    workerBusy = false;
    if (error) { controllerWin?.webContents.send('scan-state', { scanning: false, error }); return; }
    const converted = items
      .map(it => { const val = convertAmount(it.amount, it.code, toCurrency); return val != null ? { x: it.x, y: it.y, text: `${toCurrency} ${val.toFixed(2)}` } : null; })
      .filter(Boolean);
    overlayWin?.webContents.send('overlay-update', { items: converted });
    controllerWin?.webContents.send('scan-state', { scanning: true, count: converted.length });
  });
  ocrWorker.on('error', e => console.error('OCR worker:', e));
}

async function doScan() {
  if (!activeSource || !overlayWin || workerBusy) return;
  const display  = screen.getPrimaryDisplay();
  // Capture at LOGICAL pixel size — Tesseract bboxes will directly map to CSS px
  const logicalW = display.bounds.width;
  const logicalH = display.bounds.height;
  let sources;
  try {
    sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: logicalW, height: logicalH }
    });
  } catch { return; }
  const src = sources.find(s => s.id === activeSource);
  if (!src) return;
  workerBusy = true;
  ocrWorker.postMessage({
    imgData: src.thumbnail.toDataURL(),
    imgW: src.thumbnail.getSize().width,
    imgH: src.thumbnail.getSize().height,
    logicalW, logicalH, fromCurrency
  });
}

ipcMain.handle('list-sources', async () => {
  const list = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 240, height: 135 } });
  return list.map(s => ({ id: s.id, name: s.name }));
});
ipcMain.handle('select-source', async (_, id) => {
  activeSource = id;
  if (scanTimer) clearInterval(scanTimer);
  await loadRates(fromCurrency);
  spawnOcrWorker(); doScan();
  scanTimer = setInterval(doScan, 2000);
  return true;
});
ipcMain.handle('stop-scan', () => {
  if (scanTimer) { clearInterval(scanTimer); scanTimer = null; }
  activeSource = null; workerBusy = false;
  overlayWin?.webContents.send('overlay-update', { items: [] });
  return true;
});
ipcMain.handle('set-target-currency', (_, c) => { toCurrency = c; return c; });
ipcMain.handle('set-from-currency',   async (_, c) => { fromCurrency = c; await loadRates(c); return c; });
ipcMain.handle('toggle-lock', () => {
  locked = !locked;
  overlayWin?.setIgnoreMouseEvents(!locked, { forward: true });
  controllerWin?.webContents.send('lock-changed', locked);
  return locked;
});
ipcMain.handle('get-lock',     () => locked);
ipcMain.handle('minimize-app', () => controllerWin?.minimize());
ipcMain.handle('close-app',    () => app.quit());

app.whenReady().then(() => {
  createController(); createOverlay();
  globalShortcut.register('CommandOrControl+Shift+O', () =>
    controllerWin?.isVisible() ? controllerWin.hide() : controllerWin?.show());
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    locked = !locked;
    overlayWin?.setIgnoreMouseEvents(!locked, { forward: true });
    controllerWin?.webContents.send('lock-changed', locked);
  });
});
app.on('will-quit', () => {
  if (scanTimer) clearInterval(scanTimer);
  globalShortcut.unregisterAll();
  try { ocrWorker?.terminate(); } catch {}
});