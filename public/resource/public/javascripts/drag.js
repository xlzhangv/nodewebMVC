(function($, d3) {

	var DraggableDrag = {

		init : function() {
			this.buildDrag();
			this.events();
		},
		events : function() {
			d3.select('.draggable-title').call(this.drag);
		},
		buildDrag : function() {
			this.drag = d3.drag().on('start', function(d) {
						var cloneItemBar = $('<div class="temp" style="border:1px solid #ccc;">');
						
						$('body').append(cloneItemBar);
						var offset = $(this).parent().offset();
						this.tempNode = cloneItemBar.css({
									position : 'fixed',
									'opacity' : '.8',
									'z-index' : 99,
									width:$(this).parent().width(),
									height:$(this).parent().height(),
									left : offset.left,
									top : offset.top
								});
						this.offset = offset;
						var point = d3.event;// me.getCoordinatesFromEvent(me.$svg[0],
						// d3.event);
						this.startX = point.x;// 兼容所有
						this.startY = point.y;
					}).on('drag', function(d) {
						var point = d3.event;// me.getCoordinatesFromEvent(me.$svg[0],
						// d3.event);
						var top = point.y - this.startY + this.offset.top;
						var left = point.x - this.startX + this.offset.left;
						if(top<1){
							return;
						}
						this.tempNode.css({
									top : top,
									left : left
								});
				
				}).on('end', function(d) {
	
					$(this).parent().css({
						left : this.tempNode.css('left'),
						top : this.tempNode.css('top')
					});
					this.tempNode.remove();
					
				});

		}

	}

	$(function() {
				DraggableDrag.init();
			})
})(jQuery, d3);