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

    function D3GroupBar(selection, settings) {
        this.settings = {
            margin: {top: 15, right: 10, bottom: 22, left: 40},
            axisFormater: function (d) {
                return d;
            },
            yAxisFormat:function (d) {
                return d;
            },
            tipFormatter: function (data) {
                return data.name;
            },
            event: {
                onclick: function (d) {

                }
            }
        }
        this.id = Math.round(Math.random() * 999999) + new Date().getTime();
        this.settings = objCopy(this.settings, settings);
        this.init(selection);
    }

    D3GroupBar.prototype = {
        height: 0,
        width: 0,
        _tempR: 0,
        radius: 0,
        lineWidth: 16,
        opacity: 1,
        _scaleBand: [],
        _barg: undefined,
        _svgview: undefined,
        _color: d3.scaleOrdinal(d3.schemeCategory20),
        init: function (selection) {
            this.dom = selection.node();
            this._svgview = selection.append('svg').attr("width", this.settings.width||'100%').attr("height", this.settings.height||'100%');
            this._barg = this._svgview.append('g');
            this._textg = this._svgview.append('g').style('transform','translate(20px,20px)');
            this._title = this._textg.append('text').attr('x','10').attr('y','0').attr('class','bar-title').style("text-anchor", "start");
            //定义x轴
            this.__xAxisG = this._barg.append("g").attr("class", "axis axis-x");
            //定义y轴
            this.__yAxisG = this._barg.append("g").attr("class", "axis axis-y");
            this.settings.margin.top+= 15;
            this.layout();
            this.__buildToolTip();
        },

        events: function () {

            this.view.style('cursor', 'url(/plugin/d3js/d3-radar/radar.cur),auto').on('mousemove', function () {
                d3.event.stopPropagation();
                return false;
            }).on('mouseover', function () {
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
            this._tooltip = d3.select(this.dom).append('div').attr('id', this.id + '-tooltip').attr('class', 'tooltip');
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

        _buildCenter: function () {
            var center = {
                'transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)",
                '-ms-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)", 	/* IE 9 */
                '-moz-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)", 	/* Firefox */
                '-webkit-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)", /* Safari 和 Chrome */
                '-o-transform':"translate(" + this.settings.margin.left + "px," + this.settings.margin.top + "px)" 	/* Opera */
            }

            for (var k in center) {
                this._barg.style(k, center[k]);
            }

        },
        layout: function () {
            this.width = (this.settings.width || this.dom.clientWidth) - this.settings.margin.left - this.settings.margin.right,
                this.height = (this.settings.height || this.dom.clientHeight) - this.settings.margin.top - this.settings.margin.bottom-20;
            this._buildCenter();
            this._buildAxis();
        },
        _buildAxis: function () {
            var me = this;
            this._scaleBand.push(d3.scaleBand()
                .rangeRound([0, this.width])
                .paddingInner(0.2))
            this._scaleBand.push(d3.scaleBand().padding(0.1))
            this._scaleBand.push(d3.scaleBand().padding(0.1))

            this.__yScale = d3.scaleLinear().range([this.height, 0]);
            // y轴坐标
            this.yAxis = d3.axisLeft()
                .scale(this.__yScale)
                .tickFormat(function (d, i) {
                    return me.settings.yAxisFormat(d, i);
                });
        },
        _updateAxis: function (data) {
            var index1 = [],
                index2 = [],
                index3 = [];
            var values = [];
            data.forEach(function (s1, i) {
                index1.push(s1.name);
                s1.series.forEach(function (s2, j) {
                    if (i == 0) {
                        index2.push(s2.name);
                        index3 = d3.range(0,s2.series.length);
                    }
                    s2.series.forEach(function (s3, k) {

                        values.push(s3.value);
                    })
                })
            })

            this._scaleBand[0].domain(index1);
            this._scaleBand[1].domain(index2).rangeRound([0, this._scaleBand[0].bandwidth()]);
            this._scaleBand[2].domain([0,1]).rangeRound([0, this._scaleBand[1].bandwidth()]);
            this.__yScale.domain([0, d3.max(values)]);

        },
        _buildAxisGroup: function (data) {
            var me = this;
            this._updateAxis(data);
            this._barg.selectAll('.series-g').remove();
            var series1G = this._barg.append("g").attr('class','series-g')
                .selectAll("series-1-g")
                .data(data).enter().append("g").attr('class', "series-1-g")
                .attr("transform", function (d, i) {
                    return "translate(" + me._scaleBand[0](d.name) + ",0)";
                }).on('mousemove', function(d) {
                    me._showTip(d,{
                        x:d3.event.x+10,
                        y:d3.event.y-10
                    });

                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                }).on("mouseover", function () {
                    d3.select(this).select('.group-hover').style("stroke", '#ccc').style('fill','rgba(204, 204, 204, 0.5)');
                }).on("mouseout", function () {
                    me._hideTip();
                    d3.select(this).transition().attr('d',me._arc);
                    d3.event.stopPropagation();
                    d3.select(this).select('.group-hover').style("stroke", 'transparent').style('fill','transparent');
                });

            series1G.append('rect').style('fill', 'transparent').style("stroke", 'transparent').style("stroke-width", '1px').attr('class', 'group-hover')
                .attr("y", '0')
                .attr("width", function (d) {
                    return me._scaleBand[0].bandwidth();
                })
                .attr("height", this.height);

            series1G.append("g")
                .attr("class", "axis-2")
                .attr("transform", "translate(0," + this.height + ")")
                .call(d3.axisBottom(me._scaleBand[1]))
                .selectAll("text").attr('class',function (d) {
                    return d;
                })
                .style("text-anchor", "middle")
                .attr("dx", "-.1em")

            series1G.append('rect').style('fill','transparent').attr('class','group-hover')
                .attr("x", function (d, i) {
                    return me._scaleBand[1](d.name);
                })
                .attr("y", '0')
                .attr("width", function (d) {
                    return me._scaleBand[0].bandwidth();
                })

            var series2G = series1G.selectAll(".series-2-g")
                .data(function (d) {
                    return d.series;
                }).enter().append("g").attr("class", "series-2-g")
                .attr("transform", function (d, i) {
                    return "translate(" + me._scaleBand[1](d.name) + ",0)";
                }).style('stroke',function (d) {
                    if(d.compared.show){
                        if(d.compared.flag){
                            d3.select(this.parentElement).select('.'+d.name).style('fill','red');
                        }else{
                            d3.select(this.parentElement).select('.'+d.name).style('fill','green');
                        }
                    }
                    return null;
                });
            series2G.selectAll('.rect-g').data(function (d) {
                return d.series;
            }).enter().append("rect").attr('class', 'rect-g')
                .attr("x", function (d, i) {
                    return me._scaleBand[2](i);
                })
                .attr("y", function (d) {
                    return me.__yScale(d.value);
                })
                .attr("width", me._scaleBand[2].bandwidth())
                .attr("height", function (d) {
                    return me.height - me.__yScale(d.value);
                })
                .attr("fill", function (d,i) {
                    if(d.color){
                        return d.color;
                    }
                    return me._color(i);
                })
                .on("mouseover", function () {

                })
                .on("mousemove", function (d) {
                    var xPosition = d3.mouse(this)[0] + 5;
                    var yPosition = d3.mouse(this)[1] - 5;
                })
                .on("mouseout", function () {

                });

            this.__yAxisG.call(this.yAxis);

            this.__xAxisG.attr("transform", "translate(0," + (this.height+20) + ")")
                .call(d3.axisBottom(this._scaleBand[0]))
                .selectAll("text")
                .style("text-anchor", "middle")
                .attr("dx", "-.1em")
        },
        setData: function (data) {
            this._buildAxisGroup(data);
        },
        setTitle:function (title,subtitle) {
            // this._title.html(title);
        }
    }
    window.D3GroupBar = D3GroupBar;
})()