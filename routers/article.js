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

//获取文章总数
app.get('/count',(req,res)=>{
    db.Article.find().count().lean().exec((err,data)=>{
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

//所有文章列表
app.get('/list',(req,res)=>{
    let id = req.query.id || req.body.id || req.params.id
    let isShow = req.query.isShow || req.body.isShow || req.params.isShow
    let page = req.query.page || req.body.page || req.params.page
    let params = {}
    if(id){
        params = {userId: id}
    }
    if(isShow){
        params['status'] = 1
    }
    let converter = new showdown.Converter()
	db.Article.find(params)
	.lean()
    .sort({create_time:-1})
    .skip((page-1)*6)
    .limit(6)
	.exec((err,data)=>{
        data.text = converter.makeHtml(data.text)
        data.forEach(el =>{
            el.summary = el.text.substr(0,160)
        })
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
app.get('/getbycategories/:name',(req,res)=>{
    var name = req.params.name;
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
app.get('/getbytag/:name',(req,res)=>{
    var name = req.params.name
    db.Article.find({tags:{$in:[name]}})
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
app.get('/search/:name',(req,res)=>{
    var name = req.params.name
    db.Article.find({title:{$regex:name,$options:'i'}})
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