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

    add(item) {
        this.#items.push(item)
        return this.#indexMap.set(item, this.size - 1)
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

    random() {
        const index = Random.int(0, this.size - 1)
        return this.#items[index]
    }

    forEach(callback) {
        this.#items.forEach(value => {
            callback(value)
        })
    }
}

/*
 * Maps a pair of values to any value
 */
export class PairMap {
    constructor() {
        this.size = 0
        this._sources = new Map()
    }

    get(source, target) {
        return this._sources.get(source).get(target)
    }

    set(source, target, value) {
        if (! this._sources.has(source)) {
            this._sources.set(source, new Map())
        }
        const targets = this._sources.get(source)
        if (! targets.has(target)) {
            targets.set(target, value)
            this.size++
        }
    }

    has(source, target) {
        if (! this._sources.has(source)) return false
        return this._sources.get(source).has(target)
    }

    delete([x, y]) {
        if (! this.has()) return false
        const yMap = this.map.get(x)
        yMap.delete(y)
        if (yMap.size === 0) {
            this.map.delete(x)
        }
        this.size--
        return true
    }
}