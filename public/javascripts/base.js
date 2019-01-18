(function($) {

    document.onkeydown = function(e) {
        var isie = (document.all) ? true : false;
        var key;
        var ev;
        if (isie) {// IE浏览器
            key = window.event.keyCode;
            ev = window.event;
        } else {// 火狐浏览器
            key = e.which;
            ev = e;
        }
        if (key == 9) {// IE浏览器
            if (isie) {
                ev.keyCode = 0;
                ev.returnValue = false;
            } else {// 火狐浏览器
                ev.which = 0;
                ev.preventDefault();
            }
        }
    };

    function home(w) {
        if (w.top === w.self) {
            if (sessionStorage.getItem('login')) {
                w.location.href = sessionStorage.getItem('login');
            } else {
                w.location.href = '/login';
            }

        } else {
            home(w.parent);
        }
    }

    $(document).bind("ajaxError",
        function(XMLHttpRequest, textStatus, errorThrown) {
            if (textStatus.status == 401) {
                function home(w) {
                    if (w.top === w.self) { // are you trying to put self in
                        // an iframe?
                        w.location.href = textStatus.responseText;
                    } else {
                        home(w.parent);
                    }
                }
                home(window);
            }

        });

    $.fn.serializeObj = function() {
        var o = {};
        $.each(this.serializeArray(), function() {
            if (o[this.name]) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });

        return o;
    }
    // author: never-online
    // web: never-online.net
    var request = {
        QueryString : function(val) {
            var uri = window.location.search;
            var re = new RegExp("" + val + "\=([^\&\?]*)", "ig");
            return ((uri.match(re))
                ? (uri.match(re)[0].substr(val.length + 1))
                : null);
        },
        QueryStrings : function() {
            var uri = window.location.search;
            var re = /\w*\=([^\&\?]*)/ig;
            var retval = [];
            while ((arr = re.exec(uri)) != null)
                retval.push(arr[0]);
            return retval;
        },
        setQuery : function(val1, val2) {
            var a = this.QueryStrings();
            var retval = "";
            var seted = false;
            var re = new RegExp("^" + val1 + "\=([^\&\?]*)$", "ig");
            for (var i = 0; i < a.length; i++) {
                if (re.test(a[i])) {
                    seted = true;
                    a[i] = val1 + "=" + val2;
                }
            }
            retval = a.join("&");
            return "?" + retval
                + (seted ? "" : (retval ? "&" : "") + val1 + "=" + val2);
        }
    }
    window['request'] = request;

    // var template1="我是{0}，今年{1}了";
    // var template2="我是{name}，今年{age}了";
    // var result1=template1.format("loogn",22);
    // var result2=template2.format({name:"loogn",age:22});
    String.prototype.format = function(args) {
        var result = this;
        if (arguments.length > 0) {
            if (arguments.length == 1 && typeof(args) == "object") {
                for (var key in args) {
                    var reg = new RegExp("({" + key + "})", "g");
                    if (args[key] != undefined) {
                        result = result.replace(reg, args[key]);
                    } else {
                        result = result.replace(reg, "");
                    }
                }
            } else {
                for (var i = 0; i < arguments.length; i++) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    if (arguments[i] != undefined) {
                        result = result.replace(reg, arguments[i]);
                    } else {
                        result = result.replace(reg, '');
                    }
                }
            }
        }
        return result;
    }

    Date.prototype.format = function(fmt) { // author: meizz
        var o = {
            "M+" : this.getMonth() + 1, // 月份
            "d+" : this.getDate(), // 日
            "h+" : this.getHours(), // 小时
            "m+" : this.getMinutes(), // 分
            "s+" : this.getSeconds(), // 秒
            "q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
            "S" : this.getMilliseconds()
            // 毫秒
        };
        if (/(y+)/.test(fmt))
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4
                - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                    ? (o[k])
                    : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }

    // 拷贝对象
    function objCopy(result, source) {
        for (var key in source) {
            var copy = source[key];
            if (source === copy)
                continue; // 如window.window === window，会陷入死循环，需要处理一下
            if (is(copy, "Object")) {
                result[key] = arguments.callee(result[key] || {}, copy);
            } else if (is(copy, "Array")) {
                result[key] = arguments.callee(result[key] || [], copy);
            } else {
                result[key] = copy;
            }
        }

        return result;

        function is(obj, type) {
            var toString = Object.prototype.toString;
            return (type === "Null" && obj === null)
                || (type === "Undefined" && obj === undefined)
                || toString.call(obj).slice(8, -1) === type;
        }
    }
    window['objCopy'] = objCopy;

    /**
     * post 打开新窗口窗口
     *
     * @param {}
     *            url
     * @param {}
     *            name
     * @param {}
     *            params
     * @return {window}
     */
    function openPostWindow(url, name, params) {

        var str = "";
        for (var key in params) {
            str += key + "=" + params[key] + "&";
        }
        str = str.substring(0, str.length - 1);
        window.open(url + "?" + str, "_top", "location=no");

        return;
        var newWindow = window.open('about:blank', name);
        if (!newWindow) {
            return false;
        }
        var html = "";
        html += "<html><head></head><body>";
        html += "<form id='formid' method='post' action='" + url + "'>";
        for (var k in params) {
            html += "<input type='hidden' name='" + k + "' value='" + params[k]
                + "'/>";
        }
        html += "</form>";
        html += "<script>document.getElementById(\"formid\").submit()</script>";
        html += "</body></html>";
        newWindow.document.open();
        newWindow.document.write(html);
        newWindow.document.close();
//		newWindow.onbeforeunload = function() {
//
//		}
        return newWindow;
    }

    window['openPostWindow'] = openPostWindow;

    /**
     * 提示窗口
     *
     * @param config {
	 *            title : '提示信息', content : "成功", state : 'info', mask : true,
	 *            autoClose : true, left : 'center', top : 'center', timeout :
	 *            10 * 1000, open : function(e, c) { }, close : function(e) { } }
     */
    function Mask(config, $dom) {
        var c = {
            title : '提示信息',
            content : "成功",
            state : 'info',
            mask : true,
            autoClose : false,
            left : 'center',
            top : 'center',
            timeout : 5 * 1000,
            open : function(e, c) {
            },
            close : function(e) {
            }
        };
        this.settings = {};
        $.extend(true, this.settings, c, config);
        this.init($dom);
    }

    Mask.prototype = {

        init : function($dom) {
            this.buildMask($dom);
            this.layout();
            if (this.settings.autoClose) {
                this.autoHidden();
            }

        },
        buildMask : function($dom) {
            var dom = ($dom || $('body'));

            this.$tipsDiv = $('<div class="tips tips-anm ' + 'tips-'
                + this.settings.state
                + '" style="opacity: 0;visibility:hidden;"></div>');
            this.$tipsTitle = $('<div>' + this.settings.title + '</div>');
            this.$tipsDiv.append(this.$tipsTitle);
            this.$tipsContent = $('<div style="max-width: 100px;"></div>')
                .append(this.settings.content);;
            this.$tipsDiv.append(this.$tipsContent);
            this.$mask = $('<div style="position: absolute;top:0;left:0;z-index: 99999;background: rgba(136, 136, 136, 0.5);opacity: 0.7;opacity: 0;visibility:hidden;"></div>');
            this.$mask.css({
                width : '100%',
                height : '100%'
            })
            if (this.settings.mask) {
                this.$mask.css({
                    'display' : 'block'
                });
            }
            this.$mask.append(this.$tipsDiv);
            dom.append(this.$mask);
        },
        layout : function() {
            var top, bottom, left, margin;
            switch (this.settings.left) {
                case 'center' :
                    left = '50%';
                    break;
                case 'left' :
                    left = '10px';
                    break;
            }

            switch (this.settings.top) {
                case 'center' :
                    top = '50%';
                    break;
                case 'bottom' :
                    bottom = '0';
                    break;
            }

            this.$tipsDiv.css({
                'left' : left,
                'top' : top,
                'bottom' : bottom,
                'position' : 'absolute',
                'padding' : '3px 5px',
                'font-size' : 14 + 'px',
                'z-index' : '9999',
                'margin' : '0 auto',
                'text-align' : 'center',
                'width' : 'auto',
                'opacity' : 1
            });
            this.$tipsDiv.css({
                'margin-left' : -1 * this.$tipsDiv.width(),
                'margin-top' : -1 * this.$tipsDiv.height()
            });

        },
        hide : function(callback) {
            var me =this;
            this.$tipsDiv.animate({
                'opacity' : '0'
            }, 600, function() {
                $(this).css('visibility', 'hidden');
            });
            this.$mask.animate({
                'opacity' : '0'
            }, 600, function() {
                $(this).css('visibility', 'hidden');
                if (callback)
                    callback();
            });
            if (this.closeId) {
                clearTimeout(this.closeId);
            }
        },
        show : function(config, callback) {

            if (config && config.title) {
                this.$tipsTitle.empty();
                this.$tipsTitle.html(config.title);
            }
            if (config && config.content) {
                this.$tipsDiv.empty();
                this.$tipsDiv.html(config.content);
            }

            this.$tipsDiv.css('visibility', 'visible').animate({
                'opacity' : '1'
            }, 0);

            this.$mask.css('visibility', 'visible').animate({
                'opacity' : '1'
            }, 0);
            if (this.settings.autoClose) {
                this.autoHidden(callback);
            } else {
                if (callback)
                    callback();
            }
        },
        events : function() {
            var me = this;
        },
        autoHidden : function(callback) {
            var me = this;
            this.closeId = setTimeout(function() {
                me.hide();
                if (callback)
                    callback();
            }, (this.settings.timeout));
        }

    }

    window['Mask'] = Mask;

    /**
     * 模拟setInterval var id = 0; waitInterval(function(timeId){ id = timeId;
	 * console.info(timeId); },1000) clearTimeout(id);
     *
     * @param fun
     * @param time
     * @param instantly
     * @returns {number}
     */
    function waitInterval(fun, time, instantly) {
        var t = setTimeout(function() {
            fun(waitInterval(fun, time));
        }, time);
        if (instantly) {
            fun(t);
        }
        // time+=Math.random()*1000;
        return t;

    }

    window['waitInterval'] = waitInterval;

    /**
     * 定时任务 new Task(fun,settings); fun 任务函数 settings:{ instantly:true,//是否立即执行
	 * time:60*100//周期默认1分钟 }
     *
     * 方法： 1.启动任务
     * start:参数2个proto,callback；proto原型任务函数中this的指向，默认是Task；callback任何函数的回调，都可为空
     * 2.重启任务
     * restart:参数三个proto,settings,callback；proto原型任务函数中this的指向，默认是Task；settings重新定义任务参数;callback任何函数的回调，都可为空
     * 3.停止任务 stop:无参数
     *
     * 示例： var task1 = new Task(function(){ me.test('aaaaa'); },{ time:10001
	 * }).start();
     *
     * var task2 = new Task(this.test,{ time:10002 }).start(this);
     *
     * task1.restart();
     *
     *
     */
    function Task(fun, settings) {

        if (!fun)
            console.error('fun is undefined!');
        this.fun = fun;
        this.settings = $.extend({}, {
            instantly : true,
            time : 60 * 100
        }, settings)

    }

    Task.prototype = {
        fun : undefined,
        timeid : 0,
        start : function(proto, callback) {
            var me = this;
            waitInterval(function(timeid) {
                me.timeid = timeid;
                me.fun.apply(proto ? proto : this);
                if (callback)
                    callback(this);
            }, this.settings.time, this.settings.instantly);
            return this;
        },
        restart : function(proto, settings, callback) {
            if (settings) {
                this.settings = $.extend({}, {
                    instantly : true,
                    time : 60 * 100
                }, settings);
            }
            this.stop();
            this.start(proto, callback);
        },
        stop : function() {
            clearTimeout(this.timeid);
            return this;
        }
    }
    window.Task = Task;

    /**
     * .label-value 自动填写 <div class="c"> <span class="label-value" name="name"></span>
     * </div> $('..label-value').setDivValue({name:'张三'})
     *
     * @param data
     * @returns {jQuery}
     */
    $.fn.setDivValue = function(data, trigger) {
        var renderDoms = [];
        var otherDoms = [];

        this.find('.label-value').each(function() {
            var keys = $(this).attr('name').split('.');
            var obj = data;
            for (var i = 0, l = keys.length; i < l; i++) {
                if (obj[keys[i]] != null) {
                    obj = obj[keys[i]];
                } else {
                    obj = "";
                }
            }
            var renderer = $(this).attr('renderer');
            if (renderer) {
                renderDoms.push({
                    dom : this,
                    funs : renderer.split('.'),
                    value : obj
                });
            } else {
                otherDoms.push({
                    dom : this,
                    value : obj
                });
            }

        });

        var RenderValue = function(dom, obj) {
            if ($(dom).is('input')) {
                if ($(dom).attr('type') == 'checkbox') {
                    if (dom.value == obj) {
                        $(dom).attr('checked', true);
                    } else {
                        $(dom).attr('checked', false);
                    }
                    if (trigger) {
                        $(dom).trigger('change');
                    }
                } else if ($(dom).attr('type') == 'radio') {
                    if (obj != null) {
                        $(dom).parent().find('input[value="' + obj + '"]')
                            .attr("checked", true);
                    }
                } else {
                    $(dom).val(obj);
                }
            } else if ($(dom).is('select')) {
                if (obj != null) {
                    $(dom).find('option[value="' + obj + '"]').attr("selected",
                        true);
                }
            } else {
                $(dom).html(obj);
            }
        }

        for (var i = 0; i < renderDoms.length; i++) {
            var obj = renderDoms[i].value, funcs = renderDoms[i].funs;
            var fun = eval(funcs[0]);
            for (var j = 1; j < funcs.length; j++) {
                if (fun[funcs[j]] != null) {
                    fun = fun[funcs[j]];
                }
            }
            obj = fun(obj, renderDoms[i].dom);
            if (obj)
                RenderValue(renderDoms[i].dom, obj);
        }

        for (var i = 0; i < otherDoms.length; i++) {
            RenderValue(otherDoms[i].dom, otherDoms[i].value);
        }
        renderDoms = [], otherDoms = [], RenderValue = undefined;

        return this;
    }

    function randomColor(dataIndex, opacity) {
        var colorScale = d3.scaleLinear().domain([0, 10]).range([0, 1])
            .clamp(true);
        var rainbow = d3.scaleSequential(d3.interpolateWarm);
        if (!dataIndex) {
            dataIndex = Math.random();
        }
        if (opacity != undefined) {
            var c = d3.color(rainbow(colorScale(dataIndex)));
            return d3.rgb(c.r, c.g, c.b, opacity);
        }

        return rainbow(colorScale(dataIndex));
    }

    window['randomColor'] = randomColor;

    function getRealPath() {

        var curWwwPath = window.document.location.href;
        var pathName = window.document.location.pathname;
        var ps = pathName.split('/');
        var pos = curWwwPath.indexOf(pathName);
        // http://localhost:8083
        var localhostPaht = curWwwPath.substring(0, pos);
        if (ps[ps.length - 1] == '') {
            var projectName = pathName.substring(0, pathName.substr(1)
                    .indexOf('/')
                + 1);
            var realPath = localhostPaht + projectName;
            return realPath;
        }
        if (pathName.split('/').length > 3) {
            var projectName = pathName.substring(0, pathName.substr(1)
                    .indexOf('/')
                + 1);
            var realPath = localhostPaht + projectName;
            return realPath;
        } else {

            return localhostPaht;
        }

    }

    window['getRealPath'] = getRealPath;

    /**
     * 获取顶级window
     */
    function getTopWindow() {
        var win;

        function home(w) {
            if (w.top === w.self) { // are you trying to put self in an iframe?
                win = w;
            } else {
                home(w.parent);
            }
        }

        home(window);
        return win;
    }

    window['getTopWindow'] = getTopWindow;


    window.UIalert = function() {
        var msg,config,callback;
        if(arguments.length==1){
            msg = arguments[0];
        }else if(arguments.length==2){
            msg = arguments[0],config = arguments[1];
        }else{
            msg = arguments[0],callback = arguments[1],config = arguments[2];
        }
        var alerttip = document.createElement("DIV");
        alerttip.id = "alerttip"+(+new Date())+Math.random()*99999;
        alerttip.className = "alerttip";
        alerttip.style.position = 'fixed';
        alerttip.style.top = '5px';
        alerttip.style.width = '100%';
        alerttip.style.height = '100%';
        alerttip.style.zIndex = 10000;
        alerttip.style.opacity = 0;

        var alertBody = document.createElement("DIV");
        alertBody.className = "alert-body";
        alertBody.style.margin = "0 auto";
        strHtml = '';
        strHtml += '<div class="alert-title"><label style="float: left;">提示信息</label><span class="alert-close" style="float:right;padding-right: 8px;" onclick="doOk()">x</span></div>\n';
        strHtml += '<div class="alert-content"><span style="text-align:center;font-size:16px;">'+ msg + '</span> </div>\n';
        strHtml += '<div class="alert-btns" style="text-align: center;"><button class="btn btn-primary btn-xs" onclick="doOk()">确定</button></div>';
        strHtml += '';
        alertBody.innerHTML = strHtml;
        alerttip.appendChild(alertBody);
        document.body.appendChild(alerttip);
        alertBody.style.marginTop=window.innerHeight/2-alertBody.getBoundingClientRect().height/2+'px';
        $(alerttip).animate({
            'opacity' : '1'
        }, 600);

        if(config){
            if(config.timeout){
                setTimeout(function() {
                    $(alerttip).animate({
                        'opacity' : '0'
                    }, 600, function() {
                        $(this).remove();
                    });
                }, config.timeout)
            }
        }else{
            setTimeout(function() {
                $(alerttip).animate({
                    'opacity' : '0'
                }, 600, function() {
                    $(this).remove();
                });
            }, 1500)

        }


        this.doOk = function() {
            $(alerttip).animate({
                'opacity' : '0'
            }, 600, function() {
                $(this).remove();
            });
            if (callback) {
                callback();
            }
        }
        alerttip.focus();
        document.body.onselectstart = function() {
            return false;
        };
    }

    window.confirm = function(str, callback, fixed) {

        var alerttip = document.createElement("DIV");
        alerttip.id = "alerttip"+(+new Date())+Math.random()*99999;
        alerttip.className = "alerttip";
        alerttip.style.position = 'fixed';
        alerttip.style.top = '5px';
        alerttip.style.width = '100%';
        alerttip.style.height = '100%';
        alerttip.style.zIndex = 10000;
        alerttip.style.opacity = 0;

        var alertBody = document.createElement("DIV");
        alertBody.className = "alert-body";
        alertBody.style.margin = "0 auto";
        strHtml = '';
        strHtml += '<div class="alert-title"><label style="float: left;">提示信息</label><span class="alert-close" style="float:right;padding-right: 8px;" onclick="doCancel()">x</span></div>\n';
        strHtml += '<div class="alert-content"><span style="text-align:center;font-size:16px;">'+ str + '</span> </div>\n';
        strHtml += '<div class="alert-btns" style="text-align: center;"><button class="btn btn-primary btn-xs" onclick="doCancel()">取消</button><button class="btn btn-primary btn-xs" onclick="doOk()">确定</button></div>';
        alertBody.innerHTML = strHtml;
        alerttip.appendChild(alertBody);
        document.body.appendChild(alerttip);
        alertBody.style.marginTop=window.innerHeight/2-alertBody.getBoundingClientRect().height/2+'px';
        $(alerttip).animate({
            'opacity' : '1'
        }, 600);
        var r = true;
        this.doOk = function() {
            $(alerttip).animate({
                'opacity' : '0'
            }, 600, function() {
                $(this).remove();
            });
            if (callback) {
                callback(true);
            }
        }
        this.doCancel = function() {
            $(alerttip).animate({
                'opacity' : '0'
            }, 600, function() {
                $(this).remove();
            });
            if (callback) {
                callback(false);
            }
        }

        alerttip.focus();
        document.body.onselectstart = function() {
            return false;
        };
    }



})(jQuery);
