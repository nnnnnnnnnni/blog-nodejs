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
    let id = req.query.id
    let isShow = req.query.isShow || false
    let param = {}
    if(id){
        param ={
            userId:id
        }
    }
    if(isShow){
        param['status'] = 1
    }
    db.Article.find(param).count().lean().exec((err,data)=>{
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
    let count = req.query.count || req.body.count || req.params.count || 6
    let params = {}
    let p = 1
    if(id){
        params = {userId: id}
        p = 2
    }
    if(isShow){
        params['status'] = 1
    }
    let converter = new showdown.Converter()
	db.Article.find(params)
	.lean()
    .sort({create_time:-1})
    .limit(Number(count))
    .skip((page-1)*Number(count))
	.exec((err,data)=>{
		if(err){
			return res.send({
				status: 400,
				msg: 'fail!'
			})
		}
        data.text = converter.makeHtml(data.text)
        data.forEach(el =>{
            el.summary = el.text.substr(0,160)
            el.create_time = tools.getTime(el.create_time,p)
            el.update_time = tools.getTime(el.update_time,p)
        })
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
        data.forEach(el =>{
            el.create_time = tools.getTime(el.create_time,1)
            el.update_time = tools.getTime(el.update_time,1)
        })
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
        data.forEach(el =>{
            el.create_time = tools.getTime(el.create_time,1)
            el.update_time = tools.getTime(el.update_time,1)
        })
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
        data.forEach(el =>{
            el.create_time = tools.getTime(el.create_time,1)
            el.update_time = tools.getTime(el.update_time,1)
        })
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
//删除文章
app.post('/del',(req,res)=>{
    var id = req.body.id
    db.Article.deleteOne({
        _id: id
    }).exec((err,data)=>{
        if(err){
            return res.send({
                status: 400,
                msg: "fail!"
            })
        }
        res.send({
            status: 200,
            msg: '删除成功'
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
        create_time: new Date(),
        update_time: new Date(),
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

//更新文章
app.post('/update',(req,res)=>{
    if(!req.session.user){
        return res.send({
            status: 400,
            msg: '请刷新登录状态'
        })
    }
    var username = req.session.user.name
    var userId = req.session.user._id
    var id = req.body.id
    var title = req.body.title
    var tags = req.body.tags
    var categories = req.body.categories
    var text = req.body.text
    var status = req.body.status
    db.Article.update({
        _id: id
    },{
        title:       title,
        status:      status,
        update_time: new Date(),
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