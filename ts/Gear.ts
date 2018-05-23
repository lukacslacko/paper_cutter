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

    angle(): number {
        return Math.atan2(this.y, this.x);
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

    constructor(draw: boolean) {
        this.w = 1000;
        this.h = 1000;
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", "" + this.w);
        this.canvas.setAttribute("height", "" + this.h);
        if (draw) document.getElementById("canv").appendChild(this.canvas);
        this.c = this.canvas.getContext("2d");
        this.dxfModule = new DXFModule();
    }

    line(from: Vector, to: Vector, width: number, color: string): void {
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

    roll(s: number, side: number): [Polyline, Vector] {
        let pt = this.along(s);
        let p = new Array<Vector>(this.pts.length);
        for (let i = 0; i < this.pts.length; ++i) {
            p[i] = this.pts[i].rotate(pt.point.angle() - this.pts[0].angle());
        }
        return [new Polyline(p), new Vector(side * pt.point.length(), 0)];
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

    rollingAngle(rho: number): number {
        let theta = 0;
        let phi = 0;
        for (let i = 0; i < this.pts.length - 1; ++i) {
            let p = this.pts[i];
            let q = this.pts[i + 1];
            let r = (p.length() + q.length()) / 2;
            let dphi = q.angle() - p.angle();
            if (dphi < 0) dphi += 2 * Math.PI;
            if (dphi > Math.PI) dphi = 2 * Math.PI - dphi;
            theta += dphi * r / (rho - r);
            phi += dphi;
        }
        return theta;
    }

    rollingOpposite(targetAngle: number, flip: number): Polyline {
        let maxR = 0;
        for (let p of this.pts) {
            let r = p.length();
            if (r > maxR) maxR = r;
        }
        let rhoSmall = maxR + 0.01;
        let rhoBig = 10 * maxR;
        while (rhoBig > rhoSmall + 0.01) {
            let rho = (rhoSmall + rhoBig) / 2;
            if (this.rollingAngle(rho) > targetAngle) {
                rhoSmall = rho;
            } else {
                rhoBig = rho;
            }
        }
        console.log(maxR, rhoSmall, this.rollingAngle(rhoSmall));
        let newPts = new Array<Vector>();
        let theta = 0;
        for (let i = 0; ; ++i) {
            let p = this.pts[i % this.pts.length];
            let q = this.pts[(i + 1) % this.pts.length];
            if (theta >= 2 * Math.PI) break;
            let r = rhoSmall - p.length();
            newPts.push(new Vector(flip * r * Math.cos(theta), r * Math.sin(theta)));
            let dphi = q.angle() - p.angle();
            if (dphi < 0) dphi += 2 * Math.PI;
            if (dphi > Math.PI) dphi = 2 * Math.PI - dphi;
            theta += dphi * p.length() / (rhoSmall - p.length());
        }
        return new Polyline(newPts);
    }
}

class GearOptions {
    constructor(
        public teeth: number, public angle: number, public radius: number,
        public top: number, public down: number, public toothSteps: number,
        public showCurve: boolean, public name: string) { }
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

    tooth(canvas: Canvas, offset: number, side: number, r: number, size: number, top: number, down: number,
        steps: number, color: string): VectorPair {
        let s = offset;
        let begin = side == -1 ? -top * steps : -down * steps;
        let beginVec = new Vector(0, 0);
        let endVec = new Vector(0, 0);
        for (let i = begin; i < begin + (top + down) * steps; ++i) {
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

    renderTeethOptions(canvas: Canvas, opt: GearOptions, colorA: string, colorB: string): void {
        let circum = this.poly.len;
        let r = opt.radius * circum / opt.teeth / (2 * opt.angle);
        let begin = new Vector(0, 0);
        let prevEnd: Vector = null;
        for (let i = 0; i < opt.teeth; ++i) {
            let up = this.tooth(canvas, i * circum / opt.teeth, 1, r, opt.angle, opt.top, opt.down, opt.toothSteps, colorA);
            let down = this.tooth(canvas, (i + 0.5) * circum / opt.teeth, -1, r, opt.angle, opt.top, opt.down, opt.toothSteps, colorB);
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

function gearLink(p: Polyline, opt: GearOptions): HTMLAnchorElement {
    let c = new Canvas(false);
    let g = new Gear(p);
    g.renderTeethOptions(c, opt, "black", "black");
    new Gear(ellipse(1.5, 0, 100)).render(c);
    let dxf = new DXF();
    dxf.add(c.dxfModule);
    return dxf.downloadLink(opt.name);
}

function animate(c: Canvas, e: Polyline, f: Polyline, s: number, eOpt: GearOptions, fOpt: GearOptions): void {
    c.clear();
    let ep = e.roll(s, -1);
    let eg = new Gear(ep[0].shift(ep[1]));
    new Gear(ellipse(1.5, 0, 100).shift(ep[1])).render(c);
    eg.renderTeethOptions(c, eOpt, "red", "blue");
    let fp = f.roll(s, 1);
    let fg = new Gear(fp[0].shift(fp[1]));
    new Gear(ellipse(1.5, 0, 100).shift(fp[1])).render(c);
    fg.renderTeethOptions(c, fOpt, "orange", "green");
    console.log(ep[1], fp[1]);
    //setTimeout(() => animate(c, e, f, s + 5, eOpt, fOpt), 20);
}

function gearMain(): void {
    let c = new Canvas(true);
    //gearArcOptions(c, 0, dense());
    //gearStepOptions(c, 0, denseCircular());
    //singleGear(c, small());
    let e = ellipse(20, 0.2, 10000);
    let ratF = 4;
    let ratG = 5 / 4;
    const f = e.rollingOpposite(2 / ratF * Math.PI, 1);
    const g = f.rollingOpposite(2 / ratG * Math.PI, -1);
    let div = 8;
    let angle = Math.PI / 3;
    let extraDepth = 0.15;
    let rollingCircleRadius = 1;
    const fOpt = new GearOptions(div * ratF, angle, rollingCircleRadius, 1, 1 + extraDepth, 40, true, "negy");
    const gOpt = new GearOptions(div * ratF * ratG, angle, rollingCircleRadius, 1 + extraDepth, 1, 40, true, "ot");
    animate(c, f, g, 0, fOpt, gOpt);
    document.body.appendChild(gearLink(f, fOpt));
    document.body.appendChild(gearLink(g, gOpt));
}
