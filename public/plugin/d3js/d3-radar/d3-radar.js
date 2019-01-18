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


    function D3radar(selection,settings) {
        this.settings={
            center:undefined,
            radialInterval:5,//放射环个数
            maxValue:1,
            minValue:0,
            tipFormatter:function(data){
                return data.name;
            },
            labelStyle:{
                padding:10,
                fontSize:14
            },
            padding:{
                top: 30,
                right: 35,
                bottom: 35,
                left: 30
            },
            ticksStyle:{
                fill:'none'
            },
            color: d3.scaleOrdinal().range(["#6F257F", "#CA0D59"])
        }
        this.settings = settings?objCopy(this.settings,settings):this.settings;
        this.init(selection);
    }
    D3radar.prototype={
        height:0,
        width:0,
        __indicatorLength:0,//指针的个数
        __radialLineGenerator:undefined,//角度生成器
        __indicatorrotates:[],//指针角度集合
        __radiusScale:undefined,//半径比例尺
        __radialTicks:undefined,//放射环
        __radialTicksGroup:undefined,//放射环组
        __radialAxisGroup:undefined,//射线轴组
        __radialSeriesGroup:undefined,//雷达图
        _data:[],
        init:function (selection) {
            this.dom = selection.node();
            this.view = selection;
            this.radarsvg = selection.append('svg').attr('width', '100%').attr('height', '100%').attr('class', 'd3-radar');
            this.radarbody = this.radarsvg.append('g').attr('class','radar-body');
            this.__radialAxisGroup = this.radarbody.append('g').attr('class','axis-ticks');
            this.__ringTicksGroup = this.radarbody.append('g').attr('class','circle-ticks');
            this.__radialSeriesGroup = this.radarbody.append('g').attr('class','axis-series');
            this.__radialCircleGroup = this.radarbody.append('g').attr('class','series-circle-group');
            this._buildScale();
            this._buildRadialTicks();
            this.__buildToolTip();
            this.events();
        },
        events:function () {

            this.view.style('cursor','url(/plugin/d3js/d3-radar/radar.cur),auto').on('mousemove',function () {
                d3.event.stopPropagation();
                return false;
            }).on('mouseover',function () {
                d3.event.stopPropagation();
                return false;
            })
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
            this._tooltip = d3.select('body').append('div').attr('id', this.id + '-tooltip').attr('class', 'tooltip');
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
        /**
         * 生成刻度
         * @private
         */
        _buildRadialTicks:function () {
            var me =this;
            var circleAxis = this.__ringTicksGroup.selectAll('.circle-interval')
                .data(this.__radialTicks)
                .enter().append('g')
                .attr("class", "circle-interval");

            circleAxis.append("circle")
                .attr("r", function (d, i) {
                    return me.__ticksScale(d);
                })
                .attr("class", "circle")
                .style("stroke", "rgba(175, 173, 173,0.5)")
                .style("fill", "rgba(255, 255, 255, 0.8)");

            this._circleAxisText = this.__ringTicksGroup.append('g').attr('class','circle-text');
            this._circleAxisText.selectAll('.circle-interval')
                .data(this.__radialTicks)
                .enter().append("text")
                .style('font-size','11px')
                // .style("fill", "#000")
                .attr("text-anchor", "middle")
                .text(String)
                .attr("dy", function (d,i) {
                    return -1 * me.__ticksScale(d)+this.getBBox().height/4;
                })


        },
        _buildIndicator:function (indicator) {
            var me =this;
            this.__axisIntervalUpdate = this.__radialAxisGroup.selectAll('.axis-interval').data(indicator);

            var lineAxis = this.__axisIntervalUpdate.enter().append('g')
                .attr("transform", function (d, i,doms) {
                    var angle;
                    if(d.deflectionAngle){
                        angle = ((i / doms.length * 360) - 90) + d.deflectionAngle;
                    }else{
                        angle =(i / doms.length * 360) - 90;
                    }
                    me.__indicatorrotates.push(angle);
                    d3.select(this).attr('angle',angle);
                    return "rotate(" + (angle) +") translate(" + me.__radiusScale(me.settings.maxValue) + ")";
                })
                .attr("class", "line-ticks");

            lineAxis.append('line')
                .attr("x2", -1 * me.__radiusScale(me.settings.maxValue))
                .style("stroke", "#ddd")
                .style("fill", "none");

            this.__axisIntervalUpdate.enter().append('image')
                .attr('height','30')
                .attr('width','30')
                .attr('fill', 'transparent')
                // .attr('transform',"translate(30,30)")
                .attr('xlink:href',function (d) {
                    return d.image;
                })
                .attr("x", function (d, i,doms) {
                    var angle = me.__indicatorrotates[i];
                    return me.__radiusScale(me.settings.maxValue)*((Math.cos(me.__angleToRadianFun(angle))))-(this.height.baseVal.value)/2*(1-(Math.cos(me.__angleToRadianFun(angle))));

                })
                .attr("y", function (d,i) {
                    var angle =me.__indicatorrotates[i];
                    return me.__radiusScale(me.settings.maxValue)*(Math.sin(me.__angleToRadianFun(angle)))-(this.height.baseVal.value)/2*(1-(Math.sin(me.__angleToRadianFun(angle))));
                })
                .attr("preserveAspectRatio",'xMidYMid')
                .append('title').text(function (d) {
                return d.name;
            });

            this._circleAxisText.attr("transform", function (d, i,doms) {
                return "rotate(" + (me.__indicatorrotates[0]+90) +")";
            })
            // this.__axisIntervalUpdate.enter().append('text')
            //     .html(function (d) {
            //         if(d.name){
            //             return d.name;
            //         }
            //         return d;
            //     })
            //     .attr("x", function (d,i) {
            //         return me.__radiusScale(me.settings.maxValue)*Math.sin(me.__angleToRadianFun(me.__indicatorrotates[i]-90));
            //     })
            //     .attr("y", function (d,i) {
            //         return me.__radiusScale(me.settings.maxValue)*Math.cos(me.__angleToRadianFun(me.__indicatorrotates[i]-90));
            //     })
            //     .attr("dx", function (d, i,doms) {
            //         if(i / doms.length * 360==0) return 0;
            //         if((i / doms.length * 360) < 180){
            //             return -1*this.getBBox().width/2;
            //         }
            //         return this.getBBox().width/2;
            //     })
            //     .attr("text-anchor", "middle");


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
                this.radarbody.style(k,center[k]);
            }

        },
        _buildScale:function () {
            var me =this;
            this.width = this.settings.width||this.dom.clientWidth,
                this.height = this.settings.height||this.dom.clientHeight;
            if(!this.settings.center)
                this.settings.center = [(this.width - this.settings.padding.left - this.settings.padding.right) / 2 + this.settings.padding.left,(this.height - this.settings.padding.top - this.settings.padding.bottom) / 2 + this.settings.padding.top];
            this.__radiusScale = d3.scaleLinear().domain([this.settings.minValue, this.settings.maxValue]).range([0, (d3.min([(this.width - this.settings.padding.left - this.settings.padding.right), (this.height - this.settings.padding.top - this.settings.padding.bottom)]) / 2)]);

            this.__ticksScale = d3.scaleLinear().domain([this.settings.maxValue,this.settings.minValue])
                .range([ (d3.min([(this.width - this.settings.padding.left - this.settings.padding.right), (this.height - this.settings.padding.top - this.settings.padding.bottom)]) / 2),0]);

            this.__radialTicks =this.__ticksScale.ticks(this.settings.interval);

            this.__radialLineGenerator = d3.radialLine();

            this.__radialLineGenerator
                .radius(function (d, i) {
                    return me.__radiusScale(d.value)
                })
                .angle(function (d, i) {
                    if (i === me.__indicatorLength) {
                        i = 0;
                    }
                    return me.__angleToRadianFun(me.__indicatorrotates[i]+90);
                });
            this._buildCenter();
        },
        _seriesScale:{},
        _buildRadiusScale:function (series) {
            for(var i=0;i<series.length;i++){
                var values=[];
                var data = series[i].data;
                for(var k =0;k<data.length;k++){
                    data[k]['seriesName'] = series[i].name;
                    values.push(data[k].value);
                }
                var max = d3.max(values),min = d3.min(values);

                if(this._seriesScale[series[i].name]){
                    this._seriesScale[series[i].name].domain([min, max]);
                }else{
                    this._seriesScale[series[i].name] = d3.scaleLinear().domain([min, max]).range([0, (d3.min([(this.width - this.settings.padding.left - this.settings.padding.right), (this.height - this.settings.padding.top - this.settings.padding.bottom)]) / 2)]);
                }
            }

        },
        __angleToRadianFun:function (angle) {
            return Math.PI/180*(angle);
        },
        _buildSeries:function (series) {
            var me =this;

            this._seriesgroups = this.__radialSeriesGroup.selectAll('.series').data(series);

            this.__updateSeries(this._seriesgroups);

            this._seriesgroups.enter()
                .append("g").attr('class', 'series')
                .style('opacity', function (d, i) {
                    return 1;
                }).append('path')
                .attr("class", "series-line")
                .style("stroke-width", 1)
                .style('transition','.3s')
                .style("stroke", function (d, i) {
                    if(d.color){
                        var c = d3.color(d.color);
                        c.opacity =1;
                        return c.toString();
                    }
                    return me.settings.color(d.value)
                })
                .style("fill", function (d, i) {
                    if(d.color){
                        var c = d3.color(d.color);
                        c.opacity =0.3;
                        return c.toString();
                    }
                    return me.settings.color(d.value)
                })
                // .style("fill-opacity", '0.2')
                .style('display',function (d) {
                    return d.display?'none':null;
                })
                .attr("d", function (d) {
                    me.__indicatorLength = d.data.length;
                    return me.__radialLineGenerator(d.data.concat(d.data[0]));
                });
            this._buildSeriesCircle(series);

        },
        __updateSeries:function (_seriesgroups) {
            var me =this;
            _seriesgroups.style('opacity', function (d, i) {
                d3.select(this).selectAll('path').datum (d)
                    .style("stroke-width", 1)
                    .style("stroke", function (d, i) {
                        if(d.color){
                            var c = d3.color(d.color);
                            c.opacity =1;
                            return c.toString();
                        }
                        return me.settings.color(d.value)
                    })
                    .style("fill", function (d, i) {
                        if(d.color){
                            var c = d3.color(d.color);
                            c.opacity =0.3;
                            return c.toString();
                        }
                        return me.settings.color(d.value)
                    })
                    .style('display',function (d) {
                        return d.display?'none':null;
                    })
                    .attr("d", function (d) {
                        me.__indicatorLength = d.data.length;
                        return me.__radialLineGenerator(d.data.concat(d.data[0]));
                    });
                return 1;
            });
            _seriesgroups.exit().remove();

        },
        _buildSeriesCircle:function (series) {
            var me =this;
            var values=[];
            for(var i=0;i<series.length;i++){
                var s = series[i];
                for(var j=0;j<s.data.length;j++){
                    values.push(objCopy({
                        index:j,
                        display:s.display,
                        color:s.color,
                        seriesName:s.name
                    },s.data[j]));
                }
            }


            this._seriescirclegroups = this.__radialCircleGroup.selectAll('.series-circle').data(values);

            this._seriescirclegroups.attr("cy",function (d) {
                return me.__radiusScale(d.value);
            }).attr('fill',function (d) {
                if(d.color){
                    var c = d3.color(d.color);
                    c.opacity =1;
                    return c.toString();
                }
                return me.settings.color(d.value);
            })
                .attr("transform", function(d) {
                    return "rotate(" + (me.__indicatorrotates[d.index]-90) + ")";
                }).style('display',function (d) {
                    return d.display?'none':null;
                });

            this._seriescirclegroups.enter().append("circle")
                .attr("class", "series-circle")
                .attr('fill',function (d) {
                    if(d.color){
                        var c = d3.color(d.color);
                        c.opacity =1;
                        return c.toString();
                    }
                    return me.settings.color(d.value);
                })
                .attr("cy",function (d) {
                    return me.__radiusScale(d.value);
                })
                .attr("r", 4)
                .attr("transform", function(d) {
                    return "rotate(" + (me.__indicatorrotates[d.index]-90) + ")";
                })
                .style('transition','.2s')
                .style('display',function (d) {
                    return d.display?'none':null;
                })
                .on('mouseenter',function (d) {
                    me._showTip(d,{
                        x:this.getBoundingClientRect().x+10,
                        y:this.getBoundingClientRect().y-10
                    });
                    d3.select(this).attr('r',10);
                    d3.event.stopPropagation();
                    d3.event.preventDefault();

                }).on('mouseout',function () {
                    me._hideTip();
                    d3.select(this).attr('r',4);
                    d3.event.stopPropagation();
                });
            this._seriescirclegroups.exit().remove();

        },
        wrapWord:function (dom, text, separator, align) {
            var ddom = d3.select(dom),
                words = text.split(separator),
                lineNumber = 0,
                chartL = dom.getComputedTextLength(),
                lineHeight = dom.getBoundingClientRect().height,
                lineW = dom.getBoundingClientRect().width / chartL,
                x = +ddom.attr('x'),
                y = +ddom.attr('y');
            ddom.text(null);
            for (var i = 0; i < words.length; i++) {
                ddom.append('tspan').attr('x', x).attr('y', lineNumber++ * lineHeight + y).text(words[i]);
            }
            ddom.selectAll('tspan').attr('x', function () {
                if (align == 'right') {
                    return (this.getBBox().width - lineW * this.getComputedTextLength()) + 'px';
                } else if (align == 'left') {
                    return 0;
                } else {
                    return (this.getBBox().width - lineW * this.getComputedTextLength()) / 2 + 'px';
                }

            })
            return ddom.node().innerHTML;
        },
        setData:function (d) {
            this._seriesData=d.series;
            this._buildIndicator(d.indicator);
            this._buildSeries(d.series);
        },
        updateDate:function (d) {
            this._seriesData=d.series;
            this._buildSeries(d.series);
        },
        updateSeries:function (series) {
            objCopy(this._seriesData,series);
            this._buildSeries(this._seriesData);
        }
    }

    window.D3radar = D3radar;

})(d3);