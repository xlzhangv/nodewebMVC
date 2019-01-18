(function (c) {
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

    var defaultOption = {
        title:{
            left: 'center',
            text:'',
            subtext:'',
            subtextStyle:{
                color:'red'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter:function (items) {
                var str=items[0].axisValue+'<br>';
                str+=items[0].marker+''+items[0].seriesName+':'+items[0].data.value+items[0].data.unit+'<br>'
                str+=items[1].marker+''+items[1].seriesName+':'+items[1].data.value+items[0].data.unit+'<br>'
                if(items[0].data.compared.show){
                    if(items[0].data.compared.flag){
                        str+='<span style="color:red">提高：'+items[0].data.compared.value+'%</span>';
                    }else{
                        str+='<span style="color:green">降低：'+items[0].data.compared.value+'%</span>';
                    }
                }
                return str;
            }
        },
        grid : {
            // top : '12px',
            left:'30',
            right : '30',
            bottom : '15',
            containLabel : true
        },
        xAxis: [
            {
                type: 'category',
                data: [],
                axisLabel:{
                    interval:0
                }
            }
        ],
        yAxis: [
            {
                type: 'log'
            }
        ],
        series: []
    };



    function HighBar(dom,config) {
        this.config = objCopy({
            height:200,
            width:200
        },config);
        this.parentDom = dom;
        this.init();
    }

    HighBar.prototype = {

        init:function () {
            this._createDom();
            this._buildChart();
        },
        _createDom:function () {
            this._div = document.createElement("div");
            this._div.style.width=this.config.width+"px";
            this._div.style.height=this.config.height+"px";
            this.parentDom.appendChild(this._div);
        },
        _buildChart:function () {
            this._chart = c.init(this._div);
            this._chart.setOption(defaultOption);
        },
        _buildSeries:function (series) {
            series.forEach(function (item) {
                item['type'] ='bar';
                item['barGap'] ='0';
                item['barWidth']='10'
                for(var i=0;i<item.data.length;i++){
                    if(item.data[i].compared.show){
                        item.data[i]['itemStyle']={
                            borderColor:item.data[i].compared.flag?'#bf4040':'green',
                            borderWidth:2,
                        }
                    }else{
                        item.data[i]['itemStyle']={

                        }
                    }
                }
            })
            return series;
        },
        setData:function (data) {
            if(!data) return;
            var option = this._chart.getOption();
            option.xAxis[0].data = data.xAxisData;
            option.series  = this._buildSeries(data.series);
            option.title[0].text=data.title.text;
            var str = data.title.subtext;
            if(str.length>30){
                var strs = [str.substr(0,str.length/2),str.substr(str.length/2,str.length)];
                option.title[0].subtext= strs.join('\n');
            }else{
                option.title[0].subtext= str;
            }

            this._chart.setOption(option);
        }
    }



    window.HighBar  = HighBar;

})(echarts)