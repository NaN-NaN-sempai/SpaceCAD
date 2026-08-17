import electron from 'electron';
const { app, BrowserWindow, dialog, ipcMain } = electron;

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import Store from 'electron-store';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';





import open from "open";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import storage from "./lib/storage.js";

const expressApp = express();
const httpServer = createServer(expressApp);
const io = new Server(httpServer);

io.on("connection", (socket) => { 
    console.log("a user connected");

    socket.on("req", (data) => {
        console.log(data);
    });

    
});


const routesPath = path.join(__dirname, "src", "routes");

expressApp.use(express.static(routesPath));
expressApp.use(express.json());

expressApp.use(
    "/node_modules",
    express.static(path.join(__dirname, "node_modules"))
);

expressApp.use(
    "/lib",
    express.static(path.join(__dirname, "lib"))
);

expressApp.get("/", (req, res) => {
    res.sendFile("index.html", {
        root: routesPath
    });
});

expressApp.get("/test", (req, res) => {
    const base = path.join(__dirname, "node_modules/three");

    const files = [
        "build/three.module.js",
        "examples/jsm/lines/Line2.js",
        "examples/jsm/lines/LineGeometry.js",
        "examples/jsm/lines/LineMaterial.js",
        "examples/jsm/loaders/SVGLoader.js",
        "examples/jsm/environments/RoomEnvironment.js"
    ];

    res.json(files.map(file => ({
        file,
        exists: fs.existsSync(path.join(base, file))
    })));
});


let watchTimeout = null;
let fileWatcher = null;
let watchFile = {};
const watchFilePath = (filePath) => {
    cancelWatch();

    if(!fs.existsSync(filePath)){
        io.emit("warn", `File does not exist: "${filePath}"`);
        watchFile = {};
        return ""; 
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

expressApp.post("/openInEditor", (req, res) => {
    const path = req.body.path;

    if(fs.existsSync(path))
        open(path);
    else
        io.emit("warn", `File does not exist: "${path}"`);

    res.send("ok");
});
expressApp.post("/watchFile", (req, res) => {
    const path = req.body.path;

    
    const text = watchFilePath(path);

    res.send(text);
});
expressApp.get("/removeWatcher", (req, res) => {
    cancelWatch();
    res.send("file")
});


const setupStorage = () => {
    if(storage.classes === undefined)
        storage.classes = {};

    if(storage.lib === undefined)
        storage.lib = {};
}
expressApp.post("/store/:type", (req, res) => {
    const type = req.params.type;

    setupStorage();
    if(type === "class"){
        const {name, dependencies, classBody, usage} = req.body;
        

        if(storage.classes[name] !== undefined)
            io.emit("warn", `SpaceCAD Module "${name}" will be overwritten.`);

        storage.classes[name] = {
            dependencies,
            classBody,
            usage
        };

        res.send("ok");
    } else if(type === "lib"){
        const {name, lib, usage}  = req.body;

        if(storage.lib[name] !== undefined)
            io.emit("warn", `SpaceCAD Library "${name}" will be overwritten.`);

        storage.lib[name] = {
            lib,
            usage
        };

        res.send("ok");
    }
});
expressApp.get("/store/:type/:name", (req, res) => {
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

expressApp.post("/getFile/:type", (req, res) => {
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



expressApp.post("/serverScope", (req, res) => {
    const code = req.body.code;
    const ret = eval(code);

    console.log(ret);

    res.send(ret);
});
 





let win; 

const loadUrl = (port) => {
    const url = `http://localhost:${port}`;
    win.loadURL(url);
}


app.whenReady().then(() => {
    const store = new Store({
        projectName: 'SpaceCAD'
    });

    win = new BrowserWindow({
        title: 'SpaceCAD',
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    
    httpServer.listen(0, () => {
        const port = httpServer.address().port;

        console.log(`Server is running\nhttp://localhost:${port}`);
        
        loadUrl(port)
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