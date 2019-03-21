const express = require("express");
const ejs = require("ejs");
const server = express();

//设置模板引擎 ejs
server.set("view engine", "ejs");
//设置静态文件目录
server.use("/public", express.static("/public"));

server.get("/", (req, res) => {
    res.send("ok!");
})

server.listen(3000, () => {
    console.log("server is listening... 3000端口");
})