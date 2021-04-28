
export class Graph {
    constructor() {
        this.table = new Map()
    }

    forEachNode(callback) {
        return this.table.forEach((_, source) => callback(source))
    }

    getEdges(source) {
        const edgeSet = this.table.get(source)
        if (this.hasNode(source)) {
            return Array.from(edgeSet.values())
        }
        return []
    }

    addNode(source) {
        if (this.hasNode(source)) return
        this.table.set(source, new Set())
    }

    hasNode(source) {
        return this.table.has(source)
    }

    setEdge(source, target) {
        this.addNode(source)
        this.addNode(target)
        this.table.get(source).add(target)
        this.table.get(target).add(source)
    }

    hasEdge(source, target) {
        const hasTarget = this.table.get(source).has(target)
        const hasSource = this.table.get(target).has(source)
        return hasSource && hasTarget
    }
}