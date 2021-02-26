
export class Graph {
    constructor() {
        this.table = {}
    }

    nodes() {
        return Object.keys(this.table).map(Number)
    }

    edges(source) {
        if (this.hasNode(source)) {
            return Array.from(this.table[source].values())
        }
        return []
    }

    addNode(source) {
        if (this.hasNode(source)) {
            return
        }
        this.table[source] = new Set()
    }

    hasNode(source) {
        return Boolean(this.table[source])
    }

    addEdge(source, target) {
        this.addNode(source)
        this.addNode(target)
        this.table[source].add(target)
        this.table[target].add(source)
    }

    hasEdge(source, target) {
        const hasTarget = this.table[source].has(target)
        const hasSource = this.table[target].has(source)
        return hasSource && hasTarget
    }
}