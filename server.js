const express = require("express");
const ejs = require("ejs");
const request = require("superagent");
const memoryCache = require("memory-cache");
const server = express();

//设置模板引擎 ejs
server.set("view engine", "ejs");
//设置静态文件目录
server.use("/public", express.static("public"));

//缓存中间件
let cache = ( duration )=>{
    return (req, res, next) =>{
        //把url当做key存储
        let key = req.originalUrl || req.url;
        let cacheData = memoryCache.get(key);
        if( cacheData ){
            //内存中存在 => 取内存中的
            console.log("来自缓存");
            res.send(cacheData);
            return;
        }
        else{
            //无内存数据 => 缓存起来，继续下一个请求
            request
                .post(`https://www.easy-mock.com/mock/5c7755477163345f2e2eccbd/xcx${key}`)
								.set('Content-Type', 'application/json')
                .then(data =>{
                    console.log("来自api接口");		//以对象形式存入
                    memoryCache.put(key, data.body, duration * 1000);
										res.send(data.body);
                })
          next();
        }
    }
}

//首页
server.get("/", (req, res) => {
    //res.send("ok!");
    res.render("index", {
        name: "Danny",
        sex: "男",
        content: "前端码农，好好学习，天天编程！",
        date: new Date()
    })
})

//getStoreLists 接口
server.post("/getStoreLists", cache(5), (req, res) => {
	console.log("ok!");
})

server.listen(3001, () => {
    console.log("server is listening... 3001端口");
})