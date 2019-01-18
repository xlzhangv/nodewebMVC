(function () {

    var chartWin =   echarts.init(document.getElementById('chart-win'));

    $('#chartModal .chart-close').on('click',function () {
        $('#chartModal').css({
            visibility: 'hidden',
            opacity: 0
        })
    })
    // 复杂的自定义覆盖物
    function ChartOverlay(point, chart,cofing){
        this._point = point;
        this.chart = chart;
        this.cofing = cofing?cofing:{
            height:250,
            width:250
        };
    }
    ChartOverlay.prototype = new BMap.Overlay();

    ChartOverlay.prototype.initialize = function(map){
        this._map = map;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = 10;
        div.style.backgroundColor = "#fff";
//        div.style.border = "1px solid #BC3B3A";
        div.style.color = "white";
        div.style.height = (this.cofing.height||250)+'px';
        div.style.width = (this.cofing.width||250)+'px';
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px"


        this.option = {
            backgroundColor:'#fffff',
            tooltip : {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data:this.chart.legend
            },
            grid: {
                left: '40',
                right: '30',
                bottom: '30'
            },
            xAxis : [
                {
                    type : 'category',
                    boundaryGap : false,
                    data : this.chart.xAxisData
                }
            ],
            yAxis : [
                {
                    type : 'value'
                }
            ],
            series : this.chart.series
        };
        mp.getPanes().labelPane.appendChild(div);

        this.Chart = echarts.init(div);
        this.Chart.setOption(this.option);

        var me =this;
        $(div).on('mousemove',function (e) {
                e.stopPropagation();
                return false;
            }).on('mouseover',function (e) {
                e.stopPropagation();
                return false;
            }).on('click',function (e) {
                chartWin.setOption(me.option);
                $('#chartModal').css({
                    visibility: 'visible',
                    opacity: 1
                });

                e.stopPropagation();
              return false;
          })

        return div;
    }



    ChartOverlay.prototype.draw = function(){
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);
        this._div.style.left = (pixel.x -this.cofing.width/2)+"px";
        this._div.style.top  = (pixel.y -this.cofing.height/2)+ "px";
    }

    window.ChartOverlay = ChartOverlay;



})();