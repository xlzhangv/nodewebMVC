(function($) {
    function home(w) {
        if (w.top === w.self) {
            if( sessionStorage.getItem('login')){
                w.location.href = sessionStorage.getItem('login');
            }else{
                w.location.href = '/login';
            }

        } else {
            home(w.parent);
        }
    }
	$(document).bind('ajaxSuccess',function(){
	
	})


	$(window).bind('beforeunload', function() {
				$(document).off();
				//$('.authority-button').off(".authority");
			});
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
        var newWindow = window.open(url, name);
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
        newWindow.onbeforeunload = function() {

        }
        return newWindow;
    }

    window['openPostWindow'] = openPostWindow;

    /**
	 * 提示窗口
     * @param config
	 * {
     * 	title : '提示信息',
			content : "成功",
			state : 'info',
			mask : true,
			autoClose : true,
			left : 'center',
			top : 'center',
			timeout : 10 * 1000,
			open : function(e, c) {
			},
			close : function(e) {
			}
     * }
     */
	function showTips(config) {
		// mini-tips-danger
		// mini-tips-success
		var c = {
			title : '提示信息',
			content : "成功",
			state : 'info',
			mask : true,
			autoClose : true,
			left : 'center',
			top : 'center',
			timeout : 10 * 1000,
			open : function(e, c) {
			},
			close : function(e) {
			}
		};
		var nc = {};
		$.extend(true, nc, c, config);
		var windowWidth = document.documentElement.clientWidth;
		var windowHeight = document.documentElement.clientHeight;
		var tipClass = 'tips-' + nc.state;
		var $tipsDiv = $('<div class="tips tips-anm ' + tipClass + '"></div>').append('<p>'
				+ nc.title + '</p>').append(nc.content);
		var $mask = $('<div style="position: fixed;top:0;left:0;height: 100%;width: 100%;z-index: 99;background: rgba(136, 136, 136, 0.5);opacity: 0.7;display:none;"></div>');
		if (nc.mask) {
			$mask.css({
						'display' : 'block'
					});
		}
		$('body').append($tipsDiv);
		$('body').append($mask);

		var top, bottom, left, margin;

		switch (nc.left) {
			case 'center' :
				left = '50%';
				break;
			case 'left' :
				left = '10px';
				break;
		}

		switch (nc.top) {
			case 'center' :
				top = '50%';
				break;
			case 'bottom' :
				bottom = '0';
				break;
		}
		// left=((windowWidth / 2)-($tipsDiv.width()/2))+"px";

		$tipsDiv.css({
					'left' : left,
					'top' : top,
					'bottom' : bottom,
					'position' : 'fixed',
					'padding' : '3px 5px',
					'font-size' : 12 + 'px',
					'z-index' : '9999',
					'margin' : '0 auto',
					'text-align' : 'center',
					'width' : 'auto',
					'opacity': 1
				});
		$tipsDiv.css({
					'margin-left' : -1 * $tipsDiv.width()
				});

		$tipsDiv.show("slow", function() {
					nc.open($tipsDiv, nc);
				});
		$tipsDiv.hidden = function() {
			$tipsDiv.animate({
				'opacity': 0
			},"slow",function(){
				$(this).remove();
			});
			$mask.animate({
				'opacity': 0
			},'slow',function(){
				$(this).remove();
			});
		}
		if (nc.autoClose) {
			setTimeout(function() {
						$tipsDiv.fadeOut("fast", function() {
									nc.close($tipsDiv, nc);
									$tipsDiv.hide('slow', function() {
												$tipsDiv.remove();
												$mask.remove();
											});

								});
					}, (nc.timeout));
		}

		return $tipsDiv;

	}
	window['showTips'] = showTips;

    /**
	 * 模拟setInterval
     * @param fun
     * @param time
     * @param instantly
     * @returns {number}
     */
	function waitInterval(fun, time, instantly) {
		if (instantly) {
			fun();
		}
//		time+=Math.random()*1000;
		return setTimeout(function() {
					fun();
					waitInterval(fun, time);
				}, time);
	}

	window['waitInterval'] = waitInterval;

	$.fn.buildTbody = function(templateId, d, max, callback) {
		var tr = [];
		var trH = 51;
		if (!d || d.length == 0) {
			var $tr = $('<tr><td colspan="10">暂无数据</td></tr>')
			$tr.fadeIn("slow");
			tr.push($tr);
		}

		var me = this;
		try {
			if (max === 0) {
				var h = this.parents('table').parent().height() - 10;
				var count = Math.round(h / trH) - 1;
				max = count;
			}

			if (d instanceof Array) {
				var nowCount = this.find('tr').length;

				if (max) {
					if (nowCount >= parseInt(max)) {
						this.empty();
						nowCount = 0;
					}
				}

				$.each(d, function(i, d) {
							d.index = i + 1;
							if (max != -1) {
								if (nowCount >= parseInt(max)) {
									me.find('tr').last().remove();
								}
							}

							nowCount++;
							var $tr = $(template(templateId, d));
							$tr.data('d', d);
							// $tr.fadeIn("slow");
							me.append($tr);

						});

			} else {
				var $tr = $(template(templateId, d))
				$tr.fadeIn("slow");
				$tr.data('d', d);
				tr.push($tr);
				if (max != -1) {
					if (max) {
						if (this.find('tr').length >= parseInt(max)) {
							this.find('tr').last().remove();
						}
					}
				}

			}

			this.prepend(tr);
			if (callback) {
				callback(d, this);
			}
		} catch (e) {

		}
	}
    /**
	 * .label-value 自动填写
	 * <div class="c">
	 * <span class="label-value" name="name"></span>
	 * </div>
	 * $('..label-value').setDivValue({name:'张三'})
     * @param data
     * @returns {jQuery}
     */
	$.fn.setDivValue = function(data) {
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
						var funcs = renderer.split('.');
						var fun = eval(funcs[0]);
						for (var i = 1; i < funcs.length; i++) {
							if (fun[funcs[i]] != null) {
								fun = fun[funcs[i]];
							}
						}
						obj = fun(obj);
					}
					if ($(this).is('input')) {
						$(this).val(obj);
					} else {
						$(this).html(obj);
					}

				});
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



    window.UIconfirm = function (settings,dom) {

    	this.dom = dom;
        this.settings={
            title : '提示信息',
            content : "成功",
        	autoClose:false,
            flagColor:'',
            time:5,
            step:1000,
            params:null,
			btns:['ok','cancel'],
            event:{
            	ondestroy:function () {

                },
                interval:function () {

                },
                onOk:function (d) {

                },
				onCancel:function (d) {
					
                }
            }
        }
        this.settings = objCopy(this.settings,settings);
    	this.init();

    }
    window.UIconfirm.prototype={
    	check:true,
    	comfimTitle:undefined,
		comfimflag:undefined,
		comfimBody:undefined,
        confirmContent:undefined,
    	confimDom:undefined,
		comfimBtn:undefined,
        comfimtimeDom:undefined,
		okBtn:undefined,
        cancelBtn:undefined,
    	init:function () {
    		this.buildConfim();
        },
		buildConfim:function () {
			var me =this;
            this.confimDom = document.createElement("div");
            this.confimDom.id = "confim-tip"+(+new Date())+Math.random()*99999;
            this.confimDom.className = "confim-tip";
            this.confimDom.style.position = 'absolute';
            this.confimDom.style.zIndex = 1000000;
            this.confimDom.style.opacity = 0;
            this.confimDom.style.visibility = 'hidden';


            this.comfimBody = document.createElement("div");
            this.comfimBody.className = "confirm-body";
            this.comfimBody.style.margin = "0 auto";


            this.confimDom.appendChild(this.comfimBody);

            this.comfimTitle =  document.createElement("div");
            this.comfimTitle.className = "confirm-title";

            this.comfimflag =  document.createElement("div");
            this.comfimflag.className = "confirm-title-flag";
            this.comfimTitle.appendChild(this.comfimflag);
            this.comfimflag.innerHTML =this.settings.title;


            this.comfimBody.appendChild(this.comfimTitle);


            this.confirmContent =  document.createElement("div");
            this.confirmContent.className = "confirm-content";
            this.confirmContent.innerHTML = this.settings.content;

            this.comfimBody.appendChild(this.confirmContent);


            // this.comfimtimeDom =  document.createElement("p");
            // this.comfimtimeDom.className = "confirm-time";
            //
            //
            // this.comfimBody.appendChild(this.comfimtimeDom);



            this.comfimBtn =  document.createElement("div");
            this.comfimBtn.className = "confirm-btns";


            this.okBtn =  document.createElement("button");
            this.okBtn.innerHTML='确认';
            this.okBtn.className = "btn btn-primary btn-xs confirm-time";
            this.okBtn.onclick = function () {
                me.check=true;
				me.destroy(function () {
                    me.settings.event.onOk(me.settings.params);
                });
            }
			if(this.settings.btns.indexOf('ok')!=-1){
                this.comfimBtn.appendChild(this.okBtn);
			}


            this.cancelBtn =  document.createElement("button");
            this.cancelBtn.innerHTML = '取消';
            this.cancelBtn.className = "btn btn-primary btn-xs";
            this.cancelBtn.onclick = function () {
            	me.check = false;
                me.destroy(function () {
                    me.settings.event.onCancel(me.settings.params);
                });
			}
            if(this.settings.btns.indexOf('cancel')!=-1) {
                this.comfimBtn.appendChild(this.cancelBtn);
            }

            this.comfimBody.appendChild(this.comfimBtn);

			(this.dom||document.body).appendChild(this.confimDom);
        },
        trigger:function (type) {
    		var me =this;
			if(type=='ok'){
                me.check=true;
                me.destroy(function () {
                    me.settings.event.onOk(me.settings.params,me.check);
                });
			}
			if(type=='cancel'){
                me.check = false;
                me.destroy(function () {
                    me.settings.event.onCancel(me.settings.params,me.check);
                });
			}
        },
		move:function (point) {
			$(this.confimDom).css({
                'left':point.left,
                'top':point.top,
			})
			return this;
        },
		build:function (settings) {
            if(settings){
                this.settings = objCopy(this.settings,settings);
                this.comfimflag.innerHTML =this.settings.title;
                this.comfimflag.style.backgroundColor = this.settings.flagColor;
                this.confirmContent.innerHTML = this.settings.content;
            }
            return this;
        },
		show:function (settings) {
			if(settings){
                this.settings = objCopy(this.settings,settings);
                this.comfimflag.innerHTML =this.settings.title;
                this.comfimflag.style.backgroundColor = this.settings.flagColor;
                this.confirmContent.innerHTML = this.settings.content;
			}

			this.autoClose();
            $(this.confimDom).animate({
                'opacity' : '1'
            },500,function () {
                $(this).css({
                    'visibility':'visible'
                });
            });
        },
		hidden:function (callback) {
            clearTimeout(this.intervalid);
            $(this.confimDom).animate({
                'opacity' : '0'
            }, 600, function() {
                $(this).css({
                    'visibility':'hidden'
                });
                if(callback)callback();
                // this.remove();
            });
        },
		startInterval:function () {
    		var me =this;
            clearTimeout(me.intervalid);
            this.intervalid = waitInterval(function (t) {
                me.intervalid  = t;
                me.settings.time-=1;
                me.okBtn.innerHTML = '确认('+me.settings.time+'s)';
                me.settings.event.interval(me.settings.time,me.settings.params);
                if(me.settings.time==0){
                    me.destroy(function () {
                        me.settings.event.onOk(me.settings.params);
                    });
                    clearTimeout(me.intervalid);
                }
            },this.settings.step);
        },
		stopInterval:function () {
            clearTimeout(this.intervalid);
        },
		autoClose:function () {
			var me =this;
			if(this.settings.autoClose){
				if(!this.intervalid){
                    this.startInterval();
				}
			}
        },
        destroy:function (callback) {
    		var me =this;
            clearTimeout(me.intervalid);
            $(this.confimDom).animate({
                'opacity' : '0'
            }, 600, function() {
            	me.settings.event.ondestroy.call(me,me.settings.params,me.check);
            	$(this).css({
                    'visibility':'hidden'
				});

                if(callback)callback();
                // this.remove();
            });

        }

	}


})(jQuery);
