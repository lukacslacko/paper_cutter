var DXF = /** @class */ (function () {
    function DXF() {
        this.lines = new Array();
        this.dxfLines = new Array();
        this.lines.push("0", "SECTION", "2", "ENTITIES");
    }
    DXF.prototype.add = function (piece) {
        for (var _i = 0, _a = piece.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            this.dxfLines.push(line);
            this.line(line.x1, line.y1, line.x2, line.y2);
        }
    };
    DXF.prototype.line = function (x1, y1, x2, y2) {
        this.lines.push("0", "LINE", "8", "Polygon", "10", "" + x1, "20", "" + (-y1), "11", "" + x2, "21", "" + (-y2));
    };
    DXF.prototype.content = function () {
        this.lines.push("0", "ENDSEC", "0", "EOF");
        return this.lines.join("\r\n");
    };
    DXF.prototype.downloadLink = function (filename) {
        var result = document.createElement("a");
        result.innerHTML = filename;
        result.setAttribute("download", filename);
        result.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.content()));
        return result;
    };
    DXF.prototype.previewCanvas = function (width, height) {
        var result = document.createElement("canvas");
        result.setAttribute("width", "" + width);
        result.setAttribute("height", "" + height);
        var ctx = result.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height - 1);
        ctx.lineTo(width - 1, height - 1);
        ctx.lineTo(width - 1, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        for (var _i = 0, _a = this.dxfLines; _i < _a.length; _i++) {
            var line = _a[_i];
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        }
        return result;
    };
    return DXF;
}());
var DXFLine = /** @class */ (function () {
    function DXFLine(x1, y1, x2, y2) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
    return DXFLine;
}());
var DXFModule = /** @class */ (function () {
    function DXFModule() {
        this.lines = new Array();
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }
    DXFModule.prototype.line = function (x1, y1, x2, y2) {
        this.lines.push(new DXFLine(x1, y1, x2, y2));
        this.minX = Math.min(this.minX, x1, x2);
        this.maxX = Math.max(this.maxX, x1, x2);
        this.minY = Math.min(this.minY, y1, y2);
        this.maxY = Math.max(this.maxY, y1, y2);
    };
    DXFModule.prototype.shift = function (x, y) {
        var result = new DXFModule();
        for (var _i = 0, _a = this.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            result.line(x + line.x1, y + line.y1, x + line.x2, y + line.y2);
        }
        return result;
    };
    return DXFModule;
}());
var Paper = /** @class */ (function () {
    function Paper(width, height, margin, gap) {
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.gap = gap;
        this.dxf = new DXF();
        this.num = 0;
    }
    Paper.prototype.copy = function () {
        return new Paper(this.width, this.height, this.margin, this.gap);
    };
    Paper.A4 = function () {
        return new Paper(210, 297, 10, 5);
    };
    Paper.prototype.fill = function (piece, num) {
        this.num = num;
        var w = piece.maxX - piece.minX;
        var h = piece.maxY - piece.minY;
        piece = piece.shift(-piece.minX, -piece.minY);
        var x = this.margin;
        var y = this.margin;
        while (num > 0) {
            piece = piece.shift(x, y);
            this.dxf.add(piece);
            --num;
            piece = piece.shift(-x, -y);
            x += w + this.gap;
            if (x + w + this.margin > this.width) {
                x = this.margin;
                y += h + this.gap;
                if (y + h + this.margin > this.height) {
                    return;
                }
            }
        }
    };
    Paper.prototype.addToDiv = function (polyhedronName, name, div) {
        var description = document.createElement("div");
        description.innerHTML = name + " " + this.num;
        div.appendChild(description);
        div.appendChild(this.dxf.downloadLink(polyhedronName + "_" + name + "_" + this.num + ".dxf"));
        div.appendChild(this.dxf.previewCanvas(this.width, this.height));
    };
    return Paper;
}());
var Polygon = /** @class */ (function () {
    function Polygon(center, normal, points) {
        this.center = center;
        this.circle = 12;
        this.hole = 3;
        this.width = 10;
        this.normal = normal.copy().normalize(1);
        this.points = new Array();
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            this.points.push(p.copy());
        }
    }
    Polygon.spherical = function (points, radius) {
        return this.sphericalWithCenter(Point.avg(points), points, radius);
    };
    Polygon.sphericalWithCenter = function (center, points, radius) {
        var poly = new Polygon(center, center, points);
        poly.projectToSphere(radius);
        return poly;
    };
    Polygon.prototype.projectToSphere = function (radius) {
        this.center.normalize(radius);
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var p = _a[_i];
            p.normalize(radius);
        }
    };
    Polygon.prototype.foldPoint = function (horizontal, p) {
        var v = this.center.to(p);
        var dist = v.length();
        v.project(this.normal).normalize(dist);
        var y = this.normal.cross(horizontal);
        return new PlanarPoint(v.dot(horizontal), v.dot(y));
    };
    Polygon.prototype.foldToPlane = function () {
        var folded = new Array();
        var horizontal = this.points[0].copy().project(this.normal).normalize(1);
        for (var i = 0; i < this.points.length; ++i) {
            folded.push(this.foldPoint(horizontal, this.points[i]));
        }
        return folded;
    };
    Polygon.prototype.drawHoles = function (folded, dxf) {
        for (var _i = 0, folded_1 = folded; _i < folded_1.length; _i++) {
            var p = folded_1[_i];
            for (var i = 0; i < 2 * this.circle; ++i) {
                var a = i * Math.PI / this.circle;
                var b = a + Math.PI / this.circle;
                dxf.line(p.x + this.hole / 2 * Math.cos(a), p.y + this.hole / 2 * Math.sin(a), p.x + this.hole / 2 * Math.cos(b), p.y + this.hole / 2 * Math.sin(b));
            }
        }
    };
    Polygon.prototype.connect = function (p, q, dxf) {
        var a = p.copy().normalize(1);
        var b = q.copy().normalize(1);
        var ab = a.dot(b);
        var alpha = this.width / 2 / Math.sqrt(1 - ab * ab);
        var t = new PlanarPoint(alpha * (a.x + b.x), alpha * (a.y + b.y));
        var beta = alpha * (1 + ab);
        var u = new PlanarPoint(t.x - beta * b.x, t.y - beta * b.y);
        var v = new PlanarPoint(t.x - beta * a.x, t.y - beta * a.y);
        dxf.line(t.x, t.y, q.x + u.x, q.y + u.y);
        dxf.line(t.x, t.y, p.x + v.x, p.y + v.y);
        for (var i = 0; i < this.circle; ++i) {
            var x = i * Math.PI / this.circle;
            var y = x + Math.PI / this.circle;
            dxf.line(q.x + Math.cos(x) * u.x + Math.sin(x) * b.x * this.width / 2, q.y + Math.cos(x) * u.y + Math.sin(x) * b.y * this.width / 2, q.x + Math.cos(y) * u.x + Math.sin(y) * b.x * this.width / 2, q.y + Math.cos(y) * u.y + Math.sin(y) * b.y * this.width / 2);
        }
    };
    Polygon.prototype.drawEdges = function (folded, dxf) {
        for (var i = 0; i < folded.length; ++i) {
            this.connect(folded[i], folded[(i + 1) % folded.length], dxf);
        }
    };
    Polygon.prototype.render = function () {
        var dxf = new DXFModule();
        var folded = this.foldToPlane();
        var a = Math.atan2(folded[1].y - folded[0].y, folded[1].x - folded[0].x);
        for (var _i = 0, folded_2 = folded; _i < folded_2.length; _i++) {
            var f = folded_2[_i];
            f.rotate(Math.abs(a));
        }
        this.drawHoles(folded, dxf);
        this.drawEdges(folded, dxf);
        return dxf;
    };
    return Polygon;
}());
var Point = /** @class */ (function () {
    function Point(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Point.avg = function (points) {
        var r = new Point(0, 0, 0);
        for (var _i = 0, points_2 = points; _i < points_2.length; _i++) {
            var p = points_2[_i];
            r.x += p.x / points.length;
            r.y += p.y / points.length;
            r.z += p.z / points.length;
        }
        return r;
    };
    Point.prototype.normalize = function (radius) {
        var l = this.length();
        this.x *= radius / l;
        this.y *= radius / l;
        this.z *= radius / l;
        return this;
    };
    Point.prototype.dot = function (p) {
        return this.x * p.x + this.y * p.y + this.z * p.z;
    };
    Point.prototype.project = function (normal) {
        var a = this.dot(normal);
        this.x -= a * normal.x;
        this.y -= a * normal.y;
        this.z -= a * normal.z;
        return this;
    };
    Point.prototype.cross = function (p) {
        return new Point(-this.y * p.z + this.z * p.y, -this.z * p.x + this.x * p.z, -this.x * p.y + this.y * p.x);
    };
    Point.prototype.copy = function () {
        return new Point(this.x, this.y, this.z);
    };
    Point.prototype.to = function (p) {
        return new Point(p.x - this.x, p.y - this.y, p.z - this.z);
    };
    Point.prototype.length = function () {
        return Math.sqrt(this.dot(this));
    };
    return Point;
}());
var PlanarPoint = /** @class */ (function () {
    function PlanarPoint(x, y) {
        this.x = x;
        this.y = y;
    }
    PlanarPoint.prototype.copy = function () {
        return new PlanarPoint(this.x, this.y);
    };
    PlanarPoint.prototype.normalize = function (radius) {
        var l = this.length();
        this.x *= radius / l;
        this.y *= radius / l;
        return this;
    };
    PlanarPoint.prototype.rotate = function (a) {
        var x = this.x * Math.cos(a) - this.y * Math.sin(a);
        var y = this.x * Math.sin(a) + this.y * Math.cos(a);
        this.x = x;
        this.y = y;
        return this;
    };
    PlanarPoint.prototype.dot = function (p) {
        return this.x * p.x + this.y * p.y;
    };
    PlanarPoint.prototype.length = function () {
        return Math.sqrt(this.dot(this));
    };
    return PlanarPoint;
}());
var Polyhedra = /** @class */ (function () {
    function Polyhedra() {
    }
    Polyhedra.cuboctahedron = function (radius) {
        var poly = new Polyhedron("Cuboctahedron", this.paper);
        var triangle = [new Point(1, 1, 0), new Point(1, 0, 1), new Point(0, 1, 1)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        var square = [new Point(1, 0, 1), new Point(0, 1, 1),
            new Point(-1, 0, 1), new Point(0, -1, 1)];
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
    };
    Polyhedra.dodecahedron = function (radius) {
        var poly = new Polyhedron("Dodecahedron", this.paper);
        var phi = (Math.sqrt(5) - 1) / 2;
        var pentagon = [new Point(1, 1, 1), new Point(phi, 0, 1 / phi), new Point(1, -1, 1),
            new Point(1 / phi, -phi, 0), new Point(1 / phi, phi, 0)];
        poly.addPolygon("pentagon", Polygon.spherical(pentagon, radius), 12);
    };
    Polyhedra.truncatedCube = function (radius) {
        var poly = new Polyhedron("Truncated cube", this.paper);
        var a = 1 / (1 + Math.sqrt(2));
        var triangle = [new Point(a, 1, 1), new Point(1, a, 1), new Point(1, 1, a)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        var octagon = [new Point(1, a, 1), new Point(a, 1, 1),
            new Point(-a, 1, 1), new Point(-1, a, 1),
            new Point(-1, -a, 1), new Point(-a, -1, 1),
            new Point(a, -1, 1), new Point(1, -a, 1)];
        poly.addPolygon("octagon", Polygon.spherical(octagon, radius), 6);
    };
    Polyhedra.rectifiedTruncatedIcosahedron = function (radius) {
        var poly = new Polyhedron("Rectified truncated icosahedron", this.paper);
        var c0 = (1 + Math.sqrt(5)) / 4;
        var c1 = 3 * (Math.sqrt(5) - 1) / 4;
        var c2 = (2 * Math.sqrt(5) - 1) / 2;
        var c3 = Math.sqrt(5);
        var c4 = (7 + Math.sqrt(5)) / 4;
        var c5 = 3 * (Math.sqrt(5) + 1) / 4;
        var c6 = (9 + Math.sqrt(5)) / 4;
        var v0 = new Point(0, 0, 3);
        var v6 = new Point(c1, 0.5, c6);
        var v8 = new Point(c1, -0.5, c6);
        poly.addPolygon("triangle", Polygon.spherical([v8, v6, v0], radius), 60);
        var v12 = new Point(-c1, -0.5, c6);
        var v32 = new Point(c1, -1.5, c5);
        var v36 = new Point(-c1, -1.5, c5);
        var v80 = new Point(0, -2, c3);
        poly.addPolygon("hexagon", Polygon.spherical([v80, v32, v8, v0, v12, v36], radius), 20);
        var v54 = new Point(c2, c0, c4);
        var v56 = new Point(c2, -c0, c4);
        var v82 = new Point(c3, 0, 2);
        poly.addPolygon("pentagon", Polygon.spherical([v82, v54, v6, v8, v56], radius), 12);
    };
    Polyhedra.rectifiedSnubCube = function (radius) {
        var poly = new Polyhedron("Rectified snub cube", this.paper);
        var c0 = 0.2835;
        var c1 = 0.9590;
        var c2 = 1.4804;
        var c3 = 1.7640;
        var c4 = 2.2852;
        var v0 = new Point(c1, -c0, c4);
        var v24 = new Point(c3, 0, c3);
        var v36 = new Point(c2, -c1, c3);
        console.log(v0.length(), v24.length(), v36.length());
        var triangle = [v0, v36, v24];
        var v2 = new Point(-c1, c0, c4);
        var v12 = new Point(c0, c1, c4);
        var v14 = new Point(-c0, -c1, c4);
        var square = [v0, v12, v2, v14];
        var v34 = new Point(0, -c3, c3);
        var v44 = new Point(c1, -c3, c2);
        var pentagon = [v0, v14, v34, v44, v36];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 32);
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
        poly.addPolygon("pentagon", Polygon.spherical(pentagon, radius), 24);
    };
    Polyhedra.rectifiedRhombicTriacontahedron = function (radius) {
        var phi = (Math.sqrt(5) - 1) / 2;
        var A = new Point(phi, 0, 1 / phi);
        var B = new Point(1, -1, 1);
        var C = new Point(1 / phi, -phi, 0);
        var D = new Point(1 / phi, phi, 0);
        var E = new Point(1, 1, 1);
        var L = new Point(1, 1, -1);
        var F = new Point(0, 1 / phi, phi);
        var K = new Point(0, 1 / phi, -phi);
        var G = new Point(-1, 1, 1);
        var H = new Point(-phi, 0, 1 / phi);
        var P = Point.avg([A, B, C, D, E]);
        var Q = Point.avg([A, F, G, H, E]);
        var R = Point.avg([E, D, L, K, F]);
        var poly = new Polyhedron("Rectified rhombic triacontahedron", this.paper);
        poly.addPolygon("pentagon", Polygon.spherical([Point.avg([P, A]), Point.avg([P, B]), Point.avg([P, C]),
            Point.avg([P, D]), Point.avg([P, E])], radius), 12);
        poly.addPolygon("square", Polygon.spherical([Point.avg([Q, E]), Point.avg([Q, A]), Point.avg([P, A]), Point.avg([P, E])], radius), 30);
        poly.addPolygon("triangle", Polygon.spherical([
            Point.avg([E, Q]), Point.avg([E, P]), Point.avg([E, R])
        ], radius), 20);
    };
    Polyhedra.truncatedIcosahedron = function (radius) {
        var phi = (Math.sqrt(5) + 1) / 2;
        var A = new Point(phi, 0, 1);
        var B = new Point(phi, 0, -1);
        var C = new Point(1, phi, 0);
        var D = new Point(1, -phi, 0);
        var P = Point.avg([A, B, A]);
        var X = Point.avg([A, B, C]);
        var Y = Point.avg([A, B, D]);
        var poly = new Polyhedron("Truncated icosahedron", this.paper);
        poly.addPolygon("triangle", Polygon.sphericalWithCenter(P, [Y, X, A], radius), 60);
    };
    Polyhedra.render = function () {
        this.cuboctahedron(30);
        this.dodecahedron(50);
        this.truncatedCube(50);
        this.rectifiedTruncatedIcosahedron(110);
        this.rectifiedSnubCube(80);
        new Torus(50, 100, 4, 12).renderHexa(this.paper);
        this.rectifiedRhombicTriacontahedron(80);
        this.truncatedIcosahedron(60);
        new Torus(40, 80, 4, 16).renderQuad(this.paper);
    };
    Polyhedra.paper = Paper.A4();
    return Polyhedra;
}());
console.log("Hello world!");
var Polyhedron = /** @class */ (function () {
    function Polyhedron(name, paper) {
        this.name = name;
        this.paper = paper;
        var top = document.createElement("div");
        top.setAttribute("id", "top" + name);
        document.getElementById("polyhedra").appendChild(top);
        var heading = document.createElement("div");
        top.appendChild(heading);
        var collapse = document.createElement("div");
        heading.appendChild(collapse);
        collapse.innerHTML = name;
        this.content = document.createElement("div");
        this.content.setAttribute("id", "content" + name);
        top.appendChild(this.content);
    }
    Polyhedron.prototype.addPolygon = function (title, polygon, num) {
        var current = this.paper.copy();
        current.fill(polygon.render(), num);
        var page = document.createElement("div");
        page.setAttribute("id", "polygon" + this.name + title);
        this.content.appendChild(page);
        current.addToDiv(this.name, title, page);
    };
    return Polyhedron;
}());
var Torus = /** @class */ (function () {
    function Torus(rho, R, n1, n2) {
        this.rho = rho;
        this.R = R;
        this.n1 = n1;
        this.n2 = n2;
    }
    Torus.prototype.normal = function (lat) {
        return new Point(-Math.cos(lat), 0, Math.sin(lat));
    };
    Torus.prototype.point = function (lat, lng) {
        return new Point((this.R - this.rho * Math.cos(lat)) * Math.cos(lng), (this.R - this.rho * Math.cos(lat)) * Math.sin(lng), this.rho * Math.sin(lat));
    };
    Torus.prototype.renderHexa = function (paper) {
        var poly = new Polyhedron("Torus hexa", paper);
        var dlat = Math.PI / this.n1;
        var dlng = Math.PI / this.n2;
        for (var i = 0; i < this.n1; ++i) {
            var lat = i * dlat + dlat / 2;
            var norm = this.normal(lat);
            var hexa = [this.point(lat + dlat / 3, dlng),
                this.point(lat - dlat / 3, dlng),
                this.point(lat - 2 * dlat / 3, 0),
                this.point(lat - dlat / 3, -dlng),
                this.point(lat + dlat / 3, -dlng),
                this.point(lat + 2 * dlat / 3, 0)];
            var center = this.point(lat, 0);
            poly.addPolygon("hexa" + i, new Polygon(center, norm, hexa), this.n2);
        }
    };
    Torus.prototype.renderQuad = function (paper) {
        var poly = new Polyhedron("Torus quad", paper);
        var dlat = Math.PI / this.n1;
        var dlng = Math.PI / this.n2;
        for (var i = 0; i < this.n1; ++i) {
            var lat = i * dlat + dlat / 2;
            var norm = this.normal(lat);
            var quad = [this.point(lat - dlat / 2, -dlng),
                this.point(lat + dlat / 2, -dlng),
                this.point(lat + dlat / 2, dlng),
                this.point(lat - dlat / 2, dlng)];
            var center = this.point(lat, 0);
            poly.addPolygon("quad" + i, new Polygon(center, norm, quad), this.n2);
        }
    };
    return Torus;
}());
//# sourceMappingURL=paper.js.map