const {app, BrowserWindow, dialog, ipcMain, Menu, shell} = require('electron');
const path = require('path');


const Store = require('electron-store').default;
const store = new Store();


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

const fs = require("fs");
const { spawn } = require('child_process');



const watchport = () => {
    if(fs.existsSync("port.js"))
        fs.watch("port.js", () => {
            const port = Number(
                fs.readFileSync("port.js", "utf8")
                    .match(/\d+/)[0]
            );

            loadUrl(port);
        });
    else
        setTimeout(watchport, 1000);
}


let win; 

const loadUrl = (port) => {
    const url = `http://localhost:${port}`;
    win.loadURL(url);
}


app.whenReady().then(() => {
    watchport();
    Menu.setApplicationMenu(null);

    win = new BrowserWindow({
        title: 'SpaceCAD',
        frame: false,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.webContents.on("before-input-event", (event, input) => {
        if (
            (input.control &&
            input.shift &&
            input.key.toLowerCase() === "i") ||
            input.key.toLowerCase() === "f12"
        ) {
            win.webContents.toggleDevTools();
        }

        if(input.key.toLowerCase() === "f11" && input.type === "keyDown")
            win.setFullScreen(!win.isFullScreen());
    });

    ipcMain.on('store-get', (event, key) => {
        event.returnValue = store.get(key);
    });

    ipcMain.on('store-set', (event, { key, value }) => {
        store.set(key, value);
        event.returnValue = value;
    });
    ipcMain.on('window:minimize', () => {
        win.minimize();
    });
    win.on('enter-full-screen', () => {
        win.webContents.send('fullscreen', true);
    });

    win.on('leave-full-screen', () => {
        win.webContents.send('fullscreen', false);
    });
    ipcMain.handle("is-fullscreen", () => {
        return win.isFullScreen();
    });

    ipcMain.on('window:maximize', () => {
        if (win.isMaximized())
            win.unmaximize();
        else
            win.maximize();
    });
    ipcMain.handle('open-url', (event, url) => {
        shell.openExternal(url);
    });

    ipcMain.on('window:close', () => {
        win.close();
    });

    ipcMain.on('set-title', (event, title) => {
        BrowserWindow.fromWebContents(event.sender).setTitle(`SpaceCAD${title ? ` - ${title}` : ''}`);
    });
    ipcMain.handle('open-file', async (event, extensions = ["spacecad.js"], content = false) => {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
                { name: "SpaceCAD", extensions }
            ]   
        });

        if (result.canceled)
            return null;

        if(content)
            return {
                path: result.filePaths[0],
                content: fs.readFileSync(result.filePaths[0], "utf8")
            }
        return result.filePaths[0];
    });

    ipcMain.handle("select-directory", async () => {
        const result = await dialog.showOpenDialog(win, {
            properties: ["openDirectory"]
        });

        return result.canceled ? null : result.filePaths[0];
    });
});



app.on("before-quit", () => {
    server.kill();
}); 

const server = spawn("npx.cmd", [app.isPackaged ? "node" : "nodemon", "server.js"], {
    env: {
        ...process.env,
        USER_DATA_PATH: app.getPath('userData')
    },
    stdio: 'inherit',
        shell: true
});