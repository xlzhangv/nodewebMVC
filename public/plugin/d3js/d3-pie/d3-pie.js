(function () {
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
    function D3Pie(selection,settings) {
        this.settings={
            color:'',
            radius : [0.4, 0.7],
            center : [0.5, 0.5],
            tipFormatter:function(data){
                return data.name;
            },
            event:{
                onclick:function (d) {

                }
            }
        }
        this.id= Math.round(Math.random()*999999)+new Date().getTime();
        this.settings = objCopy(this.settings,settings);
        this.init(selection);
    }
    D3Pie.prototype={
        height:0,
        width:0,
        _tempR:0,
        radius:0,
        lineWidth:16,
        opacity:1,
        _arc:undefined,
        _tiparc:undefined,
        _pie:undefined,
        _pieg:undefined,
        _svgview:undefined,
        _centerText:undefined,
        _circle:undefined,
        _color:d3.scaleOrdinal(d3.schemeCategory20),
        init:function (selection) {
            selection.style('position','relative');
            this.dom = selection.node();
            this._svgview = selection.append('svg').attr("width", '100%').attr("height", '100%');
            this._pieg = this._svgview.append('g');

            this.layout();
            this._buildPie();
            this.__buildToolTip();
            this.events();
        },

        events:function () {

            this._svgview.style('cursor','url(/plugin/d3js/d3-radar/radar.cur),auto').on('mousemove',function () {
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
                // 'margin': '3px',
                'position': 'fixed',
                'visibility': 'hidden',
                'border-style': 'solid',
                'white-space': 'nowrap',
                'z-inde': '9999999',
                'transition': '0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                // 'background-color': 'rgba(50, 50, 50, 0.7)',
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
                // 'padding': '5px',
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

        _buildCenter:function(){
            var center = {
                'transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)",
                '-ms-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", 	/* IE 9 */
                '-moz-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", 	/* Firefox */
                '-webkit-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", /* Safari 和 Chrome */
                '-o-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)" 	/* Opera */
            }
            for (var k in center){
                this._pieg.style(k,center[k]);
            }

        },
        layout:function () {
            this.width = this.settings.width||this.dom.clientWidth,
                this.height = this.settings.height||this.dom.clientHeight;
            this._buildCenter();

        },
        _buildPie:function () {
            this.radius= Math.min(this.width, this.height)/2;
            this._tempR = this.radius*this.settings.radius[1];
            this._arc = d3.arc()
                .innerRadius(this.radius*this.settings.radius[0])
                .outerRadius(this.radius*this.settings.radius[1]);
            this._tiparc = d3.arc()
                .innerRadius(this.radius*this.settings.radius[0])
                .outerRadius(this.radius*this.settings.radius[1]+15);
            // this.centroid =  this._arc.centroid();
            this._pie = d3.pie()
                .value(function (d) {
                    return d.angle;
                })
                .sort(null);
        },
        __scaleLinear:function(max){
            this.__pieScale =  d3.scaleLinear().domain([0, max]).range([0, 2*Math.PI]);
        },
        _buildPieAngle:function (p) {
            var angle = Math.round(this.__pieScale(p)*100)/100;
            this._pie.startAngle(angle).endAngle(2*Math.PI+angle);
        },
        _updatePie:function (data) {
            var me =this;

            for(var i=0;i<data.length;i++){
                data[i].angle = this.__pieScale(data[i].total_time);
            }


            var upPie = this._pieg.selectAll('.pie').data(this._pie(data));

            upPie.exit().remove();


            upPie.style('fill',function (d,i) {
                if(d.data.color){
                    var c = d3.color(d.data.color);
                    c.opacity = 1;
                    return c.toString();
                }
                return me._color(i);
            }).transition()
                .duration(100)
                .attrTween("d",function(d) {
                    var interpolate = d3.interpolate(d.startAngle, d.endAngle);

                    return function(t) {

                        d.endAngle = interpolate(t);

                        return me._arc(d);
                    };
                });

            upPie.enter().append('path').attr('class','pie').style('fill',function (d,i) {
                if(d.data.color){
                    var c = d3.color(d.data.color);
                    c.opacity = 1;
                    return c.toString();
                }
                return me._color(i);

            }).on('mouseover',function (d) {
                d3.select(this).transition().attr('d',me._tiparc);

                d3.event.stopPropagation();
                d3.event.preventDefault();

            }).on('mousemove', function(d) {

                me._showTip(d,{
                    x:d3.event.x+10,
                    y:d3.event.y-10
                });

                d3.event.stopPropagation();
                d3.event.preventDefault();
            })
            .on('mouseout', function() {
                me._hideTip();
                d3.select(this).transition().attr('d',me._arc);
                d3.event.stopPropagation();
            }).on('click',function (d) {
                me.settings.event.onclick(d);
                d3.event.stopPropagation();
            }).transition()
                .duration(100)
                .attrTween("d",function(d) {
                    var interpolate = d3.interpolate(d.startAngle, d.endAngle);

                    return function(t) {

                        d.endAngle = interpolate(t);

                        return me._arc(d);
                    };
                });
        },
        _buildLine:function () {
            var me =this;
            var x = this.radius*this.settings.radius[1];
            this._pieg.selectAll('.line').remove();
            this._pieg.append('g').attr("transform", function () {
                var angle = - 90;

                return "rotate(" + (angle) +")";
            }).attr('class','line').append('line').attr('x1',this.radius*this.settings.radius[0]).attr("x2", x).style("stroke", "rgb(72, 71, 71)")
        },
        _buildText:function (data) {
            var me =this;
            this._circle = this._pieg.selectAll('.center-round').data([data]);
            this._circle.enter().append('circle')
            .attr('class','center-round')
            .attr('cx','0')
            .attr('cy','0')
            .attr('r',this.radius*this.settings.radius[0]-2)
            .attr('fill','#fff')
            .attr('stroke','#355EA1')
            .attr('stroke-width','4');
            this._centerText = this._pieg.selectAll('.center-text').data([data]);
            this._centerText.html(function (d) {
                return d.plan.cycle;
            });
            this._centerText.enter().append('text').attr('class','center-text').style('text-anchor',' middle').attr("x", "0").attr("dy", ".35em").html(function (d) {
                return d.plan.cycle;
            });
            var tip_circle = this._pieg.selectAll('.tip-round').data([data]);
            tip_circle.enter().append('circle')
                .attr('class','tip-round')
                .attr('cx','0')
                .attr('cy','0')
                .attr('r',this.radius*this.settings.radius[0]-2)
                .attr('fill','transparent')
                .attr('stroke','#355EA1')
                .attr('stroke-width','4')
                .on('mousemove', function(d) {
                    me._showTip(d,{
                        x:d3.event.x+10,
                        y:d3.event.y-10
                    });

                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                })
                .on('mouseout', function() {
                    me._hideTip();
                    d3.event.stopPropagation();
                });

        },
        updateLamp:function (changestatus) {
            switch(changestatus){
                case 0:
                    $(this.dom).removeClass('blue-lamp red-lamp')
                    break;
                case 1:
                    $(this.dom).addClass('red-lamp')
                    break;
                case -1:
                    $(this.dom).addClass('blue-lamp')
                    break;

            }
        },
        setData:function (series) {

            this.__scaleLinear(series.plan.cycle);
            this._buildPieAngle(series.plan.offset);
            this._updatePie(series.data);
            this._buildText(series);
            this._buildLine();
        },
        setValue:function (d) {
            this.updateText(d);
        }
    }
    window.D3Pie  = D3Pie;
})()