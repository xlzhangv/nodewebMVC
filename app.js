var package = require("./package.json");
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');//日志组件
require('./util/utils');//工具类
require('./util/httpProxy');//请求代理类
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routesIndex = require('./routes/routes-index');
var app = express();


global.APP_PATH=__dirname;
// view engine setup
console.info('项目文件夹路径:'+__dirname);
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//静态文件目录，
if(package.static){
    for(var i=0;i<package.static.length;i++){
        app.use(express.static(path.join(__dirname, package.static[i]), {
            maxAge: 1000 * 60 * 60*24,
            setHeaders:function (res, path, stat) {

            }
        }));

    }
}
//-------
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'xlzhang',
  name: package.name,   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
  cookie: {maxAge: 60*60*1000},  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
  resave: false,
  saveUninitialized: true,
}));
routesIndex.init(app);

module.exports = app;
