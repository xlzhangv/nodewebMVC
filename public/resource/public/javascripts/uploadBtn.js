(function($) {
	
	// var template1="我是{0}，今年{1}了";
	// var template2="我是{name}，今年{age}了";
	// var result1=template1.format("loogn",22);
	// var result2=template2.format({name:"loogn",age:22});
	String.prototype.format = function(args) {
		var result = this;
		if (arguments.length > 0) {
			if (arguments.length == 1 && typeof(args) == "object") {
				for (var key in args) {
					var reg = new RegExp("({" + key + "})", "g");
					if (args[key] != undefined) {
						result = result.replace(reg, args[key]);
					} else {
						result = result.replace(reg, "");
					}
				}
			} else {
				for (var i = 0; i < arguments.length; i++) {
					var reg = new RegExp("({[" + i + "]})", "g");
					if (arguments[i] != undefined) {
						result = result.replace(reg, arguments[i]);
					} else {
						result = result.replace(reg, '');
					}
				}
			}
		}
		return result;
	}
	
	function UploadBtn(dom,settings) {
		this.settings={
			url:'',
			filename:'upload',
			params:{},
			accept:'application/pdf',
			autoupload:true,
			onselect:function(){},
			progress:function(){},
			onload:function(){},
			onerror:function(){},
			abort:function(){}
		}
		$.extend(this.settings,settings||{});
		this.init(dom,this.settings);
	}
	UploadBtn.prototype = {
		_$upform:undefined,
		_$fileinput:undefined,
		_$fileId : undefined,
		build : function(settings) {
			//application/pdf
			
			var formStr = '<form class="uploadForm" style="visibility: hidden; position: fixed; z-index: -1; left: -1000px;">'
					+ '<input class="upload" type="file" accept="{accept}" name="{filename}">';
			formStr+='</form>';
			this._$upform = $(formStr.format(settings));
			this._$fileinput = this._$upform.find('.upload'),
			this._$fileId = this._$upform.find('.fileId');
			$('body').append(this._$upform);
			this.buildMask();
		},
		upload:function(){
			var me =this;
			me.ajaxUpload(function() {
						this._$upform[0].reset();
						me._buildUploadListener();
					});
		},
		init : function(dom,settings) {
			var me =this;
			this.build(settings);
			this._buildUploadListener();
			dom.on('click', function() {
//						var id = $(this).data('id');
//						$('#fileId').val(id);
//						$('#upload').data('dom', this);
						me._$fileinput.click();
					});
		},
		_buildUploadListener : function() {
			var me = this;
			me.$mask.css({
						'opacity': 0,
						'visibility':'hidden'
					});
			this._$fileinput.off().on('change', function() {
						me.settings.onselect(this);
						if(me.settings.autoupload){
							me.ajaxUpload(function() {
									me._$upform[0].reset();
									me._buildUploadListener();
								});
						}
					});
		},
		ajaxUpload : function(callback) {
			var formData = new FormData(this._$upform[0]);
			if(typeof(this.settings.params) =='function'){
				var ps = this.settings.params();
				for (var k in ps) {
					formData.append(k, ps[k])
				}
			}else{
				for (var k in this.settings.params) {
					formData.append(k, this.settings.params[k])
				}
			}
				
			
			var me = this;
			this.$mask.css({
				'opacity': 1,
				'visibility':'visible'
			})
			var xhr = new XMLHttpRequest(); // XMLHttpRequest 对象

			xhr.upload.addEventListener("progress", function(evt) {
						var percentComplete = Math.round(evt.loaded * 100
								/ evt.total);
						me.$tipsContent.css({
							width:percentComplete+'%'
						})
						me.settings.progress(percentComplete);
					}, false);
			xhr.addEventListener("load", function() {

						if (xhr.status == 200) {
							try{
								var data = JSON.parse(xhr.responseText);
								me.settings.onload(data);
							}catch(e){
							
							}
							
						} else {
							
						}
					
						if (callback) {
							callback();
						}

					}, false);
			xhr.addEventListener("error", function() {
						me.settings.onerror(data);
						me._buildUploadListener();
					}, false);
			xhr.addEventListener("abort", function() {
						me.settings.onabort(data);
						me._buildUploadListener();
					}, false);
			xhr.open("post", me.settings.url, false); // post方式，url为服务器请求地址，true
			// 该参数规定请求是否异步处理。
			xhr.send(formData); // 开始上传，发送form数据

		},
		buildMask : function() {
			var dom = $('body');
			this.$tipsContent = $('<div class="tips tips-anm ' + 'tips-info '
					+ '" style="opacity: 1;height: 100%;width:0%;padding:0;"></div>');
			this.$tipsDiv = $('<div></div>');
			this.$tipsDiv.append(this.$tipsContent);
			this.$mask = $('<div style="position: absolute;top:0;left:0;z-index: 99999;background: rgba(136, 136, 136, 0.5);opacity: 0.7;opacity: 0;visibility:hidden;"></div>');
			this.$mask.css({
						width : '100%',
						height : '100%'
					})
			this.$mask.css({
						'display' : 'block',
						'transition':  '.5s',
						'-moz-transition':  '.5s',
						'-webkit-transition':  '.5s',
						'-o-transition':  '.5s'
					});
			this.$mask.append(this.$tipsDiv);
			dom.append(this.$mask);
			this.layout();
		},
		layout : function() {
			this.$tipsDiv.css({
						'height': '30px',
						'width':'100px',
						'left' : '50%',
						'top' : '50%',
						'position' : 'absolute',
						'border' : '1px solid #ccc',
						'font-size' : 14 + 'px',
						'z-index' : '9999',
						'margin' : '0 auto',
						'text-align' : 'center',
						'opacity' : 1
					});
			this.$tipsDiv.css({
						'margin-left' : -1 * this.$tipsDiv.width(),
						'margin-top' : -1 * this.$tipsDiv.height()
					});

		}
	}
	/**
	 *  $('#inport').uploadbtn({
            		url:'',
				filename:'',
				accept:'application/xlsx',
				progress:function(pro){
					console.info(pro);
				},
				onload:function(data){
					console.info(data);
				}
            	
            });
	 */
	$.fn.uploadbtn = function(settings) {
		return new UploadBtn(this,settings);
	}

})(jQuery)
