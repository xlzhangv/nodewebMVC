+(function (h) {
    function e(k) {
        this.mesh = k;
        this.create()
    }

    e.prototype = {
        mesh: undefined, max: 2, index: 0, startScale: 0, k: 0, create: function () {
            var k = this;
            this.opacity = d3.scaleLinear().domain([0, 0.3]).range([1, 0.2]);
            this.mesh.material.needsUpdate = true
        }, run: function () {
            var k = this;
            this.k += 0.01;
            var m = {x: this.k * 2, y: this.k * 2, z: this.k * 2, t: 1};
            k.mesh.material.opacity = this.opacity(this.k);
            // for (var l in k.mesh.scale) {
            //     k.mesh.scale[l] = parseFloat(m[l], 10)
            // }
            k.mesh.material.opacity=this.opacity(this.k);
            k.mesh.geometry.dispose();
            k.mesh.geometry = new THREE.RingBufferGeometry(0.0001,this.k,128);
            if (this.k > 0.3) {
                this.k = 0
            }
        }
    };
    h.RingTween = e;
    var c;
    var j = new THREE.TextureLoader();
    j.load("images/spark.png", function (k) {
        c = k
    });
    var d = new THREE.Sprite(a());
    d.scale.set(0.1, 0.1, 0.1);
    d.scale.multiplyScalar(0.1);

    function a(m) {
        var k = m ? m : 16777215;
        var l = new THREE.SpriteMaterial({color: k, blending: THREE.AdditiveBlending});
        if (!!c) {
            l.map = c
        }
        return l
    }

    h.getSpriteMaterial = a;

    function g(l) {
        var n = d3.rgb(l);
        var m = "rgb(" + n.r + "," + n.g + "," + n.b + ")";
        var k = new THREE.Color(m);
        return k
    }

    function i(k) {
        var o = d3.color(k);
        var l = document.createElement("canvas");
        l.width = 8;
        l.height = 8;
        var m = l.getContext("2d");
        var n = m.createRadialGradient(l.width / 2, l.height / 2, 0, l.width / 2, l.height / 2, l.width);
        n.addColorStop(0, o.toString());
        o.opacity = 0.4;
        n.addColorStop(0.2, o.toString());
        o.opacity = 0.2;
        n.addColorStop(0.4, o.toString());
        o.opacity = 0.1;
        n.addColorStop(1, o.toString());
        m.fillStyle = n;
        m.arc(l.width / 2, l.height / 2, l.width / 2, 0, 2 * Math.PI);
        m.fill();
        return l
    }

    h.rgb2tcolor = g;
    var f = new THREE.Geometry();

    function b(J, w, C) {
        var s = 0.25;
        var r = J;
        var B = w;
        var m = r.clone().sub(B).length();
        var o = J;
        var n = w;
        var H = o.clone().lerp(n, s);
        var A = H.length() * 1.05;
        H.normalize();
        H.multiplyScalar(A + m * s);
        var K = (new THREE.Vector3()).subVectors(o, n);
        K.normalize();
        var x = m * s;
        var v = o;
        var l = H.clone().add(K.clone().multiplyScalar(x));
        var G = H.clone().add(K.clone().multiplyScalar(-x));
        var t = n;
        var q = new THREE.CubicBezierCurve3(o, v, l, H);
        var p = new THREE.CubicBezierCurve3(H, G, t, n);
        var z = Math.floor(m * 0.05 + 6) * 3;
        var F = q.getPoints(z);
        F = F.splice(0, F.length - 1);
        F = F.concat(p.getPoints(z));
        var y = new THREE.LineBasicMaterial({color: C, opacity: 1, linewidth: 1});
        var k = new THREE.Line(f.clone(), y);
        var u = F.length - 1;
        k.geometry.vertices[0] = F[0];
        var I = [F[0]];
        var E = 1;
        while (E < u) {
            E++;
            I.push(F[0])
        }
        k.geometry.vertices = I;
        var y = new THREE.SpriteMaterial({map: new THREE.CanvasTexture(i(C)), blending: THREE.AdditiveBlending});
        var D = new THREE.Sprite(y);
        D.position.set(F[0].x, F[0].y, F[0].z);
        D.scale.multiplyScalar(0.015);
        return {line: k, points: F, point: D}
    }

    h.MakeConnectionLineGeometry = b
})(window);