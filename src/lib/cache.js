
export class FIFOCache {
    #map
    #queue
    #maxSize

    constructor(maxSize) {
        this.#maxSize = maxSize
        this.#map = new Map()
        this.#queue = []
    }

    set(key, value) {
        if (! this.#map.has(key) && this.#queue.length >= this.#maxSize) {
            const oldestKey = this.#queue.shift()
            this.#map.delete(oldestKey)
        }
        this.#queue.push(key)
        this.#map.set(key, value)
    }

    get(key) {
        return this.#map.get(key)
    }

    has(key) {
        return this.#map.has(key)
    }

    delete(key) {
        if (this.#map.has(key)) {
            this.#map.delete(key)
            this.#queue = this.#queue.filter(k => k !== key)
            return true
        }
        return false
    }

    clear() {
        this.#map.clear()
        this.#queue = []
    }

    keys() {
        return this.#queue
    }

    values() {
        return this.#queue.map(k => this.#map.get(k))
    }

    entries() {
        return this.#queue.map(k => [k, this.#map.get(k)])
    }

    size() {
        return this.#map.size
    }
}
