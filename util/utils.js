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
    
    for ( ; i < length; i++ ) {
        // Only deal with non-null/undefined values
        if ( (source = arguments[ i ]) != null ) {
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
global.objCopy = objCopy;

