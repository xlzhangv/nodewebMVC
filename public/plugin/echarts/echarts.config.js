(function (echarts, w) {
    echarts.config = {
        vbar: {
            grid: {
                top: '30',
                left: '30',
                right: '40',
                bottom: '3%',
                containLabel: true
            }
        },
        tbar: {
            grid: {
                top: '50',
                left: '30',
                right: '3%',
                bottom: '100',
                containLabel: true
            }
        },
        mapBar: {
            grid: {
                top: '1%',
                left: '-30',
                right: '1%',
                bottom: '1%',
                containLabel: true
            }
        },
        line: {
            grid: {
                top: '50',
                left: '30',
                right: '40',
                bottom: '3%',
                containLabel: true
            }
        },
        scatter: {
            grid: {
                top: '3%',
                left: '3%',
                right: '3%',
                bottom: '3%',
                containLabel: true
            }
        }
    }
    echarts.util.valueFormat = function (value, piff) {
        if (value / 100000000 >= 1) {
            return parseInt(value / 100000000) + '亿';
        } else if (value / 10000 >= 1) {
            return parseInt(value / 10000) + '万';
        }
        else if (value / 1000 >= 1) {
            return value / 1000 + 'k';
        } else {
            return value;
        }
    }

})(echarts, window);