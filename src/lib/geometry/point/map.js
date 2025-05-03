
export class PointMap {
    #indexMap = new Map()

    constructor(rect) {
        this.rect = rect
    }

    get size() {
        return this.#indexMap.size
    }

    get points() {
        const indexes = this.#indexMap.keys()
        return indexes.map(index => this.rect.indexToPoint(index))
    }

    get(point) {
        const [x, y] = this.rect.wrap(point)
        const index = this.rect.pointToIndex([x, y])
        return this.#indexMap.get(index)
    }

    set(point, value) {
        const [x, y] = this.rect.wrap(point)
        const index = this.rect.pointToIndex([x, y])
        this.#indexMap.set(index, value)
    }

    has(point) {
        const [x, y] = this.rect.wrap(point)
        const index = this.rect.pointToIndex([x, y])
        return this.#indexMap.has(index)
    }

    delete(point) {
        const [x, y] = this.rect.wrap(point)
        const index = this.rect.pointToIndex([x, y])
        return this.#indexMap.delete(index)
    }

    forEach(callback) {
        this.#indexMap.forEach((value, index) => {
            const point = this.rect.indexToPoint(index)
            callback(point, value)
        })
    }
}
