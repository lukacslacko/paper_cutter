class SphericalCircle {
    private static drawHole(dxf: DXFModule, radius: number, angle: number): void {
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);
        for (let i = 0; i < 2 * Polygon.circle; ++i) {
            let a = i * Math.PI / Polygon.circle;
            let b = a + Math.PI / Polygon.circle;
            dxf.line(
                x + Polygon.hole/2 * Math.cos(a),
                y + Polygon.hole/2 * Math.sin(a),
                x + Polygon.hole/2 * Math.cos(b),
                y + Polygon.hole/2 * Math.sin(b));
        }
    }

    private static drawCap(dxf: DXFModule, radius: number, angle: number, offset: number): void {
        let x = radius * Math.cos(angle);
        let y = radius * Math.sin(angle);
        for (let i = 0; i < Polygon.circle; ++i) {
            let a = i * Math.PI / Polygon.circle + offset;
            let b = a + Math.PI / Polygon.circle;
            dxf.line(
                x + Polygon.width/2 * Math.cos(a),
                y + Polygon.width/2 * Math.sin(a),
                x + Polygon.width/2 * Math.cos(b),
                y + Polygon.width/2 * Math.sin(b));
        }
    }
    
    private static drawArc(dxf: DXFModule, radius: number, angle: number): void {
        let da = angle / Math.ceil(radius);
        for (let a = 0; a < angle; a += da) {
            let b = a + da;
            dxf.line(
                radius * Math.cos(a),
                radius * Math.sin(a),
                radius * Math.cos(b),
                radius * Math.sin(b));
        }
    }

    public static regularPolygon(sphere_radius: number, polygon_radius: number, 
                                 num_sides: number): DXFModule {
        let factor = polygon_radius / sphere_radius;
        factor = Math.sqrt(1 - factor * factor);
        let alpha = 2 * Math.PI * factor;
        let cone_radius = polygon_radius / factor;
        let dxf = new DXFModule();
        for (let i = 0; i <= num_sides; ++i) {
            this.drawHole(dxf, cone_radius, i * alpha / num_sides);
        }
        this.drawArc(dxf, cone_radius - Polygon.width/2, alpha);
        this.drawArc(dxf, cone_radius + Polygon.width/2, alpha);
        this.drawCap(dxf, cone_radius, 0, Math.PI);
        this.drawCap(dxf, cone_radius, alpha, alpha);
        return dxf;
    }
}
