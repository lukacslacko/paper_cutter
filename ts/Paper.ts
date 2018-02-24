class Paper {
    private dxf: DXF = new DXF();
    private num: number = 0;

    constructor(public width: number, public height: number, 
                public margin: number, public gap: number) {}

    public copy(): Paper {
        return new Paper(this.width, this.height, this.margin, this.gap);
    }
    
    public static A4(): Paper {
        return new Paper(210, 297, 10, 5);
    }

    public fill(piece: DXFModule, num: number): void {
        this.num = num;
        let w = piece.maxX - piece.minX;
        let h = piece.maxY - piece.minY;
        piece = piece.shift(-piece.minX, -piece.minY);
        let x = this.margin;
        let y = this.margin;
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
    }

    public addToDiv(polyhedronName: string, name: string,
                    div: HTMLDivElement): void {
        let description = document.createElement("div");
        description.innerHTML = `${name} ${this.num}`
        div.appendChild(description);
        div.appendChild(
            this.dxf.downloadLink(`${polyhedronName}_${name}_${this.num}.dxf`));
        div.appendChild(this.dxf.previewCanvas(this.width, this.height));
    }
}
