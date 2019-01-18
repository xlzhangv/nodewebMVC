(function () {
    function createRadar(select,data,config) {
        var radar = new D3Direction(select,{
            height:config.height||250,
            width:config.width||250,
            tipFormatter:function(data){
                return template('scoot-temp',data);
            },
        });

        radar.setData(data);
        return radar;
    }
    // 复杂的自定义覆盖物
    function CustomDirectionOverlay(point, data,build,config){
        this._point = point;
        this.data = data;
        this.dataL = data.length-1;
        this.build = build;
        this.index = 0;
        this.config = config?config:{
            height:250,
            width:250
        };
    }
    CustomDirectionOverlay.prototype = new BMap.Overlay();

    CustomDirectionOverlay.prototype.initialize = function(map){
        this._map = map;
        var me =this;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = 10;
        div.style.backgroundColor = this.config.bg||"rgba(242, 243, 242, 0.7)";
       div.style.border = "1px solid #ccc";
        div.style.borderRadius='50%';
        div.style.color = "white";
        div.style.height = (this.config.height||250)+'px';
        div.style.width = (this.config.width||250)+'px';
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px"
        this.radar =  createRadar(d3.select(div),this.build(this.data,0),this.config);
        this.radar.radarsvg.style('transform','rotate('+(this.config.angle||0)+'deg)');
        this._map.getPanes().labelPane.appendChild(div);
        return div;
    }




    CustomDirectionOverlay.prototype.refreshRadar = function () {

        if(this.radar&&this.data[this.index])
            this.radar.updateDate(this.build(this.data,this.index));
    }

    CustomDirectionOverlay.prototype.next = function () {

        if(this.radar&&this.data[this.index]){
            this.radar.updateDate(this.build(this.data,this.index));
        }

        if(this.index>this.dataL){
            console.info('max index');
            return;
            // this.index = 0;
        }
        this.index++;
    }

    CustomDirectionOverlay.prototype.drawByIndex = function (index) {

        if(this.radar&&this.data[index]){
            this.radar.updateDate(this.build(this.data,index));
            this.index = index;
        }

    }

    CustomDirectionOverlay.prototype.draw = function(){
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);
        this._div.style.left = (pixel.x -this.config.width/2)+"px";
        this._div.style.top  = (pixel.y -this.config.height/2)+ "px";

    }

    window.CustomDirectionOverlay = CustomDirectionOverlay;

})();