
var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Category = require("../models/Category");
var Content = require("../models/Content");
router.use( (req,res,next) =>{
    if(!req.userInfo.isAdmin){
        //如果当前用户是非管理员
        res.send('对不起，只有管理员才可以进入后台管理');
    }
    next();
})
/*
 * 读取views目录下的指定文件，解析并返回给客户端
 * 第一个参数：表示模板的文件，相对于views目录
 * 第二个参数： 传递给模板使用的数据
 */

router.get("/",(req,res,next) =>{
    res.render("admin/index",{
        userInfo:req.userInfo
    });
})

/*
 * 用户管理
 */

router.get("/user",(req,res) =>{

    /*
     * 从数据库中读取所有的用户数据
     *  limit(number) ： 限制获取的数据的条数
     *
     *  skip() : 忽略数据的条数
     *
     *  每页显示2条
     *
     *  1： 1-2 skip(0)   -> (当前页-1）*limit
     *  2:  3-4 skip(2)
     */

    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    User.count().then((count) =>{

        //计算总页数
        pages = Math.ceil( count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then((users) =>{
            res.render("admin/user_index",{
                userInfo:req.userInfo,
                users: users,
                pages:pages,
                page:page,
                limit:limit,
                count:count
            })
        })
    })


});

/*
 * 分类首页
 *
 */
router.get("/category",(req,res) =>{
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Category.count().then((count) =>{

        //计算总页数
        pages = Math.ceil( count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page - 1) * limit;

        /*
         * 1: 升序
         * 2：降序
         */
        Category.find().sort({_id:-1}).limit(limit).skip(skip).then((categories) =>{
            res.render("admin/category_index",{
                userInfo:req.userInfo,
                categories: categories,
                pages:pages,
                page:page,
                limit:limit,
                count:count
            })
        })
    })

})

/*
 * 分类的添加
 */
router.get("/category/add",(req,res) =>{
    res.render("admin/category_add",{
        userInfo:req.userInfo
    })
})

/*
 * 分类的保存
 */
router.post("/category/add",(req,res) =>{

    var name = req.body.name || "";

    if( name == ""){
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:'名称不能为空',
        });
        return;

    }

    // 数据库中是否已经存在同名分类名称
    Category.findOne({
        name:name
    }).then((rs) =>{
        if(rs) {
            //数据库存在该分类
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类已经存在了"
            })
            return Promise.reject();
        } else {
            // 数据库中不存在该分类，可以保存
            return new Category({
                name:name
            }).save();
        }
    }).then(function(newCategory) {
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"分类保存成功",
            url:"/admin/category"
        });
    })
})

/*
 * 分类修改
 */
router.get("/category/edit",(req,res) =>{

    // 读取需要修改的信息， 并且用表单的形式表现出来
    var id = req.query.id || '';

    //获取需要修改的分类信息
    Category.findOne({
        _id: id
    }).then((category) =>{
        if (!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
        } else {
            res.render("admin/category_edit",{
                userInfo:req.userInfo,
                category:category
            });
        }
    })
})
/*
 * 分类修改的保存
 */
router.post("/category/edit",(req,res)=>{

    // 获取要修改的分类的信息，并且用表单的形式展现出来
    var id = req.query.id || "";
    // 获取post提交过来的名称
    var name = req.body.name || "";
    //获取需要修改的分类信息
    Category.findOne({
        _id: id
    }).then((category) =>{
        if (!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
        } else {
          // 当用户没有做任何的修改提交的时候
            if ( name == category.name){
                res.render("admin/success",{
                    userInfo:req.userInfo,
                    message:"修改成功",
                    url:"/admin/category"
                });
                return Promise.reject();
            } else {
                // 要修改的分类名称是否已经在数据库中存在
                Category.findOne({
                    _id: {$ne:id},
                    name : name
                }).then((sameCategory)=>{
                    if(sameCategory) {
                        res.render("admin/error",{
                            userInfo:req.userInfo,
                            message:"数据库中已存在同名分类"
                        })
                        return Promise.reject();
                    } else {
                        Category.update({_id:id},{name:name}).then( () =>{
                            res.render("admin/success",{
                                userInfo:req.userInfo,
                                message:"修改成功",
                                url:"/admin/category"
                            });
                        })
                    }
                })
            }
        }
    })
})
/*
 * 分类删除
 */
