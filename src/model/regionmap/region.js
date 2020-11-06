import { PointHash } from '/lib/point/hash'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.pointHash = new PointHash([origin])
    }

    get size() {
        return this.pointHash.size
    }

    get points() {
        return this.pointHash.points
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow(points) {
        this.pointHash.add(points)
    }
}
