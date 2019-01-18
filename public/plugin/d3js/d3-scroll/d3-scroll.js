(function (d3, win) {

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

    // if ("undefined" != typeof Node) {
    //     Object.defineProperty(Node.prototype, 'classList', {
    //         get: function () {
    //             var self = this;
    //
    //             function update(fn) {
    //                 return function (value) {
    //                     var classes = self.getAttribute('class')?self.getAttribute('class').split(/\s+/g):[],
    //                         index = classes.indexOf(value);
    //
    //                     fn(classes, index, value);
    //                     self.setAttribute('class', classes.join(" "));
    //                 }
    //             }
    //
    //             return {
    //                 add: update(function (classes, index, value) {
    //                     if (!~index) classes.push(value);
    //                 }),
    //
    //                 remove: update(function (classes, index) {
    //                     if (~index) classes.splice(index, 1);
    //                 }),
    //
    //                 toggle: update(function (classes, index, value) {
    //                     if (~index)
    //                         classes.splice(index, 1);
    //                     else
    //                         classes.push(value);
    //                 })
    //             };
    //         }
    //     });
    // }
    // if ("undefined" != typeof Element) {
    //     Object.defineProperty(Element.prototype, 'classList', {
    //         get: function () {
    //             var self = this;
    //
    //             function update(fn) {
    //                 return function (value) {
    //                     var classes = self.getAttribute('class')?self.getAttribute('class').split(/\s+/g):[],
    //                         index = classes.indexOf(value);
    //
    //                     fn(classes, index, value);
    //                     self.setAttribute('class', classes.join(" "));
    //                 }
    //             }
    //
    //             return {
    //                 add: update(function (classes, index, value) {
    //                     if (!~index) classes.push(value);
    //                 }),
    //
    //                 remove: update(function (classes, index) {
    //                     if (~index) classes.splice(index, 1);
    //                 }),
    //
    //                 toggle: update(function (classes, index, value) {
    //                     if (~index)
    //                         classes.splice(index, 1);
    //                     else
    //                         classes.push(value);
    //                 })
    //             };
    //         }
    //     });
    //
    // }
    //
    // if ("undefined" != typeof SVGRectElement) {
    //     Object.defineProperty(SVGRectElement.prototype, 'classList', {
    //         get: function () {
    //             var self = this;
    //
    //             function update(fn) {
    //                 return function (value) {
    //                     var classes = self.getAttribute('class')?self.getAttribute('class').split(/\s+/g):[],
    //                         index = classes.indexOf(value);
    //
    //                     fn(classes, index, value);
    //                     self.setAttribute('class', classes.join(" "));
    //                 }
    //             }
    //
    //             return {
    //                 add: update(function (classes, index, value) {
    //                     if (!~index) classes.push(value);
    //                 }),
    //
    //                 remove: update(function (classes, index) {
    //                     if (~index) classes.splice(index, 1);
    //                 }),
    //
    //                 toggle: update(function (classes, index, value) {
    //                     if (~index)
    //                         classes.splice(index, 1);
    //                     else
    //                         classes.push(value);
    //                 })
    //             };
    //         }
    //     });
    // }

    function d3scroll(selectionContent,options) {
        if(options) this.options = options;
        this.id = +(new Date())+'-'+Math.round(Math.random()*1000000);
        if(!options.disable){
        		this.init(selectionContent);
        }
    }
    d3scroll.prototype = {
        __active:false,
        __wheeling:false,//是否滚动
        __scrollVbar : undefined,//滚动条
        __scrollHbar : undefined,//滚动条
        __scrollbarVTrackPiece:undefined,//轨道
        __scrollbarHTrackPiece:undefined,//轨道
        __scrollbarVBody:undefined,//滚动条身体
        __scrollbarHBody:undefined,//滚动条身体
        __contentOffsetTop: 0,
        __contentOffsetLeft:0,
        __domchangeTime: undefined,
        __wheelTimeId: undefined,
        options : {
            step: 25,
            autoscrollbar:true,
            animation: true,
            style: {
                hover:{
                    scrollbar: {
                        'opacity': '1'
                    },
                    scrollbarTrackPiece: {

                    }
                },
                leave:{
                    scrollbar: {
                        'opacity': '0',
                        'background': 'hsla(0, 0%, 100%, 0.75)'
                    },
                    scrollbarTrackPiece: {

                    }
                },
                active:{
                    scrollbar: {
                        'opacity': '1',
                        'background': 'hsla(0, 0%, 100%, 1)'
                    },
                    scrollbarTrackPiece: {

                    }
                },
                _static:{
                    scrollbar: {
                        'border-radius': '16px',
                        'background': 'hsla(0, 0%, 100%, 0.75)'
                    },
                    scrollbarTrackPiece: {
                        'background': 'transparent'
                    }
                }

            },

            events: {
                /**
                 * 动画结束
                 */
                hover: function (scrollbar,scrollbarTrackPiece) {

                },
                leave: function (scrollbar,scrollbarTrackPiece) {

                },
                active: function (scrollbar,scrollbarTrackPiece) {

                },
                scroll: function (scrollbar,scrollbarTrackPiece) {

                }
            }
        },
        init: function (selectionContent) {
            this.__viewContent = selectionContent;
            var pbody = selectionContent.node().parentElement.parentElement.getBoundingClientRect();
            this.__viewBody = d3.select(selectionContent.node().parentElement).attr('class',function(){
            			this.classList.add('d3-scroll');
                    return this.className;
            }).style('overflow', 'hidden').style('position', 'relative').style('height',pbody.height+'px').style('width',pbody.width+'px');
            this.__createScrollbar();
            this.__scrollbarResize();
            this.__setEvents();
        },
        __initConfig: function () {
            // return {
            //     contentWidth: this.__viewContent.node().clientWidth,
            //     contentOffsetLeft:this.__contentOffsetLeft,
            //     viewBodyWidth: this.__viewBody.node().clientWidth,
            //     scrollbarWidth: this.__scrollVbar.node().clientWidth
            // }
            // this.__viewBody.style('height',pbody.height+'px').style('width',pbody.width+'px');
            return {
                contentHeight: this.__viewContent.node().getBoundingClientRect().height,
                contentOffsetTop: this.__contentOffsetTop,
                contentOffsetLeft: this.__contentOffsetLeft,
                viewBodyHeight: this.__viewBody.node().getBoundingClientRect().height,
                scrollbarHeight: this.__scrollVbar.node().getBoundingClientRect().height,

                contentWidth: this.__viewContent.node().getBoundingClientRect().width,
                viewBodyWidth: this.__viewBody.node().getBoundingClientRect().width,
                scrollbarWidth: this.__scrollHbar.node().getBoundingClientRect().width
            }
        },
        __setEvents: function () {
            var me = this;
          
            this.__viewBody.on('mousewheel DOMMouseScroll', function (e) {

                e = d3.event||window.event;
                if (e.stopPropagation) {//这是取消冒泡
                    e.stopPropagation();
                } else{
                    e.cancelBubble = true;
                };
                if (e.preventDefault) {//这是取消默认行为，要弄清楚取消默认行为和冒泡不是一回事
                    e.preventDefault();
                } else{
                    e.returnValue = false;
                };

                if(me.__wheeling)me.__wheelEvent();
                return false;
            }).on('DOMNodeInserted DOMNodeRemoved', function () {
                if (me.__domchangeTime) clearTimeout(me.__domchangeTime);
                me.__domchangeTime = setTimeout(function () {
                    me.__scrollbarResize();
                });
            }).on('mouseenter', function(d) {
                d3.event.stopPropagation();
                me.options.events.hover(me.__scrollVbar,me.__scrollbarVTrackPiece);
                me.__changeStyle('hover');
            }).on('mouseleave', function(d) {
                d3.event.stopPropagation();
                me.options.events.leave(me.__scrollVbar,me.__scrollbarVTrackPiece);
                me.__changeStyle('leave');
            });

        },
        __changeStyle:function(type){
            var config = this.__initConfig();

            if (config.contentWidth > config.viewBodyWidth) {
                if(this.__active){
                    this.__setStyle(this.__scrollHbar,this.options.style.active.scrollbar);
                    this.__setStyle(this.__scrollbarHTrackPiece,this.options.style.active.scrollbarTrackPiece);
                    return;
                }
                switch (type){
                    case 'hover':
                        this.__setStyle(this.__scrollHbar,this.options.style.hover.scrollbar);
                        this.__setStyle(this.__scrollbarHTrackPiece,this.options.style.hover.scrollbarTrackPiece);
                        break;
                    case 'leave':
                        this.__setStyle(this.__scrollHbar,this.options.style.leave.scrollbar);
                        this.__setStyle(this.__scrollbarHTrackPiece,this.options.style.leave.scrollbarTrackPiece);
                        break;
                }
            }
            if (config.contentHeight > config.viewBodyHeight) {
                if(this.__active){
                    this.__setStyle(this.__scrollVbar,this.options.style.active.scrollbar);
                    this.__setStyle(this.__scrollbarVTrackPiece,this.options.style.active.scrollbarTrackPiece);
                    return;
                }
                switch (type){
                    case 'hover':
                        this.__setStyle(this.__scrollVbar,this.options.style.hover.scrollbar);
                        this.__setStyle(this.__scrollbarVTrackPiece,this.options.style.hover.scrollbarTrackPiece);
                        break;
                    case 'leave':
                        this.__setStyle(this.__scrollVbar,this.options.style.leave.scrollbar);
                        this.__setStyle(this.__scrollbarVTrackPiece,this.options.style.leave.scrollbarTrackPiece);
                        break;
                }
            }
        },
        __createVerticalScrollbar:function () {
            var me = this;

            this.__scrollbarVBody =this.__viewBody
                .append('div').attr('class', 'd3-view-scroll-body d3-view-scroll-v-body').style('position', 'absolute').style('height','100%');

            this.__scrollbarVTrackPiece = this.__scrollbarVBody.append('div').attr('class', 'd3-scrollbar-track-piece d3-view-v-scroll').style('height','100%');

            this.__scrollVbar = this.__scrollbarVBody.append('div').attr('class','d3-view-scrollbar d3-view-v-scrollbar').attr('class', function () {
                if (me.options.animation) this.classList.add('d3-view-scrollbar-anim');
                return this.className;
            }).style('height', '0px').style('margin-top', '-2px');
        },
        __createHorizontalScrollbar:function () {
            var me = this;

            this.__scrollbarHBody =this.__viewBody
                .append('div').attr('class', 'd3-view-scroll-body d3-view-scroll-h-body').style('position', 'absolute').style('width','100%');

            this.__scrollbarHTrackPiece = this.__scrollbarHBody.append('div').attr('class', 'd3-scrollbar-track-piece d3-view-h-scroll').style('width','100%');

            this.__scrollHbar = this.__scrollbarHBody.append('div').attr('class','d3-view-scrollbar d3-view-h-scrollbar').attr('class', function () {
                if (me.options.animation) this.classList.add('d3-view-scrollbar-anim');
                return this.className;
            }).style('width', '0px').style('margin-left', '-2px');

        },
        __createScrollbar: function () {
            var me = this;
            var str = window.navigator.userAgent.toLowerCase();
            //火狐浏览器
            if (str.indexOf('firefox') != -1) {
                this.__wheelEvent = this.__firefoxWheel;
            } else {
                this.__wheelEvent = this.__otherWheel;
            }
            this.__viewContent.style('position', 'absolute').style('top', '0px').attr('class',function () {
                if (me.options.animation) this.classList.add('d3-view-anim');
                return this.className;
            });

            this.__createVerticalScrollbar();
            this.__createHorizontalScrollbar();
            this.__setStaticStyle();

            this.__buildScrollDrag();
        },
        __setStyle:function(selection,style){
            if(style)
            for (var k in style) {
                selection.style(k, style[k])
            }
        },
        __setStaticStyle: function () {
            this.__setStyle(this.__scrollVbar,this.options.style._static.scrollbar);
            this.__setStyle(this.__scrollHbar,this.options.style._static.scrollbar);
            this.__setStyle(this.__scrollbarVTrackPiece,this.options.style._static.scrollbarTrackPiece);
            this.__setStyle(this.__scrollbarHTrackPiece,this.options.style._static.scrollbarTrackPiece);

        },
        __buildScrollDrag: function () {
            var me = this;

            var __vscrollDrag = d3.drag().on('start', function () {

                d3.event.sourceEvent.stopPropagation();
//                if(me.options.animation){
//                    me.__viewContent.node().classList.add('d3-view-scrollbar-anim');
//                    this.classList.remove('d3-view-scrollbar-anim');
//                }
                this.startY = d3.event.sourceEvent.clientY - this.offsetTop;
                me.__active = true;
                me.__changeStyle('hover');
                me.options.events.active(me.__scrollVbar,me.__scrollbarVTrackPiece);
            }).on('drag', function () {
                d3.event.sourceEvent.stopPropagation();
                var scroll = this.parentElement,
                    content = me.__viewContent.node();
                var top = d3.event.sourceEvent.clientY - this.startY;
                if (top <= 0) {
                    top = 2;
                }
                if (top >= scroll.clientHeight - this.clientHeight) {
                    top = scroll.clientHeight - this.clientHeight;
                }
                var scale = top / (scroll.clientHeight - this.clientHeight),
                    contentY = scale * (content.clientHeight - scroll.clientHeight);


                me.__viewContent.style('top', -contentY + 'px');
                me.__scrollVbar.style('top', top + 'px');

                content = null, scale = null, top = null, contentY = null;

            }).on('end', function () {
                d3.event.sourceEvent.stopPropagation();
//                if(me.options.animation) {
//                    me.__viewContent.node().classList.remove('d3-view-scrollbar-anim');
//                    this.classList.add('d3-view-scrollbar-anim');
//                }
                me.__active = false;
                me.__changeStyle('leave');
                me.options.events.leave(me.__scrollVbar,me.__scrollbarVTrackPiece);
            });

            this.__scrollVbar.call(__vscrollDrag);

            var __hscrollDrag = d3.drag().on('start', function () {

                d3.event.sourceEvent.stopPropagation();
//                if(me.options.animation){
//                    me.__viewContent.node().classList.add('d3-view-scrollbar-anim');
//                    this.classList.remove('d3-view-scrollbar-anim');
//                }
                this.startX = d3.event.sourceEvent.clientX - this.offsetLeft;
                me.__active = true;
                me.__changeStyle('hover');
                me.options.events.active(me.__scrollHbar,me.__scrollbarHTrackPiece);
            }).on('drag', function () {
                d3.event.sourceEvent.stopPropagation();
                var scroll = this.parentElement,
                    content = me.__viewContent.node();
                var left = d3.event.sourceEvent.clientX - this.startX;
                if (left <= 0) {
                    left = 2;
                }
                if (left >= scroll.clientWidth - this.clientWidth) {
                    left = scroll.clientWidth - this.clientWidth;
                }
                var scale = left / (scroll.clientWidth - this.clientWidth),
                    contentX = scale * (content.clientWidth - scroll.clientWidth);


                me.__viewContent.style('left', -contentX + 'px');
                me.__scrollHbar.style('left', left + 'px');

                content = null, scale = null, left = null, contentX = null;

            }).on('end', function () {
                d3.event.sourceEvent.stopPropagation();
//                if(me.options.animation) {
//                    me.__viewContent.node().classList.remove('d3-view-scrollbar-anim');
//                    this.classList.add('d3-view-scrollbar-anim');
//                }
                me.__active = false;
                me.__changeStyle('leave');
                me.options.events.leave(me.__scrollHbar,me.__scrollbarHTrackPiece);
            });

            this.__scrollHbar.call(__hscrollDrag);

        },
        __firefoxWheel: function () {
            var me = this;
            var config = this.__initConfig();
            var scrollStepTop = 0,scrollStepLeft=0;
            if (d3.event.detail < 0) {
                scrollStepLeft = config.contentOffsetLeft + me.options.step;
                scrollStepTop = config.contentOffsetTop + me.options.step;
                if (scrollStepTop >= 0) {
                    scrollStepTop = 0;
                }
                if (scrollStepLeft >= 0) {
                    scrollStepLeft = 0;
                }
            }
            if (d3.event.detail > 0) {
                scrollStepLeft = config.contentOffsetLeft - me.options.step;
                scrollStepTop = config.contentOffsetTop - me.options.step;
                if (scrollStepTop >= 0) {
                    scrollStepTop = 0;
                }
                if (scrollStepLeft >= 0) {
                    scrollStepLeft = 0;
                }
            }

            if (this.__wheelTimeId) clearTimeout(this.__wheelTimeId);
            this.__wheelTimeId = setTimeout(function () {
                me.__rolling(config, scrollStepTop,scrollStepLeft);
            });

        },

        __otherWheel: function () {
            var me = this;
            var config = this.__initConfig();
            var scrollStepTop = 0,scrollStepLeft=0;
            if (d3.event.wheelDelta > 0) {
                scrollStepLeft = config.contentOffsetLeft + me.options.step;
                scrollStepTop = config.contentOffsetTop + me.options.step;
                if (scrollStepTop >= 0) {
                    scrollStepTop = 0;
                }
                if (scrollStepLeft >= 0) {
                    scrollStepLeft = 0;
                }
            }
            if (d3.event.wheelDelta < 0) {
                scrollStepLeft = config.contentOffsetLeft - me.options.step;
                scrollStepTop = config.contentOffsetTop - me.options.step;
                if (scrollStepTop >= 0) {
                    scrollStepTop = 0;
                }
                if (scrollStepLeft >= 0) {
                    scrollStepLeft = 0;
                }
            }
            if (this.__wheelTimeId) clearTimeout(this.__wheelTimeId);
            this.__wheelTimeId = setTimeout(function () {
                me.__rolling(config, scrollStepTop,scrollStepLeft);
            });
        },
        __rolling: function (config, scrollStepTop,scrollStepLeft) {

            if (config.contentHeight > config.viewBodyHeight) {
                if (scrollStepTop <= -(config.contentHeight - config.viewBodyHeight)) {
                    scrollStepTop = -(config.contentHeight - config.viewBodyHeight);
                }
                var scale = scrollStepTop / (config.contentHeight - config.viewBodyHeight);
                var top = scale * (config.viewBodyHeight - config.scrollbarHeight);
                if (top == 0) top = -2;
                this.__contentOffsetTop = scrollStepTop;
                this.__viewContent.style('top', scrollStepTop + 'px');
                this.__scrollVbar.style('top', -top + 'px');
                scale = null, top = null, scrollStepTop = null;
            }

            if (config.contentWidth > config.viewBodyWidth) {

                if (scrollStepLeft <= -(config.contentWidth - config.viewBodyWidth)) {
                    scrollStepLeft = -(config.contentWidth - config.viewBodyWidth);
                }
                var scale = scrollStepLeft / (config.contentWidth - config.viewBodyWidth);
                var left = scale * (config.viewBodyWidth - config.scrollbarWidth);
                if (left == 0) left = -2;
                this.__contentOffsetLeft = scrollStepLeft;
                this.__viewContent.style('left', scrollStepLeft + 'px');
                this.__scrollHbar.style('left', -left + 'px');
                scale = null, left = null, scrollStepLeft = null;

            }
           config = null
        },
        __scrollVerticalResize:function (config) {
            if (config.contentHeight > config.viewBodyHeight) {
                if (this.options.autoscrollbar) {
                    this.__scrollVbar.style('height', (config.viewBodyHeight / config.contentHeight * config.viewBodyHeight) + 'px');
                }
                var startTop = -config.contentOffsetTop / (config.contentHeight - config.viewBodyHeight) * (config.viewBodyHeight - config.scrollbarHeight);
                this.__scrollVbar.style('top', (startTop == 0 ? 2 : startTop) + 'px');
                this.__wheeling = true;
            }
            else {
                this.__scrollVbar.style('height', '0px').style('top', '-2px');
            }

            this.__contentOffsetTop = this.__viewContent.node().offsetTop;
        },
        __scrollHorizontalResize:function (config) {
            if (config.contentWidth > config.viewBodyWidth) {
                if (this.options.autoscrollbar) {
                    this.__scrollHbar.style('width', (config.viewBodyWidth / config.contentWidth * config.viewBodyWidth) + 'px');
                }
                var startLeft = -config.contentOffsetLeft / (config.contentWidth - config.viewBodyWidth) * (config.viewBodyWidth - config.scrollbarWidth);
                this.__scrollHbar.style('left', (startLeft == 0 ? 2 : startLeft) + 'px');
                this.__wheeling = true;
            }
            else {
                this.__scrollHbar.style('width', '0px').style('left', '-2px');
            }
            this.__contentOffsetLeft = this.__viewContent.node().offsetLeft;
        },
        __pbodyResize:function(){
	        		var dpbody =  d3.select(this.__viewContent.node().parentElement)
//	        		.style('height','100%')
	        		.style('width','100%');
	        	 	
	        	 	var pbody = dpbody.node().getBoundingClientRect();
	            this.__viewBody.style('height',pbody.height+'px').style('width',pbody.width+'px');
        },
        __scrollbarResize: function () {
            var config = this.__initConfig();
//            this.__pbodyResize();
            this.__scrollVerticalResize(config);
            this.__scrollHorizontalResize(config);
            config = null;
        },
        wheelTo:function (scrollStepTop,scrollStepLeft) {
            var config = this.__initConfig();
          
            var scale = scrollStepTop / (config.contentHeight - config.viewBodyHeight);
            var top = scale * (config.viewBodyHeight - config.scrollbarHeight);
            if (top == 0) top = -2;
            this.__contentOffsetTop = scrollStepTop;
            this.__viewContent.style('top', scrollStepTop + 'px');
            this.__scrollVbar.style('top', -top + 'px');
            scale = null, top = null, scrollStepTop = null;

            var scale = scrollStepLeft / (config.contentWidth - config.viewBodyWidth);
            var left = scale * (config.viewBodyWidth - config.scrollbarWidth);
            if (left == 0) left = -2;
            this.__contentOffsetLeft = scrollStepLeft;
            this.__viewContent.style('left', scrollStepLeft + 'px');
            this.__scrollHbar.style('left', -left + 'px');
            scale = null, left = null, scrollStepLeft = null;
        }
    }
	
    window._d3ScrollObjs=[];

    function D3Scroll(selectionContent,options) {

        var me =this;

        var defoption  = {
            		autoscrollbar:true,
                animation: true,
                disable:false,
                style: {
                hover:{
                    scrollbar: {
                        'opacity': '1'
                    },
                    scrollbarTrackPiece: {

                    }
                },
                leave:{
                    scrollbar: {
                        'opacity': '0',
                            'background': 'rgb(70, 70, 70)'
                    },
                    scrollbarTrackPiece: {

                    }
                },
                active:{
                    scrollbar: {
                        'opacity': '1',
                            'background': 'rgb(70, 70, 70)'
                    },
                    scrollbarTrackPiece: {

                    }
                },
                _static:{
                    scrollbar: {
                        'border-radius': '16px',
                            'background': 'rgb(70, 70, 70)'
                    },
                    scrollbarTrackPiece: {
                        'background': 'transparent'
                    }
                }

            },
            step: 37,
            events: {
                hover: function (scrollbar,scrollbarTrackPiece) {

                },
                leave: function (scrollbar,scrollbarTrackPiece) {

                },
                active: function (scrollbar,scrollbarTrackPiece) {

                },
                scroll: function (scrollbar,scrollbarTrackPiece) {

                }
            }
        }

        selectionContent.each(function () {
            this.d3scroll = new d3scroll(d3.select(this),objCopy(defoption,options));
            window._d3ScrollObjs.push(this.d3scroll);
        });
          window.onresize = function () {
                    window._d3ScrollObjs.forEach(function(scroll){
                        scroll.__scrollbarResize();
                    });
                }


    }

    D3Scroll.prototype = {

    }


    win.D3Scroll = D3Scroll;


})(d3, window)