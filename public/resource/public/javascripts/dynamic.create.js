(function($){
	function SyncHTML($dom,settings) {
		this.settings={
			id:'',
			url:'',
			data:{},
			load:function(){
			
			},
			remove:function(){
			
			}
		}
		$.extend(this.settings,settings);
		this.$dom = $dom;
		this.init($dom,this.settings);
	}
	SyncHTML.prototype = {
		$dom:undefined,
		$remove:undefined,
		init:function(){
			var me =this;
			this.$remove = this.$dom.find('.module-remove');
			this.$remove.css({
				'visibility':'hidden',
				'opacity':0
			})
//			this.$dom.append(this.$remove);
			this.$dom.find('.module-thumbnails').css({
				'visibility':'hidden',
				'opacity':0
			});
			this.$dom.find('.body-box').load(me.settings.URL,function(html){
					me.settings.load(html,me.$dom);
    			});
    			this.events();
    			this.$dom.data('syncHTML',this);
		},
		events:function(){
			var me =this;
			this.$remove.off().on('click',function(e){
				e.stopPropagation();
				me.settings.remove(me.$dom);
				me.remove();
			});
		
		},
		remove:function(id){
			
//			this.$remove = this.$dom.find('.module-remove').css({
//				'visibility':'hidden',
//				'opacity':0
//			});
//			this.settings.remove(this.$dom);
			Relevance.removeCheckCard(this.$dom.data('config'));
			this.$dom.find('.module-thumbnails').css({
				'visibility':'visible',
				'opacity':1
			});
			this.$dom.find('.body-box').off('.'+this.settings.id).empty();
		}
		
	}
	
	
	
    $.fn.syncHTML = function(settings){
    
    		return new SyncHTML($(this),settings);
    		
    
    
    }
})(jQuery);