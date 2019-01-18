/**
 * Created by Administrator on 2016/6/2.
 */
var express = require('express');
var url = require('url');
var fs = require('fs');
var path = require('path');
var mime = require("./mime").types;
var ViewsBuildingRoute = require('./views-building-route')
var excludeAction = require('./exclude-action').excludeAction;
var routesIndex = {
    app: null,
    AUTHORITY_CODE:332,//需要登录状态码
    viewsPath:undefined,
    init: function (app) {
        console.info('加载拦截器')
        this.app = app;
        this.viewsPath = APP_PATH + '/views';
        this.fileFilter(app);
        this.loginIntercept(app);
        this.autoBuildingRoute(this.viewsPath,[]);
        this.explorer(APP_PATH + '/routes/action');
        this.errorAction(app);

    },
    errorAction: function (app) {
        if (app.get('env') === 'development') {
            app.use(function (err, req, res, next) {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });
            });
        }

        app.use(function(err, req, res, next){
            // we may use properties of the error object
            // here and next(err) appropriately, or if
            // we possibly recovered from the error, simply next().
            res.status(err.status || 500);
            res.render('500', { error: err });
        });

        //404
        app.get('*', function(req, res) {
            console.log('404 handler..')
            res.render('404', {
                status: 404,
                title: 'NodeBlog',
            });
        });

    },
    __oldPath:'',
    __directory:[],
    //自动构建路由
    autoBuildingRoute:function (path,dirs) {
        var me =this,
        readDirs = fs.readdirSync(path);
        // console.info('开始构建路由...' + path);
        readDirs.forEach(function (fileName) {
            var dirPath = path + '/' + fileName;
            if (fs.statSync(dirPath).isDirectory()) {
                var valid = true;
                for (var index in excludeAction) {
                    // console.info(url.indexOf(excludeAction[index]) + ":" + url + ":" + excludeAction[index]);
                    if (dirPath.indexOf(excludeAction[index]) != -1) {
                        valid = false;
                        break;
                    }
                }
                if(!valid) return;
                console.info('读取文件夹：' + dirPath);
                //me.__directory.push(fileName);
                var viewPath = dirPath.replace(me.viewsPath,'');
                console.info('构建文件夹路由：' + viewPath);
                new ViewsBuildingRoute(me.app,viewPath,viewPath.substring(1)+'/main');
                me.autoBuildingRoute(dirPath,dirs);

            } else {
                if(dirs.length==0) return;
                // 读出所有的文件
                // me.__directory=[];
            }
        });
    },
    //注入actin
    explorer: function (path) {
        var me = this;
        var readDirs = fs.readdirSync(path);
        var directory=[];
        console.info("--------------------------");
        readDirs.forEach(function (fileName) {
            console.info('读取action文件...' + fileName);
            var dirPath = path + '/' + fileName;
            if (fs.statSync(dirPath).isDirectory()) {
                console.info('读取文件夹：' + fileName);
                directory+=fileName;
                // 如果是文件夹遍历
                me.explorer(dirPath);
            } else {
                // 读出所有的文件
                console.info('加载文件：' + fileName);
                var basePath = fs.realpathSync(path + '/' + fileName);
                // console.info(basePath);
                //nodejs 只能读取 反斜杠/
                // console.info("----" + me.frontSlash(basePath));
                var r = require(me.frontSlash(basePath));
                r.init(me.app);
            }
        })
    },
    fileFilter: function (app) {
        app.use(function (req, res, next) {
            console.info('过滤...');
            res.locals.user= JSON.stringify(req.session.user);
            res.locals.menus= JSON.stringify(req.session.menus);
            var pathname = url.parse(req.url).pathname;
            var ext = pathname.match(/(\.[^.]+|)$/)[0];//取得后缀名
            if (ext) {
                console.info(ext);
                ext = ext ? ext.slice(1) : 'unknown';
                var contentType = mime[ext] || "text/html";
                res.writeHead(200, {'Content-Type': contentType});

                var data="";
                try{
                    data = fs.readFileSync(req.url, 'utf-8');
                }catch (e){

                }
                res.write(data);
                res.end();
                return;
            }
            next();
        });
    },
    //用户登录拦截器
    loginIntercept: function (app) {
        var me =this;
        app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            // res.header('Access-Control-Allow-Credentials', true);
            res.header("Access-Control-Allow-Headers", "X-Requested-With");
            var url = req.originalUrl;
            console.info('拦截器：' + url);
            if ('/' == url) {
                return res.redirect("/login");
            }
            var valid = true;
            for (var index in excludeAction) {
                // console.info(url.indexOf(excludeAction[index]) + ":" + url + ":" + excludeAction[index]);
                if (url.indexOf(excludeAction[index]) != -1) {
                    valid = false;
                    break;
                }
            }


            if (valid && !req.session.user) {
                //console.info(valid + '被拦截请求' + req.session.data);
                req.session.data=undefined;
                if(req.header("X-Requested-With")=='XMLHttpRequest'){
                    console.info('session超时');
                    res.status(me.AUTHORITY_CODE).send('需要登录帐户');
                }else{
                    return res.status(me.AUTHORITY_CODE).redirect("/login");
                }
            }else{
                next();
            }
            return;

        });
    },
    frontSlash: function (path) {
        return path.replace(/\\/g, '/');
    }
}
module.exports = routesIndex;