class Polyhedra {
    static cuboctahedron(radius: number): void {
        let poly = new Polyhedron("Cuboctahedron", Paper.A4());
        let triangle = [new Point(1,1,0), new Point(1,0,1), new Point(0,1,1)];
        poly.addPolygon("triangle", Polygon.spherical(triangle, radius), 8);
        let square = [new Point(1,0,1), new Point(0,1,1), 
                      new Point(-1,0,1), new Point(0,-1,1)];
        poly.addPolygon("square", Polygon.spherical(square, radius), 6);
    }

    public static render(): void {
        this.cuboctahedron(50);
    }
}

console.log("Hello world!");
