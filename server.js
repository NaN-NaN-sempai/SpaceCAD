import open from "open";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";


import storage from "./lib/storage.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => { 
    console.log("a user connected");

    socket.on("req", (data) => {
        console.log(data);
    });

    
});


app.use(express.static("src/routes"));
app.use(express.json());
app.use("/node_modules", express.static("node_modules"));
app.use("/lib", express.static("lib"));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./src/routes" });
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
app.post("/watchFile", (req, res) => {
    const path = req.body.path;

    
    const text = watchFilePath(path);

    res.send(text);
});
app.get("/removeWatcher", (req, res) => {
    cancelWatch();
    res.send("file")
});


app.post("/openPath", (req, res) => {
    const directory = req.body.directory ?? false;
    let reqPath = req.body.path;

    if(directory)
        reqPath = path.dirname(reqPath);

    if(fs.existsSync(reqPath))
        open(reqPath);
    else
        io.emit("warn", `File does not exist: "${reqPath}"`);

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
 



httpServer.listen(0, () => {
    const port = httpServer.address().port;

    const code = `${port}`;
    fs.writeFileSync("port.js", code);

    console.log(`Server is running\nhttp://localhost:${port}`); 
});