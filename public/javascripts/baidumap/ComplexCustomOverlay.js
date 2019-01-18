(function () {
    function createRadar(select,data,config) {
        var radar = new D3radar(select,{
            height:config.height||250,
            width:config.width||250,
            tipFormatter:function(data){
                return data.name+':</br>'+data.svalue+''+data.unit;
            },
        });

        radar.setData(data);
        return radar;
    }
    // 复杂的自定义覆盖物
    function ComplexCustomOverlay(point, data,build,config){
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
    ComplexCustomOverlay.prototype = new BMap.Overlay();

    ComplexCustomOverlay.prototype.initialize = function(map){
        this._map = map;
        var me =this;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = 10;
        div.style.backgroundColor = this.config.bg||"rgba(68, 74, 146, 0.82)";
//        div.style.border = "1px solid #BC3B3A";
        div.style.borderRadius='50%';
        div.style.color = "white";
        div.style.height = (this.config.height||250)+'px';
        div.style.width = (this.config.width||250)+'px';
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px"
        div.style.transform = 'rotate('+(this.config.angle||0)+'deg)';
        this.radar =  createRadar(d3.select(div),this.build(this.data,0),this.config);

        this.barTip = document.createElement("div");
        this.barTip.style.position = "absolute";
        this.barTip.style.zIndex = 11;
        this.barTip.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        this.barTip.style.borderRadius='9px';
        this.barTip.style.opacity = 0;
        this.barTip.style.visibility='hidden';
        this.barTip.style.transition='.3s';
        this.barTip.style.top= -1*(this.config.height||250)+'px';
        this.barTip.style.left=-0.9*(this.config.width||250)/2+'px';
        this.barTip.style.boxShadow="0 0 10px 4px #ccc";

        this.bar= new HighBar(this.barTip,{
            width:this.config.width*2,
            height:250
        })
        d3.select(this._div).on('mouseover',function (d) {
            if(!historyCheckbox){
                me.barTip.style.opacity = 1;
                me.barTip.style.visibility='visible';
            }

            d3.event.stopPropagation();
            d3.event.preventDefault();

        }).on('mouseleave',function () {
            if(!historyCheckbox){
                me.barTip.style.opacity = 0;
                me.barTip.style.visibility='hidden';
            }

            d3.event.stopPropagation();
        });
        div.appendChild(this.barTip);
        this.bar.setData(this.data[0].chart);
        this._map.getPanes().labelPane.appendChild(div);
        return div;
    }




    ComplexCustomOverlay.prototype.refreshRadar = function () {

        if(this.radar&&this.data[this.index])
            this.radar.updateDate(this.build(this.data,this.index));
    }

    ComplexCustomOverlay.prototype.next = function () {

        if(this.radar&&this.data[this.index]){
            this.bar.setData(this.data[this.index].chart);
            this.radar.updateDate(this.build(this.data,this.index));
        }

        if(this.index>this.dataL){
            console.info('max index');
            return;
            // this.index = 0;
        }
        this.index++;
    }

    ComplexCustomOverlay.prototype.drawByIndex = function (index) {

        if(this.radar&&this.data[index]){
            this.bar.setData(this.data[this.index].chart);
            this.radar.updateDate(this.build(this.data,index));
            this.index = index;
        }

    }

    ComplexCustomOverlay.prototype.draw = function(){
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);
        this._div.style.left = (pixel.x -this.config.width/2)+"px";
        this._div.style.top  = (pixel.y -this.config.height/2)+ "px";

    }

    window.ComplexCustomOverlay = ComplexCustomOverlay;

})();