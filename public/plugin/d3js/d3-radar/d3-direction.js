(function (d3) {

    function StringBulider(str) {

        this.init(str);
    }

    StringBulider.prototype = {
        init: function (str) {
            var userAgent = navigator.userAgent;
            var isOpera = userAgent.indexOf("Opera") > -1; // 判断是否Opera浏览器
            this.isIE = userAgent.indexOf("compatible") > -1
                && userAgent.indexOf("MSIE") > -1 && !isOpera; // 判断是否IE浏览器

            if (this.isIE) {
                this.data = str ? new Array(str) : new Array();
            } else {
                this.data = str ? str : '';
            }
        },
        append: function () {
            if (this.isIE) {
                this.data.push(arguments[0]);
            } else {
                this.data += arguments[0];
            }
            return this;
        },
        toString: function () {
            if (this.isIE) {
                if (arguments.length > 0) {
                    return this.data.join(arguments[0]);
                } else {
                    return this.data.join('');
                }
            } else {
                if (arguments.length > 0) {
                    return this.data += arguments[0];
                } else {
                    return this.data;
                }
            }
        },
        clear: function () {
            this.init();
        }

    }
    /**
     * path中间
     *
     * @param x1
     * @param y1
     * @param x2
     * @param y2
     * @returns path
     */
    var pathLineCenter = function (x1, y1, x2, y2) {
        var path;
        var slopy, cosy, siny;
        var Par = 10.0;
        var x3, y3;
        slopy = Math.atan2((y1 - y2), (x1 - x2));
        cosy = Math.cos(slopy);
        siny = Math.sin(slopy);
        x3 = (Number(x1) + Number(x2)) / 2;
        y3 = (Number(y1) + Number(y2)) / 2;
        return {
            x: (Number(x3) + Number(Par * cosy + Par / 2.0 * siny)),
            y: (Number(y3) - Number(Par / 2.0 * cosy - Par * siny))
        };
    }
    var DISTANCE = 2,
        offset = 5;
    /**
     * arrowType: ow单向,dw双向,nw无箭头 lineType:sl 直线,lr左右折线,ud 上下折线,la 左直角,ra右直角
     * 计算两个结点间要连折线的话，连线的所有坐标
     */
    var drawEdgeLine = function (x1, y1, x2, y2, lineType, arrowType) {

        var center = pathLineCenter(x1, y1, x2, y2);
        var start = {
            x: x1,
            y: y1
        }
        var end = {
            x: x2,
            y: y2
        }
        var path = new StringBulider();

        if (Math.abs(x2 - x1) < DISTANCE || Math.abs(y2 - y1) < DISTANCE) {
            lineType = 'sl';
        }

        if (lineType == 'sl') {// 直线
            var endAngle = Math.atan2((y1 - y2), (x1 - x2));// 角度
            var startAngle = Math.atan2((y2 - y1), (x2 - x1));// 角度
            end.x = (offset) * Math.cos(endAngle) + end.x;
            end.y = (offset) * Math.sin(endAngle) + end.y;

            start.x = (offset) * Math.cos(startAngle) + start.x;
            start.y = (offset) * Math.sin(startAngle) + start.y;
            drawLine(path, start.x, start.y, end.x, end.y)

            return {
                line: path,
                arrow: choiceArrow(arrowType, lineType, start, end)
            }
        } else {// broken折线
            var broken1, broken2,diff={x:0,y:0};
            if (lineType == 'ra') {
                if (start.x - end.x > 0) {
                    start.x -= offset;
                    if (start.y - end.y > 0) {
                        end.y += offset;
                        diff.y =4;
                    } else {
                        end.y -= offset;
                        diff.y =-4;
                    }
                } else {
                    start.x += offset;

                    if (start.y - end.y > 0) {
                        end.y += offset;
                    } else {
                        end.y -= offset;
                    }
                }

                broken1 = {
                    x: end.x,
                    y: start.y
                }, broken2 = {
                    x: broken1.x,
                    y: end.y
                };
            }

            path.append(' M' + start.x + ',' + start.y);
            path.append(' L' + broken1.x + ',' + broken1.y);
            drawLine(path, broken1.x, broken1.y, broken2.x, broken2.y)
            path.append(' M' + broken2.x + ',' + broken2.y);
            path.append(' L' + end.x + ',' + end.y);

            return {
                line: path,
                arrow: choiceArrow(arrowType, lineType, start, end, broken1, broken2,diff)
            }
        }
    }

    /**
     * arrowType: ow单向,dw双向,nw无箭头
     */
    function choiceArrow(arrowType, lineType, start, end, broken1, broken2,diff) {
        var path = new StringBulider();
        switch (arrowType) {
            case 'ow' :

                if (lineType == 'sl') {
                    path.append(drawEndArrow(start.x-4, start.y, end.x-4, end.y));
                } else {
                    path.append(drawEndArrow(broken1.x, broken1.y-diff.y, broken2.x, broken2.y-diff.y));
                }

                break;
            case 'nw' :

                break;

            default :

                break;

        }
        return path.toString();

    }

    /**
     * 画直线
     */
    var drawLine = function (path, x1, y1, x2, y2) {
        path.append(" M" + x1 + "," + y1 + " L" + x2 + "," + y2);
    }


    var drawEndArrow = function (x1, y1, x2, y2) {
        var path = '';
        var angle, cos, sin;
        var Par = 10.0;

        angle = Math.atan2((y1 - y2), (x1 - x2));
        sin = Math.sin(angle);
        cos = Math.cos(angle);

        path += " M" + x2 + "," + y2;

        // 上角
        path += " L" + (Number(x2) + Number(Par * cos + Par / 2.0 * sin)) + ","
            + (Number(y2) - Number(Par / 2.0 * cos - Par * sin));

        // 下角
        path += " L" + (Number(x2) + Number(Par * cos - (Par / 2.0 * sin)))
            + "," + (Number(y2) + Number(Par * sin + (Par / 2.0 * cos)));

        path += " L" + x2 + "," + y2 + ' Z ';

        return path;
    }


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


    function D3Direction(selection, settings) {
        this.settings = {
            height:0,
            width:0,
            radius: [0.3, 0.8],
            maxValue: 1,
            minValue: 0,
            tipFormatter: function (data) {
                return data.name;
            },
            padding: {
                top: 10,
                right: 12,
                bottom: 12,
                left: 10
            },
            events:{
                click:function (d) {

                }
            }
        }
        this.settings = settings ? objCopy(this.settings, settings) : this.settings;
        this.init(selection);
    }

    D3Direction.prototype = {
        height: 0,
        width: 0,
        _seriesData:[],
        __radiusScale: undefined,//半径比例尺
        _data: [],
        init: function (selection) {
            this.dom = selection.node();
            this.view = selection;
            this.radarsvg = selection.append('svg').attr('width', this.settings.width ||'100%').attr('height', this.settings.height ||'100%').attr('class', 'd3-radar');
            this.radarbody = this.radarsvg.append('g').attr('class', 'radar-body');
            this.__radialAxisGroup = this.radarbody.append('g').attr('class', 'axis-ticks');
            this._buildScale();
            this.__buildToolTip();
            this.events();
        },

        events: function () {

            this.view.style('cursor', 'url(/plugin/d3js/d3-radar/radar.cur),auto').on('mousemove', function () {
                d3.event.stopPropagation();
                return false;
            }).on('dbclick',function () {
                d3.event.stopPropagation();
                return false;
            }).on('mouseover', function () {
                d3.event.stopPropagation();
                return false;
            }).on('mousewheel DOMMouseScroll', function (e) {
                e = d3.event||window.event;
                if (e.stopPropagation) {//这是取消冒泡
                    e.stopPropagation();
                } else{
                    e.cancelBubble = true;
                };
                // if (e.preventDefault) {//这是取消默认行为，要弄清楚取消默认行为和冒泡不是一回事
                //     e.preventDefault();
                // } else{
                //     e.returnValue = false;
                // }
                return false;
            })
        },
        __buildToolTip: function () {
            //提示框 （注意设置提示框的绝对路径）
            var me =this;
            var deftipCss = {
                'margin': '3px',
                'position': 'absolute',
                'visibility': 'hidden',
                'border-style': 'solid',
                'white-space': 'nowrap',
                'z-inde': '9999999',
                'transition': '0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                'background-color': 'rgba(242, 242, 242, 0.9)',//'rgba(50, 50, 50, 0.7)',
                'border-width': '1px',
                'border-color': 'rgba(95, 114, 42, 1)',
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
                'padding': '0px',
                'left': '0',
                'top': '0',
            }
            this._tooltip = this.view.append('div').attr('id', this.id + '-tooltip').attr('class', 'tooltip');
            for (var k in deftipCss) {
                this._tooltip.style(k, deftipCss[k]);
            }
            this._tooltip.append('div').attr('class','content').style('width','100%');
            this._tooltip.append('div').style('margin','5px').style('width','100%').style('text-align','center').append('button').attr('class','btn btn-primary btn-xs').on('click',function () {
                me._hideTip();
                me.radarbody.selectAll('.dir-path-hover').style('stroke',null).style('stroke-width',null)
                d3.event.stopPropagation();
            }).html('关闭')
            // this._tooltip.on("mouseleave", function () {
            //     me._hideTip();
            //     me.radarbody.selectAll('.dir-path-hover').style('stroke',null).style('stroke-width',null)
            //     d3.event.stopPropagation();
            // });
        },
        _showTip: function (data, point) {
            this._tooltip.style('visibility', 'visible').style('opacity', '1').style('top',
                point.y + 'px').style('left', point.x + 'px').select('.content').html(this.settings.tipFormatter(data));
        },
        _hideTip: function () {
            this._tooltip.style('visibility', 'hidden').style('opacity', '0')
        },

        _buildIndicator: function (series) {
            var me = this;
            this.__axisIntervalUpdate = this.__radialAxisGroup.selectAll('.axis-interval').data(series);
            var diff = -15;
            var temp;
            this.__axisInterval= this.__axisIntervalUpdate.enter().append('g')
                .attr('id',function (d) {
                    return d.name;
                })
                .attr("transform", function (d, i, doms) {
                    var angle = d.deflectionAngle;
                    if (temp != angle) {
                        diff = -15;
                        temp = angle;
                    } else {
                        diff += 15;
                    }
                    d.path = {
                        x1: me.__radiusScale(me.settings.maxValue),
                        y1: 0,
                        x2: me.radius * me.settings.radius[0] + 2 + Math.abs(diff) / 2,
                        y2: diff
                    }
                    d3.select(this).attr('angle', angle)
                    return "rotate(" + (angle) + ")translate(0," + diff + ")";
                })
                .attr("class", "line-ticks")
                .on('click',function (v) {
                    me._showTip(v,{
                        x:d3.event.offsetX+10,
                        y:d3.event.offsetY-10
                    });
                    me.settings.events.click(v);
                    me.radarbody.selectAll('.dir-path-hover').style('stroke',null).style('stroke-width',null);
                    d3.select(this).select('.dir-path-hover').style('stroke','#ccc').style('stroke-width','15');
                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                }).each(function (d) {
                    d3.select(this).selectAll('path').remove();
                    var pathLine = drawEdgeLine(d.path.x1, d.path.y1, d.path.x2, d.path.y2, 'ra', 'ow');
                    var path = d3.select(this).append('path').attr('class', 'dir-path-hover')
                        .attr('d', pathLine.line)
                        .style('stroke-linecap', 'round')
                        .style('stroke-linejoin', 'join');

                    var path = d3.select(this).append('path').attr('class', function (d) {

                        var check=false;
                        for(var i=0;i<d.scootValues.length;i++){
                            if(d.scootValues[i].current_val!=d.scootValues[i].recommend_val){
                                check = true;
                                break;
                            }
                        }
                        if(check){
                            return "dir-path dasharray-anim";
                        }else{
                            return 'dir-path'
                        }
                    }).attr('d', pathLine.line)
                        .style('stroke-width', "4")
                        .style("fill", "none")
                        .style('stroke-linecap', 'round').style('stroke-linejoin', 'join');

                    d3.select(this).append('path').attr('class', 'dir-arrow').attr('d', pathLine.arrow);
                });

            this.__axisIntervalUpdate.attr('id',function (d) {
                return d.name;
            }).attr("transform", function (d, i, doms) {
                var angle = d.deflectionAngle;
                if (temp != angle) {
                    diff = -15;
                    temp = angle;
                } else {
                    diff += 15;
                }
                d.path = {
                    x1: me.__radiusScale(me.settings.maxValue),
                    y1: 0,
                    x2: me.radius * me.settings.radius[0] + 2 + Math.abs(diff) / 2,
                    y2: diff
                }
                d3.select(this).attr('angle', angle)
                return "rotate(" + (angle) + ")translate(0," + diff + ")";
            }).each(function (d) {
                d3.select(this).selectAll('path').remove();
                var pathLine = drawEdgeLine(d.path.x1, d.path.y1, d.path.x2, d.path.y2, 'ra', 'ow');
                var path = d3.select(this).append('path').attr('class', 'dir-path-hover').attr('d', pathLine.line)
                    .style('stroke-linecap', 'round').style('stroke-linejoin', 'join')
                var path = d3.select(this).append('path').attr('class', function (d) {
                    var check=false;
                    for(var i=0;i<d.scootValues.length;i++){
                        if(d.scootValues[i].current_val!=d.scootValues[i].recommend_val){
                            check = true;
                            break;
                        }
                    }
                    if(check){
                        return "dir-path dasharray-anim";
                    }else{
                        return 'dir-path'
                    }
                }).attr('d', pathLine.line)
                    .style('stroke-width', "2")
                    .style("fill", "none")
                    .style('stroke-linecap', 'round').style('stroke-linejoin', 'join');

                d3.select(this).append('path').attr('class', 'dir-arrow').attr('d', pathLine.arrow);
            })
            this.__axisIntervalUpdate.exit().remove()
        },
        _buildCenter: function () {

            var center = {
                'transform': "translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)",
                '-ms-transform': "translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)", /* IE 9 */
                '-moz-transform': "translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)", /* Firefox */
                '-webkit-transform': "translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)", /* Safari 和 Chrome */
                '-o-transform': "translate(" + this.settings.center[0] + "px," + this.settings.center[1] + "px)"    /* Opera */
            }
            for (var k in center) {
                this.radarbody.style(k, center[k]);
            }

        },
        _buildScale: function () {
            var me = this;
            this.width = this.settings.width || this.dom.clientWidth,
                this.height = this.settings.height || this.dom.clientHeight;
            if (!this.settings.center)
                this.settings.center = [(this.width - this.settings.padding.left - this.settings.padding.right) / 2 + this.settings.padding.left, (this.height - this.settings.padding.top - this.settings.padding.bottom) / 2 + this.settings.padding.top];
            this.radius = Math.min(this.width, this.height) / 2;
            this.__radiusScale = d3.scaleLinear().domain([this.settings.minValue, this.settings.maxValue]).range([0, (d3.min([(this.width - this.settings.padding.left - this.settings.padding.right), (this.height - this.settings.padding.top - this.settings.padding.bottom)]) / 2)]);


            this._circle = this.radarbody.append('circle')
                .attr('cx', '0')
                .attr('cy', '0')
                .attr('r', this.radius * this.settings.radius[0] - 2)
                .attr('fill', 'rgb(119, 158, 60)')
                .attr('stroke', '#fff')
                .attr('stroke-width', '2');

            this._centerText = this.radarbody.append('text').style('text-anchor', ' middle').style('font-weight','bold').style('font-size','20px').attr("x", "0").attr("dy", ".35em").attr('fill','#fff');
            this._subText = this.radarbody.append('text').style('text-anchor', ' middle').style('font-weight','bold').style('font-size','10px').attr("x", "0").attr("dy", "23px").attr('fill','#fff');
            this._buildCenter();
        },

        __angleToRadianFun: function (angle) {
            return Math.PI / 180 * (angle);
        },

        setData: function (d) {
            this._centerText.html(d.serial);
            this._subText.html(d.name);
            objCopy(this._seriesData, d.series);
            this._buildIndicator(this._seriesData);
        },
        updateData:function (data) {
            this.__axisInterval.filter(function (d) {
                return d.id==data.direction_id;
            }).attr('id',function (d) {
                return d.name;
            }).selectAll('.dir-path').filter(function (d) {
                var check=false;
                for(var i=0;i<d.scootValues.length;i++){
                    if(d.scootValues[i].id==data.scootId){
                        d.scootValues[i].current_val = d.scootValues[i].recommend_val;
                        check = true;
                        break;
                    }
                }
                return check;
            }).attr('class', function (d) {
                var check=false;
                for(var i=0;i<d.scootValues.length;i++){
                    if(d.scootValues[i].current_val!=d.scootValues[i].recommend_val){
                        check = true;
                        break;
                    }
                }
                if(check){
                    return "dir-path dasharray-anim";
                }else{
                    return 'dir-path'
                }
            })
        }
    }

    window.D3Direction = D3Direction;

})(d3);