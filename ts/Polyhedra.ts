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

    public static render(): void {
        this.cuboctahedron(30);
        this.dodecahedron(50);
        this.truncatedCube(50);
    }
}

console.log("Hello world!");
