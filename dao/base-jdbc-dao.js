/**
 * Created by Administrator on 2016/6/3.
 */
var mysql =  require('mysql');
var dataSource=require('./dataSource.json');
var async = require("async");
var uuid = require('node-uuid');
// console.log('基于时间戳生成uuid:'+uuid.v1());//v1 是基于时间戳生成uuid
// console.log('是随机生成uuid'+uuid.v4());//v4是随机生成uuid
//连接池
pool =  mysql.createPool(dataSource);

var baseJdbcDao = {
    /**
     *
     * @param sql where ? and ? and ?
     * @param queryParams [0,1,2]/[{title:'test'},{name:'aa'}]
     */
    querySQL: function (sql, queryParams,callback) {
        pool.getConnection(function (err, connection) {
            connection.query(sql, queryParams, function (err, rows) {
                if (err) {
                    // connection.end();
                    connection.release();
                    console.log("querySQL error: " + err);
                    throw err;
                } else {
                    callback(rows);
                }
            });
            connection.release();
        });
    },
    update:function (table,obj,where,callback) {
        var f=[],column=[],seat=[],values=[];

        for(var k in obj){
            column.push(k+'=?');
            values.push(obj[k]);
        }
        for(var k in where){
            seat.push(k+'='+mysql.escape(where[k]))
        }
        f.push('UPDATE ');
        f.push(table);
        f.push(' SET ');
        f.push(column.join(','));
        f.push(where);
        console.info(f);
        pool.getConnection(function (err, connection) {

            connection.beginTransaction(function (err) {

                connection.query(f.join(''), values, function (err, rows, fields) {
                    if (err) {
                        connection.rollback(function () {
                            throw err;
                        });
                    } else {
                        console.log("transaction rows: " + JSON.stringify(rows));
                        connection.commit(function (err) {
                            if (err) {
                                console.log("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    console.log("transaction error: " + err);
                                    connection.release();
                                    return callback(err, null);
                                });
                            } else {
                                connection.release();
                                if(callback) callback(rows);
                                console.info(rows);
                            }
                        });

                    }
                });
            });
        });
    },
    save: function (table,obj,callback) {
        var f=[],column=[],seat=[],values=[];

        for(var k in obj){
            column.push(k);
            seat.push('?');
            values.push(obj[k]);
        }
        f.push('INSERT INTO ');
        f.push(table);
        f.push(' ( ');
        f.push(column.join(','));
        f.push(' ) ');
        f.push(' VALUES ( ');
        f.push(seat.join(','));
        f.push(' ) ');

        pool.getConnection(function (err, connection) {

                connection.beginTransaction(function (err) {

                    connection.query(f.join(''), values, function (err, rows, fields) {
                        if (err) {
                            connection.rollback(function () {
                                throw err;
                            });
                        } else {
                            // console.log("transaction rows: " + JSON.stringify(rows));
                            connection.commit(function (err) {
                                if (err) {
                                    console.log("执行事务失败，" + err);
                                    connection.rollback(function (err) {
                                        console.log("transaction error: " + err);
                                        connection.release();
                                        return callback(err, null);
                                    });
                                } else {
                                    connection.release();
                                    if(callback) callback(rows);
                                    console.info(rows);
                                }
                            });

                        }
                    });
                });
        });

        //
        // this.queryTransactionSQL([{
        //     sql:f.join(''),
        //     params:values
        // }],function(err,info){
        //
        //
        // });
    },
    /**
     * 执行事务sql
     * @param queryEntitys {sql:'',params:}
     * @param callback
     */
    queryTransactionSQL: function (queryEntitys,callback) {

        pool.getConnection(function (err, connection) {
            if (err) {
                return callback(err, null);
            }
            connection.beginTransaction(function (err) {
                if (err) {
                    return callback(err, null);
                }
                console.log("开始执行transaction，共执行" + queryEntitys.length + "条数据");
                var funcAry = [];
                queryEntitys.forEach(function (sql_param) {
                    var temp = function (cb) {
                        var sql = sql_param.sql;
                        var param = sql_param.params;
                        connection.query(sql, param, function (err, rows, fields) {
                            if (err) {
                                connection.rollback(function () {
                                    console.log("事务失败，" + sql_param + "，ERROR：" + err);
                                    throw err;
                                });
                            } else {
                                return cb(null, 'ok');
                            }
                        });
                    };
                    funcAry.push(temp);
                });

                async.series(funcAry, function (err, result) {
                    console.log("transaction error: " + err);
                    if (err) {
                        connection.rollback(function (err) {
                            console.log("transaction error: " + err);
                            connection.release();
                            return callback(err, null);
                        });
                    } else {
                        connection.commit(function (err, info) {
                            console.log("transaction info: " + JSON.stringify(info));
                            if (err) {
                                console.log("执行事务失败，" + err);
                                connection.rollback(function (err) {
                                    console.log("transaction error: " + err);
                                    connection.release();
                                    return callback(err, null);
                                });
                            } else {
                                connection.release();
                                return callback(null, info);
                            }
                        });
                    }
                });
            });
        });
    }
};
var direction=['南向北','东向西','北向南','西向东'];
var turn=['左转','直行','右转'];
var scoot=['JNYT','QCMQ','STOC','SLAG','ELAG'];
var junction=['N04141','N04152','N04151','N04161','N04162'];
var angle=-90;

var objs=[];
for(var jun=0;jun<junction.length;jun++){
    for(var i=0;i<direction.length;i++){
        for(var j=0;j<turn.length;j++){
            var obj = {
                junction_id:junction[jun],
                direction:direction[i],
                turn:turn[j],
                angle:angle
            }
            objs.push(obj);

        }
        angle+=90;
    }

    angle=-90;
}
var fun=[];
console.info(objs.length)
objs.forEach(function (t) {
    fun.push(function (cb) {
        var val = JSON.parse(JSON.stringify(t));
        console.info(val);
        baseJdbcDao.save('scoot_direction',val,function (info) {
            return cb(null,'ok')
        });
    })
})

console.log(fun.length)
// async.series(fun, function (err) {
//     if (err) {
//         console.log("transaction error: " + err);
//     } else {
//        console.info('end');
//     }
// });

// var date = 1;
// for(var i=1;i<=60;i++){
//     for(var k=0;k<scoot.length;k++){
//         var obj={
//             direction_id:i,
//             name:scoot[k],
//             current_val:123,
//             recommend_val:321,
//             update_date:(++date)
//         }
//         baseJdbcDao.save("scoot_value",obj)
//     }
// }


module.exports = baseJdbcDao;
