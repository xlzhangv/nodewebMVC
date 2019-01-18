$(function() {
	
	document.oncontextmenu = function() {
	    return false;
	}
	
	$(window).unload( function () { 
		
		$('iframe').each(function() {
			this.contentWindow.document.write('');//清空iframe的内容
			this.contentWindow.close();//避免iframe内存泄漏
			this.remove();
		});
	} );
	
//	$(window).resize(function() {
//			
//
////			$('iframe').each(function() {
////				this.contentWindow.document.write('');//清空iframe的内容
////				this.contentWindow.close();//避免iframe内存泄漏
////			});
//			
//			//window.location.reload();
////			for(var id in moduleObj){
////				moduleObj[id].stop();
////			}
////			setTimeout(function() {
////						$('.lock-btn').remove();
////						
////						$('.flip').each(function() {
////							buildLockBtn($(this));
////						});
////						
////						for(var id in moduleObj){
////							moduleObj[id].start();
////						}
////						
////					}, 4000);
//
//		});
	window['moduleMain'] = moduleMain = {};//子类对象
	var moduleIframe = {};//iframe对象
	// Interface.templateRest.getTemplate
	function appendFlipIframe(moduleId, data, callback) {
		
		var $module = $('#' + moduleId);
		
		if ($module.length > 0) {
			
			var delay = Math.round((Math.random() * 1000)+ 1000);
			$module.flip({
					delay : delay
			});
			//			
			var $iframe = $('<iframe  frameborder=0 border=0 hspace=0  vspace=0 scrolling="no" marginwidth="0" marginheight="0" >');
			$iframe.css('background-color', 'transparent');
			$iframe.attr('allowTransparency', 'true');
			$iframe.attr('height', '100%');
			$iframe.attr('width', '100%');
			$iframe.attr('src', getRealPath() + '/' + data.temp_url);
			$iframe.attr('id', data.id);
			$module.attr('cardId',data.id);
			var $div = $('<div class="card-body"></div>').css({
						height : '100%',
						width : '100%'
					}).attr('id',data.id);
//			$.ajax({
//				url:getRealPath() + '/' + data.temp_url,
//				dataType:'html',
//				async:true,
//				success:function(html){
//					$div.append($('<div class="inner"></div>').append(html));
//				}
//			})
			$div.append($('<div class="inner"></div>').append($iframe));
			$div.data('id',data.id);
//			$div.on('DOMNodeInsertedIntoDocument', function(e) { 
//			 });
					
			$module.append($div);

			$iframe.load(function() {
						this.contentWindow.Main._offset = $(this).parents('.module').offset();
						moduleMain[this.id] = this.contentWindow.Main;
						moduleIframe[this.id] = this.contentWindow;
						callback($div);
					});
		}

	}
	function appendIframe(moduleId, data, callback) {
		
		var $module = $('#' + moduleId);
		
		if ($module.length > 0) {
			
			var $iframe = $('<iframe  frameborder=0 border=0 hspace=0  vspace=0 scrolling="no" marginwidth="0" marginheight="0" >');
			$iframe.css('background-color', 'transparent');
			$iframe.attr('allowTransparency', 'true');
			$iframe.attr('height', '100%');
			$iframe.attr('width', '100%');
			$iframe.attr('src', getRealPath() + '/' + data.temp_url);
			$iframe.attr('id', data.id);

			var $div = $('<div class="card-body" ></div>').css({
						height : '100%',
						width : '100%'
					}).attr('id',data.id);
			$div.append($('<div class="inner"></div>').append($iframe));
			$div.data('id',data.id);
//			$div.on('DOMNodeInsertedIntoDocument', function(e) { 
//			 });
					
			$module.append($div);

			$iframe.load(function() {
						this.contentWindow.Main._offset = $(this).parents('.module').offset();
						moduleMain[this.id] = this.contentWindow.Main;
						moduleIframe[this.id] = this.contentWindow;
						callback($div);
					});
		}

	}

	function createLockBtn(moduleId) {
		var $btnGroup = $('<div  class="btn-group lock-btn"></div>');
		var $group = $('<span class="group"></span>');
		var $lock = $('<input class="lock" type="checkbox">').attr('id',
				'lock-' + moduleId).val(moduleId).attr('checked','checked');
		var $label = $('<label  title="锁定"></label>').attr('for',
				'lock-' + moduleId);
		$group.append($lock).append($label);
		return $btnGroup.append($group);
	}

	function buildLockBtn($dom) {
		if ($dom.children().length < 2) {
			return;
		}
		var offset = $dom.offset();
		var $btn = createLockBtn($dom.attr('id'));
		$btn.css({
					'position' : 'absolute',
					'left' : offset.left + $dom.width() - 45,
					'top' : offset.top + 5
				});
		$('#main').append($btn);
		
	}
	
	var alltemp={};
	
	function isComplete(){
		
		var finished = true;
		for(var id in alltemp){
			if(!alltemp[id]){
				finished = false;
			}
		}
		return finished;
	
	}
	
	function startFlip(){
				$('.flip').each(function() {
					
					if ($(this).children('.card-body').length < 2) {
						return;
					}
					//$(this).flip('start');
					buildLockBtn($(this));
				});

				$('body').on('change', '.lock', function() {
							
					
							if ($('#' + this.value).flip('__direction') == '+') {
								$('#' + this.value).flip('back');
							} else {
								$('#' + this.value).flip('positive');
							}
//							if ($(this).is(":checked")) {
//								$('#' + this.value).flip('stop')
//							} else {
//								$('#' + this.value).flip('start')
//							}
						});
						
//				if(sendTermTest){
//					sendTermTest();
//				}		
			}
	

	$.get(Interface.templateRest.getTemplate, {
				temp_id : templateId
			}, function(result) {
				if (!result) {
					return;
				}

				var data = JSON.parse(result.data.temp_json);
//				$('.module').empty();
				var temps={};
				

				$.each(data.positive, function(index, d) {
							if(temps[index]){
								temps[index].push(d);
							}else{
								temps[index]=[];
								temps[index].push(d);
							}
						});
				$.each(data.back, function(index, d) {
					
							if(temps[index]){
								temps[index].push(d);
							}else{
								temps[index]=[];
								temps[index].push(d);
							}
							alltemp[d.id]=false;
						});		
				for(var index in temps){
					if(temps[index].length>1){
						var ts = temps[index];
						for (var i = 0; i < ts.length; i++) {
							alltemp[ts[i].id]=false;
							appendFlipIframe(index, ts[i], function($dom) {
										alltemp[$dom.data('id')] = true;
	//										$dom.css({
	//													'display' : 'none'
	//										 });
										 if(isComplete()){
											startFlip();
										 }
									});
						}
					}else{
						var d = temps[index][0];
						alltemp[d.id]=false;
						appendIframe(index, d, function($dom) {
								alltemp[$dom.data('id')] = true;
								if(isComplete()){
									startFlip();
								}
						});
					
					}
				
				}		

			}, 'json');
	$(function() {
		
		$.get('btns.json', {}, function(result) {

			var $li1 = [];
			var $li2 = [];

			$.each(result.data, function(i, d) {
				
				if (i > 3) {
					var url = d.url.indexOf('http')>-1?d.url:getRealPath() + '/' +d.url;
					var $childLi = $('<li></li>').data('url',url).data('target',d.target),
					$label = $('<label class="group-label"></label>').html(d.name);
					var $a = $('<a>').attr('id','menu_'+d.id).attr('href',"javascript:MenuClick('"+url+"','"+d.target+"')");
					$li2.push($childLi.append($a.append($label)));
				} else { 
					var url = d.url.indexOf('http')>-1?d.url:getRealPath() + '/' +d.url;
					var $li = $('<li class="menu-item"></li>').data('url',url), $icon = $('<span  class="group-icon"></span>')
					if (selectId==d.id) {
						$icon.css({
									'background-image' : 'url(icon/' + d.icon
											+ '1.png)'
								});
					} else {
						$icon.css({
									'background-image' : 'url(icon/' + d.icon
											+ '0.png)'
								}).data('icon', d.icon);
					}
	
					$label = $('<label class="group-label"></label>').html(d.name);
					var $a = $('<a>').attr('id','menu_'+d.id).attr('href',"javascript:MenuClick('"+url+"','"+d.target+"')");
					$a.append($icon);
					$a.append($label);
					$li.data('target',d.target);
					$li1.push($li.append($a));
				}

			});
			$('.group-button-items').prepend($li1);
			
			if($li2.length>0){
				$moreUl =  $('<ul class="child-menu-item"></ul>').append($li2);
				$('.child-menu').append($moreUl);
			}
			
			
		}, 'json');
		
		$('.more-item').on('mouseenter',function(){
			$(this).find('.child-menu').show();
			if(moduleMain&&moduleMain['map'].hide){
				moduleMain['map'].hide();
			}
			
		});
		
		$('.more-item').on('mouseleave', function() {
			$(this).find('.child-menu').hide();
			if(moduleMain&&moduleMain['map'].show){
				moduleMain['map'].show();
			}
		})
		
		window['MenuClick'] = function(url,target){
			if (url) {
				switch(target){
				
					case '_blank':
					 	window.open(url);
						break;
					case '_self':
						location.href=url;
						break;
					
				}
			}
			
		}
//		$('#group-button-items').on('click', 'li', function() {
//
//			if ($(this).data('url')) {
//				switch($(this).data('target')){
//				
//					case '_blank':
//					 	window.open($(this).data('url'));
//						break;
//					case '_self':
//						location.href=$(this).data('url');
//						break;
//					
//				}
//			}
//
//		})
		var websocketId,
		lastSendDate=+new Date(),
		socketObject;
		var shakeMessage  = '{"method":"login","cid":"P001-S001-D001-NAME","type":"Consumer","code":"A001","mode":"0","appid":"-1","filter":"0.0.0.0","version":"1.0.1","requestData":"","user":"tom","pass":"241fcf33eaa2ea61285f36559116cbad","timestamp":"1493979949941"}'
		var WebSocketItem = function(url,promise) {
			this.socket = new ReconnectingWebSocket(url,null,{
				reconnectInterval:0,
				maxReconnectInterval:2000
				
			});
			this.shakeMessage = shakeMessage;
			var _self = this;
			this.socket.onopen = function(e) {
				
			  if(_self.shakeMessage) {
				  _self.socket.send(_self.shakeMessage);
			  }
			  if(promise && typeof(promise.openCallback) === "function") {
				 promise.openCallback(e); 
			  }	
			}
			this.socket.onclose = function(e) {
				console.info('关闭websocket连接...');
				//buildWebSocket();
				  if(promise && typeof(promise.closeCallback) === "function") {
					 promise.closeCallback(e); 
				  }	
			}
			this.socket.onmessage = function(e) {
			  if(promise && typeof(promise.messageCallback) === "function") {
				 promise.messageCallback(e); 
				 if(e.data){
				 	if((new Date().getTime()-lastSendDate)>=50000){        
		                  _self.socket.send(_self.shakeMessage)
		                 lastSendDate = +new Date();
		             }
				 	if(websocketId){
				 		clearTimeout(websocketId);
				 	}else{
//				 		websocketId = setTimeout(function(){
//				 			console.info('重新创建websocket连接...');
//				 			buildWebSocket();
//				 		},5000);
				 	}
				 }
			  }	
			}
			this.socket.onerror = function(e) {
			  console.info('websocket连接异常...');
			  //buildWebSocket();
			  if(promise && typeof(promise.errorCallback) === "function") {
				 promise.errorCallback(e); 
			  }	
			}
		}
		
		function buildWebSocket(){
			if(socketObject){
				socketObject.socket.close();
				console.info('关闭websocket');
				socketObject=null;
			}
			socketObject = new WebSocketItem(Interface.websocketUrl, {
						messageCallback : function(e) {
							var result;
							try {
								result = JSON.parse(e.data);
	
							} catch (f) {
								result = e.data;
							}
							
							if(result&&result.type){
								
								for (var id in moduleMain) {
									if(moduleMain[id].initSocket){
										moduleMain[id].initSocket(result);
									}
								}
							}
						},
						openCallback : function(e) {
	
						}
			})
		}
	
		setTimeout(function(){
//				var test = {
//					type:'MT001',
//					data:{
//						src:{
//							geo:{
//								citycode:'NA',
//								latitude:0,
//								longitude:0
//							},
//							ip:'test'
//						},
//						"catagory" : "N/A",
//						"city" : "天津市",
//						"country" : "中国",
//						"id" : +new Date(),
//						"name" : "N/A",
//						"objid" : "N/A",
//						"sip" : "123.150.202.57",
//						"time" : new Date().format('yyyy-MM-dd hh:mm:ss'),
//						"type" : "扫描探测",
//						"warn_code" : "MA004",
//						"warninfo" : "在2016-11-29 11:42:03发现NAT设备[123.150.202.57]",
//						"warnlevel" : 3,
//						"warnname" : "设备探测发现",
//						"warnsource" : "new-SIP" + new Date()
//					},
//					time:new Date()
//				
//				}
//				setInterval(function() {
//					for (var id in moduleMain) {
//							if(moduleMain[id].initSocket){
//								moduleMain[id].initSocket(result);
//							}
//						}
//				}, 3000)
        	 	buildWebSocket();
         },4000);
		
		
	})
});
