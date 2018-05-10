class Vector {
    constructor(public x: number, public y: number) { }

    to(other: Vector): Vector {
        return new Vector(other.x - this.x, other.y - this.y);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    mul(a: number): Vector {
        return new Vector(a * this.x, a * this.y);
    }

    add(other: Vector): Vector {
        return new Vector(other.x + this.x, other.y + this.y);
    }

    normalize(): Vector {
        return this.mul(1 / this.length());
    }

    rotate(a: number): Vector {
        return new Vector(Math.cos(a) * this.x - Math.sin(a) * this.y, Math.sin(a) * this.x + Math.cos(a) * this.y);
    }
}

class PointAndNormal {
    constructor(public point: Vector, public normal: Vector) { }
}

class Canvas {
    canvas: HTMLCanvasElement;
    c: CanvasRenderingContext2D;
    w: number;
    h: number;
    dxfModule: DXFModule;

    constructor() {
        this.w = 1000;
        this.h = 1000;
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", "" + this.w);
        this.canvas.setAttribute("height", "" + this.h);
        document.getElementById("canv").appendChild(this.canvas);
        this.c = this.canvas.getContext("2d");
        this.dxfModule = new DXFModule();
    }

    line(from: Vector, to: Vector, width: number, color: string): void {
        console.log(from, to, color);
        let c = this.c;
        c.beginPath();
        c.lineWidth = width;
        c.strokeStyle = color;
        c.moveTo(from.x + this.w / 2, from.y + this.h / 2);
        c.lineTo(to.x + this.w / 2, to.y + this.h / 2);
        c.stroke();
        this.dxfModule.line(from.x, from.y, to.x, to.y);
    }

    clear(): void {
        this.c.clearRect(0, 0, this.w, this.h);
    }
}

class Polyline {
    len: number;
    private lens: number[];
    private normals: Vector[];
    constructor(public pts: Vector[]) {
        this.lens = new Array<number>(pts.length - 1);
        this.normals = new Array<Vector>(pts.length);
        this.len = 0;
        for (let i = 0; i < pts.length - 1; ++i) {
            this.lens[i] = this.len;
            this.len += pts[i].to(pts[i + 1]).length();
        }
        for (let i = 0; i < pts.length; ++i) {
            let a = (pts.length + i - 1) % pts.length;
            let b = (i + 1) % pts.length;
            this.normals[i] = this.pts[a].to(this.pts[b]).rotate(-Math.PI / 2).normalize();
        }
    }

    shift(v: Vector): Polyline {
        let p = new Array<Vector>(this.pts.length);
        for (let i = 0; i < this.pts.length; ++i) {
            p[i] = this.pts[i].add(v);
        }
        return new Polyline(p);
    }

    roll(s: number): Polyline {
        let pt = this.along(s);
        let angle = Math.atan2(pt.point.y, pt.point.x);
        let p = new Array<Vector>(this.pts.length);
        for (let i = 0; i < this.pts.length; ++i) {
            p[i] = this.pts[i].rotate(angle);
        }
        return new Polyline(p);
    }

    rollOpposite(s: number): Polyline {
        let pt = this.along(s + this.len / 2);
        let angle = Math.atan2(pt.point.y, pt.point.x) - Math.PI;
        let p = new Array<Vector>(this.pts.length);
        for (let i = 0; i < this.pts.length; ++i) {
            p[i] = this.pts[i].rotate(angle);
        }
        return new Polyline(p);
    }

    along(s: number): PointAndNormal {
        if (s < 0) return this.along(s + this.len);
        if (s >= this.len) return this.along(s - this.len);
        let a = 0;
        let b = this.lens.length;
        while (b > a + 1) {
            let c = Math.floor((a + b) / 2);
            if (this.lens[c] <= s) {
                a = c;
            } else {
                b = c;
            }
        }
        let remainder = s - this.lens[a];
        let edge = (a + 1 == this.lens.length) ? this.len - this.lens[a] : this.lens[a + 1] - this.lens[a];
        let f = remainder / edge;
        if (isNaN(f)) {
            console.error("f is nan!", isNaN(remainder), isNaN(edge), a, this.lens.length);
        }
        return new PointAndNormal(this.pts[a].mul(1 - f).add(this.pts[a + 1].mul(f)), this.normals[a].mul(1 - f).add(this.normals[a + 1].mul(f)).normalize());
    }
    cycloid(offset: number, radius: number, angle: number): Vector {
        let base = this.along(offset);
        let center = base.point.add(base.normal.mul(radius));
        let sign = radius > 0 ? 1 : -1;
        return center.add(center.to(base.point).rotate(angle));
    }
}

class GearOptions {
    constructor(public small: number, public ecc: number, public speed: number,
        public teeth: number, public angle: number, public radius: number,
        public cutout: number, public toothSteps: number, public showCurve: boolean) { }
}

class VectorPair {
    constructor(public start: Vector, public end: Vector) { }
}

class Gear {
    constructor(public poly: Polyline) { }

    render(canvas: Canvas): void {
        for (let i = 0; i < this.poly.pts.length; ++i) {
            canvas.line(this.poly.pts[i], this.poly.pts[(i + 1) % this.poly.pts.length], 1, "grey");
        }
    }

    tooth(canvas: Canvas, offset: number, side: number, r: number, size: number, cutout: number,
        steps: number, color: string): VectorPair {
        let s = offset;
        let begin = side == -1 ? -steps : -(1 + cutout) * steps;
        let beginVec = new Vector(0, 0);
        let endVec = new Vector(0, 0);
        for (let i = begin; i < begin + (2 + cutout) * steps; ++i) {
            let sign = side * (i > 0 ? 1 : -1);
            let a = size * i / steps;
            let b = (a + size / steps);
            const from = this.poly.cycloid(s + r * a, sign * r, sign * a);
            const to = this.poly.cycloid(s + r * b, sign * r, sign * b);
            if (i == begin) {
                beginVec = from;
            }
            endVec = to;
            canvas.line(from, to, 1, color);
            //canvas.line(this.poly.along(s + r*a).point, this.poly.along(s + r*b).point, 3, color);
        }
        return new VectorPair(beginVec, endVec);
    }

    renderTeethOptions(canvas: Canvas, opt: GearOptions, a: string, b: string): void {
        let circum = this.poly.len;
        let r = opt.radius * circum / opt.teeth / (2 * opt.angle);
        let begin = new Vector(0, 0);
        let prevEnd: Vector = null;
        for (let i = 0; i < opt.teeth; ++i) {
            let up = this.tooth(canvas, i * circum / opt.teeth, 1, r, opt.angle, opt.cutout, opt.toothSteps, a);
            let down = this.tooth(canvas, (i + 0.5) * circum / opt.teeth, -1, r, opt.angle, opt.cutout, opt.toothSteps, b);
            canvas.line(up.end, down.start, 1, "pink");
            if (prevEnd != null) {
                canvas.line(prevEnd, up.start, 1, "pink");
            } else {
                begin = up.start;
            }
            prevEnd = down.end;
        }
        canvas.line(begin, prevEnd, 3, "black");
    }
}

function ellipse(small: number, ecc: number, n: number): Polyline {
    let pts = new Array<Vector>(n + 1);
    for (let i = 0; i <= n; ++i) {
        let a = 2 * Math.PI * i / n;
        pts[i] = new Vector(small / 2, 0).mul(1 / (1 - ecc * Math.cos(a))).rotate(a);
    }
    return new Polyline(pts);
}

function gearArcOptions(c: Canvas, s: number, opt: GearOptions): void {
    let small = opt.small;
    let ecc = opt.ecc;
    let large = small / 2 * (1 / (1 - ecc) + 1 / (1 + ecc));
    let focus = 1 / 2 * Math.sqrt(large * large - small * small);

    let e = ellipse(small, ecc, 1000);
    let e1 = e.roll(s).shift(new Vector(-focus - large / 2, 0));
    let g1 = new Gear(e1);
    g1.renderTeethOptions(c, opt, "red", "blue");
    if (opt.showCurve) {
        g1.render(c);
    }

    let e2 = e.rollOpposite(-s).shift(new Vector(-focus + large / 2, 0));
    let g2 = new Gear(e2);
    g2.renderTeethOptions(c, opt, "orange", "green");
    if (opt.showCurve) {
        g2.render(c);
    }
}

function singleGear(c: Canvas, opt: GearOptions): void {
    let small = opt.small;
    let ecc = opt.ecc;
    let large = small / 2 * (1 / (1 - ecc) + 1 / (1 + ecc));
    let focus = 1 / 2 * Math.sqrt(large * large - small * small);
    let e = ellipse(small, ecc, 1000);
    let g = new Gear(e);
    g.renderTeethOptions(c, opt, "red", "blue");

    let hole = ellipse(3.1, 0, 100);
    new Gear(hole).render(c);

    let dxf = new DXF();
    dxf.add(c.dxfModule);
    document.getElementById("canv").appendChild(dxf.downloadLink("gear.dxf"));
}

function gearStepOptions(c: Canvas, s: number, opt: GearOptions): void {
    c.clear();
    gearArcOptions(c, s, opt);
    setTimeout(() => gearStepOptions(c, s + opt.speed, opt));
}

function dense(): GearOptions {
    return new GearOptions(300, 0.5, 1, 30, Math.PI / 6, 2, 0.75, 50, false);
}

function small(): GearOptions {
    return new GearOptions(60, 0.5, 1, 30, Math.PI / 6, 2, 0.75, 20, false);
}

function denseCircular(): GearOptions {
    return new GearOptions(3000, 0.0, 1, 30, Math.PI / 6, 2, 0.75, 50, false);
}

function sparse(): GearOptions {
    return new GearOptions(1000, 0.5, 1, 40, Math.PI / 3, 1, 0.2, 50, false);
}

function gearMain(): void {
    let c = new Canvas();
    //gearArcOptions(c, 0, dense());
    //gearStepOptions(c, 0, denseCircular());
    singleGear(c, small());
}