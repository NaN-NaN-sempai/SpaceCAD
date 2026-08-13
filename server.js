import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";

import storage from "./lib/storage.js";

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
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./src/routes" });
});



let watchTimeout = null;
let fileWatcher = null;
const watchFilePath = (filePath) => {
    cancelWatch();

    if(!fs.existsSync(filePath)){
        io.emit("warn", `File does not exist: "${filePath}"`);
        return ""; 
    }

    fileWatcher = fs.watch(filePath, (event, filename) => {
        if (event !== "change")
            return;

        clearTimeout(watchTimeout);

        watchTimeout = setTimeout(() => {
            const content = fs.readFileSync(filePath, "utf8");

            io.emit("fileChanged", {
                event,
                path: filePath,
                content
            });
        }, 50);
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


const setupClasses = () => {
    if(storage.classes === undefined)
        storage.classes = {};
}
app.post("/store/:type", (req, res) => {
    const type = req.params.type;

    if(type === "class"){
        const {name, dependencies, classBody, usage} = req.body;
        
        setupClasses();

        if(storage.classes[name] !== undefined)
            io.emit("warn", `SpaceCAD Module "${name}" will be overwritten.`);

        storage.classes[name] = {
            dependencies,
            classBody,
            usage
        };

        res.send("ok");
    }
});
app.get("/store/:type/:name", (req, res) => {
    const type = req.params.type;
    const name = req.params.name;

    if(type === "class"){
        setupClasses();

        if(storage.classes[name] === undefined)
            res.status(404).send(`Module not found: ${name}`);

        res.json(storage.classes[name]);
    }
})





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