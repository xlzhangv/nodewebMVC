function AutoSlide(options) {

    var obj = new Object();
    obj.defaultOption = {
        autoTime: 5000,
        loop: false,// 是否循环
        autoSlied: false,
        before:function(){
        
        },
        after:function(){
        	
        }
    };
    if (typeof options === "object") {
        for (var ndx in obj.defaultOption) {
            if (options[ndx] !== undefined) {
                obj.defaultOption[ndx] = options[ndx];
            }
        }
    }

    var $applyBox, $applyBoxWidth;


    obj.render = function ($dom) {
        obj.$dom = $dom;
        $dom.mouseenter(function () {
            $(this).find('.slide-btn').show();
        }).mouseleave(function () {
            $(this).find('.slide-btn').hide();
        });
        obj.boxNumber = $dom.find('.body-box').length;
        for (var i = 0; i < obj.boxNumber; i++) {
            $dom.find('.sign').append('<li class=' + i + '>' + i + '</li>');
        }
        $applyBox = $dom.find('.apply-box');
        $applyBoxWidth = $applyBox.width();
        $applyBox.find('.box').width($applyBoxWidth);
        if (obj.defaultOption.autoSlied) {
            obj.startAuto();
        }
        return obj;
    }
    obj.start = function () {
        obj.startAuto();
    }
    obj.stop = function () {
        obj.stopAuto();
    }
    obj.timeoutId = '';
    obj.autoDirection = "next";
    obj.i = obj.defaultOption.autoTime / 1000;
    obj.pageIndex = 1;
    
    obj.next = function (callback) {
        if (obj.pageIndex < obj.boxNumber) {
            next(callback);
            if (obj.defaultOption.autoSlied) {
                obj.startAuto();
            }
            obj.autoDirection = 'next';
        } else {
            obj.autoDirection = 'prev';
            if (obj.defaultOption.loop) {
                obj.pageIndex = 0;
                next(callback);
            }
        }
    }
    obj.prev = function (callback) {
        if (obj.pageIndex > 1) {
            prev(callback);
            if (obj.defaultOption.autoSlied) {
                obj.startAuto();
            }
            obj.autoDirection = 'prev';
        } else {
            obj.autoDirection = 'next';
            if (obj.defaultOption.loop) {
                obj.pageIndex = obj.boxNumber - 1;
                next(callback);
            }

        }
    }
    var prev = function (callback) {
        if (!$applyBox.is(":animated")) {
            obj.pageIndex--;
            obj.defaultOption.before(obj.pageIndex);
            $applyBox.css({
            	'opacity':.1
            });
            $applyBox.animate({
            	'opacity':1,
                'margin-left': -$applyBoxWidth * (obj.pageIndex - 1)
            }, "slow", function () {
                if (callback) {
                    callback($applyBox);
                }
                 obj.defaultOption.after(obj.pageIndex);
            });
            return false;
        }
    };
    var next = function (callback) {
        if (!$applyBox.is(":animated")) {
        	
        	$applyBox.css({
            	'opacity':.1
            });
            $applyBox.animate({
            	'opacity':1,
                'margin-left': -$applyBoxWidth * (obj.pageIndex)
            }, "slow", function () {
                if (callback) {
                    callback($applyBox);
                }
                obj.defaultOption.after(obj.pageIndex);
            });
            obj.pageIndex++;
            obj.defaultOption.before(obj.pageIndex);
            return false;
        }
    };
    obj.move = function(index,callback){
    	obj.pageIndex = (index);
    	 $applyBox.animate({
        	'opacity':1,
            'margin-left': -$applyBoxWidth * (obj.pageIndex-1)
         }, "slow", function () {
            if (callback) {
                callback($applyBox);
            }
            obj.defaultOption.after(obj.pageIndex);
         });
    	 obj.defaultOption.before(obj.pageIndex);
    	 obj.startAuto();
    }
    obj.auto = function () {
        if (obj.autoDirection == 'next') {
            if (obj.pageIndex < obj.boxNumber) {
                next();
            }
            if (obj.pageIndex == obj.boxNumber) {
                obj.autoDirection = 'prev';
            }
        } else {
            if (obj.pageIndex > 1) {
                prev();
            }
            if (obj.pageIndex == 1) {
                obj.autoDirection = 'next';
            }
        }
    }

    obj.showTime = function (callback) {
//		obj.$dom.find('#timer').html('剩余时间' + obj.i);
        // console.log('剩余时间' + obj.i);
        obj.i--;
        if (obj.i >= -1) {
            obj.timeoutId = setTimeout(function () {
                obj.showTime(callback);
                if (obj.i == -1) {
                    obj.i = obj.defaultOption.autoTime / 1000;
                    callback();
                }
            }, 1000);
        }

    }
    obj.startAuto = function () {
        obj.i = obj.defaultOption.autoTime / 1000;
        clearTimeout(obj.timeoutId);
        obj.showTime(obj.auto);
    }
    obj.stopAuto = function () {
        obj.i = obj.defaultOption.autoTime / 1000;
//		obj.$dom.find('#timer').html('剩余时间' + obj.i);
        clearTimeout(obj.timeoutId);
    }
    return obj;
}
