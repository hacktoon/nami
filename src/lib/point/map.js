import { IndexMap } from '/lib/map'

/**
 * This class represents zero ou many points [x, y] in an infinite space.
 *
 *
 */
export class PointIndexMap {
    #size = 0
    #xIndexMap = new IndexMap()
    #xValueMap = new Map()

    constructor(points=[]) {
        for(let point of points) {
            this.add(point)
        }
    }

    static fromRect(rect) {
        const map = new PointIndexMap()
        for(let x = 0; x < rect.width; x++) {
            for(let y = 0; y < rect.height; y++) {
                this.add([x, y])
            }
        }
        return map
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
}
