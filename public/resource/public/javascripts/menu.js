(function($) {
	
	var Main = {
		__menuData : {},
		$iframe : undefined,
		HOME_ID : '27',
		init : function() {
			var me = this;
			this.$menu = $('#menu-inner');
			this.mask = new Mask({
						title : '',
						autoClose : true,
						timeout : 5 * 1000,
						content : "正在加载"
					});
			this.mask.show();
			this.events();
			this.setData();
			$('#NAME').html(_userMapJson.NAME);
		},
		events : function() {
			var me = this;

			$('#HOME').on('click', function() {
						localStorage.clear();
						Share.data('menuId', '');
						location.href = 'home'
					});
			$('#EXIT').on('click', function() {
						confirm("确定要退出吗？", function(r) {
									if (r == true) {
										localStorage.clear();
										Share.data('menuId', '');
										location.href = 'logout'
									}
								});

					});
			//跳转
			$('#WARN').on('click', function() {
						Share.data('selectedMenu')(me.__menuData[3]);
					});
			this.$menu.on('click', '.menu-item', function() {
						me.selectedMenu(me.__menuData[this.id]);
					});
			this.$menu.on('hide.bs.collapse', function(event) {
						var menuHead = $(event.target).siblings('.menu-head');
						menuHead.find('.menu-status').removeClass('menu-in')
								.addClass('menu-out');
					});
			this.$menu.on('show.bs.collapse', function(event) {
						var menuHead = $(event.target).siblings('.menu-head');
						menuHead.find('.menu-status').removeClass('menu-out')
								.addClass('menu-in')
					});
			//
//            this.$menu.on('click','#5','#56', function(event) {
//              window.open('https://www.baidu.com/')
//            });
            //
		},
		back:function(){
				
			this.$iframe[0].contentWindow.history.back();
			window.event.chancelBUbble =true;
		
		},
		redirect:function(url,params){

			if (params) {
				var opt = "";
				for (var k in params) {
					opt += k + "=" + params[k] + '&';
				}
				this.$iframe.attr('src', url + "?"+ opt.substring(0, opt.length - 1));
			} else {
				this.$iframe.attr('src', url);
			}
		
		},
		selectedMenu : function(menu, params) {
			this.mask.show();
			this.$menu.find('.menu-item').removeClass('selected');
			$('#' + menu.id).addClass('selected');
            this.clearIframe();
			if (menu.id != '56') {
                this.buildIframe(menu,params);
				Share.data('menuId', menu.id);
				localStorage.setItem('menuId', menu.id);
			}else{
				window.open(Interface.appList.replace('sip3.0','')+menu.url)
				this.mask.hide();
			}

		},
		buildIframe : function(data, params) {
			var me = this;
			if(!this.$iframe){
				this.$iframe = $('<iframe  frameborder=0 border=0 hspace=0  vspace=0 scrolling="no" marginwidth="0" marginheight="0" >')
					.css('background-color', 'transparent').css('position',
							'relative').attr('allowTransparency', 'true').attr(
							'height', $('#content-center-iframe').height()).attr('width', '100%');
				$('#content-center-iframe').append(this.$iframe);
				this.$iframe.on('load', function() {
                   	 me.mask.hide();
						// me.mask.hide(function(){
						// 	if(_loginMsg){
						// 		UIalert(_loginMsg,{
						// 			timeout:3*1000
						// 		});
						// 	}
						// 	_loginMsg = null;
						// 	if(_licenseMsg) {
						// 		confirm(_licenseMsg, function(r) {
						// 			if (r == true) {
						// 				 window.location.href=Interface.appList+"/license";
						// 			}
						// 		});
						// 	}
						// 	_licenseMsg = null;
						// });
					})
			}
			
			if (params) {
				var opt = "";
				for (var k in params) {
					opt += k + "=" + params[k] + '&';
				}
				this.$iframe.attr('src', '/'+data.url + "?"
								+ opt.substring(0, opt.length - 1));
			} else {
				this.$iframe.attr('src', '/'+data.url);
			}

			this.$iframe.attr('id', 'iframe-' + data.id);
			
		},
		clearIframe : function() {
			if (!this.$iframe)
				return;
			try {
				this.$iframe[0].contentWindow.document.write('');// 清空iframe的内容
				this.$iframe[0].contentWindow.close();// 避免iframe内存泄漏
			} catch (e) {

			}
//			this.$iframe[0].remove();
		},
		buildMenuData : function(list) {
			for (var i = 0; i < list.length; i++) {
				if (list[i].child) {
					this.buildMenuData(list[i].child);
				}
				this.__menuData[list[i].id + ''] = list[i];
			}
		},
		setData : function() {
			var me = this;
			
			if (_menuJson) {
				me.$menu.append(template('menu-template', {
							data : _menuJson
						}));
				me.buildMenuData(_menuJson);

				if (localStorage.getItem('menuId')
						&& localStorage.getItem('menuId') != 'undefined'
						&& localStorage.getItem('menuId') != '') {
					if (location.pathname.indexOf(this.__menuData[localStorage
							.getItem('menuId')].url) != -1) {
						this.mask.hide();
						this.$menu.find('.menu-item').removeClass('selected');
						$('#' + localStorage.getItem('menuId'))
								.addClass('selected');
						return;
					}
					this.selectedMenu(this.__menuData[localStorage
							.getItem('menuId')]);
				} else {
					if (location.pathname.indexOf('bigdata') == -1) {
						this.mask.hide();
						this.selectedMenu(this.__menuData[me.HOME_ID]);
						return;
					}
				}

			} else {
				this.mask.hide(function() {
							UIalert('您没有权限！');
						});

			}

		}
	}
	$(function() {
				$('#menu-buttons').css({
							'max-height' : document.body.clientHeight * 0.85
						})
				Share.data('selectedMenu', function(id, params) {
							Main.selectedMenu(Main.__menuData[id], params);
						});
				Share.data('redirect', function(url, params) {
							Main.redirect(url, params);
						});
				Main.init();
				
				new DateTime(function(d) {
						if(parseInt(d.h+d.m+d.s)==0){
							location.reload();
						}
					});
			})
			
})(jQuery)