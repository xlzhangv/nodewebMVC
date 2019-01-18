/**
 * 数字翻转动画 扩展
 */
(function(d3) {

	// 拷贝对象
	function objCopy(result, source) {
		for (var key in source) {
			var copy = source[key];
			if (source === copy)
				continue; // 如window.window === window，会陷入死循环，需要处理一下
			if (is(copy, "Object")) {
				result[key] = arguments.callee(result[key] || {}, copy);
			} else if (is(copy, "Array")) {
				result[key] = arguments.callee(result[key] || [], copy);
			} else {
				result[key] = copy;
			}
		}

		return result;

		function is(obj, type) {
			var toString = Object.prototype.toString;
			return (type === "Null" && obj === null)
					|| (type === "Undefined" && obj === undefined)
					|| toString.call(obj).slice(8, -1) === type;
		}
	}

	/**
	 * option:配置项<br>
	 * startVal 开始数字 <br>
	 * endVal 结束数字 <br>
	 * decimals 小数点位数 默认是0 <br>
	 * duration 动画持续时间,默认是2 单位秒 <br>
	 * useEasing true, 缓慢切换 <br>
	 * duration 1000 持续时间<br>
	 * delay 0 延迟时间
	 * useGrouping true, 分组 1000000 -->1,000,000<br>
	 * prefix 前缀<br>
	 * suffix 后缀<br>
	 * formatter:funtion(v,obj) 格式化函数 默认为使用自带格式化 <br>
	 * 
	 * 示例:<br>
	 * var tn1 = new D3TurnNum('#a1');<br>
	 * tn1.update(Math.random()*999999);<br>
	 */

	function D3TurnNum(selector, option) {

		var me = this;
		this.options = {
			startVal : 0,
			endVal : 0,
			delay : 0,
			useEasing : true,
			useGrouping : true, // 1,000,000 vs 1000000
			separator : ',', // 分隔符的字符
			decimal : '.',
			duration : 1000,
			formatter : undefined
		};
		this.options = objCopy(this.options, option);
		if (this.options.separator === '')
			this.options.useGrouping = false;
		if (!this.options.prefix)
			this.options.prefix = '';
		if (!this.options.suffix)
			this.options.suffix = '';
		this._d3selection = d3.selectAll(selector);

		this.initConfig(this.options);
	}

	D3TurnNum.prototype = {
		_d3selection : undefined,
		_interpolate : undefined,
		numberTurn : function(option) {

		},
		initConfig : function(option) {
			this.lastTime = 0;
			this.options.startVal = Number(option.startVal);
			if (isNaN(option.startVal))
				this.options.startVal = Number(option.startVal.match(/[\d]+/g)
						.join('')); // strip non-numerical characters
			this.options.endVal = Number(option.endVal);
			if (isNaN(option.endVal))
				this.options.endVal = Number(option.endVal.match(/[\d]+/g)
						.join('')); // strip non-numerical characters
			this.options.countDown = (option.startVal > option.endVal);
			this.options.frameVal = option.startVal;
			this.options.decimals = Math.max(0, option.decimals || 0);
			this.options.dec = Math.pow(10, option.decimals);
			this.options.duration = Number(option.duration);
			this.options.delay = Number(option.delay);
		},
		_ease : function(k) {
			if ((k *= 2) < 1) {
				return -0.5 * (Math.sqrt(1 - k * k) - 1);
			}
			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
		},
		_buildTransition : function() {
			return this._d3selection.transition().delay(this.options.delay).duration(this.options.duration).ease(this._ease);
		},
		_updateInterpolate : function() {
			this._interpolate = d3.interpolate(this.options.startVal,
					this.options.endVal);
		},
		start:function(){
			return this.update(0);
		},
		update : function(newEndVal, callback) {
			var me = this;
			if (typeof newEndVal === "function") {
				me.options.endVal = newEndVal(me);
			} else {
				me.options.endVal = Number(newEndVal);
			}
			this._updateInterpolate();
			if (!isNaN(me.options.endVal) && !isNaN(me.options.startVal)) {
				this._buildTransition().tween("html", function() {
					var dom = this;
					return function(t) {
						dom.innerHTML = me.options.formatter ? me.options
								.formatter(me._interpolate(t), me) : me
								._formatNumber(me._interpolate(t));
						dom.value = me.options.formatter ? me.options
								.formatter(me._interpolate(t), me) : me
								._formatNumber(me._interpolate(t));
					}
				});
				me.options.startVal = me.options.endVal;
			} else {
				console
						.log('countUp error: startVal or endVal is not a number');
			}
			return this;
		},
		_formatNumber : function(nStr) {
			var me = this;
			nStr = nStr.toFixed(me.options.decimals);
			nStr += '';
			var x, x1, x2, rgx;
			x = nStr.split('.');
			x1 = x[0];
			x2 = x.length > 1 ? me.options.decimal + x[1] : '';
			rgx = /(\d+)(\d{3})/;
			if (me.options.useGrouping) {
				while (rgx.test(x1)) {
					x1 = x1.replace(rgx, '$1' + me.options.separator + '$2');
				}
			}
			return me.options.prefix + x1 + x2 + me.options.suffix;
		}
	}
	window.D3TurnNum = D3TurnNum;
})(d3);
