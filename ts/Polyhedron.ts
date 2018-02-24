class Polyhedron {
    private content: HTMLDivElement;

    constructor(private name: string, private paper: Paper) {
        let top = document.createElement("div");
        document.getElementById("polygons").appendChild(top);
        let heading = document.createElement("div");
        let collapse = document.createElement("a");
        heading.appendChild(collapse);
        collapse.innerHTML = name;
        collapse.setAttribute("data-toggle", "collapse");
        collapse.setAttribute("href", "#content" + name);
        this.content = document.createElement("div");
        this.content.setAttribute("id", "content" + name);
        heading.appendChild(this.content);
    }

    public addPolygon(title: string, polygon: Polygon) {
        let current = this.paper.copy();
        current.fill(polygon.render());
        let page = document.createElement("div");
        this.content.appendChild(page);
        current.addToDiv(title, page);
    }
}
