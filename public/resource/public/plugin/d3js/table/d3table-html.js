(function (d3, win) {


    Array.prototype.prefixjoin = function (prefix) {
        var css = '';
        for (var index = 0; index < this.length; index++) {
            var a = this[index];
            if (a) {
                css += prefix + a;
            }
        }
        return css;
    }

    //差集
    Array.prototype.minus = function (list, filter) {
        var obj = {
            list: this.concat(),
            noupdata: [],
            update: [],
            newlist: []
        };
        for (var i = 0; i < list.length; i++) {
            var target = list[i];
            var include = true;
            for (var j = 0; j < this.length; j++) {
                var source = this[j];
                if (filter(source, target)) {
                    include = false;
                    break;
                }
            }
            if (include) {
                obj.newlist.push(target);
            }
        }
        for (var i = 0; i < this.length; i++) {
            var source = this[i];

            var isExist = false;
            for (var j = 0; j < list.length; j++) {
                var target = list[j];
                if (filter(source, target)) {
                    obj.update.push({
                        index: i,
                        newobj: target
                    });
                    obj.list.splice(i, 1, target);
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                obj.noupdata.push({
                    index: i,
                    source: source
                });
            } else {

            }
        }
        return obj;
    };
    // var template1="我是{0}，今年{1}了";
    // var template2="我是{name}，今年{age}了";
    // var result1=template1.format("loogn",22);
    // var result2=template2.format({name:"loogn",age:22});
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
    }

    var isEquals = function (a, b) {
        // If both a and b are null or undefined and exactly the same
        if (a === b) {
            return true;
        }

        // If they are not strictly equal, they both need to be Objects
        if (!(a instanceof Object) || !(b instanceof Object)) {
            return false;
        }

        // They must have the exact same prototype chain,the closest we can do
        // is
        // test the constructor.
        if (a.constructor !== b.constructor) {
            return false;
        }

        for (var p in a) {
            // Inherited properties were tested using a.constructor ===
            // b.constructor
            if (a.hasOwnProperty(p)) {
                // Allows comparing a[ p ] and b[ p ] when set to undefined
                if (!b.hasOwnProperty(p)) {
                    return false;
                }

                // If they have the same strict value or identity then they are
                // equal
                if (a[p] === b[p]) {
                    continue;
                }

                // Numbers, Strings, Functions, Booleans must be strictly equal
                if (typeof(a[p]) !== "object") {
                    return false;
                }

                // Objects and Arrays must be tested recursively
                if (!Object.equals(a[p], b[p])) {
                    return false;
                }
            }
        }

        for (p in b) {
            // allows a[ p ] to be set to undefined
            if (b.hasOwnProperty(p) && !a.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    };

    var GRID_CSS = {
        rowsCss: ['grid-view', 'grid-table'],
        rowCss: ['grid-row'],
        rowCellCss: ['grid-row-cell'],
        headCss: ['grid-head-table', 'grid-table'],
        headTrCss: ['grid-head'],
        headCellCss: ['grid-head-cell']
    }

    function D3Table(id, option) {

        var obj = new Object();

        obj.__proto__ = {
            __lastData: undefined,
            width: 0,
            height: 0,
            easing: 'slideLeft',
            viewDom: undefined,
            tbody: undefined,
            tfoot: undefined,
            events: {
                /**
                 * 动画结束
                 */
                animationEnd: function () {

                },
                afterload: function () {

                },
                itemschange: function () {

                },
                headClick: function () {

                },
                items: {
                    'click': function () {
                    }
                }
            },
            pageConfig: {
                startPage: 1,
                splitCount: 5,
                pagerender: function () {

                }
            },
            pageParams: {
                currentPage: 0,
                pageSize: 10,
                total: 0
            },
            viewCss: {
                rowsCss: ['table table-bordered table-tbody table-striped'],
                rowCss: [],
                rowCellCss: [],
                headCss: ['table table-bordered'],
                headTrCss: [],
                headCellCss: []
            },
            columns: [],
            nowData: [],//当前数据
            prevData: [],//上一次的数据
            sortColumn: undefined,
            equalsFun: undefined,
            backcolor: '#fff',//背景色
            init: function (viewDom) {
                var me = this;
                this.__buildCss();
                this.__createViewPort(viewDom);
                this.__createRowHead();
                this.__createTfoot();
                this.__createRowView();
                // this.__createScrollbar();
                // this.__scrollbarResize();
                // window.onresize = function () {
                //     me.__scrollbarResize();
                // }
            },
            __buildCss: function () {
                for (var c in GRID_CSS) {
                    GRID_CSS[c] = GRID_CSS[c].concat(this.viewCss[c]);
                }
            },
            __prevIndex: function (d, sortData) {
                for (var i = 0; i < sortData.length; i++) {
                    var prevD = sortData[i];
                    if (this.equalsFun(d, prevD)) {
                        return i;
                    }
                }
            },
            __sortIndex: function (data) {
                var me = this;
                return data.concat().sort(function (b, a) {
                    if (me.sortOrder == 'DESC') {
                        return d3.descending(a[me.sortColumn.dataIndex], b[me.sortColumn.dataIndex]);
                    } else {
                        return d3.ascending(a[me.sortColumn.dataIndex], b[me.sortColumn.dataIndex]);
                    }
                })
            },
            __sortIndexFun: function (data, dataIndex, order) {
                var me = this;
                return data.sort(function (b, a) {
                    if (order == 'DESC') {
                        return d3.descending(a[dataIndex], b[dataIndex]);
                    } else {
                        return d3.ascending(a[dataIndex], b[dataIndex]);
                    }
                })
            },
            __buildData: function (data) {
                if (data.length == 0) {
                    this.options.events.notData(true, this.__gridViewBody);
                    return data;
                } else {
                    this.options.events.notData(false, this.__gridViewBody);
                }
                if (this.options.autoSort) {
                    return this.__sortIndex(data);
                }
                return data;
            },
            equalsFun: function (d, prevD) {
                if (d.id == prevD.id) {
                    return true;
                }
                return false;
            },
            colorFun: undefined,
            __colorScale: undefined,
            __widthScale: undefined,//比例尺
            __scaleLinear: function (data) {
                if (this.sortColumn) {
                    var sortValue = [];
                    for (var index = 0; index < data.length; index++) {
                        sortValue.push(data[index][this.sortColumn.dataIndex]);
                    }
                    this.__widthScale = d3.scaleLinear().domain([d3.min(sortValue), d3.max(sortValue)])
                        .range([1, (this.__headTable.node().offsetWidth - 1)]);
                    this.__colorScale = d3.scaleLinear().domain([d3.min(sortValue), d3.max(sortValue)])
                        .range([0, 1]);
                } else {
                    this.__widthScale = function () {
                        return 0;
                    };
                    this.__colorScale = function () {
                        return 0;
                    };
                }
            },
            __color: function (sortValue) {
                if (this.colorFun) {
                    return this.colorFun(this.__colorScale(sortValue));
                } else {
                    if (this.__colorInterpolate) {
                        return this.__colorInterpolate(this.__colorScale(sortValue));
                    }
                    else {
                        return this.backcolor;
                    }
                }
            },
            __colorInterpolate: undefined,
            //生成颜色插值
            __buildColorInterpolate: function () {
                if (this.sortColumn && !this.__colorInterpolate) {
                    if (this.sortColumn.inRange
                        && this.sortColumn.inRange.length >= 2) {
                        var start, end;
                        var start = d3.color(this.sortColumn.inRange[0]); // 红
                        var end = d3.color(this.sortColumn.inRange[1]); // 浅色
                        // 颜色插值函数
                        this.__colorInterpolate = d3.interpolate(end, start);
                    } else {
                        if (this.options.inRange && this.options.inRange >= 2) {
                            var start, end;
                            var start = d3.color(this.options.inRange[0]); // 红
                            var end = d3.color(this.options.inRange[1]); // 浅色
                            // 颜色插值函数
                            this.__colorInterpolate = d3.interpolate(end, start);
                        }
                    }
                }
            },
            __animationCount: 0,
            __animationEnd: function () {
                this.__animationCount++;
                if (this.__animationCount >= this.nowData.length) {
                    this.options.events.animationEnd();
                    this.__animationCount = 0;
                }
            },
            __cellWidths: {},
            __trHeight: 0,
            __createViewPort: function (viewDom) {
                this.viewPort = d3.select(viewDom).append('div').attr('class', 'grid-viewport');
            },
           	updateHead:function(columns){
           		var me =this;
           		this.columns = columns;
           		
           		var headUpdate= this.headColumns.selectAll(GRID_CSS.headCellCss.prefixjoin(' .')).data(this.columns);
           		
           		var upHead = headUpdate.attr('data-index', function (d) {
                        if (d.sortable) me.sortColumn = d;
                        return d.dataIndex;
                    }).style('width', function (d, i) {
                        if (d.width) {
                            return d.width + 'px';
                        }
                    });
            
                upHead.filter(function (d) {
                    return d.type != 'checkbox';
                }).select('.grid-cell-inner').html(function (d, i) {
                    return d.text;
                }).style('padding', me.options.rowStyle)
                    .style('margin', '0px').on('click', function (d) {
                    d3.event.stopPropagation();
                    me.options.events.headClick(d, this, me);
                });
           	
                
                var head = headUpdate.enter().append('td').attr('class', GRID_CSS.headCellCss.join(' '))
                    .attr('data-index', function (d) {
                        if (d.sortable) me.sortColumn = d;
                        return d.dataIndex;
                    }).style('width', function (d, i) {
                        if (d.width) {
                            return d.width + 'px';
                        }
                    }).style('padding', me.options.rowStyle)
                    .style('margin', '0px')
                    .append('div').attr('class', 'grid-cell-inner ellipsis')
                    .style('width', function (d, i) {
                        return (this.parentElement.offsetWidth - 1) + 'px';
                    })

                this.__checkboxAll = head.filter(function (d) {
                    return d.type == 'checkbox';
                }).append('input')
                    .attr('type', 'checkbox')
                    .attr('class', 'check-all')
                    .on('click', function () {
                        d3.event.stopPropagation();
                       
                        if (this.checked) {
                        		 me.__gridViewContent.selectAll('.grid-row').each(function(d){
                        			d.checked = true;
                        		}).dispatch('row-selected');
                        	    //me.__gridViewContent.selectAll('.grid-row').style('background', 'rgba(214, 214, 214, 0.6)');
//                            me.__gridViewContent.selectAll('.check').attr('checked', 'checked').each(function () {
//                                this.checked = true;
//                            }).dispatch('click');
                        } else {
                        	 	me.__gridViewContent.selectAll('.grid-row').each(function(d){
                        			d.checked = false;
                        		}).dispatch('row-selected');
                        		//me.__gridViewContent.selectAll('.grid-row').style('background', null);
//                            me.__gridViewContent.selectAll('.check').attr('checked', null).each(function () {
//                                this.checked = false;
//                            }).dispatch('click');
                        }
                    });
                head.filter(function (d) {
                    return d.type != 'checkbox';
                }).html(function (d, i) {
                    return d.text;
                }).style('padding', me.options.rowStyle)
                    .style('margin', '0px').on('click', function (d) {
                    d3.event.stopPropagation();
                    me.options.events.headClick(d, this, me);
                });
                
                headUpdate.exit().remove();
           		
           	},
            __createRowHead: function () {
                var me = this;

                this.__gridHeadView = this.viewPort.append('div')
                    .attr('class', 'grid-head-view')

                this.__headTable = this.__gridHeadView.append("table").attr('class', GRID_CSS.headCss.join(' '))
                    .attr('cellspacing', '0').attr('cellpadding', '0').attr('border', '0');

                this.headColumns = this.__headTable.append('thead').append('tr').attr('class', GRID_CSS.headTrCss.join(' '));
               
                var head =this.headColumns.selectAll(GRID_CSS.headCellCss.prefixjoin(' .')).data(this.columns).enter().append('td').attr('class', GRID_CSS.headCellCss.join(' '))
                    .attr('data-index', function (d) {
                        if (d.sortable) me.sortColumn = d;
                        return d.dataIndex;
                    }).style('width', function (d, i) {
                        if (d.width) {
                            return d.width + 'px';
                        }
                    }).style('padding', me.options.rowStyle)
                    .style('margin', '0px')
                    .append('div').attr('class', 'grid-cell-inner ellipsis')
                    .style('width', function (d, i) {
                        // var head = d3.selectAll('.grid-head-cell[data-index=' + d.dataIndex + ']').node();
                        return (this.parentElement.offsetWidth - 1) + 'px';
                    })

                this.__checkboxAll = head.filter(function (d) {
                    return d.type == 'checkbox';
                }).append('input')
                    .attr('type', 'checkbox')
                    .attr('class', 'check-all')
                    .on('click', function () {
                        d3.event.stopPropagation();
                       
                        if (this.checked) {
                        		 me.__gridViewContent.selectAll('.grid-row').each(function(d){
                        			d.checked = true;
                        		}).dispatch('row-selected');
                        	    //me.__gridViewContent.selectAll('.grid-row').style('background', 'rgba(214, 214, 214, 0.6)');
//                            me.__gridViewContent.selectAll('.check').attr('checked', 'checked').each(function () {
//                                this.checked = true;
//                            }).dispatch('click');
                        } else {
                        	 	me.__gridViewContent.selectAll('.grid-row').each(function(d){
                        			d.checked = false;
                        		}).dispatch('row-selected');
                        		//me.__gridViewContent.selectAll('.grid-row').style('background', null);
//                            me.__gridViewContent.selectAll('.check').attr('checked', null).each(function () {
//                                this.checked = false;
//                            }).dispatch('click');
                        }
                    });
                head.filter(function (d) {
                    return d.type != 'checkbox';
                }).html(function (d, i) {
                    return d.text;
                }).style('padding', me.options.rowStyle)
                    .style('margin', '0px').on('click', function (d) {
                    d3.event.stopPropagation();
                    me.options.events.headClick(d, this, me);
                });


                this.__gridHeadView.append('div').attr('class', 'grid-head-back')
            },
            __createRowView: function () {
                var me = this;
                this.__gridViewport = this.viewPort.insert("div", ".grid-tfoot-view")
                    .attr('class', 'grid-rows-view')
                    .style('height', function () {
                        var h = me.height - me.viewPort.select('.grid-head-view').node().offsetHeight;
                        if (me.options.pager) {
                            h -= me.viewPort.select('.grid-tfoot-view').node().offsetHeight;
                        }
                        return h + 'px';
                    });
                this.__gridViewBody = this.__gridViewport.append('div').attr('class', 'grid-view-body')


                this.__gridViewContent = this.__gridViewBody.append('div').attr('class', 'grid-view-content');

                var gridTable = this.__gridViewContent.append('table').attr('class', GRID_CSS.rowsCss.join(' '))
                    .attr('cellspacing', '0').attr('cellpadding', '0').attr('border', '0');

                this.__createTbody(gridTable);
                if(this.D3Scroll){
                		 new D3Scroll(this.__gridViewContent);
                }

//                this.__gridHeadView.style('width',this.__gridViewContent.style('width'));
                this.tfoot.style('width',this.__gridViewContent.style('width'));


            },
            __createTbody: function (viewport) {
                this.tbody = viewport.append('tbody').attr('class', 'grid-tbody');
            },
            __createTfoot: function () {
                this.tfoot = this.viewPort.append('div').attr('class', 'grid-tfoot-view').append('table').attr('class', 'grid-tfoot-table grid-table').append('tr').append("td").attr('class', 'page-num');
                this.tfoot.append('span').attr('class', 'page-select');
            },
            /**
             * 两端分页的起始和结束点，这取决于this.pageParams.pageIndex 和 this.splitCount.
             *
             * @返回 {数组(Array)}
             */
            __getInterval: function (currentPage, totalPage) {
                currentPage = parseInt(currentPage),
                    totalPage = parseInt(totalPage);
                this.pageConfig.split_count = split_count = Math.ceil(this.pageConfig.splitCount / 2);

                var upper_limit = totalPage - this.pageConfig.splitCount;
                var start = currentPage >= split_count ? Math.max(Math.min(currentPage - split_count, upper_limit), this.pageConfig.startPage) : this.pageConfig.startPage;

                var end = currentPage >= split_count ? Math.min(currentPage + split_count, totalPage) : Math.min(this.pageConfig.splitCount, totalPage);
                return [start, end];

            },
            __renderPage: function (result) {
                var me = this;
                this.pageParams['currentPage'] = parseInt(result.currentPage);
                this.pageParams['total'] = parseInt(result.total);

                if (result.pageSize) {
                    this.pageParams['pageSize'] = parseInt(result.pageSize);
                }


                this.pageParams['totalPage'] = this.pageParams['total'] % this.pageParams['pageSize'] == 0 ? this.pageParams['total'] / this.pageParams['pageSize'] : Math.ceil(this.pageParams['total'] / this.pageParams['pageSize']);

                if (this.pageParams['total'] == 0)
                    this.pageParams['totalPage'] = 0;

                if (this.pageParams['currentPage'] > this.pageParams['totalPage']) {
                    this.pageParams['currentPage'] = this.pageParams['totalPage'];
                }
                if (this.pageParams['currentPage'] <= 0)
                    this.pageParams['currentPage'] = this.pageConfig.startPage;
                if (this.pageParams['totalPage'] <= 0)
                    this.pageParams['totalPage'] = 0;

                var intervals = this.__getInterval(this.pageParams['currentPage'], this.pageParams['totalPage']);
                var pages = [];
                // 产生起始点
                if (intervals[0] > 0) {
                    pages.push({
                        index: this.pageConfig.startPage,
                        currentPage: (intervals[0] == this.pageParams['currentPage']) ? true : false
                    });

                    var end = Math.min(this.pageConfig.startPage, intervals[0]);

                    if (intervals[0] == this.pageConfig.startPage + 1) {
                        pages.push({
                            index: this.pageConfig.startPage + 1,
                            currentPage: (intervals[0] == this.pageParams['currentPage']) ? true : false
                        });
                    }
                    if (intervals[0] > this.pageConfig.startPage + 1) {
                        pages.push({
                            range: [this.pageConfig.startPage + 1, intervals[0]],
                            index: '...',
                            currentPage: false
                        });
                    }
                }

                // 产生内部的些链接
                for (var i = intervals[0] + 1; i <= intervals[1]; i++) {
                    pages.push({
                        index: i,
                        currentPage: (i == this.pageParams['currentPage']) ? true : false
                    });
                    //gridPager.append("td").attr('class', 'page-num').htmls(i);
                }
                // 产生结束点
                if (intervals[1] + 1 < this.pageParams['totalPage']) {
                    var begin = Math.max(this.pageParams['totalPage'] - 1, intervals[1]);
                    if (this.pageParams['totalPage'] - 1 > intervals[1]) {
                        pages.push({
                            range: [intervals[1] + 1, begin - 1],
                            index: '...',
                            currentPage: (i == this.pageParams['currentPage']) ? true : false
                        });
                    }
                    for (var i = begin; i <= this.pageParams['totalPage']; i++) {
                        pages.push({
                            index: i,
                            currentPage: (this.pageParams['totalPage'] == this.pageParams['currentPage']) ? true : false
                        });
                    }
                } else if (intervals[1] + 1 == this.pageParams['totalPage']) {
                    pages.push({
                        index: this.pageParams['totalPage'],
                        currentPage: (this.pageParams['totalPage'] == this.pageParams['currentPage']) ? true : false
                    });
                }


                var gridPager = this.tfoot.selectAll('.grid-page-num').data(pages);
                gridPager.enter().insert("a", '.page-select').attr('class', function (d) {
                    if (d.index == '...') {
                        me.__pageRange(this, d.range);
                    } else {
                        d3.select(this).html(d.index);
                    }
                    if (d.currentPage) {
                        return 'grid-page-num  current-page'
                    }
                    return 'grid-page-num';
                }).on('click', function (d) {
                    d3.event.stopPropagation();
                    if (!!d.range) return;
                    me.pageLoad({
                        currentPage: d.index
                    });
                })


                gridPager.attr('class', function (d) {
                    if (d.index == '...') {
                        me.__pageRange(this, d.range);
                    } else {
                        d3.select(this).html(d.index);
                    }
                    if (d.currentPage) {
                        return 'grid-page-num  current-page'
                    }
                    return 'grid-page-num';
                });
                gridPager.exit().remove();
                this.tfoot.selectAll('.page-select').html(function () {
                    return '';
                });
                // if (this.__pagerender) {
                this.pageConfig.pagerender(this.pageParams,this.tfoot.select('.page-select').node(),this);
                this.__pagerender = false;
                // }
            },
            __pagerender: true,
            __pageRange: function (dom, range) {
                var me = this;
                d3.select(dom).text('...');

                // var select =  d3.select(dom).selectAll('select').data([{
                //     range:range
                // }])
                // select.enter().append('select').attr('class',function(d){
                //     me.__pageSelect(this,d.range);
                //     return null;
                // }).on('change',function(d){
                //     var index = this.selectedIndex; // 选中索引
                //     var text = this.options[index].text; // 选中文本
                //     var value = this.options[index].value; // 选中值
                // })

                // select.exit().remove();
                d3.select(dom).attr('title', range.join('-'));
            },
            __pageSelect: function (select, range) {
                var indexes = [];
                for (var index = range[0]; index <= range[1]; index++) {
                    indexes.push(index);
                }
                d3.select(select).selectAll('option').data(indexes)
                    .enter().append('option').attr('value', function (d) {
                    return d
                }).text(function (d) {
                    return d
                });

            },
            pageLoad: function (params) {
                var me = this;
                var newParapage = $.extend(me.pageParams, params);
                delete newParapage.total;
                // d3.json(this.options.url)
                //     .post(JSON.stringify(newParapage), function (error, data) {
                //     // callback
                // });
                $.ajax({
                    url: this.options.url,
                    dataType: 'json',
                    data: newParapage,
                    type: this.options.type,
                    timeout:24*60*60*1000,
                    success: function (result) {
                        if (!result.data) result.data = [];
                        me.__updateRow(result);
                        me.__renderPage(result);
                        me.__checkboxAll.attr('checked', null).each(function(){
                        		this.checked = false;
                        })
                        me.options.events.afterload(result,me);
                    },
                    error: function (XMLHttpRequest, textStatus,
                                     errorThrown) {
                        console.error(errorThrown);
                    }

                });
            },
            __transforms: ['transform', '-ms-transform', '-moz-transform', '-webkit-transform', '-o-transform'],
            __easing: function (transition, type) {
                var me = this;
                switch (type) {
                    case 'angle':
                        me.__setTransitionStyleTween(transition, function (data, i) {
                            return function (t) {
                                return me.__buildTransformStyle(-1 * (1 - t) * (i) * (me.__trHeight), me.options.angle, 0);
                            };
                        }).on('start', function () {
                            var transition = d3.select(this).style('opacity', '1').transition().duration(1000).on('end', function (d) {
                                me.options.events.itemschange(d, this);
                            });
                            me.__setTransitionStyleTween(transition, function (data, i) {
                                return function (t) {
                                    return me.__buildTransformStyle(0, (1 - t) * me.options.angle, 0.05);
                                }
                            })
                        });
                        break;

                    case 'slideLeft':

                        me.__setTransitionStyleTween(transition, function (data, i) {
                            return function (t) {
                                return "translate3d" + '(0,' + -1 * (1 - t) * (i) * (me.__trHeight) + 'px,0) ';
                            };
                        }).on('start', function () {
                            var transition = d3.select(this).style('opacity', '1').transition().duration(1000).on('end', function (d) {
                                me.options.events.itemschange(d, this);
                            });
                            me.__setTransitionStyleTween(transition, function (data, i) {
                                return function (t) {
                                		if(1-t==0) return null;
                                    return "translate3d" + '(' + -(1 - t) * 100 + '%,0px,0) ';
                                }
                            })
                        });

                        break;

                    case 'slideRight':
                        me.__setTransitionStyleTween(transition, function (data, i) {
                            return function (t) {
                                return "translate3d" + '(0,' + -1 * (1 - t) * (i) * (me.__trHeight) + 'px,0) ';
                            };
                        }).on('start', function () {
                            var transition = d3.select(this).style('opacity', '1').transition().duration(1000).on('end', function (d) {
                                me.options.events.itemschange(d, this);
                            });
                            me.__setTransitionStyleTween(transition, function (data, i) {
                                return function (t) {

                                    return "translate3d" + '(' + (1 - t) * 100 + '%,0px,0) ';
                                }
                            })
                        });

                        break;

                }

            },
            __buildTransformStyle: function (y, angle, z) {
                var tfs = "translate3d" + '(0,' + y + 'px,0) ' + 'rotate3d' + '(0,1,' + z + ',' + angle + 'deg)';
                return tfs;
            },
            __setTransform: function (selection, tfs) {
                for (var index = 0; index < this.__transforms.length; index++) {
                    selection.style(this.__transforms[index], tfs)
                }
                return selection;
            },
            __setTransitionStyleTween: function (transition, tween) {
                var me = this;
                for (var index = 0; index < this.__transforms.length; index++) {
                    transition.styleTween(this.__transforms[index], tween)
                }

                return transition;
            },
            delayFun: function (d, i, delay) {
                return i * delay;
            },
            __update: function (rowselection) {
                var me = this;
                if (this.options.animation) {
                    // rowselection.style("transform", function (d, i) {
                    //     if (d.isnew) {
                    //         return me.__buildTransformStyle((me.nowData.length - 1) * (me.__trHeight), 0, 0);
                    //     } else {
                    //         return me.__buildTransformStyle(-1 * (me.__trHeight), 0, 0);
                    //     }
                    // });
                }


                // rowselection.attr('id', function (d, i) {
                //     return d.id;
                // }).attr('class', function (d) {
                //     return GRID_CSS.rowCss.join(' ') + ' ' + d.id;
                // });
                var sortData = [];
                if (this.__sort) {
                    sortData = this.__sortIndexFun(this.nowData, this.__sort, this.sortOrder)
                }


                var transition = rowselection.transition().duration(650).delay(function (d, i) {
                    return me.delayFun(d, i, 100);
                }).style('transform', function (d, i) {
                    var prevKeyIndex = me.__prevIndex(d, sortData);
                    return me.__buildTransformStyle((prevKeyIndex - this.sectionRowIndex) * (me.__trHeight), 0, 0);

                }).on('end', function (d) {
                    if (d.isnew) {
                        me.options.events.itemschange(d, this);
                        d.isnew = false;
                    }
                    if (me.sortColumn && me.options.cellBack) {
                        d3.select(this).select('.grid-row-back')
                            .transition().duration(1000).style('width', function (d) {
                            // if(d.dataIndex==me.sortColumn.dataIndex) {
                            var d = d3.select(this.parentElement.parentElement).data().pop()
                            return me.__widthScale(d[me.sortColumn.dataIndex]) + 'px';
                            // }
                        }).style('background-color', function (d) {
                            var d = d3.select(this.parentElement.parentElement).data().pop()
                            return me.__color(d[me.sortColumn.dataIndex]);
                        });
                    }
                });

                rowselection.selectAll('.grid-cell-inner').filter(function (d) {
                    return d.type != 'checkbox';
                }).html(function (d, i) {
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex]
                    if (d.renderer) {
                        return d.renderer(text, d, data, this);
                    }
                    return text;
                }).attr('title', function (d) {
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex]

                    if (d.renderer) {
                        return d.renderer(text, d, data, this).replace(/<[^>]+>/g, "");
                    }
                    return text + "".replace(/<[^>]+>/g, "");
                })

            },
            __layoutscroll: function (theight) {
                this.height -= theight
                if (this.height < 0) {
                    var scrollW = this.__gridViewBody.node().offsetWidth - this.__gridViewBody.node().scrollWidth;
                    this.__gridHeadView.style('padding-right', scrollW + 'px');
                }
            },
            __buildItemsEvents: function (row) {
                var me =this;
                for (var k in this.options.events.items) {
//                		if(k=='click') continue;
                    row.on(k, function (d) {
//                        if(k=='click'){
//                        		if(d3.select(this).select('.check').node().checked){
//                                d3.select(this).selectAll('.check').attr('checked', null).each(function () {
//                                    this.checked = false;
//                                }).dispatch('selected');
//                                //d3.select(this).style('background', null);
//                            }else{
//                                d3.select(this).selectAll('.check').attr('checked', 'checked').each(function () {
//                                    this.checked = true;
//                                }).dispatch('selected');
//                                //d3.select(this).style('background', 'rgba(214, 214, 214, 0.6)');
//                            }
//                        }
                        me.options.events.items[k](d,me,this);
                    });
                }
            },
            __removeItemsEvents: function (row) {
                for (var k in this.options.events.items) {
                    row.on(k, null);
                }
            },
            addRow: function (data) {
                data.isnew = true;
                var list = this.nowData.concat();
                if (this.options.pager) {
                    if (this.pageParams.pageSize <= list.length) {
                        list.splice(list.length - 1, 1);
                        list.unshift(data);
                    } else {
                        list.unshift(data);
                    }
                } else {
                    list.push(data);
                }


                this.__updateRow(list);
            },
            setData: function (result) {
                this.__updateRow(result);
            },
            updateRow: function (data) {
                var me = this;
                var rowselection = this.rowselection.filter(function (d, i) {
	                    return me.equalsFun(d,data);
	                });
                $.extend(rowselection.data().pop(), data);
                this.nowData = this.__buildData([data]);
                this.__scaleLinear(me.nowData);

                this.__update(rowselection);


                // rowselection.selectAll('.grid-cell-inner').attr('title',function(d){
                //     var data = d3.select(this.parentElement.parentElement).data().pop(),
                //         text = data[d.dataIndex]
                //
                //     if(d.renderer){
                //         return d.renderer(text,d,data,this);
                //     }
                //     return text;
                // })

            },

            sortData: function (sort, order) {
                var me = this;
//                this.__sort = sort;
//                // this.__changeDom(this.__sortIndexFun(me.nowData, sort, this.sortOrder));
//                this.__changeDom(me.nowData);
//                if (this.sortOrder == 'DESC') {
//                    this.sortOrder = 'ASC';
//                } else {
//                    this.sortOrder = 'DESC';
//                }
//                this.__sort = null;
            },
            __changeDom: function (data) {
                var me = this;

                //
                // if(this.prevData.length!=0){
                //     data.forEach(function (t) {
                //         var prevKeyIndex = me.__prevIndex(t);
                //         t.sectionRowIndex = prevKeyIndex;
                //     })
                // }

                var row= this.tbody.selectAll(GRID_CSS.rowCss.prefixjoin(' .')).data(data);
                this.rowselection = row.enter().append("tr")
                //     .attr('class', function (d) {
                //
                // })
              
                this.rowselection.attr('class', function (d, i) {
                    me.__trHeight = this.clientHeight;
                    me.__layoutscroll(this.clientHeight);
                    // return d.id || i;
                    return GRID_CSS.rowCss.join(' ') + ' ';
                });
                
                this.createCell(this.rowselection);
                
                if (this.options.animation) {
                    this.rowselection.style('opacity', '0');
                    this.rowselection.style("transform", function (d, i) {
                        return me.__buildTransformStyle(-(i) * (me.__trHeight), me.options.angle, 0);
                    });
                    var transition = this.rowselection.transition().delay(function (d, i) {
                        return me.delayFun(d, i, 100);
                    }).on('end', function (d) {

                    })
                    me.__easing(transition, me.easing);
                }


                this.__buildItemsEvents(this.rowselection);
                var exitRow = row.exit();
                this.__removeItemsEvents(exitRow);
                var removeduration = exitRow.transition().delay(function (d, i) {
                    return me.delayFun(d, i, 100);
                }).style('opacity', '0').remove().on('end', function () {
                });
                me.__setTransitionStyleTween(removeduration, function (data, i) {
                    return function (t) {
                        return me.__buildTransformStyle(0, (t) * me.options.angle, 0.05);
                    }
                });

                this.__update(row);
                //更新上次一记录
                this.prevData = data.concat();
                data = null, exitRow = null, row = null;
                if(this.D3Scroll){
                		this.__gridViewContent.node().d3scroll.wheelTo(0, 0);
                }
            },
            __updateRow: function (result, order) {
                var me = this;
                
                me.options.events.beforeload(result,this);
                
                this.__lastData = result;

                if (this.options.pager) {
                    this.emptyGridRows();
                    me.nowData = this.__buildData(result.data);
                } else {
                    me.nowData = this.__buildData(result);
                }
                for (var i = 0; i < me.nowData.length; i++) {
                    if (me.nowData[i]['id'] == undefined) {
                        me.nowData[i]['id'] = '__' + i;
                    }
                    me.nowData[i]['sectionRowIndex'] = i;
                    me.nowData[i]['index'] = i;
                }
                this.__scaleLinear(me.nowData);
                this.__buildColorInterpolate();


                this.__changeDom(me.nowData);

            },
            emptyGridRows: function () {
                this.tbody.selectAll('.'+GRID_CSS.rowCss[0].trim()).remove();
            },
            createRowBar: function (cell) {
                var me = this;
                if (this.sortColumn && this.options.cellBack) {
                    cell.append("div")
                        .attr('class', 'grid-row-back')
                        .style('width', function (d) {
                            // if(d.dataIndex==me.sortColumn.dataIndex){
                            var d = d3.select(this.parentElement.parentElement).data().pop()
                            return me.__widthScale(d[me.sortColumn.dataIndex]) + 'px';
                            // }
                        }).style('background-color', function (d) {
                        var d = d3.select(this.parentElement.parentElement).data().pop()
                        return me.__color(d[me.sortColumn.dataIndex]);
                    });
                }
            },
			__unselectOther:function(row,selectedData){
				var me =this;
				
				row.filter(function (d, i) {
                    return !me.equalsFun(d,selectedData);
                }).each(function(d){
                		d.checked = false;
                		d3.select(this).dispatch('row-selected');
                })
			},
            createCell: function (row) {
                var me = this;
                var cell = row.on('row-selected', function (d) {
	                    if (d.checked) {
	                    		d3.select(this).attr('class',function(){
			                        		this.classList.add('d3table-selected');
			                        		return this.className;
			                        	}).selectAll('.check').attr('checked', null).each(function () {
		                                    this.checked = true;
		                                });
	                    } else {
	                       	d3.select(this).attr('class',function(){
			                        		this.classList.remove('d3table-selected');
			                        		return this.className;
			                        	}).selectAll('.check').attr('checked', null).each(function () {
	                                    this.checked = false;
	                                });;
	                    }
                	}).attr('for',function(d){
                		return d.id;
                }).selectAll(GRID_CSS.rowCellCss.prefixjoin(' .')).data(this.columns);

                var cellTd = cell.enter().append('td').attr('class', function (d, i) {
                    if (i == 0) {
                        me.createRowBar(d3.select(this));
                    }
                    return GRID_CSS.rowCellCss.join(' ');
                }).style('width', function (d, i) {
                    if (d.width) {
                        return d.width + 'px';
                    }
                })
                .style('padding', me.options.rowStyle)
                .style('margin', '0px')
                .on('click',function(){
//                			d3.event.stopPropagation();
                			if(me.options.selected){
	                			var data = d3.select(this.parentElement).data().pop();
	                			if(data.checked){
	                				data.checked = false;	
	                			}else{
	                				data.checked = true;
	                			}
	                			if(me.options.multiple==false){
	                					//d3.event.stopPropagation();
	                				me.__unselectOther(row,data);
	                			}
	                			d3.select(this.parentElement).dispatch('row-selected');
	                			if(me.options.events.selected) me.options.events.selected(data.checked,data);
                			}
                	})
                .append('div').attr('class', 'grid-cell-inner ellipsis')
                .style('padding', me.options.rowStyle)
                .style('margin', '0px')
                .style('border', '0px')
                .style('width', function (d, i) {
	                return (this.parentElement.offsetWidth - 1) + 'px';
	            })
//                .on('click',function(){
//            			d3.event.stopPropagation();
//            		});

                cellTd.filter(function (d) {
                    return d.type == 'checkbox';
                }).append('input')
                    .attr('type', 'checkbox')
                    .attr('class', 'check')
                    .attr('value', function (d) {
                        var data = d3.select(this.parentElement.parentElement.parentElement).data().pop();
                        d3.select(this).datum(data);
                        return data[d.dataIndex];
                    }).attr('id', function(d){
                			return d.id;
                		}).on('click',function(d){
                			d3.event.stopPropagation();
                			d.checked=this.checked
                			d3.select(this.parentElement.parentElement.parentElement).dispatch('row-selected');
                		})
//                		.on('selected', function (d) {
//                			if (this.checked) {
//                                d3.select(this.parentElement.parentElement.parentElement).attr('class',function(){
//			                        		this.classList.add('d3table-selected');
//			                        		return this.className;
//			                        	}).style('background', 'rgba(214, 214, 214, 0.6)');
//                            } else {
//                                d3.select(this.parentElement.parentElement.parentElement).attr('class',function(){
//		                        		this.classList.remove('d3table-selected');
//		                        		return this.className;
//		                        	}).style('background', null);
//                            }
//                	  });
                	  
                cellTd.filter(function (d) {
                    return d.type != 'checkbox';
                }).html(function (d, i) {
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex]

                    if (d.renderer) {
                        return d.renderer(text, d, data, this);
                    }
                    return text;
                }).attr('title', function (d) {
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex]

                    if(d.title){
                    	 return (d.title(text, d, data, this) + "").replace(/<[^>]+>/g, "");
                    }
                        
                    if (d.renderer) {
                        return (d.renderer(text, d, data, this) + "").replace(/<[^>]+>/g, "");
                    }
                    return text + "".replace(/<[^>]+>/g, "");
                })
				
                
            },
            getCheckValues: function () {
                var values = [];
                this.__gridViewContent.selectAll('.check').each(function (d) {
                    if (this.checked) {
                        values.push(d);
                    }
                });
                return values;
            },
            uncheckAll:function () {
//            		this.rowselection.style('background', null);
                this.rowselection.each(function (d) {
                    d.checked = false;
                }).dispatch('row-selected')
//                .selectAll('.check').attr('checked', null).each(function () {
//                    this.checked = false;
//                });
                this.__headTable.selectAll('.check-all').attr('checked', null).each(function () {
                    this.checked = false;
                }).dispatch('selected');
                return this;
            },
            checkRow: function (data,checked) {
                var row = this.rowselection.filter(function (d, i) {
                		d.checked = checked;
                    return me.equalsFun(d,data);
                });
                row.dispatch('row-selected');

                // if (this.checked) {
                //
                // } else {
                //     me.__gridViewContent.selectAll('.grid-row').style('background', null);
                //
                // }
                return this;
            },
            selectedRow:function(data,checked){
            			var me =this;
            			var row = this.rowselection.filter(function (d, i) {
            				if(me.equalsFun(d,data)) d.checked = checked;
	                    return me.equalsFun(d,data);
	                });
	                row.dispatch('row-selected');
	                return this;
            },
            getSelected:function(){
        			return this.nowData.filter(function(d){
        				return d.checked == true;
        			});
            },
            unSelected:function(){
            		this.nowData.forEach(function(d){
            			d.checked = false;
            		});
            		this.rowselection.dispatch('row-selected');
            		return this;
//            		.each(function(d){
//            			d3.select(this).style('background', null);
//            		});
            }
        }

        obj.id = +new Date() + '';
        obj.options = {
        	margin:20,
    		selected:true,
    		multiple:true,
            animation: true,
            rowStyle: '5px 1px',
            pager: false,
            autoSort: false,
            angle: 90,
            cellBack: false,
            sortOrder: 'DESC',
            events: {
                 notData: function (b, viewBody) {
                    if (b) {
                        viewBody.selectAll('.echarts-nodata').data([{}]).enter().append('div').attr('class', 'echarts-nodata');
                    } else {
                        viewBody.select('.echarts-nodata').remove();
                    }
                },
                /**
                 * 动画结束
                 */
                animationEnd: function () {

                },
                beforeload: function () {

                },
                afterload: function () {

                },
                itemschange: function () {

                },
                headClick: function () {

                },
                selected:function(){
            		
            		},
                items: {
                    'click': function () {
                    	
                    }
                }
            }
        }
        obj.options = $.extend(obj.options, option.options);


        option.easing ? obj.easing = option.easing : '';
        obj.sortOrder = option.sortOrder || 'DESC';
        obj.columns = $.extend(obj.columns, option.columns);
        obj.options.events = $.extend({},obj.options.events, option.events);
        obj.pageConfig = $.extend(obj.pageConfig, option.options.pageConfig);
        obj.pageParams = $.extend(obj.pageParams, option.options.pageParams);
        obj.viewCss = $.extend(obj.viewCss, option.viewCss);
        obj.equalsFun = option.equalsFun?option.equalsFun:obj.equalsFun;
		obj.D3Scroll = obj.D3Scroll?obj.D3Scroll:false;
        obj.viewDom =  typeof(id)=='string'?document.getElementById(id):id;

        obj.width = $(obj.viewDom).width(),
        obj.height = $(obj.viewDom).height()-obj.options.margin,
        obj.viewBox = [0, 0, obj.width, obj.height];
        obj.init( typeof(id)=='string'?document.getElementById(id):id);
        return obj;
    }


    win.D3Table = D3Table;


})(d3, window)