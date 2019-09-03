const express = require('express')
const app = express()
const bodyparse = require("body-parser")
const db = require('../mongo')
const showdown  = require('showdown')
const tools = require('../tools')

app.use(bodyparse.json())
app.use(bodyparse.urlencoded({
    extended: true
}))

//所有文章列表
app.get('/list',(req,res)=>{
    let page = req.query.page
    let id = req.query.id || req.body.id || req.params.id
    let params = {}
    if(id){
        params = {userId: id}
    }
    let converter = new showdown.Converter()
	db.Article.find(params)
	.lean()
    .sort({create_time:-1})
    .limit(6)
    .skip((page-1)*6)
	.exec((err,data)=>{
        data.text = converter.makeHtml(data.text)
		if(err){
			return res.send({
				status: 400,
				msg: 'fail!'
			})
		}
        res.send({
            status: 200,
            data: data
        })
	})
})

//所有分类
app.get('/categories',(req,res)=>{
    db.Article.aggregate([
        { $match: {create_time:{$gt:'2000'}}},
        { $group: { _id: "$categories", totail: { $sum: 1 } } },
        {$sort: {totail:-1}}
    ]).exec((err,data)=>{
            if(err){
                return res.send({
                    status: 400,
                    msg: "fail!"
                })
            }
            res.send({
                status: 200,
                data: data
            })
    });
})

//分类文章
app.get('/getbycategories',(req,res)=>{
    var name = req.query.name;
    db.Article.find({categories:name})
    .lean()
    .sort({create_time:-1})
    .exec((err,data)=>{
        if(err){
            return res.send({
                status: 400,
                msg: "fail!"
            })
        }
        res.send({
            status: 200,
            data: data
        })
    })
})

//所有标签
app.get('/tags',(req,res)=>{
    db.Article.find().select('-_id tags')
    .lean()
    .exec((err,data)=>{
        if(err){
            return res.send({
                status:400,
                msg:"fail!"
            })
        }
        let arr = [];
        data.forEach(element => {
            arr.push(...element.tags)
        });
        data = Array.from(new Set(arr))
        res.send({
            status:200,
            data:data
        })
    });
})

//标签文章
app.get('/getbytag',(req,res)=>{
    var tag = req.query.tag
    db.Article.find({tags:{$in:[tag]}})
    .lean()
    .sort({create_time:-1})
    .exec((err,data)=>{
        if(err){
            return res.send({
                status:400,
                msg:"fail!"
            })
        }
        res.send({
            status:200,
            data:data
        })
    })
})

//ID查文章
app.get('/id/:id',(req,res)=>{
    var id = req.params.id
    db.Article.find({_id:id})
    .lean()
    .exec((err,data)=>{
        if(err){
            return res.send({
                status:400,
                msg:"fail!"
            })
        }
        res.send({
            status:200,
            data:data
        })
    })
})

//模糊查询
app.get('/search/:title',(req,res)=>{
    var title = req.params.title
    db.Article.find({title:new RegExp(title)})
    .lean()
    .exec((err,data)=>{
        if(err){
            return res.send({
                status:400,
                msg:"fail!"
            })
        }
        res.send({
            status:200,
            data:data
        })
    })
})

//修改文章状态
app.post('/updateStatus',(req,res)=>{
    var id = req.body.id
    var status = req.body.status
    db.Article.update({
        _id: id
    },{
        $set: {
            status: status
        }
    }).exec((err,data)=>{
        if(err){
            return res.send({
                status: 400,
                msg: "fail!"
            })
        }
        res.send({
            status: 200,
            msg: '修改成功'
        })
    })
})
//上传文章
app.post('/post',(req,res)=>{
    if(!req.session.user){
        return res.send({
            status: 400,
            msg: '请刷新登录状态'
        })
    }
    var username = req.session.user.name
    var userId = req.session.user._id
    var title = req.body.title
    var tags = req.body.tags
    var categories = req.body.categories
    var text = req.body.text
    var status = req.body.status
    db.Article.create({
        title:       title,
        status:      status,
        create_time: tools.getTime(),
        update_time: tools.getTime(),
        tags:        tags,
        categories:  categories,
        text:        text, 
        userId:      userId,
        username:    username,
    },(err,data)=>{
        if(err){
            return res.send({
                status: 400,
                msg: err
            })
        }
        res.send({
            status: 200,
            msg: '成功'
        })
    })
})


module.exports = app