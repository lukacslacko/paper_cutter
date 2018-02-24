class Polyhedron {
    private content: HTMLDivElement;

    constructor(private name: string, private paper: Paper) {
        let top = document.createElement("div");
        top.setAttribute("id", "top" + name);
        document.getElementById("polyhedra").appendChild(top);
        let heading = document.createElement("div");
        top.appendChild(heading);
        let collapse = document.createElement("div");
        heading.appendChild(collapse);
        collapse.innerHTML = name;
        this.content = document.createElement("div");
        this.content.setAttribute("id", "content" + name);
        top.appendChild(this.content);
    }

    public addPolygon(title: string, polygon: Polygon, num: number) {
        let current = this.paper.copy();
        current.fill(polygon.render(), num);
        let page = document.createElement("div");
        page.setAttribute("id", "polygon" + this.name + title);
        this.content.appendChild(page);
        current.addToDiv(this.name, title, page);
    }
}
