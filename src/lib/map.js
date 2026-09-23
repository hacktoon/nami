import { Random } from "/src/lib/random"


export class IndexMap {
    // This structure allows searching in a Map
    // allows getting a random item without converting Map to Array
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
    #map = new Map()
    #sizeB

    constructor(sizeB) {
        if (!Number.isInteger(sizeB) || sizeB <= 0) {
            throw new RangeError(`Invalid data offset: ${sizeB}`)
        }
        this.#sizeB = sizeB
    }

    get size() {
        return this.#map.size
    }

    #key(a, b) {
        return a * this.#sizeB + b
    }

    get(a, b) {
        return this.#map.get(this.#key(a, b))
    }

    set(a, b, value) {
        this.#map.set(this.#key(a, b), value)
        return this
    }

    has(a, b) {
        return this.#map.has(this.#key(a, b))
    }

    delete(a, b) {
        return this.#map.delete(this.#key(a, b))
    }

    clear() {
        this.#map.clear()
    }

    forEach(callback) {
        const s = this.#sizeB
        this.#map.forEach((value, key) => {
            callback(value, Math.floor(key / s), key % s)
        })
    }

    *entries() {
        const s = this.#sizeB
        for (const [key, value] of this.#map) {
            yield [Math.floor(key / s), key % s, value]
        }
    }

    [Symbol.iterator]() {
        return this.entries()
    }
}
