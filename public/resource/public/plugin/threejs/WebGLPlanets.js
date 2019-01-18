/**
 *
 */
(function (d3) {
    __getJSPath = function (js) {
        var scripts = document.getElementsByTagName("script");
        var path = "";
        for (var i = 0, l = scripts.length; i < l; i++) {
            var src = scripts[i].src;
            if (src.indexOf(js) != -1) {
                var ss = src.split(js);
                path = ss[0];
                break;
            }
        }
        var href = location.href;
        href = href.split("#")[0];
        href = href.split("?")[0];
        var ss = href.split("/");
        ss.length = ss.length - 1;
        href = ss.join("/");
        if (path.indexOf("https:") == -1 && path.indexOf("http:") == -1 && path.indexOf("file:") == -1 && path.indexOf("\/") != 0) {
            path = href + "/" + path;
        }
        return path;
    }

    var BASE_PATH = __getJSPath("WebGLPlanets.js");

    // 拷贝对象
    function objCopy() {
        var target = arguments[0] || {},
            source,
            i = 1,
            length = arguments.length;

        function is(obj, type) {
            var toString = Object.prototype.toString;
            return (type === "Null" && obj === null)
                || (type === "Undefined" && obj === undefined)
                || toString.call(obj).slice(8, -1) === type;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((source = arguments[i]) != null) {
                // Extend the base object
                for (var key in source) {
                    var copy = source[key];
                    if (source === copy)
                        continue; // 如window.window === window，会陷入死循环，需要处理一下
                    if (is(copy, "Object")) {
                        target[key] = arguments.callee(target[key] || {}, copy);
                    } else if (is(copy, "Array")) {
                        target[key] = arguments.callee(target[key] || [], copy);
                    } else {
                        target[key] = copy;
                    }
                }
            }
        }
        source = null;

        return target;
    }

    window.requestAnimationFrame =
        window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame
        || window.msRequestAnimationFrame;
    function RingTween(mesh) {
        this.mesh = mesh;
        this.create();
    }

    RingTween.prototype = {
        mesh: undefined,
        _start: 0,
        k: 1,
        v:0,
        create: function () {
            var me = this;
            this.opacity = d3.scaleLinear().domain([1, 1.5]).range([0.9, 0.5]);
            this.c = d3.scaleLinear().domain([1, 1.5]).range([1.8, 1.]);
            this.v = this.mesh.scale.z
            this.mesh.material.needsUpdate = true;
        },
        run: function () {
            if(!this._start) return;
            var me = this;
            this.k += 0.005;
            var to = {x: this.k*this.v, y: this.k*this.v, z: this.k*this.v};
            this.mesh.material.uniforms.o.value =this.opacity(this.k);
            this.mesh.material.uniforms.c.value = this.c(this.k);
            for (var field in me.mesh.scale) {
                me.mesh.scale[field] =to[field];
            }
	        
	         
            if (this.k > 1.5) {
                this.k = 1;
            }
            requestAnimationFrame(function () {
                me.run();
            });
        },
        start:function () {
            this._start=1;
            this.run();
        },
        stop:function () {
            this._start=0;
        }
    }

    function randomColor() {
        var rainbow = d3.scaleSequential(d3.interpolateWarm);

        return rainbow(Math.random()).toString();
    }
    
    /**
     * 函数节流方法
     * @param Function fn 延时调用函数
     * @param Number delay 延迟多长时间
     * @return Function 延迟执行的方法
     */
    var Throttle = function (fn, delay) {
        var timer = null;
        var previous = null;
        return function () {
            var now = +new Date();
            if (!previous) previous = now;
            var editors = arguments;

            if (now - previous > delay) {
                fn.apply(null, editors);
                previous = now;
                clearTimeout(timer);
            } else {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    fn.apply(null, editors);
                }, delay);
            }

        }
    };

    function WebGLPlanets(id,config) {
        if(config){
            objCopy(this.settings, config);
        }
        this.id = '_' + (+new Date());
        this.init(id);
    }

    WebGLPlanets.CAMERA_Z = 600;
    WebGLPlanets.ROTATION_Z = 0.0005;

    WebGLPlanets.prototype = {
        width: 0,
        height: 0,
        clientRect:undefined,
        maxR: 10,
        temp_rotation:0,
        _nodedata: {},//标记点
        _extramarkdata: [],//源
        drawTimer: undefined,
        view: null,
        settings:{
            atmosphere:true,
            showtext: true,
            maxcount: 1,
            events:{
                onClick:function () {

                },
                onBefore:function () {

                },
                onEnd:function () {

                },
                onComplete:function () {
                    
                }
            },
            tipFormatter:function(data){
                return data.name;
            }
        },
        _scene: undefined,//场景
        _camera: undefined,//摄像机
        _defposition: undefined,
        _controls: undefined,//控制器
        _renderer: undefined,//渲染器
        _intersected: undefined,//相交
        _sourceray: new THREE.Raycaster(),//源射线
        _lineobj: new THREE.Object3D(),//线
        _sourceObj: new THREE.Object3D(),//源
        _labelObj: new THREE.Object3D(),//tip提示组
        _centerSphere:undefined,//中心球
        _centerGroup: new THREE.Group(),//中心组
        _ringGroup: new THREE.Group(),//节点组
        _animGroup: new THREE.Group(),//动画组
        _nodeGroup: new THREE.Group(),//节点组
        _highlightMaterial: new THREE.MeshBasicMaterial({color: 0x253230, transparent: true, opacity: 0.8}),//高亮
     
        __buildToolTip: function () {
            //提示框 （注意设置提示框的绝对路径）
            var deftipCss = {
                'margin': '3px',
                'position': 'absolute',
                'visibility': 'hidden',
                'border-style': 'solid',
                'white-space': 'nowrap',
                'z-inde': '9999999',
                'transition': '0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                'background-color': 'rgba(50, 50, 50, 0.7)',
                'border-width': '0px',
                'border-color': 'rgb(51, 51, 51)',
                'border-radius': '4px',
                'color': '#fff',
                'opacity': '0',
                'font-style': 'normal',
                'font-variant': 'normal',
                'font-weight': 'normal',
                'font-stretch': 'normal',
                'font-size': '14px',
                'font-family': 'sans-serif',
                'line-height': '21px',
                'padding': '5px',
                'left': '0',
                'top': '0'
            }
            this._tooltip = this.view.append('div').attr('id', this.id + '-tooltip').attr('class', 'tooltip');
            for (var k in deftipCss) {
                this._tooltip.style(k, deftipCss[k]);

            }
        },
        _showTip: function (data, point) {
        		var me =this;
            this._tooltip.style('visibility', 'visible').style('opacity', '1').html(this.settings.tipFormatter(data))
            .style('top',function(){
            		if(point.y+this.getBoundingClientRect().height>me.height){
            			return (point.y - this.getBoundingClientRect().height)+'px';
            		}
            		return point.y + 'px';
            }).style('left',function(){
            		if(point.x+this.getBoundingClientRect().width>me.width){
            			return (point.x - this.getBoundingClientRect().width)+'px';
            		}
            		return point.x + 'px';
            });
        },
        _hideTip: function () {
            this._tooltip.style('visibility', 'hidden').style('opacity', '0')

        },
        _shader: {
            "vertex": [
                'uniform vec3 viewVector;',
                'uniform float s;',
                'uniform float c;',
                'uniform float p;',
                'varying float intensity;',
                'void main(){',
                'vec3 vNormal = normalize( normalMatrix * normal );',
                'vec3 vNormel = normalize( normalMatrix * viewVector );',
                'intensity = pow(c - dot(vNormel,vNormal), p);',
                'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, s);',
                '}'
            ].join(''),
            "fragment": [
            	'uniform float o;',
                'uniform vec3 glowColor;',
                'varying float intensity;',
                'void main(){',
                'vec3 glow = glowColor * intensity;',
                'gl_FragColor = vec4( glow, o);',
                '}'
            ].join('')
        },
        __createSphere: function (color, o) {
            return new THREE.ShaderMaterial({
                uniforms: {
                	"s":{type: "f", value: 0.95},
                    "c": {type: "f", value: 1.98},
                    "o":{type: "f", value: o?o:0.6 },
                    "p": {type: "f", value: 4.2},
                    glowColor: {type: "c", value: new THREE.Color(color)},
                    viewVector: {type: "v3", value: this._camera.position}
                },
                vertexShader: this._shader.vertex,
                fragmentShader: this._shader.fragment,
                side: THREE.FrontSide,
                blending: THREE.AdditiveBlending,
                transparent: true
            })
        },
        radio: function () {
            this.clientRect = this.view.node().getBoundingClientRect();
            this.width =this.clientRect.width,
                this.height = this.clientRect.height;
            return this.width / this.height;
        },
        init: function (id) {
            this.view = d3.select(id);
            this._drawScene();
//            this._highlightMaterial = this.__createSphere(0xFFFFFF);
            this.__buildToolTip();
            this._events();
           
        },
        __getHiddenProp: function () {
            var prefixes = ['webkit', 'moz', 'ms', 'o'];
            if ('hidden' in document) return 'hidden';
            for (var i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + 'hidden') in document)
                    return prefixes[i] + 'hidden';
            }
            return null;
        },
        __getVisibilityEvent: function () {
            var prefixes = ['webkit', 'moz', 'ms', 'o'];
            if ('visibilityState' in document) return 'visibilitychange';
            for (var i = 0; i < prefixes.length; i++) {
                if ((prefixes[i] + 'visibilityState') in document)
                    return prefixes[i] + 'visibilitychange';
            }
            return null;
        },
        _events: function () {
            var me = this;

            var event = this.__getVisibilityEvent();
            if (event) {
                document.addEventListener(event, function () {
                    me.__documentHidden = document[me.__getHiddenProp()];
//                    me._clearData();
                }, false);
            }

            this.view.on('dblclick', function () {
                me.resetGlobe();
            });
            this.view.on('mousemove', function () {
                me.__onDocumentMouseMove();
            });
            this.view.on('mouseup', function () {
                // d3.event.stopPropagation();
                me.__onDocumentMouseUp();
            });
        },
        _mouseVector: new THREE.Vector3(0, 0, 0),
        _sourcemouseVector: new THREE.Vector3(0, 0, 0),
        _polygons: undefined,
        _tempLabel: undefined,
        __onDocumentMouseMove: function () {
            var clientX = (d3.event.clientX-this.clientRect.left-parseInt(this.view.style('padding'))),
                clientY = (d3.event.clientY-this.clientRect.top-parseInt(this.view.style('padding')));
            this._mouseVector.x = (clientX / this.width) * 2 - 1,
                this._mouseVector.y = -(clientY / this.height) * 2 + 1;

            this._sourceray.setFromCamera(this._mouseVector, this._camera);
            var intersects = this._sourceray.intersectObjects(this._extramarkdata);
            if (intersects.length > 0) {
                if (this._intersected != intersects[0].object) {
                    if (this._intersected) {
                        this._intersected.material = this._defaultmaterial;
                    }
                    this._intersected = intersects[0].object;
                    this._defaultmaterial = this._intersected.material;
                    this._intersected.material.needsUpdate = true;
                    this._intersected.material = this._highlightMaterial;
                }
                this.temp_rotation =0;

                this._showTip(this._intersected.userData,{x:clientX,y:clientY});
            } else {
                if (this._intersected) {
                    this._intersected.material = this._defaultmaterial;
                }
                this.temp_rotation = WebGLPlanets.ROTATION_Z;
                this._intersected = null;
                this._hideTip();
            }
        },
        //恢复renderer初始状态
        resetGlobe:function (){
            var me =this;
            var t=new TWEEN.Tween(this._camera.position).to({x:0,y:0,z:WebGLPlanets.CAMERA_Z},1000).start();
            t.onComplete(function(){
                me._controls.reset();
            });
        },

        _selectedId:undefined,
        __onDocumentMouseUp: function () {
            var me =this;
            if (this._intersected) {
				this._camera.position.set(0,0,WebGLPlanets.CAMERA_Z);
//                if(this._selectedId==me._intersected.userData.APP_ID) return;

                this.clearObject();
                // this._centerSphere.position.copy(this._intersected.position);
                var sphereGeometry = new THREE.SphereGeometry(this.maxR, 32, 32)
                var pattern = new THREE.ImageUtils.loadTexture(BASE_PATH+"image/patterns.png");
                pattern.wrapS = pattern.wrapT = THREE.RepeatWrapping;
                pattern.repeat.set(100, 100);
                material = new THREE.MeshBasicMaterial({
                    map: pattern,
                    side: THREE.FrontSide,
                    color: 0xFEF6A7,
                    wireframe: true,
                    transparent: true,
                    opacity: 1
                });
                this._centerSphere = new THREE.Mesh(sphereGeometry, material);//中心球
                this._centerSphere.scale.setScalar(0);
                this._centerSphere.position.copy(this._intersected.position);
                this._centerSphere.updateMatrix();
                this._centerSphere.userData = me._intersected.userData;
                this._centerGroup.add(this._centerSphere);

                this._extramarkdata.push(this._centerSphere);

                new TWEEN.Tween(this._centerSphere.position).to({x:0,y:0,z:0},1000).start();
                var s = new TWEEN.Tween(this._centerSphere).to({x:0,y:0,z:0},1000).start();

                s.onComplete(function () {
                    me.createRingMsg(this.userData, me._centerSphere.position);
                    me.__destroyObject3D(me._nodeGroup.children,function (obj) {
                        me._nodeGroup.remove(obj);
                    });
                    me.__destroyObject3D(me._centerGroup.children,function (obj) {
		                me._centerGroup.remove(obj);
		            });
                    me.settings.events.onComplete(this.userData);
                });
                s.onUpdate(function(v){
                    var sc=this;
                    sc.scale.set(v*9,v*9,v*9);
                });

                me.settings.events.onClick(this._intersected.userData);
            }
        },
        _drawScene: function () {
            var me = this;

            this.view.style('position', 'relative');
            this._scene = new THREE.Scene();
            this._camera = new THREE.PerspectiveCamera(40, this.radio(), 1, 15000);
            this._scene.add(this._camera);
            this._camera.position.set(0, 0, WebGLPlanets.CAMERA_Z);
            this._camera.lookAt(this._scene.position);//设置视野的中心坐标
            this._buildControls();


            this._renderer = new THREE.WebGLRenderer({alpha: true, antialias: true});
            if (WebGLPlanets.setPixelRatio) {
                this._renderer.setPixelRatio(window.devicePixelRatio);
            }

            this._renderer.clear();
            this._renderer.setSize(this.width, this.height);
            this.view.node().appendChild(this._renderer.domElement);
            this._buildGroup();
//            this.buildBack();
            this.temp_rotation = WebGLPlanets.ROTATION_Z;
        },
        _buildControls: function () {
            this._controls = new THREE.OrbitControls(this._camera, this.view.node());
            this._controls.maxDistance = 3000.0;
            this._controls.center.set(0, 0, 0);

        },
        validWebGL: function () {
            var canvas = document.createElement('canvas');
            var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) {
                console.log('浏览器不支持WebGL');
                return false;
            } else {
                return true;
            }
        },
        _buildGroup: function () {
            this._scene.add(new THREE.HemisphereLight(0x333333, 0x333333, 1));

            var lights1 = new THREE.HemisphereLight(0xffffbb, 0xffffff, 1);

            lights1.position.set(0, WebGLPlanets.CAMERA_Z, 0);

            this.obj3d = new THREE.Object3D();
            this.obj3d.add(lights1);
            this.obj3d.add(this._centerGroup);
            this.obj3d.add(this._ringGroup);
            this.obj3d.add(this._animGroup);
            this.obj3d.add(this._nodeGroup);
            this._scene.add(this.obj3d);

        },
        buildLinear:function(min,max){
            this._sphereLinear = d3.scaleLinear().domain([min, max]).range([this.maxR/12, this.maxR/3])
        },
        buildBack:function(){
            var galacticTopMaterial = new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture(BASE_PATH+'image/galactictop.png'),
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                side: THREE.DoubleSide,
                transparent: true,
                opacity:0.3
            });
            var plane = new THREE.Mesh( new THREE.PlaneBufferGeometry(1000,1000, 30, 30), galacticTopMaterial );
            plane.material.map.anisotropy = this._renderer.getMaxAnisotropy();
            this._ringGroup.add( plane );
        },
        scalarLinear:d3.scaleLinear().domain([0, 1]).range([1.3, 2.2]),
 
        _drawSphere: function (data, isCenter) {
            var me = this;
            var sphereGeometry = new THREE.SphereGeometry(this.maxR, 32, 32),
                scale = 9,
                material;
            if (isCenter) {
            		var loader = new THREE.TextureLoader();
            		loader.load(BASE_PATH+"image/patterns.png", function (pattern) {
            			pattern.wrapS = pattern.wrapT = THREE.RepeatWrapping;
	                pattern.repeat.set(100, 100);
	                material = new THREE.MeshBasicMaterial({
	                    map: pattern,
	                    side: THREE.FrontSide,
	                    color: 0xFEF6A7,
	                    wireframe: true,
	                    transparent: true,
	                    opacity: 1
	                });
	                me._centerSphere = new THREE.Mesh(sphereGeometry, material);//中心球
	                me._centerSphere.scale.setScalar(9);
	                me._centerSphere.position.set(0, 0, 0);
	                me._centerSphere.updateMatrix();
	                me._centerSphere.userData = data;
	                me._centerGroup.add(me._centerSphere);
	                me._extramarkdata.push(me._centerSphere);
	
	                var glow = me._centerSphere.clone();
	                if(data.exceptionFlag){
	                	 glow.material = me.__createSphere('red');
	                }else{
	                	 glow.material = me.__createSphere(0xffff00);
	                }
	               
	                me._animGroup.add(glow);
	                glow.material.needsUpdate = true;
	                new TWEEN.Tween(glow.material.uniforms.c).to({value: 1}, 1500).start().repeat(Infinity)
	                me.createRingMsg(data, me._centerSphere.position);
            		})
                
            } else {
                sphereGeometry = new THREE.SphereGeometry(this.maxR, 32, 32);
                var angle = Math.PI * (Math.random() * 2);
                var vector = new THREE.Vector3();
                vector.x = Math.cos(angle)*2.5 + 0.5;
                vector.y = Math.sin(angle)*2.5 + 0.5;
                vector.z = Math.random() * 2 - 1;
                vector.normalize();
                vector.multiplyScalar(this.maxR  * scale * me.scalarLinear(Math.random()));
                var loader = new THREE.TextureLoader();
                loader.load(BASE_PATH+"image/moon.jpg", function (texture) {
                    material = new THREE.MeshBasicMaterial({
                        map: texture,
                        side: THREE.FrontSide,
                        color:data.color?new THREE.Color(data.color):0xFEF6A7,
                        // wireframe: true,
                        transparent: true,
                        opacity: 1
                    });
                    var nodeSphere = new THREE.Mesh(sphereGeometry, material);//中心球
                    nodeSphere.updateMatrix();
                    nodeSphere.scale.setScalar(me._sphereLinear(data.FLOW));
                    nodeSphere.position.copy(vector);
                    nodeSphere.lookAt(me._camera.position);
                    nodeSphere.userData = data;
                    nodeSphere.material.opacity = 1;
                    me._extramarkdata.push(nodeSphere);

                    me._nodeGroup.add(nodeSphere);

                    var specular = nodeSphere.clone();
                    specular.material.needsUpdate = true;
                    specular.userData = data;
                    // specular.rotateZ(Math.PI);
                    var tween;
//                    ringTween = new RingTween(specular);

                    if(data.exceptionFlag){
//                    		specular.material = me.__createSphere('red');
//                    		ringTween.start();
                    		specular.material = me.__createSphere(randomColor(),0.3);
                    		tween = new TWEEN.Tween(specular.material.uniforms.c).to({value: 1}, 2000).repeat(Infinity);
                    	 	tween.start();
                    }else{
//                    		specular.material = me.__createSphere(randomColor(),0.3);
//                    		tween = new TWEEN.Tween(specular.material.uniforms.c).to({value: 1}, 2000).repeat(Infinity);
//                    	 	tween.start();
                    }
                    me._animGroup.add(specular);

                    // specular.isNormal=false;
                    specular.material.needsUpdate = true;
                    // s.material.color=new THREE.Color(0xff0000);
                    me._nodedata[data.APP_ID] = {
                        mesh: specular,
//                        ringtween:ringTween,
                        tween: tween
                    }
                    tween = null;
                })
            }
        },
        __buildShaderMaterial: function (url, callback) {
            var loader = new THREE.TextureLoader();
            loader.load(url, function (texture) {

                var material = new THREE.ShaderMaterial({
                    uniforms: {
                        tMatCap: {
                            type: 't',
                            value: texture
                        },
                        mixAmount: {
                            type: "f",
                            value: 0.0
                        }
                    },
                    vertexShader: [
                        'varying vec2 vN;',
                        'void main() {',
                        'vec4 p = vec4( position, 1. );',
                        'vec3 e = normalize( vec3( modelViewMatrix * p ) );',
                        'vec3 n = normalize( normalMatrix * normal );',
                        'vec3 r = reflect( e, n );',
                        'float m = 2. * length( vec3( r.xy, r.z + 1. ) );',
                        'vN = r.xy / m + .6;',
                        'gl_Position = projectionMatrix * modelViewMatrix * p;',
                        '}'
                    ].join('\n'),
                    fragmentShader: [
                        'uniform sampler2D tMatCap;',
                        'varying vec2 vN;',
                        'void main() {',
                        'vec3 base = texture2D( tMatCap, vN ).rgb;',
                        'gl_FragColor = vec4( base, 1. );',
                        '}'
                    ].join('\n'),
                    shading: THREE.SmoothShading
                });
                material.uniforms.tMatCap.value.wrapS = material.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;
                callback(material);
            });
        },
        _tempTween:[],
        clearObject:function () {
            var me =this;

            this.__destroyObject3D(this._centerGroup.children,function (obj) {
                me._centerGroup.remove(obj);
            });
            this.__destroyObject3D(this._ringGroup.children,function (obj) {
                me._ringGroup.remove(obj);
            });
            var  ng  = this._nodeGroup.children,
                l =ng.length;
            for(var i=0;i<l;i++){
	            	ng[i].material.needsUpdate = true;
	            	var t = new TWEEN.Tween(ng[i].material).to({opacity:0},1000).start();
	            	me._tempTween.push(t);
	            	TWEEN.add(t);
	            	if(i==l-1){
	            		for(var j=0;j<me._tempTween.length;j++){
	            			TWEEN.remove(me._tempTween[i]);
	            		}
	            		me._tempTween=[];
	            	}
            }
            
           
            this.__destroyObject3D(this._animGroup.children,function (obj) {
                me._animGroup.remove(obj);
            });

            this._highlightMaterial = new THREE.MeshBasicMaterial({color: 0x253230, transparent: true, opacity: 0.8});
            this._nodedata={};
            this._extramarkdata=[];

        },
        __destroyObject3D:function(list,df){

            if(list.length==0){
                return;
            }else{
                df(list.pop());
                this.__destroyObject3D(list,df);
            }

        },
        createRingMsg: function (data, vector) {
            var me =this;
            this.__destroyObject3D(this._ringGroup.children,function (obj) {
                me._ringGroup.remove(obj);
            });

            this._drawRing2FlowLink({
                text: BytesTo(data.FLOW ? data.FLOW : 0),
                color: '#1eff00',
                r: this.maxR * 9 + 4,
                direction: 'left'
            }, vector.clone());

            this._drawRing2FlowLink({
                text: (data.SESSION ? data.SESSION : 0),
                color: '#fff700',
                r: this.maxR * 9 + 8,
                direction: 'right'
            }, vector.clone());
        },

        //流量与连接圆弧
        _drawRing2FlowLink: function (config, vector) {
            // var rgb = d3.rgb(color);
            // var t3color = new THREE.Color("rgb(" + rgb.r + "," + rgb.g + "," + rgb.b + ")");
			var offset = 40;
            var geometry = new THREE.RingGeometry(config.r, config.r + 1, 100);
            var material = new THREE.MeshBasicMaterial({color: config.color, side: THREE.DoubleSide});
            var mesh = new THREE.Mesh(geometry, material);
            this._ringGroup.add(mesh);

            var material = new THREE.LineBasicMaterial({color: config.color});
            var geometry = new THREE.Geometry(),
                textVector;
            switch (config.direction) {
                case 'top':
                    textVector = new THREE.Vector3(0, config.r + 30 + 10, 0);
                    geometry.vertices.push(
                        new THREE.Vector3(0, config.r, 0),
                        new THREE.Vector3(0, config.r + offset, 0)
                    );
                    break;
                case "left":
                    textVector = new THREE.Vector3(-config.r - offset + 10, 10, 0);
                    geometry.vertices.push(
                        new THREE.Vector3(-config.r, 0, 0),
                        new THREE.Vector3(-config.r - offset, 0, 0)
                    );
                    break;
                case "bottom":
                    textVector = new THREE.Vector3(0, -config.r - offset, 0);
                    geometry.vertices.push(
                        new THREE.Vector3(0, -config.r, 0),
                        new THREE.Vector3(0, -config.r - offset, 0)
                    );
                    break;
                case "right":
                    textVector = new THREE.Vector3(config.r + offset - 10, 10, 0);
                    geometry.vertices.push(
                        new THREE.Vector3(config.r, 0, 0),
                        new THREE.Vector3(config.r + offset, 0, 0)
                    );
                    break;
                default:
                    textVector = new THREE.Vector3(0, config.r + offset, 0);
                    geometry.vertices.push(
                        new THREE.Vector3(config.r, 0, 0),
                        new THREE.Vector3(config.r + offset, 0, 0)
                    );
                    break;

            }

            var line = new THREE.Line(geometry, material);
            this._ringGroup.add(line);
            this.__makeTextSprite(config, textVector);
        },
        //生成canvas文字
        __makeTextSprite: function (config, vertices) {
            var me = this;
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.clearRect(0, 0, 50, 50);
            // context.font = "normal normal bold 22px Arial";
            canvas.width = context.measureText(config.text).width;
            canvas.height = 25;
            context.fillStyle = "rgba(255,255,255,1)";
            context.fillText(config.text, 0, 24);


            var texture = new THREE.Texture(canvas)
            texture.minFilter = THREE.NearestFilter;
            texture.needsUpdate = true;
            var spriteMaterial = new THREE.SpriteMaterial({map: texture});
            var mesh = new THREE.Sprite(spriteMaterial);
            mesh.scale.set(canvas.width, canvas.height, 1);
            mesh.scale.multiplyScalar(0.8);
            mesh.position.set((vertices.x), vertices.y, vertices.z);
            this._ringGroup.add(mesh);
        },


        _render: function () {
            this._ringGroup.lookAt(this._camera.position);
            this._animGroup.rotation.z += this.temp_rotation;
            this._nodeGroup.rotation.z += this.temp_rotation;
         
            // this._animGroup.rotation.x += this.temp_rotation;
            // this._nodeGroup.rotation.x += this.temp_rotation;

            for (var i = 0; i < this.animD.length; i++) {
                this.animD[i].run();
            }
            this._controls.update();
            this._renderer.render(this._scene, this._camera);
            TWEEN.update();
        },
        animD: [],
        setData:function(data){
        		var me =this;
        		var flows=[];
        		for (var index = 0; index < data.length; index++) {
        			flows.push(data[index].FLOW||0);
        		}
        		this.buildLinear(d3.min(flows),d3.max(flows));
       
        		for (var i = 0; i < data.length; i++) {
        			me._drawSphere(data[i],!!data[i].isCenter);
        		}
        },
        updateFun:function(APP_ID,fun){
            fun(this._nodedata[APP_ID]);
        },
        update: function (APP_ID, data) {
            if (this._nodedata[APP_ID]) {
                this._nodedata[APP_ID].mesh.material.needsUpdate = true;
                this._nodedata[APP_ID].mesh.material = this.__createSphere('red');
                if(this._nodedata[APP_ID].ringtween){
                    this._nodedata[APP_ID].ringtween.stop();
                    this._nodedata[APP_ID].ringtween.start();
                }
                this._nodedata[APP_ID].tween.stop();
            } else {
                console.log('未找到对应元素');
            }
        },
        start: function (callback) {
            var me = this;
            this.drawTimer = d3.timer(function () {
                me._render();
            });
            if (callback) {
                callback();
            }
        },
        stop: function () {
            if (this.drawTimer) {
                this.drawTimer.stop();
            }
        }

    }
    window.WebGLPlanets = WebGLPlanets;
})(d3); 