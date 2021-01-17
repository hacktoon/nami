import { PointSet } from '/lib/point/set'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.pointSet = new PointSet([origin])
        this.borders = []
    }

    has(point) {
        return this.pointSet.has(point)
    }

    grow(points) {
        this.pointSet.add(...points)
    }
}
