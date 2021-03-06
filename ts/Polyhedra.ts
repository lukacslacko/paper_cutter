class Polyhedra {
    static paper = Paper.A4();

    static cuboctahedron(radius: number): void {
        let poly = new Polyhedron("Cuboctahedron", this.paper);
        let triangle = [new Point(1,1,0), new Point(1,0,1), new Point(0,1,1)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        let square = [new Point(1,0,1), new Point(0,1,1), 
                      new Point(-1,0,1), new Point(0,-1,1)];
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
    }

    static dodecahedron(radius: number): void {
        let poly = new Polyhedron("Dodecahedron", this.paper);
        let phi = (Math.sqrt(5) - 1) / 2;
        let pentagon = 
            [new Point(1, 1, 1), new Point(phi, 0, 1/phi), new Point(1, -1, 1),
             new Point(1/phi, -phi, 0), new Point(1/phi, phi, 0)];
        poly.addPolygon("pentagon", Polygon.spherical(pentagon, radius), 12);
    }

    static truncatedDodecahedron(radius: number): void {
        let poly = new Polyhedron("Dodecahedron", this.paper);
        let phi = (Math.sqrt(5) - 1) / 2;
        let A = new Point(phi, 0, 1/phi);
        let B = new Point(1, 1, 1);
        let C = new Point(1/phi, phi, 0);
        let D = new Point(1/phi, -phi, 0);
        let E = new Point(1, -1, 1);
        let F = new Point(0, 1/phi, phi);
        function t(X: Point, Y: Point): Point {
            let b = 1 / (1 + Math.cos(Math.PI / 5)) / 2;
            let a = 1 - b;
            return new Point(a * X.x + b * Y.x, a * X.y + b * Y.y, a * X.z + b * Y.z);
        }
        let decagon = 
            [t(A,B), t(B,A), t(B,C), t(C,B), t(C,D), t(D,C),
             t(D,E), t(E,D), t(E,A), t(A,E)];
        poly.addPolygon("decagon", Polygon.spherical(decagon, radius), 12);
        let triangle = [t(B,A), t(B,F), t(B,C)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 20);
    }

    static truncatedCube(radius: number): void {
        let poly = new Polyhedron("Truncated cube", this.paper);
        let a = 1/(1 + Math.sqrt(2));
        let triangle = [new Point(a,1,1), new Point(1,a,1), new Point(1,1,a)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        let octagon = [new Point(1,a,1), new Point(a,1,1), 
                       new Point(-a,1,1), new Point(-1,a,1),
                       new Point(-1,-a,1), new Point(-a,-1,1),
                       new Point(a,-1,1), new Point(1,-a,1)];
        poly.addPolygon("octagon", Polygon.spherical(octagon, radius), 6);
    }

    static rectifiedTruncatedIcosahedron(radius: number): void {
        let poly = new Polyhedron("Rectified truncated icosahedron", this.paper);
        let c0 = (1 + Math.sqrt(5)) / 4;
        let c1 = 3 * (Math.sqrt(5) - 1) / 4;
        let c2 = (2 * Math.sqrt(5) - 1) / 2;
        let c3 = Math.sqrt(5);
        let c4 = (7 + Math.sqrt(5)) / 4;
        let c5 = 3 * (Math.sqrt(5) + 1) / 4;
        let c6 = (9 + Math.sqrt(5)) / 4;
        let v0 = new Point(0, 0, 3);
        let v6 = new Point(c1, 0.5, c6);
        let v8 = new Point(c1, -0.5, c6);
        poly.addPolygon("triangle", Polygon.spherical([v8, v6, v0], radius), 60);
        let v12 = new Point(-c1, -0.5, c6);
        let v32 = new Point(c1, -1.5, c5);
        let v36 = new Point(-c1, -1.5, c5);
        let v80 = new Point(0, -2, c3);
        poly.addPolygon("hexagon", Polygon.spherical([v80, v32, v8, v0, v12, v36], radius), 20);
        let v54 = new Point(c2, c0, c4);
        let v56 = new Point(c2, -c0, c4);
        let v82 = new Point(c3, 0, 2);
        poly.addPolygon("pentagon", Polygon.spherical([v82, v54, v6, v8, v56], radius), 12);
    }

    static rectifiedSnubCube(radius: number): void {
        let poly = new Polyhedron("Rectified snub cube", this.paper);
        let c0 = 0.2835;
        let c1 = 0.9590;
        let c2 = 1.4804;
        let c3 = 1.7640;
        let c4 = 2.2852;
        let v0 = new Point(c1, -c0, c4);
        let v24 = new Point(c3, 0, c3);
        let v36 = new Point(c2, -c1, c3);
        console.log(v0.length(), v24.length(), v36.length());
        let triangle = [v0, v36, v24];
        let v2 = new Point(-c1, c0, c4);
        let v12 = new Point(c0, c1, c4);
        let v14 = new Point(-c0, -c1, c4);
        let square = [v0, v12, v2, v14];
        let v34 = new Point(0, -c3, c3);
        let v44 = new Point(c1, -c3, c2);
        let pentagon = [v0, v14, v34, v44, v36];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 32);
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
        poly.addPolygon("pentagon", Polygon.spherical(pentagon, radius), 24);
    }

    static truncatedOctahedronAndDual(radius: number) {
        function p(x: number, y: number, z: number): Point {
            return new Point(x, y, z);
        }
        let poly = new Polyhedron("Truncated octahedron", this.paper);
        poly.addPolygon("square", Polygon.sphericalWithCenter(p(0,4,0), [
            p(1,4,1), p(-1,4,1), p(-1,4,-1), p(1,4,-1)
        ], radius), 6);
        poly.addPolygon("triangle", Polygon.sphericalWithCenter(p(0,4,2), [
            p(1,4,1), p(-1,4,1), p(0,3,3)
        ], radius), 24);
        poly.addPolygon("hexagon", Polygon.sphericalWithCenter(p(4,4,4), [
            p(3,3,0), p(1,4,1), p(0,3,3), p(1,1,4), p(3,0,3), p(4,1,1)
        ], radius), 8);
    }

    static truncatedIcosahedron(radius: number): void {
        let phi = (Math.sqrt(5) + 1) / 2;
        let A = new Point(phi, 0, 1);
        let B = new Point(phi, 0, -1);
        let C = new Point(1, phi, 0);
        let D = new Point(1, -phi, 0);
        let P = Point.avg([A, B, A]);
        let X = Point.avg([A, B, C]);
        let Y = Point.avg([A, B, D]);
        let poly = new Polyhedron("Truncated icosahedron", this.paper);
        poly.addPolygon("triangle", Polygon.sphericalWithCenter(P, [Y, X, A], radius), 60);
    }

    static jaaC(radius: number): void {
        let poly = new Polyhedron("jaaC", this.paper);
        function p(x: number, y: number, z: number): Point {
            return new Point(x, y, z);
        }
        poly.addPolygon("edge", Polygon.sphericalWithCenter(p(1,2,2),
            [p(2,2,2), p(1,2,1), p(0,2,2), p(1,1,2)], radius), 24);
        poly.addPolygon("face", Polygon.sphericalWithCenter(p(0,2,1),
            [p(0,2,2), p(1,2,1), p(0,2,0), p(-1,2,1)], radius), 24);
    }

    static rotateSin(r1: number, r2: number, wavelength: number, nlat: number, nlng: number, num: number): void {
        function p(lat: number, lng: number): Point {
            let r = r2 + (r1 - r2) * (1 + Math.cos(lat)) / 2;
            return new Point(r * Math.cos(lng), r * Math.sin(lng), wavelength * lat / Math.PI);
        }
        let poly = new Polyhedron(`wave ${nlat} ${nlng}`, this.paper);
        for (let i = 0; i < nlat; ++i) {
            let dlat = Math.PI / nlat;
            let lat = Math.PI / nlat * i + 0.0001;
            let dlng = 2 * Math.PI / nlng;
            poly.addPolygon(
                `poly${i}`,
                 new Polygon(p(lat, 0), new Point(1, 0, 0), [
                     p(lat-dlat, 0), p(lat, dlng/2), p(lat + dlat, 0),
                     p(lat, -dlng/2)
                 ]),
                 nlng * num);
        }
    }

    static conicalCube(r: number): void {
        let poly = new Polyhedron("Conical cube", this.paper);
        let face = SphericalCircle.regularPolygon(r, Math.sqrt(2/3)*r, 4);
        poly.addDxf("square", face, 6)
    }

    public static render(): void {
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
    }
}

console.log("Hello world!");
