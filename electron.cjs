const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const path = require('path');


const Store = require('electron-store').default;
const store = new Store();


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const fs = require("fs");

const port = Number(
    fs.readFileSync("port.js", "utf8")
        .match(/\d+/)[0]
);



fs.watch("port.js", () => {
    const port = Number(
        fs.readFileSync("port.js", "utf8")
            .match(/\d+/)[0]
    );

    loadUrl(port);
});


let win; 

const loadUrl = (port) => {
    const url = `http://localhost:${port}`;
    win.loadURL(url);
}


app.whenReady().then(() => {
    win = new BrowserWindow({
        title: 'SpaceCAD',
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    ipcMain.on('store-get', (event, key) => {
        event.returnValue = store.get(key);
    });

    ipcMain.on('store-set', (event, { key, value }) => {
        store.set(key, value);
        event.returnValue = value;
    });

    ipcMain.on('set-title', (event, title) => {
        BrowserWindow.fromWebContents(event.sender).setTitle(`SpaceCAD${title ? ` - ${title}` : ''}`);
    });
    ipcMain.handle('open-file', async () => {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
                { name: "SpaceCAD", extensions: ["spacecad.js"] }
            ]   
        });

        if (result.canceled)
            return null;

        return result.filePaths[0];
    });
});