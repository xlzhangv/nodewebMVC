(function () {
    var hh=0;
    function getAngle(x1, y1, x2, y2) {
        // 直角的边长
        var x = Math.abs(x1 - x2);
        var y = Math.abs(y1 - y2);
        // 斜边长
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        // 余弦
        var cos = y / z;
        // 弧度
        var radina = Math.acos(cos);
        // 角度
        var angle =  180 / (Math.PI / radina);
        return {
            angle:angle,
            radina:radina
        };
    }
    /**
     * 对单个值进行边界处理。
     * @param {Number} i 要处理的数值
     * @param {Number} min 下边界值
     * @param {Number} max 上边界值
     *
     * @return {Number} 返回不越界的数值
     */
    var getRange = function (i, mix, max) {
        mix && (i = Math.max(i, mix));
        max && (i = Math.min(i, max));
        return i;
    };
    /**
     * 按照百度地图支持的世界范围对bounds进行边界处理
     * @param {BMap.Bounds} bounds BMap.Bounds的实例化对象
     *
     * @return {BMap.Bounds} 返回不越界的视图范围
     */
    var cutBoundsInRange = function (bounds) {
        var maxX = getRange(bounds.getNorthEast().lng, -180, 180);
        var minX = getRange(bounds.getSouthWest().lng, -180, 180);
        var maxY = getRange(bounds.getNorthEast().lat, -74, 74);
        var minY = getRange(bounds.getSouthWest().lat, -74, 74);
        return new BMap.Bounds(new BMap.Point(minX, minY), new BMap.Point(maxX, maxY));
    };

    var getExtendedBounds = function(map, bounds, gridSize,dif){
        bounds = cutBoundsInRange(bounds);
        var pixelNE = map.pointToPixel(bounds.getNorthEast());
        var pixelSW = map.pointToPixel(bounds.getSouthWest());
        pixelNE.x += gridSize/1;
        pixelNE.y -= gridSize/dif;
        pixelSW.x -= gridSize/1;
        pixelSW.y += gridSize/dif;
        var newNE = map.pixelToPoint(pixelNE);
        var newSW = map.pixelToPoint(pixelSW);
        return new BMap.Bounds(newSW, newNE);
    };

    var getAnglePoint = function (map,point,radina) {
        var point = map.pointToPixel(point);
        point.x = point.x*Math.sin(radina);
        point.y = point.y*Math.cos(radina);
        return map.pixelToPoint(point)
    }

    // 复杂的自定义覆盖物
    function GroupOverlay(overlays,cofing){
        this.overlays = overlays;
        this.cofing = cofing?cofing:{
            height:250,
            width:250
        };
    }
    GroupOverlay.prototype = new BMap.Overlay();


    GroupOverlay.prototype.groupPiexel=function () {
        var start={},
            end={};
        var ls=[],
            ts=[];
        var bounds = new BMap.Bounds();
        for(var i=0;i<this.overlays.length;i++){
            bounds.extend(this.overlays[i]._point);
            ls.push(parseFloat(this.overlays[i]._div.style.left))
            ts.push(parseFloat(this.overlays[i]._div.style.top))
        }
        start['left'] = Math.min.apply(null,ls);
        start['top'] = Math.min.apply(null,ts);
        end['left'] = Math.max.apply(null,ls);
        end['top'] = Math.max.apply(null,ts);
        var triangle = getAngle(start['left'],start['top'],end['left'],end['top']);
        var newbounds;
        if(this.overlays.length<=2){
            newbounds = getExtendedBounds(this._map,bounds,100,1.5);
        }else{
            newbounds = getExtendedBounds(this._map,bounds,100,2.5);
        }



        var sw = newbounds.getSouthWest();                         //获取西南角的经纬度(左下端点)
        var ne = newbounds.getNorthEast();                           //获取东北角的经纬度(右上端点)

        var wn = new BMap.Point(sw.lng, ne.lat);             //获取西北角的经纬度(左上端点)
        var es = new BMap.Point(ne.lng, sw.lat);               //获取东南角的经纬度(右下端点)


        var w = Math.abs(this._map.pointToPixel(wn).x - this._map.pointToPixel(ne).x);
        var h = Math.abs(this._map.pointToPixel(wn).y - this._map.pointToPixel(sw).y);
        if(!hh){
            hh = h;
        }
        if(hh>h){
            hh=h;
        }
        var point = this._map.pointToOverlayPixel(bounds.getCenter());

        point.x = point.x-w/2;
        point.y = point.y-h/2

        return {
            point:point,
            h:h,
            w:w,
            angle:triangle.angle-90
        }
    }

    GroupOverlay.prototype.initialize = function(map){
        this._map = map;
        var me =this;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = -10;
        div.style.backgroundColor = "transparent";
        div.style.border = "3px solid rgb(175, 175, 175)";
        div.style.color = "white";
        div.style.borderRadius="20px";
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px"
        div.style.cursor="url(/plugin/d3js/d3-radar/radar.cur), auto";
        var pixel = this.groupPiexel();
        div.style.left = (pixel.x)+"px";
        div.style.top  = (pixel.y)+ "px";
        mp.getPanes().labelPane.appendChild(div);
        mp.addEventListener("zoomend", function () {
            if(this.getZoom()>16&&this.getZoom()<20){
                me.show();
            }else{
                me.hide();
            }
        });

        return div;
    }

    GroupOverlay.prototype.draw = function(){
        var map = this._map;
        var me =this;
       setTimeout(function () {
           var pixel = me.groupPiexel();
           me._div.style.left = (pixel.point.x)+"px";
           me._div.style.top  = (pixel.point.y)+ "px";
           me._div.style.transform="rotate("+pixel.angle+"deg)";
           me._div.style.height = hh+"px";
           me._div.style.width = pixel.w+"px";
       })
    }

    window.GroupOverlay = GroupOverlay;
})();