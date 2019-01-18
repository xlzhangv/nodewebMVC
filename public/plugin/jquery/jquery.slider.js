(function($) {
	function Slider(dom,option){ //by aleck
		this.option={
			min:0, //最小值
	    	max:60,//最大值
			decimal : 0, //小数位数
			value:1,
			onChange:function(value){
			
				
				
			}
		}
		$.extend(this.option,option);
	    this.locked = false; //锁定游标    
	  	this.value = this.option.value;
	  	this.oldValue = this.option.value;
	    this.$dom =dom; //滑竿DOM    
	    
	    this.init();
	}
	
	Slider.prototype={
		
		init:function(){
			this.$SliderBody  = $('<div class="slider-body"></div>');
			this.$SliderHandle  =$('<span class="slider-handle"></span>');
			this.$SliderRange = $('<div class="slider-range"></div>');
			this.$SliderText = $('<span class="slider-text">22</span>');
			
			this.$SliderBody.append(this.$SliderHandle).append(this.$SliderRange).append(this.$SliderText);
			this.$dom.append(this.$SliderBody);
			this.scale = (this.option.max-this.option.min)/this.$SliderBody.width(); //滑竿比例尺
			
	        var distance = (this.value-this.option.min)/this.scale;        
	        this.moveHandle(distance);
			
			
			this.events();
		},
		events:function(){
			 this.$SliderHandle.on('mousedown.slider',(this.slide).bind(this)); 
		
		},
		slide:function(ev){
				var me = this;
				if (me.locked) {
					return;
				}
				me.locked = true;
				
				ev.preventDefault();
				ev.stopPropagation();
				
	            var startPoint = ev.clientX;            
	            
	            
				mouseMoveCallback = (function(ev2) {
					
					var distance = ev2.clientX - startPoint;
					startPoint = ev2.clientX;
					var direction;
					if(distance > 0){
						direction='enlarge'
					}else{
						direction='narrow';
					}
	                me.moveChange(distance,direction);
	                
				}).bind(me);
		
				mouseUpCallback = (function(ev2) {
					if (ev2.type === "mouseout" && ev2.target !== ev2.currentTarget) {
						return;
					}
					ev2.preventDefault();
					ev2.stopPropagation();
					$(document).off('.slider');
		
					me.locked = false;
				}).bind(me);
		
				$(document).on("mousemove.slider", mouseMoveCallback);
				$(document).on("touchmove.slider", mouseMoveCallback);
				$(document).on("mouseup.slider", mouseUpCallback);
				$(document).on("touchend.slider", mouseUpCallback);
				$(document).on("touchcancel.slider", mouseUpCallback);
				$(document).on("mouseout.slider", mouseUpCallback);
		},
		moveHandle:function(distance){
			var me =this;
            var nowLeft =  this.$SliderHandle.position().left;
            var newValue = this.option.min+ this.scale * (nowLeft +distance);            
	        if(newValue>=this.option.max){
	           newValue = this.option.max;                
	           nowLeft =me.$SliderBody.width();            
	        }else if(newValue<=this.option.min){    
	            newValue =this.option.min;    
	            nowLeft = 0;            
	        }else{            
	           nowLeft += distance;
	        }   
            this.$SliderHandle.css({
            	left:nowLeft
            });
            this.$SliderText.css({
            	left:nowLeft-this.$SliderText.width()/2
            });
        	this.$SliderRange.width(nowLeft);
        	return newValue;
		},
		
		moveChange:function(distance,direction){
			var newValue = this.moveHandle(distance);
			if(this.value != this.oldValue){
				this.value = this.fixValue(newValue),direction
				this.$SliderText.html(this.value);
				this.option.onChange(this.value,direction);
			}
			this.oldValue = this.fixValue(newValue)
        	
        },
		fixValue:function(num){//根据设置的小数点位数修正数据
        	return parseFloat(num).toFixed(this.option.decimal||0);
    	},
    	setValue:function(num){
	        var oldValue = this.getValue();
	        num =parseFloat(num);
	         if(num>=this.option.max){
	           this.value = this.option.max;                
	         }else if(num<=this.option.min){    
	           this.value =this.option.min;    
	         }else{
	         	 this.value =num;
	         }
	        var distance = (this.value-oldValue)/this.scale;        
	        this.moveHandle(distance);
	        this.$SliderText.html(this.value);
    	},
    	getValue:function(){
    		return this.value;
    	}
	}
	window['Slider']  =Slider;
})(jQuery);
