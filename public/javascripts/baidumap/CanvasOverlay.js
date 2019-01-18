(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.FlashMarker = factory());
}(this, (function () { 'use strict';

    var cacheCanvas = document.createElement("canvas");
    cacheCanvas.width = 64;
    cacheCanvas.height = 64;
    //粒子
    var particler = function () {
        var particle = new Image();
        particle.src = "data:image/png;base64,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";
        return function (color) {
            var c = d3.color(color)
            var imgCtx = cacheCanvas.getContext("2d"),
                imgData, i;
            imgCtx.drawImage(particle, 0, 0);
            imgData = imgCtx.getImageData(0, 0, 64, 64);
            i = imgData.data.length;
            while ((i -= 4) > -1) {
                imgData.data[i + 3] = imgData.data[i] * c.opacity;
                if (imgData.data[i + 3]) {
                    imgData.data[i] = c.r;
                    imgData.data[i + 1] = c.g;
                    imgData.data[i + 2] = c.b;
                }
            }
            imgCtx.putImageData(imgData, 0, 0);
            return cacheCanvas;
        }
    }();

    var buildImage = function (src,callback) {
        var image = new Image();
        image.src = src;
        image.onload=function () {

        };
        var imgCtx = cacheCanvas.getContext("2d"),
            imgData, i;
        imgCtx.drawImage(image, 0, 0);
        imgData = imgCtx.getImageData(0, 0, 64, 64);
        imgCtx.putImageData(imgData, 0, 0);
        return cacheCanvas;
    }();

    var bezier = function(x1, y1, x2, y2, h) {
        var slopy, cosy, siny;
        var Par = 1;
        var x3, y3;
        slopy = Math.atan2((y1 - y2), (x1 - x2));
        cosy = Math.cos(slopy);
        siny = Math.sin(slopy);
        x3 = (Number(x1) + Number(x2)) / 2;
        y3 = (Number(y1) + Number(y2)) / 2;
        return {
            x : (Number(x3) + Number(Par * cosy + Par / 2.0 * siny)),
            y : (Number(y3) - Number(Par / 2.0 * cosy - Par * siny))
        };
    };
    var quadraticCurvePath = function(x1, y1, x2, y2, t, center) {

        var cx = x1 + (center.x - x1) * t;
        var cy = y1 + (center.y - y1) * t;
        var c2x = center.x + (x2 - center.x) * t;
        var c2y = center.y + (y2 - center.y) * t;
        var tx = cx + (c2x - cx) * t;
        var ty = cy + (c2y - cy) * t;
        return {
            cx : cx,
            cy : cy,
            tx : tx,
            ty : ty
        }
    }

    var interpolating = function(d,speed){
        var pointList=[];
        var t = 0;
        var center=bezier(d.xy1.x,d.xy1.y,d.xy2.x,d.xy2.y);
        var sp = function(d,speed){
            var coordinate =  quadraticCurvePath(d.xy1.x,d.xy1.y,d.xy2.x,d.xy2.y,t,center);
            if (t > 1) {
                return pointList;
            }else{
                t += speed||0.02 ;
                pointList.push([coordinate.tx,coordinate.ty]);
                sp(d);
            }
        }
        sp(d,speed);
        return pointList;
    }

    /**
     * @author https://github.com/chengquan223
     * @Date 2017-02-27
     * */
    function CanvasLayer(options) {
        this.options = options || {};
        this.paneName = this.options.paneName || 'labelPane';
        this.zIndex = this.options.zIndex || 0;
        this._map = options.map;
        this._lastDrawTime = null;
        this.show();
    }

    CanvasLayer.prototype = new BMap.Overlay();

    CanvasLayer.prototype.initialize = function (map) {
        this._map = map;
        var canvas = this.canvas = document.createElement('canvas');
        var ctx = this.ctx = this.canvas.getContext('2d');
        canvas.style.cssText = 'position:absolute;' + 'left:0;' + 'top:0;' + 'z-index:' + this.zIndex + ';';
        this.adjustSize();
        this.adjustRatio(ctx);
        map.getPanes()[this.paneName].appendChild(canvas);
        var that = this;
        map.addEventListener('resize', function () {
            that.adjustSize();
            that._draw();
        });
        return this.canvas;
    };

    CanvasLayer.prototype.adjustSize = function () {
        var size = this._map.getSize();
        var canvas = this.canvas;
        canvas.width = size.width;
        canvas.height = size.height;
        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
    };

    CanvasLayer.prototype.adjustRatio = function (ctx) {
        var backingStore = ctx.backingStorePixelRatio || ctx.webkitBackingStorePixelRatio || ctx.mozBackingStorePixelRatio || ctx.msBackingStorePixelRatio || ctx.oBackingStorePixelRatio || ctx.backingStorePixelRatio || 1;
        var pixelRatio = (window.devicePixelRatio || 1) / backingStore;
        var canvasWidth = ctx.canvas.width;
        var canvasHeight = ctx.canvas.height;
        ctx.canvas.width = canvasWidth * pixelRatio;
        ctx.canvas.height = canvasHeight * pixelRatio;
        ctx.canvas.style.width = canvasWidth + 'px';
        ctx.canvas.style.height = canvasHeight + 'px';
        // console.log(ctx.canvas.height, canvasHeight);
        ctx.scale(pixelRatio, pixelRatio);
    };

    CanvasLayer.prototype.draw = function () {
        var self = this;
        var args = arguments;

        clearTimeout(self.timeoutID);
        self.timeoutID = setTimeout(function () {
            self._draw();
        }, 15);
    };

    CanvasLayer.prototype._draw = function () {
        var map = this._map;
        var size = map.getSize();
        var center = map.getCenter();
        if (center) {
            var pixel = map.pointToOverlayPixel(center);
            this.canvas.style.left = pixel.x - size.width / 2 + 'px';
            this.canvas.style.top = pixel.y - size.height / 2 + 'px';
            this.dispatchEvent('draw');
            this.options.update && this.options.update.call(this);
        }
    };

    CanvasLayer.prototype.getContainer = function () {
        return this.canvas;
    };

    CanvasLayer.prototype.show = function () {
        if (!this.canvas) {
            this._map.addOverlay(this);
        }
        this.canvas.style.display = 'block';
    };

    CanvasLayer.prototype.hide = function () {
        this.canvas.style.display = 'none';
        //this._map.removeOverlay(this);
    };

    CanvasLayer.prototype.setZIndex = function (zIndex) {
        this.canvas.style.zIndex = zIndex;
    };

    CanvasLayer.prototype.getZIndex = function () {
        return this.zIndex;
    };

    var global = typeof window === 'undefined' ? {} : window;

    var requestAnimationFrame = global.requestAnimationFrame || global.mozRequestAnimationFrame || global.webkitRequestAnimationFrame || global.msRequestAnimationFrame || function (callback) {
        return global.setTimeout(callback, 1000 / 60);
    };

    function Marker(map,opts) {
        this._map=map;
        this.city = opts.name;
        this.location = new BMap.Point(opts.lnglat[0], opts.lnglat[1]);
        this.color = opts.color;
        this.type = opts.type || 'circle';
        this.speed = opts.speed || 0.15;
        this.size = 0;
        this.max = opts.max || 20;
    }

    Marker.prototype.draw = function (context) {
        context.save();
        context.beginPath();
        switch (this.type) {
            case 'circle':
                this._drawCircle(context);
                break;
            case 'ellipse':
                this._drawEllipse(context);
                break;
            default:
                break;
        }
        context.closePath();
        context.restore();

        this.size += this.speed;
        if (this.size > this.max) {
            this.size = 0;
        }
    };

    Marker.prototype._drawLine = function (context) {
        var pixel = this.pixel || this._map.pointToPixel(this.location);
        context.strokeStyle = this.color;
        context.moveTo(pixel.x + pixel.size, pixel.y);
        context.arc(pixel.x, pixel.y, this.size, 0, Math.PI * 2);
        context.stroke();
    };
    Marker.prototype._drawCircle = function (context) {
        var pixel = this.pixel || this._map.pointToPixel(this.location);
        context.strokeStyle = this.color;
        context.moveTo(pixel.x + pixel.size, pixel.y);
        context.arc(pixel.x, pixel.y, this.size, 0, Math.PI * 2);
        context.stroke();
    };

    Marker.prototype._drawEllipse = function (context) {
        var pixel = this.pixel || this._map.pointToPixel(this.location);
        var x = pixel.x,
            y = pixel.y,
            w = this.size,
            h = this.size / 2,
            kappa = 0.5522848,

            // control point offset horizontal
            ox = w / 2 * kappa,

            // control point offset vertical
            oy = h / 2 * kappa,

            // x-start
            xs = x - w / 2,

            // y-start
            ys = y - h / 2,

            // x-end
            xe = x + w / 2,

            // y-end
            ye = y + h / 2;

        context.strokeStyle = this.color;
        context.moveTo(xs, y);
        context.bezierCurveTo(xs, y - oy, x - ox, ys, x, ys);
        context.bezierCurveTo(x + ox, ys, xe, y - oy, xe, y);
        context.bezierCurveTo(xe, y + oy, x + ox, ye, x, ye);
        context.bezierCurveTo(x - ox, ye, xs, y + oy, xs, y);
        context.stroke();
    };


    function MarkerLine(key,map,opts,destroyFun) {
        this._map=map;
        this.key = key,
        this.pIndex=0;
        this.imgR = opts.imgR||30;
        this.lineWidth = opts.lineWidth||1;
        this.color = opts.color||'blue';
        this.anchorSrc=opts.anchorSrc||'';
        this.anchorType=opts.anchorType||'arc';
        this.destroyFun =destroyFun;
        this.templ = 0;
        this.points =[];
        this.pointList=[];
        this.oldLinePoints=[];
        this.oldAnchorPoints=new Set();
        this.oldInterpolating=[];
        this._moveIng = false;
        this.showAnchor=false;
        this.tempImgR=1;
    }
    MarkerLine.prototype.addNext= function (point) {
        this.points.push(point);
    }
    MarkerLine.prototype._moveNext = function (context) {
        var me = this;
        me._buildPoints();
        me._drawOldLine(context);

        if(this.points[this.pIndex+1]=='stop'){
            this.clear();
            if(this.destroyFun) this.destroyFun(this.key);
            this.templ=0;
            return;
        }

        if(this.pIndex==(this.points.length - 1)){
            this.templ=0;
            return;
        }

        if (this.pIndex < this.points.length - 1) {
            if(this._moveIng == false){
                this.pointList= interpolating({
                    xy1:this._map.pointToPixel(this.points[this.pIndex].point),
                    xy2:this._map.pointToPixel(this.points[this.pIndex+1].point)
                });

                this.maxlen = this.pointList.length-1;
            }
            this._moveIng = true;



            this._drawLine(context,function () {
                me.oldLinePoints.push({
                    p0:me.points[me.pIndex],
                    p1:me.points[me.pIndex+1]
                });
                me.oldAnchorPoints.add(me.points[me.pIndex]);
                me.oldAnchorPoints.add(me.points[me.pIndex+1]);
                me.templ = 0;
                me.tempImgR=1;
                me._moveIng = false;
                me.pIndex++;
            });
        }

    };

    MarkerLine.prototype._drawAnchor = function (p,type,context) {
        var me =this;
        if(type=='arc'){
            this.tempImgR += 0.5;
            if (this.tempImgR > this.imgR) {
                this.tempImgR = 1;
            }
            var c = d3.color(this.color);
            context.strokeStyle = this.color;
            var radgrad = context.createRadialGradient(p.x, p.y, this.tempImgR/2, p.x, p.y, this.tempImgR);
            radgrad.addColorStop(0, d3.rgb(c.r, c.g, c.b,1).toString());
            radgrad.addColorStop(1, d3.rgb(c.r, c.g, c.b,0.1).toString());
            context.fillStyle=radgrad;//d3.rgb(c.r, c.g, c.b,sp).toString();
            context.beginPath();
            context.moveTo(p.x + this.tempImgR, p.y);
            context.arc(p.x, p.y, this.tempImgR, 0, Math.PI * 2);
            context.fill();

        }else{
            if(this.anchorSrc){
                if(this.anchorImage){
                    context.drawImage(me.anchorImage, p.x - me.imgR / 2, p.y - me.imgR / 2, me.imgR, me.imgR);
                }else{
                    this.anchorImage = new Image();
                    this.anchorImage.src=this.anchorSrc;
                    this.anchorImage.onload = function () {
                        context.drawImage(me.anchorImage, p.x - me.imgR / 2, p.y - me.imgR / 2, me.imgR, me.imgR);
                    }
                }
            }else{
                context.drawImage(particler(me.color), p.x - this.imgR / 2, p.y - this.imgR / 2, this.imgR, this.imgR);
            }

        }


    }

    MarkerLine.prototype._buildPoints=function () {
        var pixelpoints=[];
        for(var i=0;i<this.oldLinePoints.length;i++){
            pixelpoints =  pixelpoints.concat(interpolating({
                xy1:this._map.pointToPixel(this.oldLinePoints[i].p0.point),
                xy2:this._map.pointToPixel(this.oldLinePoints[i].p1.point)
            }));
        }

        this.oldInterpolating = pixelpoints;
    }
    MarkerLine.prototype._drawOldLine = function (context) {
        var me =this;
        if(!this.oldInterpolating[this.oldInterpolating.length-1]) return;
        context.lineWidth = this.lineWidth;
        context.save();
        context.strokeStyle = this.color;

        if(this.showAnchor){
            this.oldAnchorPoints.forEach(function (item) {
                var xy1 = me._map.pointToPixel(item.point);
                if(me.anchorSrc){
                    context.drawImage(me.anchorImage, xy1.x - me.imgR / 2, xy1.y - me.imgR / 2, me.imgR, me.imgR);
                }else{
                    context.drawImage(particler(me.color), xy1.x - me.imgR / 2, xy1.y - me.imgR / 2, me.imgR, me.imgR);
                }

            });
        }

        if(this._moveIng == false) {

            this._drawAnchor({
                x:this.oldInterpolating[this.oldInterpolating.length - 1][0],
                y:this.oldInterpolating[this.oldInterpolating.length - 1][1]
            },this.anchorType,context);
            // context.drawImage(particler(this.color), this.oldInterpolating[this.oldInterpolating.length - 1][0] - this.tempImgR / 2, this.oldInterpolating[this.oldInterpolating.length - 1][1] - this.tempImgR / 2, this.tempImgR, this.tempImgR);
        }
        context.beginPath();
        context.moveTo(this.oldInterpolating[0][0], this.oldInterpolating[0][1]);
        for (var i = 1; i < this.oldInterpolating.length; i+=1) {
            context.lineTo(this.oldInterpolating[i][0], this.oldInterpolating[i][1]);
        }
        context.stroke();
        context.restore();
    };

    MarkerLine.prototype._drawLine = function (context,callback) {
        context.lineWidth = this.lineWidth;
        context.save();
        context.strokeStyle = this.color;

        if(this.templ>this.maxlen){
            callback();
            return;
        }

        if(this._moveIng){
            this._drawAnchor({
                x:this.pointList[this.templ][0],
                y:this.pointList[this.templ][1]
            },this.anchorType,context);
            // context.drawImage(particler(this.color), this.pointList[this.templ][0] - this.imgR / 2, this.pointList[this.templ][1] - this.imgR / 2, this.imgR, this.imgR);
        }
        context.beginPath();
        context.moveTo(this.pointList[0][0], this.pointList[0][1]);

        for (var i = 1; i < this.templ; i+=2) {
            context.lineTo(this.pointList[i][0], this.pointList[i][1]);
        }
        context.stroke();
        context.restore();
        this.templ++;
    };
    MarkerLine.prototype.clear = function () {
        this.points =[];
        this.pointList=[];
        this.oldLinePoints=[];
        this.oldAnchorPoints=new Set();
        this.oldInterpolating=[];
    }


    function FlashMarker(map,options) {
        this.init(map);
        this.options = options?options:{
        };
    }
    FlashMarker.prototype = {
        animationLayer: null,
        width : 0,
        height :0,
        animationFlag : true,
        markers : {},
        _map:undefined,
        init:function (map) {
            var me = this;
            this._map = map;
            this.width = map.getSize().width, this.height = map.getSize().height,
            this.animationLayer = new CanvasLayer({
                map: map,
                update: function () {
                    me.render();
                }
            });

            this.events();

            this.render();
        },

        events:function () {
            var me =this;
            this.animationLayer.canvas.onmousemove = function (e) {

                var x = e.pageX - me.animationLayer.canvas.getBoundingClientRect().left;
                var y = e.pageY - me.animationLayer.canvas.getBoundingClientRect().top;

                for(var k in me.markers){
                    for(var i=0;i<me.markers[k].oldLinePoints.length;i++){
                        var xy1 = me._map.pointToPixel(me.markers[k].oldLinePoints[i].p0.point),
                        xy2 = me._map.pointToPixel(me.markers[k].oldLinePoints[i].p1.point),
                        df1 = Math.sqrt(Math.pow(xy1.x - x, 2)+ Math.pow(xy1.y - y, 2)),
                            df2 = Math.sqrt(Math.pow(xy2.x - x, 2)+ Math.pow(xy2.y - y, 2));
                        if(df1<=30){
                            me.markers[k].showAnchor = true;
                            me.markers[k].color = 'blue';
                            break;
                        }else if(df2<30){
                            me.markers[k].showAnchor = true;
                            me.markers[k].color = 'blue';
                            break
                        }
                        else{
                            me.markers[k].showAnchor = false;
                            me.markers[k].color = 'red';
                        }

                    }
                }

            }

            this._map.addEventListener('movestart', function () {
                me.animationFlag = false;
            });

            this._map.addEventListener('moveend', function () {
                me.animationFlag = true;
            });

            this._map.addEventListener('zoomstart', function () {
                me.animationFlag = false;
            });

            this._map.addEventListener('zoomend', function () {
                me.animationFlag = true;
            });

        },
        render:function () {
            var me =this;
            var animationCtx = this.animationLayer.canvas.getContext('2d');
            if (!animationCtx) {
                return;
            }

            if (!me.animationFlag) {
                animationCtx.clearRect(0, 0, me.width, me.height);
                return;
            }

            // animationCtx.fillStyle = 'rgba(0,0,0,.95)';
            // var prev = animationCtx.globalCompositeOperation;
            // animationCtx.globalCompositeOperation = 'destination-in';
            // animationCtx.fillRect(0, 0, this.width, this.height);
            // animationCtx.globalCompositeOperation = prev;

            animationCtx.clearRect(0, 0, me.width, me.height);

            for(var k in me.markers){
                me.markers[k]._moveNext(animationCtx);
            }

            requestAnimationFrame(function () {
                me.render();
            });
        },
        updatePoint:function (id,p) {
            var me =this;
            if(this.markers[id]){
                this.markers[id].addNext(p);
            }else{
                this.markers[id] = new MarkerLine(id,this._map,this.options,function (k) {
                    me.markers[k].clear();
                    delete me.markers[k];
                });
                this.markers[id].addNext(p);
            }
        }
    }

    return FlashMarker;

})));