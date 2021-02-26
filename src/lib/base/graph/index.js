
export class Graph {
    constructor() {
        this.table = {}
    }

    nodes() {
        return Object.keys(this.table).map(k => Number(k))
    }

    nodeSize(value) {
        if (this.hasNode(value)) {
            return this.table[value].size
        }
        return 0
    }

    edges(value) {
        if (this.hasNode(value)) {
            return Array.from(this.table[value].values())
        }
        return []
    }

    addNode(value) {
        if (this.hasNode(value)) {
            return
        }
        this.table[value] = new Set()
    }

    hasNode(value) {
        return Boolean(this.table[value])
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