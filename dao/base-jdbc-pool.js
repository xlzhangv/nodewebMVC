/**
 * Created by Administrator on 2016/6/3.
 */
var mysql =  require('mysql');
var dataSource=require('./dataSource.json');
var baseJdbcPool={
    getPool:function(){
        //连接池
        pool =  mysql.createPool(dataSource);
        return pool;
    },
};
module.exports=baseJdbcPool;
