class Paper {
    private dxf: DXF = new DXF();

    constructor(public width: number, public height: number, 
                public margin: number, public gap: number) {}

    public copy(): Paper {
        return new Paper(this.width, this.height, this.margin, this.gap);
    }
    
    public static A4(): Paper {
        return new Paper(210, 297, 10, 5);
    }

    public fill(piece: DXFModule): void {
        let w = piece.maxX - piece.minX;
        let h = piece.maxY - piece.minY;
        piece.shift(-piece.minX, -piece.minY);
        let x = this.margin;
        let y = this.margin;
        while (true) {
            piece.shift(x, y);
            this.dxf.add(piece);
            piece.shift(-x, -y);
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

    public addToDiv(filename: string, div: HTMLDivElement): void {
        div.appendChild(this.dxf.downloadLink(filename));
        div.appendChild(this.dxf.previewCanvas(this.width, this.height));
    }
}