router.get("/category/delete",(req,res) =>{
    var id = req.query.id || "";
    Category.findOne({_id: id}).then((category) =>{
        if(!category){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"该分类不存在"
            })
        } else {
            Category.remove({
                _id:id
            }).then(()=>{
                res.render("admin/success",{
                    userInfo:req.userInfo,
                    message: "删除成功",
                    url : "/admin/category"
                });
            })
        }
    })
})

/*
 * 内容首页
 */
router.get("/content",(req,res) =>{

    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Content.count().then((count) =>{

        //计算总页数
        pages = Math.ceil( count/limit);
        //取值不能超过pages
        page = Math.min(page,pages);
        //取值不能小于1
        page = Math.max(page,1);

        var skip = (page - 1) * limit;

        /*
         * 1: 升序
         * 2：降序
         */
        Content.find().sort({addTime:-1}).limit(limit).skip(skip).populate(["category","user"]).then((contents) =>{
            res.render("admin/content_index",{
                userInfo:req.userInfo,
                contents: contents,
                pages:pages,
                page:page,
                limit:limit,
                count:count
            })
        })
    })


})

/*
 * 内容添加首页
 */
router.get("/content/add",(req,res) =>{

    Category.find().sort({_id:-1}).then( (categories) =>{
        res.render("admin/content_add",{
            userInfo:req.userInfo,
            categories:categories
        })
    })

})

router.post("/content/add",(req,res) =>{

    // console.log(req.body);

    if (req.body.category == "") {
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"内容分类不能为空"
        })
        return ;
    }
    if (req.body.title == "") {
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"内容标题不能为空"
        })
        return ;
    }
    //保存数据到数据库
    new Content({
        category:req.body.category,
        title:req.body.title,
        user:req.userInfo._id.toString(),
        description: req.body.description,
        content:req.body.content
    }).save().then((rs) =>{
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url: "/admin/content"
        })
    });
})

/*
 * 修改内容
 */
router.get("/content/edit",(req,res) =>{

    var id = req.query.id || "";

    var categories = [];
    Category.find().sort({_id:-1}).then((rs) =>{
        categories =  rs;
        return Content.findOne({
            _id: id
        }).populate("category")
    }).then((content) =>{

        if( !content ){
            res.render("admin/error",{
                userInfo:req.userInfo,
                message:"指定内容不存在",
                url:"admin/content_index"
            });
            return Promise.reject();
        } else {
            res.render("admin/content_edit",{
                userInfo:req.userInfo,
                content:content,
                categories:categories
            })
        }
    });

})

/*
 * 保存 修改的内容
 */
router.post("/content/edit",(req,res) =>{
    var id = req.query.id || "";

    if (req.body.category == "") {
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"内容分类不能为空"
        })
        return ;
    }
    if (req.body.title == "") {
        res.render("admin/error",{
            userInfo:req.userInfo,
            message:"内容标题不能为空"
        })
        return ;
    }

    Content.update({_id: id},{category:req.body.category,title:req.body.title,description:req.body.description,content:req.body.content})
        .then(() =>{
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:"/admin/content/edit?id="+id.toString()
          })
        })
})

/*
 * 内容删除
 */

router.get("/content/delete",(req,res) =>{
    var id = req.query.id || "";

    Content.remove({
        _id:id
    }).then(()=>{
        res.render("admin/success",{
            userInfo:req.userInfo,
            message:"删除成功",
            url:"/admin/content"
        })
    })
})
module.exports = router;