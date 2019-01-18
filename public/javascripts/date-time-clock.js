function DateTime(callback) {
	
	var me =this;
	this.now(callback);
	waitInterval(function(){
		me.now(callback);
	},1000);
	
}
DateTime.prototype = {
	weekCN : new Array('星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'),
	now : function(callback) {
		var time = new Date();
		var year = time.getFullYear();
		var month = time.getMonth()+1;
		var date = time.getDate();
		var day = time.getDay();
		var hour = time.getHours();
		var minutes = time.getMinutes();
		var second = time.getSeconds();
		
//		month < 10 ? month = '0' + month : month;
		
		hour < 10 ? hour = '0' + hour : hour;
		minutes < 10 ? minutes = '0' + minutes : minutes;
		second < 10 ? second = '0' + second : second;
		var d = {
				year : year,
				month : month,
				date : date,
				week : this.weekCN[day - 1],
				h : hour,
				m : minutes,
				s : second
			};
		if(callback){
			callback(d);
		}
		
		return {
			year : year,
			month : month,
			date : date,
			week : this.weekCN[day - 1],
			h : hour,
			m : minutes,
			s : second
		}

	}

}
