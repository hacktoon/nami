import { IndexMap } from '/src/lib/map'

/**
 * This class represents zero ou many points [x, y] in an infinite space.
 */
export class IndexedPointSet {
    #size = 0
    #xIndexMap = new IndexMap()
    #xValueMap = new Map()

    constructor(points=[]) {
        for(let point of points) {
            this.add(point)
        }
    }

    static fromRect(rect) {
        const pointSet = new IndexedPointSet()
        for(let x = 0; x < rect.width; x++) {
            for(let y = 0; y < rect.height; y++) {
                pointSet.add([x, y])
            }
        }
        return pointSet
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
        return [Number(x), Number(y)]
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
    #size = 0
    #xMap = new Map()

    constructor(points=[]) {
        for(let point of points) {
            this.add(point)
        }
    }

    get size() {
        return this.#size
    }

    add([x, y]) {
        if (! this.#xMap.has(x)) {
            this.#xMap.set(x, new Set())
        }
        const yMap = this.#xMap.get(x)
        if (! yMap.has(y)) {
            yMap.add(y)
            this.#size++
        }
    }

    has([x, y]) {
        if (! this.#xMap.has(x)) return false
        return this.#xMap.get(x).has(y)
    }

    forEach(callback) {
        this.#xMap.forEach((yMap, x) => {
            yMap.forEach(y => {
                callback([x, y])
            })
        })
    }
}