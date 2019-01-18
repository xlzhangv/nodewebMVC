(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';
	
	var rho = Math.SQRT2;
	var rho2 = 2;
	var rho4 = 4;
	var epsilon2 = 1e-12;
	
	function cosh(x) {
	  return ((x = Math.exp(x)) + 1 / x) / 2;
	}
	
	function sinh(x) {
	  return ((x = Math.exp(x)) - 1 / x) / 2;
	}
	
	function tanh(x) {
	  return ((x = Math.exp(2 * x)) - 1) / (x + 1);
	}
	// p0 = [ux0, uy0, w0]
	// p1 = [ux1, uy1, w1]
	var interpolateZoom = function(p0, p1) {
	  var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
	      ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
	      dx = ux1 - ux0,
	      dy = uy1 - uy0,
	      d2 = dx * dx + dy * dy,
	      i,
	      S;
	var k = d3.scaleLinear()
	    .domain([0, 1])
	    .range([w0,w1]);
 	var opacity = d3.scaleLinear()
	    .domain([0, 1])
	    .range([0.4,1]);
	var zx = d3.scaleLinear()
	    .domain([0, 1])
	    .range([ux0, ux1]); 
	var zy = d3.scaleLinear()
	    .domain([0, 1])
	    .range([uy0, uy1]); 
	  // Special case for u0 ≅ u1.
	  if (d2 < epsilon2) {
	    S = Math.log(w1 / w0) / rho;
	    i = function(t) {
	      return [
	        ux0 + t * dx,
	        uy0 + t * dy,
	        w0 * Math.exp(rho * t * S)
	      ];
	    };
	  }
	
	  // General case.
	  else {
//	    var d1 = Math.sqrt(d2),
//	        b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
//	        b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
//	        r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
//	        r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
//	    S = (r1 - r0) / rho;
	    i = function(t) {
//	      var s = t * S,
//	          coshr0 = cosh(r0),
//	          u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
	      return [
	        zx(t),
	        zy(t),
	        k(t),
	        opacity(t)
	      ];
	    };
	  }
	
	  i.duration = S * 1000;
	
	  return i;
	};
	exports.interpolateZoom = interpolateZoom;
})));
