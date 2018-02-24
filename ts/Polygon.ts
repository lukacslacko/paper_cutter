class Polygon {
    private circle = 12;
    private hole = 3;
    private width = 10;

    constructor(private center: Point, private normal: Point, 
                private points: Point[]) {
        normal.normalize(1);
    }

    public static spherical(points: Point[], radius: number): Polygon {
        let center = new Point(0, 0, 0);
        for (let p of points) {
            center.x += p.x / points.length;
            center.y += p.y / points.length;
            center.z += p.z / points.length;
        }
        let poly = new Polygon(center, center, points);
        poly.projectToSphere(radius);
        return poly;
    }

    public projectToSphere(radius: number): void {
        this.center.normalize(radius);
        for (let p of this.points) {
            p.normalize(radius);
        } 
    }

    private foldPoint(horizontal: Point, p: Point): PlanarPoint {
        let v = this.center.to(p);
        let dist = v.length();
        v.project(this.normal).normalize(dist);
        let y = this.normal.cross(horizontal);
        return new PlanarPoint(v.dot(horizontal), v.dot(y));
    }

    private foldToPlane(): PlanarPoint[] {
        let folded = new Array<PlanarPoint>();
        let horizontal = 
            this.points[0].copy().project(this.normal).normalize(1);
        for (let i = 0; i < this.points.length; ++i) {
            folded.push(this.foldPoint(horizontal, this.points[i]));
        }
        return folded;
    }

    private drawHoles(folded: PlanarPoint[], dxf: DXFModule): void {
        for (let p of folded) {
            for (let i = 0; i < 2 * this.circle; ++i) {
                let a = i * Math.PI / this.circle;
                let b = a + Math.PI / this.circle;
                dxf.line(p.x + this.hole / 2 * Math.cos(a),
                         p.y + this.hole / 2 * Math.sin(a),
                         p.x + this.hole / 2 * Math.cos(b),
                         p.y + this.hole / 2 * Math.sin(b));
            }
        }
    }

    private connect(p: PlanarPoint, q: PlanarPoint, dxf: DXFModule): void {
        let a = p.copy().normalize(1);
        let b = q.copy().normalize(1);
        let ab = a.dot(b);
        let alpha = this.width / 2 / Math.sqrt(1 - ab*ab);
        let t = new PlanarPoint(alpha * (a.x + b.x), alpha * (a.y + b.y));
        let beta = alpha * (1 + ab);
        let u = new PlanarPoint(t.x - beta * b.x, t.y - beta * b.y);
        let v = new PlanarPoint(t.x - beta * a.x, t.y - beta * a.y);
        dxf.line(t.x, t.y, q.x + u.x, q.y + u.y);
        dxf.line(t.x, t.y, q.x + v.x, q.y + v.y);
        for (let i = 0; i < this.circle; ++i) {
            let x = i * Math.PI / this.circle;
            let y = x + Math.PI / this.circle;
            dxf.line(q.x + this.width / 2 * Math.cos(x),
                     q.y + this.width / 2 * Math.sin(x),
                     q.x + this.width / 2 * Math.cos(y),
                     q.y + this.width / 2 * Math.sin(y));
        }
    }

    private drawEdges(folded: PlanarPoint[], dxf: DXFModule): void {
        for (let i = 1; i < folded.length; ++i) {
            this.connect(folded[i-1], folded[i], dxf);
        }
    }

    public render(): DXFModule {
        let dxf = new DXFModule();
        let folded = this.foldToPlane();
        this.drawHoles(folded, dxf);
        this.drawEdges(folded, dxf);
        return dxf;
    }
}

class Point {
    constructor(public x: number, public y: number, public z: number) {}

    public normalize(radius: number): Point {
        let l = this.length();
        this.x *= radius / l;
        this.y *= radius / l;
        this.z *= radius / l;
        return this;
    }

    public dot(p: Point): number {
        return this.x*p.x + this.y*p.y + this.z*p.z;
    }

    public project(normal: Point) {
        let a = this.dot(normal);
        this.x -= a * normal.x;
        this.y -= a * normal.y;
        this.z -= a * normal.z;
        return this;
    }

    public cross(p: Point): Point {
        return new Point(this.y * p.z - this.z * p.y, 
                         this.z * p.x - this.x * p.z,
                         this.x * p.y - this.y * p.x);
    }

    public copy(): Point {
        return new Point(this.x, this.y, this.z);
    }

    public to(p: Point): Point {
        return new Point(p.x-this.x, p.y-this.y, p.z-this.z);
    }

    public length(): number {
        return Math.sqrt(this.dot(this));
    }
}

class PlanarPoint {
    constructor(public x: number, public y: number) {}


    public copy(): PlanarPoint {
        return new PlanarPoint(this.x, this.y);
    }

    public normalize(radius: number): PlanarPoint {
        let l = this.length();
        this.x *= radius / l;
        this.y *= radius / l;
        return this;
    }

    public dot(p: PlanarPoint): number {
        return this.x*p.x + this.y*p.y;
    }

    public length(): number {
        return Math.sqrt(this.dot(this));
    }
}