
var express = require("express");
var router = express.Router();

var Category = require("../models/Category");
var Content = require("../models/Content");
/*
 * 读取views目录下的指定文件，解析并返回给客户端
 * 第一个参数：表示模板的文件，相对于views目录
 * 第二个参数： 传递给模板使用的数据
 */
/*
 * 处理通用的数据
 */
var data ;
router.use((req,res,next) =>{
     data = {
         userInfo:req.userInfo,
         categories:[]
     }

     Category.find().then((categories) =>{
         data.categories = categories;
         next();
     })
})
/*
 * 首页
 */
router.get("/",(req,res,next) =>{


        data.category=req.query.category ||"";
        data.page =Number(req.query.page  || 1);
        data.limit = 4;
        data.pages = 0;
        data.count= 0;
        // data.contents=[];


    var where = {};
    if (data.category) {
        where.category = data.category;
    }

    Content.where(where).count().then((count) =>{

        data.count = count;
        //计算总页数
        data.pages = Math.ceil( data.count/data.limit);
        //取值不能超过pages
        data.page = Math.min(data.page,data.pages);
        //取值不能小于1
        data.page = Math.max(data.page,1);

        var skip  = (data.page - 1) * data.limit ;


        return Content.find().where(where).limit(data.limit).skip(skip).populate(['category','user']).sort({addTime:-1});
    }).then((contents)=>{
        data.contents = contents;
        // console.log(data);
        res.render("main/index",data);
    });

})

router.get("/view",(req,res) =>{
    var contentId = req.query.contentid || "";
    Content.findOne({
        _id:contentId
    }).then((content) =>{
        data.content = content;

        content.views++;
        content.save();

        res.render("main/view",data);
    })
})

module.exports = router;