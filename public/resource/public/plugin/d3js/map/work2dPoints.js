var bezier = function(x1, y1, x2, y2, h) {
	var slopy, cosy, siny;
	var Par = 2;
	var x3, y3;
	slopy = Math.atan2((y1 - y2), (x1 - x2));
	cosy = Math.cos(slopy);
	siny = Math.sin(slopy);
	x3 = (Number(x1) + Number(x2)) / 2;
	y3 = (Number(y1) + Number(y2)) / 2;
	return {
		x : (Number(x3) + Number(Par * cosy + Par / 2.0 * siny)),
		y : (Number(y3) - Number(Par / 2.0 * cosy - Par * siny)) - 70
	};
};
var quadraticCurvePath = function(x1, y1, x2, y2, t, center) {

	var cx = x1 + (center.x - x1) * t;
	var cy = y1 + (center.y - y1) * t;
	var c2x = center.x + (x2 - center.x) * t;
	var c2y = center.y + (y2 - center.y) * t;
	var tx = cx + (c2x - cx) * t;
	var ty = cy + (c2y - cy) * t;
	return {
		cx : cx,
		cy : cy,
		tx : tx,
		ty : ty
	}
}

var interpolating = function(d){
	var pointList=[];
	var t = 0;
	var center=bezier(d.x1,d.y1,d.x2,d.y2);
	var sp = function(d){
		var coordinate =  quadraticCurvePath(d.x1,d.y1,d.x2,d.y2,t,center);
    	if (t > 1) {
    		return pointList;
        }else{
        	t += 0.03 ;
        	pointList.push([coordinate.tx,coordinate.ty]);
        	sp(d);
        }
	}
	sp(d);
	return pointList;
}


addEventListener("message", function(event) {
			event.data.pointList = interpolating(event.data);
			postMessage(event.data);
		}, false);
