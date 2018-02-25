class Torus {
    constructor(private rho: number, private R: number, 
                private n1: number, private n2: number) {}

    private normal(lat: number): Point {
        return new Point(-Math.cos(lat), 0, Math.sin(lat));
    }

    private point(lat: number, lng: number): Point {
        return new Point((this.R - this.rho * Math.cos(lat)) * Math.cos(lng),
                         (this.R - this.rho * Math.cos(lat)) * Math.sin(lng),
                         this.rho * Math.sin(lat)); 
    }

    public render(paper: Paper): void {
        let poly = new Polyhedron("Torus", paper);
        let dlat = Math.PI / this.n1;
        let dlng = Math.PI / this.n2;
        for (let i = 0; i < this.n1; ++i) {
            let lat = i * dlat + dlat / 2;
            let norm = this.normal(lat);
            let hexa = [this.point(lat + dlat/3, dlng),
                        this.point(lat - dlat/3, dlng),
                        this.point(lat - 2*dlat/3, 0),
                        this.point(lat - dlat/3, -dlng),
                        this.point(lat + dlat/3, -dlng),
                        this.point(lat + 2*dlat/3, 0)];
            let center = this.point(lat, 0);
            poly.addPolygon(`hexa${i}`, new Polygon(center, norm, hexa), this.n2);
        }
    }
}
