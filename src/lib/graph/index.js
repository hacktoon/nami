
export class Graph {
    // this graph is bi-directional

    constructor() {
        this.table = new Map()
    }

    forEach(callback) {
        return this.table.forEach((targets, source) => callback(source, targets))
    }

    getEdges(source) {
        if (! this.table.has(source)) return []
        const edgeSet = this.table.get(source)
        return Array.from(edgeSet.values())
    }

    addNode(source) {
        if (this.table.has(source)) return
        this.table.set(source, new Set())
    }

    deleteNode(source) {
        if (! this.table.has(source)) return
        for(let target of this.table.get(source)) {
            this.table.get(target).delete(source)
        }
        this.table.delete(source)
    }

    hasNode(source) {
        return this.table.has(source)
    }

    setEdge(source, target) {
        if (source === target) return
        this.addNode(source)
        this.addNode(target)
        this.table.get(source).add(target)
        this.table.get(target).add(source)
    }

    hasEdge(source, target) {
        if (! this.table.has(source)) return false
        if (! this.table.has(target)) return false
        const hasTarget = this.table.get(source).has(target)
        const hasSource = this.table.get(target).has(source)
        return hasSource && hasTarget
    }
}