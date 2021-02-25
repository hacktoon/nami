
export class Graph {
    constructor() {
        this.table = {};
    }

    hasVertex(vertex) {
        return Boolean(this.table[vertex])
    }

    addVertex(vertex) {
        if (! this.table[vertex]) {
            this.table[vertex] = new Set();
        }
    }

    addEdge(source, target) {
        if (! this.table[source]) {
            this.addVertex(source);
        }
        if (! this.table[target]) {
            this.addVertex(target);
        }
        this.table[source].add(target);
        this.table[target].add(source);
    }
}