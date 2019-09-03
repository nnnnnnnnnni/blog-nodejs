const express = require('express')
const app = express()
const bodyparse = require("body-parser")
const db = require('../mongo')
const showdown  = require('showdown')
const cfg = require('../config')
const session = require('express-session')

app.use(bodyparse.json())
app.use(bodyparse.urlencoded({
    extended: true
}))

//登录
app.post('/login',(req,res)=>{
	let mail = req.body.mail
	let pwd = req.body.pwd

	db.User.findOne({
		mail: mail,
		password: pwd
	}).lean()
	.exec((err,data)=>{
		if(err){
			return res.send({
				status: 400,
				msg: '登录发生错误'
			})
		} else if (!data) {
			return res.send({
				status: 400 ,
				msg: '请检查账号密码'
			})
		}else {
			delete data.password
			req.session.user = data
			return res.send({
				status: 200 ,
				msg: '登录成功'
			})
		}
	})
})

//获取session信息
app.get('/info',(req,res)=>{
	if(req.session.user){
		db.User.findOne({
			$or:[{
				mobile: req.session.user.mobile
			},{
				mail: req.session.user.mail
			}]
		}).lean()
		.exec((err,data)=>{
			if(err){
				return res.send({
					status: 400,
					msg: '登录发生错误'
				})
			}
			res.send({
				status: 200 ,
				data: data
			})
		})
	} else{
		res.send({
			status: 400,
			msg: '不存在信息'
		})
	}
})

//添加分类
app.post('/addcategories',(req,res)=>{
	let categories = req.body.categories
	if(!req.session.user){
		return res.send({
			status: 400,
			msg: '请重新登录'
		})
	}
    db.User.update({
    	_id: req.session.user._id
    },{
    	$addToSet: { categories: categories } 
    }).exec((err,data)=>{
            if(err){
                return res.send({
                    status: 400,
                    msg: "fail!"
                })
            }
            res.send({
                status: 200,
                msg: "添加成功"
            })
    });
})

//删除分类
app.post('/delcategories',(req,res)=>{
	let categories = req.body.categories
	if(!req.session.user){
		return res.send({
			status: 400,
			msg: '请重新登录'
		})
	}
    db.User.update({
    	_id: req.session.user._id
    },{
    	$pull: { categories: categories } 
    }).exec((err,data)=>{
            if(err){
                return res.send({
                    status: 400,
                    msg: "fail!"
                })
            }
            res.send({
                status: 200,
                msg: "添加成功"
            })
    });
})

//添加标签
app.post('/addtag',(req,res)=>{
	let tag = req.body.tag
	if(!req.session.user){
		return res.send({
			status: 400,
			msg: '请重新登录'
		})
	}
    db.User.update({
    	_id: req.session.user._id
    },{
    	$addToSet: { tags: tag } 
    }).exec((err,data)=>{
            if(err){
                return res.send({
                    status: 400,
                    msg: "fail!"
                })
            }
            res.send({
                status: 200,
                msg: "添加成功"
            })
    });
})

//删除标签
app.post('/deltag',(req,res)=>{
	let tag = req.body.tag
	if(!req.session.user){
		return res.send({
			status: 400,
			msg: '请重新登录'
		})
	}
    db.User.update({
    	_id: req.session.user._id
    },{
    	$pull: { tags: tag } 
    }).exec((err,data)=>{
            if(err){
                return res.send({
                    status: 400,
                    msg: "fail!"
                })
            }
            res.send({
                status: 200,
                msg: "添加成功"
            })
    });
})

module.exports = app