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
    function Paper(width, height, left_margin, right_margin, top_margin, bottom_margin, gap) {
        this.width = width;
        this.height = height;
        this.left_margin = left_margin;
        this.right_margin = right_margin;
        this.top_margin = top_margin;
        this.bottom_margin = bottom_margin;
        this.gap = gap;
        this.dxf = new DXF();
        this.num = 0;
    }
    Paper.prototype.copy = function () {
        return new Paper(this.width, this.height, this.left_margin, this.right_margin, this.top_margin, this.bottom_margin, this.gap);
    };
    Paper.A4 = function () {
        return new Paper(210, 297, 5, 5, 5, 15, 5);
    };
    Paper.prototype.fill = function (piece, num) {
        this.num = num;
        var w = piece.maxX - piece.minX;
        var h = piece.maxY - piece.minY;
        piece = piece.shift(-piece.minX, -piece.minY);
        var x = this.left_margin;
        var y = this.top_margin;
        while (num > 0) {
            piece = piece.shift(x, y);
            this.dxf.add(piece);
            --num;
            piece = piece.shift(-x, -y);
            x += w + this.gap;
            if (x + w + this.right_margin > this.width) {
                x = this.left_margin;
                y += h + this.gap;
                if (y + h + this.bottom_margin > this.height) {
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
        dxf.line(folded[0].x, folded[0].y - Polygon.hole / 3, folded[0].x, folded[0].y + Polygon.hole / 3);
        dxf.line(folded[1].x - Polygon.hole / 3, folded[1].y, folded[1].x + Polygon.hole / 3, folded[1].y);
        for (var _i = 0, folded_1 = folded; _i < folded_1.length; _i++) {
            var p = folded_1[_i];
            for (var i = 0; i < 2 * Polygon.circle; ++i) {
                var a = i * Math.PI / Polygon.circle;
                var b = a + Math.PI / Polygon.circle;
                dxf.line(p.x + Polygon.hole / 2 * Math.cos(a), p.y + Polygon.hole / 2 * Math.sin(a), p.x + Polygon.hole / 2 * Math.cos(b), p.y + Polygon.hole / 2 * Math.sin(b));
            }
        }
    };
    Polygon.prototype.connect = function (p, q, dxf) {
        var a = p.copy().normalize(1);
        var b = q.copy().normalize(1);
        var ab = a.dot(b);
        var alpha = Polygon.width / 2 / Math.sqrt(1 - ab * ab);
        var t = new PlanarPoint(alpha * (a.x + b.x), alpha * (a.y + b.y));
        var beta = alpha * (1 + ab);
        var u = new PlanarPoint(t.x - beta * b.x, t.y - beta * b.y);
        var v = new PlanarPoint(t.x - beta * a.x, t.y - beta * a.y);
        dxf.line(t.x, t.y, q.x + u.x, q.y + u.y);
        dxf.line(t.x, t.y, p.x + v.x, p.y + v.y);
        for (var i = 0; i < Polygon.circle; ++i) {
            var x = i * Math.PI / Polygon.circle;
            var y = x + Math.PI / Polygon.circle;
            dxf.line(q.x + Math.cos(x) * u.x + Math.sin(x) * b.x * Polygon.width / 2, q.y + Math.cos(x) * u.y + Math.sin(x) * b.y * Polygon.width / 2, q.x + Math.cos(y) * u.x + Math.sin(y) * b.x * Polygon.width / 2, q.y + Math.cos(y) * u.y + Math.sin(y) * b.y * Polygon.width / 2);
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
    Polygon.circle = 12;
    Polygon.hole = 3;
    Polygon.width = 10;
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
var Segment = /** @class */ (function () {
    function Segment(a, b) {
        this.a = a;
        this.b = b;
    }
    Segment.prototype.intersect = function (other) {
        return this.b.cross(this.a).cross(other.a.cross(other.b));
    };
    return Segment;
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
    Polyhedra.truncatedDodecahedron = function (radius) {
        var poly = new Polyhedron("Dodecahedron", this.paper);
        var phi = (Math.sqrt(5) - 1) / 2;
        var A = new Point(phi, 0, 1 / phi);
        var B = new Point(1, 1, 1);
        var C = new Point(1 / phi, phi, 0);
        var D = new Point(1 / phi, -phi, 0);
        var E = new Point(1, -1, 1);
        var F = new Point(0, 1 / phi, phi);
        function t(X, Y) {
            var b = 1 / (1 + Math.cos(Math.PI / 5)) / 2;
            var a = 1 - b;
            return new Point(a * X.x + b * Y.x, a * X.y + b * Y.y, a * X.z + b * Y.z);
        }
        var decagon = [t(A, B), t(B, A), t(B, C), t(C, B), t(C, D), t(D, C),
            t(D, E), t(E, D), t(E, A), t(A, E)];
        poly.addPolygon("decagon", Polygon.spherical(decagon, radius), 12);
        var triangle = [t(B, A), t(B, F), t(B, C)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 20);
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
    Polyhedra.truncatedOctahedronAndDual = function (radius) {
        function p(x, y, z) {
            return new Point(x, y, z);
        }
        var poly = new Polyhedron("Truncated octahedron", this.paper);
        poly.addPolygon("square", Polygon.sphericalWithCenter(p(0, 4, 0), [
            p(1, 4, 1), p(-1, 4, 1), p(-1, 4, -1), p(1, 4, -1)
        ], radius), 6);
        poly.addPolygon("triangle", Polygon.sphericalWithCenter(p(0, 4, 2), [
            p(1, 4, 1), p(-1, 4, 1), p(0, 3, 3)
        ], radius), 24);
        poly.addPolygon("hexagon", Polygon.sphericalWithCenter(p(4, 4, 4), [
            p(3, 3, 0), p(1, 4, 1), p(0, 3, 3), p(1, 1, 4), p(3, 0, 3), p(4, 1, 1)
        ], radius), 8);
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
    Polyhedra.jaaC = function (radius) {
        var poly = new Polyhedron("jaaC", this.paper);
        function p(x, y, z) {
            return new Point(x, y, z);
        }
        poly.addPolygon("edge", Polygon.sphericalWithCenter(p(1, 2, 2), [p(2, 2, 2), p(1, 2, 1), p(0, 2, 2), p(1, 1, 2)], radius), 24);
        poly.addPolygon("face", Polygon.sphericalWithCenter(p(0, 2, 1), [p(0, 2, 2), p(1, 2, 1), p(0, 2, 0), p(-1, 2, 1)], radius), 24);
    };
    Polyhedra.rotateSin = function (r1, r2, wavelength, nlat, nlng, num) {
        function p(lat, lng) {
            var r = r2 + (r1 - r2) * (1 + Math.cos(lat)) / 2;
            return new Point(r * Math.cos(lng), r * Math.sin(lng), wavelength * lat / Math.PI);
        }
        var poly = new Polyhedron("wave " + nlat + " " + nlng, this.paper);
        for (var i = 0; i < nlat; ++i) {
            var dlat = Math.PI / nlat;
            var lat = Math.PI / nlat * i + 0.0001;
            var dlng = 2 * Math.PI / nlng;
            poly.addPolygon("poly" + i, new Polygon(p(lat, 0), new Point(1, 0, 0), [
                p(lat - dlat, 0), p(lat, dlng / 2), p(lat + dlat, 0),
                p(lat, -dlng / 2)
            ]), nlng * num);
        }
    };
    Polyhedra.conicalCube = function (r) {
        var poly = new Polyhedron("Conical cube", this.paper);
        var face = SphericalCircle.regularPolygon(r, Math.sqrt(2 / 3) * r, 4);
        poly.addDxf("square", face, 6);
    };
    Polyhedra.render = function () {
        this.cuboctahedron(30);
        this.dodecahedron(50);
        this.truncatedCube(50);
        this.rectifiedTruncatedIcosahedron(110);
        this.rectifiedSnubCube(80);
        new Torus(50, 100, 4, 12).renderHexa(this.paper);
        this.truncatedOctahedronAndDual(65);
        this.truncatedIcosahedron(60);
        new Torus(40, 100, 4, 16).renderQuad(this.paper);
        this.jaaC(70);
        this.rotateSin(70, 35, 80, 6, 7, 2);
        this.conicalCube(50);
        this.truncatedDodecahedron(73);
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
        this.addDxf(title, polygon.render(), num);
    };
    Polyhedron.prototype.addDxf = function (title, dxf, num) {
        var current = this.paper.copy();
        current.fill(dxf, num);
        var page = document.createElement("div");
        page.setAttribute("id", "polygon" + this.name + title);
        this.content.appendChild(page);
        current.addToDiv(this.name, title, page);
    };
    return Polyhedron;
}());
var SphericalCircle = /** @class */ (function () {
    function SphericalCircle() {
    }
    SphericalCircle.drawHole = function (dxf, radius, angle) {
        var x = radius * Math.cos(angle);
        var y = radius * Math.sin(angle);
        for (var i = 0; i < 2 * Polygon.circle; ++i) {
            var a = i * Math.PI / Polygon.circle;
            var b = a + Math.PI / Polygon.circle;
            dxf.line(x + Polygon.hole / 2 * Math.cos(a), y + Polygon.hole / 2 * Math.sin(a), x + Polygon.hole / 2 * Math.cos(b), y + Polygon.hole / 2 * Math.sin(b));
        }
    };
    SphericalCircle.drawCap = function (dxf, radius, angle, offset) {
        var x = radius * Math.cos(angle);
        var y = radius * Math.sin(angle);
        for (var i = 0; i < Polygon.circle; ++i) {
            var a = i * Math.PI / Polygon.circle + offset;
            var b = a + Math.PI / Polygon.circle;
            dxf.line(x + Polygon.width / 2 * Math.cos(a), y + Polygon.width / 2 * Math.sin(a), x + Polygon.width / 2 * Math.cos(b), y + Polygon.width / 2 * Math.sin(b));
        }
    };
    SphericalCircle.drawArc = function (dxf, radius, angle) {
        var da = angle / Math.ceil(radius);
        for (var a = 0; a < angle; a += da) {
            var b = a + da;
            dxf.line(radius * Math.cos(a), radius * Math.sin(a), radius * Math.cos(b), radius * Math.sin(b));
        }
    };
    SphericalCircle.regularPolygon = function (sphere_radius, polygon_radius, num_sides) {
        var factor = polygon_radius / sphere_radius;
        factor = Math.sqrt(1 - factor * factor);
        var alpha = 2 * Math.PI * factor;
        var cone_radius = polygon_radius / factor;
        var dxf = new DXFModule();
        for (var i = 0; i <= num_sides; ++i) {
            this.drawHole(dxf, cone_radius, i * alpha / num_sides);
        }
        this.drawArc(dxf, cone_radius - Polygon.width / 2, alpha);
        this.drawArc(dxf, cone_radius + Polygon.width / 2, alpha);
        this.drawCap(dxf, cone_radius, 0, Math.PI);
        this.drawCap(dxf, cone_radius, alpha, alpha);
        return dxf;
    };
    return SphericalCircle;
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