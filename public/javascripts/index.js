(function($) {
	var Login = {
		init : function() {
			var me = this;
			me.setEvents();
		},
		setEvents : function() {
			var me = this;
			$('#login-btn').click(function() {
						me.login();
					});
			$('body').keydown(function(e) {
						if (e.keyCode == 13) { // 回车键的键值为13
							me.login();
						}
					});

		},
		login : function() {
			
			
			if($('body').width()<3000){
				location.href = getRealPath()+'/template/single-page.html?id=22-12-13';
			}else{
				location.href = getRealPath()+'/template/12-22-13.html?id=12-22-13';
			}
//			$.ajax({
//						url : "/login-submit.html",
//						type : 'post',
//						data : {
//							userName : $('#login-name').val(),
//							passWord : $('#password').val()
//						},
//						dataType : 'json',
//						traditional : true,
//						success : function(text) {
//							if (!text.success) { // 失败
//								alert(text.message, "提示")
//							} else { // 成功
//								location.href = text.data;
//							}
//						},
//						error : function(jqXHR, textStatus, errorThrown) {
//							alert("登录错误！请刷新...", "提示")
//						}
//					});
		}
	}
	$(function() {
				Login.init();
			})

})(jQuery);
