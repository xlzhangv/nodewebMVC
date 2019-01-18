+(function() {
	
	var package = {
	scripts : [
			'/resource/public/plugin/websocket/reconnecting-websocket.js',
			'/resource/public/plugin/threejs/three.js',
			'/resource/public/plugin/threejs/tween.js',
			'/resource/public/plugin/threejs/ThreeGeoJSON.min.js',
			'/resource/public/plugin/threejs/TrackballControls.js',
			'/resource/public/plugin/threejs/GeoWebGLMap.min.js'],
	d3scripts:[
	'/resource/public/plugin/websocket/reconnecting-websocket.js',
	'/resource/public/plugin/d3js/d3-selection-multi.v0.4.min.js',
	'/resource/public/plugin/d3js/d3-scale-chromatic.v1.min.js',
	'/resource/public/plugin/d3js/map/WordMap2d.js'
	],
	readyScripts : [],
	links : ['/bigdata/map.css']

}
	
	// TODO
	var __TODO = function(d, len, i, callback, end) {
		if (i < len) {
			__createScript(_getContextPath+d, callback);
		} else {
			end();
		}
	}

	function building(data, end) {
		var i = 0, len = data.length;
		return (function fn() {
			__TODO(data[i], len, i, function() {
						fn();
					}, end);// 循环体要做的操作
			i++;
		})();
	}

	function __createLink(src) {
		var link = document.createElement("link");
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = src;
		document.head.appendChild(link);
	}

	for (var index = 0; index < package.links.length; index++) {
		__createLink(_getContextPath+package.links[index]);
	}

	

	function __createScript(src, callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = src;
		script.onload = function scriptLoad() {
			if (callback) {
				callback();
			}
		}
		script.onerror = function scriptError() {
			if (callback) {
				callback();
			}
		}

		document.head.appendChild(script);
	}
	
	function MapUtil(events){
		var events={
			webgl:events.webgl?events.webgl:function(){
			},
			createWebGL:events.createWebGL?events.createWebGL:function(){
			
			},
			createD3:events.createD3?events.createD3:function(){
			}
		}
		
		
		this.init(events);
	
	}
	
	MapUtil.prototype={
	
		init:function(events){
		
			if (Detector.webgl ) {  
			    building(package.scripts, function() {
			    			events.createWebGL(GeoWebGLMap);
					});
			}else{
				events.webgl(false,"您的浏览器不支持webGL，请使用chrome最新版本浏览器！");
				building(package.d3scripts, function() {
						events.createD3(Map2d);
					});
			}
			return this;
		}
	
	}
	
	window.MapUtil=MapUtil
})();