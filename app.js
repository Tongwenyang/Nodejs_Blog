/*
 * 应用程序的启动 （入口）文件
 */
var mongoose = require("mongoose");
var express = require("express");
var swig = require("swig");
//加载body-parser,用来出来post提交过来的数据
var bodyParser = require("body-parser");

//加载cookies模块
var Cookies = require("cookies");
//创建app应用 =》 NODE JS Http.createServer()；
app = express();

var User = require("./models/User");
//设置静态文件托管
//当用户访问的url以/public 开始，直接返回对应
app.use("/public",express.static(__dirname + "/public"));
/*
 * 配置应用模板
 * 定义当前应用所使用的模板引擎
 * 第一个参数：模板引擎名称，同时也是模板文件的后缀
 * 第二个参数: 表示用于解析处理模板内容的方法
 */
app.engine("html",swig.renderFile);
// 设置模板文件存放的目录，第一个参数必须 是 views,第二个参数是目录
app.set("views","./views");
// 注册所使用的模板引擎，第一个参数必须是 view engine,第二个参数和app.engine这个方法中定义的模板引擎的名称是一直的
app.set("view engine","html");
// 在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});
/*
 * 首页
 *  req request 对象
 *  res response
 *  next 函数
 */

//bodyparser设置
app.use(bodyParser.urlencoded({extended:true}));

//设置cookie
app.use( (req,res,next) =>{
    req.cookies = new Cookies(req,res);

    //解析登录用户的cookie信息
    req.userInfo = {};
    if(req.cookies.get("userInfo")){
        try{
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            // 获取当前登录用户的类型，是否是管理员
            User.findById(req.userInfo._id).then((userInfo) =>{
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })
        }catch(e){
            next();
        }
    } else {
        next();

    }
})
/*
 * 根据不同的功能分化模块
 */
app.use("/admin",require("./routers/admin"));
app.use("/api",require("./routers/api"));
app.use("/",require("./routers/main"));


// 用户发送Http 请求 -> url -> 解析路由 -》 找到匹配的规则   -》执行 指定绑定函数，返回对应内容给用户

//  /public -> 静态 - > 直接读取指定目录下的文件，返回给用户
// 动态 -> 处理业务逻辑，加载模板，解析模板 -》 返回数据给用户

mongoose.connect("mongodb://localhost:27018/blog",(err) =>{
    if( err ){
        console.log("数据库连接失败");
    } else {
        console.log("数据库连接成功");
        //监听http请求

        app.listen(8081);
    }
});