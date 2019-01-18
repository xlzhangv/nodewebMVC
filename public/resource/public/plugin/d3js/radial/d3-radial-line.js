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
    D3RadialLine = function(selection,settings) {
        this.settings={
            radius : [0.4, 0.8],
            center : [0.5, 0.5],
            height:0,
        	width:0,
            axisFormater: function (d) {
                return d;
            },
            yAxisFormat:function (d) {
                return d;
            },
            tipFormatter: function (data) {
                return data.name;
            }
        }
        this.id = '_'+Math.round(Math.random()*99999)+'_'+new Date().getTime();
        this.settings = settings?objCopy(this.settings,settings):this.settings;
        this.init(selection);
    };
    D3RadialLine.prototype={
        height:0,
        width:0,
        __xAxisData :[],
        __yAxisData :[],
        __xScale:undefined,
        __yScale:undefined,
        __lineRadial:undefined,
        _svg:undefined,
        _maing:undefined,
        _ticks:10,
        _events:{
            brushselected:function(){

                
            }
        },
        init:function (selection) {
        	this.dom = selection.node();
            this._svg = selection.append('svg').attr('height','100%').attr('width','100%');
            this._maing = this._svg.append('g').attr("text-anchor", "middle");
            this.__buildToolTip();
             //定义x轴
            this.__xAxisG = this._maing.append("g").attr("class", "axis axis-x").attr("text-anchor", "middle");
            //定义y轴
            this.__yAxisG = this._maing.append("g").attr("class", "axis axis-y").attr("text-anchor", "middle");
           	this._lineGroup = this._maing.append('g').attr('class','series-line-group').attr("text-anchor", "middle");
            this.__circleGroup = this._maing.append('g').attr('class','line-circle-group').attr("text-anchor", "middle");
            this._title=this._maing.append('text').attr('class','center-title').attr("fill", "#fff").style('font-size','18px').attr('dy','0.35em').style('opacity',0);
            this.layout();
            
        },
         layout:function(){
         	 this.width = this.settings.width||this.dom.clientWidth,
             this.height = this.settings.height||this.dom.clientHeight;
             var center = {
                'transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)",
                '-ms-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", 	/* IE 9 */
                '-moz-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", 	/* Firefox */
                '-webkit-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", /* Safari 和 Chrome */
                '-o-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)" 	/* Opera */
            }
            for (var k in center){
                this._maing.style(k,center[k]);
            }
            this._buildRadio();
        },
        _buildRadio:function(){
        	var me =this;
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
        	this.radius= Math.min(this.width, this.height)/2;

            this.__xScale = d3.scaleLinear().range([0, 2 * Math.PI]);
            this.__yScale = d3.scaleRadial().range([this.radius*this.settings.radius[0], this.radius*this.settings.radius[1]]);
            this.__yspacing = this.radius*this.settings.radius[1] - this.radius*this.settings.radius[0];
            this.__lineRadial= d3.radialArea()
            .curve(curves[1])
            .angle(function(d,i) {
					return me.__xScale(i);
				})
			.radius(function(d) {
				return me.__yScale(d.value);
			});
//			.innerRadius(this.radius*this.settings.radius[0])
//			.outerRadius(function(d) {
//				return me.__yScale(d.value);
//			});
        },
         __buildToolTip: function () {
            this.__focus = this._maing.append('g')
                .attr('class', 'focus');
            this.__focus.append("circle").attr("fill", "none").attr('class','focus-circle').attr("stroke", "#ccc")
					.attr("opacity",0);
            // .style('display', 'block');
            this.__focus.append('line').attr('class', 'x');
            // .classed('y', true);
            //指示线的绘制
            var lineCss = {
                'fill': 'none',
                'stroke': '#999',
                'stroke-width': '1px',
                'stroke-dasharray': '3 3',
                "stroke-opacity": '0.8'
            };
            for (var k in lineCss) {
                this._svg.selectAll('.focus line').style(k, lineCss[k]);
            }
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
                'top': '0'
            }
            this._tooltip = d3.select(this.dom).append('div').attr('id', this.id + '-tooltip').attr('class', 'tooltip');
            for (var k in deftipCss) {
                this._tooltip.style(k, deftipCss[k]);

            }
        },
        __showTip: function (data, point) {
        	var me =this;
            this._tooltip.style('visibility', 'visible').style('opacity', '1')
         
              .style('top', function () {
                if (point.y - this.getBoundingClientRect().height <= 0) {
                    return (point.y - 10) + 'px';
                }
                if (point.y + this.getBoundingClientRect().height > me.height) {

                    return (point.y - this.getBoundingClientRect().height - 10) + 'px';
                }
                return (point.y - 10) + 'px';

            })
            .style('left', function () {



                if(point.x> me.width/2){
                    if (point.x + this.getBoundingClientRect().width > me.width) {
                        return (point.x - this.getBoundingClientRect().width - 10) + 'px';
                    }
                    return (point.x + this.getBoundingClientRect().width/2) + 'px';
                }else{
                    if (point.x - this.getBoundingClientRect().width <= 0) {
                        return (point.x + this.getBoundingClientRect().width/2) + 'px';
                    }
                    return (point.x - this.getBoundingClientRect().width) + 'px';
                }
            })
             .html(this.settings.tipFormatter(data));
        },
         //隐藏提示框
        __hideTip: function () {
            this._tooltip
                .style('visibility', 'hidden')
                .style('opacity', '0');
            this.__focus.style('display', 'none');
        },
        _updateScale:function (data) {
            var me =this;
            this.__xAxisData = data.xAxis;
            var values =[];
            this.__yAxisData = data.series;
            for (var i = 0;i<data.series.length;i++){
                var d = data.series[i].data;
                for (var j =0;j<d.length;j++){
                    values = values.concat(d[j].value);
                }
            }
			this.__xScale.domain([0,this.__xAxisData.length-1]).nice();
			this.__yScale.domain([0,d3.max(values)!=0?d3.max(values):100]).nice();
			this._buildAxis();
        },
        /**
         * 生成坐标轴
         * @private
         */
        _buildAxis:function(){
            // // bottom axis
            var me =this;
			
			var yTickUpdate = this.__yAxisG.selectAll("g").data(this.__yScale.ticks(5));
			
			yTickUpdate.exit().remove();
			
			yTickUpdate.each(function(){
				d3.select(this).select('circle').attr("opacity", function(d,i){
					if(d==0) return 0.8;
					return 0.2;
				}).attr("r", function(d,i){
					return me.__yScale(d);
				})
				d3.select(this).select('line').attr("transform", function(d,i) {
					return "translate(0,"+(-me.__yScale(d))+")"
				}).attr('fill','#fff');
				d3.select(this).select('text').attr("y", function(d) {
					return -me.__yScale(d);
				}).attr("dx", "14px").text(function(d) {
					return d;
				}).attr('fill','#fff');
			})
					
			
			
			var yTick = yTickUpdate.enter().append("g");

			yTick.append("circle").attr("fill", "none").attr('class','axis-circle').attr("stroke", "#ccc")
					.attr("opacity", function(d,i){
						if(d==0) return 0.8;
						return 0.2;
					}).attr("r", function(d,i){
						return me.__yScale(d);
					});
			yTick.append('line').attr("transform", function(d,i) {
					return "translate(0,"+(-me.__yScale(d))+")"
				}).attr("x2", function(d,i){
				return 5;
			}).attr("stroke", "#FFF");	
			
            yTick.append("text").attr("y", function(d) {
						return -me.__yScale(d);
					}).attr("dx", "14px").text(function(d) {
						return d;
					}).style('font-size',10).attr('fill','#fff');
					
            
            
            
			var xTickUpdate = this.__xAxisG.selectAll("g").data(this.__xScale.ticks(this.__xAxisData.length-1))
			
			xTickUpdate.attr("transform", function(d,i) {
								return "rotate("+ ((me.__xScale(d)) * 180 / Math.PI - 90)+ ") translate(" + (d==0?me.radius*me.settings.radius[0]:me.radius*me.settings.radius[1]) + ",0)";
							});		
			xTickUpdate.selectAll('text').attr("transform", function(d,i) {
                if(d==0){
                    return "rotate(90) translate(0,"+(-1*me.__yspacing-15)+")"
                }
                var angle = me.__xScale(d);
                return ((angle < Math.PI / 2) || (angle > (Math.PI * 3 / 2)))
                    ? "rotate(90)translate(0,-13)"
                    : "rotate(-90)translate(0, 15)";
			}).text(function(d) {
                return me.__xAxisData[d];
					});
							
			var xTick = xTickUpdate.enter().append("g").attr("text-anchor", "middle").attr(
							"transform", function(d,i) {
                    return "rotate("+ ((me.__xScale(d)) * 180 / Math.PI - 90)+ ") translate(" + (d==0?me.radius*me.settings.radius[0]:me.radius*me.settings.radius[1]) + ",0)";
							});
			xTick.append("line").attr("x2", function(d,i){
				if(d==0) return me.__yspacing;
				return 5;
			}).attr("stroke", "#FFF");

			xTick.append("text").attr("transform", function(d,i) {
				if(d==0){
					return "rotate(90) translate(0,"+(-1*me.__yspacing-15)+")"
				}

				var angle = me.__xScale(d);
				return ((angle < Math.PI / 2) || (angle > (Math.PI * 3 / 2)))
						? "rotate(90)translate(0,-13)"
						: "rotate(-90)translate(0, 15)";
			}).text(function(d) {
				return me.__xAxisData[d];
			}).style("font-size", 10).attr("opacity", 0.6).attr('fill','#fff');
					
			xTickUpdate.exit().remove();
			
			this.__buildLine();
			
        },
        __buildLine:function(){
        	var me =this;
        	
        	this._seriesgroups = this._lineGroup.selectAll('.series-line-g').data(this.__yAxisData);

            this._seriesgroups.style('opacity', function (d, i) {
                d.seriesIndex = i;
                d3.select(this).selectAll('path').datum (d)
                    .style("stroke-width", 1)
                    .style("fill", "none")
                    .attr('d', function (d) {
                        return me.__lineRadial(d.data);
                    });
                return 1;
            });

            this._seriesgroups.enter()
            .append("g").attr('class', 'series-line-g')

            .style('stroke', function (d, i) {
                return d.color||'red';
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
                return me.__lineRadial(d.data);
            });
            this._buildSeriesCircle(this.__yAxisData);
        },
        _buildSeriesCircle:function (series) {
            var me =this;
            var values=[];
            for(var i=0;i<series.length;i++){
                var s = series[i];
                for(var j=0;j<s.data.length;j++){
                    values.push({
                    	id:'_'+i+'_'+j,
                        seriesIndex:i,
                        xAxisIndex:j,
                        name:me.__xAxisData[j],
                        value:s.data[j].value,
                        seriesName:s.name
                    });
                }
            }


            this._seriescirclegroups = this.__circleGroup.selectAll('.series-line-circle').data(values);


            this._seriescirclegroups.attr('cx', function (d, i) {
                    return me.__yScale(d.value);
                })
                .attr('cy', function (d) {
                    return 0;
                })
                .attr("transform", function(d) {
					return "rotate("+ ((me.__xScale(d.xAxisIndex)) * 180 / Math.PI - 90)+ ")";
				})

            //圆圈的绘制
            this._seriescirclegroups.enter().append('circle').attr('class', function (d) {
                return 'series-line-circle '+d.id;
            })
                .attr('cx', function (d, i) {
                    return me.__yScale(d.value);
                })
                .attr('cy', function (d) {
                    return 0;
                })
                .attr("transform", function(d) {
					return "rotate("+ ((me.__xScale(d.xAxisIndex)) * 180 / Math.PI - 90)+ ")";
				})
                .style('display','none')
                .attr('r', 3)
                //小圆点的样式
                .attr("fill", "#FFF")
                .style('transition', '.4s');
            this._seriescirclegroups.exit().remove();
         
            //小圆圈的显示
            var littleCircle = this.__circleGroup.selectAll('.hover-circle').data(values)
	            .attr('cx', function (d, i) {
                    return me.__yScale(d.value);
                })
                .attr('cy', function (d) {
                    return 0;
                })
                .attr("transform", function(d) {
					return "rotate("+ ((me.__xScale(d.xAxisIndex)) * 180 / Math.PI - 90)+ ")";
				})

            littleCircle.enter().append('circle').attr('class', 'hover-circle')
                .attr('cx', function (d, i) {
                    return me.__yScale(d.value);
                })
                .attr('cy', function (d) {
                    return 0;
                })
                .attr("transform", function(d) {
					return "rotate("+ ((me.__xScale(d.xAxisIndex)) * 180 / Math.PI - 90)+ ")";
				})
				.attr('stroke','#FFF')
				.attr('stroke-dasharray','5')
				.style('opacity',0)
                .attr('fill-opacity', 0)
                .attr('r', 10)
                .style('transition', '.4s')
                .on('mouseout', function (d) {
                	d3.select(this).style('opacity',0);
                	me._title.style('opacity',0);
                    me.__circleGroup.selectAll('.'+d.id) .style('display','none')//.style('opacity', 1).style('visibility','visible')
                    me.__hideTip();
                })
                .on('mouseover', function (d) {
                	d3.select(this).style('opacity',1);
                	me._title.text(d.name).style('opacity',1);
                    me.__circleGroup.selectAll('.'+d.id) .style('display',null)//.style('opacity', 1).style('visibility','visible')
                    me.__focus.style('display', null);
                    me.__focus.select('.focus-circle').attr("opacity",1).attr('r',me.__yScale(d.value));
                    me.__focus.select('line.x').attr('x1', 0).attr('x2', me.__yspacing)
                    .attr("transform", "rotate("+ ((me.__xScale(d.xAxisIndex)) * 180 / Math.PI - 90)+ ") translate(" + me.radius*me.settings.radius[0] + ",0)");
                    me.__showTip(d, this.getBoundingClientRect());
                });
            littleCircle.exit().remove();
        },
        setData:function (data) {
        	
            this._updateScale(data);
        }
    }

   window.D3RadialLine = D3RadialLine;
})(d3);