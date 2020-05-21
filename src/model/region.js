import { PointHash } from '/lib/point'


export class Region {
    constructor(id, origin, points) {
        this.id = id
        this.origin = origin
        this.layers = [new PointHash(points)]
    }

    get size() {
        //return this.layers.size
    }

    get points() {
        //return this.layers.points
    }

    get seeds() {
        const lastIndex = this.layers.length - 1
        return this.layers[lastIndex].points
    }

    has(point) {
        return this.layers.has(point)
    }

    grow(points=[]) {
        this.layers.push(new PointHash(points))
    }
}
