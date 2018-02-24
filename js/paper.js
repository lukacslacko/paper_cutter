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
        this.points = points;
        this.circle = 12;
        this.hole = 3;
        this.width = 10;
        this.normal = normal.copy().normalize(1);
    }
    Polygon.spherical = function (points, radius) {
        var center = new Point(0, 0, 0);
        for (var _i = 0, points_1 = points; _i < points_1.length; _i++) {
            var p = points_1[_i];
            center.x += p.x / points.length;
            center.y += p.y / points.length;
            center.z += p.z / points.length;
        }
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
        console.log(this.normal, horizontal, this.center, p);
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
        var poly = new Polyhedron("Cuboctahedron", Paper.A4());
        var triangle = [new Point(1, 1, 0), new Point(1, 0, 1), new Point(0, 1, 1)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        var square = [new Point(1, 0, 1), new Point(0, 1, 1),
            new Point(-1, 0, 1), new Point(0, -1, 1)];
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
    };
    Polyhedra.render = function () {
        this.cuboctahedron(50);
    };
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
        var collapse = document.createElement("a");
        heading.appendChild(collapse);
        collapse.innerHTML = name;
        collapse.setAttribute("data-toggle", "collapse");
        collapse.setAttribute("href", "#content" + name);
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
//# sourceMappingURL=paper.js.map