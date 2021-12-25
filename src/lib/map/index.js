import { Random } from "/lib/random"


export class IndexMap {
    #items = []
    #indexMap = new Map()

    constructor(items=[]) {
        items.forEach((item, index) => {
            this.#items.push(item)
            this.#indexMap.set(item, index)
        })
    }

    get size() {
        return this.#items.length
    }

    has(item) {
        return this.#indexMap.has(item)
    }

    getIndex(item) {
        return this.#indexMap.get(item)
    }

    delete(item) {
        if (! this.#indexMap.has(item)) return
        const index = this.getIndex(item)
        const lastItem = this.#items[this.size - 1]
        this.#indexMap.set(lastItem, index)
        this.#items[index] = lastItem
        this.#indexMap.delete(item)
        return this.#items.pop()
    }

    getRandom() {
        const index = Random.int(0, this.size - 1)
        return this.#items[index]
    }
}


export class PairMap {
    constructor() {
        this._sources = new Map()
    }

    set(source, target, value) {
        if (! this._sources.has(source)) {
            this._sources.set(source, new Map())
        }
        const targets = this._sources.get(source)
        if (! targets.has(target)) {
            targets.set(target, value)
        }
    }

    has(source, target) {
        if (! this._sources.has(source)) return false
        return this._sources.get(source).has(target)
    }

    get(source, target) {
        return this._sources.get(source).get(target)
    }
}