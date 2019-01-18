(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'echarts'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('echarts'));
    } else {
        // Browser globals
        factory({}, root.echarts);
    }
}(this, function (exports, echarts) {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };

    var theme = {
        "seriesCnt": "4",
        "backgroundColor": "rgba(0,0,0,0)",
        "titleColor": "#ffffff",
        "subtitleColor": "#ffffff",
        "textColorShow": false,
        "textColor": "#fff",
        "markTextColor": "#ffffff",
        "color": [
            "#dd6b66",
            "#759aa0",
            "#e69d87",
            "#8dc1a9",
            "#ea7e53",
            "#eedd78",
            "#73a373",
            "#73b9bc",
            "#7289ab",
            "#91ca8c",
            "#f49f42"
        ],
        "borderColor": "#ccc",
        "borderWidth": 0,
        "visualMapColor": [
            "#bf444c",
            "#d88273",
            "#f6efa6"
        ],
        "legendTextColor": "#ffffff",
        "kColor": "#fd1050",
        "kColor0": "#0cf49b",
        "kBorderColor": "#fd1050",
        "kBorderColor0": "#0cf49b",
        "kBorderWidth": 1,
        "lineWidth": 2,
        "symbolSize": 4,
        "symbol": "circle",
        "symbolBorderWidth": 1,
        "lineSmooth": false,
        "graphLineWidth": 1,
        "graphLineColor": "#aaa",
        "mapLabelColor": "#635656",
        "mapLabelColorE": "rgb(0,0,0)",
        "mapBorderColor": "#444",
        "mapBorderColorE": "#444",
        "mapBorderWidth": 0.5,
        "mapBorderWidthE": 1,
        "mapAreaColor": "#eee",
        "mapAreaColorE": "rgba(255,215,0,0.8)",
        "axes": [
            {
                "type": "all",
                "name": "通用坐标轴",
                "axisLineShow": true,
                "axisLineColor": "#fff",
                "axisTickShow": true,
                "axisTickColor": "#fff",
                "axisLabelShow": true,
                "axisLabelColor": "#ffffff",
                "splitLineShow": true,
                "splitLineColor": [
                    "#aaaaaa"
                ],
                "splitAreaShow": false,
                "splitAreaColor": [
                    "#eeeeee"
                ]
            },
            {
                "type": "category",
                "name": "类目坐标轴",
                "axisLineShow": true,
                "axisLineColor": "#fff",
                "axisTickShow": true,
                "axisTickColor": "#fff",
                "axisLabelShow": true,
                "axisLabelColor": "#ffffff",
                "splitLineShow": false,
                "splitLineColor": [
                    "#ccc"
                ],
                "splitAreaShow": false,
                "splitAreaColor": [
                    "rgba(250,250,250,0.3)",
                    "rgba(200,200,200,0.3)"
                ]
            },
            {
                "type": "value",
                "name": "数值坐标轴",
                "axisLineShow": true,
                "axisLineColor": "#fff",
                "axisTickShow": true,
                "axisTickColor": "#fff",
                "axisLabelShow": true,
                "axisLabelColor": "#ffffff",
                "splitLineShow": true,
                "splitLineColor": [
                    "#ccc"
                ],
                "splitAreaShow": false,
                "splitAreaColor": [
                    "rgba(250,250,250,0.3)",
                    "rgba(200,200,200,0.3)"
                ]
            },
            {
                "type": "log",
                "name": "对数坐标轴",
                "axisLineShow": true,
                "axisLineColor": "#fff",
                "axisTickShow": true,
                "axisTickColor": "#fff",
                "axisLabelShow": true,
                "axisLabelColor": "#ffffff",
                "splitLineShow": true,
                "splitLineColor": [
                    "#ccc"
                ],
                "splitAreaShow": false,
                "splitAreaColor": [
                    "rgba(250,250,250,0.3)",
                    "rgba(200,200,200,0.3)"
                ]
            },
            {
                "type": "time",
                "name": "时间坐标轴",
                "axisLineShow": true,
                "axisLineColor": "#fff",
                "axisTickShow": true,
                "axisTickColor": "#fff",
                "axisLabelShow": true,
                "axisLabelColor": "#ffffff",
                "splitLineShow": true,
                "splitLineColor": [
                    "#ccc"
                ],
                "splitAreaShow": false,
                "splitAreaColor": [
                    "rgba(250,250,250,0.3)",
                    "rgba(200,200,200,0.3)"
                ]
            }
        ],
        "axisSeperateSetting": false,
        "toolboxColor": "#999",
        "toolboxEmpasisColor": "#666",
        "tooltipAxisColor": "#ffffff",
        "tooltipAxisWidth": "1",
        "timelineLineColor": "#eeeeee",
        "timelineLineWidth": 1,
        "timelineItemColor": "#dd6b66",
        "timelineItemColorE": "#a9334c",
        "timelineCheckColor": "#e43c59",
        "timelineCheckBorderColor": "rgba(194,53,49, 0.5)",
        "timelineItemBorderWidth": 1,
        "timelineControlColor": "#eeeeee",
        "timelineControlBorderColor": "#eeeeee",
        "timelineControlBorderWidth": 0.5,
        "timelineLabelColor": "#ffffff",
        "datazoomBackgroundColor": "rgba(47,69,84,0)",
        "datazoomDataColor": "rgba(255,255,255,0.3)",
        "datazoomFillColor": "rgba(167,183,204,0.4)",
        "datazoomHandleColor": "#a7b7cc",
        "datazoomHandleWidth": "100",
        "datazoomLabelColor": "#eeeeee"
    };
    echarts.registerTheme('dark', theme);
}));