import { PointSet } from '/lib/point/set'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.pointHash = new PointSet([origin])
    }

    has(point) {
        return this.pointHash.has(point)
    }

    grow(points) {
        this.pointHash.add(...points)
    }
}
