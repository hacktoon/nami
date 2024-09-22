
export class LRUPointMapCache {
    #indexMap = new Map()
    #countMap = new Map()

    constructor(rect, limit) {
        this.rect = rect
        this.limit = limit
    }

    get size() {
        return this.#indexMap.size
    }

    get(point, value) {
        const index = this.rect.pointToIndex(point)
        this.#indexMap.set(index, value)
        const count = this.#countMap.get(index) ?? this.limit
        this.#countMap.set(index, count - 1)
    }

    set(point, value) {
        const index = this.rect.pointToIndex(point)
        this.#indexMap.set(index, value)
        this.#countMap.set(index, this.limit)
    }

    delete(point) {
        const index = this.rect.pointToIndex(point)
        this.#indexMap.delete(index)
    }

    has(point) {
        const index = this.rect.pointToIndex(point)
        return this.#indexMap.has(index)
    }
}
