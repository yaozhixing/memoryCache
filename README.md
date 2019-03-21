# memory-cache api接口放入缓存技术

> memory-cache 是node.js的简单内存缓存，存储于nodeJs服务器线程中另开一个缓存存储空间，但不影响nodejs线程影响。  npm官网有源码介绍  —— [memory-cache](https://www.npmjs.com/package/memory-cache)

#### 适用场景
我有一个界面A，请求了5个api接口，每个数据接口都有后台数据请求数据库返回来的数据，先不说sql多查找，比如加载花费2s。然后我到B页面，也有3个api接口，然后又花了1.5s，此时，我又返回到A页面，大家都知道 js,css,images 都缓存到浏览器中，但是api是不会缓存的，当重新请求到了A页面这5个并发api接口，就面临灾难了，又得花费2s，流量口一多，可能服务器就承受不住了。

本文介绍使用 memory-cache 中间件，如何把这已加载api接口数据缓存在服务器，首次请求从数据库中取，非首次请求都从内存缓存里面去取，减少服务器的请求压力，用户体验也提升很多，拒绝菊花转的等待时间。

#### 主要功能
把已加载过的api数据缓存在内存当中，首次请求从数据库中取，非首次请求都从内存缓存里面去取。

**优点**：
- 加快打开速度；
- 提升用户体验，避免菊花转，延长等待时间；
- 减少服务器请求压力；
- 如果服务器挂了，用户还有缓存数据请求；

**缺点**
- 内存能存储多长时间？（可以自定义缓存时间）
- 能存储多大文件？（没测试庞大的数据文件）

#### 安装方法
- 1、git clone
- 2、npm install	安装依赖
- 3、node server.js	启动入口文件
- 4、浏览器运行：  http://localhost:3001/
- 5、打开调试模式，network 的 getStoreLists 这项，刷新页面，查看第一次访问的time， 然后再10秒内在刷新一次，看下time的值是多少，我这边的第一次197ms，缓存请求时间是2-5ms。观察cmd的请求日志。

#### 使用方法
> api接口，是我个人的easymock模拟测试接口来测试的，方式post，返回6条模拟数据用来测试，大家可以自行修改！
> 大家可以用postMan测试看看，https://www.easy-mock.com/mock/5c7755477163345f2e2eccbd/xcx/getStoreLists
##### 定义中间件
```
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
                    console.log("来自api接口");   //以对象形式存入
                    memoryCache.put(key, data.body, duration * 1000);
					res.send(data.body);
                })
          next();
        }
    }
}
```
##### 调用中间件
```
server.post("/getStoreLists", cache(5), (req, res) => {
	console.log("ok!");
})
```
#### 效果截图
![enter image description here](http://po4ucl8b6.bkt.clouddn.com/post04_01.png)
![enter image description here](http://po4ucl8b6.bkt.clouddn.com/post04_02.png)
![enter image description here](http://po4ucl8b6.bkt.clouddn.com/post04_03.png)

#### 同类方案解决内存缓存技术
可能不是最好的内存缓存方案，也有其他技术可以实现：
-  在实际开发中我们可以选择分布式的 cache 服务，比如 Redis。
-  npm 上也有：[express-redis-cache](https://www.npmjs.com/package/express-redis-cache) 模块使用。