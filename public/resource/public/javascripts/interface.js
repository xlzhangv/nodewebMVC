(function () {

    var Interface={
        alarmDetail:'',
        ws:'ws://'+'127.0.0.1',
        ws_10903:'ws://'+'127.0.0.1'+':10903',
        ws_10901:'ws://'+'127.0.0.1'+':10901',
        //默认值
        curr:_getContextPath+'/monitor/curr',
        //服务器监测告警
        sermonemergency:_getContextPath+'/monitor/alarm',
        //集群服务器监控
        jqsermon:_getContextPath+'/monitor/server',
        //探针服务器监控
        tzsermon:_getContextPath+'/monitor/servertz',
        config:_getContextPath+'/startegy/config',
        updateconfig:_getContextPath+'/startegy/update',
        alarmstats:_getContextPath+'/alarmWeb/stats',
        devlist:_getContextPath+'/alarmWeb/dev',
        alarmlist:_getContextPath+'/alarmWeb/list',
        userlist:_getContextPath+'/userManage/list',
        usersave:_getContextPath+'/userManage/save',
        userupdate:_getContextPath+'/userManage/update',
        userdel:_getContextPath+'/userManage/del',
        useredit:_getContextPath+'/userManage/toEdit',
        userpwdcheck:_getContextPath+'/userManage/check',
        usersavepwd:_getContextPath+'/userManage/savePass',
        userManagestatus:_getContextPath+'/userManage/status',
        userisNotRepeat:_getContextPath+'/userManage/isNotRepeat',
        //角色管理
        rolemanage:_getContextPath+'/roleManage/list',
        rolesearch:_getContextPath+'/roleManage/role',
        roleManagestatus:_getContextPath+'/roleManage/status',
        roleManagetoEdit:_getContextPath+'/roleManage/toEdit',
        roleManagedel:_getContextPath+'/roleManage/del',
        roleManagesave:_getContextPath+'/roleManage/save',
        roleManageupdate:_getContextPath+'/roleManage/update',
        roleisNotRepeat:_getContextPath+'/roleManage/isNotRepeat',
        authstatus:_getContextPath+'/auth/status',
        authdel:_getContextPath+'/auth/del',
        authtoEdit:_getContextPath+'/auth/toEdit',
        authlist:_getContextPath+'/auth/list',
        authsave:_getContextPath+'/auth/save',
        authupdate:_getContextPath+'/auth/update',
        authtoAdd:_getContextPath+'/auth/toAdd',
        authauthName:_getContextPath+'/auth/authName',
        authisNotRepeat:_getContextPath+'/auth/isNotRepeat',
        loglist:_getContextPath+'/log/list',
        logtype:_getContextPath+'/log/type',
        'getDBInfo':_getContextPath+'/dbManage/getDBInfo',
        'addMysqlInfo':_getContextPath+'/dbManage/addMysqlInfo',
        'addOracleInfo':_getContextPath+'/dbManage/addOracleInfo',
        'addSqlserverInfo':_getContextPath+'/dbManage/addSqlserverInfo',
        'editMysqlInfo':_getContextPath+'/dbManage/editMysqlInfo',
        'editOracleInfo':_getContextPath+'/dbManage/editOracleInfo',
        'editSqlserverInfo':_getContextPath+'/dbManage/editSqlserverInfo',
        'deleteDB':_getContextPath+'/dbManage/deleteDB',
        'getDBInfoByID':_getContextPath+'/dbManage/getDBInfoByID',
        'importDB':_getContextPath+'/dbManage/importDB',
//        'importSqlserverInfo':_getContextPath+'/dbManage/importSqlserverInfo',
//        'importOracleInfo':_getContextPath+'/dbManage/importOracleInfo',
        'exportDB':_getContextPath+'/dbManage/exportDB',
        'exportDBTemplet':_getContextPath+'/dbManage/exportDBTemplet',
        'appList': _getContextPath
        
    };
    window['Interface'] = Interface;
})();