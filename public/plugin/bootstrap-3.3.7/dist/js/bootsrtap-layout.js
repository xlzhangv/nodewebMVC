(function($){
	 function panelLayout(callback) {
        $('.panel-body').each(function (index, dom) {
            var $other = $(dom).siblings();
            var otherH = 0;
            $other.each(function (index, o_dom) {
                if($(o_dom).css('position')=='absolute') return;
                otherH += o_dom.getBoundingClientRect().height
            });
            var $parent = $(dom).parent(),parentHeight = $parent[0].getBoundingClientRect().height

            $(dom).outerHeight(parentHeight - otherH);
        });
        if (callback)
            setTimeout(callback)
    }
    panelLayout();
    window['panelLayout'] = panelLayout
})(jQuery);

$(function () {
   
})