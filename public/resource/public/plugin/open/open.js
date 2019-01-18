(function() {

    __getJSPath = function(js) {
        var scripts = document.getElementsByTagName("script");
        var path = "";
        for (var i = 0, l = scripts.length; i < l; i++) {
            var src = scripts[i].src;
            if (src.indexOf(js) != -1) {
                var ss = src.split(js);
                path = ss[0];
                break;
            }
        }
        var href = location.href;
        href = href.split("#")[0];
        href = href.split("?")[0];
        var ss = href.split("/");
        ss.length = ss.length - 1;
        href = ss.join("/");
        if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1
            && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
            path = href + "/" + path;
        }
        return path;
    }

    var BASE_PATH = __getJSPath("open.js");
    var BOOTSRTAP_TEMPLATE;

    $.ajax({
        url : BASE_PATH + 'bootstrap-win.html',
        dataType : 'html',
        async : true,
        success : function(d) {
            BOOTSRTAP_TEMPLATE = d;
        }
    });

    function openWin(opt) {
        var opt = $.extend({
            autoRemove : true,
            removeAll : true,
            ratio : 0.583333,
            width : 1000
        }, opt);
        opt.bgheight = opt.width * opt.ratio;
        opt.hiddenDone = opt.hiddenDone === undefined ? "" : opt.hiddenDone;
        if(opt.hiddenDone) {
            opt.height = opt.bgheight - 20;
        }else{
            opt.height = opt.bgheight - 100;
        }


        this.init(opt);
        return this;
    }

    openWin.prototype = {
        $modal : undefined,
        _id : undefined,
        _modalId : undefined,
        events : {},
        winId : function() {
            if (!this._id) {
                this._id = new Date().getTime() + '-win';
            }
            return this._id;
        },
        modalId : function() {
            if (this._modalId) {
                return this._modalId;
            }
            var id = this.winId();
            return this._modalId = id + '-modal';
        },
        getWindow : function() {
            var me = this;
            var win;
            function home(w) {
                if (w.top === w.self) { // are you trying to put self in an
                    // iframe?
                    win = w;
                } else {
                    home(w.parent);
                }
            }
            home(window);

            return win;
        },

        appendWin : function(opt, topWin) {
            var me = this;
            if (opt.removeAll) {
                topWin.$('body').find('.custom-win').remove();
            }
            topWin.$('body').append(template.compile(BOOTSRTAP_TEMPLATE)(opt));
            var win = topWin.$('body').find('#' + opt.id);
            me.$modal = win.find('#' + opt.modalId);
            me.$modal.find('.custom-dialog').css(me.getWindow().Share
                    .data('modalCss')
                || {});
            var offTop = (me.getWindow().innerHeight-opt.bgheight)/2;
            d3.select(me.$modal.find('.custom-dialog')[0]).style('top',offTop+'px').style('left','30%').call(me._Drag);
            me.$modal.on('hidden.bs.modal', function(e) {
                d3.select(me.$modal.find('.custom-dialog')[0]).on(
                    '.drag', null);
                var iframe = $(this).find('iframe')[0];
                if (opt.hiden) {
                    opt.hiden(iframe.contentWindow, iframe);
                }
                if (me.events.hidden) {
                    me.events.hidden(me);
                }
                if (opt.autoRemove) {
                    me.remove();
                }

            });
            me.$modal.on('shown.bs.modal', function(e) {
                var iframe = $(this).find('iframe')[0];

                if (opt.show) {
                    opt.show(iframe.contentWindow, iframe);
                }
                if (me.events.show) {
                    me.events.show(iframe.contentWindow, iframe);
                }
                iframe.contentWindow.$modal = me.$modal;
                if (iframe.contentWindow.panelLayout) {
                    setTimeout(function() {
                        iframe.contentWindow.panelLayout();
                    })
                }

            });
            if (opt.open) {
                me.$modal.modal('show');
            }

        },
        init : function(opt) {
            var me = this;
            opt['id'] = me.winId();
            opt['modalId'] = me.modalId();
            var topWin = this.getWindow();
            var win = topWin.$('body').find('#' + me.winId());
            me.buildDrag();
            if (win.length == 0) {
                this.appendWin(opt, topWin);
            } else {
                me.$modal = win.find('#' + opt.modalId);
                d3.select(me.$modal.find('.custom-dialog')[0]).call(me._Drag);
                this.show();
                me.$modal.on('hidden.bs.modal', function(e) {
                    d3.select(me.$modal.find('.custom-dialog')[0]).on(
                        '.drag', null);
                    var iframe = $(this).find('iframe')[0];
                    if (opt.hiden) {
                        opt.hiden(iframe.contentWindow, iframe);
                    }
                    if (me.events.hidden) {
                        me.events.hidden(me);
                    }
                    if (opt.autoRemove) {
                        me.remove();
                    }

                });
            }

        },
        show : function(fun) {
            this.$modal.modal('show');
            this.events.show = fun;
        },
        hide : function(fun) {
            this.$modal.modal('hide');
            this.events.hidden = fun;
        },
        remove : function() {

            this.$modal.find('iframe').each(function() {
                this.contentWindow.document.write('');// 清空iframe的内容
                this.contentWindow.close();// 避免iframe内存泄漏
                this.remove();
            });

            this.$modal.parent().off();
            this.$modal.parent().remove();
        },
        buildDrag : function() {

            this._Drag = d3.drag().on('start', function(d) {
                var offset = this.offset = $(this).offset();
                var point = d3.event;
                this.startX = point.x;// 兼容所有
                this.startY = point.y;
            }).on('drag', function(d) {
                var point = d3.event;
                var top = point.y - this.startY + this.offset.top;
                var left = point.x - this.startX + this.offset.left;
                var dw = $(this).outerWidth(), dh = $(this).outerHeight(), bw = $(this)
                    .parent().width(), bh = $(this).parent().height();
                if ((left + dw) > bw)
                    left = bw - dw;
                if ((top + dh) > bh)
                    top = (bh - dh);
                if (top < 0)
                    top = 0;
                if (left < 0)
                    left = 0;

                this.left = left;
                this.top = top;

                $(this).css({
                    left : left,
                    top : top
                });

            }).on('end', function() {
                if (this.top == undefined || this.left == undefined) {
                    return;
                }
                $(this).css({
                    right : 'auto',
                    top : this.top,
                    left : this.left
                });
            });
        }

    }
    window.openWin = openWin;
})()