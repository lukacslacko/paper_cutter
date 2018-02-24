class DXF {
    lines: Array<string>;
    dxfLines: Array<DXFLine>;
    constructor() {
        this.lines = new Array<string>();
        this.dxfLines = new Array<DXFLine>();
        this.lines.push("0", "SECTION", "2", "ENTITIES");
    }

    add(piece: DXFModule): void {
        for (let line of piece.lines) {
            this.dxfLines.push(line);
            this.line(line.x1, line.y1, line.x2, line.y2);
        }
    }

    private line(x1: number, y1: number, x2: number, y2: number): void {
        this.lines.push(
            "0", "LINE", "8", "Polygon", 
            "10", "" + x1, "20", "" + (-y1), 
            "11", "" + x2, "21", "" + (-y2));
    }

    private content(): string {
        this.lines.push("0", "ENDSEC", "0", "EOF");
        return this.lines.join("\r\n");
    }

    downloadLink(filename: string): HTMLAnchorElement {
        let result = document.createElement("a");
        result.innerHTML = filename;
        result.setAttribute("download", filename);
        result.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(this.content()));
        return result;
    }

    previewCanvas(width: number, height: number): HTMLCanvasElement {
        let result = document.createElement("canvas");
        result.setAttribute("width", "" + width);
        result.setAttribute("height", "" + height);
        let ctx = result.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height - 1);
        ctx.lineTo(width - 1, height - 1);
        ctx.lineTo(width - 1, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();
        for (let line of this.dxfLines) {
            ctx.beginPath();
            ctx.moveTo(line.x1, line.y1);
            ctx.lineTo(line.x2, line.y2);
            ctx.stroke();
        } 
        return result;
    }
}

class DXFLine {
    constructor(public x1: number, public y1: number, public x2: number, public y2: number) {}
}

class DXFModule {
    public lines: Array<DXFLine>;
    public minX: number;
    public minY: number;
    public maxX: number;
    public maxY: number;

    constructor() {
        this.lines = new Array<DXFLine>();
        this.minX = 0;
        this.minY = 0;
        this.maxX = 0;
        this.maxY = 0;
    }

    line(x1: number, y1: number, x2: number, y2: number) {
        this.lines.push(new DXFLine(x1, y1, x2, y2));
        this.minX = Math.min(this.minX, x1, x2);
        this.maxX = Math.max(this.maxX, x1, x2);
        this.minY = Math.min(this.minY, y1, y2);
        this.maxY = Math.max(this.maxY, y1, y2);
    }

    shift(x: number, y: number): DXFModule {
        let result = new DXFModule();
        for (let line of this.lines) {
            result.line(x + line.x1, y + line.y1, x + line.x2, y + line.y2);
        }
        return result;
    }
}
