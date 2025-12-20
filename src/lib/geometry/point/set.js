import { IndexMap } from '/src/lib/map'

/**
 * This class represents zero ou many points [x, y] in a grid space.
 */
export class PointArraySet {
    #rect
    #size = 0
    #xIndexMap = new IndexMap()
    #xValueMap = new Map()

    constructor(rect) {
        this.#rect = rect
        for(let x = 0; x < rect.width; x++) {
            for(let y = 0; y < rect.height; y++) {
                this.add([x, y])
            }
        }
    }

    get size() {
        return this.#size
    }

    add([x, y]) {
        if (! this.#xValueMap.has(x)) {
            // register the x coord.
            this.#xIndexMap.add(x)
            // add the IndexMap for the y's in this x coord.
            this.#xValueMap.set(x, new IndexMap())
        }
        const yIndexMap = this.#xValueMap.get(x)
        if (! yIndexMap.has(y)) {
            yIndexMap.add(y)
            this.#size++
        }
    }

    has([x, y]) {
        if (! this.#xValueMap.has(x)) return false
        return this.#xValueMap.get(x).has(y)
    }

    delete([x, y]) {
        if (! this.#xValueMap.has(x)) return false
        const yIndexMap = this.#xValueMap.get(x)
        if (! yIndexMap.has(y)) return false
        yIndexMap.delete(y)
        if (yIndexMap.size === 0) {
            this.#xIndexMap.delete(x)
            this.#xValueMap.delete(x)
        }
        this.#size--
        return true
    }

    random() {
        const x = this.#xIndexMap.random()
        // get yIndexMap in x axis
        const y = this.#xValueMap.get(x).random()
        return [x, y]
    }

    forEach(callback) {
        this.#xValueMap.forEach((yIndexMap, x) => {
            yIndexMap.forEach(y => {
                callback([x, y])
            })
        })
    }
}


export class PointSet {
    #indexSet = new Set()

    constructor(rect, points=[]) {
        this.rect = rect
        for(let point of points) {
            this.add(point)
        }
    }

    get size() {
        return this.#indexSet.size
    }

    get points() {
        const indexes = Array.from(this.#indexSet)
        return indexes.map(index => this.rect.indexToPoint(index))
    }

    add(point) {
        const index = this.rect.pointToIndex(point)
        this.#indexSet.add(index)
    }

    delete(point) {
        const index = this.rect.pointToIndex(point)
        this.#indexSet.delete(index)
    }

    has(point) {
        const index = this.rect.pointToIndex(point)
        return this.#indexSet.has(index)
    }

    forEach(callback) {
        this.#indexSet.forEach(index => {
            const point = this.rect.indexToPoint(index)
            callback(point, index)
        })
    }
}
