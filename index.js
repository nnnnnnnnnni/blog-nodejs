const express = require('express')
const app = express()
const cfg = require('./config')
const session = require('express-session')
const ejs = require('ejs');
const cors = require('cors');
const history =  require('connect-history-api-fallback')
 
//我在本地
//我改了文件
//页面刷新404设置
app.use('/',history());
//跨域设置
app.use(cors());
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

app.use(express.static('../blog/dist/'));

app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.set('views','../blog/dist/')

app.get('/', function (req, res, next) {
  res.render('index',{title:"doc"});
})


//头部消息支持跨域
// app.all('*', function (req, res, next) {
//   // res.setHeader('Content-Type', 'application/json')
//   res.header("Access-Control-Allow-Origin", "http://localhost:8080");
//   res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
//   res.header("Access-Control-Allow-Credentials", "true")
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   next();
// });

app.use('/api/article', require('./routers/article'))
app.use('/api/user', require('./routers/user') )


console.log('server start at port ' + cfg.port)
app.listen(cfg.port)
