class Polyhedra {
    static cuboctahedron(radius: number): void {
        let poly = new Polyhedron("Cuboctahedron", Paper.A4());
        let triangle = [new Point(1,1,0), new Point(1,0,1), new Point(0,1,1)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        let square = [new Point(1,0,1), new Point(0,1,1), 
                      new Point(-1,0,1), new Point(0,-1,1)];
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
    }

    static dodecahedron(radius: number): void {
        let poly = new Polyhedron("Dodecahedron", Paper.A4());
        let phi = (Math.sqrt(5) - 1) / 2;
        let pentagon = 
            [new Point(1, 1, 1), new Point(phi, 0, 1/phi), new Point(1, -1, 1),
             new Point(1/phi, -phi, 0), new Point(1/phi, phi, 0)];
        poly.addPolygon("pentagon", Polygon.spherical(pentagon, radius), 12);
    }

    static truncatedCube(radius: number): void {
        let poly = new Polyhedron("Truncated cube", Paper.A4());
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
        let poly = new Polyhedron("Rectified truncated icosahedron", Paper.A4());
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

    public static render(): void {
        this.cuboctahedron(30);
        this.dodecahedron(50);
        this.truncatedCube(50);
        this.rectifiedTruncatedIcosahedron(110);
    }
}

console.log("Hello world!");
