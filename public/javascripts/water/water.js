
(function($) {
	 var requestAnimationFrame =  window.requestAnimationFrame || 
		            window.mozRequestAnimationFrame || 
		            window.webkitRequestAnimationFrame || 
		            window.msRequestAnimationFrame ||
		            function(callback) {
						window.setTimeout(callback, 1000 / 60);
					};
	 //1-0 越大越好   
	function switchColor(value){
		if(value>=0.8){
			//rgba(118, 180, 245, 0.52)
			return{
				text:'优',
				color:'rgba(136, 228, 194,0.9)'
			}
		}
		else if(value<0.8&&value>=0.6){
			return{
				text:'良',
				color:'rgba(255, 204, 0, 0.9)'
			}
		
		}else{
			//rgba(228, 188, 76, 0.52)
			return{
				text:'差',
				color:'rgba(163, 32, 38, 0.9)'
			}
		}
	}    
	    
    $.fn.waterbubble = function(options) {
            var config = $.extend({
            	width:75,
            	height:75,
                value: 0,
                waterColor: 'rgba(136, 228, 194,0.8)',
                textColor: 'rgba(06, 85, 128, 1)'
            }, options);
			
            var waterbubble = new Waterbubble(this, config);
            return waterbubble;
        }
        

        function Waterbubble ($dom, config) {
            this.$dom = $dom;
            this.css(config);
            this._init(config);
            this.start();
        }

        Waterbubble.prototype = {
			value:0,
			text:'',
			Ysteep:0.5,
            Xsteep:1,
            waveXStart:0.5,
            updated:undefined,
            css:function(config){
            	this.$dom.css({
            		'left':0,
			    	'top':0,
			    	'margin': '0 auto',
			    	'width':config.width,
			    	'height':config.height,
				    'overflow': 'hidden',
				    'border-radius': '50%',
				    'background-color': 'rgba(255,203,103,0)',
				    'text-align': 'center',
				    'vertical-align': 'middle'
            	});
            },
            buildCache:function(){
            	this.cache_canvas = document.createElement("canvas");
            	this.cache_canvas.setAttribute('id','water-cache')
				this.cache_canvas.width = this.canvasWidth;
				this.cache_canvas.height =this.canvasHeight;
				this.cache_context = this.cache_canvas.getContext("2d");
            },
            _init: function (config){
            		var me =this;
            		this.updated = config.updated;
               		this.value = config.value;
			        var canvas = document.createElement('canvas');
			        if (!canvas.getContext) return;
			        this.ctx = canvas.getContext('2d');
			        this.canvasWidth = this.$dom.width();
			        this.canvasHeight =this.$dom.height();
			        canvas.setAttribute('width', this.canvasWidth);
			        canvas.setAttribute('height', this.canvasHeight);
//			        canvas.style.position="absolute";
//			        canvas.style.top="0";
			        canvas.style['border-radius']="50%";
			        this.$dom.append(canvas);
			        this.buildCache();
			        this._drawText();
//			        this.waveImage = new Image();
//			        this.waveImage.onload = function () {
//			            me.waveImage.onload = null;
////			            callback();
//			        }
			      
			    	this.$dom.css({
			    		'background-color': config.waterColor
			    	});
			    	if(this.updated){
			    		this.updated({
			    			color:config.waterColor
			    		});
			    	}
			    	this.waveX = this.waveXStart;
			        this.waveY = -10;
			        this.waveX_min = parseInt(-this.canvasWidth * 2.72);
			        this.buildWaveYMax(me.value);
            	
            },
            buildWaveYMax:function(value){
            	this.waveY_max = this.canvasHeight * (1-value);
            },
            buildCacheText:function(){
            	this.cache_context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
             	var size = 0.5* this.canvasHeight/2;
                this.cache_context.font = 'bold  ' + size + 'px Microsoft Yahei';
//
                var sy = this.canvasHeight/2 + size /2;
                var sx = this.canvasWidth/2 - this.cache_context.measureText(this.text).width/2

                this.cache_context.fillStyle = '#fff';
                this.cache_context.fillText(this.text, sx, sy);
                this.ctx.drawImage(this.cache_canvas, 0, 0);
            	
            },
             _drawText: function () {
             	var me =this;
                me.ctx.globalCompositeOperation = 'source-over';

                var size = 0.5*me.canvasHeight/2;
                me.ctx.font = 'bold  ' + size + 'px Microsoft Yahei';

                var sy = this.canvasHeight/2 + size /2;
                var sx = this.canvasWidth/2 - me.ctx.measureText(me.text).width/2

                me.ctx.fillStyle = '#fff';
                me.ctx.fillText(me.text, sx, sy);
                me.ctx.drawImage(this.cache_canvas, 0, 0);
            },
		    animateWave:function(){
            	var me =this;
            	var waveWidth = this.canvasWidth * 6,
				    offset = 0,
				    waveHeight = 6,
				    waveCount = 5,
				    startY = 0,
				    waveW = waveWidth / waveCount,
				    d = waveW / 2,
				    hd = d / 2;
					me.waveXStart = -1 * (waveCount/2) *this.canvasWidth;
					
			d3.timer(function() {
				    offset -= 2;
				    if(me.waveY < me.waveY_max) me.waveY +=me.Ysteep;
				    if(me.waveY > me.waveY_max) me.waveY -=me.Ysteep;
				    
				    if (-1 * offset >= waveW) offset = 0;
				    
				    me.ctx.clearRect(0, 0, me.canvasWidth, me.canvasHeight);
				  
				    me.ctx.beginPath();
				    me.buildCacheText();
				    me.ctx.moveTo(me.waveXStart - offset, me.waveY);
					
				    for (var i = 0; i < waveCount; i++) {
				        var dx = i * waveW;
				        var offsetX = dx + me.waveXStart - offset;
				         me.ctx.quadraticCurveTo(offsetX + hd, me.waveY + waveHeight, offsetX + d, me.waveY);
				         me.ctx.quadraticCurveTo(offsetX + hd + d, me.waveY - waveHeight, offsetX + waveW, me.waveY);
				    }
				     me.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
				     me.ctx.lineTo(me.waveXStart + waveWidth, startY);
				     me.ctx.lineTo(me.waveXStart, startY);
				     me.ctx.fill();
				     me.ctx.globalCompositeOperation = 'source-over';
				   
				});
            	
            },
            plus:true,
		    decline:function(){
		    	var me =this;
		    	me.ctx.clearRect(0, 0, me.canvasWidth, me.canvasHeight);
		    	this._drawText();
		    	this.ctx.drawImage(this.waveImage,this.waveX, this.canvasHeight - this.waveY);
		    	if (me.waveX < me.waveX_min) me.waveX =  me.waveXStart; else me.waveX -=  me.Xsteep;
		    	if(this.waveY>this.waveY_max){
		    		this.waveY-=me.Ysteep;
		    		requestAnimationFrame(function(){
		    			me.decline();
		    		});
		    	}
		    },
		    updateText:function(text){
		    	this.text =text;
		    	this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		    	this.buildCacheText(c.text);
		    },
		    updateImage:function(value){
		    	this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
		    	var c = switchColor(value);
		    	if(this.updated){
		    		this.updated(c);
		    	}
		    	this.text =c.text;
		    	this.buildCacheText();
		    	this.$dom.css({
		    		'background-color': c.color
		    	});
		    	this.fillColor=c.color;
		    	this.waveImage.src = c.src//'wave.png';
		    	this.value =parseFloat(value);
		    	
		    	this.buildWaveYMax(value);
		    	this.waveY_max = this.canvasHeight * (value);
		    	
		    	if(this.waveY > this.waveY_max){
		    		this.decline();
		    	}
		    	
		    	
		    },
		    update:function(value){
		    	var c = switchColor(value);
		    	if(this.updated){
		    		this.updated(c);
		    	}
		    	this.text =c.text;
		    	this.buildCacheText();
		    	this.$dom.css({
		    		'background-color': c.color
		    	});
		    	this.fillColor=c.color;
		    	this.value =parseFloat(value);
		    	this.buildWaveYMax(value);
		    },
		    start:function  () {
		    	var me =this;
		        if (!this.ctx) 
		        	return this._init(start);
		        this.needAnimate = true;
		        setTimeout(function () {
		            if (me.needAnimate) me.animateWave();
		            
		        }, 500);
		    },
		    stop:function  () {
		        this.needAnimate = false;
		    }
        }
}(jQuery));

	