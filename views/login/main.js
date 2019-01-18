(function(echarts, $) {
	
	function vertex(w) {
		if (w.top != w.self) { 
			w.parent.location.href = 'login';
		}
	}
	vertex(window);
	
	 if(__loginErrorMessage &&  __loginErrorMessage != '该密码使用超过30天,请修改密码！'){
	 	$('#login-error').css({
	 		'opacity': 1,
	 		'visibility':'visible'
	 	}).find('.error').text(__loginErrorMessage);
	 	setTimeout(function(){
	 		$('#login-error').css({
	 			'opacity': 0,
	 			'visibility': 'hidden'
	 		});
	 	},3000);
	 }
	
	
	var Main = {
		_certificateUpload:undefined,
		init : function() {
			this.setData();
			this.events();
		},
		events : function() {
			var me = this;
			
			this._certificateUpload = $('#certificate-file').uploadbtn({
				filename:'file',
				accept:'.key',
				autoupload:false,
				progress:function(pro){
					console.info(pro);
				},
				onselect:function(fileinput){
					$('#file-name').text(fileinput.files[0].name);
					if(fileinput.files[0].size>0){
						$('.certificate-icon').css({
							'background-image': 'url(login/icon/certificate.png)'
						});
					}
					$('.certificate').hide('slow');
					$('.certificate-icon').show('slow');
				}
            });
			$('#captcha-image').on('click',function(){
				me._reload();
			})
            $('.certificate-icon').on('click',function(){
            		$('.certificate').show('slow');
            })
			$('.alert-close').on('click',function(){
				$('.certificate').hide('slow');
				$('.certificate-icon').show('slow');
			});
			
			$.validator.addMethod("remoteCaptcha", function (value, element, params) {
                var success = false;
                if (value.length < 4) {
                    return false;
                }
                $.ajax({
                    url:  Interface.appList+"/checkCaptcha",//'http://192.168.23.53:8080/Topwalk-SIP3.0/startegy/update',
                    type: 'post',
                    dataType: 'json',
                    async: false,
                    data: {
                        captcha: value
                    },
                    success: function (result) {
                        success = result.isCaptcha
                        if (!result.isCaptcha) {
                           me._reload();
                        }
                    },
                    error: function (result) {

                    }
                });
                return success;
            }, "验证码错误！");
			var formValid = $("#login-form").validate({
				errorClass: 'input-error',
				rules: {
                    key: {
                        required: true
//                        minlength: 4,
//                        maxlength: 20
                    },
                    password: {
                        required: true,
                        minlength: 6,
                        maxlength: 20
                    },
                    captcha: {
                        required: true,
                        remoteCaptcha:true
                    }
                },
                messages: {
                    key: {
                        required: "请输入用户名"
//                        minlength: "用户名长度不能小于 4 个字母"
                    },
                    password: {
                        required: "请输入密码",
                        minlength: "密码长度不能小于 6 个字母"
                    },
                    captcha: {
                        required: "请输入验证码"
                    }
                },
				errorPlacement: function (error, element) {
				  error.addClass('error-message')
                  element.after(error);
                 
                },
                success: function (label) {
                    label.css({
                            'top': 0,
                            'opacity': 0
                        });
                },
                showErrors: function (errorMap, errorList) {
                	 	this.defaultShowErrors();
                    for (var i = 0; i < errorList.length; i++) {
                        $(errorList[i].element).siblings('.error-message').css({
                            'top': 42,
                            'opacity': 1
                        });
                    }
                }
			});
			$('#login').on('click', function() {
						me.loginFun();
					});
	
			
			$(document).keypress(function(e) {
						// 回车键事件
						if (e.which == 13) {
							me.loginFun();
						}
					});

            //	可修改的
            var userId = $.trim("${userId}");
            var name = $("#user").val();
            if(__loginErrorMessage === '该密码使用超过30天,请修改密码！') {

                confirm(__loginErrorMessage, function(r) {
                    if (r == true) {
                        window.location.href=Interface.appList+"/resetpwd";
                    }
                });
            } else{
                //$(".error").show("normal").text(__loginErrorMessage + 11111111);
            }
		},
		_reload:function(){
			$("#captcha-image").attr("src", Interface.appList+"/captcha?"+ Math.random());
		},
		loginFun : function() {
			var me = this;
			if ($("#login-form").valid()) {
				var formData = new FormData(this._certificateUpload._$upform[0]);
//				if(formData.get('file').size==0){
//					$('.certificate').show('slow');
//					return;
//				}
				$("#login-form").append(this._certificateUpload._$fileinput);
				$("#login-form").submit();
			}
		},
		setData : function() {
		}
	};
	window['Main'] = Main;
	$(function() {
				Main.init();
			});
})(echarts, jQuery);
