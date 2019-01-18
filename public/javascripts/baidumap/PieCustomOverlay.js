(function () {



    // 复杂的自定义覆盖物
    function PieOverlay(point,config){
        this._point = point;
        this.confim;
        this.changeEnd=true;
        this.planData;
        this.pieData={};
        this.changestatus = 0;
        this.config = config?config:{
            height:200,
            width:200
        };
    }
    PieOverlay.prototype = new BMap.Overlay();

    PieOverlay.prototype.initialize = function(map){
        var me = this;
        this._map = map;
        var div = this._div = document.createElement("div");
        div.style.position = "absolute";
        div.style.zIndex = 10;
        div.style.backgroundColor = "transparent";
//        div.style.border = "1px solid #BC3B3A";
        div.style.color = "white";
        div.style.height = (this.config.height||250)+'px';
        div.style.width = (this.config.width||250)+'px';
        div.style.padding = "2px";
        div.style.lineHeight = "18px";
        div.style.whiteSpace = "nowrap";
        div.style.MozUserSelect = "none";
        div.style.fontSize = "12px"

        var  pieDiv = document.createElement("div");
        pieDiv.style.height = '100%';
        pieDiv.style.width = '100%';
        pieDiv.style.borderRadius='50%';
        div.appendChild(pieDiv);
        this.pie = new D3Pie(d3.select(pieDiv),{
            height:this.config.height,
            width:this.config.width,
            tipFormatter:function(result){
                if(result.plan){
                // #F29D39
                //     result['color'] = result.plan.changestatus==-1?'#355fa1':'#B02318'
                    return template('pie-plan-template',result);
                }else{
                    return template('pie-tip-template',result.data);
                }

            },
            event:{
                onclick:function (d) {
                    console.info(d);
                }
            }
        });



        mp.getPanes().labelPane.appendChild(div);

        $(div).on('mousemove',function (e) {
                e.stopPropagation();
                return false;
            }).on('mouseover',function (e) {
                e.stopPropagation();
                return false;
            }).on('click',function (e) {
                if(me.confim)me.confim.show();
                mp.panTo(me._point);
                e.stopPropagation();
              return false;
          })

        return div;
    }

    function changeminus(p) {
        var down=true;
        for(var i =0;i<groupOverlay[p.plan.group_id].length;i++){
            if(!groupOverlay[p.plan.group_id][i].planData){
                down=false;
                break;
            }
            if(groupOverlay[p.plan.group_id][i].planData.plan.changestatus!=-1){
                down = false;
                break;
            }
            if(p.plan.cycle<groupOverlay[p.plan.group_id][i].planData.plan.cycle){
                down = false;
                break;
            }
        }
        return down
    }
    function changecycle(p) {

        if(groupOverlay[p.plan.group_id]){
            if(p.plan.changestatus==-1){
                var down=true;//changeminus(p);
                if(down){
                    for(var i=0;i<groupOverlay[p.plan.group_id].length;i++){
                        if(groupOverlay[p.plan.group_id][i].confim){
                            // groupOverlay[p.plan.group_id][i].confim.settings.params = p;
                            groupOverlay[p.plan.group_id][i].confim.stopInterval();
                            groupOverlay[p.plan.group_id][i].confim.hidden();
                            groupOverlay[p.plan.group_id][i].pie.updateLamp(0);
                        }
                        if(groupOverlay[p.plan.group_id][i].pieData.plan.junction_id==p.plan.junction_id){
                            groupOverlay[p.plan.group_id][i].planData= p;
                            groupOverlay[p.plan.group_id][i].updatePie(p);
                            plantable.updateRow(p.plan);
                            runStatustable.removeRow(p.plan);
                        }else{
                            var newP =objCopy(objCopy({},p),{
                                plan:{
                                    junction_id:groupOverlay[p.plan.group_id][i].pieData.plan.junction_id,
                                    junction_name:groupOverlay[p.plan.group_id][i].pieData.plan.junction_name
                                }
                            });

                            if(!groupOverlay[newP.plan.group_id][i].planData){
                                groupOverlay[newP.plan.group_id][i].planData = newP;
                            }else{
                                groupOverlay[newP.plan.group_id][i].planData.plan.planIndex= newP.plan.planIndex;
                                groupOverlay[newP.plan.group_id][i].planData.plan.cycle=newP.plan.cycle;
                                groupOverlay[newP.plan.group_id][i].planData.plan.offset=newP.plan.offset;
                                groupOverlay[newP.plan.group_id][i].planData.plan.planname = newP.plan.planname;
                            }
                            groupOverlay[newP.plan.group_id][i].changePie(newP);
                            plantable.updateRow(newP.plan);
                            runStatustable.removeRow(newP.plan);
                        }
                        groupOverlay[p.plan.group_id][i].changeEnd = true;
                    }
                }else{
                    console.info('忽略周期');
                }
            }else{

                for(var i=0;i<groupOverlay[p.plan.group_id].length;i++){
                    if(groupOverlay[p.plan.group_id][i].confim){
                        // groupOverlay[p.plan.group_id][i].confim.settings.params = p;
                        groupOverlay[p.plan.group_id][i].confim.stopInterval();
                        groupOverlay[p.plan.group_id][i].confim.hidden();
                        groupOverlay[p.plan.group_id][i].pie.updateLamp(0);
                    }

                    if(groupOverlay[p.plan.group_id][i].pieData.plan.junction_id==p.plan.junction_id){
                        groupOverlay[p.plan.group_id][i].updatePie(p);
                        plantable.updateRow(p.plan);
                        runStatustable.removeRow(p.plan);
                    }else{
                        var newP =objCopy(objCopy({},p),{
                            plan:{
                                junction_id:groupOverlay[p.plan.group_id][i].pieData.plan.junction_id,
                                junction_name:groupOverlay[p.plan.group_id][i].pieData.plan.junction_name
                            }
                        });

                        if(!groupOverlay[newP.plan.group_id][i].planData){

                            groupOverlay[newP.plan.group_id][i].planData = newP;
                        }else{
                            groupOverlay[newP.plan.group_id][i].planData.plan.planIndex= newP.plan.planIndex;
                            groupOverlay[newP.plan.group_id][i].planData.plan.cycle=newP.plan.cycle;
                            groupOverlay[newP.plan.group_id][i].planData.plan.offset=newP.plan.offset;
                            groupOverlay[newP.plan.group_id][i].planData.plan.planname = newP.plan.planname;
                        }
                        groupOverlay[newP.plan.group_id][i].changePie(newP);
                        plantable.updateRow(newP.plan);
                        runStatustable.removeRow(newP.plan);
                    }
                    groupOverlay[p.plan.group_id][i].changeEnd = true;
                }

            }

        }
    }
    PieOverlay.prototype.buildConfim = function(data){
        var me =this;
        this.confim = new UIconfirm({
            title : '',
            content : '',
            autoClose:true,
            time:Confirm_Time,
            event:{
                ondestroy:function (p,check) {
                    runStatustable.removeRow(p.plan);
                    me.pie.updateLamp(0);
                    if(check){
                        changecycle(p);
                    }else{
                        me.pie.updateLamp(0);
                    }
                    me.changeEnd = true;
                },
                interval:function (t,p) {
                    $('.'+p.plan.junction_id).html(t);
                },
                onOk:function (d) {
                    // me.pie.updateLamp(d.plan.changestatus);
                },
                onCancel:function (p) {
                    p.changestatus=0;
                    me.pie.updateLamp(0);
                    // plantable.updateRow(p);

                }
            }
        },mp.getPanes().labelPane);

        var pixel = this._map.pointToOverlayPixel(this._point);

        this.confim.move({
            left:(pixel.x -this.config.width/2),
            top:(pixel.y - this.config.height/2) - this.config.height/1.5
        });
    }

    PieOverlay.prototype.changePie = function(data){
        if(this.pie){
            this.pie.setData(buildPieData(this.pieData,data.plan.planIndex));
        }
    }
    PieOverlay.prototype.updatePie = function(data){
        if(this.pie){
            this.pieData = objCopy(this.pieData,data);
            this.pie.setData(buildPieData(this.pieData,this.pieData.plan.planIndex));
            // this.pie.setData(data);
            if(lineOverlay[data.plan.junction_id]){
                lineOverlay[data.plan.junction_id].setStrokeColor(changestatusColor(data.plan.changestatus));
            }

        }
    }

    PieOverlay.prototype.updateConifm = function(data){
        this.changeEnd = false;
        if(!this.confim){
            this.buildConfim(data);
        }
        if(data.plan.changestatus!=0){
            this.planData =data;
            runStatustable.addRow(data.plan);
            this.pie.updateLamp(data.plan.changestatus);
            this.confim.build({
                title : data.plan.planname+'(C:'+data.plan.cycle+';O:'+data.plan.offset+')',
                content : '<p style="font-size: 18px;font-weight: 700;">切换对象:'+(data.plan.target_type==1?'所在子区':'本路口')+'</p>',
                flagColor:data.plan.changestatus==-1?'#355fa1':'#B02318',
                time:Confirm_Time,
                params:data,
            });
            this.confim.startInterval();

        }

    }

    PieOverlay.prototype.draw = function(){
        var map = this._map;
        var pixel = map.pointToOverlayPixel(this._point);
        this._div.style.left = (pixel.x -this.config.width/2)+"px";
        this._div.style.top  = (pixel.y -this.config.height/2)+ "px";



        if(this.confim) this.confim.move({
            left:(pixel.x -this.config.width/2),
            top:(pixel.y - this.config.height/2) - this.config.height/1.5
        });
        if( this.tempAlert){
            this.tempAlert.move({
                left:(pixel.x -this.config.width/2),
                top:(pixel.y - this.config.height/2) - this.config.height/2
            });
        }


    }

    function buildPieData(data,planIndex) {
        var d = data.stages[planIndex];
        var result={};
        result.plan = objCopy(data.plan,{
            cycle:d.cycle,
            offset:d.offset
        });
        result.data=[];

        for(var k in d.data){
            var t = d.data[k];
            t.cycle = data.plan.cycle;
            result.data.push(t);
        }

        return result;

    }
    window.PieOverlay = PieOverlay;



})();