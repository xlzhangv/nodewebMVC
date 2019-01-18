$(function () {
    function bgColor(w) {
        if (w.top === w.self) { // are you trying to put self in an iframe?
        } else {
            $('body,html').css('background', 'none transparent');
        }
    }

    bgColor(window);

    $('.panel-body').each(function (index, dom) {
        var $other = $(dom).siblings();
        var otherH = 0;
        $other.each(function (index, o_dom) {
            otherH += $(o_dom).outerHeight();
        });
        var $parent = $(dom).parent();

        $(dom).outerHeight($parent.height() - otherH);
    });
    window['panelLayout'] = function (callback) {
        $('.panel-body').each(function (index, dom) {
            var $other = $(dom).siblings();
            var otherH = 0;
            $other.each(function (index, o_dom) {
                otherH += $(o_dom).outerHeight();
            });
            var $parent = $(dom).parent();

            $(dom).outerHeight($parent.height() - otherH);
        });
        if (callback)
            setTimeout(callback)
    }
})