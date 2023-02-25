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
    #sources
    #size

    constructor() {
        this.#size = 0
        this.#sources = new Map()
    }

    get size() {
        return this.#size
    }

    get(source, target) {
        if (! this.#sources.has(source)) return
        return this.#sources.get(source).get(target)
    }

    set(source, target, value) {
        if (! this.#sources.has(source)) {
            this.#sources.set(source, new Map())
        }
        const targets = this.#sources.get(source)
        if (! targets.has(target)) this.#size++
        targets.set(target, value)
    }

    has(source, target) {
        if (! this.#sources.has(source)) return false
        return this.#sources.get(source).has(target)
    }

    delete(source, target) {
        if (! this.has(source, target)) return false
        const targetMap = this.#sources.get(source)
        targetMap.delete(target)
        // delete internal Map if there's no source
        if (targetMap.size === 0) {
            this.#sources.delete(source)
        }
        this.#size--
        return true
    }

    forEach(callback) {
        this.#sources.forEach((yMap, x) => {
            yMap.forEach((value, y) => {
                callback([x, y], value)
            })
        })
    }
}
