(function(d3,win){
	
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
 
    Array.prototype.prefixjoin = function(prefix) {
        var css='';
        for (var index = 0; index < this.length; index++) {
            var a = this[index];
            if(a){
                css+=prefix+a;
            }
        }
        return css;
    }

    //差集
    Array.prototype.minus = function(list,filter){
        var obj ={
            list:this.concat(),
            noupdata:[],
            update:[],
            newlist:[]
        };
        for (var i = 0; i < list.length; i++) {
            var target = list[i];
            var include=true;
            for (var j = 0; j < this.length; j++) {
                var source = this[j];
                if(filter(source,target)){
                    include=false;
                    break;
                }
            }
            if(include){
                obj.newlist.push(target);
            }
        }
        for (var i = 0; i < this.length; i++) {
            var source = this[i];

            var isExist = false;
            for (var j = 0; j < list.length; j++) {
                var target = list[j];
                if(filter(source,target)){
                    obj.update.push({
                        index:i,
                        newobj:target
                    });
                    obj.list.splice(i, 1, target);
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                obj.noupdata.push({
                    index:i,
                    source:source
                });
            }else{

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

    var isEquals = function(a, b) {
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

    var GRID_CSS={
        rowsCss:['grid-view','grid-table'],
        rowCss:['grid-row'],
        rowCellCss:['grid-row-cell'],
        headCss:['grid-head-table','grid-table'],
        headTrCss:['grid-head'],
        headCellCss:['grid-head-cell']
    }

	function D3TableAnim(id,options) {

        var obj = new Object();

        obj.__proto__ = {
            width:0,
            height:0,
            easing:'slideLeft',//angle、slideLeft、slideRight,
            viewDom:undefined,
            tbody:undefined,
            tfoot:undefined,
            events:{
                /**
                 * 动画结束
                 */
                animationEnd:function(){

                },
                itemschange:function () {

                },
                items:{
                    'click':function(){
                        console.info('item-click');
                    }
                }
            },
         
            pageParams:{
                currentPage : 0,
                pageSize:10,
                totle:0,
                totalPage:0
            },
            viewCss:{
                rowsCss:['table'],
                rowCss:[],
                rowCellCss:[],
                headCss:['table'],
                headTrCss:[],
                headCellCss:[]
            },
            columns:[],
            nowData:[],//当前数据
            prevData:[],//上一次的数据
            backColumn:undefined,//背景框
            sortColumn:undefined,
            equalsFun:undefined,
            backcolor:'red',//背景色
            init:function(viewDom){
                this.__buildCss();
                this.__createViewPort(viewDom);
                this.__createRowHead();
                this.__createTfoot();
                this.__createRowView();

            },
            __buildCss:function(){
                for(var c in GRID_CSS){
                    GRID_CSS[c] = GRID_CSS[c].concat(this.viewCss[c]);
                }
            },
            __prevIndex:function(d,selfIndex){
                if(this.options.autoSort){
                    this.nowData = this.__sortIndex(this.nowData);
                }
                for(var i = 0;i<this.nowData.length;i++){
                    var prevD = this.nowData[i];
                    if(this.equalsFun(d,prevD)){
                        return i;
                    }
                }
            },
            /**
             * if (this.sortOrder == 'DESC') {
                    this.sortOrder = 'ASC';
                } else {
                    this.sortOrder = 'DESC';
                }
             */
            __sortIndex:function(data){
                var me =this;
                return data.sort(function (a, b) {
                    if (me.sortOrder == 'DESC') {
                        return d3.descending(a[me.sortColumn.dataIndex], b[me.sortColumn.dataIndex]);
                    } else {
                        return d3.ascending(a[me.sortColumn.dataIndex], b[me.sortColumn.dataIndex]);
                    }
                })
            },
            __buildData:function(data){
            	
                if(this.options.autoSort){
                    if(this.prevData.length==0){
                        return this.__sortIndex(data);
                    }
                    var result = this.prevData.minus(data,this.equalsFun);
                    for (var i = result.newlist.length-1; i >=0 ; i--) {
                        var d = result.noupdata[i];
                        result.list.splice(d.index,1);
                    }
                    return result.newlist.concat(result.list);
                }
                return data;
            },
            equalsFun:function(d,prevD){

                if(d.rowIndex==prevD.rowIndex){
                    return true;
                }
                return false;

            },
             __buildBackWidth:function(){
            		 var me = this;
            		 if(me.backColumn&&me.backColumn.backIndex){
            		 	 var sortIndex =  this.__headTd.filter(function(d){
	                    		return d.dataIndex == me.backColumn.dataIndex;
	                 });
	                 this.__maxBackWidth = sortIndex.node().offsetLeft+sortIndex.node().offsetWidth;
            		 }else{
            		 	this.__maxBackWidth = this.__headTable.node().offsetWidth;
            		 	
            		 }
            },
            __maxBackWidth:undefined,
            colorFun:undefined,
            __colorScale:undefined,
            __widthScale:undefined,//比例尺
            __scaleLinear:function(data){
                if(this.sortColumn){
                    var sortValue=[];
                    for (var index = 0; index < data.length; index++) {
                        sortValue.push(data[index][this.sortColumn.dataIndex]);
                    }
                   
//                    this.__widthScale =  d3.scaleLog().domain([d3.min(sortValue), d3.max(sortValue)]).range([(this.__maxBackWidth-1)/3, (this.__maxBackWidth-1)]);//
//                     this.__colorScale =  d3.scaleLog().domain([d3.min(sortValue), d3.max(sortValue)]).range([1, 0]);
                    this.__widthScale = 	d3.scaleLinear().domain([d3.min(sortValue), d3.max(sortValue)]).range([(this.__maxBackWidth-1)/3, (this.__maxBackWidth-1)]);
                    this.__colorScale =  d3.scaleLinear().domain([d3.min(sortValue), d3.max(sortValue)]).range([1, 0]);
                }else{
                    this.__widthScale = function(){return 0;};
                    this.__colorScale = function(){return 0;};
                }
            },
            __color:function(sortValue){
                if(this.__colorInterpolate){
                		var c = d3.color(this.__colorInterpolate(this.__colorScale(sortValue)));
                		c.opacity=0.5;
                    return c.toString();
                }
                else{
                    return this.backcolor;
                }
            },
            __colorInterpolate:undefined,
            //生成颜色插值
            __buildColorInterpolate:function(){
                if (this.sortColumn&&!this.__colorInterpolate) {
	                	if(this.colorFun){
	                    this.__colorInterpolate =  this.colorFun();
	                }else{
	                		if (this.sortColumn.inRange && this.sortColumn.inRange.length >= 2) {
	                        var start, end;
	                        var start = d3.color(this.sortColumn.inRange[0]); // 红
	                        var end = d3.color(this.sortColumn.inRange[1]); // 浅色
	                        // 颜色插值函数
	                        this.__colorInterpolate = d3.interpolate(end,start);
	                    } else {
	                        if (this.options.inRange && this.options.inRange >= 2) {
	                            var start, end;
	                            var start = d3.color(this.options.inRange[0]); // 红
	                            var end = d3.color(this.options.inRange[1]); // 浅色
	                            // 颜色插值函数
	                            this.__colorInterpolate = d3.interpolate(end,start);
	                        }
	                    }
	                }
                    
                }
            },
            __animationCount:0,
            __animationEnd:function(){
                this.__animationCount++;
                if(this.__animationCount>=this.nowData.length){
                    this.events.animationEnd();
                    this.__animationCount=0;
                }


            },
            __cellWidths:{},
            __trHeight:0,
            __createViewPort:function(viewDom){
                this.viewPort =  d3.select(viewDom).append('div').attr('class','grid-viewport').attr('height',this.height);
            },
            __createRowHead:function(){
                var me =this;

                this.__gridHeadView =  this.viewPort.append('div')
                    .attr('class','grid-head-view')

                this.__headTable =  this.__gridHeadView.append("table").attr('class',GRID_CSS.headCss.join(' '))
                    .attr('cellspacing','0').attr('cellpadding','0').attr('border','0');

               var headColumns = this.__headTable.append('thead').append('tr').attr('class', GRID_CSS.headTrCss.join(' '));

	           this.__headTd = headColumns.selectAll(GRID_CSS.headCellCss.prefixjoin(' .')).data(this.columns).enter().append('td').attr('class', GRID_CSS.headCellCss.join(' '))
	                .attr('data-index', function (d) {
	                		if(d.backIndex) me.backColumn = d;
	                    if (d.sortable) me.sortColumn = d;
	                    return d.dataIndex;
	                }).style('width', function (d, i) {
	                    if (d.width) {
	                        return d.width + 'px';
	                    }
	                }).style('padding', me.options.rowStyle)
	                .style('margin', '0px');
	                
	            this.__headTd.append('div').attr('class', 'grid-cell-inner ellipsis')
	                .style('width', function (d, i) {
	                    // var head = d3.selectAll('.grid-head-cell[data-index=' + d.dataIndex + ']').node();
	                    return (this.parentElement.offsetWidth - 1) + 'px';
	                }).on('click', function (d) {
	                    d3.event.stopPropagation();
	                    me.options.events.headClick(d, this, me);
	                }).html(function (d, i) {
	                    return d.text;
	                });
                    
                this.__gridHeadView.append('div').attr('class','grid-head-back');
                this.__buildBackWidth();
            },
            __updateScroll:function(value){
                this.__gridHeadView.node().scrollLeft = value;
            },
            __createRowView:function(){
                var me =this;
                this.__gridViewport = this.viewPort.insert("div", ".grid-tfoot-view")
                    .attr('class','grid-rows-view')
                    .style('height',function(){
                        return me.height -me.viewPort.select('.grid-tfoot-view').node().offsetHeight- me.viewPort.select('.grid-head-view').node().offsetHeight+'px';
                    });

                this.__gridViewBody = this.__gridViewport.append('div').attr('class','grid-view-body')
                    .on('scroll',function(e){
                        me.__updateScroll(this.scrollLeft);
                    })

               this.__gridViewContent = this.__gridViewBody.append('div').attr('class', 'grid-view-content');

                var gridTable = this.__gridViewContent.append('table').attr('class', GRID_CSS.rowsCss.join(' '))
                    .attr('cellspacing', '0').attr('cellpadding', '0').attr('border', '0');

                this.__createTbody(gridTable);
                new D3Scroll(this.__gridViewContent);
                this.__gridHeadView.style('width',this.__gridViewContent.style('width'));
                this.tfoot.style('width',this.__gridViewContent.style('width'));

            },
            __createTbody:function(viewport){
                this.tbody = viewport.append('tbody').attr('class','grid-tbody');
            },
            __createTfoot:function(){
                this.tfoot = this.viewPort.append('div').attr('class','grid-tfoot-view').append('table').attr('class','grid-tfoot-table grid-table').append('tr').append("td").attr('class', 'page-num');
            },
            __transforms:['transform','-ms-transform','-moz-transform','-webkit-transform','-o-transform'],
            __easing:function(transition,type){
                var me =this;
                switch(type){
                    case 'angle':
                        me.__setTransitionStyleTween(transition,function(data,i){
                            return function(t) {
                                return me.__buildTransformStyle(-1*(1-t)*(i)*(me.__trHeight),me.options.angle,0);
                            };
                        }).on('start',function(){
                            var transition = d3.select(this).style('opacity','1').transition().duration(1000).on('end',function(d){
                                me.events.itemschange(d,this);
                            });
                            me.__setTransitionStyleTween(transition,function(data,i){
                                return function(t) {
                                    return me.__buildTransformStyle(0,(1-t)*me.options.angle,0.05);
                                }
                            })
                        });
                        break;

                    case 'slideLeft':

                        me.__setTransitionStyleTween(transition,function(data,i){
                            return function(t) {
                                return "translate3d"+'(0,' + -1*(1-t)*(i)*(me.__trHeight) + 'px,0) ';
                            };
                        }).on('start',function(){
                            var transition = d3.select(this).style('opacity','1').transition().duration(1000).on('end',function(d){
                                me.events.itemschange(d,this);
                            });
                            me.__setTransitionStyleTween(transition,function(data,i){
                                return function(t) {

                                    return "translate3d"+'('+-(1-t)*100+'%,0px,0) ';
                                }
                            })
                        });

                        break;

                    case 'slideRight':
                        me.__setTransitionStyleTween(transition,function(data,i){
                            return function(t) {
                                return "translate3d"+'(0,' + -1*(1-t)*(i)*(me.__trHeight) + 'px,0) ';
                            };
                        }).on('start',function(){
                            var transition = d3.select(this).style('opacity','1').transition().duration(1000).on('end',function(d){
                                me.events.itemschange(d,this);
                            });
                            me.__setTransitionStyleTween(transition,function(data,i){
                                return function(t) {

                                    return "translate3d"+'('+(1-t)*100+'%,0px,0) ';
                                }
                                console.info('__updateRow - end');
                            })
                        });

                        break;

                }

            },
            __buildTransformStyle : function(y, angle,z) {
                var tfs = "translate3d"+'(0,' + y + 'px,0) '+'rotate3d'+'(0,1,'+z+',' + angle + 'deg)';
                return tfs;
            },
            __setTransform:function(selection,tfs){
                for (var index = 0; index < this.__transforms.length; index++) {
                    selection.style(this.__transforms[index],tfs)
                }
                return selection;
            },
            __setTransitionStyleTween:function(transition,tween){
                var me =this;
                for (var index = 0; index < this.__transforms.length; index++) {
                    transition.styleTween(this.__transforms[index],tween)
                }

                return transition;
            },
            delayFun:function(d,i,delay){
                return i*delay;
            },
            __update:function(rowselection){
                var me =this;


                rowselection.style("transform",function(d, i) {
                    if(d.isnew){
                        return me.__buildTransformStyle((me.nowData.length-1)* (me.__trHeight),0,0);
                    }
                    else{
                        return this.style.cssText;
                        // var prevKey=me.__prevIndex(d,i);
                        // return me.__buildTransformStyle(prevKey.data.transformy,0,0);
                    }
                });

                if(me.sortColumn&&me.options.cellBack){
                		rowselection.select('.back-color').transition().duration(500).style('width',function(d){
                        // if(d.dataIndex==me.sortColumn.dataIndex) {
                        var d = d3.select(this.parentElement.parentElement.parentElement).data().pop()
                        return me.__widthScale(d[me.sortColumn.dataIndex]) + 'px';
                        // }
                    }).style('background-color',function (d) {
                        var d = d3.select(this.parentElement.parentElement.parentElement).data().pop()
                        return me.__color(d[me.sortColumn.dataIndex]);
                    });
                    me._updateRowDom(rowselection,function () {
                        // rowselection.select('.back-color')
                        //     .transition().duration(800).style('width',function(d){
                        //     // if(d.dataIndex==me.sortColumn.dataIndex) {
                        //     var d = d3.select(this.parentElement.parentElement.parentElement).data().pop()
                        //     return me.__widthScale(d[me.sortColumn.dataIndex]) + 'px';
                        //     // }
                        // }).style('background-color',function (d) {
                        //     var d = d3.select(this.parentElement.parentElement.parentElement).data().pop()
                        //     return me.__color(d[me.sortColumn.dataIndex]);
                        // });
                    });
                }else {
                    me._updateRowDom(rowselection);
                }



            },
            _updateRowDom:function(rowselection,end){
                var me =this;
                rowselection.selectAll('.grid-cell-inner').html(function(d,i) {
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex]
                    if(d.renderer){
                        return d.renderer(text,d,data,this);
                    }
                    return text;
                }).attr('title',function(d){
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex]
                    if(d.renderer){
                        return d.renderer(text,d,data,this);
                    }
                    return text;
                });


//                rowselection.attr('id',function(d,i){
//                    return d.id;
//                }).attr('class', function (d) {
//                    return GRID_CSS.rowCss.join(' ')+' '+d.id;
//                });
                var  transition = rowselection.transition().duration(500).delay(function(d, i) {
                    return me.delayFun(d,i,60);
                })
                transition.style('transform',function(d,i){
                    var prevIndex=me.__prevIndex(d,i);
                    d3.select(this).attr('prevIndex',prevIndex).attr('type',d.id);
                    return me.__buildTransformStyle((prevIndex-this.sectionRowIndex) * (me.__trHeight),0,0);
                }).on('end',function(d){
                    if(d.isnew){
                        me.events.itemschange(d,this);
                        d.isnew=false;
                    }
                    if(end)end(this);
                });
            },
            __layoutscroll:function(theight){
                this.height-=theight
                if(this.height<0){
                    var scrollW = this.__gridViewBody.node().offsetWidth-this.__gridViewBody.node().scrollWidth;
                    this.__gridHeadView.style('padding-right',scrollW+'px');
                }
            },
            __buildItemsEvents:function(row){
				var me = this;
				for (var k in this.events.items) {
					row.on(k, function(d) {
								if (k == 'click') {
									d3.select(this).dispatch('selected');
								}
								me.options.events.items[k](arguments);
							});
				}
            },
            sortData: function (sortColumn, order) {
                var me = this;
                this.sortColumn = sortColumn;
                if (this.sortOrder == 'DESC') {
                    this.sortOrder = 'ASC';
                } else {
                    this.sortOrder = 'DESC';
                }
                // this.__changeDom(this.__sortIndexFun(me.nowData, sort, this.sortOrder));
                this.__updateRow(me.prevData);
            },
            addRow:function(data){
                data.isnew=true;
                var list =  this.nowData.concat();
                if(this.options.pageSize<=list.length){
                    list.splice(list.length-1,1);
                    list.unshift(data);
                }else{
                    list.unshift(data);
                }

                this.__updateRow(list);
            },
            upData:function(){
            
            },
            setData:function (result) {
            		
            		for (var i = 0; i < result.length; i++) {
                    result[i]['rowIndex'] = i;
                }
            	
                this.__updateRow(result);
            },
            __updateRow:function(result){
                var me =this;

               	me.nowData = this.__buildData(result);
                this.__scaleLinear(me.nowData);
                this.__buildColorInterpolate();
                
                this.rowselection = this.tbody.selectAll(GRID_CSS.rowCss.prefixjoin(' .')).data(me.nowData);
                var row = this.rowselection.enter().append("tr").attr('class', function (d) {
                    return GRID_CSS.rowCss.join(' ')+' '+d.id;
                })

                this.createCell(row);
                row.attr('id',function(d,i){
                    me.__trHeight = this.clientHeight;
                    me.__layoutscroll(this.clientHeight);
                    return d.id;
                }).style('opacity','0')
                row.style("transform",function(d, i) {
                    d.transformy=-(i)* (me.__trHeight);
                    return me.__buildTransformStyle(-(i)* (me.__trHeight),me.options.angle,0);
                });


                this.__buildItemsEvents(row);


                var transition = row.transition().delay(function(d, i) {
                    return me.delayFun(d,i,60);
                }).on('end',function(d){

                })

                me.__easing(transition,me.easing);

//			me.__setTransitionStyleTween(transition,function(data,i){
//				return function(t) {
//					return "translate3d"+'(0,' + -1*(1-t)*(i)*(me.__trHeight) + 'px,0) ';
//					//return me.__buildTransformStyle(-1*(1-t)*(i)*(me.__trHeight),me.options.angle,0);
//				 };
//			}).on('start',function(){
//				var transition = d3.select(this).style('opacity','1').transition().duration(1000);
//				me.__setTransitionStyleTween(transition,function(data,i){
//						return function(t) {
//
//							return "translate3d"+'('+-(1-t)*100+'%,0px,0) ';
//							//return me.__buildTransformStyle(0,(1-t)*me.options.angle,0.05);
//						}
//						console.info('__updateRow - end');
//					})
//			});

                var removeduration =  this.rowselection.exit().transition().delay(function(d, i) {
                    return me.delayFun(d,i,100);
                }).style('opacity','0').remove().on('end',function(){
                    console.info('remove-end');
                });
                me.__setTransitionStyleTween(removeduration,function(data,i){
                    return function(t) {
                        return me.__buildTransformStyle(0,(t)*me.options.angle,0.05);
                    }
                });

                this.__update(this.rowselection);
                //更新上次一记录
                this.prevData=me.nowData.concat();
                this.__gridViewContent.node().d3scroll.wheelTo(0, 0);
            },
            emptyGridRows:function(){
                var me =this;
                var removeduration =  this.tbody.selectAll(GRID_CSS.rowCss.prefixjoin(' .')).remove();
            },
            createRowBar:function(cell){
                var me =this;
                if(this.sortColumn&&this.options.cellBack){
                    cell.append("div")
                        .attr('class','grid-row-back')
                        .append('div').attr('class','back-color').style('height','100%').style('width',function(d){
                        // if(d.dataIndex==me.sortColumn.dataIndex){
                        var d = d3.select(this.parentElement.parentElement.parentElement).data().pop()
                        return me.__widthScale(d[me.sortColumn.dataIndex])+'px';
                        // }
                        }).style('background-color',function (d) {
                            var d = d3.select(this.parentElement.parentElement.parentElement).data().pop()
                            return me.__color(d[me.sortColumn.dataIndex]);
                        });
                }
            },
			__unselected:function(dom){
				
				d3.select(dom.parentElement).selectAll('tr').filter(function(){
					return (this != dom);
				}).each(function(d){
					d.checked = false;
					this.classList.remove('d3table-selected');
				})
				
			},
            createCell:function(row){
                var me =this;
				
                var cell = row.on('selected', function(d) {
                				if(!me.options.multiple){
                					me.__unselected(this);
                				}
							if (d.checked) {
								d.checked = false;
								this.classList.remove('d3table-selected');
							} else {
								d.checked = true;
								this.classList.add('d3table-selected');
							}
						}).selectAll(GRID_CSS.rowCellCss.prefixjoin(' .'))
						.data(this.columns);

                cell.enter().append('td').attr('class',function(d,i){
                    if(i==0){
                        me.createRowBar(d3.select(this));
                    }

                    return GRID_CSS.rowCellCss.join(' ');
                }).style('width',function(d,i){
                    if(d.width){
                        return d.width +'px';
                    }
                })
                    .style('padding',me.options.rowStyle)
                    .style('margin','0px')
                    .append('div').attr('class','grid-cell-inner ellipsis')
                    .style('width',function(d,i){
                         return (this.parentElement.offsetWidth - 1) + 'px';
                    })
                    .style('padding',me.options.rowStyle)
                    .style('margin','0px')
                    .style('border','0px')
                    .html(function(d,i) {
                        var data = d3.select(this.parentElement.parentElement).data().pop(),
                            text = data[d.dataIndex]

                        if(d.renderer){
                            return d.renderer(text,d,data,this);
                        }
                        return text;
                    }).attr('title',function(d){
                    var data = d3.select(this.parentElement.parentElement).data().pop(),
                        text = data[d.dataIndex];
                        
	                    if (d.renderer) {
	                        return (d.renderer(text, d, data, this) + "").replace(/<[^>]+>/g, "");
	                    }
	
	                    return text + "".replace(/<[^>]+>/g, "");
                })

            }
        }

        obj.id=+new Date()+'';
        obj.options={
            rowStyle:'8px 1px',
           	easing:'slideLeft',//angle、slideLeft、slideRight,
           	sortOrder:'DESC',
            autoSort:false,
            multiple:false,
            angle:90,
            cellBack:true,
            pageSize:10,
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
            }
        }
        obj.options = objCopy(obj.options,options.options);
        obj.sortOrder = options.options.sortOrder || 'DESC';
        options.easing?obj.easing = options.easing:'';
        obj.columns = objCopy(obj.columns,options.columns);
        obj.viewCss = objCopy(obj.viewCss,options.viewCss);
        obj.equalsFun = objCopy(obj.equalsFun,options.equalsFun);
        	obj.colorFun = options.colorFun?options.colorFun:obj.colorFun;
        obj.options.events = objCopy(obj.options.events,options.events);
        obj.viewDom = document.getElementById(id);
        obj.width = obj.viewDom.clientWidth,
        obj.height = obj.viewDom.clientHeight - 20,
        obj.viewBox = [0, 0, obj.width, obj.height];
        obj.init(document.getElementById(id));
        return obj;

    }
	win.D3TableAnim = D3TableAnim;
})(d3,window)