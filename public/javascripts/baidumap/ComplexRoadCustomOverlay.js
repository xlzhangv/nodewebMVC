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
    function ComplexCustomOverlay(point, result,build,config){
        this._point = point;
        this.result = result;
        this.data = result.series;
        this.dataL = this.data.length-1;
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
        // div.style.border = "1px solid #BC3B3A";
        div.style.borderRadius='50%';
        div.style.color = "white";
        div.style.height = (this.config.height||250)+'px';
        div.style.width = (this.config.width||250)+'px';
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px"



        this.barTip = document.createElement("div");
        this.barTip.style.position = "absolute";
        this.barTip.style.zIndex = 11;
        this.barTip.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
        this.barTip.style.borderRadius='9px';
        this.barTip.style.padding="0 6px 12px 6px";
        this.barTip.style.opacity = 0;
        this.barTip.style.visibility='hidden';
        this.barTip.style.transition='.3s';
        this.barTip.style.boxShadow="0 0 10px 4px #ccc";
        this.tipTitle = document.createElement("p");
        this.tipContent = document.createElement("div");
        this.tipTitle.innerHTML=this.result.junction_name;
        this.tipTitle.style.color='rgb(77, 78, 78)';
        this.tipTitle.style.padding='10px 0 10px 20px';
        this.tipTitle.style.margin='0';
        this.tipTitle.style.fontWeight='900';

        this.barTip.appendChild(this.tipTitle);
        this.barTip.appendChild(this.tipContent);

        div.appendChild(this.barTip);

        this.radar =  createRadar(d3.select(this._div),this.build(this.data,0),this.config);

        this.radar.radarsvg.style('transform','rotate('+(this.config.angle||0)+'deg)');

        d3.select(this._div).on('mouseover',function (d) {
            if(historyCheckbox){
                me.barTip.style.opacity = 1;
                me.barTip.style.visibility='visible';
            }

            d3.event.stopPropagation();
            d3.event.preventDefault();
            return false;

        }).on('mouseleave',function () {

            me.barTip.style.opacity = 0;
            me.barTip.style.visibility='hidden';

            d3.event.stopPropagation();
        });
        this._map.getPanes().labelPane.appendChild(div);
        return div;
    }



    ComplexCustomOverlay.prototype.buildBarData = function (result) {
        var me =this;
        this.bar=[];
        this.tipContent.innerHTML='';
        var w = me.config.width+100;
        var left= w*(result.length);

        result.forEach(function (t,i) {
            var subTitle=[];
            var barDiv = document.createElement("div");
            barDiv.style.display='inline-block';
            barDiv.style.margin="0px 15px";
            barDiv.style.border="1px solid #ccc";
            var bar  = new D3GroupBar(d3.select(barDiv),{
                width:w,
                height:me.config.height-100,
                tipFormatter: function (data) {
                    var str="<p>"+data.name+":</p>";
                    data.series.forEach(function (s) {
                        str+="<p>"+s.name+":";
                        if(s.compared.flag){
                            str+='<i class="up">'+s.compared.value+'%('+s.series[0].svalue+''+s.series[0].unit+')</i>'
                        }else{
                            str+='<i class="down">'+s.compared.value+'%('+s.series[0].svalue+''+s.series[0].unit+')</i>'
                        }
                        str+="</p>";
                    })
                    return str;
                }
            });
            me.bar.push(bar);

            t.chart.forEach(function (c1) {
                var b = false;
                c1.series.forEach(function (c2) {
                    if(c2.compared.show){
                        b = true;
                    }
                });
                if(b){
                    subTitle.push(c1.name);
                }
            });
            var subText=t.name;
            if(subTitle.length>0){
                subText += subTitle.join(";");
                subText+='趋势不一致';
            }
            bar.setTitle(subText,'');

            bar.setData(t.chart);
            me.tipContent.appendChild(barDiv);
        })
        this.barTip.style.top= -1*(this.config.height-50)+'px';

        left -=this.config.width;
        this.barTip.style.left=-1*left/2+'px';

    }


    ComplexCustomOverlay.prototype.refreshRadar = function () {

        if(this.radar&&this.data[this.index])
            this.radar.updateDate(this.build(this.data,this.index));
    }

    ComplexCustomOverlay.prototype.next = function () {

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

    ComplexCustomOverlay.prototype.drawByIndex = function (index) {

        if(this.radar&&this.data[index]){

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