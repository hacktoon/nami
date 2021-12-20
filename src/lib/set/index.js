import { Random } from "/lib/random"


export class IndexSet {
    constructor(items) {
        this.indexMap = new Map(items.map((item, idx) => [item, idx]))
        this.items = Array.from(items)
    }

    get size() {
        return this.items.length
    }

    has(item) {
        return this.indexMap.has(item)
    }

    getIndex(item) {
        return this.indexMap.get(item)
    }

    delete(item) {
        if (! this.indexMap.has(item)) return
        const index = this.getIndex(item)
        const lastItem = this.items[this.size - 1]
        this.indexMap.set(lastItem, index)
        this.items[index] = lastItem
        this.indexMap.delete(item)
        return this.items.pop()
    }

    getRandom() {
        const index = Random.int(0, this.size - 1)
        return this.items[index]
    }
}
