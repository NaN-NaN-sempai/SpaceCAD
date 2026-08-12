const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    openFile: () => ipcRenderer.invoke('open-file'),
    setTitle: (title) => ipcRenderer.send('set-title', title),
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