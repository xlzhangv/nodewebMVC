(function(d3){

    // 拷贝对象
    function objCopy() {
        var target = arguments[0] || {},
            source,
            i = 1,
            length = arguments.length;

        function is(obj, type) {
            var toString = Object.prototype.toString;
            return (type === "Null" && obj === null)
                || (type === "Undefined" && obj === undefined)
                || toString.call(obj).slice(8, -1) === type;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((source = arguments[i]) != null) {
                // Extend the base object
                for (var key in source) {
                    var copy = source[key];
                    if (source === copy)
                        continue; // 如window.window === window，会陷入死循环，需要处理一下
                    if (is(copy, "Object")) {
                        target[key] = arguments.callee(target[key] || {}, copy);
                    } else if (is(copy, "Array")) {
                        target[key] = arguments.callee(target[key] || [], copy);
                    } else {
                        target[key] = copy;
                    }
                }
            }
        }
        source = null;

        return target;
    }

    Date.prototype.format = function (fmt) { // author: meizz
        var o = {
            "M+": this.getMonth() + 1, // 月份
            "d+": this.getDate(), // 日
            "h+": this.getHours(), // 小时
            "m+": this.getMinutes(), // 分
            "s+": this.getSeconds(), // 秒
            "q+": Math.floor((this.getMonth() + 3) / 3), // 季度
            "S": this.getMilliseconds()
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
    window.D3Brush = function(selection,settings) {
        this.settings={
            handle:true,
            increment:5,//增量
            tick:1000 * 60 * 5,//刻度
            ticks:15,
            margin:{top: 15, right: 10, bottom: 22, left: 30},
            formater:function (d) {
                return new Date(d).format('yyyy-MM-dd hh:mm:ss');
            },
            axisFormater:function (d) {
                return new Date(d).format('yyyy-MM-dd hh:mm:ss');
            }
        }
        this.settings = settings?objCopy(this.settings,settings):this.settings;
        this.init(selection);
    };
    window.D3Brush.prototype={
        height:0,
        width:0,
        brushwidth:0,
        brushheight:0,
        _prevdata:undefined,
        _domain:[],
        _dom:undefined,
        _brushg:undefined,
        _ticks:10,
        _events:{
            brushselected:function(){

                
            }
        },
        init:function (selection) {
            this._dom = selection.append('svg').attr('height','100%').attr('width','100%');
            this._brushg = this._dom.append('g');
            this.width = this._dom.node().getBoundingClientRect().width,
            this.height = this._dom.node().getBoundingClientRect().height,
            this.brushwidth = this.width - this.settings.margin.left - this.settings.margin.right,
            this.brushheight = this.height - this.settings.margin.top - this.settings.margin.bottom;
            this.layout();
            
        },
        /**
         * 生成刻度函数
         * @private
         */
        _buildScale:function () {
            var me =this;
            this.__xScale = d3.scaleLinear().domain([0, this._domain.length - 1]).range([0, this.brushwidth]),
            this.__xAxis = d3.axisBottom().tickPadding(1).tickSizeInner(2).tickSizeOuter(2).scale(this.__xScale).ticks(this.settings.ticks)
                .tickFormat(function (d) {
                    return me.settings.axisFormater(me._domain[d]);
                });
            this.__gridxAxis = d3.axisBottom()
                .scale(this.__xScale)
                .ticks(this._domain.length - 1)
                .tickSize((-this.brushheight-this.settings.margin.top)/2)
                .tickFormat(function () {
                        return null;
                });
        },
        _updateScale:function () {
            var me =this;
            this.__xScale.domain([0, this._domain.length - 1]).range([0, this.brushwidth]),
                this.__xAxis.scale(this.__xScale),
            this.__gridxAxis.scale(this.__xScale)
                .ticks(this._domain.length - 1)
        },
        /**
         * 生成坐标轴
         * @private
         */
        _buildAxis:function(){
            // // bottom axis
            var me =this;
            this._axisGrid = this._brushg.selectAll('.axis--grid').data([1]);
            this._axisGridUpdate = this._axisGrid.enter().append('g').attr('class', 'axis axis--grid').attr('transform',
                "translate(0," + (this.brushheight+this.settings.margin.top) + ")")
            this._axisGridUpdate.call(this.__gridxAxis).selectAll('.tick')

            this._axisLine = this._brushg.selectAll('.axis--x').data([1]);
            this._axisLineUpdate = this._axisLine.enter().append('g').attr('class', 'axis axis--x').attr('transform',
                "translate(0," + (this.brushheight+this.settings.margin.top) + ")")
            this._axisLineUpdate.call(this.__xAxis).attr('text-anchor',null).selectAll('text')
                .style('text-anchor',function (d) {
                    me._wrapWord(this,me.settings.axisFormater(me._domain[d]),' ');
                    return 'middle';
                })
        },
        _updateAxis:function(){
            // // bottom axis
            var me =this;
            // this._axisGridUpdate.remove();
            this._axisGridUpdate.selectAll('.tick').remove()
            this._axisGridUpdate.call(this.__gridxAxis);
            this._axisLineUpdate.
            call(this.__xAxis).attr('text-anchor',null).selectAll('text')
                .style('text-anchor',function (d) {
                    me._wrapWord(this,me.settings.axisFormater(me._domain[d]),' ');
                    return 'middle';
                });
        },
        _buildBrush:function () {
            var me =this;
            d3.queue()
                .defer(function (callback) {
                    me._createBrush();
                    callback(null);
                })
                .defer(function (callback) {
                    me._createHandle();
                    callback(null);
                })
                .awaitAll(function (error) {
                    if (error) throw error;
//                    me._brushg.transition().call(me._brush.move, [0, 1].map(me.__xScale));
                });

        },
        _createHandle:function () {
           this._handle = this._brushg.selectAll(".handle-text")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("text")
                .attr("class", "handle-text")
                .attr("cursor", "ew-resize")
                .style('opacity', 0).style('visibility','hidden')

        },
        _createBrush:function () {
            var me =this;
            this._brush = d3.brushX().extent([[0, 0], [this.brushwidth, this.brushheight+this.settings.margin.top]]).on('start brush',
                function () {
                    me._brushmove();
                }).on('end', function () {
                me._brushended(this);
            });
            this._brushg = this._brushg.selectAll('.brush');
            this._brushgUpdate = this._brushg.data([1]);
            this._brushg = this._brushgUpdate.enter().append('g').attr('class', 'brush').call(this._brush)
                .on('mouseover',function () {
                d3.select(this).selectAll(".handle-text").style('visibility','visible').style('opacity',1);
                console.info();
            }).on('mouseleave',function () {
                d3.select(this).selectAll(".handle-text").style('visibility','hidden').style('opacity',0);
            });
            this._brushH = this._brushg.selectAll('.overlay').node().getBBox().height;

        },
        _brushH:0,
        _handleRect:undefined,
        //获取刷子选中区间索引
        _getBrushIndex:function (node) {
            return d3.brushSelection(node).map(this.__xScale.invert).map(function (v) {
                return parseInt(v);
            });
        },
        _handleOffset_left:false,
        _handleOffset_right:false,
        _brushmove:function () {
            var me =this;
            var s = d3.event.selection;
            this._handleRect = this._brushg.selectAll('.handle').node().getBBox();
            if (s == null) {
                this._handle.style('visibility','hidden');
            } else {
                var brushIndex = this._getBrushIndex(this._brushg.node());

                if(this.settings.handle){
                    this._handle.text(function (d) {
                        if(d.type=='w'){

                            return me.settings.formater(me._domain[brushIndex[0]]);
                        }
                        return me.settings.formater(me._domain[brushIndex[1]]);
                    }).attr('x',function (d,i) {
                        if(d.type=='w'){
                            if((s[i]-this.getBBox().width)<(me._dom.node().getBoundingClientRect().left)){
                                me._handleOffset_left = true;
                                return s[i];
                            }
                            me._handleOffset_left = false;
                            return s[i]-this.getBBox().width
                        }
                        if((s[i]+this.getBBox().width)>(me._dom.node().getBoundingClientRect().width-me.settings.margin.right)){
                            me._handleOffset_right = true;
                            return s[i]-this.getBBox().width;
                        }
                        me._handleOffset_right = false;
                        return s[i];
                    }).attr("y", function (d,i) {
                        d.y = (me._handleRect.height)/2-me._handleRect.y;
                        if(me._handleOffset_left||me._handleOffset_right){
                            if(d.type=='w'){
                                return this.getBBox().height/2+2;
                            }else{
                                return d.y+(this.getBBox().height/3)-2;
                            }
                        }
                        return d.y;
                    });
                }

            }
        },
        _brushended:function (node) {
            var me =this;
            if (!d3.event.sourceEvent)
                return; // Only transition after input.
            if (!d3.event.selection)
                return; // Ignore empty selections.
            var d0 = d3.event.selection.map(this.__xScale.invert),
                d1 = d0.map(Math.round);
            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = Math.floor(d0[0]);
                d1[1] = d1[0] + 1;
            }
            d3.select(node).transition().call(d3.event.target.move, [d1.map(this.__xScale)[0], d1.map(this.__xScale)[1]]).on('end',function () {
                var brushIndex = me._getBrushIndex(node);
                if(me.settings.handle){
                    me._handle.text(function (d) {
                        if(d.type=='w'){
                            return me.settings.formater(me._domain[brushIndex[0]]);
                        }
                        return me.settings.formater(me._domain[brushIndex[1]]);
                    });
                }
                me._handleOffset_left=false,me._handleOffset_right=false;
                me._prevdata = [me._domain[brushIndex[0]], me._domain[brushIndex[1]]];
                me._events.brushselected([me._domain[brushIndex[0]], me._domain[brushIndex[1]]]);
                if(me.settings.increment>0){
                    if(brushIndex[0]==0){
                        me._changeDoman(1);
                    }
                    if(brushIndex[1]==me._domain.length-1){
                        me._changeDoman(0);
                    }
                }

            });

        },
        layout:function(){
            var center = {
                'transform':"translate(" +  this.settings.margin.left + "px," + 3 + "px)",
                '-ms-transform':"translate(" + this.settings.margin.left + "px," + 3 + "px)", 	/* IE 9 */
                '-moz-transform':"translate(" + this.settings.margin.left + "px," + 3 + "px)", 	/* Firefox */
                '-webkit-transform':"translate(" + this.settings.margin.left + "px," + 3 + "px)", /* Safari 和 Chrome */
                '-o-transform':"translate(" + this.settings.margin.left + "px," + 3 + "px)" 	/* Opera */
            }
            for (var k in center){
                this._brushg.style(k,center[k]);
            }
        },
        _wrapWord:function (dom, text, separator, align) {
            var words = text.split(separator).reverse(),
                dom = d3.select(dom),
                word,
                lineNumber = 0,
                lineHeight = dom.node().getBoundingClientRect().height+5,
                x = +dom.attr('x'),
                y = +dom.attr('y');
            dom.text(null);

            while (word = words.pop()) {
                dom.append('tspan').attr('x', x).attr('y', lineNumber++ * lineHeight + y).text(word);
            }
        },
        _updateBrushTick:function () {
            var me =this;
            this._updateScale();
            this._updateAxis();
            if(this._prevdata){
                var index1 = this._domain.findIndex(function (v) {
                    return v==me._prevdata[0];
                }),
                    index2=this._domain.findIndex(function (v) {
                    return v==me._prevdata[1];
                })
                me._brushg.transition().call(me._brush.move, [index1, index2].map(me.__xScale));
            }
            return this;
        },
        on:function (eventName,fun) {
            this._events[eventName] = fun;
            return this;
        },
        setTick:function (tick) {
            this.settings.tick = tick;
            return this;
        },
        _changeDoman:function (dir) {

            if(dir){
                for(var i=0;i<this.settings.increment;i++){
                    this._domain.unshift(this._domain[0]-this.settings.tick);
                    this._domain.splice((this._domain.length-1),1);
                }

            }else{
                for(var i=0;i<this.settings.increment;i++){
                    this._domain.push(this._domain[0]+this.settings.tick);
                    this._domain.splice(0,1);
                }
            }
            this._updateBrushTick();
        },
        _buildInterpolate:function(data){
            this._domain = d3.range(data.start, data.end, this.settings.tick);
        },
        setData:function (data) {
            this._buildInterpolate(data);
            this._buildScale();
            this._buildAxis();
            this._buildBrush();
        },
        setSelected:function(values){
        		 var index1 = this._domain.findIndex(function (v) {
                return v==values[0];
            }),
                index2=this._domain.findIndex(function (v) {
                return v==values[1];
            });
        		this._brushg.transition().call(this._brush.move, [index1, index2].map(this.__xScale));
        }
    }

})(d3);