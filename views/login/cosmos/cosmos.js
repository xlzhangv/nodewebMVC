(function () {
    function Cosmos(config) {
        this.zIndex = config.zIndex||0;
        this.particlesCount =config.count||1;
        this.init();
    }

    Cosmos.prototype = {
        particlesLimit: 500,
        particlesCount: 1,
        zIndex:0,
        camera: undefined,
        scene: undefined,
        group: undefined,
        renderer: undefined,
        mouseX: 0,
        mouseY: 0,
        rotation: -0.0006,
        particles: [],
        wx: 0,
        wy: 0,
        sp: 0,
        init: function () {
            var me = this;
            this.wx = window.innerWidth, this.wy = window.innerHeight, this.sp = this.wx / 2 * this.wy / 2
            this.zliner = d3.scaleLinear().domain([0, this.wx / 2 * this.wy / 2]).range([1, 0.05]);
            this.pzliner = d3.scaleLinear().domain([0, this.particlesLimit]).range([-this.particlesLimit / 4, this.particlesLimit * 2]);

            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 5000);
            this.camera.position.z = this.particlesLimit * 1.5;

            this.scene = new THREE.Scene();
            this.scene.add(this.camera);
            this.group = new THREE.Object3D();
            this.scene.add(this.group);
            if (window.WebGLRenderingContext)
                this.renderer = new THREE.WebGLRenderer({
                    alpha: true,
                    antialias: true
                });
            else
                this.renderer = new THREE.CanvasRenderer({
                    alpha: true,
                    antialias: true
                });

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.domElement.style.position = 'absolute';
            this.renderer.domElement.style.top = '0';
            this.renderer.domElement.style.left = '0';
            this.renderer.domElement.style.zIndex = me.zIndex;
            this.renderer.setClearColor(0xFFFFFF, 0.0);
            this.renderer.setClearAlpha(0);
            document.body.insertBefore(this.renderer.domElement, document.body.firstElementChild);

            this.__makeParticles();

            // add the mouse move listener
            document.addEventListener('mousemove', function (event) {
                me.mouseX = event.clientX;
                me.mouseY = event.clientY;

                var tx = me.wx / 2 - (Math.abs(me.mouseX)), ty = me.wy / 2 - (Math.abs(me.mouseY));
                me.sp = Math.abs(tx * ty);

            }, false);

            this.__animate();
        },
        __animate: function __animate() {
            var me =this;
            requestAnimationFrame(function () {
                me.__animate();
            });
            this.__updateParticles();
            this.renderer.render(this.scene, this.camera);
        },
        __generateSprite: function () {
            var canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            var ctx = canvas.getContext('2d');
            var gradient = ctx.createRadialGradient(
                canvas.width / 2,
                canvas.height / 2,
                0,
                canvas.width / 2,
                canvas.height / 2,
                canvas.width / 2
            );
            gradient.addColorStop(0, 'rgba(255,255,255,1)');
            gradient.addColorStop(0.2, 'rgba(240,255,240,1)');
            gradient.addColorStop(0.9, 'rgba(0,150,255,.4)');
            gradient.addColorStop(1, 'rgba(248, 253, 255, 0)');
            // gradient.addColorStop(0, 'rgba(255,255,255,1)');
            // gradient.addColorStop(0.2, 'rgba(240,255,240,1)');
            // gradient.addColorStop(0.22, 'rgba(0,150,255,.2)');
            // gradient.addColorStop(1, 'rgba(0,50,255,0)');
            ctx.fillStyle = gradient; // "#FFFFFF"; // gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            return canvas;
        },
        __makeParticles: function () {
            var particle, material, geometry;
            material = new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(this.__generateSprite()),
                blending: THREE.AdditiveBlending
            });

            for(var c=0;c<this.particlesCount;c++){
                for (var i = 0; i < this.particlesLimit; i += 1) {

                    particle = new THREE.Sprite(material);

                    particle.rotation.y = Math.random() * Math.PI;
                    particle.rotateX(Math.PI / 2);

                    // give it a random x and y position between -500 and 500
                    particle.position.x = Math.random() * this.particlesLimit - this.particlesLimit / 2;
                    particle.position.y = Math.random() * this.particlesLimit - this.particlesLimit / 2;

                    particle.position.z = this.pzliner(i);

                    particle.scale.x = particle.scale.y = 1;

                    this.group.add(particle);

                    this.particles.push(particle);
                }
            }


        },
        __updateParticles: function () {
            var particle;
            // var time = Date.now() * 0.05;
            this.group.rotation.z += this.rotation;

            for (var i = 0; i < this.particles.length; i++) {

                particle = this.particles[i];
                particle.position.z += this.zliner(this.sp);

                if (particle.position.z > this.particlesLimit * 2) {
                    particle.scale.x = particle.scale.y = 1;
                    particle.position.z -= this.particlesLimit * 2;
                    particle.position.x = Math.random() * this.particlesLimit - this.particlesLimit / 2;
                    particle.position.y = Math.random() * this.particlesLimit - this.particlesLimit / 2;
                }
                particle.scale.x = particle.scale.y = particle.position.z / this.particlesLimit * 2;
                this.camera.lookAt(this.scene.position);
            }
        }
    }
    new Cosmos({zIndex:1})
    window['Cosmos'] = Cosmos;
})();