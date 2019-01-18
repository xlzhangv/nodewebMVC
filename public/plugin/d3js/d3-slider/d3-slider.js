(function (d3) {

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


    function D3Slider(selection,settings) {
        this.settings={
            center:undefined,
            step:1,
            radialInterval:5,//放射环个数
            maxValue:20,
            minValue:0,
            tipFormatter:function(data){
                return data.name;
            },
            axisFormater:function (d) {
                return new Date(d).format('yyyy-MM-dd hh:mm:ss');
            },
            padding:{
                top: 30,
                right: 30,
                bottom: 0,
                left: 30
            },
            onmoving:function () {
                
            }

        }
        this.settings = settings?objCopy(this.settings,settings):this.settings;
        this.init(selection);
    }
    D3Slider.prototype={
        height:0,
        width:0,
        _domain:[],
        _lineScale:undefined,
        _lineAxis:undefined,
        _rangeValues:[],
        _moveIndex:0,
        init:function (selection) {
            this.dom = selection.node();
            this.view = selection;
            this.svg = selection.append('svg').attr('width', '100%').attr('height', '100%').attr('class', 'd3-radar');
            this.sliderbody = this.svg.append('g').attr('class','slider-body');
            this.__sliderAxisGroup = this.sliderbody.append('g').attr('class','slider-ticks').style('opacity','0');
            this.__sliderTrackGroup = this.sliderbody.append('g').attr('class','track-ticks');
            this.__sliderHandleGroup = this.sliderbody.append('g').attr('class','slider-handle');
            this._layout();
            this._buildScale();
            this._buildDrag();
            this._buildHandle();
            this.__buildToolTip();
            this.events();
        },
        events:function () {

            this.view.style('cursor','url(icon/a.cur),auto').on('mousemove',function () {
                d3.event.stopPropagation();
                return false;
            }).on('mouseover',function () {
                d3.event.stopPropagation();
                return false;
            })
        },
        /**
         * build 值域
         * @private
         */
        __buildRang:function () {
            this._rangeValues = d3.range(0, (this._domain.length-1), 1).concat((this._domain.length-1));
            this._lineScale.domain([0,(this._domain.length-1)]);
            this._lineAxis.scale(this._lineScale).tickValues(this._rangeValues);
            this._buildTicks();
            this._buildTrack();
        },
        __buildToolTip: function () {
            //提示框 （注意设置提示框的绝对路径）

            var deftipCss = {
                'margin': '3px',
                'position': 'fixed',
                'visibility': 'hidden',
                'border-style': 'solid',
                'white-space': 'nowrap',
                'z-inde': '9999999',
                'transition': '0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                'background-color': 'rgba(50, 50, 50, 0.7)',
                'border-width': '0px',
                'border-color': 'rgb(51, 51, 51)',
                'border-radius': '4px',
                'color': '#fff',
                'opacity': '0',
                'font-style': 'normal',
                'font-variant': 'normal',
                'font-weight': 'normal',
                'font-stretch': 'normal',
                'font-size': '14px',
                'font-family': 'sans-serif',
                'line-height': '21px',
                'padding': '5px',
                'left': '0',
                'top': '0',
            }
            this._tooltip = this.view.append('div').attr('id', this.id + '-tooltip').attr('class', 'tooltip');
            for (var k in deftipCss) {
                this._tooltip.style(k, deftipCss[k]);

            }
        },
        _showTip: function (data, point) {
            this._tooltip.style('visibility', 'visible').style('opacity', '1').style('top',
                point.y + 'px').style('left', point.x + 'px').html(this.settings.tipFormatter(data));
        },
        _hideTip: function () {
            this._tooltip.style('visibility', 'hidden').style('opacity', '0')
        },
        _buildCenter:function(){

            var center = {
                'transform':"translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)",
                '-ms-transform':"translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)", 	/* IE 9 */
                '-moz-transform':"translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)", 	/* Firefox */
                '-webkit-transform':"translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)", /* Safari 和 Chrome */
                '-o-transform':"translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)" 	/* Opera */
            }
            for (var k in center){
                this.sliderbody.style(k,center[k]);
            }

        },
        _layout:function () {

            this.width = this.settings.width||this.dom.clientWidth,
                this.height = this.settings.height||this.dom.clientHeight;
            if(!this.settings.center)
                this.settings.center = [(this.settings.padding.left),(this.height - this.settings.padding.top - this.settings.padding.bottom) / 2];
            this._buildCenter();
        },
        _buildScale:function () {
            var me =this;

            this._lineScale =  d3.scaleLinear().range([0, this.width - this.settings.padding.left - this.settings.padding.right]).clamp(true);
            this._lineAxis = d3.axisBottom().tickFormat(function (d) {
                return me.settings.axisFormater(me._domain[d]);
            });

        },
        _buildHandle:function () {
            this._circleHandle = this.__sliderHandleGroup.append('circle')
                // .attr('transform', 'translate(0, 5)')
                .attr('class','circle-handle')
                .style('cursor','crosshair')
                .attr('r', 8).style('transition','.4s');
            this._circleHandle.append('title');
            this._circleHandle.call(this._sliderDrag);
        },
        _buildTicks:function () {
            var me =this;
            this.__sliderAxisGroup.call(this._lineAxis).selectAll('text').style('fill','#000').style('text-anchor',function (d) {
                me._wrapWord(this,new Date(me._domain[d]).format('yyyy-MM-dd hh:mm:ss'),' ');
                return 'middle';
            });
        },
        _buildDrag:function () {
            var me =this;
           this._sliderDrag = d3.drag()
                .on('start.interrupt', function () {
                    me.sliderbody.interrupt();
                }).on('start drag', function () {
                    me._dragged(d3.event.x);
                }).on('end',function () {
                   me._moveIndex  = me._lineScale.invert(me._cx);

                   me.settings.onmoving(me._moveIndex);
                   me._circleHandle.select('title').text(me._domain[me._moveIndex]);
               });
        },
        _buildTrack:function () {
            var me =this;
           var trackupdate =  this.__sliderTrackGroup.selectAll('.track-overlay').data([1]);

            trackupdate.enter().append('line')
                .attr("class", "track-overlay")
                .style('stroke-width','1px')
                .style('stroke','#000')
                .attr('x1', this._lineScale.range()[0])
                .attr('x2', this._lineScale.range()[1]);

            trackupdate.attr('x1', this._lineScale.range()[0])
                .attr('x2', this._lineScale.range()[1]);
        },
        _cx:0,
        _dragged:function (value) {
            var me =this;
            var x = this._lineScale.invert(value),  midPoint, cx, xVal,moveIndex;
            if(this.settings.step) {
                // if step has a value, compute the midpoint based on range values and reposition the slider based on the mouse position
                for (var i = 0; i < me._rangeValues.length - 1; i++) {
                    if (x >= me._rangeValues[i] && x <= me._rangeValues[i + 1]) {
                        moveIndex = i;
                        break;
                    }
                }
                midPoint = (this._rangeValues[moveIndex] + this._rangeValues[moveIndex + 1]) / 2;
                if (x < midPoint) {
                    this._cx = this._lineScale(this._rangeValues[moveIndex]);
                    xVal = this._rangeValues[moveIndex];
                } else {
                    this._cx = this._lineScale(this._rangeValues[moveIndex + 1]);
                    xVal = this._rangeValues[moveIndex + 1];
                }

            } else {
                // if step is null or 0, return the drag value as is
                this._cx = this._lineScale(x);
                xVal = x.toFixed(3);
            }
            // use xVal as drag value
            this._circleHandle.attr('cx',  this._cx);

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
        setData:function (d) {
            this._domain = d;
            this.__buildRang();
            this._circleHandle.select('title').text(this._domain[0]);
        },
        move:function (index) {

            this._dragged(this._lineScale(index));

        }
    }

    window.D3Slider = D3Slider;

})(d3);