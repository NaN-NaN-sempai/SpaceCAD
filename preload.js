const { contextBridge, ipcRenderer, webUtils  } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFile: () => ipcRenderer.invoke('open-file'),
    setTitle: (title) => ipcRenderer.send('set-title', title),
    getFilePath: file => webUtils.getPathForFile(file),
    isFullscreen: () => ipcRenderer.invoke("is-fullscreen"),
    onFullscreen: (callback) =>
        ipcRenderer.on('fullscreen', (_, value) => callback(value))
});
contextBridge.exposeInMainWorld('electronStoreOG', {
    get: key => ipcRenderer.sendSync('store-get', key),

    set: (key, value) => {
        ipcRenderer.send('store-set', { key, value });
    }
});
contextBridge.exposeInMainWorld('electronStoreAPI', {
    get: key => ipcRenderer.sendSync('store-get', key),
    set: (key, value) => ipcRenderer.send('store-set', { key, value })
});

contextBridge.exposeInMainWorld('titlbar', {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close')
});