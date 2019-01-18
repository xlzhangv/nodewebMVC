(function(w,$){
	
	 __getJSPath = function (js) {
        var scripts = document.getElementsByTagName("script");
        var path = "";
        for (var i = 0, l = scripts.length; i < l; i++) {
            var src = scripts[i].src;
            if (src.indexOf(js) != -1) {
                var ss = src.split(js);
                path = ss[0];
                break;
            }
        }
        var href = location.href;
        href = href.split("#")[0];
        href = href.split("?")[0];
        var ss = href.split("/");
        ss.length = ss.length - 1;
        href = ss.join("/");
        if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1 && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
            path = href + "/" + path;
        }
        return path;
    }

    var BASE_PATH = __getJSPath("d3.v4.js");
	
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

        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (source = arguments[ i ]) != null ) {
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
	/**
	 * 函数节流方法
	 * @param Function fn 延时调用函数
	 * @param Number delay 延迟多长时间
	 * @return Function 延迟执行的方法
	 */
	var throttle = function (fn, delay) {
	    var timer = null;
		var previous=null;
	    return function () {
	    	var now = +new Date();
            if ( !previous ) previous = now;
	    	var editors = arguments; 
	    	
	    	if (now - previous > delay ) {
	    		 fn.apply(null,editors);
	    		 previous = now;
                 clearTimeout(timer);
	    	}else{
	    		clearTimeout(timer);
		        timer = setTimeout(function() {
		            fn.apply(null,editors);
		        }, delay);
	    	}
	       
	    }
	};
	
	var cacheCanvas = document.createElement("canvas");
	cacheCanvas.width = 64;
	cacheCanvas.height = 64;
	 //粒子
    var particler = function () {
        var particle = new Image();
        particle.src = "data:image/png;base64,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";
        return function (r, g, b, a) {
            var imgCtx = cacheCanvas.getContext("2d"),
                imgData, i;
            imgCtx.drawImage(particle, 0, 0);
            imgData = imgCtx.getImageData(0, 0, 64, 64);
            i = imgData.data.length;
            while ((i -= 4) > -1) {
                imgData.data[i + 3] = imgData.data[i] * a;
                if (imgData.data[i + 3]) {
                    imgData.data[i] = r;
                    imgData.data[i + 1] = g;
                    imgData.data[i + 2] = b;
                }
            }
            imgCtx.putImageData(imgData, 0, 0);
            return cacheCanvas;
        }
    }();
    
	var  bezier=function (x1,y1,x2,y2,h){
		var slopy, cosy, siny;
		var Par = 2;
		var x3, y3;
		slopy = Math.atan2((y1 - y2), (x1 - x2));
		cosy = Math.cos(slopy);
		siny = Math.sin(slopy);
		x3 = (Number(x1) + Number(x2)) / 2;
		y3 = (Number(y1) + Number(y2)) / 2;
		return {
			x : (Number(x3) + Number(Par * cosy + Par / 2.0 * siny)),
			y : (Number(y3) - Number(Par / 2.0 * cosy - Par * siny))-50
		};
    };
   var  quadraticCurvePath=function(x1,y1,x2,y2,t,center){
            
    	var cx = x1 + (center.x - x1) * t;
        var cy = y1 + (center.y - y1) * t;
        var c2x = center.x + (x2 - center.x) * t;
        var c2y = center.y + (y2 - center.y) * t;
        var tx = cx + (c2x - cx) * t;
        var ty = cy + (c2y - cy) * t;
        return {
        	cx:cx,
        	cy:cy,
        	tx:tx,
        	ty:ty
        }
    }
    
    
	function Map2d(id,config) {
	
		this.datasize =config?(config.datasize?config.datasize:50):40;
        var defOptions={
            indextype:'id',//查找元素的索引key
            formatter:function (data) {
                return data.name + "</br>" + data.value + ' MB';
            }
        }
        objCopy(defOptions,config)
        this.settings = defOptions;

		this.init(id);
	}
	Map2d.prototype={
			enterLocation: [116.3, 39.9],
	    	transforming:undefined,
	    	datasize:50,
	        data:[],
	        drawTimer:undefined,
	        view:null,
	        zooming:false,
	        canvas:null,
	        mapsvg:null,
	        maxcount:3,
	        lineWidth:4,
	        chinaScale:5.5,
		    selected:undefined,
			_hierarchy:{
				0:'china',
				1:'',
				2:''
			},
			_geolevel:0,
	        scaleOpacity: d3.scaleLinear().domain([0, 40]).range([1, 0]).clamp(true),
	        opacity:undefined,
	        init:function(id){
	            var me=this;
	            this.opacity=d3.scaleLinear().domain([0, this.maxcount]).range([1, 0]).clamp(true);
	            me.drawMap(id);
	            me.buildWork();
	            me.buildThrottle();
	        },
	         buildZoom:function(){
	        	var me =this;
		        this.d3zoom = d3.zoom().scaleExtent([0.5, 50]).on('start',function(){
		        	me.zooming = true;
		        }).on("zoom",function(){
		        	me.zoomIng();
				}).on("end",function(){
					me.data.forEach(function(d,i){
						var zoomxy1 = me.zoomIdentity(d.def.x1,d.def.y1);
						var zoomxy2 = me.zoomIdentity(d.def.x2,d.def.y2);
						d.x1=zoomxy1.x;
						d.y1=zoomxy1.y;
						d.x2=zoomxy2.x;
						d.y2=zoomxy2.y;
						d.pointList=me.interpolating(d);
		            });
					me.zooming = false;
				});
	        	this.mapsvg.call(this.d3zoom);
	        	
	        	var  x = this.width/2,
			      y = this.height/2;
	        	 function transform() {
				      return d3.zoomIdentity
				          .translate(0, 0).scale(me.chinaScale);
				 }
	        	this.mapsvg.call(this.d3zoom.transform, transform);   
	        	this.view.on('mousemove',function(){
	                	 me.canvas.style("z-index",9);
	                	 if(me.zIndexTimer){
	                	 	 clearTimeout(me.zIndexTimer);
	                	 }
	                	
	                	 me.zIndexTimer=setTimeout(function(){
	                	 	  me.canvas.style("z-index",11);
	                	 },5000);
	              })
	        },
	        zIndexTimer:undefined,
	        canvasZoomIng:function (){
				var me =this;
		    	me.draw();
		    },
	        zoomIng:function(){
	        	var me =this;
	        	if(d3.event.transform.k>14){
                    me.gbody.selectAll('.province').style('opacity', '0.4');
                    me.gbody.selectAll('.province-text').style('opacity', '0.4');
                    me.gbody.selectAll('.city').style('display', 'block').style('opacity', '0.9');
                    me.gbody.selectAll('.text-city').style('display', 'block').style('opacity', '0.9');
				}else{
                    me.gbody.selectAll('.city').style('display', 'none').style('opacity', '0');
                    me.gbody.selectAll('.text-city').style('display', 'none').style('opacity', '0');
                    me.gbody.selectAll('.province').style('display', 'block').style('opacity', '0.9');
                    me.gbody.selectAll('.province-text').style('display', 'block').style('opacity', '0.9');
				}
				this.transforming = d3.event.transform;
				this.gbody.attrs({
				      transform:d3.event.transform
				    });
			},
			toCenter:function(x,y,k,callback){
				var me =this;
				function transform() {
					return d3.zoomIdentity
						.translate(-x, -y).scale(k);
				}
				this.mapsvg.transition()
					.duration(1000)
					.call(me.d3zoom.transform, transform).on('end',function(){
					if(callback){
						callback();
					}

				})
			},
			moveTo:function(x,y,k,callback){
	        	var me =this;

                function transform() {
                    return d3.zoomIdentity
                        .translate(me.width / 2, me.height / 2)
                        .scale(15).translate(-x, -y)
                }
		       this.mapsvg.transition()
		      	  .duration(1000)
		          .call(me.d3zoom.transform, transform).on('end',function(){
		          		if(callback){
		          			callback();
		          		}
		          	
		          })
	        },
	        __buildProjection: function (width, height,center) {
	            //  ///投影放大倍数
                // var z =  d3.min([this.width/width,this.height/height]);
                // var s = d3.max([this.width / this.height, this.height / this.width]) + 0.3;
                // var scale = this.width / s*(z!=1?z-0.7:z); ///投影放大倍数
                // var offset = [this.width / 2 + 30, this.height / 2 + 10]; //偏移量
                // var center = [107, 30]; //中心坐标
                var scale = this.width / 10.5; ///投影放大倍数
                var offset = [this.width/2,this.height/1.45]; //偏移量
                var center = [0, 0]; //中心坐标
                //投影函数
                this.projection = d3.geoMercator().scale(scale).translate(offset)
                    .center(center).clipExtent([[0, 0], [this.width, this.height]]);
                //path 绘制函数
                this.projectionPath = d3.geoPath().projection(this.projection);

	        },
	           //tip,显示数据
			chinaMapTip : function(data, point) {
				d3.select('#tooltip').style('opacity', '1').style('top',
					point.y + 'px').style('left', point.x + 'px')
					.html(data.name + "</br>" + data.value + ' MB');
			},
		    zoomIdentity:function(x,y,k){
		    	 var zoomIdentity = d3.zoomIdentity
					  .translate(this.transforming.x,this.transforming.y)
					  .scale(this.transforming.k)
					  .translate(x,y);
		    	return zoomIdentity;
		    },
		buildNextGeo:function (param,pos) {
		    	var me =this;
            $.ajax({
                url: BASE_PATH+'/map/geojson/'+param.ename+'.json',
                async: false,
                dataType:'json',
                success: function(data) {

                    var Polygon =  me.gbody.selectAll('.pid-'+param.id).data(data.features)

                    Polygon.enter().append('path').attr(
                        'class', 'geo city pid-'+param.id)
                        .attr("stroke", function(d){return "#fff";})
                        .attr("stroke-width", function(d){return "0.2";})
                        .attr("fill",'transparent')
                        .attr('d', me.projectionPath)
                        .style('cursor', 'pointer')
                        .attr('stroke','rgb(241, 240, 240)')
                        .attr('stroke-width','0.01em').attr('id', function(d) {
							var pos = me.projectionPath.centroid(d);
                        	d.centerX=pos[0]-2,d.centerY=pos[1];
							return '_'+d.properties[me.settings.indextype];
						}).style('display', 'none').style('opacity', '0');

                    var PolygonTextselection =  me.gbody.selectAll('.pid-text-'+param.id).data(data.features);

                    PolygonTextselection.enter().append('text')
                        .attr('id', function(d) {
                            return '_'+d.properties[me.settings.indextype] + '-text';
                        }).attr('class','geo-text text-city pid-text-'+param.id).attr('x', function(d) {
                        var pos = me.projectionPath.centroid(d);
							return (pos[0]);
						}).attr('y', function(d) {
							var pos = me.projectionPath.centroid(d);
							return (pos[1]);
						}).text(function(d) {
							return d.properties.name;
						}).attr('font-size', '0.05em').style('display', 'none').style('opacity', '0')
						me.moveTo(pos[0],pos[1]);
                }
            });

        },
        updateGeo:function (json,projection) {
            var me =this;


            //绘制个省份的path路径
            var geoselection =  me.gbody.selectAll('.province').data(json.features)

			var china =  me.gbody.selectAll(".china").data(json.features).enter().filter(function(d){
                if(d.properties.id=='CN'){
                    return true;
                }
                return false;
            });

            china.append("path")
                .attr("class","path")
                .attr("stroke", function(d){return "#afa476";})
                .attr("stroke-width", function(d){return "0.5";})
                .attr("fill",'transparent')
                .attr("d", this.projectionPath)

            geoselection.enter().filter(function(d){
                if(d.properties.id=='CN'){
                    return false;
                }
                return true;
            }).append('path')
				.attr('class', 'path geo province')
                .style("stroke", function(d){
                    return "#cdcccd";
                })
                // .style('stroke','rgb(241, 240, 240)')
                .style("stroke-width", function(d){
                    if(d.properties.id){
                        return "0.1";
                    }else{
                        return "0.5";

					}

                })

                .attr('d', this.projectionPath)
				.style('cursor', 'pointer')

				.attr('id', function(d) {
						var pos = me.projectionPath.centroid(d);
                		d.centerX=pos[0]-2,d.centerY=pos[1];

                        // if(d.properties.name=='河北'){
                			// console.info(d.properties);
						// }
						if (d.properties.id == '13') {//河北
							d.centerX = (pos[0] - 3);
                            d.centerY = (pos[1] + 3);
						}


					return '_'+d.properties[me.settings.indextype];
				}).attr('font-size', 12)
				.attr('font-weight','normal').attr('stroke', '#888').on('click',function (d) {
					if(d.properties.id){

                        me.gbody.selectAll('.'+'pid-'+me.selected).remove();
                        me.gbody.selectAll('.'+'pid-text-'+me.selected).remove();

						me.selected = d.properties[me.settings.indextype];

						me.buildNextGeo({
							ename:d.properties.id,
							id:d.properties[me.settings.indextype]
						},me.projectionPath.centroid(d));

					}
            }).on(
                'mouseenter', function(d) {
                    if (d.data) {
                        me.chinaMapTip({
                            name : d.data.province,
                            value : d.data.flow
                        }, {
                            x : d3.event.x,
                            y : d3.event.y
                        });
                    } else {
                        me.chinaMapTip({
                            name : d.properties.name,
                            value : 0
                        }, {
                            x : d3.event.x,
                            y : d3.event.y
                        });
                    }
                    //this.classList.add('provinces-hover');
                    //d3.select('#'+d.properties.name+'-text').style('opacity','1');
                }).on('mouseleave', function(d) {
                //d3.select('#'+d.properties.name+'-text').style('opacity','0');
                //this.classList.remove('provinces-hover');
                d3.select('#tooltip').style('opacity', '0');
            }).attr('fill', '#fff').style("opacity",function (d) {
                if(!d.properties.id) {
                    return '0.5';
                }else{
                	return '0.9';
				}
            }).call(function (selection) {

            });

            var geoTextselection = me.gbody.selectAll('.province-text').data(json.features);

            geoTextselection.enter().filter(function(d){
                if(d.properties.id=='CN'){
                    return false;
                }
                if(d.properties.id){
                    return true;
                }
                return false;
            }).append('text').attr('class','province-text geo-text')
                .attr('id', function(d) {
                    return '_'+d.properties[me.settings.indextype]+ '-text';
                }).attr('x', function(d) {
                	return d.centerX;
            }).attr('y', function(d) {
                return d.centerY;
            }).text(function(d) {
                return d.properties.name;
            }).attr('font-size', '0.1em')

            // geoTextselection.exit().remove();
            //
            // geoselection.exit().transition().duration(600).style('opacity','0').remove().on('end',function(){
            //
            // });

            // this.__updateGeo(geoselection,geoTextselection);
        },
        __updateGeo:function (geoselection,geoTextselection) {
            var me =this;


            geoTextselection.attr('id', function(d) {
                return '_'+d.properties[me.settings.indextype] + '-text';
            }).attr('x', function(d) {
                var pos = me.projectionPath.centroid(d);
                if(!pos[0]){

                }
                console.info(pos);
                if (d.properties.id == '20') {//河北
                    return (pos[0] - 20);
                }
                return (pos[0] - 10);
            }).attr('y', function(d) {
                var pos = me.projectionPath.centroid(d);
                if (d.properties.id == '20') {//河北
                    return (pos[1] + 20);
                }
                return (pos[1]);
            }).text(function(d) {
                return d.properties.name;
            });

            geoselection.style('opacity','0').transition().duration(400).style('opacity','1')
                .style('cursor', 'pointer').attr('stroke',
                'rgb(241, 240, 240)').attr('stroke-width',
                '1px').attr('d', this.projectionPath).attr('id', function(d) {
                var pos = me.projectionPath.centroid(d);
                if (d.properties.id == '20') {//河北
                    d.centerX = (pos[0] - 20);
                }
                d.centerX = (pos[0] - 10);
                if (d.properties.id == '20') {//河北
                    d.centerY = (pos[1] + 20);
                }
                d.centerY = (pos[1]);

                return '_'+d.properties[me.settings.indextype];
            }).attr('font-size', 12)
                .attr('font-weight','normal')
                .attr('stroke', '#888')
        },
	        drawMap:function(id){
	            var me=this;
	            this.view=d3.select(id),clientRect = this.view.node().getBoundingClientRect();
	            var width =this.width= clientRect.width,
	           		 height =this.height = clientRect.height;

	           me.mapsvg=this.view.append("svg");
	           me.mapsvg.style('display','none').style('opacity','0');
	            
	           me.gbody =  me.mapsvg.attr("class","mapsvg")
	            .attr("width", width)
	            .attr("height", height)
	            .style('position', 'absolute')
	            .style("z-index",10)
	            .append("g")


				me.canvas=this.view.append("canvas")
					.style('display','none').style('opacity','0')
	                .text("您的浏览器不支持Canvas")
	                .attr("width", width)
	                .attr("height", height)
	                .style("pointer-events","auto")
	                .attr("class","globe")
	                .attr('id','map-2d')
	                .style("z-index",99)
	            me.ctx = me.canvas.node().getContext("2d");
	            me.ctx.width = width;
	            me.ctx.height = height;
                this.__buildProjection(this.width, this.height,[107, 30]);
                //topojson文件读取比geojson文件更快
                d3.json(BASE_PATH+'/map/world.json', function(error, data) {
                    me.updateGeo(data);
                    me.buildZoom();

                    var  x = me.width/2,
                        y = me.height/2;
                    var center = me.projection(me.enterLocation);
                    var centerXY = me.zoomIdentity(center[0],center[1]);
                    me.diffx = centerXY.x-x;
                    me.diffy = centerXY.y-(y/3)*2;
                    me.diffk = centerXY.k;
                    me.toCenter(me.diffx,me.diffy,me.diffk,function(){
//		                 	me.start();
                    });

                });

	        },
	        resetGlobe:function(){
	        	 var me =this;
                 me.toCenter(me.diffx,me.diffy,me.diffk,function(){
//		                 	me.start();
                 });
	        },
	        clearRect:function(){
	            this.data=[];
	            me.ctx.clearRect(0,0,width,height);
	        },
	        draw:function(){
	            var me=this;
	            this.ctx.clearRect(0,0,this.width,this.height);
	            
	            if(me.zooming){
	            	return;
	            }
	            
	            me.data.forEach(function(d,i){
	            	var c = d3.color(d.color);
	            	
	                var x1=d.x1,y1=d.y1,x2=d.x2,y2=d.y2;
	                
	                if(d.k>10){
	                	d.k=0;
	                }
	                var sp=me.scaleOpacity(d.k);
	                var r=20;
	                me.ctx.save();
	                //start
	                me.ctx.strokeStyle =d3.rgb(c.r, c.g, c.b,sp).toString();
	               
	                me.ctx.lineWidth = 1;
	                var radgrad = me.ctx.createRadialGradient(x1, y1, d.k/2, x1, y1, d.k);
		            radgrad.addColorStop(0, d3.rgb(c.r, c.g, c.b,1).toString());
		            radgrad.addColorStop(1, d3.rgb(c.r, c.g, c.b,0.1).toString());
	                me.ctx.fillStyle=radgrad;//d3.rgb(c.r, c.g, c.b,sp).toString();
	                me.ctx.beginPath();
	                me.ctx.globalAlpha = 1//me.opacity(d.count);
	                me.ctx.arc(x1, y1,d.k,0, 2 * Math.PI);
	                me.ctx.drawImage(particler(c.r, c.g, c.b, 1), x1 - r / 2, y1 - r / 2, r, r);
	                me.ctx.fill();
	                me.ctx.fillStyle='rgba(255,255,255,1)';
	                me.ctx.textAlign = 'center';
					me.ctx.textBaseline = 'middle';
					me.ctx.font = '12px Microsoft YaHei';
					me.ctx.fillText(d.names[0], d.x1, d.y1- 10);
					
	                me.ctx.stroke();
	                me.ctx.restore();
	                //end
	                me.ctx.strokeStyle =d3.rgb(c.r, c.g, c.b,sp).toString();
	                me.ctx.lineWidth = 1;
	                var radgrad = me.ctx.createRadialGradient(x2, y2, d.k/2, x2, y2, d.k);
		            radgrad.addColorStop(0, d3.rgb(c.r, c.g, c.b,1).toString());
		            radgrad.addColorStop(1, d3.rgb(c.r, c.g, c.b,0.1).toString());
	                me.ctx.fillStyle=radgrad;//d3.rgb(c.r, c.g, c.b,sp).toString();
	                me.ctx.beginPath();
	                me.ctx.globalAlpha = 1//me.opacity(d.count);
	                me.ctx.arc(x2, y2, d.k,0, 2 * Math.PI);
	                me.ctx.drawImage(particler(c.r, c.g, c.b, 1), x2 - r / 2, y2 - r / 2, r, r);
	              	me.ctx.fill();
	                me.ctx.fillStyle='rgba(255,255,255,1)';
	                me.ctx.textAlign = 'center';
					me.ctx.textBaseline = 'middle';
					me.ctx.font = '12px Microsoft YaHei';
	                me.ctx.fillText(d.names[1], d.x2, d.y2- 10);
	                
	                me.ctx.stroke();
	                me.ctx.restore();
	                d.k+=0.2;
	                
	                //line
	                var imgR=30;
	                me.ctx.save();
	                var grd = me.ctx.createLinearGradient(d.pointList[0][0],d.pointList[0][1], d.pointList[d.len][0], d.pointList[d.len][1]);
		            grd.addColorStop(1, d3.rgb(c.r, c.g, c.b,0.9).toString());
					grd.addColorStop(0.8, d3.rgb(c.r, c.g, c.b,0.8).toString());
					grd.addColorStop(0.6, d3.rgb(c.r, c.g, c.b,0.6).toString());
					grd.addColorStop(0.4, d3.rgb(c.r, c.g, c.b,0.4).toString());
					grd.addColorStop(0.2, d3.rgb(c.r, c.g, c.b,0.4).toString());
					grd.addColorStop(0, d3.rgb(c.r, c.g, c.b,0.5).toString());
					me.ctx.strokeStyle =grd;
					me.ctx.drawImage(particler(c.r, c.g, c.b, 1), d.pointList[d.len][0] - imgR / 2, d.pointList[d.len][1] - imgR / 2, imgR, imgR);
					me.ctx.shadowBlur = 20;
					me.ctx.shadowColor ='rgba(255,255,255,1)';
					me.ctx.lineWidth =d.lineWidth?d.lineWidth:me.lineWidth;
					me.ctx.beginPath();
	                var len = d.pointList.length-1;
	                if(d.len>=len){
	                	d.len=0;
	                	d.count++;
	                }
	                me.ctx.globalAlpha = 1//me.opacity(d.count);
	                me.ctx.moveTo(d.pointList[0][0], d.pointList[0][1]);
					for (var i = 0; i < d.len; i+=2) {
						me.ctx.lineTo(d.pointList[i][0], d.pointList[i][1]);
					}
					
					me.ctx.stroke();
					me.ctx.restore();
					d.len++;
					if(d.count>me.maxcount){
						me.data.splice(i,1);
					}
	            });
	        },
	        data:[],
	        interpolating:function(d){
	        	var pointList=[];
		    	var t = 0;
		    	var center=bezier(d.x1,d.y1,d.x2,d.y2);
		    	var sp = function(d){
		    		var coordinate =  quadraticCurvePath(d.x1,d.y1,d.x2,d.y2,t,center);
			    	if (t > 1) {
			    		return pointList;
			        }else{
			        	t += 0.015 ; 
			        	pointList.push([coordinate.tx,coordinate.ty]);
			        	sp(d);
			        }
		    	}
		    	sp(d);
		    	return pointList;
	        },
	        addMark:function(data,important){
	    		var me =this;
	    		if(important){
	    			me.buildMark(data)
	    		}else{
	    			me.throttle(data);
	    		}
	        },
	        buildWork:function(){
	        	var me =this;
	        	if (typeof(Worker) !== "undefined") {
					this.worker=new Worker(BASE_PATH+"/map/work2dPoints.js");
					this.worker.onmessage=function(event){
						me.data.push(event.data);
					};
				} 
	        	
	        },
	        buildMark:function(data){
	        	var me =this;
	        	var originCoordinate = me.projection(data.from.location);
		        var targetCoordinate = me.projection(data.to.location);
	    		
	    		var d ={
	    			color:data.color,
	    			lineWidth:data.lineWidth,
	    			names:[data.from.name?data.from.name:'',data.to.name?data.to.name:''],
	        		def:{
	        			 x1:originCoordinate[0],
			             y1:originCoordinate[1],
			             x2:targetCoordinate[0],
			             y2:targetCoordinate[1]
	        		}
	        	};
	        	var zoomxy1 = me.zoomIdentity(originCoordinate[0],originCoordinate[1]);
				var zoomxy2 = me.zoomIdentity(targetCoordinate[0],targetCoordinate[1]);
				d.x1=zoomxy1.x;
				d.y1=zoomxy1.y;
				d.x2=zoomxy2.x;
				d.y2=zoomxy2.y;
	            d.step=0;
	            d.k=0;
	            d.len=0;
	            d.count=0;
		    	
		    	
		    	if (this.worker) {
					this.worker.postMessage(d);
				} else {
					d.pointList=me.interpolating(d);
					me.data.push(d);
				}
		    	
	        },
	        buildThrottle:function(){
				var me =this;
				this.throttle = throttle(function(data){
						if(me.data.length>me.datasize){
			    			return;
			    		}
			    		me.buildMark(data)
			        	
				},300);
			},
	        start:function(callback){
	         	var me =this;
                me.mapsvg.style('opacity','1').style('display',null);
                me.canvas.style('opacity','1').style('display',null).on('end',function(){
                    if(callback){
                        callback();
                    }
                });
	            this.drawTimer = d3.timer(function(){
	                me.draw();
	            });
	        },
	        stop:function(){
	        	 this.drawTimer.stop();
	        	 this.data=[];
	        	 this.ctx.clearRect(0,0,this.width,this.height);
	        	 this.mapsvg.transition()
		      	  .duration(1000).style('opacity','0').style('display','none');
	             this.canvas.transition()
		      	  .duration(1000).style('opacity','0').style('display','none');
	        }
	}

	w.Map2d = Map2d;
	
})(window,jQuery);
