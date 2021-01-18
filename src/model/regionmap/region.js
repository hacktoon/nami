import { PointSet } from '/lib/point/set'


export class Region {
    constructor(id, origin) {
        this.id = id
        this.origin = origin
        this.points = new PointSet([origin])
        this.borders = new PointSet([])
    }

    has(point) {
        return this.points.has(point)
    }

    setBorder(point, neighbor) {
        this.borders.add(point)
    }

    grow(points) {
        this.points.add(...points)
    }
}


export class RegionSet {

}