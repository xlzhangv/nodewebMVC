const http = require("http");
var url = require("url");
var querystring = require('querystring');

var defaultSetting = {
    url: null,   //request url
    data: null,  //parameters
    dataType: "JSON",    //JSON | string
    headers:{
        "Accept":"application/json, text/javascript",
        "Accept-Language":"zh-CN,zh;q=0.8",
        "Content-Length":0,
        "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
    },
    type: "GET", // GET | POST
    timeout: 10, //request timeout threshold

    beforeSend: function (req) {

    },  //bofore send request
    complete: function (req) {
    },    //requset completely
    success: function (data) {
        console.log(data)
    },   //request successfully
    error: function (data) {
    }  //request failed
}

function ajax(setting) {
    var errCode = null;

    if (Object.prototype.toString.call(setting) !== '[object Object]') {
        console.log("the ajax's first argument must be a Object");
        return;
    }
    if (setting.url == null || setting.url == "") {
        console.log("the url cannot be null");
        return;
    }
    setting = objCopy(defaultSetting,setting);


    var params = url.parse(setting.url, true);
    var options = {
        protocol:params.protocol,
        host: params.hostname,
        port: params.port || 80,
        path: params.path,
        headers:setting.headers,
        method: setting.type
    };



    if(setting.type.toLocaleUpperCase()=='GET'){
        if (setting.data != null&&setting.data=='Object') {
            options.path += "?";
            for (var key in setting.data) {
                options.path = options.path + "&" + key + "=" + setting.data[key];
            }
        }else{
            options.path += "?"+setting.data;
        }
    }

    var req = http.request(options, function (res) {

        console.log(res.headers);
        if (res.statusCode !== 200) {
            console.log(new Error('Request Failed. Status Code: ' + res.statusCode +' '+res.statusMessage+' ' + setting.url))
            return
        }
        var data = "";
        res.on("data", function (chunk) {
            data += chunk;
        })
        res.on("end", function () {
            if(setting.dataType.toLocaleUpperCase()==='JSON'){
                try {
                    data = JSON.parse(data)
                } catch (e) {
                    console.error(e);
                }
            }
            setting.success(data);
            setting.complete(data);
            data = null;
            delete req;
        })
    }).on("error", function (e) {
        setting.error('httpProxy:'+e.message);
        delete req;
    });
    setting.beforeSend(req,objCopy({},setting,options));


    if (setting.headers != null) {
        for (var key in setting.headers) {
            req.setHeader(key, setting.headers[key]);
        }
    }
    if (setting.type.toLocaleUpperCase() === "POST") {
        var dataStr = querystring.stringify(setting.data);
        req.setHeader("Content-Length", dataStr.length);
        req.write(dataStr);
    }
    req.setTimeout(setting.timeout,function () {
        setting.error('请求超时...');
    });
    req.end();
}
global.ajax = ajax;
