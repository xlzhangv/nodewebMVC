(function() {
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

	// type:app、protocol、province、ip
	window.Relevance = {
		exclude:undefined,
		ModuleCards : [],
		_allType : {},
		CheckedModuleCards : {},
		_buildTypes : function() {
			for (var i = 0; i < this.ModuleCards.length; i++) {
				this._allType[this.ModuleCards[i].TYPE] = this.ModuleCards[i];
			}
		},
		addCard : function(card) {

			this.ModuleCards.push(card);
			this._buildTypes();
		},
		// 查找最大的index
		findMaxIndex : function() {
			var indexs = [];
			for (var k in this.CheckedModuleCards) {
				indexs.push(this.CheckedModuleCards[k].index);
			}
			return Math.max.apply(null, indexs);
		},
		// 查找相同type类型的index值
		findCheckedByType : function(TYPE) {
			for (var k in this.CheckedModuleCards) {
				if (this.CheckedModuleCards[k].TYPE == TYPE) {
					return this.CheckedModuleCards[k];
				}
			}
			return undefined;
		},
		// 通过id查找card config
		findCardById : function(ID) {
			for (var i = 0; i < this.ModuleCards.length; i++) {
				if (this.ModuleCards[i].ID == ID) {
					return this.ModuleCards[i];
				}
			}
			return undefined;

		},
		// 查找小于index 的参数
		findParamByIndex : function(index) {
			// 参数集合
			var param = {};
			for (var k in this.CheckedModuleCards) {
				if (this.CheckedModuleCards[k].index <= index) {
					if (this.CheckedModuleCards[k].selected) {
						param[this.CheckedModuleCards[k].TYPE] = this.CheckedModuleCards[k].selected;
					}
				}
			}
			return param;
		},
		// 新增更新关联条件card
		updateRelevanceCard : function(card, callback) {
			var check = this.findCheckedByType(card.TYPE), index = check
					? check.index
					: -1;
			card.params = check ? check.params : {};
			card.index = index;
			card.otherparams = check ? check.otherparams : {};
			if (callback)
				callback(card, this);
			// card.$dom.find('.body-box').html(JSON.stringify(card.params));
		},
		updateConfigByType : function(card, index, selected, params) {
			for (var i = 0; i < this.ModuleCards.length; i++) {
				if (this.ModuleCards[i].TYPE == card.TYPE) {
					// TODO 不在选中type 增加筛选条件
					this.ModuleCards[i].index = index;
					if (selected) {
						card.selected = selected;
						this.ModuleCards[i].selected = selected;
					}
					if (params) {
						card.params = params;
					}
				} else {
					if (!this.findCheckedByType(this.ModuleCards[i].TYPE)) {
						this.ModuleCards[i].index = index + 1;
					}

				}
			}
			card.index = index;
		},
		updateRelevanceCardParams : function(card, index) {
			var me = this;
			for (var i = 0; i < this.ModuleCards.length; i++) {
				if (this.ModuleCards[i].TYPE == card.TYPE) {
					// TODO 不在选中type 增加筛选条件
					var prev = this.findParamByIndex(index);
					objCopy(this.ModuleCards[i].params, prev);
					// this.CheckedModuleCards[card.TYPE].params
					// TODO 触发自身卡片的方法。
					this._updateRelevancePath(this.ModuleCards[i].$dom,
							this.ModuleCards[i].params);
					this._tiggerCard(this.ModuleCards[i]);
				}
			}
		},
		refreshCardParams : function(p,exclude) {
			var next = true;
			for (var i = 0; i < this.ModuleCards.length; i++) {
				if(exclude){
					if(!exclude(this.ModuleCards[i])){
						next = false;
					}else{
						next = true;
					}
				}
				if(next){
					if (p.params) {
						$.extend(this.ModuleCards[i].params, p.params);
					}
					if (p.otherparams) {
						$.extend(this.ModuleCards[i].otherparams, p.otherparams);
					}
					this._tiggerCard(this.ModuleCards[i]);
				}
				
			}
		},
		_tiggerCard : function(card) {
			var next = true;
			if(this.exclude){
				if(!this.exclude(card)){
					next = false;
				}else{
					next = true;
				}
			}
			setTimeout(function(){
				if (card && Share.data(card.ID)&&next) {
					var params = {};
					for (var k in card.params) {
						params[k] = card.params[k].value
					}
					Share.data(card.ID).setData($.extend({}, params,card.otherparams),card);
				}
			},100);
			
		},
		_updateRelevancePath : function($dom, params) {
			var me = this;
			var btns = $('<div class="relevance-path">'), btn;
			for (var k in params) {

				btn = $('<button title="{name}" class="btn btn-primary btn-xs relevance-btn  "><span class="ellipsis">{name}</span></button>'
						.format(params[k]));
				btn.data('type', k);
				btn.on('click.relevance', function() {
							me.uncheckedRelevance($(this).data('type'));
						});
				btns.append(btn);
			}
			$dom.find('.relevance-path').replaceWith(btns);

		},
		removeCheckCard : function(card) {
			for (var index = 0; index < Relevance.ModuleCards.length; index++) {
				if (Relevance.ModuleCards[index].ID == card.ID) {
					Relevance.ModuleCards.splice(index, 1);
					card.$dom.find('.relevance-path').off('.relevance').empty();
				}
			}
			this._buildTypes();
		},
		uncheckedRelevance : function(TYPE) {

			if (TYPE == true) {
				for (var i = 0; i < this.ModuleCards.length; i++) {
					this.ModuleCards[i].$dom.removeClass('first-card')
					this.ModuleCards[i].params = {};
				}
				this.CheckedModuleCards = {};
			} else {
				var check = this.findCheckedByType(TYPE), index = check
						? check.index
						: -1;
				for (var i = 0; i < this.ModuleCards.length; i++) {
					if (index == 0) {
						this.ModuleCards[i].$dom.removeClass('first-card')
						this.ModuleCards[i].params = {};
						this._tiggerCard(this.ModuleCards[i]);
					} else {
						if (this.ModuleCards[i].params[TYPE]) {
							delete this.ModuleCards[i].params[TYPE];
							this._tiggerCard(this.ModuleCards[i]);
						}
						if (this.ModuleCards[i].TYPE == TYPE) {
							Share.data(this.ModuleCards[i].ID).reset();
						}
					}
					this._updateRelevancePath(this.ModuleCards[i].$dom,
							this.ModuleCards[i].params)
				}

				if (index == 0) {
					this.CheckedModuleCards = {};
				} else {
					delete this.CheckedModuleCards[TYPE];
				}

			}

		},
		copyParamsById : function(ID) {
			var otherCard = false;
			var card = this.findCardById(ID);
			card.$dom.find('.analysis-bar-title')
					.append('<div class="relevance-path"></div>');
			if (!card)
				return;
			var check = this.findCheckedByType(card.TYPE), index = check
					? check.index
					: -1;

			if (check) {
				this.updateConfigByType(card, index, check.selected);
			} else {
				for (var i = 0; i < this.ModuleCards.length; i++) {
					if (this.ModuleCards[i].TYPE == card.TYPE) {
						if (this.ModuleCards[i].index != -1) {
							otherCard = true;
							index = this.ModuleCards[i].index;
							this.updateConfigByType(card, index,
									this.ModuleCards[i].selected,
									this.ModuleCards[i].params);
							break;
						}
					}
				}
				if (otherCard == false) {
					var index = this.findMaxIndex() + 2;
					var prev = this.findParamByIndex(index);
					objCopy(card.params, prev);
				}
			}
			this._updateRelevancePath(card.$dom, card.params);
			this._tiggerCard(card);
		},
		// 选中关联
		checkedCard : function(ID, selected) {
			var card = this.findCardById(ID);
			var check = this.findCheckedByType(card.TYPE), index = check
					? check.index
					: -1;
			if (Constants.empty(this.CheckedModuleCards)) {
				// TODO 起点设置高亮框

				index = 0;
			} else {
				if (index == -1) {
					index = (this.findMaxIndex() + 1);
				}
			}
			if (this.CheckedModuleCards[card.TYPE]
					&& card.ID != this.CheckedModuleCards[card.TYPE].ID) {
				// TODO 第一个选中样式切换
				Share.data(this.CheckedModuleCards[card.TYPE].ID).reset();
				this.CheckedModuleCards[card.TYPE].$dom
						.removeClass('first-card');
			}
			if (index == 0) {
				// 起点设置高亮框
				card.$dom.addClass('first-card');
			}
			// TODO 更新筛选条件
			this.updateConfigByType(card, index, selected);

			// 设置链对应位置新的卡
			this.CheckedModuleCards[card.TYPE] = card;
			// 不在选中type 增加筛选条件

			for (var TYPE in this._allType) {
				if (!this.CheckedModuleCards[TYPE]) {
					// TODO 不在选中type 增加筛选条件
					this.updateRelevanceCardParams(this._allType[TYPE], index);
				}
			}

			for (var TYPE in this._allType) {
				if (this.CheckedModuleCards[TYPE]) {
					if (index < this._allType[TYPE].index) {
						// TODO 在选中type 增加筛选条件
						this.updateRelevanceCardParams(this._allType[TYPE],
								index);
					}
				}
			}
		}
	}
})();
