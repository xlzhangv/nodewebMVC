(function($) {

	var PageModel = {
		pageIndex : 'currentPage',// 当前页
		pageSize : 'pageSize',// 每页数
		total : 'total',// 总记录数
		totalPage : 'totalPages'// 总页数
	}

	/**
	 * 自定义分页模型 <br>
	 * var PageModel = {<br>
	 * pageIndex : 'pageIndex',// 当前页<br>
	 * pageSize : 'pageSize',// 每页数<br>
	 * total : 'total',// 总记录数<br>
	 * totalPages : 'totalPages'// 总页数<br> }<br>
	 */
	$.fn.createPage = function(options) {
		var args = $.extend({
					splitCount : 5,
					pageSize : 10,
					pageIndex : 0,
					pageBodyCls : '',// 分页详情的class default .page-body
					pageCodeCls : '',// 分页位置的class default .page-code
					params : {},// function return json
					isPage:true,
					begin : function() {

					},
					end : function() {

					},
					callback : function() {

					}
				}, options);
				
			var $Page = {
		isFirst:true,
		autoLoad:true,
		url : '',
		ajaxType:'post',
		splitCount : 3,
		pageParams : {

		},
		Events : {
			begin : function() {

			},
			end : function() {

			},
			callback : function() {

			}
		},

		init : function($dom, args) {
			var me = this;
			me.url = args.url;
			if(args.autoLoad){
				me.autoLoad =args.autoLoad;
			}
			if(args.ajaxType){
				this.ajaxType = args.ajaxType
			}
			if(args.splitCount){
				me.splitCount = args.splitCount;
			}
			for (var k in PageModel) {
				me.pageParams[PageModel[k]]=0;
			}

			if (typeof args === "object") {
				for (var k in me.pageParams) {
					if (args[k] !== undefined) {
						me.pageParams[k] = args[k];

					}
				}
			}
			if (typeof args.params === "object") {

				for (var k in args.params) {
					if (args.params[k] !== undefined) {
						me.pageParams[k] = args.params[k];

					}
				}

			} else if (typeof args.params === "function") {
				var p = args.params();
				for (var k in p) {
					if (p[k] !== undefined) {
						me.pageParams[k] = p[k];
					}
				}

			}

			if (typeof me === "object") {
				for (var k in me.Events) {
					if (args[k] !== undefined && me.Events[k]) {
						me.Events[k] = args[k];
					}
				}
			}
			me.config = args;
			this.$element = $dom;
			this.$pageBodyElement = args.pageBodyCls?$dom.find(args.pageBodyCls):$dom.find('.page-body');
			this.$pageCodeElement = args.pageCodeCls
					? $dom.find(args.pageCodeCls)
					: $dom.find('.page-code');
					
				
			this.bindEvent(args);
			if(me.autoLoad){
				this.ajaxLoad({});
			}
			
			return this;
		},
		ajaxLoad : function(params) {
			var me = this;
			var newParapage = $.extend(me.pageParams, params);
			this.Events.begin();
			$.ajax({
				url : this.url,
				dataType : 'json',
				data : newParapage,
				type : me.ajaxType,
				success : function(result) {
					if (me.Events.callback) {
						me.update(result);
						me.Events.callback.call(me,result, me.$pageBodyElement);
						if(me.isFirst){
							me.$pageBodyElement.css({
								'min-height':me.$pageBodyElement.height()
							});
							
							me.isFirst=false;
						}
						var h = me.$element.height();
				        	var pageH = me.$pageCodeElement.outerHeight();
//				        	me.$pageBodyElement.parents('.page-table').outerHeight(h-pageH);	
				        	me.$pageBodyElement.parents('.panel-body').scrollTop(0);
					}
					me.Events.end.call(me);
					
				},
				error : function(XMLHttpRequest, textStatus,
						errorThrown) {
					console.error(errorThrown);
					me.Events.call(me);
				}

			});

		},
		/**
		 * 两端分页的起始和结束点，这取决于this.pageParams.pageIndex 和 this.splitCount.
		 * 
		 * @返回 {数组(Array)}
		 */
		getInterval : function() {

			var split_count = Math.ceil(this.splitCount / 2);

			var upper_limit = this.pageParams[PageModel.totalPage]- this.splitCount;
			var start = this.pageParams[PageModel.pageIndex] >= split_count? Math.max(Math.min(this.pageParams[PageModel.pageIndex] - split_count, upper_limit), 0)
					: 0;
			var end = this.pageParams[PageModel.pageIndex] >= split_count? Math.min(this.pageParams[PageModel.pageIndex]+ split_count,
							this.pageParams[PageModel.totalPage])
					: Math.min(this.splitCount,
							this.pageParams[PageModel.totalPage]);
			return [start, end];

		},
		addmeItem : function(index) {

			if (index != this.pageParams[PageModel.pageIndex]) {
				this.$pageCodeElement
						.append('<a href="javascript:;" class="tcdNumber" data-index='
								+ index + ' >' + (index + 1) + '</a>');
			} else {
				this.$pageCodeElement.append('<span class="current" data-index='
						+ index + '>' + (index + 1) + '</span>');
			}

		},
		update : function(args) {
			if(!this.config.isPage){
				return;
			}
			this.$pageCodeElement.empty();
			this.pageParams[PageModel.pageIndex] = parseInt(args[PageModel.pageIndex])-1;
			this.pageParams[PageModel.total] = parseInt(args[PageModel.total]);
			this.pageParams[PageModel.totalPage] = parseInt(this.pageParams[PageModel.total]
					/ this.pageParams[PageModel.pageSize])
					+ 1;

			if ((this.pageParams[PageModel.totalPage] - 1)* this.pageParams[PageModel.pageSize] == this.pageParams[PageModel.total]) {
				this.pageParams[PageModel.totalPage] -= 1;
			}
			if (this.pageParams[PageModel.total] == 0)
				this.pageParams[PageModel.totalPage] = 0;

			if (this.pageParams[PageModel.pageIndex] > this.pageParams[PageModel.totalPage]- 1) {
				this.pageParams[PageModel.pageIndex] = this.pageParams[PageModel.totalPage]- 1;
			}
			if (this.pageParams[PageModel.pageIndex] <= 0)
				this.pageParams[PageModel.pageIndex] = 0;
			if (this.pageParams[PageModel.totalPage] <= 0)
				this.pageParams[PageModel.totalPage] = 0;

			var interval = this.getInterval();

			var edgeNum = 1;

			// 产生起始点
			if (interval[0] > 0) {
				var end = Math.min(edgeNum, interval[0]);
				for (var i = 0; i < end; i++) {
					this.addmeItem(i);
				}
				if (edgeNum < interval[0]) {
					this.$pageCodeElement.append('<span>...</span>');
				}
			}

			// 产生内部的些链接
			for (var i = interval[0]; i <= interval[1]; i++) {
				if (i < this.pageParams[PageModel.totalPage]) {
					this.addmeItem(i);
				}

			}

			// 产生结束点
			if (interval[1] + 1 < this.pageParams[PageModel.totalPage]) {
				if (this.pageParams[PageModel.totalPage] - edgeNum > interval[1]) {
					this.$pageCodeElement.append('<span>...</span>');
				}
				var begin = Math.max(this.pageParams[PageModel.totalPage]
								- edgeNum, interval[1]);
				for (var i = begin; i < this.pageParams[PageModel.totalPage]; i++) {
					this.addmeItem(i);
				}

			}

			if (this.pageParams[PageModel.pageIndex] == 0) {
				// this.pageParams.firstButton.disable();
				// this.pageParams.prevButton.disable();
			}
			if (this.pageParams[PageModel.pageIndex] >= this.pageParams[PageModel.totalPage]
					- 1) {
				// this.pageParams.nextButton.disable();
				// this.pageParams.lastButton.disable();
			}

			var pageIndex = this.pageParams[PageModel.pageIndex] > -1
					? this.pageParams[PageModel.pageIndex] + 1
					: 0;
			if (this.pageParams[PageModel.total] == 0)
				pageIndex = 0;
		},
		bindEvent : function(args) {
			var me = this;
			var now = me.$pageCodeElement.find('a.tcdNumber');
			me.$pageCodeElement.on("click", "a.tcdNumber", function() {
						var pageIndex = parseInt($(this).data('index'));
						var params = {};
						params[PageModel.pageIndex] = (pageIndex+1);
						me.ajaxLoad(params, args);
					});

			me.$pageCodeElement.on("click", "a.prevPage", function() {
						var pageIndex = parseInt($(now).data('index'));
						var params = {};
						params[PageModel.pageIndex] = (pageIndex+1) - 1;

						me.ajaxLoad(params, args);
					});

			me.$pageCodeElement.on("click", "a.nextPage", function() {
						var pageIndex = parseInt($(now).data('index'));
						var params = {};
						params[PageModel.pageIndex] = (pageIndex+1) + 1;
						me.ajaxLoad(params, args);
					});
		}
	}
				
				
		return $Page.init(this, args);
	}
})(jQuery);
