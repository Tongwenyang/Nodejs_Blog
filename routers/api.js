
var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Content = require("../models/Content");
//统一返回格式
var responseData;

router.use( function(req,res,next){
    responseData = {
        code : 0,
        message: ""
    }
    next();
})

/*
 * 读取views目录下的指定文件，解析并返回给客户端
 * 第一个参数：表示模板的文件，相对于views目录
 * 第二个参数： 传递给模板使用的数据
 */

/*
 * 用户注册
 *  注册逻辑
 *
 *  1.用户名不能为空
 *  2.密码不能为空
 *  3.两次输入密码必须一致
 *
 *  1.用户名是否已经被注册
 *      数据库查询
 */
router.post("/user/register",function(req,res,next) {
    console.log(req.body);
    var username = req.body.username;
    var password = req.body.password;
    var repasswrod = req.body.password;

    //用户是否为空
    if( username == "") {
        responseData.code = 1;
        responseData.message = "用户名不能为空";
        res.json(responseData);
        return;
    }
    //密码不能微孔
    if( password == ""){
        responseData.code = 2;
        responseData.message = "密码不能为空";
        res.json(responseData);
        return ;
    }
    //两次密码不一致
    if( password != repasswrod){
        responseData.code = 3;
        responseData.message = "两次密码不一致";
        res.json(responseData);
        return;
    }

    // 用户名是否已经被注册，如果数据库中已经存在和我们要注册的用户名同名的数据，则
    User.findOne({
        username:username
    }).then(function(userInfo){
        if( userInfo ){
            // 表示数据库中有该记录
            responseData.code = 4;
            responseData.message = "用户名已经被注了";
            res.json(responseData);
            return ;
        }
        //保存用户注册信息到数据库中
        var user = new User({
            username: username,
            password:password
        });
        return user.save();
    }).then((newUserInfo) =>{
        responseData.message = "注册成功";
        res.json(responseData);
    });

})

/*
 * 登录
 */
router.post("/user/login",(req,res) =>{
    var username = req.body.username;
    var password = req.body.password;

    if( username =="" || password ==""){
        responseData.code = 1;
        responseData.message = "用户名和密码不能为空";
        res.json(responseData);
        return;
    }
    //查询数据库中相同 用户名和密码记录是否存在,如果存在则登录成功
    User.findOne({
        username:username,
        password:password
    }).then((userInfo) =>{
        if (!userInfo ){
            responseData.code = 2;
            responseData.message = "用户名或密码错误。";
            res.json(responseData);
            return ;
        }
        // 用户名和密码是正确的
        responseData.message = "登录成功";
        responseData.userInfo ={
            _id: userInfo._id,
            username: userInfo.username
        }
        //保存cookies信息
        req.cookies.set('userInfo',JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return ;
    })
})

/*
 * 退出
 */
router.get("/user/logout",(req,res) =>{
    req.cookies.set("userInfo",null);
    res.json(responseData);
})

/*
 * 评论提交
 */
router.post("/comment/post",(req,res) =>{
    //内容id
    var contentId = req.body.contentid || "";
    var postData = {
        username:req.userInfo.username,
        postTime: new Date(),
        content:req.body.content
    }

    // 查询当前内容的信息
    Content.findOne({
        _id:contentId
    }).then((content) =>{
        content.comments.push(postData);
        return content.save();
    }).then((newContent) =>{
        responseData.message = "评论成功";
        responseData.data = newContent;
        res.json(responseData);
    })
})

/*
 * 获取指定文章的所有评论
 */

router.get("/comment",(req,res) =>{
    var contentId = req.query.contentid || "";

    Content.findOne({
        _id: contentId
    }).then((content) =>{
        responseData.data = content.comments;
        res.json(responseData);
    })
})
module.exports = router;