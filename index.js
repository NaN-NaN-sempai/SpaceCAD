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

app.use(express.static("src/routes"));
app.use("/node_modules", express.static("node_modules"));
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./src/routes" });
});

app.get("/api", (req, res) => {
    res.send("API");
});



httpServer.listen(3000, () => {
  console.log(`
    Server is running
    http://localhost:3000
    `); 
}); 