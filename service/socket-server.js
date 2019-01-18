/**
 * Created by Administrator on 2016/6/7.
 */
var extend = require('util')._extend;

var nodeSocket = {
    io: null,
    init: function (httpServer) {
        this.io = require('socket.io')(httpServer);
        this.initChatIo();
    },
    initChatIo: function () {
        this.chat.connectchat(this.io);
    },
    chat: {
        room: {},//房间
        //onlineUsers: {},//在线用户
        //onlineCount: 0,//在线用户数量
        chat_io: null,
        connectchat: function (socketIo) {
            var me = this;
            this.chat_io = socketIo.of('/chat');
            this.chat_io.on('connection', function (socket) {
                console.log('a user connected');
                me.chatEvent(socket);
            });

        },
        chatEvent: function (socket) {
            var me = this;
            //监听新用户加入
            socket.on('join', function (obj) {
                //将新加入用户的唯一标识当作socket的名称，后面退出的时候会用到
                socket.userId = obj.userId;
                socket.room = obj.roomId;

                //检查在线列表，如果不在里面就加入
                if (!me.room[obj.roomId]) {
                    me.room[obj.roomId] = {
                        onlineUsers: {},//在线用户
                        onlineCount: 0,//在线用户数量
                    };
                    me.updateJoinUsers(obj.roomId, obj.userId, obj.userName);
                } else {
                    me.updateJoinUsers(obj.roomId, obj.userId, obj.userName);
                }
                socket.join(obj.roomId);    // 加入房间
                var info = me.getRoomUsersInfo(obj.roomId);
                //向所有客户端广播用户加入
                me.chat_io.to(obj.roomId).emit('join', extend(info, {
                    user: obj
                }));
                console.log(obj.userName + '加入了' + obj.roomId + '房间聊天室');
            });

            //监听用户退出
            socket.on('disconnect', function () {
                //将退出的用户从在线列表中删除
                if (me.room[socket.room] && me.room[socket.room].onlineUsers.hasOwnProperty(socket.userId)) {
                    //退出用户的信息
                    var obj = {userId: socket.userId, userName: me.room[socket.room].onlineUsers[socket.userId]};

                    //删除
                    delete me.room[socket.room].onlineUsers[socket.userId];
                    //在线人数-1
                    me.room[socket.room].onlineCount--;

                    socket.leave(socket.room);
                    //向所有客户端广播用户退出
                    me.chat_io.to(obj.roomId).emit('logout', {
                        roomId: socket.room,
                        onlineUsers: me.room[socket.room].onlineUsers,
                        onlineCount: me.room[socket.room].onlineCount,
                        user: obj
                    });
                    var info = me.getRoomUsersInfo(socket.room);
                    //向所有客户端广播用户加入
                    me.chat_io.to(obj.roomId).emit('join', extend(info, {
                        user: obj
                    }));
                    console.log(obj.userName + '退出了' + obj.roomId + '房间聊天室');
                }
            });

            //监听用户发布聊天内容
            socket.on('message', function (obj) {
                //向所有本用户组的客户端广播发布的消息
                if (me.room[obj.roomId].onlineUsers.hasOwnProperty(obj.userId)) {
                    me.chat_io.to(obj.roomId).emit('message', obj);
                    console.log(obj.userName + '说：' + obj.content);
                } else {
                    console.log('不是本用户组的');
                }
            });
        },
        /**
         *
         * @param roomId
         * @returns {{roomId: *, onlineUsers: (*|onlineUsers|{}), onlineCount: (*|number)}}
         */
        getRoomUsersInfo: function (roomId) {
            return {
                roomId: roomId,
                onlineUsers: this.room[roomId].onlineUsers,
                onlineCount: this.room[roomId].onlineCount,
            };

        },
        /**
         *
         * @param roomId
         * @param userId
         * @param userName
         */
        updateJoinUsers: function (roomId, userId, userName) {
            var me = this;
            if (!me.room[roomId].onlineUsers.hasOwnProperty(userId)) {
                me.room[roomId].onlineUsers[userId] = userName;
                //在线人数+1
                me.room[roomId].onlineCount++;
            }
        }
    }
};
module.exports = nodeSocket;
