import electron from 'electron';
console.log("electron.js iniciou");
const { app: electronApp, BrowserWindow, dialog, ipcMain, Menu, shell } = electron;

import path from 'path';

import Store from 'electron-store';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

import fs from 'fs';





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



let storage;
electronApp.whenReady().then(async () => {
    process.env.USER_DATA_PATH = electronApp.getPath("userData");

    storage = (await import("./lib/storage.js")).default;

    const store = new Store({
        projectName: 'SpaceCAD'
    });
    Menu.setApplicationMenu(null);

    win = new BrowserWindow({
        title: 'SpaceCAD',
        icon: path.join(__dirname, 'assets/icon.ico'),
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

    
 
    httpServer.listen(0, () => {
        const port = httpServer.address().port;
        loadUrl(port);

        console.log(`Server is running\nhttp://localhost:${port}`); 
    });
});



electronApp.on("before-quit", () => {
    httpServer.close();
}); 




import open from "open";
import { execFile } from "child_process";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";


const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => { 
    console.log("a user connected");

    socket.on("req", (data) => {
        console.log(data);
    });

    
});


const routesPath = path.join(__dirname, "src", "routes");

app.use(express.static(routesPath));
app.use(express.json());
app.use(
    "/node_modules",
    express.static(path.join(__dirname, "node_modules"))
);
app.use(
    "/lib",
    express.static(path.join(__dirname, "lib"))
);
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.get("/", (req, res) => {
    res.sendFile("index.html", {
        root: routesPath
    });
});


const file404 = (message, path) => {
    io.emit("warn", {
        error: 404,
        path,
        message
    });
}

let watchTimeout = null;
let fileWatcher = null;
let watchFile = {};
const watchFilePath = (filePath) => {
    cancelWatch();

    if(!fs.existsSync(filePath)){
        console.log("FILE NO EXIST")
        file404( `File does not exist: "${filePath}"`, filePath);
        watchFile = {};
        return ""; 
    }


    watchFile = {
        path: filePath
    }
    fileWatcher = fs.watch(filePath, (event, filename) => {
        if (event !== "change")
            return;

        clearTimeout(watchTimeout);

        watchTimeout = setTimeout(() => {
            const content = fs.readFileSync(filePath, "utf8");

            watchFile = {
                event,
                path: filePath,
                content
            }

            io.emit("fileChanged", watchFile);
        }, 1000);
    });

    return fs.readFileSync(filePath).toString();
};

const cancelWatch = () => {
    if (!fileWatcher)
        return "";

    fileWatcher.close();
    fileWatcher = null;

    return "";
};
app.post("/watchFile", (req, res) => {
    const path = req.body.path;

    
    const text = watchFilePath(path);

    res.send(text);
});
app.get("/removeWatcher", (req, res) => {
    cancelWatch();
    res.send("file")
});
app.get("/version", (req, res) => {
    const v = JSON.parse(fs.readFileSync(path.join(__dirname, "version.json"), "utf8"));
   
    res.json(v);
});


const candidates = [
    path.join(process.env.LOCALAPPDATA, "Programs", "Microsoft VS Code", "Code.exe"),
    path.join(process.env.PROGRAMFILES, "Microsoft VS Code", "Code.exe")
];
const vscode = candidates.find(fs.existsSync);

app.post("/openPath", (req, res) => {
    const directory = req.body.directory ?? false;
    let reqPath = req.body.path;

    if(directory){
        reqPath = path.dirname(reqPath);
        open(reqPath);
    }

    if(fs.existsSync(reqPath))
        if(vscode)
            execFile(vscode, [reqPath]);
        else
            console.error("VSCode not found");
    else
        file404(`File does not exist: "${reqPath}"`, reqPath);
        //io.emit("warn", `File does not exist: "${reqPath}"`);

    res.send("ok");
});

app.post("/renameFile", (req, res) => {
    let name = req.body.name;
    const filePath = req.body.path;

    if(!name || !filePath) {
        io.emit("warn", `File does not exist or name not provided: name: "${name}", path: "${filePath}"`);
        res.status(400).send("error");
        return;
    }

    name = name + ".spacecad.js";

    const newPath = path.dirname(filePath) + "/" + name;

    if(fs.existsSync(newPath)){
        io.emit("warn", `File already exists: "${newPath}"`);
        res.status(400).send("error");
        return;
    }

    fs.renameSync(filePath, newPath);
    
    io.emit("fileRename", {
        newName: name,
        oldPath: filePath,
        newPath
    });


    if(watchFile.path === filePath){
        const text = watchFilePath(newPath);
        res.send(text);
    }


    res.send("ok")

        
});

app.post("/createFile", (req, res) => {
    const name = req.body.name;
    const dirPath = req.body.path;

    if(!fs.existsSync(dirPath)) {
        io.emit("warn", `Directory does not exist: "${dirPath}"`);
        res.status(400).send("error");
        return;
    }

    const fullPath = path.join(dirPath, name + ".spacecad.js");

    if(fs.existsSync(fullPath)){
        io.emit("warn", `File already exists: "${fullPath}"`);
        res.status(400).send("error");
        return;
    }

    fs.writeFileSync(fullPath, "");
    res.json({
        path: fullPath,
        fullName: path.basename(fullPath),
        name: path.basename(fullPath, ".spacecad.js")
    });
});


const setupStorage = () => {
    if(storage.classes === undefined)
        storage.classes = {};

    if(storage.lib === undefined)
        storage.lib = {};
}
app.post("/store/:type", (req, res) => {
    const type = req.params.type;

    setupStorage();
    if(type === "class"){
        const {name, dependencies, classBody, usage, preload} = req.body;
        

        if(storage.classes[name] !== undefined)
            io.emit("warn", `SpaceCAD Module "${name}" will be overwritten.`);

        storage.classes[name] = {
            dependencies,
            classBody,
            usage,
            preload
        };

        res.send("ok");
    } else if(type === "lib"){
        const {name, lib, usage, preload}  = req.body;

        if(storage.lib[name] !== undefined)
            io.emit("warn", `SpaceCAD Library "${name}" will be overwritten.`);

        storage.lib[name] = {
            lib,
            usage,
            preload
        };

        res.send("ok");
    }
});
app.get("/store/:type/:name", (req, res) => {
    const type = req.params.type;
    const name = req.params.name;

    setupStorage();
    if(type === "class"){

        if(storage.classes[name] === undefined)
            res.status(404).send(`Module not found: ${name}`);

        res.json(storage.classes[name]);
    } else if(type === "classes") {
        res.json(storage.classes);

    } else if(type === "lib"){

        if(storage.lib[name] === undefined)
            res.status(404).send(`Library not found: ${name}`);

        res.json(storage.lib[name]);
    } else if(type === "libs") {
        res.json(storage.lib);
    }
})

const isDirSync = path => {
    try {
        return fs.statSync(path).isDirectory();
    } catch {
        return false;
    }
};
app.post("/use", (req, res) => {
    let filePath = req.body.path;

    if(typeof filePath !== 'string')
        return res.status(400).send("filePath must be a string");

    if(isDirSync(filePath))
        filePath += "/index.spacecad.js";

    filePath = !filePath.endsWith(".spacecad.js")?
        filePath + ".spacecad.js" :
        filePath;

    filePath = path.resolve(
        path.dirname(watchFile.path || ""),
        filePath
    );

        console.log(watchFile, filePath);

    if(!fs.existsSync(filePath))
        return res.status(404).send(`File not found: "${filePath}"`);

    const text = fs.readFileSync(filePath, "utf8");
    res.send(text);     
});

app.post("/getFile/:type", (req, res) => {
    const type = req.params.type;
    const filePath = req.body.path;

    if (typeof filePath !== 'string')
        return res.status(400).send("filePath must be a string");


    let fixedPath = type === "server"?
        path.resolve(__dirname, filePath) :
        path.resolve(path.dirname(watchFile.path || ""), filePath);
    
    if(!fs.existsSync(fixedPath))
        return res.status(404).send(`File not found: "${fixedPath}"`);

    res.sendFile(fixedPath);        
}); 



app.post("/serverScope", (req, res) => {
    const code = req.body.code;
    const ret = eval(code);

    console.log(ret);

    res.send(ret);
});