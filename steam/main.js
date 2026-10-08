// Настольная оболочка для Steam: одно окно с index.html, без меню и без сети.
const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

// В Steam на Linux chrome-sandbox не получает setuid, без этого флага Electron не стартует.
if (process.platform === 'linux') app.commandLine.appendSwitch('no-sandbox');
if (!app.requestSingleInstanceLock()) app.quit();
Menu.setApplicationMenu(null);

let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1600, height: 1000, minWidth: 960, minHeight: 640,
    fullscreen: true, show: false, backgroundColor: '#0b0908',
    title: 'Красная нить',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, sandbox: true, nodeIntegration: false }
  });
  win.once('ready-to-show', () => win.show());
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // F11 и Alt+Enter переключают полноэкранный режим.
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.key === 'F11' || (input.alt && input.key === 'Enter'))) {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', e => e.preventDefault());
}

ipcMain.on('toggle-fullscreen', () => win && win.setFullScreen(!win.isFullScreen()));
ipcMain.on('quit', () => app.quit());
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
