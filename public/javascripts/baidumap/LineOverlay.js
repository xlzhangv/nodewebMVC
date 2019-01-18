LineOverlay = function (points,color) {
    return this.init(points,color);
}
LineOverlay.prototype.init=function (points,color) {
    var sy = new BMap.Symbol(BMap_Symbol_SHAPE_BACKWARD_OPEN_ARROW, {
        scale: 0.6,//图标缩放大小
        strokeColor:'#fff',//设置矢量图标的线填充颜色
        strokeWeight: '2',//设置线宽
    });

    var polyline =new BMap.Polyline(points, {
        enableEditing: false,//是否启用线编辑，默认为false
        enableClicking: true,//是否响应点击事件，默认为true
        icons:[new BMap.IconSequence(sy, '510', '30')],
        strokeWeight:'2',//折线的宽度，以像素为单位
        strokeOpacity: 0.8,//折线的透明度，取值范围0 - 1
        strokeColor:(color||"#18a45b") //折线颜色
    });

    return polyline;

}