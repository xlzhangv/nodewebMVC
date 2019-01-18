var express = require('express');
module.exports = ViewsBuildingRoute;

//通过views下文件夹名称加构建Router
function ViewsBuildingRoute(app,path,render) {
    this.path = path,this.render = render;
    this.init(app)
}
ViewsBuildingRoute.prototype={
    path:undefined,
    render:undefined,
    package:undefined,
    init: function (app) {
        var me =this;
        app.use(this.path, this.createRouter());

    },
    createRouter:function () {
        var me =this;
        /* GET home page. */
        var router = express.Router();
        router.get('/', function (req, res, next) {
            res.render(me.render, {

            });
            return;
        });
        return router;
    }
}
