/**
 * Created by Administrator on 2016/6/7.
 */
var crypto = require('crypto');

var Md5Util={
    encrypt:function(str){
        var crypto_md5 = crypto.createHash('md5');
        crypto_md5.update(str, 'utf8'); // 加入编码
        return crypto_md5.digest('hex');
    }
}
module.exports = Md5Util;