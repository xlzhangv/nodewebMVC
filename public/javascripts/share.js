(function(){
    window.__proto__.Share ={
        __cache:{},
        __topWin:function () {
            var win;
            function home(w) {
                if (w.top === w.self) { // are you trying to put self in an iframe?
                    win = w;
                } else {
                    home(w.parent);
                }
            }
            home(this);
            return win;
        },
        data:function (name, value) {
            if (arguments.length == 0)
                return this.__topWin().__cache;
            else if (arguments.length == 1)
                return this.__topWin().__cache[name];
            else if (arguments.length == 2)
                this.__topWin().__cache
                    ? this.__topWin().__cache[name] = value
                    : this.__topWin().__cache={},this.__topWin().__cache[name] = {}, this.__topWin().__cache[name] = value;
        }
    }



})();