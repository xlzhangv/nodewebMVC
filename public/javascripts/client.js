/**
 * Created by Administrator on 2016/6/8.
 */
function SocketIOClient(options) {
    var defaults = {
        onStatusMessage: function (o, action) {//用户状态消息


        },
        onMessage: function (obj, isme) {


        },
        onDebug: function (obj) {


        }
    }
    if (typeof options === "object") {
        for (var ndx in defaults) {
            if (options[ndx] !== undefined) {
                defaults[ndx] = options[ndx];
            }
        }
    }
    var socket, userId;
    var getUid = function () {
        return new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
    }

    userId = getUid();
    var init = function () {
        //连接websocket后端服务器
        socket = io('/chat');
        socket.on('connect', function () {
            //告诉服务器端有用户登录
            socket.emit('join', {userId: userId});

            //监听新用户登录
            socket.on('join', function (o) {
                // $.ajax({
                //     url:'/track-send',
                //     type:'post',
                //     data:{
                //         begin:'2018-10-08 17:30:47',
                //         end:'2018-10-08 17:49:19'
                //     },
                //     success:function(result){
                //
                //     }
                // })


            });

            //监听用户退出
            socket.on('logout', function (o) {
                updateSysMsg(o, 'logout');
            });

            //监听消息
            socket.on('message', function (obj) {
                defaults.onMessage(obj);
            });
        });
    }
    init();
    //退出，本例只是一个简单的刷新
    this.logout = function () {
        this.socket.disconnect();
    }
    return this;
}