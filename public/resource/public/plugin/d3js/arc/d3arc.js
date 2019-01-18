function D3arc(selection,settings) {
        this.settings={
            border:2,
            borderColor:'',
            color:'',
            radius : [20, 110],
            center : [0.25, 0.5],
            startAngle:0
        }
        this.settings = settings;
        this.init(selection);
}
D3arc.prototype={
    height:0,
    width:0,
    init:function (selection) {
        this.dom = selection.node();
        this.roundg = selection.append('g');
        this.round =this.roundg.append("path")
            .datum({endAngle: 0 * Math.PI})
            .style("fill", this.settings.color);
        this.layout();
        this.__scaleLinear();
        this.buildArc();
        this.buildBorder();
        this.buildText()

    },
    _buildCenter:function(){
        var center = {
            'transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)",
            '-ms-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", 	/* IE 9 */
            '-moz-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", 	/* Firefox */
            '-webkit-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)", /* Safari 和 Chrome */
            '-o-transform':"translate(" + this.width*this.settings.center[0] + "px," + this.height*this.settings.center[1] + "px)" 	/* Opera */
        }
        for (var k in center){
            this.roundg.style(k,center[k]);
        }

    },
    layout:function () {
        this.width = this.dom.clientWidth,
         this.height = this.dom.clientHeight;
        this._buildCenter();
    },
    buildBorder:function () {
        var me =this;
        var bacarc = d3.arc()
            .innerRadius(this.settings.radius[1])
            .outerRadius(this.settings.radius[1]+this.settings.border)
            .startAngle(0)
            .endAngle(2*Math.PI);
        this.centroid = bacarc.centroid();
        this.roundg.append('path').attr('class','circle-border').style('fill',function () {
            if(me.settings.borderColor) return me.settings.borderColor;
            var c = d3.color(me.settings.color);
            c.opacity = 1;
            return c.toString();
        }).attr('d',bacarc);
    },
    buildText:function () {
        var me =this;

        this.topText = this.roundg.append('text').attr('class','top-text').attr('x',function () {
            return me.centroid[0]-this.getComputedTextLength()/2;
        }).attr('y',function () {
            return 0
        });
        this.centerText = this.roundg.append('text').html('&nbsp;').attr('class','center-text').attr('x',function () {
            return me.centroid[0]-this.getComputedTextLength()/2;
        }).attr('y',function () {
            return 0-this.getBoundingClientRect().height/2*0.7;
        });
        this.bottomText = this.roundg.append('text').attr('class','bottom-text').attr('x',function () {
            return me.centroid[0]-this.getComputedTextLength()/2;
        }).attr('y',function () {
            return 0
        });
    },
    wrapWord:function (dom, text, separator, align) {
        var ddom = d3.select(dom),
            words = text.split(separator),
            lineNumber = 0,
            chartL = dom.getComputedTextLength(),
            lineHeight = dom.getBoundingClientRect().height,
            lineW = dom.getBoundingClientRect().width / chartL,
            x = +ddom.attr('x'),
            y = +ddom.attr('y');
        ddom.text(null);
        for (var i = 0; i < words.length; i++) {
            ddom.append('tspan').attr('x', x).attr('y', lineNumber++ * lineHeight + y).text(words[i]);
        }
        ddom.selectAll('tspan').attr('x', function () {
            if (align == 'right') {
                return (this.getBBox().width - lineW * this.getComputedTextLength()) + 'px';
            } else if (align == 'left') {
                return 0;
            } else {
                return (this.getBBox().width - lineW * this.getComputedTextLength()) / 2 + 'px';
            }

        })
        return ddom.node().innerHTML;
    },
    updateText:function(d){
        var me =this;
        this.topText.html(d.topval).attr('dy', '0.71em').attr('x',function () {
            var chartW =this.getBoundingClientRect().width / this.getComputedTextLength();
            return me.centroid[0]-chartW*this.getComputedTextLength()/2;
        }).attr('y',function () {
            return parseFloat(me.centerText.attr('y'))-me.centerText.node().getBoundingClientRect().height;
        });
        this.centerText.html(d.centerval).attr('dy', '0.71em').attr('x',function () {
            var chartW =this.getBoundingClientRect().width / this.getComputedTextLength();
            return me.centroid[0]-chartW*this.getComputedTextLength()/2;
        });

        this.bottomText.html(d.bottomval).attr('dy', '0.71em').attr('x',function () {
            var chartW =this.getBoundingClientRect().width / this.getComputedTextLength();
            return me.centroid[0]-chartW*this.getComputedTextLength()/2;
        }).attr('y',function () {
            return parseFloat(me.centerText.attr('y'))+ me.centerText.node().getBoundingClientRect().height;
        });;

    },
    setValue:function (d) {
        this.round .transition()
            .duration(750)
            .attrTween("d", this.arcTween(this.__arcScale(d.value)));
        this.updateText(d);
    },
    __arcScale:undefined,
    __scaleLinear:function(){
        this.__arcScale =  d3.scaleLinear().domain([0, 100]).range([0, 2*Math.PI]);

    },
    buildArc:function () {

        this.arc = d3.arc()
            .innerRadius(this.settings.radius[0])
            .outerRadius(this.settings.radius[1])
            .startAngle(0);
    },
    arcTween:function (newAngle) {
        var me =this;
        return function(d) {

            var interpolate = d3.interpolate(d.endAngle, newAngle);

            return function(t) {

                d.endAngle = interpolate(t);

                return me.arc(d);
            };
        };
    }
}