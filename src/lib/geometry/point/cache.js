
export class PointMapLRUCache {
    #pointMap
    #countMap

    constructor(rect, limit) {
        this.#pointMap = new Map()
        this.#countMap = new Map()
        this.rect = rect
        this.limit = limit
    }

    get size() {
        return this.#pointMap.size
    }

    get(point, value) {
        const index = this.rect.pointToIndex(point)
        const count = this.#countMap.get(index) ?? this.limit
        this.#pointMap.set(index, value)
        this.#countMap.set(index, count - 1)
    }

    set(point, value) {
        const index = this.rect.pointToIndex(point)
        this.#pointMap.set(index, value)
        this.#countMap.set(index, this.limit)
    }

    delete(point) {
        const index = this.rect.pointToIndex(point)
        this.#pointMap.delete(index)
    }

    has(point) {
        const index = this.rect.pointToIndex(point)
        return this.#pointMap.has(index)
    }
}
