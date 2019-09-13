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

//获取所有用户
app.get('/users',(req,res)=>{
	db.User.find().select('_id name permission')
	.lean()
	.exec((err,data)=>{
		if(err){
			return res.send({
				status: 400,
				msg: '用户查找错误'
			})
		}
		return res.send({
			status: 200 ,
			data: data
		})
	})
})

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

//注册
app.post('/signup',(req,res)=>{
	let mail = req.body.mail
	let pwd = req.body.pwd
	let phone = req.body.phone
	let name = req.body.name
	let permission = req.body.per

	db.User.findOne({mail:mail})
	.lean()
	.exec((err,data)=>{
		if(data){
			return res.send({
				status: 400 ,
				msg: '该邮箱已经被注册'
			})
		} else {
			if(phone){
				db.User.findOne({phone:phone})
				.lean()
				.exec((err,data1)=>{
					if(data1){
						return res.send({
							status: 400 ,
							msg: '该手机号已经被注册'
						})
					} else{
						db.User.create({
							mail: mail,
							phone:phone,
							password:pwd,
							name: name,
							permission: permission
						},(err,data2)=>{
							if(err){
								return res.send({
									status: 400 ,
									msg: '注册失败'
								})
							}
							return res.send({
								status: 200 ,
								msg: '注册成功1'
							})

						})
					}
				})
			} else{
				db.User.create({
					mail: mail,
					phone:phone,
					password:pwd,
					name: name,
					permission: permission
				},(err,data2)=>{
					if(err){
						return res.send({
							status: 400 ,
							msg: '注册失败'
						})
					}
					return res.send({
						status: 200 ,
						msg: '注册成功2'
					})
				})	
			}
		}
	})
})

//修改权限
app.post('/UpPermission',(req,res)=>{
	let id = req.body.id
	let permission = req.body.permission;
	db.User.update({
		_id: id
	},{
		$set:{
			permission: permission
		}
	},(err,data)=>{
		if(err){
			return res.send({
				status: 400,
				msg: '权限更改失败，请重试'
			})
		}
		return res.send({
			status: 200 ,
			msg: '权限更改成功'
		})
	})
})

//用户登出
app.post('/logout',(req,res)=>{
	req.session.destroy()
	res.send({
		status: 200 ,
		msg: '已成功登出'
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
			delete data.password
			res.send({
				status: 200 ,
				data: data
			})
		})
	} else{
		res.send({
			status: 400,
			msg: '请先登录'
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
    },{
    	upsert: true
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
    },{
    	upsert: true
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