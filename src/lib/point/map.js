import { PairMap } from '/src/lib/map'


/*
 * Maps a point to any value
 */
export class PointMap {
    #map = new PairMap()

    get size() {
        return this.#map.size
    }

    get(point) {
        return this.#map.get(...point)
    }

    set(point, value) {
        this.#map.set(...point, value)
    }

    has(point) {
        return this.#map.has(...point)
    }

    delete(point) {
        return this.#map.delete(...point)
    }

    forEach(callback) {
        this.#map.forEach(callback)
    }
}
