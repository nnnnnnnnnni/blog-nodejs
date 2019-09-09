const express = require('express')
const app = express()
const cfg = require('./config')
const session = require('express-session')

//session 设置
app.use(session({
  key: 'user',
  resave: false,
  saveUninitialized: false,
  secret: 'nys_blog_cookie_secret_key',
  cookie: {
    maxAge: cfg.sessionTimeout
  }
},app))

app.get('/:x', function (req, res, next) {
  if (req.session.views) {
    if(req.session.views == 7){
      req.session.destroy() 
      req.session.views = 1
    }
    req.session.views++
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})

app.use(express.static(__dirname + '/public'));

//头部消息支持跨域
app.all('*', function (req, res, next) {
  res.setHeader('Content-Type', 'application/json')
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use('/article', require('./routers/article'))
app.use('/user', require('./routers/user') )


console.log('server start at port ' + cfg.port)
app.listen(cfg.port)