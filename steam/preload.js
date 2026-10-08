// Мост для меню игры: кнопки «Во весь экран» и «Выйти из игры».
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('desktop', {
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  quit: () => ipcRenderer.send('quit')
});
