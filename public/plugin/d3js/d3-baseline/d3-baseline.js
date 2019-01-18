(function (d3, win) {

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
    /**
     * 字符串格式化
     *  "xx{0}，xx{1}".format("loogn",22);
     *  "xx{name}，xx{age}".format({name:"loogn",age:22});
     *
     * @param args
     * @returns {String}
     */
    String.prototype.format = function (args) {
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
    };

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

    function d3BaseLine(selectionContent, settings) {
        this.settings={
            title: {
                name: ''
            },
            ticks:15,//刻度个数
            brush:50,
            margin: {
                top: 20,
                right: 40,
                bottom: 30,
                left: 60
            },
            tipFormatter:function(data){
                return '时间:' + data.xvalue + "点" + "</br>" + '数值:' + data.value
            },
            xAxisFormat: function (index, v, values) {
                 return new Date(v).format('hh:mm:ss');
            },
            yAxisFormat: function (d, i, values) {
                return d;
            },
            events: {

                hover: function (scrollbar, scrollbarTrackPiece) {

                },
                leave: function (scrollbar, scrollbarTrackPiece) {

                },
                active: function (scrollbar, scrollbarTrackPiece) {

                },
                scroll: function (scrollbar, scrollbarTrackPiece) {

                }
            }
        };
        this.settings = settings?objCopy(this.settings,settings):this.settings;
        this.init(selectionContent)
    }

    d3BaseLine.prototype = {
        chart: {
            xAxisData: undefined,
            yAxisData: undefined,
            xAxis: undefined,
            yAxis: undefined,
            graph: undefined,
            otheryarea:undefined
        },
        __brushSelect:[],
        __xAxisData :[],
        __yAxisData :[],

        init: function (selection) {
            this.dom = selection.node();
            this.view = selection;
            this.linesvg = selection.append('svg').attr('width', '100%').attr('height', '100%').attr('class', 'd3-line');
            this.__chartBody = this.linesvg.append('g').attr('class','chart-body');

            this.__xOtherAxisGroup = this.__chartBody.append('g').attr('class','axis-x-other');

            this.__yOtherAxisGroup = this.__chartBody.append('g').attr('class','axis-y-other');
            //定义x轴
            this.__xAxisG = this.__chartBody.append("g").attr("class", "axis axis-x");
            //定义y轴
            this.__yAxisG = this.__chartBody.append("g").attr("class", "axis axis-y");



            this._context = this.linesvg.append("g")
                .attr("class", "context")
            //定义brushx轴
            this.__brushfocus = this._context.append("g").attr("class", "axis axis-focus").attr("transform", "translate(0," + this.settings.brush + ")");

            this._lineGroup = this.__chartBody.append('g').attr('class','series-line-group');
            this.__circleGroup = this.__chartBody.append('g').attr('class','line-circle-group');

            this._buildLayout();
            this.__buildChartConfig();

            this.__buildTip();
            // this.__buildViewBody(selection);
            // this.__buildChartBody();
            this.__setEvents();
        },

        __showTip: function (data, clientRect) {
            var me =this;
            this.__tooltip
                .style('visibility', 'visible')
                .style('opacity', '1')
                .style('top', function () {
                    if (clientRect.y - clientRect.height <= 0) {
                        return (clientRect.y - 10) + 'px';
                    }
                    if (clientRect.y - clientRect.height > me._chartRect.chartHeight) {

                        return (clientRect.y +this.clientHeight + clientRect.height + 10) + 'px';
                    }
                    return (clientRect.y - 10) + 'px';

                })
                .style('left', function () {

                    if (clientRect.x - clientRect.width <= 0) {
                        return (clientRect.x + clientRect.width + 10) + 'px';
                    }
                    if (clientRect.x + clientRect.width > me._chartRect.chartWidth) {
                        return (clientRect.x -this.clientWidth - clientRect.width - 15) + 'px';
                    }
                    return (clientRect.x + 10) + 'px';

                })
                .html(this.settings.tipFormatter(data));
        },
        //隐藏提示框
        __hideTip: function () {
            this.__tooltip
                .style('visibility', 'hidden')
                .style('opacity', '0');
            this.__focus.style('display', 'none');
        },
        __buildTip: function () {
            this.__focus = this.__chartBody.append('g')
                .attr('class', 'focus');
            // .style('display', 'block');
            this.__focus.append('line').attr('class', 'x');
            this.__focus.append('line').attr('class', 'y');
            // .classed('y', true);
            this.__focus.append('text').attr('x', 9).attr('dy', '.35em');
            //指示线的绘制
            var lineCss = {
                'fill': 'none',
                'stroke': '#999',
                'stroke-width': '1px',
                'stroke-dasharray': '3 3',
                "stroke-opacity": '0.8'
            };
            for (var k in lineCss) {
                d3.selectAll('.focus line').style(k, lineCss[k]);
            }

            //提示的样式
            var tipCss = {
                'margin': '3px',
                'position': 'absolute',
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
                'top': '0'
            };
            //创建提示  循环样式给与每个点
            this.__tooltip = this.view.append('div').attr('id', 'tooltip-' + this.id).attr('class', 'tooltip');
            for (var k in tipCss) {
                this.__tooltip.style(k, tipCss[k]);
            }
        },
        _buildLayout:function(){

            var me =this;
            this._chartRect = {
                contentHeight: this.dom.getBoundingClientRect().height,
                contentWidth: this.dom.getBoundingClientRect().width,
                chartHeight: this.dom.getBoundingClientRect().height - this.settings.margin.top - this.settings.margin.bottom - this.settings.brush-20,
                chartWidth: this.dom.getBoundingClientRect().width - this.settings.margin.left - this.settings.margin.right,
            };
            this.__xAxisG.attr("transform", "translate(0," + this._chartRect.chartHeight + ")");

            var center = {
                'transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)",
                '-ms-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)", 	/* IE 9 */
                '-moz-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)", 	/* Firefox */
                '-webkit-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)", /* Safari 和 Chrome */
                '-o-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)" 	/* Opera */
            }
            for (var k in center){
                this.__chartBody.style(k,center[k]);
            }
            this._context.attr("transform", "translate(" + this.settings.margin.left + "," + (this._chartRect.contentHeight-this.settings.brush-this.settings.margin.bottom) + ")");
            this._brush = d3.brushX()
                .extent([[0, 0], [this._chartRect.chartWidth, this.settings.brush]])
                .on("end", function () {
                    me._brushed(this);
                }).on('start brush',
                    function () {
                        me._brushmove();
                    });
            this._brushslider = this._context.append("g")
                .attr("class", "brush")
                .on('mouseover',function () {
                    d3.select(this).selectAll(".handle-text").style('visibility','visible').style('opacity',1);
                    console.info();
                }).on('mouseleave',function () {
                    d3.select(this).selectAll(".handle-text").style('visibility','hidden').style('opacity',0);
                }).call(this._brush);

            this._handle = this._brushslider.selectAll(".handle-text")
                .data([{type: "w"}, {type: "e"}])
                .enter().append("text")
                .attr("class", "handle-text")
                .attr('fill','#000')
                .attr("cursor", "ew-resize")
                .style('opacity', 0).style('visibility','hidden')
        },

        _buildBrush:function () {
            var me =this

            this._brushslider.call(this._brush)


            this._brushslider.call(this._brush.move, this.__xScale.range());
        },

        //获取刷子选中区间索引
        _getBrushIndex:function (node) {
            return d3.brushSelection(node).map(this.__xScale.invert).map(function (v) {
                return parseInt(v);
            });
        },
        _brushmove:function () {
            var me =this;
            var s = d3.event.selection;
            this._handleRect = this._brushslider.selectAll('.handle').node().getBBox();
            if (s == null) {
                this._handle.style('visibility','hidden');
            } else {
                var brushIndex = this._getBrushIndex(this._brushslider.node());
                this._handle.text(function (d) {
                    if(d.type=='w'){
                        return me.settings.xAxisFormat(d, me.__xAxisData[brushIndex[0]], me.__xAxisData);
                    }
                    return me.settings.xAxisFormat(d, me.__xAxisData[brushIndex[1]], me.__xAxisData);
                }).attr('x',function (d,i) {
                    if(d.type=='w'){
                        return me._brushslider.select('.handle--w').attr('x')-this.getBBox().width;
                        // if((x-this.getBBox().width)<(me._brushslider.node().getBoundingClientRect().left)){
                        //     me._handleOffset_left = true;
                        //     return s[i];
                        // }
                        // me._handleOffset_left = false;
                        // return s[i]-this.getBBox().width
                    }
                    return me._brushslider.select('.handle--e').attr('x');
                    // if((s[i]+this.getBBox().width)>(me._brushslider.node().getBoundingClientRect().width-me.settings.margin.right)){
                    //     me._handleOffset_right = true;
                    //     return s[i]-this.getBBox().width;
                    // }
                    // me._handleOffset_right = false;
                    // return s[i];
                }).attr("y", function (d,i) {

                    return this.getBBox().height/2+2;


                    // d.y = (me._handleRect.height)/2-me._handleRect.y;
                    // if(me._handleOffset_left||me._handleOffset_right){
                    //     if(d.type=='w'){
                    //         return this.getBBox().height/2+2;
                    //     }else{
                    //         return d.y+(this.getBBox().height/3)-2;
                    //     }
                    // }
                    // return d.y;
                });

            }
        },
        _brushed:function (node) {
            var me =this;
            if (!d3.event.sourceEvent)
                return;
            if (!d3.event.selection)
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
            var s = d3.event.selection || this.__xScale2.range();

            var d0 = d3.event.selection.map(this.__xScale2.invert),
                d1 = d0.map(Math.round);
            // If empty when rounded, use floor & ceil instead.
            if (d1[0] >= d1[1]) {
                d1[0] = Math.floor(d0[0]);
                d1[1] = d1[0] + 1;
            }

            d3.select(node).transition().call(d3.event.target.move,[d1.map(this.__xScale2)[0], d1.map(this.__xScale2)[1]]).on('end',function () {
                me._handle.text(function (d) {
                    if(d.type=='w'){
                        return me.settings.xAxisFormat(d, me.__xAxisData[d1[0]], me.__xAxisData);
                    }
                    return me.settings.xAxisFormat(d, me.__xAxisData[d1[1]], me.__xAxisData);
                });
            });

            var s1 = 0,s2 = d1[1]-d1[0],slIndex=[];

            for(var i=d1[0];i<=d1[1];i++){
                slIndex.push(this.__xAxisData[i]);
            }
            this.__brushSelect=slIndex;
            // this._rangeValues = d3.range(s1, s2, 1).concat(s2);
            // this.chart.xAxis.tickValues(this._rangeValues);
            this.__xScale.domain([s1, s2]);
            this.__xScale3.domain([d1[0], d1[1]]);
            this.__xAxisG.call(this.chart.xAxis);
            this.__updateScale(this.__xAxisData[d1[0]], this.__xAxisData[d1[1]]);

            // this._lineGroup.select(".zoom").call(this._brushzoom.transform, d3.zoomIdentity
            //     .scale(this._chartRect.chartWidth / (s[1] - s[0]))
            //     .translate(-s[0], 0));
        },

        _buildSeriesLines:function (series) {
            var me =this;

            this._seriesgroups = this._lineGroup.selectAll('.series-line-g').data(series);
            var contextUp = this._context.selectAll('.series-line-g').data(series);

            this.__brushfocus.call(this.chart.xAxis2);


            contextUp.style('opacity', function (d, i) {
                d.seriesIndex = i;
                d3.select(this).selectAll('path').datum (d)
                    .style("stroke-width", 1)
                    .style("fill", "none")
                    .attr('d', function (d) {
                        return me.chart.graph2(d.data);
                    });
                return 1;
            });

            this._seriesgroups.style('opacity', function (d, i) {
                d.seriesIndex = i;
                d3.select(this).selectAll('path').datum (d)
                    .style("stroke-width", 1)
                    .style("fill", "none")
                    .attr('d', function (d) {
                        return me.chart.graph(d.data);
                    });
                return 1;
            });

            this._seriesgroups.enter()
                .append("g").attr('class', 'series-line-g')
                .style('stroke', function (d, i) {
                    return d.color;
                })
                .style('opacity', function (d, i) {
                    d.seriesIndex = i;
                    return 1;
                }).append('path')
                .attr("class", "series-line")
                .attr('fill', 'none')
                .style('transition', '.4s')
                //折线绘制--线的颜色
                .attr('d', function (d) {
                    return me.chart.graph(d.data);
                }) .on('mouseout', function (d) {
                    me.__circleGroup.selectAll('.'+d.id) .style('display','none')//.style('opacity', 1).style('visibility','visible')
                })
                .on('mouseover', function (d) {
                    me.__circleGroup.selectAll('.'+d.id) .style('display',null)//.style('opacity', 1).style('visibility','visible')
                });

            contextUp.enter()
                .append("g").attr('class', 'series-line-g')
                .style('stroke', function (d, i) {
                    return d.color;
                })
                .style('opacity', function (d, i) {
                    d.seriesIndex = i;
                    return 1;
                }).append('path')
                .attr("class", "series-line")
                .attr('fill', 'none')
                .style('transition', '.4s')
                //折线绘制--线的颜色
                .attr('d', function (d) {
                    return me.chart.graph2(d.data);
                });

            this._buildSeriesCircle(series);
        },
        _buildSeriesCircle:function (series) {
            var me =this;
            var values=[];
            for(var i=0;i<series.length;i++){
                var s = series[i];
                for(var j=0;j<s.data.length;j++){
                    values.push({
                        id:s.data[j].id,
                        xAxisIndex:me.__brushSelect.indexOf(s.data[j].x),
                        seriesIndex:i,
                        xvalue:s.data[j].x,
                        value:s.data[j].y,
                        seriesName:s.name
                    });
                }
            }


            this._seriescirclegroups = this.__circleGroup.selectAll('.series-line-circle').data(values);


            this._seriescirclegroups.attr('cx', function (d, i) {
                return me.__xScale(d.xAxisIndex);
            })
                .attr('cy', function (d) {
                    return me.__yScale(d.value);
                }).attr('class', function (d) {
                return 'series-line-circle ' +d.id;
            });

            //圆圈的绘制
            this._seriescirclegroups.enter().append('circle').attr('class', function (d) {
                return 'series-line-circle ' +d.id;
            })
                .attr('cx', function (d, i) {
                    return me.__xScale(d.xAxisIndex);
                })
                .attr('cy', function (d) {
                    return me.__yScale(d.value);
                })
                // .attr('fill-opacity', 0)
                //.style('opacity', 0)
                //.style('visibility','hidden')
                .style('display','none')
                .attr('r', 3)
                //小圆点的样式
                .attr("fill", "rgb(90,221,34)")
                .style('transition', '.4s');
            this._seriescirclegroups.exit().remove();
            //小圆圈的显示
            var littleCircle = this.__circleGroup.selectAll('.hover-circle').data(values);
            littleCircle.attr('cx', function (d, i) {
                return me.__xScale(d.xAxisIndex);
            })
                .attr('cy', function (d) {
                    return me.__yScale(d.value);
                })

            littleCircle.enter().append('circle').attr('class', 'hover-circle')
                .attr('cx', function (d, i) {
                    return me.__xScale(d.xAxisIndex);
                })
                .attr('cy', function (d) {
                    return me.__yScale(d.value);
                })
                .attr('fill-opacity', 0)
                .attr('r', 10)
                .style('transition', '.4s')
                .on('mouseout', function (d) {
                    me.__circleGroup.selectAll('.'+d.id) .style('display','none')//.style('opacity', 1).style('visibility','visible')
                    me.__hideTip();
                })
                .on('mouseover', function (d) {
                    me.__circleGroup.selectAll('.'+d.id) .style('display',null)//.style('opacity', 1).style('visibility','visible')
                    me.__focus.style('display', null);
                    var x = d3.select(this).attr('cx'),
                        y = d3.select(this).attr('cy');
                    me.__focus.select('line.x').attr('x1', 0).attr('x2', me._chartRect.chartWidth).attr('y1', y).attr('y2', y);
                    me.__focus.select('line.y').attr('x1', x).attr('x2', x).attr('y1', 0).attr('y2', me._chartRect.chartHeight);
                    me.__showTip(d, this.getBoundingClientRect());
                });
            littleCircle.exit().remove();
        },
        __buildChartConfig: function () {
            var me = this;
            //线的形式 默认就是折线
            var curves = {
                1: d3.curveLinear,  //折线
                2: d3.curveCatmullRom,  //立方Catmull-Rom样条
                3: d3.curveBasis,      //立方基本样条，终点循环
                4: d3.curveBasisClosed,//闭合立方基本样条
                5: d3.curveBasisOpen, //开放立方基本样条
                6: d3.curveBundle,  // 直立方基本样条
                7: d3.curveCardinal,  //三次C样条
                8: d3.curveCardinalClosed,  //闭合三次C样条
                9: d3.curveCardinalOpen, // 开放三次C样条
                10: d3.curveCatmullRomClosed, //闭合立方Catmull-Rom样条
                11: d3.curveCatmullRomOpen,  // 开放立方Catmull-Rom样条
                12: d3.curveStepAfter  // 分段常值函数
            };

            //x y 轴  值域范围  可定义一个
            this.__xScale = d3.scaleLinear().range([0, this._chartRect.chartWidth]);
            this.__xScale2 = d3.scaleLinear().range([0, this._chartRect.chartWidth]);
            this.__xScale3 = d3.scaleLinear().range([0, this._chartRect.chartWidth]);
            this.__yScale = d3.scaleLinear().range([this._chartRect.chartHeight, 0]);
            this.__yScale2 = d3.scaleLinear().range([this.settings.brush, 0]);

            //x轴坐标
            this.chart.xAxis = d3.axisBottom()
                .scale(this.__xScale)
                .ticks(this.settings.ticks)
                //x轴的时间坐标展示
                .tickFormat(function (d, i) {
                    if(me.__brushSelect[d]){
                        return me.settings.xAxisFormat(d, me.__brushSelect[d], me.__xAxisData);
                    }

                });
            //x轴坐标
            this.chart.xAxis2 = d3.axisBottom()
                .scale(this.__xScale2)
                .ticks(this.settings.ticks)
                //x轴的时间坐标展示
                .tickFormat(function (d, i) {
                    if(me.__xAxisData[d]){
                        return me.settings.xAxisFormat(d, me.__xAxisData[d], me.__xAxisData);
                    }
                });
            // y轴坐标
            this.chart.yAxis = d3.axisLeft()
                .scale(this.__yScale)
                .tickFormat(function (d, i) {
                    return me.settings.yAxisFormat(d, i, me.__yAxisData);
                });

            this.chart.graph = d3.line()
            // .curve(curves[2])
                .x(function (d, i) {
                    return me.__xScale(me.__brushSelect.indexOf(d.x));
                })
                .y(function (d) {
                    return me.__yScale(d.y);
                });

            this.chart.graph2 = d3.line()
            // .curve(curves[2])
                .x(function (d, i) {
                    return me.__xScale(me.__brushSelect.indexOf(d.x));
                })
                .y(function (d) {
                    return me.__yScale2(d.y);
                });

            this.chart.otheryarea = d3.line()
            // .curve(curves[2])
                .x(function (d, i) {
                    return me.__xScale(me.__brushSelect.indexOf(d.x));
                })
                .y(function (d) {
                    return me.__yScale(d.y);
                })
            // .y1(function (d) {
            //     return me.__yScale(d.y);
            // });

        },
        __updateScale:function (s1,s2) {

            var me =this;

            var tempSeries = JSON.parse(JSON.stringify( this.__yAxisData));
            var tempotherYseries = JSON.parse(JSON.stringify(this.otherYseries));
            var series =[];
            var values =[];
            for(var k=0;k<tempSeries.length;k++){

                var newData=[];
                for(var j=0;j<tempSeries[k].data.length;j++){
                    if(tempSeries[k].data[j].x>=s1&&tempSeries[k].data[j].x<=s2){
                        newData.push(tempSeries[k].data[j]);
                    }
                }


                tempSeries[k].data = newData;
                series.push(tempSeries[k]);
                values = values.concat(tempSeries[k].data);
            }


            this._seriesgroups = this._lineGroup.selectAll('.series-line-g').data(series);

            this._seriesgroups.style('opacity', function (d, i) {
                d.seriesIndex = i;
                d3.select(this).selectAll('path').datum (d)
                    .style("stroke-width", 1)
                    .style("fill", "none")
                    .attr('d', function (d) {
                        return me.chart.graph(d.data);
                    });
                return 1;
            });

            this._seriesgroups.enter()
                .append("g").attr('class', 'series-line-g')

                .style('stroke', function (d, i) {
                    return d.color;
                })
                .style('opacity', function (d, i) {
                    d.seriesIndex = i;
                    return 1;
                }).append('path')
                .attr("class", "series-line")
                .attr('fill', 'none')
                .style('transition', '.4s')
                //折线绘制--线的颜色
                .attr('d', function (d) {
                    return me.chart.graph(d.data);
                });

            this._buildSeriesCircle(series);


//-----------------横线----------------------------

            var otherseries =[];
            for(var i=0;i<tempotherYseries.length;i++){
                var sdata = tempotherYseries[i].data

                for(var j =0;j<sdata.length;j++){
                    var newsdata=[];
                    var domain = sdata[j]['domain'];
                    if(domain.length==0) continue;
                    var n=[];

                    if(domain[0].x>=s1&&domain[0].x<s2){
                        if(domain[1].x>s1&&domain[1].x<=s2){
                            newsdata.push(domain[0]);
                            newsdata.push(domain[1]);
                        }else{
                            newsdata.push(domain[0]);
                            domain[1].x = s2;
                            newsdata.push(domain[1]);
                        }
                    }else{
                        if(domain[1].x>=s1&&domain[1].x<s2){
                            domain[0].x = s1;
                            newsdata.push(domain[0]);
                            newsdata.push(domain[1]);
                        }
                        if(domain[0].x<s1&&domain[1].x>=s2){
                            domain[0].x = s1;
                            domain[1].x = s2;
                            newsdata.push(domain[0]);
                            newsdata.push(domain[1]);
                        }

                    }
                    tempotherYseries[i].data[j]['domain'] = newsdata;
                }

                otherseries.push(tempotherYseries[i]);
            }
            this.__buildyOtherAxisGroup(otherseries);
        },
        __resetScale: function (result) {
            var values =[];
            this.__xAxisData  = this.__brushSelect = result.xAxis.data;
            this.__yAxisData = result.series;
            for (var i = 0;i<result.series.length;i++){
                var d = result.series[i].data;
                for (var j =0;j<d.length;j++){
                    values = values.concat(d[j].y);
                }

            }



            this._rangeValues = d3.range(0, (this.__xAxisData.length-1), 1).concat((this.__xAxisData.length-1));

            // this.chart.xAxis.tickValues(this._rangeValues);
            // this.chart.xAxis2.tickValues(this._rangeValues);
            //x y 轴的比例尺
            this.__xScale.domain([0, this.__xAxisData.length - 1]);
            this.__xScale2.domain([0, this.__xAxisData.length - 1]);
            this.__xScale3.domain([0, this.__xAxisData.length - 1]);
            this.__yScale.domain([0, d3.max(values)]);
            this.__yScale2.domain([0, d3.max(values)]);

        },
        __buildTitle: function (data) {
            var me = this;
            this.__viewBody.append("g")
                .append("text")
                .text("基线折线图")
                .attr("class", "title")
                .attr("x", function (d) {
                    return me.__initConfig().chartWidth / 2;
                }).attr('y', function (d) {
                return 30;
            }).attr('dx', function (d) {
                return this.getBBox().width / 2 - 100;
            });
        },
        __buildChart: function (result) {
            this.__resetScale(result);
            this.__xAxisG.call(this.chart.xAxis);
            this.__yAxisG.call(this.chart.yAxis);
            this._buildSeriesLines(this.__yAxisData);
            this._buildBrush();
        },

        _buildOtherxAxisIndex:function (d,y) {
            var values=[];

            values.push({
                y:y,
                x:d.x0,
                color:d.color
            })
            values.push({
                y:y,
                x:d.x1,
                color:d.color
            })
            return values;
        },
        __buildyOtherAxisGroup:function (otherYseries) {
            var me =this;

            var yotherText = this.__yOtherAxisGroup.selectAll('.series-yother-title').data(otherYseries);

            yotherText.text(function (d) {
                return d.name;
            })
                .attr("class", "series-yother-title")
                .attr("x", me.__xScale(0)).attr('y', function (d) {
                return me.__yScale(d.y);
            }).attr('dy', function (d) {
                return -this.getBBox().height / 2;
            });


            yotherText.enter().append("text")
                .text(function (d) {
                    return d.name;
                })
                .attr("class", "series-yother-title")
                .attr("x",me.__xScale(0)).attr('y', function (d) {
                return me.__yScale(d.y);
            })
                .attr('dy', function (d) {
                    return -this.getBBox().height / 2;
                });
            this.__yOtherAxisGroup.selectAll('.series-yother').remove();
            for(var i=0;i<otherYseries.length;i++){
                var s = otherYseries[i];
                for(var j=0;j<s.data.length;j++){
                    this.__yOtherAxisGroup.append('path')
                        .attr('d', function (d) {
                            return me.chart.otheryarea(s.data[j].domain);
                        })
                        .attr('stroke', s.data[j].color)
                        // .attr('stroke-linecap','round')
                        .attr("class", "series-yother")
                        .attr('fill', 'none')
                        .style('transition', '.4s')
                        .style("stroke-width", 5);
                    //折线绘制--线的颜色

                }
            }

        },
        __setEvents: function () {
            var me = this;
            window.onresize = function () {
            }


        },
        __buildLegend: function () {

            // $("#svg").html(
            //     "<foreignObject style = 'width:100%;height:100%;position: relative;'>" +
            //     "<div class='labb'><p><span class='base-area' style = 'background-color: rgba(13,173,242,0.3)'></span>基线带</p><p><span class='base-line' style = 'border-bottom: 3px solid rgb(103,91,186);'></span>折线</p></div>" +
            //     "<div class='xtime'>(时间)</div>" +
            //     "<div class='ynum'>(数值)</div>" +
            //     "</foreignObject>"
            // );
        },

        setData: function (result) {
            this.__buildChart(result);
            for (var i=0;i<result.otherYseries.length;i++){
                var values =[];
                for (var j=0;j<result.otherYseries[i].data.length;j++){
                    result.otherYseries[i].data[j]['domain'] = this._buildOtherxAxisIndex(result.otherYseries[i].data[j],result.otherYseries[i].y);
                }

            }
            this.otherYseries = result.otherYseries;
            this.__buildyOtherAxisGroup(result.otherYseries);
        }
    };


    function D3BaseLine(selectionContent, settings) {
        var me = this;
        return new d3BaseLine(selectionContent,settings)
    }

    win.D3BaseLine = D3BaseLine;
})(d3, window);