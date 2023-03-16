import { PairMap } from '/src/lib/map'


/*
 * Maps a point to any value
 */
export class PointMap {
    #points = new PairMap()

    get size() {
        return this.#points.size
    }

    get points() {
        const arr = []
        this.#points.forEach((point) => {
            arr.push(point)
        })
        return arr
    }

    get(point) {
        return this.#points.get(...point)
    }

    set(point, value) {
        this.#points.set(...point, value)
    }

    has(point) {
        return this.#points.has(...point)
    }

    delete(point) {
        return this.#points.delete(...point)
    }

    forEach(callback) {
        this.#points.forEach(callback)
    }
}
